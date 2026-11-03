import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Send,
  X,
} from 'lucide-react';
import { DirectPayment, EXPENSE_CATEGORIES, TEAM_MEMBERS } from '../types/finance';
import { formatBDT } from '../utils/financeCalculations';
import { formatToSheetDate, parseDateFlexible } from '../utils/dateUtils';

interface DirectPaymentsViewProps {
  directPayments: DirectPayment[];
  onAdd: () => void;
  onEdit: (payment: DirectPayment) => void;
  onDelete: (payment: DirectPayment) => void;
}

export const DirectPaymentsView: React.FC<DirectPaymentsViewProps> = ({
  directPayments,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPayer, setSelectedPayer] = useState<string>('ALL');
  const [selectedRecipient, setSelectedRecipient] = useState<string>('ALL');

  const filteredPayments = useMemo(() => {
    return directPayments
      .filter((dp) => {
        const matchesSearch =
          searchTerm === '' ||
          dp.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dp.paidBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dp.paidTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dp.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dp.project.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
          selectedCategory === 'ALL' ||
          dp.category.toLowerCase() === selectedCategory.toLowerCase();

        const matchesPayer =
          selectedPayer === 'ALL' ||
          dp.paidBy.toLowerCase() === selectedPayer.toLowerCase();

        const matchesRecipient =
          selectedRecipient === 'ALL' ||
          dp.paidTo.toLowerCase() === selectedRecipient.toLowerCase();

        return matchesSearch && matchesCategory && matchesPayer && matchesRecipient;
      })
      .sort((a, b) => {
        const timeA = parseDateFlexible(a.date)?.getTime() || 0;
        const timeB = parseDateFlexible(b.date)?.getTime() || 0;
        return timeB - timeA;
      });
  }, [directPayments, searchTerm, selectedCategory, selectedPayer, selectedRecipient]);

  const totalPaymentsAmount = useMemo(() => {
    return filteredPayments.reduce((sum, dp) => sum + (Number(dp.amount) || 0), 0);
  }, [filteredPayments]);

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Direct Payments & Salaries
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
              {filteredPayments.length} records
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Salaries, direct partner bank transfers, compensations, and reimbursements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 font-semibold flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-purple-400" />
            <span>Total: {formatBDT(totalPaymentsAmount)}</span>
          </div>

          <button
            onClick={onAdd}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-600/25 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Payment</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reference, recipient, payer..."
            className="w-full bg-slate-800/80 border border-slate-700/70 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-800/80 border border-slate-700/70 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="ALL">All Categories</option>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={selectedPayer}
          onChange={(e) => setSelectedPayer(e.target.value)}
          className="bg-slate-800/80 border border-slate-700/70 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="ALL">All Paid By</option>
          {TEAM_MEMBERS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={selectedRecipient}
          onChange={(e) => setSelectedRecipient(e.target.value)}
          className="bg-slate-800/80 border border-slate-700/70 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="ALL">All Paid To</option>
          {TEAM_MEMBERS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/60 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-4">Paid By</th>
                <th className="py-3 px-4">Paid To</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Project</th>
                <th className="py-3 px-4 text-right">Amount (BDT)</th>
                <th className="py-3 px-3">Method</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-sm">
                    No direct payment records found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((dp) => (
                  <tr key={dp.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-3 px-3.5 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                      {formatToSheetDate(dp.date)}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-200">
                      {dp.paidBy}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-100 flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-[9px]">
                        {dp.paidTo.charAt(0)}
                      </div>
                      {dp.paidTo}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 whitespace-nowrap">
                        {dp.category}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {dp.project}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-purple-300 whitespace-nowrap">
                      {formatBDT(dp.amount)}
                    </td>
                    <td className="py-3 px-3 text-slate-300 text-[11px]">
                      {dp.paymentMethod}
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-[11px]">
                      {dp.receiptLink ? (
                        <a
                          href={dp.receiptLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-400 hover:underline"
                        >
                          <span>{dp.reference || 'Receipt'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        dp.reference || '—'
                      )}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(dp)}
                          title="Edit payment"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(dp)}
                          title="Delete payment"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile & Tablet Card View */}
      <div className="lg:hidden space-y-3">
        {filteredPayments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm bg-slate-900/60 rounded-2xl border border-slate-800">
            No direct payment records found.
          </div>
        ) : (
          filteredPayments.map((dp) => (
            <div
              key={dp.id}
              className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-1.5">
                    <span>{dp.paidTo}</span>
                    <span className="text-xs text-slate-400 font-normal">
                      (from {dp.paidBy})
                    </span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                    {formatToSheetDate(dp.date)} • {dp.paymentMethod}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-purple-400 text-sm sm:text-base">
                    {formatBDT(dp.amount)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {dp.category}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {dp.project}
                </span>
                {dp.reference && (
                  <span className="text-[10px] text-slate-300 font-medium">
                    📌 {dp.reference}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                {dp.receiptLink ? (
                  <a
                    href={dp.receiptLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:underline"
                  >
                    <span>View Receipt</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEdit(dp)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(dp)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
