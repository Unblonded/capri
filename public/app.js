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
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  nextweek: '<path d="M4 12h11M10 6l6 6-6 6M20 5v14"/>',
  pencil: '<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/><path d="M14.5 5.5l3 3"/>',
  marker: '<path d="M9.5 14.5L5 19h4.5l2-2"/><path d="M14 4l6 6-8.5 8.5-6-6z"/>',
  eraser: '<path d="M8 21h12"/><path d="M5.5 14.5l9-9a2 2 0 0 1 2.8 0l2.2 2.2a2 2 0 0 1 0 2.8L11 19H9.5z"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  timer: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 10v3.5l2.5 2M9.5 2.5h5M19 6l1.5-1.5"/>',
  comment: '<path d="M20.5 12a8.5 8.5 0 0 1-12.4 7.5L3.5 21l1.4-4.4A8.5 8.5 0 1 1 20.5 12z"/>',
  subtask: '<path d="M6 3v11a3 3 0 0 0 3 3h10"/><path d="M15.5 13.5L19 17l-3.5 3.5"/>',
  inbox: '<path d="M3 13l2.6-8.2A2.5 2.5 0 0 1 8 3h8a2.5 2.5 0 0 1 2.4 1.8L21 13v5a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z"/><path d="M3 13h5l1.5 3h5l1.5-3h5"/>',
  board: '<rect x="3" y="3.5" width="5" height="17" rx="1.8"/><rect x="9.5" y="3.5" width="5" height="11" rx="1.8"/><rect x="16" y="3.5" width="5" height="14" rx="1.8"/>',
  grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="2.2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2.2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2.2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2.2"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  done: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16 9.8"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  // Capri logo: a check climbing out of a faded mountain ridge.
  capri: '<path d="M2.5 19.5 8.7 11.4l3 3.4" opacity=".45"/><path d="M6.2 16.9l4 3.4L21 5.4"/>',
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
  projects: [], sections: [], labels: [], tasks: [], drawings: [], schedule: { schedules: [], days: {} },
  deadlines: {}, prefs: {}, // kept on Capri's server, per person
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
    showConnect({ expired: data.expired });
    throw new Error(data.error || 'Not connected');
  }
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

