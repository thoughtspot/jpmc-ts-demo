import { CONTENT } from './content';
// ---------------------------------------------------------------------------
// Central configuration for the JpmorganChase Analytics mockup.
// IDs + ThoughtSpot styling are sourced from jpmorgan-chase_fin.json so that every
// embedded ThoughtSpot component shares the exact same look & feel.
// ---------------------------------------------------------------------------

/** ThoughtSpot cluster (from the NEXT_PUBLIC_THOUGHTSPOT_HOST env var) */
export const THOUGHTSPOT_HOST = (import.meta.env.NEXT_PUBLIC_THOUGHTSPOT_HOST ?? '').replace(/\/$/, '');

/** Same-origin endpoint that returns a ThoughtSpot auth token from the token service. */
export const TS_TOKEN_ENDPOINT = '/api/ts-token';

/** The Analytics liveboard embedded in Tab 2 (Analytics). */
export const ANALYTICS_LIVEBOARD_ID = import.meta.env.NEXT_PUBLIC_TS_ANALYTICS_LIVEBOARD_ID ?? '';

/** Liveboard embedded inline by "View insights" on a process, filtered by the
 *  process name (no vizId — the whole liveboard is shown, stripped of chrome). */
export const INLINE_INSIGHTS_LIVEBOARD_ID =
  import.meta.env.NEXT_PUBLIC_TS_INLINE_INSIGHTS_LIVEBOARD_ID ?? '';

/** Worksheet/model the Processes tab queries for process names + metrics. */
export const CADENCE_WORKSHEET_ID = import.meta.env.NEXT_PUBLIC_TS_CADENCE_WORKSHEET_ID ?? '';

/**
 * Capacity tab embeds a single VISUALIZATION (LiveboardEmbed + liveboardId +
 * vizId) with a code-based custom action.
 */
export const CAPACITY_LIVEBOARD_ID = import.meta.env.NEXT_PUBLIC_TS_CAPACITY_LIVEBOARD_ID ?? '';
export const CAPACITY_VIZ_ID = import.meta.env.NEXT_PUBLIC_TS_CAPACITY_VIZ_ID ?? '';

/** Code-based custom action ("Request Bid") on the Capacity viz context menu. */
export const REQUEST_BID_ACTION_ID = 'take-action';
export const REQUEST_BID_ACTION_NAME = 'Take Action';

/**
 * Candidate column names for "cadence" on the worksheet. The first one that
 * returns data is used both to list cadence names and as the runtime-filter
 * column name on the inline liveboard.
 */
export const CADENCE_COLUMN_CANDIDATES = [
  'Traveler Segment Name',
  'Traveler Segment Name',
];

/**
 * Candidate column names for the per-cadence detail metrics shown next to each
 * cadence in the Inline Insights UI. The first candidate that returns data for
 * each metric is used; metrics with no match are simply omitted.
 */
export const CADENCE_DETAIL_COLUMNS: Record<
  'metric1' | 'metric2',
  { label: string; format: 'text' | 'date' | 'number' | 'currency'; candidates: string[] }
> = {
  metric1: {
    label: 'Booking Count',
    format: 'number',
    candidates: ['Booking Count'],
  },
  metric2: {
    label: 'Ticket Face Value',
    format: 'number',
    candidates: ['Ticket Face Value'],
  },
};

/**
 * Worksheet / model used everywhere Spotter runs — the "JpmorganChase AI" Spotter
 * modal (Analytics tab), the Ask JpmorganChase Spotter embed, and the host chatbot.
 */
export const WORKSHEET_ID = import.meta.env.NEXT_PUBLIC_TS_WORKSHEET_ID ?? '';

/** Carriers list is not org-scoped for JpmorganChase. */
export const JpmorganChase_ORG_ID = '';
export const ORG_COLUMN_CANDIDATES: string[] = [];

/** Analytics-tab filters — Region + Freight corridor (multiselect), both empty
 *  by default (= no runtime filter / show all). Load Date is a date-range filter
 *  driven by DATE_COLUMN below. Candidate column names, first match wins. */
export const REGION_COLUMN_CANDIDATES = [
  'Traveler Segment Name',
  'Traveler Segment Name',
];
export const CORRIDOR_COLUMN_CANDIDATES = [
  'Travel Category Name',
  'Vendor Name',
];

// ---------------------------------------------------------------------------
// ThoughtSpot embed styling — taken verbatim from
// jpmorgan-chase_fin.json > stylingConfig.embeddedContent
// ---------------------------------------------------------------------------

/** CSS variables applied to every embedded ThoughtSpot surface. */
// Embed font — the family the ThoughtSpot iframes request. Overwritten by the
// codemod from spec.appFont; pair it with TS_FONT_URL (below), which loads that
// font INTO the iframe (a Google-Fonts URL, or a self-hosted /embed-font.css).
export const EMBED_FONT_FAMILY = "'Inter', 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif";

