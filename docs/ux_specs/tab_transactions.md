# Transactions Tab - Detailed UX & Product Requirements

## 1. Primary Objective
Provide a frictionless, lightning-fast interface to log, search, and categorize daily expenses. It must act as the unified ledger for all cash, bank, and wallet movements.

## 2. Indian Consumer Psychology & UX Considerations
*   **UPI Dominance:** 80%+ of transactions in India are via UPI (PhonePe, GPay, Paytm). The UI must cater to high-frequency, low-ticket transactions (e.g., ₹20 for Chai, ₹150 for Auto rickshaw).
*   **SMS Parsing Expectation:** Users are conditioned by apps like Walnut/Axio to expect automated transaction logging via SMS. We must design manual entry to be so fast it rivals automated entry, while keeping architecture open for future SMS/Notification scraping.
*   **Split Payments & "Khata":** The culture of splitting bills with roommates/colleagues or maintaining a running tab ("Khata" with the local grocer) means we need robust tagging and splitting capabilities.

## 3. Low-Level Component Details

### 3.1. The "Quick Add" FAB (Floating Action Button)
*   Because the transaction entry flow is so critical and detailed (with smart splits, normal vs detailed views, custom category fields, etc.), the logic has been broken out into a dedicated architectural document.
*   **See detailed spec here:** [Add Transaction Flow Spec](file:///C:/Users/Demo/.gemini/antigravity/brain/3a730a6a-7cb7-4b72-818d-a2061c94fa8a/flow_add_transaction.md)

### 3.2. Transaction Feed (The Ledger)
*   **GroUPIng:** Transactions must be grouped by Date (e.g., "Today", "Yesterday", "Mon, 12 May").
*   **List Item Anatomy:**
    *   *Left:* Icon (Category-specific emoji or brand logo like Amazon/Zomato).
    *   *Middle:* Payee Name (primary), Category & Time (secondary, smaller text).
    *   *Right:* Amount. Expense is strictly `- ₹X` (Red or Slate), Income is `+ ₹Y` (Green).
*   **Swipe Actions (Mobile):**
    *   Swipe right to duplicate (useful for recurring cash payments).
    *   Swipe left to delete/edit.
*   **Edit:** Clicking a transaction opens a persistent transaction editing modal to easily update details. The `Purpose / Short Note` accurately maps to the transaction's saved notes state to prevent data loss or detached state on edit.

### 3.3. Advanced Search & Filtering
*   **Search Bar:** Fuzzy search matching Payee, Category, or Note.
*   **Filter Panel:** A collapsible, togglable panel accessed via a filter icon next to the search bar. This prevents header clutter and scales flawlessly on mobile screens with responsive wrapping and horizontal scrolling for chip groups:
    *   `Type:` Expense, Income, Transfer. (The UI correctly handles 'From Account' and 'To Account' for Transfer transactions).
    *   `Mode:` Mode-of-payment filtering logic to easily isolate UPI, Credit Card, Cash, etc.
    *   `Status:` Cleared, Pending (useful for check deposits or credit card holds).
    *   `Date Range Picker:` Select dropdown + custom date inputs that dynamically adjust to fit mobile constraints.

### 3.4. Transaction Details View
*   When a user clicks a transaction, show a detailed view:
    *   **Tags:** `#goa-trip`, `#office-lunch`.
    *   **Attachment:** Receipt photo upload (crucial for tax claims / Section 80C/80D proofs).
    *   **Exclusion Toggle:** "Exclude from Analytics" (useful for reimbursements or massive one-off transfers that skew charts).

## 4. Emotional Design
*   **Success States:** When a user logs an income, show a subtle confetti micro-animation.
*   **Speed:** The transition from opening the app to logging an expense must take fewer than 3 taps. Use a customized numeric keypad (like calculators) instead of the standard iOS/Android keyboard for faster number crunching.
