// Upgrade prompt shown on the 3rd Ask JpmorganChase AI question.
//  Step 1 (plans): the Premium value prop + "Upgrade to Premium".
//  Step 2 (checkout): a PLG query-pack offer with Pay Now / Schedule Meeting
//  and an inline scheduler. Theme-aware via the app's --sl-* tokens.
import { useEffect, useState } from 'react';
import {
  X, Sparkles, Check, ArrowRight, ArrowLeft,
  ChevronLeft, ChevronRight, CreditCard, CalendarDays,
} from 'lucide-react';

interface Props {
  open: boolean;
  remaining: number;
  onClose: () => void;
}

const PREMIUM_FEATURES = [
  'Unlimited Ask JpmorganChase AI questions',
  'Drill-down & underlying-data access',
  'CSV, Excel & PDF exports',
  'Priority capacity & lane insights',
  'Dedicated onboarding & support',
];

const SLOTS = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const DOW_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TrialModal({ open, remaining, onClose }: Props) {
  const [step, setStep] = useState<'plans' | 'checkout'>('plans');
  const [monthOffset, setMonthOffset] = useState(0);
  const [selDay, setSelDay] = useState<number | null>(null);
  const [selSlot, setSelSlot] = useState<string | null>(null);
  const [done, setDone] = useState<null | 'paid' | 'booked'>(null);

  // Reset the whole flow whenever the modal is (re)opened.
  useEffect(() => {
    if (!open) return;
    setStep('plans'); setMonthOffset(0); setSelDay(null); setSelSlot(null); setDone(null);
  }, [open]);

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const view = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const y = view.getFullYear();
  const m = view.getMonth();
  const firstDow = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const dayAvail = (day: number) => {
    const d = new Date(y, m, day);
    return d >= startOfToday && d.getDay() !== 0 && d.getDay() !== 6;
  };

  // Pre-select the first available weekday when entering checkout / changing month.
  useEffect(() => {
    if (step !== 'checkout') return;
    let first: number | null = null;
    for (let d = 1; d <= daysInMonth; d++) if (dayAvail(d)) { first = d; break; }
    setSelDay(first);
    setSelSlot(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthOffset, step]);

  if (!open) return null;

  const selDate = selDay ? new Date(y, m, selDay) : null;
  const slotsHead = selDate ? `${DOW_FULL[selDate.getDay()]}, ${MONTHS[m].slice(0, 3)} ${selDay}` : '';

  return (
    <div className="sl-trial-overlay" onClick={onClose}>
      <div className="sl-trial-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="sl-trial-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        {/* ---- success confirmation ---- */}
        {done ? (
          <div className="sl-trial-body" style={{ textAlign: 'center' }}>
            <div className="sl-trial-icon" style={{ margin: '0 auto' }}>
              <Check size={24} />
            </div>
            <h2 className="sl-trial-title" style={{ marginTop: 18 }}>
              {done === 'paid' ? 'Query pack added' : 'Meeting scheduled'}
            </h2>
            <p className="sl-trial-sub">
              {done === 'paid'
                ? <>Your counter has been reset to <strong>500 queries</strong>. You can keep asking JpmorganChase AI right away.</>
                : <>You&rsquo;re booked with <strong>Brian</strong> on <strong>{MONTHS[m]} {selDay}</strong> at <strong>{selSlot}</strong>. A calendar invite is on its way.</>}
            </p>
            <button className="sl-trial-cta" onClick={onClose}>Done</button>
            <p className="sl-trial-fine">Demo experience — no payment is taken and no meeting is booked.</p>
          </div>
        ) : step === 'plans' ? (
          /* ---- step 1: plans ---- */
          <div className="sl-trial-body">
            <div className="sl-trial-icon"><Sparkles size={24} /></div>
            <div className="sl-trial-eyebrow">JpmorganChase Premium</div>
            <h2 className="sl-trial-title">Unlock unlimited JpmorganChase AI</h2>
            <p className="sl-trial-sub">
              {remaining > 0
                ? <>You have <strong>{remaining}</strong> free question{remaining === 1 ? '' : 's'} left on the trial. </>
                : <>You&rsquo;ve reached your free-trial limit. </>}
              Upgrade to Premium for unlimited access across your brokerage.
            </p>
            <ul className="sl-trial-features">
              {PREMIUM_FEATURES.map((f) => (
                <li key={f}><span className="sl-trial-check"><Check size={14} /></span>{f}</li>
              ))}
            </ul>
            <button className="sl-trial-cta" onClick={() => setStep('checkout')}>
              Upgrade to Premium <ArrowRight size={18} />
            </button>
            <button className="sl-trial-dismiss" onClick={onClose}>Maybe later</button>
            <p className="sl-trial-fine">
              Demo experience — no payment is taken. Talk to your JpmorganChase account team for production pricing.
            </p>
          </div>
        ) : (
          /* ---- step 2: checkout (query pack + scheduler) ---- */
          <div className="sl-trial-body">
            <button className="plg-back" onClick={() => setStep('plans')}>
              <ArrowLeft size={16} /> Back
            </button>

            <div className="plg-offer">
              <div className="plg-offer-top">
                <span className="plg-offer-name">Query Pack — 500 queries</span>
                <span className="plg-offer-price">$500</span>
              </div>
              <p className="plg-offer-sub">Resets your counter to 500 queries immediately</p>
            </div>

            <div className="plg-actions">
              <button className="plg-btn sec" onClick={() => setDone('paid')}>
                <CreditCard size={16} /> Pay Now
              </button>
              <button
                className="plg-btn pri"
                disabled={!selDay || !selSlot}
                onClick={() => setDone('booked')}
              >
                <CalendarDays size={16} /> Schedule Meeting
              </button>
            </div>

            <div className="plg-sched">
              <div className="plg-sched-head">
                <div className="plg-cal-ic"><span className="cal-top" /><span className="cal-day">{selDay ?? '—'}</span></div>
                <div className="plg-sched-title">Schedule with Brian</div>
                <div className="plg-sched-meta">30 min · Account Manager</div>
              </div>

              <div className="plg-month">
                <button className="plg-nav" onClick={() => setMonthOffset((o) => Math.max(0, o - 1))} aria-label="Previous month"><ChevronLeft size={16} /></button>
                <span>{MONTHS[m]} {y}</span>
                <button className="plg-nav" onClick={() => setMonthOffset((o) => o + 1)} aria-label="Next month"><ChevronRight size={16} /></button>
              </div>

              <div className="plg-grid">
                {DOW.map((d) => <div key={d} className="plg-dow">{d}</div>)}
                {Array.from({ length: firstDow }).map((_, i) => <span key={`b${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const avail = dayAvail(day);
                  const sel = selDay === day;
                  return (
                    <button
                      key={day}
                      className={`plg-cell ${sel ? 'sel' : avail ? 'avail' : 'dim'}`}
                      disabled={!avail}
                      onClick={() => { setSelDay(day); setSelSlot(null); }}
                    >{day}</button>
                  );
                })}
              </div>

              {selDay && (
                <>
                  <div className="plg-slots-head">{slotsHead}</div>
                  <div className="plg-slots">
                    {SLOTS.map((s) => (
                      <button
                        key={s}
                        className={`plg-slot ${selSlot === s ? 'on' : ''}`}
                        onClick={() => setSelSlot(s)}
                      >{s}</button>
                    ))}
                  </div>
                </>
              )}

              <p className="sl-trial-fine">Demo experience — no payment is taken and no meeting is booked.</p>
              <button className="sl-trial-dismiss" onClick={onClose}>Maybe later</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
