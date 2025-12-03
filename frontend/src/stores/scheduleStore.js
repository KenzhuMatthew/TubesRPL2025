import { create } from 'zustand';

export const useScheduleStore = create((set) => ({
  schedules: [],
  selectedDate: null,
  viewMode: 'week', // 'day', 'week', 'month'
  
  setSchedules: (schedules) => set({ schedules }),
  
  addSchedule: (schedule) =>
    set((state) => ({
      schedules: [...state.schedules, schedule],
    })),
  
  updateSchedule: (id, updatedSchedule) =>
    set((state) => ({
      schedules: state.schedules.map((s) =>
        s.id === id ? { ...s, ...updatedSchedule } : s
      ),
    })),
  
  deleteSchedule: (id) =>
    set((state) => ({
      schedules: state.schedules.filter((s) => s.id !== id),
    })),
  
  setSelectedDate: (date) => set({ selectedDate: date }),
  
  setViewMode: (mode) => set({ viewMode: mode }),
}));