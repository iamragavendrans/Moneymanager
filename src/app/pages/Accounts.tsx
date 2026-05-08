import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Building2, CreditCard, Wallet, Smartphone, Banknote, TrendingUp, Utensils, PiggyBank, HandCoins, ShieldCheck, ArrowRightLeft, RefreshCw, CalendarDays, MoreVertical, ChevronRight, ChevronLeft, Eye, EyeOff, Settings, TrendingDown, Target, Zap, ChevronUp, ChevronDown, MoreHorizontal, Home, Car, GraduationCap, Briefcase, ShoppingBag } from "lucide-react";
import { useFinance, Account, Transaction } from "../context/FinanceContext";
import { useNavigate } from "react-router";
import { formatINR, cn } from "../utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { TransactionFormModal } from "../components/TransactionFormModal";
import { AccountManagementModal } from "../components/AccountManagementModal";
import { format, differenceInDays, parseISO, subMonths } from "date-fns";

const AccountIcon = ({ type, name, className = "w-6 h-6" }: { type: Account["type"], name?: string, className?: string }) => {
  const iconProps = { className, strokeWidth: 2.5 };
  if (type === "loan" && name) {
    const n = name.toLowerCase();
    if (n.includes("home") || n.includes("house") || n.includes("property")) return <Home {...iconProps} />;
    if (n.includes("car") || n.includes("vehicle") || n.includes("auto")) return <Car {...iconProps} />;
    if (n.includes("edu") || n.includes("study") || n.includes("student")) return <GraduationCap {...iconProps} />;
    if (n.includes("personal")) return <Briefcase {...iconProps} />;
    if (n.includes("gold")) return <ShoppingBag {...iconProps} />;
  }
  switch (type) {
    case "bank": return <Building2 {...iconProps} />;
    case "credit_card": return <CreditCard {...iconProps} />;
    case "wallet": return <Wallet {...iconProps} />;
    case "UPI": return <Smartphone {...iconProps} />;
    case "cash": return <Banknote {...iconProps} />;
    case "investment": return <TrendingUp {...iconProps} />;
    case "meal_card": return <Utensils {...iconProps} />;
    case "pf": return <PiggyBank {...iconProps} />;
    case "loan": return <HandCoins {...iconProps} />;
    case "chit": return <RefreshCw {...iconProps} />;
    default: return name ? <div className="font-bold text-xs">{name[0]}</div> : <Wallet {...iconProps} />;
  }
};