export const TS_CSS_VARIABLES: Record<string, string> = {
  '--ts-var-root-background': '#f1f7fc',
  '--ts-var-root-color': '#242424',
  '--ts-var-root-font-family': EMBED_FONT_FAMILY,
  '--ts-var-application-color': '#3d3e3e',
  '--ts-var-nav-background': '#FFFFFF',
  '--ts-var-nav-color': '#3d3e3e',
  '--ts-var-search-data-button-background': '#117ACA',
  '--ts-var-search-data-button-font-color': '#FFFFFF',
  '--ts-var-search-bar-background': '#eef5fb',
  '--ts-var-search-bar-text-font-color': '#3d3e3e',
  '--ts-var-button-border-radius': '10px',
  '--ts-var-button--icon-border-radius': '8px',
  '--ts-var-button--primary-background': '#117ACA',
  '--ts-var-button--primary-color': '#FFFFFF',
  '--ts-var-button--primary--hover-background': '#3c92d4',
  '--ts-var-button--primary--active-background': '#5da5db',
  '--ts-var-button--secondary-background': '#e5f0f9',
  '--ts-var-button--secondary-color': '#3d3e3e',
  // See dark-theme note: the SDK reads the typo'd "--hovers-background".
  '--ts-var-button--secondary--hover-background': '#d7e8f6',
  '--ts-var-button--secondary--hovers-background': '#d7e8f6',
  '--ts-var-button--secondary--active-background': '#c9e0f3',
  '--ts-var-viz-title-color': '#242424',
  '--ts-var-viz-title-font-family': EMBED_FONT_FAMILY,
  '--ts-var-viz-description-color': '#7d7e7f',
  '--ts-var-viz-border-radius': '18px',
  '--ts-var-viz-box-shadow': '0 1px 2px rgba(36, 36, 36, 0.06), 0 16px 44px rgba(36, 36, 36, 0.16)',
  '--ts-var-viz-background': '#FFFFFF',
  '--ts-var-chip-border-radius': '999px',
  '--ts-var-chip-background': '#e5f0f9',
  '--ts-var-chip-color': '#3d3e3e',
  '--ts-var-chip--hover-background': '#d7e8f6',
  '--ts-var-chip--hover-color': '#242424',
  '--ts-var-chip--active-background': '#117ACA',
  '--ts-var-chip--active-color': '#FFFFFF',
  '--ts-var-menu-background': '#FFFFFF',
  '--ts-var-menu-color': '#3d3e3e',
  '--ts-var-menu--hover-background': '#eaf3fa',
  '--ts-var-dialog-body-background': '#FFFFFF',
  '--ts-var-dialog-body-color': '#3d3e3e',
  '--ts-var-dialog-header-background': '#FFFFFF',
  '--ts-var-dialog-header-color': '#242424',
  '--ts-var-list-hover-background': '#eaf3fa',
  '--ts-var-list-selected-background': '#e0edf8',
  '--ts-var-liveboard-layout-background': '#f1f7fc',
  '--ts-var-liveboard-header-background': '#FFFFFF',
  '--ts-var-liveboard-header-font-color': '#242424',
  '--ts-var-liveboard-tile-background': '#FFFFFF',
  '--ts-var-liveboard-tile-border-color': '#dbebf7',
  '--ts-var-liveboard-tile-border-radius': '18px',
  '--ts-var-liveboard-tile-padding': '12px',
  '--ts-var-liveboard-tile-table-header-background': '#eef5fb',
  '--ts-var-liveboard-tab-active-border-color': '#117ACA',
  '--ts-var-liveboard-tab-hover-color': '#117ACA',
  '--ts-var-liveboard-header-action-button-background': '#e5f0f9',
  '--ts-var-liveboard-header-action-button-font-color': '#3d3e3e',
  // NOTE: despite "-color", these are the button's hover/active BACKGROUND.
  // Label is dark here, so keep the hover background LIGHT for contrast.
  '--ts-var-liveboard-header-action-button-hover-color': '#d7e8f6',
  '--ts-var-liveboard-header-action-button-active-color': '#c9e0f3',
  '--ts-var-parameter-chip-background': '#e5f0f9',
  '--ts-var-parameter-chip-text-color': '#3d3e3e',
  '--ts-var-parameter-chip-hover-background': '#d7e8f6',
  '--ts-var-parameter-chip-hover-text-color': '#242424',
  '--ts-var-parameter-chip-active-background': '#117ACA',
  '--ts-var-parameter-chip-active-text-color': '#FFFFFF',
  '--ts-var-axis-title-color': '#7d7e7f',
  '--ts-var-axis-data-label-color': '#7d7e7f',
  '--ts-var-kpi-hero-color': '#242424',
  '--ts-var-kpi-comparison-color': '#7d7e7f',
  '--ts-var-kpi-positive-change-color': '#1E8E5A',
  '--ts-var-kpi-negative-change-color': '#C84B3A',
  // Spotter landing page "flashlight" — the shipped CSS paints a radial-gradient
  // haze behind the greeting/composer via these two variables (quick search vs
  // deep analysis). Set them to `none` so the landing page renders flat.
  //   .spotter-landing-page-background-module__backgroundSearch  { background: var(--ts-var-spotter-landing-bg-quicksearch, radial-gradient(...)) }
  //   .spotter-landing-page-background-module__backgroundResearch { background: var(--ts-var-spotter-landing-bg-deepanalysis, radial-gradient(...)) }
  '--ts-var-spotter-landing-bg-quicksearch': 'none',
  '--ts-var-spotter-landing-bg-deepanalysis': 'none',
  // "Change analysis" modal (Analyze change on a KPI). Both have dedicated
  // variables; the defaults are ThoughtSpot's blue-grey (#eef5fb / #d7e8f6),
  // a foreign hue next to the brand palette.
  '--ts-var-cca-modal-summary-header-background': '#eef5fb',
  '--ts-var-change-analysis-insights-background': '#e7f1f9',
  // Spotter / SpotterViz "Show work" tool cards. Their built-in defaults are a
  // dark slate (#0d3c60 card, #072b45 JSON, white text) meant for the SpotterViz
  // panel, so they look foreign in a themed embed until set here.
  '--ts-var-spotterviz-tool-call-background': '#eef5fb',
  '--ts-var-spotterviz-tool-border-color': '#dbebf7',
  '--ts-var-spotterviz-tool-title-color': '#3d3e3e',
  '--ts-var-spotterviz-tool-json-input-background': '#e7f1f9',
  '--ts-var-spotterviz-tool-json-input-color': '#4a4b4b',
  '--ts-var-spotterviz-text-primary': '#242424',
  '--ts-var-spotterviz-text-secondary': '#7d7e7f',
  '--ts-var-spotterviz-message-background': '#FFFFFF',
  '--ts-var-spotterviz-panel-background': '#f1f7fc',
  '--ts-var-spotterviz-thinking-inprogress-header-color': '#117ACA',
  '--ts-var-spotterviz-thinking-completed-header-color': '#7d7e7f',
};

