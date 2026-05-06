import React, { useState, useMemo, useEffect } from "react";
import { format, parseISO, isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subMonths, subYears, parse, endOfDay } from "date-fns";
import { useSearchParams } from "react-router";
import { Search, Filter, ArrowUpRight, ArrowDownRight, Wallet, ChevronDown, ChevronRight, Maximize2, Minimize2, Trash2, Edit, X, CheckSquare, Square, CalendarDays, CreditCard, Tag, Store, CheckCheck } from "lucide-react";
import { useFinance, Transaction } from "../context/FinanceContext";
import { TransactionFormModal } from "../components/TransactionFormModal";
import { formatINR, cn } from "../utils";

export const Transactions = () => {
  const { transactions, deleteTransaction, updateTransaction, accounts } = useFinance();
  const [searchParams, setSearchParams] = useSearchParams();
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");
  const [searchTerm, setSearchTerm] = useState("");
  const [customRange, setCustomRange] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const handleDateFilter = (type: string) => {
    setDateFilterType(type);
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
    searchParams.set('end', endOfDay(e).getTime().toString());
    setSearchParams(searchParams);
  };
  const [filterType, setFilterType] = useState<"all" | "expense" | "income" | "transfer">((searchParams.get("type") as any) || "all");
  const [filterMode, setFilterMode] = useState<"all" | "UPI" | "card" | "cash" | "banking">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "cleared" | "pending">("all");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const [editTxId, setEditTxId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilterType, setDateFilterType] = useState<string>("all");
  // Bulk selection
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  // Bulk edit fields
  const [bulkDate, setBulkDate] = useState("");
  const [bulkAccountId, setBulkAccountId] = useState("");
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkShop, setBulkShop] = useState("");

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = tx.payee.toLowerCase().includes(searchLower) ||
        tx.category.toLowerCase().includes(searchLower) ||
        (tx.notes || '').toLowerCase().includes(searchLower) ||
        (tx.tags || []).some(tag => tag.toLowerCase().includes(searchLower));
      const matchesType = filterType === "all" || tx.type === filterType;
      const matchesMode = filterMode === "all" || (tx.mode || 'UPI') === filterMode;
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
      totalTransfer: number;
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
        groups.set(tx.date, { date: tx.date, totalExpense: 0, totalIncome: 0, totalTransfer: 0, payeeGroups: new Map() });
      }
      const group = groups.get(tx.date)!;

      if (tx.type === "expense") group.totalExpense += tx.amount;
      if (tx.type === "income") group.totalIncome += tx.amount;
      if (tx.type === "transfer") group.totalTransfer = (group.totalTransfer || 0) + tx.amount;

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
    const allIds = new Set<string>();
    groupedTransactions.forEach(g => {
      g.payeeGroups.forEach(pg => {
        if (pg.transactions.length > 1) {
          allIds.add(`${g.date}-${pg.payee.toLowerCase()}`);
        }
      });
    });

    if (expandedGroups.size >= allIds.size && allIds.size > 0) {
      setExpandedGroups(new Set());
      setIsAllExpanded(false);
    } else {
      setExpandedGroups(allIds);
      setIsAllExpanded(true);
    }
  };

  // Sync isAllExpanded state with actual expanded count
  const actualGroupCount = useMemo(() => {
    let count = 0;
    groupedTransactions.forEach(g => {
      g.payeeGroups.forEach(pg => {
        if (pg.transactions.length > 1) count++;
      });
    });
    return count;
  }, [groupedTransactions]);

  useEffect(() => {
    if (expandedGroups.size === 0) setIsAllExpanded(false);
    else if (expandedGroups.size >= actualGroupCount && actualGroupCount > 0) setIsAllExpanded(true);
  }, [expandedGroups, actualGroupCount]);

  // Bulk helpers
  const toggleBulk = (id: string) => {
    setBulkSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    const allIds = new Set(filteredTransactions.map(t => t.id));
    setBulkSelected(allIds);
  };

  const clearBulk = () => { setBulkSelected(new Set()); setBulkMode(false); };

  const applyBulkEdit = () => {
    bulkSelected.forEach(id => {
      const updates: Partial<Transaction> = {};
      if (bulkDate) updates.date = bulkDate;
      if (bulkAccountId) updates.account_id = bulkAccountId;
      if (bulkCategory) updates.category = bulkCategory;
      if (bulkShop) updates.payee = bulkShop;
      if (Object.keys(updates).length > 0) updateTransaction(id, updates);
    });
    setBulkDate(""); setBulkAccountId(""); setBulkCategory(""); setBulkShop("");
    setShowBulkEdit(false);
    clearBulk();
  };

  const bulkDeleteSelected = () => {
    bulkSelected.forEach(id => deleteTransaction(id));
    clearBulk();
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto flex flex-col h-full">
      {editTxId && <TransactionFormModal txId={editTxId} onClose={() => setEditTxId(null)} />}

      {/* Bulk Edit Sheet */}
      {showBulkEdit && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-slate-800">Edit {bulkSelected.size} Transactions</h3>
              <button onClick={() => setShowBulkEdit(false)} className="p-2 rounded-full hover:bg-slate-100"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <p className="text-xs text-slate-400 mb-5">Only filled fields will be applied. Leave blank to keep original values.</p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0"><CalendarDays className="w-4 h-4 text-indigo-600" /></div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Change Date</label>
                  <input type="date" value={bulkDate} onChange={e => setBulkDate(e.target.value)} className="w-full text-sm font-semibold bg-slate-50 px-3 py-2 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500 outline-none mt-1" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0"><CreditCard className="w-4 h-4 text-indigo-600" /></div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Change Account</label>
                  <select value={bulkAccountId} onChange={e => setBulkAccountId(e.target.value)} className="w-full text-sm font-semibold bg-slate-50 px-3 py-2 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500 outline-none mt-1 appearance-none">
                    <option value="">— keep original —</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0"><Tag className="w-4 h-4 text-indigo-600" /></div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Change Category</label>
                  <input type="text" value={bulkCategory} onChange={e => setBulkCategory(e.target.value)} placeholder="e.g. Food" className="w-full text-sm font-semibold bg-slate-50 px-3 py-2 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500 outline-none mt-1" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0"><Store className="w-4 h-4 text-indigo-600" /></div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Change Shop / Payee</label>
                  <input type="text" value={bulkShop} onChange={e => setBulkShop(e.target.value)} placeholder="e.g. BigBasket" className="w-full text-sm font-semibold bg-slate-50 px-3 py-2 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500 outline-none mt-1" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowBulkEdit(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={applyBulkEdit} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center justify-center gap-2"><CheckCheck className="w-4 h-4" /> Apply to {bulkSelected.size}</button>
            </div>
          </div>
        </div>
      )}

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
        <div className="flex items-center gap-3 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search payee, category, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-base bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all shadow-sm"
            />
          </div>
          <button
            onClick={toggleAll}
            className="p-3 border border-slate-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm shrink-0 bg-white text-slate-500 hover:bg-slate-50 text-xs font-semibold"
            title={isAllExpanded ? "Collapse All Groups" : "Expand All Groups"}
          >
            {isAllExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn("p-3 border rounded-xl flex items-center justify-center transition-colors shadow-sm shrink-0", showFilters ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50")}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
        {/* Advanced Filters */}
        {showFilters && (
          <div className="flex flex-col gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-slate-700 text-sm">Filters</h4>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-5">
              <div className="flex flex-col gap-1.5 flex-1 min-w-[240px]">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Type</span>
                <div className="flex bg-slate-100 p-1 rounded-lg shrink-0 overflow-x-auto scrollbar-hide">
                  {(["all", "expense", "income", "transfer"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={cn(
                        "flex-1 px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all whitespace-nowrap",
                        filterType === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 flex-1 min-w-[240px]">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Payment Mode</span>
                <div className="flex bg-slate-100 p-1 rounded-lg shrink-0 overflow-x-auto scrollbar-hide">
                  {(["all", "UPI", "card", "cash", "banking"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterMode(t as any)}
                      className={cn(
                        "flex-1 px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all whitespace-nowrap",
                        filterMode === (t as any) ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      {t === "banking" ? "Bank Transfer" : t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 flex-1 min-w-[240px]">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Status</span>
                <div className="flex bg-slate-100 p-1 rounded-lg shrink-0 overflow-x-auto scrollbar-hide">
                  {(["all", "cleared", "pending"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterStatus(t)}
                      className={cn(
                        "flex-1 px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all whitespace-nowrap",
                        filterStatus === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 flex-[2] w-full min-w-[240px] md:min-w-[340px]">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Time Range</span>
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <select
                    value={dateFilterType}
                    onChange={(e) => handleDateFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 outline-none cursor-pointer sm:w-40 shrink-0"
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
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg flex-1 min-w-[220px]">
                      <input type="date" className="flex-1 text-xs px-2 py-1.5 rounded-md outline-none border-none bg-white shadow-sm min-w-0" value={customStart} onChange={e => setCustomStart(e.target.value)} />
                      <span className="text-xs text-slate-400 font-bold px-0.5">-</span>
                      <input type="date" className="flex-1 text-xs px-2 py-1.5 rounded-md outline-none border-none bg-white shadow-sm min-w-0" value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
                      <button onClick={applyCustomRange} className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-medium hover:bg-indigo-700 transition-colors shrink-0">Go</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Action Bar */}
      {bulkMode && (
        <div className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl mb-4 animate-in slide-in-from-top-2 duration-200">
          <button onClick={() => bulkSelected.size === filteredTransactions.length ? setBulkSelected(new Set()) : selectAllFiltered()} className="flex items-center gap-1.5 text-xs font-bold hover:text-indigo-200 transition-colors">
            <CheckCheck className="w-4 h-4" />
            {bulkSelected.size === filteredTransactions.length ? 'Deselect All' : `Select All (${filteredTransactions.length})`}
          </button>
          <span className="flex-1 text-center text-xs font-bold">{bulkSelected.size} selected</span>
          <button onClick={() => setShowBulkEdit(true)} disabled={bulkSelected.size === 0} className="flex items-center gap-1 text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg disabled:opacity-40 transition-colors">
            <Edit className="w-3.5 h-3.5" /> Edit
          </button>
          <button onClick={bulkDeleteSelected} disabled={bulkSelected.size === 0} className="flex items-center gap-1 text-xs font-bold bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg disabled:opacity-40 transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
          <button onClick={clearBulk} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
        </div>
      )}

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
                  <div className="flex items-center gap-3">
                    {/* Long-press / select mode toggle */}
                    <button
                      onClick={() => setBulkMode(m => !m)}
                      className={cn("w-5 h-5 rounded-md border-2 transition-all shrink-0", bulkMode ? "border-indigo-500 bg-indigo-500" : "border-slate-300 hover:border-indigo-400")}
                      title="Toggle selection mode"
                    >
                      {bulkMode && <CheckCheck className="w-3 h-3 text-white m-auto" />}
                    </button>
                    <h4 className="font-semibold text-slate-700 text-sm">{dateDisplay}</h4>
                  </div>
                  <div className="flex gap-3 text-xs font-semibold">
                    {group.totalIncome > 0 && <span className="text-emerald-600">+{formatINR(group.totalIncome)}</span>}
                    {group.totalExpense > 0 && <span className="text-red-600">-{formatINR(group.totalExpense)}</span>}
                    {group.totalTransfer > 0 && <span className="text-blue-600">{formatINR(group.totalTransfer)}</span>}
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
                          onClick={() => {
                            if (bulkMode) {
                              pg.transactions.forEach(tx => toggleBulk(tx.id));
                            } else if (isGrouped) {
                              toggleGroup(groupId);
                            } else {
                              setEditTxId(pg.transactions[0].id);
                            }
                          }}
                          className={cn(
                            "p-4 px-5 flex items-center justify-between transition-colors group cursor-pointer",
                            isGrouped ? "hover:bg-slate-50" : "hover:bg-indigo-50/40",
                            bulkMode && bulkSelected.has(pg.transactions[0]?.id) && !isGrouped && "bg-indigo-50",
                          )}
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            {/* Checkbox for bulk mode */}
                            {bulkMode && !isGrouped && (
                              <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
                                bulkSelected.has(pg.transactions[0]?.id) ? "bg-indigo-600 border-indigo-600" : "border-slate-300"
                              )}>
                                {bulkSelected.has(pg.transactions[0]?.id) && <CheckCheck className="w-3 h-3 text-white" />}
                              </div>
                            )}
                            <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                              pg.type === 'expense' ? 'bg-red-50 text-red-600' :
                                pg.type === 'income' ? 'bg-emerald-50 text-emerald-600' :
                                  'bg-blue-50 text-blue-600'
                            )}>
                              {pg.type === 'expense' ? <ArrowDownRight className="w-5 h-5" /> :
                                pg.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> :
                                  <Wallet className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-slate-800 truncate">{pg.payee}</p>
                                {isGrouped && (
                                  <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0">
                                    {pg.transactions.length}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5 overflow-hidden">
                                {isGrouped ? (
                                  <span className="truncate">Multiple entries</span>
                                ) : (
                                  <>
                                    <span className="truncate shrink-0 max-w-[80px] sm:max-w-none">{pg.transactions[0].category}</span>
                                    {pg.transactions[0].notes && (
                                      <>
                                        <span className="shrink-0">•</span>
                                        <span className="truncate">{pg.transactions[0].notes}</span>
                                      </>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 ml-2">
                            {!isGrouped && !bulkMode && (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => { e.stopPropagation(); setEditTxId(pg.transactions[0].id); }} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50" title="Edit"><Edit className="w-4 h-4" /></button>
                                <button onClick={(e) => { e.stopPropagation(); deleteTransaction(pg.transactions[0].id); }} className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50" title="Delete"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            )}
                            <div className={cn(
                              "font-bold text-right whitespace-nowrap",
                              pg.type === 'expense' ? 'text-slate-800' :
                                pg.type === 'income' ? 'text-emerald-600' : 'text-blue-600'
                            )}>
                              {pg.type === 'expense' ? '-' : pg.type === 'income' ? '+' : ''}{formatINR(pg.total)}
                            </div>
                            {isGrouped && (
                              <div className="text-slate-400 ml-1 shrink-0">
                                {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Child Rows (if expanded) */}
                        {isGrouped && isExpanded && (
                          <div className="bg-slate-50/50 border-t border-slate-100 divide-y divide-slate-100 pl-16">
                            {pg.transactions.map((tx) => (
                              <div key={tx.id} className={cn("p-3 pr-5 flex items-center justify-between text-sm transition-colors group/row cursor-pointer",
                                bulkMode && bulkSelected.has(tx.id) ? "bg-indigo-50" : "hover:bg-slate-50"
                              )}
                                onClick={() => bulkMode ? toggleBulk(tx.id) : setEditTxId(tx.id)}
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                                  {bulkMode && (
                                    <div className={cn("w-4 h-4 rounded border-2 flex items-center justify-center shrink-0",
                                      bulkSelected.has(tx.id) ? "bg-indigo-600 border-indigo-600" : "border-slate-300"
                                    )}>
                                      {bulkSelected.has(tx.id) && <CheckCheck className="w-2.5 h-2.5 text-white" />}
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-700 truncate">{tx.category}</p>
                                    {tx.notes && <p className="text-slate-500 text-xs mt-0.5 truncate">{tx.notes}</p>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  {!bulkMode && (
                                    <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                      <button onClick={(e) => { e.stopPropagation(); setEditTxId(tx.id); }} className="p-1 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50"><Edit className="w-4 h-4" /></button>
                                      <button onClick={(e) => { e.stopPropagation(); deleteTransaction(tx.id); }} className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                  )}
                                  <div className={cn(
                                    "font-semibold min-w-[70px] text-right whitespace-nowrap",
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
