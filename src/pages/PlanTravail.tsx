import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BRIQUES, SPRINTS,
  ASSIGNEE_LABELS, TAG_COLORS,
  getOverallProgress, getSprintProgress,
  type Task, type TaskStatus
} from '../data/planTravail'

type ViewMode = 'missions' | 'kanban' | 'timeline'

export function PlanTravail() {
  const navigate = useNavigate()
  const [view, setView] = useState<ViewMode>('missions')
  const [expandedSprint, setExpandedSprint] = useState<string | null>(
    SPRINTS.find(s => s.status === 'active')?.id ?? null
  )
  const [filterAssignee, setFilterAssignee] = useState<string | null>(null)

  const overallProgress = getOverallProgress()
  const totalTasks = SPRINTS.flatMap(s => s.tasks).length
  const doneTasks = SPRINTS.flatMap(s => s.tasks).filter(t => t.status === 'done').length
  const inProgressTasks = SPRINTS.flatMap(s => s.tasks).filter(t => t.status === 'in_progress').length

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* === HEADER MISSION BRIEFING === */}
      <header className="relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(0,163,224,0.1) 40px, rgba(0,163,224,0.1) 41px),
              repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,163,224,0.1) 40px, rgba(0,163,224,0.1) 41px)`
          }} />
        </div>

        <div className="relative px-4 pt-6 pb-4">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/')}
              className="text-cyan-400/70 text-xs font-mono tracking-wider hover:text-cyan-300 transition-colors"
            >
              ← RETOUR KIT
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-[10px] font-mono tracking-widest uppercase">Mission active</span>
            </div>
          </div>

          {/* Title block */}
          <div className="text-center mb-6">
            <div className="text-cyan-400/50 text-[10px] font-mono tracking-[0.3em] mb-2">OPÉRATION</div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-1">
              KIT ANOMALIE
            </h1>
            <div className="text-cyan-400/70 text-xs font-mono tracking-wider">
              PLAN DE MISSION — 8 BRIQUES — 6 SPRINTS
            </div>
          </div>

          {/* Progress radar */}
          <div className="bg-white/5 backdrop-blur border border-cyan-400/20 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] font-mono text-cyan-400/70 tracking-widest">AVANCEMENT GLOBAL</div>
              <div className="text-2xl font-black text-white">{overallProgress}%</div>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-1000"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <StatBlock value={doneTasks} label="Terminées" color="text-emerald-400" />
              <StatBlock value={inProgressTasks} label="En cours" color="text-amber-400" />
              <StatBlock value={totalTasks - doneTasks - inProgressTasks} label="À venir" color="text-gray-400" />
            </div>
          </div>

          {/* Team */}
          <div className="flex items-center justify-center gap-4 mb-2">
            <TeamBadge name="Willy" role="Code & Vision" emoji="👨‍💻" active={filterAssignee === 'willy'} onClick={() => setFilterAssignee(f => f === 'willy' ? null : 'willy')} />
            <div className="text-cyan-400/30 text-xs">&</div>
            <TeamBadge name="Mathilde" role="Contenu & Métier" emoji="👩‍💼" active={filterAssignee === 'mathilde'} onClick={() => setFilterAssignee(f => f === 'mathilde' ? null : 'mathilde')} />
          </div>
          {filterAssignee && (
            <button onClick={() => setFilterAssignee(null)} className="block mx-auto text-[10px] text-cyan-400/60 font-mono mt-1">
              ✕ Voir tout
            </button>
          )}
        </div>
      </header>

      {/* === VIEW TOGGLE === */}
      <div className="sticky top-0 z-40 bg-[#0a0e1a]/95 backdrop-blur border-b border-cyan-400/10 px-4 py-2">
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          {([
            { id: 'missions' as ViewMode, label: '🎯 Missions', desc: 'Par brique' },
            { id: 'kanban' as ViewMode, label: '📋 Kanban', desc: 'Par statut' },
            { id: 'timeline' as ViewMode, label: '📅 Sprints', desc: 'Timeline' },
          ]).map(v => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                view === v.id
                  ? 'bg-cyan-400/20 text-cyan-300 shadow-sm'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <div>{v.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* === CONTENT === */}
      <div className="px-4 py-4 pb-8">
        {view === 'missions' && <MissionsView filterAssignee={filterAssignee} />}
        {view === 'kanban' && <KanbanView filterAssignee={filterAssignee} />}
        {view === 'timeline' && (
          <TimelineView
            expandedSprint={expandedSprint}
            setExpandedSprint={setExpandedSprint}
            filterAssignee={filterAssignee}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-white/5">
        <div className="text-[10px] font-mono text-white/20 tracking-widest">
          KIT ANOMALIE — CHANTIER ANOMALIE — {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  )
}

// === SUB COMPONENTS ===

function StatBlock({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="text-center">
      <div className={`text-lg font-black ${color}`}>{value}</div>
      <div className="text-[9px] font-mono text-white/30 tracking-wider uppercase">{label}</div>
    </div>
  )
}

function TeamBadge({ name, role, emoji, active, onClick }: {
  name: string; role: string; emoji: string; active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
        active
          ? 'bg-cyan-400/20 border-cyan-400/40 shadow-lg shadow-cyan-400/10'
          : 'bg-white/5 border-white/10 hover:border-cyan-400/20'
      }`}
    >
      <span className="text-lg">{emoji}</span>
      <div className="text-left">
        <div className="text-xs font-bold text-white">{name}</div>
        <div className="text-[9px] text-white/40 font-mono">{role}</div>
      </div>
    </button>
  )
}

