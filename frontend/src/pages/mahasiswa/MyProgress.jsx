// pages/mahasiswa/MyProgress.jsx
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, TrendingUp, Calendar } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Loading from '../../components/common/Loading';
import { useGuidance } from '../../hooks/useGuidance';
import { formatDate } from '../../utils/dateUtils';

const MyProgress = () => {
  const { progress, fetchProgress, loading } = useGuidance();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  if (loading && !progress) {
    return <Loading />;
  }

  if (!progress) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Tidak dapat memuat data progress</p>
      </div>
    );
  }

  const thesisType = progress.thesisProject?.tipe || 'TA1';
  const requiredBeforeUTS = thesisType === 'TA1' ? 2 : 3;
  const requiredBeforeUAS = thesisType === 'TA1' ? 2 : 3;
  const totalRequired = requiredBeforeUTS + requiredBeforeUAS;

  const completedBeforeUTS = progress.completedBeforeUTS || 0;
  const completedBeforeUAS = progress.completedBeforeUAS || 0;
  const totalCompleted = completedBeforeUTS + completedBeforeUAS;

  const meetsUTSRequirement = completedBeforeUTS >= requiredBeforeUTS;
  const meetsUASRequirement = completedBeforeUAS >= requiredBeforeUAS;
  const canGraduate = meetsUTSRequirement && meetsUASRequirement;

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Progress Bimbingan"
        description="Pantau kemajuan bimbingan dan kelayakan sidang Anda"
      />

      {/* Overall Status Card */}
      <div className={`rounded-lg border-2 p-6 mb-6 ${
        canGraduate 
          ? 'bg-green-50 border-green-200' 
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-start gap-4">
          {canGraduate ? (
            <CheckCircle className="w-12 h-12 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-12 h-12 text-yellow-600 flex-shrink-0" />
          )}
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">
              {canGraduate ? 'Memenuhi Syarat Sidang' : 'Belum Memenuhi Syarat Sidang'}
            </h2>
            <p className="text-lg mb-3">
              Anda telah menyelesaikan <span className="font-semibold">{totalCompleted} dari {totalRequired}</span> bimbingan yang diperlukan untuk {thesisType}
            </p>
            
            {!canGraduate && (
              <div className="bg-white rounded-lg p-4 mt-4">
                <p className="font-medium text-gray-900 mb-2">Yang perlu diselesaikan:</p>
                <ul className="space-y-1 text-sm">
                  {!meetsUTSRequirement && (
                    <li className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span>Perlu {requiredBeforeUTS - completedBeforeUTS} bimbingan lagi sebelum UTS</span>
                    </li>
                  )}
                  {!meetsUASRequirement && (
                    <li className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span>Perlu {requiredBeforeUAS - completedBeforeUAS} bimbingan lagi sebelum UAS</span>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'timeline'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Timeline
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Before UTS Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Sebelum UTS
              </h3>
              {meetsUTSRequirement ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              )}
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-gray-900">
                  {completedBeforeUTS}
                </span>
                <span className="text-gray-600">/ {requiredBeforeUTS} bimbingan</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    meetsUTSRequirement ? 'bg-green-600' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${Math.min((completedBeforeUTS / requiredBeforeUTS) * 100, 100)}%` }}
                />
              </div>
            </div>

            {progress.utsDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>UTS: {formatDate(progress.utsDate)}</span>
              </div>
            )}
          </div>

          {/* Before UAS Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Sebelum UAS
              </h3>
              {meetsUASRequirement ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              )}
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-gray-900">
                  {completedBeforeUAS}
                </span>
                <span className="text-gray-600">/ {requiredBeforeUAS} bimbingan</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    meetsUASRequirement ? 'bg-green-600' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${Math.min((completedBeforeUAS / requiredBeforeUAS) * 100, 100)}%` }}
                />
              </div>
            </div>

            {progress.uasDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>UAS: {formatDate(progress.uasDate)}</span>
              </div>
            )}
          </div>

          {/* Total Progress Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Total Progress
              </h3>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-gray-900">
                  {totalCompleted}
                </span>
                <span className="text-gray-700">/ {totalRequired} bimbingan selesai</span>
              </div>

              {/* Total Progress Bar */}
              <div className="w-full bg-white rounded-full h-4 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${Math.min((totalCompleted / totalRequired) * 100, 100)}%` }}
                />
              </div>
            </div>

            <p className="text-sm text-gray-700">
              {canGraduate 
                ? '🎉 Selamat! Anda telah memenuhi syarat untuk mengikuti sidang'
                : `Anda perlu menyelesaikan ${totalRequired - totalCompleted} bimbingan lagi untuk memenuhi syarat sidang`
              }
            </p>
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Timeline Bimbingan
          </h3>

          {progress.sessions && progress.sessions.length > 0 ? (
            <div className="space-y-6">
              {progress.sessions.map((session, idx) => (
                <div key={session.id} className="flex gap-4">
                  {/* Timeline Indicator */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      session.status === 'COMPLETED' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {session.status === 'COMPLETED' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-medium">{idx + 1}</span>
                      )}
                    </div>
                    {idx < progress.sessions.length - 1 && (
                      <div className="w-0.5 h-16 bg-gray-300" />
                    )}
                  </div>

                  {/* Session Info */}
                  <div className="flex-1 pb-8">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatDate(session.scheduledDate, 'DD MMMM YYYY')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {session.startTime} - {session.location}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        session.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {session.status === 'COMPLETED' ? 'Selesai' : session.status}
                      </span>
                    </div>

                    {session.notes && session.notes.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3 text-sm">
                        <p className="text-gray-700 line-clamp-2">
                          {session.notes[0].content}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              Belum ada riwayat bimbingan
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyProgress;