# Hotel Operations — Step 3: Maintenance + theme toggle

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
