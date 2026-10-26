import React from 'react';
import {
  Building2,
  Users,
  TrendingUp,
  TrendingDown,
  Wallet,
  PlusCircle,
  Share2,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle,
  Receipt,
  Megaphone,
  Package,
  ShieldCheck,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { formatAmountWithWords, formatCommas } from '../utils/amountFormat';
import { formatDate } from '../utils/investorAccounting';

export const DashboardScreen: React.FC = () => {
  const {
    currentUser,
    properties,
    clients,
    leads,
    transactions,
    investors,
    investorTransactions,
    packages,
    announcements,
    activityLogs,
    navigateTo,
    hasPermission,
  } = useCrm();

  // Filter active announcements targeted to the current user
  const userAnnouncements = announcements.filter((ann) => {
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

  // Active packages displayed to users
  const activePackages = packages.filter((pkg) => pkg.isActive);

  // Metrics
  const activeProperties = properties.filter((p) => !p.isTrashed && p.status === 'Available');
  const totalInventoryValue = activeProperties.reduce((sum, p) => {
    const val = p.category === 'Home for Rent' ? p.monthlyRent * 12 : p.demandPrice;
    return sum + val;
  }, 0);

  const activeClients = clients.filter((c) => c.status === 'Active');
  const activeLeads = leads.filter((l) => l.status !== 'Closed Won' && l.status !== 'Lost / Dropped');

  // Accounts summary
  const totalIncome = transactions
    .filter((t) => !t.isTrash && t.type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => !t.isTrash && t.type === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashFlow = totalIncome - totalExpense;

  // Investor capital
  const totalInvestorCapital = investorTransactions
    .filter((t) => !t.isDeleted && (t.type === 'Investment' || t.type === 'Additional Investment'))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalInvestorProfitPaid = investorTransactions
    .filter((t) => !t.isDeleted && (t.type === 'Profit Received' || t.type === 'Profit Share'))
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 p-6 sm:p-8 text-white border border-emerald-800/40 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Offline CRM Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Estate Vault Financial & Listing Control
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            All records, documents, khata ledgers, and investor portfolios are securely stored locally on this machine.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            {hasPermission('add_property') && (
              <button
                onClick={() => navigateTo('ADD_EDIT_PROPERTY')}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Property Listing</span>
              </button>
            )}

            {hasPermission('view_accounts') && (
              <button
                onClick={() => navigateTo('ACCOUNTS_KHATA')}
                className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
              >
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>Accounts & Khata</span>
              </button>
            )}

            {hasPermission('smart_share') && (
              <button
                onClick={() => navigateTo('SMART_SHARE_EXPORT')}
                className="px-4 py-2 bg-teal-800/60 hover:bg-teal-700 text-teal-100 font-semibold text-xs rounded-xl border border-teal-700/50 transition-all flex items-center gap-1.5"
              >
                <Share2 className="w-4 h-4" />
                <span>Smart Share Hub</span>
              </button>
            )}

            {currentUser?.role === 'super_admin' && (
              <button
                onClick={() => navigateTo('SUPER_ADMIN_DASHBOARD')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Super Admin Dashboard</span>
              </button>
            )}
          </div>
        </div>

        {/* Ambient decorative circle */}
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Active Announcements Banner (Real-Time Targeted Broadcasts) */}
      {userAnnouncements.length > 0 && (
        <div className="space-y-2.5">
          {userAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm ${
                ann.priority === 'urgent'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60'
                  : ann.priority === 'important'
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60'
                  : 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    ann.priority === 'urgent'
                      ? 'bg-rose-600 text-white'
                      : ann.priority === 'important'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {ann.title}
                    </h4>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {ann.targetType === 'all'
                        ? 'All Users'
                        : ann.targetType === 'packages'
                        ? 'Package Notice'
                        : 'Personal Notice'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {ann.message}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                {formatDate(ann.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Key Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Inventory */}
        <div
          onClick={() => navigateTo('PROPERTIES')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Inventory
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {activeProperties.length}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">units</span>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 truncate">
            {formatAmountWithWords(totalInventoryValue, 'PKR')}
          </p>
        </div>

        {/* Clients & Leads */}
        <div
          onClick={() => navigateTo('CLIENTS_LEADS')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pipeline & Contacts
            </span>
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {activeLeads.length}
            </span>
            <span className="text-xs text-slate-400">active leads</span>
          </div>
          <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold mt-1">
            {activeClients.length} verified clients & owners
          </p>
        </div>

        {/* Net Cash Flow */}
        <div
          onClick={() => navigateTo('ACCOUNTS_KHATA')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Net Cash Flow
            </span>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                netCashFlow >= 0
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
              }`}
            >
              {netCashFlow >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              PKR {formatCommas(Math.abs(netCashFlow))}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] mt-1 text-slate-500">
            <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
              <ArrowDownLeft className="w-3 h-3" /> In: {formatCommas(totalIncome)}
            </span>
            <span className="text-rose-500 font-semibold flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> Out: {formatCommas(totalExpense)}
            </span>
          </div>
        </div>

        {/* Investors Capital */}
        <div
          onClick={() => navigateTo('INVESTORS')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Investor Capital
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PieChart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {investors.length}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">active partners</span>
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-1 truncate">
            Invested: {formatAmountWithWords(totalInvestorCapital, 'PKR')}
          </p>
        </div>
      </div>

      {/* Main Grid: Recent Listings & Recent Financials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Featured Inventory */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Featured Property Inventory
              </h3>
              <p className="text-xs text-slate-500">
                Latest plots, houses, and commercial opportunities
              </p>
            </div>
            <button
              onClick={() => navigateTo('PROPERTIES')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
            >
              <span>View All ({properties.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {properties.slice(0, 4).map((p) => {
              const price = p.category === 'Home for Rent' ? p.monthlyRent : p.demandPrice;
              return (
                <div
                  key={p.id}
                  onClick={() => navigateTo('PROPERTY_DETAIL', p)}
                  className="rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col group"
                >
                  <div className="relative h-40 w-full overflow-hidden bg-slate-800">
                    <img
                      src={p.coverImageUri || (p.mediaGallery && p.mediaGallery[0]) || '/estate_vault_icon.png'}
                      alt={p.society}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
                        {p.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 text-slate-900 backdrop-blur-md">
                        {p.size}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-emerald-950/90 backdrop-blur-md text-white font-bold text-xs border border-emerald-500/40">
                      PKR {formatCommas(price)}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          {p.propertyId}
                        </span>
                        <span className="text-[11px]">{p.propertyType}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1 group-hover:text-emerald-600 transition-colors truncate">
                        {p.size} in {p.society} {p.block ? `(${p.block})` : ''}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span>Plot #{p.propertyNumber || 'N/A'}, Street {p.street || 'N/A'}</span>
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">
                        Dealer: {p.dealerName || 'Direct'}
                      </span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Recent Financial Ledger & Activity */}
        <div className="space-y-6">
          {/* Accounts Strip */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                Recent Khata Entries
              </h3>
              <button
                onClick={() => navigateTo('ACCOUNTS_KHATA')}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                All
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {transactions.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="overflow-hidden pr-2">
                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {t.title}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {t.category} • {formatDate(t.date)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`font-black ${
                        t.type === 'Income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                      }`}
                    >
                      {t.type === 'Income' ? '+' : '-'}PKR {formatCommas(t.amount)}
                    </span>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider">{t.paymentMethod}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Logs */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                Audit Trail
              </h3>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Live
              </span>
            </div>

            <div className="mt-3 space-y-3">
              {activityLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                    {log.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Packages Showcase for All Users */}
      {activePackages.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                Available Subscription Packages (Weekly, Monthly, 3-Month, 6-Month, Annual)
              </h3>
              <p className="text-xs text-slate-500">
                Transparent pricing with automatic discount calculation and total savings breakdown
              </p>
            </div>
            {currentUser?.role === 'super_admin' && (
              <button
                onClick={() => navigateTo('SUPER_ADMIN_DASHBOARD')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>Manage Packages in Super Admin →</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {activePackages.map((pkg) => {
              const isUserCurrentPkg = currentUser?.packageId === pkg.id;
              return (
                <div
                  key={pkg.id}
                  className={`rounded-2xl p-4 border flex flex-col justify-between transition-all ${
                    isUserCurrentPkg
                      ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                      : pkg.isPopular
                      ? 'border-amber-500/60 bg-slate-50/60 dark:bg-slate-800/40'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {pkg.validity}
                      </span>
                      {pkg.discountPercentage > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                          {pkg.discountPercentage}% OFF
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      {pkg.name}
                    </h4>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-700/70 space-y-1 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>Validity:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          {pkg.validity}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Total Price:</span>
                        <span className="font-mono line-through">
                          PKR {formatCommas(pkg.totalPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Discount:</span>
                        <span className="font-mono font-bold text-purple-600">
                          {pkg.discountPercentage}%
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                        <span>Final Price:</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">
                          PKR {formatCommas(pkg.finalPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-teal-700 dark:text-teal-300 bg-teal-100/60 dark:bg-teal-950/60 px-2 py-1 rounded-lg">
                        <span>Total Savings:</span>
                        <span className="font-mono">PKR {formatCommas(pkg.totalSavings)}</span>
                      </div>
                    </div>
                  </div>

                  {isUserCurrentPkg && (
                    <div className="mt-3 py-1.5 text-center rounded-xl bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                      Your Active Plan
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
