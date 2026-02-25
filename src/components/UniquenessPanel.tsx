import React, { useState } from "react";
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
  Search,
  Edit2,
  Check,
  ArrowRight,
} from "lucide-react";
import type { CompanyProfile } from "../api/openai";
import { DifferentiatorsPanel } from "./DifferentiatorsPanel";

import { LucideProps } from "lucide-react";

interface Props {
  profile: CompanyProfile;
  onBack: () => void;

}

interface UniquenessCategory {
  title: string;
  icon: React.ComponentType<LucideProps>;
  description: string;
  score: number;
  details: string[];
}

export function UniquenessPanel({ profile, onBack }: Props) {
  const [editMode, setEditMode] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [categories, setCategories] = useState<UniquenessCategory[]>(
    getIndustrySpecificFeatures(profile.industry)
  );
  const [showDifferentiators, setShowDifferentiators] = useState(false);

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
  }) => (
    <div className={`group relative ${className}`}>
      {editingField === field ? (
        <div className="flex items-center gap-2">
          <input
            type={type}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="flex-1 px-3 py-1 border border-indigo-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
            style={{ color: '#111827', backgroundColor: 'white' }}
            onKeyDown={(e) => e.key === "Enter" && handleSave(field)}
            autoFocus
            onBlur={() => handleSave(field)}
          />

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

  if (showDifferentiators) {
    return (
      <DifferentiatorsPanel
        profile={profile}
        onBack={() => setShowDifferentiators(false)}
      //onComplete={onBack}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
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
              className={`p-2 rounded-full transition-all duration-300 ${editMode
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
            >
              <Edit2 size={20} />
            </button>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-900">
                {profile.name}
              </h1>
              <p className="text-gray-500 mt-1">{profile.industry}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-16">
          {/* Overview */}
          <section className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Why Partner With Us?
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Join a company that values innovation, growth, and success. We
              offer unique opportunities for representatives to thrive in a
              dynamic market environment.
            </p>
          </section>

          {/* Categories Grid */}
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
                            className={`w-2 h-2 rounded-full ${i < category.score
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

          {/* Call to Action */}
          <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 rounded-2xl p-12 text-center opacity-40 grayscale pointer-events-none border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Explore Opportunities?
            </h2>
            <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
              Discover exciting gigs and partnership opportunities with{" "}
              {profile.name}. Browse our available opportunities and find the
              perfect match for your skills and interests.
            </p>
            <button className="px-8 py-3 bg-gray-400 text-white rounded-xl flex items-center gap-2 mx-auto">
              <Search size={18} />
              Browse Available Gigs
            </button>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-100">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors font-medium"
            >
              <ChevronLeft size={20} />
              Back to Profile
            </button>
            <button
              onClick={() => setShowDifferentiators(true)}
              className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl hover:from-indigo-700 hover:to-blue-700 transition-all transform hover:-translate-y-1 shadow-xl hover:shadow-indigo-200 flex items-center gap-3 text-lg font-bold"
            >
              Next: Choose Differentiators
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
