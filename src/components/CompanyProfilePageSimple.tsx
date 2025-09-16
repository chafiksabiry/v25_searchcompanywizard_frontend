import React, { useState } from "react";
import {
  Building2,
  Calendar,
  MapPin,
  Globe,
  Trophy,
  Mail,
  Phone,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Factory,
  ArrowRight,
  Image,
  ArrowLeft,
} from "lucide-react";
import type { CompanyProfile as CompanyProfileType } from "../api/openaiBackend";
import { UniquenessPanel } from "./UniquenessPanel";

interface Props {
  profile: CompanyProfileType;
  onBackToSearch: () => void;
}

export function CompanyProfilePageSimple({ profile, onBackToSearch }: Props) {
  const [showUniquenessPanel, setShowUniquenessPanel] = useState(false);

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

  const getLogoUrl = () => {
    if (profile.logo) return profile.logo;
    
    if (profile.contact?.website) {
      try {
        const domain = new URL(profile.contact.website).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      } catch {
        return null;
      }
    }
    
    return null;
  };

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
                    <div className="flex items-center gap-3 text-gray-600 text-sm">
                      <Mail size={18} />
                      <span>{profile.contact.email}</span>
                    </div>
                  )}
                  {profile.contact?.phone && (
                    <div className="flex items-center gap-3 text-gray-600 text-sm">
                      <Phone size={18} />
                      <span>{profile.contact.phone}</span>
                    </div>
                  )}
                  {profile.contact?.website && (
                    <div className="flex items-center gap-3 text-gray-600 text-sm">
                      <Globe size={18} />
                      <span>{profile.contact.website}</span>
                    </div>
                  )}
                  {profile.contact?.address && (
                    <div className="flex items-start gap-3 text-gray-600 text-sm">
                      <MapPin size={18} />
                      <span>{profile.contact.address}</span>
                    </div>
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
                <div className="w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center p-4 overflow-hidden">
                  {getLogoUrl() ? (
                    <img
                      src={getLogoUrl()!}
                      alt={profile.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Image className="w-full h-full text-indigo-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
                    {profile.name}
                  </h1>
                  <div className="flex flex-wrap gap-6 text-white/90">
                    {profile.industry && (
                      <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                        <Factory size={18} />
                        <span>{profile.industry}</span>
                      </div>
                    )}
                    {profile.founded && (
                      <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                        <Calendar size={18} />
                        <span>{profile.founded}</span>
                      </div>
                    )}
                    {profile.headquarters && (
                      <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                        <MapPin size={18} />
                        <span>{profile.headquarters}</span>
                      </div>
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
                      <p className="text-gray-700 leading-relaxed text-lg">
                        {profile.overview}
                      </p>
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
