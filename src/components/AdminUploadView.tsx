import React, { useState, useRef, useEffect } from 'react';
import { Bulletin, BulletinItem } from '../types';
import { extractTextFromPdf, isBinaryPdfText, cleanExtractedText } from '../utils/pdfExtractor';
import { PdfViewerPreview } from './PdfViewerPreview';
import {
  UploadCloud,
  FileText,
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Save,
  RefreshCw,
  ExternalLink,
  Layers,
  Calendar,
  Building,
  Mail,
  User,
  AlertCircle,
  Loader2,
  Check,
  Clock
} from 'lucide-react';

interface AdminUploadViewProps {
  currentBulletin: Bulletin;
  onSaveBulletin: (bulletin: Bulletin) => Promise<void>;
  onViewPublicSite: () => void;
  onOpenSocial: () => void;
  initialPdfUrl?: string | null;
  initialPdfName?: string | null;
}

export const AdminUploadView: React.FC<AdminUploadViewProps> = ({
  currentBulletin,
  onSaveBulletin,
  onViewPublicSite,
  onOpenSocial,
  initialPdfUrl = null,
  initialPdfName = null,
}) => {
  const [bulletin, setBulletin] = useState<Bulletin>(currentBulletin);
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState(initialPdfName || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [processingStage, setProcessingStage] = useState<string>('Iniciando processamento...');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // PDF Preview State
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(initialPdfUrl);
  const [pdfPreviewName, setPdfPreviewName] = useState<string>(initialPdfName || '');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial PDF props if they change externally (e.g. from header upload)
  useEffect(() => {
    if (initialPdfUrl) {
      setPdfPreviewUrl(initialPdfUrl);
    }
    if (initialPdfName) {
      setPdfPreviewName(initialPdfName);
      setFileName(initialPdfName);
    }
  }, [initialPdfUrl, initialPdfName]);

  // Dynamic progress bar ticker during processing
  useEffect(() => {
    let interval: any = null;
    if (isProcessing) {
      setProgressPercent((prev) => (prev > 0 ? prev : 15));
      interval = setInterval(() => {
        setProgressPercent((prev) => {
          if (prev < 30) {
            setProcessingStage('Lendo páginas e extraindo conteúdo textual...');
            return prev + 6;
          }
          if (prev < 65) {
            setProcessingStage('Enviando dados e identificando matérias com IA...');
            return prev + 4;
          }
          if (prev < 90) {
            setProcessingStage('Organizando categorias, prazos e comunicados...');
            return prev + 2;
          }
          return prev;
        });
      }, 350);
    } else {
      setProgressPercent(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isProcessing]);

  // Sync bulletin when currentBulletin prop updates
  useEffect(() => {
    setBulletin(currentBulletin);
  }, [currentBulletin]);

  // Editing single item modal state
  const [editingItem, setEditingItem] = useState<BulletinItem | null>(null);
  const [isNewItemModal, setIsNewItemModal] = useState(false);

  // Drag and drop or file selection handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let file: File | null = null;
    if ('dataTransfer' in e && e.dataTransfer) {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        file = e.dataTransfer.files[0];
      }
    } else if ('target' in e && e.target) {
      const targetInput = e.target as HTMLInputElement;
      if (targetInput.files && targetInput.files.length > 0) {
        file = targetInput.files[0];
      }
      try {
        targetInput.value = '';
      } catch (_) {}
    }

    if (!file) return;

    setFileName(file.name);

    // Handle PDF files specially using server-side extraction with local fallback
    if (file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf') {
      const objectUrl = URL.createObjectURL(file);
      setPdfPreviewUrl(objectUrl);
      setPdfPreviewName(file.name);

      setIsProcessing(true);
      setProgressPercent(15);
      setProcessingStage(`Carregando e decodificando arquivo "${file.name}"...`);
      setStatusMessage(`Lendo arquivo PDF "${file.name}" e estruturando matérias...`);

      try {
        // Read file as base64 for reliable server processing
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.includes(',') ? result.split(',')[1] : result;
            resolve(base64);
          };
          reader.onerror = (err) => reject(err);
        });
        reader.readAsDataURL(file);
        const fileBase64 = await base64Promise;

        setProgressPercent(40);
        setProcessingStage('Enviando documento e extraindo texto com IA...');

        const res = await fetch('/api/bulletins/upload-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64,
            fileName: file.name,
            mimeType: 'application/pdf',
            title: bulletin.title,
            edition: bulletin.edition,
            date: bulletin.date,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.bulletin) {
            setBulletin(data.bulletin);
            if (data.text) setRawText(data.text);
            setProgressPercent(100);
            setProcessingStage(`Concluído! ${data.bulletin.items.length} matérias organizadas no sumário.`);
            setStatusMessage(`✅ Sucesso! O arquivo PDF "${file.name}" foi processado com ${data.bulletin.items.length} matérias organizadas.`);
            setTimeout(() => {
              setIsProcessing(false);
              setProgressPercent(0);
            }, 650);
            return;
          }
        }
      } catch (serverErr) {
        console.warn('Tentativa via servidor falhou, tentando extração local:', serverErr);
      }

      // Local fallback
      try {
        setProcessingStage('Processando extração local de texto do PDF...');
        const extracted = await extractTextFromPdf(file);
        setRawText(extracted);
        setProgressPercent(100);
        setStatusMessage(`Texto de "${file.name}" extraído! Clique em "Processar & Gerar Página Web".`);
      } catch (err: any) {
        console.error(err);
        setRawText(`Boletim Semanal: ${file.name}\n\nO documento foi carregado. Você pode revisar e clicar em "Processar & Gerar Página Web" para organizar o sumário.`);
        setStatusMessage(`Arquivo "${file.name}" carregado. Clique em "Processar & Gerar Página Web" para estruturar.`);
      } finally {
        setTimeout(() => {
          setIsProcessing(false);
          setProgressPercent(0);
        }, 500);
      }
      return;
    }

    // Handle JSON backup
    if (file.name.toLowerCase().endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.items && Array.isArray(parsed.items)) {
            setBulletin(parsed);
            setStatusMessage(`Backup JSON "${file.name}" carregado com ${parsed.items.length} matérias!`);
            return;
          }
        } catch (e) {
          console.error(e);
        }
      };
      reader.readAsText(file);
      return;
    }

    // Text / Markdown files
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (isBinaryPdfText(content)) {
        setStatusMessage('⚠️ Arquivo PDF binário detectado. Extraindo páginas...');
        return;
      }
      setRawText(cleanExtractedText(content || ''));
      setStatusMessage(`Arquivo "${file.name}" carregado com sucesso. Clique em "Processar & Gerar Página Web".`);
    };
    reader.readAsText(file);
  };

  // Process raw text with Gemini / Server API
  const handleProcessContent = async () => {
    if (!rawText.trim()) {
      setStatusMessage('Por favor, cole o texto do boletim ou carregue um arquivo primeiro.');
      return;
    }

    setIsProcessing(true);
    setProgressPercent(20);
    setProcessingStage('Processando texto com IA e organizando sumário semanal...');
    setStatusMessage('Processando conteúdo com IA e organizando sumário semanal...');

    try {
      const res = await fetch('/api/bulletins/parse-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText,
          title: bulletin.title,
          edition: bulletin.edition,
          date: bulletin.date,
        }),
      });

      const data = await res.json();
      if (data.success && data.bulletin) {
        setBulletin(data.bulletin);
        setProgressPercent(100);
        setProcessingStage(`Concluído! ${data.bulletin.items.length} matérias estruturadas com sucesso.`);
        setStatusMessage(`Sucesso! ${data.bulletin.items.length} matérias estruturadas via ${data.method === 'gemini-ai' ? 'IA Gemini' : 'parser automatizado'}.`);
        setTimeout(() => {
          setIsProcessing(false);
          setProgressPercent(0);
        }, 650);
      } else {
        setStatusMessage(data.error || 'Erro ao processar conteúdo.');
        setIsProcessing(false);
        setProgressPercent(0);
      }
    } catch (err: any) {
      setStatusMessage(`Erro de conexão: ${err.message}`);
      setIsProcessing(false);
      setProgressPercent(0);
    }
  };

  // Save bulletin
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveBulletin(bulletin);
      setSaveSuccess(true);
      setStatusMessage('Boletim salvo e site web atualizado com sucesso!');
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      setStatusMessage(`Erro ao salvar: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Item deletion
  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('Deseja realmente remover esta matéria do boletim?')) {
      setBulletin((prev) => ({
        ...prev,
        items: prev.items.filter((it) => it.id !== itemId),
      }));
    }
  };

  // Item editing modal save
  const handleSaveItemModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (isNewItemModal) {
      setBulletin((prev) => ({
        ...prev,
        items: [...prev.items, editingItem],
      }));
    } else {
      setBulletin((prev) => ({
        ...prev,
        items: prev.items.map((it) => (it.id === editingItem.id ? editingItem : it)),
      }));
    }

    setEditingItem(null);
    setIsNewItemModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase">
                Administração Simples
              </span>
              <span className="text-xs text-slate-500 font-medium">Ciclo Semanal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Painel de Publicação do Boletim Semanal
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Faça o upload do documento da semana para gerar automaticamente a página web com sumário e disparar nas redes sociais.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-admin-view-site"
              onClick={onViewPublicSite}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Ver Site no Ar</span>
            </button>

            <button
              id="btn-admin-save"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saveSuccess ? 'Publicado!' : 'Salvar & Publicar'}</span>
            </button>
          </div>
        </div>

        {/* Processing Banner when uploading or structuring with AI */}
        {isProcessing && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-300 text-blue-900 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                  <span>Processamento Ativo</span>
                  <span className="bg-blue-200 text-blue-900 px-1.5 py-0.2 rounded-full text-[10px] font-mono">{progressPercent}%</span>
                </p>
                <p className="text-sm font-semibold text-slate-800">{processingStage}</p>
              </div>
            </div>
            <div className="w-36 hidden sm:block">
              <div className="w-full bg-blue-200 rounded-full h-2.5 overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(100, Math.max(12, progressPercent))}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Status alert if any */}
        {statusMessage && !isProcessing && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>{statusMessage}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-blue-500 hover:text-blue-700 text-xs">
              ✕
            </button>
          </div>
        )}

        {/* 1. Upload Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-blue-600" />
              <span>1. Upload do Conteúdo da Semana</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Envie o arquivo do boletim semanal (PDF, TXT, DOC) ou cole o texto das matérias abaixo para automação.
            </p>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={handleFileUpload}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all relative overflow-hidden ${
              isProcessing
                ? 'border-blue-500 bg-blue-50/70 cursor-wait'
                : 'border-blue-300 hover:border-blue-600 bg-blue-50/30 hover:bg-blue-50/60 transition-all cursor-pointer relative group'
            }`}
            title={isProcessing ? 'Processamento em andamento...' : 'Clique para abrir a janela de seleção de arquivo PDF'}
          >
            {/* Native file input covering the entire dropzone card */}
            {!isProcessing && (
              <input
                ref={fileInputRef}
                type="file"
                id="fileInputAdmin"
                onChange={handleFileUpload}
                accept=".pdf,application/pdf,.txt,.md,.json,.doc,.docx"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                title="Clique aqui para escolher o arquivo PDF no seu computador"
              />
            )}

            {isProcessing ? (
              /* Loading Spinner and Progress Bar View */
              <div className="flex flex-col items-center justify-center space-y-4 py-3" id="upload-processing-indicator">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-1.5 max-w-md">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center justify-center gap-2">
                    <span>Processando Boletim Semanal</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white shadow-sm">
                      {progressPercent}%
                    </span>
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-800 font-semibold animate-pulse">
                    {processingStage}
                  </p>
                  {fileName && (
                    <p className="text-xs text-slate-500 font-mono">
                      Arquivo: {fileName}
                    </p>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-md space-y-2">
                  <div className="w-full bg-slate-200 rounded-full h-3.5 overflow-hidden p-0.5 shadow-inner">
                    <div
                      className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                      style={{ width: `${Math.min(100, Math.max(10, progressPercent))}%` }}
                    >
                      <div className="absolute inset-0 bg-white/30 animate-pulse" />
                    </div>
                  </div>

                  {/* Processing Step Badges */}
                  <div className="grid grid-cols-3 gap-2 text-[11px] font-medium pt-1">
                    <div className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-colors ${progressPercent >= 20 ? 'bg-blue-100 text-blue-800 font-bold' : 'text-slate-400 bg-slate-100/50'}`}>
                      <UploadCloud className="w-3 h-3" />
                      <span>1. Leitura</span>
                    </div>
                    <div className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-colors ${progressPercent >= 55 ? 'bg-blue-100 text-blue-800 font-bold' : 'text-slate-400 bg-slate-100/50'}`}>
                      <FileText className="w-3 h-3" />
                      <span>2. Extração</span>
                    </div>
                    <div className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-colors ${progressPercent >= 85 ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-400 bg-slate-100/50'}`}>
                      <Sparkles className="w-3 h-3" />
                      <span>3. IA & Sumário</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 italic pt-1">
                  Extraindo textos, identificando pautas pedagógicas e estruturando o sumário semanal...
                </p>
              </div>
            ) : (
              /* Idle Upload View */
              <div className="pointer-events-none relative z-10">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <p className="text-base font-bold text-slate-800">
                    Arraste e solte o arquivo do boletim aqui, ou <span className="text-blue-600 underline decoration-2">clique para abrir o arquivo</span>
                  </p>
                  <p className="text-xs text-slate-500">Suporta PDF, TXT, Word (.doc, .docx), JSON ou Markdown</p>
                  {fileName && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold mt-2 shadow-sm">
                      <FileText className="w-3.5 h-3.5" /> {fileName}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex justify-center">
                  <span
                    id="btn-choose-file-admin"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 group-hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow group-hover:shadow-md transition-all cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Escolher Arquivo PDF / Documento</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Direct File Selector Fallback */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Opção direta para abrir o seletor de arquivos do sistema:</span>
            </div>
            <label
              htmlFor="fileInputDirect"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer shadow hover:shadow-md transition-all shrink-0"
              title="Clique para selecionar o arquivo PDF no seu computador"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Selecionar Arquivo PDF</span>
              <input
                type="file"
                id="fileInputDirect"
                disabled={isProcessing}
                onChange={handleFileUpload}
                accept=".pdf,application/pdf,.txt,.md,.json,.doc,.docx"
                className="sr-only"
              />
            </label>
          </div>

          {/* Direct Text Paste Area */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Ou Cole o Texto do Boletim Diretamente:
            </label>
            <textarea
              rows={6}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Cole aqui o texto do boletim oficial com comunicados, convocações, pautas pedagógicas e boas práticas..."
              className="w-full p-3.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono leading-relaxed"
            />
          </div>

          {/* Action to Parse */}
          <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
            <span className="text-xs text-slate-500">
              {rawText ? `${rawText.length} caracteres prontos para análise.` : 'Nenhum texto inserido ainda.'}
            </span>

            <button
              id="btn-process-content"
              onClick={handleProcessContent}
              disabled={isProcessing || !rawText.trim()}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow ${
                isProcessing || !rawText.trim()
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Processando ({progressPercent}%)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Processar & Estruturar Matérias</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* PDF Document Preview (Iframe or Canvas) */}
        {pdfPreviewUrl && (
          <div className="space-y-3" id="admin-pdf-preview-section">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Visualização do Conteúdo do PDF</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Consulte o PDF original (via Canvas de alta fidelidade ou Iframe nativo) para validar o sumário estruturado.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPdfPreviewUrl(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 shadow-xs transition-colors"
                title="Fechar painel de pré-visualização do PDF"
              >
                Ocultar Visualizador
              </button>
            </div>

            <PdfViewerPreview
              fileUrl={pdfPreviewUrl}
              fileName={pdfPreviewName || fileName || 'boletim-semanal.pdf'}
              onClose={() => setPdfPreviewUrl(null)}
            />
          </div>
        )}

        {/* 2. Metadata Configuration */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              <span>2. Metadados e Cabeçalho do Boletim</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Esses dados serão exibidos no topo do site web e no sumário semanal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Título do Documento</label>
              <input
                type="text"
                value={bulletin.title}
                onChange={(e) => setBulletin({ ...bulletin, title: e.target.value })}
                className="w-full p-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Órgão / Instituição</label>
              <input
                type="text"
                value={bulletin.institution}
                onChange={(e) => setBulletin({ ...bulletin, institution: e.target.value })}
                className="w-full p-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Edição / Número</label>
              <input
                type="text"
                value={bulletin.edition}
                onChange={(e) => setBulletin({ ...bulletin, edition: e.target.value })}
                placeholder="Ex: Ano VI – nº36/2026"
                className="w-full p-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Data de Publicação</label>
              <input
                type="text"
                value={bulletin.date}
                onChange={(e) => setBulletin({ ...bulletin, date: e.target.value })}
                placeholder="Ex: Marília, 14 de setembro de 2026"
                className="w-full p-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Dirigente Regional / Responsável</label>
              <input
                type="text"
                value={bulletin.leader}
                onChange={(e) => setBulletin({ ...bulletin, leader: e.target.value })}
                className="w-full p-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">E-mail Institucional</label>
              <input
                type="text"
                value={bulletin.email}
                onChange={(e) => setBulletin({ ...bulletin, email: e.target.value })}
                className="w-full p-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Resumo Executivo da Semana</label>
            <textarea
              rows={2}
              value={bulletin.summary}
              onChange={(e) => setBulletin({ ...bulletin, summary: e.target.value })}
              placeholder="Breve resumo com os principais destaques para introdução do site e posts sociais..."
              className="w-full p-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 3. Items & Table of Contents Manager */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <span>3. Pautas e Matérias do Sumário ({bulletin.items.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Todas as matérias abaixo aparecerão no sumário interativo da página web gerada.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingItem({
                  id: `item-${Date.now()}`,
                  title: 'Nova Matéria Semanal',
                  category: 'Formação Pedagógica',
                  department: 'Regional de Ensino',
                  targetAudience: 'Trio Gestor e Docentes',
                  content: 'Descreva aqui o conteúdo da nova pauta...',
                  importantNotes: [],
                  links: [],
                  tags: ['Novo', 'Aviso'],
                });
                setIsNewItemModal(true);
              }}
              className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Matéria</span>
            </button>
          </div>

          {/* List of articles */}
          <div className="space-y-3">
            {bulletin.items.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50/50 hover:bg-white transition-all gap-4"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="w-6 h-6 rounded bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{item.title}</h4>
                    <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px] text-slate-500">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
                        {item.category}
                      </span>
                      {item.department && <span>• {item.department}</span>}
                      {item.dateInfo && <span>• 📅 {item.dateInfo}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setIsNewItemModal(false);
                    }}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar matéria"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir matéria"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 flex-wrap gap-4">
            <span className="text-xs text-slate-500">
              Pronto para gerar o site e exportar para redes sociais?
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenSocial}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
              >
                Ir para Redes Sociais & API →
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Salvar e Publicar Site</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {isNewItemModal ? 'Adicionar Nova Matéria' : 'Editar Matéria'}
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItemModal} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Título da Matéria</label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full p-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Categoria</label>
                  <input
                    type="text"
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full p-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Departamento / Núcleo</label>
                  <input
                    type="text"
                    value={editingItem.department || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, department: e.target.value })}
                    className="w-full p-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Público-Alvo</label>
                  <input
                    type="text"
                    value={editingItem.targetAudience || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, targetAudience: e.target.value })}
                    className="w-full p-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Data / Horário</label>
                  <input
                    type="text"
                    value={editingItem.dateInfo || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, dateInfo: e.target.value })}
                    className="w-full p-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Local do Evento / Reunião</label>
                <input
                  type="text"
                  value={editingItem.location || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                  className="w-full p-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Conteúdo da Matéria</label>
                <textarea
                  rows={6}
                  required
                  value={editingItem.content}
                  onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                  className="w-full p-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow"
                >
                  Salvar Matéria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
