import React, { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownRight, Wallet, BellRing, ChevronRight } from "lucide-react";
import { format, subDays, parseISO } from "date-fns";
import { useFinance } from "../context/FinanceContext";
import { formatINR } from "../utils";
import { Link } from "react-router";

export const Dashboard = () => {
  const { getNetWorth, getTotalExpenses, getTotalIncome, transactions, accounts } = useFinance();

  // Generate mock chart data based on last 7 days net worth/expenses
  const chartData = useMemo(() => {
    const data = [];
    let currentNW = getNetWorth();
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = format(d, "yyyy-MM-dd");
      
      // Calculate daily expense
      const dailyExp = transactions
        .filter(t => t.date === dateStr && t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      data.push({
        date: format(d, "MMM dd"),
        netWorth: currentNW, // Simplified: just showing current static or slight varied
        expense: dailyExp
      });
      // slightly modify NW backwards for effect if we wanted true historical, 
      // but for mockup we just use currentNW + some random jitter
      currentNW -= (Math.random() * 1000 - 500); 
    }
    return data;
  }, [transactions, getNetWorth]);

  const recentTransactions = transactions.slice(0, 4);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Net Worth */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="relative z-10">
            <p className="text-slate-400 font-medium mb-1">Total Net Worth</p>
            <div className="flex items-baseline gap-4">
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight">{formatINR(getNetWorth())}</h3>
              <div className="flex items-center text-sm font-medium text-emerald-400">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                <span>+2.4%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Income & Expenses in same row (2 columns) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
                <ArrowDownRight className="w-5 h-5" />
              </div>
              <p className="text-slate-500 font-medium mb-1">Monthly Income</p>
              <h3 className="text-2xl font-bold text-slate-800">{formatINR(getTotalIncome())}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-3">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <p className="text-slate-500 font-medium mb-1">Monthly Expenses</p>
              <h3 className="text-2xl font-bold text-slate-800">{formatINR(getTotalExpenses())}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Cashflow Trend</h3>
            <select className="text-sm bg-slate-50 border-0 rounded-lg px-3 py-1.5 font-medium text-slate-600 outline-none cursor-pointer">
              <option>Last 7 Days</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-[250px] w-full" style={{ minHeight: 250, minWidth: 0 }}>
            <svg style={{ width: 0, height: 0, position: "absolute" }} aria-hidden="true">
              <defs>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
            </svg>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid key="grid" strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis key="xaxis" dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                <YAxis key="yaxis" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(val) => `₹${val/1000}k`} allowDecimals={false} tickCount={4} minTickGap={30} />
                <Tooltip 
                  key="tooltip"
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [formatINR(value), "Amount"]}
                />
                <Area key="area" type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Upcoming Recurring */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-slate-800 font-bold mb-4">
              <BellRing className="w-5 h-5 text-indigo-500" />
              <h3>Upcoming Bills</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700">N</div>
                  <div>
                    <p className="font-semibold text-sm text-slate-800">Netflix</p>
                    <p className="text-xs text-slate-500">Tomorrow</p>
                  </div>
                </div>
                <span className="font-bold text-sm text-slate-800">₹649</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700">A</div>
                  <div>
                    <p className="font-semibold text-sm text-slate-800">Amazon Prime</p>
                    <p className="text-xs text-slate-500">In 3 days</p>
                  </div>
                </div>
                <span className="font-bold text-sm text-slate-800">₹1,499</span>
              </div>
            </div>
          </div>

          {/* Accounts Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Top Accounts</h3>
              <Link to="/accounts" className="text-indigo-600 hover:bg-indigo-50 p-1 rounded-lg transition-colors">
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="space-y-3">
              {accounts.slice(0, 3).map((acc) => (
                <div key={acc.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-slate-400" />
                    <span className="font-medium text-sm text-slate-700">{acc.name}</span>
                  </div>
                  <span className={acc.balance < 0 ? "text-red-600 font-semibold text-sm" : "text-slate-800 font-semibold text-sm"}>
                    {formatINR(acc.balance)}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Recent Transactions</h3>
          <Link to="/transactions" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">View All</Link>
        </div>
        <div className="divide-y divide-slate-100">
          {recentTransactions.map((tx) => (
            <div key={tx.id} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  tx.type === 'expense' ? 'bg-red-50 text-red-600' :
                  tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  {tx.type === 'expense' ? <ArrowUpRight className="w-6 h-6" /> :
                   tx.type === 'income' ? <ArrowDownRight className="w-6 h-6" /> :
                   <Wallet className="w-6 h-6" />}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{tx.payee}</p>
                  <p className="text-sm text-slate-500">{tx.category} • {format(parseISO(tx.date), "MMM dd")}</p>
                </div>
              </div>
              <div className={`font-bold ${
                tx.type === 'expense' ? 'text-slate-800' :
                tx.type === 'income' ? 'text-emerald-600' :
                'text-blue-600'
              }`}>
                {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}{formatINR(tx.amount)}
              </div>
            </div>
          ))}
          {recentTransactions.length === 0 && (
             <div className="p-8 text-center text-slate-500">No recent transactions</div>
          )}
        </div>
      </div>
    </div>
  );
};
