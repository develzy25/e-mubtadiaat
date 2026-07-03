import { useState } from 'react';
import { 
  FileSpreadsheet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  HelpCircle,
  Calendar
} from 'lucide-react';
import { syncGoogleSheets } from '../services/admin.service';
import { GlassCard } from '../../../components/ui/GlassCard';
import { PremiumButton } from '../../../components/ui/PremiumButton';
import { SoftInput } from '../../../components/ui/SoftInput';

interface SyncLog {
  action: 'IMPORT' | 'EXPORT';
  timestamp: string;
  details: string;
  status: 'SUCCESS' | 'FAILED';
}

export const AdminSyncPage = () => {
  const [sheetUrl, setSheetUrl] = useState('https://docs.google.com/spreadsheets/d/1aB2c3d4e5f6g7h8i9j0_mubtadiat_database/edit');
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([
    {
      action: 'EXPORT',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      details: 'Ekspor berkala database santri putri (7 records) selesai.',
      status: 'SUCCESS'
    },
    {
      action: 'IMPORT',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      details: 'Sinkronisasi data master baru dari spreadsheet berhasil.',
      status: 'SUCCESS'
    }
  ]);
  const [loadingAction, setLoadingAction] = useState<'IMPORT' | 'EXPORT' | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSync = async (action: 'IMPORT' | 'EXPORT') => {
    if (!sheetUrl.trim()) {
      setNotification({ type: 'error', message: 'Tolong isi URL Google Spreadsheet Anda.' });
      return;
    }

    setLoadingAction(action);
    setNotification(null);

    try {
      const res = await syncGoogleSheets(action, sheetUrl);
      if (res.success) {
        const newLog: SyncLog = {
          action: res.data.action,
          timestamp: res.data.timestamp,
          details: res.data.details,
          status: res.data.status
        };
        setSyncLogs(prev => [newLog, ...prev]);
        setNotification({ 
          type: 'success', 
          message: `Operasi ${action === 'IMPORT' ? 'Impor' : 'Ekspor'} Google Sheets berhasil diselesaikan!` 
        });
      } else {
        setNotification({ type: 'error', message: res.message || 'Gagal terhubung dengan API Google Sheets.' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Integrasi Google Sheets</h1>
        <p className="text-slate-500 text-sm font-semibold mt-1">
          Muara database terpusat: impor data santri baru atau ekspor laporan rekapitulasi nilai langsung ke Spreadsheet.
        </p>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl border flex items-center gap-2 text-xs font-bold uppercase tracking-wide ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
            : 'bg-red-50 border-red-100 text-red-700'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          {notification.message}
        </div>
      )}

      {/* Control panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard variant="neumorph" className="p-6 border border-slate-200/50 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <h3 className="font-extrabold text-slate-800 text-sm uppercase">Konfigurasi Google Spreadsheet</h3>
            </div>

            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Masukkan tautan/URL Google Sheets yang dibagikan (*shared link*). Pastikan akun *service account* aplikasi telah diberi izin akses editor di spreadsheet tersebut untuk membaca atau menulis data.
            </p>

            <SoftInput
              label="URL Google Spreadsheet"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              leftIcon={<FileSpreadsheet className="w-5 h-5 text-emerald-600" />}
            />

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <PremiumButton
                onClick={() => handleSync('IMPORT')}
                isLoading={loadingAction === 'IMPORT'}
                disabled={loadingAction !== null}
                variant="secondary"
                leftIcon={<ArrowDownLeft className="w-5 h-5 text-blue-600" />}
                className="flex-1"
              >
                Impor Data Santri
              </PremiumButton>

              <PremiumButton
                onClick={() => handleSync('EXPORT')}
                isLoading={loadingAction === 'EXPORT'}
                disabled={loadingAction !== null}
                variant="primary"
                leftIcon={<ArrowUpRight className="w-5 h-5" />}
                className="flex-1 shadow-md"
              >
                Ekspor Rekap Database
              </PremiumButton>
            </div>
          </GlassCard>

          {/* Sync logs history */}
          <GlassCard variant="neumorph" className="p-6 border border-slate-200/50">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
              <FileText className="w-5 h-5 text-slate-600" />
              <h3 className="font-extrabold text-slate-800 text-sm uppercase">Riwayat Sinkronisasi</h3>
            </div>

            <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
              {syncLogs.map((log, idx) => (
                <div key={idx} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <p className="font-extrabold text-slate-800 leading-normal">{log.details}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wide flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                      log.action === 'IMPORT' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {log.action === 'IMPORT' ? 'Impor' : 'Ekspor'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                      log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                    }`}>
                      {log.status === 'SUCCESS' ? 'Berhasil' : 'Gagal'}
                    </span>
                  </div>
                </div>
              ))}
              {syncLogs.length === 0 && (
                <p className="text-xs text-slate-400 font-bold text-center py-8 uppercase">Belum ada riwayat operasi.</p>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Informational help card */}
        <div>
          <GlassCard variant="neumorph" className="p-6 border border-slate-200/50 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <HelpCircle className="w-5 h-5 text-slate-600" />
              <h3 className="font-extrabold text-slate-800 text-sm uppercase">Panduan Integrasi</h3>
            </div>

            <div className="text-xs text-slate-600 space-y-4 font-semibold leading-relaxed">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <p className="text-blue-600 font-extrabold text-[10px] uppercase mb-1">Mekanisme Impor</p>
                <p>
                  Sistem akan membaca kolom-kolom Google Sheets yang disepakati (Nama, Stambuk, NIK, dll.), menyaring data duplikat, dan menginsert santri baru ke tabel `santri_refs` di Cloudflare D1.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <p className="text-emerald-600 font-extrabold text-[10px] uppercase mb-1">Mekanisme Ekspor</p>
                <p>
                  Sistem akan menulis ulang (*overwrite*) atau menyisipkan rekapitulasi data santri terbaru dan status keaktifannya ke lembar kerja yang dituju agar pimpinan selalu memegang data terbaru.
                </p>
              </div>

              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                * Catatan: Operasi ini direkam penuh dalam Audit Log demi akuntabilitas data pesantren.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
