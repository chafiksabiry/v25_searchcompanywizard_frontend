import React, { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import {
  Building2,
  Calendar,
  MapPin,
  X,
  Globe,
  Trophy,
  Mail,
  Phone,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Factory,
  Edit2,
  Check,
  ArrowRight,
  Upload,
  Image,
  ArrowLeft,
} from "lucide-react";
import type { CompanyProfile as CompanyProfileType } from "../api/openaiBackend";
import { UniquenessPanel } from "./UniquenessPanel";
import { uploadImageToCloudinary, validateImageFile } from "../api/cloudinary";
import { LucideProps } from "lucide-react";

interface Props {
  profile: CompanyProfileType;
  onBackToSearch: () => void;
}

const userId = Cookies.get('userId');

export function CompanyProfilePage({ profile: initialProfile, onBackToSearch }: Props) {
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
    companyIntro: initialProfile.companyIntro || "",
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
  const [showUniquenessPanel, setShowUniquenessPanel] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasContactInfo =
    profile.contact?.email ||
    profile.contact?.phone ||
    profile.contact?.address ||
    profile.contact?.website;

  const hasSocialMedia =
    profile.socialMedia?.linkedin ||
    profile.socialMedia?.twitter ||
    profile.socialMedia?.facebook ||
    profile.socialMedia?.instagram;

  const hasLocation =
    profile.contact?.coordinates?.lat && profile.contact?.coordinates?.lng;

  const getGoogleMapsUrl = () => {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    if (!apiKey) return null;

    if (profile.contact?.address) {
      const address = encodeURIComponent(profile.contact.address);
      return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${address}&zoom=15`;
    }

    if (hasLocation && profile.contact?.coordinates) {
      const { lat, lng } = profile.contact.coordinates;
      return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=15`;
    }

    return null;
  };

  useEffect(() => {
    if (!profile.logo && profile.contact?.website) {
      try {
        const domain = new URL(profile.contact.website).hostname;
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        setLogoUrl(faviconUrl);
        setProfile(prev => ({ ...prev, logo: faviconUrl }));
      } catch (error) {
        console.warn('Invalid website URL:', profile.contact.website);
        setLogoUrl("");
      }
    } else if (profile.logo) {
      setLogoUrl(profile.logo);
    } else {
      setLogoUrl("");
    }
  }, [profile.logo, profile.contact?.website]);

  const getGoogleMapsDirectionsUrl = () => {
    if (profile.contact?.address) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        profile.contact.address
      )}`;
    }

    if (hasLocation && profile.contact?.coordinates) {
      const { lat, lng } = profile.contact.coordinates;
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }

    return null;
  };

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

  const validateImageUrl = (url: string): boolean => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setLogoUrl(url);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateImageFile(file);
      setIsUploadingLogo(true);
      const cloudinaryUrl = await uploadImageToCloudinary(file);
      setLogoUrl(cloudinaryUrl);
      setProfile({ ...profile, logo: cloudinaryUrl });
      setEditingField(null);
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de l\'upload du logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const multiLineFields = [
    "overview",
    "mission",
    "culture.workEnvironment",
    "opportunities.growthPotential",
    "opportunities.training",
    "technology.innovation",
  ];

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
        <div className="flex items-center gap-2 w-full">
          {multiLineFields.includes(field) ? (
            <textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full h-full min-h-24 px-3 py-1 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900 resize-y"
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
              className={`px-3 py-1 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900 ${className.includes('bg-white/10') ? 'w-28' : 'flex-1'}`}
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

  if (showUniquenessPanel) {
    return (
      <UniquenessPanel
        profile={profile}
        onBack={() => setShowUniquenessPanel(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header avec bouton retour */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBackToSearch}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Search</span>
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
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar - Contact & Digital Presence */}
        <div className="w-80 flex-shrink-0 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 min-h-screen">
          <div className="p-6 space-y-8">
            {/* Contact Information */}
            {hasContactInfo && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Mail className="text-blue-600" size={20} />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  {profile.contact?.email && (
                    <EditableField
                      value={profile.contact.email}
                      field="contact.email"
                      icon={Mail}
                      className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors text-sm"
                    />
                  )}
                  {profile.contact?.phone && (
                    <EditableField
                      value={profile.contact.phone}
                      field="contact.phone"
                      icon={Phone}
                      className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors text-sm"
                    />
                  )}
                  {profile.contact?.website && (
                    <EditableField
                      value={profile.contact.website}
                      field="contact.website"
                      icon={Globe}
                      className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors text-sm"
                    />
                  )}
                  {profile.contact?.address && (
                    <EditableField
                      value={profile.contact.address}
                      field="contact.address"
                      icon={MapPin}
                      className="flex items-start gap-3 text-gray-600 text-sm"
                    />
                  )}
                </div>

                {/* Map Integration */}
                {(profile.contact?.address || hasLocation) && (
                  <div className="mt-4">
                    <div className="relative w-full h-[160px] rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                      {getGoogleMapsUrl() ? (
                        <>
                          <iframe
                            src={getGoogleMapsUrl()!}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="absolute inset-0"
                          />
                          {getGoogleMapsDirectionsUrl() && (
                            <a
                              href={getGoogleMapsDirectionsUrl()!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute bottom-2 right-2 px-3 py-1.5 bg-white/90 hover:bg-white text-sm text-blue-600 rounded-lg shadow-lg backdrop-blur-sm flex items-center gap-1.5 transition-all hover:scale-105"
                            >
                              <MapPin size={14} />
                              Get Directions
                            </a>
                          )}
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                          <span>Map not available</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Digital Presence */}
            {hasSocialMedia && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Globe className="text-blue-600" size={20} />
                  Digital Presence
                </h3>
                <div className="flex gap-3">
                  {profile.socialMedia?.linkedin && (
                    <a
                      href={profile.socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600 transition-all duration-300 text-gray-600"
                    >
                      <Linkedin size={20} />
                    </a>
                  )}
                  {profile.socialMedia?.twitter && (
                    <a
                      href={profile.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600 transition-all duration-300 text-gray-600"
                    >
                      <Twitter size={20} />
                    </a>
                  )}
                  {profile.socialMedia?.facebook && (
                    <a
                      href={profile.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600 transition-all duration-300 text-gray-600"
                    >
                      <Facebook size={20} />
                    </a>
                  )}
                  {profile.socialMedia?.instagram && (
                    <a
                      href={profile.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600 transition-all duration-300 text-gray-600"
                    >
                      <Instagram size={20} />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Hero Section */}
          <div className="relative h-80">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80')",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-indigo-800/85 to-blue-900/80" />

              <div
                className="absolute inset-0 opacity-20"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.3) 25%, transparent 30%)",
                  animation: "shine 8s infinite linear",
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
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div
                    className={`w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center p-4 overflow-hidden transition-all duration-200
                      ${editMode ? "cursor-pointer ring-4 ring-indigo-200/60" : ""}`}
                    onClick={() => {
                      if (editMode) {
                        setEditingField("logo");
                        setLogoUrl(profile.logo || "");
                      }
                    }}
                  >
                    {isUploadingLogo ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      </div>
                    ) : logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={profile.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          console.warn('Failed to load logo image:', logoUrl);
                          e.currentTarget.style.display = 'none';
                        }}
                        onLoad={(e) => {
                          e.currentTarget.style.display = 'block';
                        }}
                      />
                    ) : (
                      <Image className="w-full h-full text-indigo-600" />
                    )}
                    {editMode && !isUploadingLogo && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="text-white text-center">
                          <Upload size={20} className="mx-auto mb-1" />
                          <span className="text-xs">Upload Logo</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
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
                        className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm"
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
              <div className="w-full flex justify-end mt-6 pr-2">
                <button
                  onClick={() => setShowUniquenessPanel(true)}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-3 group"
                >
                  <Trophy size={20} />
                  <span>What makes your company unique and attractive</span>
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
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
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="text-indigo-600" size={24} />
                    </div>
                    <div className="flex-1 h-full">
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
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
