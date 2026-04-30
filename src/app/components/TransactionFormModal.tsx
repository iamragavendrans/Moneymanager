import React, { useState } from "react";
import { format } from "date-fns";
import { X, ArrowDownRight, ArrowUpRight, ArrowRightLeft, ChevronDown, ChevronUp, MapPin, Tag, Users } from "lucide-react";
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
  const [purpose, setPurpose] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [needWant, setNeedWant] = useState<"need" | "want" | "investment">("need");
  const [forWhom, setForWhom] = useState<"self" | "family" | "friends" | "others">("self");
  const [mode, setMode] = useState<"upi" | "card" | "cash" | "netbanking">("upi");
  const [isSplit, setIsSplit] = useState(false);
  const [notes, setNotes] = useState("");
  
  // Category Specific Dynamic Fields
  const [travelFrom, setTravelFrom] = useState("");
  const [travelTo, setTravelTo] = useState("");

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
        setMode(tx.mode as any || "upi");
        setNotes(tx.notes);
        if (tx.notes || tx.mode) setViewMode("detailed");
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
      if (purpose) extras.push(`Purpose: ${purpose}`);
      if (category === "Transport" && travelFrom && travelTo) {
         extras.push(`Route: ${travelFrom} to ${travelTo}`);
      }
      if (isSplit) extras.push(`[Split Transaction]`);
      
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
      tags: [needWant, forWhom],
      mode: mode,
      status: "cleared" as const
    };

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
            {/* Amount - BIG */}
            <div className="relative flex items-center justify-center bg-white border border-indigo-100 rounded-2xl p-4 shadow-sm focus-within:ring-2 focus-within:ring-indigo-600 focus-within:border-transparent transition-all">
               <span className="text-3xl font-bold text-slate-400 mr-2">₹</span>
               <input
                 type="number" inputMode="decimal" step="0.01" autoFocus required
                 value={amount} onChange={(e) => setAmount(e.target.value)}
                 className="w-full text-4xl font-black text-slate-900 bg-transparent border-0 p-0 focus:ring-0 outline-none placeholder:text-slate-300"
                 placeholder="0"
               />
            </div>

            {/* Core Normal View Fields */}
            <div className="bg-white rounded-2xl p-4 space-y-4 border border-slate-100 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">From Account <span className="text-red-400">*</span></label>
                  <select
                    value={accountId} onChange={(e) => setAccountId(e.target.value)}
                    className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none appearance-none"
                  >
                    {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                {type === "transfer" ? (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">To Account <span className="text-red-400">*</span></label>
                    <select
                      value={toAccountId} onChange={(e) => setToAccountId(e.target.value)}
                      className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none appearance-none"
                    >
                      {accounts.map((a) => <option key={`to-${a.id}`} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category <span className="text-red-400">*</span></label>
                    <select
                      value={category} onChange={(e) => setCategory(e.target.value)}
                      className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none appearance-none"
                    >
                      {categories[type].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {type !== ("transfer" as any) && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Payee / Shop <span className="text-red-400">*</span></label>
                  <input
                    type="text" value={payee} onChange={(e) => setPayee(e.target.value)} required={type !== ("transfer" as any)}
                    placeholder="e.g. Swiggy, Amazon, Salary"
                    className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
              )}
            </div>

            {/* View Toggle */}
            <button 
              type="button" 
              onClick={() => setViewMode(v => v === "normal" ? "detailed" : "normal")}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50/50 rounded-xl transition-colors"
            >
              {viewMode === "normal" ? (
                <><ChevronDown className="w-4 h-4" /> Show Detailed Options</>
              ) : (
                <><ChevronUp className="w-4 h-4" /> Hide Detailed Options</>
              )}
            </button>

            {/* Detailed View Fields */}
            {viewMode === "detailed" && (
              <div className="bg-white rounded-2xl p-4 space-y-5 border border-slate-100 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Purpose / Short Note</label>
                  <input
                    type="text" value={purpose} onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g. Lunch with team"
                    className="w-full text-sm bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date</label>
                    <input
                      type="date" value={date} onChange={(e) => setDate(e.target.value)}
                      className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Mode</label>
                    <select
                      value={mode} onChange={(e) => setMode(e.target.value as any)}
                      className="w-full text-sm font-semibold bg-slate-50 px-3 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none appearance-none"
                    >
                      <option value="upi">UPI</option>
                      <option value="card">Card</option>
                      <option value="cash">Cash</option>
                      <option value="netbanking">NetBanking</option>
                    </select>
                  </div>
                </div>

                {type === "expense" && (
                  <>
                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Classification</p>
                      
                      <div className="flex gap-2">
                        {(["need", "want", "investment"] as const).map(nw => (
                           <button type="button" key={nw} onClick={() => setNeedWant(nw)} className={cn("flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize border transition-colors", needWant === nw ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm" : "bg-white border-slate-200 text-slate-500")}>
                             {nw}
                           </button>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        {(["self", "family", "friends", "others"] as const).map(fw => (
                           <button type="button" key={fw} onClick={() => setForWhom(fw)} className={cn("flex-1 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider border transition-colors", forWhom === fw ? "bg-slate-800 border-slate-800 text-white shadow-sm" : "bg-white border-slate-200 text-slate-500")}>
                             {fw}
                           </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Dynamic Fields */}
                {category === "Transport" && (
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">From Location</label>
                      <input type="text" value={travelFrom} onChange={e => setTravelFrom(e.target.value)} className="w-full text-sm bg-slate-50 px-3 py-2 rounded-lg border-0 focus:ring-2 focus:ring-indigo-600 outline-none"/>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">To Location</label>
                      <input type="text" value={travelTo} onChange={e => setTravelTo(e.target.value)} className="w-full text-sm bg-slate-50 px-3 py-2 rounded-lg border-0 focus:ring-2 focus:ring-indigo-600 outline-none"/>
                    </div>
                  </div>
                )}

                {/* Split Logic Engine */}
                <div className="pt-3 border-t border-slate-100">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                       <Users className="w-4 h-4 text-slate-400" />
                       Split Expense? (Khata)
                     </div>
                     <button type="button" onClick={() => setIsSplit(!isSplit)} className={cn("w-10 h-6 rounded-full transition-colors relative", isSplit ? "bg-indigo-600" : "bg-slate-200")}>
                       <span className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm", isSplit ? "left-5" : "left-1")} />
                     </button>
                   </div>
                   {isSplit && (
                     <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                       <p className="text-xs text-indigo-700 font-medium">Split functionality activated. Post-save, you'll select people and distribution ratios.</p>
                     </div>
                   )}
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
