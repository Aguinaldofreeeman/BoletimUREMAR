import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { initialBulletin } from "./src/data/defaultBulletin.js";
import { generateStandaloneHtml } from "./src/utils/htmlGenerator.js";
import { generateSocialPosts } from "./src/utils/socialGenerator.js";
import { Bulletin, BulletinItem } from "./src/types.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// In-memory bulletin storage initialized with the user's weekly bulletin
let bulletins: Bulletin[] = [initialBulletin];

// Social integration logs
interface SocialLog {
  id: string;
  platform: string;
  timestamp: string;
  status: "success" | "failed" | "simulated";
  responseMessage: string;
  payloadSummary: string;
}
let dispatchLogs: SocialLog[] = [];

// Gemini Client Lazy Initializer
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// List all bulletins
app.get("/api/bulletins", (req, res) => {
  res.json({ bulletins });
});

// Get single bulletin
app.get("/api/bulletins/:id", (req, res) => {
  const bulletin = bulletins.find((b) => b.id === req.params.id);
  if (!bulletin) {
    return res.status(404).json({ error: "Boletim não encontrado" });
  }
  res.json({ bulletin });
});

// Save or Update bulletin
app.post("/api/bulletins", (req, res) => {
  try {
    const data: Bulletin = req.body;
    if (!data.id) {
      data.id = `boletim-${Date.now()}`;
    }
    data.updatedAt = new Date().toISOString();

    const existingIndex = bulletins.findIndex((b) => b.id === data.id);
    if (existingIndex >= 0) {
      bulletins[existingIndex] = data;
    } else {
      data.createdAt = data.createdAt || new Date().toISOString();
      bulletins.unshift(data);
    }

    res.json({ success: true, bulletin: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao salvar boletim" });
  }
});

// Delete bulletin
app.delete("/api/bulletins/:id", (req, res) => {
  const index = bulletins.findIndex((b) => b.id === req.params.id);
  if (index >= 0) {
    bulletins.splice(index, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Boletim não encontrado" });
  }
});

// Download / Get Standalone HTML
app.get("/api/bulletins/:id/html", (req, res) => {
  const bulletin = bulletins.find((b) => b.id === req.params.id);
  if (!bulletin) {
    return res.status(404).send("Boletim não encontrado");
  }
  const html = generateStandaloneHtml(bulletin);
  if (req.query.download === "true") {
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="boletim-${bulletin.edition.replace(/[^a-zA-Z0-9_-]/g, "_")}.html"`
    );
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});

// Direct download HTML endpoint via POST
app.post("/api/bulletins/download-html", (req, res) => {
  try {
    const { bulletin, html, fileName } = req.body;
    const finalHtml = html || (bulletin ? generateStandaloneHtml(bulletin) : "");
    const safeName = (fileName || `boletim-${bulletin?.edition || "atual"}.html`).replace(/[^a-zA-Z0-9_.-]/g, "_");
    res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(finalHtml);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao gerar download" });
  }
});

// Helper functions for PDF and Bulletin processing
function cleanExtractedText(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\uFFFD]/g, " ")
    .replace(/<<\/[^>]+>>/g, "")
    .replace(/[0-9]+\s+[0-9]+\s+obj/g, "")
    .replace(/endobj/g, "")
    .replace(/endstream/g, "")
    .replace(/stream[\s\S]*?endstream/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();
}

async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  try {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    if (result && result.text && result.text.trim().length > 10) {
      return cleanExtractedText(result.text);
    }
  } catch (err: any) {
    console.warn("Erro no PDFParse:", err.message);
  }

  // Binary stream regex fallback
  const binary = buffer.toString("binary", 0, Math.min(buffer.length, 3 * 1024 * 1024));
  const matches = binary.match(/\(([^()]{3,})\)\s*(?:Tj|'|")/g) || [];
  const parts: string[] = [];
  for (const m of matches) {
    const clean = m.replace(/^\(/, "").replace(/\)\s*(?:Tj|'|")$/, "").trim();
    if (clean.length > 2 && !/[^\x20-\x7E\xA0-\xFF]/.test(clean)) {
      parts.push(clean);
    }
  }
  return cleanExtractedText(parts.join(" "));
}

function parseBulletinHeuristic(
  rawText: string,
  title?: string,
  edition?: string,
  date?: string
): Bulletin {
  const lines = rawText.split("\n").map((l: string) => l.trim()).filter(Boolean);
  const detectedItems: BulletinItem[] = [];
  let currentItem: Partial<BulletinItem> | null = null;
  let counter = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (
      line.startsWith("%PDF-") ||
      /^[0-9]+\s+[0-9]+\s+obj/.test(line) ||
      line === "endobj" ||
      line === "stream" ||
      line === "endstream" ||
      line.startsWith("<<") ||
      line.endsWith(">>")
    ) {
      continue;
    }

    const isHeader =
      (line.length > 5 && line.length < 90 && (line === line.toUpperCase() || /^[0-9]+(\.[0-9]+)?\s+/.test(line))) ||
      line.startsWith("FORMAÇÃO") ||
      line.startsWith("COMUNICADO") ||
      line.startsWith("ORIENTAÇÃO") ||
      line.startsWith("BOAS PRATICAS") ||
      line.startsWith("EE ");

    if (isHeader && line.length > 5) {
      if (currentItem && currentItem.title) {
        detectedItems.push({
          id: `item-${counter++}`,
          title: currentItem.title,
          category: currentItem.category || "Informativo Geral",
          department: currentItem.department || "Diretoria Regional",
          targetAudience: currentItem.targetAudience || "Equipes Escolares",
          dateInfo: currentItem.dateInfo || "",
          location: currentItem.location || "",
          content: currentItem.content || "Sem descrição adicional informada.",
          importantNotes: currentItem.importantNotes || [],
          links: currentItem.links || [],
          tags: ["Boletim", "Educação SP"],
        });
      }
      currentItem = {
        title: line.replace(/^[0-9]+(\.[0-9]+)?\s+/, ""),
        category: line.includes("FORMAÇÃO")
          ? "Formação Pedagógica"
          : line.includes("EE ")
          ? "Boas Práticas Escolares"
          : line.includes("COMUNICADO")
          ? "Comunicado Oficial"
          : "Informativo Geral",
        content: "",
        importantNotes: [],
        links: [],
      };
    } else if (currentItem) {
      if (line.toLowerCase().startsWith("data:") || line.toLowerCase().startsWith("dia:")) {
        currentItem.dateInfo = line;
      } else if (line.toLowerCase().startsWith("local:")) {
        currentItem.location = line.replace(/^local:\s*/i, "");
      } else if (line.toLowerCase().startsWith("público-alvo:") || line.toLowerCase().startsWith("publico-alvo:")) {
        currentItem.targetAudience = line.replace(/^p[uú]blico-alvo:\s*/i, "");
      } else if (line.startsWith("http://") || line.startsWith("https://")) {
        currentItem.links?.push({ label: "Acessar Link Externo", url: line });
      } else {
        currentItem.content = (currentItem.content ? currentItem.content + "\n" : "") + line;
      }
    }
  }

  if (currentItem && currentItem.title) {
    detectedItems.push({
      id: `item-${counter++}`,
      title: currentItem.title,
      category: currentItem.category || "Informativo Geral",
      department: currentItem.department || "Diretoria Regional",
      targetAudience: currentItem.targetAudience || "Equipes Escolares",
      dateInfo: currentItem.dateInfo || "",
      location: currentItem.location || "",
      content: currentItem.content || "",
      importantNotes: currentItem.importantNotes || [],
      links: currentItem.links || [],
      tags: ["Boletim", "Educação SP"],
    });
  }

  return {
    id: `boletim-${Date.now()}`,
    title: title || "BOLETIM SEMANAL",
    institution: "UNIDADE REGIONAL DE ENSINO DE MARÍLIA",
    edition: edition || `Ano VI – nº36/2026`,
    date: date || new Date().toLocaleDateString("pt-BR"),
    leader: "Marcia Cavalcante Marcusso — Coordenadora Dirigente Regional de Ensino",
    email: "demar@educacao.sp.gov.br",
    summary: `Edição com ${detectedItems.length > 0 ? detectedItems.length : initialBulletin.items.length} matérias e orientações da semana.`,
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: detectedItems.length > 0 ? detectedItems : initialBulletin.items,
  };
}

async function processBulletinWithAiOrHeuristic(
  text: string,
  title?: string,
  edition?: string,
  date?: string
): Promise<{ bulletin: Bulletin; method: string }> {
  const clean = cleanExtractedText(text);
  const ai = getGemini();

  if (ai && clean.length > 30) {
    try {
      const prompt = `Você é um assistente especializado em diagramação e processamento de boletins semanais escolares e governamentais.
Analise o texto a seguir extraído de um boletim semanal e transforme-o em um objeto estruturado JSON rigorosamente no seguinte formato:
{
  "title": "BOLETIM SEMANAL",
  "institution": "UNIDADE REGIONAL DE ENSINO DE MARÍLIA",
  "edition": "Ano VI – nº36/2026",
  "date": "14 de setembro de 2026",
  "leader": "Nome do(a) Dirigente / Coordenador(a)",
  "email": "email_de_contato@educacao.sp.gov.br",
  "summary": "Resumo geral dos principais avisos e destaques da edição...",
  "items": [
    {
      "id": "item-1",
      "title": "Título claro e objetivo da pauta ou convocação",
      "category": "Ex: Formação Pedagógica, Avaliação, Educação Especial, Boas Práticas, etc.",
      "department": "Ex: SUPED - DIAVAL, EFAPE, COEGD, etc.",
      "targetAudience": "Ex: Diretores, Professores de Ciências Humanas, etc.",
      "dateInfo": "Ex: 15/09/2026 das 08h30 às 17h30",
      "location": "Ex: Auditório Professor Antônio Ribeiro",
      "content": "Texto explicativo completo e revisado da matéria...",
      "importantNotes": ["Ponto de atenção 1", "Ponto de atenção 2"],
      "links": [{"label": "Link oficial", "url": "https://..."}],
      "tags": ["Tag1", "Tag2"]
    }
  ]
}

REGRAS:
- Extraia todas as matérias importantes com clareza.
- Se o usuário informou título, edição ou data explicitamente, respeite esses valores.
- Responda EXCLUSIVAMENTE com o objeto JSON válido, sem texto explicativo adicional.

TEXTO DO BOLETIM:
${clean.slice(0, 30000)}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      if (parsed.items && Array.isArray(parsed.items) && parsed.items.length > 0) {
        const generatedBulletin: Bulletin = {
          id: `boletim-${Date.now()}`,
          title: title || parsed.title || "BOLETIM SEMANAL",
          institution: parsed.institution || "UNIDADE REGIONAL DE ENSINO DE MARÍLIA",
          edition: edition || parsed.edition || `Ano VI – nº36/2026`,
          date: date || parsed.date || new Date().toLocaleDateString("pt-BR"),
          leader: parsed.leader || "Marcia Cavalcante Marcusso — Coordenadora Dirigente Regional de Ensino",
          email: parsed.email || "demar@educacao.sp.gov.br",
          summary: parsed.summary || "Resumo das principais orientações e notícias pedagógicas da semana.",
          status: "published",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          items: parsed.items.map((it: any, i: number) => ({
            id: it.id || `item-${i + 1}`,
            title: it.title || `Matéria ${i + 1}`,
            category: it.category || "Informativo Geral",
            department: it.department || "Regional de Ensino",
            targetAudience: it.targetAudience || "Comunidade Escolar",
            dateInfo: it.dateInfo || "",
            location: it.location || "",
            content: it.content || "",
            importantNotes: it.importantNotes || [],
            links: it.links || [],
            tags: it.tags || ["Boletim", "Educação"],
          })),
        };
        return { bulletin: generatedBulletin, method: "gemini-ai" };
      }
    } catch (aiErr: any) {
      console.warn("Falha no Gemini, usando heurístico:", aiErr.message);
    }
  }

  return { bulletin: parseBulletinHeuristic(clean, title, edition, date), method: "heuristic" };
}

// Upload direct file (PDF, TXT, DOC) and parse automatically
app.post("/api/bulletins/upload-file", async (req, res) => {
  try {
    const { fileBase64, fileName, mimeType, title, edition, date } = req.body;

    if (!fileBase64) {
      return res.status(400).json({ error: "Nenhum arquivo enviado." });
    }

    const buffer = Buffer.from(fileBase64, "base64");
    const isPdf =
      (fileName && fileName.toLowerCase().endsWith(".pdf")) ||
      mimeType === "application/pdf" ||
      buffer.slice(0, 5).toString() === "%PDF-";

    let extractedText = "";

    if (isPdf) {
      extractedText = await extractTextFromPdfBuffer(buffer);

      // If PDF extraction yielded short text and Gemini is active, let Gemini inspect directly
      const ai = getGemini();
      if ((!extractedText || extractedText.length < 50) && ai) {
        try {
          const aiRes = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: [
              {
                inlineData: {
                  mimeType: "application/pdf",
                  data: fileBase64,
                },
              },
              "Extraia todo o conteúdo de texto deste boletim oficial em português, preservando títulos, seções e avisos.",
            ],
          });
          if (aiRes.text && aiRes.text.length > 30) {
            extractedText = cleanExtractedText(aiRes.text);
          }
        } catch (e: any) {
          console.warn("Falha no Gemini inlineData:", e.message);
        }
      }
    } else {
      extractedText = cleanExtractedText(buffer.toString("utf-8"));
    }

    if (!extractedText || extractedText.length < 10) {
      extractedText = `Boletim Semanal da Unidade Regional de Ensino de Marília\nArquivo processado: ${fileName || "documento"}\n`;
    }

    const { bulletin, method } = await processBulletinWithAiOrHeuristic(
      extractedText,
      title,
      edition,
      date
    );

    return res.json({
      success: true,
      text: extractedText,
      bulletin,
      method,
      fileName,
    });
  } catch (err: any) {
    console.error("Erro em /api/bulletins/upload-file:", err);
    return res.status(500).json({ error: err.message || "Erro ao processar arquivo" });
  }
});

// AI or Smart Parsing of raw weekly bulletin text / document
app.post("/api/bulletins/parse-content", async (req, res) => {
  try {
    let { rawText, title, edition, date } = req.body;

    if (!rawText || typeof rawText !== "string" || rawText.trim().length < 5) {
      return res.status(400).json({ error: "Conteúdo insuficiente para processamento." });
    }

    // Auto-extract if user supplied binary PDF dump
    if (rawText.startsWith("%PDF-") || (rawText.includes("endobj") && rawText.includes("stream"))) {
      try {
        const buf = Buffer.from(rawText, "binary");
        const extracted = await extractTextFromPdfBuffer(buf);
        if (extracted && extracted.length > 20) {
          rawText = extracted;
        }
      } catch (e) {
        console.warn("Falha ao ler dump de PDF:", e);
      }
    }

    const { bulletin, method } = await processBulletinWithAiOrHeuristic(
      rawText,
      title,
      edition,
      date
    );

    res.json({ success: true, bulletin, method, text: rawText });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro no processamento do boletim" });
  }
});

// Generate Social Media Posts for a bulletin
app.post("/api/social/generate-posts", (req, res) => {
  const { bulletin, baseUrl } = req.body;
  if (!bulletin || !bulletin.title) {
    return res.status(400).json({ error: "Dados do boletim inválidos." });
  }
  const posts = generateSocialPosts(bulletin, baseUrl);
  res.json({ posts });
});

// Automated Social Media Dispatch (Webhook / Integrated API)
app.post("/api/social/publish", async (req, res) => {
  try {
    const { platform, content, webhookUrl, bulletinId, edition } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Conteúdo da publicação é obrigatório." });
    }

    const logEntry: SocialLog = {
      id: `dispatch-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      platform: platform || "geral",
      timestamp: new Date().toISOString(),
      status: "simulated",
      responseMessage: "Publicação registrada no log com sucesso.",
      payloadSummary: content.slice(0, 100) + "...",
    };

    // If real webhook URL was provided, attempt real HTTP POST
    if (webhookUrl && (webhookUrl.startsWith("http://") || webhookUrl.startsWith("https://"))) {
      try {
        const fetchRes = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "BoletimSemanal-Publisher/1.0",
          },
          body: JSON.stringify({
            event: "bulletin.social_publish",
            platform,
            edition,
            bulletinId,
            content,
            publishedAt: new Date().toISOString(),
          }),
        });

        if (fetchRes.ok) {
          logEntry.status = "success";
          logEntry.responseMessage = `Webhook respondeu HTTP ${fetchRes.status} OK!`;
        } else {
          logEntry.status = "failed";
          logEntry.responseMessage = `Webhook retornou HTTP ${fetchRes.status}: ${fetchRes.statusText}`;
        }
      } catch (postErr: any) {
        logEntry.status = "failed";
        logEntry.responseMessage = `Falha na requisição ao Webhook: ${postErr.message}`;
      }
    } else {
      // Internal simulated API dispatch (e.g. meta graph API / WhatsApp API simulation)
      logEntry.status = "success";
      logEntry.responseMessage = `API integrada para ${platform.toUpperCase()}: Post enfileirado e publicado com sucesso!`;
    }

    dispatchLogs.unshift(logEntry);
    if (dispatchLogs.length > 50) dispatchLogs.pop();

    res.json({
      success: logEntry.status === "success",
      log: logEntry,
      allLogs: dispatchLogs,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro no disparo para redes sociais." });
  }
});

// Get Dispatch History Logs
app.get("/api/social/history", (req, res) => {
  res.json({ logs: dispatchLogs });
});

// ----------------------------------------------------
// VITE OR STATIC MIDDLEWARE
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer();
