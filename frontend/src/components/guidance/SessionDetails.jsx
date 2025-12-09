// components/guidance/SessionDetails.jsx
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User,
  FileText,
  BookOpen
} from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

const SessionDetails = ({ session, showThesisInfo = true, showNotes = true }) => {
  if (!session) return null;

  const mahasiswa = session.thesisProject?.mahasiswa;
  const supervisors = session.thesisProject?.supervisors || [];

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Detail Sesi Bimbingan
        </h3>

        <div className="space-y-4">
          {/* Participant Info */}
          {mahasiswa && (
            <div className="flex gap-3">
              <User className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-1">Mahasiswa</p>
                <div>
                  <p className="text-gray-900 font-medium">{mahasiswa.nama}</p>
                  <p className="text-sm text-gray-600">
                    {mahasiswa.npm}
                    {mahasiswa.angkatan && ` • Angkatan ${mahasiswa.angkatan}`}
                  </p>
                  {mahasiswa.email && (
                    <p className="text-sm text-gray-600">{mahasiswa.email}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {supervisors.length > 0 && (
            <div className="flex gap-3">
              <User className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Dosen Pembimbing
                </p>
                <div className="space-y-2">
                  {supervisors.map((supervisor, idx) => (
                    <div key={idx}>
                      <p className="text-gray-900">{supervisor.dosen?.nama}</p>
                      <p className="text-sm text-gray-600">{supervisor.dosen?.nip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

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
          {showThesisInfo && session.thesisProject && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex gap-3">
                <BookOpen className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Tugas Akhir
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {session.thesisProject.judul}
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {session.thesisProject.tipe}
                      </span>
                      {session.thesisProject.semester && (
                        <span className="text-xs text-gray-600">
                          {session.thesisProject.semester}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {showNotes && session.notes && session.notes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Catatan Bimbingan
          </h3>

          <div className="space-y-4">
            {session.notes.map((note, index) => (
              <div
                key={note.id}
                className="border-l-4 border-blue-500 bg-blue-50 rounded-r-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{note.dosen?.nama}</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(note.createdAt, 'DD MMM YYYY, HH:mm')}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-blue-200 text-blue-800 rounded">
                    Pertemuan #{session.notes.length - index}
                  </span>
                </div>

                <div className="mt-3 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Catatan Pertemuan:
                    </p>
                    <p className="text-gray-900 whitespace-pre-wrap">{note.content}</p>
                  </div>

                  {note.tasks && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Tugas untuk Pertemuan Berikutnya:
                      </p>
                      <p className="text-gray-900 whitespace-pre-wrap">{note.tasks}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionDetails;