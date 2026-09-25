import React from 'react';
import { 
  X, 
  Rocket, 
  Server, 
  Globe, 
  Check, 
  Copy, 
  ExternalLink, 
  Database, 
  Terminal, 
  ShieldCheck 
} from 'lucide-react';

interface DeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeployGuideModal: React.FC<DeployGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'vercel' | 'render'>('overview');
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const vercelConfigJson = `{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}`;

  const renderConfigYaml = `services:
  - type: web
    name: agro-hero-api
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm run start:server
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000

databases:
  - name: agro-hero-db
    plan: free
    databaseName: agro_hero`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden relative my-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="bg-stone-900 text-white p-6 sm:p-7">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/80 text-white text-xs font-bold mb-2">
            <Rocket className="w-3.5 h-3.5" />
            <span>Infraestrutura Desacoplada de Produção</span>
          </div>

          <h3 className="text-2xl font-black font-['Outfit',sans-serif]">
            Deploy Agro Hero: Vercel (Frontend) & Render (Backend)
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-stone-300">
            A arquitetura recomendada e pré-configurada para alta performance, baixo custo e escalabilidade.
          </p>

          {/* Navigation Pills */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('vercel')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'vercel'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>1. Vercel (Frontend SPA)</span>
            </button>
            <button
              onClick={() => setActiveTab('render')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'render'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>2. Render (Backend + PostgreSQL)</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs">
                      ▲
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">Vercel: Frontend React 19</h4>
                      <p className="text-[11px] text-stone-500">Global CDN • SSL Automático • Zero Latência</p>
                    </div>
                  </div>
                  <ul className="text-xs text-stone-600 space-y-1 pl-1">
                    <li>✓ Configurado via arquivo <code>vercel.json</code> já na raiz</li>
                    <li>✓ Compilação via Vite em ~20 segundos</li>
                    <li>✓ Roteamento SPA automático sem erros de 404</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                      R
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">Render: Backend + Banco</h4>
                      <p className="text-[11px] text-stone-500">Node.js Express + PostgreSQL Gerenciado</p>
                    </div>
                  </div>
                  <ul className="text-xs text-stone-600 space-y-1 pl-1">
                    <li>✓ Configurado via <code>render.yaml</code> (Render Blueprints)</li>
                    <li>✓ Endpoints de saúde: <code>/api/health</code></li>
                    <li>✓ Banco PostgreSQL pronto para persistir pedidos</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 leading-relaxed">
                  <strong>Sim, é totalmente compatível e recomendável!</strong> Separar o frontend estático na Vercel e a API no Render permite que a loja Agro Hero suporte picos intensos de tráfego de Toledo sem onerar o servidor de banco de dados.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vercel' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <span>Passo a Passo para Hospedar na Vercel:</span>
              </h4>

              <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-stone-700 pl-1">
                <li>Abra sua conta na <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline">vercel.com</a>.</li>
                <li>Clique em <strong>Add New Project</strong> e selecione seu repositório GitHub do Agro Hero.</li>
                <li>O Vite será detectado automaticamente. Verifique os campos:
                  <ul className="list-disc list-inside ml-4 text-xs text-stone-600 mt-1 space-y-0.5">
                    <li><strong>Build Command:</strong> <code>npm run build</code></li>
                    <li><strong>Output Directory:</strong> <code>dist</code></li>
                  </ul>
                </li>
                <li>Adicione a variável de ambiente <code>VITE_API_URL</code> apontando para a sua API no Render.</li>
                <li>Clique em <strong>Deploy</strong>. Seu app estará online em <code>https://agro-hero.vercel.app</code>!</li>
              </ol>

              {/* Code preview */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>Arquivo já criado na raiz: <code>vercel.json</code></span>
                  <button
                    onClick={() => copyToClipboard(vercelConfigJson, 'vercel')}
                    className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCode === 'vercel' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'vercel' ? 'Copiado!' : 'Copiar vercel.json'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-stone-900 text-stone-200 text-xs rounded-xl font-mono overflow-x-auto">
                  {vercelConfigJson}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'render' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <span>Passo a Passo para Hospedar no Render:</span>
              </h4>

              <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-stone-700 pl-1">
                <li>Acesse o painel do <a href="https://render.com" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline">render.com</a>.</li>
                <li>Clique em <strong>New +</strong> e escolha a opção <strong>Blueprint</strong>.</li>
                <li>Conecte seu repositório. O Render lerá o arquivo <code>render.yaml</code> e criará a API + Banco PostgreSQL automaticamente.</li>
                <li>Ou se preferir criar manualmente:
                  <ul className="list-disc list-inside ml-4 text-xs text-stone-600 mt-1 space-y-0.5">
                    <li><strong>Build Command:</strong> <code>npm install && npm run build</code></li>
                    <li><strong>Start Command:</strong> <code>npm run start:server</code></li>
                    <li><strong>Health Check Path:</strong> <code>/api/health</code></li>
                  </ul>
                </li>
              </ol>

              {/* Code preview */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>Arquivo já criado na raiz: <code>render.yaml</code></span>
                  <button
                    onClick={() => copyToClipboard(renderConfigYaml, 'render')}
                    className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCode === 'render' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'render' ? 'Copiado!' : 'Copiar render.yaml'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-stone-900 text-stone-200 text-xs rounded-xl font-mono overflow-x-auto">
                  {renderConfigYaml}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <span className="text-xs text-stone-500 font-medium">
            Documentação completa salva em: <code>DEPLOY_VERCEL_RENDER.md</code>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-xs cursor-pointer"
          >
            Fechar Guia
          </button>
        </div>
      </div>
    </div>
  );
};
