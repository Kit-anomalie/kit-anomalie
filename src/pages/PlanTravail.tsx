import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlanStore } from '../stores/planStore'
import {
  TAG_COLORS,
  type Task, type TaskStatus
} from '../data/planTravail'

type ViewMode = 'missions' | 'kanban' | 'timeline'

export function PlanTravail() {
  const navigate = useNavigate()
  const { sprints, briques } = usePlanStore()
  const [view, setView] = useState<ViewMode>('missions')
  const [expandedSprint, setExpandedSprint] = useState<string | null>(
    sprints.find(s => s.status === 'active')?.id ?? null
  )
  const [filterAssignee, setFilterAssignee] = useState<string | null>(null)

  const allTasks = sprints.flatMap(s => s.tasks)
  const totalTasks = allTasks.length
  const doneTasks = allTasks.filter(t => t.status === 'done').length
  const inProgressTasks = allTasks.filter(t => t.status === 'in_progress').length
  const overallProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      {/* === HEADER === */}
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
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 text-[10px] font-mono tracking-widest uppercase">Mission active</span>
            </div>
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
          <div className="flex items-center justify-center gap-4">
            <TeamBadge name="Willy" emoji="👨‍💻" active={filterAssignee === 'willy'} onClick={() => setFilterAssignee(f => f === 'willy' ? null : 'willy')} />
            <div className="text-white/30 text-xs">&</div>
            <TeamBadge name="Mathilde" emoji="👩‍💼" active={filterAssignee === 'mathilde'} onClick={() => setFilterAssignee(f => f === 'mathilde' ? null : 'mathilde')} />
          </div>
          {filterAssignee && (
            <button onClick={() => setFilterAssignee(null)} className="block mx-auto text-[10px] text-white/50 font-mono mt-2">✕ Voir tout</button>
          )}
        </div>
      </header>

      {/* === VIEW TOGGLE === */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur shadow-sm px-4 py-2">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {([
            { id: 'missions' as ViewMode, label: '🎯 Missions' },
            { id: 'kanban' as ViewMode, label: '📋 Kanban' },
            { id: 'timeline' as ViewMode, label: '📅 Sprints' },
          ]).map(v => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                view === v.id ? 'bg-white text-sncf-dark shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* === CONTENT === */}
      <div className="px-4 py-4 pb-8">
        {view === 'missions' && <MissionsView filterAssignee={filterAssignee} />}
        {view === 'kanban' && <KanbanView filterAssignee={filterAssignee} />}
        {view === 'timeline' && (
          <TimelineView expandedSprint={expandedSprint} setExpandedSprint={setExpandedSprint} filterAssignee={filterAssignee} />
        )}
      </div>

      <footer className="text-center py-6 border-t border-gray-200">
        <div className="text-[10px] font-mono text-gray-300 tracking-widest">KIT ANOMALIE — CHANTIER ANOMALIE — {new Date().getFullYear()}</div>
      </footer>
    </div>
  )
}

// === SUB COMPONENTS ===

function StatBlock({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="text-center">
      <div className={`text-lg font-black ${color}`}>{value}</div>
      <div className="text-[9px] font-mono text-white/40 tracking-wider uppercase">{label}</div>
    </div>
  )
}

