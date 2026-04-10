import { useRef } from 'react'
import type { PieceJointe } from '../types'

interface PiecesJointesEditorProps {
  pieces: PieceJointe[]
  onChange: (pieces: PieceJointe[]) => void
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function compressImage(file: File, maxWidth = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ratio = Math.min(maxWidth / img.width, 1)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(file)
  })
}

export function PiecesJointesEditor({ pieces, onChange }: PiecesJointesEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const lienNomRef = useRef<HTMLInputElement>(null)
  const lienUrlRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const isImage = file.type.startsWith('image/')
    const isPdf = file.type === 'application/pdf'

    if (!isImage && !isPdf) {
      alert('Format non supporte. Utilisez une image (jpg, png) ou un PDF.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Fichier trop volumineux (max 5 Mo)')
      return
    }

    let data: string
    if (isImage) {
      data = await compressImage(file)
    } else {
      data = await fileToBase64(file)
    }

    const piece: PieceJointe = {
      id: `pj-${uid()}`,
      type: isImage ? 'image' : 'pdf',
      nom: file.name,
      data,
    }

    onChange([...pieces, piece])
    e.target.value = ''
  }

  const handleAddLien = () => {
    const nom = lienNomRef.current?.value.trim()
    const url = lienUrlRef.current?.value.trim()
    if (!nom || !url) return

    const piece: PieceJointe = {
      id: `pj-${uid()}`,
      type: 'lien',
      nom,
      url,
    }

    onChange([...pieces, piece])
    if (lienNomRef.current) lienNomRef.current.value = ''
    if (lienUrlRef.current) lienUrlRef.current.value = ''
  }

  const handleRemove = (id: string) => {
    if (confirm('Supprimer cette piece jointe ?')) {
      onChange(pieces.filter(p => p.id !== id))
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-gray-600">Pieces jointes</p>

      {/* Liste des pieces existantes */}
      {pieces.length > 0 && (
        <div className="space-y-2">
          {pieces.map(p => (
            <div key={p.id} className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
              <span className="text-sm">
                {p.type === 'image' ? '🖼️' : p.type === 'pdf' ? '📄' : '🔗'}
              </span>
              <span className="text-xs text-sncf-dark flex-1 truncate">{p.nom}</span>
              <button
                onClick={() => handleRemove(p.id)}
                className="text-xs text-sncf-red shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Boutons d'ajout */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 py-2 rounded-xl border-2 border-dashed border-gray-300 text-xs text-gray-500 font-medium active:scale-[0.98] transition-transform"
        >
          🖼️ Image / 📄 PDF
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Ajout lien */}
      <div className="flex gap-2">
        <input
          ref={lienNomRef}
          placeholder="Nom du lien"
          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-sncf-blue"
        />
        <input
          ref={lienUrlRef}
          placeholder="https://..."
          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-sncf-blue"
        />
        <button
          type="button"
          onClick={handleAddLien}
          className="px-3 py-2 rounded-xl bg-sncf-blue/10 text-sncf-blue text-xs font-medium active:scale-[0.98] transition-transform"
        >
          🔗 +
        </button>
      </div>
    </div>
  )
}

// Composant d'affichage des pieces jointes (pour FicheDetail / GuideDetail)
export function PiecesJointesView({ pieces }: { pieces: PieceJointe[] }) {
  if (!pieces || pieces.length === 0) return null

  return (
    <div className="space-y-3">
      {pieces.map(p => {
        if (p.type === 'image' && p.data) {
          return (
            <div key={p.id} className="rounded-xl overflow-hidden border border-gray-100">
              <img src={p.data} alt={p.nom} className="w-full" />
              <div className="px-3 py-1.5 bg-gray-50 text-[11px] text-gray-500">{p.nom}</div>
            </div>
          )
        }
        if (p.type === 'pdf' && p.data) {
          return (
            <a
              key={p.id}
              href={p.data}
              download={p.nom}
              className="flex items-center gap-2 bg-white rounded-xl p-3 border border-gray-100 active:scale-[0.98] transition-transform"
            >
              <span className="text-xl">📄</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-sncf-dark truncate">{p.nom}</div>
                <div className="text-[11px] text-gray-400">Telecharger le PDF</div>
              </div>
              <span className="text-sncf-blue text-sm">↓</span>
            </a>
          )
        }
        if (p.type === 'lien' && p.url) {
          return (
            <a
              key={p.id}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white rounded-xl p-3 border border-gray-100 active:scale-[0.98] transition-transform"
            >
              <span className="text-xl">🔗</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-sncf-dark truncate">{p.nom}</div>
                <div className="text-[11px] text-sncf-blue truncate">{p.url}</div>
              </div>
              <span className="text-sncf-blue text-sm">→</span>
            </a>
          )
        }
        return null
      })}
    </div>
  )
}
