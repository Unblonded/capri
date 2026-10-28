# Capri ♑

Steady climb, one task at a time. Named for Capricorn, the steady climber: midnight-sky glass, gold accents, and a gold check climbing out of a mountain ridge as its mark. A nicer, more advanced Todoist client on Express + Node.js that syncs with your real Todoist account.

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

### Auto-update (recommended)

Instead of `npm run serve`, double-click **`start-server.bat`** (or run `./start-server.sh` on Mac/Linux). It runs Capri and checks GitHub every minute. When there's a new commit it pulls it, installs packages, rebuilds the desktop app if its version changed, and restarts the server, so every push to `main` goes live by itself within a minute or two. The old server keeps serving while the update installs, and Capri restarts by itself if it ever crashes.

To start it when Windows starts: press Win+R, type `shell:startup`, and put a shortcut to `start-server.bat` in that folder. Set `CAPRI_UPDATE_EVERY` (seconds) to change how often it checks.

### Updating by hand

`npm run serve` restarts Capri by itself whenever its server code changes, so updating is just pulling the latest code. Either:

- **Double-click `update.bat`** (Windows) or run `./update.sh` (Mac/Linux), or
- run `npm run update` in the Capri folder.

That pulls from GitHub and installs any new packages. Page changes show up on the next refresh, and server changes restart automatically.

On a **Windows** server the update also rebuilds the desktop app whenever its version changes and hosts it at `<your server>/updates`. Installed Capri apps check there every 6 hours, download new versions in the background, and install them on the next restart (or right away from the tray → *Restart to update*). The first build downloads Electron once, so that run takes a few minutes. On Mac/Linux servers the desktop build is skipped unless you run `./update.sh --desktop`, which needs Wine.

## Windows desktop app

`desktop/` is a small Electron shell that opens your Capri server as a desktop app:

- Opens **https://capri.kalculator.lol** by default (change it from the tray icon → *Change server…*)
- Lives in the system tray; closing the window keeps it running
- Starts with Windows (hidden in the tray). Toggle from the tray menu
- **Ctrl+Shift+Space** from anywhere opens quick add
- *Pin to desktop* (tray menu, off by default): Capri sits on the desktop layer like a widget, just above your wallpaper and under your other windows, so you can add and tick off tasks right on the desktop. It leaves the taskbar while pinned and stays visible after Win+D
- *Always on top* toggle in the tray menu, and it remembers its window size and position
- Tray → *Clear cache and reload* forces the latest version of the page to load (you stay signed in)
- Updates itself from your Capri server (installer version only; the portable exe can't self-update). Tray → *Check for updates* checks now

Build it on any machine with `npm install` then:

```bash
npm run dist:win
```

This produces `dist/Capri-Setup-<version>.exe` (installer) and `dist/Capri-Portable-<version>.exe` (no install). The builds aren't code-signed, so Windows SmartScreen will warn the first time: click *More info → Run anyway*. Run `npm run desktop` to try the app locally, or `npm run icons` after changing the logo.

## Phone app (iPhone / Android)

No App Store or developer account needed. Open your Capri address (e.g. https://capri.kalculator.lol) in **Safari** → Share → **Add to Home Screen**. The Capri icon then opens Capri full screen in its own window, and stays signed in. On Android, use Chrome → menu → *Add to Home screen* / *Install app*.

Capri keeps a copy of itself and your last tasks on the device (`public/sw.js`), so it opens instantly and still shows your tasks with no signal. Updates download in the background; a *Capri has been updated · Reload* notice appears when one is ready. Signing out deletes the saved tasks.

(A Shortcuts *Open URLs* action always opens a Safari tab with the browser bars, so use the home-screen icon for full screen.)

## Mac app

`npm run dist:mac` builds native apps for Apple Silicon and Intel: `dist/Capri-<version>-mac-arm64.dmg` and `…-mac-x64.dmg` (plus zips). Same features as the Windows app: menu-bar icon, ⌘⇧Space quick add, *Open at login*, always on top, clear cache.

The apps are ad-hoc signed, not notarised (that needs a paid Apple Developer account), so the first time: drag Capri to Applications, then **right-click → Open → Open**. If macOS still says it's damaged, run `xattr -cr /Applications/Capri.app`. Mac copies don't update themselves; install the new dmg to update.

## Features

- **Views:** Dashboard, Inbox, Today (with overdue + one-click "reschedule to today"), Upcoming (14 days), Focus (all P1/P2), Board, Completed (last 7 days, with reopen), projects, labels, search
- **Projects:** list or board layout per project, sections, nested sub-projects and sub-tasks
- **Board:** every open task as columns, or one project's. Group columns by section, do date (overdue, today, the next six days, no date), priority, project or label. Dragging a card to another column changes that thing, and Add task at a column's foot starts with it. On a phone, hold a card to pick it up; sideways swipes scroll the board
- **Quick add** with natural language and live inline highlighting. Dates are detected as you type, shorthand included: `tod`, `tmr`/`tmrw`, `fri`, `wed 3pm`, `next mon`, `nov 12`, `11/2`, `in 2 weeks`, `tonight`, `at noon`. The date is pulled out of the title and set as the do date; hit × on the date chip if a word wasn't meant as a date. `every …` repeats are passed to Todoist untouched
- **Task drawer:** edit name, description, due (natural language), project/section, priority, labels, sub-tasks, comments, delete
- **On phones:** swipe a task right to complete it, left to delete it (with a few seconds to undo); no accidental zooming when tapping fields
- **Right-click a task** for a menu: complete, open, do today/tomorrow/next week, remove date, deadline, priority P1–P4, sketch, focus timer, duplicate, copy text, delete
- **Command palette** (⌘K) for tasks, projects, labels and commands
- **Dashboard:** overdue/today/week counts, completed-per-day chart, open tasks by project
- Undo on complete, mobile layout, auto-sync: changes made in Todoist or on another device show up within ~20 seconds (and right away when you come back to Capri), without pressing Sync
- **Three themes:** Light, Dark (Capricorn gold on midnight) and **Capri**, the flagship neon theme, always gently moving: glowing hot-red glitter shards that drift and glitch, slow neon light wheeling behind everything, drifting glitter, an acid-green splinter, violet offsets, HUD corner ticks, chromatic-split headings, halftone and scanlines on near-black. Click the theme button to cycle (the new theme spreads out from the button), or ⌘K → *Theme: …*

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
| `g` then `t` `u` `l` `f` `b` `d` `s` `c` `i` | Today / Upcoming / Deadlines / Focus / Board / Dashboard / Sketches / Completed / Inbox |
| `?` | Shortcut sheet |
| `Esc` | Close drawer, dialog or selection |

In the sketch pad: `p` pen, `h` highlighter, `e` eraser, `[` `]` brush size, `⌘Z` / `⇧⌘Z` undo/redo, `⌘S` save.

## Layout

- `server.js` — Express server, token storage, OAuth, Todoist API proxy
- `public/index.html`, `public/styles.css`, `public/app.js` — the UI (no build step)
