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

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';

    for (const evt of events) {
      const line = evt.split('\n').find((l) => l.startsWith('data: '));
      if (!line) continue;
      const data = line.slice(6);
      if (data === '[DONE]') return;
      const parsed = JSON.parse(data);
      if (parsed.conversationId) onMeta(parsed);
      if (parsed.token) onToken(parsed.token);
    }
  }
}