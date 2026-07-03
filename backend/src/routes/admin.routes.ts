import { Hono } from 'hono';
import { 
  getAdminStats, 
  getSantriList, 
  createSantri, 
  updateSantri, 
  deleteSantri,
  getUsersList,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  updateUserRole,
  getAuditLogs,
  syncGoogleSheets,
  getProvinces,
  getRegencies,
  getDistricts,
  getVillages
} from '../controllers/admin.controller';

import {
  getBlokList, createBlok, updateBlok, deleteBlok,
  getKamarList, createKamar, updateKamar, deleteKamar,
  getJenjangList, createJenjang, updateJenjang, deleteJenjang,
  getTingkatList, createTingkat, updateTingkat, deleteTingkat,
  getKelasList, createKelas, updateKelas, deleteKelas,
  getKitabList, createKitab, updateKitab, deleteKitab
} from '../controllers/master.controller';

import {
  getJadwal, saveJadwalBatch,
  getRapotGrid, inputRapotBatch, getNilaiAm, getRekap, finalizeKelas
} from '../controllers/academic.controller';

const adminRoutes = new Hono();

// Dashboard Stats
adminRoutes.get('/stats', getAdminStats);

// CRUD Santri
adminRoutes.get('/santri', getSantriList);
adminRoutes.post('/santri', createSantri);
adminRoutes.put('/santri/:id', updateSantri);
adminRoutes.delete('/santri/:id', deleteSantri);

// User & Role Assignment
adminRoutes.get('/users', getUsersList);
adminRoutes.post('/users', createUser);
adminRoutes.put('/users/:id', updateUser);
adminRoutes.delete('/users/:id', deleteUser);
adminRoutes.put('/users/:id/role', updateUserRole);
adminRoutes.post('/users/:id/reset-password', resetUserPassword);

// Regions API Proxy
adminRoutes.get('/regions/provinces', getProvinces);
adminRoutes.get('/regions/regencies/:provinceId', getRegencies);
adminRoutes.get('/regions/districts/:regencyId', getDistricts);
adminRoutes.get('/regions/villages/:districtId', getVillages);

// Master Data: Blok & Kamar
adminRoutes.get('/master/blok', getBlokList);
adminRoutes.post('/master/blok', createBlok);
adminRoutes.put('/master/blok/:id', updateBlok);
adminRoutes.delete('/master/blok/:id', deleteBlok);

adminRoutes.get('/master/kamar', getKamarList);
adminRoutes.post('/master/kamar', createKamar);
adminRoutes.put('/master/kamar/:id', updateKamar);
adminRoutes.delete('/master/kamar/:id', deleteKamar);

// Master Data: Pendidikan (Jenjang, Tingkat, Kelas, Kitab)
adminRoutes.get('/master/jenjang', getJenjangList);
adminRoutes.post('/master/jenjang', createJenjang);
adminRoutes.put('/master/jenjang/:id', updateJenjang);
adminRoutes.delete('/master/jenjang/:id', deleteJenjang);

adminRoutes.get('/master/tingkat', getTingkatList);
adminRoutes.post('/master/tingkat', createTingkat);
adminRoutes.put('/master/tingkat/:id', updateTingkat);
adminRoutes.delete('/master/tingkat/:id', deleteTingkat);

adminRoutes.get('/master/kelas', getKelasList);
adminRoutes.post('/master/kelas', createKelas);
adminRoutes.put('/master/kelas/:id', updateKelas);
adminRoutes.delete('/master/kelas/:id', deleteKelas);

adminRoutes.get('/master/kitab', getKitabList);
adminRoutes.post('/master/kitab', createKitab);
adminRoutes.put('/master/kitab/:id', updateKitab);
adminRoutes.delete('/master/kitab/:id', deleteKitab);

// Academic: Jadwal Pelajaran
adminRoutes.get('/master/jadwal/:classId', getJadwal);
adminRoutes.post('/master/jadwal/batch', saveJadwalBatch);

// Academic: e-Raport
adminRoutes.get('/rapot/kelas/:classId', getRapotGrid);
adminRoutes.post('/rapot/input', inputRapotBatch);
adminRoutes.post('/rapot/finalize', finalizeKelas);
adminRoutes.get('/rapot/nilai-am/:classId', getNilaiAm);
adminRoutes.get('/rapot/rekap/:santriId', getRekap);

// Audit logs
adminRoutes.get('/logs', getAuditLogs);

// Google Sheets Sync
adminRoutes.post('/sync/sheets', syncGoogleSheets);

export { adminRoutes };
