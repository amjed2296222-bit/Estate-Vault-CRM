import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Users2,
  Receipt,
  PieChart,
  Share2,
  SlidersHorizontal,
  ShieldCheck,
  Trash2,
  Settings,
  PlusCircle,
  X,
  Lock,
  Crown,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { CrmScreen } from '../types/crm';

interface SidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, onCloseMobile }) => {
  const { currentScreen, navigateTo, hasPermission, settings, currentUser, trashItems } = useCrm();

  const navItems: {
    screen: CrmScreen;
    label: string;
    icon: any;
    perm?: string;
    superAdminOnly?: boolean;
    countBadge?: number;
  }[] = [
    { screen: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    {
      screen: 'SUPER_ADMIN_DASHBOARD',
      label: 'Super Admin Dashboard',
      icon: Crown,
      superAdminOnly: true,
    },
    { screen: 'PROPERTIES', label: 'Properties', icon: Building2, perm: 'view_properties' },
    { screen: 'CLIENTS_LEADS', label: 'Clients & Leads', icon: Users2, perm: 'view_properties' },
    { screen: 'ACCOUNTS_KHATA', label: 'Accounts & Khata', icon: Receipt, perm: 'view_accounts' },
    { screen: 'INVESTORS', label: 'Investors Ledger', icon: PieChart, perm: 'view_investors' },
    { screen: 'SMART_SHARE_EXPORT', label: 'Smart Share & Reports', icon: Share2, perm: 'smart_share' },
    { screen: 'DROPDOWN_MGMT', label: 'Universal Dropdowns', icon: SlidersHorizontal },
    { screen: 'RECYCLE_BIN', label: 'Trash / Recycle Bin', icon: Trash2, countBadge: trashItems.length },
    { screen: 'SETTINGS', label: 'Settings & Backup', icon: Settings, perm: 'manage_settings' },
  ];

  const handleSelect = (screen: CrmScreen) => {
    navigateTo(screen);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 border-r border-slate-800">
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-emerald-500/30 bg-emerald-950 flex items-center justify-center shrink-0">
            <img
              src="/estate_vault_icon.png"
              alt="Estate Vault CRM Logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback icon
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="overflow-hidden">
            <h2 className="text-sm font-bold text-white tracking-wide truncate">
              Estate Vault CRM
            </h2>
            <p className="text-[10px] text-emerald-400 font-medium tracking-wider uppercase truncate">
              Real Estate OS
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Action Button */}
      <div className="p-3">
        <button
          onClick={() => handleSelect('ADD_EDIT_PROPERTY')}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-950 transition-all active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Property Entry</span>
        </button>
      </div>

      {/* Nav items list */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          if (item.superAdminOnly && currentUser?.role !== 'super_admin') {
            return null;
          }
          if (item.perm && !hasPermission(item.perm)) {
            return null;
          }

          const isActive = currentScreen === item.screen;
          const Icon = item.icon;

          return (
            <button
              key={item.screen}
              onClick={() => handleSelect(item.screen)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.countBadge !== undefined && item.countBadge > 0 && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
                    isActive
                      ? 'bg-white text-emerald-700'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {item.countBadge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info & Storage status */}
      <div className="p-3 border-t border-slate-800/80">
        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 text-[11px]">
          <div className="flex items-center justify-between text-slate-300">
            <span className="font-semibold">{settings.agencyName}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">
            {currentUser?.email || currentUser?.username}
          </p>
          <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-slate-700/50 text-[10px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <Lock className="w-3 h-3" /> Offline Encrypted
            </span>
            <span>v2.0 Web</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop permanent sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-20">
        {content}
      </aside>

      {/* Mobile drawer backdrop */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
