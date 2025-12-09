// components/schedule/ScheduleList.jsx
import { Calendar, Clock, Edit2, Trash2 } from 'lucide-react';
import EmptyState from '../common/EmptyState';

const DAYS_MAP = {
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu',
  7: 'Minggu',
};

const ScheduleList = ({ schedules, onEdit, onDelete, isLoading }) => {
  // Group schedules by day
  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const day = schedule.dayOfWeek;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(schedule);
    return acc;
  }, {});

  // Sort schedules within each day by start time
  Object.keys(groupedSchedules).forEach(day => {
    groupedSchedules[day].sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    );
  });

  // Sort days (1-7)
  const sortedDays = Object.keys(groupedSchedules)
    .map(Number)
    .sort((a, b) => a - b);

  if (schedules.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="Belum ada jadwal kuliah"
        description="Tambahkan jadwal kuliah Anda agar sistem dapat membantu mencegah konflik jadwal bimbingan"
      />
    );
  }

  return (
    <div className="space-y-6">
      {sortedDays.map(day => (
        <div key={day} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Day Header */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b border-blue-200">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">{DAYS_MAP[day]}</h3>
              <span className="text-sm text-gray-600">
                ({groupedSchedules[day].length} jadwal)
              </span>
            </div>
          </div>

          {/* Schedule Items */}
          <div className="divide-y divide-gray-200">
            {groupedSchedules[day].map(schedule => (
              <div
                key={schedule.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {schedule.courseName}
                    </h4>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {schedule.startTime} - {schedule.endTime}
                        </span>
                      </div>
                      
                      {schedule.room && (
                        <div className="flex items-center gap-1">
                          <span>📍 {schedule.room}</span>
                        </div>
                      )}
                    </div>

                    {schedule.semester && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {schedule.semester}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(schedule)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit jadwal"
                      disabled={isLoading}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(schedule)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus jadwal"
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScheduleList;