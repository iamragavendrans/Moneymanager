import React, { useMemo } from "react";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Landmark, Coins, Home, Plus, Info, Clock } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatINR, cn } from "../utils";
import { differenceInDays, parseISO, format } from "date-fns";
import { useFinance } from "../context/FinanceContext";
import { InvestmentManagementModal } from "../components/InvestmentManagementModal";

// Default seed data used when context investments list is empty
const defaultInvestments = {
  marketLinked: [
    { id: '1', name: "Parag Parikh Flexi Cap", units: 1540.5, avgNav: 45.2, currentNav: 68.4, isSIP: true },
    { id: '2', name: "UTI Nifty 50 Index Fund", units: 250, avgNav: 150.0, currentNav: 215.5, isSIP: true },
    { id: '3', name: "HDFC Bank (Direct Equity)", units: 50, avgNav: 1450.0, currentNav: 1410.0, isSIP: false },
  ],
  fixedIncome: [
    { id: '1', name: "SBI Tax Saver FD (80C)", principal: 150000, current: 172000, rate: 7.1, startDate: "2023-04-01", maturityDate: "2028-04-01" },
    { id: '2', name: "EPF (Provident Fund)", principal: 850000, current: 980000, rate: 8.15, startDate: "2019-06-01", maturityDate: "2050-01-01" },
  ],
  gold: [
    { id: '1', name: "Sovereign Gold Bond 2023", grams: 50, avgPrice: 5923, currentPrice: 7250 },
    { id: '2', name: "Digital Gold (PhonePe)", grams: 12.5, avgPrice: 6100, currentPrice: 7100 },
  ],
  realEstate: [
    { id: '1', name: "2BHK Apartment, Bangalore", propertyValue: 8500000, loanOutstanding: 6200000 },
  ]
};

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1'];

