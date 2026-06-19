import React, { createContext, useContext, useEffect, useState } from "react";
import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { seedAllData } from "../utils/seedData";
import { CategoryDef, DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES, CATEGORY_ICON_MAP } from "../utils/categories";

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
  mode?: "UPI" | "card" | "cash" | "banking" | "cheque";
  status?: "cleared" | "pending";
  subCategory?: string;
  subSubCategory?: string;
  fromLocation?: string;
  toLocation?: string;
  items?: { name: string; qty: string; unit: string; price?: number }[];
  split?: {
    with: string[];
    shareStrategy: string;
    dueDate: string;
    shares?: Record<string, string>;
    portionAssignments?: Record<number, Record<string, string>>;
  };
}

export interface EmployerRecord {
  name: string;
  periodFrom: string;
  periodTo: string;
}

export interface Profile {
  firstName?: string;
  lastName?: string;
  mobileNumber?: string;
  emailId?: string;
  dob?: string;
  employerName?: string;
  employerLocation?: string;
  homeLocation?: string;
  currentStayName?: string;
  currentStayLocation?: string;
  logoDevToken?: string;
  brandfetchClientId?: string;
  taxRegime?: "old" | "new";
  baseCurrency?: string;
  maskBalances?: boolean;
  budgets?: Record<string, number>;
}

export interface Account {
  id: string;
  name: string;
  type: "bank" | "UPI" | "wallet" | "cash" | "credit_card" | "loan" | "investment" | "meal_card" | "pf" | "debit" | "asset" | "chit";
  subType?: string; // Salary, Checking, Savings, etc.
  balance: number;
  currency: string;
  lastFour?: string;
  fullAccountNumber?: string;
  accountHolderName?: string;
  ifsc?: string;
  branch?: string;
  employerName?: string;
  employerLocation?: string;
  cardNetwork?: string;
  cardVariant?: string;
  issuerBank?: string;
  expiryDate?: string;
  creditLimit?: number;
  dueDate?: string;
  interestRate?: number;   // for loans
  tenureMonths?: number;   // for loans
  emiAmount?: number;      // for loans
  emiDate?: number;        // day of month (1-31)
  monthlyContribution?: number; // for PF
  employeeId?: string;     // for PF
  logoUrl?: string;
  upiId?: string;
  walletMobile?: string;
  maturityAmount?: number;
  maturityDate?: string;
  paidMonths?: number;
  startDate?: string;
  paymentSchedule?: { amount: number; paid: boolean; month?: string }[];
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
  type: "shop" | "person" | "recurring" | "subscription" | "giftcard" | "membership" | "asset" | "inventory" | "warranty" | "employment";
  name: string;
  category?: string;
  logoUrl?: string;
  configDetails?: Record<string, any>;
  // Extra metadata
  url?: string;
  location?: string;
  mode?: "online" | "offline";
  relationship?: string;
  phone?: string;
  accountNo?: string;
  ifsc?: string;
  branch?: string;
  frequency?: string;
  amount?: number;
  nextDue?: string;
  expiry?: string;
  expiryDate?: string;
  balance?: number;
  status?: "active" | "paused" | "terminated";
  provider?: string;
  quantity?: number;
  unit?: string;
  policyNo?: string;
  itemId?: string;
  price?: number;
  picUrl?: string;
  warrantyDetails?: string;
  totalBalance?: number;
  billingDetails?: string;
  recurringDuration?: string;
  subType?: string;
  notes?: string;
}

