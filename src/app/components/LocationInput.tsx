import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2, X, Navigation } from 'lucide-react';
import { cn } from '../utils';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
  accentColor?: 'indigo' | 'emerald' | 'rose' | 'amber' | 'blue';
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

interface Suggestion {
  name: string;
  city?: string;
  state?: string;
  country?: string;
  formatted: string;
  lat: number;
  lon: number;
}

export const LocationInput: React.FC<LocationInputProps> = ({ 
  value, 
  onChange, 
  label, 
  placeholder = "Search location...", 
  className,
  icon,
  accentColor = 'indigo',
  onKeyDown
}) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number, lon: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<any>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Try to get user location for better relevance (biasing)
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      }, () => {
        // Fallback or ignore
      });
    }
  }, []);

  const handleUseMyLocation = () => {
    if ("geolocation" in navigator) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lon: longitude });
        
        try {
          // Reverse Geocoding using Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          if (data && data.display_name) {
            setQuery(data.display_name);
            onChange(data.display_name);
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);
        } finally {
          setIsLoading(false);
        }
      }, (error) => {
        console.error("Geolocation error:", error);
        setIsLoading(false);
      });
    }
  };

  const fetchSuggestions = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Using Photon (Komoot) API - Better fuzzy search and relevance than Nominatim
      let url = `https://photon.komoot.io/api/?q=${encodeURIComponent(searchTerm)}&limit=5`;
      
      // Bias results by user location if available
      if (userLocation) {
        url += `&lat=${userLocation.lat}&lon=${userLocation.lon}`;
      } else {
        // Default bias for India if no location (common user base for this app)
        url += `&lat=20.5937&lon=78.9629`; 
      }

      const response = await fetch(url);
      const data = await response.json();
      
      const processed: Suggestion[] = data.features.map((f: any) => {
        const p = f.properties;
        const parts = [p.name, p.city, p.state, p.country].filter(Boolean);
        return {
          name: p.name,
          city: p.city,
          state: p.state,
          country: p.country,
          formatted: parts.join(", "),
          lat: f.geometry.coordinates[1],
          lon: f.geometry.coordinates[0]
        };
      });

      setSuggestions(processed);
    } catch (error) {
      console.error("Location search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setIsOpen(true);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 400);
  };

  const handleSelect = (suggestion: Suggestion) => {
    setQuery(suggestion.formatted);
    onChange(suggestion.formatted);
    setSuggestions([]);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const accents = {
    indigo: "focus:ring-indigo-600 border-indigo-100",
    emerald: "focus:ring-emerald-600 border-emerald-100",
    rose: "focus:ring-rose-600 border-rose-100",
    amber: "focus:ring-amber-600 border-amber-100",
    blue: "focus:ring-blue-600 border-blue-100",
  };

  return (
    <div className={cn("relative space-y-1.5", className)} ref={containerRef}>
      {label && (
        <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
          {icon || <MapPin className="w-3.5 h-3.5" />} {label}
        </label>
      )}
      
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          spellCheck={false}
          autoCorrect="off"
          autoComplete="off"
          className={cn(
            "w-full bg-slate-50 border-2 border-transparent px-4 py-3 rounded-xl text-sm font-semibold outline-none transition-all pr-10",
            accents[accentColor],
            isOpen && suggestions.length > 0 && "rounded-b-none border-slate-100 bg-white shadow-sm"
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
          ) : query ? (
            <button 
              type="button" 
              onClick={() => { setQuery(""); onChange(""); setSuggestions([]); }}
              className="p-1 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-3 h-3 text-slate-400" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleUseMyLocation}
              title="Use my current location"
              className={cn(
                "p-1.5 rounded-lg transition-all group/loc",
                userLocation ? "text-emerald-500 bg-emerald-50" : "text-slate-300 hover:text-indigo-500 hover:bg-slate-100"
              )}
            >
              <Navigation className={cn("w-3.5 h-3.5", userLocation && "animate-pulse")} />
            </button>
          )}
          {!isLoading && !query && (
            <Search className="w-4 h-4 text-slate-300 group-focus-within:text-indigo-400 transition-colors" />
          )}
        </div>
      </div>

      {isOpen && (suggestions.length > 0 || isLoading) && (
        <div className="absolute z-[100] left-0 right-0 top-full bg-white border-2 border-t-0 border-slate-100 rounded-b-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {isLoading && suggestions.length === 0 && (
              <div className="p-4 text-center text-xs font-bold text-slate-400 italic">
                Searching smart maps...
              </div>
            )}
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(s)}
                className="w-full px-4 py-3 text-left text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 border-b border-slate-50 last:border-0 transition-colors flex items-start gap-3 group"
              >
                <div className="mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-800 group-hover:text-indigo-600 line-clamp-1">{s.name}</span>
                  <span className="text-[9px] text-slate-400 font-medium line-clamp-1">
                    {[s.city, s.state, s.country].filter(Boolean).join(", ")}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
