# Hotel Operations — Step 7: Local storage

    npm install
    npm run dev

Structure
- src/data/model.js       roles, statuses, priorities, property profiles
- src/state/AppState.jsx  shared state (useReducer + context)
- src/components/         Chip, SidePanel, Header, JobCard
- src/styles/tokens.css   colours and spacing (light + dark)

Pattern: short headline on the card, full detail in the side panel.

Step 2 adds: CleanerView, JobPanel (Start, optional bed count, live timer), FinishForm.
Finishing a job sets it to Pending Approval and files a maintenance task and/or
requests (bring tomorrow, dirty linen) in shared state for later steps.

Step 3 adds: Maintenance Kanban, My Work Plan (personal order, separate from official
priority), Pending with required reason + proposed date, Done with closing note, progress/final
photos, and a light/dark toggle (src/hooks/useTheme.js, tokens in src/styles/tokens.css).

Step 4 adds: Store preparation cards (Waiting for Information / To Prepare / Prepared / Collected /
Changed), guests vs beds-needed vs max-capacity shown separately, cleaner's reserve-linen answer and
"Mark collected", a Stock menu (kept out of the main view), and Store -> Maintenance equipment tasks.

Step 5 adds: ManagerView (Today / Schedule / Time Approval / Stock). Official priority and cancel
live in the task panel; add tasks; edit guests, time and a today-only instruction per job;
Publish schedule (activates scheduled requests, later edits notify only the affected employee);
Approve time. Changing guests after a package is Prepared flags it Changed for the Store Manager.

Step 6 adds: Next Day Planning (shared by every role, derived in src/state/selectors.js from requests,
pending tasks, stock risks and waiting linen), filters, detail panel; Owner/CEO overview with KPIs,
"needs attention", the owner-task-priority decision, and Owner-created tasks.

Step 7 adds: automatic saving to localStorage (src/state/storage.js, versioned), live sync between
open tabs, photos stored as shrunken data URLs (src/utils/image.js), a "Reset data" button, and a
warning chip if the browser refuses to save. Change VERSION in storage.js whenever the data shape changes.
