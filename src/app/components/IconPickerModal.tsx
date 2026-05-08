import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Loader2, Sparkles, Check, Package, Image as ImageIcon } from 'lucide-react';
import { cn } from '../utils';
import { CategoryIcon } from './CategoryIcon';

interface IconPickerModalProps {
  onClose: () => void;
  onSelect: (iconName: string) => void;
  initialIcon?: string;
  title?: string;
}

const LOCAL_SLUGS = [
    "food", "snacks", "groceries", "transportation", "vehicle", "bills", "utilities", "housing", 
    "household_essentials", "fashion", "personal_care", "electronics", "financial_instruments", 
    "insurance", "taxes", "debt_repayment", "day_out", "holidays", "gifts", "self_development", 
    "stationery", "pets_plants", "circle", "fees", "health", "education", "others_expense",
    "income_salary", "income_gift", "income_investment", "income_freelance", "income_others"
];

export const IconPickerModal: React.FC<IconPickerModalProps> = ({ 
  onClose, 
  onSelect, 
  initialIcon,
  title = "Pick an Elite Icon" 
}) => {
  const [search, setSearch] = useState("");
  const [icons, setIcons] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(initialIcon || "");
  const debounceTimer = useRef<any>(null);

  const fetchIcons = async (query: string) => {
    setIsLoading(true);
    try {
      if (!query) {
        setIcons([
          'fluent-emoji:money-bag', 'fluent-emoji:credit-card', 'fluent-emoji:shopping-cart', 
          'fluent-emoji:pizza', 'fluent-emoji:coffee-mug', 'fluent-emoji:car', 
          'fluent-emoji:house', 'fluent-emoji:gift', 'fluent-emoji:heart-suit',
          'fluent-emoji:sparkles', 'fluent-emoji:zap', 'fluent-emoji:rocket'
        ]);
        return;
      }

      const response = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=100&prefixes=fluent-emoji`);
      const data = await response.json();
      setIcons(data && data.icons ? data.icons : ['fluent-emoji:package']);
    } catch (error) {
      console.error("Icon search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIcons("");
  }, []);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchIcons(val);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 max-h-[85vh]">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                Elite Asset Engine v2.0
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="px-8 py-4">
          <div className="relative group">
            <input 
              autoFocus
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search premium 3D assets..."
              className="w-full bg-slate-50 border-2 border-transparent px-5 py-5 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-100 focus:ring-8 focus:ring-indigo-500/5 outline-none transition-all pl-14"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar bg-slate-50/50">
          
          {/* Local Assets Section */}
          {!search && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Local Assets</h4>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {LOCAL_SLUGS.slice(0, 8).map(slug => (
                  <button key={slug} onClick={() => { setSelectedIcon(`elite:${slug}`); onSelect(`elite:${slug}`); }}
                    className={cn("aspect-square rounded-[1.5rem] bg-white flex items-center justify-center transition-all hover:scale-110 shadow-sm border border-slate-100",
                      selectedIcon === `elite:${slug}` && "ring-4 ring-indigo-500 bg-indigo-50")}>
                    <CategoryIcon icon={`elite:${slug}`} size={32} />
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[9px] text-slate-400 italic">Drop files in public/icons/elite/ to see them here.</p>
            </div>
          )}

          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{search ? 'Search Results' : 'Cloud 3D Icons'}</h4>
          </div>

          {isLoading && icons.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p className="text-xs font-black uppercase tracking-widest">Loading...</p>
             </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-5 pb-8">
              {icons.map((icon) => (
                <button key={icon} type="button" onClick={() => { setSelectedIcon(icon); onSelect(icon); }}
                  className={cn("aspect-square rounded-[2rem] flex items-center justify-center transition-all relative group shadow-sm",
                    selectedIcon === icon ? "bg-indigo-600 ring-4 ring-indigo-100 scale-105 z-10" : "bg-white hover:bg-indigo-50 hover:scale-110")}>
                  <CategoryIcon icon={icon} size={38} className="group-hover:rotate-6" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-white border-t border-slate-100 flex justify-end">
           <button onClick={onClose} className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
