import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { signInWithGoogle, logOut } from '../firebase';
import {
  Shield,
  X,
  LogOut,
  Database,
  CheckCircle2,
  Bookmark,
  Sparkles,
  Cloud,
  Lock,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  learnedCount: number;
  favoritesCount: number;
  onUserChange?: (user: User | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  learnedCount,
  favoritesCount,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      console.error('Firebase Auth sign in error:', err);
      setErrorMsg(err.message || 'Google Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await logOut();
      onClose();
    } catch (err: any) {
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0c1322] border border-cyan-500/40 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3 mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_20px_rgba(0,212,255,0.4)]">
            <Database className="w-7 h-7 text-slate-950" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">
            {currentUser ? 'CyberSec Cloud Account' : 'Connect Your Account'}
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {currentUser
              ? 'Your study progress, learned commands, and notes are securely synced to Firebase Firestore.'
              : 'Sign in with Google to sync your learned commands, starred favorites, and study notes across all devices.'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs">
            {errorMsg}
          </div>
        )}

        {currentUser ? (
          /* Logged In Profile Card */
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#111a2e] border border-slate-800">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-12 h-12 rounded-full border border-cyan-400/60"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-cyan-600 flex items-center justify-center font-bold text-slate-950">
                  {currentUser.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <div className="overflow-hidden">
                <div className="font-bold text-sm text-slate-100 truncate">
                  {currentUser.displayName || 'Cyber Cadet'}
                </div>
                <div className="text-xs text-slate-400 truncate">{currentUser.email}</div>
                <div className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono mt-1">
                  <Cloud className="w-3 h-3" /> Firestore Synced
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-lg font-bold text-emerald-400 font-mono">{learnedCount}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Commands Learned</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-lg font-bold text-amber-400 font-mono">{favoritesCount}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Starred Favorites</div>
              </div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleSignOut}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 border border-slate-700 hover:border-rose-500/50 text-xs font-semibold text-slate-300 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          /* Sign In Card */
          <div className="space-y-4">
            <button
              type="button"
              disabled={loading}
              onClick={handleSignIn}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm transition flex items-center justify-center gap-3 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-[0.98]"
            >
              {/* Google G Logo SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                <Lock className="w-3 h-3" /> Zero-Trust Security
              </div>
              <p>
                Your data is stored in your private Firestore partition. Even if you stay signed out, all features work offline with browser storage.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
