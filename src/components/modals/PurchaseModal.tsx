import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Link as LinkIcon } from 'lucide-react';
import {
  PurchaseExpense,
  EXPENSE_CATEGORIES,
  PROJECTS,
  TEAM_MEMBERS,
  PAYMENT_METHODS,
} from '../../types/finance';
import { formatBDT } from '../../utils/financeCalculations';
import { formatToSheetDate, toInputDateFormat } from '../../utils/dateUtils';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<PurchaseExpense>) => Promise<void>;
  initialData?: PurchaseExpense | null;
  suggestedReceiptNo?: string;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  suggestedReceiptNo = '01',
}) => {
  const isEditing = Boolean(initialData);

  const [date, setDate] = useState('');
  const [receiptNo, setReceiptNo] = useState('');
  const [component, setComponent] = useState('');
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [project, setProject] = useState<string>(PROJECTS[0]);
  const [qty, setQty] = useState(1);
  const [unitCost, setUnitCost] = useState<number | ''>('');
  const [purchasedBy, setPurchasedBy] = useState<string>(TEAM_MEMBERS[1]); // Default Prince
  const [paidBy, setPaidBy] = useState<string>(TEAM_MEMBERS[1]); // Default Prince
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_METHODS[0]); // Default Cash
  const [receiptLink, setReceiptLink] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setDate(toInputDateFormat(initialData.date));
      setReceiptNo(initialData.receiptNo || '');
      setComponent(initialData.component || '');
      setCategory(initialData.category || EXPENSE_CATEGORIES[0]);
      setProject(initialData.project || PROJECTS[0]);
      setQty(initialData.qty || 1);
      setUnitCost(initialData.unitCost || 0);
      setPurchasedBy(initialData.purchasedBy || TEAM_MEMBERS[1]);
      setPaidBy(initialData.paidBy || TEAM_MEMBERS[1]);
      setPaymentMethod(initialData.paymentMethod || 'Cash');
      setReceiptLink(initialData.receiptLink || '');
      setNotes(initialData.notes || '');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setReceiptNo(suggestedReceiptNo);
      setComponent('');
      setCategory('Prototype');
      setProject('Gas Detector');
      setQty(1);
      setUnitCost('');
      setPurchasedBy('Prince');
      setPaidBy('Prince');
      setPaymentMethod('Cash');
      setReceiptLink('');
      setNotes('');
    }
    setError('');
  }, [initialData, isOpen, suggestedReceiptNo]);

  if (!isOpen) return null;

  const totalCost = (Number(qty) || 0) * (Number(unitCost) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!component.trim()) {
      setError('Component / Description is required');
      return;
    }
    if (!date) {
      setError('Date is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      // Save date in exact Google Sheet format: DD-MMM-YYYY (e.g. 18-Apr-2026)
      const sheetDate = formatToSheetDate(date);
      await onSave({
        date: sheetDate,
        receiptNo: receiptNo.trim(),
        component: component.trim(),
        category,
        project,
        qty: Number(qty) || 1,
        unitCost: Number(unitCost) || 0,
        totalCost,
        purchasedBy,
        paidBy,
        paymentMethod,
        receiptLink: receiptLink.trim(),
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save purchase');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">
                {isEditing ? 'Edit Purchase Record' : 'Record New Purchase'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEditing ? 'Update transaction details' : 'Directly synced with Google Sheets'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Component Name & Receipt # */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Component / Description <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={component}
                onChange={(e) => setComponent(e.target.value)}
                placeholder="e.g. ESP 32, Monitor, Motor..."
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Receipt #</label>
              <input
                type="text"
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                placeholder="01"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          {/* Qty, Unit Cost, and Auto Total Cost preview */}
          <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-800/40 border border-slate-700/40">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">Quantity</label>
              <input
                type="number"
                min="1"
                step="any"
                value={qty}
                onChange={(e) => setQty(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">Unit Cost (BDT)</label>
              <input
                type="number"
                min="0"
                step="any"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="0"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1 text-right">
              <label className="text-[11px] font-semibold text-amber-400">Total Cost</label>
              <div className="text-sm font-bold text-amber-300 py-1 font-mono">
                {formatBDT(totalCost)}
              </div>
            </div>
          </div>

          {/* Category & Project */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Project / Allocation</label>
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {PROJECTS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Purchased By & Paid By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Purchased By</label>
              <select
                value={purchasedBy}
                onChange={(e) => setPurchasedBy(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {TEAM_MEMBERS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Paid By</label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {TEAM_MEMBERS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Method & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Date</label>
                <span className="text-[11px] font-mono text-blue-400 font-medium">
                  {formatToSheetDate(date)}
                </span>
              </div>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          {/* Receipt Link */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>Receipt Link (Drive, Imgur or Web URL)</span>
            </label>
            <input
              type="url"
              value={receiptLink}
              onChange={(e) => setReceiptLink(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Notes / Vendor</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Vendor info, model details, or notes..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Record Purchase'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
