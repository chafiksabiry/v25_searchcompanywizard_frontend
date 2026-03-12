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
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-end mb-12">
          <div className="text-right">
            <h1 className="text-3xl font-bold text-gray-900">Main Differentiators</h1>
            <p className="text-gray-500 mt-1">Select the key factors that make partnering with {profile.name} attractive</p>
          </div>
        </div>

        <div className="space-y-12">
          <div className="grid md:grid-cols-2 gap-6">
            {differentiators.map((diff) => (
              <button
                key={diff.id}
                onClick={() => toggleDifferentiator(diff.id)}
                className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${selectedDifferentiators.includes(diff.id) ? 'border-rose-500 bg-rose-50/50' : 'border-gray-200 hover:border-rose-300 bg-white'
                  }`}
              >
                {selectedDifferentiators.includes(diff.id) && (
                  <div className="absolute top-4 right-4">
                    <Check className="text-rose-500" size={20} />
                  </div>
                )}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${selectedDifferentiators.includes(diff.id) ? 'bg-rose-100' : 'bg-gray-100 group-hover:bg-rose-50'
                  }`}>
                  <diff.icon
                    size={24}
                    className={
                      selectedDifferentiators.includes(diff.id) ? 'text-rose-600' : 'text-gray-600 group-hover:text-rose-500'
                    }
                  />
                </div>
                <h3 className={`text-lg font-semibold mb-2 transition-colors ${selectedDifferentiators.includes(diff.id) ? 'text-rose-900' : 'text-gray-900'
                  }`}>
                  {diff.title}
                </h3>
                <p className={`text-sm transition-colors ${selectedDifferentiators.includes(diff.id) ? 'text-rose-700' : 'text-gray-600'
                  }`}>
                  {diff.description}
                </p>
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-rose-500 transition-colors font-medium"
            >
              <ChevronLeft size={20} />
              Back
            </button>
            <button
              onClick={handleSave}
              disabled={selectedDifferentiators.length === 0}
              className="px-10 py-4 bg-gradient-to-r from-orange-400 to-rose-500 text-white rounded-2xl hover:from-orange-500 hover:to-rose-600 transition-all transform hover:-translate-y-1 shadow-xl hover:shadow-rose-200 flex items-center gap-3 text-lg font-bold disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
            >
              <Zap size={18} />
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
