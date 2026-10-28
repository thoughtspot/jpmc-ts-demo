// ---------------------------------------------------------------------------
// Turns a ThoughtSpot CustomAction payload (fired from a viz context menu) into
// a structured context for the custom-action modal.
//
// Context-menu payload (CustomActionPayload):
//   payload.data.contextMenuPoints = { clickedPoint: VizPoint, selectedPoints: VizPoint[] }
//   payload.data.embedAnswerData   = { columns: [{ column: { id, name } }],
//                                      data: [{ columnDataLite: [{ columnId, dataValue: [] }] }] }
//
// A VizPoint only describes the CELL that was right-clicked — and it splits
// values across four arrays (selected/deselectedAttributes,
// selected/deselectedMeasures; a right-clicked measure commonly arrives under
// `deselectedMeasures`). So right-clicking an attribute cell yields that value
// but no measures, and right-clicking a measure cell yields the number but no attributes.
//
// To get the full row we use the point only to LOCATE the row: `columnDataLite`
// carries every column's full value array, so we match the clicked cell's value
// back to its row index and then read every column at that index.
//   Payload reference: https://developers.thoughtspot.com/docs/custom-action-payload
// ---------------------------------------------------------------------------

export interface SignalField {
  name: string;
  value: string;
}

export interface Contact {
  id: string;
  name: string;
  title: string;
  email: string;
}

export interface SignalContext {
  fields: SignalField[];
  cadence?: string;
  account?: string;
  contacts: Contact[];
}

function fmt(v: unknown): string {
  if (v == null || v === '') return '—';
  if (Array.isArray(v)) return v.map(fmt).join(', ');
  // ColumnValue.value can be an object like { v: { s, e } } (date ranges).
  if (typeof v === 'object') {
    const o: any = v;
    if (o.v?.s != null) return String(o.v.s);
    return '—';
  }
  return String(v);
}

interface AnswerTable {
  columns: { id?: string; name: string }[];
  /** values[columnIndex][rowIndex] — every row the viz returned. */
  values: unknown[][];
  rowCount: number;
}

/** Flatten `embedAnswerData` into columns + full column-value arrays. */
function answerTable(data: any): AnswerTable | null {
  const ead = data?.embedAnswerData ?? data;
  const cols: any[] | undefined = ead?.columns;
  const raw = ead?.data;
  const cdl: any[] | undefined = Array.isArray(raw)
    ? raw[0]?.columnDataLite
    : raw?.columnDataLite ?? ead?.columnDataLite ?? data?.data?.columnDataLite;
  if (!Array.isArray(cols) || !Array.isArray(cdl)) return null;

  const byId = new Map<string, unknown[]>();
  cdl.forEach((c: any) => {
    if (c?.columnId) byId.set(String(c.columnId), c?.dataValue ?? []);
  });

  const columns = cols.map((c: any) => ({
    id: c?.column?.id ?? c?.id,
    name: String(
      c?.column?.name ?? c?.name ?? c?.referencedColumns?.[0]?.displayName ?? '',
    ),
  }));
  // Prefer matching by columnId; fall back to positional order.
  const values = columns.map(
    (c, i) => (c.id && byId.has(String(c.id)) ? byId.get(String(c.id))! : cdl[i]?.dataValue ?? []),
  );
  const rowCount = values.reduce((n, v) => Math.max(n, v.length), 0);
  return { columns, values, rowCount };
}

interface PointCell {
  id?: string;
  name?: string;
  value: unknown;
}

/**
 * Every cell the point describes. All four arrays are read: a right-clicked
 * measure often lands in `deselectedMeasures`, which the old parser dropped.
 */
function pointCells(point: any): PointCell[] {
  const out: PointCell[] = [];
  const keys = [
    'selectedAttributes',
    'selectedMeasures',
    'deselectedAttributes',
    'deselectedMeasures',
  ];
  keys.forEach((k) =>
    (point?.[k] ?? []).forEach((it: any) => {
      const name = it?.column?.name ?? it?.columnName ?? it?.column?.column_name;
      out.push({
        id: it?.column?.id,
        name: name != null ? String(name) : undefined,
        value: it?.value,
      });
    }),
  );
  return out;
}

/** Locate the clicked row: the row satisfying the most clicked-cell values. */
function rowIndexFor(table: AnswerTable, cells: PointCell[]): number {
  const constraints = cells
    .map((cell) => {
      const idx = table.columns.findIndex(
        (c) =>
          (cell.id != null && c.id != null && String(c.id) === String(cell.id)) ||
          (cell.name != null && c.name === cell.name),
      );
      return idx < 0 ? null : { idx, value: fmt(cell.value) };
    })
    .filter((c): c is { idx: number; value: string } => c != null);
  if (!constraints.length) return -1;

  let best = -1;
  let bestScore = 0;
  for (let row = 0; row < table.rowCount; row++) {
    let score = 0;
    for (const c of constraints) {
      if (fmt(table.values[c.idx]?.[row]) === c.value) score++;
    }
    if (score > bestScore) {
      best = row;
      bestScore = score;
      if (score === constraints.length) break; // exact match on every clicked cell
    }
  }
  return best;
}

