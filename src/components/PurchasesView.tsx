import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  Edit2,
  Trash2,
  ChevronDown,
  X,
  Receipt,
  DollarSign,
} from 'lucide-react';
import {
  PurchaseExpense,
  EXPENSE_CATEGORIES,
  PROJECTS,
  TEAM_MEMBERS,
} from '../types/finance';
import { formatBDT } from '../utils/financeCalculations';
import { formatToSheetDate, parseDateFlexible } from '../utils/dateUtils';

interface PurchasesViewProps {
  purchases: PurchaseExpense[];
  onAdd: () => void;
  onEdit: (purchase: PurchaseExpense) => void;
  onDelete: (purchase: PurchaseExpense) => void;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({
  purchases,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedProject, setSelectedProject] = useState<string>('ALL');
  const [selectedPurchaser, setSelectedPurchaser] = useState<string>('ALL');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Filtered & Sorted Purchases (newest date first)
  const filteredPurchases = useMemo(() => {
    return purchases
      .filter((p) => {
        const matchesSearch =
          searchTerm === '' ||
          p.component.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.purchasedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
          selectedCategory === 'ALL' ||
          p.category.toLowerCase() === selectedCategory.toLowerCase();

        const matchesProject =
          selectedProject === 'ALL' ||
          p.project.toLowerCase() === selectedProject.toLowerCase();

        const matchesPurchaser =
          selectedPurchaser === 'ALL' ||
          p.purchasedBy.toLowerCase() === selectedPurchaser.toLowerCase();

        return matchesSearch && matchesCategory && matchesProject && matchesPurchaser;
      })
      .sort((a, b) => {
        const timeA = parseDateFlexible(a.date)?.getTime() || 0;
        const timeB = parseDateFlexible(b.date)?.getTime() || 0;
        return timeB - timeA;
      });
  }, [purchases, searchTerm, selectedCategory, selectedProject, selectedPurchaser]);

  const totalFilteredCost = useMemo(() => {
    return filteredPurchases.reduce((sum, p) => sum + (Number(p.totalCost) || 0), 0);
  }, [filteredPurchases]);

  const hasActiveFilters =
    selectedCategory !== 'ALL' ||
    selectedProject !== 'ALL' ||
    selectedPurchaser !== 'ALL' ||
    searchTerm !== '';

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setSelectedProject('ALL');
    setSelectedPurchaser('ALL');
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Purchases & Expenses
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
              {filteredPurchases.length} records
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Log, track and audit parts, components, and hardware purchases
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Summary Pill */}
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-semibold flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            <span>Total: {formatBDT(totalFilteredCost)}</span>
          </div>

          <button
            onClick={onAdd}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-600/25 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Purchase</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search component, receipt #, note, purchaser..."
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

          {/* Toggle Filter Button on Mobile */}
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="sm:hidden px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters {hasActiveFilters && '• Active'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFiltersMobile ? 'rotate-180' : ''}`} />
          </button>

          {/* Desktop Filter Dropdowns */}
          <div className="hidden sm:flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-800/80 border border-slate-700/70 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="ALL">All Categories</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-slate-800/80 border border-slate-700/70 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="ALL">All Projects</option>
              {PROJECTS.map((proj) => (
                <option key={proj} value={proj}>
                  {proj}
                </option>
              ))}
            </select>

            <select
              value={selectedPurchaser}
              onChange={(e) => setSelectedPurchaser(e.target.value)}
              className="bg-slate-800/80 border border-slate-700/70 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="ALL">All Purchasers</option>
              {TEAM_MEMBERS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all text-xs"
                title="Reset filters"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Mobile Filters */}
        {showFiltersMobile && (
          <div className="sm:hidden grid grid-cols-1 gap-2 pt-2 border-t border-slate-800">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
            >
              <option value="ALL">All Categories</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
            >
              <option value="ALL">All Projects</option>
              {PROJECTS.map((proj) => (
                <option key={proj} value={proj}>
                  {proj}
                </option>
              ))}
            </select>

            <select
              value={selectedPurchaser}
              onChange={(e) => setSelectedPurchaser(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
            >
              <option value="ALL">All Purchasers</option>
              {TEAM_MEMBERS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full py-1.5 text-center text-xs text-rose-400 hover:underline"
              >
                Reset All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/60 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-2 text-center">Receipt</th>
                <th className="py-3 px-4">Component / Description</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Project</th>
                <th className="py-3 px-2 text-right">Qty</th>
                <th className="py-3 px-3 text-right">Unit Cost</th>
                <th className="py-3 px-3.5 text-right">Total Cost</th>
                <th className="py-3 px-3">Purchased / Paid</th>
                <th className="py-3 px-2">Method</th>
                <th className="py-3 px-3">Notes</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-400 text-sm">
                    No purchase records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-3 px-3.5 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                      {formatToSheetDate(p.date)}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
                        #{p.receiptNo || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-100 max-w-xs truncate">
                      {p.component}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 whitespace-nowrap">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60 whitespace-nowrap">
                        {p.project}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right text-slate-300 font-mono">
                      {p.qty}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400 font-mono text-[11px]">
                      {p.unitCost ? formatBDT(p.unitCost) : '—'}
                    </td>
                    <td className="py-3 px-3.5 text-right font-bold text-amber-300 whitespace-nowrap">
                      {formatBDT(p.totalCost)}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="text-[11px] text-slate-200 font-medium">
                        {p.purchasedBy}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Paid: {p.paidBy}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-slate-300 text-[11px] whitespace-nowrap">
                      {p.paymentMethod}
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px] max-w-[150px] truncate">
                      {p.receiptLink ? (
                        <a
                          href={p.receiptLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-400 hover:underline"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>Link</span>
                        </a>
                      ) : (
                        p.notes || '—'
                      )}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(p)}
                          title="Edit purchase"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(p)}
                          title="Delete purchase"
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
        {filteredPurchases.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm bg-slate-900/60 rounded-2xl border border-slate-800">
            No purchase records found matching your filters.
          </div>
        ) : (
          filteredPurchases.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      #{p.receiptNo || '—'}
                    </span>
                    <h3 className="font-semibold text-slate-100 text-sm">
                      {p.component}
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                    {formatToSheetDate(p.date)} • {p.paymentMethod}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-amber-400 text-sm sm:text-base">
                    {formatBDT(p.totalCost)}
                  </span>
                  {p.qty > 1 && (
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {p.qty} × {formatBDT(p.unitCost)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {p.category}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {p.project}
                </span>
                {p.notes && (
                  <span className="text-[10px] text-slate-400 truncate max-w-[180px]">
                    📝 {p.notes}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <div className="text-[11px] text-slate-400">
                  By <strong className="text-slate-300 font-medium">{p.purchasedBy}</strong>
                  {p.paidBy !== p.purchasedBy && (
                    <span> (Paid: {p.paidBy})</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEdit(p)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(p)}
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
