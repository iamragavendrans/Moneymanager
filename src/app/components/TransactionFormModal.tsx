import React, { useState } from "react";
import { format } from "date-fns";
import { X, ArrowDownRight, ArrowUpRight, ArrowRightLeft, CreditCard, Banknote } from "lucide-react";
import { cn } from "../utils";
import { useFinance, TransactionType } from "../context/FinanceContext";

const categories = {
  expense: ["Food", "Transport", "Shopping", "Bills", "Groceries", "Entertainment", "Health", "Other"],
  income: ["Salary", "Freelance", "Investment", "Gift", "Other"],
  transfer: ["Transfer"],
};

export const TransactionFormModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { accounts, addTransaction } = useFinance();
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories.expense[0]);
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [toAccountId, setToAccountId] = useState(accounts.length > 1 ? accounts[1].id : "");
  const [payee, setPayee] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = useState("");

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(categories[newType][0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    addTransaction({
      amount: Number(amount),
      type,
      category,
      account_id: accountId,
      to_account_id: type === "transfer" ? toAccountId : undefined,
      payee: payee || (type === "transfer" ? "Self Transfer" : "Unknown"),
      date,
      notes,
      tags: [],
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm sm:p-0">
      <div 
        className="fixed inset-0 sm:hidden" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">New Entry</h3>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5">
          {/* Type Selector */}
          <div className="flex p-1 mb-6 bg-slate-100 rounded-xl">
            {(["expense", "income", "transfer"] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-semibold capitalize transition-all",
                  type === t 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {t === "expense" && <ArrowDownRight className="w-4 h-4 text-red-500" />}
                {t === "income" && <ArrowUpRight className="w-4 h-4 text-emerald-500" />}
                {t === "transfer" && <ArrowRightLeft className="w-4 h-4 text-blue-500" />}
                {t}
              </button>
            ))}
          </div>

          <form id="tx-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  autoFocus
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-2xl font-bold bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Payee / Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                {type === "transfer" ? "Description" : "Payee / Merchant"}
              </label>
              <input
                type="text"
                value={payee}
                onChange={(e) => setPayee(e.target.value)}
                required={type !== "transfer"}
                placeholder={type === "expense" ? "e.g. Swiggy, Uber" : "e.g. Salary, Client"}
                className="w-full px-4 py-2.5 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              {type !== "transfer" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all outline-none appearance-none"
                  >
                    {categories[type].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date */}
              <div className={cn(type === "transfer" && "col-span-2")}>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>

            {/* Accounts */}
            <div className={cn("grid gap-4", type === "transfer" ? "grid-cols-2" : "grid-cols-1")}>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                  {type === "transfer" ? "From Account" : "Account"}
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all outline-none appearance-none"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} (₹{a.balance})</option>
                  ))}
                </select>
              </div>

              {type === "transfer" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">To Account</label>
                  <select
                    value={toAccountId}
                    onChange={(e) => setToAccountId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all outline-none appearance-none"
                  >
                    {accounts.filter(a => a.id !== accountId).map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

          </form>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <button
            type="submit"
            form="tx-form"
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors shadow-sm active:scale-[0.98]"
          >
            Save Transaction
          </button>
        </div>
      </div>
    </div>
  );
};
