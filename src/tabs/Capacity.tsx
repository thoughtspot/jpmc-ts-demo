import { useState } from 'react';
import { LiveboardEmbed } from '@thoughtspot/visual-embed-sdk/react';
import {
  Action,
  CustomActionsPosition,
  CustomActionTarget,
} from '@thoughtspot/visual-embed-sdk';
import {
  CAPACITY_LIVEBOARD_ID,
  CAPACITY_VIZ_ID,
  LIVEBOARD_EMBED_FLAGS,
  REQUEST_BID_ACTION_ID,
  REQUEST_BID_ACTION_NAME,
} from '../config';
import { tsCustomizations } from '../lib/thoughtspot';
import { useTheme } from '../context/ThemeContext';
import { CONTENT } from '../content';
import { useTier } from '../context/TierContext';
import { BASIC_DISABLED_ACTIONS, UPGRADE_REASON } from '../lib/tierActions';
import { buildSignalContext, SignalContext } from '../lib/signalContext';
import BidModal from '../components/BidModal';

const Liveboard = LiveboardEmbed as unknown as (props: any) => JSX.Element;

// Strip the built-in toolbar / context-menu actions, leaving our custom action.
const HIDDEN_ACTIONS = [
  Action.Pin,
  Action.Share,
  Action.ShareViz,
  Action.AddToFavorites,
  Action.Edit,
  Action.EditTML,
  Action.Present,
  Action.SpotIQAnalyze,
  Action.Schedule,
  Action.Subscription,
  Action.Save,
  Action.SaveAsView,
  Action.MakeACopy,
  Action.CopyLink,
  Action.ShowUnderlyingData,
  Action.Explore,
  Action.AnswerChartSwitcher,
  Action.LiveboardInfo,
  Action.SyncToSheets,
  Action.SyncToOtherApps,
];

const H = { display: 'none !important' };
const HIDE_CHROME_RULES: Record<string, Record<string, string>> = {
  '[data-tour-id="chart-switcher-id"]': H,
  '[class*="chart-switcher" i]': H,
  '[class*="vizPropertiesPanel" i]': H,
  '[class*="answerActions" i]': H,
};

export default function Capacity() {
  const { theme } = useTheme();
  const { tier } = useTier();
  const [ctx, setCtx] = useState<SignalContext | null>(null);

  // ThoughtSpot fires this when the user picks "Request Bid" on a row.
  function onCustomAction(payload: any) {
    const data = payload?.data ?? payload;
    console.debug('[jpmorgan-chase] Request Bid payload', payload);
    if (data?.id !== REQUEST_BID_ACTION_ID) return;
    setCtx(buildSignalContext(data));
  }

  return (
    <div className="tab-signals">
      <div className="signals-header">
        <h1 className="page-title">{CONTENT.tabs.action}</h1>
        <p className="page-subtitle">
          {CONTENT.action.subtitlePrefix}{' '}
          <strong>{REQUEST_BID_ACTION_NAME}</strong> {CONTENT.action.subtitleSuffix}
        </p>
      </div>

      <div className="signals-embed">
        <Liveboard
          key={theme}
          liveboardId={CAPACITY_LIVEBOARD_ID}
          vizId={CAPACITY_VIZ_ID}
          hideLiveboardHeader
          hiddenActions={HIDDEN_ACTIONS}
          disabledActions={tier === 'basic' ? BASIC_DISABLED_ACTIONS : []}
          disabledActionReason={UPGRADE_REASON}
          frameParams={{ width: '100%', height: '100%' }}
          customizations={tsCustomizations(theme, false, HIDE_CHROME_RULES)}
          customActions={[
            {
              id: REQUEST_BID_ACTION_ID,
              name: REQUEST_BID_ACTION_NAME,
              position: CustomActionsPosition.CONTEXTMENU,
              target: CustomActionTarget.VIZ,
              metadataIds: {
                liveboardIds: [CAPACITY_LIVEBOARD_ID],
                vizIds: [CAPACITY_VIZ_ID],
              },
            },
          ]}
          onCustomAction={onCustomAction}
          {...LIVEBOARD_EMBED_FLAGS}
        />
      </div>

      <BidModal open={!!ctx} context={ctx} onClose={() => setCtx(null)} />
    </div>
  );
}
