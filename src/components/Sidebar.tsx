import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Settings,
  Trash2,
  Edit2,
  Check,
  X,
  Moon,
  Sun,
  ShieldCheck,
  Globe,
  AppWindow,
} from 'lucide-react';
import { Conversation, AppSettings, AppView } from '../types';
import { BrandLogo } from './BrandLogo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  onOpenSettings: () => void;
  settings: AppSettings;
  onToggleTheme: () => void;
  backendConnected?: boolean;
  activeView: AppView;
  onSelectView: (view: AppView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onRenameConversation,
  onDeleteConversation,
  onOpenSettings,
  settings,
  onToggleTheme,
  backendConnected,
  activeView,
  onSelectView,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Group conversations by timeframe
  const filteredAndGrouped = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const filtered = conversations.filter((c) => {
      if (!q) return true;
      if (c.title.toLowerCase().includes(q)) return true;
      return c.messages.some((m) => m.content.toLowerCase().includes(q));
    });

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const today: Conversation[] = [];
    const yesterday: Conversation[] = [];
    const last7Days: Conversation[] = [];
    const older: Conversation[] = [];

    for (const conv of filtered) {
      const diff = now - conv.updatedAt;
      if (diff < oneDay) {
        today.push(conv);
      } else if (diff < oneDay * 2) {
        yesterday.push(conv);
      } else if (diff < oneDay * 7) {
        last7Days.push(conv);
      } else {
        older.push(conv);
      }
    }

    return [
      { label: 'Today', items: today },
      { label: 'Yesterday', items: yesterday },
      { label: 'Previous 7 Days', items: last7Days },
      { label: 'Older', items: older },
    ].filter((group) => group.items.length > 0);
  }, [conversations, searchQuery]);

  const startEditing = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditingTitle(conv.title);
  };

  const saveEditing = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editingTitle.trim()) {
      onRenameConversation(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEditing = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingId(null);
  };

  const confirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteConversation(id);
    setDeletingId(null);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 sm:w-80 flex flex-col bg-slate-900 border-r border-slate-800 text-slate-200 transition-transform duration-200 ease-out h-full overflow-hidden select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header with Safe Area Spacing */}
        <div className="pt-safe px-4 pb-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/95">
          <BrandLogo size="sm" showText withTag />
          <button
            onClick={onClose}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls: New Chat & Search */}
        <div className="p-3 space-y-2">
          {/* New Chat Button */}
          <button
            type="button"
            onClick={() => {
              onSelectView('chat');
              onNewConversation();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-sm shadow-sm transition-all active:scale-[0.98] min-h-[44px]"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Chat</span>
            </div>
            <span className="text-[11px] font-mono opacity-80 bg-black/20 px-1.5 py-0.5 rounded">
              $0 Mode
            </span>
          </button>

          {/* Tools Navigation Section */}
          <div className="pt-1 pb-1 space-y-1 border-t border-b border-slate-800/80">
            <div className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Workspace Tools
            </div>

            <button
              type="button"
              onClick={() => {
                onSelectView('chat');
                if (window.innerWidth < 768) onClose();
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors min-h-[44px] ${
                activeView === 'chat'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <MessageSquare className={`w-4 h-4 ${activeView === 'chat' ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>Chat Assistant</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectView('website_builder');
                if (window.innerWidth < 768) onClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors min-h-[44px] ${
                activeView === 'website_builder'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Globe className={`w-4 h-4 ${activeView === 'website_builder' ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>Build Website</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                HTML/CSS
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectView('webapp_builder');
                if (window.innerWidth < 768) onClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors min-h-[44px] ${
                activeView === 'webapp_builder'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AppWindow className={`w-4 h-4 ${activeView === 'webapp_builder' ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>Build Web App</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Vanilla JS
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative pt-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 mt-0.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full pl-9 pr-7 py-2 text-sm rounded-xl bg-slate-800/70 border border-slate-700/60 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white mt-0.5"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4">
          {filteredAndGrouped.length === 0 ? (
            <div className="py-8 px-4 text-center">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
              <p className="text-xs text-slate-400 font-medium">
                {searchQuery ? 'No matching conversations' : 'No conversations yet'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-xs text-emerald-400 hover:underline min-h-[44px] inline-flex items-center"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            filteredAndGrouped.map((group) => (
              <div key={group.label} className="space-y-1">
                <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {group.label}
                </div>
                {group.items.map((conv) => {
                  const isActive = conv.id === activeConversationId;
                  const isEditingThis = editingId === conv.id;
                  const isDeletingThis = deletingId === conv.id;

                  if (isEditingThis) {
                    return (
                      <form
                        key={conv.id}
                        onSubmit={(e) => saveEditing(conv.id, e)}
                        className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-800 border border-emerald-500/50"
                      >
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          autoFocus
                          className="flex-1 bg-transparent text-xs text-white px-2 py-1 focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="p-1 text-emerald-400 hover:text-emerald-300"
                          aria-label="Save title"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="p-1 text-slate-400 hover:text-white"
                          aria-label="Cancel editing"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </form>
                    );
                  }

                  if (isDeletingThis) {
                    return (
                      <div
                        key={conv.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 animate-in fade-in"
                      >
                        <span className="truncate pr-1">Delete chat?</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => confirmDelete(conv.id, e)}
                            className="px-2 py-1 bg-rose-600 text-white rounded font-medium hover:bg-rose-700"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingId(null);
                            }}
                            className="px-2 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        onSelectView('chat');
                        onSelectConversation(conv.id);
                        if (window.innerWidth < 768) onClose();
                      }}
                      className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs font-medium transition-colors min-h-[44px] ${
                        isActive
                          ? 'bg-slate-800 text-white font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <span className="truncate">{conv.title || 'Untitled Chat'}</span>
                      </div>

                      {/* Action buttons on hover/touch */}
                      <div className={`flex items-center gap-1 shrink-0 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                        <button
                          type="button"
                          onClick={(e) => startEditing(conv, e)}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700/60"
                          aria-label="Rename conversation"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingId(conv.id);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-700/60"
                          aria-label="Delete conversation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer Area with Safe Area Inset for iPhone 11 */}
        <div className="pb-safe p-3 border-t border-slate-800 bg-slate-900/95 space-y-2">
          {/* Status Badge */}
          <div className="px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className={`w-3.5 h-3.5 ${backendConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span>{backendConnected ? 'AI Backend Online' : 'AI Not Connected'}</span>
            </div>
            <span className="text-[10px] text-slate-500">{backendConnected ? 'Gemini 3.1' : 'Offline'}</span>
          </div>

          {/* Quick Controls: Theme Toggle & Settings Modal */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 text-xs font-medium min-h-[44px] transition-colors"
              aria-label="Toggle theme"
            >
              {settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
              <span>{settings.theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenSettings();
                if (window.innerWidth < 768) onClose();
              }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 text-xs font-medium min-h-[44px] transition-colors"
              aria-label="Open settings"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
