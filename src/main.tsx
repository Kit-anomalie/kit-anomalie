import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Auto-update : vérifie si une nouvelle version est disponible
function checkForUpdate() {
  const STORAGE_KEY = 'kit-anomalie-version'
  fetch(`${import.meta.env.BASE_URL}version.json?t=${Date.now()}`, { cache: 'no-store' })
    .then(r => r.json())
    .then(data => {
      const current = localStorage.getItem(STORAGE_KEY)
      if (current && current !== data.v) {
        localStorage.setItem(STORAGE_KEY, data.v)
        window.location.reload()
      } else if (!current) {
        localStorage.setItem(STORAGE_KEY, data.v)
      }
    })
    .catch(() => {})
}

checkForUpdate()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
