import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  PropertyEntity,
  ClientEntity,
  LeadEntity,
  AccountTransactionEntity,
  InvestorEntity,
  InvestorTransactionEntity,
  DropdownOptionEntity,
  SmartShareConfigEntity,
  UserEntity,
  ActivityLogEntity,
  TrashItemEntity,
  AppSettings,
  CrmScreen,
  SubscriptionPackageEntity,
  AnnouncementEntity,
} from '../types/crm';
import { storageService } from '../services/storage';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface CrmContextType {
  currentUser: UserEntity | null;
  isLoggedIn: boolean;
  currentScreen: CrmScreen;
  selectedProperty: PropertyEntity | null;
  selectedInvestor: InvestorEntity | null;
  searchQuery: string;
  toasts: ToastMessage[];
  properties: PropertyEntity[];
  clients: ClientEntity[];
  leads: LeadEntity[];
  transactions: AccountTransactionEntity[];
  investors: InvestorEntity[];
  investorTransactions: InvestorTransactionEntity[];
  dropdowns: DropdownOptionEntity[];
  users: UserEntity[];
  packages: SubscriptionPackageEntity[];
  announcements: AnnouncementEntity[];
  activityLogs: ActivityLogEntity[];
  trashItems: TrashItemEntity[];
  settings: AppSettings;
  smartShareConfig: SmartShareConfigEntity;
  isBiometricLocked: boolean;

  // Actions
  login: (identifier: string, pass: string) => boolean;
  setupAdmin: (details: { name: string; username: string; email: string; password: string }) => void;
  logout: () => void;
  navigateTo: (screen: CrmScreen, property?: PropertyEntity | null, investor?: InvestorEntity | null) => void;
  setSearchQuery: (query: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  unlockBiometric: (pin?: string) => boolean;
  refreshData: () => void;
  hasPermission: (permKey: string) => boolean;

  // CRUD
  saveProperty: (prop: Omit<PropertyEntity, 'id'> & { id?: number }) => PropertyEntity;
  deleteProperty: (id: number) => void;
  toggleFavorite: (id: number) => void;
  saveClient: (client: Omit<ClientEntity, 'id'> & { id?: number }) => ClientEntity;
  deleteClient: (id: number) => void;
  saveLead: (lead: Omit<LeadEntity, 'id'> & { id?: number }) => LeadEntity;
  deleteLead: (id: number) => void;
  saveTransaction: (tx: Omit<AccountTransactionEntity, 'id'> & { id?: number }) => AccountTransactionEntity;
  deleteTransaction: (id: number) => void;
  saveInvestor: (inv: Omit<InvestorEntity, 'id'> & { id?: number }) => InvestorEntity;
  saveInvestorTransaction: (tx: Omit<InvestorTransactionEntity, 'id'> & { id?: number }) => InvestorTransactionEntity;
  deleteInvestorTransaction: (id: number) => void;
  saveDropdownOption: (opt: Omit<DropdownOptionEntity, 'id'> & { id?: number }) => DropdownOptionEntity;
  deleteDropdownOption: (id: number) => void;
  saveUser: (user: Omit<UserEntity, 'id'> & { id?: number }) => UserEntity;
  deleteUser: (id: number) => void;
  savePackage: (pkg: Omit<SubscriptionPackageEntity, 'id'> & { id?: number }) => SubscriptionPackageEntity;
  deletePackage: (id: number) => void;
  saveAnnouncement: (ann: Omit<AnnouncementEntity, 'id'> & { id?: number }) => AnnouncementEntity;
  deleteAnnouncement: (id: number) => void;
  saveSettings: (settings: AppSettings) => void;
  saveSmartShareConfig: (config: SmartShareConfigEntity) => void;
  restoreTrashItem: (id: number) => void;
  permanentlyDeleteTrash: (id: number) => void;
  emptyTrash: () => void;
  exportBackup: () => void;
  importBackup: (jsonStr: string, mode: 'replace' | 'merge') => boolean;
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export const CrmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserEntity | null>(null);
  const [currentScreen, setCurrentScreen] = useState<CrmScreen>('DASHBOARD');
  const [selectedProperty, setSelectedProperty] = useState<PropertyEntity | null>(null);
  const [selectedInvestor, setSelectedInvestor] = useState<InvestorEntity | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isBiometricLocked, setIsBiometricLocked] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  // Initialize storage
  useEffect(() => {
    storageService.initialize();
    // Auto-login stored session if any or start fresh
    const savedUserId = localStorage.getItem('estatevault_session_user_id');
    if (savedUserId) {
      const users = storageService.getUsers();
      const user = users.find(u => u.id === Number(savedUserId));
      if (user && user.isActive) {
        setCurrentUser(user);
        const st = storageService.getSettings();
        if (st.biometricLockEnabled) {
          setIsBiometricLocked(true);
        }
      }
    }
    // Real-time data updates listener (same-window custom event & cross-tab storage event)
    const handleRealTimeSync = () => {
      setRefreshTick(t => t + 1);
      const activeUserId = localStorage.getItem('estatevault_session_user_id');
      if (activeUserId) {
        const latestUsers = storageService.getUsers();
        const updatedCurrent = latestUsers.find(u => u.id === Number(activeUserId));
        if (updatedCurrent) {
          setCurrentUser(updatedCurrent);
        }
      }
    };

    window.addEventListener('storage', handleRealTimeSync);
    window.addEventListener('estatevault_db_change', handleRealTimeSync);
    return () => {
      window.removeEventListener('storage', handleRealTimeSync);
      window.removeEventListener('estatevault_db_change', handleRealTimeSync);
    };
  }, []);

  const refreshData = () => {
    setRefreshTick(t => t + 1);
  };

  // Cached collections
  const properties = useMemo(() => storageService.getProperties(), [refreshTick]);
  const clients = useMemo(() => storageService.getClients(), [refreshTick]);
  const leads = useMemo(() => storageService.getLeads(), [refreshTick]);
  const transactions = useMemo(() => storageService.getTransactions(), [refreshTick]);
  const investors = useMemo(() => storageService.getInvestors(), [refreshTick]);
  const investorTransactions = useMemo(() => storageService.getInvestorTransactions(), [refreshTick]);
  const dropdowns = useMemo(() => storageService.getAllDropdowns(), [refreshTick]);
  const users = useMemo(() => storageService.getUsers(), [refreshTick]);
  const packages = useMemo(() => storageService.getPackages(), [refreshTick]);
  const announcements = useMemo(() => storageService.getAnnouncements(), [refreshTick]);
  const activityLogs = useMemo(() => storageService.getActivityLogs(), [refreshTick]);
  const trashItems = useMemo(() => storageService.getTrashItems(), [refreshTick]);
  const settings = useMemo(() => storageService.getSettings(), [refreshTick]);
  const smartShareConfig = useMemo(() => storageService.getSmartShareConfig(), [refreshTick]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const login = (identifier: string, pass: string): boolean => {
    const user = storageService.authenticate(identifier, pass);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('estatevault_session_user_id', String(user.id));
      showToast(`Welcome back, ${user.name}!`, 'success');
      setCurrentScreen('DASHBOARD');
      refreshData();
      return true;
    }
    showToast('Invalid credentials. Please verify your username and password.', 'error');
    return false;
  };

  const setupAdmin = (details: { name: string; username: string; email: string; password: string }) => {
    const user = storageService.createInitialAdmin(details);
    setCurrentUser(user);
    localStorage.setItem('estatevault_session_user_id', String(user.id));
    setCurrentScreen('DASHBOARD');
    refreshData();
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('estatevault_session_user_id');
    setIsBiometricLocked(false);
    showToast('Logged out successfully.', 'info');
  };

  const unlockBiometric = (pin?: string): boolean => {
    if (!settings.biometricLockEnabled) {
      setIsBiometricLocked(false);
      return true;
    }
    if (pin && pin === settings.pinLockCode) {
      setIsBiometricLocked(false);
      showToast('Vault unlocked successfully!', 'success');
      return true;
    }
    showToast('Incorrect PIN code. Try again.', 'error');
    return false;
  };

  const navigateTo = (screen: CrmScreen, property: PropertyEntity | null = null, investor: InvestorEntity | null = null) => {
    if (property !== undefined) setSelectedProperty(property);
    if (investor !== undefined) setSelectedInvestor(investor);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasPermission = (permKey: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'super_admin' || currentUser.role === 'admin') return true;
    return currentUser.permissions.includes(permKey) || currentUser.permissions.includes('all');
  };

  const userName = currentUser?.name || 'Super Admin';

  // CRUD implementations
  const saveProperty = (prop: Omit<PropertyEntity, 'id'> & { id?: number }) => {
    const saved = storageService.saveProperty(prop, userName);
    refreshData();
    showToast(`Property ${saved.propertyId} saved successfully.`, 'success');
    return saved;
  };

  const deleteProperty = (id: number) => {
    storageService.deleteProperty(id, userName);
    refreshData();
    showToast('Property moved to Trash.', 'info');
  };

  const toggleFavorite = (id: number) => {
    storageService.toggleFavorite(id);
    refreshData();
  };

  const saveClient = (client: Omit<ClientEntity, 'id'> & { id?: number }) => {
    const saved = storageService.saveClient(client, userName);
    refreshData();
    showToast(`Contact "${saved.name}" saved successfully.`, 'success');
    return saved;
  };

  const deleteClient = (id: number) => {
    storageService.deleteClient(id, userName);
    refreshData();
    showToast('Client moved to Trash.', 'info');
  };

  const saveLead = (lead: Omit<LeadEntity, 'id'> & { id?: number }) => {
    const saved = storageService.saveLead(lead, userName);
    refreshData();
    showToast(`Lead "${saved.clientName}" saved successfully.`, 'success');
    return saved;
  };

  const deleteLead = (id: number) => {
    storageService.deleteLead(id, userName);
    refreshData();
    showToast('Lead moved to Trash.', 'info');
  };

  const saveTransaction = (tx: Omit<AccountTransactionEntity, 'id'> & { id?: number }) => {
    const saved = storageService.saveTransaction(tx, userName);
    refreshData();
    showToast(`Transaction "${saved.title}" recorded.`, 'success');
    return saved;
  };

  const deleteTransaction = (id: number) => {
    storageService.deleteTransaction(id, userName);
    refreshData();
    showToast('Transaction moved to Trash.', 'info');
  };

  const saveInvestor = (inv: Omit<InvestorEntity, 'id'> & { id?: number }) => {
    const saved = storageService.saveInvestor(inv, userName);
    refreshData();
    showToast(`Investor "${saved.name}" saved.`, 'success');
    return saved;
  };

  const saveInvestorTransaction = (tx: Omit<InvestorTransactionEntity, 'id'> & { id?: number }) => {
    const saved = storageService.saveInvestorTransaction(tx, userName);
    refreshData();
    showToast(`Investor entry of PKR ${saved.amount} recorded.`, 'success');
    return saved;
  };

  const deleteInvestorTransaction = (id: number) => {
    storageService.deleteInvestorTransaction(id);
    refreshData();
    showToast('Investor transaction deleted.', 'info');
  };

  const saveDropdownOption = (opt: Omit<DropdownOptionEntity, 'id'> & { id?: number }) => {
    const saved = storageService.saveDropdownOption(opt);
    refreshData();
    showToast(`Dropdown option "${saved.optionValue}" saved.`, 'success');
    return saved;
  };

  const deleteDropdownOption = (id: number) => {
    storageService.deleteDropdownOption(id);
    refreshData();
    showToast('Dropdown option removed.', 'info');
  };

  const saveUser = (u: Omit<UserEntity, 'id'> & { id?: number }) => {
    const saved = storageService.saveUser(u, userName);
    refreshData();
    showToast(`User account "${saved.username}" updated.`, 'success');
    return saved;
  };

  const deleteUser = (id: number) => {
    try {
      storageService.deleteUser(id, userName);
      refreshData();
      showToast('User account removed.', 'info');
    } catch (e: any) {
      showToast(e.message || 'Error deleting user.', 'error');
    }
  };

  const savePackage = (pkg: Omit<SubscriptionPackageEntity, 'id'> & { id?: number }) => {
    const saved = storageService.savePackage(pkg, userName);
    refreshData();
    showToast(`Package "${saved.name}" (${saved.validity}) saved.`, 'success');
    return saved;
  };

  const deletePackage = (id: number) => {
    storageService.deletePackage(id, userName);
    refreshData();
    showToast('Subscription package deleted.', 'info');
  };

  const saveAnnouncement = (ann: Omit<AnnouncementEntity, 'id'> & { id?: number }) => {
    const saved = storageService.saveAnnouncement(ann, userName);
    refreshData();
    showToast(`Announcement "${saved.title}" saved.`, 'success');
    return saved;
  };

  const deleteAnnouncement = (id: number) => {
    storageService.deleteAnnouncement(id, userName);
    refreshData();
    showToast('Announcement deleted.', 'info');
  };

  const saveSettings = (st: AppSettings) => {
    storageService.saveSettings(st, userName);
    refreshData();
    showToast('System preferences saved successfully.', 'success');
  };

  const saveSmartShareConfig = (cfg: SmartShareConfigEntity) => {
    storageService.saveSmartShareConfig(cfg);
    refreshData();
    showToast('Smart Share template updated.', 'success');
  };

  const restoreTrashItem = (id: number) => {
    storageService.restoreTrashItem(id, userName);
    refreshData();
    showToast('Item restored from trash.', 'success');
  };

  const permanentlyDeleteTrash = (id: number) => {
    storageService.permanentlyDeleteTrash(id, userName);
    refreshData();
    showToast('Item permanently deleted.', 'info');
  };

  const emptyTrash = () => {
    storageService.emptyTrash(userName);
    refreshData();
    showToast('Recycle bin emptied.', 'info');
  };

  const exportBackup = () => {
    const json = storageService.exportFullBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EstateVault_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup file generated and downloaded.', 'success');
  };

  const importBackup = (jsonStr: string, mode: 'replace' | 'merge'): boolean => {
    try {
      const res = storageService.restoreBackup(jsonStr, mode, userName);
      refreshData();
      showToast(`Restored: ${res.propertiesRestored} properties, ${res.clientsRestored} clients, ${res.transactionsRestored} transactions.`, 'success');
      return true;
    } catch (err: any) {
      showToast('Failed to restore backup: Invalid JSON structure.', 'error');
      return false;
    }
  };

  return (
    <CrmContext.Provider
      value={{
        currentUser,
        isLoggedIn: !!currentUser,
        currentScreen,
        selectedProperty,
        selectedInvestor,
        searchQuery,
        toasts,
        properties,
        clients,
        leads,
        transactions,
        investors,
        investorTransactions,
        dropdowns,
        users,
        packages,
        announcements,
        activityLogs,
        trashItems,
        settings,
        smartShareConfig,
        isBiometricLocked,

        login,
        setupAdmin,
        logout,
        navigateTo,
        setSearchQuery,
        showToast,
        removeToast,
        unlockBiometric,
        refreshData,
        hasPermission,

        saveProperty,
        deleteProperty,
        toggleFavorite,
        saveClient,
        deleteClient,
        saveLead,
        deleteLead,
        saveTransaction,
        deleteTransaction,
        saveInvestor,
        saveInvestorTransaction,
        deleteInvestorTransaction,
        saveDropdownOption,
        deleteDropdownOption,
        saveUser,
        deleteUser,
        savePackage,
        deletePackage,
        saveAnnouncement,
        deleteAnnouncement,
        saveSettings,
        saveSmartShareConfig,
        restoreTrashItem,
        permanentlyDeleteTrash,
        emptyTrash,
        exportBackup,
        importBackup,
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = () => {
  const ctx = useContext(CrmContext);
  if (!ctx) throw new Error('useCrm must be used within a CrmProvider');
  return ctx;
};
