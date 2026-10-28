// Left-sidebar navigation — the alternative to TopBar, selected when
// FLAGS.navLayout === 'sidebar'. Reuses the exact same TABS, tier gating,
// theme toggle and user menu as the top bar; only the layout differs, so both
// stay in sync as tabs/features change. Match a customer's left-nav UI with
// this, then hand-tune spacing/labels as needed.
import { ChevronDown, LogOut, Sun, Moon, Crown, Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTier } from '../context/TierContext';
import JpmorganChaseLogo from './JpmorganChaseLogo';
import { FLAGS } from '../flags';
import { TABS, PLATFORM_NAV, PREMIUM_ONLY_TABS, TabId } from './TopBar';

interface Props {
  active: TabId;
  onChange: (tab: TabId) => void;
}

export default function SideNav({ active, onChange }: Props) {
  const { username, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { tier, setTier } = useTier();
  const [menuOpen, setMenuOpen] = useState(false);
  const [tierOpen, setTierOpen] = useState(false);
  const initials = (username || 'U').slice(0, 2).toUpperCase();
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
    <aside className="sidenav">
      <div className="sidenav-brand">
        <JpmorganChaseLogo className="sidenav-logo" />
      </div>

      {PLATFORM_NAV.length > 0 && (
        <nav className="sidenav-platform">
          {PLATFORM_NAV.map((item) => (
            <span key={item} className="sidenav-platform-link">
              {item}
            </span>
          ))}
        </nav>
      )}

      <nav className="sidenav-tabs">
        {TABS.filter((t) => tier === 'premium' || !PREMIUM_ONLY_TABS.includes(t.id)).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`sidenav-tab ${active === tab.id ? 'is-active' : ''}`}
              onClick={() => onChange(tab.id)}
            >
              <Icon size={18} strokeWidth={2} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidenav-footer">
        <button
          className="sidenav-theme-toggle"
          onClick={toggle}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
        </button>

        {/* Tier switcher — demo control to preview Premium vs Basic gating. */}
        {FLAGS.tiers && (
          <div className="sidenav-tier" ref={tierRef} onClick={() => setTierOpen((o) => !o)}>
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

        <div className="sidenav-user" ref={userRef} onClick={() => setMenuOpen((o) => !o)}>
          <span className="topbar-avatar">{initials}</span>
          <span className="sidenav-username">{username || 'User'}</span>
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
    </aside>
  );
}
