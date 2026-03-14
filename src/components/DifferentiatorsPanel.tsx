import React, { useState } from 'react';
import { ChevronLeft, Zap, DollarSign, HeadphonesIcon, Shield, Check, XCircle } from 'lucide-react';

import type { CompanyProfile } from '../api/openai';
import { saveCompanyData } from '../api/companyApi';
import Cookies from 'js-cookie';

interface Props {
  profile: CompanyProfile;
  onBack: () => void;
}

console.log(typeof React);

export function DifferentiatorsPanel({ profile, onBack }: Props) {
  const [selectedDifferentiators, setSelectedDifferentiators] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const differentiators = [
    {
      id: 'fast-payment',
      title: 'Direct Commission Payments',
      description: 'Transparent and automated commission payouts directly to your account',
      icon: DollarSign,
    },
    {
      id: 'ai-coaching',
      title: 'AI-Sales Coaching',
      description: 'Real-time feedback and AI-driven insights to boost your sales performance',
      icon: Zap,
    },
    {
      id: 'exclusive-network',
      title: 'Exclusive HARX Network',
      description: 'Access to top-tier verified companies and premium sales opportunities',
      icon: Shield,
    },
    {
      id: 'dedicated-success',
      title: 'Dedicated Partner Success',
      description: 'One-on-one support to help you scale your sales activity and earnings',
      icon: HeadphonesIcon,
    },
  ];

  const toggleDifferentiator = (id: string) => {
    setSelectedDifferentiators((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    const companyData = {
      ...profile,
      differentiators: selectedDifferentiators,
    };

    try {
      const response = await saveCompanyData(companyData);
      console.log('Complete API Response:', JSON.stringify(response, null, 2));

      if (response && response.data && response.data._id) {
        // Store company ID in a cookie that expires in 30 days
        Cookies.set('companyId', response.data._id, { expires: 30 });
        console.log("Company ID being saved to cookie:", response.data._id);
        const savedId = Cookies.get('companyId');
        console.log("Verified saved Company ID from cookie:", savedId);
      } else {
        console.error("No company ID found in response. Response structure:", response);
      }

      window.location.href = "/company";
    } catch (error: any) {
      console.error('Error saving company data:', error);
      const serverMessage = error.response?.data?.message || 'Failed to save company data. Please try again.';
      setError(serverMessage);
      console.log("Error State:", error);
    }
  };
  const handleClose = () => {
    setError(null);
    window.location.href = "/app3"
  };

  return (
    <div className="fixed inset-0 bg-premium-gradient z-50 overflow-auto animate-fade-in">
      {/* HARX-style background shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none fixed">
        <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-harx-400/10 blur-[100px] rounded-full animate-float"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[50%] h-[50%] bg-harx-alt-400/10 blur-[150px] rounded-full animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-end mb-12 relative z-10">
          <div className="text-right">
            <h1 className="text-3xl font-black bg-gradient-harx bg-clip-text text-transparent">Main Differentiators</h1>
            <p className="text-gray-500 mt-2 font-medium">Select the key factors that make partnering with {profile.name} attractive</p>
          </div>
        </div>


        <div className="space-y-12">
          <div className="grid md:grid-cols-2 gap-6">
            {differentiators.map((diff) => (
              <button
                key={diff.id}
                onClick={() => toggleDifferentiator(diff.id)}
                className={`group relative p-8 rounded-3xl border-2 transition-all duration-300 text-left relative z-10 ${selectedDifferentiators.includes(diff.id) ? 'border-harx-500 bg-white shadow-xl shadow-harx-500/10 scale-[1.02]' : 'border-harx-100 bg-white/80 backdrop-blur-md hover:border-harx-300 hover:scale-[1.01]'
                  }`}
              >

                {selectedDifferentiators.includes(diff.id) && (
                  <div className="absolute top-6 right-6">
                    <div className="w-8 h-8 rounded-full bg-gradient-harx flex items-center justify-center text-white shadow-lg animate-fade-in">
                      <Check size={20} />
                    </div>
                  </div>
                )}

                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${selectedDifferentiators.includes(diff.id) ? 'bg-gradient-harx text-white rotate-12 scale-110' : 'bg-harx-50 text-harx-500 group-hover:bg-harx-100'
                  }`}>

                  <diff.icon
                    size={28}
                  />
                </div>

                <h3 className={`text-xl font-bold mb-3 transition-colors ${selectedDifferentiators.includes(diff.id) ? 'text-harx-900' : 'text-gray-900 group-hover:text-harx-600'
                  }`}>
                  {diff.title}
                </h3>
                <p className={`text-sm leading-relaxed transition-colors ${selectedDifferentiators.includes(diff.id) ? 'text-harx-700 font-medium' : 'text-gray-500'
                  }`}>
                  {diff.description}
                </p>

              </button>
            ))}
          </div>

          <div className="flex justify-between items-center relative z-10 pt-8 border-t border-harx-100">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-500 hover:text-harx-600 transition-all font-bold group"
            >
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
            <button
              onClick={handleSave}
              disabled={selectedDifferentiators.length === 0}
              className="px-12 py-5 bg-gradient-harx text-white rounded-2xl hover:shadow-2xl hover:shadow-harx-500/30 transition-all transform hover:-translate-y-1 shadow-xl flex items-center gap-3 text-lg font-black disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Zap size={24} className="animate-pulse" />
              Complete Profile
            </button>
          </div>

        </div>
      </div>

      {error && (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm">
            <XCircle className="text-red-500 mx-auto" size={40} />
            <h2 className="text-xl font-bold text-gray-900 mt-4">Error</h2>
            <p className="text-gray-600 mt-2">{error}</p>
            <button onClick={handleClose} className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
