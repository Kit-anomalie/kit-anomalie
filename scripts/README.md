# Scripts

## `record-demo.mjs` — Capture vidéo de la démo

Capture la démo auto-play (route `/demo` en mode `auto`) en vidéo via Playwright.

### Pré-requis

- Une fois : `npx playwright install chromium` (installé automatiquement avec `playwright`)
- Avant chaque capture : `npm run build` (la capture utilise le build de production)
- Optionnel pour le MP4 : `brew install ffmpeg`

### Usage

```bash
npm run build
npm run record:demo
```

### Paramètres

Tout est en haut du script (`scripts/record-demo.mjs`) :

- `PORT = 4173` — port du serveur de prévisualisation
- `VIEWPORT = { width: 1920, height: 1080 }` — résolution (1080p par défaut)
- `DEMO_DURATION_MS = 90_000` — durée de la timeline (90s)
- `BUFFER_MS = 3_000` — marge avant fermeture pour laisser les dernières frames

### Sorties

| Fichier | Quand |
|---|---|
| `dist/recording/demo-recording.webm` | Toujours (~6 Mo en 1080p, codec VP9) |
| `dist/recording/demo-recording.mp4` | Si `ffmpeg` est dans le PATH (H.264, plus universel) |

### Audio

V1 : **silent**. Playwright ne capture pas l'audio nativement. Les MP3 actuels du
kit sont des placeholders silencieux de toute façon. Pour la version finale,
ajouter la bande son en post-prod (CapCut / DaVinci Resolve / iMovie).

### Limitations / hors scope V1

- Capture uniquement le mode auto-play (le mode explorer est interactif, pas
  vidéo).
- Pas de détection automatique des erreurs runtime — vérifier visuellement
  le résultat.
- 4K possible en éditant `VIEWPORT` mais le fichier sera ~4× plus lourd.
