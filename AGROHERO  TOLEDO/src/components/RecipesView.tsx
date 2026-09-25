import React from 'react';
import { 
  BookOpen, 
  Clock, 
  Users, 
  ChefHat, 
  ShoppingCart, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  Check, 
  Flame,
  Info,
  Share2
} from 'lucide-react';
import { Recipe, Product } from '../types';

interface RecipesViewProps {
  recipes: Recipe[];
  products: Product[];
  onAddProductToCart: (product: Product, quantity?: number) => void;
  onAddMultipleToCart: (items: { product: Product; quantity: number }[]) => void;
  onSelectProduct: (product: Product) => void;
  initialRecipeId?: string | null;
}

export const RecipesView: React.FC<RecipesViewProps> = ({
  recipes,
  products,
  onAddProductToCart,
  onAddMultipleToCart,
  onSelectProduct,
  initialRecipeId,
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('Todas');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeRecipe, setActiveRecipe] = React.useState<Recipe | null>(
    initialRecipeId ? recipes.find(r => r.id === initialRecipeId) || recipes[0] : recipes[0]
  );
  const [addedBatchNotice, setAddedBatchNotice] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (initialRecipeId) {
      const found = recipes.find(r => r.id === initialRecipeId);
      if (found) setActiveRecipe(found);
    }
  }, [initialRecipeId, recipes]);

  const categories = ['Todas', 'Prato Principal', 'Saladas', 'Lanches & Sopas', 'Sobremesas', 'Bebidas & Sucos'];

  const filteredRecipes = recipes.filter(r => {
    const matchCat = selectedCategory === 'Todas' || r.category === selectedCategory;
    const matchSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.ingredients.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  // Calculate available marketplace items for the active recipe
  const getRecipeMarketplaceItems = (recipe: Recipe) => {
    const items: { product: Product; quantity: number }[] = [];
    recipe.ingredients.forEach(ing => {
      if (ing.productId) {
        const prod = products.find(p => p.id === ing.productId);
        if (prod) {
          items.push({ product: prod, quantity: 1 });
        }
      }
    });
    return items;
  };

  const handleBuyAllIngredients = (recipe: Recipe) => {
    const itemsToAdd = getRecipeMarketplaceItems(recipe);
    if (itemsToAdd.length > 0) {
      onAddMultipleToCart(itemsToAdd);
      setAddedBatchNotice(recipe.id);
      setTimeout(() => setAddedBatchNotice(null), 2500);
    }
  };

  const activeRecipeMarketplaceItems = activeRecipe ? getRecipeMarketplaceItems(activeRecipe) : [];
  const totalRecipeItemsCost = activeRecipeMarketplaceItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-amber-900 via-stone-900 to-emerald-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold mb-3">
            <ChefHat className="w-3.5 h-3.5" />
            <span>Culinária Sustentável & Saudável com Produtos de Toledo</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-['Outfit',sans-serif] tracking-tight leading-tight">
            Receitas da Terra: Da Roça de Toledo para a sua Cozinha
          </h1>

          <p className="mt-3 text-sm sm:text-base text-stone-300 max-w-2xl leading-relaxed">
            Aprenda a preparar pratos deliciosos e nutritivos aproveitando 100% dos alimentos orgânicos da nossa região. Com um clique, adicione todos os ingredientes frescos disponíveis ao seu carrinho!
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar receita ou ingrediente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Main Two-Column Layout: Recipe List & Recipe Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Recipe Selector Cards */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-2">
            Cardápio de Receitas ({filteredRecipes.length})
          </h3>

          <div className="space-y-3 max-h-[800px] overflow-y-auto pr-1">
            {filteredRecipes.map((recipe) => {
              const isActive = activeRecipe?.id === recipe.id;
              const availableCount = recipe.ingredients.filter(i => i.availableInStore).length;
              return (
                <div
                  key={recipe.id}
                  id={`recipe-item-${recipe.id}`}
                  onClick={() => setActiveRecipe(recipe)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3.5 items-center ${
                    isActive
                      ? 'bg-amber-50/70 border-amber-400 shadow-md ring-1 ring-amber-300'
                      : 'bg-white border-stone-200 hover:border-amber-300 hover:bg-stone-50/50 shadow-xs'
                  }`}
                >
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-20 h-20 rounded-xl object-cover shrink-0 shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        {recipe.category}
                      </span>
                      <span className="text-[11px] text-stone-500 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-stone-400" />
                        {recipe.prepTimeMinutes} min
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-stone-900 leading-snug line-clamp-2">
                      {recipe.title}
                    </h4>

                    <div className="mt-1.5 flex items-center justify-between text-xs text-stone-500">
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {availableCount} itens no marketplace
                      </span>
                      <span className="text-amber-700 font-bold text-[11px] flex items-center gap-0.5">
                        Ver preparo →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Full Recipe View & One-Click Shopping */}
        <div className="lg:col-span-7">
          {activeRecipe ? (
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden sticky top-24">
              {/* Recipe Hero Image */}
              <div className="relative h-64 sm:h-72 w-full bg-stone-100">
                <img
                  src={activeRecipe.image}
                  alt={activeRecipe.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/30 to-transparent" />
                
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-stone-900/70 backdrop-blur-md text-amber-300 text-xs font-bold shadow-xs">
                    {activeRecipe.category}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-stone-900/70 backdrop-blur-md text-white text-xs font-medium">
                    Dificuldade: {activeRecipe.difficulty}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h2 className="text-2xl sm:text-3xl font-black font-['Outfit',sans-serif] leading-tight">
                    {activeRecipe.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-200 mt-1 line-clamp-2">
                    {activeRecipe.subtitle}
                  </p>
                </div>
              </div>

              <div className="p-6 sm:p-7 space-y-6">
                {/* Meta stats */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="text-stone-500 block text-[10px] uppercase font-bold">Preparo</span>
                      <span className="font-bold text-stone-800">{activeRecipe.prepTimeMinutes} minutos</span>
                    </div>
                  </div>
                  <div className="h-7 w-px bg-stone-200" />
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="text-stone-500 block text-[10px] uppercase font-bold">Rendimento</span>
                      <span className="font-bold text-stone-800">{activeRecipe.servings} porções</span>
                    </div>
                  </div>
                  <div className="h-7 w-px bg-stone-200" />
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-rose-500" />
                    <div>
                      <span className="text-stone-500 block text-[10px] uppercase font-bold">Nutrição</span>
                      <span className="font-bold text-stone-800">100% Orgânico</span>
                    </div>
                  </div>
                </div>

                {/* Toledo Origin Story */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 text-xs text-emerald-900 leading-relaxed flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">Origem da Receita em Toledo:</span>
                    {activeRecipe.toledoOriginNote}
                  </div>
                </div>

                {/* INGREDIENTS WITH ONE-CLICK CART INTEGRATION */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-stone-900">
                        Ingredientes da Receita
                      </h3>
                      <p className="text-xs text-stone-500">
                        Produtos marcados em verde estão fresquinhos na vitrine de Toledo
                      </p>
                    </div>

                    {/* Instant Buy All Button */}
                    <button
                      id="buy-all-recipe-ingredients-btn"
                      onClick={() => handleBuyAllIngredients(activeRecipe)}
                      disabled={activeRecipeMarketplaceItems.length === 0}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer ${
                        addedBatchNotice === activeRecipe.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                      }`}
                    >
                      {addedBatchNotice === activeRecipe.id ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Ingredientes Adicionados!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          <span>Comprar Todos os {activeRecipeMarketplaceItems.length} Orgânicos</span>
                          <span className="opacity-80 font-black">
                            • R$ {totalRecipeItemsCost.toFixed(2).replace('.', ',')}
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* List of Ingredients */}
                  <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-stone-50/50">
                    {activeRecipe.ingredients.map((ing, idx) => {
                      const matchedProduct = ing.productId 
                        ? products.find(p => p.id === ing.productId) 
                        : null;

                      return (
                        <div key={idx} className="p-3 sm:p-3.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {ing.availableInStore ? (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Disponível no Marketplace" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-stone-300 shrink-0" title="Item de despensa" />
                            )}
                            <div>
                              <span className="font-bold text-stone-900">{ing.name}</span>
                              <span className="text-stone-500 ml-1.5 font-medium">({ing.quantity})</span>
                              {matchedProduct && (
                                <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                                  🌱 {matchedProduct.producer.farmName} ({matchedProduct.producer.district.split(',')[0]})
                                </p>
                              )}
                            </div>
                          </div>

                          {matchedProduct ? (
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-extrabold text-emerald-900 text-xs sm:text-sm">
                                R$ {matchedProduct.price.toFixed(2).replace('.', ',')}
                              </span>
                              <button
                                onClick={() => onAddProductToCart(matchedProduct, 1)}
                                className="px-2.5 py-1.5 rounded-lg bg-white border border-emerald-300 hover:bg-emerald-600 hover:text-white text-emerald-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                title="Adicionar item individual"
                              >
                                <ShoppingCart className="w-3 h-3" />
                                <span className="hidden xs:inline">Adicionar</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-stone-400 italic">Despensa básica</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-3">
                  <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                    <span>Modo de Preparo Passo a Passo</span>
                  </h3>
                  <ol className="space-y-2.5">
                    {activeRecipe.instructions.map((step, idx) => (
                      <li key={idx} className="flex gap-3 text-xs sm:text-sm text-stone-700 leading-relaxed">
                        <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="flex-1">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Chef Tip */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-stone-800 flex items-start gap-3">
                  <ChefHat className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900 block mb-0.5">Dica do Chef & Produtor:</span>
                    <p className="text-stone-700 italic">{activeRecipe.chefTip}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-stone-200">
              <p className="text-stone-500">Selecione uma receita ao lado para ver os detalhes e modo de preparo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
