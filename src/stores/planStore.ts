import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SPRINTS as INITIAL_SPRINTS, BRIQUES as INITIAL_BRIQUES, type Task, type TaskStatus, type Sprint, type Brique } from '../data/planTravail'

interface PlanState {
  sprints: Sprint[]
  briques: Brique[]
  _initialized: boolean

  // Actions tâches
  toggleTaskStatus: (taskId: string) => void
  setTaskStatus: (taskId: string, status: TaskStatus) => void
  setTaskAssignee: (taskId: string, assignee: 'willy' | 'mathilde' | 'both' | undefined) => void
  addTask: (sprintId: string, task: Omit<Task, 'id'>) => void
  deleteTask: (taskId: string) => void
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      sprints: INITIAL_SPRINTS,
      briques: INITIAL_BRIQUES,
      _initialized: true,

      toggleTaskStatus: (taskId) => set(state => ({
        sprints: state.sprints.map(s => ({
          ...s,
          tasks: s.tasks.map(t =>
            t.id === taskId
              ? { ...t, status: (t.status === 'done' ? 'todo' : 'done') as TaskStatus }
              : t
          ),
        })),
      })),

      setTaskStatus: (taskId, status) => set(state => ({
        sprints: state.sprints.map(s => ({
          ...s,
          tasks: s.tasks.map(t =>
            t.id === taskId ? { ...t, status } : t
          ),
        })),
      })),

      setTaskAssignee: (taskId, assignee) => set(state => ({
        sprints: state.sprints.map(s => ({
          ...s,
          tasks: s.tasks.map(t =>
            t.id === taskId ? { ...t, assignee } : t
          ),
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
    }),
    { name: 'kit-anomalie-plan' }
  )
)
