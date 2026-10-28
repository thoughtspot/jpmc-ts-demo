import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LiveboardEmbed,
  SearchEmbed,
  SpotterEmbed,
  useEmbedRef,
} from '@thoughtspot/visual-embed-sdk/react';
import { HostEvent, ContextType, RuntimeFilterOp, Action } from '@thoughtspot/visual-embed-sdk';
import { Wand2, Plus, Pin, X, ChevronDown, FileSearch, MapPin, Route } from 'lucide-react';
import {
  ANALYTICS_LIVEBOARD_ID,
  WORKSHEET_ID,
  LIVEBOARD_EMBED_FLAGS,
  SPOTTER_EMBED_FLAGS,
  REGION_COLUMN_CANDIDATES,
  CORRIDOR_COLUMN_CANDIDATES,
  DATE_COLUMN,
} from '../config';
import { liveboardCustomizations, spotterCustomizations, tsCustomizations } from '../lib/thoughtspot';
import { useTheme } from '../context/ThemeContext';
import { CONTENT } from '../content';
import { FLAGS } from '../flags';
import { useTier } from '../context/TierContext';
import { BASIC_DISABLED_ACTIONS, UPGRADE_REASON } from '../lib/tierActions';
import ColumnFilter from '../components/ColumnFilter';
import DateRangeFilter, { DateSelection } from '../components/DateRangeFilter';
import PinModal from '../components/PinModal';

const Liveboard = LiveboardEmbed as unknown as (props: any) => JSX.Element;
const Search = SearchEmbed as unknown as (props: any) => JSX.Element;
const Spotter = SpotterEmbed as unknown as (props: any) => JSX.Element;

type PanelKind = 'search' | 'spotter' | null;

