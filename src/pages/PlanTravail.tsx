import { useState, useRef, type DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlanStore } from '../stores/planStore'
import {
  PRIORITY_CONFIG, TYPE_CONFIG,
  type Task, type TaskStatus, type TaskPriority, type TaskType
} from '../data/planTravail'

type ViewMode = 'missions' | 'kanban' | 'timeline'

// =============================================
// MAIN PAGE
// =============================================

export function PlanTravail() {
  const navigate = useNavigate()
  const { sprints, briques, team } = usePlanStore()
  const [view, setView] = useState<ViewMode>('missions')
  const [expandedSprint, setExpandedSprint] = useState<string | null>(
    sprints.find(s => s.status === 'active')?.id ?? null
  )
  const [filterAssignee, setFilterAssignee] = useState<string | null>(null)
  const [showTeamPanel, setShowTeamPanel] = useState(false)

  const allTasks = sprints.flatMap(s => s.tasks)
  const totalTasks = allTasks.length
  const doneTasks = allTasks.filter(t => t.status === 'done').length
  const inProgressTasks = allTasks.filter(t => t.status === 'in_progress').length
  const overallProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      {/* HEADER */}
      <header className="relative overflow-hidden bg-gradient-to-br from-[#0C1E5B] to-[#1a3a8f]">
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255,255,255,0.15) 30px, rgba(255,255,255,0.15) 31px),
              repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(255,255,255,0.15) 30px, rgba(255,255,255,0.15) 31px)`
          }} />
        </div>

        <div className="relative px-4 pt-5 pb-5">
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => navigate('/')} className="text-white/60 text-xs font-mono tracking-wider hover:text-white/90 transition-colors">
              ← RETOUR KIT
            </button>
            <button onClick={() => setShowTeamPanel(p => !p)} className="text-white/60 text-xs font-mono tracking-wider hover:text-white/90 transition-colors">
              ⚙ Équipe
            </button>
          </div>

          <div className="text-center mb-5">
            <div className="text-white/40 text-[10px] font-mono tracking-[0.3em] mb-1">OPÉRATION</div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-1">KIT ANOMALIE</h1>
            <div className="text-white/50 text-xs font-mono tracking-wider">
              PLAN DE MISSION — {briques.length} BRIQUES — {sprints.length} SPRINTS
            </div>
          </div>

          {/* Progress */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-mono text-white/60 tracking-widest">AVANCEMENT GLOBAL</div>
              <div className="text-2xl font-black text-white">{overallProgress}%</div>
            </div>
            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-gradient-to-r from-[#00A3E0] to-[#3AAA35] rounded-full transition-all duration-1000" style={{ width: `${overallProgress}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <StatBlock value={doneTasks} label="Terminées" color="text-emerald-300" />
              <StatBlock value={inProgressTasks} label="En cours" color="text-amber-300" />
              <StatBlock value={totalTasks - doneTasks - inProgressTasks} label="À venir" color="text-white/50" />
            </div>
          </div>

          {/* Team filter */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {team.map(member => (
              <button
                key={member.id}
                onClick={() => setFilterAssignee(f => f === member.id ? null : member.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-all ${
                  filterAssignee === member.id ? 'bg-white/20 border-white/40' : 'bg-white/5 border-white/15 hover:bg-white/10'
                }`}
              >
                <span>{member.emoji}</span>
                <span className="font-semibold text-white text-xs">{member.name}</span>
              </button>
            ))}
          </div>
          {filterAssignee && (
            <button onClick={() => setFilterAssignee(null)} className="block mx-auto text-[10px] text-white/50 font-mono mt-2">✕ Voir tout</button>
          )}
        </div>
      </header>

      {/* Team panel */}
      {showTeamPanel && <TeamPanel onClose={() => setShowTeamPanel(false)} />}

      {/* VIEW TOGGLE */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur shadow-sm px-4 py-2">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {([
            { id: 'missions' as ViewMode, label: '🎯 Missions' },
            { id: 'kanban' as ViewMode, label: '📋 Kanban' },
            { id: 'timeline' as ViewMode, label: '📅 Sprints' },
          ]).map(v => (
            <button key={v.id} onClick={() => setView(v.id)}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                view === v.id ? 'bg-white text-sncf-dark shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >{v.label}</button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 py-4 pb-8">
        {view === 'missions' && <MissionsView filterAssignee={filterAssignee} />}
        {view === 'kanban' && <KanbanView filterAssignee={filterAssignee} />}
        {view === 'timeline' && <TimelineView expandedSprint={expandedSprint} setExpandedSprint={setExpandedSprint} filterAssignee={filterAssignee} />}
      </div>

      <footer className="text-center py-6 border-t border-gray-200">
        <div className="text-[10px] font-mono text-gray-300 tracking-widest">KIT ANOMALIE — CHANTIER ANOMALIE — {new Date().getFullYear()}</div>
      </footer>
    </div>
  )
}

// =============================================
// TEAM PANEL
// =============================================

function TeamPanel({ onClose }: { onClose: () => void }) {
  const { team, addTeamMember, removeTeamMember } = usePlanStore()
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('👤')

  const handleAdd = () => {
    if (!newName.trim()) return
    addTeamMember(newName.trim(), newEmoji)
    setNewName('')
    setNewEmoji('👤')
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-sncf-dark">Gestion de l'équipe</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
      </div>
      <div className="space-y-2 mb-3">
        {team.map(m => (
          <div key={m.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
            <span className="text-sm"><span className="mr-2">{m.emoji}</span>{m.name}</span>
            <button onClick={() => removeTeamMember(m.id)} className="text-xs text-gray-300 hover:text-red-500 transition-colors">Retirer</button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={newEmoji} onChange={e => setNewEmoji(e.target.value)} className="w-12 text-center text-lg bg-gray-50 border border-gray-200 rounded-lg px-1 py-1.5 focus:outline-none focus:border-[#00A3E0]" maxLength={2} />
        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nom du membre"
          className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#00A3E0] placeholder:text-gray-300"
          onKeyDown={e => e.key === 'Enter' && handleAdd()} />
        <button onClick={handleAdd} className="text-xs bg-[#00A3E0] text-white px-4 py-1.5 rounded-lg font-medium hover:bg-[#0090c7] transition-colors">Ajouter</button>
      </div>
    </div>
  )
}

// =============================================
// STAT BLOCK
// =============================================

function StatBlock({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="text-center">
      <div className={`text-lg font-black ${color}`}>{value}</div>
      <div className="text-[9px] font-mono text-white/40 tracking-wider uppercase">{label}</div>
    </div>
  )
}

// =============================================
// KANBAN VIEW — drag & drop, renamable columns
// =============================================

function KanbanView({ filterAssignee }: { filterAssignee: string | null }) {
  const { sprints, kanbanColumns, moveTask, renameColumn } = usePlanStore()
  const [editingCol, setEditingCol] = useState<TaskStatus | null>(null)
  const [editName, setEditName] = useState('')
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null)
  const dragItem = useRef<string | null>(null)

  const allTasks = sprints.flatMap(s =>
    s.tasks.map(t => ({ ...t, sprintName: s.name, sprintCodename: s.codename }))
  )
  const filtered = filterAssignee
    ? allTasks.filter(t => t.assignee === filterAssignee)
    : allTasks

  // Sort by priority
  const sortByPriority = (tasks: typeof allTasks) => {
    const order: Record<string, number> = { P1: 0, P2: 1, P3: 2, P4: 3 }
    return [...tasks].sort((a, b) => (order[a.priority ?? 'P4'] ?? 3) - (order[b.priority ?? 'P4'] ?? 3))
  }

  const handleDragStart = (e: DragEvent, taskId: string) => {
    dragItem.current = taskId
    e.dataTransfer.effectAllowed = 'move'
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5'
    }
  }

  const handleDragEnd = (e: DragEvent) => {
    dragItem.current = null
    setDragOverCol(null)
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1'
    }
  }

  const handleDragOver = (e: DragEvent, colId: TaskStatus) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverCol(colId)
  }

  const handleDrop = (e: DragEvent, colId: TaskStatus) => {
    e.preventDefault()
    if (dragItem.current) {
      moveTask(dragItem.current, colId)
    }
    setDragOverCol(null)
    dragItem.current = null
  }

  const startRename = (col: typeof kanbanColumns[0]) => {
    setEditingCol(col.id)
    setEditName(col.name)
  }

  const confirmRename = () => {
    if (editingCol && editName.trim()) {
      renameColumn(editingCol, editName.trim())
    }
    setEditingCol(null)
  }

  return (
    <div className="space-y-5">
      <div className="text-[10px] font-mono text-sncf-dark/40 tracking-widest">VUE KANBAN — glisser-déposer pour changer de statut</div>

      {/* Desktop: horizontal columns */}
      <div className="hidden md:grid md:grid-cols-5 gap-3">
        {kanbanColumns.map(col => {
          const tasks = sortByPriority(filtered.filter(t => t.status === col.id))
          return (
            <div
              key={col.id}
              onDragOver={e => handleDragOver(e, col.id)}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={e => handleDrop(e, col.id)}
              className={`rounded-2xl p-3 min-h-[200px] transition-colors ${
                dragOverCol === col.id ? 'bg-blue-100/60 ring-2 ring-[#00A3E0]/30' : 'bg-gray-100/50'
              }`}
            >
              <ColumnHeader col={col} count={tasks.length} editing={editingCol === col.id} editName={editName}
                onStartRename={() => startRename(col)} onEditName={setEditName} onConfirmRename={confirmRename} onCancelRename={() => setEditingCol(null)} />
              <div className="space-y-2 mt-3">
                {tasks.map(task => (
                  <div key={task.id} draggable onDragStart={e => handleDragStart(e, task.id)} onDragEnd={handleDragEnd} className="cursor-grab active:cursor-grabbing">
                    <TaskCard task={task} sprintCodename={task.sprintCodename} />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Mobile: vertical stack */}
      <div className="md:hidden space-y-5">
        {kanbanColumns.map(col => {
          const tasks = sortByPriority(filtered.filter(t => t.status === col.id))
          if (tasks.length === 0 && col.id !== 'icebox') return null
          return (
            <div key={col.id}>
              <ColumnHeader col={col} count={tasks.length} editing={editingCol === col.id} editName={editName}
                onStartRename={() => startRename(col)} onEditName={setEditName} onConfirmRename={confirmRename} onCancelRename={() => setEditingCol(null)} />
              <div className="space-y-2 mt-2">
                {tasks.map(task => (
                  <TaskCard key={task.id} task={task} sprintCodename={task.sprintCodename} />
                ))}
                {tasks.length === 0 && (
                  <div className="text-xs text-gray-300 italic py-4 text-center">Aucune tâche</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add to icebox */}
      <AddTaskForm sprintId={sprints.find(s => s.status === 'active')?.id ?? sprints[0]?.id ?? ''} defaultStatus="icebox" label="+ Ajouter à l'Icebox" />
    </div>
  )
}

function ColumnHeader({ col, count, editing, editName, onStartRename, onEditName, onConfirmRename, onCancelRename }: {
  col: { id: string; name: string; icon: string }; count: number; editing: boolean
  editName: string; onStartRename: () => void; onEditName: (n: string) => void; onConfirmRename: () => void; onCancelRename: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span>{col.icon}</span>
      {editing ? (
        <input value={editName} onChange={e => onEditName(e.target.value)} autoFocus
          onKeyDown={e => { if (e.key === 'Enter') onConfirmRename(); if (e.key === 'Escape') onCancelRename() }}
          onBlur={onConfirmRename}
          className="text-sm font-bold text-sncf-dark bg-white border border-[#00A3E0] rounded px-2 py-0.5 focus:outline-none w-28" />
      ) : (
        <span className="text-sm font-bold text-sncf-dark cursor-pointer hover:text-[#00A3E0] transition-colors" onDoubleClick={onStartRename}>
          {col.name}
        </span>
      )}
      <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{count}</span>
    </div>
  )
}

// =============================================
// TASK CARD (kanban)
// =============================================

function TaskCard({ task, sprintCodename }: { task: Task; sprintCodename?: string }) {
  const { setTaskStatus, setTaskAssignee, setTaskPriority, setTaskType, deleteTask, team } = usePlanStore()
  const [expanded, setExpanded] = useState(false)
  const member = team.find(m => m.id === task.assignee)

  const colAccent: Record<TaskStatus, string> = {
    in_progress: 'border-l-[#F7A600]',
    todo: 'border-l-gray-300',
    done: 'border-l-[#3AAA35]',
    blocked: 'border-l-[#E3051B]',
    icebox: 'border-l-blue-300',
  }

  return (
    <div className={`bg-white border border-gray-100 ${colAccent[task.status]} border-l-[3px] rounded-xl p-3 shadow-sm`}>
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          {/* Priority + Type + Title */}
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            {task.priority && (
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${PRIORITY_CONFIG[task.priority].color}`}>
                {task.priority}
              </span>
            )}
            {task.type && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded ${TYPE_CONFIG[task.type].color}`}>
                {TYPE_CONFIG[task.type].icon} {TYPE_CONFIG[task.type].label}
              </span>
            )}
          </div>
          <div className={`text-sm font-medium cursor-pointer ${task.status === 'done' ? 'text-gray-300 line-through' : 'text-sncf-dark'}`} onClick={() => setExpanded(!expanded)}>
            {task.title}
          </div>
          {task.description && (
            <p className={`text-[11px] mt-0.5 leading-relaxed ${task.status === 'done' ? 'text-gray-200' : 'text-gray-400'}`}>{task.description}</p>
          )}
        </div>
        {/* Assignee avatar */}
        {member && (
          <span className="text-lg shrink-0" title={member.name}>{member.emoji}</span>
        )}
      </div>

      {/* Sprint badge */}
      {sprintCodename && (
        <span className="inline-block text-[9px] font-mono text-[#00A3E0] bg-blue-50 px-2 py-0.5 rounded mt-1.5">{sprintCodename}</span>
      )}

      {/* Expanded controls */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 w-14">Statut</span>
            <div className="flex gap-1">
              {(['todo', 'in_progress', 'done', 'blocked', 'icebox'] as TaskStatus[]).map(s => (
                <button key={s} onClick={() => setTaskStatus(task.id, s)}
                  className={`text-[9px] px-2 py-1 rounded transition-all ${task.status === s ? 'bg-sncf-dark text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {s === 'todo' ? 'À faire' : s === 'in_progress' ? 'En cours' : s === 'done' ? 'Fait' : s === 'blocked' ? 'Bloqué' : 'Icebox'}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 w-14">Priorité</span>
            <div className="flex gap-1">
              <button onClick={() => setTaskPriority(task.id, undefined)}
                className={`text-[9px] px-2 py-1 rounded ${!task.priority ? 'bg-sncf-dark text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>—</button>
              {(['P1', 'P2', 'P3', 'P4'] as TaskPriority[]).map(p => (
                <button key={p} onClick={() => setTaskPriority(task.id, p)}
                  className={`text-[9px] px-2 py-1 rounded border transition-all ${task.priority === p ? PRIORITY_CONFIG[p].color + ' font-bold' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 w-14">Type</span>
            <div className="flex gap-1 flex-wrap">
              <button onClick={() => setTaskType(task.id, undefined)}
                className={`text-[9px] px-2 py-1 rounded ${!task.type ? 'bg-sncf-dark text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>—</button>
              {(['feature', 'evolution', 'bug', 'contenu', 'tech'] as TaskType[]).map(t => (
                <button key={t} onClick={() => setTaskType(task.id, t)}
                  className={`text-[9px] px-2 py-1 rounded transition-all ${task.type === t ? TYPE_CONFIG[t].color + ' font-semibold' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                  {TYPE_CONFIG[t].icon} {TYPE_CONFIG[t].label}
                </button>
              ))}
            </div>
          </div>

          {/* Assignee */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 w-14">Qui</span>
            <div className="flex gap-1 flex-wrap">
              <button onClick={() => setTaskAssignee(task.id, undefined)}
                className={`text-[9px] px-2 py-1 rounded ${!task.assignee ? 'bg-sncf-dark text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Personne</button>
              {usePlanStore.getState().team.map(m => (
                <button key={m.id} onClick={() => setTaskAssignee(task.id, m.id)}
                  className={`text-[9px] px-2 py-1 rounded transition-all ${task.assignee === m.id ? 'bg-sncf-dark text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                  {m.emoji} {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Delete */}
          <div className="flex justify-end pt-1">
            <button onClick={() => deleteTask(task.id)} className="text-[10px] text-gray-300 hover:text-[#E3051B] transition-colors">
              Supprimer cette tâche
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// =============================================
// ADD TASK FORM
// =============================================

function AddTaskForm({ sprintId, brique, defaultStatus = 'todo', label = '+ Ajouter une tâche' }: {
  sprintId: string; brique?: number; defaultStatus?: TaskStatus; label?: string
}) {
  const { addTask } = usePlanStore()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority | undefined>(undefined)
  const [type, setType] = useState<TaskType | undefined>(undefined)

  const handleSubmit = () => {
    if (!title.trim()) return
    addTask(sprintId, { title: title.trim(), description: description.trim(), status: defaultStatus, brique, priority, type, tags: [] })
    setTitle(''); setDescription(''); setPriority(undefined); setType(undefined); setOpen(false)
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="w-full py-2.5 text-xs text-gray-400 hover:text-[#00A3E0] border border-dashed border-gray-200 hover:border-[#00A3E0]/40 rounded-xl transition-all mt-2">
        {label}
      </button>
    )
  }

  return (
    <div className="bg-blue-50/50 border border-[#00A3E0]/20 rounded-xl p-3 mt-2 space-y-2">
      <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre de la tâche" autoFocus
        className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#00A3E0] text-sncf-dark placeholder:text-gray-300"
        onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
      <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optionnel)"
        className="w-full text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#00A3E0] text-gray-600 placeholder:text-gray-300"
        onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
      <div className="flex gap-2 flex-wrap">
        <select value={priority ?? ''} onChange={e => setPriority((e.target.value || undefined) as TaskPriority | undefined)}
          className="text-[11px] bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:border-[#00A3E0]">
          <option value="">Priorité...</option>
          {(['P1', 'P2', 'P3', 'P4'] as TaskPriority[]).map(p => <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>)}
        </select>
        <select value={type ?? ''} onChange={e => setType((e.target.value || undefined) as TaskType | undefined)}
          className="text-[11px] bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:border-[#00A3E0]">
          <option value="">Type...</option>
          {(['feature', 'evolution', 'bug', 'contenu', 'tech'] as TaskType[]).map(t => <option key={t} value={t}>{TYPE_CONFIG[t].icon} {TYPE_CONFIG[t].label}</option>)}
        </select>
      </div>
      <div className="flex gap-2">
        <button onClick={handleSubmit} className="text-xs bg-[#00A3E0] text-white px-4 py-1.5 rounded-lg font-medium hover:bg-[#0090c7] transition-colors">Ajouter</button>
        <button onClick={() => { setOpen(false); setTitle(''); setDescription('') }} className="text-xs text-gray-400 px-3 py-1.5 hover:text-gray-600">Annuler</button>
      </div>
    </div>
  )
}

// =============================================
// MISSIONS VIEW
// =============================================

function MissionsView({ filterAssignee }: { filterAssignee: string | null }) {
  const { sprints, briques, team } = usePlanStore()

  return (
    <div className="space-y-3">
      <div className="text-[10px] font-mono text-sncf-dark/40 tracking-widest mb-2">8 MISSIONS — ARCHITECTURE DU KIT</div>
      {briques.map(brique => {
        const tasks = sprints.flatMap(s => s.tasks).filter(t => t.brique === brique.numero)
        const filteredTasks = filterAssignee ? tasks.filter(t => t.assignee === filterAssignee) : tasks
        const doneBrique = tasks.filter(t => t.status === 'done').length
        const progressBrique = tasks.length > 0 ? Math.round((doneBrique / tasks.length) * 100) : 0
        const sprintForBrique = sprints.find(s => s.tasks.some(t => t.brique === brique.numero))

        return (
          <div key={brique.numero}
            className={`bg-white rounded-2xl border p-4 shadow-sm transition-all ${
              brique.status === 'done' ? 'border-emerald-200' :
              brique.status === 'in_progress' ? 'border-[#00A3E0]/30 shadow-md' : 'border-gray-100'
            }`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                  brique.status === 'done' ? 'bg-emerald-50' : brique.status === 'in_progress' ? 'bg-blue-50' : 'bg-gray-50'
                }`}>{brique.icon}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-sncf-dark/30 tracking-widest">BRIQUE {brique.numero}</span>
                    <span className="text-[9px] font-mono text-gray-300">// {brique.codename}</span>
                  </div>
                  <div className="text-sm font-bold text-sncf-dark">{brique.nom}</div>
                </div>
              </div>
              <MissionStatusBadge status={brique.status} />
            </div>

            <p className="text-xs text-gray-400 mb-3 leading-relaxed">{brique.description}</p>

            {progressBrique > 0 && (
              <div className="mb-3">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${progressBrique === 100 ? 'bg-[#3AAA35]' : 'bg-[#00A3E0]'}`}
                    style={{ width: `${progressBrique}%` }} />
                </div>
                <div className="text-right text-[9px] font-mono text-gray-300 mt-1">{doneBrique}/{tasks.length} — {progressBrique}%</div>
              </div>
            )}

            {filteredTasks.length > 0 && (
              <div className="border-t border-gray-50 pt-2 mt-2 space-y-1">
                {filteredTasks.map(task => (
                  <MiniTaskRow key={task.id} task={task} team={team} />
                ))}
              </div>
            )}

            {sprintForBrique && <AddTaskForm sprintId={sprintForBrique.id} brique={brique.numero} />}
          </div>
        )
      })}
    </div>
  )
}

function MiniTaskRow({ task, team }: { task: Task; team: { id: string; emoji: string }[] }) {
  const { setTaskStatus } = usePlanStore()
  const member = team.find(m => m.id === task.assignee)

  const cycleStatus = () => {
    const cycle: TaskStatus[] = ['todo', 'in_progress', 'done']
    const idx = cycle.indexOf(task.status)
    setTaskStatus(task.id, cycle[(idx + 1) % cycle.length])
  }

  return (
    <div className="flex items-center gap-2 py-1.5 group">
      <button onClick={cycleStatus}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
          task.status === 'done' ? 'bg-[#3AAA35] border-[#3AAA35] text-white' :
          task.status === 'in_progress' ? 'border-[#F7A600] bg-amber-50' :
          'border-gray-300 hover:border-[#00A3E0]'
        }`}>
        {task.status === 'done' && <span className="text-[10px]">✓</span>}
        {task.status === 'in_progress' && <span className="text-[8px] text-[#F7A600]">●</span>}
      </button>
      <div className="flex-1 min-w-0">
        <span className={`text-xs ${task.status === 'done' ? 'text-gray-300 line-through' : 'text-sncf-dark/80'}`}>{task.title}</span>
      </div>
      {task.priority && (
        <span className={`text-[8px] font-bold px-1 py-0.5 rounded border ${PRIORITY_CONFIG[task.priority].color}`}>{task.priority}</span>
      )}
      {task.type && (
        <span className="text-[9px]">{TYPE_CONFIG[task.type].icon}</span>
      )}
      {member && <span className="text-xs shrink-0">{member.emoji}</span>}
    </div>
  )
}

function MissionStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string }> = {
    done: { label: 'TERMINÉ', color: 'text-[#3AAA35] bg-emerald-50 border-emerald-200' },
    in_progress: { label: 'EN COURS', color: 'text-[#00A3E0] bg-blue-50 border-blue-200' },
    planned: { label: 'PLANIFIÉ', color: 'text-[#F7A600] bg-amber-50 border-amber-200' },
    not_started: { label: 'À VENIR', color: 'text-gray-400 bg-gray-50 border-gray-200' },
  }
  const c = config[status] ?? config.not_started
  return <span className={`text-[9px] font-mono tracking-wider px-2 py-1 rounded-lg border ${c.color}`}>{c.label}</span>
}

// =============================================
// TIMELINE VIEW
// =============================================

function TimelineView({ expandedSprint, setExpandedSprint, filterAssignee }: {
  expandedSprint: string | null; setExpandedSprint: (id: string | null) => void; filterAssignee: string | null
}) {
  const { sprints, team } = usePlanStore()

  return (
    <div className="space-y-4">
      <div className="text-[10px] font-mono text-sncf-dark/40 tracking-widest">TIMELINE — {sprints.length} SPRINTS</div>
      {sprints.map((sprint, i) => {
        const done = sprint.tasks.filter(t => t.status === 'done').length
        const progress = sprint.tasks.length > 0 ? Math.round((done / sprint.tasks.length) * 100) : 0
        const isExpanded = expandedSprint === sprint.id
        const tasks = filterAssignee ? sprint.tasks.filter(t => t.assignee === filterAssignee) : sprint.tasks

        return (
          <div key={sprint.id} className="relative">
            {i < sprints.length - 1 && <div className="absolute left-5 top-16 bottom-0 w-0.5 bg-gradient-to-b from-gray-200 to-transparent" />}
            <button onClick={() => setExpandedSprint(isExpanded ? null : sprint.id)}
              className={`w-full text-left bg-white rounded-2xl border p-4 shadow-sm transition-all ${
                sprint.status === 'completed' ? 'border-emerald-200' :
                sprint.status === 'active' ? 'border-[#00A3E0]/40 shadow-md shadow-blue-100' : 'border-gray-100'
              }`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                  sprint.status === 'completed' ? 'bg-emerald-50' : sprint.status === 'active' ? 'bg-blue-50' : 'bg-gray-50'
                }`}>{sprint.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-sncf-dark">{sprint.name}</span>
                    <span className="text-[9px] font-mono text-gray-300">// {sprint.codename}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">{sprint.dateDebut} → {sprint.dateFin}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-sncf-dark">{progress}%</div>
                  <SprintStatusBadge status={sprint.status} />
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{sprint.objectif}</p>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-3">
                <div className={`h-full rounded-full transition-all duration-700 ${sprint.status === 'completed' ? 'bg-[#3AAA35]' : 'bg-[#00A3E0]'}`}
                  style={{ width: `${progress}%` }} />
              </div>
            </button>

            {isExpanded && (
              <div className="mt-2 bg-white rounded-xl border border-gray-100 p-3 ml-2">
                <div className="space-y-1">
                  {tasks.map(task => <MiniTaskRow key={task.id} task={task} team={team} />)}
                </div>
                {tasks.length === 0 && <div className="text-[10px] text-gray-300 font-mono py-2">Aucune tâche pour ce filtre</div>}
                <AddTaskForm sprintId={sprint.id} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function SprintStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string }> = {
    completed: { label: 'FAIT', color: 'text-[#3AAA35]' },
    active: { label: 'ACTIF', color: 'text-[#00A3E0]' },
    upcoming: { label: 'À VENIR', color: 'text-gray-300' },
  }
  const c = config[status] ?? config.upcoming
  return <div className={`text-[9px] font-mono tracking-wider ${c.color}`}>{c.label}</div>
}
