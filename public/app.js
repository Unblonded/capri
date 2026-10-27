// Capri front end. Plain ES modules, no build step.

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const COLORS = {
  berry_red: '#b8256f', red: '#db4035', orange: '#ff9933', yellow: '#fad000',
  olive_green: '#afb83b', lime_green: '#7ecc49', green: '#299438', mint_green: '#6accbc',
  teal: '#158fad', sky_blue: '#14aaf5', light_blue: '#96c3eb', blue: '#4073ff',
  grape: '#884dff', violet: '#af38eb', lavender: '#eb96eb', magenta: '#e05194',
  salmon: '#ff8d85', charcoal: '#808080', grey: '#b8b8b8', taupe: '#ccac93',
};
const color = (name) => COLORS[name] || COLORS.charcoal;

// ---------- icons ----------

// Hand-drawn line icons (24px grid, stroked with currentColor) so nothing relies on emoji.
const ICONS = {
  calendar: '<rect x="3" y="4.5" width="18" height="16.5" rx="4"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
  flag: '<path d="M5 21V4.5"/><path d="M5 4.5c4-2 7 2 11 0l-1.6 4.2L16 12.5c-4 2-7-2-11 0"/>',
  repeat: '<path d="M17 2.5l3 3-3 3"/><path d="M4 11.5v-2a4 4 0 0 1 4-4h12"/><path d="M7 21.5l-3-3 3-3"/><path d="M20 12.5v2a4 4 0 0 1-4 4H4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M2.5 12h2M19.5 12h2M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  nextweek: '<path d="M4 12h11M10 6l6 6-6 6M20 5v14"/>',
  pencil: '<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/><path d="M14.5 5.5l3 3"/>',
  marker: '<path d="M9.5 14.5L5 19h4.5l2-2"/><path d="M14 4l6 6-8.5 8.5-6-6z"/>',
  eraser: '<path d="M8 21h12"/><path d="M5.5 14.5l9-9a2 2 0 0 1 2.8 0l2.2 2.2a2 2 0 0 1 0 2.8L11 19H9.5z"/>',
  timer: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 10v3.5l2.5 2M9.5 2.5h5M19 6l1.5-1.5"/>',
  comment: '<path d="M20.5 12a8.5 8.5 0 0 1-12.4 7.5L3.5 21l1.4-4.4A8.5 8.5 0 1 1 20.5 12z"/>',
  subtask: '<path d="M6 3v11a3 3 0 0 0 3 3h10"/><path d="M15.5 13.5L19 17l-3.5 3.5"/>',
  inbox: '<path d="M3 13l2.6-8.2A2.5 2.5 0 0 1 8 3h8a2.5 2.5 0 0 1 2.4 1.8L21 13v5a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z"/><path d="M3 13h5l1.5 3h5l1.5-3h5"/>',
  grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="2.2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2.2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2.2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2.2"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  done: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16 9.8"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  // Capri logo: a hand-drawn ♑ (Capricorn) glyph.
  capri: '<path d="M3.6 8.2c1.3-1.3 3.3-.6 3.3 1.6V17.5"/><path d="M6.9 10.6c0-2.9 1.7-4.6 3.8-4.6 2.2 0 3.6 1.6 3.6 4.1v5.4"/><path d="M14.3 15.5a2.75 2.75 0 1 0 2.75-2.75c-1.6 0-2.75 1.3-2.75 2.9 0 2.9-2 4.9-4.7 5.4"/>',
  warn: '<path d="M10.3 4.3a2 2 0 0 1 3.4 0l7.5 13a2 2 0 0 1-1.7 3H4.5a2 2 0 0 1-1.7-3z"/><path d="M12 9.5v4M12 17h.01"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8"/>',
  duplicate: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M14 11v6M11 14h6M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8"/>',
  trash: '<path d="M4 7h16M9.5 7V4.5h5V7M6 7l1 12.5a1.5 1.5 0 0 0 1.5 1.5h7a1.5 1.5 0 0 0 1.5-1.5L18 7"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  redo: '<path d="M15 14l5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>',
  keyboard: '<rect x="2.5" y="6" width="19" height="12" rx="3"/><path d="M6.5 10h.01M10 10h.01M14 10h.01M17.5 10h.01M7.5 14h9"/>',
  theme: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor"/>',
  sync: '<path d="M20 11a8 8 0 0 0-14.6-4.4L4 8.5M4 3.5v5h5M4 13a8 8 0 0 0 14.6 4.4l1.4-1.9M20 20.5v-5h-5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  chevron: '<path d="M6 9l6 6 6-6"/>',
  swap: '<path d="M7 4L3.5 7.5 7 11M3.5 7.5H17M17 13l3.5 3.5L17 20M20.5 16.5H7"/>',
  sparkle: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M18.5 15.5l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8z"/>',
  tag: '<path d="M3 12V4.5A1.5 1.5 0 0 1 4.5 3H12l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.3"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
};
const ic = (name, cls = '') =>
  `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
// Little calendar page that shows the actual day of the month.
function calIcon(day) {
  const n = day ? Number(day.slice(8, 10)) : '';
  return `<svg class="ic cal" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="2.75" y="3.75" width="18.5" height="17.5" rx="4.5" fill="none" stroke="currentColor" stroke-width="1.8"/>
    <path d="M2.75 8.25a4.5 4.5 0 0 1 4.5-4.5h9.5a4.5 4.5 0 0 1 4.5 4.5v1h-18.5z" fill="currentColor"/>
    <path d="M7.5 2v3.2M16.5 2v3.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <text x="12" y="18.4" text-anchor="middle" font-size="9" font-weight="700" fill="currentColor" font-family="Inter, system-ui, sans-serif">${n}</text>
  </svg>`;
}
// Todoist stores priority inverted: 4 = P1 (urgent), 1 = P4 (none).
const prioClass = (p) => (p === 4 ? 'p1' : p === 3 ? 'p2' : p === 2 ? 'p3' : 'p4');

const state = {
  projects: [], sections: [], labels: [], tasks: [], drawings: [],
  view: { type: 'today' },
  selectedId: null,
  detailId: null,
  picked: new Set(),
  sort: 'smart',
  lastSync: 0,
  quickContext: null,
  doneToday: null,
  comments: { id: null, html: '' },
  baseTitle: 'Capri',
};

const store = {
  get(k, d) { try { const v = localStorage.getItem('tdp:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('tdp:' + k, JSON.stringify(v)); } catch { /* ignore */ } },
};

// ---------- API ----------

// Writes in flight (and a running count of them), so a background sync can't paint over a change
// that hasn't reached Todoist yet.
const writes = { pending: 0, seq: 0 };

async function api(method, url, body) {
  const write = method !== 'GET';
  if (write) { writes.pending++; writes.seq++; }
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
  } finally {
    if (write) writes.pending--;
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && url !== '/api/connect') {
    showConnect();
    throw new Error(data.error || 'Not connected');
  }
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

let lastSyncFingerprint = '';
async function sync({ quiet = false, auto = false } = {}) {
  const seq = writes.seq;
  try {
    const [data, { drawings }] = await Promise.all([api('GET', '/api/bootstrap'), api('GET', '/api/drawings')]);
    // You changed something while this was loading; the next sync will include it.
    if (auto && (writes.pending || writes.seq !== seq)) return;
    // Nothing changed since last time: don't redraw under the user.
    const fingerprint = JSON.stringify([data, drawings]);
    if (auto && fingerprint === lastSyncFingerprint) { state.lastSync = Date.now(); return; }
    lastSyncFingerprint = fingerprint;
    data.tasks = data.tasks.filter((x) => !pendingDeletes.has(x.id) && !pendingDeletes.has(x.parent_id));
    Object.assign(state, data, { drawings, lastSync: Date.now() });
    loadDoneToday();
    render();
    if (!quiet) toast('Synced with Todoist');
  } catch (err) {
    if (!quiet) toast(err.message);
  }
}

async function loadDoneToday() {
  try {
    const since = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
    const { items } = await api('GET', `/api/completed?since=${encodeURIComponent(since)}`);
    state.doneToday = items.length;
    if (state.view.type === 'today') renderRing();
  } catch { /* ring just stays hidden */ }
}

// ---------- dates ----------

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const today = () => ymd(new Date());
const inDays = (n) => ymd(addDays(new Date(), n));
const parseDay = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const daysUntil = (day) => Math.round((parseDay(day) - parseDay(today())) / 864e5);
// Next given weekday (0=Sun…6=Sat), never today.
const nextWeekday = (wd) => { const d = new Date(); return inDays(((wd - d.getDay() + 7) % 7) || 7); };

function dueDay(t) { return t.due?.date ? t.due.date.slice(0, 10) : null; }
// Deadlines are a Todoist Pro feature, so they're stored as a "Deadline: YYYY-MM-DD" line
// at the end of the task description instead. That also keeps them visible in Todoist itself.
const DEADLINE_RE = /\n*^[ \t]*Deadline:[ \t]*(\d{4}-\d{2}-\d{2})[^\n]*$/im;
function deadlineDay(t) { return t.description?.match(DEADLINE_RE)?.[1] || null; }
const stripDeadline = (desc) => (desc || '').replace(DEADLINE_RE, '').trimEnd();
function withDeadline(desc, date) {
  const base = stripDeadline(desc);
  return date ? `${base ? base + '\n\n' : ''}Deadline: ${date}` : base;
}

// Shorthands people actually type: "tod", "tmr", "tmrw"…
const DAY_ALIASES = { today: 0, tod: 0, tdy: 0, tonight: 0, tomorrow: 1, tmrw: 1, tmr: 1, tmw: 1, tomo: 1, tom: 1 };
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
// Small natural-language date parser for {deadline} text in quick add.
function parseDate(text) {
  const s = text.trim().toLowerCase();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (s in DAY_ALIASES) return inDays(DAY_ALIASES[s]);
  if (s === 'next week') return nextWeekday(1);
  if (s === 'next month') { const d = new Date(); d.setMonth(d.getMonth() + 1, 1); return ymd(d); }
  if (s === 'end of week' || s === 'eow') return nextWeekday(5);
  if (s === 'end of month' || s === 'eom') { const d = new Date(); return ymd(new Date(d.getFullYear(), d.getMonth() + 1, 0)); }
  let m = s.match(/^in (\d+) ?(d|days?|w|wks?|weeks?|m|mos?|months?)$/);
  if (m) {
    const n = Number(m[1]);
    if (m[2][0] === 'd') return inDays(n);
    if (m[2][0] === 'w') return inDays(n * 7);
    const d = new Date(); d.setMonth(d.getMonth() + n); return ymd(d);
  }
  m = s.match(/^(next )?([a-z]{3})[a-z]*$/);
  if (m && WEEKDAYS.includes(m[2])) {
    const wd = WEEKDAYS.indexOf(m[2]);
    const d = nextWeekday(wd);
    return m[1] && daysUntil(d) < 7 ? ymd(addDays(parseDay(d), 7)) : d;
  }
  // "nov 2", "2 nov", "november 2nd", "11/2", optional year
  const fromParts = (mo, da, yr) => {
    if (mo < 0 || mo > 11 || da < 1 || da > 31) return null;
    let y = yr ? Number(yr.length === 2 ? '20' + yr : yr) : new Date().getFullYear();
    let d = new Date(y, mo, da);
    if (!yr && ymd(d) < today()) d = new Date(y + 1, mo, da);
    return ymd(d);
  };
  m = s.match(/^([a-z]{3})[a-z]*\.? (\d{1,2})(?:st|nd|rd|th)?,?(?: (\d{2,4}))?$/);
  if (m && MONTHS.includes(m[1])) return fromParts(MONTHS.indexOf(m[1]), Number(m[2]), m[3]);
  m = s.match(/^(\d{1,2})(?:st|nd|rd|th)? ([a-z]{3})[a-z]*\.?(?: (\d{2,4}))?$/);
  if (m && MONTHS.includes(m[2])) return fromParts(MONTHS.indexOf(m[2]), Number(m[1]), m[3]);
  m = s.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (m) return fromParts(Number(m[1]) - 1, Number(m[2]), m[3]);
  return null;
}
// ---- date detection inside task titles ("call mom tmr 3pm", "essay fri") ----

const WD_RE = '(?:mon(?:day)?|tue(?:s(?:day)?)?|wed(?:s|nesday)?|thu(?:r(?:s(?:day)?)?)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)';
const MO_RE = '(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';
const TIME_RE = '(?:\\d{1,2}(?::\\d{2})?\\s*(?:am|pm)|\\d{1,2}:\\d{2}|noon|midnight)';
const DAY_RE = `(?:${Object.keys(DAY_ALIASES).join('|')}|next\\s+week|next\\s+month|this\\s+weekend|weekend|(?:next\\s+|this\\s+)?${WD_RE}`
  + `|in\\s+\\d+\\s*(?:days?|d|weeks?|wks?|w|months?|mos?)|${MO_RE}\\.?\\s+\\d{1,2}(?:st|nd|rd|th)?|\\d{1,2}(?:st|nd|rd|th)?\\s+${MO_RE}|\\d{1,2}\\/\\d{1,2}(?:\\/\\d{2,4})?)`;
const DATE_IN_TEXT = new RegExp(
  `(?<![\\w#@/])(?:(${DAY_RE})(?:\\s+(?:at\\s+)?(${TIME_RE}))?|(?:at\\s+)?(${TIME_RE})(?:\\s+(${DAY_RE}))?)(?![\\w/])`, 'i');

function parseTime(s) {
  if (s === 'noon') return '12:00';
  if (s === 'midnight') return '00:00';
  const m = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2] || 0);
  if (m[3] === 'pm' && h < 12) h += 12;
  if (m[3] === 'am' && h === 12) h = 0;
  return h > 23 || min > 59 ? null : `${pad(h)}:${pad(min)}`;
}

function resolveDay(s) {
  if (s === 'weekend' || s === 'this weekend') return new Date().getDay() === 6 ? today() : nextWeekday(6);
  const bare = s.replace(/^this /, '');
  // "fri" typed on a Friday means today, like Todoist does.
  const wd = WEEKDAYS.indexOf(bare.slice(0, 3));
  if (!s.startsWith('next') && wd >= 0 && /^[a-z]+$/.test(bare) && wd === new Date().getDay()) return today();
  return parseDate(bare);
}

// Finds the first date/time phrase in a title. Recurring phrases ("every mon") are left to Todoist.
function detectDate(text) {
  if (/\bevery\b/i.test(text)) return null;
  const masked = text.replace(/\{[^}]*\}/g, (m) => ' '.repeat(m.length));
  const m = DATE_IN_TEXT.exec(masked);
  if (!m) return null;
  const dayText = (m[1] || m[4] || '').toLowerCase().replace(/\s+/g, ' ');
  const timeText = (m[2] || m[3] || '').toLowerCase().replace(/\s+/g, '');
  let date = dayText ? resolveDay(dayText) : today();
  const time = timeText ? parseTime(timeText) : dayText === 'tonight' ? '20:00' : null;
  if (!date || (timeText && !time)) return null;
  // A bare time that already passed today means tomorrow.
  if (!dayText && new Date(`${date}T${time}:00`) < new Date()) date = inDays(1);
  return { text: m[0], index: m.index, date, time };
}

const fmtTime = (hhmm) => new Date(`2000-01-01T${hhmm}:00`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
const detectedLabel = (d) => `${dayLabel(d.date)}${d.time ? ' ' + fmtTime(d.time) : ''}`;

function dueTime(t) {
  const dt = t.due?.datetime || (t.due?.date?.length > 10 ? t.due.date : null);
  if (!dt) return null;
  // Floating times (no zone) parse as local, which is what Todoist means by them.
  return new Date(dt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function dayLabel(day) {
  const n = daysUntil(day);
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n === -1) return 'Yesterday';
  const d = parseDay(day);
  if (n > 0 && n < 7) return d.toLocaleDateString([], { weekday: 'long' });
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }) });
}

