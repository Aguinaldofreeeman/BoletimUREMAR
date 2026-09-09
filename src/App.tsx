import React, { useState, useEffect } from 'react';
import { Bulletin, BulletinItem } from './types';
import { initialBulletin } from './data/defaultBulletin';
import { Navbar } from './components/Navbar';
import { PublicWebsiteView } from './components/PublicWebsiteView';
import { AdminUploadView } from './components/AdminUploadView';
import { SocialExportView } from './components/SocialExportView';
import { ExportHtmlModal } from './components/ExportHtmlModal';
import { generateStandaloneHtml } from './utils/htmlGenerator';

export default function App() {
  const [bulletins, setBulletins] = useState<Bulletin[]>([initialBulletin]);
  const [currentBulletinId, setCurrentBulletinId] = useState<string>(initialBulletin.id);
  const [activeTab, setActiveTab] = useState<'website' | 'admin' | 'social' | 'code'>('website');
  const [loading, setLoading] = useState<boolean>(true);
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null);
  const [uploadedPdfName, setUploadedPdfName] = useState<string | null>(null);
  const [downloadToast, setDownloadToast] = useState<{
    fileName: string;
    serverUrl: string;
    blobUrl?: string;
  } | null>(null);

  // Sync with Express backend on mount
  useEffect(() => {
    fetch('/api/bulletins')
      .then((res) => res.json())
      .then((data) => {
        if (data.bulletins && Array.isArray(data.bulletins) && data.bulletins.length > 0) {
          setBulletins(data.bulletins);
          setCurrentBulletinId(data.bulletins[0].id);
        }
      })
      .catch((err) => {
        console.warn('Usando dados locais iniciais:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const currentBulletin = bulletins.find((b) => b.id === currentBulletinId) || bulletins[0] || initialBulletin;

  // Save or update bulletin
  const handleSaveBulletin = async (updated: Bulletin) => {
    try {
      const res = await fetch('/api/bulletins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success && data.bulletin) {
        setBulletins((prev) => {
          const idx = prev.findIndex((b) => b.id === data.bulletin.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = data.bulletin;
            return next;
          }
          return [data.bulletin, ...prev];
        });
        setCurrentBulletinId(data.bulletin.id);
      }
    } catch (err) {
      console.error('Falha ao salvar no backend, atualizando estado local:', err);
      setBulletins((prev) => {
        const idx = prev.findIndex((b) => b.id === updated.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updated;
          return next;
        }
        return [updated, ...prev];
      });
    }
  };

  // Direct file upload handler from Navbar or Hero
  const handleDirectFileUpload = async (file: File) => {
    setActiveTab('admin');

    if (file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf') {
      try {
        const objectUrl = URL.createObjectURL(file);
        setUploadedPdfUrl(objectUrl);
        setUploadedPdfName(file.name);

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

        const res = await fetch('/api/bulletins/upload-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64,
            fileName: file.name,
            mimeType: 'application/pdf',
            title: currentBulletin.title,
            edition: currentBulletin.edition,
            date: currentBulletin.date,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.bulletin) {
            await handleSaveBulletin(data.bulletin);
            return;
          }
        }
      } catch (err) {
        console.error('Falha no upload direto do PDF:', err);
      }
    }
  };

  // Download standalone HTML file with multi-layer fallback
  const handleDownloadHtml = async () => {
    try {
      const html = generateStandaloneHtml(currentBulletin);
      const safeEdition = currentBulletin.edition.replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `boletim-${safeEdition}.html`;
      const serverUrl = `/api/bulletins/${currentBulletin.id}/html?download=true`;

      // 1. Sync state to server in background
      fetch('/api/bulletins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentBulletin),
      }).catch(() => {});

      // 2. Client Blob download
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Keep blob URL active for 60 seconds (never revoke immediately!)
      setTimeout(() => {
        try {
          URL.revokeObjectURL(blobUrl);
        } catch (_) {}
      }, 60000);

      // 3. Set persistent toast with direct click option
      setDownloadToast({ fileName, serverUrl, blobUrl });
    } catch (err) {
      console.error('Erro ao baixar HTML:', err);
      window.open(`/api/bulletins/${currentBulletin.id}/html?download=true`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bulletins={bulletins}
        currentBulletinId={currentBulletinId}
        onSelectBulletin={(id) => setCurrentBulletinId(id)}
        onDownloadHtml={handleDownloadHtml}
        onUploadFile={handleDirectFileUpload}
      />

      <main className="flex-1">
        {activeTab === 'website' && (
          <PublicWebsiteView
            bulletin={currentBulletin}
            onEditInAdmin={() => setActiveTab('admin')}
            onOpenSocial={() => setActiveTab('social')}
            onUploadFile={handleDirectFileUpload}
            onDownloadHtml={handleDownloadHtml}
          />
        )}

        {activeTab === 'admin' && (
          <AdminUploadView
            currentBulletin={currentBulletin}
            onSaveBulletin={handleSaveBulletin}
            onViewPublicSite={() => setActiveTab('website')}
            onOpenSocial={() => setActiveTab('social')}
            initialPdfUrl={uploadedPdfUrl}
            initialPdfName={uploadedPdfName}
          />
        )}

        {activeTab === 'social' && (
          <SocialExportView bulletin={currentBulletin} />
        )}

        {activeTab === 'code' && (
          <ExportHtmlModal
            bulletin={currentBulletin}
            onDownloadHtml={handleDownloadHtml}
          />
        )}
      </main>

      {/* Floating Download Feedback Toast */}
      {downloadToast && (
        <div
          id="toast-download-feedback"
          className="fixed bottom-5 right-5 left-5 sm:left-auto max-w-md bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 z-50 flex flex-col gap-2 transition-all animate-fade-in"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-lg">✅</span>
              <div>
                <p className="text-sm font-bold">Arquivo HTML Pronto!</p>
                <p className="text-xs text-slate-300">
                  {downloadToast.fileName}
                </p>
              </div>
            </div>
            <button
              onClick={() => setDownloadToast(null)}
              className="text-slate-400 hover:text-white text-sm px-1 cursor-pointer"
              title="Fechar"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-slate-400">
            O download foi acionado. Se o navegador não salvou automaticamente, use as opções abaixo:
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <a
              href={downloadToast.serverUrl}
              download={downloadToast.fileName}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              ⬇️ Baixar Direto (Servidor)
            </a>
            <a
              href={`/api/bulletins/${currentBulletin.id}/html`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-600"
            >
              🌐 Abrir em Nova Aba
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
