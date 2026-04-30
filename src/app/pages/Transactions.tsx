import React, { useState, useMemo } from "react";
import { format, parseISO, isSameDay } from "date-fns";
import { Search, Filter, ArrowUpRight, ArrowDownRight, Wallet, ChevronDown, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { useFinance, Transaction } from "../context/FinanceContext";
import { formatINR } from "../utils";
import { cn } from "../utils";

export const Transactions = () => {
  const { transactions } = useFinance();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "expense" | "income">("all");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isAllExpanded, setIsAllExpanded] = useState(false);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch = tx.payee.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            tx.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || tx.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [transactions, searchTerm, filterType]);

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
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search payee or category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 w-full sm:w-auto">
          {(["all", "expense", "income"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={cn(
                "flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all",
                filterType === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <button 
          onClick={toggleAll}
          className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shrink-0 w-full sm:w-auto justify-center"
        >
          {isAllExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          {isAllExpanded ? "Collapse All" : "Expand All"}
        </button>
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
                            <div className={cn(
                              "font-bold text-right",
                              pg.type === 'expense' ? 'text-slate-800' :
                              pg.type === 'income' ? 'text-emerald-600' : 'text-blue-600'
                            )}>
                              {pg.type === 'expense' ? '-' : pg.type === 'income' ? '+' : ''}{formatINR(pg.total)}
                            </div>
                            {isGrouped && (
                              <div className="text-slate-400">
                                {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Child Rows (if expanded) */}
                        {isGrouped && isExpanded && (
                          <div className="bg-slate-50/50 border-t border-slate-100 divide-y divide-slate-100 pl-16">
                            {pg.transactions.map((tx) => (
                              <div key={tx.id} className="p-3 pr-5 flex items-center justify-between text-sm hover:bg-slate-50 transition-colors">
                                <div>
                                  <p className="font-semibold text-slate-700">{tx.category}</p>
                                  {tx.notes && <p className="text-slate-500 text-xs mt-0.5">{tx.notes}</p>}
                                </div>
                                <div className={cn(
                                  "font-semibold",
                                  tx.type === 'expense' ? 'text-slate-700' :
                                  tx.type === 'income' ? 'text-emerald-600' : 'text-blue-600'
                                )}>
                                  {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}{formatINR(tx.amount)}
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
