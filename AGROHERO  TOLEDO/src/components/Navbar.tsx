import React from 'react';
import { 
  Sprout, 
  ShoppingCart, 
  BookOpen, 
  HeartHandshake, 
  LayoutDashboard, 
  User as UserIcon, 
  MapPin, 
  Menu, 
  X,
  Info,
  ShieldCheck,
  Rocket
} from 'lucide-react';
import { AppUser } from '../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  currentUser: AppUser | null;
  onOpenAuth: () => void;
  onOpenAbout: () => void;
  onOpenSecurity?: () => void;
  onOpenDeployGuide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  cartCount,
  onOpenCart,
  currentUser,
  onOpenAuth,
  onOpenAbout,
  onOpenSecurity,
  onOpenDeployGuide,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'marketplace', label: 'Marketplace Orgânico', icon: Sprout },
    { id: 'receitas', label: 'Receitas da Região', icon: BookOpen },
    { id: 'feedbacks', label: 'Depoimentos dos Usuários', icon: HeartHandshake, badge: 'Histórias' },
    { id: 'produtor', label: 'Painel do Produtor', icon: LayoutDashboard },
  ];

  const handleTabClick = (id: string) => {
    onSelectTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      {/* Top micro-bar highlighting Toledo - PR */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium truncate">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">
              Agro Hero Toledo - PR • Conectando agricultores familiares e consumidores com orgânicos colhidos na hora
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 shrink-0 text-emerald-200 text-xs">
            {onOpenSecurity && (
              <button 
                onClick={onOpenSecurity} 
                className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                title="Ver status de segurança do cadastro"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Cadastro Seguro & LGPD</span>
              </button>
            )}
            {onOpenDeployGuide && (
              <button 
                onClick={onOpenDeployGuide} 
                className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                title="Configuração de deploy Vercel + Render"
              >
                <Rocket className="w-3 h-3 text-amber-400" />
                <span>Deploy Vercel & Render</span>
              </button>
            )}
            <button 
              onClick={onOpenAbout} 
              className="hover:text-white underline cursor-pointer transition-colors"
            >
              Sobre a Iniciativa
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <div 
            onClick={() => handleTabClick('marketplace')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 flex items-center justify-center text-white shadow-md shadow-emerald-900/10 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-stone-900 font-['Outfit',sans-serif]">
                  Agro Hero
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300/60">
                  Toledo - PR
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium hidden xs:block">
                Alimentos Orgânicos • Agricultura Familiar
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => handleTabClick(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'text-emerald-800 bg-emerald-50 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Deploy guide quick trigger */}
            {onOpenDeployGuide && (
              <button
                onClick={onOpenDeployGuide}
                title="Configuração de deploy Vercel e Render"
                className="p-2 text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer hidden md:flex items-center gap-1 text-xs font-bold border border-stone-200"
              >
                <Rocket className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden xl:inline">Deploy Vercel/Render</span>
              </button>
            )}

            {/* Auth Button */}
            <button
              id="auth-user-button"
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-stone-700 transition-colors cursor-pointer"
            >
              {currentUser?.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-emerald-500" 
                />
              ) : (
                <UserIcon className="w-4 h-4 text-emerald-700" />
              )}
              <span className="max-w-[100px] sm:max-w-[140px] truncate font-medium">
                {currentUser ? currentUser.name.split(' ')[0] : 'Entrar / Cadastrar'}
              </span>
              {currentUser && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 uppercase hidden sm:inline-block">
                  {currentUser.role === 'farmer' ? 'Produtor' : currentUser.role === 'admin' ? 'Admin' : 'Consumidor'}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              id="cart-button"
              onClick={onOpenCart}
              className="relative flex items-center justify-center p-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-transform active:scale-95 shadow-sm shadow-emerald-800/20 cursor-pointer"
              aria-label="Ver carrinho de compras"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-amber-500 text-white text-[11px] font-black rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 lg:hidden cursor-pointer"
              aria-label="Menu principal"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-5 space-y-1 shadow-xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'text-emerald-800 bg-emerald-50'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          
          <div className="pt-2 border-t border-stone-100 space-y-1">
            {onOpenSecurity && (
              <button
                onClick={() => {
                  onOpenSecurity();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-stone-700 hover:bg-stone-50 rounded-lg text-sm font-medium"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Auditoria de Segurança & LGPD</span>
              </button>
            )}

            {onOpenDeployGuide && (
              <button
                onClick={() => {
                  onOpenDeployGuide();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-stone-700 hover:bg-stone-50 rounded-lg text-sm font-medium"
              >
                <Rocket className="w-4 h-4 text-amber-600" />
                <span>Deploy Vercel (Frontend) & Render (Backend)</span>
              </button>
            )}

            <button
              onClick={() => {
                onOpenAbout();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-stone-600 hover:bg-stone-50 rounded-lg text-sm font-medium"
            >
              <Info className="w-4 h-4 text-emerald-600" />
              <span>Sobre a Iniciativa Agro Hero</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
