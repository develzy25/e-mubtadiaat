import React, { useState } from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { LIRBOYO_SCHEDULE_SEED } from '../../../mocks/schedule.seed';
import { PrototypeModal } from '../../../components/ui/PrototypeModal';

export const TeachingScheduleWidget: React.FC = () => {
  const [showProtoModal, setShowProtoModal] = useState(false);

  // Map schedule items to UI items
  const scheduleItems = LIRBOYO_SCHEDULE_SEED.slice(0, 3).map((item, idx) => ({
    timeStart: item.session === 1 ? '07:30' : '09:00',
    timeEnd: item.session === 1 ? '08:30' : '10:00',
    subject: item.subjectName,
    classGroup: `${item.bagianClass} (${item.lokalRoom})`,
    teacher: item.teacherName,
    status: idx === 0 ? 'Sedang Berlangsung' : 'Akan Datang',
    badgeColor: idx === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700',
  }));

  return (
    <GlassCard variant="neumorph" className="w-full my-6 p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-800">Jadwal Mengajar Hari Ini</h3>
        <button 
          type="button" 
          onClick={() => setShowProtoModal(true)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
        >
          Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {scheduleItems.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 neumorph-pressed rounded-2xl gap-3">
            {/* Left: Time */}
            <div className="flex flex-col items-center justify-center shrink-0 w-14 border-r border-slate-200/60 pr-2">
              <span className="text-xs font-extrabold text-slate-800">{item.timeStart}</span>
              <span className="text-[10px] font-medium text-slate-400">{item.timeEnd}</span>
            </div>

            {/* Center: Icon & Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800 truncate">{item.subject}</span>
                  <span className="text-[11px] font-semibold text-blue-600 shrink-0">{item.classGroup}</span>
                </div>
                <span className="text-xs text-slate-500 truncate">Pengajar: {item.teacher}</span>
              </div>
            </div>

            {/* Right: Status Badge */}
            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${item.badgeColor}`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>

      {/* Prototype Warning Modal */}
      <PrototypeModal 
        isOpen={showProtoModal} 
        onClose={() => setShowProtoModal(false)} 
        featureName="Jadwal Mengajar Seluruhnya" 
      />
    </GlassCard>
  );
};
