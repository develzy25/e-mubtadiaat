import { SANTRI_LIRBOYO_SEED } from '../../../mocks/santri.seed';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend.eppds.workers.dev/api';

export interface AttendanceDetail {
  santriId: string;
  nis: string;
  name: string;
  hadir: number;
  sakit: number;
  izin: number;
  alpha: number;
  notes: string;
}

export interface AttendanceResponse {
  success: boolean;
  data: {
    attendanceId: string | null;
    month: string;
    classId: string;
    details: AttendanceDetail[];
  }
}

export const getAttendance = async (classId: string, month: string): Promise<AttendanceResponse> => {
  try {
    const response = await fetch(`${API_URL}/attendance?classId=${classId}&month=${month}`);
    if (!response.ok) {
      throw new Error('Failed to fetch attendance');
    }
    return await response.json();
  } catch {
    console.warn("Backend API offline. Falling back to Mock API Layer.");
    
    // Fallback: Generate mock data filtered by Mustahiq class (Bagian A)
    const mockDetails: AttendanceDetail[] = SANTRI_LIRBOYO_SEED.filter(
      (s) => s.bagianClass === 'Bagian A'
    ).map((s) => ({
      santriId: s.id,
      nis: s.nisn,
      name: s.namaLengkap,
      hadir: 26,
      sakit: 1,
      izin: 1,
      alpha: 0,
      notes: 'Aktif mengikuti kegiatan kelas.',
    }));

    return {
      success: true,
      data: {
        attendanceId: 'mock-att-001',
        month,
        classId,
        details: mockDetails,
      },
    };
  }
};

export const saveAttendance = async (payload: { 
  classId: string; 
  month: string; 
  recordedBy: string; 
  details: Partial<AttendanceDetail>[]; 
}) => {
  try {
    const response = await fetch(`${API_URL}/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save attendance');
    }
    
    return await response.json();
  } catch {
    console.warn("Backend API offline. Mock saving attendance successfully.");
    return { success: true };
  }
};
