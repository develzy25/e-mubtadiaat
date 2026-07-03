import { getHeaders } from './admin.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787/api';

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'API request failed');
  }
  return res.json();
};

// --- BLOK ---
export const fetchBlok = async () => handleResponse(await fetch(`${API_URL}/admin/master/blok`, { headers: getHeaders() }));
export const createBlok = async (data: any) => handleResponse(await fetch(`${API_URL}/admin/master/blok`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }));
export const updateBlok = async (id: string, data: any) => handleResponse(await fetch(`${API_URL}/admin/master/blok/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }));
export const deleteBlok = async (id: string) => handleResponse(await fetch(`${API_URL}/admin/master/blok/${id}`, { method: 'DELETE', headers: getHeaders() }));

// --- KAMAR ---
export const fetchKamar = async () => handleResponse(await fetch(`${API_URL}/admin/master/kamar`, { headers: getHeaders() }));
export const createKamar = async (data: any) => handleResponse(await fetch(`${API_URL}/admin/master/kamar`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }));
export const updateKamar = async (id: string, data: any) => handleResponse(await fetch(`${API_URL}/admin/master/kamar/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }));
export const deleteKamar = async (id: string) => handleResponse(await fetch(`${API_URL}/admin/master/kamar/${id}`, { method: 'DELETE', headers: getHeaders() }));

// --- JENJANG ---
export const fetchJenjang = async () => handleResponse(await fetch(`${API_URL}/admin/master/jenjang`, { headers: getHeaders() }));
export const createJenjang = async (data: any) => handleResponse(await fetch(`${API_URL}/admin/master/jenjang`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }));
export const updateJenjang = async (id: string, data: any) => handleResponse(await fetch(`${API_URL}/admin/master/jenjang/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }));
export const deleteJenjang = async (id: string) => handleResponse(await fetch(`${API_URL}/admin/master/jenjang/${id}`, { method: 'DELETE', headers: getHeaders() }));

// --- TINGKAT ---
export const fetchTingkat = async () => handleResponse(await fetch(`${API_URL}/admin/master/tingkat`, { headers: getHeaders() }));
export const createTingkat = async (data: any) => handleResponse(await fetch(`${API_URL}/admin/master/tingkat`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }));
export const updateTingkat = async (id: string, data: any) => handleResponse(await fetch(`${API_URL}/admin/master/tingkat/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }));
export const deleteTingkat = async (id: string) => handleResponse(await fetch(`${API_URL}/admin/master/tingkat/${id}`, { method: 'DELETE', headers: getHeaders() }));

// --- KELAS ---
export const fetchKelas = async () => handleResponse(await fetch(`${API_URL}/admin/master/kelas`, { headers: getHeaders() }));
export const createKelas = async (data: any) => handleResponse(await fetch(`${API_URL}/admin/master/kelas`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }));
export const updateKelas = async (id: string, data: any) => handleResponse(await fetch(`${API_URL}/admin/master/kelas/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }));
export const deleteKelas = async (id: string) => handleResponse(await fetch(`${API_URL}/admin/master/kelas/${id}`, { method: 'DELETE', headers: getHeaders() }));

// --- KITAB ---
export const fetchKitab = async () => handleResponse(await fetch(`${API_URL}/admin/master/kitab`, { headers: getHeaders() }));
export const createKitab = async (data: any) => handleResponse(await fetch(`${API_URL}/admin/master/kitab`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }));
export const updateKitab = async (id: string, data: any) => handleResponse(await fetch(`${API_URL}/admin/master/kitab/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }));
export const deleteKitab = async (id: string) => handleResponse(await fetch(`${API_URL}/admin/master/kitab/${id}`, { method: 'DELETE', headers: getHeaders() }));

// --- JADWAL PELAJARAN ---
export const fetchJadwal = async (classId: string, kwartal: number, year: string) => handleResponse(await fetch(`${API_URL}/admin/master/jadwal/${classId}?kwartal=${kwartal}&year=${year}`, { headers: getHeaders() }));
export const saveJadwalBatch = async (data: any) => handleResponse(await fetch(`${API_URL}/admin/master/jadwal/batch`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }));

// --- RAPOT ---
export const fetchRapotGrid = async (classId: string, semester: string, year: string) => handleResponse(await fetch(`${API_URL}/admin/rapot/kelas/${classId}?semester=${semester}&year=${year}`, { headers: getHeaders() }));
export const saveRapotBatch = async (data: any) => handleResponse(await fetch(`${API_URL}/admin/rapot/input`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }));
export const fetchNilaiAm = async (classId: string, semester: string, year: string) => handleResponse(await fetch(`${API_URL}/admin/rapot/nilai-am/${classId}?semester=${semester}&year=${year}`, { headers: getHeaders() }));
export const fetchRekap = async (santriId: string, year: string) => handleResponse(await fetch(`${API_URL}/admin/rapot/rekap/${santriId}?year=${year}`, { headers: getHeaders() }));
export const finalizeKelas = async (data: any) => handleResponse(await fetch(`${API_URL}/admin/rapot/finalize`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }));

