import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ArrowDownLeft,
  X,
} from 'lucide-react';
import { CapitalInflow, TEAM_MEMBERS, PROJECTS } from '../types/finance';
import { formatBDT } from '../utils/financeCalculations';
import { formatToSheetDate, parseDateFlexible } from '../utils/dateUtils';

interface InflowViewProps {
  inflows: CapitalInflow[];
  onAdd: () => void;
  onEdit: (inflow: CapitalInflow) => void;
  onDelete: (inflow: CapitalInflow) => void;
}

export const InflowView: React.FC<InflowViewProps> = ({
  inflows,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContributor, setSelectedContributor] = useState<string>('ALL');
  const [selectedProject, setSelectedProject] = useState<string>('ALL');

  const filteredInflows = useMemo(() => {
    return inflows
      .filter((inf) => {
        const matchesSearch =
          searchTerm === '' ||
          inf.contributor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inf.receivedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inf.taggedFor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inf.notes.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesContributor =
          selectedContributor === 'ALL' ||
          inf.contributor.toLowerCase() === selectedContributor.toLowerCase();

        const matchesProject =
          selectedProject === 'ALL' ||
          inf.project.toLowerCase() === selectedProject.toLowerCase();

        return matchesSearch && matchesContributor && matchesProject;
      })
      .sort((a, b) => {
        const timeA = parseDateFlexible(a.date)?.getTime() || 0;
        const timeB = parseDateFlexible(b.date)?.getTime() || 0;
        return timeB - timeA;
      });
  }, [inflows, searchTerm, selectedContributor, selectedProject]);

  const totalInflowAmount = useMemo(() => {
    return filteredInflows.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  }, [filteredInflows]);

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Capital Inflow & Funding
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
              {filteredInflows.length} records
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Log investments, sponsor funds, partner contributions and capital injection
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Total Inflow: {formatBDT(totalInflowAmount)}</span>
          </div>

          <button
            onClick={onAdd}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-600/25 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Inflow</span>
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
            placeholder="Search contributor, received by, note..."
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
          value={selectedContributor}
          onChange={(e) => setSelectedContributor(e.target.value)}
          className="bg-slate-800/80 border border-slate-700/70 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="ALL">All Contributors</option>
          {TEAM_MEMBERS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="bg-slate-800/80 border border-slate-700/70 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="ALL">All Projects</option>
          {PROJECTS.map((proj) => (
            <option key={proj} value={proj}>
              {proj}
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
                <th className="py-3 px-4">Contributor</th>
                <th className="py-3 px-4">Received By</th>
                <th className="py-3 px-4 text-right">Amount (BDT)</th>
                <th className="py-3 px-4">Capital Tagged For</th>
                <th className="py-3 px-3">Project / Area</th>
                <th className="py-3 px-3">Method</th>
                <th className="py-3 px-4">Reference / Note</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredInflows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-sm">
                    No capital inflow records found.
                  </td>
                </tr>
              ) : (
                filteredInflows.map((inf) => (
                  <tr key={inf.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-3 px-3.5 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                      {formatToSheetDate(inf.date)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-100">
                      {inf.contributor}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {inf.receivedBy}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400 whitespace-nowrap">
                      {formatBDT(inf.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                        {inf.taggedFor}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {inf.project}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300 text-[11px]">
                      {inf.paymentMethod}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {inf.notes || '—'}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(inf)}
                          title="Edit inflow"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(inf)}
                          title="Delete inflow"
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
        {filteredInflows.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm bg-slate-900/60 rounded-2xl border border-slate-800">
            No capital inflow records found.
          </div>
        ) : (
          filteredInflows.map((inf) => (
            <div
              key={inf.id}
              className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-100 text-sm">
                    {inf.contributor}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                    {formatToSheetDate(inf.date)} • Received by: {inf.receivedBy}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-400 text-sm sm:text-base">
                    +{formatBDT(inf.amount)}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {inf.paymentMethod}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {inf.taggedFor}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {inf.project}
                </span>
                {inf.notes && (
                  <span className="text-[10px] text-slate-400 truncate max-w-[200px]">
                    📝 {inf.notes}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-800/80 text-xs">
                <button
                  onClick={() => onEdit(inf)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(inf)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-rose-400 hover:bg-rose-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
