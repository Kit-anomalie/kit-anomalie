import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  SPRINTS as INITIAL_SPRINTS, BRIQUES as INITIAL_BRIQUES,
  DEFAULT_TEAM, DEFAULT_KANBAN_COLUMNS,
  type Task, type TaskStatus, type TaskPriority, type TaskType,
  type Sprint, type Brique, type TeamMember, type KanbanColumn,
} from '../data/planTravail'

interface PlanState {
  sprints: Sprint[]
  briques: Brique[]
  team: TeamMember[]
  kanbanColumns: KanbanColumn[]

  // Tasks
  setTaskStatus: (taskId: string, status: TaskStatus) => void
  setTaskAssignee: (taskId: string, assignee: string | undefined) => void
  setTaskPriority: (taskId: string, priority: TaskPriority | undefined) => void
  setTaskType: (taskId: string, type: TaskType | undefined) => void
  addTask: (sprintId: string, task: Omit<Task, 'id'>) => void
  deleteTask: (taskId: string) => void
  moveTask: (taskId: string, toStatus: TaskStatus) => void

  // Team
  addTeamMember: (name: string, emoji: string) => void
  removeTeamMember: (memberId: string) => void

  // Kanban columns
  renameColumn: (columnId: TaskStatus, name: string) => void
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      sprints: INITIAL_SPRINTS,
      briques: INITIAL_BRIQUES,
      team: DEFAULT_TEAM,
      kanbanColumns: DEFAULT_KANBAN_COLUMNS,

      setTaskStatus: (taskId, status) => set(state => ({
        sprints: state.sprints.map(s => ({
          ...s,
          tasks: s.tasks.map(t => t.id === taskId ? { ...t, status } : t),
        })),
      })),

      setTaskAssignee: (taskId, assignee) => set(state => ({
        sprints: state.sprints.map(s => ({
          ...s,
          tasks: s.tasks.map(t => t.id === taskId ? { ...t, assignee } : t),
        })),
      })),

      setTaskPriority: (taskId, priority) => set(state => ({
        sprints: state.sprints.map(s => ({
          ...s,
          tasks: s.tasks.map(t => t.id === taskId ? { ...t, priority } : t),
        })),
      })),

      setTaskType: (taskId, type) => set(state => ({
        sprints: state.sprints.map(s => ({
          ...s,
          tasks: s.tasks.map(t => t.id === taskId ? { ...t, type } : t),
        })),
      })),

      addTask: (sprintId, task) => set(state => ({
        sprints: state.sprints.map(s =>
          s.id === sprintId
            ? { ...s, tasks: [...s.tasks, { ...task, id: `t-${Date.now()}` }] }
            : s
        ),
      })),

      deleteTask: (taskId) => set(state => ({
        sprints: state.sprints.map(s => ({
          ...s,
          tasks: s.tasks.filter(t => t.id !== taskId),
        })),
      })),

      moveTask: (taskId, toStatus) => set(state => ({
        sprints: state.sprints.map(s => ({
          ...s,
          tasks: s.tasks.map(t => t.id === taskId ? { ...t, status: toStatus } : t),
        })),
      })),

      addTeamMember: (name, emoji) => set(state => ({
        team: [...state.team, { id: `member-${Date.now()}`, name, emoji }],
      })),

      removeTeamMember: (memberId) => set(state => ({
        team: state.team.filter(m => m.id !== memberId),
        // Clear assignee on tasks assigned to removed member
        sprints: state.sprints.map(s => ({
          ...s,
          tasks: s.tasks.map(t => t.assignee === memberId ? { ...t, assignee: undefined } : t),
        })),
      })),

      renameColumn: (columnId, name) => set(state => ({
        kanbanColumns: state.kanbanColumns.map(c => c.id === columnId ? { ...c, name } : c),
      })),
    }),
    { name: 'kit-anomalie-plan' }
  )
)
