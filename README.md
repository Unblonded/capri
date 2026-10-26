# Todoist+

A nicer, more advanced Todoist client that runs locally on Express + Node.js and syncs with your real Todoist account.

## Run it

```bash
npm install
npm start          # or: npm run dev  (auto-restarts on server changes)
```

Open http://localhost:3000 and connect your account:

- **API token (simplest):** Todoist → Settings → Integrations → Developer → copy the API token, paste it into the connect screen. It's saved to `data/token.json` on this machine only. Or put it in `.env` as `TODOIST_TOKEN`.
- **Sign in with Todoist (OAuth):** create an app at https://developer.todoist.com/appconsole.html, set the redirect URL to `http://localhost:3000/auth/callback`, and put `TODOIST_CLIENT_ID` / `TODOIST_CLIENT_SECRET` in `.env` (copy `.env.example`).

The token never reaches the browser — the Express server proxies every call to the Todoist API v1.

## Features

- **Views:** Dashboard, Inbox, Today (with overdue + one-click "reschedule to today"), Upcoming (14 days), Focus (all P1/P2), Completed (last 7 days, with reopen), projects, labels, search
- **Projects:** list or board layout per project, sections, drag cards between board columns, nested sub-projects and sub-tasks
- **Quick add** with Todoist's natural language (`tomorrow 4pm #Work @focus p1`) and a live preview
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
