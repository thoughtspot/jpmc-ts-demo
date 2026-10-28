// Ask JpmorganChase — the custom JpmorganChase AI experience (moved here from the
// Analytics "JpmorganChase AI" modal). Left: the Spotter answer canvas with a
// branded empty-state landing (logo + worksheet sample questions) and its own
// input bar hidden. Right: a "JpmorganChase AI" expert pane that tracks the
// question history and takes follow-ups.
//
// Each question is routed (via routeMessage): general JpmorganChase questions
// (what/how/docs/business) are answered as text with documentation links here
// in the pane; data/analytics questions drive the Spotter canvas via
// HostEvent.SpotterSearch. After the 2nd question a pervasive trial modal appears.
import { useCallback, useEffect, useRef, useState } from 'react';
import { SpotterEmbed, useEmbedRef } from '@thoughtspot/visual-embed-sdk/react';
import { HostEvent } from '@thoughtspot/visual-embed-sdk';
import { Wand2, ArrowUp, PlayCircle, Sparkles, ExternalLink } from 'lucide-react';
import {
  WORKSHEET_ID,
  SPOTTER_EMBED_FLAGS,
  JpmorganChase_SAMPLE_QUESTIONS,
  JpmorganChase_TRIAL_QUESTIONS,
  TRIAL_TRIGGER,
  JpmorganChase_VIDEO_URL,
  HIDE_SPOTTER_INPUT_RULES,
} from '../config';
import { spotterCustomizations } from '../lib/thoughtspot';
import { CONTENT } from '../content';
import { FLAGS } from '../flags';
import { routeMessage, ChatTurn, DocLink, RouteResult } from '../lib/chatbot';
import { useTheme } from '../context/ThemeContext';
import JpmorganChaseLogo from '../components/JpmorganChaseLogo';
import TrialModal from '../components/TrialModal';

const Spotter = SpotterEmbed as unknown as (props: any) => JSX.Element;

interface Turn {
  role: 'user' | 'assistant';
  text: string;
  links?: DocLink[];
}

const WELCOME: Turn = {
  role: 'assistant',
  text: CONTENT.askWelcome,
};