function dueClass(day) {
  const n = daysUntil(day);
  return n < 0 ? 'overdue' : n === 0 ? 'today' : n === 1 ? 'tomorrow' : '';
}

function countdown(day) {
  const n = daysUntil(day);
  if (n < -1) return `${-n} days overdue`;
  if (n === -1) return '1 day overdue';
  if (n === 0) return 'due today';
  if (n === 1) return 'due tomorrow';
  if (n < 14) return `${n} days left`;
  return `${Math.round(n / 7)} weeks left`;
}
const dlClass = (day) => { const n = daysUntil(day); return n < 0 ? 'overdue' : n <= 1 ? 'urgent' : n <= 3 ? 'soon' : ''; };
// A task scheduled after its own deadline is worth flagging.
const lateForDeadline = (t) => dueDay(t) && deadlineDay(t) && dueDay(t) > deadlineDay(t);

// ---------- helpers ----------

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Small subset of the Markdown Todoist supports in task names.
function md(s) {
  return esc(s)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<i>$2</i>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}
const plain = (s) => String(s || '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*`]/g, '');

const projectById = (id) => state.projects.find((p) => p.id === id);
const taskById = (id) => state.tasks.find((t) => t.id === id);
const inbox = () => state.projects.find((p) => p.inbox_project) || state.projects[0];
const projectName = (p) => (p ? (p.inbox_project ? 'Inbox' : p.name) : '');
const openTasks = () => state.tasks.filter((t) => !t.checked);
const childrenOf = (id) => state.tasks.filter((t) => t.parent_id === id && !t.checked);
const drawingsFor = (id) => state.drawings.filter((d) => d.task_id === id);

function sortTasks(list, mode = state.sort) {
  const dueKey = (t) => t.due?.datetime || t.due?.date || '9999';
  const by = {
    smart: (a, b) => (dueDay(a) || '9999').localeCompare(dueDay(b) || '9999')
      || dueKey(a).localeCompare(dueKey(b))
      || b.priority - a.priority
      || (deadlineDay(a) || '9999').localeCompare(deadlineDay(b) || '9999')
      || a.child_order - b.child_order,
    priority: (a, b) => b.priority - a.priority || (dueDay(a) || '9999').localeCompare(dueDay(b) || '9999'),
    due: (a, b) => dueKey(a).localeCompare(dueKey(b)),
    deadline: (a, b) => (deadlineDay(a) || '9999').localeCompare(deadlineDay(b) || '9999') || b.priority - a.priority,
    name: (a, b) => a.content.localeCompare(b.content),
    manual: (a, b) => a.child_order - b.child_order,
  };
  return [...list].sort(by[mode] || by.smart);
}

function projectDepth(p) {
  let depth = 0;
  let cur = p;
  while (cur?.parent_id && depth < 5) { cur = projectById(cur.parent_id); depth++; }
  return depth;
}

function orderedProjects() {
  const roots = state.projects.filter((p) => !p.parent_id && !p.inbox_project && !p.is_archived);
  const out = [];
  const walk = (p) => {
    out.push(p);
    state.projects.filter((c) => c.parent_id === p.id && !c.is_archived)
      .sort((a, b) => a.child_order - b.child_order).forEach(walk);
  };
  roots.sort((a, b) => a.child_order - b.child_order).forEach(walk);
  return out;
}

// ---------- toasts ----------

function toast(msg, action) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span>${esc(msg)}</span>`;
  if (action) {
    const b = document.createElement('button');
    b.textContent = action.label;
    b.onclick = () => { action.run(); el.remove(); };
    el.appendChild(b);
  }
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), action ? 6000 : 2600);
}

// ---------- themed dropdowns ----------
// Native <select> menus are drawn by the OS (white on Windows, whatever the theme), so every select is
// swapped for a glass button + menu. The real <select> stays in the DOM, hidden, and still fires
// 'change', so the rest of the app keeps working with plain selects.

let ddOpen = null; // { sel, menu, btn, index }

function syncDropdown(sel) {
  const btn = sel.nextElementSibling;
  if (!btn?.classList.contains('dd-btn')) return;
  const text = sel.options[sel.selectedIndex]?.textContent || '';
  const label = btn.querySelector('.dd-label');
  // Only touch the DOM when something changed, or the MutationObserver below would loop forever.
  if (label.textContent !== text) label.textContent = text;
  if (btn.title !== (sel.title || '')) btn.title = sel.title || '';
}

function closeDropdown() {
  if (!ddOpen) return;
  ddOpen.menu.remove();
  ddOpen.btn.setAttribute('aria-expanded', 'false');
  ddOpen = null;
}

function chooseDropdown(i) {
  const { sel, btn } = ddOpen;
  closeDropdown();
  btn.focus({ preventScroll: true });
  if (sel.selectedIndex === i) return;
  sel.selectedIndex = i;
  sel.dispatchEvent(new Event('change', { bubbles: true }));
  syncDropdown(sel); // handlers may reset the value (e.g. bulk priority), so sync afterwards
}

function highlightDropdown(i) {
  const items = $$('.dd-opt', ddOpen.menu);
  ddOpen.index = Math.max(0, Math.min(items.length - 1, i));
  items.forEach((el, n) => el.classList.toggle('hl', n === ddOpen.index));
  items[ddOpen.index]?.scrollIntoView({ block: 'nearest' });
}

function openDropdown(sel, btn) {
  closeDropdown();
  const menu = document.createElement('div');
  menu.className = 'dd-menu';
  menu.setAttribute('role', 'listbox');
  menu.innerHTML = [...sel.options].map((o, i) =>
    `<div class="dd-opt ${i === sel.selectedIndex ? 'on' : ''}" role="option" data-dd="${i}">
      <span class="dd-text">${esc(o.textContent)}</span>${i === sel.selectedIndex ? ic('check') : ''}</div>`).join('');
  document.body.appendChild(menu);
  const r = btn.getBoundingClientRect();
  menu.style.minWidth = `${Math.max(r.width, 180)}px`;
  const below = innerHeight - r.bottom - 12;
  const h = Math.min(menu.scrollHeight, 340);
  menu.style.maxHeight = `${Math.min(340, Math.max(below, r.top - 12))}px`;
  menu.style.top = `${below >= h || below > r.top ? r.bottom + 6 : r.top - 6 - Math.min(h, r.top - 12)}px`;
  menu.style.left = `${Math.min(r.left, innerWidth - menu.offsetWidth - 10)}px`;
  btn.setAttribute('aria-expanded', 'true');
  ddOpen = { sel, menu, btn, index: sel.selectedIndex };
  highlightDropdown(sel.selectedIndex);
}

function enhanceSelects() {
  for (const sel of $$('select')) {
    if (!sel.dataset.dd) {
      sel.dataset.dd = '1';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `dd-btn ${sel.classList.contains('btn') ? sel.className : 'dd-field'}`;
      btn.setAttribute('aria-haspopup', 'listbox');
      btn.innerHTML = `<span class="dd-label"></span>${ic('chevron')}`;
      sel.after(btn);
      sel.hidden = true;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        ddOpen?.sel === sel ? closeDropdown() : openDropdown(sel, btn);
      });
    }
    syncDropdown(sel);
  }
}

// Enhance selects whenever the app re-renders some HTML.
let ddQueued = false;
new MutationObserver(() => {
  if (ddQueued) return;
  ddQueued = true;
  queueMicrotask(() => { ddQueued = false; enhanceSelects(); });
}).observe(document.body, { childList: true, subtree: true });

document.addEventListener('pointerdown', (e) => {
  if (!ddOpen) return;
  const opt = e.target.closest('.dd-opt');
  if (opt && ddOpen.menu.contains(opt)) { e.preventDefault(); return chooseDropdown(Number(opt.dataset.dd)); }
  if (!ddOpen.menu.contains(e.target) && !ddOpen.btn.contains(e.target)) closeDropdown();
}, true);
document.addEventListener('mousemove', (e) => {
  const opt = ddOpen && e.target.closest?.('.dd-opt');
  if (opt) highlightDropdown(Number(opt.dataset.dd));
});
// Keyboard: arrows/Enter/Escape while open, and arrows/Enter/Space to open from the button.
document.addEventListener('keydown', (e) => {
  if (ddOpen) {
    const keys = {
      ArrowDown: () => highlightDropdown(ddOpen.index + 1),
      ArrowUp: () => highlightDropdown(ddOpen.index - 1),
      Home: () => highlightDropdown(0),
      End: () => highlightDropdown(ddOpen.sel.options.length - 1),
      Enter: () => chooseDropdown(ddOpen.index),
      ' ': () => chooseDropdown(ddOpen.index),
      Escape: () => { const b = ddOpen.btn; closeDropdown(); b.focus(); },
      Tab: () => closeDropdown(),
    };
    if (keys[e.key]) { if (e.key !== 'Tab') e.preventDefault(); e.stopImmediatePropagation(); keys[e.key](); }
    else e.stopImmediatePropagation();
    return;
  }
  const btn = e.target.closest?.('.dd-btn');
  if (btn && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
    e.preventDefault();
    e.stopImmediatePropagation();
    openDropdown(btn.previousElementSibling, btn);
  }
}, true);
window.addEventListener('resize', closeDropdown);
document.addEventListener('scroll', (e) => { if (ddOpen && !ddOpen.menu.contains(e.target)) closeDropdown(); }, true);

// ---------- touch gestures ----------
// Swipe a task right to complete it, left to delete it (with undo).
const SWIPE_COMMIT = 0.33; // share of the row's width to pass before letting go
let swipe = null;
let swipeEndedAt = 0;

document.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'touch' || swipe) return;
  const row = e.target.closest('#view .task[data-task]');
  if (!row || e.target.closest('input, textarea, select, button.icon-btn')) return;
  swipe = { row, id: row.dataset.task, pid: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, active: false, onCheck: e.target.closest('.check') };
});

document.addEventListener('pointermove', (e) => {
  if (!swipe || e.pointerId !== swipe.pid) return;
  const dx = e.clientX - swipe.x;
  const dy = e.clientY - swipe.y;
  if (!swipe.active) {
    // Mostly vertical: it's a scroll, let it be.
    if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { swipe = null; return; }
    if (Math.abs(dx) < 10) return;
    swipe.active = true;
    swipe.row.classList.add('swiping');
  }
  // Past the end of the row the drag gets heavier, like pulling on elastic.
  const w = swipe.row.offsetWidth;
  const eased = Math.abs(dx) > w * 0.6 ? Math.sign(dx) * (w * 0.6 + (Math.abs(dx) - w * 0.6) * 0.3) : dx;
  swipe.dx = dx;
  swipe.row.style.setProperty('--sx', `${eased}px`);
  swipe.row.dataset.swipe = dx > 0 ? 'complete' : 'delete';
  swipe.row.classList.toggle('swipe-armed', Math.abs(dx) > w * SWIPE_COMMIT);
});

function endSwipe(e) {
  if (!swipe || e.pointerId !== swipe.pid) return;
  const { row, id, dx, active, onCheck } = swipe;
  swipe = null;
  if (!active) {
    // Complete straight from the tap instead of waiting for a click: iOS sometimes drops the click.
    if (onCheck && e.type === 'pointerup' && e.target.closest?.('.check') === onCheck) {
      swipeEndedAt = Date.now();
      completeTask(id);
    }
    return;
  }
  swipeEndedAt = Date.now();
  row.classList.remove('swiping', 'swipe-armed');
  const commit = e.type === 'pointerup' && Math.abs(dx) > row.offsetWidth * SWIPE_COMMIT;
  if (commit && dx > 0) {
    row.style.setProperty('--sx', '0px');
    completeTask(id);
  } else if (commit) {
    row.style.setProperty('--sx', `-${row.offsetWidth + 40}px`);
    row.classList.add('swipe-gone');
    setTimeout(() => deleteTaskSoon(id), 280);
  } else {
    row.style.setProperty('--sx', '0px');
    setTimeout(() => { if (!row.classList.contains('swiping')) delete row.dataset.swipe; }, 400);
  }
}
document.addEventListener('pointerup', endSwipe);
document.addEventListener('pointercancel', endSwipe);
// The tap that ends a swipe shouldn't also open the task.
document.addEventListener('click', (e) => {
  if (Date.now() - swipeEndedAt < 400) { e.stopPropagation(); e.preventDefault(); }
}, true);

// ---------- date picker ----------
// Our own calendar instead of the browser's date box (which looks different on every OS and saves
// half-typed dates). A field is a hidden input holding YYYY-MM-DD plus a button showing it; picking a
// day sets the input and fires 'change', so the usual change handlers do the rest.
function dateField(id, value, placeholder, cls = '') {
  return `<input type="hidden" id="${id}" value="${value || ''}" /><button type="button" class="date-field ${cls} ${value ? '' : 'empty'}" data-date-for="${id}" data-placeholder="${esc(placeholder)}">${calIcon(value || today())}<span>${value ? esc(dateFieldLabel(value)) : esc(placeholder)}</span></button>`;
}
function dateFieldLabel(day) {
  const d = new Date(`${day}T00:00`);
  const rel = dayLabel(day);
  const full = d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: d.getFullYear() === new Date().getFullYear() ? undefined : 'numeric' });
  return /^(Today|Tomorrow|Yesterday)$/.test(rel) ? `${rel} · ${full}` : full;
}
function syncDateFields(root = document) {
  $$('.date-field[data-date-for]', root).forEach((btn) => {
    const v = document.getElementById(btn.dataset.dateFor)?.value;
    btn.classList.toggle('empty', !v);
    btn.innerHTML = `${calIcon(v || today())}<span>${esc(v ? dateFieldLabel(v) : btn.dataset.placeholder)}</span>`;
  });
}

let datePop = null; // { el, id, view: Date (1st of the month shown) }
function closeDatePicker() { datePop?.el.remove(); datePop = null; }

function openDatePicker(btn) {
  const id = btn.dataset.dateFor;
  if (datePop?.id === id) return closeDatePicker();
  closeDatePicker(); closeDropdown(); closeTaskMenu();
  const value = document.getElementById(id)?.value;
  const view = value ? new Date(`${value}T00:00`) : new Date();
  view.setDate(1);
  const el = document.createElement('div');
  el.className = 'dd-menu date-pop';
  el.setAttribute('role', 'dialog');
  datePop = { el, id, view };
  renderDatePicker();
  document.body.appendChild(el);
  const r = btn.getBoundingClientRect();
  const w = el.offsetWidth, h = el.offsetHeight, gap = 8;
  const below = r.bottom + 6 + h + gap <= innerHeight;
  el.style.left = `${Math.max(gap, Math.min(r.left, innerWidth - w - gap))}px`;
  el.style.top = `${below ? r.bottom + 6 : Math.max(gap, r.top - 6 - h)}px`;
  el.style.transformOrigin = below ? 'top left' : 'bottom left';
  ($('.dp-day.on', el) || $('.dp-day.today', el) || $('.dp-day', el))?.focus({ preventScroll: true });
}

function renderDatePicker() {
  const { el, id, view } = datePop;
  const value = document.getElementById(id)?.value || '';
  const t = today();
  const start = new Date(view);
  start.setDate(1 - start.getDay()); // weeks start on Sunday
  const days = Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  const names = days.slice(0, 7).map((d) => d.toLocaleDateString([], { weekday: 'narrow' }));
  el.innerHTML = `
    <div class="dp-head">
      <button type="button" class="icon-btn sm" data-dp-month="-1" aria-label="Previous month">${ic('chevron')}</button>
      <span class="dp-title">${esc(view.toLocaleDateString([], { month: 'long', year: 'numeric' }))}</span>
      <button type="button" class="icon-btn sm" data-dp-month="1" aria-label="Next month">${ic('chevron')}</button>
    </div>
    <div class="dp-grid">
      ${names.map((n) => `<span class="dp-dow">${esc(n)}</span>`).join('')}
      ${days.map((d) => {
        const k = ymd(d);
        const cls = [d.getMonth() !== view.getMonth() && 'out', k === t && 'today', k === value && 'on', k < t && 'past'].filter(Boolean).join(' ');
        return `<button type="button" class="dp-day ${cls}" data-dp-day="${k}" tabindex="-1">${d.getDate()}</button>`;
      }).join('')}
    </div>
    <div class="dp-foot">
      <button type="button" class="qchip" data-dp-day="${t}">Today</button>
      <button type="button" class="qchip" data-dp-day="${ymd(new Date(Date.now() + 864e5))}">Tomorrow</button>
      ${value ? '<button type="button" class="qchip" data-dp-day="">Clear</button>' : ''}
    </div>`;
}

function pickDate(day) {
  const input = document.getElementById(datePop.id); // looked up fresh: a redraw may have replaced it
  closeDatePicker();
  // Hand focus back: to the title in quick add (so Enter saves), otherwise to the date button.
  (input?.closest('#quick') ? $('#quick-input') : $(`[data-date-for="${input?.id}"]`))?.focus({ preventScroll: true });
  if (!input || input.value === day) return;
  input.value = day;
  syncDateFields(input.parentElement || document);
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

document.addEventListener('click', (e) => {
  const field = e.target.closest('.date-field[data-date-for]');
  if (field) { e.preventDefault(); return openDatePicker(field); }
  if (!datePop || !datePop.el.contains(e.target)) return;
  e.stopPropagation();
  const m = e.target.closest('[data-dp-month]');
  if (m) { datePop.view.setMonth(datePop.view.getMonth() + Number(m.dataset.dpMonth)); renderDatePicker(); return; }
  const d = e.target.closest('[data-dp-day]');
  if (d) pickDate(d.dataset.dpDay);
}, true);
document.addEventListener('pointerdown', (e) => {
  if (datePop && !datePop.el.contains(e.target) && !e.target.closest(`[data-date-for="${datePop.id}"]`)) closeDatePicker();
}, true);
document.addEventListener('keydown', (e) => {
  if (!datePop) return;
  e.stopPropagation();
  if (e.key === 'Escape') { e.preventDefault(); const id = datePop.id; closeDatePicker(); $(`[data-date-for="${id}"]`)?.focus(); return; }
  const cur = document.activeElement?.dataset?.dpDay;
  const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
  if (step && cur) {
    e.preventDefault();
    const d = new Date(`${cur}T00:00`); d.setDate(d.getDate() + step);
    const k = ymd(d);
    if (d.getMonth() !== datePop.view.getMonth() || d.getFullYear() !== datePop.view.getFullYear()) {
      datePop.view = new Date(d.getFullYear(), d.getMonth(), 1); renderDatePicker();
    }
    $(`.dp-day[data-dp-day="${k}"]`, datePop.el)?.focus();
  } else if ((e.key === 'Enter' || e.key === ' ') && cur) { e.preventDefault(); pickDate(cur); }
}, true);
addEventListener('resize', closeDatePicker);
document.addEventListener('scroll', (e) => { if (datePop && !datePop.el.contains(e.target)) closeDatePicker(); }, true);

// ---------- task right-click menu ----------
let ctxMenu = null;
function closeTaskMenu() { ctxMenu?.remove(); ctxMenu = null; }

function openTaskMenu(id, x, y) {
  const t = taskById(id);
  if (!t) return;
  closeDropdown();
  closeTaskMenu();
  const repeats = t.due?.is_recurring;
  const items = [
    ['check', 'Complete', () => completeTask(id)],
    ['external', 'Open', () => openDetail(id)],
    '-',
    ['sun', 'Do today', () => setDue(id, 'today')],
    ['arrow', 'Do tomorrow', () => setDue(id, 'tomorrow')],
    ['nextweek', 'Next week', () => setDue(id, 'next monday')],
    t.due && ['close', 'Remove date', () => setDue(id, 'no date')],
    ['flag', 'Set deadline…', () => openDetail(id, '#d-deadline')],
    'priority',
    ['pencil', 'Sketch', () => openDraw({ taskId: id })],
    ['timer', 'Focus timer', () => startTimer(id)],
    '-',
    ['duplicate', 'Duplicate', () => duplicateTask(id)],
    ['copy', 'Copy text', () => { navigator.clipboard?.writeText(plain(t.content)); toast('Copied'); }],
    '-',
    ['trash', 'Delete', () => deleteTask(id), 'danger'],
  ].filter(Boolean);

  const menu = document.createElement('div');
  menu.className = 'dd-menu ctx-menu';
  menu.setAttribute('role', 'menu');
  menu.innerHTML = items.map((it) => {
    if (it === '-') return '<div class="ctx-sep"></div>';
    if (it === 'priority') {
      return `<div class="ctx-prio" role="group" aria-label="Priority">${[4, 3, 2, 1].map((p) =>
        `<button class="ctx-p ${prioClass(p)} ${t.priority === p ? 'on' : ''}" data-ctx-prio="${p}" title="Priority ${5 - p}">P${5 - p}</button>`).join('')}</div>`;
    }
    const [icon, label, , cls = ''] = it;
    return `<button class="dd-opt ${cls}" role="menuitem" data-i="${items.indexOf(it)}">${ic(icon)}<span class="dd-text">${esc(label)}</span></button>`;
  }).join('');
  if (repeats) menu.insertAdjacentHTML('afterbegin', `<div class="ctx-note">${ic('repeat')} Repeats ${esc(t.due.string)}</div>`);

  menu.addEventListener('click', (e) => {
    e.stopPropagation(); // the page's own click handler shouldn't see menu clicks
    const prio = e.target.closest('[data-ctx-prio]');
    const opt = e.target.closest('[data-i]');
    if (!prio && !opt) return;
    closeTaskMenu();
    if (prio) setPriority(id, Number(prio.dataset.ctxPrio));
    else items[opt.dataset.i][2]();
  });
  document.body.appendChild(menu);
  // Keep it on screen. offsetWidth/Height ignore the opening animation's scale, so the size is real.
  const gap = 8;
  menu.style.maxHeight = `${innerHeight - gap * 2}px`;
  const w = menu.offsetWidth;
  const h = menu.offsetHeight;
  const left = x + w + gap > innerWidth ? x - w : x;   // flip left near the right edge
  const top = y + h + gap > innerHeight ? y - h : y;   // open upward when there's no room below
  menu.style.left = `${Math.max(gap, Math.min(left, innerWidth - w - gap))}px`;
  menu.style.top = `${Math.max(gap, Math.min(top, innerHeight - h - gap))}px`;
  menu.style.transformOrigin = `${left < x ? 'right' : 'left'} ${top < y ? 'bottom' : 'top'}`;
  ctxMenu = menu;
  state.selectedId = id;
  $$('.task.selected').forEach((el) => el.classList.toggle('selected', el.dataset.task === id));
  $(`.task[data-task="${id}"]`)?.classList.add('selected');
  menu.querySelector('button')?.focus({ preventScroll: true });
}

document.addEventListener('contextmenu', (e) => {
  const row = e.target.closest('.task[data-task]');
  if (!row || e.target.closest('input, textarea')) return;
  e.preventDefault();
  openTaskMenu(row.dataset.task, e.clientX, e.clientY);
});
document.addEventListener('pointerdown', (e) => { if (ctxMenu && !ctxMenu.contains(e.target)) closeTaskMenu(); }, true);
document.addEventListener('keydown', (e) => {
  if (!ctxMenu) return;
  const opts = $$('button', ctxMenu);
  const i = opts.indexOf(document.activeElement);
  if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeTaskMenu(); }
  else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault(); e.stopPropagation();
    opts[(i + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length]?.focus();
  } else if (!['Enter', ' ', 'Tab'].includes(e.key)) e.stopPropagation(); // don't fire app shortcuts underneath
}, true);
addEventListener('resize', closeTaskMenu);
document.addEventListener('scroll', closeTaskMenu, true);

// ---------- liquid light ----------
// A soft highlight follows the mouse across glass panels and task rows.
let lightTarget = null;
let lightFrame = 0;
document.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse') return;
  const el = e.target.closest?.('.glass, .task');
  if (el !== lightTarget) { lightTarget?.classList.remove('lit'); lightTarget = el; el?.classList.add('lit'); }
  if (!el || lightFrame) return;
  const { clientX, clientY } = e;
  lightFrame = requestAnimationFrame(() => {
    lightFrame = 0;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${clientX - r.left}px`);
    el.style.setProperty('--my', `${clientY - r.top}px`);
  });
}, { passive: true });
document.documentElement.addEventListener('mouseleave', () => { lightTarget?.classList.remove('lit'); lightTarget = null; });

