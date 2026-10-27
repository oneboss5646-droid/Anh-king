import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to get Gemini client if key is configured
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Health & Connection Status Route
app.get('/api/status', (_req, res) => {
  const ai = getGeminiClient();
  if (!ai) {
    res.json({
      connected: false,
      model: null,
      message: 'AI backend not connected. No API key configured.',
    });
    return;
  }
  res.json({
    connected: true,
    model: 'gemini-3.1-flash-lite',
    message: 'AI backend connected.',
  });
});

// 2. Chat Completion Stream Route
app.post('/api/chat', async (req, res) => {
  const ai = getGeminiClient();

  // If no backend is configured, return explicit error
  if (!ai) {
    res.status(503).json({
      error: 'AI backend not connected',
      message: 'AI backend not connected. No API key or provider is configured.',
    });
    return;
  }

  const { prompt, history = [], attachments = [] } = req.body;

  if (!prompt && (!attachments || attachments.length === 0)) {
    res.status(400).json({ error: 'Prompt or attachment is required.' });
    return;
  }

  // Set up Server-Sent Events (SSE)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let isAborted = false;
  res.on('close', () => {
    if (!res.writableEnded) {
      isAborted = true;
    }
  });

  try {
    // Format conversation history
    const contents: any[] = [];
    for (const h of history.slice(-8)) {
      if (h.role === 'user' || h.role === 'assistant') {
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }],
        });
      }
    }

    // Current turn parts
    const currentParts: any[] = [];
    if (attachments && Array.isArray(attachments)) {
      for (const att of attachments) {
        if (att.textContent) {
          currentParts.push({
            text: `[Attached file: ${att.name}]\n${att.textContent.slice(0, 8000)}\n[End of file]`,
          });
        }
      }
    }
    if (prompt) {
      currentParts.push({ text: prompt });
    }
    contents.push({ role: 'user', parts: currentParts });

    // Primary model: gemini-3.1-flash-lite
    let responseStream;
    try {
      responseStream = await ai.models.generateContentStream({
        model: 'gemini-3.1-flash-lite',
        contents,
      });
    } catch (modelErr: any) {
      console.warn('Primary model error, attempting gemini-3.8-flash:', modelErr?.message);
      responseStream = await ai.models.generateContentStream({
        model: 'gemini-3.8-flash',
        contents,
      });
    }

    for await (const chunk of responseStream) {
      if (isAborted) break;
      const text = chunk.text || '';
      if (text) {
        res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
      }
    }

    if (!isAborted) {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    }
  } catch (err: any) {
    console.error('Gemini chat error in server:', err);
    if (!isAborted && !res.writableEnded) {
      const errorMessage = err?.message || 'Failed to generate response from AI provider';
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      res.end();
    }
  }
});

// Mount Vite or static server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`ChatGPT 6 Plus server listening on port ${port}`);
  });
}

startServer();
