import { AddressInfo } from 'node:net';
import { simpleParser } from 'mailparser';
import { SMTPServer } from 'smtp-server';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { resetMailTransport } from '../mailer';
import app from '../server';

interface CapturedMessage {
  to: string[];
  from: string;
  subject: string;
  html: string;
  text: string;
}

const messages: CapturedMessage[] = [];
let server: SMTPServer;
let smtpPort: number;

const waitForMessages = async (expected: number, timeoutMs = 3000) => {
  const deadline = Date.now() + timeoutMs;
  while (messages.length < expected && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
};

const order = (overrides: Record<string, unknown> = {}) => ({
  id: 'ord-email-1',
  createdAt: '25/09/2026',
  customerName: 'Lucas Silva',
  customerPhone: '(45) 99811-4520',
  customerEmail: 'lucas.silva@exemplo.com.br',
  customerAddress: 'Rua Santos Dumont, 1420',
  deliveryMethod: 'pickup',
  neighborhood: 'Jardim La Salle',
  pickupLocation: 'Ponto Verde - Parque Ecológico Diva Paim Barth (Lago Municipal)',
  paymentMethod: 'pix',
  paymentStatus: 'pending_on_pickup',
  items: [
    { product: { id: 'p-1', name: 'Abóbora Cabotiá', price: 6.9 }, quantity: 2 },
    { product: { id: 'p-2', name: 'Alface Crespa', price: 3.5 }, quantity: 1 },
  ],
  totalAmount: 17.3,
  deliveryFee: 0,
  status: 'novo',
  ...overrides,
});

beforeAll(async () => {
  server = new SMTPServer({
    authOptional: true,
    disabledCommands: ['STARTTLS'],
    onAuth(auth, _session, callback) {
      if (auth.username === 'test-user' && auth.password === 'test-password') {
        return callback(null, { user: auth.username });
      }
      callback(new Error('Credenciais inválidas'));
    },
    onData(stream, session, callback) {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', async () => {
        const parsed = await simpleParser(Buffer.concat(chunks));
        messages.push({
          to: session.envelope.rcptTo.map((rcpt) => rcpt.address),
          from: session.envelope.mailFrom ? session.envelope.mailFrom.address : '',
          subject: parsed.subject || '',
          // O formatador de moeda usa espaço não separável; normaliza para comparação.
          html: (parsed.html || '').replace(/\u00a0/g, ' '),
          text: (parsed.text || '').replace(/\u00a0/g, ' '),
        });
        callback();
      });
    },
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  smtpPort = (server.server.address() as AddressInfo).port;

  process.env.SMTP_HOST = '127.0.0.1';
  process.env.SMTP_PORT = String(smtpPort);
  process.env.SMTP_USER = 'test-user';
  process.env.SMTP_PASSWORD = 'test-password';
  process.env.MAIL_FROM = 'no-reply@agrohero.com.br';
  resetMailTransport();
});

afterAll(async () => {
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_PORT;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASSWORD;
  delete process.env.MAIL_FROM;
  resetMailTransport();
  await new Promise<void>((resolve) => server.close(resolve));
});

describe('order confirmation e-mails', () => {
  it('sends the confirmation to the customer and a preparation notice to each producer', async () => {
    messages.length = 0;

    const response = await request(app).post('/api/orders').send(order());

    expect(response.status).toBe(201);
    expect(response.body.emailNotification).toBe('sent');

    // Aguarda a entrega das mensagens no servidor SMTP local.
    await waitForMessages(3);

    const recipients = messages.flatMap((message) => message.to);
    expect(recipients).toContain('lucas.silva@exemplo.com.br');
    // Produtor real do catálogo do servidor, resolvido pelo id do produto.
    expect(recipients).toContain('bela.vista@agrohero.com.br');
    expect(recipients).toContain('terra.viva@agrohero.com.br');
    expect(messages).toHaveLength(3);

    const customerMail = messages.find((message) => message.to.includes('lucas.silva@exemplo.com.br'));
    expect(customerMail?.subject).toBe('Pedido ord-email-1 confirmado — Agro Hero Toledo');
    expect(customerMail?.html).toContain('Abóbora Cabotiá');
    expect(customerMail?.html).toContain('no local da retirada ou da entrega');
    expect(customerMail?.html).toContain('R$ 17,30');

    const producerMail = messages.find((message) => message.to.includes('bela.vista@agrohero.com.br'));
    expect(producerMail?.subject).toContain('Novo pedido ord-email-1 para preparar');
    expect(producerMail?.html).toContain('Chácara Bela Vista dos Orgânicos');
    // Cada produtor recebe apenas os próprios itens.
    expect(producerMail?.html).toContain('Abóbora Cabotiá');
    expect(producerMail?.html).not.toContain('Alface Crespa');
    expect(producerMail?.html).toContain('Lucas Silva');
    expect(producerMail?.from).toBe('no-reply@agrohero.com.br');
  });

  it('ignores an e-mail address injected through the client payload', async () => {
    messages.length = 0;

    const response = await request(app)
      .post('/api/orders')
      .send(order({
        id: 'ord-email-2',
        items: [
          {
            product: {
              id: 'p-1',
              name: 'Abóbora Cabotiá',
              price: 6.9,
              producer: { id: 'prod-2', name: 'Falso', email: 'atacante@exemplo.com' },
            },
            quantity: 1,
          },
        ],
        totalAmount: 6.9,
      }));

    expect(response.status).toBe(201);
    await waitForMessages(2);

    const recipients = messages.flatMap((message) => message.to);
    expect(recipients).not.toContain('atacante@exemplo.com');
    expect(recipients).toContain('bela.vista@agrohero.com.br');
  });

  it('rejects an order without a valid customer e-mail', async () => {
    messages.length = 0;

    const response = await request(app)
      .post('/api/orders')
      .send(order({ id: 'ord-email-3', customerEmail: 'sem-arroba' }));

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/e-mail válido/i);
    expect(messages).toHaveLength(0);
  });
});

describe('order e-mails without SMTP configured', () => {
  it('still registers the order and reports the notification as disabled', async () => {
    delete process.env.SMTP_HOST;
    resetMailTransport();

    const response = await request(app).post('/api/orders').send(order({ id: 'ord-email-4' }));

    expect(response.status).toBe(201);
    expect(response.body.emailNotification).toBe('disabled');
  });
});
