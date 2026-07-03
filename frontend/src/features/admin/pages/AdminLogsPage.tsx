import { useState, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  Eye, 
  Database
} from 'lucide-react';
import { fetchAuditLogs } from '../services/admin.service';
import type { AuditLogAdmin } from '../services/admin.service';
import { 
  GlassCard, 
  SoftInput,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal
} from '../../../components/ui';

export const AdminLogsPage = () => {
  const [logs, setLogs] = useState<AuditLogAdmin[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Diff viewer modal
  const [selectedLog, setSelectedLog] = useState<AuditLogAdmin | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchAuditLogs();
        if (res.success) {
          setLogs(res.data);
          setFilteredLogs(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filter logs based on search
  useEffect(() => {
    if (!search.trim()) {
      setFilteredLogs(logs);
      return;
    }
    const q = search.toLowerCase();
    const filtered = logs.filter(l => 
      l.activity.toLowerCase().includes(q) ||
      l.tableName.toLowerCase().includes(q) ||
      l.userId.toLowerCase().includes(q) ||
      l.ipAddress.includes(q)
    );
    setFilteredLogs(filtered);
  }, [search, logs]);

  const formatJSON = (jsonStr: string | null) => {
    if (!jsonStr) return 'Tidak ada data';
    try {
      const parsed = JSON.parse(jsonStr);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Audit Trail Logs</h1>
        <p className="text-slate-500 text-sm font-semibold mt-1">
          Rekam jejak aktivitas krusial sistem (siapa, mengubah apa, kapan, alamat IP, dan data sebelum/sesudah).
        </p>
      </div>

      {/* Filter panel */}
      <GlassCard variant="neumorph" className="p-4 flex gap-4 items-center">
        <div className="relative w-full md:w-80">
          <SoftInput
            placeholder="Cari aktivitas, user, tabel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-5 h-5 text-slate-400" />}
            className="w-full"
          />
        </div>
      </GlassCard>

      {/* Logs Table */}
      <GlassCard variant="neumorph" className="overflow-hidden border border-slate-200/50">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-slate-500 font-semibold text-xs uppercase tracking-wide">Memuat audit logs...</p>
          </div>
        ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>Waktu Kejadian</Th>
                  <Th>Pengguna (User)</Th>
                  <Th>Aktivitas</Th>
                  <Th>Target Tabel</Th>
                  <Th>Alamat IP / Perangkat</Th>
                  <Th className="text-right">Detail</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredLogs.map(log => (
                  <Tr key={log.id}>
                    <Td className="text-slate-600">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </Td>
                    <Td className="font-extrabold text-slate-800">
                      {log.userId}
                    </Td>
                    <Td>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        log.activity.startsWith('CREATE') 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : log.activity.startsWith('UPDATE') 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {log.activity}
                      </span>
                    </Td>
                    <Td className="font-mono text-[10px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <Database className="w-3.5 h-3.5 text-slate-400" />
                        {log.tableName}
                      </div>
                    </Td>
                    <Td className="text-slate-500 text-[10px]">
                      <div>IP: {log.ipAddress}</div>
                      <div className="text-[9px] truncate max-w-xs">{log.device}</div>
                    </Td>
                    <Td className="text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-colors inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Lihat Data
                      </button>
                    </Td>
                  </Tr>
                ))}
                {filteredLogs.length === 0 && (
                  <Tr>
                    <Td colSpan={6} className="text-center py-12 text-slate-400 font-bold uppercase tracking-wider">
                      Belum ada catatan log audit yang terekam.
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
        )}
      </GlassCard>

      {/* JSON Details modal viewer */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Detail Perubahan Data"
        maxWidthClass="max-w-2xl"
        footer={
          <button
            onClick={() => setSelectedLog(null)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
          >
            Tutup Detail
          </button>
        }
      >
        {selectedLog && (
          <>
            <p className="text-[10px] text-slate-500 font-bold uppercase -mt-2 mb-2">
              Log ID: {selectedLog.id} &bull; Aksi: {selectedLog.activity}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide block mb-1">
                  Data Lama (Sebelum)
                </label>
                <pre className="bg-slate-950 text-slate-200 p-3 rounded-xl font-mono text-[10px] overflow-auto max-h-60 neumorph-pressed">
                  {formatJSON(selectedLog.oldData)}
                </pre>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide block mb-1">
                  Data Baru (Sesudah)
                </label>
                <pre className="bg-slate-950 text-slate-200 p-3 rounded-xl font-mono text-[10px] overflow-auto max-h-60 neumorph-pressed">
                  {formatJSON(selectedLog.newData)}
                </pre>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};
