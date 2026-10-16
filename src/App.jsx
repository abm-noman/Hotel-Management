import Header from './components/Header.jsx'
import CleanerView from './components/CleanerView.jsx'
import MaintenanceView from './components/MaintenanceView.jsx'
import { ROLES } from './data/model.js'
import { useApp } from './state/AppState.jsx'

export default function App() {
  const { state } = useApp()
  return (
    <>
      <Header />
      <main>
        {state.role === 'cleaner' && <CleanerView />}
        {state.role === 'maintenance' && <MaintenanceView />}
        {!['cleaner', 'maintenance'].includes(state.role) &&
          <p className="muted">{ROLES[state.role]} screen arrives in a later step.</p>}
      </main>
    </>
  )
}
