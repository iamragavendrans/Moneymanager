# Instruments (Investments) Tab - Detailed UX & Product Requirements

## 1. Primary Objective
Track wealth building. While 'Accounts' tracks liquidity, 'Instruments' tracks long-term, illiquid, or market-linked assets. The goal is to show the "Magic of Compounding" and portfolio health.

## 2. Indian Consumer Psychology & UX Considerations
*   **The Trinity of Indian Middle-Class Investing:** FDs (Fixed Deposits), Gold, and Real Estate are historical favorites. Mutual Funds (via SIPs) and Direct Equity are the modern favorites. We must support all natively.
*   **Tax Saving Obsession:** Section 80C (ELSS, PPF, LIC) and 80D (Health Insurance). The UI should ideally help visualize how close they are to the ₹1.5 Lakh 80C limit.
*   **Provident Funds (PF/EPF):** Nearly all salaried users have an EPF account. It's a massive chunk of their net worth that they rarely track. 

## 3. Low-Level Component Details

### 3.1. Portfolio Dashboard (Top Section)
*   **Total Invested vs. Current Value:** Show the absolute profit/loss and XIRR (Extended Internal Rate of Return - the standard metric for SIPs).
*   **Color Coding:** Deep Green for profits, Muted Red for losses. 
*   **Asset Allocation Treemap/Donut:** A visual breakdown of Equity vs. Debt vs. Gold vs. Real Estate.

### 3.2. Supported Instrument Categories

#### A. Market Linked (Equity/Mutual Funds)
*   **Data Structure:** Ticker/Fund Name, Units held, Average NAV/Price, Current NAV/Price.
*   **UX:** Allow manual updates of current value, or future API integration (e.g., connecting to Zerodha/Groww or parsing CAS/NSDL statements).
*   **SIP Tagging:** Visual badge indicating if an SIP is active for this fund.

#### B. Fixed Income (FDs, RDs, PPF, EPF)
*   **Data Structure:** Principal Amount, Interest Rate (e.g., 7.1%), Maturity Date.
*   **UX Feature - The Progress Bar:** Show a visual timeline from 'Investment Date' to 'Maturity Date' filling up, indicating accrued interest. This gives immense psychological satisfaction to conservative investors.

#### C. Gold & Alternatives
*   Sovereign Gold Bonds (SGBs), Digital Gold, Physical Jewelry.
*   Since physical gold weight is static, the UX should allow entering "Grams" and fetch the current 24k/22k market rate to calculate dynamic net worth.

#### D. Real Estate & Loans
*   Property value vs. Outstanding Home Loan.
*   Showing "Net Equity in Home" (Property Value - Loan) is a powerful wealth metric.

### 3.3. The "Add Instrument" Flow
*   Must be highly specialized based on the type.
*   *If Mutual Fund:* Ask for "SIP" or "Lumpsum".
*   *If FD:* Ask for "Maturity Date" and "Interest Rate" to auto-calculate future value.

## 4. Emotional Design
*   **The "Long Term" Vibe:** Unlike the high-anxiety, fast-moving Transactions tab, the Instruments tab should feel calm, stable, and analytical. Use softer animations, robust charts, and extensive use of historical trend lines to reassure users during market dips.
