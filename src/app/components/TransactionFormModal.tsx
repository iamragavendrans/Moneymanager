import React, { useState } from "react";
import { format } from "date-fns";
import { X, ArrowDownRight, ArrowUpRight, ArrowRightLeft, ChevronDown, ChevronUp, MapPin, Tag, Users, Calendar, Plus } from "lucide-react";
import { cn } from "../utils";
import { useFinance, TransactionType } from "../context/FinanceContext";

const subCategoryMapping: Record<string, string[]> = {
  Food: ["Groceries", "Dining Out", "Street Food", "Zomato/Swiggy", "Coffee", "Alcohol"],
  Transport: ["Fuel", "Uber/Ola", "Public Transport", "Service/Repairs", "Parking"],
  Shopping: ["Electronics", "Clothing", "Home Decor", "Gifts", "Personal Care"],
  Bills: ["Electricity", "Water", "Gas", "Internet", "Mobile", "DTH"],
  Entertainment: ["Movies", "Gaming", "Streaming", "Events"],
  Health: ["Medicine", "Doctor", "Gym", "Insurance"],
  Housing: ["Rent", "Maintenance", "Furniture", "Domestic Help"],
  Investment: ["Stocks", "Mutual Funds", "Gold", "Crypto"],
  Education: ["Course Fee", "Books", "Stationery"],
  Travel: ["Flights", "Hotels", "Sightseeing"],
  Salary: ["Base Pay", "Bonus", "RSU/Stocks"],
};

const categories = {
  expense: ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Housing", "Investment", "Education", "Travel", "Others"],
  income: ["Salary", "Freelance", "Investment", "Gift", "Others"]
};

