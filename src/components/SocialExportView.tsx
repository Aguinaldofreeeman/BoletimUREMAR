import React, { useState, useEffect } from 'react';
import { Bulletin, SocialPost, SocialDispatchLog } from '../types';
import { generateSocialPosts } from '../utils/socialGenerator';
import {
  Share2,
  Send,
  Copy,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Radio,
  Clock,
  Terminal,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface SocialExportViewProps {
  bulletin: Bulletin;
}

export const SocialExportView: React.FC<SocialExportViewProps> = ({ bulletin }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<'whatsapp' | 'instagram' | 'facebook' | 'twitter' | 'linkedin'>('whatsapp');
  const [posts, setPosts] = useState<Record<string, SocialPost>>({});
  const [copied, setCopied] = useState<string | null>(null);

  // API / Webhook integration settings
  const [webhookUrl, setWebhookUrl] = useState<string>('https://api.disparo-educacao.sp.gov.br/v1/webhook');
  const [apiKey, setApiKey] = useState<string>('sec_live_ure_marilia_2026');
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishStatus, setPublishStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Dispatch history
  const [logs, setLogs] = useState<SocialDispatchLog[]>([]);

  useEffect(() => {
    const generated = generateSocialPosts(bulletin);
    setPosts(generated);

    // Fetch initial logs
    fetch('/api/social/history')
      .then((res) => res.json())
      .then((data) => {
        if (data.logs) setLogs(data.logs);
      })
      .catch(() => {});
  }, [bulletin]);

  const handleCopy = (text: string, platformKey: string) => {
    navigator.clipboard.writeText(text);
    setCopied(platformKey);
    setTimeout(() => setCopied(null), 2500);
  };

  const handleOpenWhatsAppWeb = (text: string) => {
    const encoded = encodeURIComponent(text);
    window.open(`https://web.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handlePublishApi = async () => {
    const activePost = posts[selectedPlatform];
    if (!activePost) return;

    setIsPublishing(true);
    setPublishStatus(null);

    try {
      const res = await fetch('/api/social/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: selectedPlatform,
          content: activePost.content,
          webhookUrl,
          apiKey,
          bulletinId: bulletin.id,
          edition: bulletin.edition,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPublishStatus({
          type: 'success',
          message: data.log?.responseMessage || `Disparo automático para ${selectedPlatform.toUpperCase()} executado com sucesso!`,
        });
        if (data.allLogs) {
          setLogs(data.allLogs);
        }
      } else {
        setPublishStatus({
          type: 'error',
          message: data.error || 'Falha ao processar disparo via API.',
        });
      }
    } catch (err: any) {
      setPublishStatus({
        type: 'error',
        message: `Erro na comunicação com a API: ${err.message}`,
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const currentPost = posts[selectedPlatform];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'whatsapp':
        return <MessageCircle className="w-5 h-5 text-emerald-500" />;
      case 'instagram':
        return <Instagram className="w-5 h-5 text-pink-500" />;
      case 'facebook':
        return <Facebook className="w-5 h-5 text-blue-600" />;
      case 'twitter':
        return <Twitter className="w-5 h-5 text-sky-500" />;
      case 'linkedin':
        return <Linkedin className="w-5 h-5 text-blue-700" />;
      default:
        return <Share2 className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">
                Automação Integrada
              </span>
              <span className="text-xs text-slate-500 font-medium">{bulletin.edition}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Central de Exportação para Redes Sociais & API
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Posts formatados especificamente para cada canal de comunicação com suporte a disparo automático via Webhook/API.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
              API Pronta para Disparo
            </span>
          </div>
        </div>

        {/* Channels Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {(['whatsapp', 'instagram', 'facebook', 'twitter', 'linkedin'] as const).map((p) => {
            const isSelected = selectedPlatform === p;
            return (
              <button
                key={p}
                onClick={() => setSelectedPlatform(p)}
                className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 text-center ${
                  isSelected
                    ? 'bg-white border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                    : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                {getPlatformIcon(p)}
                <span className="text-xs font-bold capitalize text-slate-800">
                  {p === 'twitter' ? 'X / Twitter' : p}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Grid: Post Preview + API Dispatcher */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Post Content Preview (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                {getPlatformIcon(selectedPlatform)}
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {currentPost?.title || 'Conteúdo Formatado'}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {currentPost?.characterCount || 0} caracteres
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedPlatform === 'whatsapp' && (
                  <button
                    onClick={() => currentPost && handleOpenWhatsAppWeb(currentPost.content)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                    title="Abrir diretamente no WhatsApp Web para enviar aos grupos"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>WhatsApp Web</span>
                  </button>
                )}

                <button
                  onClick={() => currentPost && handleCopy(currentPost.content, selectedPlatform)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                  title="Copiar texto para área de transferência"
                >
                  {copied === selectedPlatform ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Formatted Text Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 font-mono text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap max-h-[420px] overflow-y-auto select-all">
              {currentPost?.content}
            </div>

            {/* Hashtags */}
            {currentPost?.hashtags && currentPost.hashtags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-2">
                <span className="text-xs font-bold text-slate-500">Hashtags recomendadas:</span>
                {currentPost.hashtags.map((tag, tIdx) => (
                  <span key={tIdx} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* API / Webhook Dispatcher Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Dispatch Box */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-slate-900 text-base">Disparo Automático via API</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Integração direta com Webhook (Zapier, Make, n8n, Meta API ou canal do Telegram).
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    URL do Webhook / Endpoint da API
                  </label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://sua-api.com/webhook/postar"
                    className="w-full p-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Chave de Autenticação / Token Bearer
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              {publishStatus && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                    publishStatus.type === 'success'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-red-50 text-red-900 border border-red-200'
                  }`}
                >
                  {publishStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <span>{publishStatus.message}</span>
                </div>
              )}

              <button
                id="btn-publish-social-api"
                onClick={handlePublishApi}
                disabled={isPublishing}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isPublishing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Disparando via API...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Disparar para {selectedPlatform.toUpperCase()} Agora</span>
                  </>
                )}
              </button>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-[11px] text-slate-500 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  O disparo envia um payload JSON padronizado com o texto otimizado, identificador do boletim e hash de autenticação.
                </span>
              </div>
            </div>

            {/* Audit Logs of Dispatches */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <Terminal className="w-4 h-4 text-slate-600" />
                  <span>Histórico de Disparos via API</span>
                </div>
                <span className="text-[10px] text-slate-400">Em tempo real</span>
              </div>

              {logs.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">
                  Nenhum disparo registrado ainda. Clique em "Disparar para..." para testar a integração.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 uppercase text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                          {log.platform}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate">{log.responseMessage}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
