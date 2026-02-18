import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import type { GoogleSearchResult } from '../api/google';

interface CompanyLogoProps {
    result: GoogleSearchResult;
    className?: string;
}

export function CompanyLogo({ result, className = "w-10 h-10" }: CompanyLogoProps) {
    const getInitialImage = () => {
        // Try og:image first
        const ogImage = result.pagemap?.metatags?.[0]?.['og:image'];
        if (ogImage) return ogImage;

        // Fallback to Clearbit
        try {
            // Handle cases where link might be missing or invalid
            if (!result.link) return null;
            const domain = new URL(result.link).hostname;
            return `https://logo.clearbit.com/${domain}`;
        } catch {
            return null;
        }
    };

    const [imageSrc, setImageSrc] = useState<string | null>(getInitialImage());
    const [hasError, setHasError] = useState(false);

    const handleImageError = () => {
        const ogImage = result.pagemap?.metatags?.[0]?.['og:image'];

        // If we were trying og:image and it failed, try Clearbit next
        if (imageSrc && imageSrc === ogImage) {
            try {
                if (!result.link) throw new Error('No link');
                const domain = new URL(result.link).hostname;
                setImageSrc(`https://logo.clearbit.com/${domain}`);
            } catch {
                setHasError(true);
            }
        } else {
            // If Clearbit failed (or we started with Clearbit/null), show fallback
            setHasError(true);
        }
    };

    if (hasError || !imageSrc) {
        return (
            <div className={`${className} rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0`}>
                <Building2 className="text-indigo-600" size={20} />
            </div>
        );
    }

    return (
        <img
            src={imageSrc}
            alt={`${result.title} logo`}
            className={`${className} rounded-lg object-contain bg-white border border-gray-100 flex-shrink-0`}
            onError={handleImageError}
        />
    );
}