export type ThemeName = 'light' | 'dark';

/**
 * Dark counterpart to TS_CSS_VARIABLES — a deep-evergreen dark theme that keeps
 * JpmorganChase's green/coral accents. Passed per-embed for the active theme so the
 * embedded Liveboard / Search / Spotter track the host app's light/dark toggle.
 *   CSS variables: https://developers.thoughtspot.com/docs/css-variables-reference
 */
export const TS_VARS_DARK: Record<string, string> = {
  '--ts-var-root-background': '#0b1620',
  '--ts-var-root-color': '#e7f2fa',
  '--ts-var-root-secondary-color': '#939ea7',
  '--ts-var-root-font-family': EMBED_FONT_FAMILY,
  '--ts-var-application-color': '#e7f2fa',
  '--ts-var-nav-background': '#0b1620',
  '--ts-var-nav-color': '#e7f2fa',
  '--ts-var-search-data-button-background': '#117ACA',
  '--ts-var-search-data-button-font-color': '#FFFFFF',
  '--ts-var-search-bar-background': '#0c2337',
  '--ts-var-search-bar-text-font-color': '#e7f2fa',
  '--ts-var-search-auto-complete-background': '#0c2337',
  '--ts-var-search-auto-complete-font-color': '#e7f2fa',
  '--ts-var-button-border-radius': '10px',
  '--ts-var-button--icon-border-radius': '8px',
  // Deeper green + white text so labels stay readable (incl. on hover).
  '--ts-var-button--primary-background': '#117ACA',
  '--ts-var-button--primary-color': '#ffffff',
  '--ts-var-button--primary--hover-background': '#3c92d4',
  '--ts-var-button--primary--active-background': '#5da5db',
  '--ts-var-button--secondary-background': '#072b45',
  '--ts-var-button--secondary-color': '#e7f2fa',
  // NOTE: the SDK's *effective* var name is the typo'd "--hovers-background"
  // (default #7cb6e2, a light blue) — the clean "--hover-background" is only in
  // the docs. Set both so the label stays readable on hover.
  '--ts-var-button--secondary--hover-background': '#117ACA',
  '--ts-var-button--secondary--hovers-background': '#117ACA',
  '--ts-var-button--secondary--active-background': '#3c92d4',
  '--ts-var-button--tertiary-background': 'transparent',
  '--ts-var-button--tertiary-color': '#bbc6ce',
  '--ts-var-button--tertiary--hover-background': '#072b45',
  '--ts-var-viz-title-color': '#e7f2fa',
  '--ts-var-viz-title-font-family': EMBED_FONT_FAMILY,
  '--ts-var-viz-description-color': '#939ea7',
  '--ts-var-viz-border-radius': '18px',
  '--ts-var-viz-box-shadow':
    '0 1px 0 rgba(255,255,255,0.05) inset, 0 14px 44px rgba(0,0,0,0.55), 0 0 0 1px rgba(17, 122, 202, 0.16)',
  '--ts-var-viz-background': '#0c2337',
  '--ts-var-viz-legend-hover-background': '#072b45',
  '--ts-var-chip-border-radius': '999px',
  '--ts-var-chip-background': '#072b45',
  '--ts-var-chip-color': '#bbc6ce',
  '--ts-var-chip--hover-background': '#0d3c60',
  '--ts-var-chip--hover-color': '#e7f2fa',
  '--ts-var-chip--active-background': '#117ACA',
  '--ts-var-chip--active-color': '#FFFFFF',
  '--ts-var-menu-background': '#0c2337',
  '--ts-var-menu-color': '#e7f2fa',
  '--ts-var-menu--hover-background': '#072b45',
  '--ts-var-menu-selected-text-color': '#117ACA',
  '--ts-var-menu-separator-background': '#0d3c60',
  '--ts-var-dialog-body-background': '#0c2337',
  '--ts-var-dialog-body-color': '#e7f2fa',
  '--ts-var-dialog-header-background': '#0c2337',
  '--ts-var-dialog-header-color': '#e7f2fa',
  '--ts-var-dialog-footer-background': '#0c2337',
  '--ts-var-list-hover-background': '#072b45',
  '--ts-var-list-selected-background': '#0d3c60',
  '--ts-var-liveboard-layout-background': '#0b1620',
  '--ts-var-liveboard-header-background': '#0b1620',
  '--ts-var-liveboard-header-font-color': '#e7f2fa',
  '--ts-var-liveboard-edit-bar-background': '#0c2337',
  '--ts-var-liveboard-cross-filter-layout-background': '#0c2337',
  '--ts-var-liveboard-tile-background': '#0c2337',
  '--ts-var-liveboard-tile-border-color': '#0d3c60',
  '--ts-var-liveboard-tile-border-radius': '18px',
  '--ts-var-liveboard-tile-padding': '12px',
  '--ts-var-liveboard-tile-table-header-background': '#072b45',
  '--ts-var-liveboard-tab-active-border-color': '#117ACA',
  '--ts-var-liveboard-tab-hover-color': '#117ACA',
  '--ts-var-liveboard-header-action-button-background': '#072b45',
  '--ts-var-liveboard-header-action-button-font-color': '#e7f2fa',
  // NOTE: despite "-color", these are the button's hover/active BACKGROUND.
  // Label is light here, so keep the hover background DARK green for contrast.
  '--ts-var-liveboard-header-action-button-hover-color': '#117ACA',
  '--ts-var-liveboard-header-action-button-active-color': '#3c92d4',
  // Masterpieces grouping/styling (active because isLiveboardMasterpiecesEnabled)
  '--ts-var-liveboard-group-background': '#0b1620',
  '--ts-var-liveboard-group-title-font-color': '#e7f2fa',
  '--ts-var-liveboard-group-border-color': '#0d3c60',
  '--ts-var-liveboard-group-description-font-color': '#939ea7',
  '--ts-var-liveboard-group-tile-title-font-color': '#e7f2fa',
  '--ts-var-liveboard-group-tile-description-font-color': '#939ea7',
  '--ts-var-parameter-chip-background': '#072b45',
  '--ts-var-parameter-chip-text-color': '#e7f2fa',
  '--ts-var-parameter-chip-hover-background': '#0d3c60',
  '--ts-var-parameter-chip-hover-text-color': '#ffffff',
  '--ts-var-parameter-chip-active-background': '#117ACA',
  '--ts-var-parameter-chip-active-text-color': '#FFFFFF',
  '--ts-var-axis-title-color': '#939ea7',
  '--ts-var-axis-data-label-color': '#939ea7',
  '--ts-var-answer-data-panel-background-color': '#0b1620',
  '--ts-var-answer-edit-panel-background-color': '#0b1620',
  '--ts-var-kpi-hero-color': '#e7f2fa',
  '--ts-var-kpi-comparison-color': '#939ea7',
  '--ts-var-kpi-positive-change-color': '#35c98a',
  '--ts-var-kpi-negative-change-color': '#ff7a6b',
  // Spotter / Sage conversational surfaces
  '--ts-var-spotter-input-background': '#0c2337',
  '--ts-var-spotter-prompt-background': '#072b45',
  '--ts-var-sage-embed-background-color': '#0b1620',
  '--ts-var-sage-bar-header-background-color': '#0b1620',
  '--ts-var-sage-search-box-background-color': '#0c2337',
  '--ts-var-sage-search-box-font-color': '#e7f2fa',
  '--ts-var-source-selector-background-color': '#0c2337',
  '--ts-var-sage-seed-questions-background': '#0c2337',
  '--ts-var-sage-seed-questions-font-color': '#bbc6ce',
  '--ts-var-sage-seed-questions-hover-background': '#072b45',
  // Spotter landing page "flashlight" — the shipped CSS paints a radial-gradient
  // haze behind the greeting/composer via these two variables (quick search vs
  // deep analysis). Set them to `none` so the landing page renders flat.
  //   .spotter-landing-page-background-module__backgroundSearch  { background: var(--ts-var-spotter-landing-bg-quicksearch, radial-gradient(...)) }
  //   .spotter-landing-page-background-module__backgroundResearch { background: var(--ts-var-spotter-landing-bg-deepanalysis, radial-gradient(...)) }
  '--ts-var-spotter-landing-bg-quicksearch': 'none',
  '--ts-var-spotter-landing-bg-deepanalysis': 'none',
  // "Change analysis" modal — see the light-theme note. Without these its
  // summary-table header renders as a white bar inside the dark modal.
  '--ts-var-cca-modal-summary-header-background': '#0b1d2b',
  '--ts-var-change-analysis-insights-background': '#0c2337',
  // Spotter / SpotterViz "Show work" tool cards — see the light-theme note.
  '--ts-var-spotterviz-tool-call-background': '#0c2337',
  '--ts-var-spotterviz-tool-border-color': '#0d3c60',
  '--ts-var-spotterviz-tool-title-color': '#e7f2fa',
  '--ts-var-spotterviz-tool-json-input-background': '#0b1620',
  '--ts-var-spotterviz-tool-json-input-color': '#117ACA',
  '--ts-var-spotterviz-text-primary': '#e7f2fa',
  '--ts-var-spotterviz-text-secondary': '#939ea7',
  '--ts-var-spotterviz-message-background': '#0c2337',
  '--ts-var-spotterviz-panel-background': '#0b1620',
  '--ts-var-spotterviz-thinking-inprogress-header-color': '#117ACA',
  '--ts-var-spotterviz-thinking-completed-header-color': '#939ea7',
  '--ts-var-spotterviz-tool-feedback-button-background': '#072b45',
  '--ts-var-spotterviz-tool-feedback-button-hover': '#0d3c60',
};

