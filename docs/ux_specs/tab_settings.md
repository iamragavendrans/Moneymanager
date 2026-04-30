# Settings Tab - Detailed UX & Product Requirements

## 1. Primary Objective
Provide ultimate control over the app's behavior, data privacy, and personalization. It should be easily navigable and instill a deep sense of security and trust.

## 2. Indian Consumer Psychology & UX Considerations
*   **Data Privacy & Cloud Fear:** Many Indian users are wary of apps syncing financial data to unknown servers. Offering a clear "Local Only" vs "Cloud Backup" toggle is a massive trust-builder.
*   **Financial Year Nuance:** The Indian Financial Year runs from April 1st to March 31st. This is critical for tax reporting.
*   **Family/Household Finances:** It is common for one person (often the head of household) to manage finances for parents or a spouse. Multiple profiles or localized tagging might be needed.
*   **App Lock:** Essential. Phone hand-offs to children (for games) or friends are common; financial data must be secured behind biometric locks (FaceID/Fingerprint).

## 3. Low-Level Component Details

### 3.1. Profile & Sync (Top Section)
*   **UI:** User Avatar, Email/Name.
*   **Backup Settings:** 
    *   "Google Drive Backup" / "iCloud Sync" toggle.
    *   "Last synced: 2 mins ago" text for reassurance.
    *   **Restore:** Option to "Restore Data from Cloud" with conflict resolution.
    *   Manual "Export Data (CSV/JSON)" button. Users love having physical/Excel control over their data as a fallback.
    *   Manual "Import Data (CSV/JSON)" button to restore offline backups.

### 3.2. Security Preferences
*   **App Lock Toggle:** Enable biometric/PIN authentication to open the app.
*   **Hide Balances on Open:** A toggle that makes the app boot up with all numbers masked (as `₹ ••••`) by default until a biometric scan or manual reveal is triggered.

### 3.3. Localization & Format
*   **Currency Symbol:** Default to `₹`, but allow changing to `$`, `£`, `€` (for NRIs - Non-Resident Indians).
*   **Number System:** 
    *   Indian (Lakhs/Crores: `1,50,000`)
    *   Western (Millions/Billions: `150,000`)
*   **Financial Year Start:** Default to `April 1` (India). Option to change to `Jan 1` (Global).

### 3.4. Categories & Customization
*   **Manage Categories & Sub-Categories:** 
    *   Users must be able to add, delete, and merge categories.
    *   **Sub-categories:** Categories can have nested sub-categories, which users can seamlessly enable or disable to keep the UI clean.
    *   Provide a preset list highly optimized for India: e.g., `Maid/Help`, `Grocery (Kirana)`, `Zomato/Swiggy`, `UPI Transfers`, `Petrol/Diesel`.
    *   Color picker and Emoji selector for custom categories.
*   **Insight Tagging:**
    *   Categories can be tagged globally (e.g., "Needs", "Wants", "Savings/Investments"). This is critical for powering psychological insights and 50/30/20 budgeting reports.

### 3.5. Advanced Configurations & Entities
*   **Entity Management:** Dedicated lists to add, edit, or archive specific entities to speed up transaction logging:
    *   **Shops / Merchants:** Save frequent stores. *Features:* Show a dedicated ledger of all transactions with this specific shop, the total historical spend, and the usual category mapped to it.
    *   **People / Payees:** Track individuals. *Features:* Acts as a mini-ledger showing "How much they owe us" (Receivables) vs "How much we owe them" (Payables), along with a linked transaction history.
    *   **Recurring Bills:** For utilities, mobile recharge, gas, electricity, DTH, etc.
    *   **Subscriptions:** For digital services, apps, games, streaming (Netflix, Spotify, etc.). *Separated from bills because subscriptions are usually discretionary/wants.*
    *   **Gift Cards:** Spendable entities. Track current unused balance and expiry date (acts like a temporary wallet/account).
    *   **Warranties:** Non-spendable entities. Upload warranty cards, invoices, and track warranty expiration dates for major electronics.
*   **Employment Details (Optional Profiling):**
    *   A dedicated section to collect: *Employer Name*, *Location*, and *Salary Band*.
    *   *Smart Tax Engine:* By knowing the salary band, the app can auto-suggest the optimal tax variant (Old vs. New Tax Regime) and estimate PF (Provident Fund) and TDS deductions to predict exact in-hand salary.

### 3.6. Notifications & Reminders
*   **Bill Reminders:** Toggle push notifications for upcoming bills.
*   **Daily Log Reminder:** "Did you log your expenses today?" push notification at 9:00 PM (optimal time post-dinner).

### 3.7. Danger Zone
*   **Reset Data:** "Clear all transactions and balances" while safely retaining user configs, categories, and settings. Useful for a fresh start.
*   **Wipe Data:** Red text. "Erase all data from device (including settings)." Requires typing "DELETE" to confirm.
*   **Logout.**

## 4. Visual Language
*   Use standard iOS/Android settings patterns (Grouped lists, toggle switches, right-chevrons for sub-menus).
*   Keep it heavily text-driven but highly legible. Use subtle grey backgrounds (`#F8FAFC`) with white card panels to clearly delineate sections.
