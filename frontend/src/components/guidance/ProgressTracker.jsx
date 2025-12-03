// components/guidance/ProgressTracker.jsx
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';

const ProgressTracker = ({ 
  completed = 0, 
  required = 0, 
  label = 'Bimbingan',
  showDetails = true 
}) => {
  const percentage = Math.min((completed / required) * 100, 100);
  const isMet = completed >= required;
  const remaining = Math.max(required - completed, 0);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900">{completed}</span>
          <span className="text-gray-600">/ {required}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isMet ? 'bg-green-600' : 'bg-blue-600'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {/* Percentage Label */}
        <div className="absolute -top-1 right-0 transform translate-x-full pl-2">
          <span className="text-xs font-medium text-gray-600">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="flex items-start gap-2 mt-2">
          {isMet ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-green-700">
                Target terpenuhi
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-amber-700">
                Perlu {remaining} bimbingan lagi
              </span>
            </>
          )}
        </div>
      )}

      {/* Milestones (Optional) */}
      {required > 0 && (
        <div className="flex justify-between pt-2">
          {Array.from({ length: required }, (_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              {i < completed ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Circle className="w-5 h-5 text-gray-300" />
              )}
              <span className="text-xs text-gray-600">{i + 1}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Compact version for cards
export const ProgressTrackerCompact = ({ completed, required, label }) => {
  const percentage = Math.min((completed / required) * 100, 100);
  const isMet = completed >= required;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-700">{label}</span>
        <span className="font-medium text-gray-900">
          {completed}/{required}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isMet ? 'bg-green-600' : 'bg-blue-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Circular progress version
export const ProgressTrackerCircular = ({ completed, required, size = 120 }) => {
  const percentage = Math.min((completed / required) * 100, 100);
  const isMet = completed >= required;
  
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-500 ${
            isMet ? 'text-green-600' : 'text-blue-600'
          }`}
        />
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{completed}</span>
        <span className="text-xs text-gray-600">dari {required}</span>
      </div>
    </div>
  );
};

export default ProgressTracker;