/** Return the CSS-variable set for the active theme. */
export function tsVarsFor(theme: ThemeName): Record<string, string> {
  return theme === 'dark' ? TS_VARS_DARK : TS_CSS_VARIABLES;
}

/**
 * Dark-only color overrides for surfaces with no dedicated CSS variable (answer
 * cards, floating chrome), plus the KPI headline in the JpmorganChase green. Applied
 * via rules_UNSTABLE only in dark mode.
 *   Docs: https://developers.thoughtspot.com/docs/css-rules
 */
const DARK_SURFACE = '#0c2337';
const DARK_INK = '#e7f2fa';
const surfaceRule = { 'background-color': `${DARK_SURFACE} !important`, color: `${DARK_INK} !important` };
export const TS_RULES_DARK: Record<string, Record<string, string>> = {
  // Text inputs / textareas / field wrappers.
  [[
    'input:not([type="checkbox"]):not([type="radio"])',
    'textarea',
    '[class*="input" i]',
    '[class*="field" i]',
    '[class*="searchbox" i]',
  ].join(',')]: { 'background-color': '#0b1d2b !important', color: `${DARK_INK} !important` },
  // Segmented controls / toggles / switchers (e.g. Quick Search | Deep Analysis).
  [[
    '[class*="toggle" i]',
    '[class*="switch" i]',
    '[class*="switcher" i]',
    '[class*="segment" i]',
  ].join(',')]: surfaceRule,
  // Dropdown / select header (dimension & filter pickers).
  '[data-testid="select-dropdown-header"]': { 'background-color': '#0b1d2b !important', color: `${DARK_INK} !important` },
  // Answer / conversation / Spotter / Sage surfaces + the conversations sidebar.
  // NOTE: `[class*="message"]` is scoped to chat containers only — a bare match
  // also hit the "Highlights are ready!" toast text wrapper and painted a
  // dark-surface box behind it. Chat bubbles live inside conversation/spotter/
  // sage/chat, so they still get the surface; the standalone toast does not.
  [[
    '[class*="answer" i]',
    '[class*="conversation" i]',
    '[class*="conversation" i] [class*="message" i]',
    '[class*="spotter" i] [class*="message" i]',
    '[class*="sage" i] [class*="message" i]',
    '[class*="chat" i] [class*="message" i]',
    '[class*="spotter" i]',
    '[class*="sage" i]',
    '[class*="sidebar" i]',
    '[class*="history" i]',
  ].join(',')]: surfaceRule,
  // Floating chrome — panels / modals / menus / footers.
  [[
    '[class*="modal" i]',
    '[class*="dialog" i]',
    '[class*="popover" i]',
    '[class*="flyout" i]',
    '[class*="drawer" i]',
    '[class*="data-panel" i]',
    '[class*="dataPanel" i]',
    '[class*="footer" i]',
  ].join(',')]: surfaceRule,
  // AI "Key insights" / KPI change-analysis narrative callouts (the sparkle text
  // tile) have no dedicated CSS variable and fall back to a dark default text
  // colour — unreadable on the dark tile. Force light text in dark mode. COLOUR
  // ONLY (no background) so KPI semantic up/down values stay green/coral and the
  // tile background from the variables is untouched.
  [[
    '[class*="insight" i]',
    '[class*="insight" i] *',
    '[class*="callout" i]',
    '[class*="callout" i] *',
    '[class*="narrative" i]',
    '[class*="narrative" i] *',
    '[class*="takeaway" i]',
    '[class*="takeaway" i] *',
    '[class*="analysis" i]',
    '[class*="analysis" i] *',
    '[class*="spotiq" i]',
    '[class*="spotiq" i] *',
  ].join(',')]: { color: `${DARK_INK} !important` },
  // ---- "AI Highlights" modal (Liveboard) ---------------------------------
  // This modal ignores the theme almost entirely: the shipped CSS hardcodes a
  // #eef5fb list pane, #fff cards with #b2bdc6 borders and a
  // `color:#0d3c60!important` on the category headings, while the card copy
  // reads from `--ts-var-dialog-body-color` — near-white in the dark theme.
  // Result: light-grey text on white cards. Repaint the panes/cards and
  // recolor the two hardcoded text bits. Class names come from the cluster
  // bundle (`liveboard-highlights-module__*`) and are version-fragile.
  '[class*="liveboard-highlights-module__highlightsListWrapper" i]': {
    'background-color': '#0b1d2b !important',
    'border-color': '#0d3c60 !important',
  },
  '[class*="liveboard-highlights-module__cardWrapper" i]': {
    'background-color': `${DARK_SURFACE} !important`,
    'border-color': '#0d3c60 !important',
  },
  '[class*="liveboard-highlights-module__cardWrapper" i]:hover': {
    'border-color': '#0077C8 !important',
  },
  '[class*="liveboard-highlights-module__cardActive" i]': {
    'border-color': '#0077C8 !important',
    'box-shadow': '0 0 0 1px #0077C8 !important',
  },
  // Card titles are a light-mode blue (#117ACA) and the section headings are
  // pinned to #0d3c60 !important — both illegible on a dark card.
  [[
    '[class*="liveboard-highlights-module__cardTitleWrapper" i]',
    '[class*="liveboard-highlights-module__cardTitleWrapper" i] *',
    '[class*="liveboard-highlights-module__categoryTitle" i]',
  ].join(',')]: { color: '#117ACA !important' },
  // Detail pane + the "Is this useful?" strip under it.
  [[
    '[class*="liveboard-highlights-module__highlightDetailsWrapper" i]',
    '[class*="liveboard-highlights-module__highlightFeedback" i]',
    '[class*="liveboard-highlights-module__aiAnswerFooterExpanded" i]',
  ].join(',')]: {
    'background-color': `${DARK_SURFACE} !important`,
    'border-color': '#0d3c60 !important',
    color: `${DARK_INK} !important`,
  },
  // Scrollbars in both panes are painted for a white background.
  [[
    '[class*="liveboard-highlights-module__highlightsListWrapper" i]::-webkit-scrollbar-track',
    '[class*="liveboard-highlights-module__highlightDetailContent" i]::-webkit-scrollbar-track',
  ].join(',')]: { 'background-color': '#0b1d2b !important' },
  [[
    '[class*="liveboard-highlights-module__highlightsListWrapper" i]::-webkit-scrollbar-thumb',
    '[class*="liveboard-highlights-module__highlightDetailContent" i]::-webkit-scrollbar-thumb',
  ].join(',')]: { 'background-color': '#0d3c60 !important' },
  // ---- "Change analysis" modal (Analyze change on a KPI) -----------------
  // Most of this modal already darkens via the `[class*="modal"]` surfaceRule
  // above, since every class is `change-analysis-modal-module__*`. What escapes
  // it is the summary table (ag-grid here, unlike the DevExtreme viz table) plus
  // a few chips/links that hardcode light-mode colours or ThoughtSpot blue.
  [[
    '[class*="summaryTabModal" i] .ag-header-row',
    '[class*="summaryTabModal" i] .ag-header',
    '[class*="summaryTabModal" i] .ag-header-viewport',
    '[class*="summaryTabModal" i] .ag-header-cell',
  ].join(',')]: {
    'background-color': '#0b1d2b !important',
    'border-bottom-color': '#0d3c60 !important',
  },
  '[class*="summaryTabModal" i] .ag-row': { 'border-color': '#0d3c60 !important' },
  '[class*="summaryTableHeaderText" i]': { color: '#bbc6ce !important' },
  // The grey pill beside the viz name and the history buttons both hardcode
  // `--rd-sys-color-background-secondary-action` (#e0edf8) with !important.
  [[
    '[class*="change-analysis-modal-module__customChip" i]',
    '[class*="historyControllerWrapper" i] button',
  ].join(',')]: {
    'background-color': '#072b45 !important',
    color: `${DARK_INK} !important`,
  },
  '[class*="change-analysis-modal-module__selectedAttribute" i]': {
    background: '#072b45 !important',
    color: `${DARK_INK} !important`,
  },
  [[
    '[class*="change-analysis-modal-module__attributeList" i]',
    '[class*="change-analysis-modal-module__loadingSection" i]',
  ].join(',')]: { 'border-color': '#0d3c60 !important' },
  // "View details" / "Analyze further" links and the insight bullets ship in
  // ThoughtSpot blue (#117ACA) — bring them onto the brand accent.
  [[
    '[class*="viewDetails" i]',
    '[class*="analyzeFurtherText" i]',
  ].join(',')]: { color: '#117ACA !important' },
  '[class*="additionalInsightSquare" i]': { 'background-color': '#117ACA !important' },
  '[class*="legendContainer__nonOutliersIndicator" i]': {
    'background-color': '#0d3c60 !important',
  },
  // ---- Spotter "Show work" / thinking panel ------------------------------
  // Two different components render here and they behave differently:
  //
  // 1. SpotterViz (the agent inside Liveboards) uses `tool-call-common-module__*`,
  //    which IS variable-driven — see the `--ts-var-spotterviz-tool-*` values in
  //    the theme above. Only its hardcoded slate bits need rules.
  // 2. SpotterEmbed's chat steps use `collapsible-item-response-module__*`, which
  //    exposes NO variables at all — it reads ThoughtSpot's design tokens
  //    straight (`--rd-sys-color-background-base` #ffffff for the card,
  //    `--rd-sys-color-background-on-base` #eef5fb for the JSON boxes), so it
  //    renders as a white panel inside the dark embed. Rules are the only hook.
  '[class*="collapsible-item-response-module__collapsibleItemContainer" i]': {
    'background-color': `${DARK_SURFACE} !important`,
    'border-color': '#0d3c60 !important',
  },
  [[
    '[class*="collapsible-item-response-module__jsonCodeBoxWrapper" i]',
    '[class*="collapsible-item-response-module__inputCopyButton" i]',
  ].join(',')]: {
    'background-color': '#0b1620 !important',
    'border-color': '#0d3c60 !important',
  },
  [[
    '[class*="collapsible-item-response-module__jsonCodeBox" i]',
    '[class*="collapsible-item-response-module__jsonCodeBox" i] code',
    '[class*="collapsible-item-response-module__jsonCodeBox" i] pre',
  ].join(',')]: { color: '#117ACA !important' },
  [[
    '[class*="collapsible-item-response-module__jsonCodeBoxHeader" i]',
    '[class*="collapsible-item-response-module__sectionLabel" i]',
  ].join(',')]: { color: '#939ea7 !important' },
  [[
    '[class*="collapsible-item-response-module__header" i]',
    '[class*="collapsible-item-response-module__title" i]',
    '[class*="collapsible-item-response-module__expandButton" i]',
    '[class*="collapsible-item-response-module__content" i]',
    '[class*="collapsible-item-response-module__sectionContent" i]',
    '[class*="collapsible-item-response-module__inputSection" i]',
    '[class*="collapsible-item-response-module__outputSection" i]',
  ].join(',')]: {
    'background-color': 'transparent !important',
    color: `${DARK_INK} !important`,
  },
  // The code card in Spotter answers has no variable either: it hardcodes
  // `--rd-sys-color-background-sunken` (#eef5fb). Two-class selectors to
  // out-specify ThoughtSpot's own nested rules.
  [[
    '[class*="spotterCodeCardWrapper" i] [class*="codeBlockWrapper" i]',
    '[class*="spotterCodeCardWrapper" i] [class*="codeBlockLines" i]',
    '[class*="spotter-code-block-module__codeBlockWrapper" i]',
  ].join(',')]: {
    'background-color': '#0b1620 !important',
    'border-color': '#0d3c60 !important',
  },
  [[
    '[class*="spotterCodeCardWrapper" i] [class*="codeBlock" i]',
    '[class*="spotter-code-block-module__codeBlock" i]',
  ].join(',')]: { color: `${DARK_INK} !important` },
  [[
    '[class*="spotterCodeCardWrapper" i] [class*="languageLabel" i]',
    '[class*="spotter-code-block-module__codeBlockHeader" i]',
  ].join(',')]: { color: '#939ea7 !important' },
  // SpotterViz card bits that hardcode slate rather than read a variable.
  '[class*="tool-call-common-module__separator" i]': {
    'background-color': '#0d3c60 !important',
  },
  [[
    '[class*="tool-call-common-module__datasetName" i]',
    '[class*="tool-call-common-module__action" i]',
  ].join(',')]: { color: `${DARK_INK} !important` },
  [[
    '[class*="tool-call-common-module__confidence" i]',
    '[class*="tool-call-common-module__vizId" i]',
  ].join(',')]: { color: '#939ea7 !important' },
};

