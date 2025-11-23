import { create } from 'zustand'

interface AppState {
  refreshTrigger: number
  triggerRefresh: () => void
}

export const useAppStore = create<AppState>((set) => ({
  refreshTrigger: 0,
  triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}))