interface FinanceContextType {
  transactions: Transaction[];
  accounts: Account[];
  investments: Investment[];
  entities: Entity[];
  profile: Profile;
  categories: CategoryDef[];
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
  restoreData: (data: { transactions?: Transaction[]; accounts?: Account[]; investments?: Investment[]; entities?: Entity[]; profile?: Partial<Profile>; categories?: CategoryDef[] }) => void;
  updateCategory: (id: string, patch: Partial<CategoryDef>) => void;
  addCategory: (cat: Omit<CategoryDef, "id">) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (ordered: CategoryDef[]) => void;
  resetCategories: () => void;
  updateBudget: (category: string, amount: number) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem("finance_txns");
      if (!saved || saved === "undefined" || saved === "null") return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const saved = localStorage.getItem("finance_accounts");
      if (!saved || saved === "undefined" || saved === "null") return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  });

  const [investments, setInvestments] = useState<Investment[]>(() => {
    try {
      const saved = localStorage.getItem("finance_investments");
      if (!saved || saved === "undefined" || saved === "null") return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  });

  const [entities, setEntities] = useState<Entity[]>(() => {
    try {
      const saved = localStorage.getItem("finance_entities");
      if (!saved || saved === "undefined" || saved === "null") return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  });

  const [profile, setProfile] = useState<Profile>(() => {
    const saved = localStorage.getItem("finance_profile");
    const baseProfile = saved ? JSON.parse(saved) : { 
      employerName: "Acme Corp", 
    };
    // Always ensure hardcoded keys are present
    return {
      ...baseProfile,
      brandfetchClientId: "1idsKu59XkpClBMM0Wa",
      logoDevToken: baseProfile.logoDevToken || "" // Keep existing or empty if not provided
    };
  });

  const [categories, setCategories] = useState<CategoryDef[]>(() => {
    const defaults = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES];
    try {
      const saved = localStorage.getItem("finance_categories");
      const currentVersion = localStorage.getItem("finance_cat_version");
      
      // Migration: If version is old or missing, perform a reset/update
      if (currentVersion !== "elite_v3") {
        localStorage.setItem("finance_cat_version", "elite_v3");
        if (saved && saved !== "undefined" && saved !== "null") {
          localStorage.setItem("finance_categories", JSON.stringify(defaults));
          return defaults;
        }
      }

      if (!saved || saved === "undefined" || saved === "null") return defaults;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : defaults;
    } catch (e) {
      return defaults;
    }
  });

  useEffect(() => { localStorage.setItem("finance_txns", JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem("finance_accounts", JSON.stringify(accounts)); }, [accounts]);
  useEffect(() => { localStorage.setItem("finance_investments", JSON.stringify(investments)); }, [investments]);
  useEffect(() => { localStorage.setItem("finance_entities", JSON.stringify(entities)); }, [entities]);
  useEffect(() => { localStorage.setItem("finance_profile", JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem("finance_categories", JSON.stringify(categories)); }, [categories]);

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

  // --- Categories ---
  const updateCategory = (id: string, patch: Partial<CategoryDef>) =>
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));

  const addCategory = (cat: Omit<CategoryDef, "id">) => {
    const id = `custom_${Date.now()}`;
    setCategories(prev => [...prev, { ...cat, id } as CategoryDef]);
  };

  const deleteCategory = (id: string) =>
    setCategories(prev => prev.filter(c => c.id !== id));

  const reorderCategories = (ordered: CategoryDef[]) => setCategories(ordered);

  const resetCategories = () => {
    // Deep clone to ensure we get fresh objects from defaults
    const defaults = JSON.parse(JSON.stringify([...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES]));
    setCategories(defaults);
  };

  const updateBudget = (category: string, amount: number) => {
    setProfile(prev => ({
      ...prev,
      budgets: { ...(prev.budgets || {}), [category]: amount }
    }));
  };

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
    setProfile({ employerName: "Acme Corp" });
    setCategories([...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES]);
  };

  const restoreData = (data: { transactions?: Transaction[]; accounts?: Account[]; investments?: Investment[]; entities?: Entity[]; profile?: Partial<Profile>; categories?: CategoryDef[] }) => {
    if (data.transactions) setTransactions(data.transactions);
    if (data.accounts) setAccounts(data.accounts);
    if (data.investments) setInvestments(data.investments);
    if (data.entities) setEntities(data.entities);
    if (data.profile) setProfile(prev => ({ ...prev, ...data.profile }));
    if (Array.isArray(data.categories)) setCategories(data.categories);
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
      resetData, wipeData, restoreData,
      categories, updateCategory, addCategory, deleteCategory, reorderCategories, resetCategories,
      updateBudget,
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