/**
 * Welcome message for the host-owned JpmorganChase AI chatbot
 * (from jpmorgan-chase_fin.json > appConfig.chatbot.welcomeMessage, lightly adapted).
 */
export const CHATBOT_WELCOME = CONTENT.chatbot.welcome;

/** Greeting + data model used when the chatbot is opened on the Carriers tab. */
export const CHATBOT_CADENCES_WELCOME =
  'What would you like to know about the carriers shown here?';

/** Spotter icon sprite (magician/spotter icon) from jpmorgan-chase_fin.json. */
export const TS_ICON_SPRITE_URL =
  'https://cdn.jsdelivr.net/gh/thoughtspot/tse-demo-builders-pre-built/icons/spotter/generic-02.svg';

/**
 * String customizations — replace "Spotter" with "JpmorganChase AI" everywhere,
 * plus the landing-page description override (from
 * jpmorgan-chase_fin.json > stylingConfig.embeddedContent.strings / stringIDs).
 */
export const TS_STRINGS: Record<string, string> = {
  Spotter: CONTENT.aiName,
};

export const TS_STRING_IDS: Record<string, string> = {
  'convAssist.landingpage.description2': 'Ask a question about sales.',
};

// ---------------------------------------------------------------------------
// Embed flags — from jpmorgan-chase_fin.json > stylingConfig.embedFlags
// ---------------------------------------------------------------------------

