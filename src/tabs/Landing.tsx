// Home landing page — a brand/marketing hero shown as the default tab when
// FLAGS.home is on. Deliberately NO analytics or embeds: headline, subline, a
// CTA into the app, and a few static highlight stats. Tailor the design/copy to
// the client (or a screenshot they provide) — this is a starting point.
import { ArrowRight } from 'lucide-react';
import JpmorganChaseLogo from '../components/JpmorganChaseLogo';
import { CONTENT } from '../content';
import type { TabId } from '../components/TopBar';

interface Props {
  onNavigate: (tab: TabId) => void;
}

type LandingContent = {
  eyebrow?: string;
  headline: { text: string; accent?: boolean }[];
  subline?: string;
  ctaLabel?: string;
  stats?: { value: string; label: string }[];
};

// `landing` is present when the home page is enabled; fall back so this still
// compiles in builds that omit it.
const L: LandingContent =
  (CONTENT as unknown as { landing?: LandingContent }).landing ?? {
    headline: [{ text: CONTENT.company }],
  };

export default function Landing({ onNavigate }: Props) {
  return (
    <section className="home" aria-label={`Welcome to ${CONTENT.company}`}>
      <div className="home-inner">
        <div className="home-copy">
          {L.eyebrow && <div className="home-eyebrow">{L.eyebrow}</div>}
          <h1 className="home-headline">
            {L.headline.map((seg, i) => (
              <span key={i} className={seg.accent ? 'accent' : undefined}>
                {seg.text}
              </span>
            ))}
          </h1>
          {L.subline && <p className="home-sub">{L.subline}</p>}
          {L.ctaLabel && (
            <div className="home-actions">
              <button className="home-cta" onClick={() => onNavigate('analytics')}>
                {L.ctaLabel} <ArrowRight size={18} />
              </button>
            </div>
          )}
          {L.stats && L.stats.length > 0 && (
            <div className="home-stats">
              {L.stats.map((s) => (
                <div className="home-stat" key={s.label}>
                  <span className="home-stat-value">{s.value}</span>
                  <span className="home-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Static brand panel — a clean gradient card with the logo, no data. */}
        <div className="home-brand" aria-hidden="true">
          <div className="home-brand-card">
            <JpmorganChaseLogo className="home-brand-logo" size={44} />
          </div>
        </div>
      </div>
    </section>
  );
}
