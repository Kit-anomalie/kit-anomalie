import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

const root = document.getElementById('root')!

// Mode maintenance : vérifie avant de charger l'app
function checkMaintenance() {
  return fetch(`${import.meta.env.BASE_URL}maintenance.json?t=${Date.now()}`, { cache: 'no-store' })
    .then(r => r.json())
    .then(data => {
      if (data.enabled) {
        root.innerHTML = `
          <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#F4F6FA;padding:2rem;text-align:center;font-family:system-ui,sans-serif">
            <div style="width:80px;height:80px;background:#0C1E5B;border-radius:20px;display:flex;align-items:center;justify-content:center;margin-bottom:1.5rem">
              <span style="font-size:32px;font-weight:bold;color:#00A3E0">KA</span>
            </div>
            <h1 style="color:#0C1E5B;font-size:1.25rem;margin:0 0 0.5rem">Kit Anomalie</h1>
            <p style="color:#6B7280;font-size:0.875rem;max-width:300px;line-height:1.6">${data.message}</p>
          </div>
        `
        return true
      }
      return false
    })
    .catch(() => false)
}

// Auto-update : vérifie si une nouvelle version est disponible.
// Sur version mismatch : purge caches + unregister SW + reload → auto-healing sans action utilisateur.
async function checkForUpdate(): Promise<boolean> {
  const STORAGE_KEY = 'kit-anomalie-version'
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}version.json?t=${Date.now()}`, { cache: 'no-store' })
    const data = await res.json()
    const current = localStorage.getItem(STORAGE_KEY)
    if (current && current !== data.v) {
      localStorage.setItem(STORAGE_KEY, data.v)
      // Purge caches SW
      if ('caches' in window) {
        const keys = await caches.keys()
        await Promise.all(keys.map(k => caches.delete(k)))
      }
      // Unregister SWs pour forcer re-install au prochain load
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations()
        await Promise.all(regs.map(r => r.unregister()))
      }
      window.location.reload()
      return true // reload en cours, on ne rend pas l'app
    }
    if (!current) localStorage.setItem(STORAGE_KEY, data.v)
  } catch {
    // offline ou version.json indisponible : continue avec l'app
  }
  return false
}

// Service Worker : mode offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
      .catch(() => {})
  })
}

// Lancement : update (potentiellement reload) → maintenance → app
checkForUpdate().then(reloading => {
  if (reloading) return
  checkMaintenance().then(isDown => {
    if (!isDown) {
      createRoot(root).render(
        <StrictMode>
          <App />
        </StrictMode>,
      )
    }
  })
})
