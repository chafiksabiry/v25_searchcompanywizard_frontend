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
} from "lucide-react";
import type { CompanyProfile as CompanyProfileType } from "../api/openaiBackend";
import { updateCompanyProfile } from "../api/openaiBackend";
import { UniquenessPanel } from "./UniquenessPanel";

interface Props {
  profile: CompanyProfileType;
  onBackToSearch: () => void;
}

export function CompanyProfilePageModern({ profile: initialProfile, onBackToSearch }: Props) {
  const [showUniquenessPanel, setShowUniquenessPanel] = useState(false);
  const [profile, setProfile] = useState(initialProfile);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [showLogoEditor, setShowLogoEditor] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  // Log initial profile load
  React.useEffect(() => {
    console.log('🏢 [Profile] Company profile page loaded:', {
      companyName: initialProfile.name,
      industry: initialProfile.industry,
      hasLogo: !!initialProfile.logo,
      hasContact: !!initialProfile.contact,
      hasCulture: !!initialProfile.culture,
      valuesCount: initialProfile.culture?.values?.length || 0,
      benefitsCount: initialProfile.culture?.benefits?.length || 0,
      profileKeys: Object.keys(initialProfile)
    });
  }, [initialProfile]);

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

  const handleFieldClick = (field: string, value: string) => {
    setEditingField(field);
    setTempValue(value);
  };

  const handleFieldSave = async (field: string) => {
    console.log('💾 [Profile] Saving field:', { 
      field, 
      oldValue: getFieldValue(field),
      newValue: tempValue 
    });

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
    const updatedProfile = updateProfile(fieldPath, tempValue);
    
    // Mise à jour locale immédiate pour une meilleure UX
    setProfile(updatedProfile);
    setEditingField(null);

    console.log('✅ [Profile] Field saved locally:', { 
      field, 
      newValue: tempValue,
      profileUpdated: true 
    });

    // Sauvegarde dans la base de données si on a un ID
    if (profile._id) {
      try {
        setIsSyncing(true);
        console.log('🌐 [Profile] Syncing field to database:', { field, companyId: profile._id });
        
        // Créer l'objet de mise à jour avec la structure correcte
        const updateData: any = {};
        let current = updateData;
        for (let i = 0; i < fieldPath.length - 1; i++) {
          current[fieldPath[i]] = {};
          current = current[fieldPath[i]];
        }
        current[fieldPath[fieldPath.length - 1]] = tempValue;

        await updateCompanyProfile(profile._id, updateData);
        console.log('✅ [Profile] Field synced to database successfully');
      } catch (error) {
        console.error('⚠️ [Profile] Failed to sync to database:', error);
        // En cas d'erreur, on garde la modification locale mais on informe l'utilisateur
      } finally {
        setIsSyncing(false);
      }
    } else {
      console.log('ℹ️ [Profile] No company ID, skipping database sync');
    }
  };

  const getFieldValue = (field: string) => {
    const fieldPath = field.split(".");
    let current = profile as any;
    for (const key of fieldPath) {
      if (current && typeof current === 'object') {
        current = current[key];
      } else {
        return undefined;
      }
    }
    return current;
  };

  const handleKeyDown = async (e: React.KeyboardEvent, field: string) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        await handleFieldSave(field);
      }
      if (e.key === 'Escape') {
        setEditingField(null);
      }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('📷 [Profile] Logo upload started:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        const updatedProfile = { ...profile, logo: result };
        setProfile(updatedProfile);
        setShowLogoEditor(false);
        
        console.log('✅ [Profile] Logo uploaded successfully:', {
          fileName: file.name,
          dataSize: result.length,
          logoSet: true
        });

        // Sync to database
        if (profile._id) {
          try {
            console.log('🌐 [Profile] Syncing logo to database');
            await updateCompanyProfile(profile._id, { logo: result });
            console.log('✅ [Profile] Logo synced to database successfully');
          } catch (error) {
            console.error('⚠️ [Profile] Failed to sync logo to database:', error);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUrlSave = async () => {
    console.log('🌐 [Profile] Logo URL save:', {
      logoUrl: logoUrl.trim(),
      hasUrl: !!logoUrl.trim()
    });

    if (logoUrl.trim()) {
      const updatedProfile = { ...profile, logo: logoUrl.trim() };
      setProfile(updatedProfile);
      
      console.log('✅ [Profile] Logo URL saved successfully:', {
        logoUrl: logoUrl.trim()
      });

      // Sync to database
      if (profile._id) {
        try {
          console.log('🌐 [Profile] Syncing logo URL to database');
          await updateCompanyProfile(profile._id, { logo: logoUrl.trim() });
          console.log('✅ [Profile] Logo URL synced to database successfully');
        } catch (error) {
          console.error('⚠️ [Profile] Failed to sync logo URL to database:', error);
        }
      }
    }
    setShowLogoEditor(false);
    setLogoUrl("");
  };

  const EditableText = ({ 
    value, 
    field, 
    className = "", 
    multiline = false,
    placeholder = "Click to edit..."
  }: {
    value: string;
    field: string;
    className?: string;
    multiline?: boolean;
    placeholder?: string;
  }) => {
    const isEditing = editingField === field;

    if (isEditing) {
      // Create base classes while preserving original styling but override text color
      const baseEditingClasses = "border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white !text-gray-900";
      
      // Remove any text color classes from className to avoid conflicts
      const classNameWithoutTextColor = className.replace(/text-\w+-\w+/g, '').replace(/text-white/g, '').trim();
      
      return multiline ? (
        <textarea
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={() => handleFieldSave(field)}
          onKeyDown={(e) => handleKeyDown(e, field)}
          className={`${classNameWithoutTextColor} ${baseEditingClasses} min-h-[100px] w-full px-3 py-2 resize-y`}
          placeholder={placeholder}
          autoFocus
        />
      ) : (
        <input
          type="text"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={() => handleFieldSave(field)}
          onKeyDown={(e) => handleKeyDown(e, field)}
          className={`${classNameWithoutTextColor} ${baseEditingClasses} w-full px-3 py-2`}
          placeholder={placeholder}
          autoFocus
        />
      );
    }

    // Check if this field contains a URL (website or email)
    const isClickableField = field.includes('website') || field.includes('email');
    const isUrl = value && (value.startsWith('http') || value.startsWith('mailto:') || value.includes('@'));
    
    if (isClickableField && isUrl && !editingField) {
      // Render as clickable link for website/email fields
      const href = field.includes('email') && !value.startsWith('mailto:') ? `mailto:${value}` : value;
      
      return (
        <a
          href={href}
          target={field.includes('website') ? '_blank' : undefined}
          rel={field.includes('website') ? 'noopener noreferrer' : undefined}
          onDoubleClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleFieldClick(field, value);
          }}
          className={`${className} hover:text-indigo-600 transition-colors duration-200 rounded-lg px-3 py-2 border border-transparent hover:border-indigo-200 min-h-[2rem] flex items-center underline cursor-pointer`}
          title="Single click to visit, double click to edit"
        >
          {value}
        </a>
      );
    }

    return (
      <div
        onDoubleClick={() => handleFieldClick(field, value)}
        className={`${className} cursor-pointer hover:bg-indigo-50 hover:text-indigo-900 transition-colors duration-200 rounded-lg px-3 py-2 border border-transparent hover:border-indigo-200 ${!value ? 'text-gray-400 italic' : ''} min-h-[2rem] flex items-center`}
        title="Double click to edit"
      >
        {value || placeholder}
      </div>
    );
  };

  if (showUniquenessPanel) {
    console.log('⭐ [Profile] Showing uniqueness panel for:', {
      companyName: profile.name,
      industry: profile.industry
    });

    return (
      <UniquenessPanel
        profile={profile}
        onBack={() => {
          console.log('🔙 [Profile] Returning from uniqueness panel');
          setShowUniquenessPanel(false);
        }}
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
              
              {/* Sync Status Indicator */}
              {isSyncing && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              )}
              
              {/* Saved indicator */}
              {profile._id && !isSyncing && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Saved</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

       {/* Hero Section */}
       <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 overflow-hidden">
         <div className="absolute inset-0">
           <div className="absolute inset-0 bg-black/20"></div>
           <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-purple-600/90"></div>
           {/* Pattern overlay */}
           <div className="absolute inset-0 opacity-10" style={{
             backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
             backgroundSize: '20px 20px'
           }}></div>
         </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Company Info */}
            <div className="text-white">
              <div className="flex items-center gap-6 mb-8">
                <div 
                  className="relative w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center p-4 border border-white/20 cursor-pointer hover:bg-white/20 transition-all duration-300 group"
                  onClick={() => setShowLogoEditor(true)}
                >
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
                  
                  {/* Edit overlay */}
                  <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-xs font-medium">Edit Logo</span>
                  </div>
                </div>
                 <div>
                   <EditableText
                     value={profile.name}
                     field="name"
                     className="text-4xl font-bold mb-2 text-white block w-full"
                     placeholder="Company Name"
                   />
                  <div className="flex flex-wrap gap-4 text-white/90">
                     <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm">
                       <Factory size={16} />
                       <EditableText
                         value={profile.industry || ''}
                         field="industry"
                         className="text-white/90 text-sm inline-block min-w-[100px]"
                         placeholder="Industry"
                       />
                     </div>
                     <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm">
                       <Calendar size={16} />
                       <span>Founded </span>
                       <EditableText
                         value={profile.founded || ''}
                         field="founded"
                         className="text-white/90 text-sm inline-block min-w-[60px]"
                         placeholder="Year"
                       />
                     </div>
                     <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm">
                       <MapPin size={16} />
                       <EditableText
                         value={profile.headquarters || ''}
                         field="headquarters"
                         className="text-white/90 text-sm inline-block min-w-[120px]"
                         placeholder="Headquarters"
                       />
                     </div>
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

       {/* Floating CTA Button - Responsive & Brilliant */}
       <div className="fixed bottom-6 right-6 z-50">
         {/* Mobile Version - Smaller */}
              <button
                onClick={() => {
                  console.log('📱 [Profile] Mobile uniqueness button clicked');
                  setShowUniquenessPanel(true);
                }}
                className="lg:hidden group relative bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-600 text-white p-4 rounded-full font-semibold hover:from-indigo-600 hover:via-purple-600 hover:to-blue-700 transition-all duration-500 shadow-2xl hover:shadow-indigo-500/50 transform hover:scale-110 hover:-translate-y-2"
              >
           {/* Brilliant glow effect */}
           <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-500 rounded-full blur-lg opacity-60 animate-pulse"></div>
           <div className="relative">
             <Trophy size={28} className="drop-shadow-lg" />
             <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce shadow-lg"></div>
           </div>
         </button>

         {/* Desktop Version - Larger */}
              <button
                onClick={() => {
                  console.log('💻 [Profile] Desktop uniqueness button clicked');
                  setShowUniquenessPanel(true);
                }}
                className="hidden lg:flex group relative bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-600 text-white px-8 py-5 rounded-2xl font-bold hover:from-indigo-600 hover:via-purple-600 hover:to-blue-700 transition-all duration-500 shadow-2xl hover:shadow-indigo-500/50 transform hover:scale-105 hover:-translate-y-3 items-center gap-4"
              >
           {/* Brilliant glow effect */}
           <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
           
           <div className="relative flex items-center gap-4">
             <div className="relative">
               <Trophy size={32} className="drop-shadow-lg" />
               <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce shadow-lg"></div>
             </div>
             
             <div className="text-left">
               <div className="text-lg font-bold leading-tight">What Makes Us</div>
               <div className="text-sm opacity-90 font-medium">Unique & Attractive</div>
             </div>
             
             <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-300 drop-shadow-lg" />
           </div>

           {/* Sparkle animations */}
           <div className="absolute top-2 left-4 w-1 h-1 bg-white rounded-full animate-ping"></div>
           <div className="absolute bottom-3 right-6 w-1 h-1 bg-white rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
           <div className="absolute top-4 right-4 w-1 h-1 bg-white rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
         </button>
       </div>

       {/* Main Content */}
       <div className="max-w-7xl mx-auto px-6 py-12">
         <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Company Overview */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
               <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center">
                   <Building2 className="text-indigo-600" size={24} />
                 </div>
                <h2 className="text-2xl font-bold text-gray-900">Company Overview</h2>
              </div>
              <div className="prose prose-lg max-w-none">
                <EditableText
                  value={profile.overview}
                  field="overview"
                  className="text-gray-700 leading-relaxed text-lg block w-full min-h-[120px]"
                  multiline={true}
                  placeholder="Click to add company overview..."
                />
              </div>
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
                <EditableText
                  value={profile.mission || ''}
                  field="mission"
                  className="text-gray-700 leading-relaxed text-lg font-medium block w-full min-h-[80px]"
                  multiline={true}
                  placeholder="Click to add mission statement..."
                />
              </div>
            )}

             {/* Values & Benefits */}
             <div className="grid md:grid-cols-2 gap-6">
               {profile.culture?.values && profile.culture.values.length > 0 && (
                 <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                   <div className="flex items-center gap-3 mb-4">
                     <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-lg flex items-center justify-center">
                       <Trophy className="text-indigo-600" size={18} />
                     </div>
                     <h3 className="text-xl font-bold text-gray-900">Core Values</h3>
                   </div>
                   <div className="space-y-3">
                     {profile.culture?.values?.map((value, index) => (
                       <div key={index} className="flex items-center gap-3">
                         <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"></div>
                         <EditableText
                           value={value}
                           field={`culture.values.${index}`}
                           className="text-gray-700 font-medium flex-1 min-w-[200px]"
                           placeholder="Core value..."
                         />
                       </div>
                     )) || (
                       <EditableText
                         value=""
                         field="culture.values.0"
                         className="text-gray-700 font-medium"
                         placeholder="Click to add core values..."
                       />
                     )}
                   </div>
                 </div>
               )}

               {profile.culture?.benefits && profile.culture.benefits.length > 0 && (
                 <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                   <div className="flex items-center gap-3 mb-4">
                     <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                       <Award className="text-green-600" size={18} />
                     </div>
                     <h3 className="text-xl font-bold text-gray-900">Benefits & Perks</h3>
                   </div>
                   <div className="space-y-3">
                     {profile.culture?.benefits?.map((benefit, index) => (
                       <div key={index} className="flex items-center gap-3">
                         <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                         <EditableText
                           value={benefit}
                           field={`culture.benefits.${index}`}
                           className="text-gray-700 font-medium flex-1 min-w-[200px]"
                           placeholder="Benefit or perk..."
                         />
                       </div>
                     )) || (
                       <EditableText
                         value=""
                         field="culture.benefits.0"
                         className="text-gray-700 font-medium"
                         placeholder="Click to add benefits..."
                       />
                     )}
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
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail size={18} className="text-gray-400" />
                    <EditableText
                      value={profile.contact?.email || ''}
                      field="contact.email"
                      className="hover:text-indigo-600 transition-colors flex-1 text-gray-600 min-w-[200px]"
                      placeholder="email@company.com"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone size={18} className="text-gray-400" />
                    <EditableText
                      value={profile.contact?.phone || ''}
                      field="contact.phone"
                      className="hover:text-indigo-600 transition-colors flex-1 text-gray-600 min-w-[150px]"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-600">
                    <Globe size={18} className="text-gray-400" />
                    <EditableText
                      value={profile.contact?.website || ''}
                      field="contact.website"
                      className="hover:text-indigo-600 transition-colors flex-1 text-gray-600 min-w-[200px]"
                      placeholder="https://company.com"
                    />
                  </div>
                  
                  <div className="flex items-start gap-3 text-gray-600">
                    <MapPin size={18} className="text-gray-400 mt-0.5" />
                    <EditableText
                      value={profile.contact?.address || ''}
                      field="contact.address"
                      className="text-sm flex-1 text-gray-600 min-h-[60px] block w-full"
                      multiline={true}
                      placeholder="Company address..."
                    />
                  </div>
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

      {/* Logo Editor Modal */}
      {showLogoEditor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit Company Logo</h3>
              <button
                onClick={() => {
                  setShowLogoEditor(false);
                  setLogoUrl("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Current Logo Preview */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-gray-100 rounded-xl flex items-center justify-center mb-2">
                  {getLogoUrl() ? (
                    <img
                      src={getLogoUrl()!}
                      alt="Logo preview"
                      className="w-16 h-16 object-contain rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : (
                    <Building2 className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <p className="text-sm text-gray-500">Current Logo</p>
              </div>

              {/* Upload Image */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p className="text-xs text-gray-500">
                  Supported formats: JPG, PNG, GIF, SVG
                </p>
              </div>

              {/* Or divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              {/* URL Input */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleLogoUrlSave();
                    }
                  }}
                />
                <p className="text-xs text-gray-500">
                  Enter a direct URL to an image file
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowLogoEditor(false);
                    setLogoUrl("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoUrlSave}
                  disabled={!logoUrl.trim()}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
