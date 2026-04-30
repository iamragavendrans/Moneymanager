import React, { useState, useMemo } from "react";
import { format, parseISO, isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subMonths, subYears, parse } from "date-fns";
import { useSearchParams } from "react-router";
import { Search, Filter, ArrowUpRight, ArrowDownRight, Wallet, ChevronDown, ChevronRight, Maximize2, Minimize2, Trash2, Edit, X } from "lucide-react";
import { useFinance, Transaction } from "../context/FinanceContext";
import { TransactionFormModal } from "../components/TransactionFormModal";
import { formatINR } from "../utils";
import { cn } from "../utils";

export const Transactions = () => {
  const { transactions, deleteTransaction } = useFinance();
  const [searchParams, setSearchParams] = useSearchParams();
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");
  const [searchTerm, setSearchTerm] = useState("");
  const [customRange, setCustomRange] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const handleDateFilter = (type: string) => {
    setCustomRange(type === 'custom');
    if (type === 'custom') return;

    const now = new Date();
    let start, end;
    if (type === 'this_week') { start = startOfWeek(now); end = endOfWeek(now); }
    else if (type === 'last_week') { start = startOfWeek(subDays(now, 7)); end = endOfWeek(subDays(now, 7)); }
    else if (type === 'this_month') { start = startOfMonth(now); end = endOfMonth(now); }
    else if (type === 'last_month') { start = startOfMonth(subMonths(now, 1)); end = endOfMonth(subMonths(now, 1)); }
    else if (type === 'this_year') { start = startOfYear(now); end = endOfYear(now); }
    else if (type === 'last_year') { start = startOfYear(subYears(now, 1)); end = endOfYear(subYears(now, 1)); }
    else {
      searchParams.delete('start');
      searchParams.delete('end');
      setSearchParams(searchParams);
      return;
    }
    searchParams.set('start', start.getTime().toString());
    searchParams.set('end', end.getTime().toString());
    setSearchParams(searchParams);
  };

  const applyCustomRange = () => {
    if (!customStart || !customEnd) return;
    const s = parse(customStart, "yyyy-MM-dd", new Date());
    const e = parse(customEnd, "yyyy-MM-dd", new Date());
    searchParams.set('start', s.getTime().toString());
    searchParams.set('end', e.getTime().toString());
    setSearchParams(searchParams);
  };
  const [filterType, setFilterType] = useState<"all" | "expense" | "income">((searchParams.get("type") as any) || "all");
  const [filterMode, setFilterMode] = useState<"all" | "upi" | "card" | "cash">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "cleared" | "pending">("all");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const [editTxId, setEditTxId] = useState<string | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch = tx.payee.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            tx.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || tx.type === filterType;
      const matchesMode = filterMode === "all" || (tx.mode || 'upi') === filterMode;
      const matchesStatus = filterStatus === "all" || (tx.status || 'cleared') === filterStatus;
      
      let inDateRange = true;
      if (startParam && endParam) {
         const txDate = new Date(tx.date).getTime();
         inDateRange = txDate >= parseInt(startParam) && txDate <= parseInt(endParam);
      }
      return matchesSearch && matchesType && matchesMode && matchesStatus && inDateRange;
    });
  }, [transactions, searchTerm, filterType, filterMode, filterStatus, startParam, endParam]);

  // Group by date, then by payee
  const groupedTransactions = useMemo(() => {
    const groups = new Map<string, { 
      date: string; 
      totalExpense: number; 
      totalIncome: number; 
      payeeGroups: Map<string, { 
        payee: string; 
        type: Transaction["type"]; 
        total: number; 
        latestDate: number;
        transactions: Transaction[] 
      }> 
    }>();

    filteredTransactions.forEach(tx => {
      if (!groups.has(tx.date)) {
        groups.set(tx.date, { date: tx.date, totalExpense: 0, totalIncome: 0, payeeGroups: new Map() });
      }
      const group = groups.get(tx.date)!;

      if (tx.type === "expense") group.totalExpense += tx.amount;
      if (tx.type === "income") group.totalIncome += tx.amount;

      // Use a lowercased payee as a grouping key
      const payeeKey = tx.payee.toLowerCase().trim();
      
      if (!group.payeeGroups.has(payeeKey)) {
        group.payeeGroups.set(payeeKey, { 
          payee: tx.payee, // display name
          type: tx.type, // base type on first seen
          total: 0, 
          latestDate: 0,
          transactions: [] 
        });
      }
      
      const payeeGroup = group.payeeGroups.get(payeeKey)!;
      
      // Net the total based on whether it matches the group's primary type
      // Usually same payee on same day will be same type, but just in case
      if (tx.type === payeeGroup.type) {
         payeeGroup.total += tx.amount;
      } else {
         payeeGroup.total -= tx.amount;
      }

      // Track latest transaction time to sort groups if needed (using tx id creation timestamp heuristic)
      const txTimestamp = Number(tx.id.split('_')[1]) || 0;
      if (txTimestamp > payeeGroup.latestDate) {
         payeeGroup.latestDate = txTimestamp;
         payeeGroup.payee = tx.payee; // keep the most recent capitalization
      }
      
      payeeGroup.transactions.push(tx);
    });

    return Array.from(groups.values())
      .map(g => ({
        ...g,
        payeeGroups: Array.from(g.payeeGroups.values())
          .sort((a, b) => b.latestDate - a.latestDate) // sort payees by latest transaction
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredTransactions]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (isAllExpanded) {
      setExpandedGroups(new Set());
    } else {
      const allIds = new Set<string>();
      groupedTransactions.forEach(g => {
        g.payeeGroups.forEach(pg => {
          if (pg.transactions.length > 1) {
            allIds.add(`${g.date}-${pg.payee.toLowerCase()}`);
          }
        });
      });
      setExpandedGroups(allIds);
    }
    setIsAllExpanded(!isAllExpanded);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto flex flex-col h-full">
      {editTxId && <TransactionFormModal txId={editTxId} onClose={() => setEditTxId(null)} />}
      
      {/* Active Time Filter Banner */}
      {startParam && endParam && (
        <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-indigo-800">
            Filtering from <b>{format(new Date(parseInt(startParam)), "MMM dd, yyyy")}</b> to <b>{format(new Date(parseInt(endParam)), "MMM dd, yyyy")}</b>
          </span>
          <button onClick={() => { searchParams.delete('start'); searchParams.delete('end'); setSearchParams(searchParams); setCustomRange(false); }} className="text-indigo-600 hover:bg-indigo-200 p-1 rounded-md transition-colors"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search payee or category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-base md:text-lg bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all shadow-sm"
          />
        </div>
        {/* Advanced Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full">
          <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
            {(["all", "expense", "income"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all",
                  filterType === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg shrink-0 hidden sm:flex">
            {(["all", "upi", "card", "cash"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterMode(t)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all",
                  filterMode === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg shrink-0 hidden md:flex">
            {(["all", "cleared", "pending"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterStatus(t)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all",
                  filterStatus === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap bg-slate-100 p-1 rounded-lg shrink-0 items-center gap-2">
            <select
              onChange={(e) => handleDateFilter(e.target.value)}
              className="px-2 py-1 bg-transparent text-xs font-semibold text-slate-600 outline-none cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="this_week">This Week</option>
              <option value="last_week">Last Week</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_year">This Year</option>
              <option value="last_year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
            {customRange && (
              <div className="flex items-center gap-1">
                <input type="date" className="text-xs px-1 py-0.5 rounded outline-none border" value={customStart} onChange={e => setCustomStart(e.target.value)} />
                <span className="text-xs text-slate-400">-</span>
                <input type="date" className="text-xs px-1 py-0.5 rounded outline-none border" value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
                <button onClick={applyCustomRange} className="px-2 py-0.5 bg-indigo-600 text-white rounded text-xs ml-1 font-medium hover:bg-indigo-700 transition-colors">Go</button>
              </div>
            )}
          </div>

          <div className="ml-auto">
            <button 
              onClick={toggleAll}
              className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            >
              {isAllExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isAllExpanded ? "Collapse All" : "Expand All"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-20">
        {groupedTransactions.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-100 border-dashed">
            No transactions found
          </div>
        ) : (
          groupedTransactions.map((group) => {
            const parsedDate = parseISO(group.date);
            const dateDisplay = isSameDay(parsedDate, new Date()) ? "Today" : 
                               isSameDay(parsedDate, new Date(Date.now() - 86400000)) ? "Yesterday" : 
                               format(parsedDate, "EEEE, dd MMMM yyyy");

            return (
              <div key={group.date} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-5 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="font-semibold text-slate-700 text-sm">{dateDisplay}</h4>
                  <div className="flex gap-3 text-xs font-semibold">
                    {group.totalIncome > 0 && <span className="text-emerald-600">+{formatINR(group.totalIncome)}</span>}
                    {group.totalExpense > 0 && <span className="text-red-600">-{formatINR(group.totalExpense)}</span>}
                  </div>
                </div>
                
                <div className="divide-y divide-slate-100">
                  {group.payeeGroups.map((pg) => {
                    const groupId = `${group.date}-${pg.payee.toLowerCase()}`;
                    const isExpanded = expandedGroups.has(groupId);
                    const isGrouped = pg.transactions.length > 1;

                    return (
                      <div key={groupId} className="flex flex-col">
                        {/* Parent Row */}
                        <div 
                          onClick={() => isGrouped && toggleGroup(groupId)}
                          className={cn(
                            "p-4 px-5 flex items-center justify-between transition-colors group",
                            isGrouped ? "cursor-pointer hover:bg-slate-50" : "hover:bg-slate-50/50"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105",
                              pg.type === 'expense' ? 'bg-red-50 text-red-600' :
                              pg.type === 'income' ? 'bg-emerald-50 text-emerald-600' :
                              'bg-blue-50 text-blue-600'
                            )}>
                              {pg.type === 'expense' ? <ArrowUpRight className="w-5 h-5" /> :
                               pg.type === 'income' ? <ArrowDownRight className="w-5 h-5" /> :
                               <Wallet className="w-5 h-5" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-slate-800">{pg.payee}</p>
                                {isGrouped && (
                                  <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                    {pg.transactions.length}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                                {isGrouped ? (
                                  <span>Multiple entries</span>
                                ) : (
                                  <>
                                    <span>{pg.transactions[0].category}</span>
                                    {pg.transactions[0].notes && (
                                      <>
                                        <span>•</span>
                                        <span className="truncate max-w-[150px] sm:max-w-[300px]">{pg.transactions[0].notes}</span>
                                      </>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {!isGrouped && (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity md:mr-2">
                                <button onClick={(e) => { e.stopPropagation(); setEditTxId(pg.transactions[0].id); }} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50" title="Edit"><Edit className="w-4 h-4"/></button>
                                <button onClick={(e) => { e.stopPropagation(); deleteTransaction(pg.transactions[0].id); }} className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50" title="Delete"><Trash2 className="w-4 h-4"/></button>
                              </div>
                            )}
                            <div className={cn(
                              "font-bold text-right",
                              pg.type === 'expense' ? 'text-slate-800' :
                              pg.type === 'income' ? 'text-emerald-600' : 'text-blue-600'
                            )}>
                              {pg.type === 'expense' ? '-' : pg.type === 'income' ? '+' : ''}{formatINR(pg.total)}
                            </div>
                            {isGrouped && (
                              <div className="text-slate-400 ml-1">
                                {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Child Rows (if expanded) */}
                        {isGrouped && isExpanded && (
                          <div className="bg-slate-50/50 border-t border-slate-100 divide-y divide-slate-100 pl-16">
                            {pg.transactions.map((tx) => (
                              <div key={tx.id} className="p-3 pr-5 flex items-center justify-between text-sm hover:bg-slate-50 transition-colors group/row">
                                <div>
                                  <p className="font-semibold text-slate-700">{tx.category}</p>
                                  {tx.notes && <p className="text-slate-500 text-xs mt-0.5">{tx.notes}</p>}
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); setEditTxId(tx.id); }} className="p-1 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50"><Edit className="w-4 h-4"/></button>
                                    <button onClick={(e) => { e.stopPropagation(); deleteTransaction(tx.id); }} className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50"><Trash2 className="w-4 h-4"/></button>
                                  </div>
                                  <div className={cn(
                                    "font-semibold min-w-[70px] text-right",
                                    tx.type === 'expense' ? 'text-slate-700' :
                                    tx.type === 'income' ? 'text-emerald-600' : 'text-blue-600'
                                  )}>
                                    {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}{formatINR(tx.amount)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
