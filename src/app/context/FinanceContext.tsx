import React, { createContext, useContext, useEffect, useState } from "react";
import { format } from "date-fns";

export type TransactionType = "expense" | "income" | "transfer";

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  account_id: string;
  to_account_id?: string; // For transfers
  payee: string;
  date: string;
  notes: string;
  tags: string[];
}

export interface Account {
  id: string;
  name: string;
  type: "bank" | "upi" | "wallet" | "cash" | "credit_card" | "loan" | "investment" | "meal_card" | "pf";
  balance: number;
  currency: string;
}

interface FinanceContextType {
  transactions: Transaction[];
  accounts: Account[];
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  addAccount: (acc: Omit<Account, "id">) => void;
  getNetWorth: () => number;
  getTotalExpenses: (month?: Date) => number;
  getTotalIncome: (month?: Date) => number;
}

const defaultAccounts: Account[] = [
  { id: "acc_1", name: "HDFC Bank", type: "bank", balance: 45000, currency: "INR" },
  { id: "acc_2", name: "Paytm Wallet", type: "wallet", balance: 2500, currency: "INR" },
  { id: "acc_3", name: "Amazon Pay ICICI", type: "credit_card", balance: -12500, currency: "INR" },
];

const today = format(new Date(), "yyyy-MM-dd");
const yesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd");

const defaultTransactions: Transaction[] = [
  { id: "tx_5", amount: 650, type: "expense", category: "Food", account_id: "acc_2", payee: "Swiggy", date: today, notes: "Dinner", tags: [] },
  { id: "tx_1", amount: 250, type: "expense", category: "Food", account_id: "acc_2", payee: "Swiggy", date: today, notes: "Lunch", tags: [] },
  { id: "tx_2", amount: 150000, type: "income", category: "Salary", account_id: "acc_1", payee: "Acme Corp", date: yesterday, notes: "April Salary", tags: [] },
  { id: "tx_3", amount: 1200, type: "expense", category: "Transport", account_id: "acc_2", payee: "Uber", date: yesterday, notes: "Airport ride", tags: [] },
  { id: "tx_4", amount: 5000, type: "transfer", category: "Transfer", account_id: "acc_1", to_account_id: "acc_2", payee: "Self", date: yesterday, notes: "Top up wallet", tags: [] },
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

  useEffect(() => {
    localStorage.setItem("finance_txns", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("finance_accounts", JSON.stringify(accounts));
  }, [accounts]);

  const addTransaction = (tx: Omit<Transaction, "id">) => {
    const newTx = { ...tx, id: `tx_${Date.now()}` };
    setTransactions((prev) => [newTx, ...prev]);

    // Update account balances
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === tx.account_id) {
          if (tx.type === "expense") return { ...acc, balance: acc.balance - tx.amount };
          if (tx.type === "income") return { ...acc, balance: acc.balance + tx.amount };
          if (tx.type === "transfer") return { ...acc, balance: acc.balance - tx.amount };
        }
        if (tx.type === "transfer" && acc.id === tx.to_account_id) {
          return { ...acc, balance: acc.balance + tx.amount };
        }
        return acc;
      })
    );
  };

  const addAccount = (acc: Omit<Account, "id">) => {
    setAccounts((prev) => [...prev, { ...acc, id: `acc_${Date.now()}` }]);
  };

  const getNetWorth = () => {
    return accounts.reduce((sum, acc) => sum + acc.balance, 0);
  };

  const getTotalExpenses = () => {
    return transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalIncome = () => {
    return transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <FinanceContext.Provider value={{ transactions, accounts, addTransaction, addAccount, getNetWorth, getTotalExpenses, getTotalIncome }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
};
