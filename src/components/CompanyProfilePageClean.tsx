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
  ExternalLink,
} from "lucide-react";
import type { CompanyProfile as CompanyProfileType } from "../api/openaiBackend";
import { UniquenessPanel } from "./UniquenessPanel";

interface Props {
  profile: CompanyProfileType;
  onBackToSearch: () => void;
}

export function CompanyProfilePageClean({ profile, onBackToSearch }: Props) {
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
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button
            onClick={onBackToSearch}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft size={18} />
            <span>Back to Search</span>
          </button>
          
          {/* Company Header */}
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
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
                <Building2 className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{profile.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {profile.industry && (
                  <div className="flex items-center gap-1">
                    <Factory size={14} />
                    <span>{profile.industry}</span>
                  </div>
                )}
                {profile.founded && (
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>Founded {profile.founded}</span>
                  </div>
                )}
                {profile.headquarters && (
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{profile.headquarters}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Company Overview */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">
                {profile.overview}
              </p>
            </section>

            {/* Mission */}
            {profile.mission && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Mission</h2>
                <p className="text-gray-700 leading-relaxed">
                  {profile.mission}
                </p>
              </section>
            )}

            {/* Values & Benefits */}
            <div className="grid md:grid-cols-2 gap-8">
              {profile.culture?.values && profile.culture.values.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Values</h3>
                  <ul className="space-y-2">
                    {profile.culture.values.map((value, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-700">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                        <span>{value}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {profile.culture?.benefits && profile.culture.benefits.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefits</h3>
                  <ul className="space-y-2">
                    {profile.culture.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-700">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {/* CTA Button */}
            <div className="pt-8 border-t border-gray-200">
              <button
                onClick={() => setShowUniquenessPanel(true)}
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Trophy size={18} />
                <span>What makes us unique</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Contact */}
            {hasContactInfo && (
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
                <div className="space-y-3">
                  {profile.contact?.email && (
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-gray-400" />
                      <a 
                        href={`mailto:${profile.contact.email}`} 
                        className="text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        {profile.contact.email}
                      </a>
                    </div>
                  )}
                  {profile.contact?.phone && (
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-gray-400" />
                      <a 
                        href={`tel:${profile.contact.phone}`} 
                        className="text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        {profile.contact.phone}
                      </a>
                    </div>
                  )}
                  {profile.contact?.website && (
                    <div className="flex items-center gap-3">
                      <Globe size={16} className="text-gray-400" />
                      <a 
                        href={profile.contact.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1"
                      >
                        Website
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                  {profile.contact?.address && (
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-gray-400 mt-0.5" />
                      <span className="text-gray-700 text-sm leading-relaxed">
                        {profile.contact.address}
                      </span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Social Media */}
            {hasSocialMedia && (
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow</h3>
                <div className="flex gap-3">
                  {profile.socialMedia?.linkedin && (
                    <a
                      href={profile.socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors"
                    >
                      <Linkedin size={18} />
                    </a>
                  )}
                  {profile.socialMedia?.twitter && (
                    <a
                      href={profile.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors"
                    >
                      <Twitter size={18} />
                    </a>
                  )}
                  {profile.socialMedia?.facebook && (
                    <a
                      href={profile.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors"
                    >
                      <Facebook size={18} />
                    </a>
                  )}
                  {profile.socialMedia?.instagram && (
                    <a
                      href={profile.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors"
                    >
                      <Instagram size={18} />
                    </a>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
