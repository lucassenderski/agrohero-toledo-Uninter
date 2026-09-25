import React from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  MapPin, 
  QrCode, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Copy, 
  Check, 
  Truck, 
  Clock, 
  ArrowRight, 
  ArrowLeft,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, Order, Product } from '../types';
import { TOLEDO_PICKUP_POINTS } from '../data/mockData';

interface CartAndCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onOrderCompleted: (order: Order) => void;
  onStartCheckout?: (items: CartItem[]) => Promise<boolean>;
}

export const CartAndCheckoutModal: React.FC<CartAndCheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderCompleted,
  onStartCheckout,
}) => {
  const [step, setStep] = React.useState<'cart' | 'shipping' | 'payment' | 'success'>('cart');

  // Shipping details state
  const [customerName, setCustomerName] = React.useState('Lucas Silva');
  const [customerPhone, setCustomerPhone] = React.useState('(45) 99811-4520');
  const [deliveryMethod, setDeliveryMethod] = React.useState<'delivery' | 'pickup'>('pickup');
  const [neighborhood, setNeighborhood] = React.useState('Jardim La Salle');
  const [customerAddress, setCustomerAddress] = React.useState('Rua Santos Dumont, 1420');
  const [pickupPoint, setPickupPoint] = React.useState(TOLEDO_PICKUP_POINTS[1].name);

  // Payment details state
  const [paymentMethod, setPaymentMethod] = React.useState<'pix' | 'credit_card'>('pix');

  // PIX helpers
  const [copiedPix, setCopiedPix] = React.useState(false);
  const [paymentError, setPaymentError] = React.useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = React.useState<Order | null>(null);

  if (!isOpen) return null;

  const itemsSubtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const deliveryFee = deliveryMethod === 'delivery' ? 8.00 : 0.00;
  const orderTotal = itemsSubtotal + deliveryFee;

  const pixCopyPasteCode = `00020126580014br.gov.bcb.pix0136agrohero-toledo-organicos@pix.gov.br520400005303986540${orderTotal.toFixed(2)}5802BR5909AGRO HERO6006TOLEDO62070503***6304E91A`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCopyPasteCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleFinishPayment = async () => {
    setPaymentError(null);
    if (!onStartCheckout) {
      setPaymentError('O gateway de pagamento não está disponível neste ambiente.');
      return;
    }

    try {
      const redirectedToGateway = await onStartCheckout(cartItems);
      if (redirectedToGateway) return;
      setPaymentError('Configure Auth0 e o gateway de pagamento para concluir a transação.');
    } catch {
      setPaymentError('Não foi possível iniciar o checkout. Tente novamente.');
    }
  };

  const handleClose = () => {
    setStep('cart');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-700" />
            <span className="font-extrabold text-stone-900 text-base font-['Outfit',sans-serif]">
              {step === 'cart' && 'Minha Cesta de Orgânicos de Toledo'}
              {step === 'shipping' && 'Entrega ou Retirada em Toledo - PR'}
              {step === 'payment' && 'Pagamento (PIX ou Cartão)'}
              {step === 'success' && 'Pedido Confirmado com Sucesso!'}
            </span>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* STEP 1: CART REVIEW */}
          {step === 'cart' && (
            <>
              {cartItems.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-stone-800">
                    Sua cesta está vazia
                  </h3>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    Explore a vitrine de alimentos frescos ou nossas receitas locais para adicionar itens colhidos em Toledo.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                  >
                    Ver Produtos de Toledo
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="divide-y divide-stone-100">
                    {cartItems.map((item) => (
                      <div key={item.product.id} className="py-3 flex items-center justify-between gap-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-stone-200"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-stone-900 truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-xs text-stone-500">
                            {item.product.producer.farmName} ({item.product.producer.district.split(',')[0]})
                          </p>
                          <span className="text-xs font-bold text-emerald-800">
                            R$ {item.product.price.toFixed(2).replace('.', ',')} / {item.product.unit}
                          </span>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                              className="p-1.5 text-stone-600 hover:bg-stone-200 rounded-l"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-7 text-center font-bold text-xs text-stone-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                              className="p-1.5 text-stone-600 hover:bg-stone-200 rounded-r"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="text-sm font-black text-stone-900 w-16 text-right">
                            R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                          </span>

                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg"
                            title="Remover item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order subtotal banner */}
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between text-xs sm:text-sm">
                    <div>
                      <span className="font-bold text-emerald-950 block">Subtotal dos Produtos:</span>
                      <span className="text-xs text-emerald-800">
                        100% repassado aos agricultores de Toledo
                      </span>
                    </div>
                    <span className="text-xl font-black text-emerald-900">
                      R$ {itemsSubtotal.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* STEP 2: SHIPPING / PICKUP IN TOLEDO */}
          {step === 'shipping' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                  Escolha como deseja receber seus alimentos em Toledo
                </label>
              </div>

              {/* Delivery mode radio options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    deliveryMethod === 'pickup'
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      Retirada Ecológica
                    </span>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      GRÁTIS
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    No Parque Ecológico Diva Paim Barth (Lago) ou Feira do Produtor Centro.
                  </p>
                </div>

                <div
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    deliveryMethod === 'delivery'
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      Entrega a Domicílio
                    </span>
                    <span className="text-xs font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-full">
                      Taxa: R$ 8,00
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Entregamos diretamente na sua residência nos bairros de Toledo.
                  </p>
                </div>
              </div>

              {/* Pickup Point Selection */}
              {deliveryMethod === 'pickup' ? (
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                  <label className="text-xs font-bold text-stone-700 block">
                    Selecione o Ponto de Retirada em Toledo:
                  </label>
                  <div className="space-y-2">
                    {TOLEDO_PICKUP_POINTS.slice(0, 2).map((point) => (
                      <label 
                        key={point.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer ${
                          pickupPoint === point.name 
                            ? 'bg-white border-emerald-500 ring-1 ring-emerald-500' 
                            : 'bg-white/70 border-stone-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="pickup"
                          checked={pickupPoint === point.name}
                          onChange={() => setPickupPoint(point.name)}
                          className="mt-1 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-stone-900 block">{point.name}</span>
                          <span className="text-stone-500 block">{point.address}</span>
                          <span className="text-emerald-700 font-semibold block mt-0.5">{point.schedule}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                /* Delivery Address in Toledo */
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Bairro em Toledo
                      </label>
                      <select
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-900"
                      >
                        <option value="Jardim La Salle">Jardim La Salle</option>
                        <option value="Centro">Centro</option>
                        <option value="Vila Industrial">Vila Industrial</option>
                        <option value="Coopagro">Coopagro</option>
                        <option value="Jardim Gisela">Jardim Gisela</option>
                        <option value="Santa Maria">Santa Maria</option>
                        <option value="Pancera">Pancera</option>
                        <option value="Tocantins">Tocantins</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Telefone / WhatsApp para Aviso
                      </label>
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Endereço e Número
                    </label>
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Ex: Rua Santos Dumont, 1420 - Apto 302"
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900"
                    />
                  </div>
                </div>
              )}

              {/* Customer Name */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Nome do Destinatário
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900"
                />
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT GATEWAY (PIX & CARTÃO) */}
          {step === 'payment' && (
            <div className="space-y-4">
              {paymentError && (
                <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">
                  {paymentError}
                </div>
              )}
              {/* Payment selector tabs */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  id="tab-payment-pix"
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-3.5 rounded-2xl border-2 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    paymentMethod === 'pix'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  <span>PIX Instantâneo</span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-black">
                    Aprovação Imediata
                  </span>
                </button>

                <button
                  id="tab-payment-card"
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`p-3.5 rounded-2xl border-2 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    paymentMethod === 'credit_card'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Cartão de Crédito</span>
                </button>
              </div>

              {/* PIX Flow */}
              {paymentMethod === 'pix' ? (
                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4 text-center">
                  <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>QR Code válido por 15:00 minutos</span>
                  </div>

                  {/* QR Code graphic */}
                  <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-center relative">
                    <div className="grid grid-cols-6 gap-1 w-full h-full p-2 bg-stone-900 rounded-lg">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`rounded-xs ${
                            (i % 2 === 0 || i % 7 === 0 || i === 0 || i === 5 || i === 30 || i === 35) 
                              ? 'bg-white' 
                              : 'bg-stone-900'
                          }`} 
                        />
                      ))}
                    </div>
                    {/* Centered Logo Badge */}
                    <div className="absolute inset-0 m-auto w-10 h-10 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-md">
                      PIX
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-stone-500 block">Total a pagar com PIX:</span>
                    <span className="text-2xl font-black text-stone-900 font-['Outfit',sans-serif]">
                      R$ {orderTotal.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  {/* PIX Copia e Cola */}
                  <div className="space-y-1 text-left">
                    <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                      Código PIX Copia e Cola
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={pixCopyPasteCode}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-600 font-mono select-all truncate"
                      />
                      <button
                        onClick={handleCopyPix}
                        className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedPix ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-500">
                    Abra o app do seu banco, escolha <strong>Pagar com PIX</strong> e aponte a câmera ou cole o código acima.
                  </p>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>Pagamento processado pelo provedor seguro</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Você será direcionado ao checkout externo para concluir PIX ou cartão. Os dados financeiros não passam pelo Agro Hero.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION */}
          {step === 'success' && completedOrder && (
            <div className="py-6 text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto animate-bounce" />
              <div>
                <h3 className="text-2xl font-black text-stone-900 font-['Outfit',sans-serif]">
                  Pedido Confirmado com Sucesso!
                </h3>
                <p className="text-xs font-mono font-bold text-stone-500 mt-1">
                  Código: #{completedOrder.id.slice(-8).toUpperCase()}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left text-xs text-emerald-950 space-y-2">
                <div className="font-bold text-sm">
                  {completedOrder.deliveryMethod === 'delivery' ? '🚚 Entrega Programada:' : '📍 Ponto de Retirada em Toledo:'}
                </div>
                <p>
                  {completedOrder.deliveryMethod === 'delivery' 
                    ? `Endereço: ${completedOrder.customerAddress} - ${completedOrder.neighborhood}, Toledo - PR`
                    : `Local: ${completedOrder.pickupLocation}`}
                </p>
                <p className="text-emerald-800">
                  Os agricultores de Novo Sarandi, Concórdia do Oeste e Vila Nova já foram notificados e iniciarão a colheita fresca dos seus produtos!
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleClose}
                  className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  Voltar ao Marketplace
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {step !== 'success' && cartItems.length > 0 && (
          <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
            {step === 'cart' ? (
              <>
                <div>
                  <span className="text-xs text-stone-500 block">Total da Cesta</span>
                  <span className="text-lg font-black text-emerald-950">
                    R$ {itemsSubtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <button
                  id="btn-proceed-to-shipping"
                  onClick={() => setStep('shipping')}
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <span>Continuar para Entrega</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : step === 'shipping' ? (
              <>
                <button
                  onClick={() => setStep('cart')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-200/60 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-stone-500 block">Total c/ frete:</span>
                    <span className="text-base font-black text-emerald-950">
                      R$ {orderTotal.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <button
                    id="btn-proceed-to-payment"
                    onClick={() => setStep('payment')}
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <span>Ir para Pagamento</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => setStep('shipping')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-200/60 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>

                <button
                  id="btn-finish-payment"
                  onClick={handleFinishPayment}
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {paymentMethod === 'pix' ? 'Confirmar Pagamento PIX' : 'Concluir Pagamento com Cartão'}
                  </span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