function TeamBadge({ name, emoji, active, onClick }: { name: string; emoji: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
        active ? 'bg-white/20 border-white/40 shadow-lg' : 'bg-white/5 border-white/15 hover:bg-white/10'
      }`}
    >
      <span className="text-lg">{emoji}</span>
      <span className="text-sm font-bold text-white">{name}</span>
    </button>
  )
}

// === ASSIGNEE PICKER ===

function AssigneePicker({ taskId, current }: { taskId: string; current?: string }) {
  const { setTaskAssignee } = usePlanStore()
  const options: { value: string | undefined; label: string }[] = [
    { value: undefined, label: '—' },
    { value: 'willy', label: '👨‍💻 Willy' },
    { value: 'mathilde', label: '👩‍💼 Mathilde' },
    { value: 'both', label: '👥 Les deux' },
  ]

  return (
    <select
      value={current ?? ''}
      onChange={e => setTaskAssignee(taskId, (e.target.value || undefined) as 'willy' | 'mathilde' | 'both' | undefined)}
      className="text-[10px] bg-gray-50 border border-gray-200 rounded-lg px-1.5 py-1 text-gray-600 focus:outline-none focus:border-[#00A3E0]"
    >
      {options.map(o => (
        <option key={o.label} value={o.value ?? ''}>{o.label}</option>
      ))}
    </select>
  )
}

// === ADD TASK FORM ===

function AddTaskForm({ sprintId, brique }: { sprintId: string; brique?: number }) {
  const { addTask } = usePlanStore()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = () => {
    if (!title.trim()) return
    addTask(sprintId, {
      title: title.trim(),
      description: description.trim(),
      status: 'todo',
      brique,
      tags: [],
    })
    setTitle('')
    setDescription('')
    setOpen(false)
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="w-full py-2 text-xs text-gray-400 hover:text-[#00A3E0] border border-dashed border-gray-200 hover:border-[#00A3E0]/40 rounded-xl transition-all mt-2">
        + Ajouter une tâche
      </button>
    )
  }

  return (
    <div className="bg-blue-50/50 border border-[#00A3E0]/20 rounded-xl p-3 mt-2 space-y-2">
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Titre de la tâche"
        className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#00A3E0] text-sncf-dark placeholder:text-gray-300"
        autoFocus
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
      />
      <input
        type="text"
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Description (optionnel)"
        className="w-full text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#00A3E0] text-gray-600 placeholder:text-gray-300"
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
      />
      <div className="flex gap-2">
        <button onClick={handleSubmit} className="text-xs bg-[#00A3E0] text-white px-4 py-1.5 rounded-lg font-medium hover:bg-[#0090c7] transition-colors">
          Ajouter
        </button>
        <button onClick={() => { setOpen(false); setTitle(''); setDescription('') }} className="text-xs text-gray-400 px-3 py-1.5 hover:text-gray-600 transition-colors">
          Annuler
        </button>
      </div>
    </div>
  )
}

// === INTERACTIVE TASK ROW ===

function InteractiveTaskRow({ task, showSprint, sprintCodename }: { task: Task; showSprint?: boolean; sprintCodename?: string }) {
  const { toggleTaskStatus, deleteTask } = usePlanStore()
  const [showDelete, setShowDelete] = useState(false)

  return (
    <div
      className="flex items-center gap-2 py-2 group"
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      {/* Checkbox */}
      <button
        onClick={() => toggleTaskStatus(task.id)}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
          task.status === 'done'
            ? 'bg-[#3AAA35] border-[#3AAA35] text-white'
            : task.status === 'in_progress'
            ? 'border-[#F7A600] bg-amber-50'
            : 'border-gray-300 hover:border-[#00A3E0]'
        }`}
      >
        {task.status === 'done' && <span className="text-[10px]">✓</span>}
        {task.status === 'in_progress' && <span className="text-[8px] text-[#F7A600]">●</span>}
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <span className={`text-xs ${task.status === 'done' ? 'text-gray-300 line-through' : 'text-sncf-dark/80'}`}>
          {task.title}
        </span>
        {task.description && (
          <p className={`text-[10px] leading-tight mt-0.5 ${task.status === 'done' ? 'text-gray-200' : 'text-gray-400'}`}>
            {task.description}
          </p>
        )}
      </div>

      {/* Sprint badge */}
      {showSprint && sprintCodename && (
        <span className="text-[9px] font-mono text-[#00A3E0] bg-blue-50 px-2 py-0.5 rounded shrink-0">
          {sprintCodename}
        </span>
      )}

      {/* Tags */}
      {task.tags?.map(tag => (
        <span key={tag} className={`text-[8px] px-1.5 py-0.5 rounded font-mono shrink-0 ${TAG_COLORS[tag] ?? 'bg-gray-50 text-gray-400'}`}>
          {tag}
        </span>
      ))}

      {/* Assignee */}
      <AssigneePicker taskId={task.id} current={task.assignee} />

      {/* Delete */}
      <button
        onClick={() => deleteTask(task.id)}
        className={`text-gray-300 hover:text-[#E3051B] text-sm shrink-0 transition-all ${showDelete ? 'opacity-100' : 'opacity-0'}`}
        title="Supprimer"
      >
        ✕
      </button>
    </div>
  )
}

// === MISSIONS VIEW ===

