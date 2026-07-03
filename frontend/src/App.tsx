import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './cache/queryClient';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { MustahiqDashboard } from './features/dashboard/MustahiqDashboard';
import { AttendancePage } from './features/attendance/AttendancePage';
import { KelasPage } from './features/kelas/KelasPage';
import { MemorizationPage } from './features/memorization/MemorizationPage';
import { ProfilPage } from './features/profile/ProfilPage';
import { JadwalPage } from './features/schedule/JadwalPage';
import { InputNilaiPage } from './features/grades/InputNilaiPage';
import { RekapNilaiPage } from './features/grades/RekapNilaiPage';
import { ERaportPage } from './features/grades/ERaportPage';
import { SertifikatPage } from './features/sertifikat/SertifikatPage';
import { TamrinPage } from './features/tamrin/TamrinPage';
import { LoginPage } from './features/auth/LoginPage';

// Admin imports
import { AdminDashboard } from './features/admin/pages/AdminDashboard';
import { AdminSantriPage } from './features/admin/pages/AdminSantriPage';
import { AdminKelasPage } from './features/admin/pages/AdminKelasPage';
import { AdminAlumniPage } from './features/admin/pages/AdminAlumniPage';
import { AdminUsersPage } from './features/admin/pages/AdminUsersPage';
import { AdminSyncPage } from './features/admin/pages/AdminSyncPage';
import { AdminLogsPage } from './features/admin/pages/AdminLogsPage';
import { AdminBlokKamarPage } from './features/admin/pages/AdminBlokKamarPage';
import { AdminJadwalPage } from './features/admin/pages/AdminJadwalPage';
import { AdminRapotPage } from './features/admin/pages/AdminRapotPage';
import { NotificationRenderer } from './components/ui';

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <NotificationRenderer />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            
            <Route element={<ProtectedRoute />}>
              {/* PWA Mobile Layout */}
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<MustahiqDashboard />} />
                <Route path="/kelas" element={<KelasPage />} />
                <Route path="/hafalan" element={<MemorizationPage />} />
                <Route path="/profil" element={<ProfilPage />} />
                <Route path="/jadwal" element={<JadwalPage />} />
                <Route path="/nilai" element={<InputNilaiPage />} />
                <Route path="/rekap-nilai" element={<RekapNilaiPage />} />
                <Route path="/raport" element={<ERaportPage />} />
                <Route path="/sertifikat" element={<SertifikatPage />} />
                <Route path="/tamrin" element={<TamrinPage />} />
                <Route path="/absensi" element={<AttendancePage />} />
              </Route>

              {/* Web Admin Desktop Layout */}
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/santri" element={<AdminSantriPage />} />
                <Route path="/admin/kelas-kitab" element={<AdminKelasPage />} />
                <Route path="/admin/alumni" element={<AdminAlumniPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/sync" element={<AdminSyncPage />} />
                <Route path="/admin/logs" element={<AdminLogsPage />} />
                <Route path="/admin/blok-kamar" element={<AdminBlokKamarPage />} />
                <Route path="/admin/jadwal" element={<AdminJadwalPage />} />
                <Route path="/admin/rapot" element={<AdminRapotPage />} />
                <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
              </Route>

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
