import { createHmac } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import app from '../server';

afterEach(() => {
  delete process.env.MERCADOPAGO_WEBHOOK_SECRET;
});

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

  it('protects administrative, order and payment endpoints without a bearer token', async () => {
    const endpoints = [
      request(app).get('/api/orders'),
      request(app).get('/api/producer/access-check'),
      request(app).post('/api/payments/checkout').send({ items: [] }),
    ];
    const responses = await Promise.all(endpoints);

    expect(responses.map((response) => response.status)).toEqual([503, 503, 503]);
  });

  it('rejects unsigned and invalid payment webhooks', async () => {
    process.env.MERCADOPAGO_WEBHOOK_SECRET = 'test-secret';
    const unsigned = await request(app)
      .post('/api/payments/webhook')
      .send({ data: { id: 'payment-1' } });
    const invalid = await request(app)
      .post('/api/payments/webhook')
      .set('x-request-id', 'request-1')
      .set('x-signature', `ts:${Math.floor(Date.now() / 1000)},v1:bad`)
      .send({ data: { id: 'payment-1' } });

    expect(unsigned.status).toBe(400);
    expect(invalid.status).toBe(401);
  });

  it('accepts a fresh webhook only when its HMAC is valid', async () => {
    const secret = 'test-secret';
    const requestId = 'request-1';
    const dataId = 'payment-1';
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const manifest = `id:${dataId};request-id:${requestId};ts:${timestamp};`;
    const hash = createHmac('sha256', secret).update(manifest).digest('hex');
    process.env.MERCADOPAGO_WEBHOOK_SECRET = secret;

    const response = await request(app)
      .post('/api/payments/webhook')
      .set('x-request-id', requestId)
      .set('x-signature', `ts=${timestamp},v1=${hash}`)
      .send({ data: { id: dataId } });

    expect(response.status).toBe(202);
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
});
