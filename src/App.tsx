import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProgressContext } from './context/ProgressContext'
import { useProgress } from './hooks/useProgress'
import { Footer, Nav } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { StartPage } from './pages/StartPage'
import { TrainPage } from './pages/TrainPage'
import { ProgramPage } from './pages/ProgramPage'
import { WorkoutPage } from './pages/WorkoutPage'
import { SafetyPage } from './pages/SafetyPage'
import { GuidesPage } from './pages/GuidesPage'
import { GuideDetailPage } from './pages/GuideDetailPage'
import { FocusWorkoutPage } from './pages/FocusWorkoutPage'
import { ProfilePage } from './pages/ProfilePage'

function AppRoutes() {
  return (
    <div className="app-shell">
      <Nav />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/start" element={<StartPage />} />
          <Route path="/train" element={<TrainPage />} />
          <Route path="/program" element={<ProgramPage />} />
          <Route path="/workout/:week/:day" element={<WorkoutPage />} />
          <Route path="/guides" element={<GuidesPage />} />
          <Route path="/guides/:guideId" element={<GuideDetailPage />} />
          <Route
            path="/guides/:guideId/workout/:week/:session"
            element={<FocusWorkoutPage />}
          />
          <Route path="/safety" element={<SafetyPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  const progress = useProgress()
  return (
    <ProgressContext.Provider value={progress}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ProgressContext.Provider>
  )
}
