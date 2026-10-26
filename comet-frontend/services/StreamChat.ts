import { fetch } from 'expo/fetch';

type Args = {
  conversationId: string | null;
  content: string;
  signal?: AbortSignal;
  onMeta: (m: { conversationId: string }) => void;
  onToken: (t: string) => void;
};

export async function streamChat({ conversationId, content, signal, onMeta, onToken }: Args) {
  const res = await fetch(
    'https://oxidimetric-unsolicited-natashia.ngrok-free.dev/User/askQueryFlux',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ conversationId, content }),
      signal,
    }
  );
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const handleEvent = (evt: string): boolean => {
    const data = evt
      .split(/\r?\n/)
      .filter((l) => l.startsWith('data:'))
      .map((l) => l.slice(5).replace(/^ /, ''))
      .join('\n');

    if (!data) return false;
    if (data === '[DONE]') return true;

    try {
      const parsed = JSON.parse(data);
      if (parsed.conversationId) onMeta(parsed);
      if (parsed.token) onToken(parsed.token);
    } catch {
      console.log('SSE parse skip:', data);
    }
    return false;
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    buffer += chunk;

    const events = buffer.split(/\r?\n\r?\n/);
    buffer = events.pop() ?? '';

    for (const evt of events) {
      if (handleEvent(evt)) return;
    }
  }

  if (buffer.trim()) handleEvent(buffer);
}