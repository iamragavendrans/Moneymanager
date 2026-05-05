import React, { createContext, useContext, useEffect, useState } from "react";
import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";
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
  interestRate?: number;   // for loans
  tenureMonths?: number;   // for loans
  emiAmount?: number;      // for loans
  emiDate?: number;        // day of month (1-31)
  monthlyContribution?: number; // for PF
  employeeId?: string;     // for PF
  logoUrl?: string;
}

export interface Investment {
  id: string;
  name: string;
  type: "Stock" | "Mutual Fund" | "Fixed Income" | "Gold" | "Real Estate";
  category?: 'marketLinked' | 'fixedIncome' | 'gold' | 'realEstate';
  investedAmount: number;
  currentValue: number;
  quantity?: number;
  purchaseDate?: string;
  broker?: string;
  notes?: string;
  // Financial Tracking Fields
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
  // Extra metadata
  url?: string;
  location?: string;
  mode?: "online" | "offline";
  relationship?: string;
  phone?: string;
  frequency?: string;
  amount?: number;
  nextDue?: string;
  expiry?: string;
  balance?: number;
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

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("finance_txns");
    const raw: Transaction[] = saved ? JSON.parse(saved) : [];
    return raw;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem("finance_accounts");
    return saved ? JSON.parse(saved) : [];
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
  const applyImpact = (accs: Account[], tx: Omit<Transaction, "id"> | Transaction, reverse = false): Account[] => {
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

  const addTransaction = (tx: Omit<Transaction, "id">) => {
    const newTx = { ...tx, id: `tx_${Date.now()}` };
    setTransactions((prev: Transaction[]) => [newTx, ...prev]);
    setAccounts((prev: Account[]) => applyImpact(prev, newTx));
  };

  const updateTransaction = (id: string, partialTx: Partial<Transaction>) => {
    setTransactions((prev: Transaction[]) => {
      const oldTx = prev.find((t: Transaction) => t.id === id);
      if (!oldTx) return prev;
      const updatedTx: Transaction = { ...oldTx, ...partialTx, id };
      setAccounts((accs: Account[]) => {
        const reverted = applyImpact(accs, oldTx, true);
        return applyImpact(reverted, updatedTx);
      });
      return prev.map((t: Transaction) => t.id === id ? updatedTx : t);
    });
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev: Transaction[]) => {
      const oldTx = prev.find((t: Transaction) => t.id === id);
      if (oldTx) setAccounts((accs: Account[]) => applyImpact(accs, oldTx, true));
      return prev.filter((t: Transaction) => t.id !== id);
    });
  };

  // --- Accounts ---
  const addAccount = (acc: Omit<Account, "id">) => setAccounts((prev: Account[]) => [...prev, { ...acc, id: `acc_${Date.now()}` }]);
  const updateAccount = (id: string, acc: Partial<Account>) => setAccounts((prev: Account[]) => prev.map((a: Account) => a.id === id ? { ...a, ...acc } : a));
  const deleteAccount = (id: string) => {
    setTransactions((prev: Transaction[]) => prev.filter((t: Transaction) => t.account_id !== id && t.to_account_id !== id));
    setAccounts((prev: Account[]) => prev.filter((a: Account) => a.id !== id));
  };

  // --- Investments ---
  const addInvestment = (inv: Omit<Investment, "id">) => setInvestments((prev: Investment[]) => [...prev, { ...inv, id: `inv_${Date.now()}` } as Investment]);
  const updateInvestment = (id: string, inv: Partial<Investment>) => setInvestments((prev: Investment[]) => prev.map((i: Investment) => i.id === id ? { ...i, ...inv } : i));
  const deleteInvestment = (id: string) => setInvestments((prev: Investment[]) => prev.filter((i: Investment) => i.id !== id));

  // --- Entities ---
  const addEntity = (ent: Omit<Entity, "id">) => setEntities((prev: Entity[]) => [...prev, { ...ent, id: `ent_${Date.now()}` } as Entity]);
  const updateEntity = (id: string, ent: Partial<Entity>) => setEntities((prev: Entity[]) => prev.map((e: Entity) => e.id === id ? { ...e, ...ent } : e));
  const deleteEntity = (id: string) => setEntities((prev: Entity[]) => prev.filter((e: Entity) => e.id !== id));

  // --- Profile ---
  const updateProfile = (p: Partial<Profile>) => setProfile((prev: Profile) => ({ ...prev, ...p }));

  // --- Helpers ---
  const getNetWorth = () => accounts.reduce((sum: number, acc: Account) => sum + acc.balance, 0);

  const getTotalExpenses = (month?: Date): number => {
    const txs = month
      ? transactions.filter((t: Transaction) => {
          const d = new Date(t.date);
          return d >= startOfMonth(month) && d <= endOfMonth(month);
        })
      : transactions;
    return txs.filter((t: Transaction) => t.type === "expense").reduce((sum: number, t: Transaction) => sum + t.amount, 0);
  };

  const getTotalIncome = (month?: Date): number => {
    const txs = month
      ? transactions.filter((t: Transaction) => {
          const d = new Date(t.date);
          return d >= startOfMonth(month) && d <= endOfMonth(month);
        })
      : transactions;
    return txs.filter((t: Transaction) => t.type === "income").reduce((sum: number, t: Transaction) => sum + t.amount, 0);
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
