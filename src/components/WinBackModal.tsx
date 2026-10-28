import { useEffect, useState } from 'react';
import { X, Zap, Check, RefreshCw } from 'lucide-react';
import { SignalContext } from '../lib/signalContext';

const CADENCE_OPTIONS = [
  'Win-Back Cadence — High Priority',
  'Re-engagement — 7-day Sprint',
  'Executive Win-Back',
];

interface Props {
  open: boolean;
  context: SignalContext | null;
  onClose: () => void;
}

export default function WinBackModal({ open, context, onClose }: Props) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [cadence, setCadence] = useState(CADENCE_OPTIONS[0]);
  const [assigned, setAssigned] = useState(false);

  // Reset selection/state whenever a new signal is opened.
  useEffect(() => {
    if (context) {
      setSelected(Object.fromEntries(context.contacts.map((c) => [c.id, true])));
      setCadence(CADENCE_OPTIONS[0]);
      setAssigned(false);
    }
  }, [context]);

  if (!open || !context) return null;

  const count = context.contacts.filter((c) => selected[c.id]).length;
  const otherFields = context.fields.filter(
    (f) => !/cadence|account|company|organization/i.test(f.name),
  );

  return (
    <div className="winback-overlay" onClick={onClose}>
      <div className="winback-modal" onClick={(e) => e.stopPropagation()}>
        <div className="winback-header">
          <div className="winback-title">
            <Zap size={18} />
            <span>Re-engage Cadence</span>
          </div>
          <button className="winback-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {assigned ? (
          <div className="winback-success">
            <div className="winback-success-icon">
              <Check size={30} />
            </div>
            <h3>{count} contact{count === 1 ? '' : 's'} enrolled</h3>
            <p>
              {context.account ? <strong>{context.account}</strong> : 'These contacts'}{' '}
              {count === 1 ? 'has' : 'have'} been added to <strong>{cadence}</strong>.
            </p>
            <button className="winback-btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="winback-body">
              <p className="winback-lede">
                Assign these contacts to a high-priority Win-Back Cadence to re-engage
                this account in one click.
              </p>

              <div className="winback-context">
                {context.cadence && (
                  <div className="winback-ctx-item">
                    <span className="winback-ctx-label">Source cadence</span>
                    <span className="winback-ctx-value">{context.cadence}</span>
                  </div>
                )}
                {context.account && (
                  <div className="winback-ctx-item">
                    <span className="winback-ctx-label">Account</span>
                    <span className="winback-ctx-value">{context.account}</span>
                  </div>
                )}
              </div>

              {otherFields.length > 0 && (
                <div className="winback-fields">
                  {otherFields.map((f) => (
                    <span className="winback-chip" key={f.name}>
                      <span className="winback-chip-k">{f.name}</span>
                      <span className="winback-chip-v">{f.value}</span>
                    </span>
                  ))}
                </div>
              )}

              <div className="winback-section-title">
                Contacts to enroll ({count})
              </div>
              <div className="winback-contacts">
                {context.contacts.map((c) => (
                  <label className="winback-contact" key={c.id}>
                    <input
                      type="checkbox"
                      checked={!!selected[c.id]}
                      onChange={(e) =>
                        setSelected((s) => ({ ...s, [c.id]: e.target.checked }))
                      }
                    />
                    <span className="winback-avatar">
                      {c.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="winback-contact-info">
                      <span className="winback-contact-name">{c.name}</span>
                      <span className="winback-contact-meta">
                        {c.title}
                        {c.email ? ` · ${c.email}` : ''}
                      </span>
                    </span>
                  </label>
                ))}
              </div>

              <div className="winback-field">
                <label className="winback-label">Assign to cadence</label>
                <select
                  className="winback-select"
                  value={cadence}
                  onChange={(e) => setCadence(e.target.value)}
                >
                  {CADENCE_OPTIONS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="winback-footer">
              <button className="winback-btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                className="winback-btn-primary"
                disabled={count === 0}
                onClick={() => setAssigned(true)}
              >
                <RefreshCw size={16} />
                Assign to Win-Back Cadence
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