// ---------- routing ----------

function setView(view) {
  const hash = '#/' + [view.type, view.id].filter(Boolean).map(encodeURIComponent).join('/');
  if (location.hash !== hash) location.hash = hash;
  else applyHash();
}

function applyHash() {
  const [type, id] = location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
  state.view = { type: type || 'today', id };
  state.selectedId = null;
  state.picked.clear();
  $('#sidebar').classList.remove('open');
  render();
  animateViewIn();
}

// Rows flow in one after another when you switch views (not on background re-renders).
let viewEnterTimer;
function animateViewIn() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const main = $('.main');
  main.classList.remove('view-enter');
  void main.offsetWidth; // restart the animation
  $$('.task, .group-head, .card, .empty', $('#view')).slice(0, 24).forEach((el, i) => el.style.setProperty('--i', i));
  main.classList.add('view-enter');
  clearTimeout(viewEnterTimer);
  viewEnterTimer = setTimeout(() => main.classList.remove('view-enter'), 1000);
}

// ---------- rendering ----------

function render() {
  renderSidebar();
  moveNavPill();
  renderView();
  // Don't wipe what the user is typing in the drawer when a background render happens.
  refreshDetail();
  renderBulk();
}

// One glass pill glides to whichever sidebar item is active.
let navPillAt = null;
function moveNavPill() {
  const sidebar = $('#sidebar');
  let pill = $('.nav-pill', sidebar);
  if (!pill) {
    pill = document.createElement('span');
    pill.className = 'nav-pill';
    sidebar.prepend(pill);
  }
  const item = $('.nav-item.active', sidebar);
  const r = item?.getBoundingClientRect();
  // No active item, or it's inside a collapsed section: hide the pill and let the item style itself.
  if (!r?.height) {
    sidebar.classList.remove('has-pill');
    pill.style.opacity = '0';
    navPillAt = null;
    return;
  }
  const sr = sidebar.getBoundingClientRect();
  const top = Math.round(r.top - sr.top + sidebar.scrollTop - sidebar.clientTop);
  const left = Math.round(r.left - sr.left - sidebar.clientLeft);
  // Background re-renders land on the same spot; only a real move animates.
  if (navPillAt && navPillAt.top === top && navPillAt.left === left && navPillAt.w === r.width && navPillAt.h === r.height) return;
  const first = navPillAt === null;
  pill.classList.toggle('instant', first);
  pill.style.width = `${r.width}px`;
  pill.style.height = `${r.height}px`;
  pill.style.transform = `translate(${left}px, ${top}px)`;
  pill.style.opacity = '1';
  sidebar.classList.add('has-pill');
  navPillAt = { top, left, w: r.width, h: r.height };
}
addEventListener('resize', () => moveNavPill());
document.fonts?.ready.then(() => moveNavPill());

function navItem({ type, id, ico, dot, name, count, alert }) {
  const active = state.view.type === type && (state.view.id || '') === (id || '');
  return `<button class="nav-item ${active ? 'active' : ''}" data-nav="${type}" data-id="${esc(id || '')}">
    ${dot ? `<span class="dot" style="background:${dot}"></span>` : `<span class="ico">${ic(ico)}</span>`}
    <span class="name">${esc(name)}</span>
    ${count ? `<span class="count ${alert ? 'alert' : ''}">${count}</span>` : ''}
  </button>`;
}

function renderSidebar() {
  const open = openTasks();
  const t = today();
  const overdue = open.filter((x) => dueDay(x) && dueDay(x) < t).length;
  const todayCount = open.filter((x) => dueDay(x) && dueDay(x) <= t).length;
  const upcoming = open.filter((x) => dueDay(x) && dueDay(x) > t && dueDay(x) <= inDays(7)).length;
  const dlSoon = open.filter((x) => deadlineDay(x) && deadlineDay(x) <= inDays(7));
  const dlOverdue = dlSoon.some((x) => deadlineDay(x) < t);
  const ib = inbox();
  const countIn = (pid) => open.filter((x) => x.project_id === pid).length;
  const focus = open.filter((x) => x.priority >= 3).length;

  $('#nav-main').innerHTML = [
    navItem({ type: 'dashboard', ico: 'grid', name: 'Dashboard' }),
    ib && navItem({ type: 'project', id: ib.id, ico: 'inbox', name: 'Inbox', count: countIn(ib.id) }),
    navItem({ type: 'today', ico: 'sun', name: 'Today', count: todayCount, alert: overdue > 0 }),
    navItem({ type: 'upcoming', ico: 'calendar', name: 'Upcoming', count: upcoming }),
    navItem({ type: 'deadlines', ico: 'flag', name: 'Deadlines', count: dlSoon.length, alert: dlOverdue }),
    navItem({ type: 'focus', ico: 'star', name: 'Focus (P1 & P2)', count: focus }),
    navItem({ type: 'sketches', ico: 'pencil', name: 'Sketches', count: state.drawings.length }),
    navItem({ type: 'completed', ico: 'done', name: 'Completed' }),
  ].filter(Boolean).join('');

  $('#nav-projects').innerHTML = orderedProjects().map((p) =>
    `<div style="padding-left:${projectDepth(p) * 14}px">${navItem({ type: 'project', id: p.id, dot: color(p.color), name: p.name, count: countIn(p.id) })}</div>`
  ).join('') || '<div class="muted small" style="padding:4px 10px">No projects yet</div>';

  $('#nav-labels').innerHTML = [...state.labels].sort((a, b) => a.item_order - b.item_order).map((l) =>
    navItem({ type: 'label', id: l.name, dot: color(l.color), name: '@' + l.name, count: open.filter((x) => x.labels?.includes(l.name)).length })
  ).join('') || '<div class="muted small" style="padding:4px 10px">No labels</div>';
}

