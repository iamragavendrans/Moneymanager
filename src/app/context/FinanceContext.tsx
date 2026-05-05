import React, { createContext, useContext, useEffect, useState } from "react";
import { format, subDays, subMonths } from "date-fns";

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
  };
}

export interface Profile {
  companyName: string;
}

export interface Account {
  id: string;
  name: string;
  type: "bank" | "UPI" | "wallet" | "cash" | "credit_card" | "loan" | "investment" | "meal_card" | "pf";
  balance: number;
  currency: string;
}

export interface Investment {
  id: string;
  category: "marketLinked" | "fixedIncome" | "gold" | "realEstate";
  name: string;
  [key: string]: any; // dynamic fields based on category
}

export interface Entity {
  id: string;
  type: "shop" | "person" | "recurring" | "subscription" | "giftcard" | "warranty" | "item" | "bank";
  name: string;
  [key: string]: any; // dynamic fields based on type
}

interface FinanceContextType {
  transactions: Transaction[];
  accounts: Account[];
  investments: Investment[];
  entities: Entity[];

  addTransaction: (tx: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, tx: Omit<Transaction, "id">) => void;
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

  getNetWorth: () => number;
  getTotalExpenses: (month?: Date) => number;
  getTotalIncome: (month?: Date) => number;

  profile: Profile;
  updateProfile: (p: Partial<Profile>) => void;
  resetData: () => void;
  wipeData: () => void;
}

// Default Data
const today = format(new Date(), "yyyy-MM-dd");
const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
const lastWeek = format(subDays(new Date(), 8), "yyyy-MM-dd");
const lastMonth = format(subMonths(new Date(), 1), "yyyy-MM-dd");
const twoMonthsAgo = format(subMonths(new Date(), 2), "yyyy-MM-dd");

const defaultAccounts: Account[] = [
  { id: "acc_1", name: "HDFC Bank", type: "bank", balance: 45000, currency: "INR" },
  { id: "acc_2", name: "Paytm Wallet", type: "wallet", balance: 2500, currency: "INR" },
  { id: "acc_3", name: "Amazon Pay ICICI", type: "credit_card", balance: -12500, currency: "INR" },
];

