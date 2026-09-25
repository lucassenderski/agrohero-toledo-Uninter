import React from 'react';
import { 
  X, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  Plus, 
  Minus, 
  ChefHat, 
  UserCheck, 
  Heart,
  Calendar
} from 'lucide-react';
import { Product, Recipe } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  recipes: Recipe[];
  onSelectRecipe: (recipeId: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  recipes,
  onSelectRecipe,
}) => {
  const [quantity, setQuantity] = React.useState(1);
  const [liked, setLiked] = React.useState(false);

  if (!product) return null;

  // Find recipes using this product
  const matchingRecipes = recipes.filter(r => 
    r.ingredients.some(ing => ing.productId === product.id)
  );

  const handleAdd = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-stone-700 shadow-md backdrop-blur-xs transition-colors cursor-pointer"
          aria-label="Fechar detalhes"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image Column */}
          <div className="relative h-64 md:h-full min-h-[300px] bg-stone-100">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-transparent to-transparent md:hidden" />
            
            {/* Cert badge overlaid */}
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/90 backdrop-blur-md text-white text-xs font-bold shadow-md">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                {product.organicCert}
              </span>
            </div>

            {/* Freshness tag */}
            <div className="absolute bottom-4 left-4 right-4 text-white md:hidden">
              <span className="text-xs bg-stone-900/60 backdrop-blur-xs px-2.5 py-1 rounded-md font-medium inline-flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                {product.harvestDate}
              </span>
            </div>
          </div>

          {/* Product Info Column */}
          <div className="p-6 sm:p-7 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
            <div>
              {/* Category & Freshness for desktop */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  {product.category.replace('_', ' ')}
                </span>
                <span className="text-xs text-stone-500 font-medium hidden md:inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  {product.harvestDate}
                </span>
              </div>

              <h2 className="text-2xl font-black text-stone-900 font-['Outfit',sans-serif] leading-tight">
                {product.name}
              </h2>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-800">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-sm font-semibold text-stone-500">
                  / {product.unit}
                </span>
              </div>

              <p className="mt-3 text-sm text-stone-600 leading-relaxed">
                {product.description}
              </p>

              {/* Producer Card */}
              <div className="mt-4 p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                <div className="flex items-center gap-3">
                  <img 
                    src={product.producer.avatar} 
                    alt={product.producer.name} 
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                        Produtor Local de Toledo
                      </span>
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <h4 className="text-sm font-bold text-stone-900 truncate">
                      {product.producer.name}
                    </h4>
                    <p className="text-xs text-stone-600 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                      <span className="font-semibold text-stone-800">{product.producer.farmName}</span>
                      <span className="text-stone-400">•</span>
                      <span className="truncate">{product.producer.district}</span>
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-stone-600 italic border-t border-stone-200/60 pt-2">
                  "{product.producer.bio}"
                </p>
              </div>

              {/* Nutritional Highlights */}
              <div className="mt-4">
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Benefícios Nutricionais & Agroecológicos
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {product.nutritionalBenefits.map((b, i) => (
                    <span 
                      key={i} 
                      className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70"
                    >
                      ✓ {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recipes featuring this ingredient */}
              {matchingRecipes.length > 0 && (
                <div className="mt-4 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <ChefHat className="w-3.5 h-3.5 text-amber-600" />
                    Receitas de Toledo com este Ingrediente
                  </h4>
                  <div className="space-y-1.5">
                    {matchingRecipes.map(r => (
                      <button
                        key={r.id}
                        onClick={() => {
                          onClose();
                          onSelectRecipe(r.id);
                        }}
                        className="w-full text-left p-2 rounded-lg bg-white hover:bg-amber-100/60 text-xs text-stone-800 font-medium transition-colors flex items-center justify-between border border-amber-200/60 cursor-pointer"
                      >
                        <span className="truncate font-semibold">{r.title}</span>
                        <span className="text-[11px] font-bold text-amber-700 shrink-0 ml-2">Ver receita →</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity and Add to Cart Button */}
            <div className="mt-6 pt-4 border-t border-stone-200 flex items-center gap-3">
              <div className="flex items-center border border-stone-300 rounded-xl bg-stone-50 overflow-hidden shrink-0">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 transition-colors cursor-pointer"
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-9 text-center font-bold text-stone-800 text-sm">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 transition-colors cursor-pointer"
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                id="modal-add-to-cart-btn"
                onClick={handleAdd}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-900/20 transition-transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Adicionar ao Carrinho</span>
                <span className="text-emerald-200">•</span>
                <span>R$ {(product.price * quantity).toFixed(2).replace('.', ',')}</span>
              </button>

              <button
                onClick={() => setLiked(!liked)}
                className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                  liked 
                    ? 'border-rose-300 bg-rose-50 text-rose-600' 
                    : 'border-stone-200 text-stone-400 hover:text-rose-500 hover:bg-rose-50/50'
                }`}
                title="Favoritar produto"
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
