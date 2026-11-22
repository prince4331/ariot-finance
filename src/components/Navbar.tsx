import React from 'react';
import {
  Layers,
  RefreshCw,
  Settings,
  Plus,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';

interface NavbarProps {
  onOpenSettings: () => void;
  onOpenQuickAdd: () => void;
  onRefresh: () => void;
  isSyncing: boolean;
  isConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSettings,
  onOpenQuickAdd,
  onRefresh,
  isSyncing,
  isConnected,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  ARIOT Finance
                </span>
                {isConnected ? (
                  <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    <span>Live Sync</span>
                  </span>
                ) : (
                  <button
                    onClick={onOpenSettings}
                    title="Click to connect Google Apps Script Web App URL"
                    className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-full flex items-center gap-1 transition-colors"
                  >
                    <AlertCircle className="w-3 h-3 text-amber-400" />
                    <span>Local Mode</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Real-Time Sheet Sync & Cashflow Manager
              </p>
            </div>
          </div>

          {/* Center Connection Indicator (Desktop) */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
            {isConnected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 font-medium">Google Sheet Connected</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300 font-medium">Local Mode (Add API URL in Settings)</span>
              </>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sync Button */}
            <button
              onClick={onRefresh}
              disabled={isSyncing}
              title="Sync with Google Sheet"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 transition-all flex items-center gap-2 text-xs font-medium disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
            </button>

            {/* Quick Add Button */}
            <button
              onClick={onOpenQuickAdd}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-blue-600/25 flex items-center gap-1.5 transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Entry</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              title="Sheet Connection Settings"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/70 transition-all"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* View Raw Sheet Link */}
            <a
              href="https://docs.google.com/spreadsheets/d/14gJNHpGP0a0iuN75FcnkplXUkbHSykc3u-6J4Qcgp7I/edit?gid=1140887302#gid=1140887302"
              target="_blank"
              rel="noopener noreferrer"
              title="Open Google Spreadsheet"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/70 transition-all hidden lg:flex"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
