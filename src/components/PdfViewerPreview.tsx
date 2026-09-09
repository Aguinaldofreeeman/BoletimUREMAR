import React, { useState, useEffect, useRef } from 'react';
import { loadPdfJsScript } from '../utils/pdfExtractor';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ExternalLink,
  Download,
  Eye,
  Layers,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface PdfViewerPreviewProps {
  fileUrl: string | null;
  fileName?: string;
  onClose?: () => void;
  defaultExpanded?: boolean;
}

export const PdfViewerPreview: React.FC<PdfViewerPreviewProps> = ({
  fileUrl,
  fileName = 'boletim-semanal.pdf',
  onClose,
  defaultExpanded = true,
}) => {
  const [viewMode, setViewMode] = useState<'canvas' | 'iframe'>('canvas');
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // PDF.js State for Canvas Mode
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.15);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<any>(null);

  // Load PDF Document when fileUrl changes
  useEffect(() => {
    if (!fileUrl) {
      setPdfDoc(null);
      setNumPages(0);
      return;
    }

    let isMounted = true;
    setIsLoadingPdf(true);
    setRenderError(null);
    setPageNum(1);

    const loadDocument = async () => {
      try {
        await loadPdfJsScript();
        if (!window.pdfjsLib) {
          throw new Error('PDF.js não pôde ser inicializado.');
        }

        const loadingTask = window.pdfjsLib.getDocument({
          url: fileUrl,
          cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (isMounted) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setIsLoadingPdf(false);
        }
      } catch (err: any) {
        console.warn('Erro ao carregar documento no PDF.js, alternando para iframe:', err);
        if (isMounted) {
          setRenderError(err?.message || 'Falha ao processar páginas via Canvas.');
          setIsLoadingPdf(false);
          // Fallback gracefully to iframe mode
          setViewMode('iframe');
        }
      }
    };

    loadDocument();

    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (_) {}
      }
    };
  }, [fileUrl]);

  // Render Page on Canvas
  useEffect(() => {
    if (!pdfDoc || viewMode !== 'canvas' || !isExpanded) return;

    let isMounted = true;

    const renderPage = async () => {
      try {
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch (_) {}
        }

        const page = await pdfDoc.getPage(pageNum);
        if (!isMounted) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        // Retina display support
        const pixelRatio = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale });

        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const task = page.render(renderContext);
        renderTaskRef.current = task;
        await task.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('Erro de renderização da página:', err);
        }
      }
    };

    renderPage();

    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (_) {}
      }
    };
  }, [pdfDoc, pageNum, scale, viewMode, isExpanded]);

  if (!fileUrl) {
    return null;
  }

  const handlePrevPage = () => {
    if (pageNum > 1) setPageNum(pageNum - 1);
  };

  const handleNextPage = () => {
    if (pageNum < numPages) setPageNum(pageNum + 1);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(2.5, +(prev + 0.2).toFixed(2)));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(0.6, +(prev - 0.2).toFixed(2)));
  };

  const handleResetZoom = () => {
    setScale(1.15);
  };

  const containerClasses = isFullscreen
    ? 'fixed inset-4 z-50 bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col border border-slate-700 p-4'
    : 'bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all';

  return (
    <div className={containerClasses} id="pdf-preview-container">
      {/* Top Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-900 text-white rounded-t-2xl">
        {/* File Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-100 truncate max-w-[220px] sm:max-w-xs md:max-w-md" title={fileName}>
                {fileName}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" />
                Processado
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Visualização imediata do conteúdo do documento enviado
            </p>
          </div>
        </div>

        {/* View Controls & Mode Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="inline-flex rounded-lg bg-slate-800 p-1 border border-slate-700 text-xs font-semibold">
            <button
              type="button"
              id="btn-preview-mode-canvas"
              onClick={() => setViewMode('canvas')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'canvas'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Renderizar páginas no Canvas de alta fidelidade"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Canvas</span>
            </button>
            <button
              type="button"
              id="btn-preview-mode-iframe"
              onClick={() => setViewMode('iframe')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'iframe'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Visualizador nativo do navegador via Iframe"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Iframe</span>
            </button>
          </div>

          {/* Open in new tab */}
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Abrir PDF em nova aba"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Download PDF */}
          <a
            href={fileUrl}
            download={fileName}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Baixar arquivo original"
          >
            <Download className="w-4 h-4" />
          </a>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title={isFullscreen ? 'Sair da tela cheia' : 'Visualizar em tela cheia'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Collapse/Expand Toggle (if not fullscreen) */}
          {!isFullscreen && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title={isExpanded ? 'Recolher pré-visualização' : 'Expandir pré-visualização'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}

          {/* Close / Dismiss */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              title="Fechar painel de pré-visualização"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Body */}
      {isExpanded && (
        <div className="flex flex-col flex-1 min-h-0 bg-slate-100">
          {/* Secondary Toolbar for Canvas Mode: Pages & Zoom */}
          {viewMode === 'canvas' && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs">
              {/* Pagination */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  id="btn-pdf-prev-page"
                  onClick={handlePrevPage}
                  disabled={pageNum <= 1 || isLoadingPdf}
                  className="p-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-semibold transition-colors"
                  title="Página Anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-semibold text-slate-700 px-2 min-w-[90px] text-center">
                  Página <strong className="text-blue-600">{pageNum}</strong> de{' '}
                  <strong>{numPages || '...'}</strong>
                </span>
                <button
                  type="button"
                  id="btn-pdf-next-page"
                  onClick={handleNextPage}
                  disabled={pageNum >= numPages || isLoadingPdf}
                  className="p-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-semibold transition-colors"
                  title="Próxima Página"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  id="btn-pdf-zoom-out"
                  onClick={handleZoomOut}
                  disabled={scale <= 0.6}
                  className="p-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 transition-colors"
                  title="Diminuir Zoom"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  id="btn-pdf-reset-zoom"
                  onClick={handleResetZoom}
                  className="px-2 py-1 rounded-md border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-mono font-semibold"
                  title="Redefinir Zoom para 100%"
                >
                  {Math.round(scale * 100)}%
                </button>
                <button
                  type="button"
                  id="btn-pdf-zoom-in"
                  onClick={handleZoomIn}
                  disabled={scale >= 2.5}
                  className="p-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 transition-colors"
                  title="Aumentar Zoom"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Viewer Content Area */}
          <div
            className={`flex-1 overflow-auto flex items-center justify-center p-4 min-h-[480px] max-h-[720px] ${
              isFullscreen ? 'max-h-[calc(100vh-140px)]' : ''
            }`}
          >
            {/* View Mode 1: CANVAS */}
            {viewMode === 'canvas' && (
              <div className="relative flex flex-col items-center justify-center w-full min-h-[440px]">
                {isLoadingPdf && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center z-10 space-y-2 rounded-xl">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-xs font-bold text-slate-700">Carregando visualização de páginas...</p>
                  </div>
                )}

                {renderError ? (
                  <div className="p-6 text-center max-w-md space-y-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                    <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
                    <p className="text-sm font-semibold">Visualização via Canvas não pôde ser gerada diretamente.</p>
                    <p className="text-xs text-amber-700">{renderError}</p>
                    <button
                      type="button"
                      onClick={() => setViewMode('iframe')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow"
                    >
                      Alternar para Modo Iframe Nativo
                    </button>
                  </div>
                ) : (
                  <div className="inline-block bg-white shadow-lg border border-slate-300 rounded-sm overflow-hidden">
                    <canvas ref={canvasRef} className="block max-w-full h-auto" />
                  </div>
                )}
              </div>
            )}

            {/* View Mode 2: IFRAME */}
            {viewMode === 'iframe' && (
              <div className="w-full h-full min-h-[500px] flex flex-col">
                <iframe
                  id="pdf-preview-iframe"
                  src={fileUrl}
                  title={fileName}
                  className="w-full h-full min-h-[520px] rounded-xl border border-slate-300 bg-white shadow-inner"
                />
                <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
                  <span>Visualizador PDF integrado. Se o seu navegador bloquear,</span>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 font-semibold underline hover:text-blue-800"
                  >
                    clique aqui para abrir em nova aba
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
