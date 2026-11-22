import React, { useState } from 'react';
import {
  X,
  Settings,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Download,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { GoogleSheetService } from '../../services/googleSheetService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => Promise<void>;
  onExportJson: () => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onRefreshData,
  onExportJson,
  onResetData,
}) => {
  const [apiUrl, setApiUrl] = useState(GoogleSheetService.getCurrentApiUrl());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'connection' | 'guide' | 'data'>('connection');

  if (!isOpen) return null;

  const handleSaveAndTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await GoogleSheetService.testConnection(apiUrl);
      GoogleSheetService.setApiUrl(apiUrl);
      await onRefreshData();
      setTestResult({
        success: true,
        message: result.message,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Connection test failed. Check your Apps Script Web App URL and permissions (Who has access: Anyone).'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      const resp = await fetch('/Code.gs');
      let code = '';
      if (resp.ok) {
        code = await resp.text();
      } else {
        code = `// Please check google-apps-script/Code.gs inside the project folder`;
      }
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch (e) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">
                Google Sheets Sync Settings
              </h3>
              <p className="text-xs text-slate-400">
                Configure live 2-way sync with your Google Spreadsheet
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

        {/* Inner Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-800/20 text-xs">
          <button
            onClick={() => setActiveTab('connection')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'connection'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Connection API
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'guide'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Setup Guide (3 Steps)
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'data'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Backup & Reset
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {activeTab === 'connection' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Target Google Sheet:</span>
                  <a
                    href="https://docs.google.com/spreadsheets/d/14gJNHpGP0a0iuN75FcnkplXUkbHSykc3u-6J4Qcgp7I/edit?gid=1140887302#gid=1140887302"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>ARIOT Finance Sheet</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-400">
                  Spreadsheet ID: <code className="text-slate-300">14gJNHpGP0a0iuN75FcnkplXUkbHSykc3u-6J4Qcgp7I</code>
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Google Apps Script Web App URL</span>
                  <span className="text-[10px] text-slate-400">(Ends with /exec)</span>
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Deploy the provided script in your spreadsheet once to get this URL. Any action in this Web UI will immediately update the spreadsheet!
                </p>
              </div>

              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                    testResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={handleSaveAndTest}
                  disabled={isTesting}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isTesting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Testing Connection...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Save & Test Live Connection</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <h4 className="font-semibold text-slate-100 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">
                    1
                  </span>
                  Open Apps Script in your Google Sheet
                </h4>
                <p className="text-[11px] text-slate-400 ml-6">
                  In your spreadsheet menu, click <strong>Extensions</strong> → <strong>Apps Script</strong>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-100 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">
                      2
                    </span>
                    Paste the API Script
                  </h4>
                  <button
                    onClick={handleCopyCode}
                    className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-[11px] font-medium border border-blue-500/30 flex items-center gap-1 transition-all"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 ml-6">
                  Delete any sample code in the editor, paste the script from <code className="text-blue-300">google-apps-script/Code.gs</code>, and press <strong>Save (Ctrl+S)</strong>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <h4 className="font-semibold text-slate-100 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">
                    3
                  </span>
                  Deploy as Web App
                </h4>
                <p className="text-[11px] text-slate-400 ml-6">
                  Click <strong>Deploy</strong> → <strong>New deployment</strong> → Select <strong>Web app</strong>.
                  <br />• Execute as: <strong>Me</strong>
                  <br />• Who has access: <strong>Anyone</strong>
                  <br />Click <strong>Deploy</strong>, copy the Web app URL, and paste it into the Connection tab above!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-3">
                <div>
                  <h4 className="font-semibold text-sm text-slate-200">
                    Export Financial Records
                  </h4>
                  <p className="text-xs text-slate-400">
                    Download full snapshot of all purchases, inflow, and direct payment records in JSON format.
                  </p>
                </div>
                <button
                  onClick={onExportJson}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-4 h-4 text-blue-400" />
                  <span>Download Backup JSON</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3">
                <div>
                  <h4 className="font-semibold text-sm text-rose-300">
                    Reset Local Cache to Sheet Defaults
                  </h4>
                  <p className="text-xs text-slate-400">
                    Restore all records to the original 29 purchases, 5 inflows, and 8 direct payments extracted from the sheet.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Reset all local data back to the sheet default records?')) {
                      onResetData();
                      onClose();
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-4 h-4 text-rose-400" />
                  <span>Reset to Sheet Seed Data</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
