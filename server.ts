import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize GoogleGenAI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper system instruction for Linux cybersecurity study
const SYSTEM_INSTRUCTION = `You are a supportive, expert Linux mentor teaching Linux commands to a beginner preparing for cybersecurity.
Keep your spoken and written explanations concise, crystal-clear, and free of unnecessary jargon.
If you introduce a technical term, explain it on the spot.
Provide real terminal examples, practical tips, and point out destructive commands (like rm -rf, dd, chmod -R 777) so the learner stays safe.`;

// REST Endpoint: Text or Voice Query fallback with gemini-3.8-flash
app.post('/api/mentor/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!apiKey) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please configure it in AI Studio Secrets.',
      });
    }

    const contents = [];
    if (Array.isArray(history)) {
      for (const turn of history) {
        if (turn.role && turn.text) {
          contents.push({
            role: turn.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: turn.text }],
          });
        }
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const reply = response.text || "I couldn't generate a response. Please ask again!";
    return res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/mentor/chat:', error);
    return res.status(500).json({
      error: error.message || 'Failed to communicate with Linux Mentor AI',
    });
  }
});

// Setup WebSocket Server on /live for real-time gemini-3.8-live voice conversations
const wss = new WebSocketServer({ server, path: '/live' });

wss.on('connection', async (clientWs: WebSocket) => {
  if (!apiKey) {
    clientWs.send(
      JSON.stringify({
        error: 'GEMINI_API_KEY is not set on the server.',
      })
    );
    clientWs.close();
    return;
  }

  let session: any = null;

  try {
    session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          const parts = message.serverContent?.modelTurn?.parts;
          if (parts && parts.length > 0) {
            const audioData = parts[0]?.inlineData?.data;
            const textData = parts[0]?.text;
            if (audioData) {
              clientWs.send(JSON.stringify({ audio: audioData }));
            }
            if (textData) {
              clientWs.send(JSON.stringify({ text: textData }));
            }
          }
          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ interrupted: true }));
          }
        },
        onclose: () => {
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ closed: true }));
          }
        },
      },
    });

    clientWs.send(JSON.stringify({ status: 'connected' }));

    clientWs.on('message', (raw) => {
      try {
        const payload = JSON.parse(raw.toString());
        if (payload.audio) {
          session.sendRealtimeInput({
            audio: { data: payload.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        } else if (payload.text) {
          session.send({
            clientContent: {
              turns: [{ role: 'user', parts: [{ text: payload.text }] }],
              turnComplete: true,
            },
          });
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
      }
    });

    clientWs.on('close', () => {
      try {
        session?.close();
      } catch {}
    });
  } catch (error: any) {
    console.error('Failed to establish Live session:', error);
    clientWs.send(JSON.stringify({ error: error.message || 'Live session error' }));
    clientWs.close();
  }
});

// Mount Vite middleware in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(port, () => {
    console.log(`Linux Cheat Sheet server listening on http://localhost:${port}`);
  });
}

startServer();