export default function Analytics() {
  const { theme } = useTheme();
  const { tier } = useTier();
  const [panel, setPanel] = useState<PanelKind>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const boardColRef = useRef<HTMLDivElement>(null);

  const liveboardRef = useEmbedRef<typeof LiveboardEmbed>();
  const searchRef = useEmbedRef<typeof SearchEmbed>();
  const spotterRef = useEmbedRef<typeof SpotterEmbed>();

  // ---- host-side filter selections (refs so applyFilters reads latest) ------
  // Region + Freight corridor multiselects + a Load Date range — all empty by
  // default (= no runtime filter / show all).
  const regionRef = useRef<{ column: string; values: string[] }>({ column: '', values: [] });
  const corridorRef = useRef<{ column: string; values: string[] }>({ column: '', values: [] });
  const dateRef = useRef<DateSelection | null>(null);
  const filtersRef = useRef<any[]>([]);

  function buildFilters(): any[] {
    const f: any[] = [];
    const r = regionRef.current;
    if (r.column && r.values.length)
      f.push({ columnName: r.column, operator: RuntimeFilterOp.IN, values: r.values });
    const c = corridorRef.current;
    if (c.column && c.values.length)
      f.push({ columnName: c.column, operator: RuntimeFilterOp.IN, values: c.values });
    const d = dateRef.current;
    if (d) {
      if (d.start != null && d.end != null)
        f.push({ columnName: DATE_COLUMN, operator: RuntimeFilterOp.BW_INC, values: [d.start, d.end] });
      else if (d.start != null)
        f.push({ columnName: DATE_COLUMN, operator: RuntimeFilterOp.GE, values: [d.start] });
      else if (d.end != null)
        f.push({ columnName: DATE_COLUMN, operator: RuntimeFilterOp.LE, values: [d.end] });
    }
    return f;
  }
  function applyFilters() {
    filtersRef.current = buildFilters();
    try {
      liveboardRef.current?.trigger(HostEvent.UpdateRuntimeFilters, filtersRef.current);
    } catch {
      /* readiness effect re-applies */
    }
  }
  const onRegionApply = useCallback((column: string, values: string[]) => {
    regionRef.current = { column, values };
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onCorridorApply = useCallback((column: string, values: string[]) => {
    corridorRef.current = { column, values };
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onDateApply = useCallback((sel: DateSelection | null) => {
    dateRef.current = sel;
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-apply any pending filters once the liveboard is ready to receive them.
  useEffect(() => {
    const embed = liveboardRef.current as any;
    if (!embed) return;
    let sub: any;
    try {
      sub = embed.subscribedEvent(HostEvent.UpdateRuntimeFilters);
    } catch {
      return;
    }
    const onReady = () => {
      if (filtersRef.current.length) {
        try {
          embed.trigger(HostEvent.UpdateRuntimeFilters, filtersRef.current);
        } catch {
          /* ignore */
        }
      }
    };
    embed.on(sub, onReady);
    return () => {
      try {
        embed.off(sub, onReady);
      } catch {
        /* ignore */
      }
    };
  }, [liveboardRef]);

  // ---- Add Report split -----------------------------------------------------
  const open = panel !== null;

  // Viz id of the latest Spotter answer (a conversation has many answers, so
  // pinning must identify which one). Captured from the Data event.
  const spotterVizId = useRef<string>('');
  const onSpotterData = useCallback((payload: any) => {
    const id = payload?.data?.id ?? payload?.data?.data?.id ?? payload?.data?.answerId ?? payload?.id;
    if (id) spotterVizId.current = id;
  }, []);

  // Scroll the board column to the bottom, with staggered retries so the
  // fullHeight liveboard finishes re-measuring after a reflow / new pinned tile.
  function scrollBoardToBottom() {
    const el = boardColRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }
  function scrollBottomSoon(delays: number[] = [800, 2000, 3500, 5000]) {
    delays.forEach((ms) => window.setTimeout(scrollBoardToBottom, ms));
  }

  // Opening the panel remounts the board at 40% width (key below); once it
  // re-measures, scroll to the last tile so the report area is in view.
  useEffect(() => {
    if (open) scrollBottomSoon();
  }, [open]);


  useEffect(() => {
    if (!menuOpen) return;
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [menuOpen]);

  // Pin the current answer (Search or Spotter) straight to THIS liveboard.
  // The name is collected via an in-app modal (browser prompts are invisible in
  // screen shares), then this runs the actual HostEvent.Pin.
  function pinToDashboard(name: string) {
    setPinOpen(false);
    const ref = panel === 'spotter' ? spotterRef : searchRef;
    const ctx = panel === 'spotter' ? ContextType.Spotter : ContextType.Search;
    const params: any = { liveboardId: ANALYTICS_LIVEBOARD_ID, newVizName: name };
    if (panel === 'spotter' && spotterVizId.current) params.vizId = spotterVizId.current;
    try {
      ref.current?.trigger(HostEvent.Pin, params, ctx);
      setTimeout(() => {
        try {
          liveboardRef.current?.trigger(HostEvent.Reload);
        } catch {
          /* ignore */
        }
        scrollBottomSoon([1200, 3000]);
      }, 1500);
    } catch (e) {
      console.warn('[pin] HostEvent.Pin failed:', e);
    }
  }

  return (
    <div className="tab-analytics">
      <div className="analytics-toolbar">
        <div className="analytics-toolbar-left">
          <div>
            <h1 className="page-title">Analytics</h1>
            <p className="page-subtitle">{CONTENT.analyticsSubtitle}</p>
          </div>
          <div className="analytics-filters">
            <ColumnFilter label={CONTENT.filters.primaryLabel} icon={MapPin} candidates={REGION_COLUMN_CANDIDATES} onApply={onRegionApply} />
            <ColumnFilter label={CONTENT.filters.secondaryLabel} icon={Route} candidates={CORRIDOR_COLUMN_CANDIDATES} onApply={onCorridorApply} />
            <DateRangeFilter onApply={onDateApply} />
          </div>
        </div>

        <div className="analytics-toolbar-actions">
          {FLAGS.pinning && (
          <div className="analytics-addmenu" ref={menuRef}>
            <button className="analytics-addreport-btn" onClick={() => setMenuOpen((o) => !o)}>
              <Plus size={16} /> Add Report <ChevronDown size={15} />
            </button>
            {menuOpen && (
              <div className="analytics-addmenu-panel" role="menu">
                <button onClick={() => { setPanel('search'); setMenuOpen(false); }}>
                  <FileSearch size={16} /> Report Builder
                </button>
                <button onClick={() => { setPanel('spotter'); setMenuOpen(false); }}>
                  <Wand2 size={16} /> JpmorganChase AI
                </button>
              </div>
            )}
          </div>
          )}
        </div>
      </div>

      <div className={`analytics-split${open ? ' is-split' : ''}`}>
        <div className="analytics-board-col" ref={boardColRef}>
          <div className="liveboard-wrapper">
            <Liveboard
              key={`${theme}-${open ? 'split' : 'full'}`}
              ref={liveboardRef}
              liveboardId={ANALYTICS_LIVEBOARD_ID}
              fullHeight
              disabledActions={tier === 'basic' ? BASIC_DISABLED_ACTIONS : []}
              disabledActionReason={UPGRADE_REASON}
              frameParams={{ width: '100%' }}
              customizations={liveboardCustomizations(theme)}
              {...LIVEBOARD_EMBED_FLAGS}
            />
          </div>
        </div>

        {open && (
          <div className="analytics-report-col">
            <div className="report-head">
              <span className="report-title">
                {panel === 'spotter' ? 'JpmorganChase AI' : 'Report Builder'}
              </span>
              <div className="report-head-actions">
                <button className="report-pin-btn" onClick={() => setPinOpen(true)}>
                  <Pin size={15} /> Pin to dashboard
                </button>
                <button className="report-close-btn" onClick={() => setPanel(null)} aria-label="Close">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="report-embed-fill">
              {panel === 'search' ? (
                <Search
                  key={theme}
                  ref={searchRef}
                  dataSource={WORKSHEET_ID}
                  hiddenActions={[Action.Pin]}
                  frameParams={{ width: '100%', height: '100%' }}
                  customizations={tsCustomizations(theme, true)}
                />
              ) : (
                <Spotter
                  key={theme}
                  ref={spotterRef}
                  worksheetId={WORKSHEET_ID}
                  hiddenActions={[Action.Pin]}
                  onData={onSpotterData}
                  frameParams={{ width: '100%', height: '100%' }}
                  customizations={spotterCustomizations(theme)}
                  {...SPOTTER_EMBED_FLAGS}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <PinModal
        open={pinOpen}
        onCancel={() => setPinOpen(false)}
        onConfirm={pinToDashboard}
      />
    </div>
  );
}
