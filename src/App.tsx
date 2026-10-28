import { useEffect, useState } from 'react';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { useAuth } from './context/AuthContext';
import { useTier } from './context/TierContext';
import Login from './pages/Login';
import TopBar, { TabId, PREMIUM_ONLY_TABS } from './components/TopBar';
import SideNav from './components/SideNav';
import ChatBot from './components/ChatBot';
import Landing from './tabs/Landing';
import MyAnalytics from './tabs/MyAnalytics';
import { FLAGS } from './flags';
import Analytics from './tabs/Analytics';
import Capacity from './tabs/Capacity';
import AskJpmorganChase from './tabs/AskJpmorganChase';
import SpotterTab from './tabs/Spotter';
import {
  WORKSHEET_ID,
  CADENCE_WORKSHEET_ID,
  CHATBOT_WELCOME,
  CHATBOT_CADENCES_WELCOME,
} from './config';

// Persist the active tab so a reload restores it instead of resetting to default.
const TAB_KEY = 'jpmorgan-chase.tab';

export default function App() {
  const { isAuthenticated } = useAuth();
  const { tier } = useTier();
  const [tab, setTab] = useState<TabId>(
    () => (sessionStorage.getItem(TAB_KEY) as TabId) || (FLAGS.home ? 'home' : 'analytics'),
  );

  const changeTab = (next: TabId) => {
    setTab(next);
    try {
      sessionStorage.setItem(TAB_KEY, next);
    } catch {
      /* storage unavailable */
    }
  };

  // Ask / Spotter are Premium-only. Downgrading to Basic while one of them is
  // open leaves the app on a tab no longer in the nav, so bounce to Analytics.
  useEffect(() => {
    if (tier === 'basic' && PREMIUM_ONLY_TABS.includes(tab)) {
      changeTab('analytics');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier, tab]);

  if (!isAuthenticated) {
    return <Login />;
  }

  // 'top' = horizontal top bar; 'sidebar' = left panel. Cast to string so the
  // literal default ('top') doesn't narrow the comparison away at compile time.
  const isSideNav = (FLAGS.navLayout as string) === 'sidebar';

  return (
    <div className={`app-shell${isSideNav ? ' is-sidenav' : ''}`}>
      {isSideNav ? (
        <SideNav active={tab} onChange={changeTab} />
      ) : (
        <TopBar active={tab} onChange={changeTab} />
      )}
      <main className="app-main">
        {tab === 'home' && <Landing onNavigate={changeTab} />}
        {tab === 'my-analytics' && <MyAnalytics />}
        {tab === 'analytics' && <Analytics />}
        {tab === 'capacity' && <Capacity />}
        {tab === 'ask' && tier === 'premium' && <AskJpmorganChase />}
        {tab === 'spotter' && tier === 'premium' && <SpotterTab />}
      </main>
      <ChatBot
        worksheetId={tab === 'carriers' ? CADENCE_WORKSHEET_ID : WORKSHEET_ID}
        greeting={tab === 'carriers' ? CHATBOT_CADENCES_WELCOME : CHATBOT_WELCOME}
      />
      <VercelAnalytics />
    </div>
  );
}
