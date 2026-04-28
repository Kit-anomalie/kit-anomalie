import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEditorStore } from '../stores/editorStore'
import { useCatalogueStore } from '../stores/catalogueStore'
import { EditorTips } from './EditorTips'
import { EditorFiches } from './EditorFiches'
import { EditorGuides } from './EditorGuides'
import { EditorCatalogue } from './EditorCatalogue'
import { EditorQuiz } from './EditorQuiz'
import { EditorGlossaire } from './EditorGlossaire'

type Tab = 'tips' | 'fiches' | 'guides' | 'catalogue' | 'quiz' | 'glossaire'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'tips', label: 'Conseils', icon: '💡' },
  { id: 'fiches', label: 'Fiches', icon: '📋' },
  { id: 'guides', label: 'Guides', icon: '📖' },
  { id: 'catalogue', label: 'Catalogue', icon: '📚' },
  { id: 'quiz', label: 'Quiz', icon: '🧠' },
  { id: 'glossaire', label: 'Glossaire', icon: '🔤' },
]

export function Editor() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('tips')
  const [importMessage, setImportMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { exportData, importData } = useEditorStore()
  const exportCatalogue = useCatalogueStore(s => s.exportCatalogue)
  const importCatalogue = useCatalogueStore(s => s.importCatalogue)

  const handleExport = () => {
    const isCatalogue = activeTab === 'catalogue'
    const data = isCatalogue ? exportCatalogue() : exportData()
    const json = JSON.stringify(data, null, 2)
    // BOM UTF-8 pour forcer l'encodage sur tous les navigateurs
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF])
    const blob = new Blob([bom, json], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = isCatalogue
      ? `kit-anomalie-catalogue-${new Date().toISOString().slice(0, 10)}.json`
      : `kit-anomalie-contenu-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const isCatalogue = activeTab === 'catalogue'
    const reader = new FileReader()
    reader.readAsText(file, 'UTF-8')
    reader.onload = () => {
      try {
        // Retirer le BOM UTF-8 si présent
        let text = reader.result as string
        if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1)
        const data = JSON.parse(text)
        if (isCatalogue) {
          if (!data.categories || !Array.isArray(data.categories)) throw new Error('format invalide')
          importCatalogue(data)
          const nbTypes = data.categories.reduce((s: number, c: { types?: unknown[] }) => s + (c.types?.length ?? 0), 0)
          const nbAnos = data.categories.reduce((s: number, c: { types?: { anomalies?: unknown[] }[] }) => s + (c.types ?? []).reduce((x: number, t) => x + (t.anomalies?.length ?? 0), 0), 0)
          setImportMessage(`Catalogue importé — ${data.categories.length} catégories, ${nbTypes} types, ${nbAnos} anomalies`)
        } else {
          const report = importData(data)
          const added = report.addedTips + report.addedFiches + report.addedGuides + report.addedQuizQuestions + report.addedCustomThemes + report.addedCustomQuizzes
          const skipped = report.skippedTips + report.skippedFiches + report.skippedGuides + report.skippedQuizQuestions + report.skippedCustomThemes + report.skippedCustomQuizzes
          const msg = added === 0 && skipped > 0
            ? `Aucun nouvel item — ${skipped} doublon${skipped > 1 ? 's' : ''} ignoré${skipped > 1 ? 's' : ''} (titres déjà présents)`
            : `Fusion réussie — ajoutés : ${report.addedTips} tips, ${report.addedFiches} fiches, ${report.addedGuides} guides, ${report.addedQuizQuestions} questions, ${report.addedCustomThemes} thèmes, ${report.addedCustomQuizzes} quizzes${skipped > 0 ? ` · ${skipped} doublon${skipped > 1 ? 's' : ''} ignoré${skipped > 1 ? 's' : ''}` : ''}`
          setImportMessage(msg)
        }
        setTimeout(() => setImportMessage(''), 4000)
      } catch {
        setImportMessage('Erreur : fichier invalide')
        setTimeout(() => setImportMessage(''), 4000)
      }
    }
    e.target.value = ''
  }

  return (
    <div className="min-h-full bg-bg flex flex-col">
      {/* Header */}
      <header className="bg-sncf-dark text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-sncf-blue text-sm">← Retour</button>
          <span className="text-lg font-bold">Mode Éditeur</span>
        </div>
      </header>

      {/* Onglets */}
      <div className="bg-white border-b border-gray-200 px-2 flex overflow-x-auto no-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-sncf-blue text-sncf-blue'
                : 'border-transparent text-gray-500'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <main className="flex-1 overflow-y-auto p-4">
        {activeTab === 'tips' && <EditorTips />}
        {activeTab === 'fiches' && <EditorFiches />}
        {activeTab === 'guides' && <EditorGuides />}
        {activeTab === 'catalogue' && <EditorCatalogue />}
        {activeTab === 'quiz' && <EditorQuiz />}
        {activeTab === 'glossaire' && <EditorGlossaire />}
      </main>

      {/* Message d'import */}
      {importMessage && (
        <div className={`fixed top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-medium shadow-lg z-50 ${
          importMessage.startsWith('Erreur') ? 'bg-sncf-red text-white' : 'bg-sncf-green text-white'
        }`}>
          {importMessage}
        </div>
      )}

      {/* Barre export/import */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex gap-3">
        <button
          onClick={handleExport}
          className="flex-1 py-3 rounded-2xl bg-sncf-blue text-white font-medium text-sm active:scale-[0.98] transition-transform"
        >
          Exporter le contenu
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 py-3 rounded-2xl bg-sncf-blue/10 text-sncf-blue font-medium text-sm active:scale-[0.98] transition-transform"
          title="Fusionne avec l'existant — les doublons (mêmes titres) sont ignorés"
        >
          {activeTab === 'catalogue' ? 'Importer (remplace)' : 'Fusionner un contenu'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>
    </div>
  )
}
