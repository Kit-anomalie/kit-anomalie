import { useState, useRef, useCallback, type DragEvent, type TouchEvent as ReactTouchEvent, type ReactNode } from 'react'
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
  const { sprints, team } = usePlanStore()
  const [view, setView] = useState<ViewMode>('kanban')
  const [expandedSprint, setExpandedSprint] = useState<string | null>(
    sprints.find(s => s.status === 'active')?.id ?? null
  )
  const [filterAssignee, setFilterAssignee] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<TaskType | null>(null)
  const [filterPriority, setFilterPriority] = useState<TaskPriority | null>(null)
  const [showTeamPanel, setShowTeamPanel] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const allTasks = sprints.flatMap(s => s.tasks)
  const totalTasks = allTasks.length
  const doneTasks = allTasks.filter(t => t.status === 'done').length
  const inProgressTasks = allTasks.filter(t => t.status === 'in_progress').length
  const overallProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
  const activeFilters = [filterAssignee, filterType, filterPriority].filter(Boolean).length

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex flex-col">
      {/* === HEADER — compact on desktop === */}
      <header className="relative overflow-hidden bg-gradient-to-br from-[#0C1E5B] to-[#1a3a8f] shrink-0">
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255,255,255,0.15) 30px, rgba(255,255,255,0.15) 31px),
              repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(255,255,255,0.15) 30px, rgba(255,255,255,0.15) 31px)`
          }} />
        </div>

        <div className="relative px-4 pt-4 pb-4 lg:px-8">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-3 lg:mb-2">
            <button onClick={() => navigate('/')} className="text-white/60 text-xs font-mono tracking-wider hover:text-white/90 transition-colors">
              ← KIT
            </button>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowTeamPanel(p => !p)} className="text-white/60 text-xs font-mono tracking-wider hover:text-white/90 transition-colors">
                ⚙ Équipe ({team.length})
              </button>
            </div>
          </div>

          {/* Desktop: single-line compact header */}
          <div className="hidden lg:flex items-center gap-6 mb-3">
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">KIT ANOMALIE</h1>
              <div className="text-white/40 text-[10px] font-mono tracking-wider">PLAN DE MISSION</div>
            </div>
            <div className="flex-1" />
            {/* Progress inline */}
            <div className="flex items-center gap-4">
              <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#00A3E0] to-[#3AAA35] rounded-full transition-all duration-1000" style={{ width: `${overallProgress}%` }} />
              </div>
              <span className="text-lg font-black text-white">{overallProgress}%</span>
              <div className="flex gap-3 text-[10px] font-mono">
                <span className="text-emerald-300">{doneTasks} fait</span>
                <span className="text-amber-300">{inProgressTasks} en cours</span>
                <span className="text-white/40">{totalTasks - doneTasks - inProgressTasks} à venir</span>
              </div>
            </div>
            {/* Team filter inline */}
            <div className="flex gap-1">
              {team.map(m => (
                <button key={m.id} onClick={() => setFilterAssignee(f => f === m.id ? null : m.id)}
                  className={`px-2 py-1 rounded-lg text-xs transition-all ${filterAssignee === m.id ? 'bg-white/25 text-white' : 'text-white/50 hover:text-white/80'}`}>
                  {m.emoji}
                </button>
              ))}
              {filterAssignee && <button onClick={() => setFilterAssignee(null)} className="text-white/40 text-xs px-1">✕</button>}
            </div>
          </div>

          {/* Mobile/Tablet: full header */}
          <div className="lg:hidden">
            <div className="text-center mb-3">
              <h1 className="text-2xl font-black text-white tracking-tight">KIT ANOMALIE</h1>
              <div className="text-white/40 text-[10px] font-mono tracking-wider">PLAN DE MISSION</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-white/50 tracking-widest">AVANCEMENT</span>
                <span className="text-xl font-black text-white">{overallProgress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-gradient-to-r from-[#00A3E0] to-[#3AAA35] rounded-full transition-all duration-1000" style={{ width: `${overallProgress}%` }} />
              </div>
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-emerald-300">{doneTasks} fait</span>
                <span className="text-amber-300">{inProgressTasks} en cours</span>
                <span className="text-white/40">{totalTasks - doneTasks - inProgressTasks} à venir</span>
              </div>
            </div>
            {/* Team filter */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {team.map(m => (
                <button key={m.id} onClick={() => setFilterAssignee(f => f === m.id ? null : m.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                    filterAssignee === m.id ? 'bg-white/20 border-white/40' : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}>
                  <span>{m.emoji}</span><span className="font-semibold text-white">{m.name}</span>
                </button>
              ))}
              {filterAssignee && <button onClick={() => setFilterAssignee(null)} className="text-white/40 text-[10px] font-mono">✕</button>}
            </div>
          </div>
        </div>
      </header>

      {/* Team panel */}
      {showTeamPanel && <TeamPanel onClose={() => setShowTeamPanel(false)} />}

      {/* === NAV BAR + FILTERS === */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur shadow-sm shrink-0">
        <div className="px-4 py-2 lg:px-8 flex items-center gap-2">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-1 lg:flex-none lg:w-auto">
            {([
              { id: 'kanban' as ViewMode, label: '📋 Kanban' },
              { id: 'missions' as ViewMode, label: '🎯 Missions' },
              { id: 'timeline' as ViewMode, label: '📅 Sprints' },
            ]).map(v => (
              <button key={v.id} onClick={() => setView(v.id)}
                className={`flex-1 lg:flex-none py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                  view === v.id ? 'bg-white text-sncf-dark shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}>{v.label}</button>
            ))}
          </div>

          {/* Filter toggle (mobile) */}
          <button onClick={() => setShowFilters(f => !f)}
            className={`lg:hidden p-2 rounded-lg text-xs transition-all ${activeFilters > 0 ? 'bg-[#00A3E0] text-white' : 'bg-gray-100 text-gray-400'}`}>
            ▼ {activeFilters > 0 ? activeFilters : ''}
          </button>

          {/* Desktop filters inline */}
          <div className="hidden lg:flex items-center gap-2 ml-4">
            <FilterChips filterType={filterType} setFilterType={setFilterType} filterPriority={filterPriority} setFilterPriority={setFilterPriority} />
          </div>
        </div>

        {/* Mobile filter drawer */}
        {showFilters && (
          <div className="lg:hidden px-4 pb-3 flex gap-2 flex-wrap border-t border-gray-100 pt-2">
            <FilterChips filterType={filterType} setFilterType={setFilterType} filterPriority={filterPriority} setFilterPriority={setFilterPriority} />
          </div>
        )}
      </div>

      {/* === CONTENT === */}
      <div className="flex-1 overflow-hidden">
        {view === 'kanban' && <KanbanView filterAssignee={filterAssignee} filterType={filterType} filterPriority={filterPriority} />}
        {view === 'missions' && (
          <div className="px-4 py-4 pb-8 lg:px-8 overflow-y-auto h-full">
            <MissionsView filterAssignee={filterAssignee} filterType={filterType} filterPriority={filterPriority} />
          </div>
        )}
        {view === 'timeline' && (
          <div className="px-4 py-4 pb-8 lg:px-8 overflow-y-auto h-full">
            <TimelineView expandedSprint={expandedSprint} setExpandedSprint={setExpandedSprint}
              filterAssignee={filterAssignee} filterType={filterType} filterPriority={filterPriority} />
          </div>
        )}
      </div>
    </div>
  )
}

