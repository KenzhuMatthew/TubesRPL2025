// pages/dosen/AddNotes.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Save, X, Calendar, User } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Loading from '../../components/common/Loading';
import { getSessionDetail, addSessionNotes } from '../../api/dosen.api';
import { formatDate } from '../../utils/dateUtils';
import { toast } from 'react-hot-toast';

const AddNotes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    content: '',
    tasks: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadSession();
  }, [id]);

  const loadSession = async () => {
    try {
      const response = await getSessionDetail(id);
      setSession(response.data.session);
    } catch (error) {
      console.error('Error loading session:', error);
      toast.error('Gagal memuat data sesi');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.content.trim()) {
      newErrors.content = 'Catatan pertemuan harus diisi';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await addSessionNotes(id, formData);
      toast.success('Catatan berhasil disimpan');
      navigate(`/dosen/sessions/${id}`);
    } catch (error) {
      console.error('Error adding notes:', error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan catatan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Sesi tidak ditemukan</p>
      </div>
    );
  }

  const mahasiswa = session.thesisProject?.mahasiswa;

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Tambah Catatan Bimbingan"
        description="Catat hasil pertemuan dan tugas untuk pertemuan berikutnya"
        showBack={true}
        backTo={`/dosen/sessions/${id}`}
      />

      {/* Session Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Informasi Sesi</h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">{mahasiswa?.nama}</p>
              <p className="text-sm text-gray-600">{mahasiswa?.npm}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-gray-900">
                {formatDate(session.scheduledDate)} • {session.startTime}
              </p>
              <p className="text-sm text-gray-600">{session.location}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-1">Judul Tugas Akhir:</p>
            <p className="text-gray-900">{session.thesisProject?.judul}</p>
          </div>
        </div>
      </div>

      {/* Notes Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Meeting Notes */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4" />
            Catatan Pertemuan <span className="text-red-500">*</span>
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={8}
            placeholder="Tulis catatan hasil pertemuan bimbingan...&#10;&#10;Contoh:&#10;- Mahasiswa telah menyelesaikan BAB I&#10;- Pembahasan metodologi penelitian&#10;- Revisi rumusan masalah"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
              errors.content ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.content && (
            <p className="text-red-500 text-xs mt-1">{errors.content}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {formData.content.length} karakter
          </p>
        </div>

        {/* Tasks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tugas untuk Pertemuan Berikutnya (Opsional)
          </label>
          <textarea
            name="tasks"
            value={formData.tasks}
            onChange={handleChange}
            rows={6}
            placeholder="Tulis tugas yang harus dikerjakan mahasiswa...&#10;&#10;Contoh:&#10;- Menyelesaikan BAB II (Tinjauan Pustaka)&#10;- Membuat flowchart sistem&#10;- Mengumpulkan data penelitian"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.tasks.length} karakter
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tips Menulis Catatan:</h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Catat poin-poin penting yang dibahas</li>
            <li>Berikan feedback yang konstruktif</li>
            <li>Tulis dengan jelas dan terstruktur</li>
            <li>Mahasiswa dapat melihat catatan ini untuk referensi</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(`/dosen/sessions/${id}`)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-4 h-4" />
            Batal
          </button>
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Menyimpan...' : 'Simpan Catatan'}
          </button>
        </div>
      </form>

      {/* Previous Notes */}
      {session.notes && session.notes.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Catatan Sebelumnya
          </h3>
          <div className="space-y-4">
            {session.notes.map((note, index) => (
              <div key={note.id} className="border-l-4 border-gray-300 bg-gray-50 rounded-r-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{note.dosen?.nama}</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(note.createdAt, 'DD MMM YYYY, HH:mm')}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                    Pertemuan #{session.notes.length - index}
                  </span>
                </div>
                
                <div className="mt-3 space-y-2">
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Catatan:</p>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{note.content}</p>
                  </div>
                  
                  {note.tasks && (
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Tugas:</p>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{note.tasks}</p>
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

export default AddNotes;