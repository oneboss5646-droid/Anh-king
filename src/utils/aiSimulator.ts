import { Attachment } from '../types';

interface GenerationOptions {
  prompt: string;
  history: { role: 'user' | 'assistant'; content: string }[];
  attachments?: Attachment[];
  onChunk: (chunk: string) => void;
  signal?: AbortSignal;
}

export interface StreamResult {
  fullText: string;
  isError: boolean;
  errorMessage?: string;
}

/**
 * Checks backend AI connection status
 */
export async function checkBackendStatus(): Promise<{ connected: boolean; model: string | null; message: string }> {
  try {
    const res = await fetch('/api/status', { cache: 'no-store' });
    if (!res.ok) {
      return {
        connected: false,
        model: null,
        message: 'AI backend not connected',
      };
    }
    const data = await res.json();
    return data;
  } catch {
    return {
      connected: false,
      model: null,
      message: 'AI backend not connected (Server unreachable)',
    };
  }
}

/**
 * Streams real AI response from backend /api/chat.
 * If backend is not connected or returns an error, returns isError: true with a clear message.
 */
export async function streamAIResponse(options: GenerationOptions): Promise<StreamResult> {
  const { prompt, history, attachments, onChunk, signal } = options;

  let response: Response;
  try {
    response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        history,
        attachments,
      }),
      signal,
    });
  } catch (fetchErr: any) {
    if (signal?.aborted) {
      return { fullText: '', isError: false };
    }
    return {
      fullText: '',
      isError: true,
      errorMessage: 'AI backend not connected. Could not reach server.',
    };
  }

  // Handle non-200 responses
  if (!response.ok) {
    let errorDetail = 'AI backend not connected';
    try {
      const errJson = await response.json();
      errorDetail = errJson.message || errJson.error || errorDetail;
    } catch {
      // Ignore parse failure
    }
    return {
      fullText: '',
      isError: true,
      errorMessage: errorDetail,
    };
  }

  // Read SSE stream
  const reader = response.body?.getReader();
  if (!reader) {
    return {
      fullText: '',
      isError: true,
      errorMessage: 'AI backend not connected. Response stream unavailable.',
    };
  }

  const decoder = new TextDecoder('utf-8');
  let accumulated = '';
  let streamError: string | null = null;
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.slice(6);
          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.error) {
              streamError = parsed.error;
              break;
            }
            if (parsed.chunk) {
              accumulated += parsed.chunk;
              onChunk(accumulated);
            }
            if (parsed.done) {
              break;
            }
          } catch {
            // Ignore partial SSE chunk parse error
          }
        }
      }
      if (streamError) break;
    }
  } catch (readErr: any) {
    if (signal?.aborted) {
      return { fullText: accumulated, isError: false };
    }
    return {
      fullText: accumulated,
      isError: true,
      errorMessage: readErr?.message || 'Error reading AI stream',
    };
  }

  if (streamError) {
    return {
      fullText: accumulated,
      isError: true,
      errorMessage: streamError,
    };
  }

  if (!accumulated.trim()) {
    return {
      fullText: '',
      isError: true,
      errorMessage: 'No response received from AI backend.',
    };
  }

  return {
    fullText: accumulated,
    isError: false,
  };
}
