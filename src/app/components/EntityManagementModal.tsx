import React, { useState, useMemo } from "react";
import { 
  X, Plus, Store, Users, Repeat, CreditCard, Gift, ShieldCheck, Trash2, Edit2, 
  ArrowRight, Package, MapPin, Link as LinkIcon, PauseCircle, PlayCircle, 
  History, Clock, IndianRupee, Shield, FileText, Zap, Droplets, Flame, Wifi, 
  Smartphone, Home, Tv, Dumbbell, Milk, Newspaper, Wrench, Car, Building, Box
} from "lucide-react";
import { cn, formatINR, getGridCols } from "../utils";
import { useFinance, Entity, Transaction } from "../context/FinanceContext";
import { format, differenceInDays, parseISO, isSameDay } from "date-fns";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { TransactionFormModal } from "./TransactionFormModal";

const entityConfig: Record<string, { title: string, icon: any, desc: string, color: string }> = {
  shop: { title: "Shops & Merchants", icon: Store, desc: "Manage frequent payees", color: "text-blue-600 bg-blue-50" },
  person: { title: "People (Khata)", icon: Users, desc: "Track lending & borrowing", color: "text-indigo-600 bg-indigo-50" },
  recurring: { title: "Recurring Bills", icon: Repeat, desc: "Utility and regular bills", color: "text-amber-600 bg-amber-50" },
  subscription: { title: "Subscriptions", icon: CreditCard, desc: "Digital services", color: "text-rose-600 bg-rose-50" },
  giftcard: { title: "Gift Cards", icon: Gift, desc: "Unused gift card balances", color: "text-emerald-600 bg-emerald-50" },
  protection: { title: "Protection & Insure", icon: ShieldCheck, desc: "Insurance & Warranties", color: "text-slate-600 bg-slate-100" },
  asset: { title: "Assets & Valuables", icon: Building, desc: "Vehicle, Home & High Value", color: "text-teal-600 bg-teal-50" },
  inventory: { title: "Inventory", icon: Package, desc: "Consumable Home Supplies", color: "text-orange-600 bg-orange-50" },
  document: { title: "Documents & Tax", icon: FileText, desc: "Legal & tax related docs", color: "text-purple-600 bg-purple-50" },
};

const getCategoryIcon = (cat?: string, name?: string) => {
  const search = (cat || name || "").toLowerCase();
  if (search.includes('electri')) return <Zap className="w-5 h-5" />;
  if (search.includes('water')) return <Droplets className="w-5 h-5" />;
  if (search.includes('gas') || search.includes('cylinder')) return <Flame className="w-5 h-5" />;
  if (search.includes('internet') || search.includes('wifi') || search.includes('broadband')) return <Wifi className="w-5 h-5" />;
  if (search.includes('mobile') || search.includes('phone') || search.includes('recharge')) return <Smartphone className="w-5 h-5" />;
  if (search.includes('rent')) return <Home className="w-5 h-5" />;
  if (search.includes('dth') || search.includes('cable') || search.includes('tv')) return <Tv className="w-5 h-5" />;
  if (search.includes('gym') || search.includes('fitness')) return <Dumbbell className="w-5 h-5" />;
  if (search.includes('milk') || search.includes('dairy')) return <Milk className="w-5 h-5" />;
  if (search.includes('news') || search.includes('paper')) return <Newspaper className="w-5 h-5" />;
  if (search.includes('maint')) return <Wrench className="w-5 h-5" />;
  if (search.includes('shop') || search.includes('store') || search.includes('market')) return <Store className="w-5 h-5" />;
  if (search.includes('car') || search.includes('bike') || search.includes('vehicle')) return <Car className="w-5 h-5" />;
  if (search.includes('home') || search.includes('house') || search.includes('flat') || search.includes('property')) return <Building className="w-5 h-5" />;
  if (search.includes('box') || search.includes('stock') || search.includes('pantry')) return <Box className="w-5 h-5" />;
  return <Repeat className="w-5 h-5" />;
};

const getBrandDomain = (name: string, url?: string, provider?: string) => {
  const brandDomains: Record<string, string> = {
    'amazon': 'amazon.in', 'swiggy': 'swiggy.com', 'zomato': 'zomato.com',
    'jio': 'jio.com', 'max': 'maxfashion.in', 'tata': 'tata.com',
    'reliance': 'reliance.com', 'flipkart': 'flipkart.com',
    'bigbasket': 'bigbasket.com', 'blinkit': 'blinkit.com', 'zepto': 'zepto.co.in',
    'netflix': 'netflix.com', 'spotify': 'spotify.com', 'airtel': 'airtel.in',
    'vodafone': 'vi.in', 'vi': 'vi.in', 'act': 'actcorp.in', 'hotstar': 'hotstar.com',
    'disney': 'disneyplus.com', 'prime': 'amazon.in', 'youtube': 'youtube.com',
    'dunzo': 'dunzo.com', 'myntra': 'myntra.com', 'ajio': 'ajio.com',
    'ola': 'olacabs.com', 'uber': 'uber.com', 'nykaa': 'nykaa.com'
  };
  
  const n = name.toLowerCase();
  const p = (provider || "").toLowerCase();
  let domain = brandDomains[n] || brandDomains[p];
  
  if (!domain && url) {
    try {
      const cleanUrl = url.includes('://') ? url : `https://${url}`;
      domain = new URL(cleanUrl).hostname.replace('www.', '');
    } catch(e) {
      if (url.includes('.')) domain = url.split('/')[0].replace('www.', '');
    }
  }
  return domain;
};

