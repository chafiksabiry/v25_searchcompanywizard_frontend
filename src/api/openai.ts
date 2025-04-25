import OpenAI from "openai";
import Cookies from "js-cookie"; // 👈 Import Cookies

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const deploymentMode = import.meta.env.VITE_DEPLOYMENT_MODE;

export interface CompanyProfile {
  userId: string;
  name: string;
  logo?: string;
  industry?: string;
  founded?: string;
  headquarters?: string;
  overview: string;
  mission?: string;
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
  companyInfo: string
): Promise<CompanyProfile> => {
  if (!apiKey) {
    throw new Error("OpenAI API key is not configured");
  }

  let userId: string;
  
  if (deploymentMode === 'standalone') {
    userId = '680a27ffefa3d29d628d0016';
  } else {
    const cookieUserId = Cookies.get("userId");
    if (!cookieUserId) {
      throw new Error("User ID not found in cookies");
    }
    userId = cookieUserId;
  }

  try {
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a professional company profiler. Create a detailed company profile in JSON format based on the provided information. 
          The JSON response must include ALL of the following fields:
          {
            "name": "string",
            "industry": "string",
            "founded": "string (year)",
            "headquarters": "string (location)",
            "overview": "string (detailed company description)",
            "mission": "string (company mission statement)",
            "culture": {
              "values": ["array of at least 3 company values"],
              "benefits": ["array of at least 3 company benefits"],
              "workEnvironment": "string (detailed description)"
            },
            "opportunities": {
              "roles": ["array of at least 3 available roles"],
              "growthPotential": "string (detailed growth opportunities)",
              "training": "string (training and development details)"
            },
            "technology": {
              "stack": ["array of at least 3 technologies used"],
              "innovation": "string (innovation approach)"
            },
            "contact": {
              "website": "string (company website)",
              "email": "string (contact email)",
              "phone": "string (contact phone)",
              "address": "string (physical address)"
            },
            "socialMedia": {
              "linkedin": "string (LinkedIn URL)",
              "twitter": "string (Twitter URL)",
              "facebook": "string (optional)",
              "instagram": "string (optional)"
            }
          }
          
          If any information is not explicitly provided, make reasonable assumptions based on the company's industry and description.`,
        },
        {
          role: "user",
          content: `Generate a JSON company profile for: ${companyInfo}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    const parsedProfile = JSON.parse(content) as Omit<CompanyProfile, "userId">;

    return {
      userId, // 👈 Attach the userId
      ...parsedProfile,
      culture: {
        ...parsedProfile.culture,
        values: parsedProfile.culture?.values || [],
        benefits: parsedProfile.culture?.benefits || [],
        workEnvironment: parsedProfile.culture?.workEnvironment || "",
      },
      opportunities: {
        ...parsedProfile.opportunities,
        roles: parsedProfile.opportunities?.roles || [],
        growthPotential: parsedProfile.opportunities?.growthPotential || "",
        training: parsedProfile.opportunities?.training || "",
      },
      technology: {
        ...parsedProfile.technology,
        stack: parsedProfile.technology?.stack || [],
        innovation: parsedProfile.technology?.innovation || "",
      },
      contact: {
        ...parsedProfile.contact,
        email: parsedProfile.contact?.email || "",
        phone: parsedProfile.contact?.phone || "",
        address: parsedProfile.contact?.address || "",
        website: parsedProfile.contact?.website || "",
      },
      socialMedia: {
        ...parsedProfile.socialMedia,
        linkedin: parsedProfile.socialMedia?.linkedin || "",
        twitter: parsedProfile.socialMedia?.twitter || "",
        facebook: parsedProfile.socialMedia?.facebook || "",
        instagram: parsedProfile.socialMedia?.instagram || "",
      },
    };
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw new Error("Failed to generate company profile");
  }
};
