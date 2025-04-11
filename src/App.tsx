import React from 'react';
import { useState, useEffect } from 'react';
import { Search, Building2 } from 'lucide-react';
import { googleApi, type GoogleSearchResult } from './api/google';
import { generateCompanyProfile, type CompanyProfile } from './api/openai';
import { CompanyProfile as CompanyProfileComponent } from './components/CompanyProfile';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<GoogleSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);

  useEffect(() => {
    const checkUserCompany = async () => {
      const userId = Cookies.get('userId');
      if (userId) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/companies/${userId}`);
          if (response.ok) {
            navigate('/company');
          }
        } catch (error) {
          console.error('Error checking user company:', error);
        }
      }
    };

    checkUserCompany();
  }, [navigate]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    setCompanyProfile(null);

    try {
      const results = await googleApi.search(searchQuery);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectResult = async (result: GoogleSearchResult) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const companyInfo = `
        Company Name: ${result.title}
        Website: ${result.link}
        Description: ${result.snippet}
        Additional Info: ${result.pagemap?.metatags?.[0]?.['og:description'] || ''}
      `.trim();
      
      const profile = await generateCompanyProfile(companyInfo);
      setCompanyProfile(profile);
    } catch (err) {
      console.error('Profile generation error:', err);
      setError('Failed to generate company profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto pt-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Company Profile Search</h1>
          <p className="text-lg text-gray-600">
            Search for companies and generate detailed profiles with unique insights
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter company name..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            <button
              onClick={handleSearch}
              disabled={isLoading || !searchQuery.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-indigo-600 disabled:text-gray-300"
            >
              <Search size={20} />
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              searchResults.map((result, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="text-indigo-600" size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {result.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">{result.snippet}</p>
                      <button
                        onClick={() => handleSelectResult(result)}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Generate Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {companyProfile && (
        <CompanyProfileComponent
          profile={companyProfile}
          onClose={() => setCompanyProfile(null)}
        />
      )}
    </div>
  );
}

export default App;