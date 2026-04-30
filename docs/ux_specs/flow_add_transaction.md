# The "+ Add Transaction" Flow - UX & Logic Spec

## 1. Primary Objective
This is the most critical interaction in the app. It must be blazing fast for power users while remaining highly detailed for analytical users. The entry form should intelligently adapt its fields based on the selected category and input context.

## 2. Core Principles
*   **Shop/Entity Specific Entry:** The transaction is tied fundamentally to *where* or *to whom* the money went, not just an isolated number.
*   **Intelligent View Switching:** 
    *   **Normal View:** Just the essentials (Amount, Payee, Category) for a 3-second log.
    *   **Detailed View:** Expands to show all metadata (Tags, Location, Split logic, Custom Fields).
*   **Mandatory Indicators:** Fields marked with `*` are strictly mandatory to save.

## 3. Data Schema & Form Fields

### 3.1. Universal Fields
*   **Date and Time (Auto-detected):** Defaults to current timestamp but editable via a quick-picker.
*   **\* Amount:** The monetary value. Integrates a custom quick-calculator keypad on mobile.
*   **\* From Account:** Dropdown of user's active accounts/wallets/cash.
*   **\* Payee Details:** Who/Where the transaction occurred. Links to the *People/Payees* or *Shops/Merchants* entities.
*   **\* Purpose:** A short description (e.g., "Lunch with team", "Uber to office").
*   **\* Category:** Primary classification (e.g., Food, Transport, Utilities).
*   **Sub-Category:** (Optional) Deeper drill-down (e.g., Category: Food -> Sub: Groceries).
*   **\* Need / Want / Investment:** The psychological tag for the 50/30/20 rule. Auto-suggested based on Category.
*   **\* Self / Family / Friends / Others:** For whom was this expense made? Critical for household tracking.
*   **Through (Mode):** How was it paid? (UPI, Bank Transfer, Cash, Cheque, Credit Card).
*   **Location:** 
    *   If the Shop/Merchant is new, manually searchable by name or via Google Maps Pin for accuracy.
*   **Tags:** `#goa-trip`, `#office-party`.
*   **Notes:** Extended text area for details.

### 3.2. Split Logic (Khata Engine)
*   **Split Toggle:** "Do we split with anyone?" (Yes/No).
*   *If Yes:*
    *   Select Person/Payee from the 'People' entity list.
    *   Choose split mode: **Suggested** (Equally, Percentages, Exact Amounts) or **Custom**.
    *   *System Action:* Instantly reflects the owed amount in the `Instruments -> Payee (Payables/Receivables)` ledger.

### 3.3. Dynamic Custom Fields (Category Specific)
To make tracking hyper-detailed, certain categories render specialized fields:
*   **If Category == "Transportation":**
    *   *From Location*
    *   *To Location*
    *   *Mode of Travel* (Cab, Flight, Train, Metro)
*   **If Category == "Shopping" or "Electronics":**
    *   *Warranty Expiry Date*
    *   *Upload Invoice/Receipt*
*   **If Category == "Health / Medical":**
    *   *Patient Name* (Self/Dependent)
    *   *Hospital/Clinic Name*

## 4. UX Implementation (Normal vs Detailed View)

### Normal View (Default)
A clean card showing:
1. Large Amount Input
2. From Account
3. Payee / Shop
4. Category (auto-filled if Payee is known)
5. Need/Want (auto-filled by Category)
6. "Save" Button
*At the bottom, a chevron or "More Options" button expands the Detailed View.*

### Detailed View (Expanded)
Reveals the grid of advanced options: Date editing, Purpose, Sub-categories, Location pinning, Splits, Custom Fields, Tags, and Notes.
