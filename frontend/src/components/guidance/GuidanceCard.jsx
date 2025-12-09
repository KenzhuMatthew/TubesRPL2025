// components/guidance/GuidanceCard.jsx
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

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: AlertCircle,
    iconColor: 'text-yellow-600',
  },
  APPROVED: {
    label: 'Disetujui',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    iconColor: 'text-green-600',
  },
  REJECTED: {
    label: 'Ditolak',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    iconColor: 'text-red-600',
  },
  COMPLETED: {
    label: 'Selesai',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle,
    iconColor: 'text-blue-600',
  },
  CANCELLED: {
    label: 'Dibatalkan',
    color: 'bg-gray-100 text-gray-800',
    icon: XCircle,
    iconColor: 'text-gray-600',
  },
};

const GuidanceCard = ({ session, onClick, variant = 'default' }) => {
  const StatusIcon = STATUS_CONFIG[session.status]?.icon || AlertCircle;
  const isCompact = variant === 'compact';

  // Get participants info based on user role
  const getParticipantInfo = () => {
    if (session.thesisProject?.mahasiswa) {
      // For dosen view
      return {
        name: session.thesisProject.mahasiswa.nama,
        subtitle: session.thesisProject.mahasiswa.npm,
      };
    } else if (session.thesisProject?.supervisors) {
      // For mahasiswa view
      const dosenNames = session.thesisProject.supervisors
        .map(s => s.dosen?.nama)
        .filter(Boolean)
        .join(', ');
      return {
        name: dosenNames || 'Dosen Pembimbing',
        subtitle: null,
      };
    }
    return { name: '-', subtitle: null };
  };

  const participant = getParticipantInfo();

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer ${
        isCompact ? 'p-4' : 'p-6'
      }`}
    >
      {/* Status Badge */}
      <div className="flex items-center gap-3 mb-3">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[session.status]?.color}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {STATUS_CONFIG[session.status]?.label}
        </span>

        {session.sessionType === 'GROUP' && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Kelompok
          </span>
        )}
      </div>

      {/* Participant Info */}
      <div className="flex items-center gap-2 mb-3">
        <User className="w-4 h-4 text-gray-400" />
        <div>
          <h3 className="font-medium text-gray-900">{participant.name}</h3>
          {participant.subtitle && (
            <p className="text-xs text-gray-600">{participant.subtitle}</p>
          )}
        </div>
      </div>

      {/* Thesis Title */}
      {!isCompact && session.thesisProject?.judul && (
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
          {session.thesisProject.judul}
        </p>
      )}

      {/* Session Details */}
      <div className={`flex flex-wrap items-center gap-4 text-sm text-gray-600 ${
        isCompact ? 'gap-3' : 'gap-4'
      }`}>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(session.scheduledDate, 'DD MMM')}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>
            {session.startTime}
            {session.endTime && ` - ${session.endTime}`}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4" />
          <span>{session.location}</span>
        </div>
      </div>

      {/* Notes Indicator */}
      {session.notes && session.notes.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <FileText className="w-4 h-4" />
            <span>{session.notes.length} catatan bimbingan</span>
          </div>
        </div>
      )}

      {/* Arrow Icon */}
      <div className="flex justify-end mt-2">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};

export default GuidanceCard;