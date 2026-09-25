import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  User as UserIcon, 
  Mail, 
  KeyRound, 
  CheckCircle2, 
  ArrowRight,
  Sprout,
  FileCheck,
  Check,
  Info,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { AppUser, UserRole } from '../types';
import { TOLEDO_DISTRICTS } from '../data/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  onLogin: (user: AppUser) => void;
  onLogout: () => void;
  onOpenSecurityGuide?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  onOpenSecurityGuide,
}) => {
  const [authMode, setAuthMode] = React.useState<'login' | 'register'>('login');
  const [role, setRole] = React.useState<UserRole>('consumer');
  
  // Form fields
  const [email, setEmail] = React.useState('lucas.toledo@agrohero.com.br');
  const [password, setPassword] = React.useState('SenhaForte@2026');
  const [showPassword, setShowPassword] = React.useState(false);
  const [name, setName] = React.useState('Lucas Silva');
  
  // Producer-specific registration fields
  const [farmName, setFarmName] = React.useState('Sítio Boa Esperança');
  const [selectedDistrict, setSelectedDistrict] = React.useState(TOLEDO_DISTRICTS[0]);
  const [dapNumber, setDapNumber] = React.useState('DAP-PR-45920-A');
  const [lgpdConsent, setLgpdConsent] = React.useState(true);
  const [registerSuccess, setRegisterSuccess] = React.useState(false);

  if (!isOpen) return null;

  // Password strength logic
  const calculatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score += 25;
    if (/[A-Z]/.test(pwd)) score += 25;
    if (/[0-9]/.test(pwd)) score += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 25;
    return score;
  };

  const passwordStrength = calculatePasswordStrength(password);

  const handleQuickLogin = (selectedRole: UserRole) => {
    if (selectedRole === 'consumer') {
      onLogin({
        id: 'user-consumer',
        name: 'Maria Helena Fontana',
        email: 'maria.fontana@toledo.pr.gov.br',
        role: 'consumer',
        location: 'Jardim La Salle, Toledo - PR',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      });
    } else if (selectedRole === 'farmer') {
      onLogin({
        id: 'user-farmer',
        name: 'Seu Ademir Weber',
        email: 'ademir.weber@agrohero.com.br',
        role: 'farmer',
        farmName: 'Sítio Terra Viva (Linha Mandarina, Novo Sarandi)',
        location: 'Novo Sarandi, Toledo - PR',
        avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80',
      });
    } else {
      onLogin({
        id: 'user-admin',
        name: 'Coordenação COOPATERRA',
        email: 'gestao@coopaterra-toledo.org.br',
        role: 'admin',
        location: 'Centro, Toledo - PR',
        avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80',
      });
    }
    onClose();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'register' && !lgpdConsent) {
      alert('É necessário concordar com os termos de privacidade e proteção de dados (LGPD) para prosseguir.');
      return;
    }

    if (authMode === 'register') {
      setRegisterSuccess(true);
      setTimeout(() => {
        setRegisterSuccess(false);
        onLogin({
          id: `user-${Date.now()}`,
          name: name || 'Usuário Agro Hero',
          email,
          role,
          farmName: role === 'farmer' ? farmName : undefined,
          location: role === 'farmer' ? `${selectedDistrict}, Toledo - PR` : 'Toledo - PR',
          avatar: role === 'farmer'
            ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80'
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        });
        onClose();
      }, 1000);
    } else {
      onLogin({
        id: `user-${Date.now()}`,
        name: name || 'Usuário Agro Hero',
        email,
        role,
        farmName: role === 'farmer' ? farmName : undefined,
        location: role === 'farmer' ? `${selectedDistrict}, Toledo - PR` : 'Toledo - PR',
        avatar: role === 'farmer'
          ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden relative my-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="bg-stone-900 text-white p-6 text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mx-auto mb-2 text-white shadow-md">
            <Sprout className="w-7 h-7 text-emerald-100" />
          </div>
          <h3 className="text-xl font-black font-['Outfit',sans-serif]">
            Agro Hero Toledo
          </h3>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full mt-1 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Autenticação Segura & Proteção de Dados LGPD</span>
          </div>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {currentUser ? (
            /* Logged in state */
            <div className="text-center space-y-4 py-2">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-20 h-20 rounded-full mx-auto object-cover ring-4 ring-emerald-500/20 shadow-md"
              />
              <div>
                <h4 className="text-lg font-bold text-stone-900">{currentUser.name}</h4>
                <p className="text-xs text-stone-500">{currentUser.email}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  <span>Perfil:</span>
                  <span className="uppercase">
                    {currentUser.role === 'farmer' ? 'Produtor Rural Agro Hero' : currentUser.role === 'admin' ? 'Gestor Cooperativa' : 'Consumidor'}
                  </span>
                </div>
                {currentUser.farmName && (
                  <p className="text-xs text-emerald-800 font-semibold mt-1">
                    🏡 {currentUser.farmName} ({currentUser.location})
                  </p>
                )}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-bold text-xs cursor-pointer"
                >
                  Sair da Conta
                </button>
                {onOpenSecurityGuide && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSecurityGuide();
                    }}
                    className="text-xs text-emerald-700 font-bold hover:underline flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Ver Auditoria de Segurança & LGPD</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Mode Selector: Login vs Cadastro Seguro */
            <>
              {/* Tab Selector */}
              <div className="flex rounded-xl bg-stone-100 p-1 border border-stone-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-white text-emerald-950 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Entrar na Conta
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    authMode === 'register'
                      ? 'bg-white text-emerald-950 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cadastrar Usuário / Produtor</span>
                </button>
              </div>

              {/* Quick Persona Switcher */}
              {authMode === 'login' && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 block">
                      Acesso Rápido de Teste (1-Clique):
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold">Auth0 Mock</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleQuickLogin('consumer')}
                      className="p-2 bg-white rounded-xl border border-emerald-200 hover:border-emerald-500 text-left text-xs text-stone-800 font-medium transition-all shadow-2xs cursor-pointer"
                    >
                      <span className="font-bold block text-emerald-950">Consumidor(a)</span>
                      <span className="text-[10px] text-stone-500">Maria Helena (Jd. La Salle)</span>
                    </button>
                    <button
                      onClick={() => handleQuickLogin('farmer')}
                      className="p-2 bg-white rounded-xl border border-emerald-200 hover:border-emerald-500 text-left text-xs text-stone-800 font-medium transition-all shadow-2xs cursor-pointer"
                    >
                      <span className="font-bold block text-emerald-950">Produtor Familiar</span>
                      <span className="text-[10px] text-stone-500">Seu Ademir (Novo Sarandi)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Form for Login or Registration */}
              <form onSubmit={handleFormSubmit} className="space-y-3.5">
                {/* Role selection for registration */}
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Tipo de Cadastro em Toledo
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('consumer')}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-left ${
                          role === 'consumer'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500'
                            : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <span className="block font-bold">Consumidor(a)</span>
                        <span className="text-[10px] text-stone-500 font-normal">
                          Comprar orgânicos frescos
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole('farmer')}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-left ${
                          role === 'farmer'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500'
                            : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <span className="block font-bold">Agricultor(a) Familiar</span>
                        <span className="text-[10px] text-stone-500 font-normal">
                          Vender colheita de Toledo
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Name */}
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Nome Completo
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: João Silveira"
                        className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* Farmer extra fields */}
                {authMode === 'register' && role === 'farmer' && (
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                    <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                      Dados da Propriedade Rural em Toledo
                    </span>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Nome do Sítio ou Chácara
                      </label>
                      <input
                        type="text"
                        required
                        value={farmName}
                        onChange={(e) => setFarmName(e.target.value)}
                        placeholder="Ex: Sítio Terra Viva"
                        className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Distrito em Toledo
                        </label>
                        <select
                          value={selectedDistrict}
                          onChange={(e) => setSelectedDistrict(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-900"
                        >
                          {TOLEDO_DISTRICTS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Registro DAP ou CAF
                        </label>
                        <input
                          type="text"
                          required
                          value={dapNumber}
                          onChange={(e) => setDapNumber(e.target.value)}
                          placeholder="DAP / CAF válido"
                          className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Password with Strength Indicator */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-stone-700">
                      Senha
                    </label>
                    {authMode === 'register' && (
                      <span className={`text-[10px] font-bold ${
                        passwordStrength <= 25 ? 'text-rose-600' :
                        passwordStrength <= 50 ? 'text-amber-600' :
                        passwordStrength <= 75 ? 'text-blue-600' : 'text-emerald-700'
                      }`}>
                        {passwordStrength <= 25 ? 'Fraca' :
                         passwordStrength <= 50 ? 'Razoável' :
                         passwordStrength <= 75 ? 'Boa' : 'Excelente (Criptografia Forte)'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength bar */}
                  {authMode === 'register' && (
                    <div className="w-full bg-stone-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength <= 25 ? 'bg-rose-500 w-1/4' :
                          passwordStrength <= 50 ? 'bg-amber-500 w-2/4' :
                          passwordStrength <= 75 ? 'bg-blue-500 w-3/4' : 'bg-emerald-600 w-full'
                        }`}
                      />
                    </div>
                  )}
                </div>

                {/* LGPD Consent for registration */}
                {authMode === 'register' && (
                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lgpdConsent}
                      onChange={(e) => setLgpdConsent(e.target.checked)}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500 rounded"
                    />
                    <span className="text-[11px] text-stone-600 leading-tight">
                      Concordo com a <strong>Política de Privacidade e Proteção de Dados (LGPD)</strong>. Meus dados serão usados exclusivamente para viabilizar as entregas de alimentos em Toledo.
                    </span>
                  </label>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {registerSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-200" />
                      <span>Conta Criada com Criptografia!</span>
                    </>
                  ) : authMode === 'register' ? (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Cadastrar com Proteção LGPD</span>
                    </>
                  ) : (
                    <>
                      <span>Entrar com Auth0</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Security link */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenSecurityGuide) onOpenSecurityGuide();
                    }}
                    className="text-[11px] text-stone-500 hover:text-emerald-700 inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Como o cadastro de usuários e produtores é protegido? Clique para ver.</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
