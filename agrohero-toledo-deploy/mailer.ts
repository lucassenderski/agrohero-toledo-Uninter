import nodemailer, { Transporter } from 'nodemailer';
import { Order, Producer } from './src/types';

const smtpConfig = () => ({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  user: process.env.SMTP_USER,
  password: process.env.SMTP_PASSWORD,
  from: process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@agrohero.com.br',
  appUrl: process.env.APP_URL || 'https://agrohero-toledo.vercel.app',
});

// Sem SMTP configurado os pedidos continuam funcionando: o envio apenas é ignorado.
export const isMailConfigured = () => {
  const { host, user, password } = smtpConfig();
  return Boolean(host && user && password);
};

let transporter: Transporter | null = null;

const getTransporter = (): Transporter | null => {
  if (!isMailConfigured()) return null;
  if (!transporter) {
    const { host, port, user, password } = smtpConfig();
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass: password },
    });
  }
  return transporter;
};

export const resetMailTransport = () => {
  transporter = null;
};

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const PAYMENT_LABELS: Record<Order['paymentMethod'], string> = {
  pix: 'PIX na retirada',
  credit_card: 'Cartão de crédito na retirada',
  debit_card: 'Cartão de débito na retirada',
  cash: 'Dinheiro na retirada',
};

const escapeHtml = (value: unknown) =>
  String(value ?? '').replace(/[&<>"']/g, (char) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] as string,
  );

const itemsTable = (order: Order) =>
  order.items
    .map((item) => {
      const lineTotal = item.product.price * item.quantity;
      return `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e7e5e4;">${escapeHtml(item.product.name)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e7e5e4;text-align:center;">${item.quantity} ${escapeHtml(item.product.unit)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e7e5e4;text-align:right;">${formatCurrency(lineTotal)}</td>
      </tr>`;
    })
    .join('');

const totalsBlock = (order: Order) => `
  <table style="width:100%;border-collapse:collapse;margin-top:8px;">
    <tr>
      <td style="padding:4px 12px;">Subtotal</td>
      <td style="padding:4px 12px;text-align:right;">${formatCurrency(order.totalAmount - order.deliveryFee)}</td>
    </tr>
    <tr>
      <td style="padding:4px 12px;">Taxa de entrega</td>
      <td style="padding:4px 12px;text-align:right;">${order.deliveryFee > 0 ? formatCurrency(order.deliveryFee) : 'Grátis (retirada)'}</td>
    </tr>
    <tr>
      <td style="padding:8px 12px;font-weight:700;border-top:2px solid #d6d3d1;">Total a pagar no local</td>
      <td style="padding:8px 12px;text-align:right;font-weight:700;border-top:2px solid #d6d3d1;">${formatCurrency(order.totalAmount)}</td>
    </tr>
  </table>`;

const orderHtml = (order: Order) => `
  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <thead>
      <tr style="background:#f5f5f4;">
        <th style="padding:8px 12px;text-align:left;">Produto</th>
        <th style="padding:8px 12px;text-align:center;">Quantidade</th>
        <th style="padding:8px 12px;text-align:right;">Valor</th>
      </tr>
    </thead>
    <tbody>${itemsTable(order)}</tbody>
  </table>
  ${totalsBlock(order)}`;

const deliveryBlock = (order: Order) => `
  <p style="margin:4px 0;"><strong>Forma de recebimento:</strong> ${
    order.deliveryMethod === 'pickup' ? 'Retirada no ponto' : 'Entrega a domicílio'
  }</p>
  ${
    order.deliveryMethod === 'pickup'
      ? `<p style="margin:4px 0;"><strong>Ponto de retirada:</strong> ${escapeHtml(order.pickupLocation || '')}</p>`
      : `<p style="margin:4px 0;"><strong>Endereço de entrega:</strong> ${escapeHtml(order.customerAddress)}</p>`
  }
  <p style="margin:4px 0;"><strong>Forma de pagamento:</strong> ${PAYMENT_LABELS[order.paymentMethod]} — pagamento efetuado no local, nada é cobrado online.</p>`;

const layout = (title: string, body: string) => `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#292524;max-width:640px;margin:0 auto;">
    <div style="background:#047857;color:#ffffff;padding:20px 24px;border-radius:12px 12px 0 0;">
      <h1 style="margin:0;font-size:20px;">Agro Hero Toledo</h1>
      <p style="margin:4px 0 0;font-size:14px;opacity:0.9;">${title}</p>
    </div>
    <div style="border:1px solid #e7e5e4;border-top:none;border-radius:0 0 12px 12px;padding:24px;">
      ${body}
    </div>
    <p style="font-size:12px;color:#78716c;margin-top:16px;">
      Agro Hero — alimentos orgânicos da agricultura familiar de Toledo - PR.
      Acompanhe seus pedidos em <a href="${smtpConfig().appUrl}" style="color:#047857;">${smtpConfig().appUrl}</a>.
    </p>
  </div>`;

export function buildCustomerEmail(order: Order) {
  return {
    subject: `Pedido ${order.id} confirmado — Agro Hero Toledo`,
    html: layout('Recebemos seu pedido', `
      <p>Olá, ${escapeHtml(order.customerName)}!</p>
      <p>Seu pedido foi registrado com sucesso. Os produtos serão preparados pelos produtores
      e você paga <strong>no local da retirada ou da entrega</strong>.</p>
      <p style="margin:4px 0;"><strong>Pedido:</strong> ${escapeHtml(order.id)}</p>
      <p style="margin:4px 0;"><strong>Registrado em:</strong> ${escapeHtml(order.createdAt)}</p>
      ${deliveryBlock(order)}
      ${orderHtml(order)}
      <p style="background:#ecfdf5;border-radius:8px;padding:12px;font-size:14px;">
        ${PAYMENT_LABELS[order.paymentMethod]}: finalize sem pagar nada agora e acerte o valor
        de ${formatCurrency(order.totalAmount)} diretamente com o produtor no momento do recebimento.
      </p>
    `),
  };
}

export function buildProducerEmail(order: Order, producer: Producer, producerItems: Order['items']) {
  const producerTotal = producerItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );
  const items = producerItems
    .map(
      (item) => `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e7e5e4;">${escapeHtml(item.product.name)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e7e5e4;text-align:center;">${item.quantity} ${escapeHtml(item.product.unit)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e7e5e4;text-align:right;">${formatCurrency(item.product.price * item.quantity)}</td>
      </tr>`,
    )
    .join('');

  return {
    subject: `Novo pedido ${order.id} para preparar — ${producer.farmName}`,
    html: layout('Você tem um novo pedido para preparar', `
      <p>Olá, ${escapeHtml(producer.name)}!</p>
      <p>Um novo pedido inclui produtos de <strong>${escapeHtml(producer.farmName)}</strong>.
      Separe e prepare os itens abaixo para ${
        order.deliveryMethod === 'pickup' ? 'a retirada' : 'a entrega'
      }.</p>
      <p style="margin:4px 0;"><strong>Pedido:</strong> ${escapeHtml(order.id)}</p>
      <p style="margin:4px 0;"><strong>Cliente:</strong> ${escapeHtml(order.customerName)} — ${escapeHtml(order.customerPhone)}</p>
      ${deliveryBlock(order)}
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <thead>
          <tr style="background:#f5f5f4;">
            <th style="padding:8px 12px;text-align:left;">Produto</th>
            <th style="padding:8px 12px;text-align:center;">Quantidade</th>
            <th style="padding:8px 12px;text-align:right;">Valor</th>
          </tr>
        </thead>
        <tbody>${items}</tbody>
      </table>
      <p style="font-weight:700;text-align:right;">Seu total: ${formatCurrency(producerTotal)}</p>
      <p style="background:#ecfdf5;border-radius:8px;padding:12px;font-size:14px;">
        O pagamento de ${formatCurrency(producerTotal)} é recebido por você no momento do
        recebimento do pedido, em ${PAYMENT_LABELS[order.paymentMethod].toLowerCase()}.
      </p>
    `),
  };
}

