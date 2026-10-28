import { CONTENT } from '../content';
import { Action } from '@thoughtspot/visual-embed-sdk';

// Actions a BASIC user cannot use. When disabled, ThoughtSpot greys them out and
// shows UPGRADE_REASON on hover instead of running them. PREMIUM users get [].
// Action reference: https://developers.thoughtspot.com/docs/Enumeration_Action
export const BASIC_DISABLED_ACTIONS = [
  Action.DrillDown,
  Action.AskAi, // "Ask AI" / natural-language search
  Action.SpotIQAnalyze,
  Action.Download,
  Action.DownloadAsCsv,
  Action.DownloadAsPdf,
  Action.DownloadAsXlsx,
];

export const UPGRADE_REASON = CONTENT.upgradeReason;
