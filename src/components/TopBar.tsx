import {
  Home,
  BarChart3,
  LayoutGrid,
  Bot,
  ChevronDown,
  LogOut,
  Crown,
  Check,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTier } from '../context/TierContext';
import { CONTENT } from '../content';
import { FLAGS } from '../flags';

export type TabId = 'home' | 'my-analytics' | 'analytics' | 'carriers' | 'spotter';

type TabIcon = typeof BarChart3;

const HOME_TAB: { id: TabId; label: string; icon: TabIcon } = {
  id: 'home',
  // tabs.home is present when the home page is enabled; default the label safely.
  label: (CONTENT.tabs as { home?: string }).home ?? 'Home',
  icon: Home,
};

export const TABS: { id: TabId; label: string; icon: TabIcon }[] = [
  // Home landing tab renders first, only when enabled.
  ...(FLAGS.home ? [HOME_TAB] : []),
  { id: 'my-analytics', label: CONTENT.tabs.myReports, icon: LayoutGrid },
  { id: 'analytics', label: CONTENT.tabs.analytics, icon: BarChart3 },
  { id: 'spotter', label: CONTENT.tabs.spotter, icon: Bot },
];

// Tabs that only exist on Premium. On Basic they are hidden from the nav
// entirely (App also bounces the user off one if the tier is switched while it
// is open), rather than being shown and gated on click.
export const PREMIUM_ONLY_TABS: TabId[] = ['spotter'];

interface Props {
  active: TabId;
  onChange: (tab: TabId) => void;
}

export default function TopBar({ active, onChange }: Props) {
  const { username, logout } = useAuth();
  const { tier, setTier } = useTier();
  const [menuOpen, setMenuOpen] = useState(false);
  const [tierOpen, setTierOpen] = useState(false);
  const initials = (username || 'U').split('@')[0].slice(0, 2).toUpperCase();
  const tierRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close either dropdown when clicking anywhere outside it.
  useEffect(() => {
    if (!menuOpen && !tierOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (tierRef.current && !tierRef.current.contains(t)) setTierOpen(false);
      if (userRef.current && !userRef.current.contains(t)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menuOpen, tierOpen]);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <img className="topbar-logo" src="/jpmc-travel.jpeg" alt="JPMC Travel" />
      </div>

      <nav className="topbar-tabs">
        {TABS.filter((t) => tier === 'premium' || !PREMIUM_ONLY_TABS.includes(t.id)).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`topbar-tab ${active === tab.id ? 'is-active' : ''}`}
              onClick={() => onChange(tab.id)}
            >
              <Icon size={17} strokeWidth={2} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="topbar-right">
        {/* Tier switcher — demo control to preview Premium vs Basic gating. */}
        {FLAGS.tiers && (
        <div className="topbar-tier" ref={tierRef} onClick={() => setTierOpen((o) => !o)}>
          <span className={`tier-pill tier-${tier}`}>
            <Crown size={13} />
            {tier === 'premium' ? 'Premium' : 'Basic'}
          </span>
          <ChevronDown size={15} />
          {tierOpen && (
            <div className="topbar-menu tier-menu">
              <button
                className="topbar-menu-item"
                onClick={() => { setTier('premium'); setTierOpen(false); }}
              >
                <Crown size={14} /> Premium
                {tier === 'premium' && <Check size={14} className="tier-check" />}
              </button>
              <button
                className="topbar-menu-item"
                onClick={() => { setTier('basic'); setTierOpen(false); }}
              >
                <span style={{ width: 14 }} /> Basic
                {tier === 'basic' && <Check size={14} className="tier-check" />}
              </button>
            </div>
          )}
        </div>
        )}

        <div className="topbar-user" ref={userRef} onClick={() => setMenuOpen((o) => !o)}>
          <span className="topbar-avatar">{initials}</span>
          <span className="topbar-username">{(username || 'User').split('@')[0]}</span>
          <ChevronDown size={16} />
          {menuOpen && (
            <div className="topbar-menu">
              <button className="topbar-menu-item" onClick={logout}>
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
