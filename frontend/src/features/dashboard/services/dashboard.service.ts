const API_URL = import.meta.env.VITE_API_URL || 'https://backend.eppds.workers.dev/api';

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
  const response = await fetch(`${API_URL}/dashboard/summary${query}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard summary');
  }
  
  return response.json();
};
