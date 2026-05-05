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
*   **Amount & Date:** Top row (Date is an icon defaulting to today).
*   **From Account & To Account:** Placed in the same row for quick transfers.

### 3.2. Type: Income
*   **Amount & Date:** Top row.
*   **From Account:** Target account.
*   **Stream:** Categorization of income source (e.g., Salary, Interest, Dividends, Cashback, Gifts).
*   **Payee:** If salary/freelance, selects the Employer/Client details from entities.

### 3.3. Type: Expense
Expenses have the most comprehensive data model, structured into 4 sections:

#### Section 1: Basic Details
*   **Row 1:** Amount | Date picker icon (defaults to current date, selectable via icon)
*   **Row 2:** From Account | Category
*   **Row 3:** Payee

#### Section 2: Detailed View (Context & Inventory)
*   **Row 1:** Purpose / Short Note
*   **Row 2:** Sub Category | Tags
*   **Row 3:** Items - Multi-selectable dropdown from available items. Type to add new items. Can be added/deleted/re-added.
*   **Row 4:** Item List - Shows selected items with inputs for count/weights/quantity (e.g., grapes - 500 g, oil - 300 ml, headphone - 1).

#### Section 3: Classification (Analytics)
*   **Beneficiary:** Multi-selectable. Choose between: `Self` / `Family` / `Friends` / `Others`.
*   **Needs vs Wants:** One option only. Choose between: `Need` / `Want` / `Investment` / `Discretionary`.

#### Section 4: Split (Khata Engine)
*   **With (Name):** Select from or add to 'people' entities. Multiple names can be selected and shown as contact chips (can be added, deleted, re-added).
*   **Share Strategy:** Once names are added, users select a strategy. Shows dynamic share of each person based on the strategy, including a custom option to manually split amounts.
*   **Due Date:** When the split amount is expected to be settled.

## 4. Dynamic Custom Fields (Category Specific)
*   *Transportation:* From/To Location, Mode of Travel.
*   *Shopping/Electronics:* Warranty Expiry Date, Invoice Upload.
*   *Health:* Patient Name, Hospital Name.
