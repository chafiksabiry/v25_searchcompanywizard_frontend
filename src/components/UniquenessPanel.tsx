import { useState, useEffect } from "react";
import {
  Globe2,
  TrendingUp,
  DollarSign,
  Rocket,
  Award,
  Users,
  ShieldCheck,
  Zap,
  ChevronLeft,
  ArrowRight,
  Loader2,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import type { CompanyProfile, UniquenessCategory } from "../api/openai";
import { generateAllUniquenessContent, generateCompanyIntro, generateUniquenessCategories } from "../api/openai";
import { DifferentiatorsPanel } from "./DifferentiatorsPanel";

interface Props {
  profile: CompanyProfile;
  onBack: () => void;
}

export function UniquenessPanel({ profile, onBack }: Props) {
  const [categories, setCategories] = useState<UniquenessCategory[]>([]);
  const [companyIntro, setCompanyIntro] = useState("");
  const [showDifferentiators, setShowDifferentiators] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showRegenerateMenu, setShowRegenerateMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate profile data
  const isValidProfile = profile && profile.name && typeof profile.name === 'string';

  // Generate all content when component mounts
  useEffect(() => {
    if (isValidProfile) {
      generateAllContent();
    } else {
      setError("Invalid profile data provided");
    }
  }, [profile, isValidProfile]);

  const generateAllContent = async () => {
    if (!isValidProfile) {
      setError("Cannot generate content: invalid profile data");
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const { companyIntro: intro, categories: cats } = await generateAllUniquenessContent(profile);
      setCompanyIntro(intro || "Join our dynamic team and be part of an innovative company that values growth, collaboration, and excellence. We offer competitive opportunities in a supportive environment where your skills and ambitions can thrive.");
      setCategories(cats || []);
    } catch (error) {
      console.error("Failed to generate content:", error);
      setError("Failed to generate content. Using default content instead.");
      // Fallback to default content if AI generation fails
      setCompanyIntro("Join our dynamic team and be part of an innovative company that values growth, collaboration, and excellence. We offer competitive opportunities in a supportive environment where your skills and ambitions can thrive.");
      setCategories(getIndustrySpecificFeatures(profile?.industry));
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateIntro = async () => {
    if (!isValidProfile) {
      setError("Cannot regenerate intro: invalid profile data");
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const intro = await generateCompanyIntro(profile);
      setCompanyIntro(intro || "Join our dynamic team and be part of an innovative company that values growth, collaboration, and excellence. We offer competitive opportunities in a supportive environment where your skills and ambitions can thrive.");
    } catch (error) {
      console.error("Failed to regenerate intro:", error);
      setError("Failed to regenerate introduction. Using default content.");
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateCategories = async () => {
    if (!isValidProfile) {
      setError("Cannot regenerate categories: invalid profile data");
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const cats = await generateUniquenessCategories(profile);
      setCategories(cats || []);
    } catch (error) {
      console.error("Failed to regenerate categories:", error);
      setError("Failed to regenerate categories. Using default content.");
      setCategories(getIndustrySpecificFeatures(profile?.industry));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = (type: 'all' | 'intro' | 'categories') => {
    setShowRegenerateMenu(false);
    switch (type) {
      case 'all':
        generateAllContent();
        break;
      case 'intro':
        regenerateIntro();
        break;
      case 'categories':
        regenerateCategories();
        break;
    }
  };

  function getIndustrySpecificFeatures(
    industry?: string
  ): UniquenessCategory[] {
    const baseCategories: UniquenessCategory[] = [
      {
        title: "Brand Recognition",
        icon: Award,
        description: "Market presence and brand value",
        score: 4,
        details: [
          "Established market presence",
          "Strong brand reputation",
          "Recognized industry leader",
          "High customer trust",
        ],
      },
      {
        title: "Geographic Reach",
        icon: Globe2,
        description: "Market coverage and expansion",
        score: 4,
        details: [
          "Wide market coverage",
          "Strategic locations",
          "Growing market presence",
          "International opportunities",
        ],
      },
      {
        title: "Financial Benefits",
        icon: DollarSign,
        description: "Compensation and payment structure",
        score: 5,
        details: [
          "Competitive commission rates",
          "Fast payment processing",
          "Performance bonuses",
          "Recurring revenue opportunities",
          "Attractive incentive programs",
        ],
      },
      {
        title: "Growth Potential",
        icon: TrendingUp,
        description: "Career and earning opportunities",
        score: 4,
        details: [
          "Unlimited earning potential",
          "Career advancement paths",
          "Market expansion plans",
          "Training and development",
        ],
      },
    ];

    // Add industry-specific categories
    if (industry?.toLowerCase().includes("tech")) {
      baseCategories.push({
        title: "Innovation Leadership",
        icon: Rocket,
        description: "Cutting-edge technology and solutions",
        score: 5,
        details: [
          "Latest technology products",
          "Innovation-driven culture",
          "High-demand solutions",
          "Competitive advantage through tech",
        ],
      });
    }

    if (industry?.toLowerCase().includes("healthcare")) {
      baseCategories.push({
        title: "Social Impact",
        icon: Users,
        description: "Making a difference in healthcare",
        score: 5,
        details: [
          "Improving patient care",
          "Healthcare innovation",
          "Growing healthcare market",
          "Essential services",
        ],
      });
    }

    if (industry?.toLowerCase().includes("finance")) {
      baseCategories.push({
        title: "Market Stability",
        icon: ShieldCheck,
        description: "Secure and stable market position",
        score: 5,
        details: [
          "Financial sector stability",
          "Regulatory compliance",
          "Established client base",
          "Recurring revenue model",
        ],
      });
    }

    return baseCategories;
  }

  // Error state
  if (error && !isGenerating) {
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <ShieldCheck size={48} className="mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={onBack}
                  className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all"
                >
                  Go Back
                </button>
                <button
                  onClick={() => {
                    setError(null);
                    generateAllContent();
                  }}
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showDifferentiators) {
    return (
      <DifferentiatorsPanel
        profile={profile}
        onBack={() => setShowDifferentiators(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-12">
          <div className="w-full flex items-center justify-between mb-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <ChevronLeft size={20} />
              <span>Back to Profile</span>
            </button>
            <div className="flex items-center gap-4">
              {/* Regenerate Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowRegenerateMenu(!showRegenerateMenu)}
                  disabled={isGenerating}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    isGenerating
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                  title="Regenerate content with AI"
                >
                  {isGenerating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <RefreshCw size={16} />
                  )}
                  <span>Regenerate</span>
                  <ChevronDown size={14} />
                </button>
                
                {showRegenerateMenu && !isGenerating && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="py-1">
                      <button
                        onClick={() => handleRegenerate('all')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Zap size={14} />
                        Regenerate All
                      </button>
                      <button
                        onClick={() => handleRegenerate('intro')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <RefreshCw size={14} />
                        Regenerate Intro
                      </button>
                      <button
                        onClick={() => handleRegenerate('categories')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Award size={14} />
                        Regenerate Categories
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile?.name || "Company"}
                </h1>
                <p className="text-gray-500 mt-1">{profile?.industry || "Industry"}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowDifferentiators(true)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-xl hover:from-indigo-600 hover:to-blue-600 transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center gap-2 mb-2"
          >
            Next: Choose Differentiators
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-16">
          {/* Overview */}
          <section className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Why Partner With Us?
            </h2>
            <div className="flex justify-center">
              <div className="w-full">
                <p className="text-lg text-gray-600 leading-relaxed">
                  {companyIntro || "Loading..."}
                </p>
              </div>
            </div>
          </section>

          {/* Categories Grid */}
          {isGenerating ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="animate-spin mx-auto mb-4 text-indigo-600" size={32} />
                <p className="text-gray-600">Generating unique features for {profile?.name || "this company"}...</p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <category.icon className="text-indigo-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {category.title}
                        </h3>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < category.score
                                  ? "bg-indigo-500"
                                  : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">
                        {category.description}
                      </p>
                      <ul className="space-y-2">
                        {category.details.map((detail, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 text-gray-700"
                          >
                            <Zap
                              size={14}
                              className="text-indigo-500 flex-shrink-0"
                            />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
