import React from 'react';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { googleApi, type GoogleSearchResult } from './api/google';
import { generateCompanyProfile, type CompanyProfile } from './api/openai';
import { CompanyProfile as CompanyProfileComponent } from './components/CompanyProfile';
import { CompanyLogo } from './components/CompanyLogo';
import Cookies from 'js-cookie';


function App() {

  const [searchQuery, setSearchQuery] = React.useState('');
  const [redirectMessage, setRedirectMessage] = useState<string | null>(null);
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
            setRedirectMessage('You already have a company profile. Redirecting...');
            setTimeout(() => {
              window.location.href = '/company';
            }, 2000);
          }
        } catch (error) {
          console.error('Error checking user company:', error);
        }
      }
    };

    checkUserCompany();
  }, []);


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

      // Extract logo URL logic
      let logoUrl = result.pagemap?.metatags?.[0]?.['og:image'];
      if (!logoUrl && result.link) {
        try {
          const domain = new URL(result.link).hostname;
          logoUrl = `https://logo.clearbit.com/${domain}`;
        } catch (e) {
          // Ignore URL parsing errors
        }
      }

      const profile = await generateCompanyProfile(companyInfo, logoUrl);

      // Ensure logo is preserved if found during search but not in generated profile
      if (!profile.logo && logoUrl) {
        profile.logo = logoUrl;
      }

      setCompanyProfile(profile);
    } catch (err) {
      console.error('Profile generation error:', err);
      setError('Failed to generate company profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-premium-gradient p-4 flex flex-col items-center justify-center animate-fade-in relative overflow-hidden">
      {/* HARX-style background shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-harx-400/20 blur-[100px] rounded-full animate-float"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[50%] h-[50%] bg-harx-alt-400/20 blur-[150px] rounded-full animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      {!companyProfile ? (
        <div className="max-w-4xl w-full mx-auto relative z-10">
          <div className="text-center mb-8 animate-fade-in">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <img
                src={`${import.meta.env.BASE_URL || '/'}mascotte.webp`}
                alt="HARX Mascotte"
                className="w-full h-auto object-contain animate-bounce-slow"
              />
              <div className="absolute -inset-4 bg-gradient-to-r from-harx-400/20 to-harx-alt-400/20 rounded-full blur-xl -z-10" />
            </div>

            <h1 className="text-4xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-harx-500 to-harx-alt-500">
                Company Profile Search
              </span>
            </h1>
            <p className="text-lg text-gray-600">
              Search for companies and generate detailed profiles with unique insights
            </p>
          </div>

          {/* 🔔 Add your message here */}
          {redirectMessage && (
            <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded-lg text-center text-sm">
              {redirectMessage}
            </div>
          )}

          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-harx-100 p-8 mb-8 animate-fade-in">
            <div className="flex flex-col gap-4">
              <div className="relative group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter company name..."
                  className="w-full px-5 py-4 pr-14 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-harx-500/20 focus:border-harx-500 outline-none transition-all placeholder:text-gray-400"
                />
                <button
                  onClick={handleSearch}
                  disabled={isLoading || !searchQuery.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 text-gray-400 hover:text-harx-600 disabled:text-gray-200 transition-colors"
                >
                  <Search size={24} />
                </button>
              </div>

            </div>


            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="mt-6 space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-10 h-10 border-3 border-harx-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (

                searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="p-5 border border-gray-100 rounded-2xl hover:border-harx-200 hover:bg-harx-50/30 transition-all group animate-fade-in"
                  >
                    <div className="flex items-start gap-5">
                      <CompanyLogo result={result} />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-harx-600 transition-colors">
                          {result.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{result.snippet}</p>
                        <button
                          onClick={() => handleSelectResult(result)}
                          className="px-6 py-2.5 bg-gradient-harx text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-harx-500/20 transform hover:-translate-y-0.5 transition-all"
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
      ) : (
        <CompanyProfileComponent
          profile={companyProfile}
          onClose={() => setCompanyProfile(null)}
        />
      )}
    </div>
  );
}

export default App;