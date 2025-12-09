// components/guidance/NoteEditor.jsx
import { useState } from 'react';
import { FileText, Save, X } from 'lucide-react';

const NoteEditor = ({ 
  initialContent = '', 
  initialTasks = '',
  onSave,
  onCancel,
  isLoading = false,
  showTasksField = true 
}) => {
  const [content, setContent] = useState(initialContent);
  const [tasks, setTasks] = useState(initialTasks);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    
    if (!content.trim()) {
      newErrors.content = 'Catatan pertemuan harus diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    onSave({
      content: content.trim(),
      tasks: tasks.trim(),
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          {initialContent ? 'Edit Catatan' : 'Tambah Catatan Bimbingan'}
        </h3>
      </div>

      {/* Content Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Catatan Pertemuan <span className="text-red-500">*</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (errors.content) setErrors(prev => ({ ...prev, content: '' }));
          }}
          rows={8}
          placeholder="Tulis catatan hasil pertemuan bimbingan...&#10;&#10;Contoh:&#10;- Mahasiswa telah menyelesaikan BAB I&#10;- Pembahasan metodologi penelitian&#10;- Revisi rumusan masalah"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
            errors.content ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.content && (
          <p className="text-red-500 text-xs mt-1">{errors.content}</p>
        )}
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500">
            {content.length} karakter
          </p>
          {content.length < 20 && (
            <p className="text-xs text-amber-600">
              Minimum 20 karakter untuk catatan yang bermakna
            </p>
          )}
        </div>
      </div>

      {/* Tasks Editor */}
      {showTasksField && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tugas untuk Pertemuan Berikutnya (Opsional)
          </label>
          <textarea
            value={tasks}
            onChange={(e) => setTasks(e.target.value)}
            rows={6}
            placeholder="Tulis tugas yang harus dikerjakan mahasiswa...&#10;&#10;Contoh:&#10;- Menyelesaikan BAB II (Tinjauan Pustaka)&#10;- Membuat flowchart sistem&#10;- Mengumpulkan data penelitian"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {tasks.length} karakter
          </p>
        </div>
      )}

      {/* Tips */}
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
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            <X className="w-4 h-4" />
            Batal
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || content.length < 20}
        >
          <Save className="w-4 h-4" />
          {isLoading ? 'Menyimpan...' : 'Simpan Catatan'}
        </button>
      </div>
    </div>
  );
};

export default NoteEditor;