import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Menu,
  Send,
  Square,
  Sparkles,
  Paperclip,
  Mic,
  MicOff,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  X,
  FileText,
  Plus,
  AlertCircle,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Conversation, Message, AppSettings, Attachment } from '../types';
import { BrandLogo } from './BrandLogo';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatAreaProps {
  conversation: Conversation | null;
  onSendMessage: (content: string, attachments?: Attachment[]) => void;
  onRetry: () => void;
  onStopGeneration: () => void;
  isGenerating: boolean;
  onOpenSidebar: () => void;
  onNewConversation: () => void;
  settings: AppSettings;
  onUpdateFeedback: (messageId: string, feedback: 'thumbs-up' | 'thumbs-down' | null) => void;
  onShowToast: (msg: string) => void;
  onOpenSettings: () => void;
  backendStatus: { connected: boolean; model: string | null; message: string };
  onRefreshStatus: () => void;
}

const SUGGESTED_PROMPTS = [
  {
    title: 'Code Debounce Utility',
    desc: 'TypeScript debounce with types and cancel',
    prompt: 'Write a clean, fully-typed TypeScript debounce utility function with immediate invocation and cancellation support.',
  },
  {
    title: 'Interview Follow-Up',
    desc: 'Professional email draft after an interview',
    prompt: 'Draft a polite and professional follow-up email after a job interview for a frontend engineering position.',
  },
  {
    title: 'Explain LLMs',
    desc: 'How language models work in plain terms',
    prompt: 'Explain how Large Language Models work in simple terms with an easy-to-understand analogy.',
  },
  {
    title: '3-Day Tokyo Itinerary',
    desc: 'Budget-friendly travel schedule and spots',
    prompt: 'Plan a 3-day budget itinerary for Tokyo balancing historic sites, ramen shops, and city views.',
  },
];

