import React, { useState } from 'react';
import {
  Search,
  Shield,
  Bell,
  LogOut,
  HardDrive,
  User,
  Menu,
  X,
  Plus,
  Home,
  CheckCircle2,
  Calendar,
  Megaphone,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar }) => {
  const {
    currentUser,
    logout,
    searchQuery,
    setSearchQuery,
    currentScreen,
    navigateTo,
    clients,
    leads,
    announcements,
  } = useCrm();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Compute pending follow-ups & targeted active announcements
  const now = Date.now();
  const pendingLeads = leads.filter(l => l.followUpDate > 0 && l.followUpDate <= now + 86400000 * 3);
  const pendingClients = clients.filter(c => c.followUpDate > 0 && c.followUpDate <= now + 86400000 * 3);
  const visibleAnnouncements = announcements.filter(ann => {
    if (!ann.isActive) return false;
    if (ann.targetType === 'all') return true;
    if (ann.targetType === 'packages' && currentUser?.packageId) {
      return (ann.targetPackageIds || []).includes(currentUser.packageId);
    }
    if (ann.targetType === 'users' && currentUser?.id) {
      return (ann.targetUserIds || []).includes(currentUser.id);
    }
    return currentUser?.role === 'super_admin';
  });
  const totalReminders = pendingLeads.length + pendingClients.length + visibleAnnouncements.length;

  const screenTitles: Record<string, string> = {
    DASHBOARD: 'Dashboard Overview',
    SUPER_ADMIN_DASHBOARD: 'Super Admin Dashboard',
    PROPERTIES: 'Property Listings',
    ADD_EDIT_PROPERTY: 'Add / Edit Property',
    PROPERTY_DETAIL: 'Property Details',
    CLIENTS_LEADS: 'Clients & Leads Pipeline',
    ACCOUNTS_KHATA: 'Accounts & Khata Ledger',
    INVESTORS: 'Investors Portfolio',
    INVESTOR_DETAIL: 'Investor Accounting Statement',
    SMART_SHARE_EXPORT: 'Smart Share & Marketing',
    DROPDOWN_MGMT: 'Universal Dropdowns',
    USER_ADMIN: 'User & Permissions Admin',
    RECYCLE_BIN: 'Trash / Recycle Bin',
    SETTINGS: 'System Settings & Backup',
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5">
        {/* Left: Mobile menu toggle & title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <span>{screenTitles[currentScreen] || 'Estate Vault CRM'}</span>
            </h1>
            <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
              Offline-first Real Estate Operating System
            </p>
          </div>
        </div>

        {/* Center: Search input */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search properties, clients, leads, transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right side items */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick Add Button */}
          <button
            onClick={() => navigateTo('ADD_EDIT_PROPERTY', null)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Property</span>
          </button>

          {/* "Saved on Device" offline chip (matches Kotlin SyncStatusChip) */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-medium text-emerald-700 dark:text-emerald-300">
            <HardDrive className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Saved on Device</span>
          </div>

          {/* Reminders / Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Follow-up reminders"
            >
              <Bell className="w-5 h-5" />
              {totalReminders > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    Follow-up Reminders ({totalReminders})
                  </h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 max-h-64 overflow-y-auto space-y-2">
                  {totalReminders === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No upcoming client or lead follow-ups!
                    </div>
                  ) : (
                    <>
                      {visibleAnnouncements.map(ann => (
                        <div
                          key={`ann-${ann.id}`}
                          className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60"
                        >
                          <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                            <span className="flex items-center gap-1 truncate">
                              <Megaphone className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{ann.title}</span>
                            </span>
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-200/70 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
                              {ann.priority}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                            {ann.message}
                          </p>
                        </div>
                      ))}

                      {pendingLeads.map(l => (
                        <div
                          key={`l-${l.id}`}
                          onClick={() => {
                            setShowNotifications(false);
                            navigateTo('CLIENTS_LEADS');
                          }}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer transition-colors border border-slate-100 dark:border-slate-800"
                        >
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                            <span>Lead: {l.clientName}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                              {l.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {l.notes || `${l.propertyCategory} (${l.preferredLocation})`}
                          </p>
                        </div>
                      ))}

                      {pendingClients.map(c => (
                        <div
                          key={`c-${c.id}`}
                          onClick={() => {
                            setShowNotifications(false);
                            navigateTo('CLIENTS_LEADS');
                          }}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer transition-colors border border-slate-100 dark:border-slate-800"
                        >
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                            <span>Client: {c.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300">
                              {c.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {c.notes || c.interestedProperty}
                          </p>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 pl-2 pr-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                {currentUser?.name?.charAt(0) || 'A'}
              </div>
              <div className="hidden lg:block text-left text-xs leading-tight">
                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[90px]">
                  {currentUser?.name?.split(' ')[0] || 'Admin'}
                </p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 capitalize">
                  {currentUser?.role === 'super_admin' ? 'Super Admin' : 'Agent'}
                </p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                    {currentUser?.name || 'Administrator'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {currentUser?.email || 'admin@estatevault.pk'}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    {currentUser?.role === 'super_admin' ? 'Super Admin (Full Access)' : 'Agent'}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigateTo('SETTINGS');
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    Profile & Agency Settings
                  </button>

                  {currentUser?.role === 'super_admin' && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigateTo('SUPER_ADMIN_DASHBOARD');
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4 text-emerald-600" />
                      Super Admin Dashboard
                    </button>
                  )}
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
