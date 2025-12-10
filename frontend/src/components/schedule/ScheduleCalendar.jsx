// components/schedule/ScheduleCalendar.jsx
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { 
  formatDate, 
  getMonthCalendar, 
  isToday, 
  getDayName,
  addDays,
  subtractDays 
} from '../../utils/dateUtils';

const DAYS_SHORT = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

const ScheduleCalendar = ({ 
  schedules = [], 
  sessions = [], 
  selectedDate, 
  onDateSelect,
  minDate,
  maxDate,
  highlightDates = [] 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthCalendar = getMonthCalendar(currentMonth);
  const currentMonthName = formatDate(currentMonth, 'MMMM YYYY');

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    onDateSelect && onDateSelect(new Date());
  };

  const isDateDisabled = (date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const getDateSchedules = (date) => {
    const dayOfWeek = date.getDay();
    return schedules.filter(s => s.dayOfWeek === dayOfWeek);
  };

  const getDateSessions = (date) => {
    const dateStr = formatDate(date, 'YYYY-MM-DD');
    return sessions.filter(s => 
      formatDate(s.scheduledDate, 'YYYY-MM-DD') === dateStr
    );
  };

  const isDateHighlighted = (date) => {
    const dateStr = formatDate(date, 'YYYY-MM-DD');
    return highlightDates.some(d => 
      formatDate(d, 'YYYY-MM-DD') === dateStr
    );
  };

  const isSelected = (date) => {
    if (!selectedDate) return false;
    return formatDate(date, 'YYYY-MM-DD') === formatDate(selectedDate, 'YYYY-MM-DD');
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          {currentMonthName}
        </h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Hari Ini
          </button>
          
          <div className="flex items-center gap-1 border border-gray-300 rounded-lg">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS_SHORT.map(day => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {monthCalendar.flat().map((date, idx) => {
          const isCurrentMonthDate = isCurrentMonth(date);
          const isTodayDate = isToday(date);
          const isSelectedDate = isSelected(date);
          const isDisabled = isDateDisabled(date);
          const isHighlighted = isDateHighlighted(date);
          const dateSchedules = getDateSchedules(date);
          const dateSessions = getDateSessions(date);
          const hasEvents = dateSchedules.length > 0 || dateSessions.length > 0;

          return (
            <button
              key={idx}
              onClick={() => !isDisabled && onDateSelect && onDateSelect(date)}
              disabled={isDisabled}
              className={`
                relative aspect-square p-2 rounded-lg transition-all
                ${isCurrentMonthDate ? 'text-gray-900' : 'text-gray-400'}
                ${isTodayDate && !isSelectedDate ? 'bg-blue-100 font-semibold' : ''}
                ${isSelectedDate ? 'bg-blue-600 text-white font-semibold shadow-md' : ''}
                ${!isSelectedDate && !isTodayDate && isCurrentMonthDate && !isDisabled
                  ? 'hover:bg-gray-100'
                  : ''
                }
                ${isDisabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}
                ${isHighlighted && !isSelectedDate ? 'ring-2 ring-blue-400' : ''}
              `}
            >
              <div className="text-sm">{date.getDate()}</div>
              
              {/* Event indicators */}
              {hasEvents && !isSelectedDate && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                  {dateSchedules.length > 0 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  )}
                  {dateSessions.length > 0 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap items-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-100" />
          <span>Hari Ini</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Jadwal Kuliah</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>Sesi Bimbingan</span>
        </div>
      </div>

      {/* Selected date info */}
      {selectedDate && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="mb-2">
            <p className="text-sm font-medium text-gray-900">
              {getDayName(selectedDate)}, {formatDate(selectedDate)}
            </p>
          </div>

          {(() => {
            const dateSchedules = getDateSchedules(selectedDate);
            const dateSessions = getDateSessions(selectedDate);

            if (dateSchedules.length === 0 && dateSessions.length === 0) {
              return (
                <p className="text-sm text-gray-500">Tidak ada jadwal</p>
              );
            }

            return (
              <div className="space-y-2">
                {dateSchedules.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      Jadwal Kuliah ({dateSchedules.length})
                    </p>
                    <div className="space-y-1">
                      {dateSchedules.slice(0, 2).map(schedule => (
                        <div key={schedule.id} className="text-xs text-gray-700 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500" />
                          <span>{schedule.startTime} - {schedule.courseName}</span>
                        </div>
                      ))}
                      {dateSchedules.length > 2 && (
                        <p className="text-xs text-gray-500 pl-4">
                          +{dateSchedules.length - 2} lainnya
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {dateSessions.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      Sesi Bimbingan ({dateSessions.length})
                    </p>
                    <div className="space-y-1">
                      {dateSessions.slice(0, 2).map(session => (
                        <div key={session.id} className="text-xs text-gray-700 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <span>{session.startTime} - Bimbingan</span>
                        </div>
                      ))}
                      {dateSessions.length > 2 && (
                        <p className="text-xs text-gray-500 pl-4">
                          +{dateSessions.length - 2} lainnya
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default ScheduleCalendar;