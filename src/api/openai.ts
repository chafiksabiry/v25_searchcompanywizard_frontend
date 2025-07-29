import OpenAI from "openai";
import Cookies from "js-cookie"; // 👈 Import Cookies
import {
  Award,
  Globe2,
  DollarSign,
  TrendingUp,
  Rocket,
  Users,
  ShieldCheck,
  Zap,
} from "lucide-react";

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const deploymentMode = import.meta.env.VITE_DEPLOYMENT_MODE || 'standalone';

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

export const searchCompanyLogo = async (
  companyName: string,
  companyWebsite?: string
): Promise<string | null> => {
  if (!apiKey) {
    return null;
  }

  try {
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "system",
          content: `You are a logo finder assistant. Based on the company name and website, provide the most likely URL for the company's logo. 
          Return only the direct URL to the logo image, or null if you cannot find a reliable logo URL.
          Common logo URL patterns:
          - https://company.com/logo.png
          - https://company.com/assets/logo.svg
          - https://company.com/images/logo.jpg
          - https://logo.clearbit.com/company.com (for Clearbit logo service)
          
          If no direct logo URL is available, use Clearbit's logo service: https://logo.clearbit.com/[domain]
          Return only the URL string, no explanations.`,
        },
        {
          role: "user",
          content: `Find the logo URL for company: ${companyName}${companyWebsite ? ` (Website: ${companyWebsite})` : ''}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 100,
    });

    const content = response.choices[0]?.message?.content;
    if (!content || content.toLowerCase().includes('null')) {
      return null;
    }

    return content.trim();
  } catch (error) {
    console.error("OpenAI Logo Search Error:", error);
    return null;
  }
};

export const generateCompanyProfile = async (
  companyInfo: string
): Promise<CompanyProfile> => {
  if (!apiKey) {
    throw new Error("OpenAI API key is not configured");
  }

  let userId: string;
  
  if (deploymentMode === 'standalone') {
    userId = '681a91212c1ca099fe2b17df';
  } else {
    const cookieUserId = Cookies.get("userId");
    if (!cookieUserId) {
      throw new Error("User ID not found in cookies. Please ensure you are logged in.");
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

    const parsedProfile = JSON.parse(content) as Omit<CompanyProfile, "userId" | "companyIntro">;

    // Generate company intro
    const companyIntro = await generateCompanyIntro({
      userId,
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
    });

    return {
      userId, // 👈 Attach the userId
      companyIntro, // 👈 Attach the generated company intro
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

export async function generateCompanyIntro(profile: CompanyProfile): Promise<string> {
  if (!apiKey) {
    return "Error: OpenAI API key is not configured";
  }

  const prompt = `\nWrite a compelling introduction for a \"Why Partner With Us?\" page for the company \"${profile.name}\".\nIndustry: ${profile.industry ?? 'N/A'}\nMission: ${profile.mission ?? 'N/A'}\nValues: ${(profile.culture?.values ?? []).join(', ') || 'N/A'}\nOpportunities: ${(profile.opportunities?.roles ?? []).join(', ') || 'N/A'}\n\nWrite exactly 3-4 lines (maximum 4 lines) highlighting innovation, growth, and unique opportunities. Use a modern and dynamic tone suitable for an international audience. Make the text concise and impactful.\n`;

  console.log('[OpenAI Prompt]', prompt);

  try {
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    console.log('[OpenAI Response]', content);
    return content || "Error generating text";
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return "Error generating text";
  }
}

export async function generateUniquenessCategories(profile: CompanyProfile): Promise<UniquenessCategory[]> {
  if (!apiKey) {
    throw new Error("OpenAI API key is not configured");
  }

  const prompt = `Generate 4-6 uniqueness categories for a company profile page. Based on this company information:

Company: ${profile.name}
Industry: ${profile.industry ?? 'N/A'}
Mission: ${profile.mission ?? 'N/A'}
Overview: ${profile.overview ?? 'N/A'}
Values: ${(profile.culture?.values ?? []).join(', ') || 'N/A'}
Benefits: ${(profile.culture?.benefits ?? []).join(', ') || 'N/A'}
Opportunities: ${(profile.opportunities?.roles ?? []).join(', ') || 'N/A'}

Generate categories that highlight why someone should partner with this company. Each category should include:
- title: A compelling category name
- description: Brief description of the category
- score: A number from 1-5 representing the strength
- details: An array of 3-5 specific benefits or features

Available icons: Award, Globe2, DollarSign, TrendingUp, Rocket, Users, ShieldCheck, Zap

Return the response as a valid JSON array with this exact structure:
[
  {
    "title": "string",
    "icon": "iconName",
    "description": "string", 
    "score": number,
    "details": ["string", "string", "string"]
  }
]

Make the categories relevant to the company's industry and strengths. Focus on what makes this company unique and attractive to potential partners.`;

  try {
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    const parsedCategories = JSON.parse(content);
    
    // Map icon names to actual icon components
    const iconMap: { [key: string]: any } = {
      Award: Award,
      Globe2: Globe2,
      DollarSign: DollarSign,
      TrendingUp: TrendingUp,
      Rocket: Rocket,
      Users: Users,
      ShieldCheck: ShieldCheck,
      Zap: Zap,
    };

    return parsedCategories.map((category: any) => ({
      ...category,
      icon: iconMap[category.icon] || Award, // Default to Award if icon not found
    }));
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw new Error("Failed to generate uniqueness categories");
  }
}

// Add the UniquenessCategory interface
export interface UniquenessCategory {
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  score: number;
  details: string[];
}
