import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Radio,
  X,
  Send,
  Volume2,
  Terminal,
  Shield,
  Sparkles,
  HelpCircle,
  Loader2,
} from 'lucide-react';

interface VoiceMentorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCommandName?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'mentor';
  text: string;
  time: string;
}

export const VoiceMentorModal: React.FC<VoiceMentorModalProps> = ({
  isOpen,
  onClose,
  activeCommandName,
}) => {
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize introductory message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const intro = activeCommandName
        ? `Hey! I'm your Linux Cybersecurity Mentor. I see you're looking at "${activeCommandName}". Ask me anything about how it works, how hackers abuse it, or safe ways to practice!`
        : `Hey! I'm your Linux Cybersecurity Mentor powered by Gemini Live. Turn on the live voice microphone to talk in real-time, or type a question about any Linux command, flag, or security concept below.`;
      setMessages([
        {
          id: 'intro',
          sender: 'mentor',
          text: intro,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [isOpen, activeCommandName, messages.length]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean up on unmount or close
  useEffect(() => {
    if (!isOpen) {
      stopLiveSession();
    }
  }, [isOpen]);

  // Play PCM raw audio chunk from Gemini Live
  const playPcmAudio = (base64Audio: string) => {
    try {
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const int16Array = new Int16Array(bytes.buffer);

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({
          sampleRate: 24000,
        });
      }
      const ctx = audioContextRef.current;
      const buffer = ctx.createBuffer(1, int16Array.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < int16Array.length; i++) {
        channelData[i] = int16Array[i] / 32768.0;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
      setIsTalking(true);
      source.onended = () => {
        setIsTalking(false);
      };
    } catch (err) {
      console.error('Error playing raw PCM audio:', err);
    }
  };

  // Connect to Gemini 3.8 Live WebSocket
  const startLiveSession = async () => {
    setErrorMsg(null);
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        setIsLiveConnected(true);
        // Start microphone capture at 16kHz
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              channelCount: 1,
              sampleRate: 16000,
              echoCancellation: true,
              noiseSuppression: true,
            },
          });
          mediaStreamRef.current = stream;

          const micCtx = new (window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({
            sampleRate: 16000,
          });
          const source = micCtx.createMediaStreamSource(stream);
          const processor = micCtx.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;

          processor.onaudioprocess = (e) => {
            if (ws.readyState === WebSocket.OPEN) {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcm16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                const s = Math.max(-1, Math.min(1, inputData[i]));
                pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
              }
              const uint8 = new Uint8Array(pcm16.buffer);
              let binary = '';
              for (let i = 0; i < uint8.byteLength; i++) {
                binary += String.fromCharCode(uint8[i]);
              }
              const base64 = btoa(binary);
              ws.send(JSON.stringify({ audio: base64 }));
            }
          };

          source.connect(processor);
          processor.connect(micCtx.destination);
          setIsListening(true);
        } catch (micErr: any) {
          console.warn('Microphone permission denied or not available:', micErr);
          setErrorMsg('Microphone access blocked. You can still type below to chat with the mentor!');
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.audio) {
            playPcmAudio(data.audio);
          }
          if (data.text) {
            setMessages((prev) => [
              ...prev,
              {
                id: Math.random().toString(),
                sender: 'mentor',
                text: data.text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }
          if (data.error) {
            setErrorMsg(data.error);
          }
        } catch (err) {
          console.error('Error parsing live WS payload:', err);
        }
      };

      ws.onclose = () => {
        setIsLiveConnected(false);
        setIsListening(false);
      };

      ws.onerror = () => {
        setErrorMsg('Live WebSocket connection failed. Using text chat instead.');
        setIsLiveConnected(false);
      };
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to establish Live connection');
    }
  };

  const stopLiveSession = () => {
    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch {}
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }
    setIsLiveConnected(false);
    setIsListening(false);
    setIsTalking(false);
  };

  // Text message submission (works alongside live voice or standalone)
  const handleSendMessage = async (textToSend?: string) => {
    const q = textToSend || textInput.trim();
    if (!q || isLoading) return;

    setTextInput('');
    setErrorMsg(null);

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);

    // If live WebSocket is open, send through WS
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text: q }));
      return;
    }

    // Otherwise use server REST proxy with gemini-3.8-flash
    setIsLoading(true);
    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        text: m.text,
      }));

      const res = await fetch('/api/mentor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          history: historyPayload,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: 'mentor',
            text: data.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else if (data.error) {
        setErrorMsg(data.error);
      }
    } catch (err: any) {
      setErrorMsg('Failed to communicate with mentor. Please check server connection.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0c1322] border border-cyan-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0e172a]">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_15px_rgba(0,212,255,0.4)]">
              <Terminal className="w-5 h-5 text-slate-950" />
              {isTalking && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                  Cyber Mentor Voice
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/60">
                  <Sparkles className="w-2.5 h-2.5" /> gemini-3.8-live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Real-time spoken Linux coach & cybersecurity drill tutor
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close mentor modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Voice Status Banner */}
        <div className="px-5 py-3 bg-[#111a2e] border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-3 h-3 rounded-full transition-all ${
                isLiveConnected
                  ? isTalking
                    ? 'bg-cyan-400 shadow-[0_0_10px_#00d4ff] scale-125'
                    : 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : 'bg-slate-600'
              }`}
            />
            <span className="text-xs font-mono text-slate-300">
              {isLiveConnected
                ? isTalking
                  ? 'Mentor is speaking...'
                  : isListening
                  ? 'Listening for your voice...'
                  : 'Live connected'
                : 'Live audio disconnected'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isLiveConnected ? (
              <button
                type="button"
                onClick={startLiveSession}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(0,212,255,0.4)] transition cursor-pointer active:scale-95"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Start Live Voice</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopLiveSession}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition cursor-pointer"
              >
                <MicOff className="w-3.5 h-3.5" />
                <span>End Voice</span>
              </button>
            )}
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mx-5 mt-3 p-2.5 rounded-xl bg-amber-950/60 border border-amber-600/50 text-amber-200 text-xs flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-amber-400 hover:text-white text-xs font-bold px-2 py-0.5"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Chat / Transcript Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 min-h-[240px] max-h-[380px]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-cyan-600 text-slate-950 font-medium rounded-br-none shadow-[0_0_15px_rgba(0,212,255,0.2)]'
                    : 'bg-[#152037] text-slate-200 border border-slate-700/80 rounded-bl-none shadow-md font-sans'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-1 px-1">{m.time}</span>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-cyan-400 italic font-mono p-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Mentor is thinking...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Suggested Quick Questions */}
        <div className="px-5 py-2 border-t border-slate-800/80 bg-[#0e172a]/60">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
            <span className="text-slate-500 text-[10px] shrink-0 font-mono">TRY ASKING:</span>
            <button
              type="button"
              onClick={() => handleSendMessage('Quiz me on Linux file permissions!')}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
            >
              Permissions Quiz
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('Explain the difference between su and sudo in plain English')}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
            >
              su vs sudo
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('What are the top 3 most dangerous Linux commands for beginners?')}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
            >
              Dangerous Commands
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('How do cybersecurity analysts use grep on log files?')}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
            >
              grep in Forensics
            </button>
          </div>
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 sm:p-4 border-t border-slate-800 bg-[#0c1322] flex items-center gap-2"
        >
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type your question for the Linux Mentor..."
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#111a2e] border border-slate-700 text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
          />

          <button
            type="submit"
            disabled={!textInput.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold transition flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(0,212,255,0.3)]"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
