import React, { useState, useMemo, useRef } from 'react';
import { Bulletin, BulletinItem } from '../types';
import {
  Search,
  Calendar,
  MapPin,
  Users,
  ExternalLink,
  AlertTriangle,
  Bookmark,
  Share2,
  Printer,
  ChevronRight,
  Sparkles,
  ArrowUp,
  School,
  CheckCircle,
  Tag,
  Settings,
  UploadCloud,
  Download
} from 'lucide-react';

interface PublicWebsiteViewProps {
  bulletin: Bulletin;
  onEditInAdmin: (item?: BulletinItem) => void;
  onOpenSocial: () => void;
  onUploadFile?: (file: File) => void;
  onDownloadHtml?: () => void;
}

export const PublicWebsiteView: React.FC<PublicWebsiteViewProps> = ({
  bulletin,
  onEditInAdmin,
  onOpenSocial,
  onUploadFile,
  onDownloadHtml,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedLink, setCopiedLink] = useState(false);
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set(bulletin.items.map(it => it.category));
    return ['all', ...Array.from(set)];
  }, [bulletin.items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return bulletin.items.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        item.department?.toLowerCase().includes(q) ||
        item.targetAudience?.toLowerCase().includes(q) ||
        item.tags?.some(t => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [bulletin.items, selectedCategory, searchTerm]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${bulletin.title} - ${bulletin.edition}`,
        text: bulletin.summary,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      
      {/* Institutional Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-lg print:bg-none print:text-black print:p-0">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold tracking-wider uppercase">
                  Governo do Estado de São Paulo
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
                  SEDUC-SP
                </span>
              </div>

              <h2 className="text-sm font-semibold tracking-wider text-blue-200 uppercase">
                {bulletin.institution}
              </h2>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {bulletin.title}
              </h1>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 backdrop-blur border border-white/20 text-white font-medium text-sm">
                <Bookmark className="w-4 h-4 text-amber-300" />
                <span>{bulletin.edition}</span>
                <span className="text-white/40">•</span>
                <span>{bulletin.date}</span>
              </div>

              <p className="text-slate-200 text-sm sm:text-base leading-relaxed pt-1">
                {bulletin.summary}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2 border-t border-white/10">
                <span><strong>Dirigente Regional:</strong> {bulletin.leader}</span>
                <span>•</span>
                <span><strong>E-mail:</strong> {bulletin.email}</span>
              </div>
            </div>

            {/* Quick Action Tools */}
            <div className="flex flex-wrap md:flex-col gap-2 shrink-0 self-start md:self-center">
              {/* Native file upload label for Hero */}
              <label
                htmlFor="heroFileInput"
                id="btn-quick-upload-pdf"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-all shadow cursor-pointer"
                title="Abrir janela para selecionar e enviar PDF do boletim semanal"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Subir Arquivo PDF</span>
                <input
                  ref={heroFileInputRef}
                  type="file"
                  id="heroFileInput"
                  className="sr-only"
                  accept=".pdf,application/pdf,.txt,.md,.json,.doc,.docx"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      onUploadFile?.(e.target.files[0]);
                      try {
                        e.target.value = '';
                      } catch (_) {}
                    }
                  }}
                />
              </label>

              <button
                id="btn-admin-upload"
                onClick={() => onEditInAdmin()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition-all shadow cursor-pointer"
                title="Abrir Painel Admin para fazer upload do boletim semanal"
              >
                <Settings className="w-4 h-4" />
                <span>Painel Admin (Upload)</span>
              </button>

              <button
                id="btn-share-bulletin"
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                <span>{copiedLink ? 'Link Copiado!' : 'Compartilhar'}</span>
              </button>

              <button
                id="btn-print-bulletin"
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / PDF</span>
              </button>

              <button
                id="btn-quick-social"
                onClick={onOpenSocial}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Exportar Redes</span>
              </button>

              {onDownloadHtml && (
                <button
                  id="btn-quick-download-html"
                  onClick={onDownloadHtml}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-all shadow cursor-pointer"
                  title="Baixar arquivo HTML único e independente da página web"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Página Web</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Main Grid: Sticky Sumário + Content Articles */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sumário Navegável Lateral (4 cols on desktop) */}
          <aside className="lg:col-span-4 sticky top-20 z-20">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <h3 className="font-bold text-slate-900 text-base">Sumário da Edição</h3>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                  {filteredItems.length} de {bulletin.items.length} matérias
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="website-search-input"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar pauta, escola, palavra-chave..."
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-xs text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto py-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'all' ? 'Todas as Áreas' : cat}
                  </button>
                ))}
              </div>

              {/* Interactive ToC List */}
              <nav className="max-h-[50vh] overflow-y-auto space-y-1 pr-1" aria-label="Sumário das Matérias">
                {filteredItems.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    Nenhuma matéria encontrada para a busca "{searchTerm}".
                  </div>
                ) : (
                  filteredItems.map((item, idx) => {
                    const originalIndex = bulletin.items.findIndex(it => it.id === item.id) + 1;
                    return (
                      <a
                        key={item.id}
                        href={`#materia-${item.id}`}
                        className="group flex items-start gap-2.5 p-2 rounded-xl hover:bg-blue-50 transition-colors text-left text-xs text-slate-700 hover:text-blue-900 border border-transparent hover:border-blue-100"
                      >
                        <span className="font-bold text-blue-600 text-xs px-1.5 py-0.5 rounded bg-blue-50 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                          {String(originalIndex).padStart(2, '0')}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-clamp-2 leading-snug group-hover:underline">
                            {item.title}
                          </p>
                          <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                            {item.category}
                          </span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                      </a>
                    );
                  })
                )}
              </nav>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Role para navegar nas pautas</span>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="hover:text-blue-600 flex items-center gap-1"
                >
                  <ArrowUp className="w-3 h-3" /> Topo
                </button>
              </div>

            </div>
          </aside>

          {/* Content Articles Column (8 cols on desktop) */}
          <main className="lg:col-span-8 space-y-6">
            
            {filteredItems.map((item, idx) => {
              const originalIndex = bulletin.items.findIndex(it => it.id === item.id) + 1;
              const isBoasPraticas = item.category.toLowerCase().includes('prática') || item.category.toLowerCase().includes('escola');

              return (
                <article
                  key={item.id}
                  id={`materia-${item.id}`}
                  className={`scroll-mt-24 bg-white rounded-2xl border ${
                    isBoasPraticas ? 'border-amber-200/80 shadow-md ring-1 ring-amber-100' : 'border-slate-200/80 shadow-sm'
                  } p-6 sm:p-8 transition-all hover:shadow-md`}
                >
                  
                  {/* Article Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-blue-100 text-blue-800">
                      Item #{String(originalIndex).padStart(2, '0')}
                    </span>

                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {item.category}
                    </span>

                    {item.department && (
                      <span className="px-2.5 py-0.5 text-xs font-medium rounded-md bg-slate-100 text-slate-700">
                        {item.department}
                      </span>
                    )}

                    {item.targetAudience && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-md bg-amber-50 text-amber-800 border border-amber-200/60">
                        <Users className="w-3 h-3 text-amber-600" />
                        <span>{item.targetAudience}</span>
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight mb-4">
                    {item.title}
                  </h2>

                  {/* Logistics Callout (Date / Location) */}
                  {(item.dateInfo || item.location) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3.5 mb-5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs sm:text-sm text-slate-700">
                      {item.dateInfo && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                          <div>
                            <span className="font-semibold text-slate-900">Período / Horário: </span>
                            <span>{item.dateInfo}</span>
                          </div>
                        </div>
                      )}

                      {item.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                          <div>
                            <span className="font-semibold text-slate-900">Local: </span>
                            <span>{item.location}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Body Text */}
                  <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-700 whitespace-pre-line space-y-3">
                    {item.content}
                  </div>

                  {/* Important Notes */}
                  {item.importantNotes && item.importantNotes.length > 0 && (
                    <div className="mt-5 p-4 rounded-xl bg-amber-50/80 border-l-4 border-amber-500 text-xs sm:text-sm text-amber-900 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-amber-800">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Pontos de Atenção & Orientações Obrigatórias:</span>
                      </div>
                      <ul className="list-disc pl-5 space-y-1">
                        {item.importantNotes.map((note, nIdx) => (
                          <li key={nIdx} className="leading-snug">
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Official Links */}
                  {item.links && item.links.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                      {item.links.map((link, lIdx) => (
                        <a
                          key={lIdx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors border border-blue-200"
                        >
                          <span>{link.label}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Tags and Admin Quick Action */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap text-slate-400">
                      <Tag className="w-3 h-3 text-slate-400" />
                      {item.tags?.map((t, tIdx) => (
                        <span key={tIdx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          #{t}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => onEditInAdmin(item)}
                      className="text-blue-600 hover:text-blue-800 font-medium hover:underline text-xs"
                    >
                      Editar esta pauta no Painel Admin →
                    </button>
                  </div>

                </article>
              );
            })}

          </main>

        </div>
      </div>

    </div>
  );
};
