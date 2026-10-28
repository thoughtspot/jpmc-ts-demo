import { useEffect, useState } from 'react';
import { X, Gavel, Check, Send } from 'lucide-react';
import { SignalContext } from '../lib/signalContext';
import { CONTENT } from '../content';

interface Props {
  open: boolean;
  context: SignalContext | null;
  onClose: () => void;
}

// Pull a value out of the clicked-row fields by matching the column name.
function pick(ctx: SignalContext | null, re: RegExp): string {
  const f = ctx?.fields.find((x) => re.test(x.name) && x.value !== '—');
  return f ? f.value : '';
}

export default function BidModal({ open, context, onClose }: Props) {
  const [corridor, setCorridor] = useState('');
  const [carrier, setCarrier] = useState('');
  const [equipment, setEquipment] = useState('Dry Van');
  const [targetRate, setTargetRate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Pre-fill from the row the user right-clicked whenever a new bid is opened.
  useEffect(() => {
    if (!context) return;
    setCorridor(pick(context, /corridor|lane|origin|destination/i) || '');
    setCarrier(pick(context, /carrier/i) || '');
    const rate = pick(context, /rate|price|\$|cost|spend/i);
    setTargetRate(rate ? rate.replace(/[^0-9.]/g, '') : '');
    setNotes('');
    setSubmitted(false);
  }, [context]);

  if (!open || !context) return null;

  // Everything else from the row, shown as read-only context chips.
  const otherFields = context.fields.filter(
    (f) => !/corridor|lane|carrier|rate|price|cost/i.test(f.name) && f.value !== '—',
  );

  return (
    <div className="winback-overlay" onClick={onClose}>
      <div className="winback-modal bid-modal" onClick={(e) => e.stopPropagation()}>
        <div className="winback-header">
          <div className="winback-title">
            <Gavel size={18} />
            <span>{CONTENT.action.modalTitle}</span>
          </div>
          <button className="winback-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="winback-success">
            <div className="winback-success-icon">
              <Check size={30} />
            </div>
            <h3>Bid request submitted</h3>
            <p>
              Your bid for{' '}
              <strong>{corridor || 'this lane'}</strong>
              {carrier ? <> to <strong>{carrier}</strong></> : null} has been sent to the
              JpmorganChase capacity desk.
            </p>
            <button className="sl-hfilter-apply bid-done" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <div className="bid-body">
            <p className="bid-lead">
              Pre-filled from the selected lane. Review and submit to request a carrier
              bid through JpmorganChase.
            </p>

            <div className="bid-grid">
              <label className="bid-field">
                <span>Freight corridor / lane</span>
                <input value={corridor} onChange={(e) => setCorridor(e.target.value)} placeholder="e.g. Dallas, TX → Atlanta, GA" />
              </label>
              <label className="bid-field">
                <span>Carrier</span>
                <input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="Carrier name" />
              </label>
              <label className="bid-field">
                <span>Equipment</span>
                <select value={equipment} onChange={(e) => setEquipment(e.target.value)}>
                  <option>Dry Van</option>
                  <option>Reefer</option>
                  <option>Flatbed</option>
                  <option>Power Only</option>
                </select>
              </label>
              <label className="bid-field">
                <span>Target rate ($)</span>
                <input value={targetRate} onChange={(e) => setTargetRate(e.target.value)} placeholder="2,300.00" inputMode="decimal" />
              </label>
            </div>

            {otherFields.length > 0 && (
              <div className="bid-context">
                <span className="bid-context-label">From this lane</span>
                <div className="bid-chips">
                  {otherFields.slice(0, 6).map((f) => (
                    <span className="bid-chip" key={f.name}>
                      <em>{f.name}</em> {f.value}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <label className="bid-field">
              <span>Notes for the capacity desk</span>
              <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any constraints, timing, or commitments…" />
            </label>

            <div className="bid-actions">
              <button className="winback-close-text" onClick={onClose}>Cancel</button>
              <button className="sl-hfilter-apply bid-submit" onClick={() => setSubmitted(true)}>
                <Send size={15} /> Submit bid request
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
