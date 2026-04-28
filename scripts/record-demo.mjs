#!/usr/bin/env node
// scripts/record-demo.mjs
// Capture la démo auto-play en vidéo via Playwright.
//
// Pré-requis : npm run build (pour produire dist/)
// Usage : npm run record:demo
//
// Output :
// - dist/recording/demo-recording.webm (toujours)
// - dist/recording/demo-recording.mp4  (si ffmpeg installé)

import { spawn } from 'node:child_process'
import { mkdir, readdir, rename, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const PORT = 4173 // port par défaut de vite preview
const URL = `http://localhost:${PORT}/kit-anomalie/demo`
const OUTPUT_DIR = path.join(ROOT, 'dist', 'recording')
const FINAL_WEBM = path.join(OUTPUT_DIR, 'demo-recording.webm')
const FINAL_MP4 = path.join(OUTPUT_DIR, 'demo-recording.mp4')
const VIEWPORT = { width: 1920, height: 1080 }
const DEMO_DURATION_MS = 90_000 // 1m30
const BUFFER_MS = 3_000 // marge avant fermeture

// Vérifie que le build existe
if (!existsSync(path.join(ROOT, 'dist', 'index.html'))) {
  console.error('❌ dist/index.html introuvable. Lance `npm run build` d\'abord.')
  process.exit(1)
}

console.log('🎬 Capture de la démo Kit Anomalie')
console.log(`   Viewport : ${VIEWPORT.width}×${VIEWPORT.height}`)
console.log(`   Durée    : ${DEMO_DURATION_MS / 1000}s + ${BUFFER_MS / 1000}s buffer`)
console.log('')

// Nettoie le dossier de sortie
await rm(OUTPUT_DIR, { recursive: true, force: true })
await mkdir(OUTPUT_DIR, { recursive: true })

// ============================================================
// 1. Démarre vite preview en arrière-plan
// ============================================================
console.log('▶ Démarrage du serveur de prévisualisation…')

const preview = spawn(
  'npx',
  ['vite', 'preview', '--port', String(PORT), '--strictPort'],
  { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] }
)

let previewReady = false
const previewLogs = []

preview.stdout.on('data', (data) => {
  const text = data.toString()
  previewLogs.push(text)
  if (text.includes('Local:') || text.includes(`localhost:${PORT}`)) {
    previewReady = true
  }
})
preview.stderr.on('data', (data) => previewLogs.push(data.toString()))

// Attend que le serveur soit prêt (max 15s)
const startTime = Date.now()
while (!previewReady && Date.now() - startTime < 15_000) {
  await new Promise((r) => setTimeout(r, 200))
}

if (!previewReady) {
  console.error('❌ Le serveur preview n\'a pas démarré dans le délai imparti.')
  console.error(previewLogs.join(''))
  preview.kill()
  process.exit(1)
}

console.log(`✓ Serveur prêt sur ${URL}`)

// Cleanup hook : on tue le preview même en cas d'erreur
const cleanup = () => {
  if (!preview.killed) preview.kill()
}
process.on('exit', cleanup)
process.on('SIGINT', () => { cleanup(); process.exit(130) })
process.on('SIGTERM', () => { cleanup(); process.exit(143) })

try {
  // ============================================================
  // 2. Lance Chromium avec enregistrement vidéo
  // ============================================================
  console.log('▶ Lancement du navigateur…')
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: VIEWPORT,
    recordVideo: {
      dir: OUTPUT_DIR,
      size: VIEWPORT,
    },
  })

  // Force le mode auto-play via localStorage avant le chargement de la page
  await context.addInitScript(() => {
    try {
      localStorage.setItem('kit-anomalie-demo-mode', 'auto')
    } catch {
      // localStorage indisponible — on continue
    }
  })

  const page = await context.newPage()

  console.log('▶ Navigation vers la démo…')
  await page.goto(URL, { waitUntil: 'networkidle' })

  // Attend que l'overlay « Cliquez pour démarrer » soit visible
  await page.waitForSelector('text=Cliquez pour démarrer', { timeout: 10_000 })

  console.log('▶ Démarrage de la démo (clic auto)…')
  await page.click('body')

  // ============================================================
  // 3. Attend la fin de la démo
  // ============================================================
  console.log(`▶ Enregistrement en cours (${DEMO_DURATION_MS / 1000}s)…`)
  await page.waitForTimeout(DEMO_DURATION_MS + BUFFER_MS)

  console.log('▶ Fermeture de la page…')
  await page.close()
  await context.close()
  await browser.close()

  // ============================================================
  // 4. Renomme la vidéo (Playwright donne un nom random)
  // ============================================================
  const files = await readdir(OUTPUT_DIR)
  const webm = files.find((f) => f.endsWith('.webm'))
  if (!webm) {
    throw new Error('Aucun fichier WebM produit par Playwright.')
  }
  await rename(path.join(OUTPUT_DIR, webm), FINAL_WEBM)
  console.log(`✓ WebM : ${FINAL_WEBM}`)

  // ============================================================
  // 5. Conversion ffmpeg vers MP4 (optionnelle)
  // ============================================================
  const hasFfmpeg = await new Promise((resolve) => {
    const p = spawn('which', ['ffmpeg'])
    p.on('close', (code) => resolve(code === 0))
    p.on('error', () => resolve(false))
  })

  if (hasFfmpeg) {
    console.log('▶ Conversion vers MP4 (H.264)…')
    await new Promise((resolve, reject) => {
      const args = [
        '-i', FINAL_WEBM,
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '20',
        '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart',
        '-y',
        FINAL_MP4,
      ]
      const p = spawn('ffmpeg', args, { stdio: ['ignore', 'ignore', 'pipe'] })
      p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`))))
      p.on('error', reject)
    })
    console.log(`✓ MP4  : ${FINAL_MP4}`)
  } else {
    console.log('ℹ️  ffmpeg non installé — skip conversion MP4.')
    console.log('   Pour générer aussi le MP4 : brew install ffmpeg, puis relancer.')
  }

  console.log('')
  console.log('✅ Capture terminée.')
} finally {
  cleanup()
}