export const ChatArea: React.FC<ChatAreaProps> = ({
  conversation,
  onSendMessage,
  onRetry,
  onStopGeneration,
  isGenerating,
  onOpenSidebar,
  onNewConversation,
  settings,
  onUpdateFeedback,
  onShowToast,
  onOpenSettings,
  backendStatus,
  onRefreshStatus,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const isSubmittingRef = useRef<boolean>(false);
  const isNearBottomRef = useRef<boolean>(true);

  // Stop speech if new message starts generating
  useEffect(() => {
    if (isGenerating && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
  }, [isGenerating]);

  // Clean up speech on component unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Track if user is near bottom to avoid hijacking user scroll
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    isNearBottomRef.current = distanceFromBottom < 120;
  }, []);

  // Auto-scroll when new messages arrive or when near bottom
  useEffect(() => {
    if (isNearBottomRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation?.messages, isGenerating]);

  // Adjust textarea height dynamically (1 to 5 lines)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 140)}px`;
    }
  }, [inputText]);

  // Safari focus scroll adjustment
  const handleTextareaFocus = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  // Detect Web Speech API support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!speechSupported || !recognitionRef.current) {
      onShowToast('Voice dictation is not supported in this browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        onShowToast('Listening... Speak now');
      } catch {
        setIsRecording(false);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      if (file.type.startsWith('image/')) {
        reader.onload = () => {
          setAttachments((prev) => [
            ...prev,
            {
              id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              name: file.name,
              type: file.type,
              size: file.size,
              previewUrl: reader.result as string,
            },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = () => {
          setAttachments((prev) => [
            ...prev,
            {
              id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              name: file.name,
              type: file.type || 'text/plain',
              size: file.size,
              textContent: reader.result as string,
            },
          ]);
        };
        reader.readAsText(file);
      }
    }
    e.target.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Guaranteed single message submission
  const handleSend = () => {
    const trimmed = inputText.trim();
    if ((!trimmed && attachments.length === 0) || isGenerating || isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;
    onSendMessage(trimmed, attachments);
    setInputText('');
    setAttachments([]);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Release lock after dispatch
    setTimeout(() => {
      isSubmittingRef.current = false;
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (settings.enterToSend && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyMessage = async (msg: Message) => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopiedId(msg.id);
      onShowToast('Message copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      onShowToast('Could not copy message');
    }
  };

  const handleToggleListen = (msg: Message) => {
    if (!('speechSynthesis' in window)) {
      onShowToast('Text-to-speech is not supported on this device.');
      return;
    }

    // If currently speaking this message, stop it
    if (speakingMessageId === msg.id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      onShowToast('Stopped listening');
      return;
    }

    // Cancel any other running speech
    window.speechSynthesis.cancel();

    // Clean markdown: strip code blocks, inline code, links, hashes, asterisks
    const cleanText = msg.content
      .replace(/```[\s\S]*?```/g, ' [code block omitted] ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_#~>]/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    if (!cleanText) {
      onShowToast('No readable text in message');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      setSpeakingMessageId(null);
    };

    setSpeakingMessageId(msg.id);
    window.speechSynthesis.speak(utterance);
    onShowToast('Listening to response...');
  };

  const messages = conversation?.messages || [];
  const isEmpty = messages.length === 0;

  return (
    <main className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden relative">
      {/* Top Mobile & Desktop Navigation Bar */}
      <header className="pt-safe px-3 sm:px-6 py-2.5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md z-30 shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            aria-label="Open sidebar drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex flex-col overflow-hidden">
            <h1 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
              {conversation?.title || 'New Conversation'}
            </h1>
            <div className="flex items-center gap-1.5 text-[11px]">
              {backendStatus.connected ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    {backendStatus.model || 'Gemini Connected'}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    AI backend not connected
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Top Bar Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onRefreshStatus}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            title={backendStatus.connected ? 'Backend connected' : 'Check backend connection'}
            aria-label="Check backend connection"
          >
            {backendStatus.connected ? (
              <Wifi className="w-4 h-4 text-emerald-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-amber-500" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Settings</span>
          </button>

          <button
            type="button"
            onClick={onNewConversation}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            aria-label="Start new chat"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Conversation Stream */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 overscroll-y-contain"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {isEmpty ? (
          /* Welcome View */
          <div className="max-w-2xl mx-auto py-8 sm:py-16 text-center space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-center">
              <BrandLogo size="xl" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                ChatGPT 6 Plus
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Responsive mobile-first AI chat client.
                {!backendStatus.connected && (
                  <span className="block mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                    (Notice: AI backend not connected. Configure a key or provider to enable model generation.)
                  </span>
                )}
              </p>
            </div>

            {/* Suggested Prompts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4 text-left">
              {SUGGESTED_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputText(item.prompt);
                    textareaRef.current?.focus();
                  }}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-left group min-h-[64px]"
                >
                  <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Message Stream */
          <div className="max-w-3xl mx-auto space-y-6 pb-6">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              const isLastAssistant = !isUser && index === messages.length - 1;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-150`}
                >
                  {/* Assistant Avatar */}
                  {!isUser && (
                    <div className="shrink-0 mt-1">
                      <BrandLogo size="sm" />
                    </div>
                  )}

                  {/* Message Bubble Container */}
                  <div className={`max-w-[88%] sm:max-w-[80%] space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                    {/* User Attached Files Preview */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {msg.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center gap-2 p-1.5 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300"
                          >
                            {att.previewUrl ? (
                              <img src={att.previewUrl} alt={att.name} className="w-5 h-5 rounded object-cover" />
                            ) : (
                              <FileText className="w-4 h-4 text-emerald-500" />
                            )}
                            <span className="truncate max-w-[120px] font-medium">{att.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Message Bubble Body */}
                    <div
                      className={`p-3.5 sm:p-4 rounded-2xl ${
                        isUser
                          ? 'bg-emerald-600 text-white rounded-br-xs shadow-sm text-[15px]'
                          : msg.isError
                          ? 'bg-rose-500/10 border border-rose-500/30 text-rose-900 dark:text-rose-200 rounded-tl-xs'
                          : 'bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs shadow-xs'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap leading-relaxed select-text">{msg.content}</p>
                      ) : msg.isError ? (
                        /* Explicit Error / Backend Not Connected Card */
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{msg.errorMessage || 'AI backend not connected'}</span>
                          </div>
                          <p className="text-xs text-rose-700 dark:text-rose-300/90 leading-relaxed">
                            {msg.errorMessage?.includes('not connected')
                              ? 'No real AI provider or API key is currently connected to generate a response.'
                              : msg.errorMessage || 'Encountered an error while communicating with the AI service.'}
                          </p>
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={onRetry}
                              disabled={isGenerating}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors shadow-xs disabled:opacity-50"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Retry</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <MarkdownRenderer content={msg.content} />
                          {isGenerating && isLastAssistant && (
                            <span className="inline-block w-2 h-4 ml-1 bg-emerald-500 animate-pulse align-middle" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Assistant Message Actions */}
                    {!isUser && !msg.isError && msg.content && (
                      <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => copyMessage(msg)}
                            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            aria-label="Copy response"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Dedicated 'Listen' Button using Web Speech API */}
                          <button
                            type="button"
                            onClick={() => handleToggleListen(msg)}
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-medium transition-all min-h-[32px] ${
                              speakingMessageId === msg.id
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                            }`}
                            aria-label={speakingMessageId === msg.id ? 'Stop listening' : 'Listen to response out loud'}
                            title={speakingMessageId === msg.id ? 'Stop listening' : 'Listen to response'}
                          >
                            {speakingMessageId === msg.id ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Stop</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                <span>Listen</span>
                              </>
                            )}
                          </button>

                          {isLastAssistant && !isGenerating && (
                            <button
                              type="button"
                              onClick={onRetry}
                              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                              aria-label="Regenerate response"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              onUpdateFeedback(msg.id, msg.feedback === 'thumbs-up' ? null : 'thumbs-up')
                            }
                            className={`p-1 rounded transition-colors ${
                              msg.feedback === 'thumbs-up'
                                ? 'text-emerald-500'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                            }`}
                            aria-label="Good response"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateFeedback(msg.id, msg.feedback === 'thumbs-down' ? null : 'thumbs-down')
                            }
                            className={`p-1 rounded transition-colors ${
                              msg.feedback === 'thumbs-down'
                                ? 'text-rose-500'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                            }`}
                            aria-label="Poor response"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                          {backendStatus.connected ? 'Gemini 3.1 Flash Lite' : 'Offline'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Message Composer with iPhone Safe Area Padding */}
      <div className="pb-safe px-3 sm:px-6 pt-2 pb-3 bg-white/95 dark:bg-slate-950/95 border-t border-slate-200/80 dark:border-slate-800 shrink-0">
        <div className="max-w-3xl mx-auto space-y-2">
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-1">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 p-1.5 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                >
                  {att.previewUrl ? (
                    <img src={att.previewUrl} alt={att.name} className="w-5 h-5 rounded object-cover" />
                  ) : (
                    <FileText className="w-4 h-4 text-emerald-500" />
                  )}
                  <span className="truncate max-w-[120px] font-medium">{att.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(att.id)}
                    className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    aria-label="Remove attachment"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Composer Box */}
          <div className="relative flex items-end gap-2 p-2 rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent transition-all">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              multiple
              accept="text/*,image/*,.json,.md,.csv,.py,.js,.ts"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isGenerating}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors disabled:opacity-40"
              aria-label="Attach file"
              title="Attach text file or image"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* iOS Safari Input auto-zoom prevention: text-base (16px) */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleTextareaFocus}
              placeholder={isGenerating ? 'ChatGPT 6 Plus is responding...' : 'Ask ChatGPT 6 Plus anything...'}
              className="flex-1 max-h-36 py-2 px-1 text-base sm:text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
            />

            <button
              type="button"
              onClick={toggleRecording}
              disabled={isGenerating}
              className={`p-2 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors disabled:opacity-40 ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
              aria-label={isRecording ? 'Stop voice recording' : 'Start voice dictation'}
              title={isRecording ? 'Listening...' : 'Voice dictation'}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Send or Stop */}
            {isGenerating ? (
              <button
                type="button"
                onClick={onStopGeneration}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors shadow-xs"
                aria-label="Stop generation"
                title="Stop generation"
              >
                <Square className="w-4 h-4 fill-white" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                disabled={(!inputText.trim() && attachments.length === 0) || isGenerating}
                className={`p-2 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors shadow-xs ${
                  inputText.trim() || attachments.length > 0
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                }`}
                aria-label="Send message"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>

          <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
            {backendStatus.connected
              ? 'ChatGPT 6 Plus prototype · Live Gemini AI backend active.'
              : 'AI backend not connected · Prototype mode.'}
          </p>
        </div>
      </div>
    </main>
  );
};
