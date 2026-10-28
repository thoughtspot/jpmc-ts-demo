// Host-side date-range filter for the Analytics tab. Presets + a custom range
// produce an epoch-SECONDS window that the tab pushes to the liveboard as a
// runtime filter on the Cadence Create Date column.
import { useEffect, useRef, useState } from 'react';
import { CalendarRange, ChevronDown, ChevronRight, X } from 'lucide-react';

/** Epoch SECONDS range (either bound optional). null = no date filter. */
export interface DateSelection {
  start: number | null;
  end: number | null;
  label: string;
}

interface Props {
  onApply: (sel: DateSelection | null) => void;
}

type PresetId = 'all' | '7d' | '30d' | '90d' | '12m' | 'ytd' | 'custom';

const PRESETS: { id: PresetId; label: string }[] = [
  { id: 'all', label: 'All time' },
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: '90d', label: 'Last 90 days' },
  { id: '12m', label: 'Last 12 months' },
  { id: 'ytd', label: 'Year to date' },
  { id: 'custom', label: 'Custom range' },
];

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const endOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59).getTime();
const sec = (ms: number) => Math.floor(ms / 1000);

function presetRange(id: PresetId): { start: number | null; end: number | null } {
  const now = new Date();
  const end = sec(endOfDay(now));
  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return sec(startOfDay(d));
  };
  switch (id) {
    case '7d':
      return { start: daysAgo(7), end };
    case '30d':
      return { start: daysAgo(30), end };
    case '90d':
      return { start: daysAgo(90), end };
    case '12m': {
      const d = new Date();
      d.setFullYear(d.getFullYear() - 1);
      return { start: sec(startOfDay(d)), end };
    }
    case 'ytd':
      return { start: sec(new Date(now.getFullYear(), 0, 1).getTime()), end };
    default:
      return { start: null, end: null };
  }
}

export default function DateRangeFilter({ onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<PresetId>('all');
  const [label, setLabel] = useState('All time');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  function choosePreset(id: PresetId) {
    setActive(id);
    if (id === 'custom') return; // wait for Apply on custom inputs
    const { start, end } = presetRange(id);
    const lbl = PRESETS.find((p) => p.id === id)!.label;
    setLabel(lbl);
    setOpen(false);
    onApply(id === 'all' ? null : { start, end, label: lbl });
  }

  function applyCustom() {
    const start = from ? sec(startOfDay(new Date(from))) : null;
    const end = to ? sec(endOfDay(new Date(to))) : null;
    if (start == null && end == null) {
      setLabel('All time');
      onApply(null);
    } else {
      const lbl = `${from || '…'} → ${to || '…'}`;
      setLabel(lbl);
      onApply({ start, end, label: lbl });
    }
    setOpen(false);
  }

  return (
    <div className="sl-datefilter" ref={rootRef}>
      <button className="sl-hfilter-trigger" onClick={() => setOpen((o) => !o)}>
        <CalendarRange size={15} />
        <span>Created: {label}</span>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>

      {open && (
        <div className="sl-hfilter-panel sl-datefilter-panel">
          <div className="sl-date-presets">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                className={`sl-date-preset${active === p.id ? ' is-active' : ''}`}
                onClick={() => choosePreset(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>

          {active === 'custom' && (
            <div className="sl-date-custom">
              <label>
                <span>From</span>
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </label>
              <label>
                <span>To</span>
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </label>
              <div className="sl-hfilter-actions">
                <button
                  className="sl-hfilter-clear"
                  onClick={() => {
                    setFrom('');
                    setTo('');
                  }}
                >
                  <X size={13} /> Reset
                </button>
                <button className="sl-hfilter-apply" onClick={applyCustom}>
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
