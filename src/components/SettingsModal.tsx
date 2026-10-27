import React, { useState } from 'react';
import { X, Moon, Sun, Download, Trash2, Check, Smartphone, Info, Wifi, WifiOff } from 'lucide-react';
import { AppSettings, Conversation } from '../types';
import { exportConversationsAsJson, exportConversationsAsMarkdown } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  settings: AppSettings;
  conversations: Conversation[];
  onClose: () => void;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onRequestClearAll: () => void;
  backendStatus: { connected: boolean; model: string | null; message: string };
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  conversations,
  onClose,
  onUpdateSettings,
  onRequestClearAll,
  backendStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'connection' | 'data' | 'about'>('general');
  const [copiedExport, setCopiedExport] = useState(false);

  if (!isOpen) return null;

  const handleDownloadFile = (type: 'json' | 'md') => {
    const content =
      type === 'json'
        ? exportConversationsAsJson(conversations)
        : exportConversationsAsMarkdown(conversations);
    const blob = new Blob([content], {
      type: type === 'json' ? 'application/json' : 'text/markdown',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatgpt-6-plus-history-${new Date().toISOString().slice(0, 10)}.${type}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyClipboard = async () => {
    try {
      const text = exportConversationsAsMarkdown(conversations);
      await navigator.clipboard.writeText(text);
      setCopiedExport(true);
      setTimeout(() => setCopiedExport(false), 2000);
    } catch {
      // Ignore copy error
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-md max-h-[88dvh] flex flex-col bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden pb-safe"
        role="dialog"
        aria-modal="true"
      >
        <div className="sm:hidden w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-2.5" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-3 bg-slate-50 dark:bg-slate-950/40">
          {[
            { id: 'general', label: 'General' },
            { id: 'connection', label: 'AI Status' },
            { id: 'data', label: 'Data & Storage' },
            { id: 'about', label: 'About & iPhone' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors min-h-[44px] ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
          {activeTab === 'general' && (
            <div className="space-y-4">
              {/* Theme */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Interface Theme
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ ...settings, theme: 'dark' })}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border min-h-[48px] font-medium transition-all ${
                      settings.theme === 'dark'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span>Dark Mode</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ ...settings, theme: 'light' })}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border min-h-[48px] font-medium transition-all ${
                      settings.theme === 'light'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span>Light Mode</span>
                  </button>
                </div>
              </div>

              {/* Enter to Send */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-200">Enter Key Sends Message</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Press Shift+Enter for a new line</p>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ ...settings, enterToSend: !settings.enterToSend })}
                  className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors min-h-[44px] ${
                    settings.enterToSend ? 'bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                  }`}
                  aria-label="Toggle enter to send"
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow-md transform transition-transform" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'connection' && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border space-y-2 ${
                  backendStatus.connected
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-sm">
                  {backendStatus.connected ? (
                    <>
                      <Wifi className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Live AI Backend Connected</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>AI Backend Not Connected</span>
                    </>
                  )}
                </div>
                <p className="text-xs leading-relaxed opacity-90">
                  {backendStatus.connected
                    ? `Connected to ${backendStatus.model || 'Gemini 3.1 Flash Lite'}. Real AI streaming is fully active with $0 budget tier.`
                    : 'No AI model or API key is currently connected to the server. Real AI responses will be disabled until an API key is configured.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Honest Transparency Guarantee
                </p>
                <p>
                  ChatGPT 6 Plus never fakes AI responses or returns repetitive canned scripts. When the model backend is unreachable or offline, the interface explicitly displays &ldquo;AI backend not connected&rdquo; with a Retry option.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="font-semibold text-slate-900 dark:text-slate-100">Conversation Storage</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  You have <span className="font-semibold text-slate-800 dark:text-slate-200">{conversations.length}</span> saved conversation{conversations.length !== 1 ? 's' : ''} stored locally in your browser.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Export Chat History
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadFile('md')}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium min-h-[44px]"
                  >
                    <Download className="w-4 h-4 text-emerald-500" />
                    <span>Export Markdown</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadFile('json')}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium min-h-[44px]"
                  >
                    <Download className="w-4 h-4 text-cyan-500" />
                    <span>Export JSON</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleCopyClipboard}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium min-h-[44px]"
                >
                  {copiedExport ? <Check className="w-4 h-4 text-emerald-500" /> : <Download className="w-4 h-4 text-slate-400" />}
                  <span>{copiedExport ? 'Copied to Clipboard!' : 'Copy Entire History to Clipboard'}</span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-rose-500">
                  Danger Zone
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onRequestClearAll();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-medium text-xs min-h-[44px] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear All Conversations</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
                  <Info className="w-4 h-4 text-emerald-500" />
                  <span>About ChatGPT 6 Plus</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong>ChatGPT 6 Plus</strong> is an independent web application project and interface prototype. It is <strong>not</strong> an official OpenAI product and has no corporate affiliation with OpenAI.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
                  <Smartphone className="w-4 h-4 text-cyan-500" />
                  <span>iPhone 11 & Safari Instructions</span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
                  <p>To preview and run like a native iOS app on iPhone Safari:</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Open this URL in Safari on your iPhone.</li>
                    <li>Tap the <strong>Share</strong> button (box with upward arrow).</li>
                    <li>Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong>.</li>
                    <li>Launch the icon from your Home Screen for full-screen immersive chat!</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
