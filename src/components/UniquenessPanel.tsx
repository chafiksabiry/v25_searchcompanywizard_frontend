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
            className="flex-1 px-3 py-1 border border-harx-200 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-harx-400 outline-none transition-all"
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
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-harx-500 transition-all"
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
    <div className="fixed inset-0 bg-premium-gradient z-50 overflow-auto animate-fade-in">
      {/* HARX-style background shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none fixed">
        <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-harx-400/10 blur-[100px] rounded-full animate-float"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[50%] h-[50%] bg-harx-alt-400/10 blur-[150px] rounded-full animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-end mb-12 relative z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setEditMode(!editMode)}
              className={`p-2 rounded-full transition-all duration-300 ${editMode
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-white/80 backdrop-blur-md text-gray-600 hover:bg-white border border-harx-100"
                }`}
            >
              <Edit2 size={20} />
            </button>
            <div className="text-right">
              <h1 className="text-3xl font-bold bg-gradient-harx bg-clip-text text-transparent">
                {profile.name}
              </h1>
              <p className="text-gray-500 mt-1 font-medium">{profile.industry}</p>
            </div>
          </div>
        </div>


        {/* Main Content */}
        <div className="space-y-16">
          {/* Overview */}
          <section className="text-center max-w-3xl mx-auto relative z-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Why Partner With Us?
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed font-medium">
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
                className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-harx-100/50 hover:border-harx-200 hover:shadow-2xl transition-all duration-300 relative z-10 group"
              >
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-harx-50 flex items-center justify-center flex-shrink-0 border border-harx-100 group-hover:scale-110 transition-transform duration-300">
                    <category.icon className="text-harx-500" size={28} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <EditableField
                        value={category.title}
                        field={`${index}.title`}
                        className="text-xl font-bold text-gray-900"
                      />
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${i < category.score
                              ? "bg-gradient-harx"
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
                            size={16}
                            className="text-harx-alt-400 flex-shrink-0"
                          />
                          <EditableField
                            value={detail}
                            field={`${index}.details.${i}`}
                            className="text-sm font-medium"
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
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 text-center opacity-40 grayscale pointer-events-none border border-harx-100 relative z-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Explore Opportunities?
            </h2>
            <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
              Discover exciting gigs and partnership opportunities with{" "}
              {profile.name}. Browse our available opportunities and find the
              perfect match for your skills and interests.
            </p>
            <button className="px-8 py-4 bg-gradient-harx text-white rounded-2xl flex items-center gap-2 mx-auto shadow-lg transition-all">
              <Search size={18} />
              Browse Available Gigs
            </button>
          </div>


          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-8 border-t border-harx-100 relative z-10">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-harx-600 transition-all font-bold"
            >
              <ChevronLeft size={24} />
              Back to Profile
            </button>
            <button
              onClick={() => setShowDifferentiators(true)}
              className="px-10 py-4 bg-gradient-harx text-white rounded-2xl hover:shadow-2xl hover:shadow-harx-500/30 transition-all transform hover:-translate-y-1 shadow-xl flex items-center gap-3 text-lg font-black"
            >
              Next: Choose Differentiators
              <ArrowRight size={24} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
