import React, { useState, useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { FinanceProvider } from "./context/FinanceContext";
import { Lock } from "lucide-react";

const PinGate = ({ onUnlock }: { onUnlock: () => void }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stored = localStorage.getItem('s_pin');
    if (input === stored) {
      onUnlock();
    } else {
      setError(true);
      setInput('');
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0B1220] flex items-center justify-center p-6">
      <div className="w-full max-w-xs text-center space-y-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Lock className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-black text-white">MoneyManager</h1>
          <p className="text-slate-400 text-sm">Enter your PIN to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={input}
            onChange={e => setInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="••••"
            autoFocus
            className={`w-full text-center text-3xl font-black tracking-[1rem] bg-white/5 border rounded-2xl px-4 py-5 text-white outline-none transition-all ${error ? 'border-red-500 animate-pulse' : 'border-white/10 focus:border-indigo-500'}`}
          />
          {error && <p className="text-red-400 text-sm font-medium">Incorrect PIN</p>}
          <button
            type="submit"
            disabled={input.length !== 4}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg transition-all disabled:opacity-30 active:scale-95"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
};

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const pinRequired = !!localStorage.getItem('s_pin') && localStorage.getItem('s_biometric') === 'true';

  useEffect(() => {
    if (!pinRequired) setUnlocked(true);
  }, [pinRequired]);

  if (!unlocked) {
    return <PinGate onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <FinanceProvider>
      <RouterProvider router={router} />
    </FinanceProvider>
  );
}
