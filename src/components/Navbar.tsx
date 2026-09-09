import React, { useRef } from 'react';
import { Bulletin } from '../types';
import { Globe, Settings, Share2, Code, FileText, Download, CheckCircle2, UploadCloud } from 'lucide-react';

interface NavbarProps {
  activeTab: 'website' | 'admin' | 'social' | 'code';
  setActiveTab: (tab: 'website' | 'admin' | 'social' | 'code') => void;
  bulletins: Bulletin[];
  currentBulletinId: string;
  onSelectBulletin: (id: string) => void;
  onDownloadHtml: () => void;
  onUploadFile?: (file: File) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  bulletins,
  currentBulletinId,
  onSelectBulletin,
  onDownloadHtml,
  onUploadFile,
}) => {
  const current = bulletins.find(b => b.id === currentBulletinId) || bulletins[0];
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo / Institution */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-lg shadow-inner">
              SP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Portal Regional</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Online
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-slate-100 truncate max-w-[200px] sm:max-w-md">
                {current?.title || 'Boletim Semanal'} • {current?.edition || 'Ano VI'}
              </h1>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              id="tab-website"
              onClick={() => setActiveTab('website')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'website'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Site do Boletim</span>
            </button>

            <button
              id="tab-admin"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Painel Admin (Upload)</span>
            </button>

            <button
              id="tab-social"
              onClick={() => setActiveTab('social')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'social'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>Redes Sociais & API</span>
            </button>

            <button
              id="tab-code"
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'code'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>Exportar HTML</span>
            </button>
          </nav>

          {/* Edition Selector & Actions */}
          <div className="flex items-center gap-2">
            {bulletins.length > 1 && (
              <select
                aria-label="Selecionar Edição do Boletim"
                value={currentBulletinId}
                onChange={(e) => onSelectBulletin(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                {bulletins.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.edition}
                  </option>
                ))}
              </select>
            )}

            {/* Native file upload label for header */}
            <label
              htmlFor="headerFileInput"
              id="btn-upload-pdf-top"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-lg shadow transition-colors cursor-pointer"
              title="Selecionar e enviar arquivo PDF do boletim"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span className="font-semibold">Subir PDF</span>
              <input
                ref={fileInputRef}
                type="file"
                id="headerFileInput"
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
              id="btn-download-html-top"
              onClick={onDownloadHtml}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold rounded-lg shadow transition-colors"
              title="Baixar arquivo HTML independente da página web"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Baixar Página Web</span>
            </button>
          </div>

        </div>

        {/* Mobile Nav Row */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('website')}
            className={`px-2 py-1 rounded ${activeTab === 'website' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
          >
            Site
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-2 py-1 rounded ${activeTab === 'admin' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
          >
            Admin (Upload)
          </button>
          <label
            htmlFor="headerFileInputMobile"
            className="px-2 py-1 rounded text-emerald-400 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <UploadCloud className="w-3 h-3" /> Subir PDF
            <input
              type="file"
              id="headerFileInputMobile"
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
            onClick={() => setActiveTab('social')}
            className={`px-2 py-1 rounded ${activeTab === 'social' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
          >
            Redes & API
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-2 py-1 rounded ${activeTab === 'code' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
          >
            HTML
          </button>
        </div>
      </div>
    </header>
  );
};
