import Header from './components/Header.jsx'
import CleanerView from './components/CleanerView.jsx'
import MaintenanceView from './components/MaintenanceView.jsx'
import StoreView from './components/StoreView.jsx'
import ManagerView from './components/ManagerView.jsx'
import OwnerView from './components/OwnerView.jsx'
import NextDayView from './components/NextDayView.jsx'
import { useApp } from './state/AppState.jsx'

const VIEWS = { cleaner: CleanerView, maintenance: MaintenanceView, store: StoreView, manager: ManagerView, owner: OwnerView }

export default function App() {
  const { state, dispatch } = useApp()
  const Role = VIEWS[state.role]
  return (
    <>
      <Header />
      <main>
        <div className="row tabs">
          <button className={state.page === 'main' ? 'on' : ''} onClick={() => dispatch({ type: 'SET_PAGE', page: 'main' })}>Today</button>
          <button className={state.page === 'next' ? 'on' : ''} onClick={() => dispatch({ type: 'SET_PAGE', page: 'next' })}>Next Day</button>
        </div>
        {state.page === 'next' ? <NextDayView /> : <Role />}
      </main>
    </>
  )
}