// === MISSIONS VIEW (par brique) ===

function MissionsView({ filterAssignee }: { filterAssignee: string | null }) {
  return (
    <div className="space-y-3">
      <div className="text-[10px] font-mono text-cyan-400/50 tracking-widest mb-2">8 MISSIONS — ARCHITECTURE DU KIT</div>
      {BRIQUES.map(brique => {
        const tasks = SPRINTS.flatMap(s => s.tasks).filter(t => t.brique === brique.numero)
        const filteredTasks = filterAssignee
          ? tasks.filter(t => t.assignee === filterAssignee || t.assignee === 'both')
          : tasks

        return (
          <div
            key={brique.numero}
            className={`rounded-2xl border p-4 transition-all ${
              brique.status === 'done'
                ? 'bg-emerald-400/5 border-emerald-400/20'
                : brique.status === 'in_progress'
                ? 'bg-cyan-400/5 border-cyan-400/20'
                : 'bg-white/[0.02] border-white/10'
            }`}
          >
            {/* Mission header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                  brique.status === 'done' ? 'bg-emerald-400/20' :
                  brique.status === 'in_progress' ? 'bg-cyan-400/20' : 'bg-white/5'
                }`}>
                  {brique.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-cyan-400/50 tracking-widest">
                      BRIQUE {brique.numero}
                    </span>
                    <span className="text-[9px] font-mono text-white/20">
                      // {brique.codename}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white">{brique.nom}</div>
                </div>
              </div>
              <MissionStatusBadge status={brique.status} />
            </div>

            <p className="text-xs text-white/40 mb-3 leading-relaxed">{brique.description}</p>

            {/* Progress */}
            {brique.progress > 0 && (
              <div className="mb-3">
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      brique.status === 'done' ? 'bg-emerald-400' : 'bg-cyan-400'
                    }`}
                    style={{ width: `${brique.progress}%` }}
                  />
                </div>
                <div className="text-right text-[9px] font-mono text-white/20 mt-1">{brique.progress}%</div>
              </div>
            )}

            {/* Tasks mini-list */}
            {filteredTasks.length > 0 && (
              <div className="space-y-1.5">
                {filteredTasks.map(task => (
                  <TaskRow key={task.id} task={task} compact />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function MissionStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string }> = {
    done: { label: 'TERMINÉ', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
    in_progress: { label: 'EN COURS', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' },
    planned: { label: 'PLANIFIÉ', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
    not_started: { label: 'À VENIR', color: 'text-white/30 bg-white/5 border-white/10' },
  }
  const c = config[status] ?? config.not_started
  return (
    <span className={`text-[9px] font-mono tracking-wider px-2 py-1 rounded-lg border ${c.color}`}>
      {c.label}
    </span>
  )
}

// === KANBAN VIEW ===

function KanbanView({ filterAssignee }: { filterAssignee: string | null }) {
  const allTasks = SPRINTS.flatMap(s =>
    s.tasks.map(t => ({ ...t, sprintName: s.name, sprintCodename: s.codename }))
  )
  const filtered = filterAssignee
    ? allTasks.filter(t => t.assignee === filterAssignee || t.assignee === 'both')
    : allTasks

  const columns: { status: TaskStatus; label: string; icon: string }[] = [
    { status: 'in_progress', label: 'En cours', icon: '🔥' },
    { status: 'todo', label: 'À faire', icon: '📌' },
    { status: 'done', label: 'Terminé', icon: '✅' },
    { status: 'blocked', label: 'Bloqué', icon: '🚫' },
  ]

  return (
    <div className="space-y-5">
      <div className="text-[10px] font-mono text-cyan-400/50 tracking-widest">VUE KANBAN — TOUTES LES TÂCHES</div>
      {columns.map(col => {
        const tasks = filtered.filter(t => t.status === col.status)
        if (tasks.length === 0) return null

        return (
          <div key={col.status}>
            <div className="flex items-center gap-2 mb-3">
              <span>{col.icon}</span>
              <span className="text-xs font-bold text-white/80">{col.label}</span>
              <span className="text-[10px] font-mono text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
                {tasks.length}
              </span>
            </div>
            <div className="space-y-2">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className="bg-white/[0.03] border border-white/10 rounded-xl p-3 hover:border-cyan-400/20 transition-all"
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="text-sm font-medium text-white/90 flex-1">{task.title}</div>
                  </div>
                  <p className="text-[11px] text-white/30 mb-2 leading-relaxed">{task.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-mono text-cyan-400/40 bg-cyan-400/5 px-2 py-0.5 rounded">
                      {task.sprintCodename}
                    </span>
                    {task.assignee && (
                      <span className="text-[9px] font-mono text-white/30 bg-white/5 px-2 py-0.5 rounded">
                        {ASSIGNEE_LABELS[task.assignee]}
                      </span>
                    )}
                    {task.brique !== undefined && (
                      <span className="text-[9px] font-mono text-white/20 bg-white/5 px-2 py-0.5 rounded">
                        B{task.brique}
                      </span>
                    )}
                    {task.tags?.map(tag => (
                      <span key={tag} className={`text-[9px] px-2 py-0.5 rounded font-mono ${TAG_COLORS[tag] ?? 'bg-white/5 text-white/30'}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// === TIMELINE VIEW (par sprint) ===

function TimelineView({ expandedSprint, setExpandedSprint, filterAssignee }: {
  expandedSprint: string | null
  setExpandedSprint: (id: string | null) => void
  filterAssignee: string | null
}) {
  return (
    <div className="space-y-4">
      <div className="text-[10px] font-mono text-cyan-400/50 tracking-widest">TIMELINE — 6 SPRINTS</div>
      {SPRINTS.map((sprint, i) => {
        const progress = getSprintProgress(sprint)
        const isExpanded = expandedSprint === sprint.id
        const tasks = filterAssignee
          ? sprint.tasks.filter(t => t.assignee === filterAssignee || t.assignee === 'both')
          : sprint.tasks

        return (
          <div key={sprint.id} className="relative">
            {/* Timeline connector */}
            {i < SPRINTS.length - 1 && (
              <div className="absolute left-5 top-14 bottom-0 w-px bg-gradient-to-b from-cyan-400/20 to-transparent" />
            )}

            <button
              onClick={() => setExpandedSprint(isExpanded ? null : sprint.id)}
              className={`w-full text-left rounded-2xl border p-4 transition-all ${
                sprint.status === 'completed' ? 'bg-emerald-400/5 border-emerald-400/20' :
                sprint.status === 'active' ? 'bg-cyan-400/5 border-cyan-400/30 shadow-lg shadow-cyan-400/5' :
                'bg-white/[0.02] border-white/10'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                  sprint.status === 'completed' ? 'bg-emerald-400/20' :
                  sprint.status === 'active' ? 'bg-cyan-400/20' : 'bg-white/5'
                }`}>
                  {sprint.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{sprint.name}</span>
                    <span className="text-[9px] font-mono text-cyan-400/40">// {sprint.codename}</span>
                  </div>
                  <div className="text-[10px] text-white/30 font-mono">
                    {sprint.dateDebut} → {sprint.dateFin}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-white/70">{progress}%</div>
                  <SprintStatusBadge status={sprint.status} />
                </div>
              </div>

              <p className="text-xs text-white/40 leading-relaxed">{sprint.objectif}</p>

              {/* Mini progress bar */}
              <div className="h-1 bg-white/5 rounded-full overflow-hidden mt-3">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    sprint.status === 'completed' ? 'bg-emerald-400' : 'bg-cyan-400'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </button>

            {/* Expanded tasks */}
            {isExpanded && (
              <div className="mt-2 ml-6 space-y-1.5 pl-4 border-l border-cyan-400/10">
                {tasks.map(task => (
                  <TaskRow key={task.id} task={task} />
                ))}
                {tasks.length === 0 && (
                  <div className="text-[10px] text-white/20 font-mono py-2">Aucune tâche pour ce filtre</div>
                )}
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
    completed: { label: 'FAIT', color: 'text-emerald-400' },
    active: { label: 'ACTIF', color: 'text-cyan-400' },
    upcoming: { label: 'À VENIR', color: 'text-white/30' },
  }
  const c = config[status] ?? config.upcoming
  return <div className={`text-[9px] font-mono tracking-wider ${c.color}`}>{c.label}</div>
}

// === SHARED ===

function TaskRow({ task, compact }: { task: Task; compact?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${compact ? 'py-1' : 'py-1.5'} group`}>
      <TaskIcon status={task.status} />
      <div className="flex-1 min-w-0">
        <span className={`text-xs ${
          task.status === 'done' ? 'text-white/30 line-through' : 'text-white/70'
        }`}>
          {task.title}
        </span>
      </div>
      {task.assignee && (
        <span className="text-[9px] font-mono text-white/20 shrink-0">
          {task.assignee === 'willy' ? '👨‍💻' : task.assignee === 'mathilde' ? '👩‍💼' : '👥'}
        </span>
      )}
      {task.tags?.map(tag => (
        <span key={tag} className={`text-[8px] px-1.5 py-0.5 rounded font-mono shrink-0 hidden group-hover:inline-block ${TAG_COLORS[tag] ?? 'bg-white/5 text-white/30'}`}>
          {tag}
        </span>
      ))}
    </div>
  )
}

function TaskIcon({ status }: { status: TaskStatus }) {
  switch (status) {
    case 'done': return <span className="text-emerald-400 text-xs">●</span>
    case 'in_progress': return <span className="text-amber-400 text-xs animate-pulse">◉</span>
    case 'blocked': return <span className="text-red-400 text-xs">⊘</span>
    default: return <span className="text-white/20 text-xs">○</span>
  }
}
