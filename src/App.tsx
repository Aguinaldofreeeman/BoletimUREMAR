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

  // Download standalone HTML file
  const handleDownloadHtml = () => {
    const html = generateStandaloneHtml(currentBulletin);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boletim-${currentBulletin.edition.replace(/[^a-zA-Z0-9_-]/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
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
    </div>
  );
}
