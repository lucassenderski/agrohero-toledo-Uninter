import { readFile } from 'node:fs/promises';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../server';

describe('API security controls', () => {
  it('sets browser security headers on every response', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('DENY');
    expect(response.headers['referrer-policy']).toBe('no-referrer');
    expect(response.headers['content-security-policy']).toContain("frame-ancestors 'none'");
  });

  it('allows the configured local frontend origin and rejects foreign origins', async () => {
    const allowed = await request(app)
      .options('/api/health')
      .set('Origin', 'http://localhost:5173');
    const rejected = await request(app)
      .options('/api/health')
      .set('Origin', 'https://malicious.example');

    expect(allowed.status).toBe(204);
    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(rejected.status).toBe(403);
  });

  it('does not claim authentication when Auth0 is not configured', async () => {
    const response = await request(app)
      .post('/api/auth/verify')
      .send({ email: 'user@example.com', role: 'consumer' });

    expect(response.status).toBe(503);
    expect(response.body.authenticated).not.toBe(true);
  });

  it('rejects malformed registration and invalid roles', async () => {
    const invalidName = await request(app)
      .post('/api/auth/register')
      .send({ name: 'x', email: 'invalid' });
    const invalidRole = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User Valid', email: 'user@example.com', role: 'owner' });

    expect(invalidName.status).toBe(400);
    expect(invalidRole.status).toBe(400);
  });

  it('does not echo producer document identifiers in registration responses', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Produtor Teste',
        email: 'produtor@example.com',
        role: 'farmer',
        farmName: 'Sítio Teste',
        district: 'Novo Sarandi',
        dapRecord: 'SENSITIVE-DOCUMENT-ID',
      });

    expect(response.status).toBe(201);
    expect(JSON.stringify(response.body)).not.toContain('SENSITIVE-DOCUMENT-ID');
    expect(response.body.user.documentStatus).toBe('received_for_review');
  });

  it('protects administrative and order listing endpoints without a bearer token', async () => {
    const endpoints = [
      request(app).get('/api/orders'),
      request(app).get('/api/producer/access-check'),
      request(app).patch('/api/orders/ord-1/status').send({ status: 'entregue' }),
    ];
    const responses = await Promise.all(endpoints);

    expect(responses.map((response) => response.status)).toEqual([503, 503, 503]);
  });

  it('publishes the in-person payment policy and accepted methods', async () => {
    const response = await request(app).get('/api/payment-methods');

    expect(response.status).toBe(200);
    expect(response.body.policy.channel).toBe('in_person');
    expect(response.body.policy.message).toMatch(/local de retirada/i);
    expect(response.body.methods.map((method: { id: string }) => method.id))
      .toEqual(['pix', 'credit_card', 'debit_card', 'cash']);
  });

  it('creates an order with payment pending for the pickup location', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send({
        id: 'ord-test-1',
        createdAt: '01/01/2026',
        customerName: 'Cliente Teste',
        customerPhone: '(45) 99999-0000',
        customerEmail: 'cliente.teste@exemplo.com.br',
        customerAddress: 'Rua Teste, 100',
        deliveryMethod: 'pickup',
        neighborhood: 'Centro',
        pickupLocation: 'Ponto Verde - Parque Ecológico Diva Paim Barth (Lago Municipal)',
        paymentMethod: 'pix',
        paymentStatus: 'pending_on_pickup',
        items: [{ product: { id: 'p-1', name: 'Alface', price: 5.5 }, quantity: 2 }],
        totalAmount: 11,
        deliveryFee: 0,
        status: 'novo',
      });

    expect(response.status).toBe(201);
    expect(response.body.order.paymentStatus).toBe('pending_on_pickup');
    expect(response.body.payment.channel).toBe('in_person');
  });

  it('rejects orders that try to mark payment as already settled online', async () => {
    const baseOrder = {
      id: 'ord-test-2',
      createdAt: '01/01/2026',
      customerName: 'Cliente Teste',
      customerPhone: '(45) 99999-0000',
      customerEmail: 'cliente.teste@exemplo.com.br',
      customerAddress: 'Rua Teste, 100',
      deliveryMethod: 'pickup',
      neighborhood: 'Centro',
      pickupLocation: 'Ponto Verde',
      items: [{ product: { id: 'p-1', name: 'Alface', price: 5.5 }, quantity: 2 }],
      totalAmount: 11,
      deliveryFee: 0,
      status: 'novo',
    };

    const paidUpfront = await request(app)
      .post('/api/orders')
      .send({ ...baseOrder, paymentMethod: 'credit_card', paymentStatus: 'paid' });
    const unknownMethod = await request(app)
      .post('/api/orders')
      .send({ ...baseOrder, paymentMethod: 'boleto', paymentStatus: 'pending_on_pickup' });
    const wrongTotal = await request(app)
      .post('/api/orders')
      .send({ ...baseOrder, paymentMethod: 'cash', paymentStatus: 'pending_on_pickup', totalAmount: 1 });

    const missingEmail = await request(app)
      .post('/api/orders')
      .send({ ...baseOrder, customerEmail: undefined, paymentMethod: 'cash', paymentStatus: 'pending_on_pickup' });

    expect(paidUpfront.status).toBe(400);
    expect(unknownMethod.status).toBe(400);
    expect(wrongTotal.status).toBe(400);
    expect(missingEmail.status).toBe(400);
    expect(missingEmail.body.error).toMatch(/e-mail válido/i);
  });

  it('no longer exposes an online checkout or payment webhook', async () => {
    const checkout = await request(app).post('/api/payments/checkout').send({ items: [] });
    const webhook = await request(app).post('/api/payments/webhook').send({ data: { id: 'payment-1' } });

    expect(checkout.status).toBe(404);
    expect(webhook.status).toBe(404);
  });
});

describe('frontend security regression checks', () => {
  it('does not persist the authenticated profile in browser storage', async () => {
    const source = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8');
    expect(source).not.toContain("localStorage.setItem('agrohero_user'");
    expect(source).not.toContain("localStorage.getItem('agrohero_user'");
  });

  it('does not ship a hard-coded password or payment card data', async () => {
    const authSource = await readFile(new URL('../src/components/AuthModal.tsx', import.meta.url), 'utf8');
    const paymentSource = await readFile(new URL('../src/components/CartAndCheckoutModal.tsx', import.meta.url), 'utf8');

    expect(authSource).not.toMatch(/SenhaForte@\d+/);
    expect(paymentSource).not.toMatch(/4532|cardCvv|Número do Cartão|CVV/);
  });

  it('keeps all payment collection on-site instead of an online gateway', async () => {
    const checkoutSource = await readFile(new URL('../src/components/CartAndCheckoutModal.tsx', import.meta.url), 'utf8');
    const apiSource = await readFile(new URL('../src/api.ts', import.meta.url), 'utf8');

    expect(checkoutSource).not.toMatch(/checkoutUrl|window\.location\.assign|pixCopyPasteCode/);
    expect(apiSource).not.toMatch(/checkoutUrl|\/api\/payments\/checkout/);
    expect(checkoutSource).toContain("paymentStatus: 'pending_on_pickup'");
  });
});
