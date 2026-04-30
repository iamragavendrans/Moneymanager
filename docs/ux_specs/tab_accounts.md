# Accounts Tab - Detailed UX & Product Requirements

## 1. Primary Objective
Offer a bird's-eye view of liquidity. The Accounts tab is the digital wallet and bank passbook combined, showing exactly where the user's liquid money resides at any given second.

## 2. Indian Consumer Psychology & UX Considerations
*   **Multi-Banking:** The average Indian salaried professional holds 2-3 bank accounts (e.g., SBI for salary, HDFC for expenses, a Neo-bank for travel).
*   **Wallets & Prepaid:** Paytm wallets, Sodexo/Pluxee meal cards, and transit cards (NCMC/Metro) are heavily utilized.
*   **Credit Card Utilization:** Credit cards are seen both as a status symbol and a highly optimized reward tool. Showing "Available Credit" vs "Current Outstanding" clearly is critical to prevent debt spirals.
*   **Cash is Still King:** Despite UPI, physical cash (petty cash) tracking is mandatory for many.

## 3. Low-Level Component Details

### 3.1. Account Summary Header
*   **Total Liquidity:** Sum of all positive bank/cash balances minus credit card outstanding.
*   **Visual Ring Chart:** A sleek, thin donut chart showing the distribution of funds (e.g., 60% Bank A, 30% Bank B, 10% Cash).

### 3.2. Account Categories (Sections)
Accounts must be explicitly segregated to reduce cognitive load:

#### A. Bank Accounts (Savings/Current)
*   **Card Anatomy:** Bank Logo/Icon, Account Name (e.g., "HDFC Bank"), Masked Acc Number ("••• 4521"), Current Balance.
*   **Feature:** "Sync" button (if AA - Account Aggregator framework is integrated in the future) or "Reconcile" button to manually match balances.
*   **Salary Linkage:** Option to link an account to the added Employer profile (from Settings). This visually badges it as the "Salary Account", unlocking specific tax/PF integrations. *Users can easily unlink this account at any time and link a different account if their salary deposits change.*

#### B. Credit Cards & Pay Later
*   *Pay Later (BNPL) like Amazon Pay Later, Simpl, LazyPay are huge in India.*
*   **Card Anatomy:** Credit Card visual representation (Visa/Mastercard/RuPay logo).
*   **Key Metrics:** 
    *   Outstanding Balance (shown in Red/Warning colors).
    *   Available Credit Limit (shown in neutral slate).
    *   **Crucial UX addition:** "Next Statement Date" and "Payment Due Date" with countdowns.

#### C. Cash & Wallets
*   "Physical Wallet" (Cash).
*   Paytm, Amazon Pay, Sodexo.

### 3.3. Account Details & Ledger
*   Clicking an account opens its specific ledger.
*   **Reconciliation Flow:** A specialized UX to "Adjust Balance". Users often forget to log small UPI transactions. Instead of forcing them to log 10 missing ₹20 entries, allow a "One-click Balance Adjustment" that creates an automated "Correction Entry" to align the app's balance with the actual bank balance.

### 3.4. Internal Transfers
*   **Transfer FAB:** A specific action to "Transfer between accounts".
*   **UX:** Visual left-to-right flow: `[Source Account] ---> [Amount] ---> [Destination Account]`.
*   *Why?* Moving money from "SBI" to "Cash" (ATM withdrawal) or "HDFC" to "Credit Card" (Bill payment) should not count as Income/Expense, but as a neutral transfer.

## 4. Trust & Security UX
*   **Bank Grade Aesthetics:** Use clean white/slate cards, sharp sans-serif typography, and subtle shadows.
*   **Disclaimer:** A small shield icon with text: "Your data is encrypted. We do not have access to move your funds." Indian users are highly skeptical of financial apps stealing credentials.