export const LIVEBOARD_EMBED_FLAGS = {
  enable2ColumnLayout: true,
  isLiveboardStylingAndGroupingEnabled: true,
  // Masterpiece layout — richer KPI/headline tile styling & grouping.
  // https://developers.thoughtspot.com/docs/Interface_LiveboardViewConfig#_isliveboardmasterpiecesenabled
  isLiveboardMasterpiecesEnabled: true,
};

export const SPOTTER_EMBED_FLAGS = {
  updatedSpotterChatPrompt: true,
  spotterSidebarConfig: {
    enablePastConversationsSidebar: true,
    spotterSidebarTitle: 'My Conversations',
    // Start collapsed so the answer canvas gets full width when Spotter opens.
    spotterSidebarDefaultExpanded: false,
  },
};

/**
 * Extra customCSS rules injected into every embed so ThoughtSpot's own buttons
 * carry the JpmorganChase blue↔green gradient and the KPI (headline) tiles pop with the
 * brand gradient. ThoughtSpot class names are version-dependent — these use
 * broad candidate selectors; if a surface isn't picked up, Inspect the iframe
 * and tighten the selector to the real class name.
 */
export const JpmorganChase_EMBED_RULES: Record<string, Record<string, string>> = {
  // No gradient on KPI tiles / viz titles by default — embeds use ThoughtSpot's
  // native styling, which already follows the theme via the CSS variables above.
  // Only brand the AI / Spotter header button (an off-brand green pill on some
  // clusters) with a SOLID color. To opt into brand gradients on KPIs/titles,
  // add background linear-gradient rules here (buttons must stay solid).
  '[class*="aiHighlight" i], [class*="ai-highlight" i], [class*="AIHighlights" i], [data-testid*="AIHighlight" i], [class*="spotterLaunch" i], [class*="spotter-button" i], [class*="spotter" i][class*="btn" i]:not([class*="spotterButtonStyles" i]), [class*="spotter" i][class*="button" i]:not([class*="spotterButtonStyles" i]), [class*="spotter" i][class*="pill" i], [class*="spotter" i][class*="nudge" i], [class*="sage-button" i], [class*="sage" i][class*="btn" i], [class*="sage" i][class*="button" i], [class*="sage" i][class*="pill" i], [class*="askSage" i], [class*="ask-sage" i], [class*="nudge" i]':
    {
      background: '#117ACA !important',
      'background-image': 'none !important',
      color: '#ffffff !important',
      'border-color': 'transparent !important',
    },
};

