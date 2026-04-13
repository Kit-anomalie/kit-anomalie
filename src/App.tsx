import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useProfileStore } from './stores/profileStore'
import './stores/themeStore'
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
import { Réglages } from './pages/Reglages'
import { Admin } from './pages/Admin'

function AppRoutes() {
  const { isConfigured } = useProfileStore()

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
        <Route path="/quiz" element={
          <Placeholder titre="Quiz" icon="🧠" description="Testez vos connaissances sur les anomalies" brique="Brique 3" />
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
        <Route path="/reglages" element={<Réglages />} />
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
