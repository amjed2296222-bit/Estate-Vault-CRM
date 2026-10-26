import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  KeyRound,
  Trash2,
  Edit3,
  CheckCircle,
  XCircle,
  Clock,
  Lock,
  X,
  CheckSquare,
  Square,
  User,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { UserEntity, UserRole, CRM_PERMISSIONS } from '../types/crm';
import { formatDate } from '../utils/investorAccounting';
import { ContactPickerButton } from '../components/ContactPickerButton';

export const UserAdminScreen: React.FC = () => {
  const { users, saveUser, deleteUser, activityLogs, currentUser } = useCrm();

  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserEntity | null>(null);

  // User form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Password reset modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<UserEntity | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const openForm = (u?: UserEntity) => {
    if (u) {
      setEditingUser(u);
      setName(u.name);
      setEmail(u.email);
      setUsername(u.username);
      setPhone(u.phone);
      setRole(u.role);
      setPassword(u.passwordHash);
      setIsActive(u.isActive);
      setSelectedPermissions(u.permissions || []);
    } else {
      setEditingUser(null);
      setName('');
      setEmail('');
      setUsername('');
      setPhone('');
      setRole('user');
      setPassword('password123');
      setIsActive(true);
      // Default user permissions
      setSelectedPermissions([
        'view_properties',
        'add_property',
        'edit_property',
        'view_accounts',
        'add_transaction',
        'smart_share',
      ]);
    }
    setShowModal(true);
  };

  const togglePermission = (key: string) => {
    if (selectedPermissions.includes(key)) {
      setSelectedPermissions(selectedPermissions.filter((k) => k !== key));
    } else {
      setSelectedPermissions([...selectedPermissions, key]);
    }
  };

  const handleSelectAllPermissions = () => {
    setSelectedPermissions(CRM_PERMISSIONS.map((p) => p.key));
  };

  const handleDeselectAllPermissions = () => {
    setSelectedPermissions([]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveUser({
      id: editingUser?.id,
      name: name.trim(),
      email: email.trim(),
      username: username.trim(),
      phone: phone.trim(),
      role,
      passwordHash: password,
      passwordSalt: editingUser?.passwordSalt || 'salt_agent',
      isActive,
      status: isActive ? 'active' : 'inactive',
      permissions: role === 'super_admin' ? CRM_PERMISSIONS.map((p) => p.key) : selectedPermissions,
      startDate: editingUser?.startDate || Date.now(),
      expiryDate: 0,
      timePeriod: 'Unlimited',
      createdAt: editingUser?.createdAt || Date.now(),
    });
    setShowModal(false);
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser || !newPassword.trim()) return;
    saveUser({
      ...resetTargetUser,
      passwordHash: newPassword.trim(),
    });
    setShowResetModal(false);
    setResetTargetUser(null);
    setNewPassword('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            User & Access Control Administration
          </h2>
          <p className="text-xs text-slate-500">
            Provision local user accounts, assign role permissions matrices, and inspect system audit trail
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg ${
                activeTab === 'users' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              User Accounts ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 rounded-lg ${
                activeTab === 'logs' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Audit Trail ({activityLogs.length})
            </button>
          </div>

          {activeTab === 'users' && (
            <button
              onClick={() => openForm()}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create User</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Users */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">User & Profile</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">System Role</th>
                <th className="px-4 py-3">Account Status</th>
                <th className="px-4 py-3">Granted Permissions</th>
                <th className="px-4 py-3">Last Active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                        {u.name.charAt(0)}
                      </div>
                      <span>{u.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 ml-8">{u.email}</div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-700 dark:text-slate-300 font-semibold">
                    {u.username}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'super_admin'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {u.role === 'super_admin' ? 'Super Admin' : 'Agent / User'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                        u.isActive ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      {u.isActive ? (
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <XCircle className="w-3 h-3 text-slate-400" />
                      )}
                      <span>{u.isActive ? 'Active' : 'Inactive'}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500">
                    {u.role === 'super_admin' ? (
                      <span className="text-purple-600 font-bold">All (21 Capabilities)</span>
                    ) : (
                      <span>{u.permissions?.length || 0} Permissions</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">
                    {u.lastLoginAt ? formatDate(u.lastLoginAt) : 'Never'}
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-1">
                    <button
                      onClick={() => {
                        setResetTargetUser(u);
                        setNewPassword('');
                        setShowResetModal(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg"
                      title="Reset Password"
                    >
                      <KeyRound className="w-3.5 h-3.5 inline" />
                    </button>
                    <button
                      onClick={() => openForm(u)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg"
                      title="Edit Permissions"
                    >
                      <Edit3 className="w-3.5 h-3.5 inline" />
                    </button>
                    {u.id !== currentUser?.id && (
                      <button
                        onClick={() => {
                          if (confirm(`Permanently remove user "${u.username}"?`)) {
                            deleteUser(u.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Activity Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Target Module</th>
                <th className="px-4 py-3">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
              {activityLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">
                    {log.user}
                  </td>
                  <td className="px-4 py-3 text-emerald-600 font-semibold">{log.action}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{log.targetModule}</td>
                  <td className="px-4 py-3 text-slate-500 font-sans">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─────────────────── ADD / EDIT USER MODAL ─────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                {editingUser ? 'Edit User & Permissions' : 'Create New CRM User'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Bilal Ahmed"
                      className="flex-1 min-w-0 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                    <ContactPickerButton
                      onContactSelected={(cName, cPhone) => {
                        if (cName) setName(cName);
                        if (cPhone) setPhone(cPhone);
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
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. bilal"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="bilal@estatevault.pk"
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
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+92 300..."
                      className="flex-1 min-w-0 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                    />
                    <ContactPickerButton
                      onContactSelected={(cName, cPhone) => {
                        if (cPhone) setPhone(cPhone);
                        if (cName && !name) setName(cName);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    System Role *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="user">Agent / User</option>
                    <option value="super_admin">Super Admin (All Privileges)</option>
                  </select>
                </div>
                {!editingUser && (
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Initial Password *
                    </label>
                    <input
                      type="text"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="e.g. AgentPass123@"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Status Toggle */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>User Account Active (Allows Login)</span>
                </label>
              </div>

              {/* Permissions Matrix (if user role) */}
              {role === 'user' && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                      Module Access Permissions Matrix:
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllPermissions}
                        className="text-[10px] text-emerald-600 font-bold hover:underline"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={handleDeselectAllPermissions}
                        className="text-[10px] text-slate-400 font-bold hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    {CRM_PERMISSIONS.map((perm) => {
                      const isChecked = selectedPermissions.includes(perm.key);
                      return (
                        <div
                          key={perm.key}
                          onClick={() => togglePermission(perm.key)}
                          className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className="text-[11px] text-slate-800 dark:text-slate-200 truncate">
                            {perm.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────── RESET PASSWORD MODAL ─────────────────── */}
      {showResetModal && resetTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-500" />
              Reset Password for {resetTargetUser.username}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter the new password for this offline account:
            </p>

            <form onSubmit={handlePasswordReset} className="space-y-4 text-xs">
              <input
                type="text"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-sm"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