// =============================================
// FILTER CHIPS
// =============================================

function FilterChips({ filterType, setFilterType, filterPriority, setFilterPriority }: {
  filterType: TaskType | null; setFilterType: (t: TaskType | null) => void
  filterPriority: TaskPriority | null; setFilterPriority: (p: TaskPriority | null) => void
}) {
  return (
    <>
      <span className="text-[10px] text-gray-400 font-mono">Filtres :</span>
      {(['P1', 'P2', 'P3', 'P4'] as TaskPriority[]).map(p => (
        <button key={p} onClick={() => setFilterPriority(filterPriority === p ? null : p)}
          className={`text-[10px] px-2 py-1 rounded-lg border font-mono transition-all ${
            filterPriority === p ? PRIORITY_CONFIG[p].color + ' font-bold' : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
          }`}>{p}</button>
      ))}
      <span className="text-gray-200">|</span>
      {(['bug', 'feature', 'evolution', 'contenu', 'tech'] as TaskType[]).map(t => (
        <button key={t} onClick={() => setFilterType(filterType === t ? null : t)}
          className={`text-[10px] px-2 py-1 rounded-lg transition-all ${
            filterType === t ? TYPE_CONFIG[t].color + ' font-semibold' : 'bg-white border border-gray-200 text-gray-400 hover:border-gray-300'
          }`}>{TYPE_CONFIG[t].icon} {TYPE_CONFIG[t].label}</button>
      ))}
    </>
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
    setNewName(''); setNewEmoji('👤')
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4 shadow-sm lg:px-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-sncf-dark">Gestion de l'équipe</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {team.map(m => (
          <div key={m.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <span>{m.emoji}</span><span className="text-sm font-medium">{m.name}</span>
            <button onClick={() => removeTeamMember(m.id)} className="text-xs text-gray-300 hover:text-red-500 ml-1">✕</button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={newEmoji} onChange={e => setNewEmoji(e.target.value)} className="w-12 text-center text-lg bg-gray-50 border border-gray-200 rounded-lg px-1 py-1.5 focus:outline-none focus:border-[#00A3E0]" maxLength={2} />
        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nom"
          className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#00A3E0] placeholder:text-gray-300"
          onKeyDown={e => e.key === 'Enter' && handleAdd()} />
        <button onClick={handleAdd} className="text-xs bg-[#00A3E0] text-white px-4 py-1.5 rounded-lg font-medium hover:bg-[#0090c7]">Ajouter</button>
      </div>
    </div>
  )
}

// =============================================
// KANBAN VIEW — responsive
// =============================================

interface KanbanFilterProps {
  filterAssignee: string | null
  filterType: TaskType | null
  filterPriority: TaskPriority | null
}

function applyFilters<T extends Task>(tasks: T[], filters: KanbanFilterProps): T[] {
  let result = tasks
  if (filters.filterAssignee) result = result.filter(t => t.assignee === filters.filterAssignee)
  if (filters.filterType) result = result.filter(t => t.type === filters.filterType)
  if (filters.filterPriority) result = result.filter(t => t.priority === filters.filterPriority)
  return result
}

function sortByPriority<T extends Task>(tasks: T[]): T[] {
  const order: Record<string, number> = { P1: 0, P2: 1, P3: 2, P4: 3 }
  return [...tasks].sort((a, b) => (order[a.priority ?? 'P4'] ?? 4) - (order[b.priority ?? 'P4'] ?? 4))
}

function KanbanView(filters: KanbanFilterProps) {
  const { sprints, kanbanColumns, moveTask, renameColumn } = usePlanStore()
  const [activeColIndex, setActiveColIndex] = useState(() => {
    const idx = kanbanColumns.findIndex(c => c.id === 'todo')
    return idx >= 0 ? idx : 0
  })
  const [editingCol, setEditingCol] = useState<TaskStatus | null>(null)
  const [editName, setEditName] = useState('')
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null)
  const dragItem = useRef<string | null>(null)
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  type TaskWithSprint = Task & { sprintCodename: string }
  const allTasks: TaskWithSprint[] = sprints.flatMap(s => s.tasks.map(t => ({ ...t, sprintCodename: s.codename })))
  const filtered = applyFilters(allTasks, filters)

  // Swipe handling for mobile
  const handleTouchStart = useCallback((e: ReactTouchEvent) => {
    const touch = e.touches[0]
    touchStart.current = { x: touch.clientX, y: touch.clientY, time: Date.now() }
  }, [])

  const handleTouchEnd = useCallback((e: ReactTouchEvent) => {
    if (!touchStart.current) return
    const touch = e.changedTouches[0]
    const dx = touch.clientX - touchStart.current.x
    const dy = touch.clientY - touchStart.current.y
    const dt = Date.now() - touchStart.current.time

    // Only count horizontal swipes (not vertical scroll)
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && dt < 400) {
      if (dx < 0 && activeColIndex < kanbanColumns.length - 1) {
        setActiveColIndex(i => i + 1)
      } else if (dx > 0 && activeColIndex > 0) {
        setActiveColIndex(i => i - 1)
      }
    }
    touchStart.current = null
  }, [activeColIndex, kanbanColumns.length])

  // Desktop drag & drop
  const handleDragStart = (e: DragEvent, taskId: string) => {
    dragItem.current = taskId
    e.dataTransfer.effectAllowed = 'move'
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '0.4'
  }
  const handleDragEnd = (e: DragEvent) => {
    dragItem.current = null; setDragOverCol(null)
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '1'
  }
  const handleDragOver = (e: DragEvent, colId: TaskStatus) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverCol(colId) }
  const handleDrop = (e: DragEvent, colId: TaskStatus) => {
    e.preventDefault()
    if (dragItem.current) moveTask(dragItem.current, colId)
    setDragOverCol(null); dragItem.current = null
  }

  const startRename = (colId: TaskStatus, name: string) => { setEditingCol(colId); setEditName(name) }
  const confirmRename = () => { if (editingCol && editName.trim()) renameColumn(editingCol, editName.trim()); setEditingCol(null) }

  const activeSprint = sprints.find(s => s.status === 'active')

  return (
    <div className="h-full flex flex-col">
      {/* === MOBILE: swipeable column tabs + single column === */}
      <div className="md:hidden flex flex-col h-full">
        {/* Tab bar */}
        <div className="flex overflow-x-auto gap-1 px-3 py-2 bg-gray-50 border-b border-gray-100 shrink-0 no-scrollbar">
          {kanbanColumns.map((col, i) => {
            const count = filtered.filter(t => t.status === col.id).length
            return (
              <button key={col.id} onClick={() => setActiveColIndex(i)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeColIndex === i ? 'bg-white shadow-sm text-sncf-dark' : 'text-gray-400'
                }`}>
                <span>{col.icon}</span>
                <span>{col.name}</span>
                {count > 0 && <span className="text-[9px] bg-gray-100 px-1.5 rounded-full font-mono">{count}</span>}
              </button>
            )
          })}
        </div>

        {/* Single column content with swipe */}
        <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-3"
          onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          {kanbanColumns[activeColIndex] && (() => {
            const col = kanbanColumns[activeColIndex]
            const tasks = sortByPriority(filtered.filter(t => t.status === col.id))
            return (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{col.icon}</span>
                  <span className="text-sm font-bold text-sncf-dark">{col.name}</span>
                  <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{tasks.length}</span>
                </div>
                {tasks.length === 0 ? (
                  <div className="text-center py-12 text-gray-300">
                    <div className="text-3xl mb-2">{col.icon}</div>
                    <div className="text-xs">Aucune tâche ici</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tasks.map(task => <TaskCard key={task.id} task={task} sprintCodename={task.sprintCodename} />)}
                  </div>
                )}
              </div>
            )
          })()}
        </div>

        {/* FAB — add task */}
        {activeSprint && (
          <AddTaskFAB sprintId={activeSprint.id} defaultStatus={kanbanColumns[activeColIndex]?.id ?? 'icebox'} />
        )}
      </div>

      {/* === TABLET: 3 columns visible, horizontal scroll === */}
      <div className="hidden md:flex lg:hidden h-full overflow-x-auto gap-3 px-4 py-4 no-scrollbar">
        {kanbanColumns.map(col => {
          const tasks = sortByPriority(filtered.filter(t => t.status === col.id))
          return (
            <div key={col.id}
              onDragOver={e => handleDragOver(e, col.id)} onDragLeave={() => setDragOverCol(null)} onDrop={e => handleDrop(e, col.id)}
              className={`shrink-0 w-[300px] rounded-2xl p-3 flex flex-col transition-colors ${
                dragOverCol === col.id ? 'bg-blue-100/60 ring-2 ring-[#00A3E0]/30' : 'bg-gray-100/50'
              }`}>
              <ColumnHeader col={col} count={tasks.length} editing={editingCol === col.id} editName={editName}
                onStartRename={() => startRename(col.id, col.name)} onEditName={setEditName} onConfirmRename={confirmRename} onCancelRename={() => setEditingCol(null)} />
              <div className="space-y-2 mt-3 flex-1 overflow-y-auto">
                {tasks.map(task => (
                  <div key={task.id} draggable onDragStart={e => handleDragStart(e, task.id)} onDragEnd={handleDragEnd} className="cursor-grab active:cursor-grabbing">
                    <TaskCard task={task} sprintCodename={task.sprintCodename} />
                  </div>
                ))}
                {tasks.length === 0 && <div className="text-xs text-gray-300 italic py-8 text-center">Vide</div>}
              </div>
              {activeSprint && <AddTaskInline sprintId={activeSprint.id} defaultStatus={col.id} />}
            </div>
          )
        })}
      </div>

      {/* === DESKTOP: full board === */}
      <div className="hidden lg:grid lg:grid-cols-5 gap-3 px-8 py-4 h-full overflow-hidden">
        {kanbanColumns.map(col => {
          const tasks = sortByPriority(filtered.filter(t => t.status === col.id))
          return (
            <div key={col.id}
              onDragOver={e => handleDragOver(e, col.id)} onDragLeave={() => setDragOverCol(null)} onDrop={e => handleDrop(e, col.id)}
              className={`rounded-2xl p-3 flex flex-col overflow-hidden transition-colors ${
                dragOverCol === col.id ? 'bg-blue-100/60 ring-2 ring-[#00A3E0]/30' : 'bg-gray-100/40'
              }`}>
              <ColumnHeader col={col} count={tasks.length} editing={editingCol === col.id} editName={editName}
                onStartRename={() => startRename(col.id, col.name)} onEditName={setEditName} onConfirmRename={confirmRename} onCancelRename={() => setEditingCol(null)} />
              <div className="space-y-2 mt-3 flex-1 overflow-y-auto pr-1">
                {tasks.map(task => (
                  <div key={task.id} draggable onDragStart={e => handleDragStart(e, task.id)} onDragEnd={handleDragEnd} className="cursor-grab active:cursor-grabbing">
                    <TaskCard task={task} sprintCodename={task.sprintCodename} compact />
                  </div>
                ))}
                {tasks.length === 0 && <div className="text-xs text-gray-300 italic py-8 text-center">Vide</div>}
              </div>
              {activeSprint && <AddTaskInline sprintId={activeSprint.id} defaultStatus={col.id} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// =============================================
// COLUMN HEADER (renommable — desktop/tablet only)
// =============================================

function ColumnHeader({ col, count, editing, editName, onStartRename, onEditName, onConfirmRename, onCancelRename }: {
  col: { icon: string; name: string }; count: number; editing: boolean
  editName: string; onStartRename: () => void; onEditName: (n: string) => void; onConfirmRename: () => void; onCancelRename: () => void
}) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <span>{col.icon}</span>
      {editing ? (
        <input value={editName} onChange={e => onEditName(e.target.value)} autoFocus
          onKeyDown={e => { if (e.key === 'Enter') onConfirmRename(); if (e.key === 'Escape') onCancelRename() }}
          onBlur={onConfirmRename}
          className="text-sm font-bold text-sncf-dark bg-white border border-[#00A3E0] rounded px-2 py-0.5 focus:outline-none w-28" />
      ) : (
        <span className="text-sm font-bold text-sncf-dark hidden md:inline cursor-pointer hover:text-[#00A3E0] transition-colors" onDoubleClick={onStartRename}>
          {col.name}
        </span>
      )}
      <span className="text-[10px] font-mono text-gray-400 bg-white/60 px-2 py-0.5 rounded-full">{count}</span>
    </div>
  )
}

// =============================================
// TASK CARD
// =============================================

function TaskCard({ task, sprintCodename, compact }: { task: Task; sprintCodename?: string; compact?: boolean }) {
  const { setTaskStatus, setTaskAssignee, setTaskPriority, setTaskType, deleteTask, team } = usePlanStore()
  const [expanded, setExpanded] = useState(false)
  const member = team.find(m => m.id === task.assignee)

  const borderColor: Record<TaskStatus, string> = {
    in_progress: 'border-l-[#F7A600]',
    todo: 'border-l-gray-300',
    done: 'border-l-[#3AAA35]',
    blocked: 'border-l-[#E3051B]',
    icebox: 'border-l-[#00A3E0]',
  }

  return (
    <div className={`bg-white border border-gray-100 ${borderColor[task.status]} border-l-[3px] rounded-xl ${compact ? 'p-2' : 'p-3'} shadow-sm`}>
      <div className="flex items-start gap-2" onClick={() => setExpanded(!expanded)}>
        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex items-center gap-1 flex-wrap mb-0.5">
            {task.priority && (
              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border leading-none ${PRIORITY_CONFIG[task.priority].color}`}>
                {task.priority}
              </span>
            )}
            {task.type && (
              <span className={`text-[8px] px-1.5 py-0.5 rounded leading-none ${TYPE_CONFIG[task.type].color}`}>
                {TYPE_CONFIG[task.type].icon}
              </span>
            )}
          </div>
          <div className={`${compact ? 'text-xs' : 'text-sm'} font-medium ${task.status === 'done' ? 'text-gray-300 line-through' : 'text-sncf-dark'}`}>
            {task.title}
          </div>
          {!compact && task.description && (
            <p className={`text-[11px] mt-0.5 leading-relaxed ${task.status === 'done' ? 'text-gray-200' : 'text-gray-400'}`}>{task.description}</p>
          )}
        </div>
        {member && <span className={`${compact ? 'text-sm' : 'text-lg'} shrink-0`} title={member.name}>{member.emoji}</span>}
      </div>

      {sprintCodename && !compact && (
        <span className="inline-block text-[9px] font-mono text-[#00A3E0] bg-blue-50 px-2 py-0.5 rounded mt-1">{sprintCodename}</span>
      )}

      {/* Expanded controls */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2.5">
          <ControlRow label="Statut">
            {(['icebox', 'todo', 'in_progress', 'done', 'blocked'] as TaskStatus[]).map(s => (
              <StatusButton key={s} active={task.status === s} onClick={() => setTaskStatus(task.id, s)}
                label={s === 'todo' ? 'À faire' : s === 'in_progress' ? 'En cours' : s === 'done' ? 'Fait' : s === 'blocked' ? 'Bloqué' : 'Icebox'} />
            ))}
          </ControlRow>

          <ControlRow label="Priorité">
            <StatusButton active={!task.priority} onClick={() => setTaskPriority(task.id, undefined)} label="—" />
            {(['P1', 'P2', 'P3', 'P4'] as TaskPriority[]).map(p => (
              <StatusButton key={p} active={task.priority === p} onClick={() => setTaskPriority(task.id, p)} label={p}
                activeClass={PRIORITY_CONFIG[p].color} />
            ))}
          </ControlRow>

          <ControlRow label="Type">
            <StatusButton active={!task.type} onClick={() => setTaskType(task.id, undefined)} label="—" />
            {(['feature', 'evolution', 'bug', 'contenu', 'tech'] as TaskType[]).map(t => (
              <StatusButton key={t} active={task.type === t} onClick={() => setTaskType(task.id, t)}
                label={`${TYPE_CONFIG[t].icon} ${TYPE_CONFIG[t].label}`} activeClass={TYPE_CONFIG[t].color} />
            ))}
          </ControlRow>

          <ControlRow label="Qui">
            <StatusButton active={!task.assignee} onClick={() => setTaskAssignee(task.id, undefined)} label="Personne" />
            {team.map(m => (
              <StatusButton key={m.id} active={task.assignee === m.id} onClick={() => setTaskAssignee(task.id, m.id)}
                label={`${m.emoji} ${m.name}`} />
            ))}
          </ControlRow>

          <div className="flex justify-end pt-1">
            <button onClick={() => deleteTask(task.id)} className="text-[10px] text-gray-300 hover:text-[#E3051B] transition-colors">
              Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ControlRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-[10px] text-gray-400 w-14 pt-1 shrink-0">{label}</span>
      <div className="flex gap-1 flex-wrap">{children}</div>
    </div>
  )
}

function StatusButton({ active, onClick, label, activeClass }: {
  active: boolean; onClick: () => void; label: string; activeClass?: string
}) {
  return (
    <button onClick={onClick}
      className={`text-[9px] px-2 py-1 rounded transition-all ${
        active ? (activeClass ?? 'bg-sncf-dark text-white') + ' font-bold' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`}>{label}</button>
  )
}

// =============================================
// ADD TASK — FAB for mobile
// =============================================

function AddTaskFAB({ sprintId, defaultStatus }: { sprintId: string; defaultStatus: TaskStatus }) {
  const { addTask } = usePlanStore()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')

  const handleSubmit = () => {
    if (!title.trim()) return
    addTask(sprintId, { title: title.trim(), description: '', status: defaultStatus, tags: [] })
    setTitle(''); setOpen(false)
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#00A3E0] text-white rounded-full shadow-lg shadow-blue-200 flex items-center justify-center text-2xl font-light active:scale-95 transition-transform z-50">
        +
      </button>
    )
  }

  return (
    <div className="fixed inset-x-0 bottom-0 bg-white border-t border-gray-200 shadow-xl p-4 z-50 safe-area-bottom rounded-t-2xl">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-bold text-sncf-dark">Nouvelle tâche</span>
        <button onClick={() => { setOpen(false); setTitle('') }} className="ml-auto text-gray-400 text-sm">✕</button>
      </div>
      <div className="flex gap-2">
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre..." autoFocus
          className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#00A3E0] placeholder:text-gray-300"
          onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        <button onClick={handleSubmit} className="bg-[#00A3E0] text-white px-5 py-2.5 rounded-xl text-sm font-medium">OK</button>
      </div>
    </div>
  )
}

