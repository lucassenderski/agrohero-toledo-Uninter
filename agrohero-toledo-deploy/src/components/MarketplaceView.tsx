import React from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Plus, 
  Check, 
  Sprout, 
  Sparkles, 
  ChevronRight,
  TrendingUp,
  Truck,
  Leaf
} from 'lucide-react';
import { Product, Category, Producer } from '../types';
import { TOLEDO_DISTRICTS } from '../data/mockData';

interface MarketplaceViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onNavigateToRecipes: () => void;
  onNavigateToTestimonials: () => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onNavigateToRecipes,
  onNavigateToTestimonials,
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState<Category>('todos');
  const [selectedDistrict, setSelectedDistrict] = React.useState<string>('todos');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [onlyHarvestToday, setOnlyHarvestToday] = React.useState(false);
  const [addedItemNotice, setAddedItemNotice] = React.useState<string | null>(null);

  const categories: { id: Category; label: string; icon: string }[] = [
    { id: 'todos', label: 'Todos os Alimentos', icon: '🌾' },
    { id: 'hortalicas', label: 'Verduras & Folhagens', icon: '🥬' },
    { id: 'legumes_raizes', label: 'Legumes & Raízes', icon: '🥕' },
    { id: 'frutas', label: 'Frutas da Estação', icon: '🍌' },
    { id: 'ovos_mel', label: 'Ovos & Mel Silvestre', icon: '🍯' },
    { id: 'artesanais', label: 'Derivados Artesanais', icon: '🍓' },
  ];

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'todos' || p.category === selectedCategory;
    const matchDistrict = selectedDistrict === 'todos' || p.producer.district.includes(selectedDistrict);
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.producer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.producer.farmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchHarvest = !onlyHarvestToday || p.harvestDate.toLowerCase().includes('hoje') || p.harvestDate.toLowerCase().includes('diária');
    return matchCat && matchDistrict && matchSearch && matchHarvest;
  });

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    onAddToCart(product, 1);
    setAddedItemNotice(product.id);
    setTimeout(() => setAddedItemNotice(null), 1800);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner with Toledo identity */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-stone-900 text-white p-6 sm:p-10 shadow-xl">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-emerald-200 text-xs font-semibold backdrop-blur-md mb-4">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Agro Hero Toledo • Agricultura Familiar & Orgânicos</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-['Outfit',sans-serif] tracking-tight leading-tight text-stone-50">
            Alimentos orgânicos frescos direto de quem planta em Toledo.
          </h1>

          <p className="mt-4 text-base sm:text-lg text-emerald-100/90 leading-relaxed max-w-2xl font-normal">
            Conectamos você aos produtores familiares de Novo Sarandi, Concórdia do Oeste, Dez de Maio e Vila Nova. Colheita fresca, preço justo para o agricultor e saúde pura para a sua mesa.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              onClick={onNavigateToRecipes}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-sm transition-all shadow-md shadow-amber-400/20 flex items-center gap-2 cursor-pointer"
            >
              <span>Ver Receitas com Produtos Locais</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={onNavigateToTestimonials}
              className="px-5 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-white font-semibold text-sm border border-emerald-600/60 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Depoimentos dos Usuários</span>
              <span className="text-xs bg-emerald-600 px-2 py-0.5 rounded-full">⭐ 4.9</span>
            </button>
          </div>

          {/* Quick value badges */}
          <div className="mt-8 pt-6 border-t border-emerald-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium text-emerald-200">
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero Agrotóxicos</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Renda 100% ao Agricultor</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Entregas em Toledo</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Ponto Lago Municipal</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters Bar */}
      <section className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Text search */}
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              id="search-input-marketplace"
              placeholder="Buscar por tomate, mandioca, abóbora, mel ou nome do produtor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 font-semibold"
              >
                Limpar
              </button>
            )}
          </div>

          {/* District selector in Toledo */}
          <div className="md:col-span-4 relative">
            <select
              id="district-filter-select"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              aria-label="Filtrar por distrito de Toledo"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors cursor-pointer"
            >
              <option value="todos">📍 Todos os Distritos de Toledo</option>
              {TOLEDO_DISTRICTS.map((district) => (
                <option key={district} value={district}>
                  Distrito de {district}
                </option>
              ))}
            </select>
          </div>

          {/* Quick toggle for harvest today */}
          <div className="md:col-span-2 flex items-center">
            <button
              onClick={() => setOnlyHarvestToday(!onlyHarvestToday)}
              className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                onlyHarvestToday
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-emerald-300'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${onlyHarvestToday ? 'text-amber-300' : 'text-stone-500'}`} />
              <span>Colhido Hoje</span>
            </button>
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`category-filter-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-xs scale-102'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200/80'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-black text-stone-900 font-['Outfit',sans-serif]">
            Produtos da Agricultura Familiar
          </h2>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            {filteredProducts.length} disponíveis
          </span>
        </div>
        <p className="text-xs text-stone-500 hidden sm:block">
          Preço integral repassado aos produtores de Toledo
        </p>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 shadow-xs">
          <Sprout className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-stone-800">Nenhum produto encontrado</h3>
          <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
            Tente buscar com outros termos ou selecione "Todos os Distritos de Toledo" para ver todos os alimentos disponíveis.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('todos');
              setSelectedDistrict('todos');
              setSearchQuery('');
              setOnlyHarvestToday(false);
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => {
            const isRecentlyAdded = addedItemNotice === product.id;
            return (
              <div
                key={product.id}
                id={`product-card-${product.id}`}
                onClick={() => onSelectProduct(product)}
                className="group bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between cursor-pointer"
              >
                {/* Image & Badges */}
                <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />
                  
                  {/* Organic Certification Tag */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-900/90 backdrop-blur-md text-emerald-100 text-[10px] font-bold shadow-xs">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      {product.organicCert.split('/')[0]}
                    </span>
                  </div>

                  {/* Freshness Badge */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="bg-stone-900/70 backdrop-blur-xs px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-300" />
                      {product.harvestDate}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-200">
                      Estoque: {product.stock} {product.unit}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Producer & Toledo District */}
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1.5">
                      <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="font-semibold text-stone-800 truncate">
                        {product.producer.farmName}
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="truncate text-stone-500">
                        {product.producer.district.split(',')[0]}
                      </span>
                    </div>

                    <h3 className="font-bold text-stone-900 text-base leading-snug group-hover:text-emerald-800 transition-colors line-clamp-2">
                      {product.name}
                    </h3>

                    <p className="mt-1 text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Price and Add button */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-xs text-stone-500 block">Preço Direto</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-emerald-900">
                          R$ {product.price.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-xs font-medium text-stone-500">
                          /{product.unit}
                        </span>
                      </div>
                    </div>

                    <button
                      id={`btn-add-product-${product.id}`}
                      onClick={(e) => handleQuickAdd(e, product)}
                      className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer ${
                        isRecentlyAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-200/80 hover:border-transparent'
                      }`}
                    >
                      {isRecentlyAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Adicionado!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Toledo Local Pickup banner */}
      <section className="bg-amber-50 rounded-2xl border border-amber-200/80 p-5 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-200/60 px-2.5 py-0.5 rounded">
            🌳 Ponto de Retirada Ecológica em Toledo
          </div>
          <h3 className="text-lg font-black text-stone-900">
            Retire sua cesta orgânica no Parque Ecológico Diva Paim Barth
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 max-w-xl">
            Além da entrega a domicílio nos bairros de Toledo, você pode retirar seus produtos fresquinhos no Lago Municipal ou na Feira do Produtor Centro, sem taxa de frete!
          </p>
        </div>
        <button
          onClick={onNavigateToRecipes}
          className="shrink-0 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
        >
          Explorar Receitas Saudáveis
        </button>
      </section>
    </div>
  );
};