function taskRow(t, { showProject = true, depth = 0 } = {}) {
  const day = dueDay(t);
  const time = dueTime(t);
  const dl = deadlineDay(t);
  const kids = state.tasks.filter((c) => c.parent_id === t.id);
  const kidsDone = kids.filter((c) => c.checked).length;
  const sketches = drawingsFor(t.id).length;
  const p = projectById(t.project_id);
  const section = t.section_id && state.sections.find((s) => s.id === t.section_id);
  const meta = [
    day && `<span class="due ${dueClass(day)}" title="Do date${t.due.is_recurring ? ' · ' + esc(t.due.string) : ''}">${calIcon(day)}${esc(dayLabel(day))}${time ? ' ' + esc(time) : ''}${t.due.is_recurring ? ic('repeat', 'rep') : ''}</span>`,
    dl && `<span class="dl ${dlClass(dl)}" title="Deadline: ${esc(dl)}">${ic('flag')}${esc(dayLabel(dl))} · ${esc(countdown(dl))}</span>`,
    lateForDeadline(t) && `<span class="warn" title="Scheduled after its deadline">${ic('warn')}after deadline</span>`,
    kids.length && `<span class="mi">${ic('subtask')}${kidsDone}/${kids.length}</span>`,
    t.note_count && `<span class="mi">${ic('comment')}${t.note_count}</span>`,
    sketches && `<span class="mi">${ic('pencil')}${sketches}</span>`,
    ...(t.labels || []).map((l) => `<span class="label">@${esc(l)}</span>`),
    showProject && p && `<span class="proj">${esc(projectName(p))}${section ? ' / ' + esc(section.name) : ''}<span class="dot" style="background:${color(p.color)}"></span></span>`,
  ].filter(Boolean).join('');
  const cls = [state.selectedId === t.id && 'selected', state.picked.has(t.id) && 'picked'].filter(Boolean).join(' ');
  return `<div class="task ${cls}" data-task="${t.id}" draggable="true" ${depth ? `style="margin-left:${depth * 30}px"` : ''}>
    <button class="check ${prioClass(t.priority)} ${t.checked ? 'checked' : ''}" data-act="complete" title="Complete">${ic('check')}</button>
    <div class="task-body">
      <div class="task-content">${md(t.content)}</div>
      ${stripDeadline(t.description) ? `<div class="task-desc">${esc(stripDeadline(t.description).split('\n')[0])}</div>` : ''}
      ${meta ? `<div class="meta">${meta}</div>` : ''}
    </div>
    <div class="task-actions">
      <button class="icon-btn" data-act="h-today" title="Do today (T)">${ic('sun')}</button>
      <button class="icon-btn" data-act="h-tomorrow" title="Do tomorrow (M)">${ic('arrow')}</button>
      <button class="icon-btn" data-act="h-deadline" title="Set deadline (D)">${ic('flag')}</button>
      <button class="icon-btn" data-act="h-sketch" title="Sketch (S)">${ic('pencil')}</button>
      <button class="icon-btn" data-act="h-timer" title="Focus timer (F)">${ic('timer')}</button>
    </div>
  </div>`;
}

// Renders a list with subtasks nested under their parents when both are visible.
function taskTree(list, opts, mode) {
  const ids = new Set(list.map((t) => t.id));
  const out = [];
  const walk = (t, depth) => {
    out.push(taskRow(t, { ...opts, depth }));
    sortTasks(list.filter((c) => c.parent_id === t.id), 'manual').forEach((c) => walk(c, depth + 1));
  };
  sortTasks(list.filter((t) => !t.parent_id || !ids.has(t.parent_id)), mode).forEach((t) => walk(t, 0));
  return out.join('');
}

const collapsed = new Set(store.get('collapsed', []));

// key makes the group collapsible; due makes it a drop target that reschedules.
function group(title, body, { cls = '', sub = '', extra = '', key = '', due = '' } = {}) {
  const k = key && `${state.view.type}:${key}`;
  return `<section class="group ${k && collapsed.has(k) ? 'collapsed' : ''}" ${due ? `data-due="${due}"` : ''}>
    <div class="group-head ${cls}">${k ? `<button class="caret" data-collapse="${esc(k)}">${ic('chevron')}</button>` : ''}${esc(title)}<span class="muted">${esc(sub)}</span><span class="spacer"></span>${extra}</div>
    <div class="group-body">${body}</div></section>`;
}

const inlineAdd = (ctx) => `<button class="inline-add" data-act="add" data-ctx='${esc(JSON.stringify(ctx))}'><span class="plus">${ic('plus')}</span>Add task</button>`;
const empty = (icon, text) => `<div class="empty"><div class="big">${ic(icon)}</div>${esc(text)}</div>`;
const none = '<div class="muted small" style="padding:10px">None</div>';

function sortControl() {
  const opts = { smart: 'Smart', priority: 'Priority', due: 'Do date', deadline: 'Deadline', name: 'Name', manual: 'Manual' };
  return `<select id="sort-select" class="btn sm" title="Sort">${Object.entries(opts).map(([k, v]) =>
    `<option value="${k}" ${state.sort === k ? 'selected' : ''}>Sort: ${v}</option>`).join('')}</select>`;
}

function renderRing() {
  const ring = $('#ring');
  const left = openTasks().filter((x) => dueDay(x) && dueDay(x) <= today()).length;
  const done = state.doneToday;
  if (state.view.type !== 'today' || done == null || done + left === 0) { ring.classList.add('hidden'); return; }
  const pct = done / (done + left);
  const c = 2 * Math.PI * 19;
  ring.classList.remove('hidden');
  ring.title = `${done} done, ${left} to go today`;
  ring.innerHTML = `<svg width="46" height="46" viewBox="0 0 46 46">
    <circle cx="23" cy="23" r="19" fill="none" stroke="var(--line)" stroke-width="5"/>
    <circle cx="23" cy="23" r="19" fill="none" stroke="url(#rg)" stroke-width="5" stroke-linecap="round"
      stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}" style="transition:stroke-dashoffset .5s"/>
    <defs><linearGradient id="rg"><stop offset="0" stop-color="var(--accent)"/><stop offset="1" stop-color="var(--accent-2)"/></linearGradient></defs>
  </svg><span class="pct">${Math.round(pct * 100)}%</span>`;
}

