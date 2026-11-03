import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { NavigationTabs, ActiveTab } from './components/NavigationTabs';
import { DashboardView } from './components/DashboardView';
import { PurchasesView } from './components/PurchasesView';
import { InflowView } from './components/InflowView';
import { DirectPaymentsView } from './components/DirectPaymentsView';

import { PurchaseModal } from './components/modals/PurchaseModal';
import { InflowModal } from './components/modals/InflowModal';
import { DirectPaymentModal } from './components/modals/DirectPaymentModal';
import { QuickAddModal } from './components/modals/QuickAddModal';
import { SettingsModal } from './components/modals/SettingsModal';

import { GoogleSheetService } from './services/googleSheetService';
import { PurchaseExpense, CapitalInflow, DirectPayment } from './types/finance';
import { INITIAL_PURCHASES, INITIAL_INFLOWS, INITIAL_DIRECT_PAYMENTS } from './data/initialData';
import { formatToSheetDate } from './utils/dateUtils';
import {
  computeDashboardMetrics,
  computeCategorySummaries,
  computeProjectSummaries,
  computeContributorSummaries,
  computeMonthlyFlow,
} from './utils/financeCalculations';
import { Plus, CheckCircle, AlertTriangle } from 'lucide-react';

export const App: React.FC = () => {
  // Data states
  const [purchases, setPurchases] = useState<PurchaseExpense[]>([]);
  const [inflows, setInflows] = useState<CapitalInflow[]>([]);
  const [directPayments, setDirectPayments] = useState<DirectPayment[]>([]);

  // UI Navigation & Modals
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);

  // Edit/Add modal states
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState<boolean>(false);
  const [editingPurchase, setEditingPurchase] = useState<PurchaseExpense | null>(null);

  const [isInflowModalOpen, setIsInflowModalOpen] = useState<boolean>(false);
  const [editingInflow, setEditingInflow] = useState<CapitalInflow | null>(null);

  const [isDirectModalOpen, setIsDirectModalOpen] = useState<boolean>(false);
  const [editingDirectPayment, setEditingDirectPayment] = useState<DirectPayment | null>(null);

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const isConnected = Boolean(GoogleSheetService.getCurrentApiUrl());

  // Initial Load
  useEffect(() => {
    const local = GoogleSheetService.loadInitialLocalData();
    setPurchases(local.purchases);
    setInflows(local.inflows);
    setDirectPayments(local.directPayments);

    if (GoogleSheetService.getCurrentApiUrl()) {
      handleSync();
    }
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const data = await GoogleSheetService.fetchRemoteData();
      if (data) {
        setPurchases(data.purchases);
        setInflows(data.inflows);
        setDirectPayments(data.directPayments);
        showToast('Synced with Google Spreadsheet successfully!');
      }
    } catch (err: any) {
      showToast(err?.message || 'Sync failed, using offline data', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const persistChanges = (
    newPurchases: PurchaseExpense[],
    newInflows: CapitalInflow[],
    newDirect: DirectPayment[]
  ) => {
    setPurchases(newPurchases);
    setInflows(newInflows);
    setDirectPayments(newDirect);
    GoogleSheetService.saveToLocal(newPurchases, newInflows, newDirect);
  };

  const nextReceiptNo = useMemo(() => {
    const numbers = purchases
      .map((p) => parseInt(p.receiptNo, 10))
      .filter((n) => !isNaN(n));
    const max = numbers.length > 0 ? Math.max(...numbers) : 0;
    return String(max + 1).padStart(2, '0');
  }, [purchases]);

  // ---------------- PURCHASES HANDLERS ----------------
  const handleSavePurchase = async (data: Partial<PurchaseExpense>) => {
    const sheetDate = formatToSheetDate(data.date || new Date());
    if (editingPurchase) {
      const updated = purchases.map((p) =>
        p.id === editingPurchase.id
          ? ({
              ...p,
              ...data,
              date: sheetDate,
              totalCost: (Number(data.qty) || 1) * (Number(data.unitCost) || 0),
            } as PurchaseExpense)
          : p
      );
      persistChanges(updated, inflows, directPayments);
      showToast('Purchase updated successfully');
      GoogleSheetService.updatePurchase(editingPurchase.rowIndex, { ...data, date: sheetDate }).catch(console.error);
    } else {
      const newRowIndex = Math.max(4, ...purchases.map((p) => p.rowIndex + 1));
      const newRecord: PurchaseExpense = {
        id: `pe-${Date.now()}`,
        rowIndex: newRowIndex,
        date: sheetDate,
        receiptNo: data.receiptNo || nextReceiptNo,
        receiptLink: data.receiptLink || '',
        purchasedBy: data.purchasedBy || 'Prince',
        paidBy: data.paidBy || 'Prince',
        component: data.component || '',
        category: data.category || 'Prototype',
        project: data.project || 'General',
        qty: Number(data.qty) || 1,
        unitCost: Number(data.unitCost) || 0,
        totalCost: (Number(data.qty) || 1) * (Number(data.unitCost) || 0),
        paymentMethod: data.paymentMethod || 'Cash',
        notes: data.notes || '',
      };
      persistChanges([newRecord, ...purchases], inflows, directPayments);
      showToast(`Purchase #${newRecord.receiptNo} recorded`);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.85 } });
      GoogleSheetService.addPurchase(newRecord).catch(console.error);
    }
  };

  const handleDeletePurchase = (purchase: PurchaseExpense) => {
    if (window.confirm(`Delete purchase "${purchase.component}" (#${purchase.receiptNo})?`)) {
      const filtered = purchases.filter((p) => p.id !== purchase.id);
      persistChanges(filtered, inflows, directPayments);
      showToast('Purchase record deleted');
      GoogleSheetService.deletePurchase(purchase.rowIndex).catch(console.error);
    }
  };

  // ---------------- CAPITAL INFLOW HANDLERS ----------------
  const handleSaveInflow = async (data: Partial<CapitalInflow>) => {
    const sheetDate = formatToSheetDate(data.date || new Date());
    if (editingInflow) {
      const updated = inflows.map((inf) =>
        inf.id === editingInflow.id ? ({ ...inf, ...data, date: sheetDate } as CapitalInflow) : inf
      );
      persistChanges(purchases, updated, directPayments);
      showToast('Capital Inflow updated');
      GoogleSheetService.updateInflow(editingInflow.rowIndex, { ...data, date: sheetDate }).catch(console.error);
    } else {
      const newRowIndex = Math.max(4, ...inflows.map((i) => i.rowIndex + 1));
      const newRecord: CapitalInflow = {
        id: `ci-${Date.now()}`,
        rowIndex: newRowIndex,
        date: sheetDate,
        contributor: data.contributor || 'Sadid Muneer Sir',
        receivedBy: data.receivedBy || 'Prince',
        amount: Number(data.amount) || 0,
        taggedFor: data.taggedFor || 'Hardware Development',
        project: data.project || 'General',
        paymentMethod: data.paymentMethod || 'Bank Transfer',
        notes: data.notes || '',
      };
      persistChanges(purchases, [newRecord, ...inflows], directPayments);
      showToast(`Capital Inflow of ${data.amount} BDT recorded`);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.85 } });
      GoogleSheetService.addInflow(newRecord).catch(console.error);
    }
  };

  const handleDeleteInflow = (inflow: CapitalInflow) => {
    if (window.confirm(`Delete inflow of ${inflow.amount} BDT from ${inflow.contributor}?`)) {
      const filtered = inflows.filter((inf) => inf.id !== inflow.id);
      persistChanges(purchases, filtered, directPayments);
      showToast('Capital Inflow record deleted');
      GoogleSheetService.deleteInflow(inflow.rowIndex).catch(console.error);
    }
  };

  // ---------------- DIRECT PAYMENTS HANDLERS ----------------
  const handleSaveDirectPayment = async (data: Partial<DirectPayment>) => {
    const sheetDate = formatToSheetDate(data.date || new Date());
    if (editingDirectPayment) {
      const updated = directPayments.map((dp) =>
        dp.id === editingDirectPayment.id ? ({ ...dp, ...data, date: sheetDate } as DirectPayment) : dp
      );
      persistChanges(purchases, inflows, updated);
      showToast('Direct payment updated');
      GoogleSheetService.updateDirectPayment(editingDirectPayment.rowIndex, { ...data, date: sheetDate }).catch(console.error);
    } else {
      const newRowIndex = Math.max(2, ...directPayments.map((dp) => dp.rowIndex + 1));
      const newRecord: DirectPayment = {
        id: `dp-${Date.now()}`,
        rowIndex: newRowIndex,
        date: sheetDate,
        paidBy: data.paidBy || 'Sadid Muneer Sir',
        paidTo: data.paidTo || 'Prince',
        category: data.category || 'Salary',
        project: data.project || 'General',
        amount: Number(data.amount) || 0,
        paymentMethod: data.paymentMethod || 'Bank Transfer',
        reference: data.reference || '',
        receiptLink: data.receiptLink || '',
      };
      persistChanges(purchases, inflows, [newRecord, ...directPayments]);
      showToast(`Payment of ${data.amount} BDT to ${newRecord.paidTo} recorded`);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.85 } });
      GoogleSheetService.addDirectPayment(newRecord).catch(console.error);
    }
  };

  const handleDeleteDirectPayment = (dp: DirectPayment) => {
    if (window.confirm(`Delete payment of ${dp.amount} BDT to ${dp.paidTo}?`)) {
      const filtered = directPayments.filter((p) => p.id !== dp.id);
      persistChanges(purchases, inflows, filtered);
      showToast('Payment record deleted');
      GoogleSheetService.deleteDirectPayment(dp.rowIndex).catch(console.error);
    }
  };

  // ---------------- BACKUP & RESET ----------------
  const handleExportJson = () => {
    const data = {
      exportDate: new Date().toISOString(),
      purchases,
      inflows,
      directPayments,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ariot-finance-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup JSON downloaded successfully');
  };

  const handleResetData = () => {
    persistChanges(INITIAL_PURCHASES, INITIAL_INFLOWS, INITIAL_DIRECT_PAYMENTS);
    showToast('Reset to original sheet default records');
  };

  // ---------------- COMPUTED METRICS ----------------
  const metrics = useMemo(
    () => computeDashboardMetrics(purchases, inflows, directPayments),
    [purchases, inflows, directPayments]
  );

  const categorySummaries = useMemo(
    () => computeCategorySummaries(purchases, directPayments),
    [purchases, directPayments]
  );

  const projectSummaries = useMemo(
    () => computeProjectSummaries(purchases, directPayments),
    [purchases, directPayments]
  );

  const contributorSummaries = useMemo(
    () => computeContributorSummaries(purchases, inflows, directPayments),
    [purchases, inflows, directPayments]
  );

  const monthlyFlow = useMemo(
    () => computeMonthlyFlow(purchases, inflows, directPayments),
    [purchases, inflows, directPayments]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-4 fade-in duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md border ${
              toast.type === 'success'
                ? 'bg-slate-900/90 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-900/90 text-rose-400 border-rose-500/30'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Top Header */}
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onRefresh={handleSync}
        isSyncing={isSyncing}
        isConnected={isConnected}
      />

      {/* Tab Navigation */}
      <NavigationTabs
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        purchasesCount={purchases.length}
        inflowsCount={inflows.length}
        directPaymentsCount={directPayments.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            metrics={metrics}
            categorySummaries={categorySummaries}
            projectSummaries={projectSummaries}
            contributorSummaries={contributorSummaries}
            monthlyFlow={monthlyFlow}
          />
        )}

        {activeTab === 'purchases' && (
          <PurchasesView
            purchases={purchases}
            onAdd={() => {
              setEditingPurchase(null);
              setIsPurchaseModalOpen(true);
            }}
            onEdit={(p) => {
              setEditingPurchase(p);
              setIsPurchaseModalOpen(true);
            }}
            onDelete={handleDeletePurchase}
          />
        )}

        {activeTab === 'inflow' && (
          <InflowView
            inflows={inflows}
            onAdd={() => {
              setEditingInflow(null);
              setIsInflowModalOpen(true);
            }}
            onEdit={(inf) => {
              setEditingInflow(inf);
              setIsInflowModalOpen(true);
            }}
            onDelete={handleDeleteInflow}
          />
        )}

        {activeTab === 'direct' && (
          <DirectPaymentsView
            directPayments={directPayments}
            onAdd={() => {
              setEditingDirectPayment(null);
              setIsDirectModalOpen(true);
            }}
            onEdit={(dp) => {
              setEditingDirectPayment(dp);
              setIsDirectModalOpen(true);
            }}
            onDelete={handleDeleteDirectPayment}
          />
        )}
      </main>

      {/* Mobile Floating Action Button (FAB) */}
      <div className="sm:hidden fixed bottom-16 right-4 z-30">
        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-600/40 flex items-center justify-center active:scale-95 transition-transform ring-4 ring-slate-950"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Modals */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSelectType={(type) => {
          if (type === 'purchase') {
            setEditingPurchase(null);
            setIsPurchaseModalOpen(true);
          } else if (type === 'inflow') {
            setEditingInflow(null);
            setIsInflowModalOpen(true);
          } else if (type === 'direct') {
            setEditingDirectPayment(null);
            setIsDirectModalOpen(true);
          }
        }}
      />

      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onSave={handleSavePurchase}
        initialData={editingPurchase}
        suggestedReceiptNo={nextReceiptNo}
      />

      <InflowModal
        isOpen={isInflowModalOpen}
        onClose={() => setIsInflowModalOpen(false)}
        onSave={handleSaveInflow}
        initialData={editingInflow}
      />

      <DirectPaymentModal
        isOpen={isDirectModalOpen}
        onClose={() => setIsDirectModalOpen(false)}
        onSave={handleSaveDirectPayment}
        initialData={editingDirectPayment}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onRefreshData={handleSync}
        onExportJson={handleExportJson}
        onResetData={handleResetData}
      />
    </div>
  );
};

export default App;
