import { Conversation, AppSettings } from '../types';

const CONVERSATIONS_KEY = 'chatgpt_6_plus_conversations_v2';
const SETTINGS_KEY = 'chatgpt_6_plus_settings_v2';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  enterToSend: true,
  soundEffects: false,
};

const INITIAL_CONVERSATION: Conversation = {
  id: 'conv_welcome_starter',
  title: 'Welcome to ChatGPT 6 Plus',
  createdAt: Date.now() - 1000 * 60 * 30,
  updatedAt: Date.now() - 1000 * 60 * 5,
  messages: [
    {
      id: 'msg_welcome_1',
      role: 'user',
      content: 'How does ChatGPT 6 Plus work on iPhone Safari?',
      timestamp: Date.now() - 1000 * 60 * 25,
    },
    {
      id: 'msg_welcome_2',
      role: 'assistant',
      content: `Welcome to **ChatGPT 6 Plus**!

This is an independent, mobile-first AI chat client engineered specifically for smartphone screens—including the **iPhone 11 on Safari**.

### Key Mobile Capabilities
- **Touch & Thumb Friendly**: Large touch targets (≥ 44px) and safe-area notch/home-bar padding.
- **Dynamic Viewport**: Full \`100dvh\` height prevents Safari URL bar jumps.
- **Auto-Zoom Prevention**: Inputs sized at 16px prevent Safari from auto-zooming when tapping to type.
- **Multi-Chat History**: Separate conversation history, search, title renaming, and deletion.
- **Honest Connection Status**: Clearly shows whether a live AI backend is connected or unavailable.

*(Disclaimer: ChatGPT 6 Plus is an independent web application and is not affiliated with or endorsed by OpenAI).*`,
      timestamp: Date.now() - 1000 * 60 * 24,
    },
  ],
};

export const loadStoredConversations = (): Conversation[] => {
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY);
    if (!raw) {
      return [INITIAL_CONVERSATION];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return [INITIAL_CONVERSATION];
  } catch (error) {
    console.warn('Could not read from localStorage, using memory default', error);
    return [INITIAL_CONVERSATION];
  }
};

export const saveStoredConversations = (conversations: Conversation[]): void => {
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.warn('Could not write conversations to localStorage:', error);
  }
};

export const loadStoredSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (error) {
    return DEFAULT_SETTINGS;
  }
};

export const saveStoredSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Could not write settings to localStorage:', error);
  }
};

export const exportConversationsAsJson = (conversations: Conversation[]): string => {
  return JSON.stringify(conversations, null, 2);
};

export const exportConversationsAsMarkdown = (conversations: Conversation[]): string => {
  return conversations
    .map((conv) => {
      const header = `# ${conv.title}\n*Created: ${new Date(conv.createdAt).toLocaleString()}*\n\n`;
      const body = conv.messages
        .map((m) => {
          const roleLabel = m.role === 'user' ? '👤 User' : '🤖 ChatGPT 6 Plus';
          return `### ${roleLabel} (${new Date(m.timestamp).toLocaleTimeString()})\n\n${m.content}\n`;
        })
        .join('\n---\n\n');
      return header + body;
    })
    .join('\n\n========================================\n\n');
};