function renderView() {
  const v = state.view;
  const viewEl = $('#view');
  viewEl.classList.remove('wide');
  let title = '', sub = '', html = '', actions = sortControl();
  const open = openTasks();
  const t = today();

  if (v.type === 'today') {
    title = 'Today';
    sub = new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    const overdue = open.filter((x) => dueDay(x) && dueDay(x) < t);
    const todays = open.filter((x) => dueDay(x) === t);
    // Tasks whose deadline has arrived but that aren't scheduled for today.
    const dlToday = open.filter((x) => deadlineDay(x) && deadlineDay(x) <= t && !(dueDay(x) && dueDay(x) <= t));
    const dlSoon = open.filter((x) => deadlineDay(x) && deadlineDay(x) > t && deadlineDay(x) <= inDays(3));
    if (dlSoon.length) {
      html += `<div class="banner" data-nav="deadlines">${ic('flag')} ${dlSoon.length} deadline${dlSoon.length === 1 ? '' : 's'} in the next 3 days <span class="spacer"></span> View →</div>`;
    }
    if (overdue.length) {
      html += group('Overdue', taskTree(overdue), {
        cls: 'overdue', sub: String(overdue.length), key: 'overdue',
        extra: `<button class="link-btn" data-act="reschedule-overdue">Reschedule to today</button>`,
      });
    }
    if (dlToday.length) html += group('Deadline reached', taskTree(dlToday, {}, 'deadline'), { cls: 'deadline', sub: String(dlToday.length), key: 'dl' });
    html += group('Today', taskTree(todays) + inlineAdd({ due: t }), { sub: String(todays.length), key: 'today', due: t });
    if (!overdue.length && !todays.length && !dlToday.length) html += empty('sparkle', 'All clear for today. Enjoy it.');
  } else if (v.type === 'upcoming') {
    title = 'Upcoming';
    sub = 'Next 14 days · drag tasks between days to reschedule';
    const overdue = open.filter((x) => dueDay(x) && dueDay(x) < t);
    if (overdue.length) html += group('Overdue', taskTree(overdue), { cls: 'overdue', sub: String(overdue.length), key: 'overdue' });
    for (let i = 0; i < 14; i++) {
      const day = inDays(i);
      const items = open.filter((x) => dueDay(x) === day);
      const dls = open.filter((x) => deadlineDay(x) === day && dueDay(x) !== day);
      const d = parseDay(day);
      html += group(dayLabel(day), taskTree(items) + (dls.length ? taskTree(dls) : '') + inlineAdd({ due: day }), {
        sub: d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + (items.length ? ` · ${items.length}` : '') + (dls.length ? ` · ${dls.length} deadline${dls.length === 1 ? '' : 's'}` : ''),
        due: day,
      });
    }
    const later = open.filter((x) => dueDay(x) && dueDay(x) > inDays(13));
    if (later.length) html += group('Later', taskTree(later), { sub: String(later.length), key: 'later' });
  } else if (v.type === 'deadlines') {
    title = 'Deadlines';
    sub = 'Hard due-by dates, separate from when you plan to do things';
    actions = '';
    const withDl = open.filter((x) => deadlineDay(x));
    const buckets = [
      ['Missed', (d) => d < t, 'overdue'],
      ['This week', (d) => d >= t && d <= inDays(7), 'deadline'],
      ['Next 30 days', (d) => d > inDays(7) && d <= inDays(30), ''],
      ['Later', (d) => d > inDays(30), ''],
    ];
    html = buckets.map(([name, test, cls]) => {
      const items = withDl.filter((x) => test(deadlineDay(x)));
      return items.length ? group(name, taskTree(items, {}, 'deadline'), { cls, sub: String(items.length), key: name }) : '';
    }).join('');
    const risky = withDl.filter(lateForDeadline);
    if (risky.length) html = `<div class="banner" style="--deadline:var(--p1)">${ic('warn')} ${risky.length} task${risky.length === 1 ? ' is' : 's are'} scheduled after ${risky.length === 1 ? 'its' : 'their'} deadline</div>` + html;
    if (!withDl.length) html = empty('flag', 'No deadlines yet. Open any task and set one, press D on a selected task, or type {friday} in quick add. They’re saved in the task description, so no Todoist Pro needed.');
  } else if (v.type === 'focus') {
    title = 'Focus';
    sub = 'Your P1 and P2 tasks across every project';
    const p1 = open.filter((x) => x.priority === 4);
    const p2 = open.filter((x) => x.priority === 3);
    html += group('Priority 1', taskTree(p1) || none, { sub: String(p1.length), key: 'p1' });
    html += group('Priority 2', taskTree(p2) || none, { sub: String(p2.length), key: 'p2' });
  } else if (v.type === 'project') {
    const p = projectById(v.id);
    if (!p) { title = 'Project not found'; html = empty('warn', 'This project no longer exists.'); }
    else {
      title = projectName(p);
      const tasks = open.filter((x) => x.project_id === p.id);
      sub = `${tasks.length} open task${tasks.length === 1 ? '' : 's'}`;
      const layout = store.get('layout:' + p.id, p.view_style === 'board' ? 'board' : 'list');
      actions = `<div class="seg"><button data-layout="list" class="${layout === 'list' ? 'on' : ''}">List</button><button data-layout="board" class="${layout === 'board' ? 'on' : ''}">Board</button></div>`
        + sortControl()
        + `<button class="btn sm" data-act="add-section">${ic('plus')} Section</button>`;
      const sections = state.sections.filter((s) => s.project_id === p.id && !s.is_archived).sort((a, b) => a.section_order - b.section_order);
      const buckets = [{ id: null, name: p.inbox_project ? 'Inbox' : 'No section' }, ...sections];
      if (layout === 'board') {
        viewEl.classList.add('wide');
        html = `<div class="board">${buckets.map((s) => {
          const items = tasks.filter((x) => (x.section_id || null) === s.id && !x.parent_id);
          return `<div class="column glass" data-section="${s.id || ''}" data-project="${p.id}">
            <div class="group-head">${esc(s.name)} <span class="muted">${items.length}</span></div>
            <div class="col-body">${sortTasks(items).map((x) => taskRow(x, { showProject: false })).join('')}</div>
            ${inlineAdd({ project_id: p.id, section_id: s.id })}
          </div>`;
        }).join('')}</div>`;
      } else {
        html = buckets.map((s) => {
          const items = tasks.filter((x) => (x.section_id || null) === s.id);
          if (s.id === null && !items.length && sections.length) return '';
          const body = taskTree(items, { showProject: false }) + inlineAdd({ project_id: p.id, section_id: s.id });
          return s.id === null ? `<section class="group">${body}</section>` : group(s.name, body, { sub: String(items.length), key: s.id });
        }).join('');
      }
    }
  } else if (v.type === 'label') {
    title = '@' + v.id;
    const items = open.filter((x) => x.labels?.includes(v.id));
    sub = `${items.length} task${items.length === 1 ? '' : 's'}`;
    html = items.length ? group('', taskTree(items)) : empty('tag', 'No open tasks with this label.');
  } else if (v.type === 'search') {
    title = `Search: “${v.id || ''}”`;
    const q = (v.id || '').toLowerCase();
    const items = open.filter((x) => x.content.toLowerCase().includes(q) || x.description?.toLowerCase().includes(q));
    sub = `${items.length} result${items.length === 1 ? '' : 's'}`;
    html = items.length ? group('', taskTree(items)) : empty('search', 'Nothing matched.');
  } else if (v.type === 'sketches') {
    title = 'Sketches';
    sub = 'Drawings saved on this computer';
    actions = `<button class="btn primary sm" data-act="new-sketch">${ic('pencil')} New sketch</button>`;
    viewEl.classList.add('wide');
    html = `<div class="sketch-grid">
      <button class="sketch new" data-act="new-sketch">${ic('plus')} New sketch</button>
      ${state.drawings.map((d) => {
        const task = d.task_id && taskById(d.task_id);
        return `<div class="sketch glass" data-sketch="${d.id}">
          <img src="/api/drawings/${d.id}.png?v=${encodeURIComponent(d.updated_at)}" alt="" loading="lazy" />
          <div class="s-title">${esc(d.title)}</div>
          <div class="s-sub">${task ? '↳ ' + esc(plain(task.content)) : new Date(d.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
        </div>`;
      }).join('')}</div>`;
  } else if (v.type === 'completed') {
    title = 'Completed';
    sub = 'Last 7 days';
    actions = '';
    html = '<div class="muted" style="padding:20px 0">Loading…</div>';
    loadCompleted();
  } else if (v.type === 'dashboard') {
    title = 'Dashboard';
    sub = 'How things are looking';
    actions = '';
    html = renderDashboardShell();
    loadDashboard();
  }

  $('#view-title').textContent = title;
  $('#view-sub').textContent = sub;
  $('#head-actions').innerHTML = actions;
  viewEl.innerHTML = html;
  state.baseTitle = `${title} · Capri`;
  renderRing();
  renderTimer();
}

async function loadCompleted() {
  try {
    const { items } = await api('GET', '/api/completed');
    if (state.view.type !== 'completed') return;
    const byDay = {};
    for (const it of items) (byDay[ymd(new Date(it.completed_at))] ||= []).push(it);
    const days = Object.keys(byDay).sort().reverse();
    $('#view').innerHTML = days.length ? days.map((day) => group(dayLabel(day), byDay[day].map((it) => {
      const p = projectById(it.project_id);
      const when = new Date(it.completed_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      return `<div class="task" data-reopen="${esc(it.id || it.task_id)}">
        <button class="check checked" data-act="reopen" title="Reopen">${ic('check')}</button>
        <div class="task-body"><div class="task-content" style="text-decoration:line-through;color:var(--muted)">${md(it.content)}</div>
        <div class="meta"><span>${esc(when)}</span>${p ? `<span class="proj">${esc(projectName(p))}<span class="dot" style="background:${color(p.color)}"></span></span>` : ''}</div></div>
      </div>`;
    }).join(''), { sub: String(byDay[day].length) })).join('') : empty('done', 'Nothing completed in the last week yet.');
  } catch (err) {
    $('#view').innerHTML = empty('warn', err.message);
  }
}

function renderDashboardShell() {
  const open = openTasks();
  const t = today();
  const overdue = open.filter((x) => dueDay(x) && dueDay(x) < t);
  const todays = open.filter((x) => dueDay(x) === t);
  const week = open.filter((x) => dueDay(x) && dueDay(x) > t && dueDay(x) <= inDays(7));
  const dls = sortTasks(open.filter((x) => deadlineDay(x) && deadlineDay(x) <= inDays(14)), 'deadline');
  const noDate = open.filter((x) => !x.due);
  const projCounts = orderedProjects().concat(inbox() ? [inbox()] : [])
    .map((p) => ({ p, n: open.filter((x) => x.project_id === p.id).length }))
    .filter((r) => r.n).sort((a, b) => b.n - a.n).slice(0, 8);
  const max = Math.max(1, ...projCounts.map((r) => r.n));
  const next = sortTasks(open.filter((x) => dueDay(x) && dueDay(x) <= t)).slice(0, 6);

  return `
    <div class="stats">
      <div class="stat glass ${overdue.length ? 'alert' : ''}"><div class="num">${overdue.length}</div><div class="lbl">Overdue</div></div>
      <div class="stat glass"><div class="num">${todays.length}</div><div class="lbl">Due today</div></div>
      <div class="stat glass dl-stat"><div class="num">${dls.length}</div><div class="lbl">Deadlines in 14 days</div></div>
      <div class="stat glass"><div class="num">${week.length}</div><div class="lbl">Next 7 days</div></div>
      <div class="stat glass"><div class="num" id="stat-done">–</div><div class="lbl">Completed this week</div></div>
      <div class="stat glass"><div class="num">${open.length}</div><div class="lbl">Open · ${noDate.length} undated</div></div>
    </div>
    <div class="card glass"><h3>Completed per day</h3><div class="bars" id="done-bars"><span class="muted">Loading…</span></div></div>
    <div class="cards-2">
      <div class="card glass"><h3>Up next</h3>${next.length ? next.map((x) => taskRow(x)).join('') : '<div class="muted">Nothing due. Nice.</div>'}</div>
      <div class="card glass"><h3>${ic('flag')} Upcoming deadlines</h3>${dls.length ? dls.slice(0, 6).map((x) => taskRow(x)).join('') : '<div class="muted">No deadlines in the next two weeks.</div>'}</div>
    </div>
    <div class="card glass"><h3>Open tasks by project</h3><div class="proj-rows">${projCounts.map(({ p, n }) => `
      <div class="proj-row"><span class="name">${esc(projectName(p))}</span>
      <div class="track"><div class="fill" style="width:${(n / max) * 100}%;background:${color(p.color)}"></div></div>
      <span class="muted">${n}</span></div>`).join('') || '<div class="muted">No open tasks</div>'}</div></div>`;
}

async function loadDashboard() {
  try {
    const { items } = await api('GET', '/api/completed');
    if (state.view.type !== 'dashboard') return;
    const days = [...Array(7)].map((_, i) => inDays(i - 6));
    const counts = days.map((d) => items.filter((it) => ymd(new Date(it.completed_at)) === d).length);
    const max = Math.max(1, ...counts);
    $('#stat-done').textContent = items.length;
    $('#done-bars').innerHTML = days.map((d, i) => `
      <div class="bar-col"><span class="v">${counts[i] || ''}</span>
      <div class="bar" style="height:${(counts[i] / max) * 100}%"></div>
      <span class="d">${parseDay(d).toLocaleDateString([], { weekday: 'short' })}</span></div>`).join('');
  } catch (err) {
    const el = $('#done-bars');
    if (el) el.innerHTML = `<span class="muted">${esc(err.message)}</span>`;
  }
}

function renderBulk() {
  const n = state.picked.size;
  $('#bulk').classList.toggle('hidden', !n);
  $('#bulk-count').textContent = `${n} selected`;
}

// ---------- detail drawer ----------

// Re-renders the drawer after a change without losing what the user is in the middle of:
// the focused field (and any unsaved text in it), the caret, and the scroll position.
function refreshDetail() {
  const el = $('#detail');
  const a = document.activeElement;
  const keep = a?.id && el.contains(a)
    ? { id: a.id, value: a.value, start: a.selectionStart, end: a.selectionEnd, text: a.matches('textarea, input:not([type="date"])') }
    : null;
  const scroll = el.scrollTop;
  renderDetail();
  el.scrollTop = scroll;
  const next = keep && document.getElementById(keep.id);
  if (!next) return;
  if (keep.text) {
    next.value = keep.value;
    try { next.setSelectionRange(keep.start, keep.end); } catch { /* not a text field */ }
  }
  next.focus({ preventScroll: true });
}

function renderDetail() {
  const el = $('#detail');
  const t = taskById(state.detailId);
  if (!t) { el.classList.add('hidden'); return; }
  el.classList.remove('hidden');
  const p = projectById(t.project_id);
  const parent = t.parent_id && taskById(t.parent_id);
  const kids = sortTasks(childrenOf(t.id), 'manual');
  const day = dueDay(t);
  const dl = deadlineDay(t);
  const projOptions = [inbox(), ...orderedProjects()].filter(Boolean).map((pr) => {
    const secs = state.sections.filter((s) => s.project_id === pr.id && !s.is_archived);
    return `<option value="${pr.id}|" ${pr.id === t.project_id && !t.section_id ? 'selected' : ''}>${esc(projectName(pr))}</option>`
      + secs.map((s) => `<option value="${pr.id}|${s.id}" ${s.id === t.section_id ? 'selected' : ''}>${esc(projectName(pr))} / ${esc(s.name)}</option>`).join('');
  }).join('');
  const dueChips = [['Today', 'today'], ['Tomorrow', 'tomorrow'], ['This weekend', 'saturday'], ['Next week', 'next monday'], ['No date', 'no date']];
  const dlChips = [['Today', today()], ['Tomorrow', inDays(1)], ['Friday', nextWeekday(5)], ['In a week', inDays(7)], ['In 2 weeks', inDays(14)], ['In a month', inDays(30)]];

  el.innerHTML = `
    <div class="detail-top">
      <span>${parent ? `↳ <a href="#" data-open="${parent.id}">${esc(plain(parent.content))}</a>` : esc(projectName(p))}</span>
      <div style="display:flex;gap:2px">
        <a class="icon-btn" href="https://app.todoist.com/app/task/${t.id}" target="_blank" rel="noopener" title="Open in Todoist">${ic('external')}</a>
        <button class="icon-btn" data-act="close-detail" title="Close (Esc)">${ic('close')}</button>
      </div>
    </div>
    <div class="detail-title">
      <button class="check ${prioClass(t.priority)}" data-act="complete-detail">${ic('check')}</button>
      <textarea id="d-content" rows="1">${esc(t.content)}</textarea>
    </div>
    <textarea id="d-desc" class="desc" rows="3" placeholder="Add a description…">${esc(stripDeadline(t.description))}</textarea>

    <div class="date-block glass-inset">
      <div class="bh">${calIcon(day || today())} Do date <span class="countdown">${day ? esc(dayLabel(day)) + (dueTime(t) ? ' · ' + esc(dueTime(t)) : '') : 'not scheduled'}</span></div>
      <div class="date-row">
        <input id="d-due" placeholder="tomorrow 5pm, every mon…" value="${esc(t.due?.string || '')}" />
        ${dateField('d-due-date', day, 'Pick date')}
      </div>
      <div class="quick-chips">${dueChips.map(([l, v]) => `<button class="qchip" data-due-set="${v}">${l}</button>`).join('')}</div>
    </div>

    <div class="date-block deadline-block glass-inset">
      <div class="bh">${ic('flag')} Deadline <span class="countdown">${dl ? `<span class="dl ${dlClass(dl)}">${esc(countdown(dl))}</span>` : 'none'}</span></div>
      <div class="date-row">
        ${dateField('d-deadline', dl, 'Pick a deadline', 'wide')}
        ${dl ? '<button class="qchip" data-deadline-set="">Clear</button>' : ''}
      </div>
      <div class="quick-chips">${dlChips.map(([l, v]) => `<button class="qchip" data-deadline-set="${v}">${l}</button>`).join('')}</div>
      ${lateForDeadline(t) ? `<div class="warn small">${ic('warn')} Scheduled for ${esc(dayLabel(day))}, after the deadline. <a href="#" data-act="due-to-deadline">Do it the day before</a></div>` : ''}
    </div>

    <label class="field"><span>Project</span><select id="d-project">${projOptions}</select></label>
    <div class="field"><span>Priority</span><div class="prio-pick">${[4, 3, 2, 1].map((n) =>
      `<button data-prio="${n}" class="${t.priority === n ? 'on' : ''}" style="color:var(--${prioClass(n)})">P${5 - n}</button>`).join('')}</div></div>
    <div class="field"><span>Labels</span><div class="chips">${state.labels.map((l) =>
      `<button class="chip ${t.labels?.includes(l.name) ? 'on' : ''}" data-label="${esc(l.name)}">@${esc(l.name)}</button>`).join('') || '<span class="muted small">No labels in your account</span>'}</div></div>

    <div class="section-title">Sub-tasks ${kids.length ? `<span class="muted">${kids.length}</span>` : ''}</div>
    <div class="subtask-list">${kids.map((k) => taskRow(k, { showProject: false })).join('')}
      ${inlineAdd({ parent_id: t.id, project_id: t.project_id })}</div>

    <div class="section-title">Sketches</div>
    <div class="thumbs">
      ${drawingsFor(t.id).map((d) => `<button class="thumb" data-sketch="${d.id}" title="${esc(d.title)}"><img src="/api/drawings/${d.id}.png?v=${encodeURIComponent(d.updated_at)}" alt="" /></button>`).join('')}
      <button class="thumb add" data-act="h-sketch" title="New sketch for this task">${ic('plus')}</button>
    </div>

    <div class="section-title">Comments</div>
    <div class="comments" id="d-comments">${state.comments.id === t.id ? state.comments.html : '<span class="muted small">Loading…</span>'}</div>
    <form class="comment-form" id="comment-form"><input id="comment-input" placeholder="Write a comment…" /><button class="btn sm">Send</button></form>

    <div class="detail-actions">
      <button class="btn sm" data-act="h-timer">${ic('timer')} Focus on this</button>
      <button class="btn sm" data-act="duplicate">${ic('duplicate')} Duplicate</button>
      <button class="btn sm" data-act="copy">${ic('copy')} Copy text</button>
      <button class="btn sm ghost danger" data-act="delete">${ic('trash')} Delete</button>
    </div>`;

  const ta = $('#d-content');
  ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px';
  // Only fetch comments when a different task is opened; re-renders reuse what we have.
  if (state.comments.id !== t.id) loadComments(t.id);
}

async function loadComments(id) {
  try {
    const { comments } = await api('GET', `/api/tasks/${id}/comments`);
    const html = comments.length ? comments.map((c) =>
      `<div class="comment"><div class="when">${esc(new Date(c.posted_at).toLocaleString())}</div>${md(c.content)}</div>`).join('')
      : '<span class="muted small">No comments yet</span>';
    state.comments = { id, html };
    if (state.detailId === id) $('#d-comments').innerHTML = html;
  } catch { /* drawer still works without comments */ }
}

function openDetail(id, focusSel) {
  state.detailId = id;
  state.selectedId = id;
  renderDetail();
  $$('.task.selected').forEach((e) => e.classList.remove('selected'));
  $$(`[data-task="${id}"]`).forEach((e) => e.classList.add('selected'));
  if (focusSel) {
    const input = $(focusSel);
    // Date fields open our calendar; anything else just gets focus.
    const picker = input?.type === 'hidden' && $(`[data-date-for="${input.id}"]`);
    if (picker) requestAnimationFrame(() => openDatePicker(picker));
    else input?.focus();
  }
}

function closeDetail() { state.detailId = null; renderDetail(); }

// ---------- mutations ----------

function patchLocal(id, changes) {
  const t = taskById(id);
  if (t) Object.assign(t, changes);
}

async function updateTask(id, body, { rerender = true } = {}) {
  try {
    const updated = await api('POST', `/api/tasks/${id}`, body);
    patchLocal(id, updated);
    if (rerender) render();
    return updated;
  } catch (err) { toast(err.message); }
}

const isRepeatString = (s) => /\b(every|daily|weekly|monthly|yearly|annually)\b/i.test(s);

// Giving a repeating task a one-off date wipes its recurrence, so confirm first.
async function setDue(id, dueString) {
  const t = taskById(id);
  if (t?.due?.is_recurring && !isRepeatString(dueString)
    && !(await confirmDropRepeat(t, `Changing it to “${dueString}”`))) return render();
  return updateTask(id, { due_string: dueString });
}

// Picking a calendar date on a recurring task would wipe the recurrence, so warn first.
async function setDueDate(id, date) {
  const t = taskById(id);
  if (t?.due?.is_recurring && !(await confirmDropRepeat(t, 'Setting a fixed date'))) return render();
  return updateTask(id, date ? { due_date: date } : { due_string: 'no date' });
}

async function setDeadline(id, date) {
  const t = taskById(id);
  if (!t) return;
  const prev = t.description || '';
  const description = withDeadline(prev, date);
  patchLocal(id, { description });
  render();
  try {
    const updated = await api('POST', `/api/tasks/${id}`, { description });
    patchLocal(id, updated);
    render();
    toast(date ? `Deadline set: ${dayLabel(date)} (${countdown(date)})` : 'Deadline cleared');
  } catch (err) {
    patchLocal(id, { description: prev });
    render();
    toast(err.message);
  }
}

async function moveTask(id, project_id, section_id) {
  const body = section_id ? { section_id } : { project_id };
  patchLocal(id, { project_id, section_id: section_id || null });
  render();
  try { await api('POST', `/api/tasks/${id}/move`, body); }
  catch (err) { toast(err.message); sync({ quiet: true }); }
}

async function completeTask(id, { quiet = false } = {}) {
  const t = taskById(id);
  if (!t) return;
  $$(`[data-task="${id}"]`).forEach((row) => {
    $('.check', row)?.classList.add('checked');
    row.classList.add('done-anim');
  });
  if (state.detailId === id) closeDetail();
  await new Promise((r) => setTimeout(r, 380));
  const recurring = t.due?.is_recurring;
  if (!recurring) {
    t.checked = true;
    state.tasks.filter((c) => c.parent_id === id).forEach((c) => (c.checked = true));
  }
  if (state.doneToday != null) state.doneToday++;
  state.picked.delete(id);
  render();
  try {
    await api('POST', `/api/tasks/${id}/close`);
    if (recurring) { await sync({ quiet: true }); if (!quiet) toast('Recurring task rescheduled'); }
    else if (!quiet) toast('Task completed', { label: 'Undo', run: () => reopenTask(id) });
  } catch (err) {
    t.checked = false;
    if (state.doneToday) state.doneToday--;
    render();
    toast(err.message);
  }
}

async function reopenTask(id) {
  try {
    await api('POST', `/api/tasks/${id}/reopen`);
    const t = taskById(id);
    if (t) { t.checked = false; if (state.doneToday) state.doneToday--; render(); }
    else await sync({ quiet: true });
    if (state.view.type === 'completed') loadCompleted();
    toast('Task reopened');
  } catch (err) { toast(err.message); }
}

async function deleteTask(id) {
  const t = taskById(id);
  if (!t || !(await askConfirm('Delete this task?', { body: `“${plain(t.content)}” will be deleted from Todoist. This can't be undone.`, ok: 'Delete', danger: true }))) return;
  try {
    await api('DELETE', `/api/tasks/${id}`);
    state.tasks = state.tasks.filter((x) => x.id !== id && x.parent_id !== id);
    closeDetail();
    render();
    toast('Task deleted');
  } catch (err) { toast(err.message); }
}

// Swipe-delete: the task disappears now and is deleted from Todoist once the undo window passes.
const pendingDeletes = new Map();
function deleteTaskSoon(id) {
  const removed = state.tasks.filter((x) => x.id === id || x.parent_id === id);
  if (!removed.length) return;
  state.tasks = state.tasks.filter((x) => !removed.includes(x));
  state.picked.delete(id);
  if (state.detailId === id) closeDetail();
  render();
  const commit = () => {
    if (!pendingDeletes.delete(id)) return;
    api('DELETE', `/api/tasks/${id}`).catch((err) => { state.tasks.push(...removed); render(); toast(err.message); });
  };
  pendingDeletes.set(id, commit);
  setTimeout(commit, 6000);
  toast('Task deleted', {
    label: 'Undo',
    run: () => { if (pendingDeletes.delete(id)) { state.tasks.push(...removed); render(); } },
  });
}
// Closing the app mid-undo still deletes; keepalive lets the request outlive the page.
addEventListener('pagehide', () => {
  for (const id of pendingDeletes.keys()) fetch(`/api/tasks/${id}`, { method: 'DELETE', keepalive: true });
  pendingDeletes.clear();
});

async function duplicateTask(id) {
  const t = taskById(id);
  if (!t) return;
  try {
    const body = {
      content: t.content, description: t.description, project_id: t.project_id, section_id: t.section_id || undefined,
      parent_id: t.parent_id || undefined, labels: t.labels, priority: t.priority,
      due_string: t.due?.string || undefined,
    };
    const copy = await api('POST', '/api/tasks', body);
    state.tasks.push(copy);
    render();
    openDetail(copy.id);
    toast('Task duplicated');
  } catch (err) { toast(err.message); }
}

async function setPriority(id, priority) {
  patchLocal(id, { priority });
  render();
  await updateTask(id, { priority });
}

// ---------- quick add ----------

function openQuick(ctx = null) {
  state.quickContext = ctx;
  $('#quick').classList.remove('hidden');
  const input = $('#quick-input');
  input.value = '';
  $('#quick-desc').value = '';
  $('#quick-due').value = ctx?.due || '';
  $('#quick-deadline').value = ctx?.deadline || '';
  syncDateFields($('#quick'));
  state.quickIgnore = null;
  const p = ctx?.project_id && projectById(ctx.project_id);
  input.placeholder = ctx?.parent_id ? 'Sub-task name…'
    : p ? `Add to ${projectName(p)}…  (dates, @labels, p1, {deadline} work too)`
    : 'e.g. Review deck tmr 4pm #Work @focus p1 {fri}';
  updateQuickPreview();
  setTimeout(() => input.focus(), 0);
}

function closeQuick() { $('#quick').classList.add('hidden'); }

// The date found in the quick-add title, unless the user dismissed it.
function quickDate(text) {
  const d = detectDate(text);
  return d && d.text !== state.quickIgnore ? d : null;
}

// Paints highlights behind the transparent input, Todoist-style.
function renderQuickMirror(text, date) {
  const ranges = [];
  if (date) ranges.push([date.index, date.index + date.text.length, 'hl-date']);
  for (const m of text.matchAll(/(^|\s)([#@]\S+)/g)) ranges.push([m.index + m[1].length, m.index + m[0].length, m[2][0] === '#' ? 'hl-proj' : 'hl-label']);
  for (const m of text.matchAll(/(^|\s)(p[1-4])(?=\s|$)/gi)) ranges.push([m.index + m[1].length, m.index + m[0].length, 'hl-prio']);
  for (const m of text.matchAll(/\{[^}]*\}/g)) ranges.push([m.index, m.index + m[0].length, 'hl-dl']);
  ranges.sort((a, b) => a[0] - b[0]);
  let html = '';
  let at = 0;
  for (const [start, end, cls] of ranges) {
    if (start < at) continue;
    html += esc(text.slice(at, start)) + `<mark class="${cls}">${esc(text.slice(start, end))}</mark>`;
    at = end;
  }
  const mirror = $('#quick-mirror');
  mirror.innerHTML = html + esc(text.slice(at)) + ' ';
  mirror.scrollLeft = $('#quick-input').scrollLeft;
}

function updateQuickPreview() {
  const text = $('#quick-input').value;
  const date = quickDate(text);
  renderQuickMirror(text, date);
  // A date typed in the title wins over the picker, so fade the picker to show that.
  $('#quick-due').closest('.date-pill').classList.toggle('overridden', Boolean(date || /\bevery\b/i.test(text)));
  const chips = [];
  for (const m of text.matchAll(/(^|\s)#(\S+)/g)) chips.push([m[2], '', 'folder']);
  for (const m of text.matchAll(/(^|\s)@(\S+)/g)) chips.push([m[2], '', 'tag']);
  const pm = text.match(/(^|\s)p([1-4])(\s|$)/i);
  if (pm) chips.push(['Priority ' + pm[2], '', 'flag']);
  const every = text.match(/\bevery\b[^#@{]*/i);
  if (every) chips.push([every[0].trim(), '', 'repeat']);
  else if (date) chips.push([detectedLabel(date), 'datec', 'calendar', true]);
  else if ($('#quick-due').value) chips.push([dayLabel($('#quick-due').value), '', 'calendar']);
  const dlText = text.match(/\{([^}]+)\}/);
  const dl = dlText ? parseDate(dlText[1]) : $('#quick-deadline').value;
  if (dlText && !dl) chips.push([`Can't read deadline “${dlText[1]}”`, 'warnc', 'warn']);
  else if (dl) chips.push([`Deadline ${dayLabel(dl)} · ${countdown(dl)}`, 'dlc', 'flag']);
  $('#quick-preview').innerHTML = chips.map(([c, cls = '', icon, dismiss]) =>
    `<span class="chip ${cls}">${icon ? ic(icon) : ''}${esc(c)}${dismiss
      ? `<button class="chip-x" data-quick-ignore title="Not a date — keep it in the title">${ic('close')}</button>` : ''}</span>`).join('');
}

async function saveQuick() {
  let raw = $('#quick-input').value.trim();
  // Pull the detected date out of the title ourselves so shorthands like "tmr" work.
  const date = quickDate(raw);
  if (date) raw = (raw.slice(0, date.index) + ' ' + raw.slice(date.index + date.text.length)).replace(/\s+/g, ' ').trim();
  const dlText = raw.match(/\{([^}]+)\}/);
  const dlDate = dlText ? parseDate(dlText[1]) : $('#quick-deadline').value;
  if (dlText && !dlDate) return toast(`Couldn't understand the deadline “${dlText[1]}” — try {fri}, {nov 2} or {in 2 weeks}`);
  const text = raw.replace(/\s*\{[^}]*\}\s*/g, ' ').trim();
  if (!text) return;
  const description = withDeadline($('#quick-desc').value.trim(), dlDate || null);
  const dueDate = $('#quick-due').value;
  const ctx = state.quickContext || {};
  const btn = $('#quick-save');
  btn.disabled = true;
  try {
    let task = await api('POST', '/api/tasks/quick', { text });
    const fix = {};
    if (description) fix.description = description;
    if (date?.time) fix.due_datetime = new Date(`${date.date}T${date.time}:00`).toISOString();
    else if (date) fix.due_date = date.date;
    else if (dueDate && !task.due) fix.due_date = dueDate;
    if (Object.keys(fix).length) task = { ...task, ...(await api('POST', `/api/tasks/${task.id}`, fix)) };
    // Inline adds inherit their project/section/parent unless the text names a #project.
    if (!/(^|\s)#\S/.test(text)) {
      const move = ctx.parent_id ? { parent_id: ctx.parent_id }
        : ctx.section_id ? { section_id: ctx.section_id }
        : ctx.project_id && ctx.project_id !== task.project_id ? { project_id: ctx.project_id } : null;
      if (move) {
        await api('POST', `/api/tasks/${task.id}/move`, move);
        task.parent_id = ctx.parent_id || null;
        task.section_id = ctx.section_id || null;
        task.project_id = ctx.project_id || task.project_id;
      }
    }
    state.tasks.push(task);
    render();
    $('#quick-input').value = '';
    $('#quick-desc').value = '';
    state.quickIgnore = null;
    updateQuickPreview();
    toast(date ? `Task added for ${detectedLabel(date)}` : 'Task added');
    if (ctx.parent_id) closeQuick();
  } catch (err) {
    toast(err.message);
  } finally {
    btn.disabled = false;
    $('#quick-input').focus();
  }
}

// ---------- command palette ----------

let paletteItems = [];
let paletteIndex = 0;

function openPalette() {
  $('#palette').classList.remove('hidden');
  $('#palette-input').value = '';
  paletteIndex = 0;
  renderPalette();
  setTimeout(() => $('#palette-input').focus(), 0);
}
function closePalette() { $('#palette').classList.add('hidden'); }

function renderPalette() {
  const q = $('#palette-input').value.trim().toLowerCase();
  const match = (s) => !q || s.toLowerCase().includes(q);
  const commands = [
    { label: 'Add task', run: () => openQuick() },
    { label: 'New sketch', run: () => openDraw({}) },
    { label: 'Start focus timer', run: () => startTimer() },
    { label: 'Go to Dashboard', run: () => setView({ type: 'dashboard' }) },
    { label: 'Go to Today', run: () => setView({ type: 'today' }) },
    { label: 'Go to Upcoming', run: () => setView({ type: 'upcoming' }) },
    { label: 'Go to Deadlines', run: () => setView({ type: 'deadlines' }) },
    { label: 'Go to Focus', run: () => setView({ type: 'focus' }) },
    { label: 'Go to Sketches', run: () => setView({ type: 'sketches' }) },
    { label: 'Go to Completed', run: () => setView({ type: 'completed' }) },
    { label: 'Theme: Light', run: () => switchTheme('light') },
    { label: 'Theme: Dark', run: () => switchTheme('dark') },
    { label: 'Theme: Capri (neon)', run: () => switchTheme('capri') },
    { label: 'Keyboard shortcuts', run: () => $('#help').classList.remove('hidden') },
    { label: 'Sync now', run: () => sync() },
    { label: 'New project', run: createProject },
  ].filter((c) => match(c.label)).map((c) => ({ ...c, kind: 'Command', group: 'Commands' }));
  const projects = [inbox(), ...orderedProjects()].filter(Boolean).filter((p) => match(projectName(p))).map((p) => ({
    label: projectName(p), dot: color(p.color), kind: 'Project', group: 'Projects',
    run: () => setView({ type: 'project', id: p.id }),
  }));
  const labels = state.labels.filter((l) => match(l.name)).map((l) => ({
    label: '@' + l.name, dot: color(l.color), kind: 'Label', group: 'Labels', run: () => setView({ type: 'label', id: l.name }),
  }));
  const tasks = q ? openTasks().filter((t) => match(t.content) || match(t.description || '')).slice(0, 12).map((t) => ({
    label: t.content, kind: 'Task', group: 'Tasks', run: () => openDetail(t.id),
  })) : [];
  const sketches = q ? state.drawings.filter((d) => match(d.title)).slice(0, 6).map((d) => ({
    label: d.title, kind: 'Sketch', group: 'Sketches', run: () => openDraw({ drawing: d }),
  })) : [];
  const searchAll = q ? [{ label: `Search all tasks for “${q}”`, kind: 'Search', group: 'Tasks', run: () => setView({ type: 'search', id: q }) }] : [];

  paletteItems = [...tasks, ...searchAll, ...sketches, ...projects, ...labels, ...commands];
  paletteIndex = Math.min(paletteIndex, Math.max(0, paletteItems.length - 1));
  let lastGroup = '';
  $('#palette-results').innerHTML = paletteItems.map((it, i) => {
    const head = it.group !== lastGroup ? `<div class="pal-head">${esc(it.group)}</div>` : '';
    lastGroup = it.group;
    return head + `<div class="pal-item ${i === paletteIndex ? 'on' : ''}" data-pal="${i}">
      ${it.dot ? `<span style="width:9px;height:9px;border-radius:50%;background:${it.dot}"></span>` : ''}
      <span>${md(it.label)}</span><span class="kind">${esc(it.kind)}</span></div>`;
  }).join('') || '<div class="muted" style="padding:14px">No matches</div>';
  $('.pal-item.on')?.scrollIntoView({ block: 'nearest' });
}

function runPalette(i) {
  const it = paletteItems[i];
  if (!it) return;
  closePalette();
  it.run();
}

// ---------- focus timer ----------

const TIMER_LEN = { focus: 25 * 60, break: 5 * 60 };
const timer = store.get('timer', { mode: 'focus', remaining: TIMER_LEN.focus, running: false, endAt: 0, taskId: null });
const saveTimer = () => store.set('timer', timer);
const timerLeft = () => (timer.running ? Math.max(0, Math.round((timer.endAt - Date.now()) / 1000)) : timer.remaining);
const mmss = (s) => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;

function renderTimer() {
  const left = timerLeft();
  const task = timer.taskId && taskById(timer.taskId);
  $('#timer').classList.toggle('running', timer.running);
  $('#timer').classList.toggle('break', timer.mode === 'break');
  $('#timer-mode').textContent = timer.mode === 'focus' ? (timer.running ? 'Focusing' : 'Focus') : 'Break';
  $('#timer-time').textContent = mmss(left);
  $('#timer-task').textContent = task ? '↳ ' + plain(task.content) : 'No task linked';
  $('#timer-toggle').textContent = timer.running ? 'Pause' : 'Start';
  document.title = timer.running ? `${mmss(left)} · ${state.baseTitle}` : state.baseTitle;
}

function startTimer(taskId) {
  if (taskId) {
    if (timer.taskId !== taskId) { timer.mode = 'focus'; timer.running = false; timer.remaining = TIMER_LEN.focus; }
    timer.taskId = taskId;
  }
  if (!timer.running) { timer.endAt = Date.now() + timer.remaining * 1000; timer.running = true; }
  if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
  saveTimer();
  renderTimer();
  const task = timer.taskId && taskById(timer.taskId);
  toast(task ? `Focusing on “${plain(task.content)}”` : 'Focus timer started');
}

function pauseTimer() { timer.remaining = timerLeft(); timer.running = false; saveTimer(); renderTimer(); }
function resetTimer() { timer.running = false; timer.remaining = TIMER_LEN[timer.mode]; saveTimer(); renderTimer(); }
function switchTimer() { timer.mode = timer.mode === 'focus' ? 'break' : 'focus'; resetTimer(); }

function chime() {
  try {
    const ctx = new AudioContext();
    [660, 880, 990].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.18);
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + i * 0.18 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.18 + 0.5);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.18);
      o.stop(ctx.currentTime + i * 0.18 + 0.55);
    });
  } catch { /* audio is optional */ }
}

setInterval(() => {
  if (timer.running && timerLeft() <= 0) {
    const msg = timer.mode === 'focus' ? 'Focus session done — take a 5 minute break.' : 'Break over — back to it.';
    timer.mode = timer.mode === 'focus' ? 'break' : 'focus';
    timer.running = false;
    timer.remaining = TIMER_LEN[timer.mode];
    saveTimer();
    chime();
    toast(msg);
    if ('Notification' in window && Notification.permission === 'granted') new Notification('Capri', { body: msg });
  }
  renderTimer();
}, 1000);

// ---------- drawing pad ----------

const PAPER = '#fffdf8';
const INKS = ['#1d1d1f', '#e5383b', '#f08a00', '#f5c400', '#14a44d', '#2f6bff', '#a23cf0', '#ffffff'];
const pad2d = {
  strokes: [], redo: [], tool: 'pen', color: INKS[0], size: 4,
  base: null, editing: null, current: null, cache: null, dirty: false,
};

function openDraw({ drawing = null, taskId = null }) {
  pad2d.editing = drawing;
  pad2d.strokes = [];
  pad2d.redo = [];
  pad2d.base = null;
  pad2d.dirty = false;
  const task = taskId || drawing?.task_id || null;
  const linked = task && taskById(task);
  $('#draw-title').value = drawing?.title || (linked ? `Sketch: ${plain(linked.content)}`.slice(0, 80) : '');
  $('#draw-task').innerHTML = '<option value="">Not attached to a task</option>' + sortTasks(openTasks(), 'name').map((t) =>
    `<option value="${t.id}" ${t.id === task ? 'selected' : ''}>↳ ${esc(plain(t.content).slice(0, 60))}</option>`).join('');
  $('#draw-delete').classList.toggle('hidden', !drawing);
  $('#draw').classList.remove('hidden');
  requestAnimationFrame(() => {
    sizeCanvas();
    if (drawing) {
      const img = new Image();
      img.onload = () => { pad2d.base = img; rebuildCache(); paint(); };
      img.src = `/api/drawings/${drawing.id}.png?v=${encodeURIComponent(drawing.updated_at)}`;
    }
  });
}

async function closeDraw(force = false) {
  if (!force && pad2d.dirty && !(await askConfirm('Discard this sketch?', { body: 'Your changes haven’t been saved.', ok: 'Discard', cancel: 'Keep drawing', danger: true }))) return;
  $('#draw').classList.add('hidden');
}

function sizeCanvas() {
  const canvas = $('#draw-canvas');
  const rect = canvas.parentElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  pad2d.cache = document.createElement('canvas');
  pad2d.cache.width = canvas.width;
  pad2d.cache.height = canvas.height;
  rebuildCache();
  paint();
}

function drawStroke(ctx, s) {
  const dpr = window.devicePixelRatio || 1;
  const pts = s.points;
  if (!pts.length) return;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = s.color;
  ctx.globalCompositeOperation = s.tool === 'eraser' ? 'destination-out' : s.tool === 'marker' ? 'multiply' : 'source-over';
  ctx.globalAlpha = s.tool === 'marker' ? 0.35 : 1;
  const avgP = pts.reduce((a, p) => a + p[2], 0) / pts.length;
  ctx.lineWidth = (s.tool === 'marker' ? s.size * 3 : s.tool === 'eraser' ? s.size * 3 : s.size * (0.6 + avgP * 0.8)) * dpr;
  ctx.beginPath();
  ctx.moveTo(pts[0][0] * dpr, pts[0][1] * dpr);
  if (pts.length === 1) ctx.lineTo(pts[0][0] * dpr + 0.1, pts[0][1] * dpr);
  // Quadratic curves through midpoints keep lines smooth instead of jagged.
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
    const my = (pts[i][1] + pts[i + 1][1]) / 2;
    ctx.quadraticCurveTo(pts[i][0] * dpr, pts[i][1] * dpr, mx * dpr, my * dpr);
  }
  if (pts.length > 1) ctx.lineTo(pts.at(-1)[0] * dpr, pts.at(-1)[1] * dpr);
  ctx.stroke();
  ctx.restore();
}

function rebuildCache() {
  const c = pad2d.cache;
  if (!c) return;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  if (pad2d.base) {
    const scale = Math.min(c.width / pad2d.base.width, c.height / pad2d.base.height);
    ctx.drawImage(pad2d.base, 0, 0, pad2d.base.width * scale, pad2d.base.height * scale);
  }
  pad2d.strokes.forEach((s) => drawStroke(ctx, s));
}

function paint() {
  const canvas = $('#draw-canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (pad2d.cache) ctx.drawImage(pad2d.cache, 0, 0);
  if (pad2d.current) drawStroke(ctx, pad2d.current);
}

function drawUndo() { if (pad2d.strokes.length) { pad2d.redo.push(pad2d.strokes.pop()); rebuildCache(); paint(); } }
function drawRedo() { if (pad2d.redo.length) { pad2d.strokes.push(pad2d.redo.pop()); rebuildCache(); paint(); } }
function setTool(tool) {
  pad2d.tool = tool;
  $$('#draw-tool button').forEach((b) => b.classList.toggle('on', b.dataset.tool === tool));
}

async function saveDrawing() {
  const canvas = $('#draw-canvas');
  const out = document.createElement('canvas');
  out.width = canvas.width;
  out.height = canvas.height;
  const ctx = out.getContext('2d');
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(pad2d.cache, 0, 0);
  const btn = $('#draw-save');
  btn.disabled = true;
  try {
    const saved = await api('POST', '/api/drawings', {
      id: pad2d.editing?.id,
      title: $('#draw-title').value.trim() || 'Untitled sketch',
      task_id: $('#draw-task').value || null,
      image: out.toDataURL('image/png'),
    });
    state.drawings = [saved, ...state.drawings.filter((d) => d.id !== saved.id)];
    closeDraw(true);
    render();
    toast('Sketch saved');
  } catch (err) { toast(err.message); }
  finally { btn.disabled = false; }
}

async function deleteDrawing() {
  const d = pad2d.editing;
  if (!d || !(await askConfirm('Delete this sketch?', { body: `“${d.title}” will be deleted. This can't be undone.`, ok: 'Delete', danger: true }))) return;
  try {
    await api('DELETE', `/api/drawings/${d.id}`);
    state.drawings = state.drawings.filter((x) => x.id !== d.id);
    closeDraw(true);
    render();
    toast('Sketch deleted');
  } catch (err) { toast(err.message); }
}

(function setupDrawPad() {
  const canvas = $('#draw-canvas');
  $('#draw-colors').innerHTML = INKS.map((c, i) => `<button class="swatch ${i === 0 ? 'on' : ''}" data-ink="${c}" style="background:${c}"></button>`).join('');
  const point = (e) => {
    const r = canvas.getBoundingClientRect();
    // Mice report 0.5 pressure; pens report real pressure.
    return [e.clientX - r.left, e.clientY - r.top, e.pointerType === 'pen' ? e.pressure || 0.5 : 0.5];
  };
  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    pad2d.current = { tool: pad2d.tool, color: pad2d.color, size: pad2d.size, points: [point(e)] };
    paint();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!pad2d.current) return;
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    evs.forEach((ev) => pad2d.current.points.push(point(ev)));
    requestAnimationFrame(paint);
  });
  const end = () => {
    if (!pad2d.current) return;
    pad2d.strokes.push(pad2d.current);
    pad2d.current = null;
    pad2d.redo = [];
    pad2d.dirty = true;
    rebuildCache();
    paint();
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  $('#draw-tool').addEventListener('click', (e) => { const b = e.target.closest('[data-tool]'); if (b) setTool(b.dataset.tool); });
  $('#draw-colors').addEventListener('click', (e) => {
    const b = e.target.closest('[data-ink]');
    if (!b) return;
    pad2d.color = b.dataset.ink;
    $$('.swatch').forEach((s) => s.classList.toggle('on', s === b));
    if (pad2d.tool === 'eraser') setTool('pen');
  });
  $('#draw-size').addEventListener('input', (e) => (pad2d.size = Number(e.target.value)));
  $('#draw-undo').addEventListener('click', drawUndo);
  $('#draw-redo').addEventListener('click', drawRedo);
  $('#draw-clear').addEventListener('click', async () => {
    if (!pad2d.strokes.length && !pad2d.base) return;
    if (!(await askConfirm('Clear the whole canvas?', { body: 'Everything on it will be erased. This can’t be undone.', ok: 'Clear', danger: true }))) return;
    pad2d.strokes = []; pad2d.redo = []; pad2d.base = null; pad2d.dirty = true;
    rebuildCache(); paint();
  });
  $('#draw-save').addEventListener('click', saveDrawing);
  $('#draw-cancel').addEventListener('click', () => closeDraw());
  $('#draw-delete').addEventListener('click', deleteDrawing);
  window.addEventListener('resize', () => { if (!$('#draw').classList.contains('hidden')) sizeCanvas(); });
})();

