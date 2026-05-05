# Home / Dashboard Tab - Detailed UX & Product Requirements

## 1. Primary Objective
Serve as the financial command center. The cognitive load must be low, allowing the user to answer "How much do I have?", "How much did I spend this month?", and "What is due?" within 3 seconds of opening the app.

## 2. Indian Consumer Psychology & UX Considerations
*   **Status & Wealth Projection:** The "Net Worth" hero card uses a dark, premium theme (indigo/emerald accents). Indian users associate deep blues/blacks with premium banking (e.g., CRED, HDFC Infinia).
*   **Lakh/Crore Formatting:** All numbers must strictly follow the Indian numbering system (e.g., ₹1,50,000 instead of ₹150,000).
*   **Savings Mindset:** Highlighting "Net" cashflow positively reinforces the cultural emphasis on saving rather than just spending.
*   **Privacy Paranoia:** A prominent "Eye" toggle to mask the Net Worth. Many users open financial apps in public spaces (metros, offices) and fear shoulder-surfing.
*   **Sticky Context:** A persistent header that keeps the global time selector (`1W`, `1M`, `1Y`) and period labels (e.g., "Income • March 2026") reachable even when scrolling deep into heatmaps or action lists.

## 3. Low-Level Component Details

### 3.0. Persistent Header (Sticky Navigation)
*   **Visuals:** 64px height, semi-transparent white backdrop (`backdrop-blur-md`).
*   **Context Management**:
    *   **Time Selector:** Segmented control with `1W`, `1M`, `1Y` options. Active state uses indigo pill background.
    *   **Context Label:** Bold indicator (e.g., "Income • March 2026") that dynamically updates to show the *active period* based on the filter.
*   **Synchronized State**: Changing the timeframe in the header triggers a reactive update across all dashboard modules (Net Worth, Velocity Cards, Heatmaps).

### 3.1. Net Worth Hero Card
*   **Visuals:** Dark background (`#0B1220`). Large, bold typography (40px). 
*   **Sparkline:** A faint, emerald bezier curve in the background representing a 14-day trailing trend. Scaling is normalized to emphasize *velocity* rather than absolute height.
*   **Interactions:**
    *   **Mask Toggle:** Clicking the 'Eye' icon replaces digits with `₹ •••••••`. State persists via context.
    *   **Breakdown Accordion:** A soft "Breakdown" button that smoothly slides down (`animate-in slide-in-from-top`) to reveal "Liquid Assets" vs "Investments".

### 3.2. Income & Expense Velocity Cards
*   **Growth Statistics:** 
    *   Calculates percentage difference between the *current* period and the *previous* period (e.g., this month vs last month).
    *   **UI:** Rendered in a colored badge (Green for +Income/-Expense, Red for -Income/+Expense) with an accompanying `ArrowUp` or `ArrowDown` icon.
*   **Velocity Visualization:** A miniature 7-bar chart at the bottom of the card showing the trailing 7 days velocity.

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
