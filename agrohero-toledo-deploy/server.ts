import express, { Request, Response } from 'express';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { changeOrderStatus, initializeDatabase, isDatabaseConfigured, listOrders, listProducts, listRecipes, saveOrder } from './database';
import { authConfigured, requireAuth, requireRole, AuthenticatedRequest } from './auth';
import { createCheckoutPreference, paymentsConfigured } from './payments';

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

app.get('/api/orders', requireAuth, requireRole('farmer', 'admin'), async (_req: AuthenticatedRequest, res: Response, next) => {
  try {
    res.json({ orders: await listOrders() });
  } catch (error) {
    next(error);
  }
});

app.post('/api/orders', requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const order = req.body;
    if (!order || typeof order.id !== 'string' || !Array.isArray(order.items) || order.items.length === 0 ||
        typeof order.totalAmount !== 'number' || order.totalAmount < 0 || order.status !== 'novo') {
      return res.status(400).json({ error: 'Pedido inválido.' });
    }
    res.status(201).json({ order: await saveOrder(order, req.auth?.sub) });
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

app.post('/api/payments/checkout', requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    if (!paymentsConfigured) {
      return res.status(503).json({ error: 'Gateway de pagamento não está configurado.' });
    }
    const items = req.body?.items;
    const payerEmail = typeof req.auth?.email === 'string' ? req.auth.email : undefined;
    if (!Array.isArray(items) || items.length === 0 || !payerEmail) {
      return res.status(400).json({ error: 'Itens e e-mail autenticado são obrigatórios.' });
    }
    const validItems = items.filter((item) =>
      item && typeof item === 'object' &&
      typeof item.product?.id === 'string' &&
      typeof item.product?.name === 'string' &&
      typeof item.product?.price === 'number' && item.product.price >= 0 &&
      Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 100,
    );
    if (validItems.length !== items.length) {
      return res.status(400).json({ error: 'Itens do carrinho inválidos.' });
    }
    res.status(201).json(await createCheckoutPreference(validItems, payerEmail));
  } catch (error) {
    next(error);
  }
});

app.post('/api/payments/webhook', (req: Request, res: Response) => {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const signature = req.header('x-signature');
  const requestId = req.header('x-request-id');
  const dataId = typeof req.body?.data?.id === 'string' ? req.body.data.id : undefined;
  if (!secret || !signature || !requestId || !dataId) {
    return res.status(400).json({ error: 'Assinatura de webhook ausente.' });
  }

  const signatureParts = Object.fromEntries(signature.split(',').map((part) => part.split('=')));
  const timestamp = signatureParts.ts;
  const receivedHash = signatureParts.v1;
  if (!timestamp || !receivedHash || Math.abs(Date.now() - Number(timestamp) * 1000) > 300_000) {
    return res.status(401).json({ error: 'Webhook expirado ou inválido.' });
  }

  const manifest = `id:${dataId};request-id:${requestId};ts:${timestamp};`;
  const expectedHash = createHmac('sha256', secret).update(manifest).digest('hex');
  const expectedBuffer = Buffer.from(expectedHash, 'hex');
  const receivedBuffer = Buffer.from(receivedHash, 'hex');
  if (expectedBuffer.length !== receivedBuffer.length || !timingSafeEqual(expectedBuffer, receivedBuffer)) {
    return res.status(401).json({ error: 'Assinatura de webhook inválida.' });
  }

  return res.sendStatus(202);
});

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
