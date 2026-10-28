// Generic single-column dropdown filter. Fetches distinct values for the first
// matching candidate column and lets the user pick one or more; the selection is
// handed back to the caller as (resolvedColumn, values) so it can push a runtime
// filter (RuntimeFilterOp.IN). Nothing is selected by default (= no filter).
// Reuses the shared sl-hfilter / sl-tree styles.
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, Search, X, type LucideIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchColumnValues } from '../lib/thoughtspot';

interface Props {
  /** Label shown on the trigger, e.g. "Year" or "Scope". */
  label: string;
  icon: LucideIcon;
  /** Candidate column names — first that returns data is used. */
  candidates: string[];
  /** Called with the resolved column + selected values (empty = show all). */
  onApply: (column: string, values: string[]) => void;
}

export default function ColumnFilter({ label, icon: Icon, candidates, onApply }: Props) {
  const { username, password } = useAuth();
  const [open, setOpen] = useState(false);
  const [column, setColumn] = useState('');
  const [values, setValues] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [appliedCount, setAppliedCount] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchColumnValues(username, password, candidates);
        setColumn(res.column);
        setValues(res.values);
      } catch (e) {
        setError(e instanceof Error ? e.message : `Failed to load ${label}.`);
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
    return q ? values.filter((v) => v.toLowerCase().includes(q)) : values;
  }, [values, query]);

  const allSelected = values.length > 0 && values.every((v) => selected.has(v));

  function toggle(v: string) {
    setSelected((p) => {
      const s = new Set(p);
      s.has(v) ? s.delete(v) : s.add(v);
      return s;
    });
  }
  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(values));
  }
  function apply() {
    const list = [...selected];
    onApply(column, list);
    setAppliedCount(list.length);
    setOpen(false);
  }
  function clearAll() {
    setSelected(new Set());
    onApply(column, []);
    setAppliedCount(0);
    setOpen(false);
  }

  const state =
    appliedCount === 0 ? 'All' : `${appliedCount} selected`;

  return (
    <div className="sl-hfilter" ref={rootRef}>
      <button className="sl-hfilter-trigger" onClick={() => setOpen((o) => !o)}>
        <Icon size={15} />
        <span>
          {label}: {state}
        </span>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>

      {open && (
        <div className="sl-hfilter-panel">
          <div className="sl-hfilter-search">
            <Search size={15} />
            <input
              placeholder={`Search ${label.toLowerCase()}…`}
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
                {filtered.map((v) => (
                  <label key={v} className="sl-tree-row sl-tree-l1">
                    <input type="checkbox" checked={selected.has(v)} onChange={() => toggle(v)} />
                    <span className="sl-tree-l1-name">{v}</span>
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
