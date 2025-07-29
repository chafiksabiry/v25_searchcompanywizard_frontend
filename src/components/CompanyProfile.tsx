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
} from "lucide-react";
import type { CompanyProfile as CompanyProfileType } from "../api/openai";
import { UniquenessPanel } from "./UniquenessPanel";
import { uploadImageToCloudinary, validateImageFile } from "../api/cloudinary";
import { LucideProps } from "lucide-react";

interface Props {
  profile: CompanyProfileType;
  onClose: () => void;
}
const userId= Cookies.get('userId');
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
  console.log("Logoooooooooo : ", profile);

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
        // Update the profile with the favicon URL
        setProfile(prev => ({ ...prev, logo: faviconUrl }));
      } catch (error) {
        console.warn('Invalid website URL:', profile.contact.website);
        setLogoUrl(""); // Fallback si l'URL n'est pas valide
      }
    } else if (profile.logo) {
      setLogoUrl(profile.logo); // Utiliser le logo fourni
    } else {
      setLogoUrl(""); // Fallback si aucun logo ou URL n'est fourni
    }
  }, [profile.logo, profile.contact?.website]);

  // Affichage des champs générés par OpenAI et Google Search
  useEffect(() => {
    // Champs générés par OpenAI (tous sauf logo favicon)
    const openAIFields = {
      name: profile.name,
      industry: profile.industry,
      founded: profile.founded,
      headquarters: profile.headquarters,
      overview: profile.overview,
      mission: profile.mission,
      culture: profile.culture,
      opportunities: profile.opportunities,
      technology: profile.technology,
      contact: profile.contact,
      socialMedia: profile.socialMedia,
    };
    // Logo généré par Google Search si logo vide et website présent
    let logoSource = 'Aucun';
    if (!profile.logo && profile.contact?.website) {
      logoSource = 'Google Search (favicon)';
    } else if (profile.logo) {
      logoSource = 'OpenAI ou utilisateur';
    }
    console.log('Champs générés par OpenAI:', openAIFields);
    console.log('Logo généré par:', logoSource, '| logoUrl:', logoUrl);
  }, [profile, logoUrl]);

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
    // Ne pas mettre à jour le profile immédiatement, attendre la validation
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Validate file
      validateImageFile(file);
      
      setIsUploadingLogo(true);
      
      // Upload to Cloudinary
      const cloudinaryUrl = await uploadImageToCloudinary(file);
      
      // Update logo URL and profile
      setLogoUrl(cloudinaryUrl);
      setProfile({ ...profile, logo: cloudinaryUrl });
      
      // Close the edit mode
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[90vw] relative max-h-[90vh] overflow-hidden flex">
        {/* Sidebar - Contact & Digital Presence */}
        <div className="w-80 flex-shrink-0 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 overflow-y-auto">
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
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-indigo-800/85 to-blue-900/80" />

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
                  {/* Hidden file input for logo upload */}
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
                    {/* Bouton crayon flottant */}
                    {editMode && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingField("logo");
                          setLogoUrl(profile.logo || "");
                        }}
                        className="absolute top-1 right-1 w-8 h-8 bg-white/90 rounded-full shadow flex items-center justify-center text-indigo-600 hover:bg-indigo-100 border border-indigo-200 z-10"
                        style={{boxShadow: '0 2px 8px 0 rgba(80,80,180,0.10)'}}
                        tabIndex={-1}
                        aria-label="Edit logo"
                      >
                        <Edit2 size={18} />
                      </button>
                    )}
                  </div>
                  {/* Menu d'édition du logo */}
                  {editMode && editingField === "logo" && (
                    <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg p-4 border border-gray-200 z-20">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <Image size={16} className="text-indigo-600" />
                          <label className="text-sm font-medium text-gray-700">
                            Logo Options
                          </label>
                        </div>
                        {/* File Upload Option */}
                        <div className="space-y-2">
                          <label className="text-sm text-gray-600 block">
                            Upload Image
                          </label>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingLogo}
                            className="w-full px-3 py-2 text-sm border-2 border-dashed border-gray-300 rounded-md hover:border-indigo-400 hover:bg-indigo-50 transition-colors disabled:opacity-50"
                          >
                            {isUploadingLogo ? 'Uploading...' : 'Choose Image File'}
                          </button>
                        </div>
                        <div className="text-center text-gray-400">- or -</div>
                        {/* URL Input Option */}
                        <div className="space-y-2">
                          <label className="text-sm text-gray-600 block">
                            Logo URL
                          </label>
                          <input
                            type="text"
                            value={logoUrl}
                            onChange={handleLogoChange}
                            placeholder="Enter logo URL..."
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-gray-900"
                          />
                        </div>
                        <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-200">
                          <button
                            onClick={() => {
                              setEditingField(null);
                              setLogoUrl(profile.logo || "");
                            }}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              if (logoUrl && !validateImageUrl(logoUrl)) {
                                alert('Please enter a valid image URL (http:// or https://)');
                                return;
                              }
                              setProfile({ ...profile, logo: logoUrl });
                              setEditingField(null);
                            }}
                            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
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
              {/* Bouton bien positionné */}
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

            {/* What Makes Your Company Unique Button */}
            {/* This button is now positioned absolutely at the bottom-right */}
            {/* <div className="absolute bottom-6 right-6">
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
            </div> */}
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

                  {/* {profile.mission && (
                    <div className="ml-18 p-8 bg-gradient-to-br from-indigo-50 via-blue-50 to-white rounded-2xl border border-indigo-100/50 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center">
                          <Target className="text-white" size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-indigo-700 mb-3">
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
                  )} */}
                </div>
              </section>

              {/* Culture & Benefits Grid */}
              {/* <div className="grid md:grid-cols-2 gap-10">
                <section className="space-y-8">
                  <div className="flex items-start gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                      <Heart className="text-rose-600" size={24} />
                    </div>
                    <div className="flex-1 h-full">
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

                <section className="space-y-8">
                  <div className="flex items-start gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Trophy className="text-amber-600" size={24} />
                    </div>
                    <div className="flex-1 h-full">
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
              </div> */}

              {/* Work Environment */}
              {/* <section className="bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-2xl p-8 border border-gray-100/50 shadow-sm">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Users className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Work Environment
                    </h3>
                    <EditableField
                      value={profile.culture.workEnvironment}
                      field="culture.workEnvironment"
                      className="text-gray-700 leading-relaxed"
                    />
                  </div>
                </div>
              </section> */}

              {/* Career Growth */}
              {/* <section className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Rocket className="text-blue-600" size={24} />
                  </div>
                  <div className="flex-1 h-full">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Career Growth & Opportunities
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800">
                          Available Roles
                        </h3>
                        {profile.opportunities.roles.map((role, index) => (
                          <EditableField
                            key={index}
                            value={role}
                            field={`opportunities.roles.${index}`}
                            icon={Briefcase}
                            className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:scale-[1.02] transition-all duration-300"
                          />
                        ))}
                      </div>

                      <div className="space-y-6">
                        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100/50">
                          <h3 className="text-xl font-semibold text-gray-800 mb-3">
                            Growth Potential
                          </h3>
                          <EditableField
                            value={profile.opportunities.growthPotential}
                            field="opportunities.growthPotential"
                            className="text-gray-700"
                          />
                        </div>
                        <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100/50">
                          <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <GraduationCap
                              size={20}
                              className="text-indigo-500"
                            />
                            Training & Development
                          </h3>
                          <EditableField
                            value={profile.opportunities.training}
                            field="opportunities.training"
                            className="text-gray-700"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section> */}

              {/* Technology Stack */}
              {/* <section className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Code className="text-emerald-600" size={24} />
                  </div>
                  <div className="flex-1 h-full">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Technology & Innovation
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                          Tech Stack
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.technology.stack.map((tech, index) => (
                            <EditableField
                              key={index}
                              value={tech}
                              field={`technology.stack.${index}`}
                              className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100"
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                          Innovation
                        </h3>
                        <EditableField
                          value={profile.technology.innovation}
                          field="technology.innovation"
                          className="text-gray-700"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section> */}
            </div>
          </div>
        </div>

        {/* Edit and Close buttons */}
        <div className="absolute right-6 top-6 flex items-center gap-3 z-10">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`p-2 rounded-full transition-all duration-300 ${
              editMode
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
    </div>
  );
}
