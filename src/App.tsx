import { useState, useEffect, useRef, useCallback } from 'react';
import { Conversation, AppSettings, Attachment, AppView } from './types';
import {
  loadStoredConversations,
  saveStoredConversations,
  loadStoredSettings,
  saveStoredSettings,
} from './utils/storage';
import { streamAIResponse, checkBackendStatus } from './utils/aiSimulator';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { BuilderView } from './components/BuilderView';
import { SettingsModal } from './components/SettingsModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { Toast } from './components/Toast';

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>(() => loadStoredConversations());
  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    const list = loadStoredConversations();
    return list[0]?.id || 'conv_default';
  });
  const [activeView, setActiveView] = useState<AppView>('chat');
  const [settings, setSettings] = useState<AppSettings>(() => loadStoredSettings());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [clearHistoryModalOpen, setClearHistoryModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<{ connected: boolean; model: string | null; message: string }>({
    connected: false,
    model: null,
    message: 'Checking connection...',
  });

  const isGeneratingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check AI backend connection status
  const refreshBackendStatus = useCallback(async () => {
    const status = await checkBackendStatus();
    setBackendStatus(status);
  }, []);

  useEffect(() => {
    refreshBackendStatus();
  }, [refreshBackendStatus]);

  // Sync theme
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveStoredSettings(settings);
  }, [settings]);

  // Persist conversations
  useEffect(() => {
    saveStoredConversations(conversations);
  }, [conversations]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  // Retrieve current active conversation
  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || conversations[0] || null;

  // 1. Create a new conversation
  const handleNewConversation = useCallback(() => {
    const newId = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newConv: Conversation = {
      id: newId,
      title: 'New Chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
  }, []);

  // 2. Rename conversation
  const handleRenameConversation = useCallback((id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
    showToast('Conversation renamed');
  }, [showToast]);

  // 3. Delete single conversation
  const handleDeleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const remaining = prev.filter((c) => c.id !== id);
        if (remaining.length === 0) {
          const fresh: Conversation = {
            id: `conv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            title: 'New Chat',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            messages: [],
          };
          setActiveConversationId(fresh.id);
          return [fresh];
        }
        if (activeConversationId === id) {
          setActiveConversationId(remaining[0].id);
        }
        return remaining;
      });
      showToast('Conversation deleted');
    },
    [activeConversationId, showToast]
  );

  // 4. Clear all conversation history
  const handleClearAllHistory = useCallback(() => {
    const fresh: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: 'New Chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setConversations([fresh]);
    setActiveConversationId(fresh.id);
    setClearHistoryModalOpen(false);
    showToast('All conversation history cleared');
  }, [showToast]);

  // 5. Send a message (Guaranteed: single submission, loading indicator stops, try/catch/finally)
  const handleSendMessage = async (content: string, attachments?: Attachment[]) => {
    // Prevent duplicate submissions if already generating
    if (isGeneratingRef.current || !activeConversation) return;

    isGeneratingRef.current = true;
    setIsGenerating(true);

    const userMessageId = `msg_user_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const assistantMessageId = `msg_asst_${Date.now() + 1}_${Math.random().toString(36).slice(2, 6)}`;

    const userMsg = {
      id: userMessageId,
      role: 'user' as const,
      content,
      timestamp: Date.now(),
      attachments,
    };

    const initialAsstMsg = {
      id: assistantMessageId,
      role: 'assistant' as const,
      content: '',
      timestamp: Date.now() + 1,
      isError: false,
    };

    // Auto title generation on first user message
    const isFirstMessage = activeConversation.messages.length === 0;
    const newTitle = isFirstMessage
      ? content.slice(0, 32).trim() || 'Conversation'
      : activeConversation.title;

    // Append user message and empty assistant message exactly once
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversation.id) {
          return {
            ...c,
            title: newTitle,
            updatedAt: Date.now(),
            messages: [...c.messages, userMsg, initialAsstMsg],
          };
        }
        return c;
      })
    );

    const abortCtrl = new AbortController();
    abortControllerRef.current = abortCtrl;

    // Safety timeout: 40 seconds max per generation
    const timeoutId = setTimeout(() => {
      abortCtrl.abort();
    }, 40000);

    try {
      const historyForAI = activeConversation.messages
        .filter((m) => (m.role === 'user' || m.role === 'assistant') && !m.isError)
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const result = await streamAIResponse({
        prompt: content,
        history: historyForAI,
        attachments,
        signal: abortCtrl.signal,
        onChunk: (chunk) => {
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id === activeConversation.id) {
                return {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMessageId ? { ...m, content: chunk } : m
                  ),
                };
              }
              return c;
            })
          );
        },
      });

      clearTimeout(timeoutId);

      // Handle result state
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConversation.id) {
            return {
              ...c,
              messages: c.messages.map((m) => {
                if (m.id === assistantMessageId) {
                  return {
                    ...m,
                    content: result.isError ? '' : result.fullText,
                    isError: result.isError,
                    errorMessage: result.errorMessage,
                  };
                }
                return m;
              }),
            };
          }
          return c;
        })
      );
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error('Message execution error:', err);
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConversation.id) {
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMessageId
                  ? {
                      ...m,
                      isError: true,
                      errorMessage: err?.message || 'AI backend not connected or request timed out.',
                    }
                  : m
              ),
            };
          }
          return c;
        })
      );
    } finally {
      // Guaranteed stop of loading state
      clearTimeout(timeoutId);
      isGeneratingRef.current = false;
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  // 6. Retry generating last assistant response
  const handleRetry = async () => {
    if (isGeneratingRef.current || !activeConversation || activeConversation.messages.length < 2) return;

    // Find the last assistant message and previous user message
    const msgs = activeConversation.messages;
    const lastMsg = msgs[msgs.length - 1];
    if (lastMsg.role !== 'assistant') return;

    const lastUserMsg = [...msgs].reverse().find((m) => m.role === 'user');
    if (!lastUserMsg) return;

    isGeneratingRef.current = true;
    setIsGenerating(true);

    const abortCtrl = new AbortController();
    abortControllerRef.current = abortCtrl;
    const timeoutId = setTimeout(() => abortCtrl.abort(), 40000);

    // Reset last assistant message to thinking state
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversation.id) {
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === lastMsg.id ? { ...m, content: '', isError: false, errorMessage: undefined } : m
            ),
          };
        }
        return c;
      })
    );

    try {
      const historyForAI = msgs
        .slice(0, -2)
        .filter((m) => (m.role === 'user' || m.role === 'assistant') && !m.isError)
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const result = await streamAIResponse({
        prompt: lastUserMsg.content,
        history: historyForAI,
        attachments: lastUserMsg.attachments,
        signal: abortCtrl.signal,
        onChunk: (chunk) => {
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id === activeConversation.id) {
                return {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === lastMsg.id ? { ...m, content: chunk } : m
                  ),
                };
              }
              return c;
            })
          );
        },
      });

      clearTimeout(timeoutId);

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConversation.id) {
            return {
              ...c,
              messages: c.messages.map((m) => {
                if (m.id === lastMsg.id) {
                  return {
                    ...m,
                    content: result.isError ? '' : result.fullText,
                    isError: result.isError,
                    errorMessage: result.errorMessage,
                  };
                }
                return m;
              }),
            };
          }
          return c;
        })
      );
    } catch (err: any) {
      clearTimeout(timeoutId);
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConversation.id) {
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === lastMsg.id
                  ? {
                      ...m,
                      isError: true,
                      errorMessage: err?.message || 'AI backend not connected or request timed out.',
                    }
                  : m
              ),
            };
          }
          return c;
        })
      );
    } finally {
      clearTimeout(timeoutId);
      isGeneratingRef.current = false;
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  // 7. Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    isGeneratingRef.current = false;
    setIsGenerating(false);
    showToast('Generation stopped');
  };

  // 8. Update feedback
  const handleUpdateFeedback = (messageId: string, feedback: 'thumbs-up' | 'thumbs-down' | null) => {
    if (!activeConversation) return;
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversation.id) {
          return {
            ...c,
            messages: c.messages.map((m) => (m.id === messageId ? { ...m, feedback } : m)),
          };
        }
        return c;
      })
    );
    showToast(feedback ? 'Feedback recorded' : 'Feedback cleared');
  };

  // 9. Toggle Dark/Light Theme
  const handleToggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  return (
    <div className="flex h-screen h-dvh-screen w-screen overflow-hidden bg-white dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100">
      <Toast message={toastMessage} />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => setActiveConversationId(id)}
        onNewConversation={handleNewConversation}
        onRenameConversation={handleRenameConversation}
        onDeleteConversation={handleDeleteConversation}
        onOpenSettings={() => setSettingsOpen(true)}
        settings={settings}
        onToggleTheme={handleToggleTheme}
        backendConnected={backendStatus.connected}
        activeView={activeView}
        onSelectView={setActiveView}
      />

      {activeView === 'chat' ? (
        <ChatArea
          conversation={activeConversation}
          onSendMessage={handleSendMessage}
          onRetry={handleRetry}
          onStopGeneration={handleStopGeneration}
          isGenerating={isGenerating}
          onOpenSidebar={() => setSidebarOpen(true)}
          onNewConversation={handleNewConversation}
          settings={settings}
          onUpdateFeedback={handleUpdateFeedback}
          onShowToast={showToast}
          onOpenSettings={() => setSettingsOpen(true)}
          backendStatus={backendStatus}
          onRefreshStatus={refreshBackendStatus}
        />
      ) : (
        <BuilderView
          type={activeView === 'website_builder' ? 'website' : 'webapp'}
          onOpenSidebar={() => setSidebarOpen(true)}
          onShowToast={showToast}
        />
      )}

      <SettingsModal
        isOpen={settingsOpen}
        settings={settings}
        conversations={conversations}
        onClose={() => setSettingsOpen(false)}
        onUpdateSettings={(newSettings) => {
          setSettings(newSettings);
          showToast('Settings saved');
        }}
        onRequestClearAll={() => setClearHistoryModalOpen(true)}
        backendStatus={backendStatus}
      />

      <ConfirmationModal
        isOpen={clearHistoryModalOpen}
        title="Clear All Conversation History"
        message="Are you sure you want to delete all saved conversations? This action cannot be undone."
        confirmLabel="Clear All Chats"
        cancelLabel="Keep Chats"
        danger={true}
        onConfirm={handleClearAllHistory}
        onCancel={() => setClearHistoryModalOpen(false)}
      />
    </div>
  );
}