const CHART_COLORS = ['#4F46E5', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

// Mask account number: show only last 4 digits
const maskAccNumber = (last4?: string) => last4 ? `••• ${last4}` : "••• ••••";
const maskCardNumber = (last4?: string) => last4 ? `•••• •••• •••• ${last4}` : "•••• •••• •••• ••••";

export const Accounts = () => {
  const { 
    accounts, 
    addAccount, 
    transactions, 
    updateAccount, 
    addTransaction, 
    getNetWorth, 
    profile, 
    updateProfile 
  } = useFinance();
  const navigate = useNavigate();
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
    retirement: false,
    chits: false
  });

  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);
  const [flippedLoans, setFlippedLoans] = useState<Record<string, boolean>>({});
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const [selectedStrategyType, setSelectedStrategyType] = useState<'avalanche' | 'snowball' | null>(null);

  const getStrategyPath = (type: 'avalanche' | 'snowball') => {
    return [...loans].sort((a, b) => {
      if (type === 'avalanche') return (b.interestRate || 0) - (a.interestRate || 0);
      return Math.abs(a.balance) - Math.abs(b.balance);
    });
  };

  const toggleLoanFlip = (id: string) => {
    setFlippedLoans(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleExpand = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleCardExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Find which account receives most salary/income transactions
  const salaryAccountId = useMemo(() => {
    const counts: Record<string, number> = {};
    transactions.filter((t: Transaction) => t.type === 'income').forEach((t: Transaction) => {
      counts[t.account_id] = (counts[t.account_id] || 0) + t.amount;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  }, [transactions]);

  const bankAccounts = accounts.filter(a => a.type === "bank");
  const creditCards = accounts.filter(a => a.type === "credit_card" || a.type === "debit");
  const loans = accounts.filter(a => a.type === "loan");
  const cashWallets = accounts.filter(a => ["cash", "wallet", "UPI", "meal_card"].includes(a.type));
  const retirementAccounts = accounts.filter(a => a.type === "pf");
  const chitAccounts = accounts.filter(a => a.type === "chit");

  const totalPositive = accounts.filter(a => a.balance > 0).reduce((sum, a) => sum + a.balance, 0);
  const totalCreditDebt = accounts.filter(a => a.type === "credit_card" && a.balance < 0).reduce((sum, a) => sum + Math.abs(a.balance), 0);
  const totalLoanDebt = accounts.filter(a => a.type === "loan" && a.balance < 0).reduce((sum, a) => sum + Math.abs(a.balance), 0);
  const totalLiabilities = totalCreditDebt + totalLoanDebt;
  const totalLiquidity = totalPositive - totalLiabilities;

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
    let targetDate: Date;
    // Check if it's a simple day of the month (1-31)
    if (/^\d{1,2}$/.test(dueDate)) {
      const today = new Date();
      targetDate = new Date(today.getFullYear(), today.getMonth(), parseInt(dueDate, 10));
      // If the due date has passed this month, move it to next month
      if (targetDate < today) {
        targetDate.setMonth(targetDate.getMonth() + 1);
      }
    } else {
      targetDate = parseISO(dueDate);
    }
    
    if (isNaN(targetDate.getTime())) return null;

    const days = differenceInDays(targetDate, new Date());
    if (days < 0) return { text: `${Math.abs(days)} Days`, color: 'text-red-600' };
    if (days === 0) return { text: 'Today', color: 'text-orange-600' };
    return { text: `${days} Days`, color: days <= 5 ? 'text-orange-500' : 'text-slate-500' };
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
                {isMasked ? '₹ •••••' : formatINR(totalLiabilities)}
              </p>
              <p className="text-[10px] font-bold text-slate-400">Card & Loans</p>
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
                onClick={() => navigate(`/transactions?accountId=${acc.id}`)}
                className="group bg-white rounded-3xl border border-slate-100 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(79,70,229,0.15)] hover:border-indigo-100 transition-all duration-300 cursor-pointer relative overflow-hidden"
              >
                <div className="space-y-4">
                  {/* Top Row: Name & Logo */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-900 text-lg leading-none">{acc.name}</h4>
                        {acc.id === salaryAccountId && (
                          <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">Salary</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white text-indigo-600 flex items-center justify-center shrink-0 border border-slate-100 shadow-sm overflow-hidden p-1.5">
                        {acc.logoUrl ? (
                          <img src={acc.logoUrl} alt={acc.name} className="w-full h-full object-contain" />
                        ) : (
                          <AccountIcon type={acc.type} name={acc.name} />
                        )}
                      </div>
                      <div className="text-slate-300 group-hover:text-indigo-400 transition-colors">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingAccountId(acc.id);
                            setShowAccountModal(true);
                          }}
                          className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Second Row: Balance & Account Type */}
                  <div className="grid grid-cols-2 gap-4 items-end">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Balance</p>
                      <p className={cn("text-2xl font-black tracking-tight", acc.balance < 0 ? "text-red-600" : "text-slate-900")}>
                        {formatINR(acc.balance)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Account Type</p>
                      <p className="text-sm font-bold text-indigo-600 bg-indigo-50 inline-flex px-3 py-1.5 rounded-xl capitalize">
                        {acc.subType || acc.type}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Button */}
                  <button
                    onClick={(e) => toggleCardExpand(acc.id, e)}
                    className="w-full mt-2 py-2 flex items-center justify-center gap-2 text-[10px] font-black text-slate-300 hover:text-indigo-600 uppercase tracking-[0.2em] transition-colors"
                  >
                    <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-100 to-slate-100" />
                    {expandedCards[acc.id] ? "Hide Details" : "Show Details"}
                    <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-slate-100 to-slate-100" />
                  </button>

                  {/* Expanded Section */}
                  <AnimatePresence>
                    {expandedCards[acc.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2 pb-1 space-y-4">
                          <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-4">
                            {acc.accountHolderName && (
                              <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Account Holder Name</p>
                                <p className="text-sm font-bold text-slate-800">{acc.accountHolderName}</p>
                              </div>
                            )}
                            
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Account Number</p>
                              <div className="flex items-center gap-2">
                                <p className="text-base font-mono font-bold text-slate-800 tracking-widest">
                                  {acc.fullAccountNumber ? acc.fullAccountNumber : maskAccNumber(acc.lastFour)}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              {acc.ifsc && (
                                <div>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">IFSC Code</p>
                                  <p className="text-sm font-bold text-slate-800">{acc.ifsc}</p>
                                </div>
                              )}
                              {acc.branch && (
                                <div>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Branch</p>
                                  <p className="text-sm font-bold text-slate-800">{acc.branch}</p>
                                </div>
                              )}
                            </div>

                            {acc.upiId && (
                              <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">UPI ID</p>
                                <p className="text-sm font-bold text-indigo-600">{acc.upiId}</p>
                              </div>
                            )}

                            {/* Reconcile button moved here for less clutter on main view */}
                            <div className="pt-2 border-t border-slate-200/50 flex justify-end">
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
                                className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 uppercase tracking-wider hover:text-indigo-800 transition-colors"
                              >
                                <RefreshCw className="w-3.5 h-3.5" /> Reconcile Balance
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
              <CreditCard className="w-5 h-5 text-indigo-600" /> My Cards
            </h3>
            {!expanded.cards && creditCards.length > 1 && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Card {currentCardIndex + 1} of {creditCards.length}
              </div>
            )}
          </div>
          
          <div className={cn(
            "relative transition-all duration-500",
            expanded.cards ? "space-y-12" : "h-[240px] max-w-[360px] mx-auto"
          )}>
            {/* Carousel Controls */}
            {!expanded.cards && creditCards.length > 1 && !showAccountModal && (
              <>
                <button 
                  onClick={prevCard}
                  className="absolute left-2 md:left-[-60px] top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-2xl border border-slate-100 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:scale-110 transition-all active:scale-95"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button 
                  onClick={nextCard}
                  className="absolute right-2 md:right-[-60px] top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-2xl border border-slate-100 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:scale-110 transition-all active:scale-95"
                >
                  <ChevronRight className="w-8 h-8" />
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
              <React.Fragment key={acc.id}>
                <div 
                  onClick={() => setFlippedCardId(prev => prev === acc.id ? null : acc.id)}
                  style={{ 
                    zIndex: !expanded.cards ? (isActive ? 50 : 10) : 10,
                    transform: !expanded.cards 
                      ? isActive 
                        ? (flippedCardId === acc.id ? 'rotateY(180deg) scale(1)' : 'translateX(0) scale(1)') 
                        : isNext 
                          ? 'translateX(10%) scale(0.9) rotateY(-5deg)' 
                          : isPrev 
                            ? 'translateX(-10%) scale(0.9) rotateY(5deg)'
                            : 'scale(0.8) translateY(20px) opacity(0)'
                      : (flippedCardId === acc.id ? 'rotateY(180deg)' : 'none'),
                    opacity: !expanded.cards ? (isActive ? 1 : (isNext || isPrev ? 0.3 : 0)) : 1,
                    pointerEvents: !expanded.cards ? (isActive ? 'auto' : 'none') : 'auto',
                    transformStyle: 'preserve-3d'
                  }}
                  className={cn(
                    "group w-full max-w-[380px] mx-auto relative cursor-pointer transition-all duration-700 aspect-[1.586]",
                    !expanded.cards ? "absolute top-0 inset-x-0 h-full" : "relative mb-8"
                  )}
                >
                  {/* Front Side */}
                  <div className={cn(
                    "absolute inset-0 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col justify-between border border-white/10 [backface-visibility:hidden]",
                    `bg-gradient-to-br ${cardColor}`
                  )}>
                    {/* Top Row: Bank Logo (Left) and Chip+Network (Right) */}
                    <div className="flex justify-between items-start gap-3">
                      {/* Left: Bank Logo & Name */}
                      <div className="flex items-center gap-3 shrink min-w-0">
                        {acc.logoUrl ? (
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1.5 shadow-sm border border-white/20 shrink-0">
                            <img src={acc.logoUrl} alt={acc.name} className="w-full h-full object-contain" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm border border-white/20 shrink-0">
                            <Building2 className="w-5 h-5 text-white/80" />
                          </div>
                        )}
                        <div className="text-white font-bold tracking-widest text-sm shadow-black drop-shadow-md truncate uppercase shrink min-w-0">
                          {acc.issuerBank || acc.name}
                        </div>
                      </div>

                      {/* Right: Chip & Network Logo */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <div className="w-9 h-6 bg-gradient-to-br from-[#e0c476] to-[#b8953f] rounded shadow-inner flex flex-col justify-between overflow-hidden opacity-90 border border-[#8a6b1c]/50">
                            <div className="w-full h-[1px] bg-black/20 mt-1.5"></div>
                            <div className="w-full h-[1px] bg-black/20 mb-1.5"></div>
                          </div>
                          <div className="flex gap-0.5 opacity-60">
                            <div className="w-1 h-3 bg-white/80 rounded-full rotate-12"></div>
                            <div className="w-1 h-3.5 bg-white/80 rounded-full rotate-12"></div>
                            <div className="w-1 h-4 bg-white/80 rounded-full rotate-12"></div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          <div className="text-white font-black italic text-[18px] tracking-tighter drop-shadow-md pr-1">
                            {acc.cardNetwork || getCardNetwork(acc.fullAccountNumber || acc.lastFour)}
                          </div>
                          {acc.cardVariant && (
                            <div className="text-[6px] font-black text-amber-400 uppercase tracking-widest mt-0.5 shadow-black drop-shadow-sm pr-1">
                              {acc.cardVariant}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle Row: Card Number */}
                    <div className="flex-1 flex flex-col justify-center translate-y-3">
                      <p className="text-white font-mono text-[22px] tracking-[0.2em] flex items-center gap-3 drop-shadow-md">
                        <span>****</span>
                        <span>****</span>
                        <span>****</span>
                        <span>{acc.lastFour || acc.fullAccountNumber?.slice(-4) || '0000'}</span>
                      </p>
                    </div>

                    {/* Bottom Row: Name and Expiry */}
                    <div className="flex items-end justify-between mt-auto">
                      <div>
                        <h4 className="text-white/50 text-[7px] uppercase font-bold tracking-widest mb-1">Cardholder Name</h4>
                        <p className="text-white font-bold tracking-widest text-xs uppercase drop-shadow-sm truncate max-w-[180px]">{acc.accountHolderName || `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || 'CARDHOLDER'}</p>
                      </div>
                      {acc.expiryDate && (
                        <div className="text-right">
                          <h4 className="text-white/50 text-[7px] uppercase font-bold tracking-widest mb-1">Valid Thru</h4>
                          <p className="text-white font-mono font-bold tracking-widest text-xs drop-shadow-sm">{acc.expiryDate}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className={cn(
                    "absolute inset-0 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col justify-between border border-white/10 [backface-visibility:hidden] [transform:rotateY(180deg)]",
                    `bg-slate-900`
                  )}>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      {/* Integrated Stats Grid */}
                      <div className="grid grid-cols-2 gap-y-4">
                        <div className="min-w-0">
                          <p className="text-[7px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Outstanding</p>
                          <p className="text-xl font-black text-white tabular-nums leading-none">
                            {formatINR(acc.type === 'debit' ? acc.balance : outstanding)}
                          </p>
                        </div>
                        <div className="text-right min-w-0">
                          <p className="text-[7px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Available Limit</p>
                          <p className="text-xl font-black text-white/80 tabular-nums leading-none">
                            {formatINR(available)}
                          </p>
                        </div>
                        {acc.type === 'credit_card' && (
                          <>
                            <div className="min-w-0">
                              <p className="text-[7px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Statement Due</p>
                              <p className={cn("text-xl font-black tabular-nums leading-none", due ? due.color : "text-white/40")}>
                                {due ? due.text : 'No Dues'}
                              </p>
                            </div>
                            <div className="text-right min-w-0">
                              <p className="text-[7px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Utilization</p>
                              <div className="flex flex-col items-end gap-1">
                                <p className={cn(
                                  "text-xl font-black tabular-nums leading-none",
                                  utilization > 80 ? "text-red-400" : utilization > 50 ? "text-amber-400" : "text-emerald-400"
                                )}>
                                  {Math.round(utilization)}%
                                </p>
                                <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                                  <div 
                                    className={cn(
                                      "h-full transition-all duration-1000",
                                      utilization > 80 ? "bg-red-400" : utilization > 50 ? "bg-amber-400" : "bg-emerald-400"
                                    )}
                                    style={{ width: `${Math.min(utilization, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Action Row */}
                      <div className="flex gap-3 mt-4 h-12">
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/transactions?accountId=${acc.id}`); }}
                          className="flex-[0.7] bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black tracking-widest transition-all flex items-center justify-center gap-2 border border-white/10 active:scale-[0.98]"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                          TRANSACTIONS
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingAccountId(acc.id); setShowAccountModal(true); }}
                          className="flex-[0.3] bg-white text-slate-900 rounded-2xl transition-all flex items-center justify-center active:scale-[0.98] shadow-lg shadow-white/10"
                        >
                          <Settings className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
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

        {/* C. Loans & EMI - Debt Slayer Revamp */}
        {loans.length > 0 && (() => {
          // Compute Strategies
          const sortedByInterest = [...loans].sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0));
          const sortedByBalance = [...loans].sort((a, b) => Math.abs(a.balance) - Math.abs(b.balance));
          const avalanchePriorityId = sortedByInterest[0]?.id;
          const snowballMilestoneId = sortedByBalance[0]?.id;

          return (
            <section>
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <HandCoins className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span>Loans & EMI</span>
                  <span className="ml-1 text-[8px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">Slayer Mode</span>
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-tighter">
                    {loans.length} active debts
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center gap-6">
                {(expanded.loans ? loans : loans.slice(0, 2)).map(acc => {
                  const isAvalanche = acc.id === avalanchePriorityId;
                  const isSnowball = acc.id === snowballMilestoneId;
                  const outstanding = Math.abs(acc.balance);
                  
                  // Simple Simulation: Pay 10% extra
                  const extraPayment = (acc.emiAmount || 0) * 0.15;
                  const currentMonths = (acc.emiAmount || 0) > 0 ? outstanding / acc.emiAmount! : 0;
                  const newMonths = (acc.emiAmount || 0) > 0 ? outstanding / (acc.emiAmount! + extraPayment) : 0;
                  const monthsSaved = Math.max(0, Math.floor(currentMonths - newMonths));
                  const interestSaved = monthsSaved * (acc.emiAmount || 0) * 0.4; // Conservative 40% interest component approx

                  return (
                    <div 
                      key={acc.id} 
                      className="relative w-[340px] md:w-[380px] aspect-[1.586] [perspective:1000px] group cursor-pointer shrink-0"
                      onClick={() => toggleLoanFlip(acc.id)}
                    >
                      <div className={cn(
                        "relative w-full h-full transition-all duration-500 [transform-style:preserve-3d]",
                        flippedLoans[acc.id] && "[transform:rotateX(180deg)]"
                      )}>
                        {/* Front Side */}
                        <div className="absolute inset-0 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all [backface-visibility:hidden] flex flex-col justify-between overflow-hidden">
                          {/* Decorative background element */}
                          <div className="absolute -right-4 -top-4 w-32 h-32 bg-slate-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-700" />
                          
                          <div className="relative flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
                                {acc.logoUrl ? (
                                  <img src={acc.logoUrl} alt={acc.name} className="w-full h-full object-contain" />
                                ) : (
                                  <AccountIcon type={acc.type} name={acc.name} />
                                )}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-slate-900 truncate text-sm md:text-base leading-tight">{acc.name}</h4>
                                <p className="text-[9px] text-slate-400 font-medium mt-0.5">Next Due: <span className="font-bold text-slate-600">Day {acc.emiDate || '05'}</span></p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setEditingAccountId(acc.id); setShowAccountModal(true); }}
                                className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-all border border-slate-100 shadow-sm active:scale-95"
                              >
                                <Settings className="w-4 h-4 text-slate-400" />
                              </button>
                              {acc.interestRate && (
                                <span className="shrink-0 text-[10px] font-black text-orange-600 bg-orange-50/80 px-2.5 py-1 rounded-lg border border-orange-100 uppercase tracking-tighter">
                                  {acc.interestRate}% APR
                                </span>
                              )}
                              {(isAvalanche || isSnowball) && (
                                 <div className="absolute top-24 right-6">
                                    <span className={cn(
                                      "text-[8px] font-black px-3 py-1 rounded-lg border uppercase tracking-wider shadow-sm",
                                      isAvalanche ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                    )}>
                                      {isAvalanche ? 'Avalanche Priority' : 'Snowball Milestone'}
                                    </span>
                                 </div>
                               )}
                            </div>
                          </div>

                          {/* Chip removed */}
                          <div className="h-4" />

                          <div className="relative flex items-end justify-between">
                            <div>
                              <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Monthly EMI</p>
                              <p className="text-xl font-black text-slate-800 tabular-nums leading-none">{formatINR(acc.emiAmount || 0)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Outstanding</p>
                              <p className="text-xl font-black text-red-600 tabular-nums leading-none">{formatINR(outstanding)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Back Side: Strategy & Insights */}
                        <div className="absolute inset-0 bg-slate-900 rounded-3xl p-6 shadow-2xl [backface-visibility:hidden] [transform:rotateX(180deg)] flex flex-col justify-between border border-white/10 overflow-hidden">
                          {/* Strategic Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
                          
                          <div className="relative flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                <TrendingDown className="w-4 h-4 text-indigo-400" />
                              </div>
                              <div>
                                <span className="block text-[8px] font-black text-indigo-400 uppercase tracking-[0.2em] leading-none mb-1">Strategy Hub</span>
                                <div className="flex items-center gap-1.5">
                                  {isAvalanche && (
                                    <span 
                                      onClick={(e) => { e.stopPropagation(); setSelectedStrategyType('avalanche'); setShowStrategyModal(true); }}
                                      className="text-[7px] font-black bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/30 uppercase tracking-tighter cursor-help hover:bg-rose-500/40 hover:border-rose-500/50 transition-all"
                                    >
                                      Avalanche Priority
                                    </span>
                                  )}
                                  {isSnowball && (
                                    <span 
                                      onClick={(e) => { e.stopPropagation(); setSelectedStrategyType('snowball'); setShowStrategyModal(true); }}
                                      className="text-[7px] font-black bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase tracking-tighter cursor-help hover:bg-emerald-500/40 hover:border-emerald-500/50 transition-all"
                                    >
                                      Snowball Milestone
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setEditingAccountId(acc.id); setShowAccountModal(true); }}
                              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center transition-all hover:scale-110 active:scale-95 border border-white/5"
                            >
                              <MoreHorizontal className="w-4 h-4 text-white/70" />
                            </button>
                          </div>

                          <div className="relative grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                              <p className="text-[7px] font-black text-white/40 uppercase tracking-widest mb-1">Interest Saved</p>
                              <p className="text-sm font-black text-emerald-400 tabular-nums">~{formatINR(interestSaved)}</p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                              <p className="text-[7px] font-black text-white/40 uppercase tracking-widest mb-1">Months Saved</p>
                              <p className="text-sm font-black text-indigo-400 tabular-nums">{monthsSaved} Months</p>
                            </div>
                          </div>

                          <div className="relative pt-5 flex justify-end items-center mt-auto border-t border-white/10">
                            <div className="text-right">
                               <p className="text-[7px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">STRATEGY INSIGHT</p>
                               <p className="text-[10px] font-bold text-white/60">
                                 {isAvalanche ? 'Save Interest' : 'Build Momentum'}
                               </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {loans.length > 2 && (
                <button
                  onClick={() => toggleExpand('loans')}
                  className="mt-4 w-full py-3 border border-slate-200 rounded-2xl text-xs font-bold text-slate-400 hover:border-indigo-200 hover:text-indigo-600 transition-all bg-white/50 flex items-center justify-center gap-2 group/btn"
                >
                  {expanded.loans ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {expanded.loans ? 'Show Less' : `+${loans.length - 2} more loans & strategies`}
                </button>
              )}
            </section>
          );
        })()}

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
                        Current Balance: <span className="font-black text-indigo-600">{formatINR(acc.balance)}</span>
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
                      <AccountIcon type={acc.type} name={acc.name} />
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

        {/* F. Chit Funds - Elite UI */}
        {chitAccounts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8 px-1">
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4">
                <div className="w-12 h-12 rounded-[1.25rem] bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-200">
                  <RefreshCw className="w-6 h-6" />
                </div>
                Chit Funds
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100">
                  {chitAccounts.length} Active
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-8">
              {chitAccounts.map(acc => {
                const isFlipped = flippedLoans[acc.id];
                const accountTxns = transactions.filter(t => t.to_account_id === acc.id || (t.account_id === acc.id && t.type === 'income'));
                const monthsPaid = acc.paymentSchedule && acc.paymentSchedule.length > 0 
                  ? acc.paymentSchedule.filter((s: any) => s.paid).length 
                  : Math.max(acc.paidMonths || 0, accountTxns.length);
                const totalMonths = acc.tenureMonths || 1;
                const progressPct = Math.min(Math.round((monthsPaid / totalMonths) * 100), 100);
                const avgPaid = monthsPaid > 0 ? acc.balance / monthsPaid : (acc.emiAmount || 0);
                
                const maturityValue = Number(acc.maturityAmount) || 0;
                const totalCommitment = acc.paymentSchedule && acc.paymentSchedule.length > 0
                  ? acc.paymentSchedule.reduce((sum: number, s: any) => sum + s.amount, 0)
                  : Number(acc.balance) + (totalMonths - monthsPaid) * (acc.emiAmount || 0);
                const estProfit = maturityValue - totalCommitment;
                const isProfit = estProfit > 0;
                const isSame = Math.abs(estProfit) < 100;

                return (
                  <div 
                    key={acc.id} 
                    className="relative w-[360px] md:w-[400px] aspect-[1.586] [perspective:1500px] group cursor-pointer shrink-0"
                    onClick={() => toggleLoanFlip(acc.id)}
                  >
                    <div className={cn(
                      "relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] shadow-2xl rounded-[2.5rem]",
                      isFlipped && "[transform:rotateX(180deg)]"
                    )}>
                      {/* Front Side: Minimalist Progress */}
                      <div className="absolute inset-0 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm [backface-visibility:hidden] flex flex-col justify-between overflow-hidden">
                        <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-600/5 rounded-full" />
                        
                        <div className="relative flex items-start justify-between">
                          <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 text-indigo-600 flex items-center justify-center shrink-0 border border-slate-100 shadow-inner group-hover:bg-white transition-all">
                              {acc.logoUrl ? (
                                <img src={acc.logoUrl} alt={acc.name} className="w-full h-full object-contain p-3" />
                              ) : (
                                <AccountIcon type="chit" name={acc.name} className="w-10 h-10" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-black text-slate-900 text-xl tracking-tight leading-tight">{acc.name}</h4>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mt-1.5 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                MONTH {monthsPaid} OF {totalMonths}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                               <button 
                                 onClick={(e) => { e.stopPropagation(); setEditingAccountId(acc.id); setShowAccountModal(true); }}
                                 className="w-10 h-10 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-all border border-slate-100 shadow-sm active:scale-95"
                               >
                                 <Settings className="w-5 h-5 text-slate-400" />
                               </button>
                               <span className={cn(
                                 "text-[7px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-widest",
                                 isSame ? "bg-slate-100 text-slate-500 border-slate-200" :
                                 isProfit ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                               )}>
                                 {isSame ? 'BREAK-EVEN' : isProfit ? 'PROFIT' : 'COST'}
                               </span>
                          </div>
                        </div>

                        {/* Progress Bar Section */}
                        <div className="relative space-y-3">
                           <div className="flex justify-between items-end">
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">FUNDING PROGRESS</p>
                                <p className="text-sm font-black text-slate-900">{formatINR(acc.balance)} Paid</p>
                              </div>
                              <p className="text-2xl font-black text-indigo-600 tracking-tighter">{progressPct}%</p>
                           </div>
                           <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 shadow-inner">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPct}%` }}
                                className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 rounded-full shadow-lg"
                              />
                           </div>
                        </div>

                        <div className="relative flex justify-between items-center text-[10px] font-bold text-slate-400 italic">
                           <span>Maturity Date: {acc.maturityDate ? format(new Date(acc.maturityDate), 'MMM yyyy') : '--'}</span>
                           <span className="text-indigo-500 not-italic uppercase tracking-widest font-black text-[8px] animate-bounce">Flip for Stats →</span>
                        </div>
                      </div>

                      {/* Back Side: Financial Data & Stats */}
                      <div className="absolute inset-0 bg-slate-950 rounded-[2.5rem] p-8 shadow-2xl [backface-visibility:hidden] [transform:rotateX(180deg)] flex flex-col border border-white/10 overflow-hidden text-white">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.15),transparent)] pointer-events-none" />
                        
                        <div className="relative grid grid-cols-2 gap-x-8 gap-y-4 mb-4">
                          <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.2em]">MATURITY VALUE</p>
                            <p className="text-lg font-black text-white tabular-nums tracking-tighter">{formatINR(maturityValue)}</p>
                          </div>
                          <div className="text-right space-y-0.5">
                            <p className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.2em]">EST. RETURN</p>
                            <p className={cn("text-lg font-black tabular-nums tracking-tighter", isProfit ? "text-emerald-400" : "text-rose-400")}>
                               {isProfit ? '+' : ''}{formatINR(estProfit)}
                            </p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">TOTAL PAYABLE</p>
                            <p className="text-sm font-black text-slate-300 tabular-nums tracking-tighter">{formatINR(totalCommitment)}</p>
                          </div>
                          <div className="text-right space-y-0.5">
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">MONTHLY DUES</p>
                            <p className="text-sm font-black text-slate-300 tabular-nums tracking-tighter">{formatINR(acc.emiAmount || 0)}</p>
                          </div>
                        </div>

                        <div className="relative pt-5 flex justify-end items-center mt-auto border-t border-white/10">
                          <div className="text-right">
                             <p className="text-[7px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">AVG PAYMENT</p>
                             <p className="text-xs font-black text-white tabular-nums">
                               {formatINR(avgPaid)}/mo
                             </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </div>

      {/* Account Modal is already defined at line 160 */}

      {/* Strategy Info Modal */}
      <AnimatePresence>
        {showStrategyModal && selectedStrategyType && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStrategyModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100"
            >
              <div className={cn(
                "p-8",
                selectedStrategyType === 'avalanche' ? "bg-rose-50" : "bg-emerald-50"
              )}>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
                      selectedStrategyType === 'avalanche' ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
                    )}>
                      {selectedStrategyType === 'avalanche' ? <Zap className="w-6 h-6 fill-current" /> : <Target className="w-6 h-6" />}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 leading-tight">
                        {selectedStrategyType === 'avalanche' ? 'Debt Avalanche' : 'Debt Snowball'}
                      </h2>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Personalized Strategy</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowStrategyModal(false)}
                    className="w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-5 h-5 rotate-45" />
                  </button>
                </div>

                <p className="text-slate-600 leading-relaxed font-medium">
                  {selectedStrategyType === 'avalanche' 
                    ? "Focus on the debt with the highest interest rate first to save the most money over time. Mathematically, this is the most efficient path."
                    : "Focus on the smallest balance first to build momentum. Clearing individual debts quickly provides the psychological win needed to stay motivated."}
                </p>
              </div>

              <div className="p-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Your Payoff Roadmap</h3>
                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {getStrategyPath(selectedStrategyType).map((loan, idx) => (
                    <div key={loan.id} className="flex items-start gap-4 group">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-colors",
                          idx === 0 
                            ? selectedStrategyType === 'avalanche' ? "bg-rose-500 border-rose-500 text-white" : "bg-emerald-500 border-emerald-500 text-white"
                            : "border-slate-200 text-slate-400 group-hover:border-indigo-300"
                        )}>
                          {idx + 1}
                        </div>
                        {idx !== getStrategyPath(selectedStrategyType).length - 1 && (
                          <div className="w-[2px] h-8 bg-slate-100" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm leading-tight">{loan.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold text-slate-400">{loan.interestRate}% APR</span>
                              <div className="w-1 h-1 rounded-full bg-slate-200" />
                              <span className="text-[10px] font-bold text-slate-400">{formatINR(Math.abs(loan.balance))} Balance</span>
                            </div>
                          </div>
                          {idx === 0 && (
                            <span className={cn(
                              "text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-tighter",
                              selectedStrategyType === 'avalanche' ? "bg-rose-50 text-rose-500 border-rose-100" : "bg-emerald-50 text-emerald-500 border-emerald-100"
                            )}>
                              Slay First
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100">
                  <button 
                    onClick={() => setShowStrategyModal(false)}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold tracking-widest text-xs shadow-xl shadow-slate-900/20 hover:bg-black transition-all active:scale-[0.98]"
                  >
                    GOT IT, LET'S SLAY
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
