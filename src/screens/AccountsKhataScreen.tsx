import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  TrendingUp,
  TrendingDown,
  Download,
  Printer,
  Search,
  Filter,
  Trash2,
  Edit3,
  Calendar,
  X,
  CreditCard,
  Building,
  User,
  Paperclip,
  Check,
  SlidersHorizontal,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { AccountTransactionEntity, TransactionType } from '../types/crm';
import { formatAmountWithWords, formatCommas, formatInputWithCommas, parseAmountToNumber } from '../utils/amountFormat';
import { formatDate } from '../utils/investorAccounting';
import { ContactPickerButton } from '../components/ContactPickerButton';
import { DropdownManagerModal } from '../components/DropdownManagerModal';

export const AccountsKhataScreen: React.FC = () => {
  const {
    transactions,
    saveTransaction,
    deleteTransaction,
    hasPermission,
    dropdowns,
    properties,
    searchQuery,
  } = useCrm();

  const [typeFilter, setTypeFilter] = useState<'All' | 'Income' | 'Expense'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [selectedSociety, setSelectedSociety] = useState<string>('');

  // Add/Edit Transaction Modal
  const [showModal, setShowModal] = useState(false);
  const [editingTx, setEditingTx] = useState<AccountTransactionEntity | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TransactionType>('Income');
  const [category, setCategory] = useState('Agency Commission');
  const [amount, setAmount] = useState('');
  const [dateStr, setDateStr] = useState(new Date().toISOString().slice(0, 10));
  const [society, setSociety] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [referenceNo, setReferenceNo] = useState('');
  const [description, setDescription] = useState('');
  const [personContact, setPersonContact] = useState('');
  const [personPhone, setPersonPhone] = useState('');
  const [propertyRef, setPropertyRef] = useState('');

  // Dropdown categories & payment methods
  const [showManageSocieties, setShowManageSocieties] = useState(false);
  const categoryOptions = dropdowns.filter(d => d.category.toLowerCase() === 'transactioncategory' && d.isEnabled);
  const paymentMethodOptions = dropdowns.filter(d => d.category.toLowerCase() === 'paymentmethod' && d.isEnabled);
  const societyOptions = dropdowns.filter(d => d.category.toLowerCase() === 'society' && d.isEnabled);

  const selectableSocieties = Array.from(
    new Set([
      ...societyOptions.map(o => o.optionValue),
      ...properties.map(p => p.society).filter(Boolean),
      ...transactions.map(t => t.society).filter(Boolean),
      ...(society ? [society] : []),
    ])
  );

  const filteredTransactions = useMemo(() => {
    let list = transactions.filter(t => !t.isTrash);

    if (typeFilter !== 'All') {
      list = list.filter(t => t.type === typeFilter);
    }
    if (selectedCategory) {
      list = list.filter(t => t.category === selectedCategory);
    }
    if (selectedMethod) {
      list = list.filter(t => t.paymentMethod === selectedMethod);
    }
    if (selectedSociety) {
      list = list.filter(t => t.society === selectedSociety);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        t =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.referenceNo.toLowerCase().includes(q) ||
          t.personContact.toLowerCase().includes(q) ||
          t.propertyRef.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => b.date - a.date);
  }, [transactions, typeFilter, selectedCategory, selectedMethod, selectedSociety, searchQuery]);

  // Aggregate stats
  const totalIncome = useMemo(() => {
    return transactions
      .filter(t => !t.isTrash && t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions
      .filter(t => !t.isTrash && t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const netBalance = totalIncome - totalExpense;

  const openForm = (tx?: AccountTransactionEntity) => {
    if (tx) {
      setEditingTx(tx);
      setTitle(tx.title);
      setType(tx.type);
      setCategory(tx.category);
      setAmount(String(tx.amount));
      setDateStr(new Date(tx.date).toISOString().slice(0, 10));
      setSociety(tx.society);
      setPaymentMethod(tx.paymentMethod);
      setReferenceNo(tx.referenceNo);
      setDescription(tx.description);
      setPersonContact(tx.personContact);
      setPersonPhone(tx.personPhone);
      setPropertyRef(tx.propertyRef);
    } else {
      setEditingTx(null);
      setTitle('');
      setType('Income');
      setCategory('Agency Commission');
      setAmount('');
      setDateStr(new Date().toISOString().slice(0, 10));
      setSociety('');
      setPaymentMethod('Bank Transfer');
      setReferenceNo('');
      setDescription('');
      setPersonContact('');
      setPersonPhone('');
      setPropertyRef('');
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveTransaction({
      id: editingTx?.id,
      title: title.trim(),
      type,
      category: category.trim(),
      amount: parseAmountToNumber(amount),
      date: new Date(dateStr).getTime() || Date.now(),
      society: society.trim(),
      paymentMethod,
      referenceNo: referenceNo.trim(),
      description: description.trim(),
      attachmentUri: editingTx?.attachmentUri || '',
      personContact: personContact.trim(),
      personPhone: personPhone.trim(),
      propertyRef: propertyRef.trim(),
      isTrash: false,
      createdAt: editingTx?.createdAt || Date.now(),
      updatedAt: Date.now(),
      createdBy: 'Super Admin',
    });
    setShowModal(false);
  };

  const exportCsv = () => {
    const headers = ['ID', 'Date', 'Type', 'Title', 'Category', 'Amount (PKR)', 'Payment Method', 'Reference No', 'Contact Person', 'Society', 'Property Ref'];
    const rows = filteredTransactions.map(t => [
      t.id,
      new Date(t.date).toLocaleDateString(),
      t.type,
      `"${t.title.replace(/"/g, '""')}"`,
      t.category,
      t.amount,
      t.paymentMethod,
      t.referenceNo,
      `"${t.personContact.replace(/"/g, '""')}"`,
      t.society,
      t.propertyRef,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EstateVault_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printStatement = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Income */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Total Inflow (Income)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            PKR {formatCommas(totalIncome)}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            {formatAmountWithWords(totalIncome, '')}
          </p>
        </div>

        {/* Total Expenses */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Total Outflow (Expenses)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            PKR {formatCommas(totalExpense)}
          </p>
          <p className="text-[11px] text-rose-500 font-semibold mt-1">
            {formatAmountWithWords(totalExpense, '')}
          </p>
        </div>

        {/* Net Cash Flow */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-emerald-950 text-white border border-emerald-800/40 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-400">
            <span>Net Financial Balance</span>
            <Receipt className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black mt-2">
            PKR {formatCommas(netBalance)}
          </p>
          <p className="text-[11px] text-emerald-300 font-semibold mt-1">
            {formatAmountWithWords(netBalance, '')}
          </p>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Type selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(['All', 'Income', 'Expense'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                typeFilter === t
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {t === 'All' ? 'All Transactions' : t}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
            title="Download CSV Spreadsheet"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={printStatement}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
            title="Print Official Khata Statement"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Statement</span>
          </button>

          {hasPermission('add_transaction') && (
            <button
              onClick={() => openForm()}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Record Entry</span>
            </button>
          )}
        </div>
      </div>

      {/* Transaction Journal Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Transaction Title & Details</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Payment Method</th>
                <th className="px-4 py-3">Person / Entity</th>
                <th className="px-4 py-3">Society / Ref</th>
                <th className="px-4 py-3 text-right">Amount (PKR)</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-slate-500 whitespace-nowrap">
                      {formatDate(t.date)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{t.title}</div>
                      {t.description && (
                        <div className="text-[10px] text-slate-400 line-clamp-1">{t.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                      {t.category}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                        <CreditCard className="w-3 h-3 text-slate-400" />
                        <span>{t.paymentMethod}</span>
                      </span>
                      {t.referenceNo && (
                        <span className="block text-[9px] text-slate-400 font-mono">
                          Ref: {t.referenceNo}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300">
                      <div>{t.personContact || '-'}</div>
                      {t.personPhone && (
                        <div className="text-[10px] text-slate-400 font-mono">{t.personPhone}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      <div>{t.society || '-'}</div>
                      {t.propertyRef && (
                        <span className="text-[10px] font-mono font-bold text-emerald-600">
                          {t.propertyRef}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right font-black font-mono">
                      <span
                        className={
                          t.type === 'Income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                        }
                      >
                        {t.type === 'Income' ? '+' : '-'} {formatCommas(t.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1 whitespace-nowrap">
                      {hasPermission('edit_transaction') && (
                        <button
                          onClick={() => openForm(t)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5 inline" />
                        </button>
                      )}
                      {hasPermission('delete_transaction') && (
                        <button
                          onClick={() => {
                            if (confirm(`Move transaction "${t.title}" to Trash?`)) {
                              deleteTransaction(t.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50"
                          title="Trash"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────────────── ADD / EDIT TRANSACTION MODAL ─────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                {editingTx ? 'Edit Transaction' : 'Record New Khata Transaction'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="py-4 space-y-4 text-xs">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setType('Income')}
                  className={`py-2 rounded-xl font-bold transition-all ${
                    type === 'Income' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  + Cash Inflow (Income)
                </button>
                <button
                  type="button"
                  onClick={() => setType('Expense')}
                  className={`py-2 rounded-xl font-bold transition-all ${
                    type === 'Expense' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  - Cash Outflow (Expense)
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Transaction Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Commission Received on DHA Phase 6 Plot"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Amount (PKR) *
                  </label>
                  <input
                    type="text"
                    required
                    value={amount ? formatInputWithCommas(amount) : ''}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 850,000"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-emerald-600"
                  />
                  {amount && (
                    <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                      {formatAmountWithWords(amount, 'PKR')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    {categoryOptions.map((opt) => (
                      <option key={opt.id} value={opt.optionValue}>
                        {opt.optionValue}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    {paymentMethodOptions.map((opt) => (
                      <option key={opt.id} value={opt.optionValue}>
                        {opt.optionValue}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Reference / Cheque #
                  </label>
                  <input
                    type="text"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    placeholder="e.g. HBL-99882"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                      Linked Society / Project
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowManageSocieties(true)}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                      title="Add or Manage Society Options"
                    >
                      <SlidersHorizontal className="w-3 h-3" />
                      <span>Manage</span>
                    </button>
                  </div>
                  <select
                    value={society}
                    onChange={(e) => {
                      if (e.target.value === '__MANAGE_OPTIONS__') {
                        setShowManageSocieties(true);
                      } else {
                        setSociety(e.target.value);
                      }
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="">Select Society / Project</option>
                    {selectableSocieties.map((val) => (
                      <option key={val} value={val}>
                        {val}
                      </option>
                    ))}
                    <option value="__MANAGE_OPTIONS__">+ Add / Manage Societies...</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Party / Person Name
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={personContact}
                      onChange={(e) => setPersonContact(e.target.value)}
                      placeholder="e.g. Haji Muhammad Rizwan"
                      className="flex-1 min-w-0 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                    <ContactPickerButton
                      onContactSelected={(cName, cPhone) => {
                        if (cName) setPersonContact(cName);
                        if (cPhone) setPersonPhone(cPhone);
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Number
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={personPhone}
                      onChange={(e) => setPersonPhone(e.target.value)}
                      placeholder="+92 300..."
                      className="flex-1 min-w-0 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                    />
                    <ContactPickerButton
                      onContactSelected={(cName, cPhone) => {
                        if (cPhone) setPersonPhone(cPhone);
                        if (cName && !personContact) setPersonContact(cName);
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Property ID Link
                  </label>
                  <select
                    value={propertyRef}
                    onChange={(e) => setPropertyRef(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="">None / General</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.propertyId}>
                        {p.propertyId} ({p.society} - {p.size})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description & Notes
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional details regarding this entry..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

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
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DropdownManagerModal
        category="Society"
        title="Society"
        isOpen={showManageSocieties}
        onClose={() => setShowManageSocieties(false)}
        onSelectOption={(val) => setSociety(val)}
      />
    </div>
  );
};
