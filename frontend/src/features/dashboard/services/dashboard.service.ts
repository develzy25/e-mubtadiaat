const API_URL = import.meta.env.DEV ? 'http://localhost:8787/api' : 'https://backend.eppds.workers.dev/api';

export interface DashboardSummaryResponse {
  success: boolean;
  data: {
    month: string;
    totalSantri: number;
    attendance: {
      hadir: number;
      sakit: number;
      izin: number;
      alpha: number;
    }
  }
}

export const getDashboardSummary = async (month?: string): Promise<DashboardSummaryResponse> => {
  const query = month ? `?month=${month}` : '';
  const token = localStorage.getItem("better-auth.session_token");
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_URL}/dashboard/summary${query}`, {
    headers
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard summary');
  }
  
  return response.json();
};
