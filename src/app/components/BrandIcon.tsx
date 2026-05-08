import React, { useState, useEffect } from 'react';
import { searchBrandfetchIcon, getLogoDevUrl } from '../utils/logoFetcher';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { cn } from '../utils';

interface BrandIconProps {
  name: string;
  domain?: string;
  logoUrl?: string;
  profile: any;
  className?: string;
  fallback?: React.ReactNode;
}

export const BrandIcon: React.FC<BrandIconProps> = ({ name, domain, logoUrl, profile, className, fallback }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchLogo = async () => {
      // 0. Use direct logoUrl if provided
      if (logoUrl) {
        setUrl(logoUrl);
        return;
      }

      // Try to get cached URL from localStorage
      const cacheKey = `logo_cache_${name}_${domain}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setUrl(cached);
        return;
      }

      // 1. Priority: Brandfetch Search (Highly accurate, AI-powered)
      if (profile.brandfetchClientId && name) {
        setIsLoading(true);
        try {
          const brandfetchUrl = await searchBrandfetchIcon(name, profile.brandfetchClientId);
          if (isMounted && brandfetchUrl) {
            setUrl(brandfetchUrl);
            localStorage.setItem(cacheKey, brandfetchUrl);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error("Brandfetch fetch error:", error);
        }
      }

      // 2. Fallback: Logo.dev (Direct CDN URL for known domains)
      if (domain && domain.includes('.')) {
        const logoDevUrl = getLogoDevUrl(domain, profile.logoDevToken);
        if (isMounted) {
          setUrl(logoDevUrl);
        }
      }
      
      if (isMounted) setIsLoading(false);
    };

    fetchLogo();
    return () => { isMounted = false; };
  }, [name, domain, logoUrl, profile.logoDevToken, profile.brandfetchClientId]);

  if (isLoading) {
    return (
      <div className={cn("w-full h-full bg-slate-50 flex items-center justify-center", className)}>
        <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!url) return <>{fallback}</>;

  return (
    <ImageWithFallback 
      src={url} 
      alt={name} 
      className={className} 
      fallback={fallback}
    />
  );
};
