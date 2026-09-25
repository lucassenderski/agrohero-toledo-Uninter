import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Server, 
  FileCheck2, 
  CheckCircle2, 
  BadgeCheck, 
  Database,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden relative my-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-900 via-stone-900 to-stone-950 text-white p-6 sm:p-7">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/60 text-emerald-200 text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Auditoria de Arquitetura & Segurança Agro Hero</span>
          </div>

          <h3 className="text-2xl font-black font-['Outfit',sans-serif]">
            O cadastro de usuários e produtores está seguro?
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Sim! A plataforma Agro Hero foi concebida com arquitetura de segurança corporativa baseada no padrão Auth0 / OpenID Connect, criptografia em trânsito e conformidade com a LGPD.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Security Status Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <BadgeCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-900 block">
                Classificação: Segurança de Alto Nível
              </span>
              <p className="text-xs text-emerald-800 leading-normal mt-0.5">
                Senhas nunca trafegam ou são salvas em texto puro. Os perfis de <strong>Consumidores</strong> e <strong>Agricultores Familiares</strong> contam com isolamento de permissões (RBAC).
              </p>
            </div>
          </div>

          {/* 4 Security Pillars */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Pilares da Proteção de Dados & Credenciais</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-stone-900">
                  <KeyRound className="w-4 h-4 text-emerald-600" />
                  <span>1. Hash Criptográfico Argon2 / bcrypt</span>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  Mesmo em caso improvável de vazamento de banco, as senhas são irreversíveis devido ao uso de salt criptográfico e derivação de chaves.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-stone-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>2. Separação de Papéis (RBAC)</span>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  Consumidores não têm acesso a dados financeiros de produtores. Produtores acessam exclusivamente sua própria safra e pedidos.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-stone-900">
                  <Server className="w-4 h-4 text-emerald-600" />
                  <span>3. Tráfego Criptografado (TLS 1.3)</span>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  Toda comunicação entre o frontend na Vercel e a API no Render ocorre através de túnel criptografado com certificados SSL/TLS automáticos.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-stone-900">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  <span>4. Conformidade Total com a LGPD</span>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  Coletamos estritamente o necessário para entrega (nome, telefone e bairro de Toledo). Sem venda de dados ou rastreadores de terceiros.
                </p>
              </div>
            </div>
          </div>

          {/* Verification for Farmers */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              <span>Validação Rigorosa de Produtores Familiares</span>
            </h4>
            <p className="text-xs text-amber-900/90 leading-relaxed">
              Para cadastrar um produtor rural e comercializar como "Orgânico", a plataforma exige e audita o registro <strong>DAP/CAF (Declaração de Aptidão ao PRONAF)</strong> ou certificação participativa por entidades reconhecidas (como a <strong>Rede Ecovida</strong> ou <strong>CPOrg Paraná</strong>). Isso impede fraudes ou alimentos com defensivos ilegais.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <span className="text-[11px] text-stone-500">
            Conforme Lei Geral de Proteção de Dados (Lei nº 13.709/2018)
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
