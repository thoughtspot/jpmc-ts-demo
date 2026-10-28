import { init, AuthType } from '@thoughtspot/visual-embed-sdk';
import {
  THOUGHTSPOT_HOST,
  CADENCE_WORKSHEET_ID,
  CADENCE_COLUMN_CANDIDATES,
  CADENCE_DETAIL_COLUMNS,
  ORG_COLUMN_CANDIDATES,
  JpmorganChase_ORG_ID,
  TS_CSS_VARIABLES,
  TS_ICON_SPRITE_URL,
  TS_STRINGS,
  TS_STRING_IDS,
  TS_FONT_URL,
  FILTER_SOURCE_ID,
  SEGMENT_COLUMN,
  REP_COLUMN,
  CADENCE_NAME_COLUMN,
  HIDE_FILTER_PILL_RULES,
  TS_RULES_DARK,
  JpmorganChase_EMBED_RULES,
  SPOTTER_ANSWER_ACTION_RULES,
  SPOTTER_LANDING_FLAT_RULES,
  tsVarsFor,
  ThemeName,
  TS_TOKEN_ENDPOINT,
} from '../config';

// --- Token auth: the token service (via our server) mints a token for the
// login-screen user for the embeds (cookieless), and the same token is sent as a
// Bearer header on REST calls.

/** User the SDK was initialised for (and whose token is cached); null = not yet. */
let tokenUsername: string | null = null;
let tokenPromise: Promise<string> | null = null;

/** /api/ts-token status when the token service won't issue a token for the user. */
const USERNAME_REJECTED_STATUS = 403;

/** Thrown when the login-screen username isn't allowed by the token service. */
export class UsernameNotAllowedError extends Error {}

/** Fetch a fresh token from the server-side endpoint and cache it for REST calls. */
async function fetchAuthToken(): Promise<string> {
  const pending = (async () => {
    const res = await fetch(TS_TOKEN_ENDPOINT, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: tokenUsername }),
    });
    if (res.status === USERNAME_REJECTED_STATUS) {
      throw new UsernameNotAllowedError(`Username not allowed: ${tokenUsername}`);
    }
    if (!res.ok) {
      // Vercel puts its own error code (e.g. FUNCTION_INVOCATION_FAILED) in this header.
      const vercelError = res.headers.get('x-vercel-error');
      const detail = (await res.text()).slice(0, 200);
      console.error('[ts-token] request failed', { status: res.status, vercelError, detail });
      throw new Error(`Token request failed (${res.status}${vercelError ? ` ${vercelError}` : ''})`);
    }
    return res.text();
  })();
  tokenPromise = pending;
  try {
    return await pending;
  } catch (err) {
    if (tokenPromise === pending) tokenPromise = null; // don't cache a failure
    throw err;
  }
}