/** Google-Fonts stylesheet loaded INTO embed iframes so embedded ThoughtSpot
 * surfaces render in the same faces as the host UI (Plus Jakarta Sans for text,
 * Fraunces for titles) — iframes can't see the host page's fonts. customCSSUrl.
 */
export const TS_FONT_URL =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";

/** "Watch video" link shown in the JpmorganChase AI pane. */
export const JpmorganChase_VIDEO_URL = 'https://www.jpmorgan-chase.com/platform/conversations';

/** Sample questions shown on the custom JpmorganChase AI landing pane. */
export const JpmorganChase_SAMPLE_QUESTIONS = [...CONTENT.sampleQuestions];

/** Trial / upgrade prompt shown in the JpmorganChase AI pane after the 2nd query. */
export const JpmorganChase_TRIAL_QUESTIONS = 20;
export const TRIAL_TRIGGER = CONTENT.trialQuestionTrigger;
export const JpmorganChase_UPGRADE_URL = CONTENT.website + '/pricing';

/**
 * Hide the Spotter embed's own composer / input bar on the JpmorganChase AI screen
 * — questions are driven from the host-side pane on the right, so the in-embed
 * "Enter your question" box (and its Quick/Deep toggle) is redundant. Injected
 * via rules_UNSTABLE. Class names are version-fragile; verify via Inspect if a
 * release renames them.
 */
