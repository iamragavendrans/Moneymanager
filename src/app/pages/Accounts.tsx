import React, { useState, useMemo } from "react";
import { Plus, Building2, CreditCard, Wallet, Smartphone, Banknote, TrendingUp, Utensils, PiggyBank, HandCoins, ShieldCheck, ArrowRightLeft, RefreshCw, CalendarDays, MoreVertical } from "lucide-react";
import { useFinance, Account } from "../context/FinanceContext";
import { formatINR, cn } from "../utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const AccountIcon = ({ type }: { type: Account["type"] }) => {
  switch (type) {
    case "bank": return <Building2 className="w-6 h-6" />;
    case "credit_card": return <CreditCard className="w-6 h-6" />;
    case "wallet": return <Wallet className="w-6 h-6" />;
    case "UPI": return <Smartphone className="w-6 h-6" />;
    case "cash": return <Banknote className="w-6 h-6" />;
    case "investment": return <TrendingUp className="w-6 h-6" />;
    case "meal_card": return <Utensils className="w-6 h-6" />;
    case "pf": return <PiggyBank className="w-6 h-6" />;
    case "loan": return <HandCoins className="w-6 h-6" />;
    default: return <Wallet className="w-6 h-6" />;
  }
};

const CHART_COLORS = ['#4F46E5', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

export const Accounts = () => {
  const { accounts, addAccount, getNetWorth } = useFinance();

  const bankAccounts = accounts.filter(a => a.type === "bank");
  const creditCards = accounts.filter(a => a.type === "credit_card" || a.type === "loan");
  const cashWallets = accounts.filter(a => ["cash", "wallet", "UPI", "meal_card"].includes(a.type));

  const totalPositive = accounts.filter(a => a.balance > 0).reduce((sum, a) => sum + a.balance, 0);
  const totalCreditDebt = accounts.filter(a => a.type === "credit_card" && a.balance < 0).reduce((sum, a) => sum + Math.abs(a.balance), 0);
  const totalLiquidity = totalPositive - totalCreditDebt;

  const chartData = useMemo(() => {
    return accounts
      .filter(a => a.balance > 0 && !["investment", "pf"].includes(a.type)) // Only liquid positive assets for ring
      .map(a => ({ name: a.name, value: a.balance }))
      .sort((a, b) => b.value - a.value);
  }, [accounts]);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-24">

      {/* 3.1. Account Summary Header */}
      <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="flex-1 space-y-2 relative z-10 w-full text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500 mb-1">
            <Wallet className="w-4 h-4" />
            <span className="font-semibold text-sm uppercase tracking-wider">Total Liquidity</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">{formatINR(totalLiquidity)}</h1>
          <p className="text-sm font-medium text-slate-500 mt-2">
            Sum of positive balances minus credit card outstanding.
          </p>

          <div className="flex items-center justify-center md:justify-start gap-2 mt-6">
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95">
              <Plus className="w-4 h-4" /> Add Account
            </button>
            <button className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95">
              <ArrowRightLeft className="w-4 h-4" /> Transfer
            </button>
          </div>
        </div>

        {/* Visual Ring Chart */}
        <div className="w-full md:w-64 h-48 md:h-64 relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%" cy="50%"
                innerRadius="75%" outerRadius="90%"
                paddingAngle={4}
                dataKey="value"
                stroke="none"
                cornerRadius={8}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatINR(value)}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Centered Total */}
          <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Assets</span>
            <span className="text-lg font-black text-slate-800">{formatINR(totalPositive)}</span>
          </div>
        </div>
      </div>

      {/* Trust Badge */}
      <div className="flex items-center justify-center gap-2 text-slate-400 bg-slate-50 py-3 rounded-xl border border-slate-100">
        <ShieldCheck className="w-4 h-4" />
        <span className="text-xs font-semibold">Your data is encrypted locally. We do not have access to move your funds.</span>
      </div>

      <div className="space-y-10">

        {/* A. Bank Accounts */}
        <section>
          <h3 className="text-lg font-bold text-slate-800 mb-4 px-1 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" /> Bank Accounts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bankAccounts.map((acc, i) => (
              <div key={acc.id} className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer relative overflow-hidden">
                <div className="absolute right-4 top-4 text-slate-300 group-hover:text-slate-500 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 shadow-inner">
                    <AccountIcon type={acc.type} />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-900 text-lg">{acc.name}</h4>
                      {/* Salary Linkage Badge - Fake logic for demonstration */}
                      {i === 0 && (
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">Salary</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-500 font-mono tracking-wider mb-4">••• 4521</p>

                    <div className="flex items-end justify-between mt-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Current Balance</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tight">{formatINR(acc.balance)}</p>
                      </div>
                      <button className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                        <RefreshCw className="w-3.5 h-3.5" /> Reconcile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* B. Credit Cards & Pay Later */}
        <section>
          <h3 className="text-lg font-bold text-slate-800 mb-4 px-1 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" /> Credit Cards & Pay Later
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {creditCards.map(acc => {
              const outstanding = Math.abs(acc.balance);
              // Simulated Limits & Dates for realism
              const limit = outstanding > 50000 ? 500000 : 100000;
              const available = limit - outstanding;
              const utilization = (outstanding / limit) * 100;

              return (
                <div key={acc.id} className="group bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden cursor-pointer hover:ring-2 ring-indigo-500/50 transition-all">
                  {/* Card Gloss Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none"></div>

                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h4 className="font-bold text-white text-lg">{acc.name}</h4>
                        <p className="text-slate-400 font-mono text-xs tracking-widest mt-1">45XX •••• •••• 9012</p>
                      </div>
                      <div className="w-12 h-8 bg-white/10 rounded-md backdrop-blur-sm flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-white/70" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 border-b border-slate-700/50 pb-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Outstanding</p>
                          <p className="text-xl font-black text-red-400 tracking-tight">{formatINR(outstanding)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Available Limit</p>
                          <p className="text-xl font-bold text-white tracking-tight">{formatINR(available)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs font-medium">
                        <div className="flex items-center gap-1.5 text-slate-300 bg-white/5 px-2.5 py-1.5 rounded-lg">
                          <CalendarDays className="w-3.5 h-3.5" /> Due in 12 days
                        </div>
                        <div className="text-slate-400">
                          {utilization.toFixed(0)}% Utilized
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* C. Cash & Wallets */}
        <section>
          <h3 className="text-lg font-bold text-slate-800 mb-4 px-1 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-indigo-600" /> Cash & Wallets
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cashWallets.map(acc => (
              <div key={acc.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-50 text-slate-600 flex items-center justify-center mb-3">
                  <AccountIcon type={acc.type} />
                </div>
                <h4 className="font-bold text-slate-700 text-sm mb-1 line-clamp-1">{acc.name}</h4>
                <p className="text-lg font-black text-slate-900">{formatINR(acc.balance)}</p>
              </div>
            ))}

            {/* Quick Add Wallet/Cash */}
            <div className="bg-slate-50/50 rounded-2xl border border-slate-200 border-dashed p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors text-slate-400 hover:text-indigo-600">
              <Plus className="w-8 h-8 mb-2" />
              <span className="font-bold text-sm">Add Wallet</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
