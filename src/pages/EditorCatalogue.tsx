import { useState } from 'react'
import { useCatalogueStore } from '../stores/catalogueStore'
import {
  CLASSEMENT_COLORS,
  CLASSEMENT_LABELS,
  type CategorieId,
  type Classement,
  type ClassementEntry,
  type CatalogueAnomalie,
} from '../types'

type Vue = 'categories' | 'types' | 'anomalies'

const CLASSEMENTS: Classement[] = ['S/I', 'S/DP', 'A/P', 'A/M', 'A/SURV', 'A/DET', 'VA', 'VI', 'VR']

export function EditorCatalogue() {
  const categories = useCatalogueStore(s => s.categories)
  const addCategorie = useCatalogueStore(s => s.addCategorie)
  const updateCategorie = useCatalogueStore(s => s.updateCategorie)
  const deleteCategorie = useCatalogueStore(s => s.deleteCategorie)
  const addTypeActif = useCatalogueStore(s => s.addTypeActif)
  const updateTypeActif = useCatalogueStore(s => s.updateTypeActif)
  const deleteTypeActif = useCatalogueStore(s => s.deleteTypeActif)
  const addAnomalie = useCatalogueStore(s => s.addAnomalie)
  const updateAnomalie = useCatalogueStore(s => s.updateAnomalie)
  const deleteAnomalie = useCatalogueStore(s => s.deleteAnomalie)

  const [vue, setVue] = useState<Vue>('categories')
  const [selectedCatId, setSelectedCatId] = useState<CategorieId | null>(null)
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null)

  // Formulaires
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [catForm, setCatForm] = useState<{ nom: string; description: string; icon: string; couleur: string; couleurFg: string }>({
    nom: '', description: '', icon: '📁', couleur: '#00A3E0', couleurFg: '#FFFFFF',
  })
  const [showCatForm, setShowCatForm] = useState(false)

  const [editingTypeId, setEditingTypeId] = useState<string | null>(null)
  const [typeForm, setTypeForm] = useState<{ nom: string; icon: string }>({ nom: '', icon: '' })
  const [showTypeForm, setShowTypeForm] = useState(false)

  const [editingAnoId, setEditingAnoId] = useState<string | null>(null)
  const [anoForm, setAnoForm] = useState<AnoFormState>(EMPTY_ANO_FORM)
  const [showAnoForm, setShowAnoForm] = useState(false)

  const selectedCat = selectedCatId ? categories.find(c => c.id === selectedCatId) : null
  const selectedType = selectedCat && selectedTypeId ? selectedCat.types.find(t => t.id === selectedTypeId) : null

  // ── Catégories ──

  const resetCatForm = () => {
    setCatForm({ nom: '', description: '', icon: '📁', couleur: '#00A3E0', couleurFg: '#FFFFFF' })
    setEditingCatId(null)
    setShowCatForm(false)
  }

  const startEditCat = (id: string) => {
    const c = categories.find(c => c.id === id)
    if (!c) return
    setCatForm({ nom: c.nom, description: c.description, icon: c.icon, couleur: c.couleur, couleurFg: c.couleurFg })
    setEditingCatId(id)
    setShowCatForm(true)
  }

  const saveCat = () => {
    if (!catForm.nom.trim()) return
    const data = {
      nom: catForm.nom.trim(),
      description: catForm.description.trim(),
      icon: catForm.icon.trim() || '📁',
      couleur: catForm.couleur,
      couleurFg: catForm.couleurFg,
    }
    if (editingCatId) {
      updateCategorie(editingCatId as CategorieId, data)
    } else {
      addCategorie(data)
    }
    resetCatForm()
  }

  // ── Types ──

  const resetTypeForm = () => {
    setTypeForm({ nom: '', icon: '' })
    setEditingTypeId(null)
    setShowTypeForm(false)
  }

  const startEditType = (id: string) => {
    if (!selectedCat) return
    const t = selectedCat.types.find(t => t.id === id)
    if (!t) return
    setTypeForm({ nom: t.nom, icon: t.icon ?? '' })
    setEditingTypeId(id)
    setShowTypeForm(true)
  }

  const saveType = () => {
    if (!selectedCatId || !typeForm.nom.trim()) return
    const data = { nom: typeForm.nom.trim(), icon: typeForm.icon.trim() || undefined }
    if (editingTypeId) {
      updateTypeActif(selectedCatId, editingTypeId, data)
    } else {
      addTypeActif(selectedCatId, data)
    }
    resetTypeForm()
  }

  // ── Anomalies ──

  const resetAnoForm = () => {
    setAnoForm(EMPTY_ANO_FORM)
    setEditingAnoId(null)
    setShowAnoForm(false)
  }

  const startEditAno = (id: string) => {
    if (!selectedType) return
    const a = selectedType.anomalies.find(a => a.id === id)
    if (!a) return
    setAnoForm({
      code: a.code,
      name: a.name,
      description: a.description,
      defaut: a.defaut,
      ecart: a.ecart,
      classements: a.classements.length > 0 ? a.classements : [{ classement: 'A/DET', action: '' }],
      reference: a.reference ?? '',
      illusCaption: a.illus?.caption ?? '',
    })
    setEditingAnoId(id)
    setShowAnoForm(true)
  }

  const saveAno = () => {
    if (!selectedCatId || !selectedTypeId || !anoForm.code.trim() || !anoForm.name.trim()) return
    const data: Omit<CatalogueAnomalie, 'id'> = {
      code: anoForm.code.trim(),
      name: anoForm.name.trim(),
      description: anoForm.description.trim(),
      defaut: anoForm.defaut.trim(),
      ecart: anoForm.ecart.trim(),
      classements: anoForm.classements
        .filter(e => e.action.trim())
        .map(e => ({
          classement: e.classement,
          action: e.action.trim(),
          ...(e.condition?.trim() ? { condition: e.condition.trim() } : {}),
        })),
      reference: anoForm.reference.trim() || null,
      illus: anoForm.illusCaption.trim() ? { caption: anoForm.illusCaption.trim() } : null,
    }
    if (editingAnoId) {
      updateAnomalie(selectedCatId, selectedTypeId, editingAnoId, data)
    } else {
      addAnomalie(selectedCatId, selectedTypeId, data)
    }
    resetAnoForm()
  }

  // ── Rendu ──

  return (
    <div className="space-y-4">
      {/* Breadcrumb interne */}
      <div className="flex items-center gap-1 text-[11px] text-gray-500 overflow-x-auto no-scrollbar">
        <button
          onClick={() => { setVue('categories'); setSelectedCatId(null); setSelectedTypeId(null); resetCatForm(); resetTypeForm(); resetAnoForm() }}
          className={`px-2 py-1 rounded-full ${vue === 'categories' ? 'bg-sncf-blue text-white' : 'bg-gray-100'}`}
        >
          Catégories
        </button>
        {selectedCat && (
          <>
            <span>›</span>
            <button
              onClick={() => { setVue('types'); setSelectedTypeId(null); resetTypeForm(); resetAnoForm() }}
              className={`px-2 py-1 rounded-full whitespace-nowrap ${vue === 'types' ? 'bg-sncf-blue text-white' : 'bg-gray-100'}`}
            >
              {selectedCat.nom}
            </button>
          </>
        )}
        {selectedType && (
          <>
            <span>›</span>
            <button
              onClick={() => { setVue('anomalies'); resetAnoForm() }}
              className={`px-2 py-1 rounded-full whitespace-nowrap ${vue === 'anomalies' ? 'bg-sncf-blue text-white' : 'bg-gray-100'}`}
            >
              {selectedType.nom}
            </button>
          </>
        )}
      </div>

      {/* Vue CATÉGORIES */}
      {vue === 'categories' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-sncf-dark">Catégories d'actifs</h2>
              <p className="text-xs text-gray-500 mt-1">{categories.length} catégorie{categories.length > 1 ? 's' : ''}</p>
            </div>
            {!showCatForm && (
              <button
                onClick={() => setShowCatForm(true)}
                className="text-sm bg-sncf-blue text-white px-4 py-2 rounded-xl font-medium active:scale-[0.98]"
              >
                + Ajouter
              </button>
            )}
          </div>

          {showCatForm && (
            <div className="bg-white rounded-2xl p-4 border border-sncf-blue/30 space-y-3">
              <h3 className="text-sm font-bold text-sncf-dark">{editingCatId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h3>

              <FieldText label="Nom" required value={catForm.nom} onChange={v => setCatForm(f => ({ ...f, nom: v }))} placeholder="Ex: Voie courante" />
              <FieldText label="Description" value={catForm.description} onChange={v => setCatForm(f => ({ ...f, description: v }))} placeholder="Résumé en une ligne" />
              <div className="grid grid-cols-3 gap-2">
                <FieldText label="Icône" value={catForm.icon} onChange={v => setCatForm(f => ({ ...f, icon: v }))} placeholder="🛤️" />
                <FieldColor label="Fond" value={catForm.couleur} onChange={v => setCatForm(f => ({ ...f, couleur: v }))} />
                <FieldColor label="Texte" value={catForm.couleurFg} onChange={v => setCatForm(f => ({ ...f, couleurFg: v }))} />
              </div>

              <div
                className="rounded-xl p-3"
                style={{ backgroundColor: catForm.couleur, color: catForm.couleurFg }}
              >
                <span className="text-xl" aria-hidden>{catForm.icon || '📁'}</span>
                <div className="text-sm font-semibold mt-1">{catForm.nom || 'Aperçu'}</div>
                {catForm.description && <div className="text-[11px] opacity-90">{catForm.description}</div>}
              </div>

              <FormActions onSave={saveCat} onCancel={resetCatForm} canSave={!!catForm.nom.trim()} isEditing={!!editingCatId} />
            </div>
          )}

          <div className="space-y-2">
            {categories.map(c => (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => { setSelectedCatId(c.id); setVue('types') }}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left active:bg-gray-50"
                >
                  <span className="text-lg shrink-0 w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: c.couleur, color: c.couleurFg }}>{c.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-sncf-dark">{c.nom}</div>
                    <div className="text-[11px] text-gray-500">{c.types.length} type{c.types.length > 1 ? 's' : ''} · {c.types.reduce((s, t) => s + t.anomalies.length, 0)} anomalie(s)</div>
                  </div>
                  <span className="text-gray-300">→</span>
                </button>
                <div className="flex border-t border-gray-100">
                  <button onClick={() => startEditCat(c.id)} className="flex-1 py-2 text-xs text-sncf-blue active:bg-sncf-blue/5">Modifier</button>
                  <button
                    onClick={() => {
                      if (confirm(`Supprimer « ${c.nom} » et tous ses types/anomalies ?`)) deleteCategorie(c.id)
                    }}
                    className="flex-1 py-2 text-xs text-sncf-red border-l border-gray-100 active:bg-sncf-red/5"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vue TYPES */}
      {vue === 'types' && selectedCat && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-sncf-dark">Types d'actifs</h2>
              <p className="text-xs text-gray-500 mt-1">{selectedCat.types.length} type{selectedCat.types.length > 1 ? 's' : ''}</p>
            </div>
            {!showTypeForm && (
              <button onClick={() => setShowTypeForm(true)} className="text-sm bg-sncf-blue text-white px-4 py-2 rounded-xl font-medium active:scale-[0.98]">
                + Ajouter
              </button>
            )}
          </div>

          {showTypeForm && (
            <div className="bg-white rounded-2xl p-4 border border-sncf-blue/30 space-y-3">
              <h3 className="text-sm font-bold text-sncf-dark">{editingTypeId ? 'Modifier le type' : 'Nouveau type'}</h3>
              <FieldText label="Nom" required value={typeForm.nom} onChange={v => setTypeForm(f => ({ ...f, nom: v }))} placeholder="Ex: Rail" />
              <FieldText label="Icône (optionnel)" value={typeForm.icon} onChange={v => setTypeForm(f => ({ ...f, icon: v }))} placeholder="🚉" />
              <FormActions onSave={saveType} onCancel={resetTypeForm} canSave={!!typeForm.nom.trim()} isEditing={!!editingTypeId} />
            </div>
          )}

          <div className="space-y-2">
            {selectedCat.types.map(t => (
              <div key={t.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => { setSelectedTypeId(t.id); setVue('anomalies') }}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left active:bg-gray-50"
                >
                  {t.icon && <span className="text-lg shrink-0">{t.icon}</span>}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-sncf-dark">{t.nom}</div>
                    <div className="text-[11px] text-gray-500">{t.anomalies.length} anomalie{t.anomalies.length > 1 ? 's' : ''}</div>
                  </div>
                  <span className="text-gray-300">→</span>
                </button>
                <div className="flex border-t border-gray-100">
                  <button onClick={() => startEditType(t.id)} className="flex-1 py-2 text-xs text-sncf-blue active:bg-sncf-blue/5">Modifier</button>
                  <button
                    onClick={() => {
                      if (confirm(`Supprimer « ${t.nom} » et ses anomalies ?`) && selectedCatId) deleteTypeActif(selectedCatId, t.id)
                    }}
                    className="flex-1 py-2 text-xs text-sncf-red border-l border-gray-100 active:bg-sncf-red/5"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vue ANOMALIES */}
      {vue === 'anomalies' && selectedCat && selectedType && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-sncf-dark">Anomalies</h2>
              <p className="text-xs text-gray-500 mt-1">{selectedType.anomalies.length} anomalie{selectedType.anomalies.length > 1 ? 's' : ''}</p>
            </div>
            {!showAnoForm && (
              <button onClick={() => setShowAnoForm(true)} className="text-sm bg-sncf-blue text-white px-4 py-2 rounded-xl font-medium active:scale-[0.98]">
                + Ajouter
              </button>
            )}
          </div>

          {showAnoForm && (
            <AnoFormView
              form={anoForm}
              setForm={setAnoForm}
              onSave={saveAno}
              onCancel={resetAnoForm}
              isEditing={!!editingAnoId}
            />
          )}

          <div className="space-y-2">
            {selectedType.anomalies.map(a => (
              <div key={a.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-mono text-gray-400">{a.code}</div>
                    <div className="text-sm font-semibold text-sncf-dark mt-0.5">{a.name}</div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {a.classements.map((e, i) => {
                        const c = CLASSEMENT_COLORS[e.classement]
                        return (
                          <span
                            key={i}
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: c.bg, color: c.text }}
                            title={CLASSEMENT_LABELS[e.classement]}
                          >
                            {e.classement}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => startEditAno(a.id)} className="flex-1 py-2 rounded-xl bg-sncf-blue/10 text-sncf-blue text-xs font-medium">Modifier</button>
                  <button
                    onClick={() => {
                      if (confirm(`Supprimer « ${a.name} » ?`) && selectedCatId && selectedTypeId) deleteAnomalie(selectedCatId, selectedTypeId, a.id)
                    }}
                    className="flex-1 py-2 rounded-xl bg-sncf-red/10 text-sncf-red text-xs font-medium"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sous-composants ───

interface AnoFormState {
  code: string
  name: string
  description: string
  defaut: string
  ecart: string
  classements: ClassementEntry[]
  reference: string
  illusCaption: string
}

const EMPTY_ANO_FORM: AnoFormState = {
  code: '',
  name: '',
  description: '',
  defaut: '',
  ecart: '',
  classements: [{ classement: 'A/DET', action: '' }],
  reference: '',
  illusCaption: '',
}

interface AnoFormViewProps {
  form: AnoFormState
  setForm: React.Dispatch<React.SetStateAction<AnoFormState>>
  onSave: () => void
  onCancel: () => void
  isEditing: boolean
}

function AnoFormView({ form, setForm, onSave, onCancel, isEditing }: AnoFormViewProps) {
  const updateClassement = (idx: number, patch: Partial<ClassementEntry>) => {
    setForm(f => ({
      ...f,
      classements: f.classements.map((e, i) => i === idx ? { ...e, ...patch } : e),
    }))
  }
  const addClassement = () => setForm(f => ({ ...f, classements: [...f.classements, { classement: 'A/DET', action: '' }] }))
  const removeClassement = (idx: number) => setForm(f => ({ ...f, classements: f.classements.filter((_, i) => i !== idx) }))

  return (
    <div className="bg-white rounded-2xl p-4 border border-sncf-blue/30 space-y-3">
      <h3 className="text-sm font-bold text-sncf-dark">{isEditing ? 'Modifier l\'anomalie' : 'Nouvelle anomalie'}</h3>

      <div className="grid grid-cols-[1fr_2fr] gap-2">
        <FieldText label="Code" required value={form.code} onChange={v => setForm(f => ({ ...f, code: v }))} placeholder="VC-RAIL-01" />
        <FieldText label="Nom" required value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Usure ondulatoire" />
      </div>

      <FieldTextarea label="Description" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} placeholder="Définition courte" rows={2} />
      <FieldTextarea label="Défaut (manifestation)" value={form.defaut} onChange={v => setForm(f => ({ ...f, defaut: v }))} placeholder="Ce qu'on observe sur le terrain" rows={2} />
      <FieldTextarea label="Écart / critère mesuré" value={form.ecart} onChange={v => setForm(f => ({ ...f, ecart: v }))} placeholder="Instrument et seuil" rows={2} />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-600">Classements <span className="text-sncf-red">•</span></label>
          <button onClick={addClassement} className="text-[11px] text-sncf-blue bg-sncf-blue/10 px-2 py-1 rounded-full">+ Ajouter</button>
        </div>
        {form.classements.map((entry, idx) => {
          const c = CLASSEMENT_COLORS[entry.classement]
          return (
            <div key={idx} className="border border-gray-100 rounded-xl p-2 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded shrink-0" style={{ backgroundColor: c.bg, color: c.text }}>{entry.classement}</span>
                <select
                  value={entry.classement}
                  onChange={e => updateClassement(idx, { classement: e.target.value as Classement })}
                  className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-sncf-blue"
                >
                  {CLASSEMENTS.map(cl => (
                    <option key={cl} value={cl}>{cl} — {CLASSEMENT_LABELS[cl]}</option>
                  ))}
                </select>
                {form.classements.length > 1 && (
                  <button onClick={() => removeClassement(idx)} className="text-sncf-red text-xs px-2 py-1 rounded-lg bg-sncf-red/10" aria-label="Supprimer ce classement">✕</button>
                )}
              </div>
              <input
                value={entry.condition ?? ''}
                onChange={e => updateClassement(idx, { condition: e.target.value })}
                placeholder="Condition (optionnel) — ex: « écart > seuil AR »"
                className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-sncf-blue"
              />
              <textarea
                value={entry.action}
                onChange={e => updateClassement(idx, { action: e.target.value })}
                placeholder="Action recommandée"
                rows={2}
                className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-sncf-blue resize-none"
              />
            </div>
          )
        })}
      </div>

      <FieldText label="Référence documentaire" value={form.reference} onChange={v => setForm(f => ({ ...f, reference: v }))} placeholder="Ex: IN0261 ou laisser vide" />
      <FieldText label="Légende illustration" value={form.illusCaption} onChange={v => setForm(f => ({ ...f, illusCaption: v }))} placeholder="Ex: Écart de dressage — seuils AL/AR/ALT" />

      <FormActions onSave={onSave} onCancel={onCancel} canSave={!!form.code.trim() && !!form.name.trim()} isEditing={isEditing} />
    </div>
  )
}

function FieldText({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-xs text-gray-600 mb-1 block">
        {label}{required && <span className="text-sncf-red ml-1">•</span>}
      </label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue"
      />
    </div>
  )
}

function FieldTextarea({ label, value, onChange, placeholder, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div>
      <label className="text-xs text-gray-600 mb-1 block">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sncf-blue resize-none"
      />
    </div>
  )
}

function FieldColor({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-gray-600 mb-1 block">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer"
          aria-label={`Couleur ${label}`}
        />
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 min-w-0 px-2 py-2 rounded-xl border border-gray-200 text-[11px] font-mono focus:outline-none focus:border-sncf-blue"
        />
      </div>
    </div>
  )
}

function FormActions({ onSave, onCancel, canSave, isEditing }: { onSave: () => void; onCancel: () => void; canSave: boolean; isEditing: boolean }) {
  return (
    <div className="flex gap-2 pt-2">
      <button
        onClick={onSave}
        disabled={!canSave}
        className={`flex-1 py-2.5 rounded-xl font-medium text-sm ${
          canSave ? 'bg-sncf-green text-white active:scale-[0.98]' : 'bg-gray-100 text-gray-300'
        }`}
      >
        {isEditing ? 'Enregistrer' : 'Ajouter'}
      </button>
      <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-medium text-sm">
        Annuler
      </button>
    </div>
  )
}