/**
 * Spotter answer-action buttons — Pin / Save / Edit / Add to memory.
 *
 * These are NOT primary buttons, despite what the CSS-variables reference
 * implies. In the shipped stylesheet they are tertiary-styled: transparent
 * background, label + icon coloured from `--ts-var-button--tertiary-color`,
 * e.g.
 *   .conv-assist-answer-module__caAnswerAction.conv-assist-answer-module__spotterButtonStyles p
 *   .conv-assist-edit-button-module__editActionsButton.conv-assist-edit-button-module__spotterButtonStyles
 *
 * They turn brand-coloured because ThoughtSpot's CSS modules name these classes
 * `…spotterButtonStyles`, so the branding rule's
 * `[class*="spotter"][class*="button"]` selector matches them and fills them
 * `!important` — which no CSS variable can beat. `spotterCustomizations` drops
 * that rule inside the Spotter embeds; these rules then clear the dark surface
 * fill that TS_RULES_DARK puts on anything matching `[class*="answer"]`, so the
 * actions sit flat next to Download and the "…" menu.
 */
const TRANSPARENT = {
  background: 'transparent !important',
  'background-color': 'transparent !important',
  'border-color': 'transparent !important',
  'box-shadow': 'none !important',
};
export const SPOTTER_ANSWER_ACTION_RULES: Record<string, Record<string, string>> = {
  [[
    '[class*="spotterButtonStyles" i]',
    '[class*="caAnswerAction" i]',
    '[class*="convAssistPinnerContainer" i]',
    '[class*="editActionsButton" i]',
    '[class*="spotterButtonStyles" i] button',
    '[class*="caAnswerAction" i] button',
  ].join(',')]: TRANSPARENT,
};

/**
 * Spotter landing page — kill the radial "flashlight" wrapper outright, in
 * addition to blanking the two `--ts-var-spotter-landing-bg-*` variables, so
 * the greeting + composer sit on a flat background.
 *   .spotter-landing-page-background-module__backgroundWrapper
 */
export const SPOTTER_LANDING_FLAT_RULES: Record<string, Record<string, string>> = {
  '[class*="spotter-landing-page-background" i]': {
    background: 'none !important',
    'background-image': 'none !important',
    opacity: '0 !important',
  },
};

const HIDE = { display: 'none !important' };
export const HIDE_SPOTTER_INPUT_RULES: Record<string, Record<string, string>> = {
  '[class*="composer" i]': HIDE,
  '[class*="promptInput" i]': HIDE,
  '[class*="prompt-input" i]': HIDE,
  '[class*="chatInput" i]': HIDE,
  '[class*="chat-input" i]': HIDE,
  '[class*="conversationInput" i]': HIDE,
  '[class*="conversation-input" i]': HIDE,
  '[class*="conversationFooter" i]': HIDE,
  '[class*="conversation-footer" i]': HIDE,
  '[class*="bottomBar" i]': HIDE,
  '[class*="searchInputContainer" i]': HIDE,
  '[data-testid*="conversation-input" i]': HIDE,
  '[data-testid*="spotter-input" i]': HIDE,
};

// ---------------------------------------------------------------------------
// Host-side filters on the Analytics liveboard.
//   Hierarchy: OWNER_COLUMN → CADENCE_NAME_COLUMN. Date: DATE_COLUMN.
// Option lists are fetched from FILTER_SOURCE_ID via the searchdata REST API;
// selections are pushed to the liveboard as runtime filters. Column names must
// match the data source's column display names for the runtime filter to bind.
//   Runtime filters: https://developers.thoughtspot.com/docs/runtime-filters
// ---------------------------------------------------------------------------

/**
 * Model queried for the filter option lists (same model the liveboard uses).
 * Hierarchy: SEGMENT_COLUMN → REP_COLUMN → CADENCE_NAME_COLUMN. Date: DATE_COLUMN.
 */
export const FILTER_SOURCE_ID = WORKSHEET_ID;
export const SEGMENT_COLUMN = 'Traveler Segment Name';
export const REP_COLUMN = 'Traveler Segment Name';
export const CADENCE_NAME_COLUMN = 'Travel Category Name';
export const DATE_COLUMN = 'Booking Date';

/**
 * Hide the native runtime-filter pills / filter bar ThoughtSpot renders on the
 * liveboard header — we drive filters from the host UI instead. Injected into
 * the liveboard iframe via rules_UNSTABLE. Class names are version-fragile;
 * verify/adjust via right-click → Inspect if a release renames them.
 *   Docs: https://developers.thoughtspot.com/docs/css-rules
 */
const PILL_HIDE = { display: 'none !important' };
export const HIDE_FILTER_PILL_RULES: Record<string, Record<string, string>> = {
  '[class*="filterChip" i]': PILL_HIDE,
  '[class*="filter-chip" i]': PILL_HIDE,
  '[class*="appliedFilter" i]': PILL_HIDE,
  '[class*="applied-filter" i]': PILL_HIDE,
  '[class*="pinboardFilter" i]': PILL_HIDE,
  '[class*="pinboard-filter" i]': PILL_HIDE,
  '[class*="filterBar" i]': PILL_HIDE,
  '[class*="filter-bar" i]': PILL_HIDE,
  '[data-testid*="filter-chip" i]': PILL_HIDE,
  '[data-testid*="pinboard-filters" i]': PILL_HIDE,
};

