import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Plus,
  Search,
  Phone,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Briefcase,
  ArrowRight,
  Edit3,
  X,
  CreditCard,
  Building,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { InvestorEntity } from '../types/crm';
import { formatAmountWithWords, formatCommas } from '../utils/amountFormat';
import { calculateInvestorFinancials } from '../utils/investorAccounting';
import { ContactPickerButton } from '../components/ContactPickerButton';

export const InvestorsScreen: React.FC = () => {
  const {
    investors,
    investorTransactions,
    saveInvestor,
    navigateTo,
    hasPermission,
    searchQuery,
  } = useCrm();

  const [showModal, setShowModal] = useState(false);
  const [editingInv, setEditingInv] = useState<InvestorEntity | null>(null);
  const [name, setName] = useState('');
  const [fatherCompany, setFatherCompany] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');
  const [cnic, setCnic] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const filteredInvestors = useMemo(() => {
    let list = investors;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        i =>
          i.name.toLowerCase().includes(q) ||
          i.fatherCompany.toLowerCase().includes(q) ||
          i.mobileNumber.includes(q) ||
          i.cnic.includes(q)
      );
    }
    return list;
  }, [investors, searchQuery]);

  // Overall calculations
  const overallInvestment = useMemo(() => {
    return investorTransactions
      .filter(t => !t.isDeleted && (t.type === 'Investment' || t.type === 'Additional Investment'))
      .reduce((s, t) => s + t.amount, 0);
  }, [investorTransactions]);

  const overallProfitPaid = useMemo(() => {
    return investorTransactions
      .filter(t => !t.isDeleted && (t.type === 'Profit Received' || t.type === 'Profit Share'))
      .reduce((s, t) => s + t.amount, 0);
  }, [investorTransactions]);

  const openForm = (inv?: InvestorEntity) => {
    if (inv) {
      setEditingInv(inv);
      setName(inv.name);
      setFatherCompany(inv.fatherCompany);
      setMobileNumber(inv.mobileNumber);
      setWhatsappNumber(inv.whatsappNumber);
      setEmail(inv.email);
      setCnic(inv.cnic);
      setAddress(inv.address);
      setNotes(inv.notes);
    } else {
      setEditingInv(null);
      setName('');
      setFatherCompany('');
      setMobileNumber('');
      setWhatsappNumber('');
      setEmail('');
      setCnic('');
      setAddress('');
      setNotes('');
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveInvestor({
      id: editingInv?.id,
      name: name.trim(),
      fatherCompany: fatherCompany.trim(),
      mobileNumber: mobileNumber.trim(),
      whatsappNumber: whatsappNumber.trim(),
      email: email.trim(),
      cnic: cnic.trim(),
      address: address.trim(),
      notes: notes.trim(),
      isActive: true,
      createdAt: editingInv?.createdAt || Date.now(),
    });
    setShowModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Pool Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Capital In Pool
          </span>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-2">
            PKR {formatCommas(overallInvestment)}
          </p>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">
            {formatAmountWithWords(overallInvestment, '')}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Payouts & Profits Distributed
          </span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            PKR {formatCommas(overallProfitPaid)}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            {formatAmountWithWords(overallProfitPaid, '')}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-950 to-slate-900 text-white border border-purple-800/40 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
            Active Syndicate Partners
          </span>
          <p className="text-2xl font-black mt-2">
            {investors.length} Investors
          </p>
          <p className="text-[11px] text-purple-300 font-semibold mt-1">
            Joint ventures and plot flips
          </p>
        </div>
      </div>

      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Investors Ledger
          </h2>
          <p className="text-xs text-slate-500">
            Manage equity partners, capital deposits, profit percentages, and project disbursements
          </p>
        </div>

        {hasPermission('manage_investors') && (
          <button
            onClick={() => openForm()}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Investor Partner</span>
          </button>
        )}
      </div>

      {/* Investors List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredInvestors.map((inv) => {
          const invTxs = investorTransactions.filter(t => t.investorId === inv.id);
          const financials = calculateInvestorFinancials(invTxs);

          return (
            <div
              key={inv.id}
              className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {inv.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {inv.fatherCompany || 'Private Partner'}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                    CNIC: {inv.cnic || 'N/A'}
                  </span>
                </div>

                {/* Financial Summary Pill Box */}
                <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Investment:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      PKR {formatCommas(financials.totalInvestment)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Profit Received:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      PKR {formatCommas(financials.paidAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Net Balance:</span>
                    <span className="font-mono font-black text-purple-600 dark:text-purple-400">
                      PKR {formatCommas(financials.remainingBalance)}
                    </span>
                  </div>
                </div>

                {/* Contact Strip */}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-mono">{inv.mobileNumber}</span>
                  {inv.email && <span className="truncate max-w-[140px]">{inv.email}</span>}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {inv.mobileNumber && (
                    <a
                      href={`tel:${inv.mobileNumber}`}
                      className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {inv.whatsappNumber && (
                    <a
                      href={`https://wa.me/${inv.whatsappNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => openForm(inv)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => navigateTo('INVESTOR_DETAIL', null, inv)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
                >
                  <span>Ledger Statement</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─────────────────── ADD / EDIT INVESTOR MODAL ─────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-purple-600" />
                {editingInv ? 'Edit Investor Partner' : 'New Investor Registration'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Investor Name *
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Chaudhry Nadeem Akhtar"
                      className="flex-1 min-w-0 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                    />
                    <ContactPickerButton
                      onContactSelected={(cName, cPhone) => {
                        if (cName) setName(cName);
                        if (cPhone) {
                          setMobileNumber(cPhone);
                          if (!whatsappNumber) setWhatsappNumber(cPhone);
                        }
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Father / Company Name
                  </label>
                  <input
                    type="text"
                    value={fatherCompany}
                    onChange={(e) => setFatherCompany(e.target.value)}
                    placeholder="e.g. Akhtar Agro Ventures"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Phone *
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      required
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="+92 300..."
                      className="flex-1 min-w-0 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                    />
                    <ContactPickerButton
                      onContactSelected={(cName, cPhone) => {
                        if (cPhone) setMobileNumber(cPhone);
                        if (cName && !name) setName(cName);
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    WhatsApp Number
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="+92 300..."
                      className="flex-1 min-w-0 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                    />
                    <ContactPickerButton
                      onContactSelected={(cName, cPhone) => {
                        if (cPhone) setWhatsappNumber(cPhone);
                        if (cName && !name) setName(cName);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    CNIC / National ID
                  </label>
                  <input
                    type="text"
                    value={cnic}
                    onChange={(e) => setCnic(e.target.value)}
                    placeholder="35201-1234567-1"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="investor@example.com"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Residential / Office Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Model Town Block G, Lahore"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Agreement Terms & Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Profit sharing ratio (e.g. 50/50), capital locking period, terms..."
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
                  className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  Save Investor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
