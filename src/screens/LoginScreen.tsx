import React, { useState } from 'react';
import { Shield, Lock, User, Eye, EyeOff, HardDrive, Info } from 'lucide-react';
import { useCrm } from '../context/CrmContext';

export const LoginScreen: React.FC = () => {
  const { login, setupAdmin, users } = useCrm();
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [setupError, setSetupError] = useState('');
  const isFirstRun = users.length === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError('');
    if (!isFirstRun) {
      login(identifier, password);
      return;
    }
    if (password !== confirmPassword) {
      setSetupError('Passwords do not match.');
      return;
    }
    try {
      setupAdmin({ name, username, email, password });
    } catch (error) {
      setSetupError(error instanceof Error ? error.message : 'Unable to create the administrator account.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden font-sans">
      {/* Subtle background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl mx-auto mb-4 p-1 bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-xl shadow-emerald-950 flex items-center justify-center overflow-hidden">
              <img
                src="/estate_vault_icon.png"
                alt="Estate Vault CRM Logo"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Estate Vault CRM
            </h1>
            <p className="text-xs text-emerald-400 font-semibold tracking-wider uppercase mt-1">
              {isFirstRun ? 'Create your administrator account' : 'Autonomous Real Estate Operating System'}
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-[11px] text-emerald-300">
              <HardDrive className="w-3 h-3 text-emerald-400" />
              <span>Offline-First • Zero Cloud Dependency</span>
            </div>
          </div>

          {/* Login and first-run setup form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isFirstRun ? (
              <>
                <label className="block text-xs font-semibold text-slate-300">
                  Name
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1.5 w-full px-4 py-2.5 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </label>
                <label className="block text-xs font-semibold text-slate-300">
                  Username
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1.5 w-full px-4 py-2.5 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </label>
                <label className="block text-xs font-semibold text-slate-300">
                  Email <span className="font-normal text-slate-500">(optional)</span>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 w-full px-4 py-2.5 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </label>
              </>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Username or Email
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter your username or email"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={isFirstRun ? 12 : undefined}
                  autoComplete={isFirstRun ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isFirstRun ? 'At least 12 characters' : 'Enter your password'}
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isFirstRun && (
              <div>
                <label htmlFor="confirm-password" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Confirm password
                </label>
                <input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={12}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            )}

            {setupError && (
              <p role="alert" className="text-xs text-rose-400">{setupError}</p>
            )}

            {!isFirstRun && <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-emerald-400 hover:text-emerald-300 font-medium"
              >
                Forgot password?
              </button>
            </div>}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950 transition-all hover:scale-[1.01] active:scale-[0.99] mt-2"
            >
              {isFirstRun ? 'Create Administrator Account' : 'Sign In to Estate Vault'}
            </button>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center mb-3">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Offline Password Recovery
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Estate Vault CRM operates completely local on your device with no internet connection or cloud server. To reset a forgotten password, please log in with the <strong>Super Admin</strong> account and manage users in the User Administration panel.
            </p>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
