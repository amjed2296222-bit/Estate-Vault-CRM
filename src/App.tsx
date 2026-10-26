import React, { useState } from 'react';
import { CrmProvider, useCrm } from './context/CrmContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BiometricPinModal } from './components/BiometricPinModal';
import { SmartShareModal } from './components/SmartShareModal';
import { LoginScreen } from './screens/LoginScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { PropertiesScreen } from './screens/PropertiesScreen';
import { AddEditPropertyScreen } from './screens/AddEditPropertyScreen';
import { PropertyDetailScreen } from './screens/PropertyDetailScreen';
import { ClientsLeadsScreen } from './screens/ClientsLeadsScreen';
import { AccountsKhataScreen } from './screens/AccountsKhataScreen';
import { InvestorsScreen } from './screens/InvestorsScreen';
import { InvestorDetailScreen } from './screens/InvestorDetailScreen';
import { SmartShareScreen } from './screens/SmartShareScreen';
import { DropdownMgmtScreen } from './screens/DropdownMgmtScreen';
import { UserAdminScreen } from './screens/UserAdminScreen';
import { RecycleBinScreen } from './screens/RecycleBinScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { SuperAdminDashboardScreen } from './screens/SuperAdminDashboardScreen';
import { PropertyEntity } from './types/crm';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    isLoggedIn,
    isBiometricLocked,
    currentScreen,
    selectedProperty,
    selectedInvestor,
    toasts,
    removeToast,
  } = useCrm();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [smartShareProperty, setSmartShareProperty] = useState<PropertyEntity | null>(null);

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex font-sans antialiased">
      {/* Biometric / PIN Lock Overlay */}
      {isBiometricLocked && <BiometricPinModal />}

      {/* Global Smart Share Modal */}
      {smartShareProperty && (
        <SmartShareModal
          property={smartShareProperty}
          onClose={() => setSmartShareProperty(null)}
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentScreen === 'DASHBOARD' && <DashboardScreen />}
          {currentScreen === 'SUPER_ADMIN_DASHBOARD' && <SuperAdminDashboardScreen />}
          {currentScreen === 'PROPERTIES' && (
            <PropertiesScreen onOpenSmartShare={(p) => setSmartShareProperty(p)} />
          )}
          {currentScreen === 'ADD_EDIT_PROPERTY' && (
            <AddEditPropertyScreen propertyToEdit={selectedProperty} />
          )}
          {currentScreen === 'PROPERTY_DETAIL' && selectedProperty && (
            <PropertyDetailScreen
              property={selectedProperty}
              onOpenSmartShare={(p) => setSmartShareProperty(p)}
            />
          )}
          {currentScreen === 'CLIENTS_LEADS' && <ClientsLeadsScreen />}
          {currentScreen === 'ACCOUNTS_KHATA' && <AccountsKhataScreen />}
          {currentScreen === 'INVESTORS' && <InvestorsScreen />}
          {currentScreen === 'INVESTOR_DETAIL' && selectedInvestor && (
            <InvestorDetailScreen investor={selectedInvestor} />
          )}
          {currentScreen === 'SMART_SHARE_EXPORT' && (
            <SmartShareScreen onOpenSmartShare={(p) => setSmartShareProperty(p)} />
          )}
          {currentScreen === 'DROPDOWN_MGMT' && <DropdownMgmtScreen />}
          {currentScreen === 'USER_ADMIN' && <UserAdminScreen />}
          {currentScreen === 'RECYCLE_BIN' && <RecycleBinScreen />}
          {currentScreen === 'SETTINGS' && <SettingsScreen />}
        </main>
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 rounded-2xl shadow-xl border flex items-center justify-between gap-3 text-xs font-semibold animate-in slide-in-from-bottom-2 duration-150 ${
              t.type === 'error'
                ? 'bg-rose-900/90 text-white border-rose-700 backdrop-blur-md'
                : t.type === 'info'
                ? 'bg-slate-900/90 text-white border-slate-700 backdrop-blur-md'
                : 'bg-emerald-900/90 text-white border-emerald-700 backdrop-blur-md'
            }`}
          >
            <div className="flex items-center gap-2">
              {t.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : t.type === 'info' ? (
                <Info className="w-4 h-4 text-sky-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-white/60 hover:text-white shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <CrmProvider>
      <MainAppContent />
    </CrmProvider>
  );
}
