// Standalone "Rep" dropdown filter. Fetches distinct Rep Name values and lets
// the user pick one or more; the selection is handed back to the Analytics tab,
// which pushes it to the liveboard as a runtime filter on the Rep Name column
// (RuntimeFilterOp.IN — confirmed via the SDK reference). Reuses the shared
// sl-hfilter / sl-tree styles.
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, Search, Users, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchRepNames } from '../lib/thoughtspot';

interface Props {
  /** Called with the selected rep names (empty = no filter / all reps). */
  onApply: (reps: string[]) => void;
}

export default function RepFilter({ onApply }: Props) {
  const { username, password } = useAuth();
  const [open, setOpen] = useState(false);
  const [reps, setReps] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [appliedCount, setAppliedCount] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        setReps(await fetchRepNames(username, password));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load reps.');
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? reps.filter((r) => r.toLowerCase().includes(q)) : reps;
  }, [reps, query]);

  const allSelected = reps.length > 0 && reps.every((r) => selected.has(r));

  function toggle(r: string) {
    setSelected((p) => {
      const s = new Set(p);
      s.has(r) ? s.delete(r) : s.add(r);
      return s;
    });
  }
  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(reps));
  }
  function apply() {
    const list = [...selected];
    onApply(list);
    setAppliedCount(list.length);
    setOpen(false);
  }
  function clearAll() {
    setSelected(new Set());
    onApply([]);
    setAppliedCount(0);
    setOpen(false);
  }

  const label =
    appliedCount === 0 ? 'All reps' : `${appliedCount} rep${appliedCount === 1 ? '' : 's'} selected`;

  return (
    <div className="sl-hfilter" ref={rootRef}>
      <button className="sl-hfilter-trigger" onClick={() => setOpen((o) => !o)}>
        <Users size={15} />
        <span>Rep: {label}</span>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>

      {open && (
        <div className="sl-hfilter-panel">
          <div className="sl-hfilter-search">
            <Search size={15} />
            <input
              placeholder="Search reps…"
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
                <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                <span>Select all</span>
              </label>
              <div className="sl-tree">
                {filtered.map((r) => (
                  <label key={r} className="sl-tree-row sl-tree-l1">
                    <input type="checkbox" checked={selected.has(r)} onChange={() => toggle(r)} />
                    <span className="sl-tree-l1-name">{r}</span>
                  </label>
                ))}
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
