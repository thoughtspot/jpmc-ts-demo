import { useEffect, useRef, useState } from 'react';
import { LiveboardEmbed, useEmbedRef } from '@thoughtspot/visual-embed-sdk/react';
import { HostEvent } from '@thoughtspot/visual-embed-sdk';
import {
  LayoutGrid,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Clock,
  User,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  searchLiveboards,
  createLiveboard,
  tsCustomizations,
  LiveboardSummary,
} from '../lib/thoughtspot';
import { LIVEBOARD_EMBED_FLAGS } from '../config';
import { useTier } from '../context/TierContext';
import { BASIC_DISABLED_ACTIONS, UPGRADE_REASON } from '../lib/tierActions';
import { useTheme } from '../context/ThemeContext';
import CreateDashboardModal from '../components/CreateDashboardModal';

const Liveboard = LiveboardEmbed as any;

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; items: LiveboardSummary[] };

function formatDate(ms: number): string {
  if (!ms) return '—';
  return new Date(ms).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function MyAnalytics() {
  const { username, password } = useAuth();
  const { theme } = useTheme();
  const { tier } = useTier();
  const [state, setState] = useState<State>({ status: 'loading' });
  const [selected, setSelected] = useState<LiveboardSummary | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const embedRef = useEmbedRef<typeof LiveboardEmbed>();
  // When true, the next liveboard load auto-enters edit mode (freshly created).
  const autoEditRef = useRef(false);

  // Step 2–4: create the liveboard via REST, then embed the returned ID.
  async function handleCreate(name: string, description: string) {
    const lb = await createLiveboard(username, password, name, description);
    autoEditRef.current = true;
    setSelected({
      id: lb.id,
      name: lb.name,
      description,
      authorName: username,
      authorDisplayName: username,
      modified: Date.now(),
    });
    setCreateOpen(false);
    load(); // refresh "My Dashboards" so the new one shows on next visit
  }

  // Step 5: on an empty liveboard, LiveboardRendered never fires — use Load,
  // then trigger Edit after a short delay so ThoughtSpot's handlers are ready.
  function handleLoad() {
    if (!autoEditRef.current) return;
    autoEditRef.current = false;
    setTimeout(() => {
      try {
        embedRef.current?.trigger(HostEvent.Edit);
      } catch {
        /* ignore */
      }
    }, 1500);
  }

  function openLiveboard(lb: LiveboardSummary) {
    autoEditRef.current = false; // existing boards open in view mode
    setSelected(lb);
  }

  async function load() {
    setState({ status: 'loading' });
    try {
      const items = await searchLiveboards(username, password);
      setState({ status: 'ready', items });
    } catch (e) {
      setState({
        status: 'error',
        message:
          e instanceof Error
            ? e.message
            : 'Unable to reach the ThoughtSpot REST API.',
      });
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (selected) {
    return (
      <div className="tab-my-analytics ma-selected">
        <div className="my-analytics-toolbar">
          <button className="back-btn" onClick={() => setSelected(null)}>
            <ArrowLeft size={16} />
            Back to My Reports
          </button>
          <h1 className="page-title-inline">{selected.name}</h1>
        </div>
        <div className="liveboard-wrapper">
          <Liveboard
            key={theme}
            ref={embedRef}
            liveboardId={selected.id}
            disabledActions={tier === 'basic' ? BASIC_DISABLED_ACTIONS : []}
            disabledActionReason={UPGRADE_REASON}
            customizations={tsCustomizations(theme)}
            {...LIVEBOARD_EMBED_FLAGS}
            onLoad={handleLoad}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="tab-my-analytics">
      <div className="my-analytics-header">
        <div>
          <h1 className="page-title">My Reports</h1>
          <p className="page-subtitle">
            {state.status === 'ready'
              ? `${state.items.length} liveboard${
                  state.items.length === 1 ? '' : 's'
                } you have access to`
              : 'Liveboards you have access to in ThoughtSpot'}
          </p>
        </div>
        <div className="ma-header-actions">
          <button
            className="create-dashboard-btn"
            onClick={() => setCreateOpen(true)}
          >
            <Plus size={16} />
            Create New Dashboard
          </button>
          <button className="refresh-btn" onClick={load} title="Refresh">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {state.status === 'loading' && (
        <div className="ma-state">
          <div className="ma-spinner" />
          <p>Loading your liveboards…</p>
        </div>
      )}

      {state.status === 'error' && (
        <div className="ma-state ma-error">
          <AlertCircle size={32} />
          <p className="ma-error-title">Couldn't load your liveboards</p>
          <p className="ma-error-msg">{state.message}</p>
          <p className="ma-error-hint">
            Make sure you're signed in and that this origin is allow-listed for
            CORS on the ThoughtSpot cluster.
          </p>
          <button className="refresh-btn" onClick={load}>
            <RefreshCw size={16} /> Try again
          </button>
        </div>
      )}

      {state.status === 'ready' && state.items.length === 0 && (
        <div className="ma-state">
          <LayoutGrid size={32} />
          <p className="ma-error-title">No liveboards yet</p>
          <p className="ma-error-msg">
            You haven't authored any liveboards on this cluster.
          </p>
        </div>
      )}

      {state.status === 'ready' && state.items.length > 0 && (
        <div className="ma-grid">
          {state.items.map((lb) => (
            <button
              key={lb.id}
              className="ma-card"
              onClick={() => openLiveboard(lb)}
            >
              <div className="ma-card-icon">
                <LayoutGrid size={20} />
              </div>
              <h3 className="ma-card-title">{lb.name}</h3>
              {lb.description && <p className="ma-card-desc">{lb.description}</p>}
              <div className="ma-card-meta">
                <span className="ma-card-meta-item">
                  <Clock size={13} /> {formatDate(lb.modified)}
                </span>
                {lb.authorDisplayName && (
                  <span className="ma-card-meta-item">
                    <User size={13} /> {lb.authorDisplayName}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <CreateDashboardModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