// ---------- misc actions ----------

// Electron (the desktop app) doesn't support window.prompt, so ask with our own dialog.
function askText(title, { placeholder = '', ok = 'Create' } = {}) {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'modal ask-modal';
    modal.innerHTML = `<form class="modal-card glass ask-card">
      <h3>${esc(title)}</h3>
      <input type="text" placeholder="${esc(placeholder)}" autocomplete="off" />
      <div class="ask-actions"><button type="button" class="btn" data-ask-cancel>Cancel</button><button class="btn primary">${esc(ok)}</button></div>
    </form>`;
    const input = modal.querySelector('input');
    const done = (value) => { modal.remove(); resolve(value); };
    modal.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); if (input.value.trim()) done(input.value.trim()); });
    modal.querySelector('[data-ask-cancel]').addEventListener('click', () => done(null));
    modal.addEventListener('click', (e) => { if (e.target === modal) done(null); });
    modal.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Escape') done(null); });
    document.body.appendChild(modal);
    input.focus();
  });
}

// Our own yes/no dialog instead of the browser's confirm() box.
function askConfirm(title, { body = '', ok = 'OK', cancel = 'Cancel', danger = false, icon = danger ? 'trash' : 'warn' } = {}) {
  return new Promise((resolve) => {
    const prev = document.activeElement;
    const modal = document.createElement('div');
    modal.className = 'modal ask-modal';
    modal.innerHTML = `<div class="modal-card glass ask-card confirm-card ${danger ? 'is-danger' : ''}" role="alertdialog" aria-modal="true" aria-labelledby="ask-title">
      <div class="confirm-icon">${ic(icon)}</div>
      <h3 id="ask-title">${esc(title)}</h3>
      ${body ? `<p class="confirm-body">${esc(body)}</p>` : ''}
      <div class="ask-actions">
        <button type="button" class="btn" data-ask="no">${esc(cancel)}</button>
        <button type="button" class="btn primary ${danger ? 'danger-btn' : ''}" data-ask="yes">${esc(ok)}</button>
      </div>
    </div>`;
    const done = (value) => {
      modal.classList.add('closing');
      setTimeout(() => modal.remove(), 160);
      prev?.focus?.({ preventScroll: true });
      resolve(value);
    };
    modal.addEventListener('click', (e) => {
      const b = e.target.closest('[data-ask]');
      if (b) done(b.dataset.ask === 'yes');
      else if (e.target === modal) done(false);
    });
    modal.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Escape') { e.preventDefault(); done(false); }
      if (e.key === 'Tab') { // keep focus on the two buttons
        e.preventDefault();
        const [no, yes] = modal.querySelectorAll('[data-ask]');
        (document.activeElement === yes ? no : yes).focus();
      }
    });
    document.body.appendChild(modal);
    modal.querySelector(danger ? '[data-ask="no"]' : '[data-ask="yes"]').focus();
  });
}