/** Render assistant text with any raw URLs turned into clickable links. */
function renderText(text: string) {
  // Split on URLs, keeping them as their own parts (capturing group).
  const parts = text.split(/(https?:\/\/[^\s)]+)/g);
  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer">
        {part.replace(/^https?:\/\//, '')}
      </a>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export default function AskJpmorganChase() {
  const { theme } = useTheme();
  const spotterRef = useEmbedRef<typeof SpotterEmbed>();
  const bodyRef = useRef<HTMLDivElement>(null);

  const [currentQuery, setCurrentQuery] = useState('');
  const [narrative, setNarrative] = useState<Turn[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [trialOpen, setTrialOpen] = useState(false);
  // Glow the Spotter canvas ONLY while a data question is actually running
  // through Spotter (the analytics route). Not for FAQ/text answers, where
  // Spotter is never invoked. Cleared when the answer renders (onData) or by a
  // safety timeout if the embed never reports back.
  const [spotterActive, setSpotterActive] = useState(false);
  const glowTimer = useRef<number | undefined>(undefined);
  // Firing HostEvent.SpotterSearch before Spotter has registered its handler
  // silently drops it — which is why the very FIRST data question used to leave
  // the canvas blank (EmbedEvent.Load fires when the container loads, but that
  // is too early). We gate on embed.subscribedEvent(SpotterSearch), which fires
  // the moment the embedded app registers the SpotterSearch handler, and hold
  // the first query until then.
  const spotterReadyRef = useRef(false);
  const pendingQueryRef = useRef<string | null>(null);

  // Actually drives the Spotter canvas. Stable identity so it can be called
  // from both send() and the readiness flush below.
  const runSpotterQuery = useCallback(
    (query: string) => {
      try {
        spotterRef.current?.trigger(HostEvent.SpotterSearch, {
          query,
          executeSearch: true,
        });
      } catch (e) {
        console.warn('[jpmorgan-chase-ai] SpotterSearch failed:', e);
        setSpotterActive(false);
      }
    },
    [spotterRef],
  );

  // onData fires when Spotter has rendered an answer -> stop the glow. Stable
  // identity so keystrokes in the input don't re-init the embed.
  const onData = useCallback(() => {
    if (glowTimer.current) window.clearTimeout(glowTimer.current);
    setSpotterActive(false);
  }, []);

  // Readiness gate. subscribedEvent(SpotterSearch) fires once the embedded app
  // has registered the SpotterSearch handler — the earliest point a trigger is
  // guaranteed to land. Flush a query queued before that. Re-armed on theme
  // change, since key={theme} remounts the embed into a fresh (not-ready) iframe.
  useEffect(() => {
    const embed = spotterRef.current as any;
    if (!embed?.subscribedEvent) return;
    spotterReadyRef.current = false;
    const readyEvent = embed.subscribedEvent(HostEvent.SpotterSearch);
    const onReady = () => {
      spotterReadyRef.current = true;
      if (pendingQueryRef.current) {
        const q = pendingQueryRef.current;
        pendingQueryRef.current = null;
        runSpotterQuery(q);
      }
    };
    embed.on(readyEvent, onReady);
    return () => embed.off?.(readyEvent, onReady);
  }, [theme, spotterRef, runSpotterQuery]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [narrative, loading]);

  async function send(preset?: string) {
    const q = (preset ?? input).trim();
    if (!q || loading) return;
    const history: ChatTurn[] = narrative.map((t) => ({ role: t.role, content: t.text }));
    const nextCount = narrative.filter((t) => t.role === 'user').length + 1;
    setInput('');
    setNarrative((n) => [...n, { role: 'user', text: q }]);
    setLoading(true);
    try {
      // A tapped suggestion chip is always a data question -> straight to Spotter,
    // bypassing the router. Typed questions still go through routeMessage.
    const result: RouteResult = preset
      ? { kind: 'analytics', query: q, preamble: '' }
      : await routeMessage(history, q);
      if (result.kind === 'analytics') {
        // Data question → drive the Spotter canvas, note the preamble in the pane.
        setCurrentQuery(result.query);
        // Spotter is genuinely being invoked -> glow the canvas until it answers.
        setSpotterActive(true);
        if (glowTimer.current) window.clearTimeout(glowTimer.current);
        glowTimer.current = window.setTimeout(() => setSpotterActive(false), 9000);
        if (spotterReadyRef.current) {
          runSpotterQuery(result.query);
        } else {
          // Embed not ready yet (typically only on the very first question) —
          // queue it and fire the moment the SpotterSearch handler subscribes.
          pendingQueryRef.current = result.query;
        }
        if (result.preamble.trim()) {
          setNarrative((n) => [...n, { role: 'assistant', text: result.preamble }]);
        }
      } else {
        // General JpmorganChase question → answered from the knowledge base; Spotter
        // is NOT invoked, so no glow.
        setSpotterActive(false);
        setNarrative((n) => [...n, { role: 'assistant', text: result.text, links: result.links }]);
      }
    } finally {
      setLoading(false);
    }
    // Show the trial prompt exactly once — on the 3rd question, never again.
    if (FLAGS.monetize && nextCount === TRIAL_TRIGGER) setTrialOpen(true);
  }

  const askedCount = narrative.filter((t) => t.role === 'user').length;
  const lastUserIdx = narrative.map((t) => t.role).lastIndexOf('user');
  const remaining = Math.max(0, JpmorganChase_TRIAL_QUESTIONS - askedCount);

  return (
    <div className="tab-ask">
      <div className="sl-ai-page">
        {/* ---- Left: Spotter answer canvas + branded empty state ---- */}
        <div className="sl-ai-left">
          <div className={`sl-ai-canvas${spotterActive ? ' is-spotter-active' : ''}`}>
            {!currentQuery && (
              <div className="sl-ai-empty">
                <JpmorganChaseLogo className="sl-ai-empty-logo" size={58} wordmark={false} />
                <span className="sl-ai-empty-eyebrow">
                  <Sparkles size={14} /> Powered by JpmorganChase AI
                </span>
                <h2 className="sl-ai-empty-title">{CONTENT.tabs.ask}</h2>
                <p className="sl-ai-empty-sub">{CONTENT.askEmptySub}</p>
                <div className="sl-ai-empty-chips">
                  {JpmorganChase_SAMPLE_QUESTIONS.map((q) => (
                    <button key={q} className="sl-ai-empty-chip" onClick={() => send(q)}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <Spotter
              key={theme}
              ref={spotterRef}
              worksheetId={WORKSHEET_ID}
              hideSampleQuestions
              onData={onData}
              frameParams={{ width: '100%', height: '100%' }}
              customizations={spotterCustomizations(theme, HIDE_SPOTTER_INPUT_RULES)}
              {...SPOTTER_EMBED_FLAGS}
            />
          </div>
        </div>

        {/* ---- Right: JpmorganChase AI expert pane ---- */}
        <div className="sl-ai-pane">
          <div className="sl-ai-pane-header">
            <div className="sl-ai-pane-brand">
              <Wand2 size={18} />
              <span>JpmorganChase AI</span>
            </div>
          </div>

          <div className="sl-ai-pane-body" ref={bodyRef}>
            <a
              className="sl-ai-watch-video"
              href={JpmorganChase_VIDEO_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <PlayCircle size={16} /> Watch video
            </a>

            {narrative.map((t, i) => {
              if (t.role === 'assistant') {
                return (
                  <div key={i} className="sl-ai-narrative">
                    <p>{renderText(t.text)}</p>
                    {t.links && t.links.length > 0 && (
                      <div className="sl-ai-doclinks">
                        {t.links.map((l) => (
                          <a
                            key={l.url}
                            className="sl-ai-doclink"
                            href={l.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {l.label} <ExternalLink size={12} />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              const version = narrative.slice(0, i + 1).filter((x) => x.role === 'user').length;
              return (
                <div key={i} className="sl-ai-query-card">
                  <span className="sl-ai-query-badge">V{version}</span>
                  <span className="sl-ai-query-text">{t.text}</span>
                  <div className="sl-ai-query-meta">
                    <span>Data session</span>
                    {i === lastUserIdx && <span className="sl-ai-query-viewing">Viewing</span>}
                  </div>
                </div>
              );
            })}

            {loading && (
              <span className="sl-ai-typing" aria-label="Thinking">
                <i /> <i /> <i />
              </span>
            )}
          </div>

          <div className="sl-ai-pane-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask a follow up…"
            />
            <button onClick={() => send()} disabled={!input.trim() || loading} aria-label="Send">
              <ArrowUp size={17} />
            </button>
          </div>

          <div className="sl-ai-pane-footer">
            <a href="https://www.jpmorgan-chase.com/legal/privacy-notice" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
            <span>Powered by JpmorganChase</span>
          </div>
        </div>
      </div>

      <TrialModal open={trialOpen} remaining={remaining} onClose={() => setTrialOpen(false)} />
    </div>
  );
}
