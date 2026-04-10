import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../stores/profileStore'
import { useThemeStore } from '../stores/themeStore'
import { Toggle } from '../components/Toggle'
import { ROLE_LABELS, SPECIALITE_LABELS } from '../types'
import { ROLE_ICONS, SPECIALITE_ICONS } from '../data/roles'

export function Reglages() {
  const navigate = useNavigate()
  const { role, specialite, resetProfile } = useProfileStore()

  const handleModifyProfile = () => {
    resetProfile()
    navigate('/setup')
  }
  const { theme, toggleTheme } = useThemeStore()
  const [tapCount, setTapCount] = useState(0)
  const [version, setVersion] = useState('')

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}version.json?t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => setVersion(data.v))
      .catch(() => setVersion('?'))
  }, [])

  const handleVersionTap = () => {
    const next = tapCount + 1
    setTapCount(next)
    if (next >= 5) {
      setTapCount(0)
      navigate('/admin')
    }
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <button onClick={() => navigate('/')} className="text-sncf-blue text-sm flex items-center gap-1">
        ← Accueil
      </button>
      <h1 className="text-lg font-bold text-sncf-dark">Reglages</h1>

      {/* Mon profil */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Mon profil</h2>
        </div>
        {role && specialite && (
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">{ROLE_ICONS[role]}</span>
              <div>
                <div className="text-sm font-semibold text-sncf-dark">{ROLE_LABELS[role]}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <span>{SPECIALITE_ICONS[specialite]}</span>
                  {SPECIALITE_LABELS[specialite]}
                </div>
              </div>
            </div>
            <button
              onClick={handleModifyProfile}
              className="text-xs text-sncf-blue bg-sncf-blue/10 px-3 py-1.5 rounded-xl font-medium"
            >
              Modifier
            </button>
          </div>
        )}
      </div>

      {/* Apparence */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Apparence</h2>
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">{theme === 'light' ? '☀️' : '🌙'}</span>
            <span className="text-sm text-sncf-dark font-medium">{theme === 'light' ? 'Mode jour' : 'Mode nuit'}</span>
          </div>
          <Toggle enabled={theme === 'dark'} onChange={toggleTheme} color="bg-sncf-blue" />
        </div>
      </div>

      {/* Informations */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Informations</h2>
        </div>

        <div>
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm text-sncf-dark">A propos</span>
            <span className="text-xs text-gray-500 max-w-[200px] text-right">Les bons reflexes anomalie, dans la poche</span>
          </div>

          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm text-sncf-dark">Nous contacter</span>
            <span className="text-xs text-gray-400">Bientot disponible</span>
          </div>

          <button
            onClick={handleVersionTap}
            className="w-full px-4 py-3 flex items-center justify-between text-left"
          >
            <span className="text-sm text-sncf-dark">Version</span>
            <span className="text-xs text-gray-500">{version ? `v${version}` : '...'}</span>
          </button>
        </div>
      </div>

    </div>
  )
}
