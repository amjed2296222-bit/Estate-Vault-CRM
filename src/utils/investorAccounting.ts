import { InvestorTransactionEntity } from '../types/crm';
import { formatCommas } from './amountFormat';

export interface InvestorFinancialSummary {
  totalInvestment: number;
  totalExpenses: number;
  totalSaleRevenue: number;
  grossProfit: number;
  totalOtherCosts: number;
  netProfit: number;
  investorProfitShare: number;
  companyProfitShare: number;
  paidAmount: number;
  remainingBalance: number;
  roiPercentage: number;
  totalTransactionsCount: number;
}

export interface TransactionWithBalance {
  transaction: InvestorTransactionEntity;
  runningBalance: number;
  isCredit: boolean;
}

export function formatPkr(amount: number): string {
  const sign = amount < 0 ? '-Rs ' : 'Rs ';
  const absVal = Math.abs(amount);
  return `${sign}${formatCommas(absVal)}`;
}

export function formatDate(millis: number): string {
  if (!millis || millis <= 0) return 'N/A';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(millis));
}

export function formatDateTime(millis: number): string {
  if (!millis || millis <= 0) return 'N/A';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(millis));
}

export function calculateInvestorFinancials(
  transactions: InvestorTransactionEntity[],
  customProfitSharePercent: number = 50.0
): InvestorFinancialSummary {
  const activeTx = transactions.filter(t => !t.isDeleted);
  let investment = 0.0;
  let expenses = 0.0;
  let saleRevenue = 0.0;
  let otherCosts = 0.0;
  let paidAmount = 0.0;

  for (const tx of activeTx) {
    const amt = tx.amount;
    const type = tx.type;

    if (
      type === 'Investment' ||
      type === 'Additional Investment' ||
      type === 'Capital Contribution' ||
      type === 'Initial Investment'
    ) {
      investment += amt;
    } else if (
      type === 'Property Purchase' ||
      type === 'Expense' ||
      type === 'Development / Construction' ||
      type === 'Repair & Maintenance' ||
      type === 'Project Expense'
    ) {
      expenses += amt;
    } else if (
      type === 'Other Costs' ||
      type === 'Other Costs & Taxes' ||
      type === 'Legal & Transfer Fee' ||
      type === 'Taxes / Holding Costs' ||
      type === 'Marketing / Brokerage'
    ) {
      otherCosts += amt;
    } else if (
      type === 'Property Sale Proceeds' ||
      type === 'Sale / Revenue' ||
      type === 'Rental Income' ||
      type === 'Revenue'
    ) {
      saleRevenue += amt;
    } else if (
      type === 'Withdrawal' ||
      type === 'Capital Return' ||
      type === 'Refund' ||
      type === 'Payout'
    ) {
      paidAmount += amt;
    } else if (type === 'Profit Received' || type === 'Profit Share') {
      paidAmount += amt;
    }
  }

  const grossProfit = saleRevenue - expenses;
  const netProfit = grossProfit - otherCosts;
  const investorProfitShare = netProfit > 0 ? (netProfit * customProfitSharePercent) / 100.0 : 0.0;
  const companyProfitShare = netProfit > 0 ? netProfit - investorProfitShare : 0.0;
  const remainingBalance = investment + investorProfitShare - paidAmount;
  const roiPercentage = investment > 0 ? (investorProfitShare / investment) * 100.0 : 0.0;

  return {
    totalInvestment: investment,
    totalExpenses: expenses,
    totalSaleRevenue: saleRevenue,
    grossProfit,
    totalOtherCosts: otherCosts,
    netProfit,
    investorProfitShare,
    companyProfitShare,
    paidAmount,
    remainingBalance,
    roiPercentage,
    totalTransactionsCount: activeTx.length,
  };
}

export function computeRunningBalances(
  transactions: InvestorTransactionEntity[]
): TransactionWithBalance[] {
  const sorted = [...transactions]
    .filter(t => !t.isDeleted)
    .sort((a, b) => a.date - b.date);

  let balance = 0;
  return sorted.map(tx => {
    const isCredit = [
      'Investment',
      'Additional Investment',
      'Capital Contribution',
      'Profit Received',
      'Property Sale Proceeds',
      'Sale / Revenue',
      'Rental Income',
    ].includes(tx.type);

    if (isCredit) {
      balance += tx.amount;
    } else {
      balance -= tx.amount;
    }

    return {
      transaction: tx,
      runningBalance: balance,
      isCredit,
    };
  });
}
