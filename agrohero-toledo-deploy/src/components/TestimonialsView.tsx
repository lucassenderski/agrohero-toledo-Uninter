import React from 'react';
import { 
  HeartHandshake, 
  Star, 
  ThumbsUp, 
  PlusCircle, 
  Sprout, 
  Users, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  CheckCircle,
  MessageSquareHeart,
  Quote,
  X,
  Search,
  CheckCircle2,
  Filter,
  BadgeCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Testimonial } from '../types';
import { TOLEDO_DISTRICTS } from '../data/mockData';

interface TestimonialsViewProps {
  testimonials: Testimonial[];
  onAddTestimonial: (testimonial: Testimonial) => void;
  onLikeTestimonial: (id: string) => void;
}

export const TestimonialsView: React.FC<TestimonialsViewProps> = ({
  testimonials,
  onAddTestimonial,
  onLikeTestimonial,
}) => {
  const [filterRole, setFilterRole] = React.useState<string>('all');
  const [ratingFilter, setRatingFilter] = React.useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showModal, setShowModal] = React.useState(false);

  // Form state for new feedback
  const [formName, setFormName] = React.useState('');
  const [formRole, setFormRole] = React.useState<'consumer' | 'farmer' | 'chef' | 'cooperative'>('consumer');
  const [formLocation, setFormLocation] = React.useState('Jardim La Salle, Toledo - PR');
  const [formRating, setFormRating] = React.useState(5);
  const [formText, setFormText] = React.useState('');
  const [formHighlight, setFormHighlight] = React.useState('Qualidade e Frescor Imbatível');
  const [submittedSuccess, setSubmittedSuccess] = React.useState(false);

  const filteredTestimonials = testimonials.filter((t) => {
    // Role filter
    if (filterRole !== 'all' && t.authorRole !== filterRole) {
      return false;
    }
    // Rating filter
    if (ratingFilter !== 'all' && t.rating !== ratingFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.authorName.toLowerCase().includes(q);
      const matchText = t.text.toLowerCase().includes(q);
      const matchLoc = t.location.toLowerCase().includes(q);
      const matchBadge = t.badges.some((b) => b.toLowerCase().includes(q));
      if (!matchName && !matchText && !matchLoc && !matchBadge) return false;
    }
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formText.trim()) return;

    const newTestimonial: Testimonial = {
      id: `test-${Date.now()}`,
      authorName: formName.trim(),
      authorRole: formRole,
      location: formLocation,
      avatar: formRole === 'farmer' 
        ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80'
        : formRole === 'chef'
        ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      rating: formRating,
      text: formText.trim(),
      date: 'Hoje mesmo',
      badges: [
        formRole === 'farmer' ? 'Produtor Familiar Toledo' : formRole === 'chef' ? 'Gastronomia Local' : 'Consumidor Verificado',
        formLocation.split(',')[0],
      ],
      impactHighlight: formHighlight,
      likesCount: 1,
    };

    onAddTestimonial(newTestimonial);

    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 120,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#059669', '#10b981', '#f59e0b', '#34d399'],
      });
    } catch (e) {
      console.log('Confetti effect');
    }

    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      setShowModal(false);
      setFormName('');
      setFormText('');
    }, 1800);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Header */}
      <section className="bg-gradient-to-br from-emerald-950 via-stone-900 to-emerald-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-emerald-200 text-xs font-bold mb-3">
            <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
            <span>Agro Hero Toledo • Depoimentos dos Usuários e Produtores</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-['Outfit',sans-serif] tracking-tight leading-tight">
            Depoimentos & Experiências Reais
          </h1>

          <p className="mt-3 text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-2xl font-normal">
            Histórias de quem consome com saúde e de quem produz com dignidade. Veja a transformação gerada pelo aplicativo Agro Hero em Toledo - PR.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              id="open-feedback-modal-btn"
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-sm transition-all shadow-md shadow-amber-400/20 flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Escrever Meu Depoimento</span>
            </button>
            <span className="text-xs text-emerald-300 font-medium">
              ★ 4.9/5 estrelas de média baseada em 128+ avaliações locais
            </span>
          </div>
        </div>
      </section>

      {/* Community Ratings & Impact Bar */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Rating Summary */}
          <div className="flex items-center gap-4 border-b lg:border-b-0 lg:border-r border-stone-200 pb-4 lg:pb-0 lg:pr-6">
            <div className="text-center">
              <span className="text-4xl font-black text-stone-900 font-['Outfit',sans-serif] block leading-none">
                4.9
              </span>
              <div className="flex items-center justify-center gap-0.5 text-amber-400 my-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-[11px] text-stone-500 font-bold">128 avaliações reais</span>
            </div>

            <div className="flex-1 space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-12 text-[11px] text-stone-500">5 estrelas</span>
                <div className="flex-1 bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full w-[94%]" />
                </div>
                <span className="text-[11px] font-bold text-stone-700">94%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-12 text-[11px] text-stone-500">4 estrelas</span>
                <div className="flex-1 bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full w-[6%]" />
                </div>
                <span className="text-[11px] font-bold text-stone-700">6%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-12 text-[11px] text-stone-500">3 estrelas</span>
                <div className="flex-1 bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full w-[0%]" />
                </div>
                <span className="text-[11px] font-bold text-stone-700">0%</span>
              </div>
            </div>
          </div>

          {/* Core Highlights */}
          <div className="col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold mb-1">
                <Sprout className="w-4 h-4 text-emerald-600" />
                <span>Colheita Fresca</span>
              </div>
              <p className="text-stone-600">Alimentos colhidos no mesmo dia da entrega em Toledo.</p>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100">
              <div className="flex items-center gap-1.5 text-amber-800 font-bold mb-1">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <span>+42% Renda</span>
              </div>
              <p className="text-stone-600">Preço justo e repasse integral direto aos agricultores.</p>
            </div>

            <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-100 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 text-teal-800 font-bold mb-1">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Zero Agrotóxicos</span>
              </div>
              <p className="text-stone-600">Certificado pela Rede Ecovida e CPOrg Paraná.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar relatos por nome, bairro (ex: Novo Sarandi) ou alimento..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-2xl text-xs sm:text-sm text-stone-900 focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Rating dropdown */}
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-3 py-2.5 bg-white border border-stone-200 rounded-2xl text-xs font-bold text-stone-700 shadow-2xs"
            >
              <option value="all">Todas as Estrelas</option>
              <option value="5">★ 5 Estrelas</option>
              <option value="4">★ 4 Estrelas</option>
            </select>

            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <MessageSquareHeart className="w-4 h-4" />
              <span>Novo Depoimento</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'Todos os Depoimentos' },
            { id: 'consumer', label: 'Consumidores de Toledo' },
            { id: 'farmer', label: 'Agricultores Familiares' },
            { id: 'chef', label: 'Restaurantes & Chefs' },
            { id: 'cooperative', label: 'Cooperativas Agroecológicas' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterRole(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                filterRole === tab.id
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Testimonials Masonry / Grid */}
      {filteredTestimonials.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
          <MessageSquareHeart className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">
            Nenhum depoimento encontrado com os filtros atuais
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Tente remover a busca por "{searchQuery}" ou selecione "Todos os Depoimentos".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterRole('all');
              setRatingFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTestimonials.map((item) => (
            <div
              key={item.id}
              id={`testimonial-card-${item.id}`}
              className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header with Avatar, Name, Location */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.avatar}
                      alt={item.authorName}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/40"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-stone-900 leading-tight">
                          {item.authorName}
                        </h4>
                        <span title="Perfil Verificado em Toledo">
                          <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </p>
                    </div>
                  </div>

                  {/* Star rating */}
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>

                {/* Impact Tag if present */}
                {item.impactHighlight && (
                  <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200/60">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>{item.impactHighlight}</span>
                  </div>
                )}

                {/* Quote text */}
                <div className="relative">
                  <Quote className="w-6 h-6 text-stone-200 absolute -top-1 -left-2 -z-0 opacity-80" />
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed relative z-10 pl-2">
                    "{item.text}"
                  </p>
                </div>

                {/* Badges */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {item.badges.map((badge, bIdx) => (
                    <span
                      key={bIdx}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600"
                    >
                      #{badge}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer with date and likes */}
              <div className="mt-5 pt-3.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span>{item.date}</span>

                <button
                  id={`like-testimonial-${item.id}`}
                  onClick={() => onLikeTestimonial(item.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-emerald-50 text-stone-600 hover:text-emerald-700 transition-colors cursor-pointer"
                  title="Apoiar este depoimento"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-bold text-xs">{item.likesCount} apoios</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Modal to Submit User Testimonial */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div 
            className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-stone-200 p-6 sm:p-7 relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {submittedSuccess ? (
              <div className="py-10 text-center space-y-3">
                <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto animate-bounce" />
                <h3 className="text-2xl font-black text-stone-900 font-['Outfit',sans-serif]">
                  Depoimento Publicado com Sucesso!
                </h3>
                <p className="text-sm text-stone-600 max-w-md mx-auto">
                  Sua experiência fortalece a agroecologia em Toledo e incentiva mais famílias a escolherem comida de verdade.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <MessageSquareHeart className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-stone-900 font-['Outfit',sans-serif]">
                      Compartilhe seu Depoimento Agro Hero
                    </h3>
                    <p className="text-xs text-stone-500">
                      Como a compra direta ou a venda dos seus produtos impactou sua rotina em Toledo?
                    </p>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Seu Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Gabriel Fontes"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                {/* Role and District */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Seu Perfil
                    </label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    >
                      <option value="consumer">Consumidor(a) de Toledo</option>
                      <option value="farmer">Agricultor(a) Familiar Parceiro</option>
                      <option value="chef">Chef / Dono de Restaurante</option>
                      <option value="cooperative">Membro de Cooperativa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Bairro ou Distrito em Toledo
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Novo Sarandi, Toledo"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Star rating */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Sua Avaliação Geral
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFormRating(star)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= formRating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-stone-600 ml-2">
                      {formRating} de 5 estrelas
                    </span>
                  </div>
                </div>

                {/* Impact Highlight Badge */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Destaque da Experiência
                  </label>
                  <select
                    value={formHighlight}
                    onChange={(e) => setFormHighlight(e.target.value)}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Qualidade e Frescor Imbatível">🌿 Qualidade & Frescor Imbatível</option>
                    <option value="Aumento de Renda no Campo">+40% de Renda Familiar no Campo</option>
                    <option value="Preço Justo Sem Atravessadores">🤝 Preço Justo e Sem Atravessador</option>
                    <option value="Agilidade no PIX & Entrega">⚡ Agilidade no PIX e Entrega</option>
                    <option value="Receitas Saudáveis Práticas">🍲 Receitas Saudáveis com Alimentos da Região</option>
                    <option value="Retirada Ecológica no Lago">🌳 Retirada no Parque Diva Paim Barth</option>
                  </select>
                </div>

                {/* Text */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Seu Relato
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Conte como o Agro Hero mudou sua alimentação, suas vendas ou sua rotina em Toledo..."
                    value={formText}
                    onChange={(e) => setFormText(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-900/20 transition-all cursor-pointer"
                  >
                    Publicar Depoimento
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
