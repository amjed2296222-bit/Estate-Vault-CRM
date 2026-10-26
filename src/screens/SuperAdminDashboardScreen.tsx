import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Package,
  Megaphone,
  UserPlus,
  KeyRound,
  Edit3,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  X,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
  Sparkles,
  Tag,
  Percent,
  DollarSign,
  Calendar,
  Bell,
  Lock,
  RefreshCw,
  ArrowLeft,
  Power,
  Check,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import {
  UserEntity,
  UserRole,
  CRM_PERMISSIONS,
  SubscriptionPackageEntity,
  PackageValidity,
  AnnouncementEntity,
  AnnouncementTargetType,
  AnnouncementPriority,
} from '../types/crm';
import { formatCommas, formatAmountWithWords } from '../utils/amountFormat';
import { formatDate } from '../utils/investorAccounting';
import { ContactPickerButton } from '../components/ContactPickerButton';

const VALIDITY_OPTIONS: { label: PackageValidity; days: number }[] = [
  { label: 'Weekly', days: 7 },
  { label: 'Monthly', days: 30 },
  { label: '3-Month', days: 90 },
  { label: '6-Month', days: 180 },
  { label: 'Annual', days: 365 },
];

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  manager: 'Manager',
  user: 'Agent / User',
};

export const SuperAdminDashboardScreen: React.FC = () => {
  const {
    currentUser,
    users,
    packages,
    announcements,
    saveUser,
    deleteUser,
    savePackage,
    deletePackage,
    saveAnnouncement,
    deleteAnnouncement,
    navigateTo,
    showToast,
  } = useCrm();

  const [activeModule, setActiveModule] = useState<'users' | 'packages' | 'announcements'>('users');

  // ─────────────────── MODULE 1: USER MANAGEMENT STATE ───────────────────
  const [userSearch, setUserSearch] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserEntity | null>(null);
  const [uName, setUName] = useState('');
  const [uUsername, setUUsername] = useState('');
  const [uEmail, setUEmail] = useState('');
  const [uPhone, setUPhone] = useState('');
  const [uRole, setURole] = useState<UserRole>('user');
  const [uPackageId, setUPackageId] = useState<number | null>(null);
  const [uPassword, setUPassword] = useState('');
  const [showUPassword, setShowUPassword] = useState(false);
  const [uIsActive, setUIsActive] = useState(true);
  const [uPermissions, setUPermissions] = useState<string[]>([]);

  // Password Change / Reset Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordTargetUser, setPasswordTargetUser] = useState<UserEntity | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showResetPasswordText, setShowResetPasswordText] = useState(false);

  // ─────────────────── MODULE 2: PACKAGE MANAGEMENT STATE ───────────────────
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<SubscriptionPackageEntity | null>(null);
  const [pkgName, setPkgName] = useState('');
  const [pkgValidity, setPkgValidity] = useState<PackageValidity>('Monthly');
  const [pkgTotalPrice, setPkgTotalPrice] = useState<string>('10000');
  const [pkgDiscountPct, setPkgDiscountPct] = useState<string>('20');
  const [pkgDescription, setPkgDescription] = useState('');
  const [pkgFeaturesText, setPkgFeaturesText] = useState('');
  const [pkgIsActive, setPkgIsActive] = useState(true);
  const [pkgIsPopular, setPkgIsPopular] = useState(false);
  const [validityFilter, setValidityFilter] = useState<string>('All');

  // Automatic real-time calculation for Package Form
  const calculatedPricing = useMemo(() => {
    const rawTotal = Math.max(0, Number(String(pkgTotalPrice).replace(/[^0-9.]/g, '')) || 0);
    const rawDiscount = Math.min(100, Math.max(0, Number(String(pkgDiscountPct).replace(/[^0-9.]/g, '')) || 0));
    const savings = Math.round((rawTotal * rawDiscount) / 100);
    const finalPrice = Math.max(0, rawTotal - savings);
    return {
      totalPrice: rawTotal,
      discountPercentage: rawDiscount,
      finalPrice,
      totalSavings: savings,
    };
  }, [pkgTotalPrice, pkgDiscountPct]);

  // ─────────────────── MODULE 3: ANNOUNCEMENTS STATE ───────────────────
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementEntity | null>(null);
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annPriority, setAnnPriority] = useState<AnnouncementPriority>('normal');
  const [annTargetType, setAnnTargetType] = useState<AnnouncementTargetType>('all');
  const [annTargetPackageIds, setAnnTargetPackageIds] = useState<number[]>([]);
  const [annTargetUserIds, setAnnTargetUserIds] = useState<number[]>([]);
  const [annIsActive, setAnnIsActive] = useState(true);

  // Role-based access check: strictly Super Admin
  if (!currentUser || currentUser.role !== 'super_admin') {
    return (
      <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/50 p-8 max-w-xl mx-auto my-8 shadow-lg">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
          Super Admin Access Required
        </h2>
        <p className="text-xs text-slate-500 mt-2">
          This dashboard is restricted to Super Administrators only. Please contact your system administrator if you require elevated privileges.
        </p>
        <button
          onClick={() => navigateTo('DASHBOARD')}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Main Dashboard</span>
        </button>
      </div>
    );
  }

  // ─────────────────── MODULE 1 HANDLERS (USERS) ───────────────────
  const filteredUsers = users.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const openUserModal = (user?: UserEntity) => {
    if (user) {
      setEditingUser(user);
      setUName(user.name);
      setUUsername(user.username);
      setUEmail(user.email);
      setUPhone(user.phone || '');
      setURole(user.role);
      setUPackageId(user.packageId ?? null);
      setUPassword(user.passwordHash);
      setUIsActive(user.isActive);
      setUPermissions(user.permissions || []);
    } else {
      setEditingUser(null);
      setUName('');
      setUUsername('');
      setUEmail('');
      setUPhone('');
      setURole('user');
      setUPackageId(packages[0]?.id ?? null);
      setUPassword('VaultPass123@');
      setUIsActive(true);
      setUPermissions([
        'view_properties',
        'add_property',
        'edit_property',
        'view_accounts',
        'add_transaction',
        'smart_share',
      ]);
    }
    setShowUPassword(false);
    setShowUserModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uName.trim() || !uUsername.trim() || !uEmail.trim()) {
      showToast('Please fill in Name, Username, and Email.', 'error');
      return;
    }

    const selectedPkg = packages.find((p) => p.id === Number(uPackageId));
    const now = Date.now();
    const expiryDate = selectedPkg ? now + selectedPkg.validityDays * 86400000 : 0;

    saveUser({
      id: editingUser?.id,
      name: uName.trim(),
      username: uUsername.trim(),
      email: uEmail.trim(),
      phone: uPhone.trim(),
      role: uRole,
      isActive: uIsActive,
      status: uIsActive ? 'active' : 'inactive',
      permissions:
        uRole === 'super_admin' || uRole === 'admin'
          ? CRM_PERMISSIONS.map((p) => p.key)
          : uPermissions,
      passwordHash: uPassword.trim() || editingUser?.passwordHash || 'VaultPass123@',
      passwordSalt: editingUser?.passwordSalt || `salt_${Date.now()}`,
      packageId: selectedPkg ? selectedPkg.id : null,
      packageName: selectedPkg ? `${selectedPkg.name} (${selectedPkg.validity})` : 'Unassigned',
      startDate: editingUser?.startDate || now,
      expiryDate,
      timePeriod: selectedPkg ? selectedPkg.validity : 'Standard',
      createdAt: editingUser?.createdAt || now,
      lastLoginAt: editingUser?.lastLoginAt,
    });
    setShowUserModal(false);
  };

  const handleQuickRoleChange = (user: UserEntity, newRole: UserRole) => {
    if (user.id === currentUser.id && newRole !== 'super_admin') {
      showToast('You cannot downgrade your own active Super Admin role.', 'error');
      return;
    }
    saveUser({
      ...user,
      role: newRole,
      permissions:
        newRole === 'super_admin' || newRole === 'admin'
          ? CRM_PERMISSIONS.map((p) => p.key)
          : user.permissions,
    });
  };

  const handleQuickPackageChange = (user: UserEntity, newPkgIdStr: string) => {
    const pkgId = newPkgIdStr ? Number(newPkgIdStr) : null;
    const pkg = packages.find((p) => p.id === pkgId);
    saveUser({
      ...user,
      packageId: pkg ? pkg.id : null,
      packageName: pkg ? `${pkg.name} (${pkg.validity})` : 'None',
      timePeriod: pkg ? pkg.validity : 'None',
      expiryDate: pkg ? Date.now() + pkg.validityDays * 86400000 : 0,
    });
  };

  const openPasswordResetModal = (user: UserEntity) => {
    setPasswordTargetUser(user);
    setNewPassword('');
    setConfirmNewPassword('');
    setShowResetPasswordText(false);
    setShowPasswordModal(true);
  };

  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
    setConfirmNewPassword(pass);
    setShowResetPasswordText(true);
  };

  const handlePasswordResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordTargetUser) return;
    if (newPassword.trim().length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast('Passwords do not match. Please verify.', 'error');
      return;
    }
    saveUser({
      ...passwordTargetUser,
      passwordHash: newPassword.trim(),
      passwordSalt: `salt_${Date.now()}`,
    });
    setShowPasswordModal(false);
    showToast(`Password securely updated for ${passwordTargetUser.name}.`, 'success');
  };

  const toggleUserPermission = (key: string) => {
    setUPermissions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // ─────────────────── MODULE 2 HANDLERS (PACKAGES) ───────────────────
  const openPackageModal = (pkg?: SubscriptionPackageEntity) => {
    if (pkg) {
      setEditingPackage(pkg);
      setPkgName(pkg.name);
      setPkgValidity(pkg.validity);
      setPkgTotalPrice(String(pkg.totalPrice));
      setPkgDiscountPct(String(pkg.discountPercentage));
      setPkgDescription(pkg.description || '');
      setPkgFeaturesText((pkg.features || []).join('\n'));
      setPkgIsActive(pkg.isActive);
      setPkgIsPopular(!!pkg.isPopular);
    } else {
      setEditingPackage(null);
      setPkgName('');
      setPkgValidity('Monthly');
      setPkgTotalPrice('10000');
      setPkgDiscountPct('15');
      setPkgDescription('Full access to Estate Vault CRM modules and cloud-ready offline vault');
      setPkgFeaturesText('Unlimited Property Inventory\nAccounts & Khata Ledger\nWhatsApp Smart Share Cards\nClients & Leads Pipeline');
      setPkgIsActive(true);
      setPkgIsPopular(false);
    }
    setShowPackageModal(true);
  };

  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgName.trim()) {
      showToast('Please enter a package name.', 'error');
      return;
    }
    const validityObj = VALIDITY_OPTIONS.find((v) => v.label === pkgValidity) || VALIDITY_OPTIONS[1];
    const features = pkgFeaturesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    savePackage({
      id: editingPackage?.id,
      name: pkgName.trim(),
      validity: pkgValidity,
      validityDays: validityObj.days,
      totalPrice: calculatedPricing.totalPrice,
      discountPercentage: calculatedPricing.discountPercentage,
      finalPrice: calculatedPricing.finalPrice,
      totalSavings: calculatedPricing.totalSavings,
      description: pkgDescription.trim(),
      features,
      isActive: pkgIsActive,
      isPopular: pkgIsPopular,
      createdAt: editingPackage?.createdAt || Date.now(),
      updatedAt: Date.now(),
    });
    setShowPackageModal(false);
  };

  const filteredPackages = packages.filter((p) =>
    validityFilter === 'All' ? true : p.validity === validityFilter
  );

  // ─────────────────── MODULE 3 HANDLERS (ANNOUNCEMENTS) ───────────────────
  const openAnnouncementModal = (ann?: AnnouncementEntity) => {
    if (ann) {
      setEditingAnnouncement(ann);
      setAnnTitle(ann.title);
      setAnnMessage(ann.message);
      setAnnPriority(ann.priority);
      setAnnTargetType(ann.targetType);
      setAnnTargetPackageIds(ann.targetPackageIds || []);
      setAnnTargetUserIds(ann.targetUserIds || []);
      setAnnIsActive(ann.isActive);
    } else {
      setEditingAnnouncement(null);
      setAnnTitle('');
      setAnnMessage('');
      setAnnPriority('normal');
      setAnnTargetType('all');
      setAnnTargetPackageIds([]);
      setAnnTargetUserIds([]);
      setAnnIsActive(true);
    }
    setShowAnnouncementModal(true);
  };

  const toggleTargetPackage = (id: number) => {
    setAnnTargetPackageIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleTargetUser = (id: number) => {
    setAnnTargetUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) {
      showToast('Please provide an announcement title and message.', 'error');
      return;
    }
    if (annTargetType === 'packages' && annTargetPackageIds.length === 0) {
      showToast('Please select at least one target package.', 'error');
      return;
    }
    if (annTargetType === 'users' && annTargetUserIds.length === 0) {
      showToast('Please select at least one target user.', 'error');
      return;
    }

    saveAnnouncement({
      id: editingAnnouncement?.id,
      title: annTitle.trim(),
      message: annMessage.trim(),
      priority: annPriority,
      targetType: annTargetType,
      targetPackageIds: annTargetType === 'packages' ? annTargetPackageIds : [],
      targetUserIds: annTargetType === 'users' ? annTargetUserIds : [],
      isActive: annIsActive,
      createdBy: currentUser.name,
      createdAt: editingAnnouncement?.createdAt || Date.now(),
      updatedAt: Date.now(),
    });
    setShowAnnouncementModal(false);
  };

  const handleToggleAnnouncementStatus = (ann: AnnouncementEntity) => {
    saveAnnouncement({
      ...ann,
      isActive: !ann.isActive,
    });
  };

  return (
    <div className="space-y-6 pb-14">
      {/* Top Executive Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 p-6 sm:p-8 text-white border border-emerald-700/40 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-3 border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
              <span>SUPER ADMIN COMMAND CENTER • REAL-TIME SYNC</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Super Admin Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl">
              Centralized control for User & Role Management, Subscription Packages (Weekly, Monthly, 3-Month, 6-Month, Annual) with automatic discount & savings calculation, and Targeted Announcements.
            </p>
          </div>

          {/* Quick Summary KPI Pills */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
              <div className="text-xl font-black text-white">{users.length}</div>
              <div className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold">
                Total Users
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
              <div className="text-xl font-black text-white">{packages.length}</div>
              <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">
                Packages
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
              <div className="text-xl font-black text-white">
                {announcements.filter((a) => a.isActive).length}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-sky-300 font-bold">
                Live Alerts
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveModule('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeModule === 'users'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>1. User Management ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveModule('packages')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeModule === 'packages'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>2. Package Management ({packages.length})</span>
          </button>

          <button
            onClick={() => setActiveModule('announcements')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeModule === 'announcements'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>3. Announcements ({announcements.length})</span>
          </button>
        </div>

        {/* Module Primary Action Button */}
        <div>
          {activeModule === 'users' && (
            <button
              onClick={() => openUserModal()}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create New User</span>
            </button>
          )}
          {activeModule === 'packages' && (
            <button
              onClick={() => openPackageModal()}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Subscription Package</span>
            </button>
          )}
          {activeModule === 'announcements' && (
            <button
              onClick={() => openAnnouncementModal()}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              <Megaphone className="w-4 h-4" />
              <span>Publish Announcement</span>
            </button>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MODULE 1: USER MANAGEMENT
      ═══════════════════════════════════════════════════════════════════ */}
      {activeModule === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                User Accounts, Role Assignment & Password Security
              </h3>
              <p className="text-xs text-slate-500">
                Create users, assign or change roles & subscription packages in real time, and securely reset user passwords
              </p>
            </div>
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Filter users by name, username, email, role..."
              className="w-full sm:w-72 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3.5">User Profile</th>
                    <th className="px-4 py-3.5">Username & Phone</th>
                    <th className="px-4 py-3.5">Assign / Change Role</th>
                    <th className="px-4 py-3.5">Assigned Package</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Security & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                            <div className="text-[11px] text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-mono font-bold text-slate-700 dark:text-slate-200">
                          @{u.username}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{u.phone || 'No phone'}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <select
                          value={u.role}
                          onChange={(e) => handleQuickRoleChange(u, e.target.value as UserRole)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                            u.role === 'super_admin'
                              ? 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                              : u.role === 'admin'
                              ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                              : u.role === 'manager'
                              ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <option value="super_admin">Super Admin</option>
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="user">Agent / User</option>
                        </select>
                      </td>

                      <td className="px-4 py-3.5">
                        <select
                          value={u.packageId || ''}
                          onChange={(e) => handleQuickPackageChange(u, e.target.value)}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                        >
                          <option value="">No Package</option>
                          {packages.map((pkg) => (
                            <option key={pkg.id} value={pkg.id}>
                              {pkg.name} ({pkg.validity})
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => {
                            if (u.id === currentUser.id) {
                              showToast('Cannot deactivate your own Super Admin account.', 'error');
                              return;
                            }
                            saveUser({ ...u, isActive: !u.isActive, status: !u.isActive ? 'active' : 'inactive' });
                          }}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            u.isActive
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {u.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{u.isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => openPasswordResetModal(u)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 text-[11px] font-bold"
                          title="Change or Reset User Password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Reset Password</span>
                        </button>

                        <button
                          onClick={() => openUserModal(u)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Edit User & Role"
                        >
                          <Edit3 className="w-4 h-4 inline" />
                        </button>

                        {u.id !== currentUser.id && (
                          <button
                            onClick={() => {
                              if (confirm(`Permanently delete user "${u.name}" (@${u.username})?`)) {
                                deleteUser(u.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODULE 2: PACKAGE MANAGEMENT
      ═══════════════════════════════════════════════════════════════════ */}
      {activeModule === 'packages' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                Subscription Packages Matrix (Weekly, Monthly, 3-Month, 6-Month, Annual)
              </h3>
              <p className="text-xs text-slate-500">
                Separate rows and columns for Package Name, Validity, Total Price, Discount %, Final Price, and Total Savings
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {['All', 'Weekly', 'Monthly', '3-Month', '6-Month', 'Annual'].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setValidityFilter(tier)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    validityFilter === tier
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Structured Package Management Table (Separate Columns & Rows) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3.5">Package Name</th>
                    <th className="px-4 py-3.5">Validity</th>
                    <th className="px-4 py-3.5 text-right">Total Price</th>
                    <th className="px-4 py-3.5 text-center">Discount Percentage</th>
                    <th className="px-4 py-3.5 text-right">Final Price</th>
                    <th className="px-4 py-3.5 text-right">Total Savings</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPackages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{pkg.name}</span>
                          {pkg.isPopular && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 uppercase">
                              Popular
                            </span>
                          )}
                        </div>
                        {pkg.description && (
                          <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {pkg.description}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                          {pkg.validity} ({pkg.validityDays} Days)
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right font-mono text-slate-500 line-through">
                        PKR {formatCommas(pkg.totalPrice)}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono font-bold text-[11px]">
                          {pkg.discountPercentage}% OFF
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        PKR {formatCommas(pkg.finalPrice)}
                      </td>

                      <td className="px-4 py-3.5 text-right font-mono font-bold text-teal-600 dark:text-teal-400">
                        PKR {formatCommas(pkg.totalSavings)}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => savePackage({ ...pkg, isActive: !pkg.isActive })}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            pkg.isActive
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {pkg.isActive ? 'Active' : 'Hidden'}
                        </button>
                      </td>

                      <td className="px-4 py-3.5 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => openPackageModal(pkg)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Edit Package"
                        >
                          <Edit3 className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete package "${pkg.name}"?`)) {
                              deletePackage(pkg.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete Package"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User-Facing Packages Display Cards */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Live User-Facing Packages Display ({filteredPackages.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {filteredPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`rounded-3xl p-5 bg-white dark:bg-slate-900 border-2 shadow-sm flex flex-col justify-between transition-all ${
                    pkg.isPopular
                      ? 'border-emerald-500 shadow-emerald-500/10'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {pkg.validity}
                      </span>
                      {pkg.discountPercentage > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                          -{pkg.discountPercentage}%
                        </span>
                      )}
                    </div>

                    <h5 className="text-sm font-black text-slate-900 dark:text-white">
                      {pkg.name}
                    </h5>

                    {/* Row-by-Row Breakdown */}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>Validity:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{pkg.validity}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Total Price:</span>
                        <span className="font-mono line-through">PKR {formatCommas(pkg.totalPrice)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Discount:</span>
                        <span className="font-mono font-bold text-purple-600">{pkg.discountPercentage}%</span>
                      </div>
                      <div className="flex justify-between text-slate-900 dark:text-white font-bold pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span>Final Price:</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">
                          PKR {formatCommas(pkg.finalPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between text-teal-600 dark:text-teal-400 font-bold bg-teal-50 dark:bg-teal-950/50 px-2 py-1 rounded-lg">
                        <span>Total Savings:</span>
                        <span className="font-mono">PKR {formatCommas(pkg.totalSavings)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => openPackageModal(pkg)}
                    className="mt-4 w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors"
                  >
                    Customize Package
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODULE 3: ANNOUNCEMENTS MANAGEMENT
      ═══════════════════════════════════════════════════════════════════ */}
      {activeModule === 'announcements' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-emerald-600" />
                Broadcast & Targeted Announcements Engine
              </h3>
              <p className="text-xs text-slate-500">
                Publish announcements for All Users, Specific Packages, or Individually Selected Users. Activate or deactivate at any time.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {announcements.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                No announcements created yet. Click "Publish Announcement" to broadcast a message.
              </div>
            ) : (
              announcements.map((ann) => {
                const targetPkgNames = packages
                  .filter((p) => (ann.targetPackageIds || []).includes(p.id))
                  .map((p) => `${p.name} (${p.validity})`);
                const targetUserNames = users
                  .filter((u) => (ann.targetUserIds || []).includes(u.id))
                  .map((u) => u.name);

                return (
                  <div
                    key={ann.id}
                    className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      ann.isActive
                        ? 'border-emerald-500/40 dark:border-emerald-500/30'
                        : 'border-slate-200 dark:border-slate-800 opacity-70'
                    }`}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            ann.priority === 'urgent'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : ann.priority === 'important'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                          }`}
                        >
                          {ann.priority}
                        </span>

                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                          {ann.targetType === 'all'
                            ? 'Target: All Users'
                            : ann.targetType === 'packages'
                            ? `Target Packages: ${targetPkgNames.join(', ') || 'Selected Packages'}`
                            : `Target Users: ${targetUserNames.join(', ') || 'Selected Users'}`}
                        </span>

                        <span className="text-[11px] text-slate-400 font-mono">
                          {formatDate(ann.createdAt)} • by {ann.createdBy}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {ann.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {ann.message}
                      </p>
                    </div>

                    {/* Activate / Deactivate & Edit / Delete Controls */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleToggleAnnouncementStatus(ann)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                          ann.isActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{ann.isActive ? 'Active (Click to Deactivate)' : 'Inactive (Click to Activate)'}</span>
                      </button>

                      <button
                        onClick={() => openAnnouncementModal(ann)}
                        className="p-2 text-slate-500 hover:text-emerald-600 rounded-xl bg-slate-100 dark:bg-slate-800"
                        title="Edit Announcement"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete announcement "${ann.title}"?`)) {
                            deleteAnnouncement(ann.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-rose-500 rounded-xl bg-slate-100 dark:bg-slate-800"
                        title="Delete Announcement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ─────────────────── MODAL 1A: CREATE / EDIT USER ─────────────────── */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                {editingUser ? `Edit User: ${editingUser.name}` : 'Create New User Account'}
              </h3>
              <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      required
                      value={uName}
                      onChange={(e) => setUName(e.target.value)}
                      placeholder="e.g. Bilal Ahmed"
                      className="flex-1 min-w-0 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                    <ContactPickerButton
                      onContactSelected={(cName, cPhone) => {
                        if (cName) setUName(cName);
                        if (cPhone) setUPhone(cPhone);
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={uUsername}
                    onChange={(e) => setUUsername(e.target.value)}
                    placeholder="e.g. bilal.ahmed"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={uEmail}
                    onChange={(e) => setUEmail(e.target.value)}
                    placeholder="user@estatevault.pk"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={uPhone}
                      onChange={(e) => setUPhone(e.target.value)}
                      placeholder="+92 300..."
                      className="flex-1 min-w-0 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                    />
                    <ContactPickerButton
                      onContactSelected={(cName, cPhone) => {
                        if (cPhone) setUPhone(cPhone);
                        if (cName && !uName) setUName(cName);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assign Role *
                  </label>
                  <select
                    value={uRole}
                    onChange={(e) => setURole(e.target.value as UserRole)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="user">Agent / User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin (All Privileges)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assign Subscription Package
                  </label>
                  <select
                    value={uPackageId ?? ''}
                    onChange={(e) => setUPackageId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                  >
                    <option value="">No Package Assigned</option>
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} ({pkg.validity} - PKR {formatCommas(pkg.finalPrice)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {editingUser ? 'Account Password (Change or Keep Current)' : 'Initial Account Password *'}
                </label>
                <div className="relative">
                  <input
                    type={showUPassword ? 'text' : 'password'}
                    required={!editingUser}
                    value={uPassword}
                    onChange={(e) => setUPassword(e.target.value)}
                    placeholder="Enter secure password..."
                    className="w-full p-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUPassword(!showUPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showUPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="uActiveCheck"
                  checked={uIsActive}
                  onChange={(e) => setUIsActive(e.target.checked)}
                  className="rounded text-emerald-600 w-4 h-4"
                />
                <label htmlFor="uActiveCheck" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Account Active (Allow user to sign in)
                </label>
              </div>

              {uRole !== 'super_admin' && uRole !== 'admin' && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Granular Module Permissions:
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setUPermissions(CRM_PERMISSIONS.map((p) => p.key))}
                        className="text-[10px] text-emerald-600 font-bold hover:underline"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => setUPermissions([])}
                        className="text-[10px] text-slate-400 font-bold hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-44 overflow-y-auto p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    {CRM_PERMISSIONS.map((perm) => {
                      const checked = uPermissions.includes(perm.key);
                      return (
                        <div
                          key={perm.key}
                          onClick={() => toggleUserPermission(perm.key)}
                          className="flex items-center gap-2 p-1.5 rounded-lg cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                        >
                          {checked ? (
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className="text-[11px] truncate">{perm.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  {editingUser ? 'Save User Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────── MODAL 1B: SECURE PASSWORD RESET ─────────────────── */}
      {showPasswordModal && passwordTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-500" />
                Reset Password: {passwordTargetUser.name}
              </h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordResetSubmit} className="py-4 space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-[11px]">
                Resetting password for <strong>@{passwordTargetUser.username}</strong> ({ROLE_LABELS[passwordTargetUser.role]}).
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    New Password *
                  </label>
                  <button
                    type="button"
                    onClick={generateStrongPassword}
                    className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Auto-Generate Strong Password</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showResetPasswordText ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters..."
                    className="w-full p-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPasswordText(!showResetPasswordText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showResetPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password *
                </label>
                <input
                  type={showResetPasswordText ? 'text' : 'password'}
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter new password..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────── MODAL 2: CREATE / EDIT PACKAGE ─────────────────── */}
      {showPackageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                {editingPackage ? `Edit Package: ${editingPackage.name}` : 'Create Subscription Package'}
              </h3>
              <button onClick={() => setShowPackageModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="py-4 space-y-3.5 text-xs">
              {/* Row 1: Package Name */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  1. Package Name *
                </label>
                <input
                  type="text"
                  required
                  value={pkgName}
                  onChange={(e) => setPkgName(e.target.value)}
                  placeholder="e.g. Professional Monthly Plan"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                />
              </div>

              {/* Row 2: Validity */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  2. Package Validity *
                </label>
                <select
                  value={pkgValidity}
                  onChange={(e) => setPkgValidity(e.target.value as PackageValidity)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-emerald-600"
                >
                  {VALIDITY_OPTIONS.map((v) => (
                    <option key={v.label} value={v.label}>
                      {v.label} ({v.days} Days)
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 3: Total Price */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  3. Total Price (PKR) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={pkgTotalPrice}
                  onChange={(e) => setPkgTotalPrice(e.target.value)}
                  placeholder="e.g. 24000"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                />
              </div>

              {/* Row 4: Discount Percentage */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  4. Discount Percentage (%) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  required
                  value={pkgDiscountPct}
                  onChange={(e) => setPkgDiscountPct(e.target.value)}
                  placeholder="e.g. 20"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-purple-600"
                />
              </div>

              {/* Row 5: Final Price (Auto-Calculated) */}
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div>
                  <span className="block font-extrabold text-emerald-800 dark:text-emerald-300">
                    5. Final Price (Auto-Calculated)
                  </span>
                  <span className="text-[10px] text-emerald-600">
                    {formatAmountWithWords(calculatedPricing.finalPrice, 'PKR')}
                  </span>
                </div>
                <div className="text-lg font-black font-mono text-emerald-700 dark:text-emerald-300">
                  PKR {formatCommas(calculatedPricing.finalPrice)}
                </div>
              </div>

              {/* Row 6: Total Savings (Auto-Calculated) */}
              <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 flex items-center justify-between">
                <div>
                  <span className="block font-extrabold text-teal-800 dark:text-teal-300">
                    6. Total Savings (Auto-Calculated)
                  </span>
                  <span className="text-[10px] text-teal-600">
                    Customer saves {calculatedPricing.discountPercentage}% off Total Price
                  </span>
                </div>
                <div className="text-lg font-black font-mono text-teal-700 dark:text-teal-300">
                  PKR {formatCommas(calculatedPricing.totalSavings)}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Package Features (One per line)
                </label>
                <textarea
                  rows={3}
                  value={pkgFeaturesText}
                  onChange={(e) => setPkgFeaturesText(e.target.value)}
                  placeholder="Unlimited Property Listings&#10;Smart Share Brochures"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={pkgIsActive}
                    onChange={(e) => setPkgIsActive(e.target.checked)}
                    className="rounded text-emerald-600 w-4 h-4"
                  />
                  <span>Display Package to Users</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={pkgIsPopular}
                    onChange={(e) => setPkgIsPopular(e.target.checked)}
                    className="rounded text-amber-500 w-4 h-4"
                  />
                  <span>Mark as Popular</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPackageModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────── MODAL 3: PUBLISH / EDIT ANNOUNCEMENT ─────────────────── */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-emerald-600" />
                {editingAnnouncement ? 'Edit Announcement' : 'Publish New Announcement'}
              </h3>
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. Scheduled Maintenance or Special Package Offer"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Announcement Message *
                </label>
                <textarea
                  rows={3}
                  required
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  placeholder="Write the full announcement message for recipients..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={annPriority}
                    onChange={(e) => setAnnPriority(e.target.value as AnnouncementPriority)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Audience *
                  </label>
                  <select
                    value={annTargetType}
                    onChange={(e) => setAnnTargetType(e.target.value as AnnouncementTargetType)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-emerald-600"
                  >
                    <option value="all">All Users</option>
                    <option value="packages">Specific Packages</option>
                    <option value="users">Individually Selected Users</option>
                  </select>
                </div>
              </div>

              {/* Target Specific Packages Selector */}
              {annTargetType === 'packages' && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="block font-bold text-slate-700 dark:text-slate-300">
                    Select Target Packages:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
                    {packages.map((pkg) => {
                      const isSelected = annTargetPackageIds.includes(pkg.id);
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => toggleTargetPackage(pkg.id)}
                          className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <span className="truncate font-semibold">
                            {pkg.name} ({pkg.validity})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Target Individual Users Selector */}
              {annTargetType === 'users' && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="block font-bold text-slate-700 dark:text-slate-300">
                    Select Individual Users:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
                    {users.map((u) => {
                      const isSelected = annTargetUserIds.includes(u.id);
                      return (
                        <div
                          key={u.id}
                          onClick={() => toggleTargetUser(u.id)}
                          className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <span className="truncate font-semibold">
                            {u.name} (@{u.username})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="annActiveCheck"
                  checked={annIsActive}
                  onChange={(e) => setAnnIsActive(e.target.checked)}
                  className="rounded text-emerald-600 w-4 h-4"
                />
                <label
                  htmlFor="annActiveCheck"
                  className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Publish as Active Immediately
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  {editingAnnouncement ? 'Update Announcement' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
