import React, { useState, useMemo } from "react";
import { X, Plus, Store, Users, Repeat, CreditCard, Gift, ShieldCheck, Trash2, Edit2, ArrowRight, Package, MapPin, Link as LinkIcon, PauseCircle, PlayCircle, History, Clock, IndianRupee } from "lucide-react";
import { cn, formatINR } from "../utils";
import { useFinance, Entity, Transaction } from "../context/FinanceContext";
import { format, differenceInDays, parseISO, isSameDay } from "date-fns";

const entityConfig: Record<string, { title: string, icon: any, desc: string, color: string }> = {
  shop: { title: "Shops & Merchants", icon: Store, desc: "Manage frequent payees", color: "text-blue-600 bg-blue-50" },
  person: { title: "People (Khata)", icon: Users, desc: "Track lending & borrowing", color: "text-indigo-600 bg-indigo-50" },
  recurring: { title: "Recurring Bills", icon: Repeat, desc: "Utility and regular bills", color: "text-amber-600 bg-amber-50" },
  subscription: { title: "Subscriptions", icon: CreditCard, desc: "Digital services", color: "text-rose-600 bg-rose-50" },
  giftcard: { title: "Gift Cards", icon: Gift, desc: "Unused gift card balances", color: "text-emerald-600 bg-emerald-50" },
  warranty: { title: "Warranties", icon: ShieldCheck, desc: "Warranty tracking", color: "text-slate-600 bg-slate-100" },
  item: { title: "Items / Inventory", icon: Package, desc: "Purchased items & assets", color: "text-teal-600 bg-teal-50" },
  bank: { title: "Bank Details", icon: IndianRupee, desc: "Account numbers, IFSC & branch", color: "text-indigo-600 bg-indigo-50" },
};

