import React, { useState, useEffect, useRef } from "react";
import { format, parseISO } from "date-fns";
import { X, ArrowDownRight, ArrowUpRight, ArrowRightLeft, ChevronDown, ChevronUp, MapPin, Tag, Users, Calendar, Plus, Edit } from "lucide-react";
import { cn } from "../utils";
import { useFinance, TransactionType } from "../context/FinanceContext";
import { toast } from "sonner";
import { SUBCATEGORY_MAP, CATEGORY_CLASSIFICATION, SubCategory } from "../utils/categories";
import { predictCategory } from "../utils/aiCategorization";

// ─── Searchable Select Component ──────────────────────────────────────────
interface SearchableSelectProps {
  options: string[] | { label: string; value: string }[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  accentColor?: string;
  allowCustom?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange, placeholder = "Search...", label, className, accentColor = "indigo", allowCustom }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  const normalizedOptions = options.map(o => typeof o === "string" ? { label: o, value: o } : o);
  const filtered = normalizedOptions.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  const currentLabel = normalizedOptions.find(o => o.value === value)?.label || value || "";

  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const accentThemes: Record<string, string> = {
    indigo: "border-indigo-500 ring-indigo-500/10 text-indigo-600 bg-indigo-50",
    blue: "border-blue-500 ring-blue-500/10 text-blue-600 bg-blue-50",
    emerald: "border-emerald-500 ring-emerald-500/10 text-emerald-600 bg-emerald-50",
    rose: "border-rose-500 ring-rose-500/10 text-rose-600 bg-rose-50",
  };
  const theme = accentThemes[accentColor] || accentThemes.indigo;

