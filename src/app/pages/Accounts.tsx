import React, { useState, useMemo } from "react";
import {
  Plus, Building2, CreditCard, Wallet, Smartphone, Banknote, TrendingUp,
  Utensils, PiggyBank, HandCoins, ShieldCheck, ArrowRightLeft, RefreshCw,
  ChevronRight, ChevronLeft, Eye, EyeOff, MoreVertical, X,
} from "lucide-react";
import { useFinance, Account } from "../context/FinanceContext";
import { formatINR, cn } from "../utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { TransactionFormModal } from "../components/TransactionFormModal";
import { AccountManagementModal } from "../components/AccountManagementModal";
import { format, differenceInDays, parseISO } from "date-fns";

const AccountIcon = ({ type }: { type: Account["type"] }) => {
  switch (type) {
    case "bank":        return <Building2 className="w-6 h-6" />;
    case "credit_card": return <CreditCard className="w-6 h-6" />;
    case "wallet":     return <Wallet className="w-6 h-6" />;
    case "UPI":        return <Smartphone className="w-6 h-6" />;
    case "cash":       return <Banknote className="w-6 h-6" />;
    case "investment": return <TrendingUp className="w-6 h-6" />;
    case "meal_card":  return <Utensils className="w-6 h-6" />;
    case "pf":         return <PiggyBank className="w-6 h-6" />;
    case "loan":       return <HandCoins className="w-6 h-6" />;
    default:           return <Wallet className="w-6 h-6" />;
  }
};

const CHART_COLORS = ["#4F46E5", "#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444"];

const maskAccNumber = (last4?: string) => (last4 ? `••• ${last4}` : "••• ••••");

