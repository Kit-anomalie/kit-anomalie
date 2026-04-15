import { useState } from 'react'
import { useEditorStore } from '../stores/editorStore'
import { PiecesJointesEditor } from '../components/PiecesJointes'
import { APPLIS_METIER } from '../data/roles'
import type { Role, Specialite, GuideStep, PieceJointe } from '../types'
import { ROLE_LABELS, SPECIALITE_LABELS } from '../types'

const ALL_ROLES: Role[] = ['agent_req', 'ordonnanceur', 'rp']
const ALL_SPECIALITES: Specialite[] = ['voie', 'seg', 'eale', 'cat', 'sm']

interface StepForm {
  titre: string
  action: string
  section: string
  champsARemplir: string
  erreursFrequentes: string
}

interface GuideForm {
  titre: string
  appliMetier: string
  gesteMetier: string
  roles: Role[]
  specialites: Specialite[]
  referentiel: string
  bonnesPratiques: string
  guidesAssocies: string[]
  etapes: StepForm[]
  piecesJointes: PieceJointe[]
}

const EMPTY_STEP: StepForm = { titre: '', action: '', section: '', champsARemplir: '', erreursFrequentes: '' }

const EMPTY_FORM: GuideForm = {
  titre: '',
  appliMetier: '',
  gesteMetier: '',
  roles: [],
  specialites: [],
  referentiel: '',
  bonnesPratiques: '',
  guidesAssocies: [],
  etapes: [{ ...EMPTY_STEP }],
  piecesJointes: [],
}

