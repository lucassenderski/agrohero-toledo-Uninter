import React from 'react';
import { 
  Plus, 
  Package, 
  Clock, 
  Truck, 
  CheckCircle2, 
  DollarSign, 
  Leaf, 
  AlertCircle, 
  MapPin, 
  QrCode, 
  CreditCard,
  Edit2,
  Trash2,
  Calendar,
  X,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { Product, Order, OrderStatus, AppUser } from '../types';
import { TOLEDO_DISTRICTS, PRODUCERS } from '../data/mockData';

interface ProducerDashboardViewProps {
  products: Product[];
  orders: Order[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  currentUser: AppUser | null;
}

export const ProducerDashboardView: React.FC<ProducerDashboardViewProps> = ({
  products,
  orders,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = React.useState<'orders' | 'products' | 'logistics'>('orders');
  const [showAddModal, setShowAddModal] = React.useState(false);

  // New product form state
  const [name, setName] = React.useState('');
  const [category, setCategory] = React.useState<Product['category']>('hortalicas');
  const [price, setPrice] = React.useState('');
  const [unit, setUnit] = React.useState('kg');
  const [stock, setStock] = React.useState('50');
  const [district, setDistrict] = React.useState('Novo Sarandi');
  const [organicCert, setOrganicCert] = React.useState('Certificação Orgânica CPOrg-PR');
  const [harvestDate, setHarvestDate] = React.useState('Colheita diária fresca');
  const [description, setDescription] = React.useState('');
  const [image, setImage] = React.useState('');

  const totalSalesRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const pendingHarvestOrders = orders.filter(o => o.status === 'novo' || o.status === 'colheita').length;

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    const newProd: Product = {
      id: `p-${Date.now()}`,
      name: name.trim(),
      category,
      price: parseFloat(price.replace(',', '.')),
      unit,
      stock: parseInt(stock) || 30,
      producerId: 'prod-1',
      producer: {
        id: 'prod-custom',
        name: currentUser?.name || 'Família Agricultora de Toledo',
        farmName: currentUser?.farmName || 'Sítio Familiar Sustentável',
        district: `${district}, Toledo - PR`,
        bio: 'Agricultores familiares dedicados ao cultivo agroecológico sem aditivos sintéticos.',
        phone: '(45) 99800-0000',
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80',
        yearsFarming: 8,
      },
      organicCert,
      description: description || 'Alimento agroecológico cultivado na microrregião de Toledo com adubação natural.',
      harvestDate,
      image: image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
      nutritionalBenefits: ['100% Livre de Agrotóxicos', 'Colhido no Ponto Ideal'],
    };

    onAddProduct(newProd);
    setShowAddModal(false);
    setName('');
    setPrice('');
    setDescription('');
    setImage('');
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'novo':
        return { label: 'Novo Pedido', color: 'bg-amber-100 text-amber-900 border-amber-300', icon: Clock };
      case 'colheita':
        return { label: 'Em Colheita no Campo', color: 'bg-blue-100 text-blue-900 border-blue-300', icon: Leaf };
      case 'em_rota':
        return { label: 'Em Rota para Toledo', color: 'bg-purple-100 text-purple-900 border-purple-300', icon: Truck };
      case 'entregue':
        return { label: 'Entregue / Concluído', color: 'bg-emerald-100 text-emerald-900 border-emerald-300', icon: CheckCircle2 };
      default:
        return { label: status, color: 'bg-stone-100 text-stone-800 border-stone-200', icon: Clock };
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-stone-900 via-emerald-950 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-2">
            <Leaf className="w-3.5 h-3.5" />
            <span>Painel Administrativo do Produtor Rural & Gestão</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-['Outfit',sans-serif]">
            Gestão de Produtos, Pedidos e Entregas em Toledo
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 mt-1">
            Controle de safra, colheita sob demanda sem desperdício e faturamento repassado direto na conta.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Produto Orgânico</span>
        </button>
      </section>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Faturamento Direto</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900 font-['Outfit',sans-serif]">
            R$ {totalSalesRevenue.toFixed(2).replace('.', ',')}
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            100% Repasse Líquido ao Produtor
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Pedidos para Colher</span>
            <Leaf className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-900 font-['Outfit',sans-serif]">
            {pendingHarvestOrders} cestas
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Colheita programada de hoje
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Produtos Ativos</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-stone-900 font-['Outfit',sans-serif]">
            {products.length} itens
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Visíveis na vitrine de Toledo
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Desperdício Evitado</span>
            <Sparkles className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-900 font-['Outfit',sans-serif]">
            Zero Perdas
          </div>
          <p className="text-[11px] text-teal-700 font-medium mt-1">
            Colheita realizada após venda
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-emerald-800 text-white'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Pedidos e Entregas em Toledo ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'products'
              ? 'bg-emerald-800 text-white'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Catálogo de Alimentos ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logistics')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'logistics'
              ? 'bg-emerald-800 text-white'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Rotas de Toledo & Pontos de Coleta</span>
        </button>
      </div>

      {/* Tab 1: Orders and Deliveries */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900">
              Fluxo de Pedidos dos Clientes de Toledo
            </h3>
            <span className="text-xs text-stone-500">
              Atualize o status conforme a colheita e rota de entrega avançam
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-stone-200">
              <Package className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-stone-600 font-bold">Nenhum pedido registrado ainda.</p>
              <p className="text-xs text-stone-400 mt-1">
                Faça uma compra de teste pelo marketplace com PIX ou Cartão para ver o pedido aparecer aqui em tempo real.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const badge = getStatusBadge(order.status);
                const BadgeIcon = badge.icon;
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-sm text-stone-900">
                          Pedido #{order.id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-xs text-stone-400">• {order.createdAt}</span>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                          <BadgeIcon className="w-3 h-3" />
                          {badge.label}
                        </span>
                      </div>

                      <div className="text-xs text-stone-600 flex flex-wrap gap-y-1 gap-x-4">
                        <span className="font-bold text-stone-800">
                          Cliente: {order.customerName} ({order.customerPhone})
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          {order.deliveryMethod === 'delivery' 
                            ? `Entrega: ${order.customerAddress} (${order.neighborhood})` 
                            : `Retirada: ${order.pickupLocation}`}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-emerald-800">
                          {order.paymentMethod === 'pix' ? <QrCode className="w-3.5 h-3.5" /> : <CreditCard className="w-3.5 h-3.5" />}
                          Pago via {order.paymentMethod.toUpperCase()}
                        </span>
                      </div>

                      {/* Items list */}
                      <div className="text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-100 flex flex-wrap gap-2">
                        <span className="font-bold text-stone-500">Itens colhidos:</span>
                        {order.items.map((it, idx) => (
                          <span key={idx} className="bg-white px-2 py-0.5 rounded border border-stone-200 text-stone-700 font-medium">
                            {it.quantity}x {it.product.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Total & Status Selector */}
                    <div className="flex sm:flex-col lg:items-end justify-between items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t sm:border-t-0 border-stone-100">
                      <div className="text-right">
                        <span className="text-[10px] text-stone-400 uppercase font-bold block">Total</span>
                        <span className="text-lg font-black text-emerald-900">
                          R$ {order.totalAmount.toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-stone-500 hidden sm:block">
                          Alterar status:
                        </label>
                        <select
                          value={order.status}
                          onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        >
                          <option value="novo">⏳ 1. Novo Pedido</option>
                          <option value="colheita">🌱 2. Em Colheita no Campo</option>
                          <option value="em_rota">🚚 3. Em Rota para Toledo</option>
                          <option value="entregue">✅ 4. Entregue / Concluído</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Products Catalog Management */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900">
              Seus Produtos Orgânicos Cadastrados
            </h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Produto</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="divide-y divide-stone-200">
              {products.map((product) => (
                <div key={product.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-stone-200"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {product.category}
                        </span>
                        <span className="text-xs text-stone-500 hidden sm:inline">
                          📍 {product.producer.district}
                        </span>
                      </div>
                      <h4 className="font-bold text-stone-900 text-sm truncate mt-0.5">
                        {product.name}
                      </h4>
                      <p className="text-xs text-stone-500">
                        {product.harvestDate} • Selo: {product.organicCert.split('/')[0]}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-black text-emerald-900">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </div>
                      <span className="text-xs text-stone-500 font-medium">
                        Estoque: {product.stock} {product.unit}
                      </span>
                    </div>

                    <button
                      onClick={() => onDeleteProduct(product.id)}
                      className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Excluir produto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Logistics & Toledo Points */}
      {activeTab === 'logistics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              1
            </div>
            <h4 className="text-base font-bold text-stone-900">Feira do Produtor Centro</h4>
            <p className="text-xs text-stone-500">Rua Almirante Barroso, 2145 - Centro de Toledo</p>
            <div className="pt-2 text-xs font-semibold text-emerald-800">
              📅 Quartas e Sábados das 07h às 12h
            </div>
            <p className="text-xs text-stone-600">
              Ponto central de agregação e retirada gratuita pelos moradores do Centro e região.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              2
            </div>
            <h4 className="text-base font-bold text-stone-900">Parque Diva Paim Barth (Lago)</h4>
            <p className="text-xs text-stone-500">Rua Raimundo Leonardi, próx. Deck do Lago Municipal</p>
            <div className="pt-2 text-xs font-semibold text-amber-800">
              📅 Terças e Quintas das 16h às 19h30
            </div>
            <p className="text-xs text-stone-600">
              Ponto ecológico ao ar livre para quem faz caminhadas no Lago retirar sua cesta na volta para casa.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              3
            </div>
            <h4 className="text-base font-bold text-stone-900">Rota Domiciliar nos Bairros</h4>
            <p className="text-xs text-stone-500">Jd. La Salle, Vila Industrial, Coopagro, Pancera e Santa Maria</p>
            <div className="pt-2 text-xs font-semibold text-blue-800">
              📅 Diariamente no período da tarde
            </div>
            <p className="text-xs text-stone-600">
              Entregadores parceiros locais com veículo elétrico ou moto econômica para entrega rápida.
            </p>
          </div>
        </div>
      )}

      {/* Modal Add Product */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div 
            className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-stone-200 p-6 sm:p-7 relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-stone-900 font-['Outfit',sans-serif]">
                    Cadastrar Alimento Orgânico de Toledo
                  </h3>
                  <p className="text-xs text-stone-500">
                    Disponibilize sua colheita fresca para as famílias de Toledo
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rúcula Silvestre Agroecológica"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="hortalicas">Verduras & Folhagens</option>
                    <option value="legumes_raizes">Legumes & Raízes</option>
                    <option value="frutas">Frutas</option>
                    <option value="ovos_mel">Ovos & Mel</option>
                    <option value="artesanais">Derivados Artesanais</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Preço Unitário (R$)
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    required
                    placeholder="Ex: 5.50"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Unidade
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: maço, kg, pote"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Distrito em Toledo
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500"
                  >
                    {TOLEDO_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Selo / Certificação
                  </label>
                  <select
                    value={organicCert}
                    onChange={(e) => setOrganicCert(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Certificação Orgânica CPOrg-PR">Certificação Orgânica CPOrg-PR</option>
                    <option value="Rede Ecovida Agroecologia">Rede Ecovida Agroecologia</option>
                    <option value="Selo Municipal Agroecológico Toledo">Selo Municipal Agroecológico Toledo</option>
                    <option value="Transição Agroecológica Assistida">Transição Agroecológica Assistida</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Breve Descrição do Cultivo
                </label>
                <textarea
                  rows={2}
                  placeholder="Explique como foi cultivado, cuidados e sabor..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  URL da Foto (Opcional - usamos foto padrão se em branco)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Salvar e Publicar na Vitrine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
