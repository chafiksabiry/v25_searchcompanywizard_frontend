import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import type { GoogleSearchResult } from '../api/google';

interface CompanyLogoProps {
    result: GoogleSearchResult;
    className?: string;
}

export function CompanyLogo({ result, className = "w-10 h-10" }: CompanyLogoProps) {
    const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
    const [hasError, setHasError] = useState(false);

    // Calculate sources only once
    const sources = React.useMemo(() => {
        const list: string[] = [];

        // 1. Try og:image
        const ogImage = result.pagemap?.metatags?.[0]?.['og:image'];
        if (ogImage) list.push(ogImage);

        // 2. Try Google Favicons (proven to work in CompanyProfile)
        if (result.link) {
            try {
                const domain = new URL(result.link).hostname;
                list.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=64`);
                // 3. Try Clearbit as backup
                list.push(`https://logo.clearbit.com/${domain}`);
            } catch (e) {
                // Invalid URL
            }
        }
        return list;
    }, [result]);

    const handleError = () => {
        if (currentSourceIndex < sources.length - 1) {
            setCurrentSourceIndex(prev => prev + 1);
        } else {
            setHasError(true);
        }
    };

    if (hasError || sources.length === 0) {
        return (
            <div className={`${className} rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0`}>
                <Building2 className="text-indigo-600" size={20} />
            </div>
        );
    }

    return (
        <img
            src={sources[currentSourceIndex]}
            alt={`${result.title} logo`}
            className={`${className} rounded-lg object-contain bg-white border border-gray-100 flex-shrink-0`}
            onError={handleError}
        />
    );
}
