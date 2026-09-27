import { PaymentMethod, PaymentOption } from './src/types';

// Política única de pagamento da plataforma: nada é cobrado online.
// O pagamento acontece presencialmente no ponto de retirada ou na entrega.
export const PICKUP_PAYMENT_POLICY = {
  channel: 'in_person',
  message: 'O pagamento é efetuado no local de retirada ou entrega dos produtos.',
} as const;

export const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'pix',
    label: 'PIX na retirada',
    description: 'Pague por PIX presencialmente, direto para o produtor no momento da retirada.',
    instructions: [
      'Finalize o pedido sem pagar nada agora.',
      'No ponto de retirada, escaneie o QR Code PIX do produtor.',
      'A equipe confirma o recebimento e libera os produtos.',
    ],
  },
  {
    id: 'credit_card',
    label: 'Cartão de crédito na retirada',
    description: 'O cartão é passado na maquininha do produtor no momento da retirada.',
    instructions: [
      'Finalize o pedido sem informar dados do cartão.',
      'Leve o cartão até o ponto de retirada.',
      'O pagamento é aprovado na maquininha, no local.',
    ],
  },
  {
    id: 'debit_card',
    label: 'Cartão de débito na retirada',
    description: 'Débito na maquininha do produtor no momento da retirada.',
    instructions: [
      'Finalize o pedido sem informar dados do cartão.',
      'Leve o cartão até o ponto de retirada.',
      'O pagamento é aprovado na maquininha, no local.',
    ],
  },
  {
    id: 'cash',
    label: 'Dinheiro na retirada',
    description: 'Pague em espécie no ponto de retirada, combinando o valor com o produtor.',
    instructions: [
      'Finalize o pedido sem pagar nada agora.',
      'Separe o valor exato do pedido.',
      'Entregue o valor no ponto de retirada e receba os produtos.',
    ],
  },
];

const paymentMethodIds = new Set<string>(PAYMENT_OPTIONS.map((option) => option.id));

export const isPaymentMethod = (value: unknown): value is PaymentMethod =>
  typeof value === 'string' && paymentMethodIds.has(value);

export const listPaymentOptions = () => PAYMENT_OPTIONS;
