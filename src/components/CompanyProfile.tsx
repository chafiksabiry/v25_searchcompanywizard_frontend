import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import {
  Building2,
  Calendar,
  MapPin,
  Target,
  Award,
  X,
  Heart,
  Globe,
  Trophy,
  Coffee,
  Factory,
  Edit2,
  Check,
  ArrowRight,
  Upload,
} from "lucide-react";
import type { CompanyProfile as CompanyProfileType } from "../api/openai";
// import type { LucideIcon } from 'lucide-react';

interface Props {
  profile: CompanyProfileType;
  onClose: () => void;
}

import { LucideProps } from "lucide-react";
const userId = Cookies.get('userId');
export function CompanyProfile({ profile: initialProfile, onClose }: Props) {
  // Ensure all required nested objects exist with default values
  const defaultProfile = {
    userId: userId || "",
    name: initialProfile.name || "",
    logo: initialProfile.logo || "",
    industry: initialProfile.industry || "",
    founded: initialProfile.founded || "",
    headquarters: initialProfile.headquarters || "",
    overview: initialProfile.overview || "",
    mission: initialProfile.mission || "",
    culture: {
      values: initialProfile.culture?.values || [],
      benefits: initialProfile.culture?.benefits || [],
      workEnvironment: initialProfile.culture?.workEnvironment || "",
    },
    opportunities: {
      roles: initialProfile.opportunities?.roles || [],
      growthPotential: initialProfile.opportunities?.growthPotential || "",
      training: initialProfile.opportunities?.training || "",
    },
    technology: {
      stack: initialProfile.technology?.stack || [],
      innovation: initialProfile.technology?.innovation || "",
    },
    contact: {
      email: initialProfile.contact?.email || "",
      phone: initialProfile.contact?.phone || "",
      address: initialProfile.contact?.address || "",
      website: initialProfile.contact?.website || "",
      coordinates: initialProfile.contact?.coordinates,
    },
    socialMedia: {
      linkedin: initialProfile.socialMedia?.linkedin || "",
      twitter: initialProfile.socialMedia?.twitter || "",
      facebook: initialProfile.socialMedia?.facebook || "",
      instagram: initialProfile.socialMedia?.instagram || "",
    },
  };

  const [profile, setProfile] = useState(defaultProfile);
  const [editMode, setEditMode] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [logoUrl, setLogoUrl] = useState(profile.logo || "");
  console.log("Logoooooooooo : ", profile);



  useEffect(() => {
    if (!logoUrl && profile.contact.website) {
      try {
        const domain = new URL(profile.contact.website).hostname;
        setLogoUrl(`https://www.google.com/s2/favicons?domain=${domain}&sz=64`);
      } catch (e) {
        // Invalid URL
      }
    }
  }, [profile.contact.website]);


  const handleEdit = (field: string, value: string) => {
    setEditingField(field);
    setTempValue(value);
  };

  const handleSave = (field: string) => {
    const updateProfile = (path: string[], value: any) => {
      const newProfile = { ...profile };
      let current = newProfile as any;
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {};
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newProfile;
    };

    const fieldPath = field.split(".");
    setProfile(updateProfile(fieldPath, tempValue));
    setEditingField(null);
  };

  const handleDelete = (path: string) => {
    const parts = path.split(".");
    const newProfile = { ...profile } as any;
    let current = newProfile;

    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }

    const lastPart = parts[parts.length - 1];
    const index = parseInt(lastPart);

    if (!isNaN(index)) {
      const arrayKey = parts[parts.length - 2];
      const parent = parts.length > 2 ? parts.slice(0, -2).reduce((acc, p) => acc[p], newProfile) : newProfile;
      parent[arrayKey] = parent[arrayKey].filter((_: any, i: number) => i !== index);
    }

    setProfile(newProfile);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setLogoUrl(url);
    setProfile({ ...profile, logo: url });
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
            className="flex-1 px-3 py-1 border border-harx-200 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-harx-500 outline-none transition-all"
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
          <span className="flex-1">{value}</span>
          {editMode && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <button
                onClick={() => handleEdit(field, value)}
                className="p-1 text-gray-400 hover:text-harx-600 transition-colors"
              >
                <Edit2 size={14} />
              </button>

              {(field.includes('culture.values') || field.includes('culture.benefits') || field.includes('opportunities.roles') || field.includes('technology.stack')) && (
                <button
                  onClick={() => handleDelete(field)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );


  return (
    <div className="w-full h-full bg-white rounded-3xl shadow-2xl border border-harx-100 overflow-hidden flex relative min-h-[800px] animate-fade-in">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Hero Section */}
        <div className="relative h-80">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-harx-900/90 to-gray-900" />


            <div
              className="absolute inset-0 opacity-20"
              style={{
                background:
                  "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.3) 25%, transparent 30%)",
                animation: "shine 8s infinite linear",
              }}
            />

            <div
              className="absolute inset-0 opacity-10"
              style={{
                background:
                  "linear-gradient(90deg, transparent 45%, rgba(255,255,255,0.4) 50%, transparent 55%)",
                animation: "shine 6s infinite linear",
              }}
            />

            <style>
              {`
                  @keyframes shine {
                    0% { transform: translateX(-200%); }
                    100% { transform: translateX(200%); }
                  }
                `}
            </style>
          </div>

          <div className="relative h-full flex flex-col justify-end p-12 space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div
                  className={`w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center p-4 overflow-hidden ${editMode ? "cursor-pointer" : ""
                    }`}
                >
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={profile.name}
                      className="w-full h-full object-contain"
                      onError={() => {
                        // Fallback to Clearbit if favicon/logo fails
                        if (profile.contact.website && !logoUrl.includes('clearbit')) {
                          try {
                            const domain = new URL(profile.contact.website).hostname;
                            setLogoUrl(`https://logo.clearbit.com/${domain}`);
                          } catch (err) {
                            setLogoUrl("");
                          }
                        } else {
                          setLogoUrl("");
                        }
                      }}
                    />
                  ) : (
                    <Globe className="w-full h-full text-harx-600" />
                  )}

                  {editMode && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-white text-center">
                        <Upload size={20} className="mx-auto mb-1" />
                        <span className="text-xs">Edit Logo</span>
                      </div>
                    </div>
                  )}
                </div>
                {editMode && editingField === "logo" && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600 block">
                        Logo URL
                      </label>
                      <input
                        type="text"
                        value={logoUrl}
                        onChange={handleLogoChange}
                        placeholder="Enter logo URL..."
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => setEditingField(null)}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => setEditingField(null)}
                          className="px-3 py-1 text-sm bg-harx-600 text-white rounded-md hover:bg-harx-700 transition-colors"
                        >
                          Save
                        </button>

                      </div>
                    </div>
                  </div>
                )}
                {editMode && (
                  <button
                    onClick={() =>
                      setEditingField(editingField === "logo" ? null : "logo")
                    }
                    className="absolute -right-2 -top-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-harx-600 transition-colors"
                  >
                    <Edit2 size={12} />
                  </button>

                )}
              </div>
              <div>
                <EditableField
                  value={profile.name}
                  field="name"
                  className="text-5xl font-bold text-white mb-2 tracking-tight"
                />
                <div className="flex flex-wrap gap-6 text-white/90">
                  {profile.industry && (
                    <EditableField
                      value={profile.industry}
                      field="industry"
                      icon={Factory}
                      className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/10"
                    />

                  )}
                  {profile.founded && (
                    <EditableField
                      value={profile.founded}
                      field="founded"
                      icon={Calendar}
                      className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm"
                    />
                  )}
                  {profile.headquarters && (
                    <EditableField
                      value={profile.headquarters}
                      field="headquarters"
                      icon={MapPin}
                      className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-12 space-y-16">
            {/* Overview Section */}
            <section className="relative">
              <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-blue-500 rounded-full" />
              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-harx-50 flex items-center justify-center flex-shrink-0 border border-harx-100">
                    <Building2 className="text-harx-600" size={24} />
                  </div>

                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Company Overview
                    </h2>
                    <EditableField
                      value={profile.overview}
                      field="overview"
                      className="text-gray-700 leading-relaxed text-lg"
                    />
                  </div>
                </div>

                {profile.mission && (
                  <div className="ml-18 p-8 bg-gradient-to-br from-indigo-50 via-blue-50 to-white rounded-2xl border border-indigo-100/50 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-harx flex items-center justify-center shadow-lg shadow-harx-500/20">
                        <Target className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-harx-700 mb-3">
                          Our Mission
                        </h3>

                        <EditableField
                          value={profile.mission}
                          field="mission"
                          className="text-gray-700"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Culture & Benefits Grid */}
            <div className="grid md:grid-cols-2 gap-10">
              {/* Culture Section */}
              <section className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-harx-alt-50 flex items-center justify-center flex-shrink-0 border border-harx-alt-100">
                    <Heart className="text-harx-alt-600" size={24} />
                  </div>

                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Culture & Values
                    </h2>
                    <div className="space-y-4">
                      {profile.culture.values.map((value, index) => (
                        <EditableField
                          key={index}
                          value={value}
                          field={`culture.values.${index}`}
                          icon={Coffee}
                          className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:scale-[1.02] transition-all duration-300"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Benefits Section */}
              <section className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Trophy className="text-amber-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Benefits & Perks
                    </h2>
                    <div className="space-y-4">
                      {profile.culture.benefits.map((benefit, index) => (
                        <EditableField
                          key={index}
                          value={benefit}
                          field={`culture.benefits.${index}`}
                          icon={Award}
                          className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:scale-[1.02] transition-all duration-300"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Publish Company Button */}
            <div className="pt-8 flex justify-center border-t border-gray-100">
              <button
                onClick={() => window.location.href = "/app11"}
                className="px-8 py-4 bg-gradient-harx text-white rounded-2xl hover:shadow-2xl hover:shadow-harx-500/30 transition-all duration-300 flex items-center gap-3 group text-lg font-bold w-full sm:w-auto justify-center transform hover:-translate-y-1"
              >
                <Check size={24} className="text-white" />
                <span>Publish Company</span>
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* Edit and Close buttons */}
      <div className="absolute right-6 top-6 flex items-center gap-3 z-10">
        <button
          onClick={() => setEditMode(!editMode)}
          className={`p-2 rounded-full transition-all duration-300 ${editMode
            ? "bg-green-500 text-white hover:bg-green-600"
            : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
        >
          <Edit2 size={20} />
        </button>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white text-gray-600 hover:bg-gray-100 transition-all duration-300"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
