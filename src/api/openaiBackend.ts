import Cookies from "js-cookie";

const apiUrl = import.meta.env.VITE_API_URL;
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

export interface UniquenessCategory {
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  score: number;
  details: string[];
}

export const searchCompanyLogo = async (
  companyName: string,
  companyWebsite?: string
): Promise<string | null> => {
  try {
    const response = await fetch(`${apiUrl}/openai/search-logo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyName,
        companyWebsite,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? data.data.logoUrl : null;
  } catch (error) {
    console.error("Backend Logo Search Error:", error);
    return null;
  }
};

export const generateCompanyProfile = async (
  companyInfo: string
): Promise<CompanyProfile> => {
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
    const response = await fetch(`${apiUrl}/openai/generate-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyInfo,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to generate company profile');
    }

    return data.data;
  } catch (error) {
    console.error("Backend API Error:", error);
    throw new Error("Failed to generate company profile");
  }
};

export async function generateCompanyIntro(profile: CompanyProfile): Promise<string> {
  try {
    // Cette fonction n'est plus nécessaire car l'intro est générée dans generateCompanyProfile
    // Mais on la garde pour la compatibilité
    return profile.companyIntro || "Error generating text";
  } catch (error) {
    console.error("Company intro error:", error);
    return "Error generating text";
  }
}

export async function generateUniquenessCategories(profile: CompanyProfile): Promise<UniquenessCategory[]> {
  try {
    const response = await fetch(`${apiUrl}/openai/generate-uniqueness`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profile,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to generate uniqueness categories');
    }

    // Import des icônes Lucide React
    const { 
      Award,
      Globe2,
      DollarSign,
      TrendingUp,
      Rocket,
      Users,
      ShieldCheck,
      Zap,
    } = await import("lucide-react");

    // Mapping des icônes
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

    // Transformer les données pour inclure les vraies icônes
    return data.data.map((category: any) => ({
      title: category.title,
      description: category.description,
      score: category.score,
      details: category.details,
      icon: iconMap[category.icon] || Award, // Default to Award if icon not found
    }));
  } catch (error) {
    console.error("Backend API Error:", error);
    throw new Error("Failed to generate uniqueness categories");
  }
}