// =============================================
// ADD TASK — inline for desktop/tablet
// =============================================

function AddTaskInline({ sprintId, defaultStatus }: { sprintId: string; defaultStatus: TaskStatus }) {
  const { addTask } = usePlanStore()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')

  const handleSubmit = () => {
    if (!title.trim()) return
    addTask(sprintId, { title: title.trim(), description: '', status: defaultStatus, tags: [] })
    setTitle(''); setOpen(false)
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="w-full py-2 text-xs text-gray-300 hover:text-[#00A3E0] border border-dashed border-gray-200 hover:border-[#00A3E0]/30 rounded-xl transition-all mt-2 shrink-0">
        + Ajouter
      </button>
    )
  }

  return (
    <div className="mt-2 shrink-0">
      <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre..." autoFocus
        className="w-full text-xs bg-white border border-[#00A3E0]/40 rounded-lg px-3 py-2 focus:outline-none focus:border-[#00A3E0] placeholder:text-gray-300"
        onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); if (e.key === 'Escape') { setOpen(false); setTitle('') } }}
        onBlur={() => { if (!title.trim()) setOpen(false) }} />
    </div>
  )
}

// =============================================
// ADD TASK FORM — full (for missions/timeline)
// =============================================

function AddTaskForm({ sprintId, brique, defaultStatus = 'todo' }: {
  sprintId: string; brique?: number; defaultStatus?: TaskStatus
}) {
  const { addTask } = usePlanStore()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<TaskPriority | undefined>(undefined)
  const [type, setType] = useState<TaskType | undefined>(undefined)

  const handleSubmit = () => {
    if (!title.trim()) return
    addTask(sprintId, { title: title.trim(), description: '', status: defaultStatus, brique, priority, type, tags: [] })
    setTitle(''); setPriority(undefined); setType(undefined); setOpen(false)
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
      <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre" autoFocus
        className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#00A3E0] placeholder:text-gray-300"
        onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
      <div className="flex gap-2 flex-wrap">
        <select value={priority ?? ''} onChange={e => setPriority((e.target.value || undefined) as TaskPriority | undefined)}
          className="text-[11px] bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:border-[#00A3E0]">
          <option value="">Priorité</option>
          {(['P1', 'P2', 'P3', 'P4'] as TaskPriority[]).map(p => <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>)}
        </select>
        <select value={type ?? ''} onChange={e => setType((e.target.value || undefined) as TaskType | undefined)}
          className="text-[11px] bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:border-[#00A3E0]">
          <option value="">Type</option>
          {(['feature', 'evolution', 'bug', 'contenu', 'tech'] as TaskType[]).map(t => <option key={t} value={t}>{TYPE_CONFIG[t].icon} {TYPE_CONFIG[t].label}</option>)}
        </select>
      </div>
      <div className="flex gap-2">
        <button onClick={handleSubmit} className="text-xs bg-[#00A3E0] text-white px-4 py-1.5 rounded-lg font-medium">Ajouter</button>
        <button onClick={() => { setOpen(false); setTitle('') }} className="text-xs text-gray-400 px-3 py-1.5">Annuler</button>
      </div>
    </div>
  )
}

