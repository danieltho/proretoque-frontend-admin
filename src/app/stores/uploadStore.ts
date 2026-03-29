import { create } from 'zustand'

export interface UploadTask {
  id: string
  batchId?: number
  name: string
  progress: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
}

interface UploadState {
  tasks: UploadTask[]
  addTask: (task: UploadTask) => void
  updateTask: (id: string, updates: Partial<UploadTask>) => void
  removeTask: (id: string) => void
  clearCompleted: () => void
}

export const useUploadStore = create<UploadState>()((set) => ({
  tasks: [],
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  removeTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
  clearCompleted: () =>
    set((state) => ({ tasks: state.tasks.filter((t) => t.status !== 'completed') })),
}))
