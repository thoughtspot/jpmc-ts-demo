import {
  Home,
  BarChart3,
  LayoutGrid,
  Sparkles,
  Bot,
  ChevronDown,
  LogOut,
  Sun,
  Moon,
  Crown,
  Check,
  // candidate icons the label-resolver can pick from (see iconForLabel)
  Truck,
  Landmark,
  CalendarClock,
  CalendarCheck,
  Package,
  Stethoscope,
  TrendingUp,
  Users,
  GraduationCap,
  Building2,
  Workflow,
  Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTier } from '../context/TierContext';
import JpmorganChaseLogo from './JpmorganChaseLogo';
import { CONTENT } from '../content';
import { FLAGS } from '../flags';

export type TabId = 'home' | 'my-analytics' | 'analytics' | 'carriers' | 'capacity' | 'ask' | 'spotter';

type TabIcon = typeof BarChart3;

// Pick a tab icon from its label so the inline / custom-action tabs match the
// rebrand's use case (a "Loan Engagements" tab gets a bank icon, not a truck).
// First keyword match wins; falls back to the passed default.
const ICON_KEYWORDS: [RegExp, TabIcon][] = [
  [/loan|credit|mortgage|lend|bank|financ|payment|invoice|billing|wallet/i, Landmark],
  [/shift|roster|schedul|attendance|clock|timesheet|\bhours\b|coverage/i, CalendarClock],
  [/leave|pto|vacation|absence|time.?off|holiday/i, CalendarCheck],
  [/carrier|freight|truck|fleet|logistic|deliver|route|\blane\b|shipment/i, Truck],
  [/inventory|stock|supply|warehouse|pharma|\bdrug\b|\bsku\b|restock|procure|order/i, Package],
  [/patient|health|clinic|\bcare\b|medical|hospital|provider/i, Stethoscope],
  [/deal|pipeline|revenue|sales|cadence|engagement|opportunit|quota|outreach/i, TrendingUp],
  [/customer|account|client|member|contact|people|\brep\b|employee|officer|staff/i, Users],
  [/course|training|learn|student|enroll|certif|academy/i, GraduationCap],
  [/store|branch|site|facilit|property|location|region|office/i, Building2],
  [/report|analytic|insight|dashboard|metric/i, BarChart3],
  [/task|request|approval|workflow|process|ticket|\bcase\b|action/i, Workflow],
];
function iconForLabel(label: string, fallback: TabIcon): TabIcon {
  for (const [re, icon] of ICON_KEYWORDS) if (re.test(label)) return icon;
  return fallback;
}

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
  // inline-insights + custom-action icons follow their label (default: list / action)
  { id: 'capacity', label: CONTENT.tabs.action, icon: iconForLabel(CONTENT.tabs.action, Zap) },
  { id: 'ask', label: CONTENT.tabs.ask, icon: Sparkles },
  { id: 'spotter', label: CONTENT.tabs.spotter, icon: Bot },
];

// Tabs that only exist on Premium. On Basic they are hidden from the nav
// entirely (App also bounces the user off one if the tier is switched while it
// is open), rather than being shown and gated on click.
export const PREMIUM_ONLY_TABS: TabId[] = ['ask', 'spotter'];

// Decorative JpmorganChase platform nav (sets product context, non-interactive).
// Cap the auto-generated platform links at 2 so the top bar never gets crowded,
// no matter how many the spec lists.
export const PLATFORM_NAV = [...CONTENT.platformNav].slice(0, 2);

interface Props {
  active: TabId;
  onChange: (tab: TabId) => void;
}

export default function TopBar({ active, onChange }: Props) {
  const { username, logout } = useAuth();
  const { theme, toggle } = useTheme();
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
        <JpmorganChaseLogo className="topbar-logo" />
        <nav className="topbar-platform-nav">
          {PLATFORM_NAV.map((item) => (
            <span key={item} className="topbar-platform-link">
              {item}
            </span>
          ))}
        </nav>
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
        <button
          className="topbar-theme-toggle"
          onClick={toggle}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

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