export const Investments = () => {
  const { investments: contextInvestments } = useFinance();
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  // Use context investments when available, otherwise use defaults
  const inv = useMemo(() => {
    if (contextInvestments.length === 0) return defaultInvestments;
    return {
      marketLinked: contextInvestments.filter(i => i.category === 'marketLinked'),
      fixedIncome: contextInvestments.filter(i => i.category === 'fixedIncome'),
      gold: contextInvestments.filter(i => i.category === 'gold'),
      realEstate: contextInvestments.filter(i => i.category === 'realEstate'),
    };
  }, [contextInvestments]);

  // Calculations
  const marketStats = useMemo(() => {
    let invested = 0, current = 0;
    inv.marketLinked.forEach(i => {
      invested += (i.units || 0) * (i.avgNav || 0);
      current += (i.units || 0) * (i.currentNav || 0);
    });
    return { invested, current };
  }, [inv.marketLinked]);

  const fixedStats = useMemo(() => {
    let invested = 0, current = 0;
    inv.fixedIncome.forEach(i => {
      invested += (i.principal || 0);
      current += (i.current || 0);
    });
    return { invested, current };
  }, [inv.fixedIncome]);

  const goldStats = useMemo(() => {
    let invested = 0, current = 0;
    inv.gold.forEach(i => {
      invested += (i.grams || 0) * (i.avgPrice || 0);
      current += (i.grams || 0) * (i.currentPrice || 0);
    });
    return { invested, current };
  }, [inv.gold]);

  const realEstateStats = useMemo(() => {
    let netEquity = 0;
    inv.realEstate.forEach(i => {
      netEquity += ((i.propertyValue || 0) - (i.loanOutstanding || 0));
    });
    return { invested: netEquity, current: netEquity };
  }, [inv.realEstate]);

  const totalInvested = marketStats.invested + fixedStats.invested + goldStats.invested + realEstateStats.invested;
  const totalCurrent = marketStats.current + fixedStats.current + goldStats.current + realEstateStats.current;
  const totalProfit = totalCurrent - totalInvested;
  // Guard against divide-by-zero
  const profitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  const allocationData = [
    { name: "Equity & MFs", value: marketStats.current },
    { name: "Debt & PF", value: fixedStats.current },
    { name: "Gold", value: goldStats.current },
    { name: "Real Estate (Net)", value: realEstateStats.current },
  ].filter(d => d.value > 0);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-24">
      
      {/* 3.1. Portfolio Dashboard */}
      <div className="bg-slate-900 rounded-[24px] shadow-xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="flex-1 space-y-4 relative z-10 w-full">
          <div>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Total Portfolio Value</p>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">{formatINR(totalCurrent)}</h1>
          </div>
          
          <div className="flex flex-wrap gap-4 pt-2">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-0.5">Total Invested</p>
              <p className="text-xl font-bold text-slate-200">{formatINR(totalInvested)}</p>
            </div>
            <div className="w-px h-10 bg-slate-700/50 hidden sm:block"></div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-0.5">Overall Returns</p>
              <div className="flex items-center gap-2">
                <span className={cn("text-xl font-bold flex items-center", totalProfit >= 0 ? "text-emerald-400" : "text-red-400")}>
                  {totalProfit >= 0 ? "+" : ""}{formatINR(totalProfit)}
                </span>
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded-md", totalProfit >= 0 ? "bg-emerald-400/10 text-emerald-400" : "bg-red-400/10 text-red-400")}>
                  {totalProfit >= 0 ? "+" : ""}{profitPercentage.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700/50 hidden sm:block"></div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-0.5">Est. XIRR</p>
              <p className="text-xl font-bold text-indigo-400">14.2%</p>
            </div>
          </div>
        </div>

        {/* Allocation Donut */}
        <div className="w-full md:w-64 h-48 relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={allocationData} cx="50%" cy="50%" innerRadius="70%" outerRadius="90%" paddingAngle={2} dataKey="value" stroke="none">
                {allocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatINR(value)} contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Assets</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Your Instruments</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Asset
        </button>
      </div>

      <div className="space-y-8">
        
        {/* A. Market Linked */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" /> Market Linked (Equity & MFs)
            </h3>
            <span className="font-bold text-slate-900">{formatINR(marketStats.current)}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {inv.marketLinked.map(mf => {
              const invested = mf.units * mf.avgNav;
              const current = mf.units * mf.currentNav;
              const profit = current - invested;
              const isProfitable = profit >= 0;
              return (
                <div 
                  key={mf.id} 
                  onClick={() => setEditingId(mf.id)}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="pr-4">
                      <h4 className="font-bold text-slate-900 line-clamp-1">{mf.name}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Units: {mf.units.toFixed(3)} • Avg: ₹{mf.avgNav.toFixed(1)}</p>
                    </div>
                    {mf.isSIP && <span className="shrink-0 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">SIP</span>}
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Current Value</p>
                      <p className="text-xl font-black text-slate-900 tracking-tight">{formatINR(current)}</p>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-sm font-bold flex items-center justify-end gap-0.5", isProfitable ? "text-emerald-600" : "text-red-600")}>
                        {isProfitable ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {formatINR(Math.abs(profit))}
                      </p>
                      <p className="text-xs font-semibold text-slate-400">Current NAV: ₹{mf.currentNav.toFixed(1)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* B. Fixed Income */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-500" /> Fixed Income (Debt, FDs, PF)
            </h3>
            <span className="font-bold text-slate-900">{formatINR(fixedStats.current)}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {inv.fixedIncome.map(fd => {
              const start = parseISO(fd.startDate);
              const end = parseISO(fd.maturityDate);
              const totalDays = differenceInDays(end, start);
              const daysPassed = differenceInDays(new Date(), start);
              const progress = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));

              return (
                <div 
                  key={fd.id} 
                  onClick={() => setEditingId(fd.id)}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-slate-900">{fd.name}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Principal: {formatINR(fd.principal)}</p>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2 py-0.5 rounded-md">{fd.rate}% p.a.</span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Est. Current Value</p>
                    <p className="text-xl font-black text-slate-900 tracking-tight">{formatINR(fd.current)}</p>
                  </div>

                  {/* Psychological Progress Bar */}
                  <div className="space-y-1.5 mt-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                      <span>{format(start, 'MMM yyyy')}</span>
                      <span>Matures: {format(end, 'MMM yyyy')}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* C. Gold */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-500" /> Gold & Alternatives
            </h3>
            <span className="font-bold text-slate-900">{formatINR(goldStats.current)}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {inv.gold.map(g => {
              const invested = g.grams * g.avgPrice;
              const current = g.grams * g.currentPrice;
              const profit = current - invested;
              return (
                <div 
                  key={g.id} 
                  onClick={() => setEditingId(g.id)}
                  className="bg-gradient-to-br from-amber-50/50 to-white p-5 rounded-2xl border border-amber-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <h4 className="font-bold text-slate-900 mb-1">{g.name}</h4>
                  <p className="text-xs text-amber-700 font-medium">Holding: {g.grams}g • Avg Cost: ₹{g.avgPrice}/g</p>
                  
                  <div className="flex items-end justify-between mt-4">
                    <div>
                      <p className="text-[10px] font-bold text-amber-600/70 uppercase tracking-wider mb-0.5">Current Value</p>
                      <p className="text-xl font-black text-slate-900 tracking-tight">{formatINR(current)}</p>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-sm font-bold", profit >= 0 ? "text-emerald-600" : "text-red-600")}>
                        {profit >= 0 ? "+" : ""}{formatINR(profit)}
                      </p>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Current rate: ₹{g.currentPrice}/g</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* D. Real Estate */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Home className="w-5 h-5 text-indigo-500" /> Real Estate & Home Equity
            </h3>
            <span className="font-bold text-slate-900">{formatINR(realEstateStats.current)}</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {inv.realEstate.map(re => {
              const netEquity = re.propertyValue - re.loanOutstanding;
              const equityPercentage = (netEquity / re.propertyValue) * 100;

              return (
                <div 
                  key={re.id} 
                  onClick={() => setEditingId(re.id)}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center gap-6 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-lg mb-1">{re.name}</h4>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Property Valuation: {formatINR(re.propertyValue)}</p>
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-4 border-l-0 md:border-l border-t md:border-t-0 border-slate-100 pt-4 md:pt-0 md:pl-6">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Loan Outstanding</p>
                      <p className="text-lg font-bold text-red-500">{formatINR(re.loanOutstanding)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-0.5">Net Equity (Wealth)</p>
                      <p className="text-xl font-black text-slate-900 tracking-tight">{formatINR(netEquity)}</p>
                    </div>
                  </div>

                  {/* SVG equity arc - correct implementation */}
                  <div className="w-full md:w-32 flex flex-col items-center md:items-end gap-1">
                    <svg width="56" height="56" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="22" fill="none" stroke="#E0E7FF" strokeWidth="6" />
                      <circle cx="28" cy="28" r="22" fill="none" stroke="#4F46E5" strokeWidth="6"
                        strokeDasharray={`${(equityPercentage / 100) * 138.2} 138.2`}
                        strokeLinecap="round"
                        transform="rotate(-90 28 28)"
                      />
                      <text x="28" y="32" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#4F46E5">{equityPercentage.toFixed(0)}%</text>
                    </svg>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Owned</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {(showAddModal || editingId) && (
        <InvestmentManagementModal 
          invId={editingId} 
          onClose={() => { setShowAddModal(false); setEditingId(null); }} 
        />
      )}
    </div>
  );
};
