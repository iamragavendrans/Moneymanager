import { format, subDays, startOfMonth, addDays, isSameDay, subMonths } from "date-fns";
import { Transaction, Account, Entity, Investment } from "../context/FinanceContext";

const SEED_START_DATE = subDays(new Date(), 730); // 2 years ago

const CATEGORIES = {
  Food: ["Swiggy", "Zomato", "Starbucks", "Blinkit", "BigBasket", "Star Bazaar", "Local Grocery", "Lunch", "Dinner", "Street Food"],
  Transport: ["Uber", "Ola", "Metro", "Petrol Pump", "Auto", "Parking", "Toll"],
  Shopping: ["Amazon", "Flipkart", "Myntra", "Zara", "Nike", "H&M", "IKEA", "Decathlon", "Apple Store", "Croma"],
  Bills: ["Airtel", "Jio", "Electricity Bill", "Water Bill", "Gas Bill", "WiFi", "Broadband", "DTH"],
  Entertainment: ["Netflix", "Amazon Prime", "Hotstar", "Movies", "Gaming", "Spotify", "YouTube Premium", "Disney+"],
  Health: ["Pharmacy", "Doctor", "Gym Membership", "Lab Test", "Hospital", "Dentist", "Yoga Class"],
  Housing: ["Rent", "Maintenance", "Maid Salary", "Cook Salary", "Plumber", "Electrician", "Furniture"],
  Education: ["Course Fee", "Books", "Stationery", "Udemy", "LinkedIn Learning"],
  Travel: ["Indigo", "MakeMyTrip", "Hotel Stay", "Train Ticket", "AirBnB"],
  Investment: ["Mutual Fund SIP", "Stock Purchase", "Gold Savings", "Crypto", "PPF Contribution"],
  Salary: ["Acme Corp", "Freelance Project", "Dividend", "Interest Credit", "Bonus"],
  Personal: ["Barber", "Salon", "Laundry", "Gift for Friend", "Charity", "Temple Donation"],
  Loans: ["Home Loan EMI", "Car Loan EMI", "Personal Loan EMI"],
};