function MissionsView({ filterAssignee }: { filterAssignee: string | null }) {
  const { sprints, briques } = usePlanStore()

  return (
    <div className="space-y-3">
      <div className="text-[10px] font-mono text-sncf-dark/40 tracking-widest mb-2">8 MISSIONS — ARCHITECTURE DU KIT</div>
      {briques.map(brique => {
        const tasks = sprints.flatMap(s => s.tasks).filter(t => t.brique === brique.numero)
        const filteredTasks = filterAssignee
          ? tasks.filter(t => t.assignee === filterAssignee || t.assignee === 'both')
          : tasks
        const doneBrique = tasks.filter(t => t.status === 'done').length
        const progressBrique = tasks.length > 0 ? Math.round((doneBrique / tasks.length) * 100) : 0
        // Find the sprint that has tasks for this brique
        const sprintForBrique = sprints.find(s => s.tasks.some(t => t.brique === brique.numero))

        return (
          <div
            key={brique.numero}
            className={`bg-white rounded-2xl border p-4 shadow-sm transition-all ${
              brique.status === 'done' ? 'border-emerald-200' :
              brique.status === 'in_progress' ? 'border-[#00A3E0]/30 shadow-md' : 'border-gray-100'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                  brique.status === 'done' ? 'bg-emerald-50' :
                  brique.status === 'in_progress' ? 'bg-blue-50' : 'bg-gray-50'
                }`}>
                  {brique.icon}
                </div>
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
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${progressBrique === 100 ? 'bg-[#3AAA35]' : 'bg-[#00A3E0]'}`}
                    style={{ width: `${progressBrique}%` }}
                  />
                </div>
                <div className="text-right text-[9px] font-mono text-gray-300 mt-1">{doneBrique}/{tasks.length} — {progressBrique}%</div>
              </div>
            )}

            {filteredTasks.length > 0 && (
              <div className="border-t border-gray-50 pt-2 mt-2 divide-y divide-gray-50">
                {filteredTasks.map(task => (
                  <InteractiveTaskRow key={task.id} task={task} />
                ))}
              </div>
            )}

            {sprintForBrique && (
              <AddTaskForm sprintId={sprintForBrique.id} brique={brique.numero} />
            )}
          </div>
        )
      })}
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

// === KANBAN VIEW ===

function KanbanView({ filterAssignee }: { filterAssignee: string | null }) {
  const { sprints } = usePlanStore()
  const allTasks = sprints.flatMap(s =>
    s.tasks.map(t => ({ ...t, sprintCodename: s.codename }))
  )
  const filtered = filterAssignee
    ? allTasks.filter(t => t.assignee === filterAssignee || t.assignee === 'both')
    : allTasks

  const columns: { status: TaskStatus; label: string; icon: string; accent: string }[] = [
    { status: 'in_progress', label: 'En cours', icon: '🔥', accent: 'border-l-[#F7A600]' },
    { status: 'todo', label: 'À faire', icon: '📌', accent: 'border-l-gray-300' },
    { status: 'done', label: 'Terminé', icon: '✅', accent: 'border-l-[#3AAA35]' },
    { status: 'blocked', label: 'Bloqué', icon: '🚫', accent: 'border-l-[#E3051B]' },
  ]

  return (
    <div className="space-y-5">
      <div className="text-[10px] font-mono text-sncf-dark/40 tracking-widest">VUE KANBAN — TOUTES LES TÂCHES</div>
      {columns.map(col => {
        const tasks = filtered.filter(t => t.status === col.status)
        if (tasks.length === 0) return null

        return (
          <div key={col.status}>
            <div className="flex items-center gap-2 mb-3">
              <span>{col.icon}</span>
              <span className="text-sm font-bold text-sncf-dark">{col.label}</span>
              <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{tasks.length}</span>
            </div>
            <div className="space-y-2">
              {tasks.map(task => (
                <div key={task.id} className={`bg-white border border-gray-100 ${col.accent} border-l-3 rounded-xl p-3 shadow-sm`}>
                  <InteractiveTaskRow task={task} showSprint sprintCodename={task.sprintCodename} />
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// === TIMELINE VIEW ===

function TimelineView({ expandedSprint, setExpandedSprint, filterAssignee }: {
  expandedSprint: string | null
  setExpandedSprint: (id: string | null) => void
  filterAssignee: string | null
}) {
  const { sprints } = usePlanStore()

  return (
    <div className="space-y-4">
      <div className="text-[10px] font-mono text-sncf-dark/40 tracking-widest">TIMELINE — {sprints.length} SPRINTS</div>
      {sprints.map((sprint, i) => {
        const done = sprint.tasks.filter(t => t.status === 'done').length
        const progress = sprint.tasks.length > 0 ? Math.round((done / sprint.tasks.length) * 100) : 0
        const isExpanded = expandedSprint === sprint.id
        const tasks = filterAssignee
          ? sprint.tasks.filter(t => t.assignee === filterAssignee || t.assignee === 'both')
          : sprint.tasks

        return (
          <div key={sprint.id} className="relative">
            {i < sprints.length - 1 && (
              <div className="absolute left-5 top-16 bottom-0 w-0.5 bg-gradient-to-b from-gray-200 to-transparent" />
            )}

            <button
              onClick={() => setExpandedSprint(isExpanded ? null : sprint.id)}
              className={`w-full text-left bg-white rounded-2xl border p-4 shadow-sm transition-all ${
                sprint.status === 'completed' ? 'border-emerald-200' :
                sprint.status === 'active' ? 'border-[#00A3E0]/40 shadow-md shadow-blue-100' : 'border-gray-100'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                  sprint.status === 'completed' ? 'bg-emerald-50' :
                  sprint.status === 'active' ? 'bg-blue-50' : 'bg-gray-50'
                }`}>
                  {sprint.icon}
                </div>
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
                <div
                  className={`h-full rounded-full transition-all duration-700 ${sprint.status === 'completed' ? 'bg-[#3AAA35]' : 'bg-[#00A3E0]'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </button>

            {isExpanded && (
              <div className="mt-2 bg-white rounded-xl border border-gray-100 p-3 ml-2">
                <div className="divide-y divide-gray-50">
                  {tasks.map(task => (
                    <InteractiveTaskRow key={task.id} task={task} />
                  ))}
                </div>
                {tasks.length === 0 && (
                  <div className="text-[10px] text-gray-300 font-mono py-2">Aucune tâche pour ce filtre</div>
                )}
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
