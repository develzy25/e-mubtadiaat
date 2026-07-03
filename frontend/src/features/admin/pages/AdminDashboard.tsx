import { useState, useEffect } from 'react';
import { 
  Users, 
  UserMinus, 
  UserCheck, 
  School,
  ArrowRight,
  TrendingUp,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { fetchStats } from '../services/admin.service';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Link } from 'react-router';

export const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">Memuat statistik dashboard...</p>
      </div>
    );
  }

  const { metrics, recentActivities, attendanceTrends } = stats || {
    metrics: { active: 0, boyong: 0, cuti: 0, classes: 0 },
    recentActivities: [],
    attendanceTrends: []
  };

  const cards = [
    {
      title: 'Santri Putri Aktif',
      value: metrics.active,
      sub: 'Tercatat aktif saat ini',
      icon: <Users className="w-6 h-6 text-blue-600" />,
      bg: 'bg-blue-500/10',
      border: 'border-blue-200/50'
    },
    {
      title: 'Santri Cuti',
      value: metrics.cuti,
      sub: 'Izin cuti sementara',
      icon: <UserCheck className="w-6 h-6 text-amber-600" />,
      bg: 'bg-amber-500/10',
      border: 'border-amber-200/50'
    },
    {
      title: 'Santri Lulus / Boyong',
      value: metrics.boyong,
      sub: 'Alumni / Tidak aktif',
      icon: <UserMinus className="w-6 h-6 text-rose-600" />,
      bg: 'bg-rose-500/10',
      border: 'border-rose-200/50'
    },
    {
      title: 'Total Kelas refs',
      value: metrics.classes,
      sub: 'Tingkatan Tsanawiyah',
      icon: <School className="w-6 h-6 text-indigo-600" />,
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-200/50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Ringkasan Sistem</h1>
        <p className="text-slate-500 text-sm font-semibold mt-1">
          Selamat datang di e-Mubtadi'aat Portal Utama Administrasi Madrasah MPHM Lirboyo.
        </p>
      </div>

      {/* Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, idx) => (
          <GlassCard 
            key={idx} 
            variant="neumorph" 
            className={`p-6 border ${card.border} hover:scale-[1.02] transition-transform duration-200`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{card.title}</p>
                <h3 className="text-3xl font-black text-slate-800 mt-2 tracking-tight">{card.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${card.bg} flex items-center justify-center neumorph-pressed shrink-0`}>
                {card.icon}
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-wide">
              {card.sub}
            </p>
          </GlassCard>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Graph */}
        <div className="lg:col-span-2">
          <GlassCard variant="neumorph" className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Tren Presensi Santri (%)</h3>
                </div>
                <span className="text-[10px] font-black text-blue-600 bg-blue-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Rata-rata: 98.0%
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mb-6">
                Statistik persentase kehadiran bulanan santri putri tingkat Tsanawiyah.
              </p>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="relative w-full h-48 bg-slate-50/50 rounded-xl border border-slate-200/50 p-4 neumorph-pressed flex items-end">
              <svg className="w-full h-full" viewBox="0 0 500 150">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="5,5" />

                {/* The Line Area */}
                <path
                  d="M 10 120 C 50 110, 100 130, 150 100 C 200 70, 250 85, 300 50 C 350 15, 400 45, 450 30 C 475 22.5, 490 25, 490 25 L 490 150 L 10 150 Z"
                  fill="url(#chartGrad)"
                />

                {/* The Line Path */}
                <path
                  d="M 10 120 C 50 110, 100 130, 150 100 C 200 70, 250 85, 300 50 C 350 15, 400 45, 450 30 C 475 22.5, 490 25, 490 25"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Dots on Vertices */}
                <circle cx="10" cy="120" r="4.5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" />
                <circle cx="150" cy="100" r="4.5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" />
                <circle cx="300" cy="50" r="4.5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" />
                <circle cx="450" cy="30" r="4.5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" />
              </svg>

              {/* Labels */}
              <div className="absolute bottom-2 left-4 right-4 flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-wider">
                {attendanceTrends.map((t: any) => (
                  <span key={t.month}>{t.month} ({t.rate}%)</span>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Recent Activities */}
        <div>
          <GlassCard variant="neumorph" className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Aktivitas Terkini</h3>
              </div>
              <p className="text-xs text-slate-500 font-semibold mb-6">
                Aksi administrasi harian yang dicatat sistem.
              </p>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto max-h-48 pr-1">
              {recentActivities.map((act: any) => (
                <div key={act.id} className="flex gap-3 border-l-2 border-slate-200 pl-4 py-1 relative">
                  <div className="absolute w-2 h-2 rounded-full bg-blue-600 left-[-5px] top-2" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 leading-normal truncate">{act.details || act.action}</p>
                    <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wide">
                      Oleh: {act.userName} &bull; {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <p className="text-xs text-slate-400 font-medium text-center py-6">Tidak ada aktivitas baru.</p>
              )}
            </div>

            <Link 
              to="/admin/logs" 
              className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all"
            >
              Lihat Semua Log Audit
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </GlassCard>
        </div>
      </div>

      {/* Quick Menu */}
      <GlassCard variant="neumorph" className="p-6">
        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide mb-4">Pintasan Menu Utama</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/admin/santri" className="p-4 rounded-xl border border-slate-200/50 bg-white/40 hover:bg-slate-50 flex items-center justify-between group transition-all">
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase">Kelola Database Santri</p>
              <p className="text-[10px] text-slate-400 mt-1">Tambah, edit biodata, set status boyong/cuti</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link to="/admin/users" className="p-4 rounded-xl border border-slate-200/50 bg-white/40 hover:bg-slate-50 flex items-center justify-between group transition-all">
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase">Hak Akses & Wali Kelas</p>
              <p className="text-[10px] text-slate-400 mt-1">Petakan guru ke kelas/angkatan, atur role</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link to="/admin/sync" className="p-4 rounded-xl border border-slate-200/50 bg-white/40 hover:bg-slate-50 flex items-center justify-between group transition-all">
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase">Integrasi Google Sheets</p>
              <p className="text-[10px] text-slate-400 mt-1">Sinkronisasi database dengan spreadsheet</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </GlassCard>
    </div>
  );
};
