import React, { useState } from 'react';
import {
  Settings,
  Building,
  Lock,
  Download,
  Upload,
  RefreshCw,
  Save,
  CheckCircle,
  Shield,
  Eye,
  EyeOff,
  AlertTriangle,
  FileJson,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { AppSettings } from '../types/crm';
import { storageService } from '../services/storage';
import { ContactPickerButton } from '../components/ContactPickerButton';

export const SettingsScreen: React.FC = () => {
  const {
    settings,
    saveSettings,
    currentUser,
    saveUser,
    exportBackup,
    importBackup,
    refreshData,
    showToast,
  } = useCrm();

  // Agency Profile
  const [agencyName, setAgencyName] = useState(settings.agencyName);
  const [agencyTagline, setAgencyTagline] = useState(settings.agencyTagline);
  const [agencyPhone, setAgencyPhone] = useState(settings.agencyPhone);
  const [agencyWhatsApp, setAgencyWhatsApp] = useState(settings.agencyWhatsApp);
  const [agencyEmail, setAgencyEmail] = useState(settings.agencyEmail);
  const [agencyAddress, setAgencyAddress] = useState(settings.agencyAddress);
  const [agencyLogoUri, setAgencyLogoUri] = useState(settings.agencyLogoUri);

  // Security
  const [biometricEnabled, setBiometricEnabled] = useState(settings.biometricLockEnabled);
  const [pinLockCode, setPinLockCode] = useState(settings.pinLockCode || '');
  const [numberFormatWords, setNumberFormatWords] = useState(settings.numberFormatWords);
  const [currencyPrefix, setCurrencyPrefix] = useState(settings.currencyPrefix || 'PKR');

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  // Restore mode
  const [restoreMode, setRestoreMode] = useState<'replace' | 'merge'>('replace');

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = pinLockCode.trim();
    if (biometricEnabled && !/^\d{4}$/.test(pin)) {
      showToast('Enter a 4-digit PIN before enabling the screen lock.', 'error');
      return;
    }
    const updated: AppSettings = {
      agencyName: agencyName.trim(),
      agencyTagline: agencyTagline.trim(),
      agencyPhone: agencyPhone.trim(),
      agencyWhatsApp: agencyWhatsApp.trim(),
      agencyEmail: agencyEmail.trim(),
      agencyAddress: agencyAddress.trim(),
      agencyLogoUri: agencyLogoUri.trim(),
      currencyPrefix: currencyPrefix.trim(),
      numberFormatWords,
      themeMode: settings.themeMode,
      biometricLockEnabled: biometricEnabled,
      pinLockCode: biometricEnabled ? pin : '',
      inactivityTimeoutMinutes: settings.inactivityTimeoutMinutes,
    };
    saveSettings(updated);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (currentUser.passwordHash !== currentPassword) {
      showToast('Current password does not match.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New password and confirmation do not match.', 'error');
      return;
    }

    saveUser({
      ...currentUser,
      passwordHash: newPassword,
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Your account password was updated successfully!', 'success');
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importBackup(content, restoreMode);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetDefaults = () => {
    if (
      confirm(
        'Reset CRM database to fresh demo initial state? All your current records will be re-seeded.'
      )
    ) {
      storageService.resetToDefaults();
      refreshData();
      showToast('Estate Vault database reset to default demo seed data.', 'info');
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-600" />
          Settings & Local Database Management
        </h2>
        <p className="text-xs text-slate-500">
          Customize agency profile, lock PIN, currency format, and export/import offline JSON backups
        </p>
      </div>

      {/* 1. Agency Profile */}
      <form
        onSubmit={handleSavePreferences}
        className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
      >
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Building className="w-4 h-4 text-emerald-600" />
          Real Estate Agency & Branding Profile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Agency Name *
            </label>
            <input
              type="text"
              required
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tagline / Subtitle
            </label>
            <input
              type="text"
              value={agencyTagline}
              onChange={(e) => setAgencyTagline(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Office Phone *
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                required
                value={agencyPhone}
                onChange={(e) => setAgencyPhone(e.target.value)}
                className="flex-1 min-w-0 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
              />
              <ContactPickerButton
                onContactSelected={(_cName, cPhone) => {
                  if (cPhone) {
                    setAgencyPhone(cPhone);
                    if (!agencyWhatsApp) setAgencyWhatsApp(cPhone);
                  }
                }}
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Office WhatsApp
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={agencyWhatsApp}
                onChange={(e) => setAgencyWhatsApp(e.target.value)}
                className="flex-1 min-w-0 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
              />
              <ContactPickerButton
                onContactSelected={(_cName, cPhone) => {
                  if (cPhone) setAgencyWhatsApp(cPhone);
                }}
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Official Email
            </label>
            <input
              type="email"
              value={agencyEmail}
              onChange={(e) => setAgencyEmail(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Agency Logo Asset URL
            </label>
            <input
              type="text"
              value={agencyLogoUri}
              onChange={(e) => setAgencyLogoUri(e.target.value)}
              placeholder="/estate_vault_icon.png"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Physical Office Address
            </label>
            <input
              type="text"
              value={agencyAddress}
              onChange={(e) => setAgencyAddress(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
        </div>

        {/* Currency & Formatting */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Currency Symbol / Prefix
            </label>
            <input
              type="text"
              value={currencyPrefix}
              onChange={(e) => setCurrencyPrefix(e.target.value)}
              placeholder="PKR"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={numberFormatWords}
                onChange={(e) => setNumberFormatWords(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>Display South Asian words (Crore & Lakh)</span>
            </label>
          </div>
        </div>

        {/* Security PIN Lock */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300 mb-1">
              <input
                type="checkbox"
                checked={biometricEnabled}
                onChange={(e) => setBiometricEnabled(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>Enable Quick PIN / Biometric Screen Lock</span>
            </label>
            <p className="text-[11px] text-slate-400">
              Requires entering a 4-digit PIN upon app open
            </p>
          </div>

          {biometricEnabled && (
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                4-Digit Security PIN Code
              </label>
              <input
                type="text"
                maxLength={4}
                value={pinLockCode}
                inputMode="numeric"
                onChange={(e) => setPinLockCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="Enter 4-digit PIN"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-center tracking-widest text-base"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* 2. Password Change */}
      <form
        onSubmit={handleChangePassword}
        className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            Change User Password
          </h3>
          <button
            type="button"
            onClick={() => setShowPasswordFields(!showPasswordFields)}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            {showPasswordFields ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Current Password
            </label>
            <input
              type={showPasswordFields ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              New Password
            </label>
            <input
              type={showPasswordFields ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Confirm New Password
            </label>
            <input
              type={showPasswordFields ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
          >
            Update Password
          </button>
        </div>
      </form>

      {/* 3. Local Backup & Restore */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileJson className="w-4 h-4 text-emerald-600" />
            Local Database Backup & Restore
          </h3>
          <p className="text-xs text-slate-500">
            Export a complete JSON snapshot of all inventory, clients, leads, transactions, and investors
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Export */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-3">
            <h4 className="font-bold text-emerald-900 dark:text-emerald-300 text-xs">
              Export System Snapshot
            </h4>
            <p className="text-[11px] text-slate-500">
              Download your complete database file to your computer. Keep it safe as your offline backup.
            </p>
            <button
              onClick={exportBackup}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          {/* Import */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">
              Restore from Backup File
            </h4>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="restore-mode"
                  checked={restoreMode === 'replace'}
                  onChange={() => setRestoreMode('replace')}
                  className="text-emerald-600"
                />
                <span className="text-[11px]">Replace Current</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="restore-mode"
                  checked={restoreMode === 'merge'}
                  onChange={() => setRestoreMode('merge')}
                  className="text-emerald-600"
                />
                <span className="text-[11px]">Merge Data</span>
              </label>
            </div>

            <label className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-all">
              <Upload className="w-4 h-4" />
              <span>Select Backup File...</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Factory Reset */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200">Reset Demo Data</span>
            <p className="text-[11px] text-slate-400">
              Re-populate initial sample properties, clients, leads, and accounts
            </p>
          </div>
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-4 py-2 border border-rose-300 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-bold rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Demo State</span>
          </button>
        </div>
      </div>
    </div>
  );
};
