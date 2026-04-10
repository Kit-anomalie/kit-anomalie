import { useState } from 'react'
import { useEditorStore } from '../stores/editorStore'
import { APPLIS_METIER } from '../data/roles'
import type { Role, Specialite, GuideStep } from '../types'
import { ROLE_LABELS, SPECIALITE_LABELS } from '../types'

const ALL_ROLES: Role[] = ['agent_req', 'ordonnanceur', 'rp']
const ALL_SPECIALITES: Specialite[] = ['voie', 'seg', 'eale', 'cat', 'sm']

interface StepForm {
  titre: string
  action: string
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
  etapes: StepForm[]
}

const EMPTY_STEP: StepForm = { titre: '', action: '', champsARemplir: '', erreursFrequentes: '' }

const EMPTY_FORM: GuideForm = {
  titre: '',
  appliMetier: '',
  gesteMetier: '',
  roles: [],
  specialites: [],
  referentiel: '',
  etapes: [{ ...EMPTY_STEP }],
}

export function EditorGuides() {
  const { guides, addGuide, updateGuide, deleteGuide } = useEditorStore()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<GuideForm>(EMPTY_FORM)

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
      etapes: guide.etapes.map(e => ({
        titre: e.titre,
        action: e.action,
        champsARemplir: e.champsARemplir?.join('\n') ?? '',
        erreursFrequentes: e.erreursFrequentes?.join('\n') ?? '',
      })),
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
      etapes,
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-sncf-dark">Guides pas a pas</h2>
          <p className="text-xs text-gray-500 mt-1">{guides.length} guide{guides.length > 1 ? 's' : ''} personnalise{guides.length > 1 ? 's' : ''}</p>
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

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-2xl p-4 border border-sncf-blue/30 space-y-3">
          <h3 className="text-sm font-bold text-sncf-dark">{editingId ? 'Modifier le guide' : 'Nouveau guide'}</h3>

          <input
            value={form.titre}
            onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
            placeholder="Titre du guide (ex: Creer une anomalie dans EF3C0)"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue"
          />

          <select
            value={form.appliMetier}
            onChange={e => setForm(f => ({ ...f, appliMetier: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue bg-white"
          >
            <option value="">-- Application metier --</option>
            {APPLIS_METIER.map(app => (
              <option key={app.id} value={app.id}>{app.nom}</option>
            ))}
          </select>

          <input
            value={form.gesteMetier}
            onChange={e => setForm(f => ({ ...f, gesteMetier: e.target.value }))}
            placeholder="Geste metier (ex: Creer une anomalie)"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue"
          />

          <input
            value={form.referentiel}
            onChange={e => setForm(f => ({ ...f, referentiel: e.target.value }))}
            placeholder="Referentiel (ex: MT00342)"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue"
          />

          {/* Roles */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Roles concernes</p>
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

          {/* Specialites */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Specialites</p>
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
            <p className="text-xs font-bold text-sncf-dark uppercase tracking-wide">Etapes du guide</p>
            {form.etapes.map((step, i) => (
              <div key={i} className="bg-bg rounded-xl p-3 space-y-2 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sncf-blue">Etape {i + 1}</span>
                  {form.etapes.length > 1 && (
                    <button onClick={() => removeStep(i)} className="text-xs text-sncf-red">Supprimer</button>
                  )}
                </div>
                <input
                  value={step.titre}
                  onChange={e => updateStep(i, 'titre', e.target.value)}
                  placeholder="Titre de l'etape"
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
                  placeholder="Champs a remplir (un par ligne)"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue resize-none"
                />
                <textarea
                  value={step.erreursFrequentes}
                  onChange={e => updateStep(i, 'erreursFrequentes', e.target.value)}
                  placeholder="Erreurs frequentes (une par ligne)"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue resize-none"
                />
              </div>
            ))}
            <button
              onClick={addStep}
              className="w-full py-2 rounded-xl border-2 border-dashed border-gray-300 text-sm text-gray-500 font-medium"
            >
              + Ajouter une etape
            </button>
          </div>

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
        {guides.length === 0 && !showForm && (
          <p className="text-center text-gray-400 text-sm py-4">Aucun guide personnalise</p>
        )}
        {guides.map(guide => (
          <div key={guide.id} className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold text-sncf-dark text-sm">{guide.titre}</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-[11px] bg-sncf-green/10 text-sncf-green px-2 py-0.5 rounded-full font-medium">
                    {guide.etapes.length} etape{guide.etapes.length > 1 ? 's' : ''}
                  </span>
                  {guide.gesteMetier && (
                    <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{guide.gesteMetier}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => startEdit(guide.id)} className="text-xs text-sncf-blue bg-sncf-blue/10 px-2 py-1 rounded-lg">Modifier</button>
                <button onClick={() => { if (confirm('Supprimer ce guide ?')) deleteGuide(guide.id) }} className="text-xs text-sncf-red bg-sncf-red/10 px-2 py-1 rounded-lg">Suppr.</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