  return (
    <div className={cn("relative flex-1", className)} ref={containerRef}>
      {label && <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">{label}</label>}
      <div 
        onClick={() => { setOpen(!open); if (!open) setSearch(""); }}
        className={cn(
          "flex items-center justify-between w-full text-sm font-bold bg-slate-50 px-3.5 py-3 rounded-2xl border-2 transition-all cursor-pointer",
          open ? theme.split(' ').slice(0, 3).join(' ') + " bg-white shadow-lg ring-4" : "border-transparent hover:border-slate-200"
        )}
      >
        <span className={cn("truncate", !currentLabel && "text-slate-300")}>{currentLabel || placeholder}</span>
        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-300", open && "rotate-180")} />
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 z-[1000] mt-1 bg-white border border-slate-100 rounded-[1.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-slate-50">
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter..."
              className="w-full text-xs font-bold bg-slate-50 px-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="max-h-56 overflow-y-auto custom-scrollbar">
            {filtered.length === 0 && allowCustom && search && (
               <button type="button" onClick={() => { onChange(search); setOpen(false); }} className="w-full px-4 py-2.5 text-left text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-2">
                 <Plus className="w-4 h-4" /> Add "{search}"
               </button>
            )}
            {filtered.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={cn(
                  "w-full px-4 py-3 text-left text-[11px] font-black uppercase tracking-tight transition-colors border-b border-slate-50 last:border-0",
                  o.value === value ? theme.split(' ').slice(2).join(' ') : "text-slate-600 hover:bg-slate-50"
                )}
              >
                {o.label}
              </button>
            ))}
            {filtered.length === 0 && !allowCustom && <div className="px-4 py-3 text-xs text-slate-400 font-bold text-center">No results found</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export const TransactionFormModal: React.FC<{
  onClose: () => void,
  txId?: string,
  initialType?: TransactionType,
  initialData?: {
    payee?: string;
    category?: string;
    type?: TransactionType;
    amount?: number;
    notes?: string;
    accountId?: string;
  }
}> = ({ onClose, txId, initialType, initialData }) => {
  const { accounts, addTransaction, updateTransaction, transactions, profile, entities, categories: ctxCategories, updateCategory } = useFinance();

  // Build live category name lists from context (skip disabled, sorted)
  const activeCats = (type: 'expense' | 'income') =>
    ctxCategories
      .filter(c => !c.disabled && (type === 'expense' ? c.type !== 'income' : c.type === 'income'))
      .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99))
      .map(c => c.name);

  // Dynamic subcategory helper that returns children if they exist
  const getSubcatObjects = (catName: string): any[] => {
    const found = ctxCategories.find(c => c.name === catName);
    return found?.children || [];
  };

  // Classification lookup from context
  const getClassification = (catName: string) => {
    const found = ctxCategories.find(c => c.name === catName);
    return found?.classification ?? CATEGORY_CLASSIFICATION[catName] ?? 'want';
  };

  const categories = {
    expense: activeCats('expense'),
    income: activeCats('income'),
  };

  const [viewMode, setViewMode] = useState<"normal" | "detailed">("normal");

  // Basic Fields
  const [type, setType] = useState<TransactionType>(initialData?.type || initialType || "expense");
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "");
  const [accountId, setAccountId] = useState(initialData?.accountId || accounts[0]?.id || "");
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || accounts[0]?.id || "");
  const [payee, setPayee] = useState(initialData?.payee || "");
  const [category, setCategory] = useState(initialData?.category || (initialType === 'income' ? categories.income[0] : categories.expense[0]));

  // Detailed Fields
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [needWant, setNeedWant] = useState<"need" | "want" | "investment" | "discretionary">("want");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState<"cleared" | "pending">("cleared");
  const [mode, setMode] = useState<"UPI" | "card" | "cash" | "banking">("UPI");
  const [showPayeeSuggestions, setShowPayeeSuggestions] = useState(false);
  const [isSplit, setIsSplit] = useState(false);
  const [notes, setNotes] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [subSubCategory, setSubSubCategory] = useState("");

  // Inventory Items
  const [itemInput, setItemInput] = useState("");
  const [itemQty, setItemQty] = useState("1");
  const [itemUnit, setItemUnit] = useState("pcs");
  const [itemPrice, setItemPrice] = useState("");
  const [itemsList, setItemsList] = useState<{ name: string, qty: string, unit: string, price?: number }[]>([]);

  // Transport route fields (used in items entry when category is Transport)
  const [routeFrom, setRouteFrom] = useState("");
  const [routeTo, setRouteTo] = useState("");

  // Split details
  const [splitWithInput, setSplitWithInput] = useState("");
  const [splitWithList, setSplitWithList] = useState<string[]>([]);
  const [splitShare, setSplitShare] = useState("Equally");
  const [splitValues, setSplitValues] = useState<Record<string, string>>({});
  const [splitDueDate, setSplitDueDate] = useState("");
  const [itemAssignments, setItemAssignments] = useState<Record<number, string[]>>({});

  const [isCustomSubCat, setIsCustomSubCat] = useState(false);
  const [customSubCat, setCustomSubCat] = useState("");

  const prevItemsTotal = React.useRef(0);

  const itemsTotal = itemsList.reduce((acc, itm) => acc + (itm.price || 0), 0);

  React.useEffect(() => {
    // Initial population for salary transactions
    if (!txId && !initialData?.payee && type === 'income' && category === 'Salary') {
      if (profile.companyName) {
        setPayee(profile.companyName);
      }
    }
  }, [type, category, profile.companyName, txId, initialData]);

  React.useEffect(() => {
    const currentAmt = Number(amount) || 0;
    // Update amount if it's 0 OR if it was previously synced with itemsTotal
    if (itemsTotal > 0 && (currentAmt === 0 || Math.abs(currentAmt - prevItemsTotal.current) < 0.01)) {
      setAmount(itemsTotal.toFixed(2));
    }
    prevItemsTotal.current = itemsTotal;
  }, [itemsTotal, amount]);

  const addItem = () => {
    if (itemInput.trim()) {
      setItemsList([...itemsList, {
        name: itemInput.trim(),
        qty: itemQty,
        unit: itemUnit,
        price: itemPrice ? Number(itemPrice) : undefined
      }]);
      setItemInput("");
      setItemQty("1");
      setItemPrice("");
    }
  };
  const removeItem = (idx: number) => setItemsList(itemsList.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: string, value: string) => {
    setItemsList(prev => prev.map((itm, i) => i === idx ? { ...itm, [field]: field === 'price' ? (value ? Number(value) : undefined) : value } : itm));
  };
  const [editingItemIdx, setEditingItemIdx] = useState<number | null>(null);

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    }
  };
  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  const addSplitPerson = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && splitWithInput.trim()) {
      e.preventDefault();
      if (!splitWithList.includes(splitWithInput.trim())) {
        setSplitWithList([...splitWithList, splitWithInput.trim()]);
      }
      setSplitWithInput("");
    }
  };
  const removeSplitPerson = (name: string) => setSplitWithList(splitWithList.filter(n => n !== name));

  const [forWhom, setForWhom] = useState<string[]>(["self"]);
  const toggleForWhom = (val: string) => {
    setForWhom(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    );
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setIsCustomSubCat(false);
    setCustomSubCat("");

    // Reset split and item states when moving away from expense
    if (newType !== "expense") {
      setIsSplit(false);
      setSplitShare("Equally");
      setItemsList([]);
    }

    if (newType !== 'transfer') {
      const defaultCat = categories[newType as 'expense' | 'income'][0];
      setCategory(defaultCat);
      if (newType === 'income' && defaultCat === 'Salary') {
        setPayee(profile.companyName);
      }
    }
  };

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    setIsCustomSubCat(false);
    setCustomSubCat("");
    setSubCategory("");
    if (type === 'income' && newCat === 'Salary') {
      setPayee(profile.companyName);
    }
    const cls = getClassification(newCat);
    if (cls) setNeedWant(cls as any);
  };

  React.useEffect(() => {
    if (txId) {
      const tx = transactions.find(t => t.id === txId);
      if (tx) {
        setType(tx.type);
        setAmount(tx.amount.toString());
        setAccountId(tx.account_id);
        if (tx.to_account_id) setToAccountId(tx.to_account_id);
        setPayee(tx.payee);
        setCategory(tx.category);
        setDate(tx.date);
        setMode(tx.mode as any || "UPI");
        setNotes(tx.notes);
        setSubCategory(tx.subCategory || "");
        setSubSubCategory(tx.subSubCategory || "");
        setNeedWant((tx as any).needWant || "want");
        setTags(tx.tags || []);
        setStatus(tx.status || "cleared");

        if (tx.items) setItemsList(tx.items);
        if (tx.split) {
          setIsSplit(true);
          setSplitWithList(tx.split.with || []);
          setSplitShare(tx.split.shareStrategy || "Equally");
          setSplitDueDate(tx.split.dueDate || "");
          if (tx.split.shares) setSplitValues(tx.split.shares);
          if (tx.split.portionAssignments) setPortionAssignments(tx.split.portionAssignments);
        }

        if (tx.notes || tx.items?.length || tx.split || tx.tags.length > 0 || tx.subCategory) {
          setViewMode("detailed");
        }
      }
    }
  }, [txId, transactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    // Validate: transfer cannot be to/from same account
    if (type === 'transfer' && accountId === toAccountId) {
      toast.error("Transfer source and destination cannot be the same account.");
      return;
    }

    const txData: any = {
      amount: Number(amount),
      type,
      category: type === 'transfer' ? 'Transfer' : category,
      account_id: accountId,
      payee: payee || (type === "transfer" ? "Self Transfer" : "Unknown"),
      date,
      notes,
      mode: mode,
      subCategory: isCustomSubCat ? customSubCat : (subCategory || undefined),
      subSubCategory: subSubCategory || undefined,
      items: itemsList.length > 0 ? itemsList : undefined,
      tags,
      status
    };

    // Auto-persist custom subcategory to the master list if it's new
    if (isCustomSubCat && customSubCat.trim()) {
      const parent = ctxCategories.find(c => c.name === category);
      if (parent && !parent.subcategories.includes(customSubCat.trim())) {
        updateCategory(parent.id, {
          subcategories: [...parent.subcategories, customSubCat.trim()]
        });
      }
    }

    if (isSplit && splitWithList.length > 0) {
      txData.split = {
        with: splitWithList,
        shareStrategy: splitShare,
        dueDate: splitDueDate,
        shares: (splitShare === 'Percentages' || splitShare === 'Exact Amounts') ? splitValues : undefined,
        portionAssignments: splitShare === 'By Items' ? portionAssignments : undefined
      };
    }

    if (type === 'transfer') {
      txData.to_account_id = toAccountId;
    }

    if (isSplit && splitShare === 'By Items') {
      const overAssignedItem = itemsList.find((itm, idx) => {
        const assignments = portionAssignments[idx] || {};
        const totalAssigned = Object.values(assignments).reduce((sum, val) => sum + Number(val || 0), 0);
        return totalAssigned > Number(itm.qty);
      });
      if (overAssignedItem) {
        toast.error(`"${overAssignedItem.name}" is over-assigned! Total assigned quantity exceeds purchased quantity.`);
        return;
      }
    }

    // Simple Duplicate Detection Check
    const isDuplicate = transactions.some(t =>
      t.amount === txData.amount &&
      t.payee === txData.payee &&
      t.date === txData.date &&
      t.type === txData.type &&
      t.id !== txId
    );

    if (isDuplicate) {
      if (!confirm("This looks like a duplicate transaction. Save anyway?")) return;
    }

    if (txId) {
      updateTransaction(txId, txData);
      toast.success("Transaction updated!");
    } else {
      addTransaction(txData);
      toast.success("Transaction added!");
    }

    onClose();
  };

  // Portion-based split: track what fraction of each item each person gets
  // portionAssignments[itemIdx][person] = qty shared (number string)
  const [portionAssignments, setPortionAssignments] = useState<Record<number, Record<string, string>>>({});

  const setPortionFor = (itemIdx: number, person: string, qty: string) => {
    setPortionAssignments(prev => ({
      ...prev,
      [itemIdx]: { ...(prev[itemIdx] || {}), [person]: qty }
    }));
  };

  const calculateSplit = (personName?: string): string => {
    const total = Number(amount) || itemsTotal;
    const parseFraction = (val: string): number => {
      if (!val) return 0;
      if (typeof val === 'number') return val;
      if (val.includes('/')) {
        const [num, den] = val.split('/').map(n => parseFloat(n.trim()));
        if (den && !isNaN(num) && !isNaN(den)) return num / den;
      }
      return parseFloat(val) || 0;
    };

    const participants = 1 + splitWithList.length;

    if (splitShare === "Equally") {
      return (total / participants).toFixed(2);
    }

    if (splitShare === "By Items") {
      const target = personName || "You";
      let sum = 0;
      itemsList.forEach((itm, idx) => {
        const assignments = portionAssignments[idx] || {};
        const totalQty = Number(itm.qty) || 1;
        const personQty = parseFraction(assignments[target] || "");
        
        if (personQty > 0 && itm.price) {
          sum += (itm.price / totalQty) * personQty;
        } else if (!personQty) {
          // Fall back to old boolean assignment if no portion set
          const oldAssigned = itemAssignments[idx] || [];
          if (oldAssigned.includes(target)) {
            sum += (itm.price || 0) / Math.max(oldAssigned.length, 1);
          }
        }
      });
      return sum.toFixed(2);
    }

    if (!personName) return calculateYourShare();

    const val = Number(splitValues[personName]) || 0;
    if (splitShare === "Percentages") {
      return ((total * val) / 100).toFixed(2);
    }
    if (splitShare === "Exact Amounts") {
      return val.toFixed(2);
    }
    return "0.00";
  };

  const calculateYourShare = (): string => {
    const total = Number(amount) || itemsTotal;
    if (splitShare === "Equally") return calculateSplit();
    if (splitShare === "By Items") return calculateSplit(); // Uses "You" logic

    let othersTotal = 0;
    splitWithList.forEach(p => {
      othersTotal += Number(calculateSplit(p));
    });
    return (total - othersTotal).toFixed(2);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center sm:justify-center bg-slate-900/50 backdrop-blur-sm sm:p-4">
      <div className="fixed inset-0 sm:hidden" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10">
          <h3 className="text-lg font-bold text-slate-900">{txId ? 'Edit Entry' : 'New Entry'}</h3>
          <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 bg-slate-50/50 scrollbar-hide">
          {/* Type Selector */}
          <div className="flex p-1 mb-6 bg-slate-200/50 rounded-xl">
            {(["income", "transfer", "expense"] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-semibold capitalize transition-all",
                  type === t ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {t === "expense" && <ArrowDownRight className="w-4 h-4 text-red-500" />}
                {t === "income" && <ArrowUpRight className="w-4 h-4 text-emerald-500" />}
                {t === "transfer" && <ArrowRightLeft className="w-4 h-4 text-blue-500" />}
                {t}
              </button>
            ))}
          </div>

          <form id="tx-form" onSubmit={handleSubmit} className="space-y-5 pb-4">

            {/* CARD 1: Basic View Fields */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-5">
              {/* Row 1: Amount & Date */}
              {!(type === 'expense' && splitShare === 'By Items' && itemsTotal > 0) ? (
                <div className="relative flex items-center justify-between bg-slate-50 rounded-xl p-3 focus-within:ring-2 focus-within:ring-indigo-600 transition-all">
                  <div className="flex items-center flex-1">
                    <span className="text-3xl font-bold text-slate-400 mr-2">₹</span>
                    <input
                      type="number" inputMode="decimal" step="0.01" autoFocus required
                      value={amount} onChange={(e) => setAmount(e.target.value)}
                      className="w-full text-4xl font-black text-slate-900 bg-transparent border-0 p-0 focus:ring-0 outline-none placeholder:text-slate-300"
                      placeholder="0"
                    />
                  </div>
                  {amount && itemsTotal > 0 && Math.abs(Number(amount) - itemsTotal) > 0.01 && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-100 text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-200 animate-pulse whitespace-nowrap">
                      Mismatch: Item total is ₹{itemsTotal.toFixed(2)}
                    </div>
                  )}
                  <label className="relative flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all cursor-pointer group">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Date</span>
                      <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{date && date.length >= 8 ? format(parseISO(date), "MMM dd") : "Date"}</span>
                    </div>
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50"><Calendar className="w-4 h-4" /></div>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  </label>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total (from items)</p>
                    <p className="text-3xl font-black text-slate-900">₹{itemsTotal.toFixed(2)}</p>
                  </div>
                  <label className="relative flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all cursor-pointer group">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Date</span>
                      <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{date && date.length >= 8 ? format(parseISO(date), "MMM dd") : "Date"}</span>
                    </div>
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50"><Calendar className="w-4 h-4" /></div>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  </label>
                </div>
              )}

              {/* Row 2: Account & Category/Stream/ToAccount */}
              <div className="grid grid-cols-2 gap-4">
                {type === "transfer" ? (
                  <>
                    <SearchableSelect label="From" options={accounts.map(a => ({ label: a.name, value: a.id }))} value={accountId} onChange={setAccountId} accentColor="blue" />
                    <SearchableSelect label="To" options={accounts.map(a => ({ label: a.name, value: a.id }))} value={toAccountId} onChange={setToAccountId} accentColor="indigo" />
                  </>
                ) : (
                  <>
                    <SearchableSelect label="Account" options={accounts.map(a => ({ label: a.name, value: a.id }))} value={accountId} onChange={setAccountId} accentColor={type === 'income' ? 'emerald' : 'indigo'} />
                    <SearchableSelect label="Category" options={type === 'income' ? categories.income : categories.expense} value={category} onChange={handleCategoryChange} accentColor={type === 'income' ? 'emerald' : 'indigo'} />
                  </>
                )}
              </div>

              {/* Row 3: Payee / Shop */}
              {type !== "transfer" && (
                <div className="relative">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Payee / Shop</label>
                  <input
                    type="text" value={payee} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setPayee(val);
                      setShowPayeeSuggestions(true);
                      if (val.length >= 3 && type === 'expense') {
                        const pred = predictCategory(val, ctxCategories);
                        if (pred) { setCategory(pred.category); if (pred.subCategory) setSubCategory(pred.subCategory); if (pred.subSubCategory) setSubSubCategory(pred.subSubCategory); if (pred.classification) setNeedWant(pred.classification as any); }
                      }
                    }}
                    onFocus={() => setShowPayeeSuggestions(true)}
                    required placeholder={type === 'income' ? "e.g. Acme Corp" : "e.g. Amazon, Swiggy"}
                    className="w-full text-sm font-bold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                  {showPayeeSuggestions && payee.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-[110] mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-40 overflow-y-auto">
                      {entities.filter(e => e.name.toLowerCase().includes(payee.toLowerCase())).map(e => (
                        <button key={e.id} type="button" onClick={() => { setPayee(e.name); if (e.category) setCategory(e.category); setShowPayeeSuggestions(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50 last:border-0">
                          <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold uppercase">{e.name.charAt(0)}</div>
                          <div className="flex-1 text-xs font-bold text-slate-700">{e.name}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Visual Break / Toggle */}
            {(type === "expense" || type === "income") && (
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t-2 border-dashed border-slate-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <button
                    type="button"
                    onClick={() => setViewMode(v => v === "normal" ? "detailed" : "normal")}
                    className={cn(
                      "inline-flex items-center gap-2 px-5 py-2 rounded-full border-2 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm",
                      viewMode === "detailed" 
                        ? "bg-indigo-600 border-indigo-600 text-white" 
                        : "bg-white border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200"
                    )}
                  >
                    {viewMode === "normal" ? (
                      <><Plus className="w-3.5 h-3.5" /> Advanced Details</>
                    ) : (
                      <><ChevronUp className="w-3.5 h-3.5" /> Basic View</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Detailed View — Card Based Organization */}
            {viewMode === "detailed" && type === "expense" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                
                {/* CARD 2: Context & Notes */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-4">
                  <div className="space-y-4">
                    {localStorage.getItem('s_subcats') !== 'false' && (
                        <SearchableSelect
                          label="Sub Category"
                          options={getSubcatObjects(category)?.map(sc => sc.name) || []}
                          value={subCategory}
                          onChange={(val) => { setSubCategory(val); setSubSubCategory(""); }}
                          allowCustom placeholder="Select or type..."
                        />
                    )}

                    {!isCustomSubCat && subCategory && getSubcatObjects(category).find(sc => sc.name === subCategory)?.children?.length > 0 && (
                      <SearchableSelect
                        label="Specific Item"
                        options={getSubcatObjects(category).find(sc => sc.name === subCategory)?.children?.map((ssc: any) => ssc.name) || []}
                        value={subSubCategory} onChange={setSubSubCategory} placeholder="Search..." allowCustom
                      />
                    )}
                    
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Purpose / Short Note</label>
                      <input
                        type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Lunch with team"
                        className="w-full text-sm bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* CARD 3: Items & Inventory */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-4">
                  <div className="space-y-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      {category === 'Transportation' ? 'Routes & Tickets' : 'Items & Inventory'}
                    </label>
                    <div className="space-y-2">
                      {category === 'Transportation' ? (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text" value={routeFrom} onChange={(e) => setRouteFrom(e.target.value)}
                              placeholder="From (e.g. Home)"
                              className="text-sm bg-white px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none shadow-sm"
                            />
                            <input
                              type="text" value={routeTo} onChange={(e) => setRouteTo(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (routeFrom.trim() && routeTo.trim()) { setItemInput(`${routeFrom.trim()} → ${routeTo.trim()}`); setItemUnit('ticket'); addItem(); setRouteFrom(''); setRouteTo(''); } } }}
                              placeholder="To (e.g. Office)"
                              className="text-sm bg-white px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none shadow-sm"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1 flex items-center shadow-sm">
                              <span className="text-xs font-bold text-slate-400 mr-2">₹</span>
                              <input type="number" value={itemPrice} onChange={e => setItemPrice(e.target.value)} placeholder="Fare / ticket" className="w-full text-sm bg-transparent border-0 p-1.5 focus:ring-0 outline-none" />
                            </div>
                            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-sm">
                              <input type="number" min="1" value={itemQty} onChange={(e) => setItemQty(e.target.value)} className="w-10 text-sm bg-transparent border-0 p-0 focus:ring-0 outline-none text-center font-bold" />
                              <span className="text-xs text-slate-400 font-semibold">ticket{Number(itemQty) > 1 ? 's' : ''}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (routeFrom.trim() && routeTo.trim()) {
                                  setItemsList(prev => [...prev, {
                                    name: `${routeFrom.trim()} → ${routeTo.trim()}`,
                                    qty: itemQty,
                                    unit: 'ticket',
                                    price: itemPrice ? Number(itemPrice) * Number(itemQty) : undefined
                                  }]);
                                  setRouteFrom(''); setRouteTo(''); setItemQty('1'); setItemPrice('');
                                }
                              }}
                              className="w-10 h-[40px] flex items-center justify-center bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shrink-0"
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <input
                            type="text" value={itemInput} onChange={(e) => setItemInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
                            placeholder="Add new item (e.g. Grapes)"
                            className="w-full text-sm bg-white px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none shadow-sm"
                          />
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1 flex items-center shadow-sm">
                              <span className="text-xs font-bold text-slate-400 mr-2">₹</span>
                              <input type="number" value={itemPrice} onChange={e => setItemPrice(e.target.value)} placeholder="Price" className="w-full text-sm bg-transparent border-0 p-1.5 focus:ring-0 outline-none" />
                            </div>
                            <input
                              type="number" value={itemQty} onChange={(e) => setItemQty(e.target.value)}
                              className="w-16 text-sm bg-white border border-slate-200 px-2 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none text-center shadow-sm"
                            />
                            <select
                              value={itemUnit} onChange={(e) => setItemUnit(e.target.value)}
                              className="w-24 text-sm bg-white border border-slate-200 px-2 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none shadow-sm font-semibold"
                            >
                              {["pcs", "unit", "kg", "g", "L", "ml", "pack", "box", "bundle"].map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                            <button type="button" onClick={addItem} className="w-10 h-[40px] flex items-center justify-center bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shrink-0">
                              <Plus className="w-5 h-5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    {itemsList.length > 0 && (
                      <div className="space-y-2">
                        {itemsList.map((itm, i) => (
                          <div key={i}>
                            {editingItemIdx === i ? (
                              <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-200 space-y-2 animate-in zoom-in-95 duration-150">
                                <div className="flex gap-2">
                                  <input
                                    autoFocus
                                    value={itm.name}
                                    onChange={e => updateItem(i, 'name', e.target.value)}
                                    className="flex-1 text-sm font-bold bg-white border border-indigo-200 px-2 py-1.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Item name"
                                  />
                                  <button type="button" onClick={() => setEditingItemIdx(null)} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700">Done</button>
                                  <button type="button" onClick={() => { removeItem(i); setEditingItemIdx(null); }} className="px-2 py-1.5 bg-red-100 text-red-600 text-xs font-bold rounded-lg hover:bg-red-200">✕</button>
                                </div>
                                <div className="flex gap-2">
                                  <div className="flex-1 bg-white border border-indigo-200 rounded-lg px-2 py-1 flex items-center">
                                    <span className="text-xs font-bold text-slate-400 mr-1">₹</span>
                                    <input type="number" value={itm.price ?? ''} onChange={e => updateItem(i, 'price', e.target.value)} placeholder="Price" className="w-full text-sm bg-transparent border-0 p-0.5 focus:ring-0 outline-none" />
                                  </div>
                                  <input type="number" value={itm.qty} onChange={e => updateItem(i, 'qty', e.target.value)} className="w-14 text-sm bg-white border border-indigo-200 px-2 py-1 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-center" />
                                  <select value={itm.unit} onChange={e => updateItem(i, 'unit', e.target.value)} className="w-20 text-sm bg-white border border-indigo-200 px-1 py-1 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-semibold">
                                    {["pcs", "unit", "kg", "g", "L", "ml", "pack", "box", "bundle"].map(u => <option key={u} value={u}>{u}</option>)}
                                  </select>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-100 shadow-sm group/item">
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-slate-700">{itm.name}</span>
                                  <span className="text-[10px] font-medium text-slate-400">{itm.qty} {itm.unit}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {itm.price !== undefined && <span className="text-sm font-black text-slate-800">₹{itm.price}</span>}
                                  <button type="button" onClick={() => setEditingItemIdx(i)} className="text-slate-300 hover:text-indigo-600 transition-colors opacity-0 group-hover/item:opacity-100"><Edit className="w-4 h-4" /></button>
                                  <button type="button" onClick={() => removeItem(i)} className="text-slate-300 hover:text-red-600 transition-colors"><X className="w-4 h-4" /></button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* CARD 4: Audience, Priority & Tags */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-5">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Audience</p>
                    <div className="grid grid-cols-4 gap-2">
                      {(["self", "family", "friends", "others"] as const).map(fw => (
                        <button type="button" key={fw} onClick={() => toggleForWhom(fw)} className={cn("py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider border transition-all", forWhom.includes(fw) ? "bg-slate-800 border-slate-800 text-white shadow-md scale-[1.02]" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300")}>
                          {fw}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Priority / Type</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(["need", "want", "invest", "disc"] as const).map(nw => (
                        <button type="button" key={nw} onClick={() => setNeedWant(nw === 'invest' ? 'investment' : nw === 'disc' ? 'discretionary' : nw)} className={cn("py-2 text-[9px] font-bold rounded-lg uppercase tracking-wider border transition-all flex items-center justify-center", needWant === (nw === 'invest' ? 'investment' : nw === 'disc' ? 'discretionary' : nw) ? "bg-indigo-600 border-indigo-600 text-white shadow-md scale-[1.02]" : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100")}>
                          {nw}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Tags
                    </label>
                    <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      {tags.map(t => (
                        <span key={t} className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600">
                          #{t}
                          <button onClick={() => setTags(prev => prev.filter(x => x !== t))} className="hover:text-red-500"><X className="w-2.5 h-2.5" /></button>
                        </span>
                      ))}
                      <input
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && tagInput.trim()) {
                            e.preventDefault();
                            if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
                            setTagInput("");
                          }
                        }}
                        placeholder="Add tag..."
                        className="bg-transparent text-[10px] font-bold outline-none flex-1 min-w-[60px]"
                      />
                    </div>
                  </div>
                </div>

                {/* CARD 5: Split Management */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <Users className="w-4 h-4 text-indigo-500" />
                      Split Expense
                    </div>
                    <button
                      type="button"
                      disabled={!(Number(amount) > 0 || itemsTotal > 0)}
                      onClick={() => setIsSplit(!isSplit)}
                      className={cn("w-12 h-6 rounded-full transition-colors relative", isSplit ? "bg-indigo-600" : "bg-slate-200", !(Number(amount) > 0 || itemsTotal > 0) && "opacity-50 cursor-not-allowed")}
                    >
                      <span className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md", isSplit ? "left-7" : "left-1")} />
                    </button>
                  </div>

                  {isSplit && (
                    <div className="space-y-4 p-4 bg-indigo-50/30 border border-indigo-100 rounded-2xl">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">With (Press Enter to add)</label>
                        <div className="bg-white border border-slate-200 rounded-xl p-2 flex flex-wrap gap-2">
                          {splitWithList.map(person => (
                            <span key={person} className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                              {person}
                              <button type="button" onClick={() => removeSplitPerson(person)}><X className="w-3.5 h-3.5" /></button>
                            </span>
                          ))}
                          <input
                            type="text" value={splitWithInput}
                            onChange={(e) => setSplitWithInput(e.target.value)}
                            onKeyDown={addSplitPerson}
                            placeholder={splitWithList.length === 0 ? "e.g. John" : ""}
                            className="flex-1 min-w-[100px] text-sm px-2 py-1 border-0 focus:ring-0 outline-none bg-transparent"
                          />
                        </div>
                      </div>

                      {splitWithList.length > 0 && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Strategy</label>
                              <select value={splitShare} onChange={(e) => setSplitShare(e.target.value)} className="w-full text-xs font-bold bg-white px-3 py-2.5 rounded-xl border border-slate-200">
                                <option>Equally</option><option>Percentages</option><option>Exact Amounts</option>
                                {itemsList.length > 0 && <option>By Items</option>}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Due Date</label>
                              <input type="date" value={splitDueDate} onChange={(e) => setSplitDueDate(e.target.value)} className="w-full text-xs font-bold bg-white px-3 py-2.5 rounded-xl border border-slate-200" />
                            </div>
                          </div>

                          {splitShare === "By Items" && (
                            <div className="space-y-3">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Assign Portions (e.g. 1/2, 0.5)</p>
                              {itemsList.map((itm, idx) => (
                                <div key={idx} className="bg-white/60 p-3 rounded-xl border border-indigo-100/50 space-y-2">
                                  <div className="flex justify-between text-xs font-bold">
                                    <span>{itm.name}</span>
                                    <span className="text-indigo-600">{itm.qty} {itm.unit}</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    {["You", ...splitWithList].map(person => (
                                      <div key={person} className="flex items-center gap-1 bg-white rounded-lg border border-slate-100 p-1.5">
                                        <span className="text-[9px] font-bold text-slate-400 truncate w-12">{person}</span>
                                        <input
                                          type="text" 
                                          value={(portionAssignments[idx] || {})[person] || ""}
                                          onChange={e => setPortionFor(idx, person, e.target.value)}
                                          className="w-full text-[10px] font-bold bg-transparent border-0 p-0 focus:ring-0 text-right"
                                          placeholder="0"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="bg-white/60 rounded-xl p-3 space-y-3">
                            <div className="flex justify-between items-center px-2 py-1 bg-slate-50/50 rounded-lg">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">You</span>
                              <span className="text-[14px] font-black text-slate-900">₹{calculateYourShare()}</span>
                            </div>
                            {splitWithList.map(person => (
                              <div key={person} className="flex items-center justify-between px-2 pt-2 border-t border-indigo-50">
                                <span className="text-[10px] font-bold text-slate-500">{person}</span>
                                <div className="flex items-center gap-3">
                                  {(splitShare === 'Percentages' || splitShare === 'Exact Amounts') && (
                                    <input
                                      type="number" value={splitValues[person] || ''}
                                      onChange={(e) => setSplitValues({ ...splitValues, [person]: e.target.value })}
                                      className="w-12 text-[10px] font-bold bg-white border border-slate-200 rounded px-1 py-0.5"
                                      placeholder="0"
                                    />
                                  )}
                                  <span className="text-[12px] font-black text-indigo-600">₹{calculateSplit(person)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {viewMode === "detailed" && type === "income" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-4">
                  <div className="space-y-4">
                    {localStorage.getItem('s_subcats') !== 'false' && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sub Category</label>
                        {isCustomSubCat ? (
                          <div className="relative">
                            <input
                              type="text" value={customSubCat} onChange={(e) => setCustomSubCat(e.target.value)}
                              placeholder="Type new category..."
                              className="w-full text-sm font-semibold bg-indigo-50/50 px-3 py-2.5 rounded-xl border border-indigo-200 outline-none"
                            />
                            <button type="button" onClick={() => setIsCustomSubCat(false)} className="absolute right-3 top-2.5 text-indigo-400"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <select
                            value={subCategory} onChange={(e) => e.target.value === 'NEW' ? setIsCustomSubCat(true) : setSubCategory(e.target.value)}
                            className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                          >
                            <option value="">Select...</option>
                            {SUBCATEGORY_MAP[category]?.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                            <option value="NEW" className="text-indigo-600 font-bold">+ Create New...</option>
                          </select>
                        )}
                      </div>
                    )}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Purpose / Short Note</label>
                      <input
                        type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. March Salary"
                        className="w-full text-sm bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-slate-100 bg-white z-10 shrink-0">
          <button
            type="submit"
            form="tx-form"
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Save {type === 'expense' ? 'Expense' : type === 'income' ? 'Income' : 'Transfer'}
          </button>
        </div>
      </div>
    </div>
  );
};
