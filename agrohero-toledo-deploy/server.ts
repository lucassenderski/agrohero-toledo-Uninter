import express, { Request, Response } from 'express';
import { changeOrderStatus, initializeDatabase, isDatabaseConfigured, listOrders, listProducts, listRecipes, saveOrder } from './database';
import { authConfigured, optionalAuth, requireAuth, requireRole, AuthenticatedRequest } from './auth';
import { PICKUP_PAYMENT_POLICY, isPaymentMethod, listPaymentOptions } from './paymentMethods';
import { isMailConfigured, sendOrderEmails } from './mailer';
import { Order } from './src/types';

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = new Set(
  (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
);
const authAttempts = new Map<string, { count: number; resetAt: number }>();

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return origin && allowedOrigins.has(origin) ? res.sendStatus(204) : res.sendStatus(403);
  }
  next();
});

const validateEmail = (email: unknown): email is string =>
  typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;

const isUserRole = (role: unknown): role is 'consumer' | 'farmer' | 'admin' =>
  role === 'consumer' || role === 'farmer' || role === 'admin';

const checkRateLimit = (key: string) => {
  const now = Date.now();
  const current = authAttempts.get(key);
  if (!current || current.resetAt <= now) {
    authAttempts.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (current.count >= 20) return false;
  current.count += 1;
  return true;
};

// Health check endpoint (Render uses this for zero-downtime health checks)
app.get('/api/health', async (_req: Request, res: Response) => {
  let databaseStatus = 'not-configured';
  if (isDatabaseConfigured) {
    try {
      await listProducts();
      databaseStatus = 'ok';
    } catch {
      databaseStatus = 'unavailable';
    }
  }
  res.json({
    status: databaseStatus === 'unavailable' ? 'degraded' : 'ok',
    app: 'Agro Hero API',
    region: 'Toledo - PR',
    version: '1.0.0',
    database: databaseStatus,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/products', async (_req: Request, res: Response, next) => {
  try {
    res.json({ products: await listProducts() });
  } catch (error) {
    next(error);
  }
});

app.get('/api/recipes', async (_req: Request, res: Response, next) => {
  try {
    res.json({ recipes: await listRecipes() });
  } catch (error) {
    next(error);
  }
});

// Métodos aceitos e política de cobrança: todo pagamento ocorre no local da retirada/entrega.
app.get('/api/payment-methods', (_req: Request, res: Response) => {
  res.json({ policy: PICKUP_PAYMENT_POLICY, methods: listPaymentOptions() });
});

app.get('/api/orders', requireAuth, requireRole('farmer', 'admin'), async (_req: AuthenticatedRequest, res: Response, next) => {
  try {
    res.json({ orders: await listOrders() });
  } catch (error) {
    next(error);
  }
});

const isPositiveNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

const isNonEmptyString = (value: unknown, maxLength = 200): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;

function validateOrderPayload(order: unknown) {
  if (!order || typeof order !== 'object') return { error: 'Pedido inválido.' };
  const candidate = order as Record<string, unknown>;

  if (!isNonEmptyString(candidate.id, 120)) return { error: 'Pedido inválido.' };
  if (candidate.status !== 'novo') return { error: 'Pedido inválido.' };
  if (!isPositiveNumber(candidate.totalAmount)) return { error: 'Pedido inválido.' };
  if (candidate.deliveryMethod !== 'delivery' && candidate.deliveryMethod !== 'pickup') {
    return { error: 'Forma de recebimento inválida.' };
  }
  if (!isPaymentMethod(candidate.paymentMethod)) {
    return { error: 'Forma de pagamento inválida.' };
  }
  // O pedido nasce com pagamento pendente: a cobrança acontece no local da retirada/entrega.
  if (candidate.paymentStatus !== 'pending_on_pickup') {
    return { error: 'O pagamento deve ser confirmado no local da retirada.' };
  }
  if (!isNonEmptyString(candidate.customerName, 120) || !isNonEmptyString(candidate.customerPhone, 40)) {
    return { error: 'Dados do cliente são obrigatórios.' };
  }
  if (!validateEmail(candidate.customerEmail)) {
    return { error: 'Informe um e-mail válido para receber a confirmação do pedido.' };
  }
  if (candidate.deliveryMethod === 'pickup' && !isNonEmptyString(candidate.pickupLocation)) {
    return { error: 'Informe o ponto de retirada.' };
  }
  if (candidate.deliveryMethod === 'delivery' && !isNonEmptyString(candidate.customerAddress)) {
    return { error: 'Informe o endereço de entrega.' };
  }
  if (!isPositiveNumber(candidate.deliveryFee)) return { error: 'Taxa de entrega inválida.' };
  if (!Array.isArray(candidate.items) || candidate.items.length === 0) {
    return { error: 'Pedido sem itens.' };
  }

  const itemsAreValid = candidate.items.every((item) => {
    if (!item || typeof item !== 'object') return false;
    const { product, quantity } = item as { product?: Record<string, unknown>; quantity?: unknown };
    return Boolean(
      product &&
      isNonEmptyString(product.id, 120) &&
      isNonEmptyString(product.name, 200) &&
      isPositiveNumber(product.price) &&
      Number.isInteger(quantity) &&
      (quantity as number) > 0 &&
      (quantity as number) <= 100,
    );
  });
  if (!itemsAreValid) return { error: 'Itens do carrinho inválidos.' };

  const expectedTotal = candidate.items.reduce((total, item) => {
    const { product, quantity } = item as { product: { price: number }; quantity: number };
    return total + product.price * quantity;
  }, candidate.deliveryFee as number);
  if (Math.abs(expectedTotal - (candidate.totalAmount as number)) > 0.01) {
    return { error: 'Total do pedido não confere com os itens.' };
  }

  return { order: candidate as unknown as Order };
}

app.post('/api/orders', optionalAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const validation = validateOrderPayload(req.body);
    if ('error' in validation) {
      return res.status(400).json({ error: validation.error });
    }
    const order = await saveOrder(validation.order, req.auth?.sub);

    // O catálogo do servidor é a fonte dos produtores: evita usar e-mail vindo do payload do cliente.
    const catalog = await listProducts();
    const producerByProduct = new Map(catalog.map((product) => [product.id, product.producer]));
    const resolveProducer = (productId: string) => producerByProduct.get(productId) || null;

    // Falha de SMTP não pode desfazer um pedido já registrado.
    let emailNotification: 'sent' | 'disabled' | 'failed' = 'disabled';
    if (isMailConfigured()) {
      try {
        await sendOrderEmails(order, resolveProducer);
        emailNotification = 'sent';
      } catch (error) {
        emailNotification = 'failed';
        console.error('[Agro Hero Backend] Falha ao enviar e-mails do pedido', order.id, error);
      }
    }

    res.status(201).json({
      order,
      payment: PICKUP_PAYMENT_POLICY,
      emailNotification,
    });
  } catch (error) {
    next(error);
  }
});

app.patch('/api/orders/:orderId/status', requireAuth, requireRole('farmer', 'admin'), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const statuses = new Set(['novo', 'colheita', 'em_rota', 'entregue']);
    if (!statuses.has(req.body?.status)) {
      return res.status(400).json({ error: 'Status de pedido inválido.' });
    }
    const order = await changeOrderStatus(req.params.orderId, req.body.status);
    if (!order) return res.status(404).json({ error: 'Pedido não encontrado.' });
    res.json({ order });
  } catch (error) {
    next(error);
  }
});

