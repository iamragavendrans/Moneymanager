# Premium Financial Dashboard - Product Requirements Document

## 1. Product Vision
To build a highly responsive, aesthetically premium, and functionally robust financial dashboard. The application will serve as a central hub for users to track their net worth, monitor cash flow, and manage upcoming and past transactions with a "WOW" factor in design and micro-interactions.

## 2. Core Principles
*   **Adaptive Responsive Layout:** Not just "mobile + desktop". Mobile is stacked/scroll-first, Tablet uses a 2-column flow, and Desktop utilizes a dense 12-column grid.
*   **Visual Excellence:** Premium feel using curated HSL color palettes, subtle gradients, glassmorphism elements, and smooth micro-animations.
*   **Data Density without Clutter:** Displaying rich data (heatmaps, sparklines, multi-line charts) in easily digestible formats.

## 3. Tech Stack
*   **Framework:** React 18 (via Vite for fast compilation)
*   **Language:** TypeScript for type safety
*   **Styling:** Tailwind CSS v4 (using CSS variables for theme tokens)
*   **Icons:** Lucide React
*   **Data Visualization:** Recharts (Line charts, sparklines), Custom CSS Grids (Heatmaps)
*   **Date/Time Handling:** `date-fns`
*   **State Management:** React Context API (`FinanceContext`)

## 4. Feature Requirements

### 4.1. Dashboard Overview (The Hub)
*   **Net Worth Hero Card:** 
    *   Displays total net worth with dynamic percentage change vs last period.
    *   Includes a background sparkline visualizing the recent trend.
    *   Features an interactive "Breakdown" toggle that expands smoothly to reveal Liquid Assets vs. Investments.
*   **Income & Expense Summaries:** 
    *   Side-by-side metric cards (stacked on mobile).
    *   Includes absolute values, percentage changes, and a mini bar-chart visualization representing recent velocity.
*   **Cashflow Trend & Heatmap:**
    *   A central data visualization panel.
    *   **Trend Mode:** Multi-line chart (Income vs. Expense vs. Net).
    *   **Heatmap Mode:** A GitHub-style contribution calendar mapping daily spending intensity. Toggleable view.
*   **List Panels:**
    *   **Upcoming Payments:** Highlights immediate liabilities (e.g., Subscriptions) with urgency badges (Danger, Warning).
    *   **Scheduled Transactions:** Future planned movements (e.g., SIPs, Salary credits).
    *   **Recent Transactions:** A chronological feed of the latest categorized transactions.

### 4.2. Data Models (Draft)
*   **Transaction:** `{ id, type (income|expense), amount, category, payee, date, status }`
*   **ScheduledItem:** `{ id, title, amount, nextDueDate, frequency, type, status (active|paused) }`
*   **Asset/Liability:** `{ id, name, value, category (liquid|investment|debt), lastUpdated }`

## 5. Design System Specifications

### Typography
*   **Font Family:** Inter / SF Pro (System UI fallback)
*   **Scale:** Hero Value (28-40px, Bold), Card Value (20-24px, Semibold), Titles (14-16px, Medium), Meta (12px, Regular).

### Layout & Grid
*   **Mobile:** 360-420px base width, 16px margins, stacked flow.
*   **Desktop:** Max-width 1200px, 12-column grid, 24px gutters.
*   **Component Spacing:** 4pt base system.

### Color Tokens
*   **Background:** `--bg: #0B1220` (Deep premium dark)
*   **Card Background:** `--card: #121A2B` (Elevated dark)
*   **Primary Brand:** `--primary: #4F46E5` (Indigo)
*   **Semantic:**
    *   Positive/Income: `--green: #22C55E`
    *   Negative/Expense: `--red: #EF4444`
    *   Neutral/Net: `--blue: #3B82F6`
*   **Text:** Primary (`#0F172A` / white in dark mode), Secondary (`#64748B` / slate-400 in dark mode).

## 6. Future Enhancements & Scope (For Brainstorming)
*   *Backend Integration:* Connecting the Context API to a real database (Supabase/Firebase or custom REST API).
*   *User Authentication:* Login and profile management.
*   *Advanced Reporting:* Deep dive pages into specific spending categories with pie charts.
*   *Budgeting:* Setting and tracking monthly category limits.

---
*Please review this draft. What specific details, backend requirements, or extra features would you like to add or modify before we finalize it?*
