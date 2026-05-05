# The "+ Add Transaction" Flow - UX & Logic Spec

## 1. Primary Objective
This is the most critical interaction in the app. It must be blazing fast for power users while remaining highly detailed for analytical users. The entry form intelligently adapts its fields based on the selected transaction type (Income, Expense, Transfer) and expands into logically grouped sections for advanced tracking.

## 2. Core Principles
*   **Contextual Adaptation:** The form changes dynamically based on `Transaction Type` (Income/Expense/Transfer).
*   **Progressive Disclosure:** 
    *   **Normal View:** Just the essentials.
    *   **Detailed View:** Expands into 4 organized sections for deep metadata.
*   **Entity-Driven:** Tied fundamentally to *where* or *to whom* the money went (Shops, People, Employers).

## 3. Data Schema & Form Fields

### 3.1. Type: Transfer
*   **Amount & Date:** Top row (Date is a prominent interactive label defaulting to today).
*   **From Account & To Account:** Placed in the same row with a visual **Arrow indicator** showing flow direction.

### 3.2. Type: Income
*   **Amount & Date:** Top row.
*   **From Account:** Target account.
*   **Stream:** Categorization of income source (e.g., Salary, Interest, Dividends, Cashback, Gifts).
*   **Payee:** If salary/freelance, selects the Employer/Client details from entities.

### 3.3. Type: Expense
Expenses have the most comprehensive data model, structured into 4 sections:

#### Section 1: Basic Details
*   **Amount Input:** 3xl font-bold currency symbol (₹) with 4xl font-black input. Placeholder is "0".
*   **Date Pill Selector:** A grouped label containing:
    *   **Label:** "DATE" in 10px uppercase bold slate-400.
    *   **Value:** "MMM dd" formatted date in bold slate-700.
    *   **Icon:** `Calendar` icon in a slate-50 rounded-lg container.
    *   *Interaction:* Entire pill is a `pointer` target. Triggers native date picker via invisible absolute input.
*   **Intelligence (Auto-Sync):**
    *   Uses a `prevItemsTotal` reference to track state.
    *   **Sync Condition:** Auto-fills main amount if current amount is `0` OR if it matches the *previous* items total (indicating the user is relying on the inventory list for calculation).
    *   **Mismatch Warning:** An absolute-positioned, pulsing amber badge (`bg-amber-100`) that appears above the input if `Math.abs(amount - itemsTotal) > 0.01`.

#### Section 2: Detailed View (Context & Inventory)
*   **Purpose / Short Note:** Full-width input for additional context.
*   **Sub Category:** 
    *   Dynamic dropdown matching the selected Category.
    *   **"On-the-Go" Creation:** Includes a `+ Create New...` option that toggles a custom text input for immediate category expansion.
*   **Tags:** Multi-input with `Enter` key triggers. Renders as slate-100 chips with bold uppercase text and removal icons.
*   **Items & Inventory Engine:**
    *   **Entry Row:** Item Name (input) + Price (total) + Qty (number) + Unit (Select).
    *   **Units Supported:** `pcs`, `unit`, `kg`, `g`, `L`, `ml`, `pack`, `box`, `bundle`.
    *   **Price Logic:** The price field represents the **total purchased price** for that specific entry, not unit price.
    *   **Display:** List items show Name (bold) and Qty/Unit (secondary) with the total price right-aligned in font-black slate-800.

#### Section 3: Classification (Analytics)
*   **Audience:** 4-column grid (SELF | FAMILY | FRIENDS | OTHERS). Active state: `bg-slate-800` with shadow.
*   **Priority / Type:** 4-column grid (NEED | WANT | INVEST | DISC). 
    *   *Sizing:* 9px bold uppercase text with `tracking-wider`.
    *   *Interaction:* One-tap selection. Active state: `bg-indigo-600` with `shadow-md`.

#### Section 4: Split (Khata Engine)
*   **With (Name):** Contact chips in `bg-indigo-600` with white text. Multi-selection enabled via `Enter`.
*   **Share Strategy:**
    *   **Equally:** (Total / (1 + Count)) calculation.
    *   **Percentages / Exact Amounts:** Opens an inline input row for each person. 
        *   *Layout:* `[Name] [Symbol + Input] [₹ Final Amount]`.
    *   **By Items:**
        *   Shows each item from Section 2 with its price.
        *   **Assignment Matrix:** A horizontal list of participant chips below each item. 
        *   *Logic:* Tapping a name assigns/unassigns that person to that item. Price is shared equally among all assigned people for that specific item.
*   **Totals Card:** A summary box (`bg-white/60`) at the bottom of the section showing the calculated final share for everyone, including "You".

## 4. Dynamic Custom Fields (Category Specific)
*   *Transportation:* From/To Location, Mode of Travel.
*   *Shopping/Electronics:* Warranty Expiry Date, Invoice Upload.
*   *Health:* Patient Name, Hospital Name.
