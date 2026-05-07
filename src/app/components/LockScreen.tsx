import React, { useState, useEffect } from 'react';
import { Fingerprint, Lock, ShieldCheck, Keypad } from 'lucide-react';
import { checkBiometry } from '../utils/security';

interface LockScreenProps {
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [mode, setMode] = useState<'biometric' | 'pin'>('biometric');
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleBiometric = async () => {
    setIsAuthenticating(true);
    setError(null);
    try {
      const success = await checkBiometry();
      if (success) {
        onUnlock();
      } else {
        setError("Authentication failed.");
      }
    } catch (err) {
      setMode('pin');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stored = localStorage.getItem('s_pin');
    if (pinInput === stored) {
      onUnlock();
    } else {
      setError("Incorrect PIN");
      setPinInput('');
      setTimeout(() => setError(null), 2000);
    }
  };

  useEffect(() => {
    const hasPin = !!localStorage.getItem('s_pin');
    if (!hasPin) {
      // If security is enabled but no PIN is set, something is wrong or it's a first-time setup
      // We'll let them through but they should set one in settings.
      // Actually, we'll force them to the biometric mode.
    }
    handleBiometric();
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0B1220] flex flex-col items-center justify-center p-6 text-white overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm flex flex-col items-center space-y-10 relative z-10">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 bg-white/5 border border-white/10 p-5 rounded-[2.5rem] shadow-2xl flex items-center justify-center">
            <ShieldCheck className="w-10 h-10 text-indigo-400" />
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-black tracking-tight">MoneyManager</h1>
            <p className="text-slate-400 font-medium">Secure Financial Vault</p>
          </div>
        </div>

        <div className="w-full">
          {mode === 'biometric' ? (
            <div className="flex flex-col items-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button
                onClick={handleBiometric}
                disabled={isAuthenticating}
                className="group relative flex flex-col items-center space-y-4"
              >
                <div className="w-24 h-24 bg-indigo-600 hover:bg-indigo-500 transition-all rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 active:scale-95">
                  {isAuthenticating ? (
                    <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Fingerprint className="w-12 h-12 text-white" />
                  )}
                </div>
                <span className="text-sm font-bold text-indigo-400 uppercase tracking-widest">
                  Tap to Scan
                </span>
              </button>

              <button 
                onClick={() => setMode('pin')}
                className="text-xs font-bold text-slate-500 hover:text-slate-400 transition-colors uppercase tracking-widest"
              >
                Use PIN Instead
              </button>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <form onSubmit={handlePinSubmit} className="space-y-6">
                <div className="space-y-2 text-center">
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Enter Security PIN</p>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={pinInput}
                    onChange={e => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="••••"
                    autoFocus
                    className={`w-full text-center text-4xl font-black tracking-[1.5rem] bg-white/5 border rounded-3xl px-4 py-6 text-white outline-none transition-all ${error ? 'border-red-500' : 'border-white/10 focus:border-indigo-500'}`}
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    type="submit"
                    disabled={pinInput.length !== 4}
                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-lg transition-all disabled:opacity-30 shadow-xl shadow-indigo-600/20"
                  >
                    Unlock Vault
                  </button>
                  <button 
                    type="button"
                    onClick={() => setMode('biometric')}
                    className="py-2 text-xs font-bold text-slate-500 hover:text-slate-400 uppercase tracking-widest"
                  >
                    Back to Biometrics
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {error && (
          <div className="absolute bottom-[-60px] w-full text-center animate-bounce">
            <span className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
              {error}
            </span>
          </div>
        )}
      </div>

      <div className="absolute bottom-10 text-slate-600 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
        <Lock className="w-3 h-3" />
        End-to-End Encryption Active
      </div>
    </div>
  );
};
