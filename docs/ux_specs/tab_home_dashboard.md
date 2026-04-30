# Home / Dashboard Tab - Detailed UX & Product Requirements

## 1. Primary Objective
Serve as the financial command center. The cognitive load must be low, allowing the user to answer "How much do I have?", "How much did I spend this month?", and "What is due?" within 3 seconds of opening the app.

## 2. Indian Consumer Psychology & UX Considerations
*   **Status & Wealth Projection:** The "Net Worth" hero card uses a dark, premium theme (indigo/emerald accents). Indian users associate deep blues/blacks with premium banking (e.g., CRED, HDFC Infinia).
*   **Lakh/Crore Formatting:** All numbers must strictly follow the Indian numbering system (e.g., ₹1,50,000 instead of ₹150,000).
*   **Savings Mindset:** Highlighting "Net" cashflow positively reinforces the cultural emphasis on saving rather than just spending.
*   **Privacy Paranoia:** A prominent "Eye" toggle to mask the Net Worth. Many users open financial apps in public spaces (metros, offices) and fear shoulder-surfing.

## 3. Low-Level Component Details

### 3.1. Net Worth Hero Card
*   **Visuals:** Dark background (`#0B1220`). Large, bold typography (40px). Sparkline in the background representing a 14-day trailing trend.
*   **Interactions:**
    *   **Mask Toggle:** Clicking the 'Eye' icon replaces digits with `₹ •••••••`.
    *   **Timeframe Filter:** Pill-shaped toggles (`1W`, `1M`, `1Y`, `ALL`). Default is `1M`.
    *   **Breakdown Accordion:** A soft "Breakdown" button that smoothly slides down to reveal "Liquid Assets" (Bank accounts, Cash) vs "Investments" (Mutual Funds, Stocks, PF). This satisfies the need for detail without cluttering the initial view.

### 3.2. Income & Expense Velocity Cards
*   **Psychology:** Income should always feel 'safe' (Green). Expenses should prompt caution (Red, but soft pastel reds to avoid anxiety).
*   **Data Points:**
    *   Absolute amount (e.g., ₹45,300).
    *   MoM (Month-over-Month) percentage change with an Up/Down arrow.
    *   A miniature 7-bar chart at the bottom of the card showing the trailing 7 days velocity. If today's bar is much higher than average, it implicitly alerts the user.

### 3.3. Cashflow Trend & Heatmap (The Analytical View)
*   **Default View (Trend):** A multi-line chart (Income, Expense, Net) using Recharts. Smooth bezier curves. Tooltips must show exact dates and amounts.
*   **Toggle View (Heatmap):** A GitHub-style contribution calendar.
    *   *Why?* Gamification. Indian users love streaks (seen in apps like Zomato, Duolingo, GPay). A heatmap of "No Spend Days" (grey) vs "High Spend Days" (dark red) gamifies expense reduction.
    *   *Interaction:* Tapping a square opens a bottom-sheet (mobile) or tooltip (desktop) showing that day's top 3 transactions.

### 3.4. Action-Oriented Lists
*   **Upcoming Payments:**
    *   Focus on utility bills (Electricity, Water), Credit Card dues, and EMIs.
    *   *Badges:* Use urgency colors. "Due Tomorrow" (Red/Danger), "Due in 3 Days" (Orange/Warning).
    *   *Action:* Quick "Mark as Paid" or "Pay Now" (future UPI integration).
*   **Scheduled Transactions:**
    *   SIPs (Systematic Investment Plans) and RD (Recurring Deposit) deductions. Culturally, SIPs are the backbone of modern Indian retail investing.

## 4. Mobile vs Desktop Behavior
*   **Mobile:** Strict vertical stack. Hero -> Income/Expense -> Cashflow -> Upcoming Payments. Use horizontal scrolling for heatmaps to save vertical space. Bottom navigation bar.
*   **Desktop:** 12-column grid. Left 7 columns for analytical charts. Right 5 columns for lists (Payments, Recent Transactions). Sidebar navigation.
