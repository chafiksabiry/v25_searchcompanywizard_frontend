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
  ArrowLeft,
  Users,
  Award,
  Star,
  ExternalLink,
} from "lucide-react";
import type { CompanyProfile as CompanyProfileType } from "../api/openaiBackend";
import { UniquenessPanel } from "./UniquenessPanel";

interface Props {
  profile: CompanyProfileType;
  onBackToSearch: () => void;
}

export function CompanyProfilePageModern({ profile, onBackToSearch }: Props) {
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
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
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
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBackToSearch}
              className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Search</span>
            </button>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-sm text-gray-500">{profile.industry}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-purple-600/90"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Company Info */}
            <div className="text-white">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center p-4 border border-white/20">
                  {getLogoUrl() ? (
                    <img
                      src={getLogoUrl()!}
                      alt={profile.name}
                      className="w-full h-full object-contain rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Building2 className="w-12 h-12 text-white" />
                  )}
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">{profile.name}</h1>
                  <div className="flex flex-wrap gap-4 text-white/90">
                    {profile.industry && (
                      <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm">
                        <Factory size={16} />
                        <span>{profile.industry}</span>
                      </div>
                    )}
                    {profile.founded && (
                      <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm">
                        <Calendar size={16} />
                        <span>Founded {profile.founded}</span>
                      </div>
                    )}
                    {profile.headquarters && (
                      <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm">
                        <MapPin size={16} />
                        <span>{profile.headquarters}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => setShowUniquenessPanel(true)}
                className="inline-flex items-center gap-3 bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Trophy size={20} />
                <span>Discover What Makes Us Unique</span>
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="text-white/80" size={24} />
                  <span className="text-white/80 text-sm">Team Size</span>
                </div>
                <div className="text-2xl font-bold text-white">500+</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="text-white/80" size={24} />
                  <span className="text-white/80 text-sm">Experience</span>
                </div>
                <div className="text-2xl font-bold text-white">{new Date().getFullYear() - parseInt(profile.founded || '2000')}+ Years</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <Star className="text-white/80" size={24} />
                  <span className="text-white/80 text-sm">Rating</span>
                </div>
                <div className="text-2xl font-bold text-white">4.8/5</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="text-white/80" size={24} />
                  <span className="text-white/80 text-sm">Global Reach</span>
                </div>
                <div className="text-2xl font-bold text-white">25+ Countries</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Company Overview */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Building2 className="text-indigo-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Company Overview</h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">
                {profile.overview}
              </p>
            </div>

            {/* Mission */}
            {profile.mission && (
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center">
                    <Trophy className="text-white" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg font-medium">
                  {profile.mission}
                </p>
              </div>
            )}

            {/* Values & Benefits */}
            <div className="grid md:grid-cols-2 gap-6">
              {profile.culture?.values && profile.culture.values.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Core Values</h3>
                  <div className="space-y-3">
                    {profile.culture.values.map((value, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        <span className="text-gray-700">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profile.culture?.benefits && profile.culture.benefits.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Benefits & Perks</h3>
                  <div className="space-y-3">
                    {profile.culture.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            {hasContactInfo && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Mail className="text-indigo-600" size={20} />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  {profile.contact?.email && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Mail size={18} className="text-gray-400" />
                      <a href={`mailto:${profile.contact.email}`} className="hover:text-indigo-600 transition-colors">
                        {profile.contact.email}
                      </a>
                    </div>
                  )}
                  {profile.contact?.phone && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Phone size={18} className="text-gray-400" />
                      <a href={`tel:${profile.contact.phone}`} className="hover:text-indigo-600 transition-colors">
                        {profile.contact.phone}
                      </a>
                    </div>
                  )}
                  {profile.contact?.website && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Globe size={18} className="text-gray-400" />
                      <a 
                        href={profile.contact.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:text-indigo-600 transition-colors flex items-center gap-1"
                      >
                        Visit Website
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  )}
                  {profile.contact?.address && (
                    <div className="flex items-start gap-3 text-gray-600">
                      <MapPin size={18} className="text-gray-400 mt-0.5" />
                      <span className="text-sm">{profile.contact.address}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Social Media */}
            {hasSocialMedia && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Globe className="text-indigo-600" size={20} />
                  Follow Us
                </h3>
                <div className="flex gap-3">
                  {profile.socialMedia?.linkedin && (
                    <a
                      href={profile.socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      <Linkedin size={20} />
                    </a>
                  )}
                  {profile.socialMedia?.twitter && (
                    <a
                      href={profile.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 flex items-center justify-center rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
                    >
                      <Twitter size={20} />
                    </a>
                  )}
                  {profile.socialMedia?.facebook && (
                    <a
                      href={profile.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      <Facebook size={20} />
                    </a>
                  )}
                  {profile.socialMedia?.instagram && (
                    <a
                      href={profile.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 flex items-center justify-center rounded-xl bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors"
                    >
                      <Instagram size={20} />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Map */}
            {(profile.contact?.address || hasLocation) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <MapPin className="text-indigo-600" size={20} />
                  Location
                </h3>
                <div className="relative h-48 rounded-xl overflow-hidden bg-gray-100">
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
                          className="absolute bottom-3 right-3 px-3 py-2 bg-white hover:bg-gray-50 text-sm text-indigo-600 rounded-lg shadow-lg flex items-center gap-2 transition-all hover:scale-105"
                        >
                          <MapPin size={14} />
                          Get Directions
                        </a>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                      <span>Map not available</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
