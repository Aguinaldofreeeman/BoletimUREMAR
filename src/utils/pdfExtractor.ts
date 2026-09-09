/**
 * PDF Text Extractor for browser environments.
 * Extracts text page-by-page using Mozilla's pdf.js with fallback mechanisms.
 */

declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  // Try PDF.js
  try {
    const text = await extractWithPdfJs(arrayBuffer);
    if (text && text.trim().length > 30) {
      return cleanExtractedText(text);
    }
  } catch (err) {
    console.warn('Falha na extração via pdf.js:', err);
  }

  // Fallback: parse uncompressed streams and literal strings from binary buffer
  try {
    const fallbackText = extractTextFromBinaryPdf(arrayBuffer);
    if (fallbackText && fallbackText.trim().length > 30) {
      return cleanExtractedText(fallbackText);
    }
  } catch (err) {
    console.warn('Falha no fallback de PDF:', err);
  }

  throw new Error(
    'Não foi possível extrair o texto deste PDF automaticamente (pode ser escaneado/imagem ou protegido por senha). Abra o PDF, copie o texto (Ctrl+A e Ctrl+C) e cole no campo de texto.'
  );
}

export function loadPdfJsScript(): Promise<void> {
  if (window.pdfjsLib) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="pdf.min.js"]');
    if (existing) {
      if (window.pdfjsLib) {
        resolve();
      } else {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Erro ao carregar pdf.js')));
      }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve();
      } else {
        reject(new Error('pdfjsLib não encontrado após carregar script'));
      }
    };
    script.onerror = () => reject(new Error('Falha de rede ao carregar biblioteca PDF'));
    document.head.appendChild(script);
  });
}

async function extractWithPdfJs(arrayBuffer: ArrayBuffer): Promise<string> {
  await loadPdfJsScript();
  const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((it: any) => it.str || '');
    fullText += strings.join(' ') + '\n\n';
  }

  return fullText;
}

function extractTextFromBinaryPdf(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const len = Math.min(bytes.length, 2 * 1024 * 1024);
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  const matches = binary.match(/\(([^()]{3,})\)\s*(?:Tj|'|")/g) || [];
  const parts: string[] = [];
  for (const m of matches) {
    const clean = m.replace(/^\(/, '').replace(/\)\s*(?:Tj|'|")$/, '').trim();
    if (clean.length > 2 && !/[^\x20-\x7E\xA0-\xFF]/.test(clean)) {
      parts.push(clean);
    }
  }

  return parts.join(' ');
}

export function cleanExtractedText(text: string): string {
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

export function isBinaryPdfText(text: string): boolean {
  if (!text) return false;
  const start = text.slice(0, 150);
  if (start.includes('%PDF-')) return true;
  if (text.includes('/Type/Catalog') || (text.includes('endobj') && text.includes('stream'))) return true;
  const corruptChars = (text.match(/[\uFFFD\x00-\x08]/g) || []).length;
  if (corruptChars > 10) return true;
  return false;
}
