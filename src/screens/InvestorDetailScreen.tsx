import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Plus,
  Printer,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  User,
  Phone,
  Trash2,
  Calendar,
  X,
  Building,
  CheckCircle,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { InvestorEntity, InvestorTransactionEntity } from '../types/crm';
import { formatAmountWithWords, formatCommas, formatInputWithCommas, parseAmountToNumber } from '../utils/amountFormat';
import {
  calculateInvestorFinancials,
  computeRunningBalances,
  formatDate,
  formatPkr,
} from '../utils/investorAccounting';

interface InvestorDetailScreenProps {
  investor: InvestorEntity;
}

export const InvestorDetailScreen: React.FC<InvestorDetailScreenProps> = ({ investor }) => {
  const {
    navigateTo,
    investorTransactions,
    saveInvestorTransaction,
    deleteInvestorTransaction,
    hasPermission,
    properties,
    dropdowns,
  } = useCrm();

  const [profitSharePercent, setProfitSharePercent] = useState<number>(50);
  const [showTxModal, setShowTxModal] = useState(false);

  // New Transaction State
  const [txType, setTxType] = useState('Investment');
  const [txAmount, setTxAmount] = useState('');
  const [txDateStr, setTxDateStr] = useState(new Date().toISOString().slice(0, 10));
  const [txPaymentMethod, setTxPaymentMethod] = useState('Bank Transfer');
  const [txReference, setTxReference] = useState('');
  const [txPropertyId, setTxPropertyId] = useState<string>('');
  const [txDescription, setTxDescription] = useState('');

  const transactionTypes = [
    'Investment',
    'Additional Investment',
    'Property Purchase',
    'Property Sale Proceeds',
    'Profit Received',
    'Withdrawal',
    'Refund',
    'Expense',
    'Other',
  ];

  const paymentMethods = dropdowns.filter(d => d.category.toLowerCase() === 'paymentmethod' && d.isEnabled);

  const transactions = useMemo(() => {
    return investorTransactions.filter((t) => t.investorId === investor.id && !t.isDeleted);
  }, [investorTransactions, investor.id]);

  const financials = useMemo(() => {
    return calculateInvestorFinancials(transactions, profitSharePercent);
  }, [transactions, profitSharePercent]);

  const runningBalances = useMemo(() => {
    return computeRunningBalances(transactions);
  }, [transactions]);

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    saveInvestorTransaction({
      investorId: investor.id,
      type: txType,
      amount: parseAmountToNumber(txAmount),
      date: new Date(txDateStr).getTime() || Date.now(),
      paymentMethod: txPaymentMethod,
      reference: txReference.trim(),
      propertyId: txPropertyId ? parseInt(txPropertyId) : null,
      description: txDescription.trim(),
      isDeleted: false,
      createdAt: Date.now(),
    });
    setShowTxModal(false);
    setTxAmount('');
    setTxReference('');
    setTxDescription('');
  };

  const printStatement = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('INVESTORS')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {investor.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                CNIC: {investor.cnic || 'N/A'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {investor.fatherCompany || 'Private Partner'} • {investor.mobileNumber} • {investor.address || 'Lahore'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={printStatement}
            className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
          >
            <Printer className="w-4 h-4" />
            <span>Print Ledger</span>
          </button>

          {hasPermission('manage_investors') && (
            <button
              onClick={() => setShowTxModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Record Transaction</span>
            </button>
          )}
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Investment */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Capital Inflow
          </span>
          <p className="text-xl font-black text-purple-600 dark:text-purple-400 mt-2 font-mono">
            PKR {formatCommas(financials.totalInvestment)}
          </p>
          <p className="text-[10px] text-slate-500 font-semibold mt-1">
            {formatAmountWithWords(financials.totalInvestment, '')}
          </p>
        </div>

        {/* Total Expenses / Purchases */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Project Costs & Outflow
          </span>
          <p className="text-xl font-black text-rose-500 mt-2 font-mono">
            PKR {formatCommas(financials.totalExpenses + financials.totalOtherCosts)}
          </p>
          <p className="text-[10px] text-slate-500 font-semibold mt-1">
            Purchases & operational fees
          </p>
        </div>

        {/* Investor Profit Share */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Investor Share ({profitSharePercent}%)</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-purple-600">Ratio:</span>
              <select
                value={profitSharePercent}
                onChange={(e) => setProfitSharePercent(Number(e.target.value))}
                className="p-0.5 text-xs border rounded bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold"
              >
                <option value={30}>30%</option>
                <option value={40}>40%</option>
                <option value={50}>50%</option>
                <option value={60}>60%</option>
                <option value={70}>70%</option>
                <option value={100}>100%</option>
              </select>
            </div>
          </div>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-2 font-mono">
            PKR {formatCommas(financials.investorProfitShare)}
          </p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1">
            ROI: {financials.roiPercentage.toFixed(1)}%
          </p>
        </div>

        {/* Net Outstanding Balance */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-950 to-slate-900 text-white border border-purple-800/40 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
            Net Balance Payable
          </span>
          <p className="text-xl font-black mt-2 font-mono">
            PKR {formatCommas(financials.remainingBalance)}
          </p>
          <p className="text-[10px] text-purple-300 font-semibold mt-1">
            Capital + Share - Payouts
          </p>
        </div>
      </div>

      {/* Transaction Ledger Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-purple-600" />
            Complete Investment Transaction Journal
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {transactions.length} recorded entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Linked Property</th>
                <th className="px-4 py-3">Payment & Reference</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-right">Debit / Out</th>
                <th className="px-4 py-3 text-right">Credit / In</th>
                <th className="px-4 py-3 text-right">Running Balance</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {runningBalances.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No transactions recorded for this investor yet. Click "Record Transaction" to add capital.
                  </td>
                </tr>
              ) : (
                runningBalances.map(({ transaction: t, runningBalance, isCredit }) => {
                  const linkedProp = properties.find((p) => p.id === t.propertyId);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-slate-500 whitespace-nowrap">
                        {formatDate(t.date)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isCredit
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                        {linkedProp ? `${linkedProp.propertyId} (${linkedProp.society})` : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                        <div>{t.paymentMethod}</div>
                        {t.reference && (
                          <div className="text-[10px] text-slate-400 font-mono">Ref: {t.reference}</div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {t.description || '-'}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-rose-500">
                        {!isCredit ? `PKR ${formatCommas(t.amount)}` : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {isCredit ? `PKR ${formatCommas(t.amount)}` : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-black text-purple-700 dark:text-purple-300">
                        PKR {formatCommas(runningBalance)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => {
                            if (confirm('Delete this investor transaction record?')) {
                              deleteInvestorTransaction(t.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────────────── ADD TRANSACTION MODAL ─────────────────── */}
      {showTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-purple-600" />
                Record Investor Transaction
              </h3>
              <button onClick={() => setShowTxModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Transaction Type *
                  </label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    {transactionTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Amount (PKR) *
                  </label>
                  <input
                    type="text"
                    required
                    value={txAmount ? formatInputWithCommas(txAmount) : ''}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="e.g. 5,000,000"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-purple-600"
                  />
                  {txAmount && (
                    <p className="text-[10px] text-purple-600 font-semibold mt-0.5">
                      {formatAmountWithWords(txAmount, 'PKR')}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={txDateStr}
                    onChange={(e) => setTxDateStr(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={txPaymentMethod}
                    onChange={(e) => setTxPaymentMethod(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Online Deposit">Online Deposit</option>
                    <option value="Pay Order">Pay Order</option>
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
                    value={txReference}
                    onChange={(e) => setTxReference(e.target.value)}
                    placeholder="e.g. HBL-INV-101"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Linked Deal / Property
                  </label>
                  <select
                    value={txPropertyId}
                    onChange={(e) => setTxPropertyId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="">General Investment Pool</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.propertyId} ({p.society} - {p.size})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description & Project Notes
                </label>
                <textarea
                  rows={2}
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  placeholder="Details of capital contribution, deal share, or withdrawal..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTxModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
