import axios from 'axios';

export const saveCompanyData = async (companyData: any) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/companies`, companyData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error saving company data:', error.response?.data || error.message);
    if (error.response) {
      console.error('Response error details:', error.response);
    }
    throw error;
  }
  
};
