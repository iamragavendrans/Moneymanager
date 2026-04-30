import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownRight, Eye, EyeOff, MoreVertical, LayoutGrid, ChevronDown } from "lucide-react";
import { format, subDays } from "date-fns";
import { useFinance } from "../context/FinanceContext";
import { formatINR } from "../utils";
import { Link } from "react-router";

// Helper components
const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100 ${className}`}>
    {children}
  </div>
);

const ListCard = ({ icon, title, subtitle, amount, badgeText, badgeType }: any) => (
  <div className="flex items-center justify-between py-3 hover:bg-slate-50 transition-colors rounded-xl px-2 -mx-2">
    <div className="flex items-center gap-3">
      {typeof icon === 'string' ? (
        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-700">
          {icon}
        </div>
      ) : icon}
      <div>
        <p className="text-[14px] font-medium text-slate-800">{title}</p>
        <p className="text-[12px] text-slate-500">{subtitle}</p>
      </div>
    </div>
    <div className="text-right flex flex-col items-end gap-1">
      <p className={`font-semibold text-[14px] ${amount.startsWith('-') ? 'text-red-500' : amount.startsWith('+') ? 'text-emerald-600' : 'text-slate-800'}`}>{amount}</p>
      {badgeText && (
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badgeType === 'danger' ? 'bg-red-50 text-red-500' :
            badgeType === 'success' ? 'bg-emerald-50 text-emerald-600' :
              badgeType === 'warning' ? 'bg-orange-50 text-orange-600' :
                'bg-slate-100 text-slate-600'
          }`}>
          {badgeText}
        </span>
      )}
    </div>
  </div>
);

// mock data for mini bar charts
const mockBarsIncome = [30, 45, 25, 60, 40, 70, 85, 50, 65, 80];
const mockBarsExpense = [50, 30, 40, 20, 60, 45, 35, 70, 55, 40];

