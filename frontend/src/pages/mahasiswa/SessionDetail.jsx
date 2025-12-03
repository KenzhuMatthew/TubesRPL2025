// pages/mahasiswa/SessionDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  FileText, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit2,
  Trash2
} from 'lucide-react';
import Loading from '../../components/common/Loading';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useGuidance } from '../../hooks/useGuidance';
import { formatDate } from '../../utils/dateUtils';

const STATUS_CONFIG = {
  PENDING: {
    label: 'Menunggu Persetujuan',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: AlertCircle,
    iconColor: 'text-yellow-600',
  },
  APPROVED: {
    label: 'Disetujui',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    iconColor: 'text-green-600',
  },
  REJECTED: {
    label: 'Ditolak',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    iconColor: 'text-red-600',
  },
  COMPLETED: {
    label: 'Selesai',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: CheckCircle,
    iconColor: 'text-blue-600',
  },
  CANCELLED: {
    label: 'Dibatalkan',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: XCircle,
    iconColor: 'text-gray-600',
  },
};

const SessionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchSessionDetail, cancelSessionRequest } = useGuidance();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    loadSessionDetail();
  }, [id]);

  const loadSessionDetail = async () => {
    try {
      const response = await fetchSessionDetail(id);
      setSession(response.session);
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/mahasiswa/sessions/${id}/edit`);
  };

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      await cancelSessionRequest(id);
      navigate('/mahasiswa/guidance-history', {
        state: { message: 'Sesi bimbingan berhasil dibatalkan' }
      });
    } catch (error) {
      console.error('Cancel error:', error);
      setIsCancelling(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Sesi tidak ditemukan
        </h2>
        <button
          onClick={() => navigate('/mahasiswa/guidance-history')}
          className="text-blue-600 hover:text-blue-700"
        >
          Kembali ke riwayat
        </button>
      </div>
    );
  }

  const StatusIcon = STATUS_CONFIG[session.status]?.icon || AlertCircle;
  const supervisors = session.thesisProject?.supervisors || [];
  const canEdit = session.status === 'PENDING';
  const canCancel = ['PENDING', 'APPROVED'].includes(session.status);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Kembali
      </button>

      {/* Status Header */}
      <div className={`rounded-lg border-2 p-6 mb-6 ${STATUS_CONFIG[session.status]?.color}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusIcon className={`w-8 h-8 ${STATUS_CONFIG[session.status]?.iconColor}`} />
            <div>
              <h2 className="text-2xl font-bold">
                {STATUS_CONFIG[session.status]?.label}
              </h2>
              <p className="text-sm opacity-80 mt-1">
                {session.status === 'PENDING' && 'Menunggu persetujuan dari dosen'}
                {session.status === 'APPROVED' && 'Sesi bimbingan telah disetujui'}
                {session.status === 'REJECTED' && 'Pengajuan ditolak oleh dosen'}
                {session.status === 'COMPLETED' && 'Sesi bimbingan telah selesai'}
                {session.status === 'CANCELLED' && 'Sesi bimbingan dibatalkan'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          {(canEdit || canCancel) && (
            <div className="flex gap-2">
              {canEdit && (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              )}
              {canCancel && (
                <button
                  onClick={handleCancelClick}
                  className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Batalkan
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Session Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Detail Sesi Bimbingan
        </h3>

        <div className="space-y-4">
          {/* Supervisors */}
          <div className="flex gap-3">
            <User className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Dosen Pembimbing
              </p>
              <div className="space-y-2">
                {supervisors.map((supervisor, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-gray-900">
                      {supervisor.dosen?.nama}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({supervisor.dosen?.nip})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="flex gap-3">
            <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-1">Tanggal</p>
              <p className="text-gray-900">{formatDate(session.scheduledDate)}</p>
            </div>
          </div>

          {/* Time */}
          <div className="flex gap-3">
            <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-1">Waktu</p>
              <p className="text-gray-900">
                {session.startTime}
                {session.endTime && ` - ${session.endTime}`}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex gap-3">
            <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-1">Lokasi</p>
              <p className="text-gray-900">{session.location}</p>
            </div>
          </div>

          {/* Thesis Info */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Tugas Akhir
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-1">
                {session.thesisProject?.judul}
              </h4>
              <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                {session.thesisProject?.tipe}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes from Dosen */}
      {session.notes && session.notes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Catatan Bimbingan
          </h3>

          <div className="space-y-4">
            {session.notes.map((note, idx) => (
              <div key={note.id} className="border-l-4 border-blue-500 bg-blue-50 rounded-r-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      {note.dosen?.nama}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(note.createdAt, 'DD MMM YYYY, HH:mm')}
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Catatan Pertemuan:
                    </p>
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>

                  {note.tasks && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Tugas untuk Pertemuan Berikutnya:
                      </p>
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {note.tasks}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <ConfirmModal
          title="Batalkan Sesi Bimbingan"
          message="Apakah Anda yakin ingin membatalkan sesi bimbingan ini? Tindakan ini tidak dapat dibatalkan."
          confirmText="Ya, Batalkan"
          confirmColor="red"
          onConfirm={handleConfirmCancel}
          onCancel={() => setShowCancelModal(false)}
          isLoading={isCancelling}
        />
      )}
    </div>
  );
};

export default SessionDetail;