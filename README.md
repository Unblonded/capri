# Capri

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

- Signing in checks the token with Todoist and starts a session. Each browser or desktop app gets a random session id in an `HttpOnly` cookie (marked `Secure` over HTTPS); the token itself stays on the server, encrypted (AES-256-GCM) in `data/sessions.json` with a key from `CAPRI_SECRET` or, if that's unset, `data/secret.key` (made on first run). Keep `data/` private and backed up together: without the key, everyone signs in again.
- *Sign out* in the sidebar ends that device's session on the server, so a copied cookie stops working too. *Every device* ends all of your sessions at once. A session unused for 180 days ends on its own. Devices signed in before sessions existed are moved over automatically on their next visit.
- Only tokens Todoist accepts get a session, so nobody can store data on your server with a made-up token. The server uses each session's token to call the Todoist API v1 on that person's behalf, so several people can share one Capri server and each only sees their own Todoist.
- Capri's own data (notes and sketches, your schedule, deadlines, the order of board columns) is stored per person under `data/users/<hash of token>/`. The folder name is a one-way SHA-256 hash, so the token can't be recovered from it. That data follows your token. If your token stops working (you regenerated it, or it expired), Capri says so and asks for the new one; entering it on a device that used the old one brings your notes, schedule and settings across, as long as both tokens belong to the same Todoist account.

## Hosting it on a domain (e.g. https://capri.kalculator.lol)

Run the server on the computer that stays on, and put your domain in front of it with any HTTPS reverse proxy or tunnel (Caddy, nginx, Cloudflare Tunnel…) pointing at `http://localhost:3300`.

1. `npm install && npm start`
2. Open the domain and sign in with your Todoist token.

Use HTTPS on the domain so the session cookie is always encrypted in transit. If your proxy isn't on the same machine or private network, set `TRUST_PROXY` to its address so HTTPS is detected correctly.

If you only reach Capri through the domain (the tunnel or proxy runs on the same computer), set `HOST=127.0.0.1` in `.env`. Then nothing else on your network can talk to it over plain http. Leave it at `0.0.0.0` if a desktop app or phone connects to it directly by IP address.

