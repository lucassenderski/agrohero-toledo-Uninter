import React from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { MarketplaceView } from './components/MarketplaceView';
import { RecipesView } from './components/RecipesView';
import { TestimonialsView } from './components/TestimonialsView';
import { ProducerDashboardView } from './components/ProducerDashboardView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartAndCheckoutModal } from './components/CartAndCheckoutModal';
import { AuthModal } from './components/AuthModal';
import { AboutModal } from './components/AboutModal';
import { SecurityModal } from './components/SecurityModal';
import { DeployGuideModal } from './components/DeployGuideModal';
import { api } from './api';
import { useAppAuth } from './auth/AuthProvider';

import { 
  INITIAL_PRODUCTS, 
  RECIPES, 
  INITIAL_TESTIMONIALS 
} from './data/mockData';
import { 
  Product, 
  Recipe, 
  Testimonial, 
  CartItem, 
  Order, 
  OrderStatus, 
  AppUser 
} from './types';

const tabPaths: Record<string, string> = {
  marketplace: '/',
  receitas: '/receitas',
  feedbacks: '/depoimentos',
  produtor: '/produtor',
};

const pathTabs: Record<string, string> = {
  '/': 'marketplace',
  '/receitas': 'receitas',
  '/depoimentos': 'feedbacks',
  '/produtor': 'produtor',
};

