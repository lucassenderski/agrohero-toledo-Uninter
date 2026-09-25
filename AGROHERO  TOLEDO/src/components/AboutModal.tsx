import React from 'react';
import { 
  X, 
  Sprout, 
  MapPin, 
  ShieldCheck, 
  TrendingUp, 
  Leaf, 
  CheckCircle, 
  Users, 
  Database, 
  Server, 
  Lock, 
  CreditCard 
} from 'lucide-react';
import { TOLEDO_DISTRICTS } from '../data/mockData';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Header */}
        <div className="bg-gradient-to-br from-emerald-900 to-stone-900 text-white p-7">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 text-emerald-200 text-xs font-bold mb-3">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Toledo, Paraná • Oeste Paranaense</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-['Outfit',sans-serif] leading-tight">
            Agro Hero Toledo: Conectando Agricultores e Consumidores
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Plataforma sustentável voltada para agricultores familiares e de pequeno porte da região de Toledo - PR que produzem alimentos orgânicos frescos com práticas regenerativas.
          </p>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Missão e Pilares */}
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-stone-800 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-600" />
              <span>Nossa Missão em Toledo - PR</span>
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              O município de Toledo é reconhecido nacionalmente pela sua força agropecuária. No entanto, os pequenos agricultores familiares e produtores agroecológicos muitas vezes enfrentavam dificuldades para escoar sua colheita sem depender de intermediários predatórios.
            </p>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Esta plataforma democratiza o acesso a alimentos limpos, sem agrotóxicos e colhidos sob demanda, garantindo que 100% do valor chegue à mão das famílias camponesas.
            </p>
          </div>

          {/* Distritos Rurais Atendidos */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Distritos e Linhas Rurais de Toledo Atendidas</span>
            </h4>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {TOLEDO_DISTRICTS.map((district) => (
                <span key={district} className="text-xs px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-800 font-medium">
                  🌾 {district}
                </span>
              ))}
            </div>
          </div>

          {/* Cumprimento dos 9 Objetivos Técnicos e Sociais */}
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-stone-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Objetivos do Projeto e Arquitetura Integrada</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-emerald-700" />
                  1. React + Node.js
                </span>
                <p className="text-stone-600">Aplicação web responsiva e performática construída para desktop e mobile.</p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-700" />
                  2. Autenticação Segura Auth0
                </span>
                <p className="text-stone-600">Perfis segmentados para agricultores, consumidores e cooperativa.</p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                  3. Painel Administrativo
                </span>
                <p className="text-stone-600">Gestão de catálogo de safra, status de colheita e logística de entregas.</p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                  4. Gateway PIX & Cartão
                </span>
                <p className="text-stone-600">QR Code dinâmico com confirmação instantânea e cartão seguro.</p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-700" />
                  5 & 6. PostgreSQL + Nuvem
                </span>
                <p className="text-stone-600">Estrutura escalável para dados de produtos, pedidos e feedbacks.</p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Sprout className="w-3.5 h-3.5 text-emerald-700" />
                  8 & 9. Renda & Desperdício Zero
                </span>
                <p className="text-stone-600">Colheita programada após encomenda, aumentando a renda em mais de 40%.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-stone-200 bg-stone-50 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs cursor-pointer"
          >
            Entendido, Conhecer Alimentos
          </button>
        </div>
      </div>
    </div>
  );
};
