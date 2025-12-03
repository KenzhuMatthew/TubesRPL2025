// hooks/useGuidance.js
import { useState, useCallback } from 'react';
import { 
  getAvailableSlots,
  requestGuidanceSession,
  getMahasiswaSessions,
  getSessionDetail,
  updateSessionRequest,
  cancelSession,
  getMahasiswaProgress
} from '../api/mahasiswa.api';
import { toast } from 'react-hot-toast';

export const useGuidance = () => {
  const [sessions, setSessions] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch available time slots
  const fetchAvailableSlots = useCallback(async (dosenId, date) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAvailableSlots({ dosenId, date });
      setAvailableSlots(response.data.slots || []);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Gagal memuat slot tersedia';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Request new guidance session
  const requestSession = useCallback(async (sessionData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await requestGuidanceSession(sessionData);
      toast.success('Pengajuan bimbingan berhasil dikirim');
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Gagal mengajukan bimbingan';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all sessions
  const fetchSessions = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMahasiswaSessions(filters);
      setSessions(response.data.sessions || []);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Gagal memuat riwayat bimbingan';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch session detail
  const fetchSessionDetail = useCallback(async (sessionId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSessionDetail(sessionId);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Gagal memuat detail sesi';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update session request
  const updateSession = useCallback(async (sessionId, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await updateSessionRequest(sessionId, updateData);
      setSessions(prev => 
        prev.map(s => s.id === sessionId ? response.data.session : s)
      );
      toast.success('Pengajuan bimbingan berhasil diperbarui');
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Gagal memperbarui pengajuan';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancel session
  const cancelSessionRequest = useCallback(async (sessionId) => {
    setLoading(true);
    setError(null);
    try {
      await cancelSession(sessionId);
      setSessions(prev => 
        prev.map(s => s.id === sessionId ? { ...s, status: 'CANCELLED' } : s)
      );
      toast.success('Sesi bimbingan berhasil dibatalkan');
    } catch (err) {
      const message = err.response?.data?.message || 'Gagal membatalkan sesi';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch progress
  const fetchProgress = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMahasiswaProgress();
      setProgress(response.data);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Gagal memuat progress';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter sessions by status
  const getSessionsByStatus = useCallback((status) => {
    return sessions.filter(s => s.status === status);
  }, [sessions]);

  // Get upcoming sessions
  const getUpcomingSessions = useCallback(() => {
    const now = new Date();
    return sessions
      .filter(s => 
        new Date(s.scheduledDate) >= now && 
        ['PENDING', 'APPROVED'].includes(s.status)
      )
      .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
  }, [sessions]);

  // Get completed sessions count
  const getCompletedCount = useCallback(() => {
    return sessions.filter(s => s.status === 'COMPLETED').length;
  }, [sessions]);

  return {
    sessions,
    availableSlots,
    progress,
    loading,
    error,
    fetchAvailableSlots,
    requestSession,
    fetchSessions,
    fetchSessionDetail,
    updateSession,
    cancelSessionRequest,
    fetchProgress,
    getSessionsByStatus,
    getUpcomingSessions,
    getCompletedCount,
  };
};