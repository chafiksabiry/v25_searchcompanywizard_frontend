import axios from 'axios';

const API_URL = 'http://localhost:3000';

export interface CompanySearchResult {
  id: string;
  name: string;
  description?: string;
  websiteUrl?: string;
  industry?: string;
  employeeCount?: number;
  specialties?: string[];
}

export const linkedInApi = {
  getAuthUrl: async () => {
    const response = await axios.get(`${API_URL}/auth/linkedin`);
    return response.data.url;
  },

  searchCompany: async (name: string): Promise<CompanySearchResult[]> => {
    const response = await axios.get(`${API_URL}/api/company/${encodeURIComponent(name)}`, {
      withCredentials: true
    });
    return response.data;
  }
};