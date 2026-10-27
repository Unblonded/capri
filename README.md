# Capri ♑

Steady climb, one task at a time. Named for Capricorn: midnight-sky glass, gold accents, and a hand-drawn ♑ mark. A nicer, more advanced Todoist client on Express + Node.js that syncs with your real Todoist account.

## Run it

```bash
npm install
npm start          # or: npm run dev  (auto-restarts on server changes)
```

Open http://localhost:3300 and sign in:

- **API token (simplest):** Todoist → Settings → Integrations → Developer → copy the API token and paste it into the connect screen.
- **Sign in with Todoist (OAuth):** create an app at https://developer.todoist.com/appconsole.html, set the redirect URL to `http://localhost:3300/auth/callback` (or your domain's `/auth/callback`), and put `TODOIST_CLIENT_ID` / `TODOIST_CLIENT_SECRET` in `.env` (copy `.env.example`).

## How sign-in works

There are no Capri accounts or passwords: **your Todoist token is your login.**

- Each browser or desktop app keeps its own token in an `HttpOnly` cookie (marked `Secure` over HTTPS), valid for a year. *Sign out* in the sidebar clears it.
- The server never stores tokens. It reads the cookie on each request and uses it to call the Todoist API v1 on that person's behalf, so several people can share one Capri server and each only sees their own Todoist.
- Capri's own data (sketches) is stored per person under `data/users/<hash of token>/`. The folder name is a one-way SHA-256 hash, so the token can't be recovered from it. Your sketches follow your token, so if you regenerate your Todoist token you start with a fresh sketchbook.

## Hosting it on a domain (e.g. https://capri.kalculator.lol)

Run the server on the computer that stays on, and put your domain in front of it with any HTTPS reverse proxy or tunnel (Caddy, nginx, Cloudflare Tunnel…) pointing at `http://localhost:3300`.

1. `npm install && npm start`
2. Open the domain and sign in with your Todoist token.

Use HTTPS on the domain so the token cookie is always encrypted in transit. If your proxy isn't on the same machine or private network, set `TRUST_PROXY` to its address so HTTPS is detected correctly.

## Updating the server PC

One-time setup on the server PC:

```bash
git clone https://github.com/Unblonded/tasks.git capri
cd capri
npm install --omit=dev
npm run serve
```

`npm run serve` restarts Capri by itself whenever its server code changes, so updating is just pulling the latest code. Either:

- **Double-click `update.bat`** (Windows) or run `./update.sh` (Mac/Linux), or
- run `npm run update` in the Capri folder.

That pulls from GitHub and installs any new packages. Page changes show up on the next refresh, and server changes restart automatically. `--omit=dev` skips Electron, which the server doesn't need.

## Windows desktop app

`desktop/` is a small Electron shell that opens your Capri server as a desktop app:

- Opens **https://capri.kalculator.lol** by default (change it from the tray icon → *Change server…*)
- Lives in the system tray; closing the window keeps it running
- Starts with Windows (hidden in the tray). Toggle from the tray menu
- **Ctrl+Shift+Space** from anywhere opens quick add
- *Always on top* toggle in the tray menu, and it remembers its window size and position

Build it on any machine with `npm install` then:

```bash
npm run dist:win
```

This produces `dist/Capri-Setup-<version>.exe` (installer) and `dist/Capri-Portable-<version>.exe` (no install). The builds aren't code-signed, so Windows SmartScreen will warn the first time: click *More info → Run anyway*. Run `npm run desktop` to try the app locally, or `npm run icons` after changing the logo.

## Features

- **Views:** Dashboard, Inbox, Today (with overdue + one-click "reschedule to today"), Upcoming (14 days), Focus (all P1/P2), Completed (last 7 days, with reopen), projects, labels, search
- **Projects:** list or board layout per project, sections, drag cards between board columns, nested sub-projects and sub-tasks
- **Quick add** with natural language and live inline highlighting. Dates are detected as you type, shorthand included: `tod`, `tmr`/`tmrw`, `fri`, `wed 3pm`, `next mon`, `nov 12`, `11/2`, `in 2 weeks`, `tonight`, `at noon`. The date is pulled out of the title and set as the do date; hit × on the date chip if a word wasn't meant as a date. `every …` repeats are passed to Todoist untouched
- **Task drawer:** edit name, description, due (natural language), project/section, priority, labels, sub-tasks, comments, delete
- **Command palette** (⌘K) for tasks, projects, labels and commands
- **Dashboard:** overdue/today/week counts, completed-per-day chart, open tasks by project
- Undo on complete, light/dark theme, mobile layout, auto-sync when you come back to the tab

### New in this version

- **Liquid glass UI** — frosted translucent panels over a slowly drifting colour backdrop, in light and dark, with a custom line-icon set (the date badge is a little calendar showing the day)
- **Deadlines** — separate from the do date. Set one in the task drawer (date picker + quick chips), in quick add (date pill or `{friday}`), or press `D`. Deadlines are saved as a `Deadline: YYYY-MM-DD` line at the end of the task description, so they work without Todoist Pro and still show in the Todoist app. Countdown badges, a Deadlines view, a "deadline reached" group in Today, a heads-up banner, and a warning when a task is scheduled after its deadline
- **Sketches** — a drawing pad (pen, highlighter, eraser, colours, sizes, undo/redo, pressure on pen tablets). Save sketches on their own or attach them to a task; they're stored in `data/drawings/` on this machine
- **QoL** — hover actions on every task, multi-select (`X` or ⇧/⌘-click) with a bulk bar, drag tasks onto days / projects / Today, collapsible groups, a focus timer (25/5) linked to a task, today's progress ring, duplicate/copy task, date pickers + quick chips, and a `?` shortcut sheet
- Recurring tasks are protected: bulk reschedules skip them, and one-off changes ask first

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `q` / `a` | Add task |
| `⌘K` / `/` | Command palette |
| `j` / `k` or `↓` / `↑` | Move selection |
| `Enter` | Open selected task |
| `e` | Complete selected task |
| `x` | Add to multi-select |
| `1`–`4` | Set priority P1–P4 |
| `t` / `m` / `w` | Do today / tomorrow / next week |
| `d` | Set deadline |
| `s` | New sketch (attached to selected task) |
| `f` | Start focus timer on selected task |
| `#` | Delete selected task |
| `g` then `t` `u` `l` `f` `d` `s` `c` `i` | Today / Upcoming / Deadlines / Focus / Dashboard / Sketches / Completed / Inbox |
| `?` | Shortcut sheet |
| `Esc` | Close drawer, dialog or selection |

In the sketch pad: `p` pen, `h` highlighter, `e` eraser, `[` `]` brush size, `⌘Z` / `⇧⌘Z` undo/redo, `⌘S` save.

## Layout

- `server.js` — Express server, token storage, OAuth, Todoist API proxy
- `public/index.html`, `public/styles.css`, `public/app.js` — the UI (no build step)