export const EntityManagementModal = ({ type, onClose }: { type: string; onClose: () => void }) => {
  const { entities, transactions, addEntity, updateEntity, deleteEntity, profile } = useFinance();
  const [view, setView] = useState<"list" | "details" | "form">("list");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editTxId, setEditTxId] = useState<string | null>(null);
  const [showAddTx, setShowAddTx] = useState(false);

  const [formData, setFormData] = useState<any>({});

  const config = entityConfig[type] || entityConfig.shop;
  const filteredEntities = entities.filter(e => e.type === type);
  const activeEntity = entities.find(e => e.id === activeId);

  // --- Actions ---
  const handleAddNew = () => {
    setActiveId(null);
    setFormData({ status: 'active' });
    setView("form");
  };

  const handleEdit = (ent: Entity) => {
    setActiveId(ent.id);
    setFormData({ ...ent });
    setView("form");
  };

  const handleViewDetails = (ent: Entity) => {
    setActiveId(ent.id);
    setView("details");
  };

  const handleToggleStatus = (ent: Entity, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    updateEntity(ent.id, { status: ent.status === 'paused' ? 'active' : 'paused' });
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    deleteEntity(id);
    if (view === 'details') setView('list');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const payload = { ...formData, type: type as any };
    
    // Auto-map provider to name for specific types if not set
    if (type === 'giftcard' || type === 'protection' || type === 'subscription' || type === 'recurring') {
      if (payload.provider && !payload.name) payload.name = payload.provider;
      if (!payload.provider && payload.name) payload.provider = payload.name;
    }

    if (activeId) {
      updateEntity(activeId, payload);
      setView("details");
    } else {
      addEntity(payload);
      setView("list");
    }
  };

  const handleBack = () => {
    if (view === "form" && activeId) setView("details");
    else setView("list");
  };


  // --- Sub-Renders ---
  const renderList = () => {
    if (type === 'shop' || type === 'person' || type === 'recurring' || type === 'subscription') {
      const groups = type === 'person' ? ['Family', 'Friend', 'Colleague', 'Acquaintance', 'Other'] : [null];
      
      return (
        <div className="space-y-6">
          {groups.map(groupName => {
            const groupEntities = filteredEntities.filter(e => type === 'person' ? (e.relationship === groupName || (!e.relationship && groupName === 'Other')) : true);
            if (groupEntities.length === 0 && type === 'person') return null;

            return (
              <div key={groupName || 'all'} className="space-y-3">
                {groupName && (
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                    {groupName} <div className="h-px flex-1 bg-slate-100" />
                  </h4>
                )}
                <div className={cn("grid gap-3", getGridCols(groupEntities.length))}>
                  {groupEntities.map(ent => {
                    let logoUrl = null;
                    let netBalance = 0;

                    if (type === 'shop' || type === 'recurring' || type === 'subscription') {
                      const domain = getBrandDomain(ent.name, ent.url, ent.provider);
                      logoUrl = domain && profile.logoDevToken ? `https://img.logo.dev/${domain}?token=${profile.logoDevToken}` : null;
                    } else {
                      const personTxns = transactions.filter(t => 
                        t.payee.toLowerCase() === ent.name.toLowerCase() || 
                        t.split?.with.includes(ent.name)
                      );
                      personTxns.forEach(t => {
                        if (t.type === 'income' && t.payee.toLowerCase() === ent.name.toLowerCase()) netBalance -= t.amount;
                        else if (t.type === 'expense' && t.payee.toLowerCase() === ent.name.toLowerCase()) netBalance += t.amount;
                        else if (t.split?.with.includes(ent.name)) {
                          if (t.split.shareStrategy === 'Equally') netBalance += t.amount / (1 + t.split.with.length);
                          else if (t.split.shares?.[ent.name]) {
                            if (t.split.shareStrategy === 'Percentages') netBalance += (t.amount * Number(t.split.shares[ent.name])) / 100;
                            else netBalance += Number(t.split.shares[ent.name]);
                          }
                        }
                      });
                    }

                    const nextDue = (type === 'recurring' || type === 'subscription') && ent.nextDue ? parseISO(ent.nextDue) : null;
                    const daysLeft = nextDue ? differenceInDays(nextDue, new Date()) : null;

                    return (
                      <div 
                        key={ent.id} 
                        onClick={() => handleViewDetails(ent)} 
                        className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-100 hover:shadow-md transition-all group aspect-square relative overflow-hidden"
                      >
                        <div className="absolute top-2 left-2 z-10">
                          <div className={cn("w-1.5 h-1.5 rounded-full", ent.status === 'paused' ? "bg-amber-400" : "bg-emerald-400")} />
                        </div>
                        
                        {(type === 'recurring' || type === 'subscription') && daysLeft !== null && (
                          <div className="absolute top-2 right-2">
                             <div className={cn("text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-sm border", 
                               daysLeft <= 3 ? "bg-rose-50 text-rose-600 border-rose-100" : 
                               daysLeft <= 7 ? "bg-amber-50 text-amber-600 border-amber-100" : 
                               "bg-emerald-50 text-emerald-600 border-emerald-100"
                             )}>
                               {daysLeft === 0 ? "Today" : daysLeft < 0 ? "Over" : `${daysLeft}d`}
                             </div>
                          </div>
                        )}
                        
                        <div className={cn("w-12 h-12 mb-3 flex items-center justify-center bg-slate-50 rounded-xl transition-transform group-hover:scale-110 overflow-hidden p-1.5 shadow-inner", type === 'person' && "rounded-full")}>
                          {logoUrl ? (
                            <ImageWithFallback src={logoUrl} alt={ent.name} className="w-full h-full object-contain" />
                          ) : (
                            <div className="text-indigo-600">
                              {type === 'person' ? (
                                <div className="text-sm font-black uppercase text-indigo-400">{ent.name.charAt(0)}</div>
                              ) : (
                                getCategoryIcon(ent.category, ent.name)
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="w-full">
                          <h4 className={cn("font-bold text-[10px] line-clamp-1 leading-tight", ent.status === 'paused' ? "text-slate-500 opacity-70" : "text-slate-800")}>{ent.name}</h4>
                          {(type === 'recurring' || type === 'subscription') ? (
                            <p className="text-[9px] font-black text-slate-400 tracking-tighter mt-1 leading-none">
                              {ent.amount ? formatINR(ent.amount) : 'Var.'}
                            </p>
                          ) : type === 'person' && netBalance !== 0 ? (
                            <p className={cn("text-[9px] font-black tracking-tighter mt-1 leading-none", netBalance > 0 ? "text-emerald-600" : "text-rose-600")}>
                              {netBalance > 0 ? "+" : "-"}{formatINR(Math.abs(netBalance))}
                            </p>
                          ) : (
                            <p className="text-[8px] text-slate-400 uppercase font-black tracking-tighter mt-1 opacity-60 leading-none truncate">{ent.mode || ent.relationship || 'Contact'}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Templates Section */}
          {(type === 'recurring' || type === 'subscription') && (
            <div className={cn("space-y-6", filteredEntities.length > 0 && "pt-6 border-t border-slate-100/50")}>
               {(() => {
                 const templates: Record<string, { group: string, items: any[] }[]> = {
                   recurring: [
                     {
                       group: 'Essential Utilities',
                       items: [
                         { name: 'Electricity', category: 'Electricity', icon: Zap, color: 'text-amber-500 bg-amber-50' },
                         { name: 'Water', category: 'Water', icon: Droplets, color: 'text-blue-500 bg-blue-50' },
                         { name: 'Gas', category: 'Gas', icon: Flame, color: 'text-orange-500 bg-orange-50' },
                       ]
                     },
                     {
                       group: 'Connectivity',
                       items: [
                         { name: 'Internet', category: 'Internet', icon: Wifi, color: 'text-indigo-500 bg-indigo-50' },
                         { name: 'Mobile', category: 'Mobile', icon: Smartphone, color: 'text-rose-500 bg-rose-50' },
                         { name: 'DTH/Cable', category: 'DTH', icon: Tv, color: 'text-purple-500 bg-purple-50' },
                       ]
                     },
                     {
                       group: 'Housing & Maintenance',
                       items: [
                         { name: 'Rent', category: 'Rent', icon: Home, color: 'text-emerald-500 bg-emerald-50' },
                         { name: 'Society Maint.', category: 'Maintenance', icon: Wrench, color: 'text-slate-500 bg-slate-100' },
                       ]
                     },
                     {
                       group: 'Daily Lifestyle',
                       items: [
                         { name: 'Gym', category: 'Gym', icon: Dumbbell, color: 'text-blue-600 bg-blue-50' },
                         { name: 'Milk', category: 'Milk', icon: Milk, color: 'text-sky-400 bg-sky-50' },
                         { name: 'Newspaper', category: 'Newspaper', icon: Newspaper, color: 'text-slate-400 bg-slate-100' },
                       ]
                     }
                   ],
                   subscription: [
                     {
                       group: 'Streaming & Apps',
                       items: [
                         { name: 'Netflix', category: 'Other', provider: 'Netflix', icon: PlayCircle, color: 'text-red-500 bg-red-50' },
                         { name: 'Spotify', category: 'Other', provider: 'Spotify', icon: Repeat, color: 'text-emerald-500 bg-emerald-50' },
                         { name: 'Disney+', category: 'Other', provider: 'Disney+', icon: PlayCircle, color: 'text-blue-600 bg-blue-50' },
                         { name: 'YouTube', category: 'Other', provider: 'YouTube', icon: PlayCircle, color: 'text-red-600 bg-red-50' },
                         { name: 'Amazon Prime', category: 'Other', provider: 'Amazon', icon: Repeat, color: 'text-sky-500 bg-sky-50' },
                       ]
                     }
                   ]
                 };

                 const activeTemplates = templates[type] || [];
                 
                 return activeTemplates.map(group => {
                   const visibleItems = group.items.filter(tpl => !filteredEntities.some(e => e.name.toLowerCase() === tpl.name.toLowerCase()));
                   if (visibleItems.length === 0) return null;

                   return (
                     <div key={group.group} className="space-y-3">
                       <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest px-1">{group.group}</p>
                       <div className={cn("grid gap-3", getGridCols(visibleItems.length))}>
                         {visibleItems.map(tpl => (
                           <div 
                             key={tpl.name}
                             onClick={() => {
                                setFormData({ 
                                  name: tpl.name, 
                                  category: tpl.category, 
                                  provider: tpl.provider || tpl.name,
                                  status: 'active' 
                                });
                                setView("form");
                             }}
                             className="bg-white p-4 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group aspect-square"
                           >
                             <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110 shadow-sm", tpl.color)}>
                                <tpl.icon className="w-5 h-5" />
                             </div>
                             <p className="text-[10px] font-bold text-slate-600 leading-tight">{tpl.name}</p>
                           </div>
                         ))}
                       </div>
                     </div>
                   );
                 });
               })()}
            </div>
          )}

          {filteredEntities.length === 0 && !(type === 'recurring' || type === 'subscription') && (
            <div className="text-center py-16 text-slate-400">
              <config.icon className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium text-sm">No {type === 'shop' ? 'shops' : type === 'person' ? 'people' : 'data'} found.</p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {filteredEntities.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <config.icon className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-medium text-sm">No {config.title.toLowerCase()} found.</p>
          </div>
        ) : (
          <div className={cn("grid gap-3", getGridCols(filteredEntities.length))}>
            {filteredEntities.map(ent => (
              <div key={ent.id} onClick={() => handleViewDetails(ent)} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-indigo-100 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", ent.status === 'paused' ? "bg-amber-400" : "bg-emerald-400")} />
                  <div className="overflow-hidden">
                    <h4 className={cn("font-bold text-[11px] text-slate-800 truncate", ent.status === 'paused' && "text-slate-500 opacity-70")}>{ent.name}</h4>
                    {ent.category && <p className="text-[8px] text-slate-400 uppercase font-black tracking-wider mt-0.5 truncate">{ent.category}</p>}
                  </div>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderDetails = () => {
    if (!activeEntity) return null;
    
    let stats = null;
    let relevantTxns: Transaction[] = [];

    if (type === "shop") {
      relevantTxns = transactions.filter(t => t.payee.toLowerCase() === activeEntity.name.toLowerCase());
      const expenses = relevantTxns.filter(t => t.type === 'expense');
      const totalSpend = expenses.reduce((sum, t) => sum + t.amount, 0);
      const avgSpend = expenses.length > 0 ? totalSpend / expenses.length : 0;
      
      // Find most used account
      const accountUsage: Record<string, number> = {};
      expenses.forEach(t => { accountUsage[t.account_id] = (accountUsage[t.account_id] || 0) + 1; });
      const topAccountId = Object.entries(accountUsage).sort((a,b) => b[1] - a[1])[0]?.[0];
      const { accounts } = useFinance();
      const topAccount = accounts.find(a => a.id === topAccountId);

      stats = (
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter mb-1">Total Spend</p>
              <p className="text-sm font-black text-slate-800">{formatINR(totalSpend)}</p>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter mb-1">Visits</p>
              <p className="text-sm font-black text-slate-800">{expenses.length}</p>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter mb-1">Avg. Visit</p>
              <p className="text-sm font-black text-slate-800">{formatINR(avgSpend)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter mb-2">Preferred Method</p>
              {topAccount ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-slate-50 flex items-center justify-center">
                    <CreditCard className="w-3 h-3 text-slate-400" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 truncate">{topAccount.name}</p>
                </div>
              ) : (
                <p className="text-xs font-bold text-slate-400">No data</p>
              )}
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter mb-2">Location / Site</p>
              <div className="flex flex-col gap-1">
                {activeEntity.mode === 'online' ? (
                  <a href={activeEntity.url?.startsWith('http') ? activeEntity.url : `https://${activeEntity.url}`} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline flex items-center gap-1.5 font-bold truncate">
                    <LinkIcon className="w-3 h-3 shrink-0" /> {activeEntity.url || 'Visit Site'}
                  </a>
                ) : (
                  <p className="text-xs text-slate-700 flex items-center gap-1.5 font-bold truncate">
                    <MapPin className="w-3 h-3 text-emerald-500 shrink-0" /> {activeEntity.location || 'Physical Store'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    } else if (type === "person") {
      relevantTxns = transactions.filter(t => 
        t.payee.toLowerCase() === activeEntity.name.toLowerCase() || 
        t.tags.includes(activeEntity.name) ||
        t.split?.with.includes(activeEntity.name)
      );

      let lent = 0;
      let borrowed = 0;
      
      relevantTxns.forEach(t => {
        if (t.type === 'income' && t.payee.toLowerCase() === activeEntity.name.toLowerCase()) borrowed += t.amount;
        else if (t.type === 'expense' && t.payee.toLowerCase() === activeEntity.name.toLowerCase()) lent += t.amount;
        else if (t.split?.with.includes(activeEntity.name)) {
          if (t.split.shareStrategy === 'Equally') lent += t.amount / (1 + t.split.with.length);
          else if (t.split.shares?.[activeEntity.name]) {
            if (t.split.shareStrategy === 'Percentages') lent += (t.amount * Number(t.split.shares[activeEntity.name])) / 100;
            else lent += Number(t.split.shares[activeEntity.name]);
          }
        }
      });

      const net = lent - borrowed;

      stats = (
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter mb-1">Lent</p>
              <p className="text-sm font-black text-emerald-600">{formatINR(lent)}</p>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter mb-1">Borrowed</p>
              <p className="text-sm font-black text-rose-600">{formatINR(borrowed)}</p>
            </div>
            <div className={cn("p-3 rounded-2xl border shadow-sm", net > 0 ? "bg-emerald-50 border-emerald-100" : net < 0 ? "bg-rose-50 border-rose-100" : "bg-white border-slate-100")}>
              <p className="text-[9px] uppercase font-black tracking-tighter mb-1 opacity-70">Settled</p>
              <p className={cn("text-sm font-black", net > 0 ? "text-emerald-700" : net < 0 ? "text-rose-700" : "text-slate-800")}>
                {formatINR(Math.abs(net))}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter mb-1">Relationship</p>
              <p className="text-sm font-black text-slate-800">{activeEntity.relationship || "Contact"}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter mb-1">Txn Count</p>
              <p className="text-sm font-black text-slate-800">{relevantTxns.length}</p>
            </div>
          </div>
        </div>
      );
    } else if (type === "recurring" || type === "subscription") {
      relevantTxns = transactions.filter(t => t.payee.toLowerCase() === activeEntity.name.toLowerCase() || t.payee.toLowerCase() === activeEntity.provider?.toLowerCase());
      const expenses = relevantTxns.filter(t => t.type === 'expense');
      const totalPaid = expenses.reduce((sum, t) => sum + t.amount, 0);
      
      stats = (
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter mb-1">Expected</p>
              <p className="text-sm font-black text-slate-800">{activeEntity.amount ? formatINR(activeEntity.amount) : "Var."}</p>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter mb-1">Total Paid</p>
              <p className="text-sm font-black text-slate-800">{formatINR(totalPaid)}</p>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter mb-1">Cycle</p>
              <p className="text-sm font-black text-indigo-600 capitalize">{activeEntity.recurringDuration || "Monthly"}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter mb-3">Billing & Configuration</p>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              {activeEntity.configDetails ? Object.entries(activeEntity.configDetails as Record<string, string>).map(([label, val]) => (
                <div key={label}>
                  <p className="text-[8px] text-slate-400 uppercase font-black tracking-tighter mb-0.5">{label}</p>
                  <p className="text-xs font-bold text-slate-700 truncate">{val || "—"}</p>
                </div>
              )) : (
                <div className="col-span-2">
                  <p className="text-xs font-bold text-slate-400">No configuration details provided.</p>
                </div>
              )}
            </div>
            {activeEntity.billingDetails && !activeEntity.configDetails && (
              <div className="mt-3 pt-3 border-t border-slate-50">
                <p className="text-[8px] text-slate-400 uppercase font-black tracking-tighter mb-0.5">Details</p>
                <p className="text-xs font-bold text-slate-700">{activeEntity.billingDetails}</p>
              </div>
            )}
          </div>
        </div>
      );
    } else if (type === "giftcard") {
      relevantTxns = transactions.filter(t => t.account_id === activeEntity.id || t.payee.toLowerCase() === activeEntity.name.toLowerCase() || t.notes?.includes(activeEntity.name));
      const spent = relevantTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const currentBalance = (activeEntity.totalBalance || 0) - spent;
      
      stats = (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Current Balance</p>
            <p className="text-xl font-bold text-emerald-600">{formatINR(currentBalance)}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">of {formatINR(activeEntity.totalBalance || 0)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Transactions</p>
            <p className="text-xl font-bold text-slate-800">{relevantTxns.length}</p>
          </div>
        </div>
      );
    } else if (type === "protection") {
      stats = (
        <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter mb-3">Coverage Details</p>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <p className="text-[8px] text-slate-400 uppercase font-black tracking-tighter mb-0.5">Type</p>
                <p className="text-xs font-bold text-slate-700 truncate">{activeEntity.category || "General"}</p>
              </div>
              <div>
                <p className="text-[8px] text-slate-400 uppercase font-black tracking-tighter mb-0.5">Expiry / End Date</p>
                <p className="text-xs font-bold text-rose-600 truncate">{activeEntity.expiry || "N/A"}</p>
              </div>
              {activeEntity.amount && (
                <div>
                  <p className="text-[8px] text-slate-400 uppercase font-black tracking-tighter mb-0.5">Premium / Cost</p>
                  <p className="text-xs font-bold text-slate-700 truncate">{formatINR(activeEntity.amount)}</p>
                </div>
              )}
              {activeEntity.policyNo && (
                <div>
                  <p className="text-[8px] text-slate-400 uppercase font-black tracking-tighter mb-0.5">Reference No.</p>
                  <p className="text-xs font-bold text-slate-700 truncate">{activeEntity.policyNo}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    } else if (type === "asset") {
      relevantTxns = transactions.filter(t => t.notes?.toLowerCase().includes(activeEntity.name.toLowerCase()) || t.tags.includes(activeEntity.name));
      stats = (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Current Valuation</p>
            <p className="text-xl font-bold text-slate-800">{activeEntity.amount ? formatINR(activeEntity.amount) : "N/A"}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">{activeEntity.category || "General Asset"}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-indigo-600">
             {getCategoryIcon(activeEntity.category, activeEntity.name)}
          </div>
        </div>
      );
    } else if (type === "inventory") {
      stats = (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Current Stock</p>
            <p className="text-xl font-bold text-slate-800">{activeEntity.quantity || "0"} <span className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">{activeEntity.unit || "Units"}</span></p>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">{activeEntity.category || "Consumable"}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-orange-600">
             {getCategoryIcon(activeEntity.category, activeEntity.name)}
          </div>
        </div>
      );
    }

    return (
      <div className="animate-in fade-in duration-300">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-4">
             {(type === 'shop' || type === 'person' || type === 'recurring' || type === 'subscription' || type === 'asset' || type === 'inventory' || type === 'protection') && (
               <div className={cn("w-16 h-16 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center overflow-hidden p-2", type === 'person' && "rounded-full")}>
                  {(type === 'shop' || type === 'recurring' || type === 'subscription') ? (() => {
                    const domain = getBrandDomain(activeEntity.name, activeEntity.url, activeEntity.provider);
                    const logoUrl = domain && profile.logoDevToken ? `https://img.logo.dev/${domain}?token=${profile.logoDevToken}` : null;
                    
                    return (
                      <div className="relative w-full h-full flex items-center justify-center">
                        {logoUrl ? (
                          <ImageWithFallback src={logoUrl} alt={activeEntity.name} className="w-full h-full object-contain" />
                        ) : (
                          <div className="text-2xl font-black text-slate-300 uppercase">
                            {(type === 'recurring' || type === 'subscription') ? (() => {
                              const cat = activeEntity.category?.toLowerCase();
                              if (cat === 'electricity') return <Zap className="w-8 h-8 text-amber-500" />;
                              if (cat === 'water') return <Droplets className="w-8 h-8 text-blue-500" />;
                              if (cat === 'gas') return <Flame className="w-8 h-8 text-orange-500" />;
                              if (cat === 'internet') return <Wifi className="w-8 h-8 text-indigo-500" />;
                              if (cat === 'mobile') return <Smartphone className="w-8 h-8 text-rose-500" />;
                              if (cat === 'rent') return <Home className="w-8 h-8 text-emerald-500" />;
                              if (cat === 'dth' || cat === 'cable') return <Tv className="w-8 h-8 text-purple-500" />;
                              if (cat === 'gym') return <Dumbbell className="w-8 h-8 text-blue-600" />;
                              if (cat === 'milk') return <Milk className="w-8 h-8 text-sky-400" />;
                              if (cat === 'newspaper') return <Newspaper className="w-8 h-8 text-slate-400" />;
                              if (cat === 'maintenance') return <Wrench className="w-8 h-8 text-slate-500" />;
                              return activeEntity.name.charAt(0);
                            })() : (
                              <div className="text-indigo-600">
                                {activeEntity.name.toLowerCase().includes('shop') || type === 'shop' ? <Store className="w-8 h-8" /> : activeEntity.name.charAt(0)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })() : (
                    <div className="text-2xl font-black text-indigo-600 uppercase">
                      {activeEntity.name.charAt(0)}
                    </div>
                  )}
                </div>
             )}
             <div>
               <h3 className="text-2xl font-black text-slate-800 leading-none mb-1">{activeEntity.name}</h3>
               <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{type === 'person' ? (activeEntity.relationship || 'Contact') : type === 'recurring' ? 'Recurring Bill' : type === 'subscription' ? 'Subscription' : (activeEntity.mode || activeEntity.category || 'Entity')}</p>
             </div>
           </div>
           <div className="flex gap-2">
             <button onClick={(e) => handleToggleStatus(activeEntity, e)} className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm", activeEntity.status === 'paused' ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>
               {activeEntity.status === 'paused' ? <><PlayCircle className="w-4 h-4" /> Resume</> : <><PauseCircle className="w-4 h-4" /> Pause</>}
             </button>
             <button onClick={() => handleEdit(activeEntity)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 bg-white border border-slate-100 shadow-sm transition-all"><Edit2 className="w-4 h-4" /></button>
             <button onClick={(e) => handleDelete(activeEntity.id, e)} className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 bg-white border border-slate-100 shadow-sm transition-all"><Trash2 className="w-4 h-4" /></button>
           </div>
        </div>
        
        {stats}

        {/* Transaction Ledger */}
        {(relevantTxns.length > 0 || type === 'shop' || type === 'person') && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" /> Linked Transactions
              </h4>
              <button 
                onClick={() => setShowAddTx(true)}
                className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md hover:bg-indigo-100 transition-colors uppercase tracking-wider flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Txn
              </button>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm divide-y divide-slate-100">
              {relevantTxns.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">No transactions yet.</p>
              ) : relevantTxns.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                <div 
                  key={t.id} 
                  onClick={() => setEditTxId(t.id)}
                  className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{t.category}</p>
                    <p className="text-xs text-slate-500 font-medium">{format(parseISO(t.date), "MMM dd, yyyy")} {t.notes && `• ${t.notes}`}</p>
                  </div>
                  <div className={cn("font-bold", t.type === 'expense' ? "text-slate-800" : t.type === 'income' ? "text-emerald-600" : "text-blue-600")}>
                    {t.type === 'expense' ? '-' : t.type === 'income' ? '+' : ''}{formatINR(t.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderForm = () => {
    return (
      <form id="entity-form" onSubmit={handleSave} className="space-y-4 animate-in fade-in duration-300">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Name <span className="text-red-400">*</span></label>
            <input
              type="text" value={formData.name || ""} onChange={(e) => setFormData({...formData, name: e.target.value})} required autoFocus
              placeholder={type === 'asset' ? "e.g. My Car, Luxury Watch" : type === 'inventory' ? "e.g. Rice Bag, Shampoo" : "e.g. Amazon, Rahul"}
              className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
            />
          </div>

          {type === "shop" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mode</label>
                  <select value={formData.mode || 'offline'} onChange={(e) => setFormData({...formData, mode: e.target.value})} className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none appearance-none">
                    <option value="offline">Offline (Store)</option>
                    <option value="online">Online (Web/App)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{formData.mode === 'online' ? 'Website URL' : 'Location'}</label>
                  <input
                    type="text" value={formData.mode === 'online' ? (formData.url || "") : (formData.location || "")} 
                    onChange={(e) => setFormData(formData.mode === 'online' ? {...formData, url: e.target.value} : {...formData, location: e.target.value})}
                    placeholder={formData.mode === 'online' ? "https://..." : "Map Link or Area"}
                    className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {type === "person" && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Relationship</label>
              <select value={formData.relationship || ''} onChange={(e) => setFormData({...formData, relationship: e.target.value})} className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none appearance-none">
                <option value="">Select...</option>
                <option value="Family">Family</option>
                <option value="Friend">Friend</option>
                <option value="Colleague">Colleague</option>
                <option value="Acquaintance">Acquaintance</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}

          {type === "asset" && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Asset Category</label>
                <select value={formData.category || 'Vehicle'} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none appearance-none">
                  <option value="Vehicle">Vehicle (Car/Bike)</option>
                  <option value="Property">Property (Home/Land)</option>
                  <option value="Electronics">Electronics (Laptop/Phone)</option>
                  <option value="Jewelry">Jewelry / Gold</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Appliances">Appliances</option>
                  <option value="Other">Other Valuable</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Estimated Value</label>
                  <input
                    type="number" value={formData.amount || ""} onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                    placeholder="₹ 0.00"
                    className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Purchase Date</label>
                  <input
                    type="date" value={formData.purchaseDate || ""} onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                    className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {type === "inventory" && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Inventory Type</label>
                <select value={formData.category || 'Pantry'} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none appearance-none">
                  <option value="Pantry">Pantry / Groceries</option>
                  <option value="Personal Care">Personal Care (Shampoo/Soap)</option>
                  <option value="Cleaning">Home Cleaning Supplies</option>
                  <option value="Office">Office Supplies / Stationery</option>
                  <option value="Medicine">Medicines / Health</option>
                  <option value="Other">Other Consumable</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Quantity</label>
                  <input
                    type="number" value={formData.quantity || ""} onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                    placeholder="1"
                    className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Unit</label>
                  <input
                    type="text" value={formData.unit || ""} onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    placeholder="kg, pcs, ltr"
                    className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {type === "protection" && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Coverage Type</label>
                <select value={formData.category || ''} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none appearance-none">
                  <option value="Health Insurance">Health Insurance</option>
                  <option value="Life Insurance">Life Insurance</option>
                  <option value="Vehicle Insurance">Vehicle Insurance</option>
                  <option value="Home Insurance">Home Insurance</option>
                  <option value="Warranty">Extended Warranty</option>
                  <option value="Gadget Insurance">Gadget Protection</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Premium / Cost</label>
                  <input
                    type="number" value={formData.amount || ""} onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                    placeholder="₹ 0.00"
                    className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Expiry / Renewal</label>
                  <input
                    type="date" value={formData.expiry || ""} onChange={(e) => setFormData({...formData, expiry: e.target.value})}
                    className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Policy / Warranty No.</label>
                <input
                  type="text" value={formData.policyNo || ""} onChange={(e) => setFormData({...formData, policyNo: e.target.value})}
                  placeholder="ID-XXXXXXXX"
                  className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>
            </div>
          )}

          {(type === "recurring" || type === "subscription") && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                <select
                  value={formData.category || ""}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                >
                  <option value="">Select Type</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Water">Water</option>
                  <option value="Gas">Gas</option>
                  <option value="Internet">Internet</option>
                  <option value="Mobile">Mobile</option>
                  <option value="DTH">DTH / Cable</option>
                  <option value="Rent">Rent</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Gym">Gym</option>
                  <option value="Milk">Milk</option>
                  <option value="Newspaper">Newspaper</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Common Configuration Fields */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Configuration Details</p>
                {(() => {
                  const cat = formData.category?.toLowerCase() || formData.name?.toLowerCase();
                  const commonFields: Record<string, string[]> = {
                    electricity: ["Consumer Number", "Meter Number", "Electricity Board"],
                    water: ["Connection ID", "Consumer Number", "Service Station"],
                    gas: ["Consumer ID", "LPG ID", "Distributor Name"],
                    internet: ["User ID", "Customer ID", "Service Provider"],
                    mobile: ["Mobile Number", "SIM Number", "Network Operator"],
                    dth: ["VC Number", "Subscriber ID", "DTH Operator"],
                    rent: ["Owner Name", "Bank Account No.", "Owner PAN (Tax)"],
                    maintenance: ["Flat / Door No.", "Society Name", "Maintenance Code"],
                    gym: ["Membership ID", "Trainer Name", "Gym Branch"],
                    milk: ["Customer ID", "Daily Qty (Litres)", "Vendor Name"],
                    newspaper: ["Subscriber ID", "Vendor Name", "Paper Type"],
                    netflix: ["Profile Name", "Login Email", "Subscription Plan"],
                    spotify: ["Profile Name", "Email ID", "Plan Type"],
                  };
                  
                  let fields = ["Provider / ID", "Reference Details"];
                  for (const key in commonFields) {
                    if (cat.includes(key)) {
                      fields = commonFields[key];
                      break;
                    }
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {fields.map(field => (
                        <div key={field}>
                          <label className="block text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1">{field}</label>
                          <input
                            type="text"
                            value={formData.configDetails?.[field] || ""}
                            onChange={(e) => setFormData({
                              ...formData,
                              configDetails: {
                                ...(formData.configDetails || {}),
                                [field]: e.target.value
                              }
                            })}
                            className="w-full text-xs font-bold bg-white px-3 py-2 rounded-lg border border-slate-100 focus:ring-2 focus:ring-indigo-600 outline-none shadow-sm"
                            placeholder="Enter detail..."
                          />
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Amount (Approx)</label>
                  <input
                    type="number" value={formData.amount || ""} onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                    placeholder="₹ 0.00"
                    className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Next Due Date</label>
                  <input
                    type="date" value={formData.nextDue || ""} onChange={(e) => setFormData({...formData, nextDue: e.target.value})}
                    className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {type === "giftcard" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Balance</label>
                <input
                  type="number" value={formData.totalBalance || ""} onChange={(e) => setFormData({...formData, totalBalance: Number(e.target.value)})}
                  placeholder="₹ 0.00"
                  className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Expiry Date</label>
                <input
                  type="date" value={formData.expiry || ""} onChange={(e) => setFormData({...formData, expiry: e.target.value})}
                  className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Notes</label>
            <textarea
              value={formData.notes || ""} onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Any additional info..."
              rows={2}
              className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none resize-none"
            />
          </div>

        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all"
        >
          {activeId ? "Update Entity" : `Add New ${config.title.split(' ')[0]}`}
        </button>
      </form>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBack}
              className={cn("w-10 h-10 rounded-full flex items-center justify-center border border-slate-100 hover:bg-slate-50 transition-colors", view === 'list' && "hidden")}
            >
              <ArrowRight className="w-5 h-5 text-slate-600 rotate-180" />
            </button>
            <div>
              <h2 className="text-xl font-black text-slate-800 leading-none">{view === 'list' ? config.title : view === 'form' ? (activeId ? 'Edit Entity' : 'New Entity') : 'Dashboard'}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">{view === 'list' ? config.desc : activeEntity?.name || 'Entity Profile'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {view === 'list' && (
              <button onClick={handleAddNew} className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"><Plus className="w-5 h-5" /></button>
            )}
            <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {view === "list" ? renderList() : view === "details" ? renderDetails() : renderForm()}
        </div>
      </div>

      {showAddTx && (
        <TransactionFormModal 
          onClose={() => setShowAddTx(false)} 
          initialData={{ 
            payee: activeEntity?.name, 
            category: activeEntity?.category || 'General',
            type: 'expense'
          }} 
        />
      )}

      {editTxId && (
        <TransactionFormModal 
          txId={editTxId}
          onClose={() => setEditTxId(null)} 
        />
      )}
    </div>
  );
};
