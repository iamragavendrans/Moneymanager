import React, { useState, useEffect } from "react";
import { X, TrendingUp, Landmark, Coins, Home, Trash2, Plus } from "lucide-react";
import { useFinance } from "../context/FinanceContext";
import { cn } from "../utils";
import { toast } from "sonner";

const CATEGORIES = [
  { id: 'marketLinked', label: 'Stocks/MF', icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
  { id: 'fixedIncome', label: 'FD/RD/PPF', icon: Landmark, color: 'text-indigo-600 bg-indigo-50' },
  { id: 'gold', label: 'Gold/SGB', icon: Coins, color: 'text-amber-600 bg-amber-50' },
  { id: 'realEstate', label: 'Real Estate', icon: Home, color: 'text-emerald-600 bg-emerald-50' },
];

export const InvestmentManagementModal = ({ invId, onClose }: { invId?: string | null; onClose: () => void }) => {
  const { investments, addInvestment, updateInvestment, deleteInvestment } = useFinance();
  const isEdit = !!invId;
  const existingInv = investments.find(i => i.id === invId);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<any>("marketLinked");
  
  // Market Linked fields
  const [units, setUnits] = useState("");
  const [avgNav, setAvgNav] = useState("");
  const [currentNav, setCurrentNav] = useState("");
  const [isSIP, setIsSIP] = useState(false);

  // Fixed Income fields
  const [principal, setPrincipal] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [rate, setRate] = useState("");
  const [maturityDate, setMaturityDate] = useState("");

  // Gold fields
  const [grams, setGrams] = useState("");
  const [avgPrice, setAvgPrice] = useState("");

  // Real Estate fields
  const [propertyValue, setPropertyValue] = useState("");
  const [loanOutstanding, setLoanOutstanding] = useState("");

  useEffect(() => {
    if (existingInv) {
      setName(existingInv.name);
      setCategory(existingInv.category);
      if (existingInv.category === 'marketLinked') {
        setUnits(existingInv.units?.toString() || "");
        setAvgNav(existingInv.avgNav?.toString() || "");
        setCurrentNav(existingInv.currentNav?.toString() || "");
        setIsSIP(!!existingInv.isSIP);
      } else if (existingInv.category === 'fixedIncome') {
        setPrincipal(existingInv.principal?.toString() || "");
        setCurrentValue(existingInv.current?.toString() || "");
        setRate(existingInv.rate?.toString() || "");
        setMaturityDate(existingInv.maturityDate || "");
      } else if (existingInv.category === 'gold') {
        setGrams(existingInv.grams?.toString() || "");
        setAvgPrice(existingInv.avgPrice?.toString() || "");
      } else if (existingInv.category === 'realEstate') {
        setPropertyValue(existingInv.propertyValue?.toString() || "");
        setLoanOutstanding(existingInv.loanOutstanding?.toString() || "");
      }
    }
  }, [existingInv]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const data: any = { name, category };

    if (category === 'marketLinked') {
      data.units = Number(units);
      data.avgNav = Number(avgNav);
      data.currentNav = Number(currentNav);
      data.isSIP = isSIP;
    } else if (category === 'fixedIncome') {
      data.principal = Number(principal);
      data.current = Number(currentValue);
      data.rate = Number(rate);
      data.maturityDate = maturityDate;
    } else if (category === 'gold') {
      data.grams = Number(grams);
      data.avgPrice = Number(avgPrice);
      data.currentPrice = 7250; // Mock current gold price
    } else if (category === 'realEstate') {
      data.propertyValue = Number(propertyValue);
      data.loanOutstanding = Number(loanOutstanding);
    }

    if (isEdit && invId) {
      updateInvestment(invId, data);
      toast.success("Investment updated");
    } else {
      addInvestment(data);
      toast.success("Investment added");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{isEdit ? "Edit Investment" : "New Investment"}</h2>
            <p className="text-xs text-slate-500 font-medium">Track your wealth across asset classes</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm"><X className="w-5 h-5 text-slate-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
          {/* Category Grid */}
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id} type="button"
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                  category === cat.id ? "bg-indigo-600 border-indigo-600 text-white shadow-lg" : "bg-white border-slate-50 text-slate-400 hover:border-indigo-100"
                )}
              >
                <cat.icon className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Investment Name</label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Parag Parikh Flexi Cap, SBI Gold Bond"
                className="w-full text-sm font-semibold bg-slate-50 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none shadow-inner"
              />
            </div>

            {category === 'marketLinked' && (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Units Owned</label>
                  <input type="number" step="0.001" value={units} onChange={e => setUnits(e.target.value)} className="w-full text-sm font-semibold bg-slate-50 px-4 py-3 rounded-xl border-0" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Avg NAV/Price</label>
                  <input type="number" step="0.01" value={avgNav} onChange={e => setAvgNav(e.target.value)} className="w-full text-sm font-semibold bg-slate-50 px-4 py-3 rounded-xl border-0" />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <input type="checkbox" checked={isSIP} onChange={e => setIsSIP(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-sm font-bold text-slate-700">Monthly SIP Enabled</span>
                  </label>
                </div>
              </div>
            )}

            {category === 'fixedIncome' && (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Principal Amount</label>
                  <input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} className="w-full text-sm font-semibold bg-slate-50 px-4 py-3 rounded-xl border-0" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Interest Rate (%)</label>
                  <input type="number" step="0.1" value={rate} onChange={e => setRate(e.target.value)} className="w-full text-sm font-semibold bg-slate-50 px-4 py-3 rounded-xl border-0" />
                </div>
              </div>
            )}

            {category === 'gold' && (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Grams Owned</label>
                  <input type="number" step="0.001" value={grams} onChange={e => setGrams(e.target.value)} className="w-full text-sm font-semibold bg-slate-50 px-4 py-3 rounded-xl border-0" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Avg Purchase Price</label>
                  <input type="number" value={avgPrice} onChange={e => setAvgPrice(e.target.value)} className="w-full text-sm font-semibold bg-slate-50 px-4 py-3 rounded-xl border-0" />
                </div>
              </div>
            )}
          </div>
        </form>

        <div className="p-4 bg-slate-50 flex items-center justify-between gap-3">
          {isEdit && (
            <button
              type="button"
              onClick={() => { if(confirm("Delete this investment?")) { deleteInvestment(invId); onClose(); } }}
              className="p-3.5 text-red-500 bg-white border border-red-100 rounded-xl hover:bg-red-50 transition-all shadow-sm"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={handleSubmit}
            className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2"
          >
            {isEdit ? "Update" : "Add"} Investment
          </button>
        </div>
      </div>
    </div>
  );
};
