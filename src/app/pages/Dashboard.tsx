import React, { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownRight, Eye, EyeOff, LayoutGrid, ChevronDown, TrendingUp, X, Check, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { format, subDays, getDaysInMonth, getDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subWeeks, eachDayOfInterval, addWeeks, subMonths, addMonths, subYears, addYears, addDays, differenceInCalendarDays, isSameDay, isSameMonth, endOfDay, startOfYear, endOfYear } from "date-fns";
import { useFinance, Transaction, Account } from "../context/FinanceContext";
import { formatINR } from "../utils";
import { Link, useNavigate } from "react-router";
import { TransactionFormModal } from "../components/TransactionFormModal";
import { toast } from "sonner";

const Card = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <div onClick={onClick} className={`bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100 ${className}`}>
    {children}
  </div>
);

const ListCard = ({ icon, title, subtitle, amount, badgeText, badgeType }: any) => (
  <div className="flex items-center justify-between py-3 hover:bg-slate-50 transition-colors rounded-xl px-2 -mx-2 pointer-events-none">
    <div className="flex items-center gap-3">
      {typeof icon === 'string' ? (
        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-700">{icon}</div>
      ) : icon}
      <div>
        <p className="text-[14px] font-medium text-slate-800">{title}</p>
        <p className="text-[12px] text-slate-500">{subtitle}</p>
      </div>
    </div>
    <div className="text-right flex flex-col items-end gap-1">
      <p className={`font-semibold text-[14px] ${amount.startsWith('-') ? 'text-red-500' : amount.startsWith('+') ? 'text-emerald-600' : 'text-slate-800'}`}>{amount}</p>
      {badgeText && (
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badgeType === 'danger' ? 'bg-red-50 text-red-500' : badgeType === 'success' ? 'bg-emerald-50 text-emerald-600' : badgeType === 'warning' ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-600'}`}>
          {badgeText}
        </span>
      )}
    </div>
  </div>
);

// Real sparkline bars are computed from actual transaction data - see barsIncome/barsExpense useMemo below