export const TransactionFormModal: React.FC<{ onClose: () => void, txId?: string }> = ({ onClose, txId }) => {
  const { accounts, addTransaction, updateTransaction, transactions, profile } = useFinance();
  const [viewMode, setViewMode] = useState<"normal" | "detailed">("normal");

  // Basic Fields
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || accounts[0]?.id || "");
  const [payee, setPayee] = useState("");
  const [category, setCategory] = useState(categories.expense[0]);

  // Detailed Fields
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [needWant, setNeedWant] = useState<"need" | "want" | "investment" | "discretionary">("need");
  const [forWhom, setForWhom] = useState<string[]>(["self"]);
  const [mode, setMode] = useState<"UPI" | "card" | "cash" | "netbanking">("UPI");
  const [isSplit, setIsSplit] = useState(false);
  const [notes, setNotes] = useState("");
  const [subCategory, setSubCategory] = useState("");
  
  // Inventory Items
  const [itemInput, setItemInput] = useState("");
  const [itemQty, setItemQty] = useState("1");
  const [itemUnit, setItemUnit] = useState("pcs");
  const [itemPrice, setItemPrice] = useState("");
  const [itemsList, setItemsList] = useState<{name: string, qty: string, unit: string, price?: number}[]>([]);

  // Tags
  const [tagInput, setTagInput] = useState("");
  const [tagsList, setTagsList] = useState<string[]>([]);

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

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tagsList.includes(newTag)) {
        setTagsList([...tagsList, newTag]);
      }
      setTagInput("");
    }
  };
  const removeTag = (tag: string) => setTagsList(tagsList.filter(t => t !== tag));

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

  const toggleForWhom = (val: string) => {
    setForWhom(prev => 
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    );
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setIsCustomSubCat(false);
    setCustomSubCat("");
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
    if (type === 'income' && newCat === 'Salary') {
      setPayee(profile.companyName);
    }
    setSubCategory("");
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
        
        if (tx.items) setItemsList(tx.items);
        if (tx.split) {
          setIsSplit(true);
          setSplitWithList(tx.split.with || []);
          setSplitShare(tx.split.shareStrategy || "Equally");
          setSplitDueDate(tx.split.dueDate || "");
        }
        
        const needWantTags = ["need", "want", "investment", "discretionary"];
        const forWhomTags = ["self", "family", "friends", "others"];
        
        const nw = tx.tags.find(t => needWantTags.includes(t)) as any;
        if (nw) setNeedWant(nw);
        
        const fw = tx.tags.filter(t => forWhomTags.includes(t));
        if (fw.length > 0) setForWhom(fw);
        
        const otherTags = tx.tags.filter(t => !needWantTags.includes(t) && !forWhomTags.includes(t));
        setTagsList(otherTags);

        if (tx.notes || tx.items?.length || tx.split || tx.tags.length > 0 || tx.subCategory) {
          setViewMode("detailed");
        }
      }
    }
  }, [txId, transactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    const txData: any = {
      amount: Number(amount),
      type,
      category: type === 'transfer' ? 'Transfer' : category,
      account_id: accountId,
      payee: payee || (type === "transfer" ? "Self Transfer" : "Unknown"),
      date,
      notes,
      tags: [needWant, ...forWhom, ...tagsList],
      mode: mode,
      status: "cleared" as const,
      subCategory: isCustomSubCat ? customSubCat : (subCategory || undefined),
      items: itemsList.length > 0 ? itemsList : undefined,
    };

    if (isSplit && splitWithList.length > 0) {
      txData.split = {
        with: splitWithList,
        shareStrategy: splitShare,
        dueDate: splitDueDate,
        shares: splitShare !== 'Equally' ? splitValues : undefined
      };
    }

    if (type === 'transfer') {
      txData.to_account_id = toAccountId;
    }

    if (txId) {
      updateTransaction(txId, txData);
    } else {
      addTransaction(txData);
    }

    onClose();
  };

  const calculateSplit = (personName?: string): string => {
    const total = Number(amount) || itemsTotal;
    const participants = 1 + splitWithList.length;

    if (splitShare === "Equally") {
      return (total / participants).toFixed(2);
    }

    if (splitShare === "By Items") {
      let sum = 0;
      itemsList.forEach((itm, idx) => {
        const assigned = itemAssignments[idx] || [];
        if (assigned.length === 0) return; // Unassigned items don't count toward anyone yet? 
        // Or should unassigned items be shared equally? User said "calculate exactly" so maybe unassigned is 0.
        const target = personName || "You";
        if (assigned.includes(target)) {
          sum += (itm.price || 0) / assigned.length;
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm sm:p-4">
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
            {(["expense", "income", "transfer"] as TransactionType[]).map((t) => (
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
            
            {/* ROW 1: Amount & Date Icon */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
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
                <label className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all cursor-pointer group">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Date</span>
                    <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{format(new Date(date), "MMM dd")}</span>
                  </div>
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date" value={date} onChange={(e) => setDate(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Type Specific Basic Fields */}
            {type === "transfer" && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">From</label>
                    <select
                      value={accountId} onChange={(e) => setAccountId(e.target.value)}
                      className="w-full text-sm font-bold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none appearance-none"
                    >
                      {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div className="mt-5 text-slate-300">
                    <ArrowRightLeft className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">To</label>
                    <select
                      value={toAccountId} onChange={(e) => setToAccountId(e.target.value)}
                      className="w-full text-sm font-bold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none appearance-none"
                    >
                      {accounts.map((a) => <option key={`to-${a.id}`} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {type === "income" && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Account</label>
                    <select
                      value={accountId} onChange={(e) => setAccountId(e.target.value)}
                      className="w-full text-sm font-bold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none appearance-none"
                    >
                      {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Stream</label>
                    <select
                      value={category} onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full text-sm font-bold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none appearance-none"
                    >
                      {categories.income.map((c: string) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Payee</label>
                  <input
                    type="text" value={payee} onChange={(e) => setPayee(e.target.value)} required
                    placeholder="e.g. Acme Corp"
                    className="w-full text-sm font-bold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
              </div>
            )}

            {type === "expense" && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Account</label>
                    <select
                      value={accountId} onChange={(e) => setAccountId(e.target.value)}
                      className="w-full text-sm font-bold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none appearance-none"
                    >
                      {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                    <select
                      value={category} onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full text-sm font-bold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none appearance-none"
                    >
                      {categories.expense.map((c: string) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Payee / Shop</label>
                  <input
                    type="text" value={payee} onChange={(e) => setPayee(e.target.value)} required
                    placeholder="e.g. Amazon, Swiggy"
                    className="w-full text-sm font-bold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
              </div>
            )}

            {/* View Toggle */}
            {(type === "expense" || type === "income") && (
              <button
                type="button"
                onClick={() => setViewMode(v => v === "normal" ? "detailed" : "normal")}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 rounded-xl transition-colors"
              >
                {viewMode === "normal" ? (
                  <><ChevronDown className="w-4 h-4" /> Expand Details</>
                ) : (
                  <><ChevronUp className="w-4 h-4" /> Hide Details</>
                )}
              </button>
            )}

            {/* Detailed View Fields */}
            {viewMode === "detailed" && type === "expense" && (
              <div className="bg-white rounded-2xl p-4 space-y-6 border border-slate-100 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                
                {/* Section 2: Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sub Category</label>
                      {isCustomSubCat ? (
                         <div className="relative">
                            <input
                              type="text" value={customSubCat} onChange={(e) => setCustomSubCat(e.target.value)}
                              placeholder="Type new category..."
                              className="w-full text-sm font-semibold bg-indigo-50/50 px-3 py-2.5 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-indigo-600 outline-none shadow-inner"
                            />
                            <button type="button" onClick={() => setIsCustomSubCat(false)} className="absolute right-3 top-2.5 text-indigo-400 hover:text-indigo-600 transition-colors"><X className="w-4 h-4" /></button>
                         </div>
                      ) : (
                        <select
                          value={subCategory} onChange={(e) => e.target.value === 'NEW' ? setIsCustomSubCat(true) : setSubCategory(e.target.value)}
                          className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none appearance-none cursor-pointer"
                        >
                          <option value="">Select...</option>
                          {subCategoryMapping[category]?.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                          <option value="NEW" className="text-indigo-600 font-bold">+ Create New...</option>
                        </select>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tags</label>
                      <input
                        type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={addTag}
                        placeholder="Type & Enter"
                        className="w-full text-sm bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                      />
                    </div>
                  </div>

                  {tagsList.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tagsList.map(tag => (
                         <span key={tag} className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase px-2 py-1 rounded-md">
                           {tag}
                           <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                         </span>
                      ))}
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Purpose / Short Note</label>
                    <input
                      type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Lunch with team"
                      className="w-full text-sm bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                    />
                  </div>
                  
                  {/* Items Inventory */}
                  <div className="space-y-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Items & Inventory</label>
                    <div className="space-y-2">
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
                    </div>
                    
                    {itemsList.length > 0 && (
                      <div className="space-y-2">
                        {itemsList.map((itm, i) => (
                          <div key={i} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-100 shadow-sm">
                            <div className="flex flex-col">
                               <span className="text-sm font-bold text-slate-700">{itm.name}</span>
                               <span className="text-[10px] font-medium text-slate-400">{itm.qty} {itm.unit}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              {itm.price !== undefined && <span className="text-sm font-black text-slate-800">₹{itm.price}</span>}
                              <button type="button" onClick={() => removeItem(i)} className="text-slate-300 hover:text-red-600 transition-colors"><X className="w-4 h-4" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 3: Classification */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
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
                </div>

                {/* Section 4: Split Logic Engine */}
                <div className="pt-4 border-t border-slate-100">
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
                  
                  {!(Number(amount) > 0 || itemsTotal > 0) && (
                    <p className="text-[9px] text-slate-400 italic">Enter an amount or add items to enable split.</p>
                  )}
                  
                  {isSplit && (
                    <div className="space-y-4 p-4 bg-indigo-50/30 border border-indigo-100 rounded-2xl">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">With (Press Enter to add)</label>
                        <div className="bg-white border border-slate-200 rounded-xl p-2 flex flex-wrap gap-2 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                          {splitWithList.map(person => (
                            <span key={person} className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
                              {person}
                              <button type="button" onClick={() => removeSplitPerson(person)} className="hover:text-indigo-200"><X className="w-3.5 h-3.5" /></button>
                            </span>
                          ))}
                          <input
                            type="text" value={splitWithInput} 
                            onChange={(e) => setSplitWithInput(e.target.value)}
                            onKeyDown={addSplitPerson}
                            placeholder={splitWithList.length === 0 ? "e.g. John" : ""}
                            className="flex-1 min-w-[100px] text-sm px-2 py-1 border-0 focus:ring-0 outline-none bg-transparent font-medium"
                          />
                        </div>
                      </div>

                      {splitWithList.length > 0 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                           <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Strategy</label>
                                <select
                                value={splitShare} onChange={(e) => setSplitShare(e.target.value)}
                                className="w-full text-xs font-bold bg-white px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none appearance-none"
                                >
                                <option>Equally</option><option>Percentages</option><option>Exact Amounts</option>
                                {itemsList.length > 0 && <option>By Items</option>}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Due Date</label>
                                <input
                                type="date" value={splitDueDate} onChange={(e) => setSplitDueDate(e.target.value)}
                                className="w-full text-xs font-bold bg-white px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none"
                                />
                            </div>
                           </div>

                            {splitShare === "By Items" && itemsList.length > 0 && (
                               <div className="space-y-4 pt-4 border-t border-indigo-100/30">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Assign Items</p>
                                  {itemsList.map((itm, idx) => (
                                     <div key={idx} className="bg-white/40 p-3 rounded-xl border border-indigo-100/50 space-y-2">
                                        <div className="flex justify-between items-center mb-1">
                                           <span className="text-xs font-bold text-slate-700">{itm.name}</span>
                                           <span className="text-xs font-black text-indigo-600">₹{itm.price || 0}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                           {["You", ...splitWithList].map(p => {
                                              const isAssigned = (itemAssignments[idx] || []).includes(p);
                                              return (
                                                 <button 
                                                   key={p} type="button"
                                                   onClick={() => {
                                                      const current = itemAssignments[idx] || [];
                                                      const next = current.includes(p) ? current.filter(x => x !== p) : [...current, p];
                                                      setItemAssignments({...itemAssignments, [idx]: next});
                                                   }}
                                                   className={cn("px-2.5 py-1 text-[9px] font-bold rounded-lg border transition-all", isAssigned ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-200 text-slate-400 hover:border-indigo-300")}
                                                 >
                                                   {p}
                                                 </button>
                                              );
                                           })}
                                        </div>
                                     </div>
                                  ))}
                               </div>
                            )}

                           <div className="bg-white/60 rounded-xl p-3 space-y-4 border border-indigo-100/50">
                              <div className="flex justify-between items-center px-2 py-1 bg-slate-50/50 rounded-lg">
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">You</span>
                                 <span className="text-[14px] font-black text-slate-900">₹{calculateYourShare()}</span>
                              </div>
                              {splitWithList.map(person => (
                                 <div key={person} className="pt-3 border-t border-indigo-100/30 flex items-center gap-4">
                                    <div className="min-w-[70px]">
                                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{person}</p>
                                    </div>
                                    
                                    {splitShare !== 'Equally' ? (
                                       <div className="flex-1 flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                                          <span className="text-[10px] font-bold text-slate-400">{splitShare === 'Percentages' ? '%' : '₹'}</span>
                                          <input
                                             type="number"
                                             value={splitValues[person] || ''}
                                             onChange={(e) => setSplitValues({...splitValues, [person]: e.target.value})}
                                             placeholder="0"
                                             className="w-full text-xs font-bold border-0 p-0 focus:ring-0 outline-none placeholder:text-slate-200"
                                          />
                                       </div>
                                    ) : (
                                       <div className="flex-1 text-[10px] font-bold text-slate-300 italic">Equal Share</div>
                                    )}

                                    <div className="text-right min-w-[80px]">
                                       <p className="text-[13px] font-black text-indigo-600">₹{calculateSplit(person)}</p>
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
              <div className="bg-white rounded-2xl p-4 space-y-6 border border-slate-100 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sub Category</label>
                      {isCustomSubCat ? (
                         <div className="relative">
                            <input
                              type="text" value={customSubCat} onChange={(e) => setCustomSubCat(e.target.value)}
                              placeholder="Type new category..."
                              className="w-full text-sm font-semibold bg-indigo-50/50 px-3 py-2.5 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-indigo-600 outline-none shadow-inner"
                            />
                            <button type="button" onClick={() => setIsCustomSubCat(false)} className="absolute right-3 top-2.5 text-indigo-400 hover:text-indigo-600 transition-colors"><X className="w-4 h-4" /></button>
                         </div>
                      ) : (
                        <select
                          value={subCategory} onChange={(e) => e.target.value === 'NEW' ? setIsCustomSubCat(true) : setSubCategory(e.target.value)}
                          className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none appearance-none cursor-pointer"
                        >
                          <option value="">Select...</option>
                          {subCategoryMapping[category]?.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                          <option value="NEW" className="text-indigo-600 font-bold">+ Create New...</option>
                        </select>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tags</label>
                      <input
                        type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={addTag}
                        placeholder="Type & Enter"
                        className="w-full text-sm bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                      />
                    </div>
                  </div>
                
                {tagsList.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tagsList.map(tag => (
                         <span key={tag} className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase px-2 py-1 rounded-md">
                           {tag}
                           <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                         </span>
                      ))}
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