export const seedAllData = () => {
  const accounts: Account[] = [
    { id: "acc_bank_1", name: "HDFC Savings", type: "bank", balance: 0, currency: "INR" },
    { id: "acc_bank_2", name: "ICICI Salary", type: "bank", balance: 0, currency: "INR" },
    { id: "acc_bank_3", name: "SBI Primary", type: "bank", balance: 0, currency: "INR" },
    { id: "acc_bank_4", name: "Axis Bank", type: "bank", balance: 0, currency: "INR" },
    { id: "acc_wallet_1", name: "Paytm Wallet", type: "wallet", balance: 0, currency: "INR" },
    { id: "acc_wallet_2", name: "Amazon Pay", type: "wallet", balance: 0, currency: "INR" },
    { id: "acc_card_1", name: "Amazon Pay ICICI", type: "credit_card", balance: 0, currency: "INR" },
    { id: "acc_card_2", name: "SBI Card Prime", type: "credit_card", balance: 0, currency: "INR" },
    { id: "acc_card_3", name: "Flipkart Axis", type: "credit_card", balance: 0, currency: "INR" },
    { id: "acc_loan_1", name: "HDFC Home Loan", type: "loan", balance: -4500000, currency: "INR" },
    { id: "acc_loan_2", name: "Car Loan - Axis", type: "loan", balance: -800000, currency: "INR" },
    { id: "acc_cash", name: "Cash", type: "cash", balance: 0, currency: "INR" },
    { id: "acc_pf", name: "EPF Account", type: "pf", balance: 0, currency: "INR" },
  ];

  const entities: Entity[] = [
    // Shops
    { id: "ent_shop_1", type: "shop", name: "Amazon", mode: "online", url: "amazon.in" },
    { id: "ent_shop_2", type: "shop", name: "Swiggy", mode: "online", url: "swiggy.com" },
    { id: "ent_shop_3", type: "shop", name: "BigBasket", mode: "online", url: "bigbasket.com" },
    { id: "ent_shop_4", type: "shop", name: "Star Bazaar", mode: "offline", location: "Nexus Mall" },
    { id: "ent_shop_5", type: "shop", name: "Croma", mode: "offline", location: "Indiranagar" },

    // People
    { id: "ent_person_1", type: "person", name: "Rahul", relationship: "Friend" },
    { id: "ent_person_2", type: "person", name: "Priya", relationship: "Family" },
    { id: "ent_person_3", type: "person", name: "Amit", relationship: "Colleague" },
    { id: "ent_person_4", type: "person", name: "Landlord", relationship: "Other" },

    // Recurring / Subs
    { id: "ent_sub_1", type: "subscription", name: "Netflix", amount: 649, recurringDuration: "monthly", provider: "Netflix" },
    { id: "ent_sub_2", type: "subscription", name: "Amazon Prime", amount: 1499, recurringDuration: "yearly", provider: "Amazon" },
    { id: "ent_sub_3", type: "subscription", name: "Spotify Family", amount: 199, recurringDuration: "monthly", provider: "Spotify" },
    { id: "ent_rec_1", type: "recurring", name: "Airtel Postpaid", amount: 999, recurringDuration: "monthly", provider: "Airtel" },
    { id: "ent_rec_2", type: "recurring", name: "BESCOM (Elec)", amount: 1500, recurringDuration: "monthly", provider: "BESCOM" },

    // Gift Cards
    { id: "ent_gift_1", type: "giftcard", name: "Amazon Gift Card", totalBalance: 5000, expiryDate: "2026-12-31" },
    { id: "ent_gift_2", type: "giftcard", name: "Myntra Voucher", totalBalance: 2000, expiryDate: "2025-06-30" },

    // Warranties
    { id: "ent_war_1", type: "warranty", name: "MacBook Warranty", warrantyDetails: "3 Year AppleCare+", expiryDate: "2027-05-15" },
    { id: "ent_war_2", type: "warranty", name: "LG Fridge Warranty", warrantyDetails: "10 Year Compressor Warranty", expiryDate: "2032-10-20" },

    // Inventory
    { id: "ent_inv_1", type: "inventory", name: "iPhone 15 Pro", price: 129900, quantity: 1 },
    { id: "ent_inv_2", type: "inventory", name: "Sony WH-1000XM5", price: 29900, quantity: 1 },
    { id: "ent_inv_3", type: "inventory", name: "Dell Monitor 27\"", price: 18500, quantity: 2 },
  ];

  const transactions: Transaction[] = [];
  const now = new Date();
  let currentDate = SEED_START_DATE;

  // Track balances manually during seeding
  const balances: Record<string, number> = {
    acc_bank_1: 250000,
    acc_bank_2: 100000,
    acc_bank_3: 50000,
    acc_bank_4: 30000,
    acc_wallet_1: 1500,
    acc_wallet_2: 1000,
    acc_card_1: 0,
    acc_card_2: 0,
    acc_card_3: 0,
    acc_loan_1: -4500000,
    acc_loan_2: -800000,
    acc_cash: 5000,
    acc_pf: 500000,
  };

  while (currentDate <= now) {
    const dateStr = format(currentDate, "yyyy-MM-dd");
    const dayOfMonth = currentDate.getDate();

    // 1. Monthly Salary (1st of month)
    if (dayOfMonth === 1) {
      const amount = 185000;
      transactions.push({
        id: `seed_tx_sal_${dateStr}`,
        amount,
        type: "income",
        category: "Salary",
        account_id: "acc_bank_2",
        payee: "Acme Corp",
        date: dateStr,
        notes: "Monthly Salary Credit",
        tags: ["income", "fixed"],
        mode: "banking"
      });
      balances.acc_bank_2 += amount;

      // Automatic PF deduction
      const pfAmt = 15000;
      balances.acc_pf += pfAmt;
      transactions.push({
        id: `seed_tx_pf_${dateStr}`,
        amount: pfAmt,
        type: "income",
        category: "Investment",
        account_id: "acc_pf",
        payee: "EPFO",
        date: dateStr,
        notes: "PF Contribution",
        tags: ["retirement"],
        mode: "banking"
      });
    }

    // 2. EMIs and Rent (3rd-5th)
    if (dayOfMonth === 3) {
      // Home Loan EMI
      const amount = 45000;
      transactions.push({
        id: `seed_tx_hloan_${dateStr}`,
        amount,
        type: "expense",
        category: "Loans",
        account_id: "acc_bank_2",
        payee: "HDFC Home Loan",
        date: dateStr,
        notes: "Home Loan EMI",
        tags: ["essential"],
        mode: "banking"
      });
      balances.acc_bank_2 -= amount;
      balances.acc_loan_1 += (amount * 0.4); // Principal component approx
    }
    if (dayOfMonth === 5) {
      // Car Loan EMI
      const amount = 18500;
      transactions.push({
        id: `seed_tx_cloan_${dateStr}`,
        amount,
        type: "expense",
        category: "Loans",
        account_id: "acc_bank_2",
        payee: "Axis Car Loan",
        date: dateStr,
        notes: "Car Loan EMI",
        tags: ["essential"],
        mode: "banking"
      });
      balances.acc_bank_2 -= amount;
      balances.acc_loan_2 += (amount * 0.7); // Principal component approx
    }
    if (dayOfMonth === 4) {
      const amount = 35000;
      transactions.push({
        id: `seed_tx_rent_${dateStr}`,
        amount,
        type: "expense",
        category: "Housing",
        account_id: "acc_bank_2",
        payee: "Landlord",
        date: dateStr,
        notes: "Monthly Rent",
        tags: ["essential"],
        mode: "banking"
      });
      balances.acc_bank_2 -= amount;
    }

    // 3. Regular Bills (10th)
    if (dayOfMonth === 10) {
      const elec = 1200 + Math.random() * 800;
      const wifi = 999;
      const water = 300;
      [elec, wifi, water].forEach((amt, idx) => {
        const payees = ["BESCOM", "Airtel Broadband", "Water Board"];
        const cats = ["Bills", "Bills", "Bills"];
        transactions.push({
          id: `seed_tx_bill_${dateStr}_${idx}`,
          amount: Math.round(amt),
          type: "expense",
          category: cats[idx],
          account_id: "acc_bank_1",
          payee: payees[idx],
          date: dateStr,
          notes: "Monthly Utility Bill",
          tags: ["bills"],
          mode: "UPI"
        });
        balances.acc_bank_1 -= amt;
      });
    }

    // 4. SIP Investments (15th)
    if (dayOfMonth === 15) {
      const sipAmt = 25000;
      transactions.push({
        id: `seed_tx_sip_${dateStr}`,
        amount: sipAmt,
        type: "expense",
        category: "Investment",
        account_id: "acc_bank_1",
        payee: "Groww / Mutual Fund",
        date: dateStr,
        notes: "Monthly SIP Portfolio",
        tags: ["investment"],
        mode: "banking"
      });
      balances.acc_bank_1 -= sipAmt;
    }

    // 5. Daily Random Lifestyle Transactions
    const probability = 0.8; // 80% chance of a transaction every day
    if (Math.random() < probability) {
      const numTx = Math.floor(Math.random() * 5) + 1; // 1-5 tx
      for (let i = 0; i < numTx; i++) {
        const catKeys = Object.keys(CATEGORIES).filter(k => k !== "Salary" && k !== "Loans" && k !== "Housing");
        const category = catKeys[Math.floor(Math.random() * catKeys.length)] as keyof typeof CATEGORIES;
        const payeeList = CATEGORIES[category];
        const payee = payeeList[Math.floor(Math.random() * payeeList.length)];

        let amount = 0;
        switch (category) {
          case "Food": amount = 150 + Math.random() * 1500; break;
          case "Transport": amount = 50 + Math.random() * 600; break;
          case "Shopping": amount = 500 + Math.random() * 10000; break;
          case "Health": amount = 200 + Math.random() * 5000; break;
          case "Entertainment": amount = 100 + Math.random() * 2000; break;
          case "Travel": amount = 2000 + Math.random() * 25000; break;
          default: amount = 100 + Math.random() * 1000;
        }

        // Logic for picking payment mode/account
        let accId = "acc_bank_3";
        let mode: Transaction["mode"] = "UPI";

        if (amount > 5000) { accId = "acc_card_1"; mode = "card"; }
        else if (amount < 200) { accId = "acc_cash"; mode = "cash"; }
        else if (payee === "Swiggy" || payee === "Zomato") { accId = "acc_wallet_1"; mode = "UPI"; }
        else if (payee === "Amazon") { accId = "acc_card_1"; mode = "card"; }
        else { accId = Math.random() > 0.5 ? "acc_bank_1" : "acc_bank_3"; }

        const tx: Transaction = {
          id: `seed_tx_${dateStr}_rand_${i}`,
          amount: Math.round(amount),
          type: "expense",
          category,
          account_id: accId,
          payee,
          date: dateStr,
          notes: `${payee} ${category} payment`,
          tags: [],
          mode
        };

        // Add detailed items for shopping/grocery
        if (category === "Shopping" || payee === "BigBasket" || payee === "Star Bazaar") {
          tx.items = [
            { name: "Grocery Mix", qty: "1", unit: "kg" },
            { name: "Personal Care", qty: "2", unit: "pcs" }
          ];
          tx.tags.push("inventory");
        }

        // Add split logic for dining
        if (category === "Food" && amount > 1000 && Math.random() > 0.6) {
          tx.split = {
            with: ["Rahul", "Priya"],
            shareStrategy: "Equally",
            dueDate: format(addDays(currentDate, 7), "yyyy-MM-dd")
          };
          tx.tags.push("split");
        }

        transactions.push(tx);
        balances[accId] -= Math.round(amount);
      }
    }

    // 6. Transfers (Wallet Topups, ATM)
    if (dayOfMonth === 1 || dayOfMonth === 15) {
      const topup = 5000;
      transactions.push({
        id: `seed_tx_topup_${dateStr}`,
        amount: topup,
        type: "transfer",
        category: "Transfer",
        account_id: "acc_bank_2",
        to_account_id: "acc_wallet_1",
        payee: "Wallet Topup",
        date: dateStr,
        notes: "Monthly wallet budget",
        tags: [],
        mode: "banking"
      });
      balances.acc_bank_2 -= topup;
      balances.acc_wallet_1 += topup;
    }

    currentDate = addDays(currentDate, 1);
  }

  // Update final balances
  accounts.forEach(acc => {
    acc.balance = Math.round(balances[acc.id] || 0);
  });

  return { transactions: transactions.reverse(), accounts, entities, investments: [] };
};

export const applySeedData = () => {
  const data = seedAllData();
  localStorage.setItem("finance_txns", JSON.stringify(data.transactions));
  localStorage.setItem("finance_accounts", JSON.stringify(data.accounts));
  localStorage.setItem("finance_entities", JSON.stringify(data.entities));
  localStorage.setItem("finance_investments", JSON.stringify(data.investments));
  window.location.reload();
};
