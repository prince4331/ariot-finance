export const TEAM_MEMBERS = ['Sadid Muneer Sir', 'Prince', 'Saad'] as const;
export type TeamMember = (typeof TEAM_MEMBERS)[number] | string;

export const EXPENSE_CATEGORIES = [
  'Hardware',
  'Software',
  'Tools & Equipment',
  'Salary',
  'Prototype',
  'Operations',
  'Transport',
  'Other',
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number] | string;

export const INFLOW_CATEGORIES = [
  'Product Development',
  'Hardware Development',
  'Software',
  'Tools & Equipment',
  'Salary',
  'Prototype',
  'Operations',
  'Emergency Reserve',
  'Other',
] as const;
export type InflowCategory = (typeof INFLOW_CATEGORIES)[number] | string;

export const PROJECTS = [
  'General',
  'Cleaning Robot',
  'Gas Detector',
  'Other',
] as const;
export type ProjectName = (typeof PROJECTS)[number] | string;

export const PAYMENT_METHODS = [
  'Cash',
  'bKash',
  'Nagad',
  'Bank Transfer',
  'Card',
  'Mobile Banking',
  'Cheque',
  'Other',
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number] | string;

export interface PurchaseExpense {
  id: string;
  rowIndex: number;
  date: string; // YYYY-MM-DD
  receiptNo: string;
  receiptLink: string;
  purchasedBy: TeamMember;
  paidBy: TeamMember;
  component: string;
  category: ExpenseCategory;
  project: ProjectName;
  qty: number;
  unitCost: number;
  totalCost: number;
  paymentMethod: PaymentMethod;
  notes: string;
}

export interface CapitalInflow {
  id: string;
  rowIndex: number;
  date: string;
  contributor: TeamMember;
  receivedBy: TeamMember;
  amount: number;
  taggedFor: InflowCategory;
  project: ProjectName;
  paymentMethod: PaymentMethod;
  notes: string;
}

export interface DirectPayment {
  id: string;
  rowIndex: number;
  date: string;
  paidBy: TeamMember;
  paidTo: TeamMember;
  category: ExpenseCategory;
  project: ProjectName;
  amount: number;
  paymentMethod: PaymentMethod;
  reference: string;
  receiptLink: string;
}

export interface DashboardMetrics {
  totalCapitalInflow: number;
  cashExpenses: number;
  availableCash: number;
  directPayments: number;
  totalSpending: number;
  salaryPaid: number;
}

export interface CategorySummary {
  category: string;
  cashExpense: number;
  directPayment: number;
  total: number;
  count: number;
}

export interface ProjectSummary {
  project: string;
  cashExpense: number;
  directPayment: number;
  total: number;
  count: number;
}

export interface ContributorSummary {
  member: string;
  contributed: number;
  received: number;
  paid: number;
  recordsCount: number;
  expenseSharePercent: number;
}

export interface MonthlySummary {
  month: string;
  cashInflow: number;
  cashExpenses: number;
  directPayments: number;
  availableCash: number;
  totalSpending: number;
}
