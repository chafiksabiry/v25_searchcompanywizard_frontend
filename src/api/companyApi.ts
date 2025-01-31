import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const saveCompanyData = async (companyData: any) => {
  try {
    const response = await axios.post(`${API_URL}/companies`, companyData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error saving company data:', error.response?.data || error.message);
    throw error;
  }
};
