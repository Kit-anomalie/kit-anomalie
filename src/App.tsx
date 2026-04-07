import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useProfileStore } from './stores/profileStore'
import { Layout } from './components/Layout'
import { Welcome } from './pages/Welcome'
import { ProfileSetup } from './pages/ProfileSetup'
import { Home } from './pages/Home'
import { Guides } from './pages/Guides'
import { GuideDetail } from './pages/GuideDetail'
import { Fiches } from './pages/Fiches'
import { FicheDetail } from './pages/FicheDetail'

function AppRoutes() {
  const { isConfigured } = useProfileStore()

  if (!isConfigured) {
    return (
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/setup" element={<ProfileSetup />} />
        <Route path="*" element={<Navigate to="/welcome" replace />} />
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
        <Route path="/setup" element={<ProfileSetup />} />
      </Route>
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