export const Dashboard = () => {
  const { getNetWorth, getTotalExpenses, getTotalIncome, transactions } = useFinance();
  const [showHeroBreakdown, setShowHeroBreakdown] = useState(false);
  const [heroFilter, setHeroFilter] = useState("1M");
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isMasked, setIsMasked] = useState(false);

  // Create realistic historical data
  const heatmapData: any[] = [];
  for (let i = 34; i >= 0; i--) {
    const inc = Math.floor(Math.random() * 800) + 400;
    const exp = Math.floor(Math.random() * 600) + 200;
    heatmapData.push({
      date: format(subDays(new Date(), i), "MMM dd"),
      income: inc,
      expense: exp,
      net: inc - exp
    });
  }
  const chartData = heatmapData.slice(-7); // Last 7 days for the line chart
  const sparklineData = heatmapData.slice(-14); // 14 days for sparkline

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="px-4 py-6 md:py-8 max-w-[1200px] mx-auto w-full space-y-6">

      {/* Top Section */}
      <div className="w-full">
        {/* Hero Card */}
        <div className="bg-[#0B1220] text-white rounded-[24px] p-6 md:p-8 shadow-xl relative overflow-hidden transition-all duration-300 w-full min-h-[200px] flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium text-sm">Total Net Worth</span>
                <button onClick={() => setIsMasked(!isMasked)} className="text-slate-400 hover:text-white transition-colors">
                  {isMasked ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="bg-[#1A2235] rounded-lg p-1 flex gap-1 border border-slate-700/50">
                {['1W', '1M', '1Y'].map(f => (
                  <button
                    key={f}
                    onClick={() => setHeroFilter(f)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${heroFilter === f ? 'bg-white text-[#0B1220]' : 'text-slate-400 hover:text-white'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            
            <h1 className="text-[40px] font-bold tracking-tight mb-2 transition-all">{isMasked ? '₹ •••••••' : formatINR(getNetWorth())}</h1>
            
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-medium text-sm">3.6% vs last month</span>
            </div>
          </div>

          {/* Sparkline Chart */}
          <div className="absolute right-0 bottom-12 w-1/2 h-24 opacity-80 pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line type="monotone" dataKey="net" stroke="#22C55E" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Expandable Breakdown */}
          <div className="relative z-10 text-center w-full mt-6">
            <button
              onClick={() => setShowHeroBreakdown(!showHeroBreakdown)}
              className="text-sm text-slate-400 flex items-center justify-center gap-1 mx-auto hover:text-white transition-colors"
            >
              Breakdown <ChevronDown className={`w-4 h-4 transition-transform ${showHeroBreakdown ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className={`relative z-10 overflow-hidden transition-all duration-300 ease-in-out ${showHeroBreakdown ? 'max-h-40 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="pt-4 border-t border-slate-700/50 grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-xs mb-1">Liquid Assets</p>
                <p className="font-semibold text-lg">{isMasked ? '₹ ••••' : '₹85,000'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Investments</p>
                <p className="font-semibold text-lg">{isMasked ? '₹ •••••' : '₹1,60,300'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Income & Expense Cards */}
      <div className="grid grid-cols-2 gap-4 w-full">
        {/* Income Card */}
        <Card className="flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all h-[140px] md:h-[160px]">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 flex-shrink-0 border border-emerald-100">
                <ArrowDownRight className="w-4 h-4" />
              </div>
              <span className="text-slate-500 font-medium text-xs md:text-sm">Monthly Income</span>
            </div>
            <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-4 h-4" /></button>
          </div>

          <h3 className="text-xl md:text-3xl font-bold text-slate-800 truncate mb-1">{isMasked ? '₹ •••••' : formatINR(getTotalIncome())}</h3>

          <div className="flex justify-between items-end">
            <div className="flex items-center gap-1 text-[10px] md:text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md">
              <ArrowUpRight className="w-3 h-3" /> 12.5% <span className="hidden lg:inline">vs last month</span>
            </div>

            {/* Mini bar chart */}
            <div className="flex items-end gap-1 h-8 opacity-80">
              {mockBarsIncome.map((h, i) => (
                <div key={i} className="w-1 md:w-1.5 bg-emerald-200 rounded-t-sm" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </div>
        </Card>

        {/* Expense Card */}
        <Card className="flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all h-[140px] md:h-[160px]">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 flex-shrink-0 border border-red-100">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <span className="text-slate-500 font-medium text-xs md:text-sm">Monthly Expenses</span>
            </div>
            <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-4 h-4" /></button>
          </div>

          <h3 className="text-xl md:text-3xl font-bold text-slate-800 truncate mb-1">{isMasked ? '₹ •••••' : formatINR(getTotalExpenses())}</h3>

          <div className="flex justify-between items-end">
            <div className="flex items-center gap-1 text-[10px] md:text-xs font-medium text-red-500 bg-red-50 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md">
              <ArrowUpRight className="w-3 h-3" /> 8.2% <span className="hidden lg:inline">vs last month</span>
            </div>

            {/* Mini bar chart */}
            <div className="flex items-end gap-1 h-8 opacity-80">
              {mockBarsExpense.map((h, i) => (
                <div key={i} className="w-1 md:w-1.5 bg-red-300 rounded-t-sm" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Main Grid: Charts & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Column (Charts) */}
        <div className="lg:col-span-7 space-y-6">

          {/* Cashflow Trend / Heatmap */}
          <Card className="p-5 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-bold text-slate-800 text-[16px]">Cashflow Trend</h3>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Income</div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><div className="w-2 h-2 rounded-full bg-red-500"></div> Expense</div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Net</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select className="appearance-none text-sm bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 font-medium text-slate-600 outline-none cursor-pointer hover:bg-slate-100 transition-colors">
                    <option>Last 7 Days</option>
                    <option>This Month</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
                </div>
                <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className={`text-sm border rounded-lg px-3 py-1.5 font-medium flex items-center gap-2 transition-colors ${showHeatmap ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Heatmap
                </button>
              </div>
            </div>

            {showHeatmap ? (
              <div className="h-[250px] w-full flex flex-col justify-center animate-in fade-in duration-300">
                <div className="flex items-center justify-end mb-4">
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">Less <span className="inline-block w-3 h-3 bg-slate-100 rounded-sm mx-1"></span><span className="inline-block w-3 h-3 bg-red-200 rounded-sm mx-1"></span><span className="inline-block w-3 h-3 bg-red-500 rounded-sm mx-1"></span><span className="inline-block w-3 h-3 bg-red-800 rounded-sm mx-1"></span> More</span>
                </div>
                <div className="flex gap-2 w-full overflow-x-auto pb-4 scrollbar-hide justify-center">
                  {/* Generate 5 columns (weeks) x 7 rows (days) */}
                  {Array.from({ length: 5 }).map((_, col) => (
                    <div key={col} className="flex flex-col gap-2 flex-shrink-0">
                      {Array.from({ length: 7 }).map((_, row) => {
                        const dataIndex = col * 7 + row;
                        const dayData = heatmapData[dataIndex];
                        const exp = dayData ? dayData.expense : 0;
                        
                        let bgColor = 'bg-slate-100';
                        if (exp > 100 && exp <= 300) bgColor = 'bg-red-200';
                        else if (exp > 300 && exp <= 500) bgColor = 'bg-red-400';
                        else if (exp > 500 && exp <= 700) bgColor = 'bg-red-500';
                        else if (exp > 700) bgColor = 'bg-red-800';

                        return (
                          <div
                            key={row}
                            className={`w-5 h-5 md:w-6 md:h-6 rounded-[4px] ${bgColor} transition-all hover:scale-110 hover:ring-2 ring-red-200 cursor-pointer`}
                            title={dayData ? `${dayData.date}: ₹${dayData.expense} expenses` : ''}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[250px] w-full animate-in fade-in duration-300" style={{ minHeight: 250, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B', fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B', fontWeight: 500 }} tickFormatter={(val) => `₹${val / 1000}k`} allowDecimals={false} tickCount={4} minTickGap={30} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number, name: string) => [formatINR(value), name.charAt(0).toUpperCase() + name.slice(1)]}
                    />
                    <Line type="monotone" dataKey="income" stroke="#22C55E" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="net" stroke="#3B82F6" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Recent Transactions (Desktop puts this under Cashflow) */}
          <Card className="p-5 hidden lg:block">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[15px] text-slate-800">Recent Transactions</h3>
              <Link to="/transactions" className="text-indigo-600 text-sm font-semibold hover:underline">View All</Link>
            </div>
            <div className="space-y-1">
              {recentTransactions.map(tx => (
                <ListCard
                  key={tx.id}
                  icon={
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${tx.type === 'expense' ? 'bg-orange-50 text-orange-500' :
                        tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' :
                          'bg-purple-50 text-purple-600'
                      }`}>
                      {tx.payee.charAt(0)}
                    </div>
                  }
                  title={tx.payee} subtitle={`${tx.category} • ${format(new Date(tx.date), "MMM dd")}`}
                  amount={`${tx.type === 'expense' ? '-' : '+'}${formatINR(tx.amount)}`}
                />
              ))}
            </div>
          </Card>

        </div>

        {/* Right Column (Lists) */}
        <div className="lg:col-span-5 space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[15px] text-slate-800">Upcoming Payments</h3>
                <button className="text-indigo-600 text-sm font-semibold hover:underline">View All</button>
              </div>
              <div className="space-y-1">
                <ListCard
                  icon={<div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center font-bold text-lg">N</div>}
                  title="Netflix" subtitle="Due Tomorrow" amount="₹649" badgeText="Due Tomorrow" badgeType="danger"
                />
                <ListCard
                  icon={<div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-lg">A</div>}
                  title="Amazon Prime" subtitle="Due in 3 days" amount="₹1,499" badgeText="Due in 3 days" badgeType="warning"
                />
                <ListCard
                  icon={<div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center font-bold text-lg">S</div>}
                  title="Spotify Premium" subtitle="Due in 5 days" amount="₹119" badgeText="Due in 5 days" badgeType="warning"
                />
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[15px] text-slate-800">Scheduled Transactions</h3>
                <button className="text-indigo-600 text-sm font-semibold hover:underline">View All</button>
              </div>
              <div className="space-y-1">
                <ListCard
                  icon={<div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl">🏛️</div>}
                  title="SIP - HDFC Flexi Cap" subtitle="May 5, 2025" amount="₹5,000" badgeText="Active" badgeType="success"
                />
                <ListCard
                  icon={<div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl">💼</div>}
                  title="Salary Credit" subtitle="May 1, 2025" amount="₹1,50,000" badgeText="Monthly" badgeType="default"
                />
                <ListCard
                  icon={<div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl">🏠</div>}
                  title="Rent Payment" subtitle="May 3, 2025" amount="₹20,000" badgeText="Monthly" badgeType="default"
                />
              </div>
            </Card>
          </div>

          {/* Recent Transactions (Mobile shows this at the bottom) */}
          <Card className="p-5 lg:hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[15px] text-slate-800">Recent Transactions</h3>
              <Link to="/transactions" className="text-indigo-600 text-sm font-semibold hover:underline">View All</Link>
            </div>
            <div className="space-y-1">
              {recentTransactions.map(tx => (
                <ListCard
                  key={tx.id}
                  icon={
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${tx.type === 'expense' ? 'bg-orange-50 text-orange-500' :
                        tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' :
                          'bg-purple-50 text-purple-600'
                      }`}>
                      {tx.payee.charAt(0)}
                    </div>
                  }
                  title={tx.payee} subtitle={`${tx.category} • ${format(new Date(tx.date), "MMM dd")}`}
                  amount={`${tx.type === 'expense' ? '-' : '+'}${formatINR(tx.amount)}`}
                />
              ))}
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
};
