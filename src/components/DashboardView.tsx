import React from 'react';
import {
  TrendingUp,
  Wallet,
  ShoppingCart,
  Send,
  Briefcase,
  ArrowDownLeft,
  Users,
  FolderKanban,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  DashboardMetrics,
  CategorySummary,
  ProjectSummary,
  ContributorSummary,
  MonthlySummary,
} from '../types/finance';
import { formatBDT } from '../utils/financeCalculations';

interface DashboardViewProps {
  metrics: DashboardMetrics;
  categorySummaries: CategorySummary[];
  projectSummaries: ProjectSummary[];
  contributorSummaries: ContributorSummary[];
  monthlyFlow: MonthlySummary[];
}

const CATEGORY_COLORS: { [key: string]: string } = {
  Hardware: '#3b82f6',
  Software: '#8b5cf6',
  'Tools & Equipment': '#06b6d4',
  Salary: '#ec4899',
  Prototype: '#f59e0b',
  Operations: '#10b981',
  Transport: '#6366f1',
  Other: '#94a3b8',
};

const PROJECT_COLORS: { [key: string]: string } = {
  General: '#3b82f6',
  'Cleaning Robot': '#10b981',
  'Gas Detector': '#f59e0b',
  Other: '#64748b',
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  categorySummaries,
  projectSummaries,
  contributorSummaries,
  monthlyFlow,
}) => {
  // Filter active months that have non-zero activity
  const activeMonthlyData = monthlyFlow.filter(
    (m) => m.cashInflow > 0 || m.cashExpenses > 0 || m.directPayments > 0
  );

  const activeCategoryData = categorySummaries.filter((c) => c.total > 0);
  const activeProjectData = projectSummaries.filter((p) => p.total > 0);

  return (
    <div className="space-y-6 pb-20 sm:pb-8">
      {/* Top 6 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* 1. Total Capital Inflow */}
        <div className="bg-slate-900/80 border border-emerald-500/20 rounded-2xl p-4 relative overflow-hidden shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
              Capital Inflow
            </span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {formatBDT(metrics.totalCapitalInflow)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Sponsor & Partner Support</p>
          </div>
        </div>

        {/* 2. Cash Expenses */}
        <div className="bg-slate-900/80 border border-amber-500/20 rounded-2xl p-4 relative overflow-hidden shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
              Cash Expenses
            </span>
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {formatBDT(metrics.cashExpenses)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Purchases & Components</p>
          </div>
        </div>

        {/* 3. Available Cash */}
        <div className="bg-slate-900/80 border border-blue-500/20 rounded-2xl p-4 relative overflow-hidden shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
              Available Cash
            </span>
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-lg sm:text-xl font-bold tracking-tight ${
                metrics.availableCash >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatBDT(metrics.availableCash)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Inflow minus Cash Spent</p>
          </div>
        </div>

        {/* 4. Direct Payments */}
        <div className="bg-slate-900/80 border border-purple-500/20 rounded-2xl p-4 relative overflow-hidden shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
              Direct Payments
            </span>
            <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {formatBDT(metrics.directPayments)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Salaries & Bank transfers</p>
          </div>
        </div>

        {/* 5. Total Spending */}
        <div className="bg-slate-900/80 border border-rose-500/20 rounded-2xl p-4 relative overflow-hidden shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
              Total Spending
            </span>
            <div className="p-2 bg-rose-500/10 rounded-xl text-rose-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {formatBDT(metrics.totalSpending)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Cash + Direct Payments</p>
          </div>
        </div>

        {/* 6. Salary Paid */}
        <div className="bg-slate-900/80 border border-indigo-500/20 rounded-2xl p-4 relative overflow-hidden shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
              Salary Paid
            </span>
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {formatBDT(metrics.salaryPaid)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Team Compensation</p>
          </div>
        </div>
      </div>

      {/* Monthly Flow Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-slate-100">
                Monthly Cash Flow & Spending
              </h3>
              <p className="text-xs text-slate-400">
                Tracking Inflow vs Cash Expenses vs Direct Payments across months
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>2026 Fiscal Flow</span>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={activeMonthlyData.length > 0 ? activeMonthlyData : monthlyFlow}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickFormatter={(val) => `${val / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
                formatter={(value: any) => [formatBDT(Number(value) || 0)]}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
              />
              <Bar dataKey="cashInflow" name="Capital Inflow" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cashExpenses" name="Cash Expenses" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="directPayments" name="Direct Payments" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Layout: Categories & Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <PieIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base text-slate-100">
                  Spending by Category
                </h3>
                <p className="text-xs text-slate-400">Cash Expenses + Direct Payments</p>
              </div>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activeCategoryData}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {activeCategoryData.map((entry) => (
                      <Cell
                        key={`cell-${entry.category}`}
                        fill={CATEGORY_COLORS[entry.category] || '#64748b'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [formatBDT(Number(value) || 0), 'Total Spent']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 mt-2 max-h-48 overflow-y-auto pr-1">
            {activeCategoryData.map((item) => (
              <div
                key={item.category}
                className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-800/40 border border-slate-700/30"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#64748b' }}
                  />
                  <span className="text-slate-200 font-medium">{item.category}</span>
                  <span className="text-slate-400 text-[10px]">({item.count} items)</span>
                </div>
                <span className="font-semibold text-slate-100">{formatBDT(item.total)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Project Breakdown */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <FolderKanban className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base text-slate-100">
                  Spending by Project
                </h3>
                <p className="text-xs text-slate-400">General, Cleaning Robot, Gas Detector</p>
              </div>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activeProjectData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" fontSize={10} tickFormatter={(v) => `${v/1000}k`} />
                  <YAxis type="category" dataKey="project" stroke="#64748b" fontSize={11} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [formatBDT(Number(value) || 0), 'Total Spent']}
                  />
                  <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                    {activeProjectData.map((entry) => (
                      <Cell
                        key={`proj-${entry.project}`}
                        fill={PROJECT_COLORS[entry.project] || '#3b82f6'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 mt-2">
            {activeProjectData.map((item) => (
              <div
                key={item.project}
                className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-800/40 border border-slate-700/30"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PROJECT_COLORS[item.project] || '#3b82f6' }}
                  />
                  <span className="text-slate-200 font-medium">{item.project}</span>
                  <span className="text-slate-400 text-[10px]">({item.count} items)</span>
                </div>
                <span className="font-semibold text-slate-100">{formatBDT(item.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Activity & Contribution Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base text-slate-100">
              Team Member Contribution & Activity
            </h3>
            <p className="text-xs text-slate-400">
              Capital Contributed, Received Funds, and Total Expenses Paid
            </p>
          </div>
        </div>

        {/* Table for Desktop & Cards for Mobile */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Team Member</th>
                <th className="py-2.5 px-3 text-right">Capital Contributed</th>
                <th className="py-2.5 px-3 text-right">Capital Received</th>
                <th className="py-2.5 px-3 text-right">Paid Amount</th>
                <th className="py-2.5 px-3 text-center">Purchases</th>
                <th className="py-2.5 px-3 text-right">Expense Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {contributorSummaries.map((m) => (
                <tr key={m.member} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-medium text-slate-200 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">
                      {m.member.charAt(0)}
                    </div>
                    {m.member}
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-400 font-semibold">
                    {formatBDT(m.contributed)}
                  </td>
                  <td className="py-3 px-3 text-right text-cyan-400 font-semibold">
                    {formatBDT(m.received)}
                  </td>
                  <td className="py-3 px-3 text-right text-amber-400 font-semibold">
                    {formatBDT(m.paid)}
                  </td>
                  <td className="py-3 px-3 text-center text-slate-300 font-medium">
                    {m.recordsCount}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, m.expenseSharePercent)}%` }}
                        />
                      </div>
                      <span className="font-semibold text-slate-300 w-8 text-right">
                        {m.expenseSharePercent}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards for Team Activity */}
        <div className="sm:hidden space-y-3">
          {contributorSummaries.map((m) => (
            <div
              key={m.member}
              className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/40 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                    {m.member.charAt(0)}
                  </div>
                  <span className="font-semibold text-sm text-slate-200">{m.member}</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {m.expenseSharePercent}% share
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Contributed</span>
                  <span className="font-semibold text-emerald-400">{formatBDT(m.contributed)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Received</span>
                  <span className="font-semibold text-cyan-400">{formatBDT(m.received)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Paid</span>
                  <span className="font-semibold text-amber-400">{formatBDT(m.paid)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
