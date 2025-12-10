// components/schedule/TimeSlotPicker.jsx
import { useState } from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import { formatTimeRange } from '../../utils/dateUtils';

const TimeSlotPicker = ({ 
  slots = [], 
  selectedSlot, 
  onSelect, 
  disabled = false,
  showDuration = false 
}) => {
  const [hoveredSlot, setHoveredSlot] = useState(null);

  if (slots.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">Tidak ada slot waktu tersedia</p>
        <p className="text-sm text-gray-500 mt-1">
          Pilih tanggal lain atau hubungi dosen
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
        <Clock className="w-4 h-4" />
        <span className="font-medium">Pilih Waktu</span>
        <span className="text-gray-500">({slots.length} slot tersedia)</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {slots.map((slot) => {
          const isSelected = selectedSlot === slot.id;
          const isHovered = hoveredSlot === slot.id;
          const isAvailable = !slot.isBooked;

          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => isAvailable && !disabled && onSelect(slot.id)}
              onMouseEnter={() => setHoveredSlot(slot.id)}
              onMouseLeave={() => setHoveredSlot(null)}
              disabled={!isAvailable || disabled}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200
                ${isSelected 
                  ? 'border-blue-600 bg-blue-50 shadow-md' 
                  : isAvailable
                    ? 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                }
                ${disabled && 'opacity-50 cursor-not-allowed'}
              `}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2">
                  <CheckCircle className="w-6 h-6 text-blue-600 bg-white rounded-full" />
                </div>
              )}

              {/* Time display */}
              <div className="text-center">
                <div className={`font-semibold text-lg mb-1 ${
                  isSelected ? 'text-blue-700' : 'text-gray-900'
                }`}>
                  {slot.startTime}
                </div>
                
                {slot.endTime && (
                  <div className="text-xs text-gray-600">
                    s.d {slot.endTime}
                  </div>
                )}

                {/* Duration badge */}
                {showDuration && slot.duration && (
                  <div className="mt-2">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                      isSelected 
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {slot.duration} mnt
                    </span>
                  </div>
                )}

                {/* Booked indicator */}
                {!isAvailable && (
                  <div className="mt-2">
                    <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">
                      Penuh
                    </span>
                  </div>
                )}
              </div>

              {/* Hover effect */}
              {isHovered && isAvailable && !isSelected && (
                <div className="absolute inset-0 bg-blue-100 opacity-10 rounded-lg pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected slot info */}
      {selectedSlot && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <span className="font-medium">Waktu dipilih:</span>{' '}
            {(() => {
              const selected = slots.find(s => s.id === selectedSlot);
              return selected ? formatTimeRange(selected.startTime, selected.endTime) : '-';
            })()}
          </p>
        </div>
      )}
    </div>
  );
};

// Simplified version for inline use
export const TimeSlotPickerSimple = ({ 
  slots = [], 
  selectedSlot, 
  onSelect, 
  disabled = false 
}) => {
  return (
    <div className="space-y-2">
      {slots.map((slot) => {
        const isSelected = selectedSlot === slot.id;
        const isAvailable = !slot.isBooked;

        return (
          <button
            key={slot.id}
            type="button"
            onClick={() => isAvailable && !disabled && onSelect(slot.id)}
            disabled={!isAvailable || disabled}
            className={`
              w-full p-3 rounded-lg border-2 transition-all text-left
              ${isSelected 
                ? 'border-blue-600 bg-blue-50' 
                : isAvailable
                  ? 'border-gray-300 hover:border-blue-400'
                  : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
              }
              ${disabled && 'opacity-50 cursor-not-allowed'}
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className={`w-5 h-5 ${
                  isSelected ? 'text-blue-600' : 'text-gray-600'
                }`} />
                <div>
                  <div className={`font-medium ${
                    isSelected ? 'text-blue-700' : 'text-gray-900'
                  }`}>
                    {formatTimeRange(slot.startTime, slot.endTime)}
                  </div>
                  {slot.location && (
                    <div className="text-xs text-gray-600">{slot.location}</div>
                  )}
                </div>
              </div>

              {isSelected && (
                <CheckCircle className="w-5 h-5 text-blue-600" />
              )}

              {!isAvailable && (
                <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                  Penuh
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default TimeSlotPicker;