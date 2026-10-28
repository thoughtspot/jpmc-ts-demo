// Host-side 3-level tree filter for the Analytics tab:
// Rep Segment → Rep Name → Cadence Name. Options are fetched from the model via
// searchdata; the selection is collapsed into per-level value sets which the tab
// pushes to the liveboard as runtime filters.
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight, ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchSegmentRepHierarchy, SegmentNode } from '../lib/thoughtspot';

/** Selection collapsed into per-level value sets for runtime filters. */
export interface HierarchySelection {
  segments: string[];
  reps: string[];
  cadences: string[];
}

interface Props {
  onApply: (selection: HierarchySelection) => void;
}

const SEP = '||';
const leafKey = (s: string, r: string, c: string) => `${s}${SEP}${r}${SEP}${c}`;

type RepLike = { rep: string; cadences: string[] };

export default function RepHierarchyFilter({ onApply }: Props) {
  const { username, password } = useAuth();
  const [open, setOpen] = useState(false);
  const [nodes, setNodes] = useState<SegmentNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [expSeg, setExpSeg] = useState<Set<string>>(new Set());
  const [expRep, setExpRep] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set()); // leaf keys
  const [appliedCount, setAppliedCount] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        setNodes(await fetchSegmentRepHierarchy(username, password));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load filter options.');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const segLeaves = (n: SegmentNode) =>
    n.reps.flatMap((r) => r.cadences.map((c) => leafKey(n.segment, r.rep, c)));
  const repLeaves = (seg: string, r: RepLike) => r.cadences.map((c) => leafKey(seg, r.rep, c));
  const allLeaves = useMemo(() => nodes.flatMap(segLeaves), [nodes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return nodes;
    return nodes
      .map((n) => {
        const segMatch = n.segment.toLowerCase().includes(q);
        const reps = n.reps
          .map((r) => {
            const repMatch = segMatch || r.rep.toLowerCase().includes(q);
            const cadences = repMatch ? r.cadences : r.cadences.filter((c) => c.toLowerCase().includes(q));
            return repMatch || cadences.length ? { rep: r.rep, cadences } : null;
          })
          .filter((r): r is RepLike => r != null);
        return segMatch || reps.length ? { segment: n.segment, reps } : null;
      })
      .filter((n): n is SegmentNode => n != null);
  }, [nodes, query]);

  function nodeState(keys: string[]): 'none' | 'some' | 'all' {
    if (keys.length === 0) return 'none';
    const sel = keys.filter((k) => selected.has(k)).length;
    if (sel === 0) return 'none';
    return sel === keys.length ? 'all' : 'some';
  }
  function toggleKeys(keys: string[]) {
    const all = nodeState(keys) === 'all';
    setSelected((p) => {
      const s = new Set(p);
      keys.forEach((k) => (all ? s.delete(k) : s.add(k)));
      return s;
    });
  }
  function toggleLeaf(k: string) {
    setSelected((p) => {
      const s = new Set(p);
      s.has(k) ? s.delete(k) : s.add(k);
      return s;
    });
  }

  const allSelected = allLeaves.length > 0 && allLeaves.every((k) => selected.has(k));

  function deriveSelection(): HierarchySelection {
    const segments = new Set<string>();
    const reps = new Set<string>();
    const cadences = new Set<string>();
    for (const key of selected) {
      const [s, r, c] = key.split(SEP);
      segments.add(s);
      reps.add(r);
      cadences.add(c);
    }
    return { segments: [...segments], reps: [...reps], cadences: [...cadences] };
  }

  function apply() {
    onApply(deriveSelection());
    setAppliedCount(selected.size);
    setOpen(false);
  }
  function clearAll() {
    setSelected(new Set());
    onApply({ segments: [], reps: [], cadences: [] });
    setAppliedCount(0);
    setOpen(false);
  }

  const label =
    appliedCount === 0
      ? 'All segments & cadences'
      : `${appliedCount} cadence${appliedCount === 1 ? '' : 's'} selected`;

  return (
    <div className="sl-hfilter" ref={rootRef}>
      <button className="sl-hfilter-trigger" onClick={() => setOpen((o) => !o)}>
        <SlidersHorizontal size={15} />
        <span>{label}</span>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>

      {open && (
        <div className="sl-hfilter-panel">
          <div className="sl-hfilter-search">
            <Search size={15} />
            <input
              placeholder="Search segments, reps or cadences…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery('')} aria-label="Clear search">
                <X size={13} />
              </button>
            )}
          </div>

          {loading && <div className="sl-hfilter-state">Loading…</div>}
          {error && <div className="sl-hfilter-state sl-hfilter-error">{error}</div>}

          {!loading && !error && (
            <>
              <label className="sl-tree-row sl-tree-all">
                <input type="checkbox" checked={allSelected} onChange={() => toggleKeys(allLeaves)} />
                <span>Select all</span>
              </label>

              <div className="sl-tree">
                {filtered.map((n) => {
                  const sKeys = segLeaves(n);
                  const sState = nodeState(sKeys);
                  const sOpen = expSeg.has(n.segment) || !!query;
                  return (
                    <div key={n.segment}>
                      <div className="sl-tree-row sl-tree-l1">
                        <button
                          className="sl-tree-caret"
                          onClick={() =>
                            setExpSeg((p) => {
                              const s = new Set(p);
                              s.has(n.segment) ? s.delete(n.segment) : s.add(n.segment);
                              return s;
                            })
                          }
                        >
                          {sOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                        <input
                          type="checkbox"
                          checked={sState === 'all'}
                          ref={(el) => el && (el.indeterminate = sState === 'some')}
                          onChange={() => toggleKeys(sKeys)}
                        />
                        <span className="sl-tree-l1-name">{n.segment}</span>
                      </div>

                      {sOpen &&
                        n.reps.map((r) => {
                          const rKeys = repLeaves(n.segment, r);
                          const rState = nodeState(rKeys);
                          const rId = `${n.segment}${SEP}${r.rep}`;
                          const rOpen = expRep.has(rId) || !!query;
                          return (
                            <div key={rId}>
                              <div className="sl-tree-row sl-tree-l2">
                                <button
                                  className="sl-tree-caret"
                                  onClick={() =>
                                    setExpRep((p) => {
                                      const s = new Set(p);
                                      s.has(rId) ? s.delete(rId) : s.add(rId);
                                      return s;
                                    })
                                  }
                                >
                                  {rOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>
                                <input
                                  type="checkbox"
                                  checked={rState === 'all'}
                                  ref={(el) => el && (el.indeterminate = rState === 'some')}
                                  onChange={() => toggleKeys(rKeys)}
                                />
                                <span>{r.rep}</span>
                              </div>
                              {rOpen &&
                                r.cadences.map((c) => {
                                  const k = leafKey(n.segment, r.rep, c);
                                  return (
                                    <label key={k} className="sl-tree-row sl-tree-l3">
                                      <input
                                        type="checkbox"
                                        checked={selected.has(k)}
                                        onChange={() => toggleLeaf(k)}
                                      />
                                      <span>{c}</span>
                                    </label>
                                  );
                                })}
                            </div>
                          );
                        })}
                    </div>
                  );
                })}
                {filtered.length === 0 && <div className="sl-hfilter-state">No matches</div>}
              </div>

              <div className="sl-hfilter-actions">
                <button className="sl-hfilter-clear" onClick={clearAll}>
                  Clear
                </button>
                <button className="sl-hfilter-apply" onClick={apply}>
                  Apply
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
