import React from 'react';
import { X, ShoppingCart, ArrowDownLeft, Send } from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: 'purchase' | 'inflow' | 'direct') => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onSelectType,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-slate-100 text-base">Add New Entry</h3>
            <p className="text-xs text-slate-400">Choose record type to add</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 pt-4">
          {/* Purchase / Expense */}
          <button
            onClick={() => {
              onClose();
              onSelectType('purchase');
            }}
            className="w-full p-4 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/50 text-left transition-all flex items-center gap-3.5 group"
          >
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:scale-105 transition-all">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm text-slate-100 group-hover:text-blue-400 transition-colors">
                Purchase / Cash Expense
              </div>
              <div className="text-xs text-slate-400">
                Components, hardware, tools, operational bills
              </div>
            </div>
          </button>

          {/* Capital Inflow */}
          <button
            onClick={() => {
              onClose();
              onSelectType('inflow');
            }}
            className="w-full p-4 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 text-left transition-all flex items-center gap-3.5 group"
          >
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:scale-105 transition-all">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm text-slate-100 group-hover:text-emerald-400 transition-colors">
                Capital Inflow
              </div>
              <div className="text-xs text-slate-400">
                Sponsor investment, funding, injected capital
              </div>
            </div>
          </button>

          {/* Direct Payment */}
          <button
            onClick={() => {
              onClose();
              onSelectType('direct');
            }}
            className="w-full p-4 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-purple-500/50 text-left transition-all flex items-center gap-3.5 group"
          >
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 group-hover:scale-105 transition-all">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm text-slate-100 group-hover:text-purple-400 transition-colors">
                Direct Payment / Salary
              </div>
              <div className="text-xs text-slate-400">
                Team monthly salaries, partner direct transfers
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
