import axios from "axios";
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_API_URL;

export interface CompanyProfile {
  userId: string;
  name: string;
  logo?: string;
  industry?: string;
  founded?: string;
  headquarters?: string;
  overview: string;
  mission?: string;
  companyIntro?: string;
  culture: {
    values: string[];
    benefits: string[];
    workEnvironment: string;
  };
  opportunities: {
    roles: string[];
    growthPotential: string;
    training: string;
  };
  technology: {
    stack: string[];
    innovation: string;
  };
  contact: {
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  socialMedia: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
}

export const generateCompanyProfile = async (
  companyInfo: string,
  logoUrl?: string
): Promise<CompanyProfile> => {
  const userId = Cookies.get("userId");

  if (!userId) {
    throw new Error("User ID not found in cookies");
  }

  try {
    const response = await axios.post(`${API_URL}/openai/generate-profile`, {
      companyInfo,
      userId,
      logoUrl,
    });

    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || "Failed to generate company profile");
    }

    return response.data.data;
  } catch (error: any) {
    console.error("OpenAI Backend Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to generate company profile");
  }
};