/** Every column's value at one row — the full record behind the clicked cell. */
function fieldsFromRow(table: AnswerTable, row: number): SignalField[] {
  return table.columns
    .map((c, i) => (c.name ? { name: c.name, value: fmt(table.values[i]?.[row]) } : null))
    .filter((x): x is SignalField => x != null);
}

/** Last resort: whatever the point itself carried. */
function fieldsFromPoint(point: any): SignalField[] {
  return pointCells(point)
    .filter((c) => c.name != null)
    .map((c) => ({ name: String(c.name), value: fmt(c.value) }));
}

function findValue(fields: SignalField[], re: RegExp, exclude?: RegExp): string | undefined {
  const f = fields.find((x) => re.test(x.name) && !(exclude && exclude.test(x.name)));
  return f && f.value !== '—' ? f.value : undefined;
}

// --- deterministic demo contacts (seeded from the account) -----------------

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 18) || 'account';
}

const FIRSTS = ['Jordan', 'Taylor', 'Morgan', 'Avery', 'Riley', 'Casey', 'Quinn'];
const LASTS = ['Patel', 'Nguyen', 'Garcia', 'Okafor', 'Kim', 'Rossi', 'Hayes'];
const TITLES = ['VP of Sales', 'Director of Ops', 'Procurement Lead', 'Account Director', 'Head of RevOps'];

function synthesizeContacts(seed: string): Contact[] {
  const h = hash(seed);
  const domain = slug(seed);
  const n = 3 + (h % 2); // 3–4 contacts
  const out: Contact[] = [];
  for (let i = 0; i < n; i++) {
    const first = FIRSTS[(h + i * 3) % FIRSTS.length];
    const last = LASTS[(h + i * 5) % LASTS.length];
    out.push({
      id: `c${i}`,
      name: `${first} ${last}`,
      title: TITLES[(h + i) % TITLES.length],
      email: `${first}.${last}@${domain}.com`.toLowerCase(),
    });
  }
  return out;
}

function deriveContacts(fields: SignalField[], account: string | undefined): Contact[] {
  // Prefer real person/email columns if the answer exposes them.
  const people = fields.filter(
    (f) =>
      /(contact|person|owner|rep|prospect)\s*(name)?$/i.test(f.name) &&
      !/account|company|cadence/i.test(f.name) &&
      f.value !== '—',
  );
  const emails = fields.filter((f) => /email/i.test(f.name) && f.value !== '—');
  if (people.length || emails.length) {
    const count = Math.max(people.length, emails.length, 1);
    return Array.from({ length: count }, (_, i) => ({
      id: `c${i}`,
      name: people[i]?.value ?? `Contact ${i + 1}`,
      title: 'Key contact',
      email: emails[i]?.value ?? '',
    }));
  }
  return synthesizeContacts(account || 'account');
}

export function buildSignalContext(data: any): SignalContext {
  // Context-menu actions deliver the clicked cell under `contextMenuPoints`;
  // some events use top-level clickedPoint/selectedPoints instead.
  const cmp = data?.contextMenuPoints;
  const point =
    cmp?.clickedPoint ??
    data?.clickedPoint ??
    cmp?.selectedPoints?.[0] ??
    data?.selectedPoints?.[0];

  // The point names the CELL; the answer data holds the whole row. Resolve the
  // row so the modal gets every column no matter which cell was right-clicked.
  const table = answerTable(data);
  const cells = pointCells(point);
  let fields: SignalField[] = [];
  if (table) {
    const row = rowIndexFor(table, cells);
    if (row >= 0) fields = fieldsFromRow(table, row);
    else if (table.rowCount === 1) fields = fieldsFromRow(table, 0);
  }
  // Fall back to the point's own cells, then to the first row of the answer.
  if (!fields.length) fields = fieldsFromPoint(point);
  if (!fields.length && table && table.rowCount) fields = fieldsFromRow(table, 0);

  const cadence = findValue(fields, /cadence/i);
  const account =
    findValue(fields, /account|company|organization|\borg\b/i) ??
    findValue(fields, /\bname\b/i, /cadence|contact|user|owner|rep/i);

  return {
    fields,
    cadence,
    account,
    contacts: deriveContacts(fields, account),
  };
}
