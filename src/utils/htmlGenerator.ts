import { Bulletin, BulletinItem } from '../types';

export function generateStandaloneHtml(bulletin: Bulletin): string {
  const initialJson = JSON.stringify(bulletin);

  return `<!DOCTYPE html>
<html lang="pt-BR" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title id="metaTitle">${escapeHtml(bulletin.title)} - ${escapeHtml(bulletin.edition)} | ${escapeHtml(bulletin.institution)}</title>
  <meta name="description" id="metaDesc" content="${escapeHtml(bulletin.summary)}">
  <meta property="og:title" id="ogTitle" content="${escapeHtml(bulletin.title)} - ${escapeHtml(bulletin.edition)}">
  <meta property="og:description" id="ogDesc" content="${escapeHtml(bulletin.summary)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&display=swap" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <style>
    :root {
      --primary: #1e3a8a;
      --primary-light: #3b82f6;
      --accent: #15803d;
      --accent-bg: #f0fdf4;
      --bg: #f8fafc;
      --surface: #ffffff;
      --text: #0f172a;
      --text-muted: #475569;
      --border: #e2e8f0;
      --sidebar-w: 360px;
      --radius: 12px;
      --shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03);
    }

    [data-theme="dark"] {
      --primary: #60a5fa;
      --primary-light: #93c5fd;
      --accent: #4ade80;
      --accent-bg: #064e3b;
      --bg: #0f172a;
      --surface: #1e293b;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --border: #334155;
      --shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.3);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* Top Bar */
    .top-header {
      background: #0f172a;
      color: #fff;
      padding: 0.65rem 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 10px rgba(0,0,0,0.15);
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .top-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .top-badge {
      background: #2563eb;
      color: white;
      font-weight: 800;
      font-size: 0.75rem;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      letter-spacing: 0.05em;
    }
    .top-actions {
      display: flex;
      gap: 0.4rem;
      align-items: center;
      flex-wrap: wrap;
    }
    .top-btn {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.2);
      color: white;
      padding: 0.4rem 0.75rem;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.2s;
    }
    .top-btn:hover { background: rgba(255,255,255,0.2); transform: translateY(-1px); }
    
    .top-btn-admin {
      background: #2563eb;
      border-color: #3b82f6;
      color: #fff;
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
    }
    .top-btn-admin:hover {
      background: #1d4ed8;
      border-color: #60a5fa;
    }

    /* Hero Banner */
    .hero-banner {
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #0369a1 100%);
      color: white;
      padding: 2.75rem 1.5rem 3.25rem;
      text-align: center;
      position: relative;
    }
    .hero-container {
      max-width: 980px;
      margin: 0 auto;
    }
    .hero-inst {
      font-size: 0.95rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      font-weight: 700;
      opacity: 0.9;
      margin-bottom: 0.5rem;
    }
    .hero-title {
      font-size: 2.4rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 0.6rem;
      line-height: 1.2;
    }
    .hero-edition {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.18);
      border: 1px solid rgba(255, 255, 255, 0.35);
      backdrop-filter: blur(8px);
      padding: 0.4rem 1.25rem;
      border-radius: 9999px;
      font-weight: 700;
      font-size: 1.05rem;
      margin-bottom: 1rem;
    }
    .hero-meta {
      font-size: 0.9rem;
      opacity: 0.9;
      display: flex;
      justify-content: center;
      gap: 1.25rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }
    .hero-summary {
      font-size: 0.95rem;
      max-width: 780px;
      margin: 0.5rem auto 0;
      line-height: 1.6;
      opacity: 0.95;
      background: rgba(0,0,0,0.15);
      padding: 0.75rem 1.25rem;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.15);
    }

    /* Status Bar when customized locally */
    .local-notice-bar {
      background: #eff6ff;
      border-bottom: 1px solid #bfdbfe;
      color: #1e40af;
      padding: 0.5rem 1.25rem;
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .local-notice-bar.hidden { display: none; }

    /* Main Layout */
    .layout-container {
      max-width: 1320px;
      margin: 0 auto;
      padding: 2rem 1.25rem;
      display: grid;
      grid-template-columns: var(--sidebar-w) 1fr;
      gap: 2rem;
      align-items: start;
    }

    /* Sidebar / Table of Contents */
    .sidebar {
      position: sticky;
      top: 4.5rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.25rem;
      box-shadow: var(--shadow);
      max-height: calc(100vh - 6rem);
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border);
    }
    .sidebar-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .search-input {
      width: 100%;
      padding: 0.6rem 0.85rem;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--bg);
      color: var(--text);
      font-size: 0.85rem;
      outline: none;
      transition: all 0.2s;
    }
    .search-input:focus {
      border-color: var(--primary-light);
      background: var(--surface);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }
    .category-filter {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      max-height: 80px;
      overflow-y: auto;
    }
    .filter-btn {
      background: var(--bg);
      border: 1px solid var(--border);
      color: var(--text-muted);
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }
    .filter-btn:hover {
      border-color: var(--primary-light);
      color: var(--text);
    }
    .filter-btn.active {
      background: var(--primary-light);
      color: white;
      border-color: var(--primary-light);
    }

    .toc-list {
      list-style: none;
      overflow-y: auto;
      flex: 1;
      padding-right: 0.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .toc-item {
      border-radius: 8px;
      transition: background 0.15s;
    }
    .toc-item:hover {
      background: var(--bg);
    }
    .toc-link {
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
      padding: 0.5rem 0.6rem;
      color: var(--text);
      text-decoration: none;
      font-size: 0.82rem;
      line-height: 1.35;
      font-weight: 500;
    }
    .toc-num {
      background: rgba(59, 130, 246, 0.12);
      color: var(--primary-light);
      font-weight: 700;
      font-size: 0.75rem;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      shrink-0: 0;
    }
    .toc-text {
      flex: 1;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Content Articles */
    .content-area {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .bulletin-article {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.75rem;
      box-shadow: var(--shadow);
      scroll-margin-top: 5rem;
      transition: box-shadow 0.2s;
    }
    .bulletin-article:hover {
      box-shadow: 0 6px 18px -3px rgba(0, 0, 0, 0.08);
    }
    .article-header {
      margin-bottom: 1rem;
    }
    .article-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-bottom: 0.6rem;
    }
    .badge {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
    }
    .category-badge { background: #e0e7ff; color: #3730a3; }
    .department-badge { background: #f1f5f9; color: #475569; }
    .audience-badge { background: #fef3c7; color: #92400e; }

    .article-title {
      font-size: 1.45rem;
      font-weight: 800;
      color: var(--text);
      line-height: 1.3;
      margin-bottom: 0.75rem;
    }
    .article-info-box {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.65rem 0.9rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 0.5rem;
      font-size: 0.85rem;
      margin-bottom: 1rem;
    }
    .info-row { display: flex; align-items: center; gap: 0.4rem; }
    .article-content {
      font-size: 0.95rem;
      line-height: 1.65;
      color: var(--text);
      white-space: pre-line;
      margin-bottom: 1rem;
    }
    .notes-box {
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 0.85rem 1rem;
      border-radius: 0 8px 8px 0;
      font-size: 0.85rem;
      color: #78350f;
      margin-bottom: 1rem;
    }
    .notes-title { font-weight: 700; margin-bottom: 0.35rem; }
    .notes-box ul { padding-left: 1.25rem; }
    .links-box {
      border-top: 1px solid var(--border);
      padding-top: 0.85rem;
      margin-top: 0.85rem;
    }
    .links-title { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase; }
    .links-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .link-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.4rem 0.8rem;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
      border-radius: 6px;
      text-decoration: none;
      font-size: 0.8rem;
      font-weight: 600;
      transition: all 0.15s;
    }
    .link-btn:hover { background: #dbeafe; }
    .article-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-top: 0.85rem;
      padding-top: 0.65rem;
      border-top: 1px solid var(--border);
    }
    .tag-chip {
      font-size: 0.72rem;
      color: var(--text-muted);
      background: var(--bg);
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
    }

    /* Footer */
    .site-footer {
      background: #0f172a;
      color: #94a3b8;
      padding: 2.5rem 1.5rem;
      text-align: center;
      margin-top: 3rem;
      border-top: 1px solid #1e293b;
    }
    .footer-inner {
      max-width: 800px;
      margin: 0 auto;
    }
    .footer-title {
      color: #f8fafc;
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    /* Back to Top */
    .back-to-top {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      background: var(--primary-light);
      color: white;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(0,0,0,0.25);
      font-weight: bold;
      opacity: 0;
      pointer-events: none;
      transition: all 0.2s;
      z-index: 90;
    }
    .back-to-top.visible { opacity: 1; pointer-events: auto; }
    .back-to-top:hover { transform: translateY(-3px); }

    /* ========================================================================= */
    /* ADMIN PANEL MODAL (FULL FUNCTIONAL EMBEDDED ENGINE) */
    /* ========================================================================= */
    .admin-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      overflow-y: auto;
    }
    .admin-overlay.hidden { display: none !important; }
    .admin-modal {
      background: var(--surface);
      border-radius: 16px;
      width: 100%;
      max-width: 900px;
      max-height: 92vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
      border: 1px solid var(--border);
      overflow: hidden;
      color: var(--text);
    }
    .admin-modal-header {
      padding: 1.25rem 1.5rem;
      background: #0f172a;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #334155;
    }
    .admin-modal-title {
      font-size: 1.15rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .admin-modal-close {
      background: rgba(255,255,255,0.1);
      border: none;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      font-size: 1.25rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    .admin-modal-close:hover { background: rgba(255,255,255,0.25); }

    .admin-tabs {
      display: flex;
      background: var(--bg);
      border-bottom: 1px solid var(--border);
      padding: 0 1rem;
      gap: 0.5rem;
      overflow-x: auto;
    }
    .admin-tab-btn {
      padding: 0.75rem 1rem;
      font-size: 0.85rem;
      font-weight: 600;
      border: none;
      background: none;
      color: var(--text-muted);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      white-space: nowrap;
      transition: all 0.15s;
    }
    .admin-tab-btn:hover { color: var(--text); }
    .admin-tab-btn.active {
      color: var(--primary-light);
      border-bottom-color: var(--primary-light);
      background: var(--surface);
    }

    .admin-body {
      padding: 1.5rem;
      overflow-y: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .admin-tab-content { display: none; flex-direction: column; gap: 1.25rem; }
    .admin-tab-content.active { display: flex; }

    .dropzone {
      border: 2px dashed #94a3b8;
      border-radius: 12px;
      padding: 2rem 1.5rem;
      text-align: center;
      background: var(--bg);
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
    }
    .dropzone:hover {
      border-color: var(--primary-light);
      background: #eff6ff;
    }
    .dropzone input[type="file"] {
      position: absolute;
      inset: 0;
      opacity: 0;
      cursor: pointer;
      width: 100%;
      height: 100%;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .form-label {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
    }
    .form-input, .form-textarea, .form-select {
      width: 100%;
      padding: 0.65rem 0.85rem;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
      font-size: 0.85rem;
      font-family: inherit;
      outline: none;
      transition: border 0.2s;
    }
    .form-input:focus, .form-textarea:focus, .form-select:focus {
      border-color: var(--primary-light);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      padding: 0.65rem 1.2rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-primary { background: #2563eb; color: white; }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-success { background: #16a34a; color: white; }
    .btn-success:hover { background: #15803d; }
    .btn-secondary { background: var(--bg); color: var(--text); border: 1px solid var(--border); }
    .btn-secondary:hover { background: var(--border); }
    .btn-danger { background: #dc2626; color: white; }
    .btn-danger:hover { background: #b91c1c; }

    .items-list-box {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-height: 380px;
      overflow-y: auto;
      padding-right: 0.25rem;
    }
    .admin-item-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      gap: 0.75rem;
    }
    .admin-item-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text);
      line-height: 1.3;
    }
    .admin-item-meta {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 0.2rem;
    }
    .item-actions {
      display: flex;
      gap: 0.35rem;
      shrink-0: 0;
    }
    .btn-icon {
      padding: 0.35rem 0.6rem;
      font-size: 0.75rem;
      border-radius: 6px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
      cursor: pointer;
    }
    .btn-icon:hover { background: var(--border); }

    .social-preview-box {
      background: #0f172a;
      color: #e2e8f0;
      padding: 1rem;
      border-radius: 8px;
      font-family: monospace;
      font-size: 0.85rem;
      white-space: pre-wrap;
      max-height: 320px;
      overflow-y: auto;
    }

    .admin-modal-footer {
      padding: 1rem 1.5rem;
      background: var(--bg);
      border-top: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    /* Notification toast */
    .toast-msg {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: #0f172a;
      color: #fff;
      padding: 0.75rem 1.5rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      z-index: 2000;
      opacity: 0;
      transition: all 0.3s ease;
      pointer-events: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .toast-msg.show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }

    /* Responsive */
    @media (max-width: 900px) {
      .layout-container { grid-template-columns: 1fr; }
      .sidebar { position: relative; top: 0; max-height: 380px; }
      .hero-title { font-size: 1.85rem; }
      .admin-modal { max-height: 98vh; }
    }

    /* Print styles */
    @media print {
      .top-header, .sidebar, .back-to-top, .search-box, .category-filter, .admin-overlay, .local-notice-bar { display: none !important; }
      .layout-container { display: block; padding: 0; }
      .bulletin-article { box-shadow: none; border: 1px solid #ccc; page-break-inside: avoid; margin-bottom: 2rem; }
      body { background: white; color: black; }
    }
  </style>
</head>
<body>

  <!-- Top Bar -->
  <header class="top-header">
    <div class="top-brand">
      <span class="top-badge">SEDUC-SP</span>
      <span id="headerInstName">${escapeHtml(bulletin.institution)}</span>
    </div>
    <div class="top-actions">
      <button class="top-btn top-btn-admin" onclick="openAdminModal()" title="Abrir Painel Administrativo para subir novo boletim e editar pautas">
        ⚙️ Painel Admin (Upload)
      </button>
      <button class="top-btn" onclick="openSocialTab()" title="Gerar texto para WhatsApp e Redes">
        📱 Redes Sociais
      </button>
      <button class="top-btn" onclick="toggleTheme()" title="Alternar Modo Escuro/Claro">
        🌓 Tema
      </button>
      <button class="top-btn" onclick="window.print()" title="Imprimir ou Salvar em PDF">
        🖨️ Imprimir
      </button>
      <button class="top-btn" onclick="shareBulletin()" title="Compartilhar Link">
        🔗 Compartilhar
      </button>
    </div>
  </header>

  <!-- Notice when viewing local changes -->
  <div id="localNoticeBar" class="local-notice-bar hidden">
    <span>💡 Você está visualizando uma edição atualizada localmente neste navegador (<strong id="localNoticeEdition"></strong>).</span>
    <div style="display:flex; gap:0.5rem; align-items:center;">
      <button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="openAdminModal()">⚙️ Abrir Admin</button>
      <button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="resetToInitialBulletin()">Restaurar Original</button>
    </div>
  </div>

  <!-- Hero Section -->
  <section class="hero-banner">
    <div class="hero-container">
      <p class="hero-inst" id="heroInst">${escapeHtml(bulletin.institution)}</p>
      <h1 class="hero-title" id="heroTitle">${escapeHtml(bulletin.title)}</h1>
      <div class="hero-edition" id="heroEdition">📑 ${escapeHtml(bulletin.edition)}</div>
      <div class="hero-meta">
        <span id="heroDate">📅 ${escapeHtml(bulletin.date)}</span>
        <span id="heroLeader">👤 ${escapeHtml(bulletin.leader)}</span>
        <span id="heroEmail">✉️ ${escapeHtml(bulletin.email)}</span>
      </div>
      <p class="hero-summary" id="heroSummary">${escapeHtml(bulletin.summary)}</p>
    </div>
  </section>

  <!-- Main Content Layout -->
  <main class="layout-container">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-title">
          <span>📑 Sumário da Edição</span>
        </div>
        <span id="tocCount" style="font-size: 0.8rem; font-weight: 700; color: var(--primary-light); background: rgba(59,130,246,0.1); padding: 0.15rem 0.5rem; border-radius: 9999px;">
          ${bulletin.items.length} itens
        </span>
      </div>

      <div class="search-box">
        <input type="text" id="searchInput" class="search-input" placeholder="Buscar pauta, escola, termo..." oninput="handleSearch(this.value)">
      </div>

      <div class="category-filter" id="categoryFilter">
        <!-- populated dynamically -->
      </div>

      <ul class="toc-list" id="tocList">
        <!-- populated dynamically -->
      </ul>

      <div style="padding-top: 0.5rem; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-muted);">
        <span onclick="openAdminModal()" style="color: var(--primary-light); cursor: pointer; font-weight: 600;">+ Adicionar Pauta</span>
        <a href="#" style="color: var(--text-muted); text-decoration: none;">↑ Topo</a>
      </div>
    </aside>

    <section class="content-area" id="articlesContainer">
      <!-- populated dynamically -->
    </section>
  </main>

  <!-- Footer -->
  <footer class="site-footer">
    <div class="footer-inner">
      <h3 class="footer-title" id="footerInst">${escapeHtml(bulletin.institution)}</h3>
      <p id="footerLeader">${escapeHtml(bulletin.leader)}</p>
      <p style="margin-top: 0.5rem; font-size: 0.88rem;">Boletim Semanal Informativo • Publicado online • Secretaria da Educação do Estado de São Paulo</p>
      <p style="margin-top: 0.5rem; font-size: 0.8rem; opacity: 0.7;" id="footerEmail">Contato: ${escapeHtml(bulletin.email)}</p>
    </div>
  </footer>

  <a href="#" class="back-to-top" id="backToTop" title="Voltar ao topo">↑</a>

  <!-- ========================================================================= -->
  <!-- MODAL ADMIN / UPLOAD (EMBEDDED) -->
  <!-- ========================================================================= -->
  <div id="adminModal" class="admin-overlay hidden">
    <div class="admin-modal">
      
      <div class="admin-modal-header">
        <div class="admin-modal-title">
          <span>⚙️ Painel de Administração & Upload do Boletim</span>
        </div>
        <button class="admin-modal-close" onclick="closeAdminModal()" title="Fechar">✕</button>
      </div>

      <div class="admin-tabs">
        <button class="admin-tab-btn active" onclick="switchAdminTab('upload')">📤 1. Upload & Importar</button>
        <button class="admin-tab-btn" onclick="switchAdminTab('metadata')">🏢 2. Cabeçalho / Edição</button>
        <button class="admin-tab-btn" onclick="switchAdminTab('items')">📑 3. Gerenciar Matérias (<span id="tabItemCount">0</span>)</button>
        <button class="admin-tab-btn" onclick="switchAdminTab('social')">📱 4. Redes Sociais</button>
        <button class="admin-tab-btn" onclick="switchAdminTab('export')">💾 5. Salvar & Baixar</button>
      </div>

      <div class="admin-body">
        
        <!-- Tab 1: Upload & Importar -->
        <div id="tab-upload" class="admin-tab-content active">
          <div>
            <h3 style="font-size:1.1rem; font-weight:800; margin-bottom:0.25rem;">Subir Conteúdo da Nova Edição Semanal</h3>
            <p style="font-size:0.85rem; color:var(--text-muted);">
              Arraste o arquivo do boletim (PDF, TXT, JSON, MD, DOC) ou cole o texto abaixo para organizar automaticamente todas as matérias e sumário.
            </p>
          </div>

          <div class="dropzone" id="dropzoneEl" onclick="triggerAdminFileInput()" title="Clique para abrir a seleção de arquivos">
            <input type="file" id="fileInputEl" accept=".pdf,.txt,.md,.json,.doc,.docx,application/pdf" onchange="handleFileSelected(event)" style="display:none;">
            <div style="pointer-events:none;">
              <div style="font-size:2.2rem; margin-bottom:0.5rem;">📄</div>
              <p style="font-weight:700; font-size:0.95rem;">Clique para selecionar ou arraste o arquivo do Boletim aqui (PDF, TXT, JSON)</p>
              <p style="font-size:0.78rem; color:var(--text-muted); margin-top:0.25rem;">Suporta PDF nativo (extração de texto página por página), TXT, Markdown e Backup JSON</p>
              <span id="fileNameLabel" style="display:inline-block; margin-top:0.5rem; font-size:0.8rem; font-weight:600; color:var(--primary-light);"></span>
            </div>
            <div style="margin-top:0.85rem;">
              <button type="button" class="btn btn-primary" onclick="event.stopPropagation(); triggerAdminFileInput();" style="font-size:0.85rem; padding:0.55rem 1.25rem; font-weight:700;">
                📂 Escolher Arquivo PDF / TXT
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Ou Cole o Texto do Boletim Semanal Diretamente:</label>
            <textarea id="rawTextInput" class="form-textarea" rows="7" placeholder="Cole aqui as matérias, convocações, pautas pedagógicas e boas práticas do boletim desta semana..."></textarea>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
            <button class="btn btn-secondary" onclick="loadSampleText()">Carregar Texto Modelo</button>
            <button class="btn btn-primary" onclick="processRawText()">⚡ Processar & Estruturar Matérias</button>
          </div>
        </div>

        <!-- Tab 2: Metadados / Cabeçalho -->
        <div id="tab-metadata" class="admin-tab-content">
          <div>
            <h3 style="font-size:1.1rem; font-weight:800; margin-bottom:0.25rem;">Cabeçalho e Informações Institucionais</h3>
            <p style="font-size:0.85rem; color:var(--text-muted);">Configure os dados que aparecem no topo do site e nas exportações.</p>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Título Principal</label>
              <input type="text" id="metaInputTitle" class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label">Edição / Número</label>
              <input type="text" id="metaInputEdition" class="form-input" placeholder="Ex: Ano VI – nº36/2026">
            </div>
            <div class="form-group">
              <label class="form-label">Data de Publicação</label>
              <input type="text" id="metaInputDate" class="form-input" placeholder="Ex: Marília, 14 de setembro de 2026">
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Órgão / Instituição</label>
              <input type="text" id="metaInputInstitution" class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label">Dirigente Regional / Responsável</label>
              <input type="text" id="metaInputLeader" class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label">E-mail de Contato</label>
              <input type="text" id="metaInputEmail" class="form-input">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Resumo Executivo da Semana</label>
            <textarea id="metaInputSummary" class="form-textarea" rows="3" placeholder="Destaques dos principais comunicados desta edição..."></textarea>
          </div>

          <div style="display:flex; justify-content:flex-end;">
            <button class="btn btn-primary" onclick="applyMetadataChanges()">Salvar Cabeçalho</button>
          </div>
        </div>

        <!-- Tab 3: Gerenciar Matérias -->
        <div id="tab-items" class="admin-tab-content">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
            <div>
              <h3 style="font-size:1.1rem; font-weight:800;">Matérias do Sumário</h3>
              <p style="font-size:0.85rem; color:var(--text-muted);">Edite, exclua ou adicione matérias individuais.</p>
            </div>
            <button class="btn btn-primary" onclick="openItemEditorNew()">+ Nova Matéria</button>
          </div>

          <div class="items-list-box" id="adminItemsList">
            <!-- populated by JS -->
          </div>

          <!-- Single Item Form (embedded modal within tab) -->
          <div id="singleItemEditor" style="display:none; background:var(--surface); border:2px solid var(--primary-light); border-radius:12px; padding:1.25rem; margin-top:1rem;">
            <h4 style="font-weight:800; font-size:1rem; margin-bottom:1rem;" id="itemEditorHeader">Editar Matéria</h4>
            
            <div class="form-group" style="margin-bottom:0.75rem;">
              <label class="form-label">Título da Matéria</label>
              <input type="text" id="itemEditTitle" class="form-input" required>
            </div>

            <div class="form-grid" style="margin-bottom:0.75rem;">
              <div class="form-group">
                <label class="form-label">Categoria</label>
                <input type="text" id="itemEditCategory" class="form-input" placeholder="Ex: Formação Pedagógica, Avaliação...">
              </div>
              <div class="form-group">
                <label class="form-label">Departamento / Núcleo</label>
                <input type="text" id="itemEditDept" class="form-input" placeholder="Ex: DIAVAL, SUPED, EFAPE...">
              </div>
              <div class="form-group">
                <label class="form-label">Público-Alvo</label>
                <input type="text" id="itemEditAudience" class="form-input" placeholder="Ex: Diretores e Professores...">
              </div>
            </div>

            <div class="form-grid" style="margin-bottom:0.75rem;">
              <div class="form-group">
                <label class="form-label">Data / Período</label>
                <input type="text" id="itemEditDate" class="form-input" placeholder="Ex: 15/09/2026 das 08h30 às 17h30">
              </div>
              <div class="form-group">
                <label class="form-label">Local</label>
                <input type="text" id="itemEditLocation" class="form-input" placeholder="Ex: Auditório Regional">
              </div>
            </div>

            <div class="form-group" style="margin-bottom:0.75rem;">
              <label class="form-label">Conteúdo Completo</label>
              <textarea id="itemEditContent" class="form-textarea" rows="5"></textarea>
            </div>

            <div class="form-group" style="margin-bottom:0.75rem;">
              <label class="form-label">Pontos de Atenção / Observações (um por linha)</label>
              <textarea id="itemEditNotes" class="form-textarea" rows="3" placeholder="Ponto de atenção 1&#10;Ponto de atenção 2"></textarea>
            </div>

            <div class="form-group" style="margin-bottom:0.75rem;">
              <label class="form-label">Links (Formato: Rótulo | URL, um por linha)</label>
              <textarea id="itemEditLinks" class="form-textarea" rows="2" placeholder="Formulário de Inscrição | https://forms.gle/..."></textarea>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
              <button class="btn btn-secondary" onclick="closeItemEditor()">Cancelar</button>
              <button class="btn btn-success" onclick="saveItemEditor()">Salvar Matéria</button>
            </div>
          </div>
        </div>

        <!-- Tab 4: Redes Sociais -->
        <div id="tab-social" class="admin-tab-content">
          <div>
            <h3 style="font-size:1.1rem; font-weight:800; margin-bottom:0.25rem;">Exportador para WhatsApp e Redes</h3>
            <p style="font-size:0.85rem; color:var(--text-muted);">Textos formatados prontos para envio aos grupos de gestores e professores.</p>
          </div>

          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <button class="btn btn-secondary active" id="btnSocWhatsApp" onclick="switchSocialPlatform('whatsapp')">💬 WhatsApp</button>
            <button class="btn btn-secondary" id="btnSocInstagram" onclick="switchSocialPlatform('instagram')">📸 Instagram</button>
            <button class="btn btn-secondary" id="btnSocFacebook" onclick="switchSocialPlatform('facebook')">📘 Facebook</button>
            <button class="btn btn-secondary" id="btnSocLinkedin" onclick="switchSocialPlatform('linkedin')">💼 LinkedIn</button>
          </div>

          <div class="social-preview-box" id="socialPreviewBox">
            <!-- text generated here -->
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
            <span id="socialCharCount" style="font-size:0.8rem; color:var(--text-muted);"></span>
            <div style="display:flex; gap:0.5rem;">
              <button class="btn btn-secondary" onclick="copySocialText()">📋 Copiar Texto</button>
              <button class="btn btn-success" onclick="openWhatsAppDirect()">🟢 Abrir no WhatsApp Web</button>
            </div>
          </div>
        </div>

        <!-- Tab 5: Salvar & Baixar -->
        <div id="tab-export" class="admin-tab-content">
          <div>
            <h3 style="font-size:1.1rem; font-weight:800; margin-bottom:0.25rem;">Salvar e Gerar Novo Arquivo HTML</h3>
            <p style="font-size:0.85rem; color:var(--text-muted);">
              Você pode aplicar as alterações imediatamente nesta página aberta ou baixar um novo arquivo HTML completo com todas as atualizações.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1rem;">
            
            <div style="border:1px solid var(--border); border-radius:12px; padding:1.25rem; background:var(--bg); display:flex; flex-direction:column; justify-content:space-between; gap:1rem;">
              <div>
                <h4 style="font-weight:700; font-size:0.95rem; margin-bottom:0.35rem;">1. Atualizar Esta Página Agora</h4>
                <p style="font-size:0.8rem; color:var(--text-muted); line-height:1.5;">
                  Grava as alterações na memória deste navegador. O site, o sumário e as matérias serão re-renderizados imediatamente.
                </p>
              </div>
              <button class="btn btn-primary" onclick="applyAndSaveToPage()">
                ✅ Aplicar & Atualizar Página
              </button>
            </div>

            <div style="border:1px solid #93c5fd; border-radius:12px; padding:1.25rem; background:#eff6ff; display:flex; flex-direction:column; justify-content:space-between; gap:1rem;">
              <div>
                <h4 style="font-weight:700; font-size:0.95rem; color:#1e40af; margin-bottom:0.35rem;">2. Baixar Arquivo HTML Pronto</h4>
                <p style="font-size:0.8rem; color:#1e3a8a; line-height:1.5;">
                  Gera um novo arquivo autônomo (.html) contendo o novo boletim e este Painel Admin embutido. Pronto para colocar no cPanel, SharePoint ou enviar.
                </p>
              </div>
              <button class="btn btn-success" onclick="downloadUpdatedHtml()">
                📥 Baixar Novo Boletim (.html)
              </button>
            </div>

          </div>

          <div style="border-top:1px solid var(--border); padding-top:1rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
            <div style="display:flex; gap:0.5rem;">
              <button class="btn btn-secondary" onclick="exportJsonBackup()">📁 Baixar Backup JSON</button>
              <button class="btn btn-secondary" onclick="resetToInitialBulletin()">🔄 Restaurar Edição Padrão</button>
            </div>
            <span style="font-size:0.75rem; color:var(--text-muted);">100% Autônomo • Não necessita de servidor externo</span>
          </div>

        </div>

      </div>

      <div class="admin-modal-footer">
        <span style="font-size:0.8rem; color:var(--text-muted);" id="adminFooterStatus">Pronto para editar</span>
        <div style="display:flex; gap:0.5rem;">
          <button class="btn btn-secondary" onclick="closeAdminModal()">Fechar</button>
          <button class="btn btn-primary" onclick="applyAndSaveToPage()">Salvar e Visualizar Site</button>
        </div>
      </div>

    </div>
  </div>

  <div id="toast" class="toast-msg">Mensagem</div>

  <!-- ========================================================================= -->
  <!-- JAVASCRIPT ENGINE -->
  <!-- ========================================================================= -->
  <script>
    // Initial built-in bulletin
    const initialBulletin = ${initialJson};

    // Working state
    let currentBulletin = JSON.parse(JSON.stringify(initialBulletin));
    let activeEditingItemId = null;
    let currentSocialPlatform = 'whatsapp';

    // Check LocalStorage on init
    try {
      const saved = localStorage.getItem('ure_marilia_saved_bulletin');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.items && parsed.items.length > 0) {
          currentBulletin = parsed;
          document.getElementById('localNoticeBar').classList.remove('hidden');
          document.getElementById('localNoticeEdition').textContent = currentBulletin.edition;
        }
      }
    } catch(e) {
      console.warn('LocalStorage inacessível:', e);
    }

    // Initial render
    window.addEventListener('DOMContentLoaded', () => {
      renderBulletin(currentBulletin);
      populateAdminFields();
    });

    // Render Bulletin to Page
    function renderBulletin(b) {
      document.title = b.title + ' - ' + b.edition + ' | ' + b.institution;
      const metaTitle = document.getElementById('metaTitle');
      if (metaTitle) metaTitle.textContent = document.title;
      const metaDesc = document.getElementById('metaDesc');
      if (metaDesc) metaDesc.content = b.summary;

      document.getElementById('headerInstName').textContent = b.institution;
      document.getElementById('heroInst').textContent = b.institution;
      document.getElementById('heroTitle').textContent = b.title;
      document.getElementById('heroEdition').textContent = '📑 ' + b.edition;
      document.getElementById('heroDate').textContent = '📅 ' + b.date;
      document.getElementById('heroLeader').textContent = '👤 ' + b.leader;
      document.getElementById('heroEmail').textContent = '✉️ ' + b.email;
      document.getElementById('heroSummary').textContent = b.summary;

      document.getElementById('footerInst').textContent = b.institution;
      document.getElementById('footerLeader').textContent = b.leader;
      document.getElementById('footerEmail').textContent = 'Contato: ' + b.email;

      // Table of contents
      document.getElementById('tocCount').textContent = b.items.length + ' itens';
      document.getElementById('tabItemCount').textContent = b.items.length;

      // Categories
      const categories = ['all', ...Array.from(new Set(b.items.map(it => it.category)))];
      const catContainer = document.getElementById('categoryFilter');
      catContainer.innerHTML = categories.map(c => 
        \`<button class="filter-btn \${c === 'all' ? 'active' : ''}" onclick="filterCategory('\${escapeJs(c)}', this)">
          \${c === 'all' ? 'Todos' : escapeHtml(c)}
        </button>\`
      ).join('');

      // TOC items
      const tocList = document.getElementById('tocList');
      tocList.innerHTML = b.items.map((it, idx) => \`
        <li class="toc-item" data-category="\${escapeHtml(it.category)}">
          <a href="#artigo-\${idx + 1}" class="toc-link">
            <span class="toc-num">\${String(idx + 1).padStart(2, '0')}</span>
            <span class="toc-text">\${escapeHtml(it.title)}</span>
          </a>
        </li>
      \`).join('');

      // Articles
      const articlesContainer = document.getElementById('articlesContainer');
      articlesContainer.innerHTML = b.items.map((it, idx) => {
        const isBoasPraticas = it.category.toLowerCase().includes('prática') || it.category.toLowerCase().includes('escola');
        return \`
          <article id="artigo-\${idx + 1}" class="bulletin-article" data-category="\${escapeHtml(it.category)}">
            <header class="article-header">
              <div class="article-meta">
                <span class="badge category-badge">\${escapeHtml(it.category)}</span>
                \${it.department ? \`<span class="badge department-badge">\${escapeHtml(it.department)}</span>\` : ''}
                \${it.targetAudience ? \`<span class="badge audience-badge">👥 \${escapeHtml(it.targetAudience)}</span>\` : ''}
              </div>
              <h2 class="article-title">\${idx + 1}. \${escapeHtml(it.title)}</h2>
              \${(it.dateInfo || it.location) ? \`
                <div class="article-info-box">
                  \${it.dateInfo ? \`<div class="info-row"><span>📅</span> <strong>Data / Horário:</strong> <span>\${escapeHtml(it.dateInfo)}</span></div>\` : ''}
                  \${it.location ? \`<div class="info-row"><span>📍</span> <strong>Local:</strong> <span>\${escapeHtml(it.location)}</span></div>\` : ''}
                </div>
              \` : ''}
            </header>
            <div class="article-content">\${escapeHtml(it.content).replace(/\\n\\n/g, '<br/><br/>').replace(/\\n/g, '<br/>')}</div>
            \${(it.importantNotes && it.importantNotes.length > 0) ? \`
              <div class="notes-box">
                <h4 class="notes-title">⚠️ Pontos de Atenção & Orientações:</h4>
                <ul>\${it.importantNotes.map(n => \`<li>\${escapeHtml(n)}</li>\`).join('')}</ul>
              </div>
            \` : ''}
            \${(it.links && it.links.length > 0) ? \`
              <div class="links-box">
                <h4 class="links-title">🔗 Links e Documentos Oficiais:</h4>
                <div class="links-list">\${it.links.map(l => \`
                  <a href="\${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer" class="link-btn">
                    <span>\${escapeHtml(l.label)}</span> <span>↗</span>
                  </a>
                \`).join('')}</div>
              </div>
            \` : ''}
            \${(it.tags && it.tags.length > 0) ? \`
              <footer class="article-tags">\${it.tags.map(t => \`<span class="tag-chip">#\${escapeHtml(t)}</span>\`).join('')}</footer>
            \` : ''}
          </article>
        \`;
      }).join('');
    }

    // Search
    function handleSearch(query) {
      const q = query.toLowerCase().trim();
      const articles = document.querySelectorAll('.bulletin-article');
      const tocItems = document.querySelectorAll('.toc-item');

      articles.forEach((art, idx) => {
        const text = art.textContent.toLowerCase();
        const matches = text.includes(q);
        art.style.display = matches ? 'block' : 'none';
        if (tocItems[idx]) tocItems[idx].style.display = matches ? 'block' : 'none';
      });
    }

    // Category Filter
    function filterCategory(cat, btn) {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');

      const articles = document.querySelectorAll('.bulletin-article');
      const tocItems = document.querySelectorAll('.toc-item');

      articles.forEach((art, idx) => {
        const matches = cat === 'all' || art.getAttribute('data-category') === cat;
        art.style.display = matches ? 'block' : 'none';
        if (tocItems[idx]) tocItems[idx].style.display = matches ? 'block' : 'none';
      });
    }

    // Admin Modal Controls
    function openAdminModal() {
      populateAdminFields();
      renderAdminItemsList();
      document.getElementById('adminModal').classList.remove('hidden');
    }
    function closeAdminModal() {
      document.getElementById('adminModal').classList.add('hidden');
      closeItemEditor();
    }

    function switchAdminTab(tabId) {
      document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));

      const activeBtn = Array.from(document.querySelectorAll('.admin-tab-btn')).find(b => b.getAttribute('onclick')?.includes(tabId));
      if (activeBtn) activeBtn.classList.add('active');

      const target = document.getElementById('tab-' + tabId);
      if (target) target.classList.add('active');

      if (tabId === 'social') updateSocialPreview();
    }

    function openSocialTab() {
      openAdminModal();
      switchAdminTab('social');
    }

    // Populate metadata inputs
    function populateAdminFields() {
      document.getElementById('metaInputTitle').value = currentBulletin.title || '';
      document.getElementById('metaInputEdition').value = currentBulletin.edition || '';
      document.getElementById('metaInputDate').value = currentBulletin.date || '';
      document.getElementById('metaInputInstitution').value = currentBulletin.institution || '';
      document.getElementById('metaInputLeader').value = currentBulletin.leader || '';
      document.getElementById('metaInputEmail').value = currentBulletin.email || '';
      document.getElementById('metaInputSummary').value = currentBulletin.summary || '';
    }

    function applyMetadataChanges() {
      currentBulletin.title = document.getElementById('metaInputTitle').value.trim() || currentBulletin.title;
      currentBulletin.edition = document.getElementById('metaInputEdition').value.trim() || currentBulletin.edition;
      currentBulletin.date = document.getElementById('metaInputDate').value.trim() || currentBulletin.date;
      currentBulletin.institution = document.getElementById('metaInputInstitution').value.trim() || currentBulletin.institution;
      currentBulletin.leader = document.getElementById('metaInputLeader').value.trim() || currentBulletin.leader;
      currentBulletin.email = document.getElementById('metaInputEmail').value.trim() || currentBulletin.email;
      currentBulletin.summary = document.getElementById('metaInputSummary').value.trim() || currentBulletin.summary;

      showToast('Cabeçalho atualizado!');
    }

    // PDF and Binary Text Helpers
    function isBinaryPdfText(text) {
      if (!text) return false;
      const start = text.slice(0, 150);
      if (start.includes('%PDF-')) return true;
      if (text.includes('/Type/Catalog') || (text.includes('endobj') && text.includes('stream'))) return true;
      const corruptChars = (text.match(/[\uFFFD\x00-\x08\x0E-\x1F]/g) || []).length;
      return corruptChars > 8;
    }

    function cleanExtractedText(text) {
      return text
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\uFFFD]/g, ' ')
        .replace(/<<\/[^>]+>>/g, '')
        .replace(/[0-9]+\s+[0-9]+\s+obj/g, '')
        .replace(/endobj/g, '')
        .replace(/endstream/g, '')
        .replace(/stream[\s\S]*?endstream/g, '')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n\s*\n\s*\n+/g, '\n\n')
        .trim();
    }

    function extractTextFromBinaryPdfFallback(buffer) {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      const len = Math.min(bytes.length, 2 * 1024 * 1024);
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const matches = binary.match(/\(([^()]{3,})\)\s*(?:Tj|'|")/g) || [];
      const parts = [];
      for (const m of matches) {
        const clean = m.replace(/^\(/, '').replace(/\)\s*(?:Tj|'|")$/, '').trim();
        if (clean.length > 2 && !/[^\x20-\x7E\xA0-\xFF]/.test(clean)) {
          parts.push(clean);
        }
      }
      return parts.join(' ');
    }

    // File Handling
    function triggerAdminFileInput() {
      const el = document.getElementById('fileInputEl');
      if (el) el.click();
    }

    function handleFileSelected(e) {
      const file = e.target.files[0];
      if (!file) return;

      e.target.value = '';

      document.getElementById('fileNameLabel').textContent = 'Arquivo selecionado: ' + file.name;

      // Check if PDF file
      if (file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf') {
        showToast('⏳ Lendo PDF e extraindo texto das páginas...');
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const buffer = event.target.result;
            let extracted = '';
            if (window.pdfjsLib) {
              window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
              const loadingTask = window.pdfjsLib.getDocument({ data: buffer });
              const pdf = await loadingTask.promise;
              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const strings = textContent.items.map(it => it.str || '');
                extracted += strings.join(' ') + '\n\n';
              }
              extracted = cleanExtractedText(extracted);
              if (extracted && extracted.length > 30) {
                document.getElementById('rawTextInput').value = extracted;
                showToast('✅ PDF de ' + pdf.numPages + ' páginas lido com sucesso! Clique em "Processar & Estruturar".');
                return;
              }
            }

            // Fallback
            extracted = cleanExtractedText(extractTextFromBinaryPdfFallback(buffer));
            if (extracted && extracted.length > 20) {
              document.getElementById('rawTextInput').value = extracted;
              showToast('✅ Texto extraído do PDF! Clique em "Processar & Estruturar".');
              return;
            }

            document.getElementById('rawTextInput').value = 'BOLETIM SEMANAL - ' + file.name + '\n\n' + (extracted || 'Conteúdo do arquivo importado.');
            showToast('Arquivo importado com sucesso! Clique em "Processar & Estruturar".');
          } catch (err) {
            console.error(err);
            document.getElementById('rawTextInput').value = 'BOLETIM SEMANAL - ' + file.name;
            showToast('Arquivo recebido. Clique em "Processar & Estruturar".');
          }
        };
        reader.readAsArrayBuffer(file);
        return;
      }

      const reader = new FileReader();

      reader.onload = (event) => {
        const text = event.target.result;
        // Check if json
        if (file.name.endsWith('.json')) {
          try {
            const parsed = JSON.parse(text);
            if (parsed.items && Array.isArray(parsed.items)) {
              currentBulletin = parsed;
              populateAdminFields();
              renderAdminItemsList();
              showToast('Backup JSON carregado com sucesso!');
              switchAdminTab('items');
              return;
            }
          } catch(err) {
            console.error(err);
          }
        }

        if (isBinaryPdfText(text)) {
          showToast('⚠️ Código binário detectado. Use o upload direto de PDF para extração automática.');
          return;
        }

        document.getElementById('rawTextInput').value = text;
        showToast('Texto do arquivo carregado. Clique em "Processar & Estruturar"');
      };

      reader.readAsText(file);
    }

    // Heuristic Smart Parser Client-Side
    function processRawText() {
      const text = document.getElementById('rawTextInput').value.trim();
      if (!text || text.length < 20) {
        showToast('Cole o texto do boletim antes de processar.');
        return;
      }

      // Auto-clean binary PDF streams if present
      let cleanedText = cleanExtractedText(text);
      if (isBinaryPdfText(text)) {
        showToast('Limpando formatação de PDF e estruturando matérias...');
      }

      // Detect edition
      const targetText = cleanedText || text;
      const editionMatch = targetText.match(/(?:Ano\s+[IVXLCDM]+\s*[-–—]\s*n[º°o]?\s*\d+\/\d{4}|Boletim\s+Semanal\s*n[º°o]?\s*\d+)/i);
      if (editionMatch) {
        currentBulletin.edition = editionMatch[0];
        document.getElementById('metaInputEdition').value = currentBulletin.edition;
      }

      // Split lines
      const lines = targetText.split('\n').map(l => l.trim()).filter(Boolean);
      const parsedItems = [];
      let current = null;
      let counter = 1;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Reject PDF internal tokens and binary stream artifacts
        if (
          line.startsWith('%PDF-') ||
          /^[0-9]+\s+[0-9]+\s+obj/.test(line) ||
          line === 'endobj' ||
          line === 'stream' ||
          line === 'endstream' ||
          line.startsWith('<<') ||
          line.endsWith('>>') ||
          /xref|trailer|startxref/.test(line) ||
          (line.match(/[\uFFFD\x00-\x08\x0E-\x1F]/g) || []).length > 2
        ) {
          continue;
        }

        const hasRealLetters = /[a-zA-ZÀ-ÿ]{3,}/.test(line);
        if (!hasRealLetters) continue;

        const isHeader = (
          (line.length > 5 && line.length < 95 && (line === line.toUpperCase() || /^[0-9]+[.\\)]\\s+/.test(line))) ||
          line.startsWith("FORMAÇÃO") ||
          line.startsWith("COMUNICADO") ||
          line.startsWith("ORIENTAÇÃO") ||
          line.startsWith("BOAS PRÁTICAS") ||
          line.startsWith("EE ")
        );

        if (isHeader && line.length > 5) {
          if (current && current.title) {
            parsedItems.push(current);
          }
          current = {
            id: 'item-' + (counter++),
            title: line.replace(/^[0-9]+[.\\)]\\s+/, ''),
            category: line.includes('FORMAÇÃO') ? 'Formação Pedagógica' : (line.includes('EE ') ? 'Boas Práticas Escolares' : (line.includes('COMUNICADO') ? 'Comunicado Oficial' : 'Informativo Geral')),
            department: 'Diretoria Regional',
            targetAudience: 'Comunidade Escolar',
            dateInfo: '',
            location: '',
            content: '',
            importantNotes: [],
            links: [],
            tags: ['Boletim', 'SEDUC-SP']
          };
        } else if (current) {
          if (line.toLowerCase().startsWith('data:') || line.toLowerCase().startsWith('período:') || line.toLowerCase().startsWith('horário:')) {
            current.dateInfo = line.replace(/^(data|período|horário):\\s*/i, '');
          } else if (line.toLowerCase().startsWith('local:')) {
            current.location = line.replace(/^local:\\s*/i, '');
          } else if (line.toLowerCase().startsWith('público-alvo:') || line.toLowerCase().startsWith('publico-alvo:')) {
            current.targetAudience = line.replace(/^p[uú]blico-alvo:\\s*/i, '');
          } else if (line.startsWith('http://') || line.startsWith('https://')) {
            current.links.push({ label: 'Acessar Link Externo', url: line });
          } else if (line.startsWith('•') || line.startsWith('-') || line.toLowerCase().includes('atenção:') || line.toLowerCase().includes('importante:')) {
            current.importantNotes.push(line.replace(/^[•\\-]\\s*/, ''));
          } else {
            current.content = (current.content ? current.content + '\\n' : '') + line;
          }
        }
      }

      if (current && current.title) {
        parsedItems.push(current);
      }

      if (parsedItems.length > 0) {
        currentBulletin.items = parsedItems;
        currentBulletin.summary = 'Edição processada com ' + parsedItems.length + ' matérias e avisos da semana.';
        document.getElementById('metaInputSummary').value = currentBulletin.summary;
        renderAdminItemsList();
        showToast('Sucesso! ' + parsedItems.length + ' matérias estruturadas.');
        switchAdminTab('items');
      } else {
        showToast('Nenhuma matéria separada detectada. Tente o modelo de exemplo.');
      }
    }

    // Sample text
    function loadSampleText() {
      const sample = \`BOLETIM SEMANAL - Ano VI – nº36/2026
Data: 14 de setembro de 2026

1. Formação Presencial em Alfabetização e Letramento
Público-alvo: Professores dos Anos Iniciais do Ensino Fundamental
Data: 16/09/2026 das 08h30 às 17h30
Local: Salão Nobre da Unidade Regional de Ensino de Marília
A Secretaria da Educação convoca todos os docentes selecionados para a jornada de aperfeiçoamento didático em metodologias ativas de alfabetização.
• Trazer caderno de anotações e documento oficial com foto.
• Frequência obrigatória para fins de certificação EFAPE.
https://seduc.sp.gov.br/alfabetizacao

2. Simulado Preparatório para o SARESP 2026
Público-alvo: Equipes Gestoras e Coordenadores Pedagógicos
Período: 21 a 25 de setembro de 2026
Orientações para aplicação do simulado diagnóstico em todas as unidades escolares da rede pública estadual da região de Marília.
• O preenchimento da ata de presença deve ser efetuado na plataforma online até 26/09.

3. Boas Práticas: EE Professora Wanda Helen Pereira
Público-alvo: Comunidade Escolar
Apresentação do projeto interdisciplinar de Robótica Sustentável e Horta Comunitária desenvolvido pelos alunos do Ensino Médio Integral.\`;

      document.getElementById('rawTextInput').value = sample;
      showToast('Texto de exemplo carregado.');
    }

    // Admin Items List
    function renderAdminItemsList() {
      const container = document.getElementById('adminItemsList');
      document.getElementById('tabItemCount').textContent = currentBulletin.items.length;

      if (!currentBulletin.items || currentBulletin.items.length === 0) {
        container.innerHTML = '<div style="padding:2rem; text-align:center; color:var(--text-muted); font-size:0.85rem;">Nenhuma matéria cadastrada. Use a aba Upload ou clique em "+ Nova Matéria".</div>';
        return;
      }

      container.innerHTML = currentBulletin.items.map((it, idx) => \`
        <div class="admin-item-card">
          <div style="display:flex; align-items:flex-start; gap:0.6rem; min-width:0;">
            <span style="background:rgba(59,130,246,0.15); color:var(--primary-light); font-weight:800; font-size:0.75rem; padding:0.2rem 0.45rem; border-radius:4px;">
              #\${String(idx + 1).padStart(2, '0')}
            </span>
            <div style="min-width:0;">
              <div class="admin-item-title">\${escapeHtml(it.title)}</div>
              <div class="admin-item-meta">
                <span>📂 \${escapeHtml(it.category)}</span>
                \${it.targetAudience ? ' • 👥 ' + escapeHtml(it.targetAudience) : ''}
                \${it.dateInfo ? ' • 📅 ' + escapeHtml(it.dateInfo) : ''}
              </div>
            </div>
          </div>
          <div class="item-actions">
            <button class="btn-icon" onclick="moveItem(\${idx}, -1)" title="Mover para cima">↑</button>
            <button class="btn-icon" onclick="moveItem(\${idx}, 1)" title="Mover para baixo">↓</button>
            <button class="btn-icon" onclick="openItemEditorEdit('\${it.id}')" title="Editar">✏️</button>
            <button class="btn-icon" style="color:#dc2626;" onclick="deleteItem('\${it.id}')" title="Excluir">🗑️</button>
          </div>
        </div>
      \`).join('');
    }

    function moveItem(index, direction) {
      const target = index + direction;
      if (target < 0 || target >= currentBulletin.items.length) return;
      const temp = currentBulletin.items[index];
      currentBulletin.items[index] = currentBulletin.items[target];
      currentBulletin.items[target] = temp;
      renderAdminItemsList();
    }

    function deleteItem(id) {
      if (confirm('Deseja realmente remover esta matéria do sumário?')) {
        currentBulletin.items = currentBulletin.items.filter(it => it.id !== id);
        renderAdminItemsList();
        showToast('Matéria removida.');
      }
    }

    function openItemEditorNew() {
      activeEditingItemId = 'new';
      document.getElementById('itemEditorHeader').textContent = 'Adicionar Nova Matéria';
      document.getElementById('itemEditTitle').value = '';
      document.getElementById('itemEditCategory').value = 'Formação Pedagógica';
      document.getElementById('itemEditDept').value = 'Regional de Ensino';
      document.getElementById('itemEditAudience').value = 'Diretores e Professores';
      document.getElementById('itemEditDate').value = '';
      document.getElementById('itemEditLocation').value = '';
      document.getElementById('itemEditContent').value = '';
      document.getElementById('itemEditNotes').value = '';
      document.getElementById('itemEditLinks').value = '';
      document.getElementById('singleItemEditor').style.display = 'block';
      document.getElementById('singleItemEditor').scrollIntoView({ behavior: 'smooth' });
    }

    function openItemEditorEdit(id) {
      activeEditingItemId = id;
      const it = currentBulletin.items.find(i => i.id === id);
      if (!it) return;

      document.getElementById('itemEditorHeader').textContent = 'Editar Matéria: ' + it.title;
      document.getElementById('itemEditTitle').value = it.title || '';
      document.getElementById('itemEditCategory').value = it.category || '';
      document.getElementById('itemEditDept').value = it.department || '';
      document.getElementById('itemEditAudience').value = it.targetAudience || '';
      document.getElementById('itemEditDate').value = it.dateInfo || '';
      document.getElementById('itemEditLocation').value = it.location || '';
      document.getElementById('itemEditContent').value = it.content || '';
      document.getElementById('itemEditNotes').value = (it.importantNotes || []).join('\\n');
      document.getElementById('itemEditLinks').value = (it.links || []).map(l => l.label + ' | ' + l.url).join('\\n');
      document.getElementById('singleItemEditor').style.display = 'block';
      document.getElementById('singleItemEditor').scrollIntoView({ behavior: 'smooth' });
    }

    function closeItemEditor() {
      document.getElementById('singleItemEditor').style.display = 'none';
      activeEditingItemId = null;
    }

    function saveItemEditor() {
      const title = document.getElementById('itemEditTitle').value.trim();
      if (!title) {
        showToast('O título da matéria é obrigatório.');
        return;
      }

      const rawNotes = document.getElementById('itemEditNotes').value.split('\\n').map(n => n.trim()).filter(Boolean);
      const rawLinks = document.getElementById('itemEditLinks').value.split('\\n').map(l => {
        const parts = l.split('|').map(p => p.trim());
        if (parts.length >= 2) return { label: parts[0], url: parts[1] };
        if (parts[0].startsWith('http')) return { label: 'Link Oficial', url: parts[0] };
        return null;
      }).filter(Boolean);

      const itemData = {
        id: activeEditingItemId === 'new' ? 'item-' + Date.now() : activeEditingItemId,
        title: title,
        category: document.getElementById('itemEditCategory').value.trim() || 'Informativo Geral',
        department: document.getElementById('itemEditDept').value.trim() || '',
        targetAudience: document.getElementById('itemEditAudience').value.trim() || '',
        dateInfo: document.getElementById('itemEditDate').value.trim() || '',
        location: document.getElementById('itemEditLocation').value.trim() || '',
        content: document.getElementById('itemEditContent').value.trim() || '',
        importantNotes: rawNotes,
        links: rawLinks,
        tags: ['Boletim', 'Educação SP']
      };

      if (activeEditingItemId === 'new') {
        currentBulletin.items.push(itemData);
      } else {
        const idx = currentBulletin.items.findIndex(i => i.id === activeEditingItemId);
        if (idx >= 0) currentBulletin.items[idx] = itemData;
      }

      closeItemEditor();
      renderAdminItemsList();
      showToast('Matéria salva com sucesso!');
    }

    // Social Media Posts Generator
    function switchSocialPlatform(platform) {
      currentSocialPlatform = platform;
      ['whatsapp', 'instagram', 'facebook', 'linkedin'].forEach(p => {
        const b = document.getElementById('btnSoc' + p.charAt(0).toUpperCase() + p.slice(1));
        if (b) {
          if (p === platform) b.classList.add('active');
          else b.classList.remove('active');
        }
      });
      updateSocialPreview();
    }

    function generateSocialText(platform) {
      const b = currentBulletin;
      const topItems = b.items.slice(0, 5);

      if (platform === 'whatsapp') {
        let text = '📢 *' + b.institution + '*\\n';
        text += '📑 *' + b.title + ' — ' + b.edition + '*\\n';
        text += '📅 ' + b.date + '\\n\\n';
        text += 'Confira os principais avisos, cronogramas e orientações desta semana:\\n\\n';
        topItems.forEach((it, idx) => {
          text += '*' + (idx + 1) + '. ' + it.title + '*\\n';
          text += '📌 _' + it.category + (it.targetAudience ? ' • ' + it.targetAudience : '') + '_\\n';
          if (it.dateInfo) text += '🗓️ ' + it.dateInfo + '\\n';
          text += '\\n';
        });
        if (b.items.length > 5) {
          text += '➕ E mais ' + (b.items.length - 5) + ' matérias completas no site do boletim!\\n\\n';
        }
        text += '🌐 Acesse o Boletim Completo com Sumário Interativo:\\n' + window.location.href + '\\n\\n';
        text += '✉️ Dúvidas: ' + b.email;
        return text;
      }

      if (platform === 'instagram') {
        let text = '✨ ' + b.title + ' | ' + b.edition + '\\n';
        text += '🏛️ ' + b.institution + '\\n\\n';
        text += b.summary + '\\n\\n';
        text += '📌 Destaques da Semana:\\n';
        topItems.forEach(it => {
          text += '🔹 ' + it.title + '\\n';
        });
        text += '\\n📲 Acesse o sumário interativo pelo link da bio!\\n\\n';
        text += '#EducacaoSP #SEDUCSP #UREMarilia #BoletimSemanal #GestaoEscolar';
        return text;
      }

      if (platform === 'facebook' || platform === 'linkedin') {
        let text = b.institution + ' — ' + b.title + ' (' + b.edition + ')\\n\\n';
        text += b.summary + '\\n\\n';
        text += 'Principais pautas da semana:\\n';
        b.items.forEach((it, idx) => {
          text += (idx + 1) + '. ' + it.title + ' (' + it.category + ')\\n';
        });
        text += '\\nConsulte todas as orientações e formulários no site oficial: ' + window.location.href;
        return text;
      }

      return '';
    }

    function updateSocialPreview() {
      const text = generateSocialText(currentSocialPlatform);
      const box = document.getElementById('socialPreviewBox');
      if (box) box.textContent = text;
      const charCount = document.getElementById('socialCharCount');
      if (charCount) charCount.textContent = text.length + ' caracteres formatados para ' + currentSocialPlatform.toUpperCase();
    }

    function copySocialText() {
      const text = generateSocialText(currentSocialPlatform);
      navigator.clipboard.writeText(text).then(() => {
        showToast('Texto para ' + currentSocialPlatform.toUpperCase() + ' copiado!');
      });
    }

    function openWhatsAppDirect() {
      const text = generateSocialText('whatsapp');
      const url = 'https://web.whatsapp.com/send?text=' + encodeURIComponent(text);
      window.open(url, '_blank');
    }

    // Save & Publish
    function applyAndSaveToPage() {
      applyMetadataChanges();
      try {
        localStorage.setItem('ure_marilia_saved_bulletin', JSON.stringify(currentBulletin));
      } catch(e) {}

      renderBulletin(currentBulletin);
      document.getElementById('localNoticeBar').classList.remove('hidden');
      document.getElementById('localNoticeEdition').textContent = currentBulletin.edition;
      closeAdminModal();
      showToast('Página atualizada com o novo boletim!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function resetToInitialBulletin() {
      if (confirm('Deseja restaurar o boletim original da edição?')) {
        try {
          localStorage.removeItem('ure_marilia_saved_bulletin');
        } catch(e) {}
        currentBulletin = JSON.parse(JSON.stringify(initialBulletin));
        renderBulletin(currentBulletin);
        populateAdminFields();
        renderAdminItemsList();
        document.getElementById('localNoticeBar').classList.add('hidden');
        showToast('Boletim original restaurado.');
        closeAdminModal();
      }
    }

    function exportJsonBackup() {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentBulletin, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = 'backup-' + currentBulletin.edition.replace(/[^a-zA-Z0-9_-]/g, '_') + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Backup JSON exportado!');
    }

    // Dynamic Download of Self-Contained HTML with New Data
    function downloadUpdatedHtml() {
      applyMetadataChanges();
      
      // Clone document and replace initial bulletin JSON
      let fullHtml = '<!DOCTYPE html>' + document.documentElement.outerHTML;
      
      // Replace the initial JSON string in script
      const originalPattern = new RegExp('const initialBulletin = ' + JSON.stringify(initialBulletin).replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\\\$&') + ';');
      if (originalPattern.test(fullHtml)) {
        fullHtml = fullHtml.replace(originalPattern, 'const initialBulletin = ' + JSON.stringify(currentBulletin) + ';');
      } else {
        // Fallback replacement of variable assignment
        fullHtml = fullHtml.replace(/const initialBulletin = [^;]+;/, 'const initialBulletin = ' + JSON.stringify(currentBulletin) + ';');
      }

      const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'boletim-' + currentBulletin.edition.replace(/[^a-zA-Z0-9_-]/g, '_') + '.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Arquivo HTML gerado e baixado com sucesso!');
    }

    // Toast helper
    function showToast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 3000);
      const statusEl = document.getElementById('adminFooterStatus');
      if (statusEl) statusEl.textContent = msg;
    }

    // Theme toggle
    function toggleTheme() {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('bulletin-theme', next);
    }
    const savedTheme = localStorage.getItem('bulletin-theme');
    if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

    // Share Bulletin
    function shareBulletin() {
      if (navigator.share) {
        navigator.share({
          title: document.title,
          url: window.location.href
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href);
        showToast('Link do boletim copiado para a área de transferência!');
      }
    }

    // Scroll to Top
    window.addEventListener('scroll', () => {
      const btt = document.getElementById('backToTop');
      if (window.scrollY > 400) {
        btt.classList.add('visible');
      } else {
        btt.classList.remove('visible');
      }
    });

    // Helper escape functions
    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function escapeJs(str) {
      if (!str) return '';
      return String(str).replace(/'/g, "\\\\'");
    }
  </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