// Swipeable wrapper for ListCard
const SwipeableCard = ({ children, onSwipeLeft, onSwipeRight, rightActionLabel, leftActionLabel, rightActionIcon, leftActionIcon, onClick }: any) => {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const handleStart = (clientX: number) => { setStartX(clientX); setIsDragging(true); };
  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    const delta = clientX - startX;
    if (Math.abs(delta) < 100) setOffset(delta);
  };
  const handleEnd = () => {
    setIsDragging(false);
    if (offset > 50 && onSwipeRight) onSwipeRight();
    else if (offset < -50 && onSwipeLeft) onSwipeLeft();
    setOffset(0);
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-slate-100 cursor-pointer mb-1 select-none">
      <div className="absolute inset-0 flex justify-between items-center px-5">
        <div className="text-emerald-600 font-bold text-xs flex items-center gap-1">{rightActionIcon} {rightActionLabel}</div>
        <div className="text-red-500 font-bold text-xs flex items-center gap-1">{leftActionLabel} {leftActionIcon}</div>
      </div>
      <div
        onTouchStart={e => handleStart(e.touches[0].clientX)} onTouchMove={e => handleMove(e.touches[0].clientX)} onTouchEnd={handleEnd}
        onMouseDown={e => handleStart(e.clientX)} onMouseMove={e => isDragging && handleMove(e.clientX)} onMouseUp={handleEnd} onMouseLeave={handleEnd}
        onClick={onClick}
        className="relative bg-white z-10 transition-transform duration-200"
        style={{ transform: `translateX(${offset}px)` }}
      >
        {children}
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const { getNetWorth, transactions, accounts, profile, updateProfile, investments, entities, addTransaction, updateEntity } = useFinance();
  const navigate = useNavigate();
  const [showHeroBreakdown, setShowHeroBreakdown] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("1M");
  const [showHeatmap, setShowHeatmap] = useState(false);
  const isMasked = profile.maskBalances || false;
  const setIsMasked = (val: boolean) => updateProfile({ maskBalances: val });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editTxId, setEditTxId] = useState<string | null>(null);
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());

  const handleGlobalFilter = (filter: string) => {
    setGlobalFilter(filter);
    setReferenceDate(new Date());
  };

  const navigatePeriod = (dir: 'prev' | 'next') => {
    let newDate = referenceDate;
    if (globalFilter === '1W') newDate = dir === 'prev' ? subWeeks(referenceDate, 1) : addWeeks(referenceDate, 1);
    if (globalFilter === '1M') newDate = dir === 'prev' ? subMonths(referenceDate, 1) : addMonths(referenceDate, 1);
    if (globalFilter === '1Y') newDate = dir === 'prev' ? subYears(referenceDate, 1) : addYears(referenceDate, 1);

    if (newDate > new Date()) newDate = new Date();
    setReferenceDate(newDate);
  };

  // Dynamic Filtering based on global filter
  const now = referenceDate;
  const filteredTransactions = useMemo(() => {
    let startDate: Date;
    let endDate: Date = endOfDay(now);
    if (globalFilter === "1W") { startDate = startOfWeek(now); endDate = endOfWeek(now); }
    else if (globalFilter === "1M") { startDate = startOfMonth(now); endDate = endOfMonth(now); }
    else { startDate = startOfYear(now); endDate = endOfYear(now); }
    return transactions.filter((t: Transaction) => {
      const txDate = new Date(t.date);
      return txDate >= startDate && txDate <= endDate;
    });
  }, [transactions, globalFilter, referenceDate]);

  const periodIncome = useMemo(() => filteredTransactions.filter((t: Transaction) => t.type === 'income').reduce((sum: number, t: Transaction) => sum + t.amount, 0), [filteredTransactions]);
  const periodExpense = useMemo(() => filteredTransactions.filter((t: Transaction) => t.type === 'expense').reduce((sum: number, t: Transaction) => sum + t.amount, 0), [filteredTransactions]);
  
  const getPeriodLabel = () => {
    if (globalFilter === '1W') return format(referenceDate, "'Week of' MMM dd");
    if (globalFilter === '1M') return format(referenceDate, "MMMM yyyy");
    if (globalFilter === '1Y') return format(referenceDate, "yyyy");
    return "";
  };

  const periodLabel = getPeriodLabel();
  const periodTitle = globalFilter === "1W" ? "Weekly" : globalFilter === "1M" ? "Monthly" : "Yearly";

  const historicalAccounts = useMemo(() => {
    if (isSameDay(referenceDate, new Date())) return accounts;
    return accounts.map((a: Account) => {
      const futureTx = transactions.filter((t: Transaction) => new Date(t.date) > endOfDay(referenceDate) && (t.account_id === a.id || t.to_account_id === a.id));
      let netChange = 0;
      futureTx.forEach((t: Transaction) => {
        if (t.type === 'income' && t.account_id === a.id) netChange += t.amount;
        if (t.type === 'expense' && t.account_id === a.id) netChange -= t.amount;
        if (t.type === 'transfer') {
          if (t.account_id === a.id) netChange -= t.amount;
          if (t.to_account_id === a.id) netChange += t.amount;
        }
      });
      return { ...a, balance: a.balance - netChange };
    });
  }, [accounts, transactions, referenceDate]);

  const totalInvestmentValue = useMemo(() => investments.reduce((sum: number, inv: any) => sum + inv.currentValue, 0), [investments]);

  const historicalNetWorth = useMemo(() => historicalAccounts.reduce((sum: number, a: Account) => sum + a.balance, 0) + totalInvestmentValue, [historicalAccounts, totalInvestmentValue]);
  const historicalAssets = useMemo(() => historicalAccounts.filter((a: Account) => a.type !== 'credit_card' && a.type !== 'loan').reduce((s: number, a: Account) => s + a.balance, 0) + totalInvestmentValue, [historicalAccounts, totalInvestmentValue]);
  const historicalLiabilities = useMemo(() => historicalAccounts.filter((a: Account) => a.type === 'credit_card' || a.type === 'loan').reduce((s: number, a: Account) => s + a.balance, 0), [historicalAccounts]);

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  const prevPeriodStats = useMemo(() => {
    let days = 7;
    if (globalFilter === "1M") days = 30;
    if (globalFilter === "1Y") days = 365;

    const currentStart = subDays(now, days);
    const prevStart = subDays(now, days * 2);

    const prevTx = transactions.filter((t: Transaction) => {
      const txDate = new Date(t.date);
      return txDate >= prevStart && txDate < currentStart;
    });

    const pInc = prevTx.filter((t: Transaction) => t.type === 'income').reduce((s: number, t: Transaction) => s + t.amount, 0);
    const pExp = prevTx.filter((t: Transaction) => t.type === 'expense').reduce((s: number, t: Transaction) => s + t.amount, 0);

    const prevAccounts = accounts.map((a: Account) => {
      const futureTx = transactions.filter((t: Transaction) => new Date(t.date) > endOfDay(currentStart) && (t.account_id === a.id || t.to_account_id === a.id));
      let netChange = 0;
      futureTx.forEach((t: Transaction) => {
        if (t.type === 'income' && t.account_id === a.id) netChange += t.amount;
        if (t.type === 'expense' && t.account_id === a.id) netChange -= t.amount;
        if (t.type === 'transfer') {
          if (t.account_id === a.id) netChange -= t.amount;
          if (t.to_account_id === a.id) netChange += t.amount;
        }
      });
      return { ...a, balance: a.balance - netChange };
    });

    const pNW = prevAccounts.reduce((sum: number, a: Account) => sum + a.balance, 0);
    return { pInc, pExp, pNW };
  }, [transactions, accounts, globalFilter, referenceDate]);

  // Real sparkline bars: last 10 days income/expense normalised to 0–100
  const barsIncome = useMemo(() => {
    const days = Array.from({ length: 10 }, (_, i) => subDays(now, 9 - i));
    const vals = days.map(d => {
      const ds = format(d, "yyyy-MM-dd");
      return transactions.filter((t: Transaction) => t.date === ds && t.type === 'income').reduce((s: number, t: Transaction) => s + t.amount, 0);
    });
    const max = Math.max(...vals, 1);
    return vals.map(v => Math.round((v / max) * 100));
  }, [transactions, referenceDate]);

  const barsExpense = useMemo(() => {
    const days = Array.from({ length: 10 }, (_, i) => subDays(now, 9 - i));
    const vals = days.map(d => {
      const ds = format(d, "yyyy-MM-dd");
      return transactions.filter((t: Transaction) => t.date === ds && t.type === 'expense').reduce((s: number, t: Transaction) => s + t.amount, 0);
    });
    const max = Math.max(...vals, 1);
    return vals.map(v => Math.round((v / max) * 100));
  }, [transactions, referenceDate]);

  const netWorthChange = getPercentageChange(historicalNetWorth, prevPeriodStats.pNW);
  const incomeChange = getPercentageChange(periodIncome, prevPeriodStats.pInc);
  const expenseChange = getPercentageChange(periodExpense, prevPeriodStats.pExp);

  const chartData = useMemo(() => {
    const daysCount = globalFilter === "1W" ? 7 : globalFilter === "1M" ? 30 : 365;
    const data = [];
    const loopLimit = globalFilter === "1Y" ? 30 : daysCount; 
    
    let currentNW = historicalNetWorth;
    
    for (let i = 0; i < loopLimit; i++) {
      const dateObj = subDays(now, i);
      const dateStr = format(dateObj, "yyyy-MM-dd");
      const dayTx = transactions.filter(t => t.date === dateStr);
      
      const inc = dayTx.filter((t: Transaction) => t.type === 'income').reduce((sum: number, t: Transaction) => sum + t.amount, 0);
      const exp = dayTx.filter((t: Transaction) => t.type === 'expense').reduce((sum: number, t: Transaction) => sum + t.amount, 0);
      
      // Investment category expenses represent a shift in assets, not a loss of net worth
      const nwExp = dayTx.filter((t: Transaction) => t.type === 'expense' && t.category !== 'Investment').reduce((sum: number, t: Transaction) => sum + t.amount, 0);
      
      data.push({ 
        date: format(dateObj, "MMM dd"), 
        income: inc, 
        expense: exp, 
        net: inc - exp,
        cumulativeNW: currentNW 
      });
      
      currentNW -= (inc - nwExp);
    }

    // Sort to ensure chronological order for the line chart
    const finalData = data.reverse();
    
    // Smooth the data if needed or handle the scale
    return finalData;
  }, [transactions, globalFilter, referenceDate, historicalNetWorth]);


  const CATEGORY_COLORS = ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

  // Use a zoomed-in domain for sparkline if variance is low
  const sparklineDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 0];
    const values = chartData.map(d => d.cumulativeNW);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1 || max * 0.001; // Ensure some padding even if flat
    return [min - padding, max + padding];
  }, [chartData]);

  const sparklineData = chartData;
  const recentTransactions = transactions.slice(0, 5);

  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || 'Account';

  const [paidEntityIds, setPaidEntityIds] = useState<Set<string>>(new Set());

  const calculateNextDue = (entityId: string, frequency: string): string | null => {
    const entity = entities.find(e => e.id === entityId);
    const base = entity?.nextDue ? new Date(entity.nextDue) : new Date();
    const freq = (frequency || '').toLowerCase();
    if (freq === 'weekly') return format(addWeeks(base, 1), 'yyyy-MM-dd');
    if (freq === 'monthly') return format(addMonths(base, 1), 'yyyy-MM-dd');
    if (freq === 'quarterly') return format(addMonths(base, 3), 'yyyy-MM-dd');
    if (freq === 'yearly') return format(addYears(base, 1), 'yyyy-MM-dd');
    return format(addMonths(base, 1), 'yyyy-MM-dd');
  };

  const handleMarkPaid = (item: { entityId: string; title: string; amount: number; category: string; frequency?: string }) => {
    if (paidEntityIds.has(item.entityId)) {
      setPaidEntityIds(prev => { const s = new Set(prev); s.delete(item.entityId); return s; });
      return;
    }
    addTransaction({
      amount: item.amount,
      type: 'expense',
      category: item.category || 'Bills',
      account_id: accounts[0]?.id || '',
      payee: item.title,
      date: format(new Date(), 'yyyy-MM-dd'),
      notes: `Auto-logged from upcoming: ${item.title}`,
      tags: ['recurring'],
      mode: 'UPI',
      status: 'cleared',
    });
    const nextDue = calculateNextDue(item.entityId, item.frequency || 'monthly');
    if (nextDue) updateEntity(item.entityId, { nextDue, status: 'active' });
    setPaidEntityIds(prev => new Set([...prev, item.entityId]));
    toast.success(`${formatINR(item.amount)} logged for ${item.title}`);
  };

  const handleMarkHold = (entityId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'hold' ? 'active' : 'paused';
    updateEntity(entityId, { status: newStatus as 'active' | 'paused' });
    toast.success(newStatus === 'paused' ? 'Payment put on hold' : 'Payment resumed');
  };

  const upcomingItems = useMemo(() => {
    const today = new Date();
    const cutoff = addDays(today, 14);
    return entities
      .filter(e => (e.type === 'subscription' || e.type === 'recurring') && e.nextDue && e.amount)
      .filter(e => new Date(e.nextDue!) <= cutoff)
      .sort((a, b) => new Date(a.nextDue!).getTime() - new Date(b.nextDue!).getTime())
      .slice(0, 5)
      .map(e => {
        const due = new Date(e.nextDue!);
        const diff = differenceInCalendarDays(due, today);
        const isOverdue = diff < 0;
        const badge = isOverdue
          ? `Overdue ${Math.abs(diff)}d`
          : diff === 0 ? 'Due Today' : `Due in ${diff}d`;
        return {
          id: e.id,
          entityId: e.id,
          title: e.name,
          due: isOverdue ? `Overdue by ${Math.abs(diff)} days` : diff === 0 ? 'Due Today' : `Due in ${diff} days`,
          amt: formatINR(e.amount || 0),
          badge,
          type: (isOverdue || diff <= 3 ? 'danger' : 'warning') as string,
          icon: e.name.charAt(0).toUpperCase(),
          status: e.status === 'paused' ? 'hold' : 'pending',
          amount: e.amount || 0,
          category: e.category || 'Bills',
          frequency: e.frequency,
        };
      });
  }, [entities]);

  const scheduledItems = useMemo(() => {
    return entities
      .filter(e => e.type === 'recurring' && e.amount && e.frequency)
      .slice(0, 5)
      .map(e => ({
        id: e.id,
        entityId: e.id,
        title: e.name,
        due: e.nextDue ? format(new Date(e.nextDue), 'MMM dd, yyyy') : (e.frequency || 'Recurring'),
        amt: formatINR(e.amount || 0),
        badge: e.status === 'paused' ? 'Paused' : 'Active',
        type: 'success' as string,
        icon: '🔁',
        status: e.status === 'paused' ? 'hold' : 'pending',
        amount: e.amount || 0,
        category: e.category || 'Bills',
        frequency: e.frequency,
      }));
  }, [entities]);

  const renderHeatmap = () => {
    const getDayStats = (d: Date) => {
      const dateStr = format(d, "yyyy-MM-dd");
      const dayTx = transactions.filter(t => t.date === dateStr);
      if (dayTx.length === 0) return { type: 'empty' };

      const inc = dayTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const exp = dayTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const trf = dayTx.filter(t => t.type === 'transfer').reduce((s, t) => s + t.amount, 0);

      if (trf > inc && trf > exp) return { type: 'transfer' };
      if (inc > exp) return { type: 'income' };
      if (exp > inc) return { type: 'expense' };
      if (inc === exp && inc > 0) return { type: 'equal' };
      return { type: 'empty' };
    };

    const getBgColor = (stats: { type: string }) => {
      if (stats.type === 'empty') return "bg-slate-100";
      if (stats.type === 'income') return "bg-emerald-400";
      if (stats.type === 'expense') return "bg-red-400";
      if (stats.type === 'transfer') return "bg-blue-400";
      if (stats.type === 'equal') return "bg-yellow-400";
      return "bg-slate-100";
    };

    if (globalFilter === "1M" || globalFilter === "1W") {
      const weeksToSubtract = globalFilter === "1W" ? 0 : 4;
      const refStart = globalFilter === "1W" ? startOfWeek(referenceDate) : startOfMonth(referenceDate);
      const refEnd = globalFilter === "1W" ? endOfWeek(referenceDate) : endOfMonth(referenceDate);
      const start = startOfWeek(subWeeks(refStart, weeksToSubtract));
      const end = endOfWeek(refEnd);
      const days = eachDayOfInterval({ start, end });

      const matrixRows = Math.ceil(days.length / 7);
      const matrix = Array(matrixRows).fill(null).map(() => Array(7).fill(null));
      days.forEach((d, i) => { matrix[Math.floor(i / 7)][getDay(d)] = d; });

      return (
        <div className="flex flex-col gap-2 w-full overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-2 min-w-max pl-8">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => <div key={i} className="w-6 text-center text-[10px] font-bold text-slate-400">{day}</div>)}
          </div>
          {matrix.map((week, wIdx) => {
            if (!week.some(d => d !== null)) return null;
            return (
              <div key={wIdx} className="flex gap-2 min-w-max items-center">
                <div className="w-6 text-right text-[10px] font-bold text-slate-400 pr-2">W{wIdx + 1}</div>
                {week.map((day, dIdx) => {
                  if (!day) return <div key={dIdx} className="w-6 h-6 bg-transparent" />;
                  const stats = getDayStats(day);
                  return (
                    <div key={dIdx} onClick={() => setSelectedDate(day)} className={`w-6 h-6 rounded-[4px] ${getBgColor(stats)} hover:scale-110 hover:ring-2 ring-slate-300 cursor-pointer transition-all`} title={`${format(day, "MMM dd")}: ${stats.type}`} />
                  );
                })}
              </div>
            )
          })}
        </div>
      );
    } else {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return (
        <div className="flex flex-col gap-1.5 w-full overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-1.5 min-w-max pl-8">
            {Array.from({ length: 31 }).map((_, i) => <div key={i} className="w-4 text-center text-[8px] font-bold text-slate-400">{i + 1}</div>)}
          </div>
          {Array.from({ length: 12 }).map((_, mIdx) => {
            const daysInM = getDaysInMonth(new Date(now.getFullYear(), mIdx));
            return (
              <div key={mIdx} className="flex gap-1.5 min-w-max items-center">
                <div className="w-6 text-right text-[10px] font-bold text-slate-400 pr-1">{monthNames[mIdx]}</div>
                {Array.from({ length: 31 }).map((_, dIdx) => {
                  if (dIdx >= daysInM) return <div key={dIdx} className="w-4 h-4 bg-transparent pointer-events-none" />;
                  const date = new Date(now.getFullYear(), mIdx, dIdx + 1);
                  const stats = getDayStats(date);
                  return (
                    <div key={dIdx} onClick={() => setSelectedDate(date)} className={`w-4 h-4 rounded-[3px] ${getBgColor(stats)} hover:scale-125 cursor-pointer transition-all`} title={`${monthNames[mIdx]} ${dIdx + 1}: ${stats.type}`} />
                  );
                })}
              </div>
            )
          })}
        </div>
      );
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto w-full relative">

      {/* Sticky Header with Filters */}
      <div className="sticky top-0 z-40 bg-slate-50/80 backdrop-blur-md px-4 py-3 -mx-4 border-b border-slate-200/50 mb-4 flex items-center justify-between">
        <div className="bg-slate-200/50 rounded-lg p-1 flex gap-1 border border-slate-300/30">
          {['1W', '1M', '1Y'].map(f => (
            <button key={f} onClick={() => handleGlobalFilter(f)} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${globalFilter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{f}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
          <button onClick={() => navigatePeriod('prev')} className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-slate-900 text-[11px] font-bold w-24 text-center">
            {isSameMonth(referenceDate, new Date()) && isSameDay(referenceDate, new Date()) ? 'TODAY' : format(referenceDate, globalFilter === '1Y' ? 'yyyy' : 'MMM dd, yyyy')}
          </span>
          <button onClick={() => navigatePeriod('next')} disabled={isSameMonth(referenceDate, new Date()) && isSameDay(referenceDate, new Date())} className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="px-4 pb-10 space-y-6">

      {selectedDate && (() => {
        const dayTxs = transactions.filter(t => t.date === format(selectedDate, "yyyy-MM-dd"));
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl text-slate-800">{format(selectedDate, "MMM dd, yyyy")}</h3>
                <button onClick={() => setSelectedDate(null)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="overflow-y-auto flex-1 space-y-2">
                {dayTxs.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-10">No transactions on this day.</p>
                ) : dayTxs.map(tx => (
                  <div key={tx.id} onClick={() => { setSelectedDate(null); setEditTxId(tx.id); }} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${tx.type === 'expense' ? 'bg-orange-50 text-orange-500' : tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'}`}>{tx.payee.charAt(0)}</div>
                      <div>
                        <p className="font-semibold text-sm text-slate-800">{tx.payee}</p>
                        <p className="text-xs text-slate-400">{tx.category}</p>
                      </div>
                    </div>
                    <span className={`font-black text-sm ${tx.type === 'expense' ? 'text-red-500' : 'text-emerald-600'}`}>{tx.type === 'expense' ? '-' : '+'}{formatINR(tx.amount)}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setSelectedDate(null)} className="mt-4 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all">Close</button>
            </div>
          </div>
        );
      })()}

      {/* Hero Card */}
      <div className="bg-[#0B1220] text-white rounded-[24px] p-6 md:p-8 shadow-xl relative overflow-hidden transition-all duration-300 w-full min-h-[220px] flex flex-col justify-between group">
        <div className="absolute inset-x-0 bottom-0 h-44 opacity-60 transition-opacity z-0 pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line type="monotone" dataKey="cumulativeNW" stroke="#10B981" strokeWidth={4} dot={false} isAnimationActive={true} />
              <YAxis domain={sparklineDomain} hide />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium text-sm whitespace-nowrap">Total Net Worth</span>
              <button onClick={() => setIsMasked(!isMasked)} className="text-slate-400 hover:text-white transition-colors">{isMasked ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-[40px] md:text-[48px] font-bold tracking-tight mb-1">{isMasked ? '₹ •••••••' : formatINR(historicalNetWorth)}</h1>
              <div className="flex items-center gap-2">
                {netWorthChange >= 0 ? <ArrowUpRight className="w-4 h-4 text-emerald-400" /> : <ArrowDownRight className="w-4 h-4 text-red-400" />}
                <span className={`${netWorthChange >= 0 ? 'text-emerald-400' : 'text-red-400'} font-medium text-sm`}>{Math.abs(netWorthChange).toFixed(1)}% vs last {periodTitle.toLowerCase().replace('ly', '')}</span>
              </div>
            </div>
            <button onClick={() => setShowHeroBreakdown(!showHeroBreakdown)} className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-semibold transition-colors backdrop-blur-md border border-white/10 w-fit active:scale-95 outline-none focus:outline-none">
              Breakdown <ChevronDown className={`w-4 h-4 transition-transform ${showHeroBreakdown ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
        <div className={`relative z-10 w-full overflow-hidden transition-all duration-300 ease-in-out ${showHeroBreakdown ? 'max-h-40 mt-6 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 text-[10px] md:text-xs mb-1 uppercase tracking-wider font-semibold">Total Assets</p>
              <p className="font-bold text-lg md:text-xl">{isMasked ? '₹ •••••' : formatINR(historicalAssets)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] md:text-xs mb-1 uppercase tracking-wider font-semibold">Liabilities</p>
              <p className="font-bold text-lg md:text-xl text-red-400">{isMasked ? '₹ •••••' : formatINR(historicalLiabilities)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        {/* Income Card */}
        <Card onClick={() => navigate(`/transactions?type=income&start=${subDays(now, globalFilter === '1W' ? 7 : globalFilter === '1M' ? 30 : 365).getTime()}&end=${endOfDay(now).getTime()}`)} className="flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all h-[140px] md:h-[160px] cursor-pointer">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 flex-shrink-0 border border-emerald-100"><ArrowUpRight className="w-4 h-4" /></div>
              <span className="text-slate-500 font-medium text-xs md:text-sm">Income • {periodLabel}</span>
            </div>
          </div>
          <h3 className="text-xl md:text-3xl font-bold text-slate-800 truncate mb-1">{isMasked ? '₹ •••••' : formatINR(periodIncome)}</h3>
          <div className="flex justify-between items-end">
            <div className={`flex items-center gap-1 text-[10px] md:text-xs font-medium px-1.5 md:px-2 py-0.5 md:py-1 rounded-md ${incomeChange >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
              {incomeChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />} {Math.abs(incomeChange).toFixed(1)}% <span className="hidden lg:inline">vs last {periodTitle.toLowerCase().replace('ly', '')}</span>
            </div>
            <div className="flex items-end gap-1 h-8 opacity-80">{barsIncome.map((h, i) => <div key={i} className="w-1 md:w-1.5 bg-emerald-200 rounded-t-sm" style={{ height: `${h}%` }}></div>)}</div>
          </div>
        </Card>

        {/* Expense Card */}
        <Card onClick={() => navigate(`/transactions?type=expense&start=${subDays(now, globalFilter === '1W' ? 7 : globalFilter === '1M' ? 30 : 365).getTime()}&end=${endOfDay(now).getTime()}`)} className="flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all h-[140px] md:h-[160px] cursor-pointer">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 flex-shrink-0 border border-red-100"><ArrowDownRight className="w-4 h-4" /></div>
              <span className="text-slate-500 font-medium text-xs md:text-sm">Expenses • {periodLabel}</span>
            </div>
          </div>
          <h3 className="text-xl md:text-3xl font-bold text-slate-800 truncate mb-1">{isMasked ? '₹ •••••' : formatINR(periodExpense)}</h3>
          <div className="flex justify-between items-end">
            <div className={`flex items-center gap-1 text-[10px] md:text-xs font-medium px-1.5 md:px-2 py-0.5 md:py-1 rounded-md ${expenseChange <= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
              {expenseChange <= 0 ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />} {Math.abs(expenseChange).toFixed(1)}% <span className="hidden lg:inline">vs last {periodTitle.toLowerCase().replace('ly', '')}</span>
            </div>
            <div className="flex items-end gap-1 h-8 opacity-80">{barsExpense.map((h, i) => <div key={i} className="w-1 md:w-1.5 bg-red-300 rounded-t-sm" style={{ height: `${h}%` }}></div>)}</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-5 md:p-6 overflow-hidden">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-[16px]">Cashflow Intensity • {periodLabel}</h3>
                <button onClick={() => setShowHeatmap(!showHeatmap)} className="text-sm border rounded-lg px-3 py-1.5 font-medium flex items-center gap-2 transition-colors bg-white border-slate-200 text-slate-600 hover:bg-slate-50">
                  {showHeatmap ? <TrendingUp className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />} <span className="hidden sm:inline">{showHeatmap ? "Trendline" : "Heatmap"}</span>
                </button>
              </div>
              <div className="mt-3">
                {!showHeatmap ? (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Income</div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><div className="w-2 h-2 rounded-full bg-red-500"></div> Expense</div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Net</div>
                  </div>
                ) : globalFilter === "1M" || globalFilter === "1W" ? (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><div className="w-2 h-2 rounded-sm bg-emerald-400"></div> Income</div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><div className="w-2 h-2 rounded-sm bg-red-400"></div> Expense</div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><div className="w-2 h-2 rounded-sm bg-blue-400"></div> Transfer</div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><div className="w-2 h-2 rounded-sm bg-yellow-400"></div> Balance</div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                    Low <div className="w-2.5 h-2.5 bg-emerald-400 rounded-sm mx-0.5"></div>
                    <div className="w-2.5 h-2.5 bg-yellow-300 rounded-sm mx-0.5"></div>
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-sm mx-0.5"></div> High
                  </div>
                )}
              </div>
            </div>
            {showHeatmap ? (
              <div className="w-full flex flex-col justify-center animate-in fade-in duration-300">{renderHeatmap()}</div>
            ) : (
              <div className="h-[250px] w-full animate-in fade-in duration-300" style={{ minHeight: 250, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B', fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B', fontWeight: 500 }} tickFormatter={(val) => `₹${val / 1000}k`} allowDecimals={false} tickCount={4} minTickGap={30} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number, name: string) => [formatINR(value), name.charAt(0).toUpperCase() + name.slice(1)]} />
                    <Line type="monotone" dataKey="income" stroke="#22C55E" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="net" stroke="#3B82F6" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <Card className="p-5 hidden lg:block">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[15px] text-slate-800">Recent Transactions</h3>
              <Link to="/transactions" className="text-indigo-600 text-sm font-semibold hover:underline">View All</Link>
            </div>
            <div className="space-y-1">
              {recentTransactions.map(tx => (
                <div key={tx.id} onClick={() => setEditTxId(tx.id)} className="cursor-pointer">
                  <ListCard icon={<div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${tx.type === 'expense' ? 'bg-orange-50 text-orange-500' : tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'}`}>{tx.payee.charAt(0)}</div>} title={tx.payee} subtitle={`${tx.category} • ${format(new Date(tx.date), "MMM dd")}`} amount={`${tx.type === 'expense' ? '-' : '+'}${formatINR(tx.amount)}`} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[15px] text-slate-800">Upcoming Payments <span className="text-[10px] text-slate-400 font-normal ml-2 hidden sm:inline">(Swipe LR)</span></h3>
                <Link to="/settings" className="text-indigo-600 text-sm font-semibold hover:underline">Manage</Link>
              </div>
              <div className="space-y-1">
                {upcomingItems.map(item => {
                  const isPaid = paidEntityIds.has(item.entityId);
                  const displayStatus = isPaid ? 'paid' : item.status;
                  let bg = "bg-white";
                  if (displayStatus === 'paid') bg = "bg-emerald-50 opacity-60";
                  if (displayStatus === 'hold') bg = "bg-amber-50";
                  return (
                    <SwipeableCard
                      key={item.id}
                      rightActionLabel={isPaid ? 'Undo' : 'Paid'}
                      rightActionIcon={<Check className="w-4 h-4" />}
                      leftActionLabel={displayStatus === 'hold' ? 'Unhold' : 'Hold'}
                      leftActionIcon={<Clock className="w-4 h-4" />}
                      onSwipeRight={() => handleMarkPaid(item)}
                      onSwipeLeft={() => handleMarkHold(item.entityId, displayStatus)}
                    >
                      <div className={`transition-colors rounded-xl ${bg}`}>
                        <ListCard
                          icon={<div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${displayStatus === 'paid' ? 'bg-emerald-100 text-emerald-600' : displayStatus === 'hold' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>{item.icon}</div>}
                          title={item.title}
                          subtitle={item.due}
                          amount={item.amt}
                          badgeText={displayStatus === 'paid' ? 'Paid ✓' : displayStatus === 'hold' ? 'On Hold' : item.badge}
                          badgeType={displayStatus === 'paid' ? 'success' : displayStatus === 'hold' ? 'warning' : item.type}
                        />
                      </div>
                    </SwipeableCard>
                  );
                })}
                {upcomingItems.length === 0 && <p className="text-sm text-slate-400 text-center py-4">All caught up! Add subscriptions in Settings.</p>}
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[15px] text-slate-800">Scheduled Transactions</h3>
                <Link to="/settings" className="text-indigo-600 text-sm font-semibold hover:underline">Manage</Link>
              </div>
              <div className="space-y-1">
                {scheduledItems.map(item => {
                  const isPaid = paidEntityIds.has(item.entityId);
                  const displayStatus = isPaid ? 'paid' : item.status;
                  let bg = "bg-white";
                  if (displayStatus === 'paid') bg = "bg-emerald-50 opacity-60";
                  if (displayStatus === 'hold') bg = "bg-amber-50";
                  return (
                    <SwipeableCard
                      key={item.id}
                      rightActionLabel={isPaid ? 'Undo' : 'Paid'}
                      rightActionIcon={<Check className="w-4 h-4" />}
                      leftActionLabel={displayStatus === 'hold' ? 'Unhold' : 'Hold'}
                      leftActionIcon={<Clock className="w-4 h-4" />}
                      onSwipeRight={() => handleMarkPaid(item)}
                      onSwipeLeft={() => handleMarkHold(item.entityId, displayStatus)}
                    >
                      <div className={`transition-colors rounded-xl ${bg}`}>
                        <ListCard
                          icon={<div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${displayStatus === 'paid' ? 'bg-emerald-100 text-emerald-600' : displayStatus === 'hold' ? 'bg-amber-100 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>{item.icon}</div>}
                          title={item.title}
                          subtitle={item.due}
                          amount={item.amt}
                          badgeText={displayStatus === 'paid' ? 'Paid ✓' : displayStatus === 'hold' ? 'On Hold' : item.badge}
                          badgeType={displayStatus === 'paid' ? 'success' : displayStatus === 'hold' ? 'warning' : item.type}
                        />
                      </div>
                    </SwipeableCard>
                  );
                })}
                {scheduledItems.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No recurring items. Add them in Settings.</p>}
              </div>
            </Card>
          </div>

          <Card className="p-5 lg:hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[15px] text-slate-800">Recent Transactions</h3>
              <Link to="/transactions" className="text-indigo-600 text-sm font-semibold hover:underline">View All</Link>
            </div>
            <div className="space-y-1">
              {recentTransactions.map(tx => (
                <div key={tx.id} onClick={() => setEditTxId(tx.id)} className="cursor-pointer">
                  <ListCard
                    icon={<div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${tx.type === 'expense' ? 'bg-orange-50 text-orange-500' : tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'}`}>{tx.payee.charAt(0)}</div>}
                    title={tx.payee}
                    subtitle={
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span>{tx.category}</span><span>•</span><span>{format(new Date(tx.date), "MMM dd")}</span><span>•</span>
                        <span className="text-[9px] font-semibold bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                          {tx.type === 'transfer' && tx.to_account_id ? `${getAccountName(tx.account_id)} → ${getAccountName(tx.to_account_id)}` : getAccountName(tx.account_id)}
                        </span>
                      </div>
                    }
                    amount={`${tx.type === 'expense' ? '-' : '+'}${formatINR(tx.amount)}`}
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
      {editTxId && <TransactionFormModal txId={editTxId} onClose={() => setEditTxId(null)} />}

    </div>
  </div>
  );
};
