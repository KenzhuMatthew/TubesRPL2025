// pages/mahasiswa/AddCourseSchedule.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Save, X, BookOpen } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import ConflictChecker from '../../components/schedule/ConflictChecker';
import { addMahasiswaSchedule } from '../../api/mahasiswa.api';
import { toast } from 'react-hot-toast';

const DAYS = [
  { value: 1, label: 'Senin' },
  { value: 2, label: 'Selasa' },
  { value: 3, label: 'Rabu' },
  { value: 4, label: 'Kamis' },
  { value: 5, label: 'Jumat' },
  { value: 6, label: 'Sabtu' },
];

const AddCourseSchedule = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    courseName: '',
    semester: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflicts, setConflicts] = useState([]);

  const validate = () => {
    const newErrors = {};

    if (!formData.dayOfWeek) newErrors.dayOfWeek = 'Hari harus dipilih';
    if (!formData.startTime) newErrors.startTime = 'Waktu mulai harus diisi';
    if (!formData.endTime) newErrors.endTime = 'Waktu selesai harus diisi';
    if (!formData.courseName) newErrors.courseName = 'Nama mata kuliah harus diisi';
    if (!formData.semester) newErrors.semester = 'Semester harus diisi';

    if (formData.startTime && formData.endTime) {
      if (formData.startTime >= formData.endTime) {
        newErrors.endTime = 'Waktu selesai harus lebih besar dari waktu mulai';
      }
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

    if (conflicts.length > 0) {
      toast.error('Terdapat konflik jadwal. Silakan pilih waktu lain.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addMahasiswaSchedule({
        ...formData,
        dayOfWeek: parseInt(formData.dayOfWeek),
      });
      toast.success('Jadwal kuliah berhasil ditambahkan');
      navigate('/mahasiswa/schedules');
    } catch (error) {
      console.error('Error adding schedule:', error);
      toast.error(error.response?.data?.message || 'Gagal menambahkan jadwal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Tambah Jadwal Kuliah"
        description="Tambahkan jadwal kuliah Anda untuk mencegah konflik dengan jadwal bimbingan"
        showBack={true}
        backTo="/mahasiswa/schedules"
      />

      {/* Info Alert */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-1">
              Pentingnya Mengisi Jadwal Kuliah
            </h3>
            <p className="text-sm text-blue-800">
              Sistem akan menggunakan jadwal kuliah Anda untuk mencegah konflik saat mengajukan jadwal bimbingan dengan dosen pembimbing.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Day */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4" />
            Hari <span className="text-red-500">*</span>
          </label>
          <select
            name="dayOfWeek"
            value={formData.dayOfWeek}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.dayOfWeek ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Pilih Hari</option>
            {DAYS.map(day => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
          {errors.dayOfWeek && (
            <p className="text-red-500 text-xs mt-1">{errors.dayOfWeek}</p>
          )}
        </div>

        {/* Time Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4" />
              Waktu Mulai <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.startTime ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.startTime && (
              <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4" />
              Waktu Selesai <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.endTime ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.endTime && (
              <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>
            )}
          </div>
        </div>

        {/* Course Name */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <BookOpen className="w-4 h-4" />
            Nama Mata Kuliah <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="courseName"
            value={formData.courseName}
            onChange={handleChange}
            placeholder="Contoh: Pemrograman Web"
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.courseName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.courseName && (
            <p className="text-red-500 text-xs mt-1">{errors.courseName}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Masukkan nama lengkap mata kuliah sesuai KRS Anda
          </p>
        </div>

        {/* Semester */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Semester <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            placeholder="Contoh: Ganjil 2024/2025"
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.semester ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.semester && (
            <p className="text-red-500 text-xs mt-1">{errors.semester}</p>
          )}
        </div>

        {/* Conflict Checker */}
        {formData.dayOfWeek && formData.startTime && formData.endTime && (
          <ConflictChecker
            schedules={[]} // Will be loaded from useSchedule hook if integrated
            newSchedule={formData}
            onConflictChange={(conflicts) => setConflicts(conflicts)}
          />
        )}

        {/* Tips */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-amber-900 mb-2">💡 Tips:</h4>
          <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
            <li>Masukkan semua jadwal kuliah Anda di semester ini</li>
            <li>Pastikan waktu yang dimasukkan sesuai dengan jadwal resmi</li>
            <li>Jadwal ini akan membantu dosen melihat ketersediaan Anda</li>
            <li>Anda dapat mengedit atau menghapus jadwal kapan saja</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/mahasiswa/schedules')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-4 h-4" />
            Batal
          </button>
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || conflicts.length > 0}
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Menyimpan...' : 'Simpan Jadwal'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCourseSchedule;