// components/schedule/ConflictChecker.jsx
import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, Calendar } from 'lucide-react';
import { formatTimeRange, getDayName } from '../../utils/dateUtils';

const ConflictChecker = ({ 
  schedules = [],
  newSchedule,
  excludeId = null,
  onConflictChange 
}) => {
  const [conflicts, setConflicts] = useState([]);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (newSchedule && newSchedule.dayOfWeek && newSchedule.startTime && newSchedule.endTime) {
      checkConflicts();
    } else {
      setConflicts([]);
      onConflictChange && onConflictChange([]);
    }
  }, [newSchedule, schedules]);

  const checkConflicts = () => {
    setIsChecking(true);
    
    // Filter schedules for the same day, excluding current schedule if editing
    const sameDaySchedules = schedules.filter(s => 
      s.dayOfWeek === newSchedule.dayOfWeek && 
      s.id !== excludeId
    );

    // Check for time overlaps
    const foundConflicts = sameDaySchedules.filter(schedule => {
      const newStart = newSchedule.startTime;
      const newEnd = newSchedule.endTime;
      const existingStart = schedule.startTime;
      const existingEnd = schedule.endTime;

      // Check if there's any overlap
      return (
        (newStart >= existingStart && newStart < existingEnd) || // New starts during existing
        (newEnd > existingStart && newEnd <= existingEnd) ||     // New ends during existing
        (newStart <= existingStart && newEnd >= existingEnd)     // New completely covers existing
      );
    });

    setConflicts(foundConflicts);
    onConflictChange && onConflictChange(foundConflicts);
    setIsChecking(false);
  };

  const hasConflicts = conflicts.length > 0;

  if (!newSchedule || !newSchedule.dayOfWeek || !newSchedule.startTime || !newSchedule.endTime) {
    return null;
  }

  return (
    <div className={`rounded-lg border-2 p-4 ${
      hasConflicts 
        ? 'bg-red-50 border-red-200' 
        : 'bg-green-50 border-green-200'
    }`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {hasConflicts ? (
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
        ) : (
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
        )}
        
        <div className="flex-1">
          <h4 className={`font-semibold mb-1 ${
            hasConflicts ? 'text-red-900' : 'text-green-900'
          }`}>
            {hasConflicts 
              ? `Ditemukan ${conflicts.length} Konflik Jadwal` 
              : 'Tidak Ada Konflik'
            }
          </h4>
          <p className={`text-sm ${
            hasConflicts ? 'text-red-800' : 'text-green-800'
          }`}>
            {hasConflicts
              ? 'Jadwal yang Anda masukkan bertabrakan dengan jadwal berikut:'
              : 'Jadwal dapat ditambahkan tanpa konflik'
            }
          </p>
        </div>
      </div>

      {/* New Schedule Info */}
      <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
        <p className="text-xs font-medium text-gray-600 mb-2">Jadwal Baru:</p>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-gray-700">
            <Calendar className="w-4 h-4" />
            <span>{getDayName(newSchedule.dayOfWeek)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-700">
            <Clock className="w-4 h-4" />
            <span>{formatTimeRange(newSchedule.startTime, newSchedule.endTime)}</span>
          </div>
        </div>
        {newSchedule.courseName && (
          <p className="text-sm font-medium text-gray-900 mt-2">
            {newSchedule.courseName}
          </p>
        )}
      </div>

      {/* Conflict Details */}
      {hasConflicts && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-red-900 mb-2">
            Konflik dengan jadwal:
          </p>
          {conflicts.map((conflict, idx) => (
            <div 
              key={conflict.id || idx}
              className="p-3 bg-white rounded-lg border border-red-200"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h5 className="font-medium text-gray-900 text-sm">
                  {conflict.courseName}
                </h5>
                <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full whitespace-nowrap">
                  Konflik
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{formatTimeRange(conflict.startTime, conflict.endTime)}</span>
                </div>
                {conflict.room && (
                  <span className="text-xs">📍 {conflict.room}</span>
                )}
              </div>

              {/* Overlap visualization */}
              <div className="mt-3">
                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                  {/* Existing schedule */}
                  <div 
                    className="absolute h-full bg-blue-400"
                    style={{
                      left: '20%',
                      width: '40%'
                    }}
                  />
                  {/* New schedule (overlapping) */}
                  <div 
                    className="absolute h-full bg-red-500 opacity-70"
                    style={{
                      left: '30%',
                      width: '40%'
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Jadwal Existing</span>
                  <span className="text-red-600">Overlap</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {hasConflicts && (
        <div className="mt-4 pt-4 border-t border-red-200">
          <p className="text-xs font-medium text-red-900 mb-2">
            💡 Saran:
          </p>
          <ul className="text-xs text-red-800 space-y-1 list-disc list-inside">
            <li>Pilih hari atau waktu yang berbeda</li>
            <li>Ubah jadwal yang sudah ada jika memungkinkan</li>
            <li>Koordinasi dengan dosen untuk memilih waktu lain</li>
          </ul>
        </div>
      )}
    </div>
  );
};

// Compact version for inline validation
export const ConflictIndicator = ({ hasConflict, conflictCount }) => {
  if (!hasConflict) {
    return (
      <div className="flex items-center gap-1.5 text-green-600 text-sm">
        <CheckCircle className="w-4 h-4" />
        <span>Tidak ada konflik</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-red-600 text-sm">
      <AlertTriangle className="w-4 h-4" />
      <span>{conflictCount} konflik ditemukan</span>
    </div>
  );
};

// Real-time conflict checker with API call
export const ConflictCheckerLive = ({ 
  scheduleData, 
  onCheck,
  checkAPI 
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (scheduleData && scheduleData.dayOfWeek && scheduleData.startTime && scheduleData.endTime) {
      checkWithAPI();
    }
  }, [scheduleData]);

  const checkWithAPI = async () => {
    setIsChecking(true);
    try {
      const response = await checkAPI(scheduleData);
      setResult(response.data);
      onCheck && onCheck(response.data);
    } catch (error) {
      console.error('Conflict check error:', error);
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex items-center gap-2 text-gray-600 text-sm py-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
        <span>Memeriksa konflik...</span>
      </div>
    );
  }

  if (!result) return null;

  return (
    <ConflictIndicator 
      hasConflict={result.hasConflict} 
      conflictCount={result.conflicts?.length || 0}
    />
  );
};

export default ConflictChecker;