import React from 'react';
import { LayoutDashboard, ShoppingCart, ArrowDownLeft, Send } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'purchases' | 'inflow' | 'direct';

interface NavigationTabsProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  purchasesCount: number;
  inflowsCount: number;
  directPaymentsCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onChangeTab,
  purchasesCount,
  inflowsCount,
  directPaymentsCount,
}) => {
  const tabs = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      count: null,
    },
    {
      id: 'purchases' as ActiveTab,
      label: 'Purchases & Expenses',
      shortLabel: 'Expenses',
      icon: ShoppingCart,
      count: purchasesCount,
    },
    {
      id: 'inflow' as ActiveTab,
      label: 'Capital Inflow',
      shortLabel: 'Inflow',
      icon: ArrowDownLeft,
      count: inflowsCount,
    },
    {
      id: 'direct' as ActiveTab,
      label: 'Direct Payments',
      shortLabel: 'Direct Pay',
      icon: Send,
      count: directPaymentsCount,
    },
  ];

  return (
    <>
      {/* Desktop & Tablet Top Navigation */}
      <div className="hidden sm:block border-b border-slate-800 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onChangeTab(tab.id)}
                  className={`group relative flex items-center gap-2 py-3.5 px-4 text-xs md:text-sm font-medium border-b-2 transition-all ${
                    isActive
                      ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span
                      className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                        isActive
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Bottom Fixed Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1 safe-area-pb">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative ${
                  isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                  {tab.count !== null && tab.count > 0 && (
                    <span className="absolute -top-1 -right-2 text-[9px] px-1 bg-blue-600 text-white font-bold rounded-full min-w-3.5 text-center leading-3">
                      {tab.count}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight">
                  {tab.shortLabel || tab.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 w-6 h-0.5 bg-blue-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
