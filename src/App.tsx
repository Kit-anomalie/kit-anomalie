import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useProfileStore } from './stores/profileStore'
import { useMaintenanceStore } from './stores/maintenanceStore'
import './stores/themeStore' // initialise le theme au chargement
import { Layout } from './components/Layout'
import { ProfileSetup } from './pages/ProfileSetup'
import { Home } from './pages/Home'
import { Guides } from './pages/Guides'
import { GuideDetail } from './pages/GuideDetail'
import { Fiches } from './pages/Fiches'
import { FicheDetail } from './pages/FicheDetail'
import { Placeholder } from './pages/Placeholder'
import { PlanTravail } from './pages/PlanTravail'
import { Editor } from './pages/Editor'
import { Reglages } from './pages/Reglages'
import { Admin } from './pages/Admin'

function MaintenanceScreen({ message, onAdmin }: { message: string; onAdmin: () => void }) {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 bg-sncf-dark rounded-3xl flex items-center justify-center mb-6">
        <span className="text-3xl font-bold text-sncf-blue">KA</span>
      </div>
      <h1 className="text-xl font-bold text-sncf-dark">Kit Anomalie</h1>
      <p className="text-sm text-gray-500 mt-3 max-w-[300px] leading-relaxed">{message}</p>
      <div className="mt-8 text-xs text-gray-300">
        <button onClick={onAdmin} className="text-gray-300">⚙</button>
      </div>
    </div>
  )
}

function AppRoutes() {
  const navigate = useNavigate()
  const { isConfigured } = useProfileStore()
  const { partielEnabled, partielMessage } = useMaintenanceStore()

  if (partielEnabled) {
    return (
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<MaintenanceScreen message={partielMessage} onAdmin={() => navigate('/admin')} />} />
      </Routes>
    )
  }

  if (!isConfigured) {
    return (
      <Routes>
        <Route path="/plan" element={<PlanTravail />} />
        <Route path="/setup" element={<ProfileSetup />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/guides/:id" element={<GuideDetail />} />
        <Route path="/fiches" element={<Fiches />} />
        <Route path="/fiches/:id" element={<FicheDetail />} />
        <Route path="/onboarding" element={
          <Placeholder titre="Onboarding" icon="🎓" description="Parcours de formation progressif adapté à votre profil" brique="Brique 3" />
        } />
        <Route path="/actifs" element={
          <Placeholder titre="Anomalies par actif" icon="🔍" description="Recherchez un actif et consultez ses anomalies" brique="Brique 4" />
        } />
        <Route path="/assistant" element={
          <Placeholder titre="Assistant IA" icon="🤖" description="Aide à la rédaction et au classement de vos anomalies" brique="Brique 5" />
        } />
        <Route path="/alertes" element={
          <Placeholder titre="Alertes" icon="🔔" description="Informations, alertes et bonnes pratiques" brique="Brique 6" />
        } />
        <Route path="/reglages" element={<Reglages />} />
        <Route path="/setup" element={<ProfileSetup />} />
      </Route>
      <Route path="/plan" element={<PlanTravail />} />
      <Route path="/editeur" element={<Editor />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/kit-anomalie">
      <AppRoutes />
    </BrowserRouter>
  )
}