app.get(
  '/api/producer/access-check',
  requireAuth,
  requireRole('farmer', 'admin'),
  (req: AuthenticatedRequest, res: Response) => {
    res.json({ authorized: true, subject: req.auth?.sub });
  },
);

// API endpoint: Auth/Security verification
app.post('/api/auth/verify', (req: Request, res: Response) => {
  if (!authConfigured) {
    return res.status(503).json({ error: 'Auth0 não está configurado para autenticação de produção.' });
  }
  const { email, role } = req.body;
  const clientKey = req.ip || 'unknown';
  if (!checkRateLimit(clientKey)) {
    return res.status(429).json({ error: 'Muitas tentativas. Tente novamente em instantes.' });
  }
  if (!validateEmail(email) || (role !== undefined && !isUserRole(role))) {
    return res.status(400).json({ error: 'E-mail ou perfil inválido.' });
  }
  res.json({
    authenticated: true,
    user: {
      email,
      role: role || 'consumer',
      verifiedAt: new Date().toISOString(),
      securityProtocol: 'Validação de API em ambiente demonstrativo',
    },
  });
});

// API endpoint: Register User / Farmer with validation
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, role, farmName, district, dapRecord } = req.body;
  const clientKey = req.ip || 'unknown';
  if (!checkRateLimit(clientKey)) {
    return res.status(429).json({ error: 'Muitas tentativas. Tente novamente em instantes.' });
  }

  if (typeof name !== 'string' || name.trim().length < 2 || name.length > 120 || !validateEmail(email)) {
    return res.status(400).json({ error: 'Nome e e-mail válidos são obrigatórios.' });
  }
  if (role !== undefined && !isUserRole(role)) {
    return res.status(400).json({ error: 'Perfil de usuário inválido.' });
  }
  if (role === 'farmer' && (typeof farmName !== 'string' || typeof district !== 'string')) {
    return res.status(400).json({ error: 'Produtor deve informar propriedade e distrito.' });
  }

  res.status(201).json({
    success: true,
    message: role === 'farmer' 
      ? 'Agricultor(a) cadastrado com sucesso. Registro DAP/CAF enviado para validação.'
      : 'Usuário cadastrado com sucesso.',
    user: {
      id: `usr_${Date.now()}`,
      name,
      email,
      role: role || 'consumer',
      farmName: role === 'farmer' ? farmName : undefined,
      district: district || 'Toledo - PR',
      documentStatus: role === 'farmer' && dapRecord ? 'received_for_review' : undefined,
      securityStatus: 'Cadastro validado pela API em ambiente demonstrativo',
      createdAt: new Date().toISOString(),
    },
  });
});

app.use((error: unknown, _req: Request, res: Response, _next: unknown) => {
  if (error instanceof SyntaxError) {
    return res.status(400).json({ error: 'JSON inválido.' });
  }
  return res.status(500).json({ error: 'Erro interno do servidor.' });
});

// Start backend server
if (process.env.NODE_ENV === 'production' || process.env.RUN_SERVER) {
  initializeDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`[Agro Hero Backend] Servidor rodando na porta ${PORT}`);
      });
    })
    .catch((error) => {
      console.error('[Agro Hero Backend] Falha ao inicializar o banco de dados.', error);
      process.exitCode = 1;
    });
}

export default app;