export function EditorGuides() {
  const { guides, addGuide, updateGuide, deleteGuide } = useEditorStore()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<GuideForm>(EMPTY_FORM)
  const [showPaste, setShowPaste] = useState(false)
  const [pasteText, setPasteText] = useState('')

  const handlePasteImport = () => {
    if (!pasteText.trim()) return
    const lines = pasteText.trim().split('\n').filter(l => l.trim())
    let currentSection = ''
    const newSteps: StepForm[] = []
    for (const line of lines) {
      // Détection de section : "--- PRÉPARER ---" ou "== RÉALISER ==" ou "# ENVOYER"
      const sectionMatch = line.match(/^[-=#]+\s*(.+?)\s*[-=#]*$/)
      if (sectionMatch) {
        currentSection = sectionMatch[1].trim()
        continue
      }
      // Format: "1. Titre | Action" ou "1. Action"
      const cleaned = line.replace(/^\d+[\.\)\-]\s*/, '').trim()
      const parts = cleaned.split('|').map(s => s.trim())
      if (parts.length >= 2) {
        newSteps.push({ titre: parts[0], action: parts[1], section: currentSection, champsARemplir: '', erreursFrequentes: '' })
      } else {
        newSteps.push({ titre: cleaned, action: '', section: currentSection, champsARemplir: '', erreursFrequentes: '' })
      }
    }
    if (newSteps.length > 0) {
      setForm(f => ({ ...f, etapes: [...f.etapes.filter(s => s.titre || s.action), ...newSteps] }))
      setPasteText('')
      setShowPaste(false)
    }
  }

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setShowForm(false)
    setEditingId(null)
  }

  const startEdit = (id: string) => {
    const guide = guides.find(g => g.id === id)
    if (!guide) return
    setForm({
      titre: guide.titre,
      appliMetier: guide.appliMetier,
      gesteMetier: guide.gesteMetier,
      roles: guide.roles,
      specialites: guide.specialites,
      referentiel: guide.referentiel ?? '',
      bonnesPratiques: guide.bonnesPratiques?.join('\n') ?? '',
      guidesAssocies: guide.guidesAssocies ?? [],
      etapes: guide.etapes.map(e => ({
        titre: e.titre,
        action: e.action,
        section: e.section ?? '',
        champsARemplir: e.champsARemplir?.join('\n') ?? '',
        erreursFrequentes: e.erreursFrequentes?.join('\n') ?? '',
      })),
      piecesJointes: guide.piecesJointes ?? [],
    })
    setEditingId(id)
    setShowForm(true)
  }

  const updateStep = (index: number, field: keyof StepForm, value: string) => {
    setForm(f => ({
      ...f,
      etapes: f.etapes.map((step, i) => i === index ? { ...step, [field]: value } : step),
    }))
  }

  const addStep = () => {
    setForm(f => ({ ...f, etapes: [...f.etapes, { ...EMPTY_STEP }] }))
  }

  const removeStep = (index: number) => {
    if (form.etapes.length <= 1) return
    setForm(f => ({ ...f, etapes: f.etapes.filter((_, i) => i !== index) }))
  }

  const handleSave = () => {
    if (!form.titre.trim() || form.etapes.length === 0) return

    const etapes: GuideStep[] = form.etapes.map((step, i) => ({
      numero: i + 1,
      titre: step.titre.trim(),
      action: step.action.trim(),
      section: step.section.trim() || undefined,
      champsARemplir: step.champsARemplir.split('\n').map(s => s.trim()).filter(Boolean) || undefined,
      erreursFrequentes: step.erreursFrequentes.split('\n').map(s => s.trim()).filter(Boolean) || undefined,
    }))

    const guideData = {
      titre: form.titre.trim(),
      appliMetier: form.appliMetier,
      gesteMetier: form.gesteMetier.trim(),
      roles: form.roles,
      specialites: form.specialites,
      referentiel: form.referentiel.trim() || undefined,
      bonnesPratiques: form.bonnesPratiques.split('\n').map(s => s.trim()).filter(Boolean) || undefined,
      guidesAssocies: form.guidesAssocies.length > 0 ? form.guidesAssocies : undefined,
      etapes,
      piecesJointes: form.piecesJointes.length > 0 ? form.piecesJointes : undefined,
    }

    if (editingId) {
      updateGuide(editingId, guideData)
    } else {
      addGuide(guideData as any)
    }
    resetForm()
  }

  const toggleRole = (role: Role) => {
    setForm(f => ({
      ...f,
      roles: f.roles.includes(role) ? f.roles.filter(r => r !== role) : [...f.roles, role],
    }))
  }

  const toggleSpecialite = (spec: Specialite) => {
    setForm(f => ({
      ...f,
      specialites: f.specialites.includes(spec) ? f.specialites.filter(s => s !== spec) : [...f.specialites, spec],
    }))
  }

  const [filterAppli, setFilterAppli] = useState<string | null>(null)
  const applisUsed = [...new Set(guides.map(g => g.appliMetier).filter(Boolean))]
  const guidesVisible = filterAppli ? guides.filter(g => g.appliMetier === filterAppli) : guides

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-sncf-dark">Guides pas à pas</h2>
          <p className="text-xs text-gray-500 mt-1">{guidesVisible.length} guide{guidesVisible.length > 1 ? 's' : ''} sur {guides.length}</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm bg-sncf-blue text-white px-4 py-2 rounded-xl font-medium active:scale-[0.98]"
          >
            + Ajouter
          </button>
        )}
      </div>

      {/* Filtre par appli */}
      {applisUsed.length > 0 && !showForm && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setFilterAppli(null)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filterAppli === null ? 'bg-sncf-blue text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            Toutes
          </button>
          {applisUsed.map(appId => {
            const appli = APPLIS_METIER.find(a => a.id === appId)
            return (
              <button
                key={appId}
                onClick={() => setFilterAppli(filterAppli === appId ? null : appId)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filterAppli === appId ? 'bg-sncf-blue text-white' : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {appli?.nom ?? appId}
              </button>
            )
          })}
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-2xl p-4 border border-sncf-blue/30 space-y-3">
          <h3 className="text-sm font-bold text-sncf-dark">{editingId ? 'Modifier le guide' : 'Nouveau guide'}</h3>

          <div>
            <label className="text-xs text-gray-600 mb-1 block">Titre <span className="text-sncf-red">•</span></label>
            <input
              value={form.titre}
              onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
              placeholder="Ex: Créer une anomalie dans EF3C0"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600 mb-1 block">Application métier <span className="text-sncf-red">•</span></label>
            <select
              value={form.appliMetier}
              onChange={e => setForm(f => ({ ...f, appliMetier: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue bg-white"
            >
              <option value="">-- Choisir --</option>
              {APPLIS_METIER.map(app => (
                <option key={app.id} value={app.id}>{app.nom}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-600 mb-1 block">Geste métier <span className="text-sncf-red">•</span></label>
            <input
              value={form.gesteMetier}
              onChange={e => setForm(f => ({ ...f, gesteMetier: e.target.value }))}
              placeholder="Ex: Créer une anomalie"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600 mb-1 block">Référentiel</label>
            <input
              value={form.referentiel}
              onChange={e => setForm(f => ({ ...f, referentiel: e.target.value }))}
              placeholder="Ex: MT00342"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600 mb-1 block">Bonnes pratiques / À noter</label>
            <textarea
              value={form.bonnesPratiques}
              onChange={e => setForm(f => ({ ...f, bonnesPratiques: e.target.value }))}
              placeholder="Une par ligne (ex: Pensez à synchroniser avant de quitter le terrain)"
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue resize-none"
            />
          </div>

          {/* Guides associés */}
          {guides.filter(g => g.id !== editingId).length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Guides associés</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {guides.filter(g => g.id !== editingId).map(g => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setForm(f => ({
                      ...f,
                      guidesAssocies: f.guidesAssocies.includes(g.id)
                        ? f.guidesAssocies.filter(id => id !== g.id)
                        : [...f.guidesAssocies, g.id]
                    }))}
                    className={`w-full text-left text-xs px-3 py-2 rounded-xl transition-all ${
                      form.guidesAssocies.includes(g.id)
                        ? 'bg-sncf-blue/10 text-sncf-blue font-medium'
                        : 'bg-gray-50 text-gray-500'
                    }`}
                  >
                    {form.guidesAssocies.includes(g.id) ? '✓ ' : ''}{g.titre}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Roles */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Rôles concernés <span className="text-sncf-red">•</span></p>
            <div className="flex flex-wrap gap-2">
              {ALL_ROLES.map(role => (
                <button
                  key={role}
                  onClick={() => toggleRole(role)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium ${
                    form.roles.includes(role) ? 'bg-sncf-blue text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {ROLE_LABELS[role]}
                </button>
              ))}
            </div>
          </div>

          {/* Spécialités */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Spécialités <span className="text-sncf-red">•</span></p>
            <div className="flex flex-wrap gap-2">
              {ALL_SPECIALITES.map(spec => (
                <button
                  key={spec}
                  onClick={() => toggleSpecialite(spec)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium ${
                    form.specialites.includes(spec) ? 'bg-sncf-blue text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {SPECIALITE_LABELS[spec]}
                </button>
              ))}
            </div>
          </div>

          {/* Etapes */}
          <div className="space-y-3 pt-2">
            <p className="text-xs font-bold text-sncf-dark uppercase tracking-wide">Étapes du guide</p>
            {form.etapes.map((step, i) => (
              <div key={i} className="bg-bg rounded-xl p-3 space-y-2 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sncf-blue">Étape {i + 1}</span>
                  {form.etapes.length > 1 && (
                    <button onClick={() => removeStep(i)} className="text-xs text-sncf-red">Supprimer</button>
                  )}
                </div>
                <input
                  value={step.section}
                  onChange={e => updateStep(i, 'section', e.target.value)}
                  placeholder="Section (ex: Préparer, Réaliser, Envoyer)"
                  className="w-full px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-xs text-gray-500 focus:outline-none focus:border-sncf-blue"
                />
                <input
                  value={step.titre}
                  onChange={e => updateStep(i, 'titre', e.target.value)}
                  placeholder="Titre de l'étape"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue"
                />
                <textarea
                  value={step.action}
                  onChange={e => updateStep(i, 'action', e.target.value)}
                  placeholder="Description de l'action"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue resize-none"
                />
                <textarea
                  value={step.champsARemplir}
                  onChange={e => updateStep(i, 'champsARemplir', e.target.value)}
                  placeholder="Champs à remplir (un par ligne)"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue resize-none"
                />
                <textarea
                  value={step.erreursFrequentes}
                  onChange={e => updateStep(i, 'erreursFrequentes', e.target.value)}
                  placeholder="Erreurs fréquentes (une par ligne)"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue resize-none"
                />
              </div>
            ))}
            <div className="flex gap-2">
              <button
                onClick={addStep}
                className="flex-1 py-2 rounded-xl border-2 border-dashed border-gray-300 text-sm text-gray-500 font-medium"
              >
                + Ajouter une étape
              </button>
              <button
                onClick={() => setShowPaste(!showPaste)}
                className="flex-1 py-2 rounded-xl border-2 border-dashed border-sncf-blue/30 text-sm text-sncf-blue font-medium"
              >
                📋 Coller les étapes
              </button>
            </div>

            {showPaste && (
              <div className="bg-sncf-blue/5 rounded-xl p-3 space-y-2 border border-sncf-blue/20">
                <p className="text-xs text-gray-500">
                  Collez vos étapes, une par ligne. Format : <strong>Titre | Action</strong> ou juste le titre.
                </p>
                <textarea
                  value={pasteText}
                  onChange={e => setPasteText(e.target.value)}
                  placeholder={"1. Connexion | Saisissez votre mot de passe\n2. Validation | Appuyez sur VALIDER\n3. Synchronisation | Attendez la fin"}
                  rows={6}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue resize-none"
                />
                <button
                  onClick={handlePasteImport}
                  disabled={!pasteText.trim()}
                  className={`w-full py-2 rounded-xl font-medium text-sm ${
                    pasteText.trim()
                      ? 'bg-sncf-blue text-white active:scale-[0.98]'
                      : 'bg-gray-100 text-gray-300'
                  }`}
                >
                  Générer les étapes
                </button>
              </div>
            )}
          </div>

          {/* Pièces jointes */}
          <PiecesJointesEditor
            pieces={form.piecesJointes}
            onChange={(pj) => setForm(f => ({ ...f, piecesJointes: pj }))}
          />

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={!form.titre.trim() || form.etapes.length === 0}
              className={`flex-1 py-2.5 rounded-xl font-medium text-sm ${
                form.titre.trim()
                  ? 'bg-sncf-green text-white active:scale-[0.98]'
                  : 'bg-gray-100 text-gray-300'
              }`}
            >
              {editingId ? 'Enregistrer' : 'Ajouter'}
            </button>
            <button
              onClick={resetForm}
              className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-medium text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste des guides */}
      <div className="space-y-2">
        {guidesVisible.length === 0 && !showForm && (
          <p className="text-center text-gray-400 text-sm py-4">{guides.length === 0 ? 'Aucun guide personnalisé' : 'Aucun guide pour ce filtre'}</p>
        )}
        {guidesVisible.map(guide => (
          <div key={guide.id} className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold text-sncf-dark text-sm">{guide.titre}</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {guide.appliMetier && (
                    <span className="text-[11px] bg-sncf-dark/10 text-sncf-dark px-2 py-0.5 rounded-full font-medium">
                      {APPLIS_METIER.find(a => a.id === guide.appliMetier)?.nom ?? guide.appliMetier}
                    </span>
                  )}
                  <span className="text-[11px] bg-sncf-green/10 text-sncf-green px-2 py-0.5 rounded-full font-medium">
                    {guide.etapes.length} étape{guide.etapes.length > 1 ? 's' : ''}
                  </span>
                  {guide.gesteMetier && (
                    <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{guide.gesteMetier}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => startEdit(guide.id)} className="text-xs text-sncf-blue bg-sncf-blue/10 px-3 py-2 rounded-xl">Modifier</button>
                <button onClick={() => { if (confirm('Supprimer ce guide ?')) deleteGuide(guide.id) }} className="text-xs text-sncf-red bg-sncf-red/10 px-3 py-2 rounded-xl">Suppr.</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
