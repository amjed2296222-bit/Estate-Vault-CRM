import React, { useState } from 'react';
import { ShieldAlert, KeyRound, Lock, Delete } from 'lucide-react';
import { useCrm } from '../context/CrmContext';

export const BiometricPinModal: React.FC = () => {
  const { unlockBiometric, settings, logout } = useCrm();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      const next = pin + num;
      setPin(next);
      setError(false);
      if (next.length === 4) {
        // Auto-check on 4 digits
        setTimeout(() => {
          const ok = unlockBiometric(next);
          if (!ok) {
            setError(true);
            setPin('');
          }
        }, 150);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  const handleBypass = () => {
    // Quick biometric simulator
    unlockBiometric(settings.pinLockCode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Estate Vault Locked
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
          Enter your 4-digit PIN code to access the encrypted real estate CRM
        </p>

        {/* PIN Dots */}
        <div className="flex justify-center gap-4 mb-6">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                pin.length > idx
                  ? 'bg-emerald-600 border-emerald-600 scale-110 shadow-sm shadow-emerald-500/50'
                  : error
                  ? 'border-rose-500 bg-rose-50'
                  : 'border-slate-300 dark:border-slate-700'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-rose-500 font-semibold mb-4 animate-shake">
            Incorrect PIN code. Try again.
          </p>
        )}

        {/* Numeric keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className="w-14 h-14 rounded-2xl text-lg font-bold bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 transition-all active:scale-95 flex items-center justify-center mx-auto"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleBypass}
            className="w-14 h-14 rounded-2xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 transition-all flex flex-col items-center justify-center mx-auto"
            title="Biometric Fingerprint simulator"
          >
            <KeyRound className="w-4 h-4 mb-0.5" />
            <span className="text-[9px]">Touch</span>
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="w-14 h-14 rounded-2xl text-lg font-bold bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 transition-all active:scale-95 flex items-center justify-center mx-auto"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-14 h-14 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center mx-auto"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px]">Enter your security PIN</span>
          <button
            onClick={logout}
            className="text-rose-500 hover:text-rose-600 font-medium"
          >
            Switch User / Log Out
          </button>
        </div>
      </div>
    </div>
  );
};
