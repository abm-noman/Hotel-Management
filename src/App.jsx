import Header from './components/Header.jsx'
import Notes from './components/Notes.jsx'
import CleanersView from './views/CleanersView.jsx'
import StoreView from './views/StoreView.jsx'
import ManagerView from './views/ManagerView.jsx'
import MaintenanceView from './views/MaintenanceView.jsx'
import IssuesView from './views/IssuesView.jsx'
import NextDayView from './views/NextDayView.jsx'
import { useApp } from './state/AppState.jsx'

const VIEWS = { cleaners: CleanersView, store: StoreView, manager: ManagerView, maintenance: MaintenanceView, issues: IssuesView, next: NextDayView }

export default function App() {
  const { state, saveFailed } = useApp()
  const View = VIEWS[state.tab]
  return (
    <>
      <Header />
      <main className="page">
        {saveFailed && <p className="chip c-red">⚠ Could not save — browser storage is full or blocked.</p>}
        <View />
      </main>
      {state.panel?.type === 'notes' && <Notes />}
    </>
  )
}
