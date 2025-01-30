import axios from 'axios';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;

export interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  pagemap?: {
    metatags?: Array<{
      'og:description'?: string;
      'og:image'?: string;
      'article:published_time'?: string;
    }>;
  };
}

export interface GoogleSearchResponse {
  items: GoogleSearchResult[];
  searchInformation: {
    totalResults: string;
    searchTime: number;
  };
}

export const googleApi = {
  search: async (query: string): Promise<GoogleSearchResult[]> => {
    try {
      const response = await axios.get<GoogleSearchResponse>(
        'https://www.googleapis.com/customsearch/v1',
        {
          params: {
            key: GOOGLE_API_KEY,
            cx: SEARCH_ENGINE_ID,
            q: query,
            num: 10,
          },
        }
      );
      
      return response.data.items || [];
    } catch (error) {
      console.error('Google Search API Error:', error);
      throw new Error('Failed to fetch search results');
    }
  },
};