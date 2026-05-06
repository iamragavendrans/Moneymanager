import React, { useState, useMemo } from "react";
import { Plus, Building2, CreditCard, Wallet, Smartphone, Banknote, TrendingUp, Utensils, PiggyBank, HandCoins, ShieldCheck, ArrowRightLeft, RefreshCw, CalendarDays, MoreVertical, ChevronRight, ChevronLeft, Eye, EyeOff } from "lucide-react";
import { useFinance, Account } from "../context/FinanceContext";
import { formatINR, cn } from "../utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { TransactionFormModal } from "../components/TransactionFormModal";
import { AccountManagementModal } from "../components/AccountManagementModal";
import { format, differenceInDays, parseISO } from "date-fns";

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

// Mask account number: show only last 4 digits
const maskAccNumber = (last4?: string) => last4 ? `••• ${last4}` : "••• ••••";
const maskCardNumber = (last4?: string) => last4 ? `•••• •••• •••• ${last4}` : "•••• •••• •••• ••••";

export const Accounts = () => {
  const { accounts, addAccount, transactions, updateAccount, addTransaction, getNetWorth, profile, updateProfile } = useFinance();
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const isMasked = profile.maskBalances || false;
  const setIsMasked = (val: boolean) => updateProfile({ maskBalances: val });

  // Expansion states for compact view
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    banks: false,
    cards: false,
    loans: false,
    cash: false,
    others: false,
    retirement: false
  });

  const toggleExpand = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  // Find which account receives most salary/income transactions
  const salaryAccountId = useMemo(() => {
    const counts: Record<string, number> = {};
    transactions.filter(t => t.type === 'income').forEach(t => {
      counts[t.account_id] = (counts[t.account_id] || 0) + t.amount;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  }, [transactions]);

  const bankAccounts = accounts.filter(a => a.type === "bank");
  const creditCards = accounts.filter(a => a.type === "credit_card");
  const loans = accounts.filter(a => a.type === "loan");
  const cashWallets = accounts.filter(a => ["cash", "wallet", "UPI", "meal_card"].includes(a.type));
  const retirementAccounts = accounts.filter(a => a.type === "pf");

  const totalPositive = accounts.filter(a => a.balance > 0).reduce((sum, a) => sum + a.balance, 0);
  const totalCreditDebt = accounts.filter(a => a.type === "credit_card" && a.balance < 0).reduce((sum, a) => sum + Math.abs(a.balance), 0);
  const totalLiquidity = totalPositive - totalCreditDebt;

  // Both chartData and cashWallets use the same type exclusion: non-liquid types excluded
  const liquidTypes = ["bank", "wallet", "UPI", "cash", "meal_card"];
  const chartData = useMemo(() => {
    return accounts
      .filter(a => a.balance > 0 && liquidTypes.includes(a.type))
      .map(a => ({ name: a.name, value: a.balance }))
      .sort((a, b) => b.value - a.value);
  }, [accounts]);

  const getDueDaysLabel = (dueDate?: string) => {
    if (!dueDate) return null;
    const days = differenceInDays(parseISO(dueDate), new Date());
    if (days < 0) return { text: `Overdue by ${Math.abs(days)}d`, color: 'text-red-600' };
    if (days === 0) return { text: 'Due Today', color: 'text-orange-600' };
    if (days <= 5) return { text: `Due in ${days}d`, color: 'text-orange-500' };
    return { text: `Due in ${days}d`, color: 'text-slate-500' };
  };

  const getCardNetwork = (number?: string) => {
    if (!number) return null;
    const first = number[0];
    if (first === '4') return 'Visa';
    if (first === '5') return 'Mastercard';
    if (first === '6') return 'Rupay';
    return null;
  };

  const nextCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentCardIndex((prev) => (prev + 1) % creditCards.length);
  };

  const prevCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentCardIndex((prev) => (prev - 1 + creditCards.length) % creditCards.length);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-24">
      {showTransferModal && (
        <TransactionFormModal initialType="transfer" onClose={() => setShowTransferModal(false)} />
      )}
      {showAccountModal && (
        <AccountManagementModal
          accId={editingAccountId}
          onClose={() => { setShowAccountModal(false); setEditingAccountId(null); }}
        />
      )}

      {/* 3.1. Account Summary Header - Balanced 2-Column Rectangle */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 md:p-10 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-indigo-50/50 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-emerald-50/30 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Column 1: Main Focus */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-slate-400">
              <div className="p-2.5 bg-indigo-50 rounded-xl">
                <Wallet className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-[10px] uppercase tracking-[0.25em] text-slate-500">Net Liquidity</span>
                <p className="text-[10px] font-bold text-slate-400">Combined Financial Standing</p>
              </div>
              <button onClick={() => setIsMasked(!isMasked)} className="ml-auto lg:ml-4 p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                {isMasked ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
              </button>
            </div>
            
            <div className="space-y-1">
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">
                {isMasked ? '₹ •••••••' : formatINR(totalLiquidity)}
              </h1>
              <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-sm">
                Real-time calculation of all cash assets against your total credit liabilities.
              </p>
            </div>
          </div>

          {/* Column 2: Sub-Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50/40 rounded-[28px] p-6 border border-emerald-100/50 group transition-all hover:bg-emerald-50 hover:shadow-xl hover:border-emerald-300/50">
              <div className="flex items-center gap-2 text-emerald-600 mb-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.15em]">Liquid Assets</span>
              </div>
              <p className="text-2xl font-black text-slate-800 tracking-tight mb-1">
                {isMasked ? '₹ •••••' : formatINR(totalPositive)}
              </p>
              <p className="text-[10px] font-bold text-slate-400">Banks & UPI</p>
            </div>
            
            <div className="bg-rose-50/40 rounded-[28px] p-6 border border-rose-100/50 group transition-all hover:bg-rose-50 hover:shadow-xl hover:border-rose-300/50">
              <div className="flex items-center gap-2 text-rose-500 mb-3">
                <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.15em]">Liabilities</span>
              </div>
              <p className="text-2xl font-black text-slate-800 tracking-tight mb-1">
                {isMasked ? '₹ •••••' : formatINR(totalCreditDebt)}
              </p>
              <p className="text-[10px] font-bold text-slate-400">Card Dues</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badge */}
      <div className="flex items-center justify-center gap-2 text-slate-400 bg-slate-50 py-3 rounded-xl border border-slate-100">
        <ShieldCheck className="w-4 h-4" />
        <span className="text-xs font-semibold">Your data is encrypted locally. We do not have access to move your funds.</span>
      </div>

      <div className="space-y-10">
        {accounts.length === 0 && (
          <div className="bg-white rounded-[32px] border-2 border-dashed border-slate-100 p-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
              <Wallet className="w-10 h-10 text-slate-300" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-800">No accounts added yet</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                Track your net worth by adding your bank accounts, credit cards, or cash wallets.
              </p>
            </div>
            <button
              onClick={() => setShowAccountModal(true)}
              className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
            >
              Add First Account
            </button>
          </div>
        )}

        {/* A. Bank Accounts */}
        {bankAccounts.length > 0 && (
          <section>
          <h3 className="text-lg font-bold text-slate-800 mb-4 px-1 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" /> Bank Accounts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(expanded.banks ? bankAccounts : bankAccounts.slice(0, 2)).map((acc) => (
              <div
                key={acc.id}
                onClick={() => { setEditingAccountId(acc.id); setShowAccountModal(true); }}
                className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute right-4 top-4 text-slate-300 group-hover:text-slate-500 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white text-indigo-600 flex items-center justify-center shrink-0 border border-slate-100 shadow-sm overflow-hidden">
                    {acc.logoUrl ? (
                      <img src={acc.logoUrl} alt={acc.name} className="w-full h-full object-contain p-1" />
                    ) : (
                      <AccountIcon type={acc.type} />
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-900 text-lg">{acc.name}</h4>
                      {acc.id === salaryAccountId && (
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">Salary</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-500 font-mono tracking-wider mb-4">{maskAccNumber(acc.lastFour)}</p>

                    <div className="flex items-end justify-between mt-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Current Balance</p>
                        <p className={cn("text-2xl font-black tracking-tight", acc.balance < 0 ? "text-red-600" : "text-slate-900")}>
                          {formatINR(acc.balance)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const val = prompt("Enter current actual balance to reconcile:");
                          if (val !== null && !isNaN(Number(val))) {
                            const diff = Number(val) - acc.balance;
                            if (diff !== 0) {
                              addTransaction({
                                amount: Math.abs(diff),
                                type: diff > 0 ? 'income' : 'expense',
                                category: 'Adjustment',
                                account_id: acc.id,
                                payee: 'Balance Reconciliation',
                                date: new Date().toISOString().split('T')[0],
                                notes: `Auto-adjustment to match actual balance: ${val}`,
                                tags: ['system']
                              });
                            }
                          }
                        }}
                        className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Reconcile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {bankAccounts.length > 2 && (
            <button
              onClick={() => toggleExpand('banks')}
              className="mt-4 w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-sm font-bold text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-all bg-white shadow-sm flex items-center justify-center gap-2"
            >
              {expanded.banks ? 'Show Less' : `+${bankAccounts.length - 2} more bank accounts`}
            </button>
          )}
        </section>
        )}

        {/* B. Credit Cards */}
        {creditCards.length > 0 && (
          <section className="relative">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" /> My Wallet / Cards
            </h3>
            {!expanded.cards && creditCards.length > 1 && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Card {currentCardIndex + 1} of {creditCards.length}
              </div>
            )}
          </div>
          
          <div className={cn(
            "relative transition-all duration-500",
            expanded.cards ? "space-y-6" : "h-[220px] max-w-[360px] mx-auto"
          )}>
            {/* Carousel Controls */}
            {!expanded.cards && creditCards.length > 1 && (
              <>
                <button 
                  onClick={prevCard}
                  className="absolute left-[-12px] top-1/2 -translate-y-1/2 z-[100] w-10 h-10 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:scale-110 transition-all active:scale-95"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={nextCard}
                  className="absolute right-[-12px] top-1/2 -translate-y-1/2 z-[100] w-10 h-10 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:scale-110 transition-all active:scale-95"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {creditCards.map((acc, index) => {
              const outstanding = Math.abs(acc.balance);
              const limit = acc.creditLimit || 100000;
              const available = limit - outstanding;
              const utilization = (outstanding / limit) * 100;
              const due = getDueDaysLabel(acc.dueDate);
              
              // Carousel Logic: Calculate relative position
              const relativePos = !expanded.cards ? (index - currentCardIndex + creditCards.length) % creditCards.length : 0;
              const isActive = relativePos === 0;
              const isNext = relativePos === 1;
              const isPrev = relativePos === creditCards.length - 1;

              // Dynamic Styling based on brand
              const isAmazon = acc.name.toLowerCase().includes('amazon');
              const isHDFC = acc.name.toLowerCase().includes('hdfc');
              const isPremium = acc.name.toLowerCase().includes('black') || acc.name.toLowerCase().includes('regalia') || acc.name.toLowerCase().includes('infinit');
              
              const cardColor = isAmazon ? "from-slate-800 to-slate-900" : 
                               isHDFC ? "from-indigo-900 to-indigo-800" : 
                               isPremium ? "from-zinc-900 via-zinc-800 to-black" : 
                               "from-slate-800 to-slate-900";

              return (
                <div 
                  key={acc.id} 
                  onClick={() => { setEditingAccountId(acc.id); setShowAccountModal(true); }}
                  style={{ 
                    zIndex: !expanded.cards ? (isActive ? 50 : 10) : 10,
                    transform: !expanded.cards 
                      ? isActive 
                        ? 'translateX(0) scale(1)' 
                        : isNext 
                          ? 'translateX(10%) scale(0.9) rotateY(-5deg)' 
                          : isPrev 
                            ? 'translateX(-10%) scale(0.9) rotateY(5deg)'
                            : 'scale(0.8) translateY(20px) opacity(0)'
                      : 'none',
                    opacity: !expanded.cards ? (isActive ? 1 : (isNext || isPrev ? 0.3 : 0)) : 1,
                    pointerEvents: !expanded.cards ? (isActive ? 'auto' : 'none') : 'auto'
                  }}
                  className={cn(
                    "group w-full max-w-[360px] mx-auto rounded-3xl p-5 shadow-2xl relative overflow-hidden cursor-pointer transition-all duration-700 border border-white/10",
                    !expanded.cards ? "absolute top-0 inset-x-0 h-full" : "relative mb-6 aspect-[1.586]",
                    `bg-gradient-to-br ${cardColor}`
                  )}
                >
                  {/* Card Chip & Signal */}
                  <div className="absolute top-5 left-5 flex flex-col gap-1.5 opacity-80">
                    <div className="w-10 h-7 bg-gradient-to-br from-yellow-200 to-yellow-500 rounded-md shadow-inner flex items-center justify-center">
                      <div className="w-6 h-4 border border-black/10 rounded-sm"></div>
                    </div>
                    <div className="flex gap-0.5">
                      <div className="w-1 h-3 bg-white/20 rounded-full"></div>
                      <div className="w-1 h-3 bg-white/40 rounded-full"></div>
                      <div className="w-1 h-3 bg-white/60 rounded-full"></div>
                    </div>
                  </div>

                  {/* Brand Logo & Network */}
                  <div className="absolute top-5 right-5 flex items-center gap-3">
                    <div className="text-white/40 text-[10px] font-black italic uppercase tracking-tighter mr-1">
                      {getCardNetwork(acc.fullAccountNumber || acc.lastFour)}
                    </div>
                    <div className="w-14 h-10 bg-white/10 rounded-xl backdrop-blur-md flex items-center justify-center p-1.5 border border-white/5">
                      {acc.logoUrl ? (
                        <img src={acc.logoUrl} alt={acc.name} className="w-full h-full object-contain" />
                      ) : (
                        <CreditCard className="w-6 h-6 text-white/50" />
                      )}
                    </div>
                  </div>

                  <div className="mt-10 mb-3">
                    <h4 className="text-white/60 text-[10px] uppercase font-bold tracking-widest mb-1">Card Holder / Issuer</h4>
                    <p className="text-white font-bold tracking-wider text-sm">{acc.name}</p>
                    <p className="text-white/90 font-mono text-base tracking-[0.15em] mt-2 flex gap-3">
                      <span>****</span>
                      <span>****</span>
                      <span>****</span>
                      <span className="bg-white/10 px-2 py-0.5 rounded-lg">{acc.lastFour || '0000'}</span>
                    </p>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-0.5">Outstanding Balance</p>
                      <p className="text-xl font-black text-white tracking-tight">{formatINR(outstanding)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-0.5">Available Limit</p>
                      <p className="text-lg font-bold text-indigo-300 tracking-tight">{formatINR(available)}</p>
                    </div>
                  </div>

                  {/* Utilization Bar */}
                  <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400" style={{ width: `${Math.min(utilization, 100)}%` }}></div>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    {due && (
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${due.color.replace('text', 'bg').replace('600', '100/20')} backdrop-blur-sm border border-white/10`}>
                        {due.text}
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-white/40">{utilization.toFixed(0)}% Utilized</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-center">
            {creditCards.length > 2 && (
              <button 
                onClick={() => toggleExpand('cards')}
                className="group flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-600 hover:shadow-lg transition-all"
              >
                {expanded.cards ? 'Collapse Stack' : `View All ${creditCards.length} Cards`}
                <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {creditCards.length}
                </div>
              </button>
            )}
          </div>
        </section>
        )}

        {/* C. Loans & EMI */}
        {loans.length > 0 && (
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4 px-1 flex items-center gap-2">
              <HandCoins className="w-5 h-5 text-indigo-600" /> Loans & EMI
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(expanded.loans ? loans : loans.slice(0, 2)).map(acc => (
                <div 
                  key={acc.id} 
                  onClick={() => { setEditingAccountId(acc.id); setShowAccountModal(true); }}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                      <HandCoins className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-slate-900">{acc.name}</h4>
                        {acc.interestRate && (
                          <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100 uppercase">
                            {acc.interestRate}% Interest
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mb-4 flex items-center gap-2">
                        Next Due: <span className="font-black text-slate-700">Day {acc.emiDate || '05'} of month</span>
                      </p>

                      {acc.emiAmount && (
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Monthly EMI</p>
                            <p className="text-lg font-black text-slate-800">{formatINR(acc.emiAmount)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Outstanding</p>
                            <p className="text-base font-black text-red-600">{formatINR(Math.abs(acc.balance))}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {loans.length > 2 && (
              <button
                onClick={() => toggleExpand('loans')}
                className="mt-3 w-full py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-all bg-white/50"
              >
                {expanded.loans ? 'Show Less' : `+${loans.length - 2} more loans`}
              </button>
            )}
          </section>
        )}

        {/* D. Retirement & PF */}
        {retirementAccounts.length > 0 && (
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4 px-1 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" /> Retirement & PF
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(expanded.retirement ? retirementAccounts : retirementAccounts.slice(0, 2)).map(acc => (
                <div 
                  key={acc.id} 
                  onClick={() => { setEditingAccountId(acc.id); setShowAccountModal(true); }}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-slate-900">{acc.name}</h4>
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 uppercase">
                          Interest: {acc.interestRate || '8.1'}%
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mb-4 flex items-center gap-2">
                        Corpus Balance: <span className="font-black text-indigo-600">{formatINR(acc.balance)}</span>
                      </p>
                      
                      {(acc.fullAccountNumber || acc.ifsc) && (
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">UAN / Emp ID</p>
                            <p className="text-xs font-black text-slate-800 tracking-widest">{acc.fullAccountNumber || '********'}</p>
                          </div>
                          {acc.lastFour && (
                            <div className="text-right">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Last Contrib</p>
                              <p className="text-xs font-bold text-slate-600">Monthly</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {retirementAccounts.length > 2 && (
              <button
                onClick={() => toggleExpand('retirement')}
                className="mt-3 w-full py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-all bg-white/50"
              >
                {expanded.retirement ? 'Show Less' : `+${retirementAccounts.length - 2} more items`}
              </button>
            )}
          </section>
        )}

        {/* E. Cash & Wallets */}
        {cashWallets.length > 0 && (
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4 px-1 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-indigo-600" /> Cash & Wallets
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(expanded.cash ? cashWallets : cashWallets.slice(0, 2)).map(acc => (
                <div
                  key={acc.id}
                  onClick={() => { setEditingAccountId(acc.id); setShowAccountModal(true); }}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer text-center group"
                >
                  <div className="w-12 h-12 mx-auto rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center mb-3 overflow-hidden border border-slate-100">
                    {acc.logoUrl ? (
                      <img src={acc.logoUrl} alt={acc.name} className="w-full h-full object-contain p-1" />
                    ) : (
                      <AccountIcon type={acc.type} />
                    )}
                  </div>
                  <h4 className="font-bold text-slate-700 text-sm mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">{acc.name}</h4>
                  <p className="text-lg font-black text-slate-900">{formatINR(acc.balance)}</p>
                </div>
              ))}
            </div>
            {cashWallets.length > 2 && (
              <button
                onClick={() => toggleExpand('cash')}
                className="mt-4 w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-sm font-bold text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-all bg-white shadow-sm flex items-center justify-center gap-2"
              >
                {expanded.cash ? 'Show Less' : `+${cashWallets.length - 2} more items`}
              </button>
            )}
          </section>
        )}

      </div>
    </div>
  );
};
