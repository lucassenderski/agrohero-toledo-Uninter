import { CartItem } from './src/types';

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
const checkoutBaseUrl = process.env.CHECKOUT_BASE_URL;

export const paymentsConfigured = Boolean(accessToken && checkoutBaseUrl);

export async function createCheckoutPreference(items: CartItem[], payerEmail: string) {
  if (!accessToken || !checkoutBaseUrl) {
    throw new Error('Mercado Pago não está configurado.');
  }

  const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': crypto.randomUUID(),
    },
    body: JSON.stringify({
      items: items.map(({ product, quantity }) => ({
        id: product.id,
        title: product.name,
        quantity,
        unit_price: product.price,
        currency_id: 'BRL',
      })),
      payer: { email: payerEmail },
      back_urls: {
        success: `${checkoutBaseUrl}/pagamento/sucesso`,
        failure: `${checkoutBaseUrl}/pagamento/falha`,
        pending: `${checkoutBaseUrl}/pagamento/pendente`,
      },
      auto_return: 'approved',
      notification_url: `${checkoutBaseUrl}/api/payments/webhook`,
      external_reference: crypto.randomUUID(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Mercado Pago respondeu ${response.status}.`);
  }

  const payload = (await response.json()) as { init_point?: string; sandbox_init_point?: string; id?: string };
  return {
    id: payload.id,
    checkoutUrl: process.env.NODE_ENV === 'production' ? payload.init_point : payload.sandbox_init_point || payload.init_point,
  };
}
