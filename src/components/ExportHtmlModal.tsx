import React, { useState } from 'react';
import { Bulletin } from '../types';
import { generateStandaloneHtml } from '../utils/htmlGenerator';
import {
  Download,
  Copy,
  CheckCircle2,
  Code,
  ExternalLink,
  Eye,
  FileCheck,
  Globe
} from 'lucide-react';

interface ExportHtmlModalProps {
  bulletin: Bulletin;
  onDownloadHtml: () => void;
}

export const ExportHtmlModal: React.FC<ExportHtmlModalProps> = ({ bulletin, onDownloadHtml }) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');

  const htmlCode = generateStandaloneHtml(bulletin);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenInNewTab = () => {
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase">
                Página Web Independente
              </span>
              <span className="text-xs text-slate-500 font-medium">HTML5 + CSS + JavaScript</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Exportador do Site do Boletim
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Gera um arquivo único .html pronto para publicação em qualquer servidor web ou uso local. 
              <strong> Agora com Painel Admin (Upload) embutido:</strong> permite subir e atualizar o boletim diretamente na página baixada!
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleOpenInNewTab}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
              title="Abrir página gerada em nova aba do navegador"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir em Nova Aba</span>
            </button>

            <button
              id="btn-download-standalone-html"
              onClick={onDownloadHtml}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow"
              title="Baixar arquivo boletim.html para upload em qualquer servidor"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Arquivo HTML</span>
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center justify-between bg-white px-5 py-3 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'preview'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Pré-visualização da Página</span>
            </button>

            <button
              onClick={() => setViewMode('code')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'code'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>Código HTML/CSS/JS ({Math.round(htmlCode.length / 1024)} KB)</span>
            </button>
          </div>

          {viewMode === 'code' && (
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 rounded hover:bg-blue-50"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Código Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Código</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Main Content View */}
        {viewMode === 'preview' ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center gap-2 text-xs text-slate-600">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>Simulação do site autônomo com navegação e sumário embutidos:</span>
            </div>
            <iframe
              title="Pré-visualização da Página Web do Boletim"
              srcDoc={htmlCode}
              className="w-full h-[700px] border-0"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        ) : (
          <div className="bg-slate-900 rounded-2xl p-5 shadow-inner border border-slate-800 overflow-hidden">
            <pre className="text-xs text-emerald-400 font-mono overflow-x-auto max-h-[600px] leading-relaxed select-all">
              {htmlCode}
            </pre>
          </div>
        )}

        {/* Deployment Instructions Box */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>Como publicar o arquivo gerado:</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            1. Clique no botão <strong>"Baixar Arquivo HTML"</strong> para salvar o documento.<br />
            2. Renomeie para <code>index.html</code> se quiser que ele seja a página principal do seu domínio.<br />
            3. Envie para o cPanel da escola, repositório GitHub Pages, servidor Apache/Nginx ou abra diretamente no seu computador offline.<br />
            4. <strong>Painel Admin Embutido (Upload):</strong> No topo da página baixada, clique no botão azul <code>⚙️ Painel Admin (Upload)</code> para carregar o boletim da próxima semana, editar matérias, reordenar o sumário, gerar textos para redes sociais ou baixar um novo HTML já atualizado sem depender de servidor!
          </p>
        </div>

      </div>
    </div>
  );
};
