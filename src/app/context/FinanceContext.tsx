import React, { createContext, useContext, useEffect, useState } from "react";
import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";

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
  companyName: string;
  logoDevToken?: string;
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
  logoUrl?: string;        // URL for bank/card logo
  expiryDate?: string;     // for cards
  upiId?: string;          // for UPI
  walletMobile?: string;   // for wallets
}

export interface Investment {
  id: string;
  category: "marketLinked" | "fixedIncome" | "gold" | "realEstate";
  name: string;
  [key: string]: any;
}

export interface Entity {
  id: string;
  type: "shop" | "person" | "recurring" | "subscription" | "giftcard" | "warranty" | "item" | "bank";
  name: string;
  [key: string]: any;
}

interface FinanceContextType {
  transactions: Transaction[];
  accounts: Account[];
  investments: Investment[];
  entities: Entity[];

  updateProfile: (profile: Partial<Profile>) => void;
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
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
  { id: "acc_1", name: "HDFC Salary", type: "bank", balance: 145000, currency: "INR", lastFour: "4521", fullAccountNumber: "501002345678", ifsc: "HDFC0001234", logoUrl: "https://img.logo.dev/hdfcbank.com?size=128" },
  { id: "acc_2", name: "Paytm Wallet", type: "wallet", balance: 2500, currency: "INR", logoUrl: "https://img.logo.dev/paytm.com?size=128" },
  { id: "acc_3", name: "Amazon Pay ICICI", type: "credit_card", balance: -12500, currency: "INR", lastFour: "9012", creditLimit: 150000, dueDate: format(subDays(new Date(), -12), "yyyy-MM-dd"), logoUrl: "https://img.logo.dev/icicibank.com?size=128" },
  { id: "acc_4", name: "PhonePe UPI", type: "UPI", balance: 1200, currency: "INR", logoUrl: "https://img.logo.dev/phonepe.com?size=128" },
  { id: "acc_5", name: "Physical Cash", type: "cash", balance: 4500, currency: "INR" },
  { id: "acc_6", name: "Home Loan (SBI)", type: "loan", balance: -3500000, currency: "INR", interestRate: 8.5, tenureMonths: 240, emiAmount: 32000, emiDate: 5, logoUrl: "https://img.logo.dev/sbi.co.in?size=128" },
  { id: "acc_7", name: "Groww Stocks", type: "investment", balance: 245000, currency: "INR", logoUrl: "https://img.logo.dev/groww.in?size=128" },
  { id: "acc_8", name: "EPF Account", type: "pf", balance: 450000, currency: "INR", employeeId: "UAN-10023456", monthlyContribution: 1800, logoUrl: "https://img.logo.dev/epfindia.gov.in?size=128" },
  { id: "acc_9", name: "Pluxee (Sodexo)", type: "meal_card", balance: 12000, currency: "INR", logoUrl: "https://img.logo.dev/pluxee.in?size=128" },
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
    const raw: Transaction[] = saved ? JSON.parse(saved) : defaultTransactions;
    // Sanitize: fix any NaN/null amounts from previous buggy partial updates
    return raw.map(t => ({ ...t, amount: isNaN(Number(t.amount)) ? 0 : Number(t.amount) }));
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
  // Applies or reverses a transaction's balance impact atomically.
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
    setTransactions((prev) => [newTx, ...prev]);
    setAccounts((prev) => applyImpact(prev, newTx));
  };

  const updateTransaction = (id: string, partialTx: Partial<Transaction>) => {
    setTransactions((prev) => {
      const oldTx = prev.find(t => t.id === id);
      if (!oldTx) return prev;
      // Deep-merge: only override the fields explicitly passed
      const updatedTx: Transaction = { ...oldTx, ...partialTx, id };
      setAccounts((accs) => {
        // Undo old impact, apply new impact
        const reverted = applyImpact(accs, oldTx, true);
        return applyImpact(reverted, updatedTx);
      });
      return prev.map(t => t.id === id ? updatedTx : t);
    });
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => {
      const oldTx = prev.find(t => t.id === id);
      if (oldTx) setAccounts((accs) => applyImpact(accs, oldTx, true));
      return prev.filter(t => t.id !== id);
    });
  };

  // --- Accounts ---
  const addAccount = (acc: Omit<Account, "id">) => setAccounts((prev) => [...prev, { ...acc, id: `acc_${Date.now()}` }]);
  const updateAccount = (id: string, acc: Partial<Account>) => setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...acc } : a));

  const deleteAccount = (id: string) => {
    // Orphan-safe: remove transactions tied to this account
    setTransactions(prev => prev.filter(t => t.account_id !== id && t.to_account_id !== id));
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  // --- Investments ---
  const addInvestment = (inv: Omit<Investment, "id">) => setInvestments(prev => [...prev, { ...inv, id: `inv_${Date.now()}` } as Investment]);
  const updateInvestment = (id: string, inv: Partial<Investment>) => setInvestments(prev => prev.map(i => i.id === id ? { ...i, ...inv } : i));
  const deleteInvestment = (id: string) => setInvestments(prev => prev.filter(i => i.id !== id));

  // --- Entities ---
  const addEntity = (ent: Omit<Entity, "id">) => setEntities(prev => [...prev, { ...ent, id: `ent_${Date.now()}` } as Entity]);
  const updateEntity = (id: string, ent: Partial<Entity>) => {
    setEntities(prev => {
      const old = prev.find(e => e.id === id);
      if (old && ent.name && ent.name !== old.name) {
        // Name changed - sync across transactions
        setTransactions(txs => txs.map(t => {
          const payeeMatch = t.payee.toLowerCase() === old.name.toLowerCase();
          const tagMatch = t.tags.includes(old.name);
          if (payeeMatch || tagMatch) {
            return {
              ...t,
              payee: payeeMatch ? ent.name! : t.payee,
              tags: t.tags.map(tag => tag === old.name ? ent.name! : tag)
            };
          }
          return t;
        }));
      }
      return prev.map(e => e.id === id ? { ...e, ...ent } : e);
    });
  };
  const deleteEntity = (id: string) => setEntities(prev => prev.filter(e => e.id !== id));

  // --- Profile ---
  const updateProfile = (p: Partial<Profile>) => setProfile(prev => ({ ...prev, ...p }));

  // --- Helpers ---
  const getNetWorth = () => accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const getTotalExpenses = (month?: Date): number => {
    const txs = month
      ? transactions.filter(t => {
          const d = new Date(t.date);
          return d >= startOfMonth(month) && d <= endOfMonth(month);
        })
      : transactions;
    return txs.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalIncome = (month?: Date): number => {
    const txs = month
      ? transactions.filter(t => {
          const d = new Date(t.date);
          return d >= startOfMonth(month) && d <= endOfMonth(month);
        })
      : transactions;
    return txs.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  };

  const resetData = () => {
    // Restore default seed transactions and reset accounts to their seed balances.
    setTransactions(defaultTransactions);
    setAccounts(defaultAccounts);
  };

  const wipeData = () => {
    // Full clean slate — removes all user data.
    setTransactions([]);
    setAccounts(defaultAccounts);
    setInvestments([]);
    setEntities([]);
  };

  return (
    <FinanceContext.Provider value={{
      transactions, accounts, investments, entities,
      updateProfile,
      addTransaction, updateTransaction, deleteTransaction,
      addAccount, updateAccount, deleteAccount,
      addInvestment, updateInvestment, deleteInvestment,
      addEntity, updateEntity, deleteEntity,
      profile,
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
