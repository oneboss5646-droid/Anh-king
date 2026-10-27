import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Play,
  RotateCcw,
  Download,
  Plus,
  FileCode,
  Eye,
  Terminal,
  FolderOpen,
  Copy,
  Check,
  Smartphone,
  Monitor,
  Sparkles,
} from 'lucide-react';
import { BuilderProject, BuilderFileType } from '../types';
import { STARTER_WEBSITE, STARTER_WEBAPP, combineProjectToHtml } from '../utils/builderTemplates';

interface BuilderViewProps {
  type: 'website' | 'webapp';
  onOpenSidebar: () => void;
  onShowToast: (msg: string) => void;
}

interface ConsoleMessage {
  id: string;
  level: 'log' | 'warn' | 'error';
  message: string;
  timestamp: number;
}

export const BuilderView: React.FC<BuilderViewProps> = ({
  type,
  onOpenSidebar,
  onShowToast,
}) => {
  const [project, setProject] = useState<BuilderProject>(() =>
    type === 'website' ? { ...STARTER_WEBSITE } : { ...STARTER_WEBAPP }
  );

  const [activeTab, setActiveTab] = useState<'files' | 'code' | 'preview' | 'console'>('code');
  const [activeFile, setActiveFile] = useState<BuilderFileType>('html');
  const [previewKey, setPreviewKey] = useState<number>(0);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleMessage[]>([]);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'full'>('full');
  const [copiedCode, setCopiedCode] = useState(false);

  // Switch project when mode changes
  useEffect(() => {
    setProject(type === 'website' ? { ...STARTER_WEBSITE } : { ...STARTER_WEBAPP });
    setActiveFile('html');
    setConsoleLogs([]);
    setPreviewKey((k) => k + 1);
  }, [type]);

  // Listen for console logs posted from preview iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'PREVIEW_CONSOLE') {
        setConsoleLogs((prev) => [
          ...prev.slice(-99),
          {
            id: `log_${Date.now()}_${Math.random()}`,
            level: e.data.level || 'log',
            message: e.data.message || '',
            timestamp: e.data.timestamp || Date.now(),
          },
        ]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Update file content
  const handleContentChange = (content: string) => {
    setProject((prev) => ({
      ...prev,
      [activeFile]: content,
      updatedAt: Date.now(),
    }));
  };

  // Run / refresh preview
  const handleRunPreview = () => {
    setPreviewKey((k) => k + 1);
    setActiveTab('preview');
    onShowToast('Preview updated');
  };

  // Reset to starter
  const handleReset = () => {
    const initial = type === 'website' ? { ...STARTER_WEBSITE } : { ...STARTER_WEBAPP };
    setProject(initial);
    setPreviewKey((k) => k + 1);
    setConsoleLogs([]);
    onShowToast('Reset to default starter template');
  };

  // Export full code
  const handleExport = (format: 'html' | 'copy') => {
    const bundled = combineProjectToHtml(project);
    if (format === 'copy') {
      navigator.clipboard.writeText(bundled);
      setCopiedCode(true);
      onShowToast('Bundled code copied to clipboard');
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      const blob = new Blob([bundled], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.title.toLowerCase().replace(/\s+/g, '-')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onShowToast('Exported index.html');
    }
  };

  // Active code text
  const currentCode = project[activeFile];

  // Bundled HTML for iframe
  const bundledHtml = combineProjectToHtml(project);

  return (
    <main className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden relative">
      {/* Top Header */}
      <header className="pt-safe px-3 sm:px-6 py-2.5 flex items-center justify-between border-b border-slate-800 bg-slate-900/95 backdrop-blur-md z-30 shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-semibold text-white truncate max-w-[160px] sm:max-w-xs">
                {project.title}
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wide">
                {type === 'website' ? 'Website' : 'Web App'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              <span>Working Starter Template · $0 Mode</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRunPreview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-sm transition-all min-h-[44px] active:scale-95"
            title="Run code and update preview"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Run Preview</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            title="Reset to default starter template"
            aria-label="Reset project"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleExport('html')}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            title="Export HTML bundle"
            aria-label="Export code"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mode Info Banner */}
      <div className="px-3 sm:px-6 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <p className="truncate text-[11px] sm:text-xs">
            <span className="font-semibold text-slate-200">Local Sandbox:</span> Real editable HTML/CSS/JS with zero server execution.
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleExport('copy')}
          className="text-[11px] text-cyan-400 hover:underline shrink-0 ml-2"
        >
          {copiedCode ? 'Copied!' : 'Copy Bundle'}
        </button>
      </div>

      {/* Tabs Navigation: Files, Code, Preview, Console */}
      <div className="flex items-center justify-between px-3 sm:px-6 bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-1 sm:gap-2">
          {[
            { id: 'code', label: 'Code', icon: FileCode },
            { id: 'preview', label: 'Preview', icon: Eye },
            { id: 'files', label: 'Files', icon: FolderOpen },
            { id: 'console', label: `Console (${consoleLogs.length})`, icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors min-h-[44px] ${
                  isActive
                    ? 'border-emerald-500 text-white font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* File Switcher when on Code tab */}
        {activeTab === 'code' && (
          <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-lg border border-slate-800">
            {(['html', 'css', 'js'] as BuilderFileType[]).map((file) => (
              <button
                key={file}
                type="button"
                onClick={() => setActiveFile(file)}
                className={`px-2.5 py-1 text-xs font-mono uppercase rounded transition-colors ${
                  activeFile === file
                    ? 'bg-slate-800 text-cyan-400 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {file === 'html' ? 'index.html' : file === 'css' ? 'style.css' : 'app.js'}
              </button>
            ))}
          </div>
        )}

        {/* Device Switcher when on Preview tab */}
        {activeTab === 'preview' && (
          <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setPreviewDevice('full')}
              className={`p-1.5 rounded text-xs transition-colors ${
                previewDevice === 'full' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Full Width Preview"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('mobile')}
              className={`p-1.5 rounded text-xs transition-colors ${
                previewDevice === 'mobile' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
              title="iPhone Preview (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Workspace Workspace Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* 1. CODE TAB */}
        {activeTab === 'code' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
            <div className="px-4 py-1.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-cyan-300">
                {activeFile === 'html' ? 'index.html' : activeFile === 'css' ? 'style.css' : 'app.js'}
              </span>
              <span>{currentCode.split('\n').length} lines</span>
            </div>

            {/* Editable Code Textarea - text-base (16px) prevents iOS Safari auto-zoom! */}
            <textarea
              value={currentCode}
              onChange={(e) => handleContentChange(e.target.value)}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              className="flex-1 w-full p-4 font-mono text-base sm:text-xs leading-relaxed bg-slate-950 text-slate-100 resize-none outline-none border-none select-text focus:ring-0"
            />
          </div>
        )}

        {/* 2. PREVIEW TAB (Sandboxed iframe) */}
        {activeTab === 'preview' && (
          <div className="flex-1 flex items-center justify-center bg-slate-900 p-2 sm:p-4 overflow-hidden">
            <div
              className={`h-full transition-all duration-200 bg-white shadow-2xl rounded-xl overflow-hidden flex flex-col ${
                previewDevice === 'mobile' ? 'w-[375px] max-w-full border-4 border-slate-800' : 'w-full'
              }`}
            >
              <iframe
                key={previewKey}
                title="Sandboxed Preview"
                srcDoc={bundledHtml}
                sandbox="allow-scripts allow-modals"
                className="w-full h-full border-0 bg-white"
              />
            </div>
          </div>
        )}

        {/* 3. FILES TAB */}
        {activeTab === 'files' && (
          <div className="flex-1 overflow-y-auto p-4 max-w-md mx-auto w-full space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Project Files</p>
            {[
              {
                name: 'index.html',
                type: 'html' as BuilderFileType,
                desc: 'Markup structure & content',
                size: `${project.html.length} bytes`,
              },
              {
                name: 'style.css',
                type: 'css' as BuilderFileType,
                desc: 'Styles, layout & animations',
                size: `${project.css.length} bytes`,
              },
              {
                name: 'app.js',
                type: 'js' as BuilderFileType,
                desc: 'Client-side vanilla interactivity',
                size: `${project.js.length} bytes`,
              },
            ].map((file) => (
              <div
                key={file.name}
                onClick={() => {
                  setActiveFile(file.type);
                  setActiveTab('code');
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  activeFile === file.type
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileCode className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="text-sm font-semibold font-mono text-white">{file.name}</p>
                    <p className="text-xs text-slate-400">{file.desc}</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-500">{file.size}</span>
              </div>
            ))}
          </div>
        )}

        {/* 4. CONSOLE TAB */}
        {activeTab === 'console' && (
          <div className="flex-1 flex flex-col h-full bg-slate-950 font-mono text-xs overflow-hidden">
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400">
              <span>Preview Logs ({consoleLogs.length})</span>
              {consoleLogs.length > 0 && (
                <button
                  type="button"
                  onClick={() => setConsoleLogs([])}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Clear Console
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1 select-text">
              {consoleLogs.length === 0 ? (
                <p className="text-slate-600 italic">No console logs recorded yet. Run preview to execute script.</p>
              ) : (
                consoleLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-1.5 rounded flex items-start gap-2 ${
                      log.level === 'error'
                        ? 'bg-rose-500/15 text-rose-300'
                        : log.level === 'warn'
                        ? 'bg-amber-500/15 text-amber-300'
                        : 'text-slate-300'
                    }`}
                  >
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="font-semibold uppercase text-[10px] shrink-0">[{log.level}]</span>
                    <span className="break-all whitespace-pre-wrap">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
