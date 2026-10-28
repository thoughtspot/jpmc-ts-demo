import { useEffect, useRef, useState } from 'react';
import { Wand2, X, ArrowUp } from 'lucide-react';
import { BodylessConversation } from '@thoughtspot/visual-embed-sdk';
import { routeMessage, ChatTurn } from '../lib/chatbot';

interface ChatBotProps {
  /** Data model the chatbot routes analytics questions to (tab-dependent). */
  worksheetId: string;
  /** Opening greeting (tab-dependent). */
  greeting: string;
}

interface Msg {
  id: number;
  role: 'user' | 'assistant';
  text?: string;
  /** A rendered ThoughtSpot answer (from BodylessConversation). */
  container?: HTMLElement;
  loading?: boolean;
  error?: boolean;
}

let idSeq = 1;

/** Mounts a ThoughtSpot answer DOM node returned by BodylessConversation. */
function AnswerEmbed({ container }: { container: HTMLElement }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (node && container) node.appendChild(container);
    return () => {
      if (node && container && node.contains(container)) node.removeChild(container);
    };
  }, [container]);
  return <div className="chat-answer" ref={ref} />;
}

export default function ChatBot({ worksheetId, greeting }: ChatBotProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 0, role: 'assistant', text: greeting },
  ]);
  const convRef = useRef<BodylessConversation | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const firstRun = useRef(true);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 1e9, behavior: 'smooth' });
  }, [msgs, open]);

  // When the tab context changes (worksheet/greeting), start a fresh,
  // context-specific conversation against the new data model.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    convRef.current = null;
    setMsgs([{ id: idSeq++, role: 'assistant', text: greeting }]);
  }, [worksheetId, greeting]);

  function getConversation() {
    if (!convRef.current) {
      convRef.current = new BodylessConversation({ worksheetId });
    }
    return convRef.current;
  }

  const update = (id: number, patch: Partial<Msg>) =>
    setMsgs((m) => m.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  async function send() {
    const q = input.trim();
    if (!q || busy) return;
    setInput('');
    setBusy(true);

    const history: ChatTurn[] = msgs
      .filter((m) => m.text)
      .map((m) => ({ role: m.role, content: m.text as string }));

    const userMsg: Msg = { id: idSeq++, role: 'user', text: q };
    const reply: Msg = { id: idSeq++, role: 'assistant', loading: true };
    setMsgs((m) => [...m, userMsg, reply]);

    try {
      const result = await routeMessage(history, q);
      if (result.kind === 'text') {
        update(reply.id, { text: result.text, loading: false });
      } else {
        // Show the preamble while Spotter renders the answer.
        update(reply.id, { text: result.preamble, loading: true });
        const { container, error } = await getConversation().sendMessage(result.query);
        if (error || !container) {
          update(reply.id, {
            loading: false,
            error: true,
            text:
              (result.preamble ? result.preamble + '\n\n' : '') +
              'I couldn’t load that analytics result. Make sure you’re signed in to ThoughtSpot and the data model is reachable.',
          });
        } else {
          update(reply.id, { text: result.preamble, container, loading: false });
        }
      }
    } catch {
      update(reply.id, {
        loading: false,
        error: true,
        text: 'Something went wrong. Please try again.',
      });
    } finally {
      setBusy(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  if (!open) {
    return (
      <button
        className="chat-fab"
        onClick={() => setOpen(true)}
        aria-label="Open JpmorganChase AI"
      >
        <Wand2 size={22} strokeWidth={2.2} />
      </button>
    );
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="chat-title">
          <Wand2 size={18} />
          <span>JpmorganChase AI</span>
        </div>
        <button className="chat-close" onClick={() => setOpen(false)} aria-label="Close">
          <X size={18} />
        </button>
      </div>

      <div className="chat-messages" ref={scrollRef}>
        {msgs.map((m) => (
          <div key={m.id} className={`chat-msg ${m.role}`}>
            <div className={`chat-bubble ${m.error ? 'is-error' : ''}`}>
              {m.text && <p className="chat-text">{m.text}</p>}
              {m.loading && (
                <span className="chat-typing">
                  <i /> <i /> <i />
                </span>
              )}
              {m.container && <AnswerEmbed container={m.container} />}
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input-row">
        <textarea
          className="chat-input"
          rows={1}
          placeholder="Ask JpmorganChase AI…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button
          className="chat-send"
          onClick={send}
          disabled={!input.trim() || busy}
          aria-label="Send"
        >
          <ArrowUp size={18} />
        </button>
      </div>
    </div>
  );
}
