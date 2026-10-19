# Nordstay Ops — UI rewrite (step 9)

    npm install
    npm run dev

Tabs (src/views): Cleaners · Store Manager · Company Manager · Maintenance · Issues · Next Day
- state: src/state/AppState.jsx (one reducer; saved to localStorage, VERSION 3 in storage.js)
- look:  src/styles/tokens.css (light/dark colours), base.css, font Patrick Hand
- shared UI: src/components/ui.jsx (Avatar, Chip, Drawer, Seg, ...)

Flows: cleaner reports/can't-enter -> Issues -> manager sends to Maintenance / Store / Cleaner;
finishing a job feeds Next Day approval; publishing delivers "bring from store" to the next cleaner,
who must confirm it before opening the day. Stock "not available" -> purchase item on Next Day.
Data is demo data; "Reset" in the header restores it.