export const Accounts = () => {
  const { accounts, transactions, updateAccount, addTransaction, profile, updateProfile } =
    useFinance();
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const isMasked = profile.maskBalances ?? false;
  const setIsMasked = (val: boolean) => updateProfile({ maskBalances: val });

  // Inline reconcile modal state
  const [reconcileAccId, setReconcileAccId] = useState<string | null>(null);
  const [reconcileValue, setReconcileValue] = useState("");
  const [reconcileError, setReconcileError] = useState("");

  const openReconcile = (e: React.MouseEvent, accId: string) => {
    e.stopPropagation();
    const acc = accounts.find((a) => a.id === accId);
    setReconcileValue(acc ? String(acc.balance) : "");
    setReconcileError("");
    setReconcileAccId(accId);
  };

  const applyReconcile = () => {
    const parsed = parseFloat(reconcileValue);
    if (isNaN(parsed)) { setReconcileError("Please enter a valid number."); return; }
    const acc = accounts.find((a) => a.id === reconcileAccId);
    if (!acc) return;
    const diff = parsed - acc.balance;
    if (diff !== 0) {
      addTransaction({
        amount: Math.abs(diff),
        type: diff > 0 ? "income" : "expense",
        category: "Adjustment",
        account_id: acc.id,
        payee: "Balance Reconciliation",
        date: new Date().toISOString().split("T")[0],
        notes: `Auto-adjustment to match actual balance: ₹${parsed}`,
        tags: ["system"],
        mode: "netbanking",
        status: "cleared",
      });
    }
    setReconcileAccId(null);
    setReconcileValue("");
  };

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    banks: false, cards: false, loans: false, cash: false, retirement: false,
  });
  const toggleExpand = (key: string) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const salaryAccountId = useMemo(() => {
    const counts: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "income")
      .forEach((t) => { counts[t.account_id] = (counts[t.account_id] ?? 0) + t.amount; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  }, [transactions]);

  const bankAccounts     = accounts.filter((a) => a.type === "bank");
  const creditCards      = accounts.filter((a) => a.type === "credit_card");
  const loans            = accounts.filter((a) => a.type === "loan");
  const cashWallets      = accounts.filter((a) =>
    ["cash", "wallet", "UPI", "meal_card"].includes(a.type)
  );
  // Only "pf" is a valid Account type for retirement accounts
  const retirementAccounts = accounts.filter((a) => a.type === "pf");

  const totalPositive   = accounts.filter((a) => a.balance > 0).reduce((s, a) => s + a.balance, 0);
  const totalCreditDebt = accounts
    .filter((a) => a.type === "credit_card" && a.balance < 0)
    .reduce((s, a) => s + Math.abs(a.balance), 0);
  const totalLiquidity  = totalPositive - totalCreditDebt;

  const liquidTypes = ["bank", "wallet", "UPI", "cash", "meal_card"];
  const chartData = useMemo(
    () =>
      accounts
        .filter((a) => a.balance > 0 && liquidTypes.includes(a.type))
        .map((a) => ({ name: a.name, value: a.balance }))
        .sort((a, b) => b.value - a.value),
    [accounts]
  );

  const getDueDaysLabel = (dueDate?: string) => {
    if (!dueDate) return null;
    const days = differenceInDays(parseISO(dueDate), new Date());
    if (days < 0) return { text: `Overdue by ${Math.abs(days)}d`, color: "text-red-600" };
    if (days === 0) return { text: "Due Today", color: "text-orange-600" };
    if (days <= 5) return { text: `Due in ${days}d`, color: "text-orange-500" };
    return { text: `Due in ${days}d`, color: "text-slate-500" };
  };

  const getCardNetwork = (last4?: string) => {
    if (!last4) return null;
    const first = last4[0];
    if (first === "4") return "Visa";
    if (first === "5") return "Mastercard";
    if (first === "6") return "Rupay";
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
      {/* Reconcile Modal */}
      {reconcileAccId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Reconcile Balance</h3>
              <button
                onClick={() => setReconcileAccId(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500">
              Enter the actual current balance from your bank statement. A reconciliation
              transaction will be created automatically.
            </p>
            <input
              type="number"
              value={reconcileValue}
              onChange={(e) => { setReconcileValue(e.target.value); setReconcileError(""); }}
              placeholder="Enter actual balance (e.g. 52000)"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              autoFocus
            />
            {reconcileError && (
              <p className="text-xs text-red-500">{reconcileError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setReconcileAccId(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={applyReconcile}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {showTransferModal && (
        <TransactionFormModal
          initialType="transfer"
          onClose={() => setShowTransferModal(false)}
        />
      )}
      {showAccountModal && (
        <AccountManagementModal
          accId={editingAccountId}
          onClose={() => { setShowAccountModal(false); setEditingAccountId(null); }}
        />
      )}

      {/* Account Summary Header */}
      <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div className="flex-1 space-y-2 relative z-10 w-full text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500 mb-1">
            <Wallet className="w-4 h-4" />
            <span className="font-semibold text-sm uppercase tracking-wider">Total Liquidity</span>
            <button
              onClick={() => setIsMasked(!isMasked)}
              className="ml-2 text-slate-400 hover:text-indigo-600 transition-colors"
              aria-label={isMasked ? "Show balances" : "Hide balances"}
            >
              {isMasked ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            {isMasked ? "₹ •••••••" : formatINR(totalLiquidity)}
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2">
            Positive balances minus credit card outstanding.
          </p>
          <div className="flex items-center justify-center md:justify-start gap-2 mt-6">
            <button
              onClick={() => setShowAccountModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Account
            </button>
            <button
              onClick={() => setShowTransferModal(true)}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95"
            >
              <ArrowRightLeft className="w-4 h-4" /> Transfer
            </button>
          </div>
        </div>

        <div className="w-full md:w-64 h-48 md:h-64 relative z-10">
          {chartData.length > 0 ? (
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
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatINR(value)}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <Wallet className="w-16 h-16" />
            </div>
          )}
          {chartData.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Liquid</span>
              <span className="text-lg font-black text-slate-800">{formatINR(totalPositive)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Trust Badge */}
      <div className="flex items-center justify-center gap-2 text-slate-400 bg-slate-50 py-3 rounded-xl border border-slate-100">
        <ShieldCheck className="w-4 h-4" />
        <span className="text-xs font-semibold">
          Your data is stored locally. We do not have access to your funds.
        </span>
      </div>

      {/* Empty State */}
      {accounts.length === 0 && (
        <div className="text-center py-16 space-y-4">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto">
            <Wallet className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="font-bold text-slate-700 text-lg">No accounts yet</h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">
            Add your bank accounts, wallets, and credit cards to start tracking your finances.
          </p>
          <button
            onClick={() => setShowAccountModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add First Account
          </button>
        </div>
      )}

      <div className="space-y-10">
        {/* Bank Accounts */}
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
                  <div className="absolute right-4 top-4 text-slate-300 group-hover:text-slate-500">
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
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                            Salary
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-500 font-mono tracking-wider mb-4">
                        {maskAccNumber(acc.lastFour)}
                      </p>
                      <div className="flex items-end justify-between mt-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                            Current Balance
                          </p>
                          <p className={cn(
                            "text-2xl font-black tracking-tight",
                            acc.balance < 0 ? "text-red-600" : "text-slate-900"
                          )}>
                            {isMasked ? "₹ •••••" : formatINR(acc.balance)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => openReconcile(e, acc.id)}
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
                onClick={() => toggleExpand("banks")}
                className="mt-4 w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-sm font-bold text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-all bg-white shadow-sm flex items-center justify-center gap-2"
              >
                {expanded.banks ? "Show Less" : `+${bankAccounts.length - 2} more bank accounts`}
              </button>
            )}
          </section>
        )}

        {/* Credit Cards */}
        {creditCards.length > 0 && (
          <section className="relative">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" /> My Wallet / Cards
              </h3>
              {!expanded.cards && creditCards.length > 1 && (
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Card {currentCardIndex + 1} of {creditCards.length}
                </div>
              )}
            </div>

            <div className={cn(
              "relative transition-all duration-500",
              expanded.cards ? "space-y-6" : "h-[280px]"
            )}>
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
                const outstanding = Math.max(0, -(acc.balance));
                const limit       = acc.creditLimit ?? 100000;
                const available   = limit - outstanding;
                const utilization = limit > 0 ? (outstanding / limit) * 100 : 0;
                const due         = getDueDaysLabel(acc.dueDate);

                const relativePos = !expanded.cards
                  ? (index - currentCardIndex + creditCards.length) % creditCards.length
                  : 0;
                const isActive = relativePos === 0;
                const isNext   = relativePos === 1;
                const isPrev   = relativePos === creditCards.length - 1;

                const isHDFC    = acc.name.toLowerCase().includes("hdfc");
                const isPremium = ["black","regalia","infinit"].some((k) => acc.name.toLowerCase().includes(k));
                const cardColor = isHDFC
                  ? "from-indigo-900 to-indigo-800"
                  : isPremium
                  ? "from-zinc-900 via-zinc-800 to-black"
                  : "from-slate-800 to-slate-900";

                return (
                  <div
                    key={acc.id}
                    onClick={() => { setEditingAccountId(acc.id); setShowAccountModal(true); }}
                    style={{
                      zIndex: !expanded.cards ? (isActive ? 50 : 10) : 10,
                      transform: !expanded.cards
                        ? isActive
                          ? "translateX(0) scale(1)"
                          : isNext
                          ? "translateX(10%) scale(0.9)"
                          : isPrev
                          ? "translateX(-10%) scale(0.9)"
                          : "scale(0.8)"
                        : "none",
                      opacity: !expanded.cards ? (isActive ? 1 : isNext || isPrev ? 0.3 : 0) : 1,
                      pointerEvents: !expanded.cards ? (isActive ? "auto" : "none") : "auto",
                    }}
                    className={cn(
                      "group w-full max-w-xl mx-auto rounded-3xl p-6 shadow-2xl relative overflow-hidden cursor-pointer transition-all duration-700 border border-white/10",
                      !expanded.cards ? "absolute top-0 left-0 right-0" : "relative mb-6",
                      `bg-gradient-to-br ${cardColor}`
                    )}
                  >
                    <div className="absolute top-8 left-8 flex flex-col gap-2 opacity-80">
                      <div className="w-10 h-7 bg-gradient-to-br from-yellow-200 to-yellow-500 rounded-md shadow-inner flex items-center justify-center">
                        <div className="w-6 h-4 border border-black/10 rounded-sm" />
                      </div>
                    </div>

                    <div className="absolute top-8 right-8 flex items-center gap-3">
                      <div className="text-white/40 text-[10px] font-black italic uppercase tracking-tighter mr-1">
                        {getCardNetwork(acc.lastFour)}
                      </div>
                      <div className="w-14 h-10 bg-white/10 rounded-xl backdrop-blur-md flex items-center justify-center p-1.5 border border-white/5">
                        {acc.logoUrl ? (
                          <img src={acc.logoUrl} alt={acc.name} className="w-full h-full object-contain" />
                        ) : (
                          <CreditCard className="w-6 h-6 text-white/50" />
                        )}
                      </div>
                    </div>

                    <div className="mt-16 mb-10">
                      <h4 className="text-white/60 text-[10px] uppercase font-bold tracking-widest mb-1">Issuer</h4>
                      <p className="text-white font-bold tracking-wider text-sm">{acc.name}</p>
                      <p className="text-white/90 font-mono text-xl tracking-[0.2em] mt-4 flex gap-4">
                        <span>****</span><span>****</span><span>****</span>
                        <span className="bg-white/10 px-2 py-0.5 rounded-lg">{acc.lastFour ?? "0000"}</span>
                      </p>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-0.5">Outstanding</p>
                        <p className="text-2xl font-black text-white tracking-tight">{formatINR(outstanding)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-0.5">Available</p>
                        <p className="text-lg font-bold text-indigo-300 tracking-tight">{formatINR(available)}</p>
                      </div>
                    </div>

                    <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-400"
                        style={{ width: `${Math.min(utilization, 100)}%` }}
                      />
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      {due && (
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full bg-white/10 border border-white/10 ${due.color}`}>
                          {due.text}
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-white/40 ml-auto">
                        {utilization.toFixed(0)}% Utilized
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {creditCards.length > 2 && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => toggleExpand("cards")}
                  className="group flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-600 hover:shadow-lg transition-all"
                >
                  {expanded.cards ? "Collapse Stack" : `View All ${creditCards.length} Cards`}
                </button>
              </div>
            )}
          </section>
        )}

        {/* Loans & EMI */}
        {loans.length > 0 && (
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4 px-1 flex items-center gap-2">
              <HandCoins className="w-5 h-5 text-indigo-600" /> Loans & EMI
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(expanded.loans ? loans : loans.slice(0, 2)).map((acc) => (
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
                        {acc.interestRate != null && (
                          <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100 uppercase">
                            {acc.interestRate}% Interest
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mb-4">
                        Outstanding:{" "}
                        <span className="font-black text-red-600">{formatINR(Math.abs(acc.balance))}</span>
                      </p>
                      {acc.emiAmount != null && (
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Monthly EMI</p>
                            <p className="text-lg font-black text-slate-800">{formatINR(acc.emiAmount)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Next Due</p>
                            <p className="text-xs font-bold text-slate-600">Day {acc.emiDate ?? "05"} of month</p>
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
                onClick={() => toggleExpand("loans")}
                className="mt-3 w-full py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-all"
              >
                {expanded.loans ? "Show Less" : `+${loans.length - 2} more loans`}
              </button>
            )}
          </section>
        )}

        {/* Retirement & PF */}
        {retirementAccounts.length > 0 && (
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4 px-1 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" /> Retirement & PF
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(expanded.retirement ? retirementAccounts : retirementAccounts.slice(0, 2)).map((acc) => (
                <div
                  key={acc.id}
                  onClick={() => { setEditingAccountId(acc.id); setShowAccountModal(true); }}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-slate-900">{acc.name}</h4>
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 uppercase">
                          {acc.interestRate ?? 8.15}% p.a.
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mb-2">
                        Corpus: <span className="font-black text-indigo-600">{formatINR(acc.balance)}</span>
                      </p>
                      {acc.fullAccountNumber && (
                        <p className="text-xs font-mono text-slate-500">
                          UAN: {acc.fullAccountNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {retirementAccounts.length > 2 && (
              <button
                onClick={() => toggleExpand("retirement")}
                className="mt-3 w-full py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-all"
              >
                {expanded.retirement ? "Show Less" : `+${retirementAccounts.length - 2} more`}
              </button>
            )}
          </section>
        )}

        {/* Cash & Wallets */}
        {cashWallets.length > 0 && (
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4 px-1 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-indigo-600" /> Cash & Wallets
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(expanded.cash ? cashWallets : cashWallets.slice(0, 4)).map((acc) => (
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
                  <h4 className="font-bold text-slate-700 text-sm mb-1 line-clamp-1 group-hover:text-indigo-600">{acc.name}</h4>
                  <p className="text-lg font-black text-slate-900">
                    {isMasked ? "₹•••" : formatINR(acc.balance)}
                  </p>
                </div>
              ))}
            </div>
            {cashWallets.length > 4 && (
              <button
                onClick={() => toggleExpand("cash")}
                className="mt-4 w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-sm font-bold text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-all bg-white shadow-sm flex items-center justify-center gap-2"
              >
                {expanded.cash ? "Show Less" : `+${cashWallets.length - 4} more items`}
              </button>
            )}
          </section>
        )}
      </div>
    </div>
  );
};