function AppShell() {
  const appAuth = useAppAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const currentTab = pathTabs[location.pathname] || 'marketplace';
  const [targetRecipeId, setTargetRecipeId] = React.useState<string | null>(null);

  // Core Data States
  const [products, setProducts] = React.useState<Product[]>(() => {
    const saved = localStorage.getItem('agrohero_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  React.useEffect(() => {
    api.products()
      .then(({ products: remoteProducts }) => setProducts(remoteProducts))
      .catch(() => undefined);
  }, []);

  const [recipes] = React.useState<Recipe[]>(RECIPES);

  const [testimonials, setTestimonials] = React.useState<Testimonial[]>(() => {
    const saved = localStorage.getItem('agrohero_testimonials');
    return saved ? JSON.parse(saved) : INITIAL_TESTIMONIALS;
  });

  const [cartItems, setCartItems] = React.useState<CartItem[]>(() => {
    const saved = localStorage.getItem('agrohero_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = React.useState<Order[]>(() => {
    const saved = localStorage.getItem('agrohero_orders');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'ord-8102',
        createdAt: 'Hoje às 08:30',
        customerName: 'Fernanda Becker',
        customerPhone: '(45) 99877-1234',
        customerAddress: 'Rua Almirante Barroso, 850',
        deliveryMethod: 'delivery',
        neighborhood: 'Centro',
        paymentMethod: 'pix',
        items: [
          { product: INITIAL_PRODUCTS[0], quantity: 2 },
          { product: INITIAL_PRODUCTS[1], quantity: 3 },
          { product: INITIAL_PRODUCTS[5], quantity: 1 },
        ],
        totalAmount: 52.30,
        deliveryFee: 8.00,
        status: 'colheita',
      },
      {
        id: 'ord-8101',
        createdAt: 'Ontem às 17:40',
        customerName: 'Carlos Eduardo Santos',
        customerPhone: '(45) 99920-3344',
        customerAddress: 'Ponto Ecológico Lago',
        deliveryMethod: 'pickup',
        neighborhood: 'Jardim La Salle',
        pickupLocation: 'Ponto Verde - Parque Ecológico Diva Paim Barth (Lago Municipal)',
        paymentMethod: 'pix',
        items: [
          { product: INITIAL_PRODUCTS[2], quantity: 2 },
          { product: INITIAL_PRODUCTS[3], quantity: 1 },
        ],
        totalAmount: 28.10,
        deliveryFee: 0,
        status: 'em_rota',
      },
      {
        id: 'ord-8099',
        createdAt: '18 de Setembro',
        customerName: 'Restaurante Terra & Sabor (Chef Juliano)',
        customerPhone: '(45) 99801-9090',
        customerAddress: 'Rua Santos Dumont, 2100',
        deliveryMethod: 'delivery',
        neighborhood: 'Centro',
        paymentMethod: 'credit_card',
        items: [
          { product: INITIAL_PRODUCTS[2], quantity: 10 },
          { product: INITIAL_PRODUCTS[4], quantity: 6 },
        ],
        totalAmount: 141.20,
        deliveryFee: 8.00,
        status: 'entregue',
      },
    ];
  });

  // Current User Session
  const [currentUser, setCurrentUser] = React.useState<AppUser | null>(null);

  // Modals
  const [selectedProductForModal, setSelectedProductForModal] = React.useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = React.useState(location.pathname === '/carrinho');
  const [isAuthOpen, setIsAuthOpen] = React.useState(location.pathname === '/login');
  const [isAboutOpen, setIsAboutOpen] = React.useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = React.useState(false);
  const [isDeployGuideModalOpen, setIsDeployGuideModalOpen] = React.useState(false);

  React.useEffect(() => {
    api.health().catch(() => undefined);
  }, []);

  React.useEffect(() => {
    setIsCartOpen(location.pathname === '/carrinho');
    setIsAuthOpen(location.pathname === '/login');
    if (productId) {
      const product = products.find((item) => item.id === productId);
      setSelectedProductForModal(product || null);
    } else {
      setSelectedProductForModal(null);
    }
  }, [location.pathname, productId, products]);

  React.useEffect(() => {
    const canManage = currentUser?.role === 'farmer' || currentUser?.role === 'admin';
    if (location.pathname === '/produtor' && !canManage) {
      navigate('/login', { replace: true });
    }
  }, [currentUser, location.pathname, navigate]);

  React.useEffect(() => {
    if (location.pathname !== '/produtor' || !appAuth.configured || !appAuth.isAuthenticated) return;
    void appAuth.getAccessToken()
      .then((token) => token ? api.orders(token) : null)
      .then((response) => {
        if (response?.orders) setOrders(response.orders);
      })
      .catch(() => undefined);
  }, [appAuth, location.pathname]);

  const navigateToTab = (tab: string) => {
    navigate(tabPaths[tab] || '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openProduct = (product: Product) => {
    setSelectedProductForModal(product);
    navigate(`/produto/${product.id}`);
  };

  const closeProduct = () => {
    setSelectedProductForModal(null);
    navigate('/');
  };

  // Sync with LocalStorage
  React.useEffect(() => {
    localStorage.setItem('agrohero_products', JSON.stringify(products));
  }, [products]);

  React.useEffect(() => {
    localStorage.setItem('agrohero_testimonials', JSON.stringify(testimonials));
  }, [testimonials]);

  React.useEffect(() => {
    localStorage.setItem('agrohero_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  React.useEffect(() => {
    localStorage.setItem('agrohero_orders', JSON.stringify(orders));
  }, [orders]);

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleOrderCompleted = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  const handleStartCheckout = async (items: CartItem[]) => {
    if (!appAuth.configured || !appAuth.isAuthenticated) return false;
    const token = await appAuth.getAccessToken();
    if (!token) return false;
    const { checkoutUrl } = await api.checkout(items, token);
    if (!checkoutUrl) return false;
    window.location.assign(checkoutUrl);
    return true;
  };

  const handleLogin = async (user: AppUser) => {
    try {
      await api.verifyUser(user);
    } catch {
      // The local demo flow remains usable when the API is not running.
    }
    setCurrentUser(user);
  };

  // Product CRUD for Producer Dashboard
  const handleAddProduct = (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    if (appAuth.configured && appAuth.isAuthenticated) {
      try {
        const token = await appAuth.getAccessToken();
        if (token) await api.updateOrderStatus(orderId, status, token);
      } catch {
        return;
      }
    }
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  // Testimonials operations
  const handleAddTestimonial = (newTestimonial: Testimonial) => {
    setTestimonials((prev) => [newTestimonial, ...prev]);
  };

  const handleLikeTestimonial = (id: string) => {
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, likesCount: t.likesCount + 1 } : t))
    );
  };

  // Navigation helpers
  const handleNavigateToRecipeWithHighlight = (recipeId: string) => {
    setTargetRecipeId(recipeId);
    navigateToTab('receitas');
  };

  const handleSelectRecipeFromProduct = (recipeId: string) => {
    setSelectedProductForModal(null);
    handleNavigateToRecipeWithHighlight(recipeId);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 flex flex-col font-['Outfit',sans-serif]">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={navigateToTab}
        cartCount={totalCartCount}
        onOpenCart={() => navigate('/carrinho')}
        currentUser={currentUser}
        onOpenAuth={() => navigate('/login')}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenSecurity={() => setIsSecurityModalOpen(true)}
        onOpenDeployGuide={() => setIsDeployGuideModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'marketplace' && (
          <MarketplaceView
            products={products}
            onSelectProduct={openProduct}
            onAddToCart={handleAddToCart}
            onNavigateToRecipes={() => {
              navigateToTab('receitas');
            }}
            onNavigateToTestimonials={() => {
              navigateToTab('feedbacks');
            }}
          />
        )}

        {currentTab === 'receitas' && (
          <RecipesView
            recipes={recipes}
            products={products}
            initialRecipeId={targetRecipeId}
            onAddProductToCart={handleAddToCart}
            onAddMultipleToCart={(items) => {
              items.forEach((item) => handleAddToCart(item.product, item.quantity));
            }}
            onSelectProduct={openProduct}
          />
        )}

        {currentTab === 'feedbacks' && (
          <TestimonialsView
            testimonials={testimonials}
            onAddTestimonial={handleAddTestimonial}
            onLikeTestimonial={handleLikeTestimonial}
          />
        )}

        {currentTab === 'produtor' && (
          <ProducerDashboardView
            products={products}
            orders={orders}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            currentUser={currentUser}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 pt-12 pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-white font-['Outfit',sans-serif]">
                  Agro Hero
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 border border-emerald-700">
                  Toledo - PR
                </span>
              </div>
              <p className="text-xs text-stone-400 max-w-md leading-relaxed">
                Agro Hero conecta agricultores familiares e consumidores de Toledo, Paraná: alimentando o futuro com tecnologia, práticas agroecológicas sustentáveis e comércio justo sem intermediários.
              </p>
              <div className="text-xs text-emerald-400 font-medium pt-1">
                📍 Distritos: Novo Sarandi • Concórdia do Oeste • Dez de Maio • Vila Nova • Dois Irmãos
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Navegação</h4>
              <ul className="text-xs space-y-2 text-stone-400">
                <li>
                  <button onClick={() => navigateToTab('marketplace')} className="hover:text-emerald-400 cursor-pointer">
                    Marketplace de Orgânicos
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateToTab('receitas')} className="hover:text-emerald-400 cursor-pointer">
                    Receitas da Região
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateToTab('feedbacks')} className="hover:text-emerald-400 cursor-pointer">
                    Depoimentos dos Usuários
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateToTab('produtor')} className="hover:text-emerald-400 cursor-pointer">
                    Painel do Agricultor Familiar
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Segurança & Deploy</h4>
              <ul className="text-xs space-y-1.5 text-stone-400">
                <li>
                  <button 
                    onClick={() => setIsSecurityModalOpen(true)}
                    className="hover:text-emerald-400 cursor-pointer flex items-center gap-1.5 text-stone-300"
                  >
                    <span>🛡️ Cadastro Seguro & LGPD</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setIsDeployGuideModalOpen(true)}
                    className="hover:text-amber-400 cursor-pointer flex items-center gap-1.5 text-stone-300"
                  >
                    <span>🚀 Deploy Vercel (Front) + Render (Back)</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setIsAboutOpen(true)}
                    className="hover:text-emerald-400 cursor-pointer flex items-center gap-1.5 text-stone-300"
                  >
                    <span>ℹ️ Sobre a Iniciativa Toledo</span>
                  </button>
                </li>
                <li className="pt-2 text-[11px] text-emerald-400 font-semibold">
                  ⚡ Pagamento facilitado via PIX & Cartão
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-stone-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
            <p>© 2026 Agro Hero - Alimentos Orgânicos e Agricultura Familiar de Toledo - PR. Todos os direitos reservados.</p>
            <p className="flex items-center gap-2">
              <span>Tecnologia a serviço de quem alimenta o Brasil 🌱</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ProductDetailModal
        product={selectedProductForModal}
        onClose={closeProduct}
        onAddToCart={handleAddToCart}
        recipes={recipes}
        onSelectRecipe={handleSelectRecipeFromProduct}
      />

      <CartAndCheckoutModal
        isOpen={isCartOpen}
        onClose={() => {
          setIsCartOpen(false);
          navigate('/');
        }}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onOrderCompleted={handleOrderCompleted}
        onStartCheckout={handleStartCheckout}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          navigate('/');
        }}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={() => setCurrentUser(null)}
        onOpenSecurityGuide={() => setIsSecurityModalOpen(true)}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />

      <DeployGuideModal
        isOpen={isDeployGuideModalOpen}
        onClose={() => setIsDeployGuideModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />} />
      <Route path="/receitas" element={<AppShell />} />
      <Route path="/depoimentos" element={<AppShell />} />
      <Route path="/produtor" element={<AppShell />} />
      <Route path="/produto/:productId" element={<AppShell />} />
      <Route path="/carrinho" element={<AppShell />} />
      <Route path="/login" element={<AppShell />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
