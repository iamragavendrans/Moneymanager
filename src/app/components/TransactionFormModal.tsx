import React, { useState } from "react";
import { format } from "date-fns";
import { X, ArrowDownRight, ArrowUpRight, ArrowRightLeft, ChevronDown, ChevronUp, MapPin, Tag, Users, Calendar, Plus } from "lucide-react";
import { cn } from "../utils";
import { useFinance, TransactionType } from "../context/FinanceContext";

const categories = {
  expense: ["Food", "Transport", "Shopping", "Bills", "Groceries", "Entertainment", "Health", "Other"],
  income: ["Salary", "Freelance", "Investment", "Gift", "Other"],
  transfer: ["Transfer"],
};

export const TransactionFormModal: React.FC<{ onClose: () => void, txId?: string }> = ({ onClose, txId }) => {
  const { accounts, addTransaction, updateTransaction, transactions } = useFinance();
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
  const [items, setItems] = useState("");
  const [tags, setTags] = useState("");
  const [subCategory, setSubCategory] = useState("");
  
  // Inventory Items
  const [itemInput, setItemInput] = useState("");
  const [itemQty, setItemQty] = useState("1");
  const [itemUnit, setItemUnit] = useState("pcs");
  const [itemsList, setItemsList] = useState<{name: string, qty: string, unit: string}[]>([]);

  // Split details
  const [splitWithInput, setSplitWithInput] = useState("");
  const [splitWithList, setSplitWithList] = useState<string[]>([]);
  const [splitShare, setSplitShare] = useState("Equally");
  const [splitDueDate, setSplitDueDate] = useState("");

  // Category Specific Dynamic Fields
  const [travelFrom, setTravelFrom] = useState("");
  const [travelTo, setTravelTo] = useState("");

  const addItem = () => {
    if (itemInput.trim()) {
      setItemsList([...itemsList, { name: itemInput.trim(), qty: itemQty, unit: itemUnit }]);
      setItemInput("");
      setItemQty("1");
    }
  };
  const removeItem = (idx: number) => setItemsList(itemsList.filter((_, i) => i !== idx));

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
    setCategory(categories[newType][0]);
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
        
        // Parse tags
        const needWantTags = ["need", "want", "investment", "discretionary"];
        const forWhomTags = ["self", "family", "friends", "others"];
        
        const nw = tx.tags.find(t => needWantTags.includes(t)) as any;
        if (nw) setNeedWant(nw);
        
        const fw = tx.tags.filter(t => forWhomTags.includes(t));
        if (fw.length > 0) setForWhom(fw);
        
        const otherTags = tx.tags.filter(t => !needWantTags.includes(t) && !forWhomTags.includes(t));
        setTags(otherTags.join(", "));

        if (tx.notes || tx.items?.length || tx.split || tx.tags.length > 0 || tx.subCategory) {
          setViewMode("detailed");
        }
      }
    }
  }, [txId, transactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    // Build notes string from dynamic fields if detailed
    let finalNotes = notes;
    if (viewMode === "detailed") {
      const extras = [];
      if (category === "Transport" && travelFrom && travelTo) {
        const routeStr = `Route: ${travelFrom} to ${travelTo}`;
        if (!notes.includes(routeStr)) extras.push(routeStr);
      }
      if (isSplit && !notes.includes("[Split Transaction]")) {
        extras.push(`[Split Transaction]`);
      }

      if (extras.length > 0) {
        finalNotes = extras.join(" | ") + (notes ? `\n${notes}` : "");
      }
    }

    const txData: any = {
      amount: Number(amount),
      type,
      category: type === 'transfer' ? 'Transfer' : category,
      account_id: accountId,
      payee: payee || (type === "transfer" ? "Self Transfer" : "Unknown"),
      date,
      notes: finalNotes,
      tags: [needWant, ...forWhom, ...(tags.split(',').map(t=>t.trim()).filter(Boolean))],
      mode: mode,
      status: "cleared" as const,
      subCategory: subCategory || undefined,
      items: itemsList.length > 0 ? itemsList : undefined,
    };

    if (isSplit && splitWithList.length > 0) {
      txData.split = {
        with: splitWithList,
        shareStrategy: splitShare,
        dueDate: splitDueDate
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
                <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors">
                  <Calendar className="w-6 h-6" />
                  <input
                    type="date" value={date} onChange={(e) => setDate(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Type Specific Basic Fields */}
            {type === "transfer" && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">From Account <span className="text-red-400">*</span></label>
                    <select
                      value={accountId} onChange={(e) => setAccountId(e.target.value)}
                      className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none appearance-none"
                    >
                      {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">To Account <span className="text-red-400">*</span></label>
                    <select
                      value={toAccountId} onChange={(e) => setToAccountId(e.target.value)}
                      className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none appearance-none"
                    >
                      {accounts.map((a) => <option key={`to-${a.id}`} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {type === "income" && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">To Account <span className="text-red-400">*</span></label>
                  <select
                    value={accountId} onChange={(e) => setAccountId(e.target.value)}
                    className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none appearance-none"
                  >
                    {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Stream <span className="text-red-400">*</span></label>
                    <select
                      value={category} onChange={(e) => setCategory(e.target.value)}
                      className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none appearance-none"
                    >
                      {categories.income.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Payee <span className="text-red-400">*</span></label>
                    <input
                      type="text" value={payee} onChange={(e) => setPayee(e.target.value)} required={type === "income"}
                      placeholder="e.g. Acme Corp"
                      className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {type === "expense" && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">From Account <span className="text-red-400">*</span></label>
                    <select
                      value={accountId} onChange={(e) => setAccountId(e.target.value)}
                      className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none appearance-none"
                    >
                      {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category <span className="text-red-400">*</span></label>
                    <select
                      value={category} onChange={(e) => setCategory(e.target.value)}
                      className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none appearance-none"
                    >
                      {categories.expense.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Payee / Shop <span className="text-red-400">*</span></label>
                  <input
                    type="text" value={payee} onChange={(e) => setPayee(e.target.value)} required={type === "expense"}
                    placeholder="e.g. Amazon, Starbucks"
                    className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
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
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Purpose / Short Note</label>
                    <input
                      type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Lunch with team"
                      className="w-full text-sm bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sub Category</label>
                      <input
                        type="text" value={subCategory} onChange={(e) => setSubCategory(e.target.value)}
                        placeholder="e.g. Groceries"
                        className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tags</label>
                      <input
                        type="text" value={tags} onChange={(e) => setTags(e.target.value)}
                        placeholder="e.g. goa, team"
                        className="w-full text-sm bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                      />
                    </div>
                  </div>
                  
                  {/* Items Inventory */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Items</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text" value={itemInput} onChange={(e) => setItemInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
                        placeholder="Add new item (e.g. Grapes)"
                        className="w-full sm:flex-1 text-sm bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                      />
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input
                          type="number" value={itemQty} onChange={(e) => setItemQty(e.target.value)}
                          className="w-20 sm:w-16 text-sm bg-slate-50 px-2 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none text-center"
                        />
                        <select
                          value={itemUnit} onChange={(e) => setItemUnit(e.target.value)}
                          className="flex-1 sm:w-20 text-sm bg-slate-50 px-2 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none appearance-none"
                        >
                          <option>pcs</option>
                          <option>g</option>
                          <option>kg</option>
                          <option>ml</option>
                          <option>L</option>
                        </select>
                        <button type="button" onClick={addItem} className="w-12 sm:w-10 h-[40px] flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-200 transition-colors shrink-0">
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    {itemsList.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {itemsList.map((itm, i) => (
                          <div key={i} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                            <span className="text-sm font-medium text-slate-700">{itm.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-100">{itm.qty} {itm.unit}</span>
                              <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 3: Classification */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Classification</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(["self", "family", "friends", "others"] as const).map(fw => (
                      <button type="button" key={fw} onClick={() => toggleForWhom(fw)} className={cn("flex-1 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider border transition-colors", forWhom.includes(fw) ? "bg-slate-800 border-slate-800 text-white shadow-sm" : "bg-white border-slate-200 text-slate-500")}>
                        {fw}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {(["need", "want", "investment", "discretionary"] as const).map(nw => (
                      <button type="button" key={nw} onClick={() => setNeedWant(nw)} className={cn("py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider border transition-colors", needWant === nw ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm" : "bg-white border-slate-200 text-slate-500")}>
                        {nw}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section 4: Split Logic Engine */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Users className="w-4 h-4 text-slate-400" />
                      Split Expense
                    </div>
                    <button type="button" onClick={() => setIsSplit(!isSplit)} className={cn("w-10 h-6 rounded-full transition-colors relative", isSplit ? "bg-indigo-600" : "bg-slate-200")}>
                      <span className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm", isSplit ? "left-5" : "left-1")} />
                    </button>
                  </div>
                  
                  {isSplit && (
                    <div className="space-y-4 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">With (Press Enter to add)</label>
                        <div className="bg-white border border-slate-200 rounded-xl p-1.5 flex flex-wrap gap-1.5 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600">
                          {splitWithList.map(person => (
                            <span key={person} className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-1 rounded-lg">
                              {person}
                              <button type="button" onClick={() => removeSplitPerson(person)} className="hover:text-indigo-900"><X className="w-3 h-3" /></button>
                            </span>
                          ))}
                          <input
                            type="text" value={splitWithInput} 
                            onChange={(e) => setSplitWithInput(e.target.value)}
                            onKeyDown={addSplitPerson}
                            placeholder={splitWithList.length === 0 ? "e.g. John" : ""}
                            className="flex-1 min-w-[80px] text-sm px-2 py-1 border-0 focus:ring-0 outline-none bg-transparent"
                          />
                        </div>
                      </div>

                      {splitWithList.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Share Strategy</label>
                            <select
                              value={splitShare} onChange={(e) => setSplitShare(e.target.value)}
                              className="w-full text-sm bg-white px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none appearance-none"
                            >
                              <option>Equally</option>
                              <option>Percentages</option>
                              <option>Exact Amounts</option>
                              <option>Custom Split</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Due Date</label>
                            <input
                              type="date" value={splitDueDate} onChange={(e) => setSplitDueDate(e.target.value)}
                              className="w-full text-sm bg-white px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none"
                            />
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
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Purpose / Short Note</label>
                  <input
                    type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. March Salary"
                    className="w-full text-sm bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tags</label>
                  <input
                    type="text" value={tags} onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g. bonus, q1"
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
