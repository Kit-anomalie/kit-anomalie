import { useState } from 'react'
import { useEditorStore } from '../stores/editorStore'
import { PiecesJointesEditor } from '../components/PiecesJointes'
import type { Role, Specialite, PieceJointe } from '../types'
import { ROLE_LABELS, SPECIALITE_LABELS } from '../types'

const ALL_ROLES: Role[] = ['agent_req', 'ordonnanceur', 'rp']
const ALL_SPECIALITES: Specialite[] = ['voie', 'seg', 'eale', 'cat', 'sm']

interface FicheForm {
  titre: string
  quoiFaire: string
  comment: string
  erreursAEviter: string
  gestesCles: string
  roles: Role[]
  specialites: Specialite[]
  referentiel: string
  piecesJointes: PieceJointe[]
}

const EMPTY_FORM: FicheForm = {
  titre: '',
  quoiFaire: '',
  comment: '',
  erreursAEviter: '',
  gestesCles: '',
  roles: [],
  specialites: [],
  referentiel: '',
  piecesJointes: [],
}

export function EditorFiches() {
  const { fiches, addFiche, updateFiche, deleteFiche } = useEditorStore()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FicheForm>(EMPTY_FORM)

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setShowForm(false)
    setEditingId(null)
  }

  const startEdit = (id: string) => {
    const fiche = fiches.find(f => f.id === id)
    if (!fiche) return
    setForm({
      titre: fiche.titre,
      quoiFaire: fiche.quoiFaire,
      comment: fiche.comment,
      erreursAEviter: fiche.erreursAEviter.join('\n'),
      gestesCles: fiche.gestesCles.join(', '),
      roles: fiche.roles,
      specialites: fiche.specialites,
      referentiel: fiche.referentiel ?? '',
      piecesJointes: fiche.piecesJointes ?? [],
    })
    setEditingId(id)
    setShowForm(true)
  }

  const handleSave = () => {
    if (!form.titre.trim() || !form.quoiFaire.trim()) return
    const ficheData = {
      titre: form.titre.trim(),
      quoiFaire: form.quoiFaire.trim(),
      comment: form.comment.trim(),
      erreursAEviter: form.erreursAEviter.split('\n').map(s => s.trim()).filter(Boolean),
      gestesCles: form.gestesCles.split(',').map(s => s.trim()).filter(Boolean),
      roles: form.roles,
      specialites: form.specialites,
      referentiel: form.referentiel.trim() || undefined,
      piecesJointes: form.piecesJointes.length > 0 ? form.piecesJointes : undefined,
    }

    if (editingId) {
      updateFiche(editingId, ficheData)
    } else {
      addFiche(ficheData as any)
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
          <h2 className="text-sm font-bold text-sncf-dark">Fiches mémo</h2>
          <p className="text-xs text-gray-500 mt-1">{fiches.length} fiche{fiches.length > 1 ? 's' : ''} personnalisée{fiches.length > 1 ? 's' : ''}</p>
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
          <h3 className="text-sm font-bold text-sncf-dark">{editingId ? 'Modifier la fiche' : 'Nouvelle fiche'}</h3>

          <div>
            <label className="text-xs text-gray-600 mb-1 block">Titre <span className="text-sncf-red">•</span></label>
            <input
              value={form.titre}
              onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
              placeholder="Ex: Classer une anomalie"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600 mb-1 block">Quoi faire <span className="text-sncf-red">•</span></label>
            <textarea
              value={form.quoiFaire}
              onChange={e => setForm(f => ({ ...f, quoiFaire: e.target.value }))}
              placeholder="Objectif de la fiche"
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600 mb-1 block">Comment</label>
            <textarea
              value={form.comment}
              onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
              placeholder="Étapes détaillées"
              rows={5}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600 mb-1 block">Erreurs à éviter</label>
            <textarea
              value={form.erreursAEviter}
              onChange={e => setForm(f => ({ ...f, erreursAEviter: e.target.value }))}
              placeholder="Une par ligne"
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600 mb-1 block">Mots-clés</label>
            <input
              value={form.gestesCles}
              onChange={e => setForm(f => ({ ...f, gestesCles: e.target.value }))}
              placeholder="Séparés par des virgules"
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

          {/* Pièces jointes */}
          <PiecesJointesEditor
            pieces={form.piecesJointes}
            onChange={(pj) => setForm(f => ({ ...f, piecesJointes: pj }))}
          />

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={!form.titre.trim() || !form.quoiFaire.trim()}
              className={`flex-1 py-2.5 rounded-xl font-medium text-sm ${
                form.titre.trim() && form.quoiFaire.trim()
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

      {/* Liste des fiches */}
      <div className="space-y-2">
        {fiches.length === 0 && !showForm && (
          <p className="text-center text-gray-400 text-sm py-4">Aucune fiche personnalisée</p>
        )}
        {fiches.map(fiche => (
          <div key={fiche.id} className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold text-sncf-dark text-sm">{fiche.titre}</div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{fiche.quoiFaire}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {fiche.gestesCles.slice(0, 3).map(g => (
                    <span key={g} className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{g}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => startEdit(fiche.id)} className="text-xs text-sncf-blue bg-sncf-blue/10 px-2 py-1 rounded-lg">Modifier</button>
                <button onClick={() => { if (confirm('Supprimer cette fiche ?')) deleteFiche(fiche.id) }} className="text-xs text-sncf-red bg-sncf-red/10 px-2 py-1 rounded-lg">Suppr.</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
