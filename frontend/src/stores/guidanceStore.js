import { create } from 'zustand';

export const useGuidanceStore = create((set) => ({
  sessions: [],
  selectedSession: null,
  filters: {
    status: 'all',
    semester: null,
  },
  
  setSessions: (sessions) => set({ sessions }),
  
  addSession: (session) =>
    set((state) => ({
      sessions: [...state.sessions, session],
    })),
  
  updateSession: (id, updatedSession) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, ...updatedSession } : s
      ),
    })),
  
  deleteSession: (id) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
    })),
  
  setSelectedSession: (session) => set({ selectedSession: session }),
  
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
}));