import {
  PurchaseExpense,
  CapitalInflow,
  DirectPayment,
  DashboardMetrics,
  CategorySummary,
  ProjectSummary,
  ContributorSummary,
  MonthlySummary,
  EXPENSE_CATEGORIES,
  PROJECTS,
  TEAM_MEMBERS,
} from '../types/finance';
import { parseDateFlexible } from './dateUtils';

export function computeDashboardMetrics(
  purchases: PurchaseExpense[],
  inflows: CapitalInflow[],
  directPayments: DirectPayment[]
): DashboardMetrics {
  const totalCapitalInflow = inflows.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const cashExpenses = purchases.reduce((sum, item) => sum + (Number(item.totalCost) || 0), 0);
  const directPaymentsTotal = directPayments.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const availableCash = totalCapitalInflow - cashExpenses;
  const totalSpending = cashExpenses + directPaymentsTotal;

  const salaryPaid =
    directPayments
      .filter((dp) => dp.category.toLowerCase() === 'salary')
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0) +
    purchases
      .filter((p) => p.category.toLowerCase() === 'salary')
      .reduce((sum, item) => sum + (Number(item.totalCost) || 0), 0);

  return {
    totalCapitalInflow,
    cashExpenses,
    availableCash,
    directPayments: directPaymentsTotal,
    totalSpending,
    salaryPaid,
  };
}

export function computeCategorySummaries(
  purchases: PurchaseExpense[],
  directPayments: DirectPayment[]
): CategorySummary[] {
  return EXPENSE_CATEGORIES.map((cat) => {
    const catPurchases = purchases.filter(
      (p) => p.category.toLowerCase() === cat.toLowerCase()
    );
    const catDirect = directPayments.filter(
      (dp) => dp.category.toLowerCase() === cat.toLowerCase()
    );

    const cashExpense = catPurchases.reduce((s, p) => s + (Number(p.totalCost) || 0), 0);
    const directPayment = catDirect.reduce((s, dp) => s + (Number(dp.amount) || 0), 0);
    const total = cashExpense + directPayment;
    const count = catPurchases.length + catDirect.length;

    return {
      category: cat,
      cashExpense,
      directPayment,
      total,
      count,
    };
  });
}

export function computeProjectSummaries(
  purchases: PurchaseExpense[],
  directPayments: DirectPayment[]
): ProjectSummary[] {
  return PROJECTS.map((proj) => {
    const projPurchases = purchases.filter(
      (p) => p.project.toLowerCase() === proj.toLowerCase()
    );
    const projDirect = directPayments.filter(
      (dp) => dp.project.toLowerCase() === proj.toLowerCase()
    );

    const cashExpense = projPurchases.reduce((s, p) => s + (Number(p.totalCost) || 0), 0);
    const directPayment = projDirect.reduce((s, dp) => s + (Number(dp.amount) || 0), 0);
    const total = cashExpense + directPayment;
    const count = projPurchases.length + projDirect.length;

    return {
      project: proj,
      cashExpense,
      directPayment,
      total,
      count,
    };
  });
}

export function computeContributorSummaries(
  purchases: PurchaseExpense[],
  inflows: CapitalInflow[],
  directPayments: DirectPayment[]
): ContributorSummary[] {
  const totalPurchasesCost = purchases.reduce((s, p) => s + (Number(p.totalCost) || 0), 0);
  const totalDirect = directPayments.reduce((s, dp) => s + (Number(dp.amount) || 0), 0);
  const grandSpending = totalPurchasesCost + totalDirect;

  return TEAM_MEMBERS.map((member) => {
    const contributed = inflows
      .filter((inf) => inf.contributor.toLowerCase() === member.toLowerCase())
      .reduce((s, inf) => s + (Number(inf.amount) || 0), 0);

    const receivedFromInflows = inflows
      .filter((inf) => inf.receivedBy.toLowerCase() === member.toLowerCase())
      .reduce((s, inf) => s + (Number(inf.amount) || 0), 0);
    const receivedFromDirect = directPayments
      .filter((dp) => dp.paidTo.toLowerCase() === member.toLowerCase())
      .reduce((s, dp) => s + (Number(dp.amount) || 0), 0);
    const received = receivedFromInflows + receivedFromDirect;

    const paidInPurchases = purchases
      .filter((p) => p.paidBy.toLowerCase() === member.toLowerCase())
      .reduce((s, p) => s + (Number(p.totalCost) || 0), 0);
    const paidInDirect = directPayments
      .filter((dp) => dp.paidBy.toLowerCase() === member.toLowerCase())
      .reduce((s, dp) => s + (Number(dp.amount) || 0), 0);
    const paid = paidInPurchases + paidInDirect;

    const purchasesCount = purchases.filter(
      (p) => p.purchasedBy.toLowerCase() === member.toLowerCase()
    ).length;

    const expenseSharePercent = grandSpending > 0 ? Math.round((paid / grandSpending) * 100) : 0;

    return {
      member,
      contributed,
      received,
      paid,
      recordsCount: purchasesCount,
      expenseSharePercent,
    };
  });
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function computeMonthlyFlow(
  purchases: PurchaseExpense[],
  inflows: CapitalInflow[],
  directPayments: DirectPayment[]
): MonthlySummary[] {
  return MONTH_NAMES.map((month, idx) => {
    const isMatchingMonth = (dateStr: string) => {
      if (!dateStr) return false;
      const d = parseDateFlexible(dateStr);
      return d !== null && d.getMonth() === idx;
    };

    const monthInflow = inflows
      .filter((i) => isMatchingMonth(i.date))
      .reduce((s, i) => s + (Number(i.amount) || 0), 0);

    const monthExpenses = purchases
      .filter((p) => isMatchingMonth(p.date))
      .reduce((s, p) => s + (Number(p.totalCost) || 0), 0);

    const monthDirect = directPayments
      .filter((dp) => isMatchingMonth(dp.date))
      .reduce((s, dp) => s + (Number(dp.amount) || 0), 0);

    const availableCash = monthInflow - monthExpenses;
    const totalSpending = monthExpenses + monthDirect;

    return {
      month,
      cashInflow: monthInflow,
      cashExpenses: monthExpenses,
      directPayments: monthDirect,
      availableCash,
      totalSpending,
    };
  });
}

export function formatBDT(val: number): string {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(val) + ' BDT';
}
