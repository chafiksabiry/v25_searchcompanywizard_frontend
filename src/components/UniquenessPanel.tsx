import React, { useState, useEffect } from "react";
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
  Edit2,
  Check,
  ArrowRight,
  Loader2,
} from "lucide-react";
import type { CompanyProfile, UniquenessCategory } from "../api/openai";
import { generateUniquenessCategories } from "../api/openai";
import { DifferentiatorsPanel } from "./DifferentiatorsPanel";

import { LucideProps } from "lucide-react";

interface Props {
  profile: CompanyProfile;
  onBack: () => void;
}

export function UniquenessPanel({ profile, onBack }: Props) {
  const [editMode, setEditMode] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [categories, setCategories] = useState<UniquenessCategory[]>([]);
  const [showDifferentiators, setShowDifferentiators] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate categories when component mounts
  useEffect(() => {
    generateCategories();
  }, [profile]);

  const generateCategories = async () => {
    setIsGenerating(true);
    try {
      const generatedCategories = await generateUniquenessCategories(profile);
      setCategories(generatedCategories);
    } catch (error) {
      console.error("Failed to generate categories:", error);
      // Fallback to default categories if AI generation fails
      setCategories(getIndustrySpecificFeatures(profile.industry));
    } finally {
      setIsGenerating(false);
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

  const handleEdit = (field: string, value: string) => {
    setEditingField(field);
    setTempValue(value);
  };

  const handleSave = (field: string) => {
    const [categoryIndex, fieldType, detailIndex] = field.split(".");
    const newCategories = [...categories];
    const category = newCategories[parseInt(categoryIndex)];

    if (fieldType === "title") {
      category.title = tempValue;
    } else if (fieldType === "description") {
      category.description = tempValue;
    } else if (fieldType === "details") {
      category.details[parseInt(detailIndex)] = tempValue;
    }

    setCategories(newCategories);
    setEditingField(null);
  };

  const EditableField = ({
    value,
    field,
    icon: Icon,
    type = "text",
    className = "",
  }: {
    value: string;
    field: string;
    icon?: React.ComponentType<LucideProps>;
    type?: string;
    className?: string;
  }) => {
    // Champs multi-lignes : description, details et companyIntro
    const isMultiline = field === 'companyIntro' || field.endsWith('.description') || field.includes('.details.');
    return (
      <div className={`group relative ${className}`}>
        {editingField === field ? (
          <div className="flex items-center gap-2 w-full">
            {isMultiline ? (
              <textarea
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="w-full min-h-16 px-3 py-1 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900 resize-y"
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSave(field);
                }}
                autoFocus
                onBlur={() => handleSave(field)}
              />
            ) : (
              <input
                type={type}
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="flex-1 px-3 py-1 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900"
                onKeyDown={(e) => e.key === "Enter" && handleSave(field)}
                autoFocus
                onBlur={() => handleSave(field)}
              />
            )}
            <button
              onClick={() => handleSave(field)}
              className="p-1 text-green-600 hover:text-green-700"
            >
              <Check size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {Icon && <Icon size={18} className="text-gray-600" />}
            <span>{value}</span>
            {editMode && (
              <button
                onClick={() => handleEdit(field, value)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-indigo-600 transition-all"
              >
                <Edit2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

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
              <button
                onClick={() => setEditMode(!editMode)}
                className={`p-2 rounded-full transition-all duration-300 ${
                  editMode
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <Edit2 size={20} />
              </button>
              <button
                onClick={generateCategories}
                disabled={isGenerating}
                className={`p-2 rounded-full transition-all duration-300 ${
                  isGenerating
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
                title="Regenerate categories with AI"
              >
                {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} />}
              </button>
              <div className="text-right">
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.name}
                </h1>
                <p className="text-gray-500 mt-1">{profile.industry}</p>
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
                <EditableField
                  value={profile.companyIntro || "Loading..."}
                  field="companyIntro"
                  className="text-lg text-gray-600 leading-relaxed"
                />
              </div>
            </div>
          </section>

          {/* Categories Grid */}
          {isGenerating ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="animate-spin mx-auto mb-4 text-indigo-600" size={32} />
                <p className="text-gray-600">Generating unique features for {profile.name}...</p>
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
                        <EditableField
                          value={category.title}
                          field={`${index}.title`}
                          className="text-xl font-bold text-gray-900"
                        />
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
                      <EditableField
                        value={category.description}
                        field={`${index}.description`}
                        className="text-gray-600 mb-4"
                      />
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
                            <EditableField
                              value={detail}
                              field={`${index}.details.${i}`}
                            />
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