const confirmDropRepeat = (t, change) => askConfirm('Remove the repeat?', {
  body: `“${plain(t.content)}” repeats ${t.due.string}. ${change} turns it into a one-off task.`,
  ok: 'Remove repeat', cancel: 'Keep it', icon: 'repeat',
});

async function createProject() {
  const name = await askText('New project', { placeholder: 'e.g. Work' });
  if (!name) return;
  try {
    const p = await api('POST', '/api/projects', { name });
    state.projects.push(p);
    setView({ type: 'project', id: p.id });
  } catch (err) { toast(err.message); }
}

async function createSection() {
  const name = await askText('New section', { placeholder: 'e.g. Next up' });
  if (!name) return;
  try {
    const s = await api('POST', '/api/sections', { name, project_id: state.view.id });
    state.sections.push(s);
    render();
  } catch (err) { toast(err.message); }
}

async function rescheduleOverdue() {
  const t = today();
  const overdue = openTasks().filter((x) => dueDay(x) && dueDay(x) < t);
  // Rescheduling a recurring task through the API would drop its recurrence, so leave those alone.
  const movable = overdue.filter((x) => !x.due.is_recurring);
  const skipped = overdue.length - movable.length;
  if (!movable.length) return toast('Only recurring tasks are overdue — complete or edit those individually');
  await Promise.all(movable.map((x) => updateTask(x.id, { due_string: 'today' }, { rerender: false })));
  render();
  toast(`Moved ${movable.length} to today${skipped ? ` · skipped ${skipped} recurring` : ''}`);
}

async function runBulk(action, value) {
  const ids = [...state.picked];
  if (!ids.length) return;
  if (action === 'clear') { state.picked.clear(); return render(); }
  if (action === 'complete') {
    await Promise.all(ids.map((id) => completeTask(id, { quiet: true })));
    toast(`Completed ${ids.length} task${ids.length === 1 ? '' : 's'}`);
  } else if (action === 'priority') {
    ids.forEach((id) => patchLocal(id, { priority: value }));
    render();
    await Promise.all(ids.map((id) => updateTask(id, { priority: value }, { rerender: false })));
    toast(`Updated ${ids.length} task${ids.length === 1 ? '' : 's'}`);
  } else {
    // Same rule as "Reschedule to today": never strip the repeat off recurring tasks in bulk.
    const movable = ids.filter((id) => !taskById(id)?.due?.is_recurring);
    const skipped = ids.length - movable.length;
    await Promise.all(movable.map((id) => updateTask(id, { due_string: action }, { rerender: false })));
    toast(`Rescheduled ${movable.length} to ${action}${skipped ? ` · skipped ${skipped} recurring` : ''}`);
  }
  state.picked.clear();
  render();
}

function togglePick(id) {
  if (state.picked.has(id)) state.picked.delete(id);
  else state.picked.add(id);
  $$(`[data-task="${id}"]`).forEach((r) => r.classList.toggle('picked', state.picked.has(id)));
  renderBulk();
}

// Light and Dark are the Capricorn looks (stone / midnight sky + gold); Capri is the neon one.
const THEMES = { light: 'Light', dark: 'Dark', capri: 'Capri' };

function applyTheme(theme) {
  if (!THEMES[theme]) theme = 'dark';
  document.documentElement.dataset.theme = theme;
  store.set('theme', theme);
  const btn = $('#theme-btn');
  if (btn) btn.title = `Theme: ${THEMES[theme]} (click to switch)`;
}
// Switching themes: the new one spreads out in a circle from where you clicked (or the middle).
// Browsers without view transitions get a soft colour fade instead.
function switchTheme(theme, from) {
  if (theme === document.documentElement.dataset.theme) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return applyTheme(theme);
  if (!document.startViewTransition) {
    document.documentElement.classList.add('theme-fading');
    applyTheme(theme);
    setTimeout(() => document.documentElement.classList.remove('theme-fading'), 600);
    return;
  }
  const r = from?.getBoundingClientRect();
  const x = r ? r.left + r.width / 2 : innerWidth / 2;
  const y = r ? r.top + r.height / 2 : innerHeight / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const t = document.startViewTransition(() => applyTheme(theme));
  t.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 700, easing: 'cubic-bezier(.65, 0, .35, 1)', pseudoElement: '::view-transition-new(root)' },
    );
  }).catch(() => {});
}
function toggleTheme() {
  const order = Object.keys(THEMES);
  const next = order[(order.indexOf(document.documentElement.dataset.theme) + 1) % order.length];
  switchTheme(next, $('#theme-btn'));
  toast(`Theme: ${THEMES[next]}`);
}

