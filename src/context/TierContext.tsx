import { createContext, useContext, useState, ReactNode } from 'react';

export type Tier = 'premium' | 'basic';

interface TierCtx {
  tier: Tier;
  setTier: (t: Tier) => void;
}

const TierContext = createContext<TierCtx>({ tier: 'premium', setTier: () => {} });

export function TierProvider({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<Tier>('premium');
  return <TierContext.Provider value={{ tier, setTier }}>{children}</TierContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTier = () => useContext(TierContext);