// =============================================
// MISSIONS VIEW
// =============================================

function MissionsView(filters: KanbanFilterProps) {
  const { sprints, briques, team } = usePlanStore()

  return (
    <div className="space-y-3 lg:max-w-4xl lg:mx-auto">
      <div className="text-[10px] font-mono text-sncf-dark/40 tracking-widest mb-2">8 MISSIONS — ARCHITECTURE DU KIT</div>
      {briques.map(brique => {
        const allTasks = sprints.flatMap(s => s.tasks).filter(t => t.brique === brique.numero)
        const filteredTasks = applyFilters(allTasks, filters)
        const doneBrique = allTasks.filter(t => t.status === 'done').length
        const progressBrique = allTasks.length > 0 ? Math.round((doneBrique / allTasks.length) * 100) : 0
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
                <div className="text-right text-[9px] font-mono text-gray-300 mt-1">{doneBrique}/{allTasks.length} — {progressBrique}%</div>
              </div>
            )}

            {filteredTasks.length > 0 && (
              <div className="border-t border-gray-50 pt-2 mt-2 space-y-1">
                {filteredTasks.map(task => <MiniTaskRow key={task.id} task={task} team={team} />)}
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
    <div className="flex items-center gap-2 py-1.5">
      <button onClick={cycleStatus}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
          task.status === 'done' ? 'bg-[#3AAA35] border-[#3AAA35] text-white' :
          task.status === 'in_progress' ? 'border-[#F7A600] bg-amber-50' :
          'border-gray-300 hover:border-[#00A3E0]'
        }`}>
        {task.status === 'done' && <span className="text-[10px]">✓</span>}
        {task.status === 'in_progress' && <span className="text-[8px] text-[#F7A600]">●</span>}
      </button>
      <span className={`flex-1 text-xs ${task.status === 'done' ? 'text-gray-300 line-through' : 'text-sncf-dark/80'}`}>{task.title}</span>
      {task.priority && <span className={`text-[8px] font-bold px-1 py-0.5 rounded border ${PRIORITY_CONFIG[task.priority].color}`}>{task.priority}</span>}
      {task.type && <span className="text-[9px]">{TYPE_CONFIG[task.type].icon}</span>}
      {member && <span className="text-xs">{member.emoji}</span>}
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

function TimelineView({ expandedSprint, setExpandedSprint, ...filters }: {
  expandedSprint: string | null; setExpandedSprint: (id: string | null) => void
} & KanbanFilterProps) {
  const { sprints, team } = usePlanStore()

  return (
    <div className="space-y-4 lg:max-w-4xl lg:mx-auto">
      <div className="text-[10px] font-mono text-sncf-dark/40 tracking-widest">TIMELINE — {sprints.length} SPRINTS</div>
      {sprints.map((sprint, i) => {
        const done = sprint.tasks.filter(t => t.status === 'done').length
        const progress = sprint.tasks.length > 0 ? Math.round((done / sprint.tasks.length) * 100) : 0
        const isExpanded = expandedSprint === sprint.id
        const tasks = applyFilters(sprint.tasks, filters)

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
                {tasks.length === 0 && <div className="text-[10px] text-gray-300 font-mono py-2">Aucune tâche</div>}
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