function moveSelection(delta) {
  const rows = $$('#view .task[data-task]');
  if (!rows.length) return;
  let i = rows.findIndex((r) => r.dataset.task === state.selectedId);
  i = i < 0 ? 0 : Math.max(0, Math.min(rows.length - 1, i + delta));
  state.selectedId = rows[i].dataset.task;
  rows.forEach((r) => r.classList.toggle('selected', r === rows[i]));
  rows[i].scrollIntoView({ block: 'nearest' });
}

// ---------- connect screen ----------

function showConnect() {
  $('#app').classList.add('hidden');
  $('#connect').classList.remove('hidden');
}

async function boot() {
  applyTheme(store.get('theme', matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  state.sort = store.get('sort', 'smart');
  const status = await api('GET', '/api/status');
  $('#oauth-btn').classList.toggle('hidden', !status.oauthAvailable);
  $('#oauth-or').classList.toggle('hidden', !status.oauthAvailable);
  if (!status.connected) return showConnect();
  $('#connect').classList.add('hidden');
  $('#app').classList.remove('hidden');
  $('#view').innerHTML = '<div class="muted" style="padding:20px 0">Loading your tasks…</div>';
  if (!location.hash) location.hash = '#/today';
  applyHash();
  await sync({ quiet: true });
}

// ---------- events ----------

let pendingG = false;

$('#token-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('#connect-error').textContent = '';
  try {
    await api('POST', '/api/connect', { token: $('#token-input').value });
    $('#token-input').value = '';
    boot();
  } catch (err) { $('#connect-error').textContent = err.message; }
});

document.addEventListener('click', (e) => {
  const nav = e.target.closest('[data-nav]');
  if (nav) return setView({ type: nav.dataset.nav, id: nav.dataset.id || undefined });

  const collapse = e.target.closest('[data-collapse]');
  if (collapse) {
    const k = collapse.dataset.collapse;
    collapsed.has(k) ? collapsed.delete(k) : collapsed.add(k);
    store.set('collapsed', [...collapsed]);
    collapse.closest('.group').classList.toggle('collapsed', collapsed.has(k));
    return;
  }

  const act = e.target.closest('[data-act]');
  const row = e.target.closest('[data-task]');
  const rowId = row?.dataset.task;
  if (act) {
    e.preventDefault();
    e.stopPropagation();
    const a = act.dataset.act;
    const target = rowId || state.detailId;
    if (a === 'complete' && rowId) return completeTask(rowId);
    if (a === 'complete-detail') return completeTask(state.detailId);
    if (a === 'reopen') return reopenTask(act.closest('[data-reopen]').dataset.reopen);
    if (a === 'add') return openQuick(JSON.parse(act.dataset.ctx || 'null'));
    if (a === 'close-detail') return closeDetail();
    if (a === 'delete') return deleteTask(state.detailId);
    if (a === 'duplicate') return duplicateTask(state.detailId);
    if (a === 'copy') { navigator.clipboard?.writeText(plain(taskById(state.detailId)?.content)); return toast('Copied'); }
    if (a === 'add-section') return createSection();
    if (a === 'reschedule-overdue') return rescheduleOverdue();
    if (a === 'new-sketch') return openDraw({});
    if (a === 'h-today') return setDue(target, 'today');
    if (a === 'h-tomorrow') return setDue(target, 'tomorrow');
    if (a === 'h-deadline') return openDetail(target, '#d-deadline');
    if (a === 'h-sketch') return openDraw({ taskId: target });
    if (a === 'h-timer') return startTimer(target);
    if (a === 'due-to-deadline') {
      const t = taskById(state.detailId);
      return setDueDate(t.id, ymd(addDays(parseDay(deadlineDay(t)), -1)));
    }
  }
  const sketch = e.target.closest('[data-sketch]');
  if (sketch) return openDraw({ drawing: state.drawings.find((d) => d.id === sketch.dataset.sketch) });

  const openLink = e.target.closest('[data-open]');
  if (openLink) { e.preventDefault(); return openDetail(openLink.dataset.open); }
  if (row && !e.target.closest('a')) {
    if (e.shiftKey || e.metaKey || e.ctrlKey) return togglePick(rowId);
    return openDetail(rowId);
  }

  const layout = e.target.closest('[data-layout]');
  if (layout) { store.set('layout:' + state.view.id, layout.dataset.layout); return renderView(); }

  const prio = e.target.closest('[data-prio]');
  if (prio) return setPriority(state.detailId, Number(prio.dataset.prio));

  const dueSet = e.target.closest('[data-due-set]');
  if (dueSet) return setDue(state.detailId, dueSet.dataset.dueSet);
  const dlSet = e.target.closest('[data-deadline-set]');
  if (dlSet) return setDeadline(state.detailId, dlSet.dataset.deadlineSet || null);

  const label = e.target.closest('[data-label]');
  if (label) {
    const t = taskById(state.detailId);
    const name = label.dataset.label;
    const labels = t.labels?.includes(name) ? t.labels.filter((l) => l !== name) : [...(t.labels || []), name];
    patchLocal(t.id, { labels });
    render();
    return updateTask(t.id, { labels });
  }

  const bulk = e.target.closest('[data-bulk]');
  if (bulk) return runBulk(bulk.dataset.bulk);

  const pal = e.target.closest('[data-pal]');
  if (pal) return runPalette(Number(pal.dataset.pal));

  if (e.target.classList.contains('modal') && e.target.id !== 'draw') { closeQuick(); closePalette(); $('#help').classList.add('hidden'); }
});

document.addEventListener('change', (e) => {
  if (e.target.id === 'sort-select') { state.sort = e.target.value; store.set('sort', state.sort); return renderView(); }
  if (e.target.id === 'bulk-prio') { const v = Number(e.target.value); e.target.value = ''; return v && runBulk('priority', v); }
  if (e.target.id === 'quick-due' || e.target.id === 'quick-deadline') { syncDateFields($('#quick')); return updateQuickPreview(); }
  const id = state.detailId;
  if (!id) return;
  if (e.target.id === 'd-content' && e.target.value.trim()) updateTask(id, { content: e.target.value.trim() });
  if (e.target.id === 'd-desc') updateTask(id, { description: withDeadline(e.target.value, deadlineDay(taskById(id))) });
  if (e.target.id === 'd-due') setDue(id, e.target.value.trim() || 'no date');
  if (e.target.id === 'd-due-date') setDueDate(id, e.target.value || null);
  if (e.target.id === 'd-deadline') setDeadline(id, e.target.value || null);
  if (e.target.id === 'd-project') {
    const [pid, sid] = e.target.value.split('|');
    moveTask(id, pid, sid || null);
  }
});

document.addEventListener('submit', async (e) => {
  if (e.target.id !== 'comment-form') return;
  e.preventDefault();
  const input = $('#comment-input');
  const content = input.value.trim();
  if (!content) return;
  input.value = '';
  try {
    await api('POST', '/api/comments', { task_id: state.detailId, content });
    patchLocal(state.detailId, { note_count: (taskById(state.detailId)?.note_count || 0) + 1 });
    loadComments(state.detailId);
  } catch (err) { toast(err.message); }
});

// Drag & drop: board columns move sections, day groups reschedule, sidebar projects move, "Today" schedules.
const dropTargetOf = (el) => el.closest('.column, .group[data-due], .nav-item[data-nav="project"], .nav-item[data-nav="today"]');

document.addEventListener('dragstart', (e) => {
  const row = e.target.closest('[data-task]');
  if (!row) return;
  e.dataTransfer.setData('text/plain', row.dataset.task);
  e.dataTransfer.effectAllowed = 'move';
  row.classList.add('dragging');
});
document.addEventListener('dragend', (e) => {
  e.target.closest?.('[data-task]')?.classList.remove('dragging');
  $$('.drop-target, .drop-hover').forEach((c) => c.classList.remove('drop-target', 'drop-hover'));
});
document.addEventListener('dragover', (e) => {
  const target = dropTargetOf(e.target);
  $$('.drop-target, .drop-hover').forEach((c) => c !== target && c.classList.remove('drop-target', 'drop-hover'));
  if (!target) return;
  e.preventDefault();
  target.classList.add(target.classList.contains('column') ? 'drop-target' : 'drop-hover');
});
document.addEventListener('drop', (e) => {
  const target = dropTargetOf(e.target);
  $$('.drop-target, .drop-hover').forEach((c) => c.classList.remove('drop-target', 'drop-hover'));
  if (!target) return;
  e.preventDefault();
  const id = e.dataTransfer.getData('text/plain');
  const t = taskById(id);
  if (!t) return;
  if (target.classList.contains('column')) {
    const sid = target.dataset.section || null;
    if ((t.section_id || null) !== sid) moveTask(id, target.dataset.project, sid);
  } else if (target.dataset.due) {
    if (dueDay(t) !== target.dataset.due) setDueDate(id, target.dataset.due);
  } else if (target.dataset.nav === 'today') {
    setDue(id, 'today');
  } else if (target.dataset.nav === 'project' && target.dataset.id !== t.project_id) {
    moveTask(id, target.dataset.id, null);
    toast(`Moved to ${projectName(projectById(target.dataset.id))}`);
  }
});

$('#quick-input').addEventListener('input', updateQuickPreview);
$('#quick-input').addEventListener('scroll', () => { $('#quick-mirror').scrollLeft = $('#quick-input').scrollLeft; });
$('#quick-preview').addEventListener('click', (e) => {
  if (!e.target.closest('[data-quick-ignore]')) return;
  state.quickIgnore = detectDate($('#quick-input').value)?.text || null;
  updateQuickPreview();
  $('#quick-input').focus();
});
$('#quick-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); saveQuick(); } });
$('#quick-save').addEventListener('click', saveQuick);
$('#quick-cancel').addEventListener('click', closeQuick);
$('#palette-input').addEventListener('input', () => { paletteIndex = 0; renderPalette(); });
$('#palette-input').addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') { e.preventDefault(); paletteIndex = Math.min(paletteItems.length - 1, paletteIndex + 1); renderPalette(); }
  if (e.key === 'ArrowUp') { e.preventDefault(); paletteIndex = Math.max(0, paletteIndex - 1); renderPalette(); }
  if (e.key === 'Enter') { e.preventDefault(); runPalette(paletteIndex); }
});
$('#sidebar-add').addEventListener('click', () => openQuick(
  state.view.type === 'project' ? { project_id: state.view.id } : state.view.type === 'today' ? { due: today() } : null));
$('#sidebar-search').addEventListener('click', openPalette);
$('#help-btn').addEventListener('click', () => $('#help').classList.remove('hidden'));
$('#theme-btn').addEventListener('click', toggleTheme);
$('#refresh-btn').addEventListener('click', () => sync());
$('#add-project').addEventListener('click', createProject);
$('#menu-btn').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
$('#timer-toggle').addEventListener('click', () => (timer.running ? pauseTimer() : startTimer()));
$('#timer-reset').addEventListener('click', resetTimer);
$('#timer-switch').addEventListener('click', switchTimer);
$('#timer-task').addEventListener('click', () => timer.taskId && taskById(timer.taskId) && openDetail(timer.taskId));
$('#disconnect-btn').addEventListener('click', async () => {
  if (!(await askConfirm('Sign out of Capri?', { body: 'Only on this device. Sign back in any time with your Todoist token.', ok: 'Sign out', icon: 'external' }))) return;
  await api('POST', '/api/disconnect');
  state.tasks = [];
  showConnect();
});

document.addEventListener('keydown', (e) => {
  const drawing = !$('#draw').classList.contains('hidden');
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName);
  if (drawing) {
    if (e.key === 'Escape') return closeDraw();
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); return e.shiftKey ? drawRedo() : drawUndo(); }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); return saveDrawing(); }
    if (typing) return;
    const tools = { p: 'pen', h: 'marker', e: 'eraser' };
    if (tools[e.key]) return setTool(tools[e.key]);
    if (e.key === '[' || e.key === ']') {
      const s = $('#draw-size');
      s.value = Math.max(1, Math.min(40, Number(s.value) + (e.key === ']' ? 2 : -2)));
      pad2d.size = Number(s.value);
    }
    return;
  }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); return openPalette(); }
  if (e.key === 'Escape') {
    if (!$('#help').classList.contains('hidden')) return $('#help').classList.add('hidden');
    if (!$('#quick').classList.contains('hidden')) return closeQuick();
    if (!$('#palette').classList.contains('hidden')) return closePalette();
    if (typing) return document.activeElement.blur();
    if (state.picked.size) { state.picked.clear(); return render(); }
    return closeDetail();
  }
  if (typing || e.metaKey || e.ctrlKey || e.altKey || $('#app').classList.contains('hidden')) return;
  if (!$('#quick').classList.contains('hidden') || !$('#palette').classList.contains('hidden')) return;
  const sel = state.selectedId;
  if (pendingG) {
    pendingG = false;
    const go = { d: 'dashboard', t: 'today', u: 'upcoming', f: 'focus', l: 'deadlines', s: 'sketches', c: 'completed', i: 'inbox' }[e.key];
    if (go) { e.preventDefault(); return go === 'inbox' ? setView({ type: 'project', id: inbox()?.id }) : setView({ type: go }); }
  }
  const keys = {
    q: () => $('#sidebar-add').click(),
    a: () => $('#sidebar-add').click(),
    '/': openPalette,
    '?': () => $('#help').classList.remove('hidden'),
    j: () => moveSelection(1),
    ArrowDown: () => moveSelection(1),
    k: () => moveSelection(-1),
    ArrowUp: () => moveSelection(-1),
    Enter: () => sel && openDetail(sel),
    e: () => sel && completeTask(sel),
    x: () => sel && togglePick(sel),
    t: () => sel && setDue(sel, 'today'),
    m: () => sel && setDue(sel, 'tomorrow'),
    w: () => sel && setDue(sel, 'next monday'),
    d: () => sel && openDetail(sel, '#d-deadline'),
    s: () => openDraw({ taskId: sel || null }),
    f: () => startTimer(sel || undefined),
    1: () => sel && setPriority(sel, 4),
    2: () => sel && setPriority(sel, 3),
    3: () => sel && setPriority(sel, 2),
    4: () => sel && setPriority(sel, 1),
    '#': () => sel && deleteTask(sel),
    g: () => { pendingG = true; setTimeout(() => (pendingG = false), 800); },
  };
  if (keys[e.key]) { e.preventDefault(); keys[e.key](); }
});

window.addEventListener('hashchange', applyHash);
// ---------- auto-sync ----------
// Picks up changes made elsewhere (the Todoist app, another device) without pressing Sync:
// every 20s while Capri is on screen, and straight away when you come back to it.
const AUTO_SYNC_MS = 20000;
let autoSyncing = false;
async function autoSync(minGap = AUTO_SYNC_MS) {
  if (autoSyncing || document.hidden || $('#app').classList.contains('hidden')) return;
  if (Date.now() - state.lastSync < minGap) return;
  // Not mid-gesture or mid-drag, and not while your own changes are still saving.
  if (swipe || $('.task.dragging') || writes.pending || ddOpen || datePop || ctxMenu) return;
  const a = document.activeElement;
  if (a?.matches('input, textarea') && !$('#detail').contains(a)) return; // typing somewhere a redraw would clear
  autoSyncing = true;
  try { await sync({ quiet: true, auto: true }); } finally { autoSyncing = false; }
}
setInterval(() => autoSync(), 5000);
document.addEventListener('visibilitychange', () => autoSync(5000));
window.addEventListener('focus', () => autoSync(5000));
window.addEventListener('online', () => autoSync(0));

$$('[data-ic]').forEach((el) => { el.outerHTML = ic(el.dataset.ic); });
renderTimer();
boot().catch((err) => { console.error(err); showConnect(); });