export const EntityManagementModal = ({ type, onClose }: { type: string; onClose: () => void }) => {
  const { entities, transactions, addEntity, updateEntity, deleteEntity } = useFinance();
  const [view, setView] = useState<"list" | "details" | "form">("list");
  const [activeId, setActiveId] = useState<string | null>(null);

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
    if (type === 'giftcard' || type === 'warranty' || type === 'subscription' || type === 'recurring') {
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
  const renderList = () => (
    <div className="space-y-3">
      {filteredEntities.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <config.icon className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="font-medium text-sm">No {config.title.toLowerCase()} found.</p>
        </div>
      ) : (
        filteredEntities.map(ent => (
          <div key={ent.id} onClick={() => handleViewDetails(ent)} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-indigo-100 hover:shadow-md transition-all group">
            <div className="flex items-center gap-4">
              <div className={cn("w-2 h-2 rounded-full", ent.status === 'paused' ? "bg-amber-400" : "bg-emerald-400")} />
              <div>
                <h4 className={cn("font-bold", ent.status === 'paused' ? "text-slate-500 line-through opacity-70" : "text-slate-800")}>{ent.name}</h4>
                {ent.relationship && <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">{ent.relationship}</p>}
                {ent.mode === 'online' && <p className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider mt-0.5">Online Store</p>}
                {ent.mode === 'offline' && <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider mt-0.5">Physical Store</p>}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
          </div>
        ))
      )}
    </div>
  );

  const renderDetails = () => {
    if (!activeEntity) return null;
    
    let stats = null;
    let relevantTxns: Transaction[] = [];

    if (type === "shop") {
      relevantTxns = transactions.filter(t => t.payee.toLowerCase() === activeEntity.name.toLowerCase());
      const totalSpend = relevantTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      stats = (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Total Spend</p>
            <p className="text-xl font-bold text-slate-800">{formatINR(totalSpend)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center items-start">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Mode & Location</p>
            <p className="text-sm font-bold text-slate-800 capitalize flex items-center gap-1.5">
              {activeEntity.mode === 'online' ? <LinkIcon className="w-3.5 h-3.5 text-indigo-500" /> : <MapPin className="w-3.5 h-3.5 text-emerald-500" />}
              {activeEntity.mode || "Unknown"}
            </p>
            {activeEntity.url && (
               <a href={activeEntity.url.startsWith('http') ? activeEntity.url : `https://${activeEntity.url}`} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline flex items-center gap-1 mt-1 font-medium">
                 {activeEntity.url} <LinkIcon className="w-3 h-3" />
               </a>
            )}
            {activeEntity.location && (
               <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 italic">
                 <MapPin className="w-3 h-3 text-emerald-500" /> {activeEntity.location}
               </p>
            )}
          </div>
        </div>
      );
    } else if (type === "person") {
      relevantTxns = transactions.filter(t => t.tags.includes(activeEntity.name) || t.payee.toLowerCase() === activeEntity.name.toLowerCase());
      let net = 0;
      relevantTxns.forEach(t => {
        if (t.type === 'expense') net -= t.amount;
        if (t.type === 'income') net += t.amount;
      });
      stats = (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={cn("p-4 rounded-xl border shadow-sm", net > 0 ? "bg-emerald-50 border-emerald-100" : net < 0 ? "bg-red-50 border-red-100" : "bg-white border-slate-100")}>
            <p className="text-[10px] uppercase font-bold tracking-wider mb-1 opacity-70">
              {net > 0 ? "Owes Us (Receivable)" : net < 0 ? "We Owe (Payable)" : "Settled"}
            </p>
            <p className={cn("text-xl font-bold", net > 0 ? "text-emerald-700" : net < 0 ? "text-red-700" : "text-slate-800")}>
              {formatINR(Math.abs(net))}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Relationship</p>
            <p className="text-sm font-bold text-slate-800 mt-1">{activeEntity.relationship || "Unspecified"}</p>
          </div>
        </div>
      );
    } else if (type === "recurring" || type === "subscription") {
      relevantTxns = transactions.filter(t => t.payee.toLowerCase() === activeEntity.name.toLowerCase() || t.payee.toLowerCase() === activeEntity.provider?.toLowerCase());
      stats = (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Amount</p>
            <p className="text-xl font-bold text-slate-800">{activeEntity.amount ? formatINR(activeEntity.amount) : "Variable"}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5 capitalize">{activeEntity.recurringDuration || "Monthly"}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Billing Details</p>
            <p className="text-sm font-bold text-slate-800 truncate">{activeEntity.billingDetails || "None provided"}</p>
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
    } else if (type === "warranty") {
      const linkedItem = entities.find(e => e.id === activeEntity.itemId && e.type === 'item');
      stats = (
        <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Warranty Details</p>
            <p className="text-sm font-bold text-slate-800 mb-2">{activeEntity.warrantyDetails || "Standard Warranty"}</p>
            {linkedItem && (
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50 p-2 rounded-lg w-fit">
                <Package className="w-4 h-4" /> Linked to: {linkedItem.name}
              </div>
            )}
          </div>
        </div>
      );
    } else if (type === "item") {
      relevantTxns = transactions.filter(t => t.notes?.toLowerCase().includes(activeEntity.name.toLowerCase()) || t.tags.includes(activeEntity.name));
      stats = (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Current Price</p>
            <p className="text-xl font-bold text-slate-800">{activeEntity.price ? formatINR(activeEntity.price) : "N/A"}</p>
            {activeEntity.quantity && <p className="text-xs text-slate-500 font-medium mt-0.5">Qty: {activeEntity.quantity}</p>}
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
            {activeEntity.picUrl ? (
              <img src={activeEntity.picUrl} alt="Item" className="w-12 h-12 object-cover rounded-lg" />
            ) : (
              <Package className="w-8 h-8 text-slate-300" />
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="animate-in fade-in duration-300">
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-xl font-black text-slate-800">{activeEntity.name}</h3>
           <div className="flex gap-2">
             <button onClick={(e) => handleToggleStatus(activeEntity, e)} className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5", activeEntity.status === 'paused' ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>
               {activeEntity.status === 'paused' ? <><PlayCircle className="w-4 h-4" /> Resume</> : <><PauseCircle className="w-4 h-4" /> Pause</>}
             </button>
             <button onClick={() => handleEdit(activeEntity)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 bg-white border border-slate-200"><Edit2 className="w-4 h-4" /></button>
             <button onClick={(e) => handleDelete(activeEntity.id, e)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 bg-white border border-slate-200"><Trash2 className="w-4 h-4" /></button>
           </div>
        </div>
        
        {stats}

        {/* Transaction Ledger */}
        {(type !== 'warranty' && relevantTxns.length > 0) && (
          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-slate-400" /> Linked Transactions
            </h4>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
              {relevantTxns.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                <div key={t.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{t.category}</p>
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
              placeholder="e.g. Amazon, Rahul, Netflix"
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
                <option value="Other">Other</option>
              </select>
            </div>
          )}

          {(type === "recurring" || type === "subscription") && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Provider / Details</label>
                <input
                  type="text" value={formData.billingDetails || ""} onChange={(e) => setFormData({...formData, billingDetails: e.target.value})}
                  placeholder="e.g. EB Number: 1234567"
                  className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Expected Amount</label>
                  <input
                    type="number" value={formData.amount || ""} onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                    className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Duration</label>
                  <select value={formData.recurringDuration || 'monthly'} onChange={(e) => setFormData({...formData, recurringDuration: e.target.value})} className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none appearance-none">
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {type === "giftcard" && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Gift Card Value</label>
              <input
                type="number" value={formData.totalBalance || ""} onChange={(e) => setFormData({...formData, totalBalance: Number(e.target.value)})} required
                className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>
          )}

          {type === "warranty" && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Warranty Details</label>
                <input
                  type="text" value={formData.warrantyDetails || ""} onChange={(e) => setFormData({...formData, warrantyDetails: e.target.value})}
                  placeholder="e.g. 2 Years Extended"
                  className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Link to Item</label>
                <select value={formData.itemId || ""} onChange={(e) => setFormData({...formData, itemId: e.target.value})} className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none appearance-none">
                  <option value="">None</option>
                  {entities.filter(e => e.type === 'item').map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {type === "item" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Current Price</label>
                <input
                  type="number" value={formData.price || ""} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Quantity/Measure</label>
                <input
                  type="text" value={formData.quantity || ""} onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  placeholder="e.g. 1 unit, 500g"
                  className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Image URL</label>
                <input
                  type="text" value={formData.picUrl || ""} onChange={(e) => setFormData({...formData, picUrl: e.target.value})}
                  placeholder="https://..."
                  className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>
            </div>
          )}

          {(type === "giftcard" || type === "warranty") && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Expiry Date</label>
              <input
                type="date" value={formData.expiryDate || ""} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>
          )}

          {type === "bank" && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Account Number</label>
                <input
                  type="text" value={formData.accountNo || ""} onChange={(e) => setFormData({...formData, accountNo: e.target.value})}
                  placeholder="e.g. 50100123456789"
                  className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">IFSC Code</label>
                  <input
                    type="text" value={formData.ifsc || ""} onChange={(e) => setFormData({...formData, ifsc: e.target.value})}
                    placeholder="HDFC0001234"
                    className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Branch Name</label>
                  <input
                    type="text" value={formData.branch || ""} onChange={(e) => setFormData({...formData, branch: e.target.value})}
                    placeholder="M.G. Road"
                    className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm sm:p-4">
      <div className="fixed inset-0 sm:hidden" onClick={onClose} />
      
      <div className="relative w-full sm:w-[480px] bg-slate-50 h-full sm:rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white z-10">
          <div className="flex items-center gap-3">
            {view !== "list" ? (
              <button onClick={handleBack} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
                <ArrowRight className="w-5 h-5 rotate-180" />
              </button>
            ) : (
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", config.color)}>
                <config.icon className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {view === "form" ? (activeId ? "Edit Details" : "Add New") : view === "details" ? "Dashboard" : config.title}
              </h3>
              {view === "list" && <p className="text-xs font-medium text-slate-500">{config.desc}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {view === "list" && renderList()}
          {view === "details" && renderDetails()}
          {view === "form" && renderForm()}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white z-10 shrink-0">
          {view === "list" ? (
            <button onClick={handleAddNew} className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" /> Add New {config.title.split(' ')[0]}
            </button>
          ) : view === "form" ? (
            <button type="submit" form="entity-form" className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2">
              Save Details
            </button>
          ) : null}
        </div>

      </div>
    </div>
  );
};
