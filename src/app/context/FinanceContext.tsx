import React, { createContext, useContext, useEffect, useState } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import { seedAllData } from "../utils/seedData";

export type TransactionType = "expense" | "income" | "transfer";

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  account_id: string;
  to_account_id?: string;
  payee: string;
  date: string;
  notes: string;
  tags: string[];
  mode?: "UPI" | "card" | "cash" | "netbanking" | "cheque";
  status?: "cleared" | "pending";
  subCategory?: string;
  items?: { name: string; qty: string; unit: string; price?: number }[];
  split?: {
    with: string[];
    shareStrategy: string;
    dueDate: string;
    shares?: Record<string, string>;
    portionAssignments?: Record<number, Record<string, string>>;
  };
}

export interface Profile {
  userName?: string;
  userEmail?: string;
  companyName: string;
  logoDevToken?: string;
  salaryBand?: string;
  employer?: string;
  taxRegime?: "old" | "new";
  baseCurrency?: string;
  maskBalances?: boolean;
}

export interface Account {
  id: string;
  name: string;
  type: "bank" | "UPI" | "wallet" | "cash" | "credit_card" | "loan" | "investment" | "meal_card" | "pf";
  balance: number;
  currency: string;
  lastFour?: string;
  fullAccountNumber?: string;
  ifsc?: string;
  creditLimit?: number;
  dueDate?: string;
  interestRate?: number;
  tenureMonths?: number;
  emiAmount?: number;
  emiDate?: number;
  monthlyContribution?: number;
  employeeId?: string;
  logoUrl?: string;
}

export interface Investment {
  id: string;
  name: string;
  type: "Stock" | "Mutual Fund" | "Fixed Income" | "Gold" | "Real Estate";
  category?: "marketLinked" | "fixedIncome" | "gold" | "realEstate";
  investedAmount: number;
  currentValue: number;
  quantity?: number;
  purchaseDate?: string;
  broker?: string;
  notes?: string;
  units?: number;
  avgNav?: number;
  currentNav?: number;
  isSIP?: boolean;
  principal?: number;
  current?: number;
  rate?: number;
  startDate?: string;
  maturityDate?: string;
  grams?: number;
  avgPrice?: number;
  currentPrice?: number;
  propertyValue?: number;
  loanOutstanding?: number;
}

export interface Entity {
  id: string;
  type: "shop" | "person" | "recurring" | "subscription" | "giftcard" | "warranty" | "item" | "bank";
  name: string;
  category?: string;
  logoUrl?: string;
  // Contact & location
  url?: string;
  location?: string;
  mode?: "online" | "offline";
  relationship?: string;
  phone?: string;
  // Recurring / subscription billing
  frequency?: string;
  amount?: number;
  nextDue?: string;
  provider?: string;
  // Gift card
  expiry?: string;
  balance?: number;
  // Warranty
  warrantyDetails?: string;
  // Item / inventory
  price?: number;
  quantity?: string;
  // Bank details
  accountNo?: string;
  branch?: string;
}

interface FinanceContextType {
  transactions: Transaction[];
  accounts: Account[];
  investments: Investment[];
  entities: Entity[];
  profile: Profile;
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, partialTx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addAccount: (acc: Omit<Account, "id">) => void;
  updateAccount: (id: string, acc: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  addInvestment: (inv: Omit<Investment, "id">) => void;
  updateInvestment: (id: string, inv: Partial<Investment>) => void;
  deleteInvestment: (id: string) => void;
  addEntity: (ent: Omit<Entity, "id">) => void;
  updateEntity: (id: string, ent: Partial<Entity>) => void;
  deleteEntity: (id: string) => void;
  updateProfile: (p: Partial<Profile>) => void;
  getNetWorth: () => number;
  getTotalExpenses: (month?: Date) => number;
  getTotalIncome: (month?: Date) => number;
  resetData: () => void;
  wipeData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

function safeParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    console.warn(`[MoneyManager] Failed to parse localStorage key "${key}". Using default.`);
    return fallback;
  }
}

