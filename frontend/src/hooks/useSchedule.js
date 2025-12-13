// hooks/useSchedule.js
import { useState, useCallback } from 'react';
import { 
  getMahasiswaSchedules, 
  addMahasiswaSchedule, 
  updateMahasiswaSchedule, 
  deleteMahasiswaSchedule,
  checkScheduleConflict 
} from '../api/mahasiswa.api';
import { toast } from 'react-hot-toast';

export const useSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch schedules
  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMahasiswaSchedules();
      setSchedules(response.data.schedules || []);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Gagal memuat jadwal';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add schedule
  const addSchedule = useCallback(async (scheduleData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await addMahasiswaSchedule(scheduleData);
      setSchedules(prev => [...prev, response.data.schedule]);
      toast.success('Jadwal berhasil ditambahkan');
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Gagal menambahkan jadwal';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update schedule
  const updateSchedule = useCallback(async (id, scheduleData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await updateMahasiswaSchedule(id, scheduleData);
      setSchedules(prev => 
        prev.map(s => s.id === id ? response.data.schedule : s)
      );
      toast.success('Jadwal berhasil diperbarui');
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Gagal memperbarui jadwal';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete schedule
  const deleteSchedule = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteMahasiswaSchedule(id);
      setSchedules(prev => prev.filter(s => s.id !== id));
      toast.success('Jadwal berhasil dihapus');
    } catch (err) {
      const message = err.response?.data?.message || 'Gagal menghapus jadwal';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check conflict
  const checkConflict = useCallback(async (scheduleData) => {
    try {
      const response = await checkScheduleConflict(scheduleData);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Gagal memeriksa konflik';
      toast.error(message);
      throw err;
    }
  }, []);

  // Group schedules by day
  const getSchedulesByDay = useCallback((dayOfWeek) => {
    return schedules
      .filter(s => s.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [schedules]);

  // Check if time slot is available
  const isTimeSlotAvailable = useCallback((dayOfWeek, startTime, endTime, excludeId = null) => {
    const daySchedules = schedules.filter(s => 
      s.dayOfWeek === dayOfWeek && s.id !== excludeId
    );

    return !daySchedules.some(schedule => {
      const scheduleStart = schedule.startTime;
      const scheduleEnd = schedule.endTime;
      
      // Check overlap
      return (
        (startTime >= scheduleStart && startTime < scheduleEnd) ||
        (endTime > scheduleStart && endTime <= scheduleEnd) ||
        (startTime <= scheduleStart && endTime >= scheduleEnd)
      );
    });
  }, [schedules]);

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    checkConflict,
    getSchedulesByDay,
    isTimeSlotAvailable,
  };
};