let lastSyncFingerprint = '';
async function sync({ quiet = false, auto = false } = {}) {
  const seq = writes.seq;
  try {
    const [data, { drawings }, deadlines, prefs, schedule] = await Promise.all([
      api('GET', '/api/bootstrap'), api('GET', '/api/drawings'), api('GET', '/api/deadlines'), api('GET', '/api/prefs'), api('GET', '/api/schedule')]);
    // You changed something while this was loading; the next sync will include it.
    if (auto && (writes.pending || writes.seq !== seq)) return;
    // Nothing changed since last time: don't redraw under the user.
    const fingerprint = JSON.stringify([data, drawings, deadlines, prefs, schedule]);
    if (auto && fingerprint === lastSyncFingerprint) { state.lastSync = Date.now(); return; }
    const firstLoad = !lastSyncFingerprint;
    lastSyncFingerprint = fingerprint;
    data.tasks = data.tasks.filter((x) => !pendingDeletes.has(x.id) && !pendingDeletes.has(x.parent_id));
    Object.assign(state, data, { drawings, deadlines, prefs, schedule, lastSync: Date.now() });
    loadDoneToday();
    const before = taskRowsOnScreen();
    render();
    // First load and a tap on Sync flow the whole list in; background syncs only move what changed.
    animateSync(before, { full: !quiet || firstLoad, edits: true });
    if (!quiet) toast('Synced with Todoist');
    migrateDeadlines();
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
// Deadlines are a Todoist Pro feature, so Capri keeps them on its own server (per person).
// Older versions wrote a "Deadline: YYYY-MM-DD" line into the description; migrateDeadlines moves those.
const DEADLINE_RE = /\n*^[ \t]*Deadline:[ \t]*(\d{4}-\d{2}-\d{2})[^\n]*$/im;
const legacyDeadline = (t) => t.description?.match(DEADLINE_RE)?.[1] || null;
function deadlineDay(t) { return state.deadlines[t.id] || legacyDeadline(t); }
const stripDeadline = (desc) => (desc || '').replace(DEADLINE_RE, '').trimEnd();
const saveDeadlines = (set) => api('POST', '/api/deadlines', { set });

let migrating = false;
async function migrateDeadlines() {
  const old = state.tasks.filter((t) => !t.checked && legacyDeadline(t));
  if (migrating || !old.length) return;
  migrating = true;
  try {
    const set = {};
    for (const t of old) if (!state.deadlines[t.id]) set[t.id] = legacyDeadline(t);
    if (Object.keys(set).length) { await saveDeadlines(set); Object.assign(state.deadlines, set); }
    for (const t of old) {
      const description = stripDeadline(t.description);
      await api('POST', `/api/tasks/${t.id}`, { description });
      patchLocal(t.id, { description });
    }
  } catch { /* tried again on the next sync */ } finally { migrating = false; }
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
// Swipe a task left to delete it (with undo). Swiping right is left to the sidebar.
const SWIPE_COMMIT = 0.33; // share of the row's width to pass before letting go
let swipe = null;
let swipeEndedAt = 0;

document.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'touch' || swipe || e.clientX < NAV_EDGE) return; // the left edge pulls the sidebar out
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
    // On a board, sideways means scrolling the columns (a long press picks the card up instead).
    if (swipe.row.closest('.board') || hold?.ghost) { swipe = null; return; }
    if (dx > 0) { swipe = null; return; }
    swipe.active = true;
    swipe.row.classList.add('swiping');
  }
  // Past the end of the row the drag gets heavier, like pulling on elastic.
  const w = swipe.row.offsetWidth;
  const d = Math.min(0, dx); // dragging back past where it started stops at zero
  const eased = -d > w * 0.6 ? -(w * 0.6 + (-d - w * 0.6) * 0.3) : d;
  swipe.dx = d;
  swipe.row.style.setProperty('--sx', `${eased}px`);
  swipe.row.dataset.swipe = 'delete';
  swipe.row.classList.toggle('swipe-armed', -d > w * SWIPE_COMMIT);
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
  const commit = e.type === 'pointerup' && -dx > row.offsetWidth * SWIPE_COMMIT;
  if (commit) {
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
  placeDatePicker();
  ($('.dp-day.on', el) || $('.dp-day.today', el) || $('.dp-day', el))?.focus({ preventScroll: true });
}

// Sits under its button, or above it when there's no room below.
function placeDatePicker() {
  const btn = $(`[data-date-for="${datePop.id}"]`);
  if (!btn) return closeDatePicker();
  const { el } = datePop;
  const r = btn.getBoundingClientRect();
  const w = el.offsetWidth, h = el.offsetHeight, gap = 8;
  const below = r.bottom + 6 + h + gap <= innerHeight;
  el.style.left = `${Math.max(gap, Math.min(r.left, innerWidth - w - gap))}px`;
  el.style.top = `${below ? r.bottom + 6 : Math.max(gap, r.top - 6 - h)}px`;
  el.style.transformOrigin = below ? 'top left' : 'bottom left';
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

// The date button under a tap; anywhere on a quick-add pill counts, not just its date text.
const dateFieldAt = (target) => target.closest('.date-field[data-date-for]') || target.closest('.date-pill')?.querySelector('.date-field[data-date-for]');

document.addEventListener('click', (e) => {
  const field = dateFieldAt(e.target);
  if (field) { e.preventDefault(); return openDatePicker(field); }
  if (!datePop || !datePop.el.contains(e.target)) return;
  e.stopPropagation();
  const m = e.target.closest('[data-dp-month]');
  if (m) { datePop.view.setMonth(datePop.view.getMonth() + Number(m.dataset.dpMonth)); renderDatePicker(); return; }
  const d = e.target.closest('[data-dp-day]');
  if (d) pickDate(d.dataset.dpDay);
}, true);
document.addEventListener('pointerdown', (e) => {
  if (datePop && !datePop.el.contains(e.target) && dateFieldAt(e.target)?.dataset.dateFor !== datePop.id) closeDatePicker();
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
// Follow the button rather than closing: on phones, tapping it hides the keyboard, which resizes and
// scrolls the page right as the picker opens.
addEventListener('resize', () => { if (datePop) placeDatePicker(); });
document.addEventListener('scroll', (e) => { if (datePop && !datePop.el.contains(e.target)) placeDatePicker(); }, true);

// ---------- task right-click menu ----------
let ctxMenu = null;
function closeTaskMenu() {
  if (!ctxMenu) return;
  ctxMenu.remove();
  ctxMenu = null;
  clearSelection();
  if (state.detailId) { // the drawer's task keeps its highlight
    state.selectedId = state.detailId;
    $$(`[data-task="${state.detailId}"]`).forEach((el) => el.classList.add('selected'));
  }
  $$('.menu-on').forEach((el) => el.classList.remove('menu-on'));
}

// Shared by the task and section menus: places the menu at the pointer, kept on screen.
function showMenu(menu, x, y) {
  document.body.appendChild(menu);
  // offsetWidth/Height ignore the opening animation's scale, so the size is real.
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
  menu.querySelector('button')?.focus({ preventScroll: true });
}
const menuItem = (items, it) => {
  if (it === '-') return '<div class="ctx-sep"></div>';
  const [icon, label, , cls = ''] = it;
  return `<button class="dd-opt ${cls}" role="menuitem" data-i="${items.indexOf(it)}">${ic(icon)}<span class="dd-text">${esc(label)}</span></button>`;
};

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
    ['comment', 'Note', () => openNote({ taskId: id })],
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
    if (it === 'priority') {
      return `<div class="ctx-prio" role="group" aria-label="Priority">${[4, 3, 2, 1].map((p) =>
        `<button class="ctx-p ${prioClass(p)} ${t.priority === p ? 'on' : ''}" data-ctx-prio="${p}" title="Priority ${5 - p}">P${5 - p}</button>`).join('')}</div>`;
    }
    return menuItem(items, it);
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
  showMenu(menu, x, y);
  state.selectedId = id;
  $$('.task.selected').forEach((el) => el.classList.toggle('selected', el.dataset.task === id));
  $(`.task[data-task="${id}"]`)?.classList.add('selected');
}

// Right-click on a section's heading (list or board): rename, reorder or delete it.
function openSectionMenu(id, head, x, y) {
  const s = state.sections.find((x) => x.id === id);
  if (!s) return;
  closeDropdown();
  closeTaskMenu();
  const siblings = projectSections(s.project_id);
  const i = siblings.indexOf(s);
  const board = !!head.closest('.board');
  const items = [
    ['pencil', 'Rename', () => renameSection(id)],
    i > 0 && [board ? 'back' : 'up', board ? 'Move left' : 'Move up', () => moveSection(id, -1)],
    i < siblings.length - 1 && [board ? 'arrow' : 'down', board ? 'Move right' : 'Move down', () => moveSection(id, 1)],
    '-',
    ['trash', 'Delete section', () => deleteSection(id), 'danger'],
  ].filter(Boolean);
  const menu = document.createElement('div');
  menu.className = 'dd-menu ctx-menu';
  menu.setAttribute('role', 'menu');
  menu.innerHTML = items.map((it) => menuItem(items, it)).join('');
  menu.addEventListener('click', (e) => {
    e.stopPropagation();
    const opt = e.target.closest('[data-i]');
    if (!opt) return;
    closeTaskMenu();
    items[opt.dataset.i][2]();
  });
  showMenu(menu, x, y);
  head.classList.add('menu-on');
}

// Right-click on a board column's heading: move it, and rename or delete it if it's a section.
function openColumnMenu(head, x, y) {
  const keys = movableKeys(head.closest('.board'));
  const i = keys.indexOf(head.dataset.move);
  const sec = head.dataset.section;
  const stacked = head.closest('.board').classList.contains('stacked');
  closeDropdown();
  closeTaskMenu();
  const items = [
    sec && ['pencil', 'Rename', () => renameSection(sec)],
    i > 0 && ['back', stacked ? 'Move earlier' : 'Move left', () => moveColumn(head, -1)],
    i < keys.length - 1 && ['arrow', stacked ? 'Move later' : 'Move right', () => moveColumn(head, 1)],
    keys.length > 2 && ['board', 'Arrange columns…', () => arrangeColumns(head.closest('.board'))],
    sec && '-',
    sec && ['trash', 'Delete section', () => deleteSection(sec), 'danger'],
  ].filter(Boolean);
  if (!items.length) return;
  const menu = document.createElement('div');
  menu.className = 'dd-menu ctx-menu';
  menu.setAttribute('role', 'menu');
  menu.innerHTML = items.map((it) => menuItem(items, it)).join('');
  menu.addEventListener('click', (e) => {
    e.stopPropagation();
    const opt = e.target.closest('[data-i]');
    if (!opt) return;
    closeTaskMenu();
    items[opt.dataset.i][2]();
  });
  showMenu(menu, x, y);
  head.classList.add('menu-on');
}

document.addEventListener('contextmenu', (e) => {
  const block = e.target.closest('.sblock[data-block]');
  if (block) { e.preventDefault(); return openBlockMenu(block, e.clientX, e.clientY); }
  const lbl = e.target.closest('.nav-item[data-nav="label"]');
  if (lbl) { e.preventDefault(); return openLabelMenu(lbl.dataset.id, e.clientX, e.clientY, lbl); }
  const note = e.target.closest('.sketch[data-sketch], .thumb[data-sketch]');
  if (note) { e.preventDefault(); return openNoteMenu(note, e.clientX, e.clientY); }
  const head = e.target.closest('.group-head[data-move], .group-head[data-section]');
  if (head && !e.target.closest('.task')) {
    e.preventDefault();
    return head.dataset.move ? openColumnMenu(head, e.clientX, e.clientY) : openSectionMenu(head.dataset.section, head, e.clientX, e.clientY);
  }
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
  if (location.hash === hash) return applyHash();
  // Phones swap the view in place rather than adding a history step: iOS turns a swipe from the left
  // edge (the one that pulls out the sidebar) into Back, sliding the whole app away to the last view.
  if (isTouch()) location.replace(hash);
  else location.hash = hash;
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

// Where every task row sits right now, so a sync can animate from there to the new layout.
function taskRowsOnScreen() {
  const rows = new Map();
  for (const el of $$('.task[data-task]', $('#view'))) {
    rows.set(el.dataset.task, { el, rect: el.getBoundingClientRect(), html: el.innerHTML });
  }
  rows.movers = moversOnScreen();
  return rows;
}
// The "Add task" rows and group headings move with the tasks; without this they'd jump ahead and
// overlap the rows still gliding into place.
function moversOnScreen() {
  const out = new Map();
  for (const el of $$('.inline-add, .group-head', $('#view'))) {
    const key = el.matches('.inline-add') ? `add:${el.dataset.ctx}` : `head:${$('[data-collapse]', el)?.dataset.collapse || el.textContent}`;
    if (!out.has(key)) out.set(key, { el, rect: el.getBoundingClientRect() });
  }
  return out;
}

const SYNC_EASE = 'cubic-bezier(.2, .8, .2, 1)';
const arriveGlow = () => getComputedStyle(document.documentElement).getPropertyValue('--accent-soft').trim() || 'rgba(255, 255, 255, .12)';

// render(), but tasks that appear glide in and the rest slide to their new spots instead of jumping.
function renderAnimated() {
  const before = taskRowsOnScreen();
  render();
  animateSync(before);
}
function animateSync(before, { full = false, edits = false } = {}) {
  if (reducedMotion()) return;
  if (full) return animateViewIn();
  // Removed rows leave first; everything below waits for them to clear before closing the gap,
  // so nothing slides up through a row that's still fading out.
  const current = new Set($$('.task[data-task]', $('#view')).map((el) => el.dataset.task));
  const leaving = [...before].filter(([id, { el, rect }]) => !current.has(id) && rect.height && rect.bottom > 0 && rect.top < innerHeight
    && !el.matches('.done-anim, .swipe-gone, .resched-out, .leave-anim'));
  const wait = leaving.length ? 250 : 0;
  const glide = (el, dx, dy) => el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 480, delay: wait, easing: SYNC_EASE, fill: 'backwards' });
  let arriving = 0;
  for (const el of $$('.task[data-task]', $('#view'))) {
    const old = before.get(el.dataset.task);
    if (!old) {
      // New (or back from undo): rises in with a soft glow, a few at a time.
      const delay = Math.min(arriving++, 8) * 45;
      el.animate(
        [{ opacity: 0, transform: 'translateY(10px) scale(.97)', filter: 'blur(5px)' }, { opacity: 1, transform: 'none', filter: 'none' }],
        { duration: 560, delay, easing: SYNC_EASE, fill: 'backwards' },
      );
      el.animate([{ backgroundColor: arriveGlow() }, { backgroundColor: 'transparent' }], { duration: 1100, delay: delay + 180, easing: 'ease-out', fill: 'backwards' });
      continue;
    }
    const rect = el.getBoundingClientRect();
    const dx = old.rect.left - rect.left;
    const dy = old.rect.top - rect.top;
    // Moved (another task came or went above it): glide from the old spot instead of jumping.
    if (old.rect.height && rect.height && (Math.abs(dx) > 1 || Math.abs(dy) > 1)) {
      glide(el, dx, dy);
    }
    // Edited elsewhere: the new text fades in.
    if (edits && old.html !== el.innerHTML) {
      el.animate([{ opacity: 0.35, filter: 'blur(2px)' }, { opacity: 1, filter: 'none' }], { duration: 420, easing: 'ease-out' });
    }
  }
  const now = moversOnScreen();
  for (const [key, old] of before.movers || []) {
    const cur = now.get(key);
    if (!cur || !old.rect.height || !cur.rect.height) continue;
    const dx = old.rect.left - cur.rect.left;
    const dy = old.rect.top - cur.rect.top;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
      glide(cur.el, dx, dy);
    }
  }
  // Gone: a copy of the old row slides away where it used to be.
  for (const [, { el, rect }] of leaving) {
    Object.assign(el.style, {
      position: 'fixed', left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`,
      margin: '0', pointerEvents: 'none', zIndex: '5', boxSizing: 'border-box',
    });
    el.classList.remove('selected', 'picked', 'lit');
    document.body.append(el);
    el.animate(
      [{ opacity: 1, transform: 'none', filter: 'none' }, { opacity: 0, transform: 'translateX(28px) scale(.97)', filter: 'blur(3px)' }],
      { duration: 240, easing: 'cubic-bezier(.4, 0, 1, 1)', fill: 'forwards' },
    ).finished.then(() => el.remove(), () => el.remove());
  }
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
  const list = $('#sidebar-scroll'); // the pill lives in the scrolling list so it scrolls with the items
  let pill = $('.nav-pill', list);
  if (!pill) {
    pill = document.createElement('span');
    pill.className = 'nav-pill';
    list.prepend(pill);
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
  const sr = list.getBoundingClientRect();
  const top = Math.round(r.top - sr.top + list.scrollTop);
  const left = Math.round(r.left - sr.left);
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
  const focus = upNext().length;

  $('#nav-main').innerHTML = [
    navItem({ type: 'dashboard', ico: 'grid', name: 'Dashboard' }),
    ib && navItem({ type: 'project', id: ib.id, ico: 'inbox', name: 'Inbox', count: countIn(ib.id) }),
    navItem({ type: 'today', ico: 'sun', name: 'Today', count: todayCount, alert: overdue > 0 }),
    navItem({ type: 'upcoming', ico: 'calendar', name: 'Upcoming', count: upcoming }),
    navItem({ type: 'deadlines', ico: 'flag', name: 'Deadlines', count: dlSoon.length, alert: dlOverdue }),
    navItem({ type: 'focus', ico: 'timer', name: 'Focus', count: focus }),
    navItem({ type: 'schedule', ico: 'clock', name: 'Schedule', count: dayBlocks(today()).filter((b) => !b.done && toMin(b.end) > nowMin()).length }),
    navItem({ type: 'board', ico: 'board', name: 'Board' }),
    navItem({ type: 'sketches', ico: 'pencil', name: 'Notes', count: state.drawings.length }),
    navItem({ type: 'completed', ico: 'done', name: 'Completed' }),
  ].filter(Boolean).join('');

  $('#nav-projects').innerHTML = orderedProjects().map((p) =>
    `<div style="padding-left:${projectDepth(p) * 14}px">${navItem({ type: 'project', id: p.id, dot: color(p.color), name: p.name, count: countIn(p.id) })}</div>`
  ).join('') || '<div class="muted small" style="padding:4px 10px">No projects yet</div>';

  $('#nav-labels').innerHTML = sortedLabels().map((l) =>
    navItem({ type: 'label', id: l.name, dot: color(l.color), name: '@' + l.name, count: open.filter((x) => x.labels?.includes(l.name)).length })
  ).join('') || '<button class="link-btn small nav-empty" data-act="new-label">+ Make your first label</button>';
}

function taskRow(t, { showProject = true, depth = 0, focusPick = false } = {}) {
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
    ...(t.labels || []).map((l) => `<span class="label" style="--lc:${labelColor(l)}">@${esc(l)}</span>`),
    showProject && p && `<span class="proj">${esc(projectName(p))}${section ? ' / ' + esc(section.name) : ''}<span class="dot" style="background:${color(p.color)}"></span></span>`,
  ].filter(Boolean).join('');
  const cls = [state.selectedId === t.id && 'selected', state.picked.has(t.id) && 'picked', focusPick && 'focus-row'].filter(Boolean).join(' ');
  return `<div class="task ${cls}" data-task="${t.id}" draggable="true" ${depth ? `style="margin-left:${depth * 30}px"` : ''}>
    <button class="check ${prioClass(t.priority)} ${t.checked ? 'checked' : ''}" data-act="complete" title="Complete">${ic('check')}</button>
    <div class="task-body">
      <div class="task-content">${md(t.content)}</div>
      ${stripDeadline(t.description) ? `<div class="task-desc">${esc(stripDeadline(t.description).split('\n')[0])}</div>` : ''}
      ${meta ? `<div class="meta">${meta}</div>` : ''}
    </div>
 ${focusPick ? `<button class="btn sm focus-pick" data-act="h-timer" title="Focus on this">${ic('timer')} Focus</button>` : ''}
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

// key makes the group collapsible; due makes it a drop target that reschedules, drop one that moves
// tasks the way a board column does ({ project, section }).
function group(title, body, { cls = '', sub = '', extra = '', key = '', due = '', section = '', drop = null } = {}) {
  const k = key && `${state.view.type}:${key}`;
  return `<section class="group ${k && collapsed.has(k) ? 'collapsed' : ''}" ${due ? `data-due="${due}"` : ''} ${drop ? `data-drop='${esc(JSON.stringify(drop))}'` : ''}>
    <div class="group-head ${cls}" ${section ? `data-section="${esc(section)}"` : ''}>${k ? `<button class="caret" data-collapse="${esc(k)}">${ic('chevron')}</button>` : ''}${esc(title)}<span class="muted">${esc(sub)}</span><span class="spacer"></span>${extra}</div>
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

// ---------- board ----------
// A board is columns from one grouping. Each column knows which cards belong in it, what dropping a
// card on it changes, and what a task added at its foot starts with.
const BOARD_GROUPS = { section: 'Section', due: 'Do date', priority: 'Priority', project: 'Project', label: 'Label' };
const boardKey = () => (state.view.type === 'board' ? 'board' : 'board:' + state.view.id);
const boardGroup = (choices) => { const g = store.get(boardKey() + ':group', choices[0]); return choices.includes(g) ? g : choices[0]; };

function groupControl(choices, current) {
  return `<select id="group-select" class="btn sm" title="Group columns by">${choices.map((k) =>
    `<option value="${k}" ${current === k ? 'selected' : ''}>Columns: ${BOARD_GROUPS[k]}</option>`).join('')}</select>`;
}

// Columns you can rearrange: sections (order saved in Todoist), projects and labels (order saved
// on Capri's server under your account, one per board).
const MOVABLE = ['section', 'project', 'label'];
const colOrderKey = (by) => `cols:${boardKey()}:${by}`;
let boardOrder = { by: '', keys: [] }; // every column of the board on screen, hidden ones too

function boardColumns(tasks, by, project) {
  const base = project ? { project_id: project.id } : {};
  const t = today();
  const cols = [];
  const col = (key, name, test, { drop = null, add = base, sub = '', cls = '', keep = true, section = '' } = {}) =>
    cols.push({ key, name, items: tasks.filter(test), drop, add, sub, cls, keep, section });
  if (by === 'section') {
    const sections = projectSections(project.id);
    col('none', project.inbox_project ? 'Inbox' : 'No section', (x) => !x.section_id,
      { drop: { section: '', project: project.id }, keep: !sections.length });
    for (const s of sections) col(s.id, s.name, (x) => x.section_id === s.id,
      { drop: { section: s.id, project: project.id }, add: { project_id: project.id, section_id: s.id }, section: s.id });
  } else if (by === 'due') {
    col('overdue', 'Overdue', (x) => dueDay(x) && dueDay(x) < t, { cls: 'overdue', keep: false });
    for (let i = 0; i < 7; i++) {
      const day = inDays(i);
      col(day, i < 2 ? dayLabel(day) : parseDay(day).toLocaleDateString([], { weekday: 'long' }), (x) => dueDay(x) === day, {
        drop: { due: day }, add: { ...base, due: day }, cls: i ? '' : 'today',
        sub: parseDay(day).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      });
    }
    col('later', 'Later', (x) => dueDay(x) && dueDay(x) > inDays(6), { keep: false });
    col('nodate', 'No date', (x) => !dueDay(x), { drop: { due: '' } });
  } else if (by === 'priority') {
    for (const [p, name] of [[4, 'Priority 1'], [3, 'Priority 2'], [2, 'Priority 3'], [1, 'No priority']])
      col('p' + p, name, (x) => x.priority === p, { drop: { priority: p }, add: { ...base, priority: p }, cls: prioClass(p) });
  } else if (by === 'project') {
    for (const p of [inbox(), ...orderedProjects()].filter(Boolean))
      col(p.id, projectName(p), (x) => x.project_id === p.id, { drop: { project: p.id }, add: { project_id: p.id }, keep: false });
  } else if (by === 'label') {
    // A card with several labels sits under its first one, so each task appears once.
    const names = [...state.labels].sort((a, b) => a.item_order - b.item_order).map((l) => l.name);
    const first = (x) => names.find((n) => x.labels?.includes(n)) || x.labels?.[0] || null;
    col('nolabel', 'No label', (x) => !first(x), { drop: { label: '' } });
    for (const n of names) col('l:' + n, '@' + n, (x) => first(x) === n, { drop: { label: n }, add: { ...base, label: n } });
  }
  const order = by !== 'section' && state.prefs[colOrderKey(by)];
  if (Array.isArray(order)) {
    // Columns you've never placed (a new project, say) keep their spot after the ones you have.
    const pos = new Map(order.map((k, i) => [k, i]));
    const rank = (c) => (pos.has(c.key) ? pos.get(c.key) : order.length + cols.indexOf(c));
    cols.sort((a, b) => rank(a) - rank(b));
  }
  boardOrder = { by, keys: cols.map((c) => c.key) };
  return cols.filter((c) => c.keep || c.items.length);
}

function renderBoard(tasks, by, project) {
  const cols = boardColumns(tasks, by, project);
  const showProject = !project && by !== 'project';
  return `<div class="board" data-by="${by}">${cols.map((c) => {
    // Subtasks get their own card unless their parent is in the same column (the parent shows n/m).
    const ids = new Set(c.items.map((x) => x.id));
    const cards = sortTasks(c.items.filter((x) => !ids.has(x.parent_id)));
    return `<div class="column glass ${c.drop ? '' : 'no-drop'}" data-col="${esc(c.key)}" ${c.drop ? `data-drop='${esc(JSON.stringify(c.drop))}'` : ''}>
      <div class="group-head ${c.cls}" ${c.section ? `data-section="${esc(c.section)}"` : ''} ${MOVABLE.includes(by) && (by !== 'section' || c.section) ? `data-move="${esc(c.key)}"` : ''}>${esc(c.name)} <span class="muted">${c.sub ? esc(c.sub) + ' · ' : ''}${cards.length}</span></div>
      <div class="col-body">${cards.map((x) => taskRow(x, { showProject })).join('') || '<div class="col-empty">Drop tasks here</div>'}</div>
      ${c.drop ? inlineAdd(c.add) : ''}
    </div>`;
  }).join('')}${by === 'section' ? `<button class="column add-col" data-act="add-section">${ic('plus')} Add section</button>` : ''}</div>`;
}

// The board never scrolls sideways. Columns sit in lanes: one each while they fit across, and once
// they don't, as many lanes as fit, each holding a run of neighbouring columns stacked top to
// bottom (so the order still reads left to right), split so the tallest lane is as short as it can be.
// Where you've stacked a column under another or given it a lane of its own by dragging, that's
// kept (saved per board as lane "joins" and "breaks").
const COL_W = 290;
const COL_GAP = 14;
const lanesKey = (by) => `lanes:${boardKey()}:${by}`;
function layoutBoard() {
  const board = $('#view .board');
  if (!board) return;
  $$(':scope > .lane', board).forEach((lane) => lane.replaceWith(...lane.children));
  const cols = $$(':scope > .column', board);
  const keys = cols.map((c) => c.dataset.col || '+');
  const pref = state.prefs[lanesKey(board.dataset.by)] || {};
  const joins = new Set(pref.joins);
  const breaks = new Set(pref.breaks);
  const joined = (i) => i > 0 && joins.has(keys[i]);
  const view = $('#view');
  const cs = getComputedStyle(view);
  const avail = view.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const fit = Math.max(1, Math.floor((avail + COL_GAP) / (COL_W + COL_GAP)));
  const natural = keys.filter((_, i) => !joined(i)).length; // lanes if only your stacks share
  const k = Math.min(fit, natural);
  board.classList.toggle('stacked', k < cols.length);
  // Set before measuring, so each column's height is taken at the width it'll have.
  board.style.setProperty('--lane-w', `${natural > fit ? Math.floor((avail - COL_GAP * (k - 1)) / k) : Math.min(COL_W, avail)}px`);
  const h = cols.map((c) => c.offsetHeight);
  // More lanes of your own than fit: your stacks stay, the extra lane starts give way.
  const runs = splitRuns(h, k, (i) => !joined(i), (i) => breaks.has(keys[i])) || splitRuns(h, k, (i) => !joined(i)) || splitRuns(h, k);
  for (const [a, b] of runs) {
    const lane = document.createElement('div');
    lane.className = 'lane';
    lane.append(...cols.slice(a, b));
    board.append(lane);
  }
}
// Splits heights into k runs of neighbours, keeping the tallest run as short as possible. A run may
// only start where canStart allows, and must start wherever mustStart says. Null if it can't be done.
function splitRuns(h, k, canStart = () => true, mustStart = () => false) {
  const n = h.length;
  const pre = [0];
  for (const x of h) pre.push(pre.at(-1) + x);
  const run = (a, b) => pre[b] - pre[a] + COL_GAP * (b - a - 1);
  const best = Array.from({ length: n + 1 }, () => Array(k + 1).fill(Infinity));
  const cut = Array.from({ length: n + 1 }, () => Array(k + 1).fill(0));
  best[0][0] = 0;
  for (let j = 1; j <= k; j++) {
    for (let i = j; i <= n; i++) {
      for (let m = i - 1; m >= j - 1; m--) {
        if (m + 1 < i && mustStart(m + 1)) break; // the run m..i-1 would swallow a required start
        if (m > 0 && !canStart(m)) continue;
        const v = Math.max(best[m][j - 1], run(m, i));
        if (v < best[i][j]) { best[i][j] = v; cut[i][j] = m; }
      }
    }
  }
  if (best[n][k] === Infinity) return null;
  const runs = [];
  for (let i = n, j = k; j > 0; j--) { runs.unshift([cut[i][j], i]); i = cut[i][j]; }
  return runs;
}
function saveLanes(by, lanes) {
  const key = lanesKey(by);
  const known = new Set([...boardOrder.keys, 'none']);
  const value = lanes && { breaks: [...lanes.breaks].filter((k) => known.has(k)), joins: [...lanes.joins].filter((k) => known.has(k)) };
  if (value) state.prefs[key] = value; else delete state.prefs[key];
  api('POST', '/api/prefs', { key, value: value || null }).catch((err) => toast(err.message));
}
let boardWidth = 0;
new ResizeObserver(([entry]) => {
  const w = Math.round(entry.contentRect.width);
  if (w === boardWidth) return;
  boardWidth = w;
  if (!colDrag?.on) layoutBoard();
}).observe($('#view'));

// What dropping a card on a column changes, read from the column's data-drop.
function dropOnColumn(id, column) {
  const t = taskById(id);
  const drop = column.dataset.drop && JSON.parse(column.dataset.drop);
  if (!t || !drop) return;
  if ('section' in drop) {
    if ((t.section_id || '') !== drop.section || t.project_id !== drop.project) moveTask(id, drop.project, drop.section || null);
  } else if ('project' in drop) {
    if (t.project_id !== drop.project) { moveTask(id, drop.project, null); toast(`Moved to ${projectName(projectById(drop.project))}`); }
  } else if ('due' in drop) {
    if ((dueDay(t) || '') === drop.due) return;
    // Show it in the new column straight away; a repeating task asks first, so it waits.
    if (!t.due?.is_recurring) { patchLocal(id, { due: drop.due ? { date: drop.due, string: dayLabel(drop.due), is_recurring: false } : null }); renderAnimated(); }
    setDueDate(id, drop.due || null);
  } else if ('priority' in drop) {
    if (t.priority !== drop.priority) setPriority(id, drop.priority);
  } else if ('label' in drop) {
    // Swap the label it was filed under for the new one (other labels stay); "No label" clears them.
    const from = $(`.task[data-task="${id}"]`)?.closest('.column')?.dataset.col;
    const old = from?.startsWith('l:') ? from.slice(2) : null;
    if (old === drop.label || (!old && !drop.label)) return;
    patchLocal(id, { labels: drop.label ? [...new Set([...(t.labels || []).filter((l) => l !== old), drop.label])] : [] });
    renderAnimated();
    updateTask(id, { labels: taskById(id).labels }, { rerender: false });
  }
}

// Today's progress under the date: "3 of 7 done", with a bar of one segment per task (a plain bar past 16).
function renderRing() {
  const ring = $('#ring');
  const left = openTasks().filter((x) => dueDay(x) && dueDay(x) <= today()).length;
  const done = state.doneToday;
  if (state.view.type !== 'today' || done == null || done + left === 0) { ring.classList.add('hidden'); return; }
  const total = done + left;
  ring.classList.remove('hidden');
  ring.classList.toggle('all', !left);
  const track = total <= 16
    ? `<div class="dp-track">${Array.from({ length: total }, (_, i) => `<span class="dp-seg ${i < done ? 'on' : ''}"></span>`).join('')}</div>`
    : `<div class="dp-track solid"><div class="dp-fill" style="width:${(done / total) * 100}%"></div></div>`;
  const text = left ? `<b>${done} of ${total}</b> done · ${left} to go` : `<b>All ${total} done</b> · nice work`;
  ring.innerHTML = `${track}<span class="dp-text">${text}</span>`;
}



// ---------- labels ----------
const sortedLabels = () => [...state.labels].sort((a, b) => a.item_order - b.item_order);
const labelByName = (name) => state.labels.find((l) => l.name === name);
const labelColor = (name) => color(labelByName(name)?.color || 'charcoal');

// Labels can't hold spaces in quick add, so they're kept to one word.
const labelName = (s) => s.trim().replace(/^@+/, '').replace(/\s+/g, '_').slice(0, 60);

async function createLabel(forTask = null) {
  const raw = await askText('New label', { placeholder: 'e.g. errands', ok: 'Create' });
  const name = raw && labelName(raw);
  if (!name) return;
  if (labelByName(name)) return toast(`@${name} already exists`);
  const used = new Set(state.labels.map((l) => l.color));
  const pick = Object.keys(COLORS).filter((c) => !['charcoal', 'grey', 'taupe'].includes(c) && !used.has(c));
  try {
    const l = await api('POST', '/api/labels', { name, color: pick[Math.floor(Math.random() * pick.length)] || 'blue' });
    state.labels.push(l);
    const t = forTask && taskById(forTask);
    if (t) {
      const labels = [...(t.labels || []), l.name];
      patchLocal(t.id, { labels });
      updateTask(t.id, { labels });
    }
    render();
    toast(t ? `Added @${l.name}` : `Created @${l.name}`);
  } catch (err) { toast(err.message); }
}

// Swap a label's name on every task here so nothing flickers before the next sync confirms it.
function renameLocally(from, to) {
  state.tasks.forEach((t) => {
    if (!t.labels?.includes(from)) return;
    t.labels = to ? t.labels.map((x) => (x === from ? to : x)) : t.labels.filter((x) => x !== from);
  });
}

async function renameLabel(name) {
  const l = labelByName(name);
  const raw = l && await askText('Rename label', { value: l.name, ok: 'Rename' });
  const next = raw && labelName(raw);
  if (!next || next === l.name) return;
  if (labelByName(next)) return toast(`@${next} already exists`);
  try {
    await api('POST', `/api/labels/${l.id}`, { name: next });
    renameLocally(l.name, next);
    l.name = next;
    if (state.view.type === 'label' && state.view.id === name) return setView({ type: 'label', id: next });
    render();
  } catch (err) { toast(err.message); }
}

async function recolorLabel(name, c) {
  const l = labelByName(name);
  if (!l || l.color === c) return;
  const was = l.color;
  l.color = c;
  render();
  try { await api('POST', `/api/labels/${l.id}`, { color: c }); }
  catch (err) { l.color = was; render(); toast(err.message); }
}

async function deleteLabel(name) {
  const l = labelByName(name);
  if (!l) return;
  const n = openTasks().filter((t) => t.labels?.includes(name)).length;
  if (!(await askConfirm(`Delete @${name}?`, { body: n ? `It comes off ${n} task${n === 1 ? '' : 's'}; the tasks themselves stay.` : 'No open tasks use it.', ok: 'Delete', danger: true }))) return;
  try {
    await api('DELETE', `/api/labels/${l.id}`);
    state.labels = state.labels.filter((x) => x.id !== l.id);
    renameLocally(name, null);
    if (state.view.type === 'label' && state.view.id === name) return setView({ type: 'today' });
    render();
    toast(`Deleted @${name}`);
  } catch (err) { toast(err.message); }
}

function openLabelMenu(name, x, y, anchor) {
  const l = labelByName(name);
  if (!l) return;
  closeDropdown();
  closeTaskMenu();
  const items = [
    ['external', 'Open', () => setView({ type: 'label', id: name })],
    ['pencil', 'Rename', () => renameLabel(name)],
    'colors',
    '-',
    ['trash', 'Delete label', () => deleteLabel(name), 'danger'],
  ];
  const menu = document.createElement('div');
  menu.className = 'dd-menu ctx-menu';
  menu.setAttribute('role', 'menu');
  menu.innerHTML = items.map((it) => (it === 'colors'
    ? `<div class="ctx-colors" role="group" aria-label="Colour">${Object.entries(COLORS).map(([k, hex]) =>
      `<button class="ctx-c ${l.color === k ? 'on' : ''}" data-ctx-color="${k}" title="${k.replace(/_/g, ' ')}" style="background:${hex}"></button>`).join('')}</div>`
    : menuItem(items, it))).join('');
  menu.addEventListener('click', (e) => {
    e.stopPropagation();
    const c = e.target.closest('[data-ctx-color]');
    const opt = e.target.closest('[data-i]');
    if (!c && !opt) return;
    closeTaskMenu();
    if (c) recolorLabel(name, c.dataset.ctxColor);
    else items[opt.dataset.i][2]();
  });
  showMenu(menu, x, y);
  anchor?.classList.add('menu-on');
}

// ---------- schedule ----------
// Time blocks, typed the way you'd write them: "go outside 3:05 - 4:03", "5pm-8pm do something".
const t0 = () => today();
const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const fromMin = (n) => `${pad(Math.floor(n / 60))}:${pad(n % 60)}`;
const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
const blockSpan = (b) => `${fmtTime(b.start)} – ${fmtTime(b.end)}`;
const lengthText = (mins) => (mins >= 60 ? `${Math.floor(mins / 60)}h${mins % 60 ? ` ${mins % 60}m` : ''}` : `${mins}m`);

// One line → { title, start, end }, or null. Times without am/pm are guessed the way people mean them:
// 1–6 is the afternoon, 7–11 the morning, 13+ is 24-hour; an end before its start moves to the afternoon.
function parseBlock(line) {
  const T = '(\\d{1,2})(?:[:.](\\d{2}))?\\s*(am|pm|a|p)?';
  const SEP = '\\s*(?:-|–|—|to|until|till)\\s*';
  let m = new RegExp(`^(.+?)\\s*(?:from\\s+|at\\s+|@\\s*|:\\s*)?${T}${SEP}${T}\\.?$`, 'i').exec(line.trim());
  let title, a, b;
  if (m) { title = m[1]; a = m.slice(2, 5); b = m.slice(5, 8); }
  else {
    m = new RegExp(`^${T}${SEP}${T}\\s*[:\\-–,]?\\s*(.+)$`, 'i').exec(line.trim());
    if (!m) return null;
    a = m.slice(1, 4); b = m.slice(4, 7); title = m[7];
  }
  title = title.replace(/[\s:,\-–—@]+$/, '').replace(/\s+(from|at)$/i, '').trim();
  if (!title) return null;
  const mer = (x) => (x ? (x[0].toLowerCase() === 'p' ? 'pm' : 'am') : null);
  const hours = ([h, mm, x], other) => {
    h = Number(h); mm = Number(mm || 0);
    if (h > 23 || mm > 59) return null;
    const ap = mer(x) || (h <= 12 ? other : null);
    if (ap) return (h % 12 + (ap === 'pm' ? 12 : 0)) * 60 + mm;
    if (h >= 13 || h === 0) return h * 60 + mm;
    return (h === 12 ? 12 : h < 7 ? h + 12 : h) * 60 + mm;
  };
  let end = hours(b, null);
  let start = hours(a, mer(b[2]) && !mer(a[2]) ? mer(b[2]) : null);
  if (start == null || end == null) return null;
  if (!mer(a[2]) && mer(b[2]) && start > end) start -= 12 * 60; // "11 - 1pm": 11 in the morning
  if (end <= start && !mer(b[2]) && end + 12 * 60 > start && end + 12 * 60 < 24 * 60) end += 12 * 60;
  if (start < 0 || end <= start) return null;
  return { title: title.slice(0, 200), start: fromMin(start), end: fromMin(Math.min(end, 23 * 60 + 59)) };
}

// Repeating schedules: each has a name, the weekdays it runs on and its blocks. A date's plan is the
// schedule for its weekday plus any one-off blocks added just for that date; ticks are kept per date.
const WEEK = [1, 2, 3, 4, 5, 6, 0]; // Monday first
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const schedules = () => state.schedule?.schedules || [];
const weekdayName = (day) => parseDay(day).toLocaleDateString([], { weekday: 'long' });
const scheduleById = (id) => schedules().find((s) => s.id === id);
const scheduleFor = (day) => schedules().find((s) => s.days.includes(parseDay(day).getDay())) || null;
const dayEntry = (day) => state.schedule?.days?.[day] || { extra: [], done: [] };
function daysText(days) {
  const set = new Set(days);
  if (set.size === 7) return 'Every day';
  if (set.size === 5 && [1, 2, 3, 4, 5].every((d) => set.has(d))) return 'Weekdays';
  if (set.size === 2 && set.has(0) && set.has(6)) return 'Weekends';
  return WEEK.filter((d) => set.has(d)).map((d) => DAY_SHORT[d]).join(' ') || 'No days yet';
}

// Everything planned on a date, oldest first; `tpl` marks blocks that come from a repeating schedule.
function dayBlocks(day) {
  const s = scheduleFor(day);
  const { extra = [], done = [] } = dayEntry(day);
  return [...(s?.blocks || []).map((b) => ({ ...b, tpl: s.id })), ...extra]
    .map((b) => ({ ...b, done: done.includes(b.id) }))
    .sort((x, y) => toMin(x.start) - toMin(y.start));
}

const byStart = (list) => [...list].sort((x, y) => toMin(x.start) - toMin(y.start));
async function saveSchedules(next) {
  state.schedule = { ...state.schedule, schedules: next };
  render();
  try { await api('POST', '/api/schedule', { schedules: next }); }
  catch (err) { toast(err.message); }
}
async function saveDayEntry(day, { extra, done }) {
  const days = { ...state.schedule.days };
  if (extra.length || done.length) days[day] = { extra: byStart(extra), done };
  else delete days[day];
  state.schedule = { ...state.schedule, days };
  render();
  try { await api('POST', '/api/schedule', { day, extra: byStart(extra), done }); }
  catch (err) { toast(err.message); }
}
const updateSchedule = (id, change) => saveSchedules(schedules().map((s) => (s.id === id ? { ...s, ...change(s) } : s)));

// What the schedule page is showing: a date, or one schedule to edit (`#/schedule/s:<id>`).
function schedTarget() {
  const id = state.view.type === 'schedule' ? state.view.id || '' : '';
  if (id.startsWith('s:') && scheduleById(id.slice(2))) return { tpl: id.slice(2) };
  return { day: /^\d{4}-\d{2}-\d{2}$/.test(id) ? id : today() };
}
const newBlockId = () => Math.random().toString(36).slice(2, 10);

function addBlocks() {
  const input = $('#sched-input');
  const lines = input.value.split('\n').map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return;
  const parsed = lines.map(parseBlock);
  const bad = lines.filter((_, i) => !parsed[i]);
  const good = parsed.filter(Boolean).map((g) => ({ id: newBlockId(), ...g }));
  if (!good.length) return toast('Add a time range, like “go outside 3:05 - 4:03”');
  const target = schedTarget();
  if (target.tpl) updateSchedule(target.tpl, (s) => ({ blocks: byStart([...s.blocks, ...good]) }));
  else { const e = dayEntry(target.day); saveDayEntry(target.day, { extra: [...e.extra, ...good], done: e.done }); }
  toast(good.length === 1 ? `Added “${good[0].title}” · ${blockSpan(good[0])}` : `Added ${good.length} blocks`);
  requestAnimationFrame(() => {
    const box = $('#sched-input');
    if (!box) return;
    box.value = bad.join('\n'); // anything that didn't read stays in the box to fix
    if (bad.length) toast(`Couldn't read: ${bad[0]}`);
    updateSchedPreview();
    box.focus({ preventScroll: true });
  });
}

// Live preview under the box of how each line will be read.
function updateSchedPreview() {
  const box = $('#sched-input');
  const out = $('#sched-preview');
  if (!box || !out) return;
  box.style.height = 'auto';
  box.style.height = `${box.scrollHeight}px`;
  const lines = box.value.split('\n').map((l) => l.trim()).filter(Boolean);
  out.innerHTML = lines.map((l) => {
    const b = parseBlock(l);
    return b ? `<span class="sp ok">${ic('clock')}<b>${esc(b.title)}</b> ${esc(blockSpan(b))}</span>`
      : `<span class="sp bad">${ic('warn')}${esc(l.slice(0, 40))} · needs a time like 3:05 - 4:03</span>`;
  }).join('');
}

// Side-by-side lanes for blocks that overlap.
function laneBlocks(blocks) {
  const out = [];
  let cluster = [];
  let clusterEnd = -1;
  const flush = () => {
    const lanes = [];
    cluster.forEach((b) => {
      let i = lanes.findIndex((end) => end <= toMin(b.start));
      if (i < 0) { i = lanes.length; lanes.push(0); }
      lanes[i] = toMin(b.end);
      out.push({ b, lane: i });
    });
    out.slice(-cluster.length).forEach((x) => (x.lanes = lanes.length));
    cluster = [];
  };
  [...blocks].sort((x, y) => toMin(x.start) - toMin(y.start)).forEach((b) => {
    if (cluster.length && toMin(b.start) >= clusterEnd) flush();
    cluster.push(b);
    clusterEnd = Math.max(clusterEnd, toMin(b.end));
  });
  if (cluster.length) flush();
  return out;
}

// What's on right now and for how long, or how long you're free until the next thing.
function nowInfo() {
  const now = nowMin();
  const blocks = dayBlocks(today()).filter((b) => !b.done);
  const cur = blocks.filter((b) => toMin(b.start) <= now && now < toMin(b.end)).sort((x, y) => toMin(x.end) - toMin(y.end))[0];
  const next = blocks.find((b) => toMin(b.start) > now && b !== cur);
  return { now, cur, next };
}

function heroHtml() {
  const { now, cur, next } = nowInfo();
  const s = scheduleFor(today());
  const nextLine = next ? `Next: <b>${esc(next.title)}</b> at ${esc(fmtTime(next.start))} · for ${lengthText(toMin(next.end) - toMin(next.start))}` : 'Nothing after this today';
  if (cur) {
    const total = toMin(cur.end) - toMin(cur.start);
    const left = toMin(cur.end) - now;
    return `<div class="sched-hero now glass" id="sched-hero">
      <div class="sh-top"><span class="sh-label">Right now</span>${s ? `<span class="sh-from">${esc(s.name)}</span>` : ''}</div>
      <div class="sh-title">${esc(cur.title)}</div>
      <div class="sh-left"><b>${lengthText(left)}</b> left · until ${esc(fmtTime(cur.end))}</div>
      <div class="sh-bar"><span style="width:${((total - left) / total) * 100}%"></span></div>
      <div class="sh-next">${nextLine}</div>
    </div>`;
  }
  return `<div class="sched-hero glass" id="sched-hero">
    <div class="sh-top"><span class="sh-label">Right now</span>${s ? `<span class="sh-from">${esc(s.name)}</span>` : ''}</div>
    <div class="sh-title">${next ? 'Free time' : dayBlocks(today()).length ? 'All done for today' : 'Nothing planned today'}</div>
    <div class="sh-left">${next ? `<b>${lengthText(toMin(next.start) - now)}</b> until ${esc(next.title)} at ${esc(fmtTime(next.start))}` : schedules().length ? 'Enjoy the rest of the day.' : 'Make a schedule below and it repeats on the days you pick.'}</div>
  </div>`;
}

// Tabs: the day view, then each schedule with its days, then a way to add one.
function schedTabs(target) {
  return `<div class="sched-tabs">
    <button class="stab ${target.day ? 'on' : ''}" data-act="sched-open" data-id="">${ic('clock')} ${target.day && target.day !== today() ? esc(dayLabel(target.day)) : 'Today'}</button>
    ${schedules().map((s) => `<button class="stab ${target.tpl === s.id ? 'on' : ''}" data-act="sched-open" data-id="s:${esc(s.id)}">${esc(s.name)}${daysText(s.days).toLowerCase() === s.name.toLowerCase() ? '' : `<span class="stab-days">${esc(daysText(s.days))}</span>`}</button>`).join('')}
    <button class="stab add" data-act="sched-new">${ic('plus')} New schedule</button>
  </div>`;
}

const HOUR_PX = 64;
function timelineHtml(blocks, { day = '', tpl = '', live = false }) {
  const now = nowMin();
  const first = Math.min(8, ...blocks.map((b) => Math.floor(toMin(b.start) / 60)), live ? Math.floor(now / 60) : 24);
  const last = Math.max(22, ...blocks.map((b) => Math.ceil(toMin(b.end) / 60)), live ? Math.ceil(now / 60) : 0);
  const top = (min) => ((min - first * 60) / 60) * HOUR_PX;
  const hours = Array.from({ length: last - first + 1 }, (_, i) => first + i);
  return `<div class="sched-scroll"><div class="sched-grid" style="height:${(last - first) * HOUR_PX}px" data-first="${first}" data-day="${day}" data-live="${live ? 1 : ''}">
    ${hours.map((h) => `<div class="sched-hour" style="top:${top(h * 60)}px"><span>${h < 24 ? esc(fmtTime(fromMin(h * 60)).replace(':00', '')) : ''}</span></div>`).join('')}
    ${laneBlocks(blocks).map(({ b, lane, lanes }) => {
      const s = toMin(b.start); const e = toMin(b.end);
      const when = b.done ? 'done' : live && now >= e ? 'past' : live && now >= s ? 'now' : '';
      const h = Math.max(26, top(e) - top(s) - 3);
      return `<div class="sblock ${when} ${h < 44 ? 'short' : ''} ${day && !b.tpl ? 'oneoff' : ''}" data-block="${esc(b.id)}" data-day="${day}" data-tpl="${esc(tpl || b.tpl || '')}"
        style="top:${top(s) + 1}px;height:${h}px;left:calc(${(lane / lanes) * 100}% + 56px - ${(lane / lanes) * 56}px);width:calc(${100 / lanes}% - ${56 / lanes}px - 4px)">
        <div class="sb-title">${b.done ? ic('check') : ''}${esc(b.title)}</div>
        <div class="sb-time">${esc(blockSpan(b))} · ${lengthText(e - s)}</div>
      </div>`;
    }).join('')}
    ${live ? `<div class="sched-now" style="top:${top(now)}px"></div>` : ''}
  </div></div>`;
}

const addBox = (placeholder) => `<div class="sched-add glass">
    <textarea id="sched-input" rows="1" placeholder="${esc(placeholder)}"></textarea>
    <button class="btn primary sm" data-act="sched-add">${ic('plus')} Add</button>
  </div>
  <div class="sched-preview" id="sched-preview"></div>`;

function scheduleHtml(target) {
  if (target.tpl) {
    const s = scheduleById(target.tpl);
    const planned = s.blocks.reduce((n, b) => n + toMin(b.end) - toMin(b.start), 0);
    const taken = (d) => schedules().find((o) => o.id !== s.id && o.days.includes(d));
    return `<div class="sched">${schedTabs(target)}
      <div class="tpl-head glass">
        <input class="tpl-name" id="tpl-name" value="${esc(s.name)}" maxlength="60" aria-label="Schedule name" />
        <div class="tpl-days" role="group" aria-label="Days this schedule runs">${WEEK.map((d) => {
          const other = taken(d);
          return `<button class="tday ${s.days.includes(d) ? 'on' : ''}" data-act="tpl-day" data-d="${d}" title="${other && !s.days.includes(d) ? `${DAY_SHORT[d]} uses ${esc(other.name)}; tap to switch it here` : DAY_SHORT[d]}">${DAY_SHORT[d].slice(0, 2)}${other && !s.days.includes(d) ? '<i></i>' : ''}</button>`;
        }).join('')}</div>
        <div class="tpl-meta muted small">${esc(daysText(s.days))} · ${s.blocks.length} block${s.blocks.length === 1 ? '' : 's'} · ${lengthText(planned)}</div>
        <button class="btn ghost sm danger" data-act="tpl-delete">${ic('trash')} Delete schedule</button>
      </div>
      ${addBox('wake up 7 - 7:30   (one per line, paste a whole routine)')}
      ${timelineHtml(s.blocks, { tpl: s.id })}
      ${s.blocks.length ? '' : '<div class="sched-empty muted">Add the blocks for a typical day. They repeat on every day you picked above.</div>'}
    </div>`;
  }
  const day = target.day;
  const isToday = day === today();
  const s = scheduleFor(day);
  const blocks = dayBlocks(day);
  return `<div class="sched">${schedTabs(target)}
    ${isToday ? heroHtml() : ''}
    <div class="sched-using muted small">${s ? `Using <a href="#/schedule/s:${esc(s.id)}">${esc(s.name)}</a> on ${weekdayName(day)}s` : `No schedule runs on ${weekdayName(day)}s`}${blocks.length ? ` · ${blocks.length} block${blocks.length === 1 ? '' : 's'}` : ''}</div>
    ${addBox(`go outside 3:05 - 4:03   (just for ${isToday ? 'today' : dayLabel(day)})`)}
    ${timelineHtml(blocks, { day, live: isToday })}
    ${blocks.length ? '' : `<div class="sched-empty muted">Nothing planned. Add something just for ${isToday ? 'today' : 'this day'} above, or make a schedule that repeats.</div>`}
  </div>`;
}

// Clicking an empty spot on the timeline starts a block at that time (rounded to 15 minutes).
function startBlockAt(grid, y) {
  const first = Number(grid.dataset.first);
  const min = Math.max(0, Math.min(23 * 60, Math.round(((y - grid.getBoundingClientRect().top) / HOUR_PX * 60 + first * 60) / 15) * 15));
  const box = $('#sched-input');
  const t = (m) => fmtTime(fromMin(m)).replace(/\s/g, '').toLowerCase();
  box.value = ` ${t(min)} - ${t(Math.min(min + 60, 23 * 60 + 59))}`;
  updateSchedPreview();
  box.focus();
  box.setSelectionRange(0, 0);
  box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

const blockFrom = (el) => {
  const { block, day, tpl } = el.dataset;
  const list = tpl ? scheduleById(tpl)?.blocks : dayEntry(day).extra;
  return { b: list?.find((x) => x.id === block), day, tpl };
};

async function editBlock(el) {
  const { b, day, tpl } = blockFrom(el);
  if (!b) return;
  const t = (hm) => fmtTime(hm).replace(/\s/g, '').toLowerCase();
  const text = await askText(tpl && day ? `Edit block (every ${daysText(scheduleById(tpl).days)})` : 'Edit block', { value: `${b.title} ${t(b.start)} - ${t(b.end)}`, ok: 'Save' });
  if (text == null || !text.trim()) return;
  const p = parseBlock(text);
  if (!p) return toast('Add a time range, like “go outside 3:05 - 4:03”');
  if (tpl) updateSchedule(tpl, (s) => ({ blocks: byStart(s.blocks.map((x) => (x.id === b.id ? { ...x, ...p } : x))) }));
  else { const e = dayEntry(day); saveDayEntry(day, { extra: e.extra.map((x) => (x.id === b.id ? { ...x, ...p } : x)), done: e.done }); }
}

function openBlockMenu(el, x, y) {
  const { b, day, tpl } = blockFrom(el);
  if (!b) return;
  closeDropdown();
  closeTaskMenu();
  const s = tpl && scheduleById(tpl);
  const e = day ? dayEntry(day) : null;
  const done = e?.done.includes(b.id);
  const next = day && ymd(addDays(parseDay(day), 1));
  const items = [
    ['pencil', s && day ? `Edit (every ${daysText(s.days)})` : 'Edit', () => editBlock(el)],
    day && ['check', done ? 'Mark not done' : 'Mark done', () => saveDayEntry(day, { extra: e.extra, done: done ? e.done.filter((i) => i !== b.id) : [...e.done, b.id] })],
    day && !tpl && ['duplicate', 'Copy to tomorrow', () => {
      const n = dayEntry(next);
      saveDayEntry(next, { extra: [...n.extra, { ...b, id: newBlockId() }], done: n.done });
      toast(`Copied to ${dayLabel(next)}`);
    }],
    '-',
    ['trash', s ? `Remove from ${s.name}` : 'Delete', () => {
      if (s) updateSchedule(tpl, (o) => ({ blocks: o.blocks.filter((x) => x.id !== b.id) }));
      else saveDayEntry(day, { extra: e.extra.filter((x) => x.id !== b.id), done: e.done.filter((i) => i !== b.id) });
    }, 'danger'],
  ].filter(Boolean);
  const menu = document.createElement('div');
  menu.className = 'dd-menu ctx-menu';
  menu.setAttribute('role', 'menu');
  menu.innerHTML = items.map((it) => menuItem(items, it)).join('');
  menu.addEventListener('click', (ev) => {
    ev.stopPropagation();
    const opt = ev.target.closest('[data-i]');
    if (!opt) return;
    closeTaskMenu();
    items[opt.dataset.i][2]();
  });
  showMenu(menu, x, y);
  el.classList.add('menu-on');
}

async function newSchedule() {
  const name = await askText('New schedule', { placeholder: 'e.g. School days, Weekend', ok: 'Create' });
  if (!name?.trim()) return;
  // Starts on the days no other schedule has yet.
  const free = WEEK.filter((d) => !schedules().some((s) => s.days.includes(d)));
  const s = { id: newBlockId(), name: name.trim().slice(0, 60), days: free, blocks: [] };
  await saveSchedules([...schedules(), s]);
  setView({ type: 'schedule', id: `s:${s.id}` });
}

// A weekday belongs to one schedule at a time, so turning it on here takes it off the others.
function toggleScheduleDay(id, d) {
  const s = scheduleById(id);
  const on = !s.days.includes(d);
  saveSchedules(schedules().map((o) => {
    if (o.id === id) return { ...o, days: on ? [...o.days, d] : o.days.filter((x) => x !== d) };
    return on ? { ...o, days: o.days.filter((x) => x !== d) } : o;
  }));
}

async function deleteSchedule(id) {
  const s = scheduleById(id);
  if (!s || !(await askConfirm(`Delete ${s.name}?`, { body: `Its ${s.blocks.length} block${s.blocks.length === 1 ? '' : 's'} stop showing on ${daysText(s.days).toLowerCase()}. One-off blocks you added to dates stay.`, ok: 'Delete', danger: true }))) return;
  await saveSchedules(schedules().filter((o) => o.id !== id));
  setView({ type: 'schedule' });
}

// Opening a day's schedule shows the current time (today) or the first block, not 8 AM.
// After that, redraws keep wherever you scrolled it to.
let schedScrolled = '';
let schedScrollTop = 0;
document.addEventListener('scroll', (e) => { if (e.target.classList?.contains('sched-scroll')) schedScrollTop = e.target.scrollTop; }, true);
function scrollScheduleToNow() {
  const grid = $('.sched-grid');
  if (!grid) { schedScrolled = ''; return; }
  const key = state.view.id || 'today';
  if (schedScrolled === key) { grid.parentElement.scrollTop = schedScrollTop; return; }
  schedScrolled = key;
  const target = $('.sched-now', grid) || $('.sblock', grid);
  if (!target) return;
  // The timeline scrolls in its own box, so the tabs and the right-now card stay in view.
  const box = grid.parentElement;
  box.scrollTop = Math.max(0, target.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - box.clientHeight / 3);
}

// On Today: what's on now and how long it has left, or what's next.
function scheduleBanner() {
  const { now, cur, next } = nowInfo();
  if (cur) return `<div class="banner sched-banner now" data-nav="schedule">${ic('clock')} Now: <b>${esc(cur.title)}</b> · ${lengthText(toMin(cur.end) - now)} left, until ${esc(fmtTime(cur.end))} <span class="spacer"></span> Schedule →</div>`;
  if (next) return `<div class="banner sched-banner" data-nav="schedule">${ic('clock')} Next: <b>${esc(next.title)}</b> at ${esc(fmtTime(next.start))} · in ${lengthText(toMin(next.start) - now)} <span class="spacer"></span> Schedule →</div>`;
  return '';
}

// Keep the countdown, the now line and the current block moving while the schedule is open.
setInterval(() => {
  const hero = $('#sched-hero');
  if (hero) hero.outerHTML = heroHtml();
  const grid = $('.sched-grid[data-live="1"]');
  if (!grid) return;
  const first = Number(grid.dataset.first);
  const now = nowMin();
  const line = $('.sched-now', grid);
  if (line) line.style.top = `${((now - first * 60) / 60) * HOUR_PX}px`;
  const blocks = dayBlocks(today());
  $$('.sblock', grid).forEach((el) => {
    const b = blocks.find((x) => x.id === el.dataset.block);
    if (!b || b.done) return;
    el.classList.toggle('past', now >= toMin(b.end));
    el.classList.toggle('now', now >= toMin(b.start) && now < toMin(b.end));
  });
}, 20000);

document.addEventListener('input', (e) => { if (e.target.id === 'sched-input') updateSchedPreview(); });
document.addEventListener('keydown', (e) => {
  if (e.target.id === 'sched-input' && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addBlocks(); }
  if (e.target.id === 'tpl-name' && e.key === 'Enter') e.target.blur();
});
document.addEventListener('change', (e) => {
  if (e.target.id !== 'tpl-name') return;
  const { tpl } = schedTarget();
  const name = e.target.value.trim().slice(0, 60);
  if (tpl && name && name !== scheduleById(tpl)?.name) updateSchedule(tpl, () => ({ name }));
});

// ---------- focus view ----------
// What to work on next: overdue and today's tasks, deadlines closing in, and high priorities, best first.
function focusScore(t) {
  const now = today();
  const day = dueDay(t);
  const dl = deadlineDay(t);
  let score = { 4: 30, 3: 20, 2: 6 }[t.priority] || 0;
  if (day && day < now) score += 50;
  else if (day === now) score += 40;
  else if (day === inDays(1)) score += 10;
  if (dl) score += dl <= now ? 45 : dl <= inDays(3) ? 30 : dl <= inDays(7) ? 15 : 0;
  return score;
}
const upNext = () => openTasks().filter((t) => t.id !== timer.taskId && focusScore(t) >= 20)
  .sort((a, b) => focusScore(b) - focusScore(a) || (dueDay(a) || '9').localeCompare(dueDay(b) || '9')).slice(0, 8);

// Finished focus sessions today, kept on this device.
const focusLog = () => { const l = store.get('focusLog', null); return l?.day === today() ? l : { day: today(), count: 0 }; };

function focusCardHtml() {
  const task = timer.taskId && taskById(timer.taskId);
  const left = timerLeft();
  const pct = (1 - left / TIMER_LEN[timer.mode]) * 100;
  const sessions = focusLog().count;
  const p = task && projectById(task.project_id);
  return `<div class="focus-card glass ${timer.running ? 'running' : ''} ${timer.mode === 'break' ? 'break' : ''}" id="focus-card">
    <div class="fc-top">
      <span class="fc-mode">${timer.mode === 'break' ? 'Break' : timer.running ? 'Focusing on' : task ? 'Ready to focus on' : 'Focus'}</span>
      <span class="fc-sessions">${sessions ? `${'<i></i>'.repeat(Math.min(sessions, 8))} ${sessions} session${sessions === 1 ? '' : 's'} today` : 'No sessions yet today'}</span>
    </div>
    <div>${task
      ? `<div class="fc-task">${md(task.content)}</div><div class="fc-task-meta">${esc(p ? projectName(p) : '')}${dueDay(task) ? ' · ' + esc(dayLabel(dueDay(task))) : ''}</div>`
      : `<div class="fc-task empty-pick">${timer.mode === 'break' ? 'Stretch, get some water.' : 'Pick something from Up next, or just start a session.'}</div>`}</div>
    <div class="fc-clock"><span class="fc-time">${mmss(left)}</span><div class="fc-bar"><span style="width:${pct}%"></span></div></div>
    <div class="fc-btns">
      <button class="btn primary" data-act="fc-toggle">${ic(timer.running ? 'timer' : 'sparkle')} ${timer.running ? 'Pause' : 'Start'}</button>
      ${task ? `<button class="btn" data-act="fc-done">${ic('check')} Done</button>` : ''}
      <button class="btn ghost" data-act="fc-switch">${ic('swap')} ${timer.mode === 'break' ? 'Back to focus' : 'Take a break'}</button>
      <button class="btn ghost" data-act="fc-reset">Reset</button>
      ${task ? `<button class="btn ghost" data-act="fc-clear">${ic('close')} Unlink task</button>` : ''}
    </div>
  </div>`;
}


function renderView() {
  const v = state.view;
  const viewEl = $('#view');
  viewEl.classList.remove('wide', 'board-view');
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
    html += scheduleBanner();
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
    if (!withDl.length) html = empty('flag', 'No deadlines yet. Open any task and set one, press D on a selected task, or type {friday} in quick add. Capri keeps them itself, so no Todoist Pro needed.');
  } else if (v.type === 'focus') {
    title = 'Focus';
    sub = 'One thing at a time: pick a task, start the timer, finish it';
    actions = '';
    const next = upNext();
    html += focusCardHtml();
    html += group('Up next', next.map((x) => taskRow(x, { focusPick: true })).join('')
      || '<div class="muted small" style="padding:10px">Nothing urgent: no overdue, due-today, deadline or high-priority tasks.</div>',
    { sub: String(next.length), key: 'upnext' });
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
      const sections = projectSections(p.id);
      const buckets = [{ id: null, name: p.inbox_project ? 'Inbox' : 'No section' }, ...sections];
      if (layout === 'board') {
        viewEl.classList.add('wide', 'board-view');
        const by = boardGroup(['section', 'due', 'priority', 'label']);
        actions = actions.replace('<div class="seg">', groupControl(['section', 'due', 'priority', 'label'], by) + '<div class="seg">');
        html = renderBoard(tasks, by, p);
      } else {
        html = buckets.map((s) => {
          const items = tasks.filter((x) => (x.section_id || null) === s.id);
          if (s.id === null && !items.length && sections.length) return '';
          const body = taskTree(items, { showProject: false }) + inlineAdd({ project_id: p.id, section_id: s.id });
          const drop = { project: p.id, section: s.id || '' };
          return s.id === null ? `<section class="group" data-drop='${esc(JSON.stringify(drop))}'>${body}</section>` : group(s.name, body, { sub: String(items.length), key: s.id, section: s.id, drop });
        }).join('');
      }
    }
  } else if (v.type === 'board') {
    title = 'Board';
    sub = `${open.length} open task${open.length === 1 ? '' : 's'} across every project`;
    viewEl.classList.add('wide', 'board-view');
    const by = boardGroup(['due', 'priority', 'project', 'label']);
    actions = groupControl(['due', 'priority', 'project', 'label'], by) + sortControl();
    html = renderBoard(open, by, null);
  } else if (v.type === 'label' && labelByName(v.id)) {
    const l = labelByName(v.id);
    title = '@' + l.name;
    const items = open.filter((x) => x.labels?.includes(l.name));
    const projects = [...new Set(items.map((x) => x.project_id))].map(projectById).filter(Boolean)
      .sort((a, b) => (b.inbox_project ? 1 : 0) - (a.inbox_project ? 1 : 0) || a.child_order - b.child_order);
    sub = `${items.length} open task${items.length === 1 ? '' : 's'}${projects.length > 1 ? ` in ${projects.length} projects` : ''}`;
    actions = sortControl() + `<button class="btn sm label-edit" data-act="label-menu" data-name="${esc(l.name)}"><span class="dot" style="background:${color(l.color)}"></span>Edit label</button>`;
    html = projects.map((p) => group(projectName(p), taskTree(items.filter((x) => x.project_id === p.id)), { sub: String(items.filter((x) => x.project_id === p.id).length), key: 'lbl:' + p.id }) ).join('')
      + (items.length ? '' : empty('tag', `Nothing tagged @${l.name} yet. Add it to a task from its details, or type @${l.name} when adding one.`))
      + inlineAdd({ label: l.name });
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
    title = 'Notes';
    sub = 'Written notes and sketches, saved to your account';
    actions = `<button class="btn primary sm" data-act="new-note">${ic('plus')} New note</button>
      <button class="btn sm" data-act="new-sketch">${ic('pencil')} New sketch</button>`;
    viewEl.classList.add('wide');
    html = `<div class="sketch-grid">
      <div class="new-pair">
        <button class="sketch new" data-act="new-note">${ic('plus')} New note</button>
        <button class="sketch new" data-act="new-sketch">${ic('pencil')} New sketch</button>
      </div>
      ${state.drawings.map((d) => {
        const task = d.task_id && taskById(d.task_id);
        return `<div class="sketch glass" data-sketch="${d.id}">
          ${isWritten(d) ? `<div class="note-paper">${esc((d.body || '').slice(0, 600))}</div>`
            : `<img src="/api/drawings/${d.id}.png?v=${encodeURIComponent(d.updated_at)}" alt="" loading="lazy" />`}
          <div class="s-title">${esc(d.title)}</div>
          <div class="s-sub">${task ? '↳ ' + esc(plain(task.content)) : new Date(d.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
        </div>`;
      }).join('')}</div>`;
  } else if (v.type === 'schedule') {
    const target = schedTarget();
    title = 'Schedule';
    actions = '';
    if (target.tpl) sub = 'A schedule that repeats on the days you pick';
    else {
      const day = target.day;
      sub = day === t ? `Today · ${parseDay(day).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}` : `${dayLabel(day)} · ${parseDay(day).toLocaleDateString([], { month: 'long', day: 'numeric' })}`;
      actions = `<div class="seg sched-days">
        <button data-act="sched-day" data-day="${ymd(addDays(parseDay(day), -1))}" title="Previous day">${ic('back')}</button>
        <button data-act="sched-day" data-day="${t}" class="${day === t ? 'on' : ''}">Today</button>
        <button data-act="sched-day" data-day="${ymd(addDays(parseDay(day), 1))}" title="Next day">${ic('arrow')}</button></div>`;
    }
    html = scheduleHtml(target);
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
  layoutBoard();
  scrollScheduleToNow();
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
    <div class="field"><span>Labels</span><div class="chips">${sortedLabels().map((l) =>
      `<button class="chip label-chip ${t.labels?.includes(l.name) ? 'on' : ''}" style="--lc:${color(l.color)}" data-label="${esc(l.name)}">@${esc(l.name)}</button>`).join('')}
      <button class="chip new-label" data-act="new-label-for">${ic('plus')} New label</button></div></div>

    <div class="section-title">Sub-tasks ${kids.length ? `<span class="muted">${kids.length}</span>` : ''}</div>
    <div class="subtask-list">${kids.map((k) => taskRow(k, { showProject: false })).join('')}
      ${inlineAdd({ parent_id: t.id, project_id: t.project_id })}</div>

    <div class="section-title">Notes</div>
    <div class="thumbs">
      ${drawingsFor(t.id).map((d) => isWritten(d)
        ? `<button class="thumb text" data-sketch="${d.id}" title="${esc(d.title)}">${ic('comment')}</button>`
        : `<button class="thumb" data-sketch="${d.id}" title="${esc(d.title)}"><img src="/api/drawings/${d.id}.png?v=${encodeURIComponent(d.updated_at)}" alt="" /></button>`).join('')}
      <button class="thumb add" data-act="h-note" title="New note for this task">${ic('plus')}</button>
      <button class="thumb add" data-act="h-sketch" title="New sketch for this task">${ic('pencil')}</button>
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

function closeDetail() {
  state.detailId = null;
  renderDetail();
  clearSelection();
}
// On phones (no keyboard to move it) the selection only lasts while a task's drawer or menu is open.
const isTouch = () => matchMedia('(hover: none)').matches;
function clearSelection() {
  state.selectedId = null;
  $$('.task.selected').forEach((el) => el.classList.remove('selected'));
}

// ---------- mutations ----------

function patchLocal(id, changes) {
  const t = taskById(id);
  if (t) Object.assign(t, changes);
}

async function updateTask(id, body, { rerender = true } = {}) {
  try {
    const updated = await api('POST', `/api/tasks/${id}`, body);
    patchLocal(id, updated);
    if (rerender) renderAnimated();
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
  const prev = state.deadlines[id];
  if (date) state.deadlines[id] = date; else delete state.deadlines[id];
  render();
  try {
    await saveDeadlines({ [id]: date || null });
    // A leftover "Deadline:" line from an older version would otherwise still count.
    if (legacyDeadline(t)) {
      const description = stripDeadline(t.description);
      patchLocal(id, { description });
      await api('POST', `/api/tasks/${id}`, { description });
      render();
    }
    toast(date ? `Deadline set: ${dayLabel(date)} (${countdown(date)})` : 'Deadline cleared');
  } catch (err) {
    if (prev) state.deadlines[id] = prev; else delete state.deadlines[id];
    render();
    toast(err.message);
  }
}

async function moveTask(id, project_id, section_id) {
  const body = section_id ? { section_id } : { project_id };
  patchLocal(id, { project_id, section_id: section_id || null });
  renderAnimated();
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
  renderAnimated();
  try {
    await api('POST', `/api/tasks/${id}/close`);
    if (recurring) { await sync({ quiet: true }); if (!quiet) toast('Recurring task rescheduled'); }
    else if (!quiet) toast('Task completed', { label: 'Undo', run: () => reopenTask(id) });
  } catch (err) {
    t.checked = false;
    if (state.doneToday) state.doneToday--;
    renderAnimated();
    toast(err.message);
  }
}

async function reopenTask(id) {
  try {
    await api('POST', `/api/tasks/${id}/reopen`);
    const t = taskById(id);
    if (t) { t.checked = false; if (state.doneToday) state.doneToday--; renderAnimated(); }
    else await sync({ quiet: true });
    if (state.view.type === 'completed') loadCompleted();
    toast('Task reopened');
  } catch (err) { toast(err.message); }
}

// Reopening from the Completed list: the tick clears and the strike-through lifts, the row glows and
// rises away, then the rest of the list closes the gap.
async function reopenFromCompleted(row) {
  const id = row.dataset.reopen;
  if (row.classList.contains('reopen-anim')) return;
  row.classList.add('reopen-anim');
  $('.check', row)?.classList.remove('checked');
  try {
    await Promise.all([api('POST', `/api/tasks/${id}/reopen`), new Promise((r) => setTimeout(r, reducedMotion() ? 0 : 480))]);
  } catch (err) {
    row.classList.remove('reopen-anim');
    $('.check', row)?.classList.add('checked');
    return toast(err.message);
  }
  const view = $('#view');
  const movers = $$('.task[data-reopen], .group-head, .empty', view).filter((el) => el !== row);
  const before = new Map(movers.map((el) => [el, el.getBoundingClientRect()]));
  const section = row.closest('.group');
  row.remove();
  if (section && !$('[data-reopen]', section)) section.remove();
  else if (section) { const n = $('.group-head .muted', section); if (n) n.textContent = String($$('[data-reopen]', section).length); }
  if (!$('[data-reopen]', view)) view.innerHTML = empty('done', 'Nothing completed in the last week yet.');
  if (!reducedMotion()) {
    for (const [el, r] of before) {
      if (!el.isConnected) continue;
      const dy = r.top - el.getBoundingClientRect().top;
      if (Math.abs(dy) > 1) el.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 480, easing: SYNC_EASE });
    }
  }
  if (state.doneToday) state.doneToday--;
  // Fetch the reopened task once the list has settled; redrawing sooner would cut the glide short.
  setTimeout(() => sync({ quiet: true }), 560);
  toast('Task reopened');
}

async function deleteTask(id) {
  const t = taskById(id);
  if (!t || !(await askConfirm('Delete this task?', { body: `“${plain(t.content)}” will be deleted from Todoist. This can't be undone.`, ok: 'Delete', danger: true }))) return;
  // The row leaves straight away instead of sitting there while Todoist answers.
  const rows = $$(`#view [data-task="${id}"]`);
  rows.forEach((row) => row.classList.add('leave-anim'));
  try {
    await Promise.all([api('DELETE', `/api/tasks/${id}`), new Promise((r) => setTimeout(r, reducedMotion() ? 0 : 260))]);
    state.tasks = state.tasks.filter((x) => x.id !== id && x.parent_id !== id);
    closeDetail();
    renderAnimated();
    toast('Task deleted');
  } catch (err) {
    rows.forEach((row) => row.classList.remove('leave-anim'));
    toast(err.message);
  }
}

// Swipe-delete: the task disappears now and is deleted from Todoist once the undo window passes.
const pendingDeletes = new Map();
function deleteTaskSoon(id) {
  const removed = state.tasks.filter((x) => x.id === id || x.parent_id === id);
  if (!removed.length) return;
  state.tasks = state.tasks.filter((x) => !removed.includes(x));
  state.picked.delete(id);
  if (state.detailId === id) closeDetail();
  renderAnimated();
  const commit = () => {
    if (!pendingDeletes.delete(id)) return;
    api('DELETE', `/api/tasks/${id}`).catch((err) => { state.tasks.push(...removed); renderAnimated(); toast(err.message); });
  };
  pendingDeletes.set(id, commit);
  setTimeout(commit, 6000);
  toast('Task deleted', {
    label: 'Undo',
    run: () => { if (pendingDeletes.delete(id)) { state.tasks.push(...removed); renderAnimated(); } },
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
      content: t.content, description: stripDeadline(t.description), project_id: t.project_id, section_id: t.section_id || undefined,
      parent_id: t.parent_id || undefined, labels: t.labels, priority: t.priority,
      due_string: t.due?.string || undefined,
    };
    const copy = await api('POST', '/api/tasks', body);
    const dl = deadlineDay(t);
    if (dl) { await saveDeadlines({ [copy.id]: dl }); state.deadlines[copy.id] = dl; }
    state.tasks.push(copy);
    renderAnimated();
    openDetail(copy.id);
    toast('Task duplicated');
  } catch (err) { toast(err.message); }
}

async function setPriority(id, priority) {
  patchLocal(id, { priority });
  renderAnimated();
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
  const description = $('#quick-desc').value.trim();
  const dueDate = $('#quick-due').value;
  const ctx = state.quickContext || {};
  const btn = $('#quick-save');
  btn.disabled = true;
  try {
    let task = await api('POST', '/api/tasks/quick', { text });
    const fix = {};
    if (description) fix.description = description;
    if (ctx.priority && task.priority === 1) fix.priority = ctx.priority;
    if (ctx.label && !task.labels?.includes(ctx.label)) fix.labels = [...(task.labels || []), ctx.label];
    if (date?.time) fix.due_datetime = new Date(`${date.date}T${date.time}:00`).toISOString();
    else if (date) fix.due_date = date.date;
    else if (dueDate && !task.due) fix.due_date = dueDate;
    if (Object.keys(fix).length) task = { ...task, ...(await api('POST', `/api/tasks/${task.id}`, fix)) };
    if (dlDate) { await saveDeadlines({ [task.id]: dlDate }); state.deadlines[task.id] = dlDate; }
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
    renderAnimated();
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
    { label: 'New note', run: () => openNote({}) },
    { label: 'New sketch', run: () => openDraw({}) },
    { label: 'Start focus timer', run: () => startTimer() },
    { label: 'Go to Dashboard', run: () => setView({ type: 'dashboard' }) },
    { label: 'Go to Board', run: () => setView({ type: 'board' }) },
    { label: 'Go to Today', run: () => setView({ type: 'today' }) },
    { label: 'Go to Upcoming', run: () => setView({ type: 'upcoming' }) },
    { label: 'Go to Deadlines', run: () => setView({ type: 'deadlines' }) },
    { label: 'Go to Focus', run: () => setView({ type: 'focus' }) },
    { label: 'Go to Notes', run: () => setView({ type: 'sketches' }) },
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
  const sketches = q ? state.drawings.filter((d) => match(d.title) || (isWritten(d) && match(d.body || ''))).slice(0, 6).map((d) => ({
    label: d.title, kind: isWritten(d) ? 'Note' : 'Sketch', group: 'Notes', run: () => openNoteItem(d),
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
  const card = $('#focus-card');
  if (card) { // the Focus view's card ticks along with the sidebar timer
    $('.fc-time', card).textContent = mmss(left);
    $('.fc-bar > span', card).style.width = `${(1 - left / TIMER_LEN[timer.mode]) * 100}%`;
  }
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
  timerChanged();
  const task = timer.taskId && taskById(timer.taskId);
  toast(task ? `Focusing on “${plain(task.content)}”` : 'Focus timer started');
}

// The Focus view shows the timer's task and state, so redraw it when they change.
const timerChanged = () => { if (state.view.type === 'focus') render(); };
function pauseTimer() { timer.remaining = timerLeft(); timer.running = false; saveTimer(); renderTimer(); timerChanged(); }
function resetTimer() { timer.running = false; timer.remaining = TIMER_LEN[timer.mode]; saveTimer(); renderTimer(); timerChanged(); }
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
    if (timer.mode === 'focus') { const log = focusLog(); log.count++; store.set('focusLog', log); }
    timer.mode = timer.mode === 'focus' ? 'break' : 'focus';
    timer.running = false;
    timer.remaining = TIMER_LEN[timer.mode];
    saveTimer();
    chime();
    toast(msg);
    if ('Notification' in window && Notification.permission === 'granted') new Notification('Capri', { body: msg });
    timerChanged();
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
  pad2d.baseShown = null;
  pad2d.dirty = false;
  pad2d.k = sketchInvert();
  $('#draw-canvas').style.background = inkFor(PAPER, pad2d.k);
  const task = taskId || drawing?.task_id || null;
  const linked = task && taskById(task);
  $('#draw-title').value = drawing?.title || (linked ? `Sketch: ${plain(linked.content)}`.slice(0, 80) : '');
  $('#draw-task').innerHTML = taskOptions(task);
  $('#draw-delete').classList.toggle('hidden', !drawing);
  $('#draw').classList.remove('hidden');
  requestAnimationFrame(() => {
    sizeCanvas();
    if (drawing) {
      const img = new Image();
      img.onload = () => {
        pad2d.base = img;
        pad2d.baseShown = pad2d.k ? invertedImage(img, pad2d.k) : img;
        rebuildCache();
        paint();
      };
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
  // clientWidth/Height, not the on-screen box: the window pops open with a scale, and measuring it mid-pop
  // made the canvas too small, so strokes landed off to the right of the cursor.
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(canvas.clientWidth * dpr);
  canvas.height = Math.round(canvas.clientHeight * dpr);
  pad2d.cache = document.createElement('canvas');
  pad2d.cache.width = canvas.width;
  pad2d.cache.height = canvas.height;
  rebuildCache();
  paint();
}

// Sketches are saved on light paper. Dark themes show them inverted with the same hues (the CSS
// invert(k) hue-rotate(180deg) that the thumbnails use); the pad draws that itself, because Safari
// won't apply a CSS filter to a canvas.
const sketchInvert = () => Number(getComputedStyle(document.documentElement).getPropertyValue('--sketch-invert')) || 0;
function shade(r, g, b, k) {
  [r, g, b] = [r, g, b].map((c) => k + (c / 255) * (1 - 2 * k));
  const m = [[-0.574, 1.43, 0.144], [0.426, 0.43, 0.144], [0.426, 1.43, -0.856]];
  return m.map(([x, y, z]) => Math.round(Math.min(1, Math.max(0, x * r + y * g + z * b)) * 255));
}
function inkFor(hex, k) {
  if (!k) return hex;
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${shade(n >> 16, (n >> 8) & 255, n & 255, k).join(',')})`;
}
function invertedImage(img, k) {
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, c.width, c.height);
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) [px[i], px[i + 1], px[i + 2]] = shade(px[i], px[i + 1], px[i + 2], k);
  ctx.putImageData(data, 0, 0);
  return c;
}

function drawStroke(ctx, s, k = 0) {
  const dpr = window.devicePixelRatio || 1;
  const pts = s.points;
  if (!pts.length) return;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = inkFor(s.color, k);
  // A highlighter darkens light paper; on dark paper it has to lighten instead.
  ctx.globalCompositeOperation = s.tool === 'eraser' ? 'destination-out' : s.tool === 'marker' ? (k ? 'screen' : 'multiply') : 'source-over';
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

// The base image and every stroke, on a transparent layer; k > 0 draws them the way the theme shows them.
function drawLayer(c, k) {
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  const base = k ? pad2d.baseShown : pad2d.base;
  if (base) {
    const scale = Math.min(c.width / base.width, c.height / base.height);
    ctx.drawImage(base, 0, 0, base.width * scale, base.height * scale);
  }
  pad2d.strokes.forEach((s) => drawStroke(ctx, s, k));
}

function rebuildCache() {
  if (pad2d.cache) drawLayer(pad2d.cache, pad2d.k);
}

function paint() {
  const canvas = $('#draw-canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (pad2d.cache) ctx.drawImage(pad2d.cache, 0, 0);
  if (pad2d.current) drawStroke(ctx, pad2d.current, pad2d.k);
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
  // Always saved as drawn on light paper, whatever the theme shows.
  const layer = document.createElement('canvas');
  layer.width = out.width;
  layer.height = out.height;
  drawLayer(layer, 0);
  ctx.drawImage(layer, 0, 0);
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

async function deleteDrawing(d = pad2d.editing) {
  const kind = isWritten(d) ? 'note' : 'sketch';
  if (!d || !(await askConfirm(`Delete this ${kind}?`, { body: `“${d.title}” will be deleted. This can't be undone.`, ok: 'Delete', danger: true }))) return;
  try {
    await api('DELETE', `/api/drawings/${d.id}`);
    state.drawings = state.drawings.filter((x) => x.id !== d.id);
    if (pad2d.editing?.id === d.id) closeDraw(true);
    if (noteEditing?.id === d.id) closeNote(true);
    render();
    toast(kind === 'note' ? 'Note deleted' : 'Sketch deleted');
  } catch (err) { toast(err.message); }
}

// ---------- written notes ----------
// A note is either a sketch or written text; both live in state.drawings, written ones have kind 'text'.
const isWritten = (d) => d?.kind === 'text';
const openNoteItem = (d) => d && (isWritten(d) ? openNote({ note: d }) : openDraw({ drawing: d }));
const taskOptions = (task) => '<option value="">Not attached to a task</option>' + sortTasks(openTasks(), 'name').map((t) =>
  `<option value="${t.id}" ${t.id === task ? 'selected' : ''}>↳ ${esc(plain(t.content).slice(0, 60))}</option>`).join('');
let noteEditing = null;
let noteDirty = false;

function openNote({ note = null, taskId = null }) {
  noteEditing = note;
  noteDirty = false;
  const task = taskId || note?.task_id || null;
  const linked = task && taskById(task);
  $('#note-title').value = note?.title || (linked ? `Note: ${plain(linked.content)}`.slice(0, 80) : '');
  $('#note-task').innerHTML = taskOptions(task);
  $('#note-body').value = note?.body || '';
  $('#note-delete').classList.toggle('hidden', !note);
  $('#note').classList.remove('hidden');
  $('#note-body').focus();
}

async function closeNote(force = false) {
  if (!force && noteDirty && !(await askConfirm('Discard this note?', { body: 'Your changes haven’t been saved.', ok: 'Discard', cancel: 'Keep writing', danger: true }))) return;
  $('#note').classList.add('hidden');
  noteEditing = null;
}

async function saveNote() {
  const btn = $('#note-save');
  btn.disabled = true;
  try {
    const saved = await api('POST', '/api/drawings', {
      id: noteEditing?.id,
      title: $('#note-title').value.trim() || plain($('#note-body').value.trim().split('\n')[0]).slice(0, 80) || 'Untitled note',
      task_id: $('#note-task').value || null,
      text: $('#note-body').value,
    });
    state.drawings = [saved, ...state.drawings.filter((d) => d.id !== saved.id)];
    closeNote(true);
    render();
    toast('Note saved');
  } catch (err) { toast(err.message); }
  finally { btn.disabled = false; }
}

async function renameNote(d) {
  const title = await askText(`Rename ${isWritten(d) ? 'note' : 'sketch'}`, { value: d.title, ok: 'Rename' });
  if (!title?.trim() || title.trim() === d.title) return;
  try {
    const saved = await api('POST', `/api/drawings/${d.id}/meta`, { title: title.trim() });
    state.drawings = state.drawings.map((x) => (x.id === d.id ? saved : x));
    render();
  } catch (err) { toast(err.message); }
}

// Right-click (or hold, on phones) a note: open, rename, jump to its task, or delete it.
function openNoteMenu(card, x, y) {
  const d = state.drawings.find((n) => n.id === card.dataset.sketch);
  if (!d) return;
  closeDropdown();
  closeTaskMenu();
  const task = d.task_id && taskById(d.task_id);
  const items = [
    ['external', 'Open', () => openNoteItem(d)],
    ['pencil', 'Rename', () => renameNote(d)],
    task && ['link', 'Go to task', () => openDetail(task.id)],
    '-',
    ['trash', 'Delete', () => deleteDrawing(d), 'danger'],
  ].filter(Boolean);
  const menu = document.createElement('div');
  menu.className = 'dd-menu ctx-menu';
  menu.setAttribute('role', 'menu');
  menu.innerHTML = items.map((it) => menuItem(items, it)).join('');
  menu.addEventListener('click', (e) => {
    e.stopPropagation();
    const opt = e.target.closest('[data-i]');
    if (!opt) return;
    closeTaskMenu();
    items[opt.dataset.i][2]();
  });
  showMenu(menu, x, y);
  card.classList.add('menu-on');
}

(function setupNotePad() {
  $('#note-body').addEventListener('input', () => (noteDirty = true));
  $('#note-title').addEventListener('input', () => (noteDirty = true));
  $('#note-task').addEventListener('change', () => (noteDirty = true));
  $('#note-save').addEventListener('click', saveNote);
  $('#note-cancel').addEventListener('click', () => closeNote());
  $('#note-delete').addEventListener('click', () => deleteDrawing(noteEditing));
})();

(function setupDrawPad() {
  const canvas = $('#draw-canvas');
  $('#draw-colors').innerHTML = INKS.map((c, i) => `<button class="swatch ${i === 0 ? 'on' : ''}" data-ink="${c}" style="background:${c}"></button>`).join('');
  const point = (e) => {
    const r = canvas.getBoundingClientRect();
    const k = canvas.clientWidth / (r.width || 1); // undo any scale on the window so the ink lands under the pointer
    // Mice report 0.5 pressure; pens report real pressure.
    return [(e.clientX - r.left) * k, (e.clientY - r.top) * k, e.pointerType === 'pen' ? e.pressure || 0.5 : 0.5];
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
  $('#draw-delete').addEventListener('click', () => deleteDrawing());
  // Resize with the window, and once the opening pop has settled.
  let drawn = '';
  new ResizeObserver(() => {
    const size = `${canvas.clientWidth}x${canvas.clientHeight}`;
    if (size !== drawn && canvas.clientWidth && !$('#draw').classList.contains('hidden')) { drawn = size; sizeCanvas(); }
  }).observe(canvas);
})();

// ---------- misc actions ----------

// Electron (the desktop app) doesn't support window.prompt, so ask with our own dialog.
function askText(title, { placeholder = '', ok = 'Create', value = '' } = {}) {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'modal ask-modal';
    modal.innerHTML = `<form class="modal-card glass ask-card">
      <h3>${esc(title)}</h3>
      <input type="text" placeholder="${esc(placeholder)}" value="${esc(value)}" autocomplete="off" />
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
    input.select();
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

const projectSections = (projectId) => state.sections
  .filter((s) => s.project_id === projectId && !s.is_archived).sort((a, b) => a.section_order - b.section_order);

async function renameSection(id) {
  const s = state.sections.find((x) => x.id === id);
  const name = s && await askText('Rename section', { value: s.name, ok: 'Rename' });
  if (!name || name === s.name) return;
  const old = s.name;
  s.name = name;
  render();
  try { await api('POST', `/api/sections/${id}`, { name }); }
  catch (err) { s.name = old; render(); toast(err.message); }
}

// Swaps the section with its neighbour.
function moveSection(id, dir) {
  const s = state.sections.find((x) => x.id === id);
  if (!s) return;
  const ids = projectSections(s.project_id).map((x) => x.id);
  const i = ids.indexOf(id);
  const j = i + dir;
  if (j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  flipColumns(() => reorderSections(ids));
}

// Puts a project's sections in this order, renumbering them 1..n.
async function reorderSections(ids) {
  const list = ids.map((id) => state.sections.find((x) => x.id === id)).filter(Boolean);
  const before = list.map((x) => [x, x.section_order]);
  if (list.every((x, n) => x.section_order === n + 1)) return;
  list.forEach((x, n) => { x.section_order = n + 1; });
  renderAnimated();
  try { await api('POST', '/api/sections/reorder', { sections: list.map((x) => ({ id: x.id, section_order: x.section_order })) }); }
  catch (err) { before.forEach(([x, o]) => { x.section_order = o; }); renderAnimated(); toast(err.message); }
}

// Saves the board's column order. keys are the columns on screen, in their new order; hidden
// (empty) columns keep their place among them.
function saveColumnOrder(by, keys) {
  if (by === 'section') return reorderSections(keys);
  const shown = new Set(keys);
  let n = 0;
  const full = boardOrder.keys.map((k) => (shown.has(k) ? keys[n++] : k));
  const key = colOrderKey(by);
  state.prefs[key] = full;
  renderAnimated();
  api('POST', '/api/prefs', { key, value: full }).catch((err) => toast(err.message));
}

const movableKeys = (board) => $$('.group-head[data-move]', board).map((h) => h.dataset.move);
function moveColumn(head, dir) {
  const board = head.closest('.board');
  const keys = movableKeys(board);
  const i = keys.indexOf(head.dataset.move);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= keys.length) return;
  [keys[i], keys[j]] = [keys[j], keys[i]];
  flipColumns(() => saveColumnOrder(board.dataset.by, keys));
}

// Columns slide to their new places instead of jumping.
function flipColumns(change) {
  const before = new Map($$('.board .column[data-col]').map((c) => [c.dataset.col, c.getBoundingClientRect()]));
  change();
  if (reducedMotion()) return;
  for (const c of $$('.board .column[data-col]')) {
    const was = before.get(c.dataset.col);
    if (!was) continue;
    const r = c.getBoundingClientRect();
    const dx = was.left - r.left;
    const dy = was.top - r.top;
    if (dx || dy) c.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
  }
}

async function deleteSection(id) {
  const s = state.sections.find((x) => x.id === id);
  if (!s) return;
  const n = state.tasks.filter((t) => t.section_id === id && !t.checked).length;
  const body = n
    ? `“${s.name}” and the ${n} task${n === 1 ? '' : 's'} in it will be deleted from Todoist. This can't be undone.`
    : `“${s.name}” will be deleted from Todoist.`;
  if (!(await askConfirm('Delete this section?', { body, ok: 'Delete', danger: true }))) return;
  const sections = state.sections;
  const tasks = state.tasks;
  state.sections = sections.filter((x) => x !== s);
  state.tasks = tasks.filter((t) => t.section_id !== id);
  if (state.detailId && !taskById(state.detailId)) closeDetail();
  renderAnimated();
  try { await api('DELETE', `/api/sections/${id}`); }
  catch (err) { state.sections = sections; state.tasks = tasks; render(); toast(err.message); }
}

async function rescheduleOverdue(btn) {
  const t = today();
  const overdue = openTasks().filter((x) => dueDay(x) && dueDay(x) < t);
  // Rescheduling a recurring task through the API would drop its recurrence, so leave those alone.
  const movable = overdue.filter((x) => !x.due.is_recurring);
  const skipped = overdue.length - movable.length;
  if (!movable.length) return toast('Only recurring tasks are overdue — complete or edit those individually');
  btn?.classList.add('busy');
  // The overdue rows sweep out one after another while the changes save…
  movable.forEach((x, i) => {
    const row = $(`.task[data-task="${x.id}"]`);
    if (row) { row.style.animationDelay = `${Math.min(i, 8) * 40}ms`; row.classList.add('resched-out'); }
  });
  const sweep = new Promise((r) => setTimeout(r, reducedMotion() ? 0 : 320 + Math.min(movable.length, 8) * 40));
  try {
    await Promise.all([sweep, ...movable.map((x) => updateTask(x.id, { due_string: 'today' }, { rerender: false }))]);
  } finally {
    render();
  }
  // …then land in Today with a glow.
  movable.forEach((x, i) => {
    const row = $(`.task[data-task="${x.id}"]`);
    if (!row) return;
    row.style.animationDelay = `${Math.min(i, 8) * 45}ms`;
    row.classList.add('resched-in');
    row.addEventListener('animationend', () => { row.classList.remove('resched-in'); row.style.animationDelay = ''; }, { once: true });
  });
  toast(`Moved ${movable.length} to today${skipped ? ` · skipped ${skipped} recurring` : ''}`);
}

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// Tap feedback: a pressed button sinks slightly and brightens, then springs back when you let go.
const TAPPABLE = 'button, .nav-item, .chip, .date-pill, .dd-btn, .dd-opt, [data-act], .ctx-item, a.btn';
let pressed = null;
document.addEventListener('pointerdown', (e) => {
  if (e.button > 0) return;
  const el = e.target.closest(TAPPABLE);
  if (!el || el.disabled || el.closest('canvas, .canvas-wrap')) return;
  pressed = el;
  el.classList.remove('tap-release');
  el.classList.add('tap-press');
}, { capture: true, passive: true });
const releasePress = () => {
  const el = pressed;
  if (!el) return;
  pressed = null;
  el.classList.remove('tap-press');
  void el.offsetWidth; // restart the animation on quick repeat taps
  el.classList.add('tap-release');
  el.addEventListener('animationend', () => el.classList.remove('tap-release'), { once: true });
};
document.addEventListener('pointerup', releasePress, true);
document.addEventListener('pointercancel', releasePress, true);
// iOS only shows :active press states when the page listens for touches.
document.addEventListener('touchstart', () => {}, { passive: true });

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
  $('meta[name="theme-color"]')?.setAttribute('content', getComputedStyle(document.documentElement).getPropertyValue('--bg').trim());
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

function showConnect({ expired = false } = {}) {
  $('#app').classList.add('hidden');
  $('#connect').classList.remove('hidden');
  $('#connect-expired').classList.toggle('hidden', !expired);
  $('#connect-lead').classList.toggle('hidden', expired);
  $('#token-input').placeholder = expired ? 'Your new Todoist API token' : 'Todoist API token';
  if (expired) $('#token-input').focus();
}

// Offline cache: the app opens from this device's copy and refreshes it in the background.
// When a newer version has been downloaded, offer to switch to it.
let updateReady = false;
if ('serviceWorker' in navigator && isSecureContext) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
  navigator.serviceWorker.addEventListener('message', (e) => {
    if (e.data !== 'capri-updated' || updateReady) return;
    // The new version is already saved on the device. Switch to it quietly the next time Capri goes
    // to the background, so it never reloads in your face; or right now from the toast.
    updateReady = true;
    toast('Capri has been updated', { label: 'Reload', run: () => location.reload() });
  });
  // A home-screen app is usually resumed rather than reloaded, so the cache would never look for a new
  // version. Each time Capri comes back to the front (at most once a minute), and every 10 minutes while
  // it's open, ask the server; sw.js compares the files and sends 'capri-updated' if they changed.
  let lastUpdateCheck = Date.now();
  const checkForUpdate = () => {
    if (document.hidden || !navigator.serviceWorker.controller || Date.now() - lastUpdateCheck < 60000) return;
    lastUpdateCheck = Date.now();
    navigator.serviceWorker.getRegistration().then((r) => r?.update()).catch(() => {});
    for (const f of ['/', '/app.js', '/styles.css']) fetch(f).catch(() => {});
  };
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && updateReady && !writes.pending && !pendingDeletes.size) location.reload();
    else checkForUpdate();
  });
  addEventListener('focus', checkForUpdate);
  setInterval(checkForUpdate, 10 * 60000);
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
  if (!location.hash) location.replace('#/today');
  applyHash();
  await sync({ quiet: true });
}

// ---------- events ----------

let pendingG = false;

$('#token-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('#connect-error').textContent = '';
  try {
    const { carried } = await api('POST', '/api/connect', { token: $('#token-input').value });
    $('#token-input').value = '';
    lastSyncFingerprint = '';
    await boot();
    if (carried) toast('Signed in with your new token. Your notes, schedule and settings came across.');
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
    if (a === 'reopen') return reopenFromCompleted(act.closest('[data-reopen]'));
    if (a === 'add') return openQuick(JSON.parse(act.dataset.ctx || 'null'));
    if (a === 'close-detail') return closeDetail();
    if (a === 'delete') return deleteTask(state.detailId);
    if (a === 'duplicate') return duplicateTask(state.detailId);
    if (a === 'copy') { navigator.clipboard?.writeText(plain(taskById(state.detailId)?.content)); return toast('Copied'); }
    if (a === 'add-section') return createSection();
    if (a === 'reschedule-overdue') return rescheduleOverdue(act);
    if (a === 'new-sketch') return openDraw({});
    if (a === 'new-note') return openNote({});
    if (a === 'h-note') return openNote({ taskId: target });
    if (a === 'h-today') return setDue(target, 'today');
    if (a === 'h-tomorrow') return setDue(target, 'tomorrow');
    if (a === 'h-deadline') return openDetail(target, '#d-deadline');
    if (a === 'h-sketch') return openDraw({ taskId: target });
    if (a === 'h-timer') return startTimer(target);
    if (a === 'new-label') return createLabel();
    if (a === 'new-label-for') return createLabel(state.detailId);
    if (a === 'label-menu') { const r = act.getBoundingClientRect(); return openLabelMenu(act.dataset.name, r.left, r.bottom + 6, act); }
    if (a === 'sched-day') return setView({ type: 'schedule', id: act.dataset.day === t0() ? undefined : act.dataset.day });
    if (a === 'sched-add') return addBlocks();
    if (a === 'sched-open') return setView({ type: 'schedule', id: act.dataset.id || undefined });
    if (a === 'sched-new') return newSchedule();
    if (a === 'tpl-day') return toggleScheduleDay(schedTarget().tpl, Number(act.dataset.d));
    if (a === 'tpl-delete') return deleteSchedule(schedTarget().tpl);
    if (a === 'fc-toggle') return timer.running ? pauseTimer() : startTimer();
    if (a === 'fc-switch') return switchTimer();
    if (a === 'fc-reset') return resetTimer();
    if (a === 'fc-clear') { timer.taskId = null; saveTimer(); renderTimer(); return timerChanged(); }
    if (a === 'fc-done') {
      const id = timer.taskId;
      timer.taskId = null;
      saveTimer();
      renderTimer();
      return completeTask(id);
    }
    if (a === 'due-to-deadline') {
      const t = taskById(state.detailId);
      return setDueDate(t.id, ymd(addDays(parseDay(deadlineDay(t)), -1)));
    }
  }
  const block = e.target.closest('.sblock[data-block]');
  if (block) return editBlock(block);
  const slot = e.target.closest('.sched-grid');
  if (slot) return startBlockAt(slot, e.clientY);
  const sketch = e.target.closest('[data-sketch]');
  if (sketch) return openNoteItem(state.drawings.find((d) => d.id === sketch.dataset.sketch));

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
  if (e.target.id === 'group-select') { store.set(boardKey() + ':group', e.target.value); return renderAnimated(); }
  if (e.target.id === 'sort-select') { state.sort = e.target.value; store.set('sort', state.sort); return renderAnimated(); }
  if (e.target.id === 'bulk-prio') { const v = Number(e.target.value); e.target.value = ''; return v && runBulk('priority', v); }
  if (e.target.id === 'quick-due' || e.target.id === 'quick-deadline') { syncDateFields($('#quick')); return updateQuickPreview(); }
  const id = state.detailId;
  if (!id) return;
  if (e.target.id === 'd-content' && e.target.value.trim()) updateTask(id, { content: e.target.value.trim() });
  if (e.target.id === 'd-desc') {
    // The box hides an old "Deadline:" line, so saving drops it; keep the deadline itself first.
    const legacy = legacyDeadline(taskById(id));
    const keep = legacy && !state.deadlines[id] ? saveDeadlines({ [id]: legacy }).then(() => { state.deadlines[id] = legacy; }) : Promise.resolve();
    keep.then(() => updateTask(id, { description: e.target.value })).catch((err) => toast(err.message));
  }
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

// Drag & drop: board columns change whatever they group by (section, date, priority, project, label), a project's
// sections move tasks between them, day groups reschedule, sidebar projects move, "Today" schedules.
const dropTargetOf = (el) => el?.closest('.column[data-drop], .group[data-drop], .group[data-due], .nav-item[data-nav="project"], .nav-item[data-nav="today"]');
const dropClass = (target) => (target.classList.contains('column') ? 'drop-target' : 'drop-hover');

function dropTask(id, target) {
  const t = taskById(id);
  if (!t) return;
  if (target.dataset.drop) {
    dropOnColumn(id, target);
  } else if (target.dataset.due) {
    if (dueDay(t) !== target.dataset.due) setDueDate(id, target.dataset.due);
  } else if (target.dataset.nav === 'today') {
    setDue(id, 'today');
  } else if (target.dataset.nav === 'project' && target.dataset.id !== t.project_id) {
    moveTask(id, target.dataset.id, null);
    toast(`Moved to ${projectName(projectById(target.dataset.id))}`);
  }
}

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
  target.classList.add(dropClass(target));
});
document.addEventListener('drop', (e) => {
  const target = dropTargetOf(e.target);
  $$('.drop-target, .drop-hover').forEach((c) => c.classList.remove('drop-target', 'drop-hover'));
  if (!target) return;
  e.preventDefault();
  dropTask(e.dataTransfer.getData('text/plain'), target);
});

// Touch: hold a task for a moment to pick it up, drag it onto another column, section or day and let go
// (letting go where it started opens its menu instead). Dragging near the edges scrolls the view.
const HOLD_MS = 380;
let hold = null;
document.addEventListener('touchstart', (e) => {
  const row = e.target.closest('#view .task[data-task]');
  if (!row || hold || e.touches.length > 1 || e.target.closest('button, a, input, textarea')) return;
  row.draggable = false; // keep iOS's own drag-and-drop out of it
  const p = e.touches[0];
  hold = { row, x: p.clientX, y: p.clientY, cx: p.clientX, cy: p.clientY, timer: setTimeout(liftCard, HOLD_MS) };
}, { passive: true });

function liftCard() {
  const { row } = hold;
  const r = row.getBoundingClientRect();
  const ghost = row.cloneNode(true);
  ghost.classList.remove('selected');
  ghost.classList.add('card-ghost');
  Object.assign(ghost.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px` });
  document.body.append(ghost);
  row.classList.add('dragging');
  hold.ghost = ghost;
  hold.home = dropTargetOf(row);
  navigator.vibrate?.(10);
  const view = $('#view');
  view.classList.add('carrying'); // snapping would pull every edge-scroll straight back
  const step = () => {
    if (!hold?.ghost) return;
    const v = view.getBoundingClientRect();
    const edge = (pos, lo, hi) => (pos < lo + 48 ? -1 : pos > hi - 48 ? 1 : 0) * 14;
    view.scrollLeft += edge(hold.cx, v.left, v.right);
    view.scrollTop += edge(hold.cy, v.top, v.bottom);
    pickColumn();
    hold.raf = requestAnimationFrame(step);
  };
  hold.raf = requestAnimationFrame(step);
}

function pickColumn() {
  const col = dropTargetOf(document.elementFromPoint(hold.cx, hold.cy));
  hold.col = col && col !== hold.home ? col : null;
  $$('.drop-target, .drop-hover').forEach((c) => c !== hold.col && c.classList.remove('drop-target', 'drop-hover'));
  hold.col?.classList.add(dropClass(hold.col));
}

document.addEventListener('touchmove', (e) => {
  if (!hold) return;
  const p = e.touches[0];
  hold.cx = p.clientX;
  hold.cy = p.clientY;
  if (!hold.ghost) {
    // Moved before the hold finished: it's a scroll.
    if (Math.hypot(p.clientX - hold.x, p.clientY - hold.y) > 8) endHold();
    return;
  }
  e.preventDefault();
  if (Math.hypot(p.clientX - hold.x, p.clientY - hold.y) > 8) hold.moved = true;
  hold.ghost.style.transform = `translate(${p.clientX - hold.x}px, ${p.clientY - hold.y}px) rotate(1.5deg) scale(1.03)`;
}, { passive: false });

function endHold(drop = false) {
  if (!hold) return;
  const { row, ghost, col, timer, raf, moved, x, y } = hold;
  hold = null;
  clearTimeout(timer);
  cancelAnimationFrame(raf);
  row.draggable = true;
  $$('.drop-target, .drop-hover').forEach((c) => c.classList.remove('drop-target', 'drop-hover'));
  if (!ghost) return;
  $('#view').classList.remove('carrying');
  swipeEndedAt = Date.now(); // the lift-off isn't a tap on the card
  row.classList.remove('dragging');
  if (drop && col) {
    // Start the card from where it was let go, so it glides from the finger into its new column.
    const g = ghost.getBoundingClientRect();
    const r = row.getBoundingClientRect();
    row.style.transform = `translate(${g.left - r.left}px, ${g.top - r.top}px)`;
    ghost.remove();
    dropTask(row.dataset.task, col);
    if (row.isConnected) row.style.transform = '';
  } else {
    // Held and let go without moving: the long-press menu (it also stands in for Android's own, which the hold swallows).
    if (drop && !moved) openTaskMenu(row.dataset.task, x, y);
    ghost.animate([{ opacity: 1 }, { opacity: 0, transform: 'none' }], { duration: 180, easing: 'ease-out' }).finished.then(() => ghost.remove());
  }
}
document.addEventListener('touchend', () => endHold(true));
document.addEventListener('touchcancel', () => endHold());
document.addEventListener('contextmenu', (e) => { if (hold) { e.preventDefault(); e.stopPropagation(); } }, true);

// Drag a board column by its heading (mouse). Neighbours slide aside as it passes their middle;
// letting go saves the new order.
// Drag a board column by its heading (mouse). Nothing reflows while you drag: a tag with the
// column's name follows the pointer and a line shows where it'll land; letting go moves it there.
let colDrag = null;
document.addEventListener('pointerdown', (e) => {
  if (e.button !== 0 || e.pointerType !== 'mouse') return;
  const head = e.target.closest('.board .group-head[data-move]');
  if (!head || e.target.closest('button')) return;
  colDrag = { head, col: head.closest('.column'), board: head.closest('.board'), x: e.clientX, y: e.clientY, cx: e.clientX, cy: e.clientY, on: false };
});
document.addEventListener('pointermove', (e) => {
  const d = colDrag;
  if (!d) return;
  d.cx = e.clientX;
  d.cy = e.clientY;
  if (!d.on) {
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 6) return;
    liftColumn(d);
  }
  e.preventDefault();
  // Beside the pointer, flipping to its left near the right edge.
  const tx = e.clientX + 14 + d.tag.offsetWidth > innerWidth - 8 ? e.clientX - 14 - d.tag.offsetWidth : e.clientX + 14;
  d.tag.style.transform = `translate(${tx}px, ${e.clientY + 10}px)`;
  aimColumn(d);
});
function liftColumn(d) {
  d.on = true;
  closeTaskMenu();
  d.col.classList.add('col-source');
  document.body.classList.add('col-sorting');
  d.tag = document.createElement('div');
  d.tag.className = 'col-tag';
  d.tag.innerHTML = `${ic('board')}<span>${esc(d.head.firstChild.textContent.trim())}</span>`;
  d.marker = document.createElement('div');
  d.marker.className = 'col-marker';
  document.body.append(d.tag, d.marker);
  // Keep scrolling while the pointer rests near the top or bottom edge.
  const view = $('#view');
  const step = () => {
    if (colDrag !== d) return;
    const v = view.getBoundingClientRect();
    const dir = d.cy < v.top + 60 ? -1 : d.cy > v.bottom - 60 ? 1 : 0;
    if (dir) { view.scrollTop += dir * 16; aimColumn(d); }
    d.raf = requestAnimationFrame(step);
  };
  d.raf = requestAnimationFrame(step);
}
// Picks the column nearest the pointer and where the dragged one would go: on its top or bottom
// half, stacked above or below it; on its left or right edge, a lane of its own beside that lane.
function aimColumn(d) {
  let best = null;
  for (const c of $$('.column[data-col]', d.board)) {
    if (c === d.col) continue;
    const r = c.getBoundingClientRect();
    const dx = Math.max(r.left - d.cx, 0, d.cx - r.right);
    const dy = Math.max(r.top - d.cy, 0, d.cy - r.bottom);
    const dist = Math.hypot(dx, dy);
    if (!best || dist < best.dist) best = { c, r, dist };
  }
  d.plan = null;
  if (best) {
    const { c, r } = best;
    const edge = Math.min(r.width * 0.22, 70);
    let mode = d.cx < r.left + edge ? 'left' : d.cx > r.right - edge ? 'right' : d.cy > r.top + r.height / 2 ? 'below' : 'above';
    // Nothing goes before a column that can't move (No section).
    if (!c.querySelector('.group-head[data-move]')) mode = { above: 'below', left: 'right' }[mode] || mode;
    d.plan = planDrop(d, c.dataset.col, mode);
    if (d.plan) {
      const m = d.marker.style;
      const lr = c.parentElement.getBoundingClientRect();
      if (mode === 'above' || mode === 'below') {
        Object.assign(m, { left: `${r.left}px`, top: `${(mode === 'below' ? r.bottom + 7 : r.top - 7) - 2}px`, width: `${r.width}px`, height: '4px' });
      } else {
        const top = Math.max(lr.top, 0);
        Object.assign(m, { left: `${(mode === 'right' ? lr.right + 7 : lr.left - 7) - 2}px`, top: `${top}px`, width: '4px', height: `${Math.max(40, Math.min(lr.bottom, innerHeight - 16) - top)}px` });
      }
    }
  }
  d.marker.classList.toggle('on', !!d.plan);
  d.tag.classList.toggle('no-drop', !d.plan);
}

// The new column order and lane choices for dropping column d next to column `target`; null if
// nothing would change.
function planDrop(d, target, mode) {
  const x = d.col.dataset.col;
  const by = d.board.dataset.by;
  const keyOf = (c) => c.dataset.col || '+';
  const lanes = $$(':scope > .lane', d.board).map((l) => [...l.children].map(keyOf));
  const cur = state.prefs[lanesKey(by)] || {};
  const breaks = new Set(cur.breaks);
  const joins = new Set(cur.joins);
  const brk = (k) => { if (k && k !== '+') { breaks.add(k); joins.delete(k); } };
  const join = (k) => { if (k && k !== '+') { joins.add(k); breaks.delete(k); } };
  // Leaving the top of a lane: whatever was under it now starts that lane.
  const home = lanes.find((l) => l.includes(x));
  if (home[0] === x) brk(home[1]);
  const rest = lanes.map((l) => l.filter((k) => k !== x)).filter((l) => l.length);
  const lane = rest.find((l) => l.includes(target));
  const i = lane.indexOf(target);
  const seq = rest.flat();
  let at;
  if (mode === 'above') { at = seq.indexOf(target); if (i > 0) join(x); else brk(x); join(target); }
  else if (mode === 'below') { at = seq.indexOf(target) + 1; join(x); join(lane[i + 1]); }
  else if (mode === 'left') { at = seq.indexOf(lane[0]); brk(x); brk(lane[0]); }
  else { at = seq.indexOf(lane.at(-1)) + 1; brk(x); brk(rest[rest.indexOf(lane) + 1]?.[0]); }
  seq.splice(at, 0, x);
  const movable = new Set(movableKeys(d.board));
  const order = seq.filter((k) => movable.has(k));
  const same = (a, b) => a.size === b.size && [...a].every((k) => b.has(k));
  if (order.join() === movableKeys(d.board).join() && same(breaks, new Set(cur.breaks)) && same(joins, new Set(cur.joins))) return null;
  return { order, lanes: { breaks, joins } };
}

function endColDrag(e) {
  const d = colDrag;
  colDrag = null;
  if (!d?.on) return;
  cancelAnimationFrame(d.raf);
  document.body.classList.remove('col-sorting');
  d.tag.remove();
  d.marker.remove();
  d.col.classList.remove('col-source');
  if (!d.plan || e?.type !== 'pointerup') return;
  const by = d.board.dataset.by;
  const moved = d.plan.order.join() !== movableKeys(d.board).join();
  saveLanes(by, d.plan.lanes);
  flipColumns(() => (moved ? saveColumnOrder(by, d.plan.order) : renderAnimated()));
}
document.addEventListener('pointerup', endColDrag);
document.addEventListener('pointercancel', endColDrag);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && colDrag?.on) { e.stopPropagation(); endColDrag(); } }, true);

// Arrange columns: the board's movable columns as a list you drag into order (mouse or touch).
function arrangeColumns(board) {
  const by = board.dataset.by;
  const heads = $$('.group-head[data-move]', board);
  const modal = document.createElement('div');
  modal.className = 'modal ask-modal';
  modal.innerHTML = `<div class="modal-card glass ask-card arrange-card">
    <h3>Arrange columns</h3>
    <p class="muted small">Drag to reorder.</p>
    <div class="arrange-list">${heads.map((h) => `<div class="arrange-row" data-key="${esc(h.dataset.move)}">
      <span class="grip">⋮⋮</span><span class="dd-text">${esc(h.firstChild.textContent.trim())}</span></div>`).join('')}</div>
    <div class="ask-actions"><button type="button" class="btn" data-ask-cancel>Cancel</button><button type="button" class="btn primary" data-ask-ok>Save</button></div>
  </div>`;
  const list = $('.arrange-list', modal);
  const done = (save) => {
    modal.remove();
    const keys = $$('.arrange-row', list).map((r) => r.dataset.key);
    if (save && keys.join() !== heads.map((h) => h.dataset.move).join()) {
      saveLanes(by, null); // a fresh order: let the lanes balance themselves again
      flipColumns(() => saveColumnOrder(by, keys));
    }
  };
  modal.addEventListener('click', (e) => {
    if (e.target.closest('[data-ask-ok]')) done(true);
    else if (e.target.closest('[data-ask-cancel]') || e.target === modal) done(false);
  });
  modal.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Escape') done(false); });
  // Rows trade places as the dragged one passes their middle.
  let drag = null;
  list.addEventListener('pointerdown', (e) => {
    const row = e.target.closest('.arrange-row');
    if (!row) return;
    e.preventDefault();
    row.setPointerCapture(e.pointerId);
    drag = { row, y: e.clientY, top0: row.offsetTop };
    row.classList.add('lifted');
  });
  list.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const { row } = drag;
    const mid = Math.max(0, Math.min(drag.top0 + (e.clientY - drag.y), list.scrollHeight - row.offsetHeight)) + row.offsetHeight / 2;
    const others = $$('.arrange-row', list).filter((r) => r !== row);
    const before = others.find((r) => mid < r.offsetTop + r.offsetHeight / 2) || null;
    if ((row.nextElementSibling || null) !== before) {
      const was = new Map(others.map((r) => [r, r.offsetTop]));
      list.insertBefore(row, before);
      for (const r of others) {
        const dy = was.get(r) - r.offsetTop;
        if (dy) r.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 160, easing: 'ease-out' });
      }
    }
    // Kept inside the list, so it never slides out of view.
    const top = Math.max(0, Math.min(drag.top0 + (e.clientY - drag.y), list.scrollHeight - row.offsetHeight));
    row.style.transform = `translateY(${top - row.offsetTop}px)`;
  });
  const drop = () => {
    if (!drag) return;
    const { row } = drag;
    drag = null;
    const from = row.style.transform;
    row.style.transform = '';
    row.classList.remove('lifted');
    if (from) row.animate([{ transform: from }, { transform: 'none' }], { duration: 140, easing: 'ease-out' });
  };
  list.addEventListener('pointerup', drop);
  list.addEventListener('pointercancel', drop);
  document.body.appendChild(modal);
  $('[data-ask-ok]', modal).focus();
}

// On phones, hold a column's heading or a note to open its menu (there's no right-click).
let headHold = null;
document.addEventListener('touchstart', (e) => {
  const head = e.target.closest('.group-head[data-move], .group-head[data-section], .sketch[data-sketch], .thumb[data-sketch], .sblock[data-block], .nav-item[data-nav="label"]');
  if (!head || e.touches.length > 1) return;
  const t = e.touches[0];
  clearTimeout(headHold?.timer);
  headHold = { x: t.clientX, y: t.clientY, timer: setTimeout(() => {
    headHold = null;
    navigator.vibrate?.(10);
    swipeEndedAt = Date.now(); // the lift-off isn't a tap
    if (head.dataset.nav === 'label') openLabelMenu(head.dataset.id, t.clientX, t.clientY, head);
    else if (head.dataset.block) openBlockMenu(head, t.clientX, t.clientY);
    else if (head.dataset.sketch) openNoteMenu(head, t.clientX, t.clientY);
    else if (head.dataset.move) openColumnMenu(head, t.clientX, t.clientY);
    else openSectionMenu(head.dataset.section, head, t.clientX, t.clientY);
  }, 450) };
}, { passive: true });
document.addEventListener('touchmove', (e) => {
  if (headHold && Math.hypot(e.touches[0].clientX - headHold.x, e.touches[0].clientY - headHold.y) > 8) { clearTimeout(headHold.timer); headHold = null; }
}, { passive: true });
document.addEventListener('touchend', () => { if (headHold) { clearTimeout(headHold.timer); headHold = null; } });

// Phone: swipe right to pull the sidebar out (from anywhere, tasks included), swipe left to put it away.
// The sidebar follows the finger and settles open or shut depending on how far, and how fast, it went.
const NAV_EDGE = 24;
let navSwipe = null;
document.addEventListener('touchstart', (e) => {
  if (navSwipe || e.touches.length > 1 || !matchMedia('(max-width: 760px)').matches) return;
  const t = e.touches[0];
  const side = $('#sidebar');
  const open = side.classList.contains('open');
  if (open) {
    if (!e.target.closest('#sidebar, #sidebar-scrim')) return;
  } else {
    if (!e.target.closest('.main') || $('.modal:not(.hidden), #detail:not(.hidden), .ctx-menu')) return;
    const edge = t.clientX < NAV_EDGE;
    // Board cards scroll the columns sideways instead.
    if (!edge && e.target.closest('.board .task, input, textarea, select, canvas, [contenteditable]')) return;
  }
  navSwipe = { open, x: t.clientX, y: t.clientY, t: e.timeStamp, last: t.clientX, lastT: e.timeStamp, v: 0, active: false };
}, { passive: true });
document.addEventListener('touchmove', (e) => {
  const s = navSwipe;
  if (!s) return;
  const t = e.touches[0];
  const dx = t.clientX - s.x;
  const dy = t.clientY - s.y;
  if (!s.active) {
    if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { navSwipe = null; return; }
    if (Math.abs(dx) < 10) return;
    if (s.open ? dx > 0 : dx < 0) { navSwipe = null; return; }
    if (hold?.ghost || colDrag?.on || swipe?.active) { navSwipe = null; return; }
    s.active = true;
    s.w = $('#sidebar').offsetLeft + $('#sidebar').offsetWidth + 8; // offsets ignore the transform
    $('#sidebar').style.transition = 'none';
    Object.assign($('#sidebar-scrim').style, { transition: 'none', visibility: 'visible' });
    if (headHold) { clearTimeout(headHold.timer); headHold = null; }
  }
  e.preventDefault();
  if (e.timeStamp > s.lastT) { s.v = (t.clientX - s.last) / (e.timeStamp - s.lastT); s.last = t.clientX; s.lastT = e.timeStamp; }
  s.p = Math.min(1, Math.max(0, (s.open ? s.w + dx : dx) / s.w));
  $('#sidebar').style.transform = `translateX(${(s.p - 1) * s.w}px)`;
  $('#sidebar-scrim').style.opacity = s.p;
}, { passive: false });
const endNavSwipe = () => {
  const s = navSwipe;
  navSwipe = null;
  if (!s?.active) return;
  swipeEndedAt = Date.now(); // the lift-off isn't a tap
  const open = Math.abs(s.v) > 0.4 ? s.v > 0 : s.p > 0.5;
  const side = $('#sidebar');
  const scrim = $('#sidebar-scrim');
  side.style.transition = scrim.style.transition = '';
  side.getBoundingClientRect(); // start the settle from where the finger left it
  side.classList.toggle('open', open);
  side.style.transform = '';
  scrim.style.opacity = scrim.style.visibility = '';
};
// Only the list in the middle of the sidebar scrolls. iOS hands a scroll it can't take (list too short, or
// already at the top or bottom) to the page behind it, which drags the whole app around; stop it there instead.
let navScrollY = null;
let navScrollX = 0;
$('#sidebar').addEventListener('touchstart', (e) => { navScrollY = e.touches[0].clientY; navScrollX = e.touches[0].clientX; }, { passive: true });
$('#sidebar').addEventListener('touchmove', (e) => {
  if (navScrollY == null || e.touches.length > 1) return;
  const side = e.target.closest('#sidebar-scroll');
  if (!side) { e.preventDefault(); return; } // the header, timer and footer don't scroll at all
  const dy = e.touches[0].clientY - navScrollY;
  if (Math.abs(e.touches[0].clientX - navScrollX) > Math.abs(dy)) return; // a sideways swipe closes it instead
  const atTop = side.scrollTop <= 0;
  const atEnd = side.scrollTop + side.clientHeight >= side.scrollHeight - 1;
  if ((dy > 0 && atTop) || (dy < 0 && atEnd)) e.preventDefault();
}, { passive: false });
$('#sidebar-scrim').addEventListener('touchmove', (e) => { if (!navSwipe?.active) e.preventDefault(); }, { passive: false });
document.addEventListener('touchend', endNavSwipe);
document.addEventListener('touchcancel', endNavSwipe);

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
$('#add-label').addEventListener('click', () => createLabel());
$('#menu-btn').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
// Phone: tapping anywhere outside the sidebar, or picking something in it, closes it.
$('#sidebar-scrim').addEventListener('click', () => $('#sidebar').classList.remove('open'));
$('#sidebar').addEventListener('click', (e) => {
  if (e.target.closest('.nav-item, #sidebar-add, #sidebar-search')) $('#sidebar').classList.remove('open');
});
$('#timer-toggle').addEventListener('click', () => (timer.running ? pauseTimer() : startTimer()));
$('#timer-reset').addEventListener('click', resetTimer);
$('#timer-switch').addEventListener('click', switchTimer);
$('#timer-task').addEventListener('click', () => timer.taskId && taskById(timer.taskId) && openDetail(timer.taskId));
$('#disconnect-btn').addEventListener('click', async () => {
  if (!(await askConfirm('Sign out of Capri?', { body: 'Only on this device. Sign back in any time with your Todoist token.', ok: 'Sign out', icon: 'external' }))) return;
  await api('POST', '/api/disconnect');
  // Forget this account's tasks saved for offline use (see sw.js).
  try { await caches.delete('capri-data-v1'); } catch { /* no cache storage */ }
  state.tasks = [];
  showConnect();
});

document.addEventListener('keydown', (e) => {
  if (!$('#note').classList.contains('hidden')) {
    if (e.key === 'Escape') { e.preventDefault(); return closeNote(); }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); return saveNote(); }
    return;
  }
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
    const go = { d: 'dashboard', t: 'today', u: 'upcoming', f: 'focus', b: 'board', l: 'deadlines', s: 'sketches', h: 'schedule', c: 'completed', i: 'inbox' }[e.key];
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
// every 8s while Capri is on screen, every 45s in the background (so it's already current when you
// come back), and straight away when you return. Phones pause hidden web apps, so there it's the
// catch-up on return that counts.
const AUTO_SYNC_MS = 8000;
const BACKGROUND_SYNC_MS = 45000;
let autoSyncing = false;
async function autoSync(minGap) {
  if (autoSyncing || $('#app').classList.contains('hidden')) return;
  minGap ??= document.hidden ? BACKGROUND_SYNC_MS : AUTO_SYNC_MS;
  if (Date.now() - state.lastSync < minGap) return;
  // Not mid-gesture or mid-drag, and not while your own changes are still saving.
  if (swipe || hold || colDrag?.on || $('.task.dragging') || writes.pending || ddOpen || datePop || ctxMenu) return;
  const a = document.activeElement;
  if (a?.matches('input, textarea') && !$('#detail').contains(a)) return; // typing somewhere a redraw would clear
  autoSyncing = true;
  try { await sync({ quiet: true, auto: true }); } finally { autoSyncing = false; }
}
setInterval(() => autoSync(), 2000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) autoSync(1000); });
window.addEventListener('focus', () => autoSync(1000));
window.addEventListener('pageshow', () => autoSync(1000));
window.addEventListener('online', () => autoSync(0));

$$('[data-ic]').forEach((el) => { el.outerHTML = ic(el.dataset.ic); });
// Shortcut hints are written Mac-style (⌘, ⇧); everywhere else they read Ctrl and Shift.
const isMac = /mac|iphone|ipad|ipod/i.test(navigator.userAgentData?.platform || navigator.platform || navigator.userAgent);
const modText = (text) => (isMac ? text : text
  .replace(/⇧⌘(\w)/g, 'Ctrl+Shift+$1').replace(/⌘(\w)/g, 'Ctrl+$1').replace(/⌘/g, 'Ctrl').replace(/⇧/g, 'Shift'));
if (!isMac) {
  $$('kbd').forEach((el) => { el.textContent = modText(el.textContent); });
  $$('[title]').forEach((el) => { el.title = modText(el.title); });
}
renderTimer();
boot().catch((err) => { console.error(err); showConnect(); });
