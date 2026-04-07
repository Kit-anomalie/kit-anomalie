import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useProfileStore } from './stores/profileStore'
import { Layout } from './components/Layout'
import { ProfileSetup } from './pages/ProfileSetup'
import { Home } from './pages/Home'
import { Placeholder } from './pages/Placeholder'

function AppRoutes() {
  const { isConfigured } = useProfileStore()

  // Si le profil n'est pas configuré, on redirige vers le setup
  if (!isConfigured) {
    return (
      <Routes>
        <Route path="/setup" element={<ProfileSetup />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/guides" element={
          <Placeholder titre="Guides" icon="📖" description="Guides pas à pas par application métier, filtrés par votre profil" brique="Brique 1" />
        } />
        <Route path="/fiches" element={
          <Placeholder titre="Fiches mémo" icon="📋" description="Fiches réflexes consultables en un tap" brique="Brique 2" />
        } />
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
        <Route path="/setup" element={<ProfileSetup />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
