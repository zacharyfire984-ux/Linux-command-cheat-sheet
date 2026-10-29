import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ text, label, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for environments where clipboard API is restricted
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Copy failed', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied to clipboard' : 'Copy command to clipboard'}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-md border transition-all duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
        copied
          ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 font-semibold shadow-[0_0_12px_rgba(16,185,129,0.25)]'
          : 'bg-[#111a2e]/90 hover:bg-[#182542] border-slate-700/80 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-200'
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400 animate-in zoom-in-75 duration-150" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 opacity-70" />
          <span>{label || 'Copy'}</span>
        </>
      )}
    </button>
  );
};
