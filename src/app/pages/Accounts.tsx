import React, { useState } from "react";
import { Plus, Building2, CreditCard, Wallet, Smartphone, Banknote, TrendingUp, Utensils, PiggyBank, HandCoins } from "lucide-react";
import { useFinance, Account } from "../context/FinanceContext";
import { formatINR } from "../utils";

const AccountIcon = ({ type }: { type: Account["type"] }) => {
  switch (type) {
    case "bank": return <Building2 className="w-6 h-6" />;
    case "credit_card": return <CreditCard className="w-6 h-6" />;
    case "wallet": return <Wallet className="w-6 h-6" />;
    case "upi": return <Smartphone className="w-6 h-6" />;
    case "cash": return <Banknote className="w-6 h-6" />;
    case "investment": return <TrendingUp className="w-6 h-6" />;
    case "meal_card": return <Utensils className="w-6 h-6" />;
    case "pf": return <PiggyBank className="w-6 h-6" />;
    case "loan": return <HandCoins className="w-6 h-6" />;
    default: return <Wallet className="w-6 h-6" />;
  }
};

export const Accounts = () => {
  const { accounts, addAccount, getNetWorth } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [newAcc, setNewAcc] = useState({ name: "", type: "bank" as Account["type"], balance: "" });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAcc.name || isNaN(Number(newAcc.balance))) return;
    addAccount({
      name: newAcc.name,
      type: newAcc.type,
      balance: Number(newAcc.balance),
      currency: "INR"
    });
    setIsAdding(false);
    setNewAcc({ name: "", type: "bank", balance: "" });
  };

  const totalAssets = accounts.filter(a => a.balance >= 0).reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = accounts.filter(a => a.balance < 0).reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-indigo-600 text-white rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <p className="text-indigo-200 font-medium">Total Net Worth</p>
          <h3 className="text-2xl font-bold">{formatINR(getNetWorth())}</h3>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <p className="text-slate-500 font-medium">Total Assets</p>
          <h3 className="text-xl font-bold text-slate-800">{formatINR(totalAssets)}</h3>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <p className="text-slate-500 font-medium">Total Liabilities</p>
          <h3 className="text-xl font-bold text-red-600">{formatINR(Math.abs(totalLiabilities))}</h3>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 mb-4">
        <h2 className="text-xl font-bold text-slate-800">Your Accounts</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Account
        </button>
      </div>

      {isAdding && (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6 relative overflow-hidden">
          <h3 className="font-bold text-slate-800 mb-4">Add New Account</h3>
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              placeholder="Account Name (e.g. SBI Savings)" 
              required
              value={newAcc.name}
              onChange={e => setNewAcc({...newAcc, name: e.target.value})}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none"
            />
            <select 
              value={newAcc.type}
              onChange={e => setNewAcc({...newAcc, type: e.target.value as Account["type"]})}
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none bg-white"
            >
              <option value="bank">Bank Account</option>
              <option value="upi">UPI App (GPay, PhonePe)</option>
              <option value="cash">Physical Cash</option>
              <option value="credit_card">Credit Card</option>
              <option value="wallet">Digital Wallet</option>
              <option value="investment">Stocks / Mutual Funds</option>
              <option value="pf">PF / NPS / PPF</option>
              <option value="meal_card">Sodexo / Meal Card</option>
              <option value="loan">Loan / Debt</option>
            </select>
            <input 
              type="number" 
              placeholder="Initial Balance" 
              required
              value={newAcc.balance}
              onChange={e => setNewAcc({...newAcc, balance: e.target.value})}
              className="w-full sm:w-40 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none"
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2.5 text-slate-500 font-semibold hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
              <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors">Save</button>
            </div>
          </form>
        </div>
      )}

      {/* Accounts List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0">
                <AccountIcon type={acc.type} />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-lg leading-tight">{acc.name}</p>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {acc.type.replace('_', ' ')}
                </span>
              </div>
            </div>
            <div className={`text-xl font-bold tracking-tight text-right ${acc.balance < 0 ? 'text-red-600' : 'text-slate-800'}`}>
              {formatINR(acc.balance)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