export function groupItemsByProducer(
  order: Order,
  resolveProducer: (productId: string) => Producer | null,
): Map<string, { producer: Producer; items: Order['items'] }> {
  const grouped = new Map<string, { producer: Producer; items: Order['items'] }>();
  for (const item of order.items) {
    // O produtor vem do catálogo do servidor: o payload do cliente não define destinatário de e-mail.
    const producer = resolveProducer(item.product.id);
    if (!producer) continue;
    const entry = grouped.get(producer.id) || { producer, items: [] };
    entry.items.push(item);
    grouped.set(producer.id, entry);
  }
  return grouped;
}

export async function sendOrderEmails(
  order: Order,
  resolveProducer: (productId: string) => Producer | null,
): Promise<void> {
  const mailer = getTransporter();
  if (!mailer) return;

  const customerEmail = buildCustomerEmail(order);
  await mailer.sendMail({
    from: smtpConfig().from,
    to: order.customerEmail,
    subject: customerEmail.subject,
    html: customerEmail.html,
  });

  for (const { producer, items } of groupItemsByProducer(order, resolveProducer).values()) {
    if (!producer.email) continue;
    const producerEmail = buildProducerEmail(order, producer, items);
    await mailer.sendMail({
      from: smtpConfig().from,
      to: producer.email,
      subject: producerEmail.subject,
      html: producerEmail.html,
    });
  }
}
