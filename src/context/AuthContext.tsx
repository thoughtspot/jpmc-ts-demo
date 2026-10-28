import { createContext, useContext, useState, ReactNode } from 'react';
import { initThoughtSpot, ensureRestSession } from '../lib/thoughtspot';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string;
  password: string;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Auth lives only in memory, so a page reload would drop it and bounce the user
// to Login. Persist it to sessionStorage (survives reload, cleared when the tab
// closes) so a refresh keeps the user signed in on their current tab.
const STORAGE_KEY = 'jpmorgan-chase.auth';

interface StoredAuth {
  username: string;
  password: string;
}

function readStoredAuth(): StoredAuth | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = readStoredAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(!!stored);
  const [username, setUsername] = useState(stored?.username ?? '');
  const [password, setPassword] = useState(stored?.password ?? '');

  // Rehydrate the embed SDK + REST session from the persisted creds on reload.
  if (stored) initThoughtSpot(stored.username, stored.password);

  const login = async (user: string, pass: string) => {
    initThoughtSpot(user, pass);
    await ensureRestSession(user, pass);
    setUsername(user);
    setPassword(pass);
    setIsAuthenticated(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ username: user, password: pass }));
    } catch {
      /* storage unavailable — falls back to in-memory only */
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, username, password, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