const defaultTransactions: Transaction[] = [
  { id: "tx_5", amount: 650, type: "expense", category: "Food", account_id: "acc_2", payee: "Swiggy", date: today, notes: "Dinner", tags: [] },
  { id: "tx_1", amount: 250, type: "expense", category: "Food", account_id: "acc_2", payee: "Swiggy", date: today, notes: "Lunch", tags: [] },
  { id: "tx_2", amount: 150000, type: "income", category: "Salary", account_id: "acc_1", payee: "Acme Corp", date: yesterday, notes: "April Salary", tags: [] },
  { id: "tx_3", amount: 1200, type: "expense", category: "Transport", account_id: "acc_2", payee: "Uber", date: yesterday, notes: "Airport ride", tags: [] },
  { id: "tx_4", amount: 5000, type: "transfer", category: "Transfer", account_id: "acc_1", to_account_id: "acc_2", payee: "Self", date: yesterday, notes: "Top up wallet", tags: [] },
  { id: "tx_6", amount: 2000, type: "expense", category: "Shopping", account_id: "acc_3", payee: "Amazon", date: lastWeek, notes: "Headphones", tags: [] },
  { id: "tx_7", amount: 145000, type: "income", category: "Salary", account_id: "acc_1", payee: "Acme Corp", date: lastMonth, notes: "March Salary", tags: [] },
  { id: "tx_8", amount: 3500, type: "expense", category: "Bills", account_id: "acc_1", payee: "Electricity", date: lastMonth, notes: "March Bill", tags: [] },
  { id: "tx_9", amount: 12000, type: "expense", category: "Housing", account_id: "acc_1", payee: "Landlord", date: lastMonth, notes: "Rent", tags: [] },
  { id: "tx_10", amount: 145000, type: "income", category: "Salary", account_id: "acc_1", payee: "Acme Corp", date: twoMonthsAgo, notes: "February Salary", tags: [] },
  { id: "tx_11", amount: 12000, type: "expense", category: "Housing", account_id: "acc_1", payee: "Landlord", date: twoMonthsAgo, notes: "Rent", tags: [] },
];

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("finance_txns");
    return saved ? JSON.parse(saved) : defaultTransactions;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem("finance_accounts");
    return saved ? JSON.parse(saved) : defaultAccounts;
  });

  const [investments, setInvestments] = useState<Investment[]>(() => {
    const saved = localStorage.getItem("finance_investments");
    return saved ? JSON.parse(saved) : [];
  });

  const [entities, setEntities] = useState<Entity[]>(() => {
    const saved = localStorage.getItem("finance_entities");
    return saved ? JSON.parse(saved) : [];
  });

  const [profile, setProfile] = useState<Profile>(() => {
    const saved = localStorage.getItem("finance_profile");
    return saved ? JSON.parse(saved) : { companyName: "Acme Corp" };
  });

  useEffect(() => { localStorage.setItem("finance_txns", JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem("finance_accounts", JSON.stringify(accounts)); }, [accounts]);
  useEffect(() => { localStorage.setItem("finance_investments", JSON.stringify(investments)); }, [investments]);
  useEffect(() => { localStorage.setItem("finance_entities", JSON.stringify(entities)); }, [entities]);
  useEffect(() => { localStorage.setItem("finance_profile", JSON.stringify(profile)); }, [profile]);

  // --- Transactions ---
  const applyTransactionImpact = (tx: Transaction | Omit<Transaction, "id">, reverse: boolean = false) => {
    const multiplier = reverse ? -1 : 1;
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === tx.account_id) {
          if (tx.type === "expense") return { ...acc, balance: acc.balance + (tx.amount * multiplier * -1) };
          if (tx.type === "income") return { ...acc, balance: acc.balance + (tx.amount * multiplier) };
          if (tx.type === "transfer") return { ...acc, balance: acc.balance + (tx.amount * multiplier * -1) };
        }
        if (tx.type === "transfer" && acc.id === tx.to_account_id) {
          return { ...acc, balance: acc.balance + (tx.amount * multiplier) };
        }
        return acc;
      })
    );
  };

  const addTransaction = (tx: Omit<Transaction, "id">) => {
    const newTx = { ...tx, id: `tx_${Date.now()}` };
    setTransactions((prev) => [newTx, ...prev]);
    applyTransactionImpact(newTx);
  };

  const updateTransaction = (id: string, updatedTx: Omit<Transaction, "id">) => {
    setTransactions((prev) => {
      const oldTx = prev.find(t => t.id === id);
      if (oldTx) applyTransactionImpact(oldTx, true); // reverse old
      applyTransactionImpact(updatedTx); // apply new
      return prev.map(t => t.id === id ? { ...updatedTx, id } : t);
    });
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => {
      const oldTx = prev.find(t => t.id === id);
      if (oldTx) applyTransactionImpact(oldTx, true);
      return prev.filter(t => t.id !== id);
    });
  };

  // --- Accounts ---
  const addAccount = (acc: Omit<Account, "id">) => setAccounts((prev) => [...prev, { ...acc, id: `acc_${Date.now()}` }]);
  const updateAccount = (id: string, acc: Partial<Account>) => setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...acc } : a));
  const deleteAccount = (id: string) => setAccounts(prev => prev.filter(a => a.id !== id)); // Also implies dropping txns linked? Keeping simple for now.

  // --- Investments ---
  const addInvestment = (inv: Omit<Investment, "id">) => setInvestments(prev => [...prev, { ...inv, id: `inv_${Date.now()}` } as Investment]);
  const updateInvestment = (id: string, inv: Partial<Investment>) => setInvestments(prev => prev.map(i => i.id === id ? { ...i, ...inv } : i));
  const deleteInvestment = (id: string) => setInvestments(prev => prev.filter(i => i.id !== id));

  // --- Entities ---
  const addEntity = (ent: Omit<Entity, "id">) => setEntities(prev => [...prev, { ...ent, id: `ent_${Date.now()}` } as Entity]);
  const updateEntity = (id: string, ent: Partial<Entity>) => setEntities(prev => prev.map(e => e.id === id ? { ...e, ...ent } : e));
  const deleteEntity = (id: string) => setEntities(prev => prev.filter(e => e.id !== id));

  // --- Profile ---
  const updateProfile = (p: Partial<Profile>) => setProfile(prev => ({ ...prev, ...p }));

  // --- Helpers ---
  const getNetWorth = () => accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const getTotalExpenses = () => transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const getTotalIncome = () => transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);

  const resetData = () => {
    setTransactions([]);
    // Restore default balances logic omitted for brevity, but basically keeps accounts.
  };

  const wipeData = () => {
    setTransactions([]);
    setAccounts(defaultAccounts);
    setInvestments([]);
    setEntities([]);
  };

  return (
    <FinanceContext.Provider value={{
      transactions, accounts, investments, entities,
      addTransaction, updateTransaction, deleteTransaction,
      addAccount, updateAccount, deleteAccount,
      addInvestment, updateInvestment, deleteInvestment,
      addEntity, updateEntity, deleteEntity,
      profile, updateProfile,
      getNetWorth, getTotalExpenses, getTotalIncome,
      resetData, wipeData
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) throw new Error("useFinance must be used within a FinanceProvider");
  return context;
};