function safeStore(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[MoneyManager] Failed to store key "${key}":`, e);
  }
}

function genId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    safeParse<Transaction[]>("finance_txns", [])
  );
  const [accounts, setAccounts] = useState<Account[]>(() =>
    safeParse<Account[]>("finance_accounts", [])
  );
  const [investments, setInvestments] = useState<Investment[]>(() =>
    safeParse<Investment[]>("finance_investments", [])
  );
  const [entities, setEntities] = useState<Entity[]>(() =>
    safeParse<Entity[]>("finance_entities", [])
  );
  const [profile, setProfile] = useState<Profile>(() =>
    safeParse<Profile>("finance_profile", { companyName: "Acme Corp" })
  );

  useEffect(() => { safeStore("finance_txns", transactions); }, [transactions]);
  useEffect(() => { safeStore("finance_accounts", accounts); }, [accounts]);
  useEffect(() => { safeStore("finance_investments", investments); }, [investments]);
  useEffect(() => { safeStore("finance_entities", entities); }, [entities]);
  useEffect(() => { safeStore("finance_profile", profile); }, [profile]);

  const applyImpact = (
    accs: Account[],
    tx: Omit<Transaction, "id"> | Transaction,
    reverse = false
  ): Account[] => {
    const m = reverse ? -1 : 1;
    return accs.map((acc) => {
      let delta = 0;
      if (acc.id === tx.account_id) {
        if (tx.type === "expense") delta = tx.amount * m * -1;
        if (tx.type === "income") delta = tx.amount * m;
        if (tx.type === "transfer") delta = tx.amount * m * -1;
      }
      if (tx.type === "transfer" && acc.id === tx.to_account_id) {
        delta = tx.amount * m;
      }
      return delta !== 0 ? { ...acc, balance: acc.balance + delta } : acc;
    });
  };

  // --- Transactions ---
  const addTransaction = (tx: Omit<Transaction, "id">) => {
    const newTx: Transaction = { ...tx, id: genId("tx") };
    setTransactions((prev) => [newTx, ...prev]);
    setAccounts((prev) => applyImpact(prev, newTx));
  };

  const updateTransaction = (id: string, partialTx: Partial<Transaction>) => {
    // Read current state from closure — avoids nested setState race condition
    const oldTx = transactions.find((t) => t.id === id);
    if (!oldTx) return;
    const updatedTx: Transaction = { ...oldTx, ...partialTx, id };
    setAccounts((accs) => applyImpact(applyImpact(accs, oldTx, true), updatedTx));
    setTransactions((prev) => prev.map((t) => (t.id === id ? updatedTx : t)));
  };

  const deleteTransaction = (id: string) => {
    const oldTx = transactions.find((t) => t.id === id);
    if (oldTx) setAccounts((accs) => applyImpact(accs, oldTx, true));
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // --- Accounts ---
  const addAccount = (acc: Omit<Account, "id">) =>
    setAccounts((prev) => [...prev, { ...acc, id: genId("acc") }]);
  const updateAccount = (id: string, acc: Partial<Account>) =>
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...acc } : a)));
  const deleteAccount = (id: string) => {
    setTransactions((prev) =>
      prev.filter((t) => t.account_id !== id && t.to_account_id !== id)
    );
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  // --- Investments ---
  const addInvestment = (inv: Omit<Investment, "id">) =>
    setInvestments((prev) => [...prev, { ...inv, id: genId("inv") } as Investment]);
  const updateInvestment = (id: string, inv: Partial<Investment>) =>
    setInvestments((prev) => prev.map((i) => (i.id === id ? { ...i, ...inv } : i)));
  const deleteInvestment = (id: string) =>
    setInvestments((prev) => prev.filter((i) => i.id !== id));

  // --- Entities ---
  const addEntity = (ent: Omit<Entity, "id">) =>
    setEntities((prev) => [...prev, { ...ent, id: genId("ent") } as Entity]);
  const updateEntity = (id: string, ent: Partial<Entity>) =>
    setEntities((prev) => prev.map((e) => (e.id === id ? { ...e, ...ent } : e)));
  const deleteEntity = (id: string) =>
    setEntities((prev) => prev.filter((e) => e.id !== id));

  // --- Profile ---
  const updateProfile = (p: Partial<Profile>) =>
    setProfile((prev) => ({ ...prev, ...p }));

  // --- Computed helpers ---
  const getNetWorth = () =>
    accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const getTotalExpenses = (month?: Date): number => {
    const txs = month
      ? transactions.filter((t) => {
          const d = new Date(t.date);
          return d >= startOfMonth(month) && d <= endOfMonth(month);
        })
      : transactions;
    return txs
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalIncome = (month?: Date): number => {
    const txs = month
      ? transactions.filter((t) => {
          const d = new Date(t.date);
          return d >= startOfMonth(month) && d <= endOfMonth(month);
        })
      : transactions;
    return txs
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const resetData = () => {
    const data = seedAllData();
    setTransactions(data.transactions);
    setAccounts(data.accounts);
    setEntities(data.entities);
    setInvestments(data.investments);
  };

  const wipeData = () => {
    setTransactions([]);
    setAccounts([]);
    setEntities([]);
    setInvestments([]);
    setProfile({ companyName: "Acme Corp" });
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        accounts,
        investments,
        entities,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addAccount,
        updateAccount,
        deleteAccount,
        addInvestment,
        updateInvestment,
        deleteInvestment,
        addEntity,
        updateEntity,
        deleteEntity,
        profile,
        updateProfile,
        getNetWorth,
        getTotalExpenses,
        getTotalIncome,
        resetData,
        wipeData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined)
    throw new Error("useFinance must be used within a FinanceProvider");
  return context;
};