Every page is sent with browser protections: a content security policy (only Capri's own scripts run), no framing by other sites, no MIME sniffing, and HSTS over HTTPS.

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
- Lives in the system tray; closing the window keeps it running. Windows decides which tray icons show on the taskbar: tray → *Show icon on the taskbar…* opens the setting (turn Capri on under *Other system tray icons*), and Capri keeps a fixed tray icon ID so the choice survives updates
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

`npm run dist:mac` builds native apps for Apple Silicon and Intel: `dist/Capri-<version>-mac-arm64.dmg` and `…-mac-x64.dmg`. Same features as the Windows app: menu-bar icon, ⌘⇧Space quick add, *Open at login*, always on top, clear cache.

The apps are ad-hoc signed, not notarised (that needs a paid Apple Developer account), so the first time: drag Capri to Applications, then **right-click → Open → Open**. If macOS still says it's damaged, run `xattr -cr /Applications/Capri.app`. Mac copies don't update themselves; install the new dmg to update.

## Features

- **Views:** Dashboard, Inbox, Today (with overdue + one-click "reschedule to today"), Upcoming (14 days), Focus (a timer card for the task you're on, with Done and breaks, and an Up next list of what matters most: overdue, today, deadlines closing in, high priority), Board, Completed (last 7 days, with reopen), projects, labels, search
- **Projects:** list or board layout per project, sections, nested sub-projects and sub-tasks
- **Board:** every open task as columns, or one project's. Group columns by section, do date (overdue, today, the next six days, no date), priority, project or label. Dragging a card to another column changes that thing, and Add task at a column's foot starts with it. The board never scrolls sideways: when the columns don't fit across, they stack into as many lanes as fit, short columns sharing a lane, in order. On a phone, hold a card to pick it up. Drag a column by its heading to move it (sections, projects and labels): drop it on another column's top or bottom half to stack it above or below, or on its left or right edge to give it a lane of its own there. A line shows where it'll land, nothing moves until you let go, and the stacking you choose is kept. Or right-click a heading (hold it on a phone) to move it one place, open Arrange columns to drag the whole order as a list, or rename or delete a section. Section order is saved in Todoist; project and label column order is saved on Capri's server
- **Quick add** with natural language and live inline highlighting. Dates are detected as you type, shorthand included: `tod`, `tmr`/`tmrw`, `fri`, `wed 3pm`, `next mon`, `nov 12`, `11/2`, `in 2 weeks`, `tonight`, `at noon`. The date is pulled out of the title and set as the do date; hit × on the date chip if a word wasn't meant as a date. `every …` repeats are passed to Todoist untouched
- **Task drawer:** edit name, description, due (natural language), project/section, priority, labels, sub-tasks, comments, delete
- **On phones:** swipe a task left to delete it (with a few seconds to undo); hold a task to pick it up and drag it onto another section, day or board column (hold and let go for its menu); swipe right from anywhere, tasks included, to pull out the sidebar, left to put it away; pull the list down from the top and let go to sync with Todoist; no accidental zooming when tapping fields
- **Right-click a task** for a menu: complete, open, do today/tomorrow/next week, remove date, deadline, priority P1–P4, sketch, focus timer, duplicate, copy text, delete
- **Command palette** (⌘K) for tasks, projects, labels and commands
- **Dashboard:** overdue/today/week counts, completed-per-day chart, open tasks by project
- Undo on complete, mobile layout, auto-sync: changes made in Todoist or on another device show up within ~20 seconds (and right away when you come back to Capri), without pressing Sync
- **Three themes:** Light, Dark (Capricorn gold on midnight) and **Capri**, the flagship neon theme, always gently moving: glowing hot-red glitter shards that drift and glitch, slow neon light wheeling behind everything, drifting glitter, an acid-green splinter, violet offsets, HUD corner ticks, chromatic-split headings, halftone and scanlines on near-black. Click the theme button to cycle (the new theme spreads out from the button), or ⌘K → *Theme: …*

### New in this version

- **Liquid glass UI** — frosted translucent panels over a slowly drifting colour backdrop, in light and dark, with a custom line-icon set (the date badge is a little calendar showing the day)
- **Deadlines** — separate from the do date. Set one in the task drawer (date picker + quick chips), in quick add (date pill or `{friday}`), or press `D`. Capri keeps deadlines on its own server under your account, so they work without Todoist Pro (they don't show in the Todoist app). Older `Deadline: YYYY-MM-DD` lines in task descriptions are moved over automatically. Countdown badges, a Deadlines view, a "deadline reached" group in Today, a heads-up banner, and a warning when a task is scheduled after its deadline
- **Desktop widgets** — in the Windows and Mac app (0.5.7 and later; several widgets and layers from 0.6.0), small cards on your desktop: **Right now** (what's on in your schedule, how long it has left and what's next, or how long you're free), **Today's tasks**, the **Focus timer** (ticking live) or **Deadlines**. Drag one anywhere, drag its bottom-right corner to resize it, tick tasks off right on it (click again within a few seconds to undo), and right-click it for its menu. The widget button next to the bell in the sidebar opens the **widget studio**, with a live preview over a choice of wallpapers:
  - **Widgets:** add as many as you like, each with its own settings; turn each on or off; remove them.
  - **Placement:** what it shows, a title of your own, its layer (*On the desktop* behind every window, *Normal window*, or *Always on top*), its corner (widgets in the same corner stack), and its size (S to XL, or exact width × height).
  - **Ready-made styles:** Capri, Frosted, Minimal, Paper, Midnight, Neon, Sunny, Terminal, Poster.
  - **Look:** theme (match Capri, light, dark or Capri), background (glass, solid, tint, gradient or clear), opacity, blur, corner roundness, border, shadow, and colour (ten swatches or any colour).
  - **Text:** font (system, rounded, serif or mono), size, spacing, alignment, bold or coloured titles.
  - **What shows:** title bar, the time, the Open button, the count, plus per kind: progress bar, end time and up next (Right now); tick boxes, priority colours, times, project names, late tasks and order (Today); linked task (Focus); how far ahead and countdown or date (Deadlines).
  - **Copying and peeking:** copy one widget's look to all of them, and float the real widgets on top while you edit so you can watch them change. The tray / menu-bar menu has *Desktop widgets* too, with each widget's settings, *Add a widget* and *Customise widgets…*. On Mac, a widget on the desktop layer sits behind your icons, where macOS doesn't let it take clicks: use *Move or resize…*, then Done.
  - **Pinned window:** pinned to the desktop, the full Windows window also shows Right now as a slim strip above the page
- **Reminders** — tap the bell in the sidebar to turn them on for that device, choose how early (on time, 5, 10, 15 or 30 minutes) and what for: schedule blocks, tasks with a time, and deadlines (9 AM the day before and on the day). On an iPhone (with Capri added to the Home Screen) and in browsers they're pushed by the server, so they arrive even while Capri is closed. The Windows and Mac app (0.5.5 and later) shows them as native notifications while it runs in the tray or menu bar; clicking one opens Capri on that page. The server's push keys are made on first run and kept in `data/vapid.json`
- **Schedule** — make schedules that repeat ("Weekdays", "Weekend", "School days") and pick which days of the week each one runs on; a day belongs to one schedule at a time. Type blocks the way you'd write them: `go outside 3:05 - 4:03`, `5pm-8pm dinner` (one per line, or paste a whole routine; times without am/pm are read as you'd mean them). The Today tab shows a Right now card (what's on, how long it has left with a progress bar, and what's next, or how long you're free) above that day's timeline, with a line for now. Step between days, add one-off blocks just for a date, click an empty time to start a block there, click a block to edit it, right-click (or hold) to tick it off for the day or remove it. Today's view shows what's on now and how long it has left. Saved on the server under your token
- **Labels** — shown in their own colours on tasks. Make one with the + beside Labels in the sidebar, or "New label" in a task's details (which adds it to that task too). Right-click a label in the sidebar (hold it on a phone), or use Edit label on its page, to rename it, pick a colour or delete it (deleting takes it off tasks, the tasks stay). A label's page groups its tasks by project, and Add task there tags new tasks with it. Changes are saved in Todoist
- **Notes** — written notes and sketches in one place. Sketches use a drawing pad (pen, highlighter, eraser, colours, sizes, undo/redo, pressure on pen tablets); written notes are plain text. Keep them on their own or attach them to a task (they show in its details). Right-click a note (or hold it on a phone) to open, rename, jump to its task or delete it. They're stored on the server under your token
- **QoL** — hover actions on every task, multi-select (`X` or ⇧/⌘-click) with a bulk bar, drag tasks onto days / projects / Today, collapsible groups, a focus timer (25/5) linked to a task, today's progress bar (one segment per task, "3 of 7 done"), duplicate/copy task, date pickers + quick chips, and a `?` shortcut sheet
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
| `g` then `t` `u` `l` `f` `b` `d` `s` `h` `c` `i` | Today / Upcoming / Deadlines / Focus / Board / Dashboard / Notes / Schedule / Completed / Inbox |
| `?` | Shortcut sheet |
| `Esc` | Close drawer, dialog or selection |

In the sketch pad: `p` pen, `h` highlighter, `e` eraser, `[` `]` brush size, `⌘Z` / `⇧⌘Z` undo/redo, `⌘S` save.

## Layout

- `server.js` — Express server, sessions (encrypted token storage), security headers, OAuth, Todoist API proxy
- `public/index.html`, `public/styles.css`, `public/app.js` — the UI (no build step)
