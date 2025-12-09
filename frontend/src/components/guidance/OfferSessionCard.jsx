// components/guidance/OfferedSessionCard.jsx
import { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import { guidanceApi } from '../../api/guidance.api';

const OfferedSessionCard = ({ session, onAccept, onDecline }) => {
  const [showDeclineReason, setShowDeclineReason] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = async () => {
    if (isProcessing) return;

    if (!confirm('Terima tawaran bimbingan ini?')) return;

    setIsProcessing(true);
    try {
      await guidanceApi.acceptOfferedSession(session.id);
      onAccept?.();
    } catch (error) {
      console.error('Error accepting session:', error);
      alert(error.response?.data?.message || 'Gagal menerima tawaran');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      alert('Mohon berikan alasan penolakan');
      return;
    }

    if (isProcessing) return;

    setIsProcessing(true);
    try {
      await guidanceApi.declineOfferedSession(session.id, declineReason);
      onDecline?.();
    } catch (error) {
      console.error('Error declining session:', error);
      alert(error.response?.data?.message || 'Gagal menolak tawaran');
    } finally {
      setIsProcessing(false);
    }
  };

  const dosenNames = session.thesisProject?.supervisors
    ?.map(s => s.dosen?.nama)
    .filter(Boolean)
    .join(', ') || 'Dosen Pembimbing';

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-6">
      {/* Header Badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
          <AlertCircle className="w-3.5 h-3.5" />
          Tawaran Bimbingan Baru
        </span>
        <span className="text-xs text-gray-600">
          Perlu respons Anda
        </span>
      </div>

      {/* Dosen Info */}
      <div className="flex items-center gap-2 mb-3">
        <User className="w-4 h-4 text-gray-600" />
        <div>
          <h3 className="font-semibold text-gray-900">{dosenNames}</h3>
          <p className="text-xs text-gray-600">Dosen Pembimbing</p>
        </div>
      </div>

      {/* Thesis Title */}
      {session.thesisProject?.judul && (
        <p className="text-sm text-gray-700 mb-4 line-clamp-2">
          {session.thesisProject.judul}
        </p>
      )}

      {/* Session Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 bg-white bg-opacity-60 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <div>
            <p className="text-xs text-gray-600">Tanggal</p>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(session.scheduledDate, 'DD MMM YYYY')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <div>
            <p className="text-xs text-gray-600">Waktu</p>
            <p className="text-sm font-medium text-gray-900">
              {session.startTime} - {session.endTime}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <div>
            <p className="text-xs text-gray-600">Lokasi</p>
            <p className="text-sm font-medium text-gray-900">{session.location}</p>
          </div>
        </div>
      </div>

      {/* Notes from Dosen */}
      {session.notes && (
        <div className="bg-white bg-opacity-60 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-700 mb-1">
                Catatan dari Dosen:
              </p>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {session.notes}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!showDeclineReason ? (
        <div className="flex gap-3">
          <button
            onClick={handleAccept}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <CheckCircle className="w-5 h-5" />
            Terima Tawaran
          </button>
          <button
            onClick={() => setShowDeclineReason(true)}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <XCircle className="w-5 h-5" />
            Tolak
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alasan Penolakan <span className="text-red-500">*</span>
            </label>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={3}
              placeholder="Mohon berikan alasan penolakan..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowDeclineReason(false);
                setDeclineReason('');
              }}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleDecline}
              disabled={isProcessing || !declineReason.trim()}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Memproses...' : 'Konfirmasi Penolakan'}
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-100 rounded-lg">
        <p className="text-xs text-blue-900">
          💡 <strong>Perhatian:</strong> Pastikan jadwal tidak bentrok dengan kelas atau kegiatan lain Anda
        </p>
      </div>
    </div>
  );
};

export default OfferedSessionCard;