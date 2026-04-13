import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEditorStore } from '../stores/editorStore'
import { EditorTips } from './EditorTips'
import { EditorFiches } from './EditorFiches'
import { EditorGuides } from './EditorGuides'

type Tab = 'tips' | 'fiches' | 'guides'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'tips', label: 'Conseils', icon: '💡' },
  { id: 'fiches', label: 'Fiches', icon: '📋' },
  { id: 'guides', label: 'Guides', icon: '📖' },
]

export function Editor() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('tips')
  const [importMessage, setImportMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { exportData, importData } = useEditorStore()

  const handleExport = () => {
    const data = exportData()
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kit-anomalie-contenu-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        importData(data)
        setImportMessage(`Importation réussie — ${data.tips?.length ?? 0} tips, ${data.fiches?.length ?? 0} fiches, ${data.guides?.length ?? 0} guides, ${data.liens?.length ?? 0} liens`)
        setTimeout(() => setImportMessage(''), 4000)
      } catch {
        setImportMessage('Erreur : fichier invalide')
        setTimeout(() => setImportMessage(''), 4000)
      }
    }
    reader.readAsText(file)
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
      <div className="bg-white border-b border-gray-200 px-2 flex">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
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
        >
          Importer du contenu
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
