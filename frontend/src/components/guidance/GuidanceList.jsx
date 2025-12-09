// components/guidance/GuidanceList.jsx
import { FileText } from 'lucide-react';
import GuidanceCard from './GuidanceCard';
import EmptyState from '../common/EmptyState';
import { LoadingSpinner } from '../common/Loading';

const GuidanceList = ({ 
  sessions = [], 
  onSessionClick,
  loading = false,
  emptyTitle = 'Belum ada sesi bimbingan',
  emptyDescription = 'Sesi bimbingan akan muncul di sini',
  variant = 'default' // default or compact
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner className="w-8 h-8" />
        <span className="ml-3 text-gray-600">Memuat sesi...</span>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className={`space-y-4 ${variant === 'compact' ? 'space-y-3' : 'space-y-4'}`}>
      {sessions.map(session => (
        <GuidanceCard
          key={session.id}
          session={session}
          onClick={() => onSessionClick && onSessionClick(session)}
          variant={variant}
        />
      ))}
    </div>
  );
};

export default GuidanceList;