async function restHeaders(): Promise<Record<string, string>> {
  const token = await (tokenPromise ?? fetchAuthToken());
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Initialise the ThoughtSpot Visual Embed SDK with JpmorganChase styling.
 * Styling (CSS variables + spotter icon) comes straight from jpmorgan-chase_fin.json
 * so every embed across the three tabs shares the exact same theme.
 */
export function initThoughtSpot(username: string, password: string) {
  if (tokenUsername === username) return;
  // Cookieless trusted auth → the SDK calls getAuthToken whenever it needs a
  // (new) token, minted for the login-screen username. The password is ignored.
  void password;
  // A different user signing in must not reuse the previous user's token.
  tokenUsername = username;
  tokenPromise = null;
  init({
    thoughtSpotHost: THOUGHTSPOT_HOST,
    authType: AuthType.TrustedAuthTokenCookieless,
    getAuthToken: fetchAuthToken,
    customizations: {
      style: {
        // Load Inter + Fraunces into the iframe so embeds match the host fonts.
        customCSSUrl: TS_FONT_URL,
        customCSS: { variables: TS_CSS_VARIABLES },
      },
      iconSpriteUrl: TS_ICON_SPRITE_URL,
      // Global text overrides — replaces "Spotter" -> "JpmorganChase AI" (and the
      // landing-page string) as substrings across every embed. Set in init()
      // so it applies to Liveboard, Search/Answer, Spotter and the chatbot.
      content: {
        strings: TS_STRINGS,
        stringIDs: TS_STRING_IDS,
      },
    },
  });
}

/** Shared `customizations` block for every embedded ThoughtSpot component. */
export function tsCustomizations(
  theme: ThemeName,
  withStringReplacements = false,
  extraRules?: Record<string, Record<string, string>>,
) {
  // Merge the dark-only surface rules with any per-embed extra rules.
  const rules = {
    ...JpmorganChase_EMBED_RULES,
    ...(theme === 'dark' ? TS_RULES_DARK : {}),
    ...(extraRules ?? {}),
  };
  const hasRules = Object.keys(rules).length > 0;
  return {
    style: {
      // Load Inter + Fraunces into the iframe so embeds match the host fonts.
      customCSSUrl: TS_FONT_URL,
      customCSS: {
        variables: tsVarsFor(theme),
        ...(hasRules ? { rules_UNSTABLE: rules } : {}),
      },
    },
    iconSpriteUrl: TS_ICON_SPRITE_URL,
    ...(withStringReplacements
      ? { content: { strings: TS_STRINGS, stringIDs: TS_STRING_IDS } }
      : {}),
  };
}

/**
 * Customizations for the Spotter embeds (Spotter tab, Ask <brand>, and the
 * Spotter panel on Analytics).
 *
 * Same theme as every other embed, minus JpmorganChase_EMBED_RULES: that rule
 * paints `[class*="spotter"][class*="button"]` with the brand fill to brand the
 * Spotter *launch* pill in Liveboard/Answer embeds — which never renders inside
 * the Spotter embed itself. ThoughtSpot's own CSS modules name the answer
 * actions `…spotterButtonStyles`, so the selector was matching Pin / Save /
 * Edit / Add to memory and overriding every CSS variable with !important.
 * SPOTTER_ANSWER_ACTION_RULES then flattens their background so they read like
 * the neighbouring Download and "…" actions, and SPOTTER_LANDING_FLAT_RULES
 * kills the radial glow behind the landing composer.
 */
export function spotterCustomizations(
  theme: ThemeName,
  extraRules?: Record<string, Record<string, string>>,
) {
  return {
    style: {
      customCSSUrl: TS_FONT_URL,
      customCSS: {
        variables: tsVarsFor(theme),
        rules_UNSTABLE: {
          ...(theme === 'dark' ? TS_RULES_DARK : {}),
          ...SPOTTER_ANSWER_ACTION_RULES,
          ...SPOTTER_LANDING_FLAT_RULES,
          ...(extraRules ?? {}),
        },
      },
    },
    iconSpriteUrl: TS_ICON_SPRITE_URL,
    content: { strings: TS_STRINGS, stringIDs: TS_STRING_IDS },
  };
}

/**
 * Customizations for the Analytics liveboard — the active-theme JpmorganChase
 * styling, the rules that hide ThoughtSpot's native filter pills/bar, and a
 * direct override for the on-viz action buttons' hover background.
 *
 * The viz action buttons (bell / "JpmorganChase AI" / …) read their hover bg from
 * `--ts-var-liveboard-header-action-button-hover-color`, but overriding that
 * variable had no effect (the button falls back to a near-white translucent
 * grey). So we target the exact ThoughtSpot rule seen in DevTools —
 * `…vizStyling …buttonWrapper button:hover` — with a color-only !important
 * override that contrasts with the (theme-dependent) label. Background-color
 * only, so it can't affect layout.
 */
export function liveboardCustomizations(theme: ThemeName) {
  const hoverBg = theme === 'dark' ? '#072b45' : '#dbebf7';
  const activeBg = theme === 'dark' ? '#0d3c60' : '#c9e0f3';
  const btnHoverRules: Record<string, Record<string, string>> = {
    '[class*="vizStyling" i] [class*="buttonWrapper" i] button:hover': {
      'background-color': `${hoverBg} !important`,
    },
    '[class*="vizStyling" i] [class*="buttonWrapper" i] button:active': {
      'background-color': `${activeBg} !important`,
    },
  };
  // Active liveboard tab → brand green (the CSS variable had no effect, so
  // drive it directly). Semantic role/aria selectors first, then class-based
  // fallbacks for the label + the underline indicator. Colour/background only.
  const tabGreen = theme === 'dark' ? '#117ACA' : '#117ACA';
  const tabRules: Record<string, Record<string, string>> = {
    '[role="tab"][aria-selected="true"]': {
      color: `${tabGreen} !important`,
      'border-bottom-color': `${tabGreen} !important`,
    },
    '[role="tab"][aria-selected="true"] *': {
      color: `${tabGreen} !important`,
    },
    '[class*="pinboard-tab" i][class*="active" i], [class*="pinboardTab" i][class*="active" i], [class*="pinboard-tab" i][class*="selected" i], [class*="pinboardTab" i][class*="selected" i]':
      {
        color: `${tabGreen} !important`,
        'border-bottom-color': `${tabGreen} !important`,
      },
    '[class*="tab" i][class*="indicator" i], [class*="tab" i][class*="underline" i], [class*="tab" i][class*="activeBar" i]':
      {
        'background-color': `${tabGreen} !important`,
        'border-color': `${tabGreen} !important`,
      },
  };
  // Custom-JS charts (funnel, gauges) render their HTML/SVG labels using
  // ThoughtSpot's internal `--font-family` var (optimo-plain…), which overrides
  // the chart's own `#chart { font-family }` and ignores --ts-var-root-font-family.
  // Override `--font-family` and force the chart label elements to the app font.
  const APP_FONT = "'Inter', 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif";
  const chartFontRules: Record<string, Record<string, string>> = {
    ':root': { '--font-family': `${APP_FONT} !important` },
    [[
      '#chart',
      '#chart *',
      '[class*="kpi-card" i]',
      '[class*="kpi-card" i] *',
      '[class*="gauge" i]',
      '[class*="gauge" i] *',
      '[class*="funnel" i]',
      '[class*="funnel" i] *',
    ].join(',')]: { 'font-family': `${APP_FONT} !important` },
  };
  return tsCustomizations(theme, false, {
    ...HIDE_FILTER_PILL_RULES,
    ...btnHoverRules,
    ...tabRules,
    ...chartFontRules,
  });
}

// ---------------------------------------------------------------------------
// Hierarchical filter data — distinct Rep Segment → Rep Name → Cadence Name
// tuples, pulled via the searchdata REST API against FILTER_SOURCE_ID. Feeds the
// tree filter on the Analytics tab; selections are pushed to the liveboard as
// runtime filters.
//   Docs: https://developers.thoughtspot.com/docs/rest-apiv2-reference
// ---------------------------------------------------------------------------

export interface RepNode {
  rep: string;
  cadences: string[];
}
export interface SegmentNode {
  segment: string;
  reps: RepNode[];
}

export async function fetchSegmentRepHierarchy(
  username: string,
  password: string,
): Promise<SegmentNode[]> {
  await ensureRestSession(username, password);
  const res = await fetch(`${THOUGHTSPOT_HOST}/api/rest/2.0/searchdata`, {
    method: 'POST',
    headers: await restHeaders(),
    body: JSON.stringify({
      // Bracketed column names → ThoughtSpot search tokens for the three columns.
      query_string: `[${SEGMENT_COLUMN}] [${REP_COLUMN}] [${CADENCE_NAME_COLUMN}]`,
      logical_table_identifier: FILTER_SOURCE_ID,
      data_format: 'COMPACT',
      record_size: 50000,
    }),
  });
  if (!res.ok) {
    throw new Error(`searchdata failed (${res.status}): ${(await res.text()).slice(0, 200)}`);
  }
  const data = await res.json();
  const rows: any[] = data.contents?.[0]?.data_rows ?? [];
  // segment -> rep -> set(cadence)
  const tree = new Map<string, Map<string, Set<string>>>();
  for (const r of rows) {
    const segment = String(r?.[0] ?? '').trim();
    const rep = String(r?.[1] ?? '').trim();
    const cadence = String(r?.[2] ?? '').trim();
    if (!segment) continue;
    if (!tree.has(segment)) tree.set(segment, new Map());
    const repMap = tree.get(segment)!;
    if (!rep) continue;
    if (!repMap.has(rep)) repMap.set(rep, new Set());
    if (cadence) repMap.get(rep)!.add(cadence);
  }
  return [...tree.entries()]
    .map(([segment, repMap]) => ({
      segment,
      reps: [...repMap.entries()]
        .map(([rep, cadences]) => ({ rep, cadences: [...cadences].sort() }))
        .sort((a, b) => a.rep.localeCompare(b.rep)),
    }))
    .sort((a, b) => a.segment.localeCompare(b.segment));
}

/** Distinct Rep Name values, for the standalone Rep dropdown filter. */
export async function fetchRepNames(username: string, password: string): Promise<string[]> {
  await ensureRestSession(username, password);
  const res = await fetch(`${THOUGHTSPOT_HOST}/api/rest/2.0/searchdata`, {
    method: 'POST',
    headers: await restHeaders(),
    body: JSON.stringify({
      query_string: `[${REP_COLUMN}]`,
      logical_table_identifier: FILTER_SOURCE_ID,
      data_format: 'COMPACT',
      record_size: 50000,
    }),
  });
  if (!res.ok) {
    throw new Error(`searchdata failed (${res.status}): ${(await res.text()).slice(0, 200)}`);
  }
  const data = await res.json();
  const rows: any[] = data.contents?.[0]?.data_rows ?? [];
  const set = new Set<string>();
  for (const r of rows) {
    const rep = String(r?.[0] ?? '').trim();
    if (rep) set.add(rep);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

// ---------------------------------------------------------------------------
// REST API v2 helpers (used by the "My Analytics" tab)
// ---------------------------------------------------------------------------

export interface LiveboardSummary {
  id: string;
  name: string;
  description: string;
  authorName: string;
  authorDisplayName: string;
  modified: number; // epoch ms
  views?: number;
}

/**
 * Make sure a token is available for REST calls. Credentials are ignored — the
 * token is issued for the user initThoughtSpot was called with.
 */
export async function ensureRestSession(username: string, password: string) {
  void username;
  void password;
  await (tokenPromise ?? fetchAuthToken());
}

async function metadataSearch(body: unknown): Promise<any[]> {
  const res = await fetch(
    `${THOUGHTSPOT_HOST}/api/rest/2.0/metadata/search`,
    {
      method: 'POST',
      headers: await restHeaders(),
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    let detail = '';
    try {
      detail = (await res.text()).slice(0, 200);
    } catch {
      /* ignore */
    }
    throw new Error(
      `metadata/search failed (${res.status})${detail ? `: ${detail}` : ''}`,
    );
  }
  const data = await res.json();
  // v2.0 returns a plain array; tolerate { records } / { data } shapes too.
  if (Array.isArray(data)) return data;
  return data.records ?? data.data ?? [];
}

function mapResult(item: any): LiveboardSummary {
  const header = item.metadata_header ?? item.header ?? {};
  return {
    id: item.metadata_id ?? item.id ?? header.id,
    name: item.metadata_name ?? header.name ?? 'Untitled liveboard',
    description: header.description ?? '',
    authorName: header.authorName ?? item.author_name ?? '',
    authorDisplayName:
      header.authorDisplayName ?? header.authorName ?? item.author_name ?? '',
    modified: header.modified ?? item.modified ?? 0,
    views: item.stats?.views ?? header.views,
  };
}

/**
 * Fetch every liveboard the signed-in user can access (mirrors the
 * "My Reports" listing in jpmorgan-chase_fin.json). Sorted most-recently-modified
 * first. No author filter — the REST API already scopes results to objects the
 * caller has read access to.
 */
export async function searchLiveboards(
  username: string,
  password: string,
): Promise<LiveboardSummary[]> {
  await ensureRestSession(username, password);
  const raw = await metadataSearch({
    metadata: [{ type: 'LIVEBOARD' }],
    record_size: -1,
    record_offset: 0,
  });
  return raw
    .map(mapResult)
    .filter((lb) => !!lb.id)
    .sort((a, b) => b.modified - a.modified);
}

export function liveboardUrl(id: string): string {
  return `${THOUGHTSPOT_HOST}/#/pinboard/${id}`;
}

// ---------------------------------------------------------------------------
// Create a new (empty) liveboard via REST (TML import), returning its GUID.
// ---------------------------------------------------------------------------

const GUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function extractNewGuid(data: any): string | undefined {
  const items = Array.isArray(data) ? data : [data];

  // Surface an import error if ThoughtSpot returned one (status != OK).
  for (const item of items) {
    const status = item?.response?.status ?? item?.status;
    const code = status?.status_code ?? status?.code;
    if (code && String(code).toUpperCase() !== 'OK') {
      throw new Error(
        status?.error_message ??
          status?.errorMessage ??
          JSON.stringify(status).slice(0, 200),
      );
    }
  }

  // Precise, ordered paths for the created object's GUID.
  for (const item of items) {
    const candidates = [
      item?.response?.header?.id_guid,
      item?.response?.header?.metadata_id_guid,
      item?.header?.id_guid,
      item?.metadata_id_guid,
      item?.id_guid,
    ];
    for (const c of candidates) {
      if (typeof c === 'string' && GUID_RE.test(c)) return c;
    }
  }

  // Fallback: scan, but only for the canonical GUID keys (not author/org ids).
  let found: string | undefined;
  const walk = (o: any) => {
    if (found || !o || typeof o !== 'object') return;
    for (const [k, v] of Object.entries(o)) {
      if (found) return;
      if (
        /^(id_guid|metadata_id_guid|guid)$/i.test(k) &&
        typeof v === 'string' &&
        GUID_RE.test(v)
      ) {
        found = v;
        return;
      }
      if (v && typeof v === 'object') walk(v);
    }
  };
  walk(data);
  return found;
}

/** Create a new empty liveboard and return its GUID + name. */
export async function createLiveboard(
  username: string,
  password: string,
  name = 'New Dashboard',
  description = '',
): Promise<{ id: string; name: string }> {
  await ensureRestSession(username, password);
  // Minimal liveboard TML (YAML). JSON.stringify quotes/escapes the values.
  const tml =
    `liveboard:\n  name: ${JSON.stringify(name)}\n` +
    `  description: ${JSON.stringify(description)}\n`;
  const res = await fetch(
    `${THOUGHTSPOT_HOST}/api/rest/2.0/metadata/tml/import`,
    {
      method: 'POST',
      headers: await restHeaders(),
      body: JSON.stringify({
        metadata_tmls: [tml],
        import_policy: 'ALL_OR_NONE',
        create_new: true,
      }),
    },
  );
  const text = await res.text();
  if (!res.ok) {
    throw new Error(
      `Create liveboard failed (${res.status})${text ? `: ${text.slice(0, 200)}` : ''}`,
    );
  }
  const data = JSON.parse(text);
  // Logged so the exact tml/import response shape is inspectable in DevTools.
  console.log('[create-liveboard] import response:', data);
  const guid = extractNewGuid(data);
  console.log('[create-liveboard] extracted GUID:', guid);
  if (!guid) {
    throw new Error(`Liveboard created but no GUID was returned: ${text.slice(0, 200)}`);
  }
  return { id: guid, name };
}

// ---------------------------------------------------------------------------
// Search Data API — used by the "Inline Insights" tab to list cadence names
// ---------------------------------------------------------------------------

export interface CadenceDetail {
  label: string;
  format: 'text' | 'date' | 'number' | 'currency';
  value: string;
}

export interface CadenceRow {
  name: string;
  details: CadenceDetail[];
}

export interface CadenceData {
  /** The model column that held the process names (also the filter column). */
  column: string;
  /** The resolved org-id column, if the org filter matched (for viz filtering). */
  orgColumn?: string;
  cadences: CadenceRow[];
}

async function searchData(
  queryString: string,
  recordSize = 1000,
): Promise<{ column_names: string[]; data_rows: any[] } | null> {
  const res = await fetch(`${THOUGHTSPOT_HOST}/api/rest/2.0/searchdata`, {
    method: 'POST',
    headers: await restHeaders(),
    body: JSON.stringify({
      query_string: queryString,
      logical_table_identifier: CADENCE_WORKSHEET_ID,
      data_format: 'COMPACT',
      record_size: recordSize,
    }),
  });
  if (!res.ok) return null; // let the caller try the next candidate column
  const data = await res.json();
  const c = data.contents?.[0];
  return c ? { column_names: c.column_names, data_rows: c.data_rows } : null;
}

function cell(row: any, index: number, columnNames: string[]): string {
  const value = Array.isArray(row) ? row[index] : row[columnNames[index]];
  return value == null ? '' : String(value).trim();
}

function formatDetail(raw: string, format: CadenceDetail['format']): string {
  if (!raw) return '—';
  if (format === 'date') {
    const num = Number(raw);
    // ThoughtSpot COMPACT often returns epoch seconds for date columns.
    if (!Number.isNaN(num) && /^\d{9,13}$/.test(raw)) {
      const ms = raw.length <= 10 ? num * 1000 : num;
      return new Date(ms).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return raw;
  }
  const num = Number(raw);
  if (format === 'number') {
    return Number.isNaN(num) ? raw : num.toLocaleString('en-US');
  }
  if (format === 'currency') {
    if (Number.isNaN(num)) return raw;
    const abs = Math.abs(num);
    if (abs >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    if (abs >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
    return `$${num.toLocaleString('en-US')}`;
  }
  return raw;
}

/**
 * Fetch the distinct values of a single column for a host-side dropdown filter.
 * Tries each candidate column name; returns the first that resolves along with
 * the resolved column (so the caller can push a runtime filter on it).
 */
export async function fetchColumnValues(
  username: string,
  password: string,
  candidates: string[],
): Promise<{ column: string; values: string[] }> {
  await ensureRestSession(username, password);
  for (const col of candidates) {
    const result = await searchData(`[${col}]`);
    if (!result || !result.data_rows?.length) continue;
    const seen = new Set<string>();
    for (const row of result.data_rows) {
      const v = cell(row, 0, result.column_names);
      if (v) seen.add(v);
    }
    if (seen.size) {
      return {
        column: col,
        values: Array.from(seen).sort((a, b) =>
          a.localeCompare(b, undefined, { numeric: true }),
        ),
      };
    }
  }
  return { column: candidates[0], values: [] };
}

/** Resolve a "[process] [metric]" pairing into a process→value map. */
async function fetchMetricMap(
  cadenceCol: string,
  candidates: string[],
  orgClause = '',
): Promise<Map<string, string> | null> {
  for (const candidate of candidates) {
    const result = await searchData(`[${cadenceCol}] [${candidate}]${orgClause}`, 2000);
    if (!result || !result.data_rows?.length) continue;
    const map = new Map<string, string>();
    for (const row of result.data_rows) {
      const key = cell(row, 0, result.column_names);
      if (key && !map.has(key)) map.set(key, cell(row, 1, result.column_names));
    }
    if (map.size) return map;
  }
  return null;
}

/**
 * Fetch cadence names plus their owner / created date / emails replied /
 * influenced pipeline. Each metric column is resolved from candidate names
 * (first match wins); metrics with no match are omitted. Returns the resolved
 * cadence column so the Inline Insights tab can use it as a runtime filter.
 */
export async function fetchCadences(
  username: string,
  password: string,
): Promise<CadenceData> {
  await ensureRestSession(username, password);

  let cadenceCol = '';
  let names: string[] = [];
  for (const col of CADENCE_COLUMN_CANDIDATES) {
    const result = await searchData(`[${col}]`);
    if (!result || !result.data_rows?.length) continue;
    const seen = new Set<string>();
    for (const row of result.data_rows) {
      const name = cell(row, 0, result.column_names);
      if (name) seen.add(name);
    }
    if (seen.size) {
      cadenceCol = col;
      names = Array.from(seen).sort((a, b) => a.localeCompare(b));
      break;
    }
  }
  if (!cadenceCol) {
    throw new Error(
      `No process column found on the model (tried: ${CADENCE_COLUMN_CANDIDATES.join(
        ', ',
      )}).`,
    );
  }

  // Resolve the org-scoping filter: find the first org column that returns data
  // when filtered to JpmorganChase_ORG_ID. If none work, fall back to the unfiltered
  // list rather than showing nothing.
  let orgClause = '';
  let orgColumn = '';
  for (const orgCol of ORG_COLUMN_CANDIDATES) {
    const r = await searchData(`[${cadenceCol}] [${orgCol}] = '${JpmorganChase_ORG_ID}'`);
    if (r && r.data_rows?.length) {
      orgClause = ` [${orgCol}] = '${JpmorganChase_ORG_ID}'`;
      orgColumn = orgCol;
      // Re-scope the process names to this org.
      const scoped = new Set<string>();
      for (const row of r.data_rows) {
        const n = cell(row, 0, r.column_names);
        if (n) scoped.add(n);
      }
      if (scoped.size) names = Array.from(scoped).sort((a, b) => a.localeCompare(b));
      break;
    }
  }
  if (!orgClause) {
    console.warn(
      `[jpmorgan-chase] No org column matched ${JpmorganChase_ORG_ID} (tried: ${ORG_COLUMN_CANDIDATES.join(
        ', ',
      )}). Showing the unfiltered process list.`,
    );
  }

  // Resolve each detail metric in parallel (org-scoped).
  const metricKeys = Object.keys(CADENCE_DETAIL_COLUMNS) as Array<
    keyof typeof CADENCE_DETAIL_COLUMNS
  >;
  const maps = await Promise.all(
    metricKeys.map((k) =>
      fetchMetricMap(cadenceCol, CADENCE_DETAIL_COLUMNS[k].candidates, orgClause),
    ),
  );

  const cadences: CadenceRow[] = names.map((name) => {
    const details: CadenceDetail[] = [];
    metricKeys.forEach((key, i) => {
      const map = maps[i];
      if (!map) return;
      const spec = CADENCE_DETAIL_COLUMNS[key];
      details.push({
        label: spec.label,
        format: spec.format,
        value: formatDetail(map.get(name) ?? '', spec.format),
      });
    });
    return { name, details };
  });

  return { column: cadenceCol, orgColumn: orgColumn || undefined, cadences };
}
