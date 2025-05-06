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
      if (error.response.data?.details) {
        console.error('Validation errors:', error.response.data.details);
      }
    }
    throw error;
  }
};

export const updateCompanyData = async (companyId: string = "680a036b5736a7a7cf2451ad", companyData: any) => {
  try {
    // const companyId = "680bec7495ee2e5862009486";
    const response = await axios.put(`${import.meta.env.VITE_API_URL}/companies/${companyId}`, companyData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating company data:', error.response?.data || error.message);
    if (error.response) {
      console.error('Response error details:', error.response);
    }
    throw error;
  }
};
