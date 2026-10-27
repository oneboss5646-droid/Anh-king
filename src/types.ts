export type ThemeMode = 'dark' | 'light';

export type AppView = 'chat' | 'website_builder' | 'webapp_builder';

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  previewUrl?: string;
  textContent?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isError?: boolean;
  errorMessage?: string;
  modelUsed?: string;
  attachments?: Attachment[];
  feedback?: 'thumbs-up' | 'thumbs-down' | null;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  isPinned?: boolean;
}

export interface AppSettings {
  theme: ThemeMode;
  enterToSend: boolean;
  soundEffects: boolean;
}

export type BuilderFileType = 'html' | 'css' | 'js';

export interface BuilderProject {
  id: string;
  title: string;
  type: 'website' | 'webapp';
  html: string;
  css: string;
  js: string;
  activeFile: BuilderFileType;
  promptDescription?: string;
  isAiGenerated?: boolean;
  updatedAt: number;
}
