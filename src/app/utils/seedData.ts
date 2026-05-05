import { format, addDays } from "date-fns";
import { Transaction, Account, Entity, Investment } from "../context/FinanceContext";

const SEED_START_DATE = new Date(Date.now() - 730 * 24 * 60 * 60 * 1000); // 2 years ago

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
    { id: "acc_card_1", name: "Amazon Pay ICICI", type: "credit_card", balance: 0, currency: "INR", creditLimit: 200000, lastFour: "4321" },
    { id: "acc_card_2", name: "SBI Card Prime", type: "credit_card", balance: 0, currency: "INR", creditLimit: 150000, lastFour: "8765" },
    { id: "acc_card_3", name: "Flipkart Axis", type: "credit_card", balance: 0, currency: "INR", creditLimit: 100000, lastFour: "2109" },
    { id: "acc_loan_1", name: "HDFC Home Loan", type: "loan", balance: -4500000, currency: "INR", interestRate: 8.5, emiAmount: 45000, emiDate: 3 },
    { id: "acc_loan_2", name: "Car Loan - Axis", type: "loan", balance: -800000, currency: "INR", interestRate: 9.0, emiAmount: 18500, emiDate: 5 },
    { id: "acc_cash", name: "Cash", type: "cash", balance: 0, currency: "INR" },
    { id: "acc_pf", name: "EPF Account", type: "pf", balance: 0, currency: "INR", interestRate: 8.15 },
  ];

  const nextMonth = format(addDays(new Date(), 30), "yyyy-MM-dd");
  const nextWeek = format(addDays(new Date(), 7), "yyyy-MM-dd");
  const in3Days = format(addDays(new Date(), 3), "yyyy-MM-dd");

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

    // Subscriptions — use frequency & nextDue (Entity interface fields)
    { id: "ent_sub_1", type: "subscription", name: "Netflix", amount: 649, frequency: "monthly", provider: "Netflix", nextDue: in3Days },
    { id: "ent_sub_2", type: "subscription", name: "Amazon Prime", amount: 1499, frequency: "yearly", provider: "Amazon", nextDue: nextMonth },
    { id: "ent_sub_3", type: "subscription", name: "Spotify Family", amount: 199, frequency: "monthly", provider: "Spotify", nextDue: nextWeek },

    // Recurring bills
    { id: "ent_rec_1", type: "recurring", name: "Airtel Postpaid", amount: 999, frequency: "monthly", provider: "Airtel", nextDue: nextWeek },
    { id: "ent_rec_2", type: "recurring", name: "BESCOM (Electricity)", amount: 1500, frequency: "monthly", provider: "BESCOM", nextDue: in3Days },

    // Gift cards — use balance & expiry (Entity interface fields)
    { id: "ent_gift_1", type: "giftcard", name: "Amazon Gift Card", balance: 5000, expiry: "2026-12-31" },
    { id: "ent_gift_2", type: "giftcard", name: "Myntra Voucher", balance: 2000, expiry: "2025-06-30" },

    // Warranties — use warrantyDetails & expiry
    { id: "ent_war_1", type: "warranty", name: "MacBook Warranty", warrantyDetails: "3 Year AppleCare+", expiry: "2027-05-15" },
    { id: "ent_war_2", type: "warranty", name: "LG Fridge Warranty", warrantyDetails: "10 Year Compressor Warranty", expiry: "2032-10-20" },

    // Items — use price & quantity
    { id: "ent_item_1", type: "item", name: "iPhone 15 Pro", price: 129900, quantity: "1 unit" },
    { id: "ent_item_2", type: "item", name: "Sony WH-1000XM5", price: 29900, quantity: "1 unit" },
    { id: "ent_item_3", type: "item", name: "Dell Monitor 27\"", price: 18500, quantity: "2 units" },

    // Bank details — use accountNo, ifsc, branch
    { id: "ent_bank_1", type: "bank", name: "HDFC Primary", accountNo: "50100445566778", ifsc: "HDFC0001234", branch: "Indiranagar, Bangalore" },
    { id: "ent_bank_2", type: "bank", name: "ICICI Salary", accountNo: "000401556677", ifsc: "ICIC0000004", branch: "M.G. Road, Bangalore" },
    { id: "ent_bank_3", type: "bank", name: "SBI Savings", accountNo: "30556677889", ifsc: "SBIN0001234", branch: "Whitefield, Bangalore" },
  ];

  const transactions: Transaction[] = [];
  const now = new Date();
  let currentDate = new Date(SEED_START_DATE);

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

  // Use a seeded pseudo-random to make resets consistent
  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  };
  const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
  const randFloat = (min: number, max: number) => rand() * (max - min) + min;

  while (currentDate <= now) {
    const dateStr = format(currentDate, "yyyy-MM-dd");
    const dayOfMonth = currentDate.getDate();

    // 1. Monthly Salary (1st of month)
    if (dayOfMonth === 1) {
      const amount = 185000;
      transactions.push({
        id: `seed_sal_${dateStr}`,
        amount,
        type: "income",
        category: "Salary",
        account_id: "acc_bank_2",
        payee: "Acme Corp",
        date: dateStr,
        notes: "Monthly Salary Credit",
        tags: ["income", "fixed"],
        mode: "netbanking",
        status: "cleared",
      });
      balances.acc_bank_2 += amount;

      const pfAmt = 15000;
      balances.acc_pf += pfAmt;
      transactions.push({
        id: `seed_pf_${dateStr}`,
        amount: pfAmt,
        type: "income",
        category: "Investment",
        account_id: "acc_pf",
        payee: "EPFO",
        date: dateStr,
        notes: "PF Contribution",
        tags: ["retirement"],
        mode: "netbanking",
        status: "cleared",
      });
    }

    // 2. EMIs and Rent
    if (dayOfMonth === 3) {
      const amount = 45000;
      transactions.push({
        id: `seed_hloan_${dateStr}`,
        amount,
        type: "expense",
        category: "Loans",
        account_id: "acc_bank_2",
        payee: "HDFC Home Loan",
        date: dateStr,
        notes: "Home Loan EMI",
        tags: ["essential"],
        mode: "netbanking",
        status: "cleared",
      });
      balances.acc_bank_2 -= amount;
      balances.acc_loan_1 += amount * 0.4;
    }
    if (dayOfMonth === 5) {
      const amount = 18500;
      transactions.push({
        id: `seed_cloan_${dateStr}`,
        amount,
        type: "expense",
        category: "Loans",
        account_id: "acc_bank_2",
        payee: "Axis Car Loan",
        date: dateStr,
        notes: "Car Loan EMI",
        tags: ["essential"],
        mode: "netbanking",
        status: "cleared",
      });
      balances.acc_bank_2 -= amount;
      balances.acc_loan_2 += amount * 0.7;
    }
    if (dayOfMonth === 4) {
      const amount = 35000;
      transactions.push({
        id: `seed_rent_${dateStr}`,
        amount,
        type: "expense",
        category: "Housing",
        account_id: "acc_bank_2",
        payee: "Landlord",
        date: dateStr,
        notes: "Monthly Rent",
        tags: ["essential"],
        mode: "netbanking",
        status: "cleared",
      });
      balances.acc_bank_2 -= amount;
    }

    // 3. Regular Bills (10th)
    if (dayOfMonth === 10) {
      const elec = Math.round(randFloat(1200, 2000));
      const wifi = 999;
      const water = 300;
      [
        { amt: elec, payee: "BESCOM", notes: "Electricity Bill" },
        { amt: wifi, payee: "Airtel Broadband", notes: "Internet Bill" },
        { amt: water, payee: "Water Board", notes: "Water Bill" },
      ].forEach(({ amt, payee, notes }, idx) => {
        transactions.push({
          id: `seed_bill_${dateStr}_${idx}`,
          amount: amt,
          type: "expense",
          category: "Bills",
          account_id: "acc_bank_1",
          payee,
          date: dateStr,
          notes,
          tags: ["bills"],
          mode: "UPI",
          status: "cleared",
        });
        balances.acc_bank_1 -= amt;
      });
    }

    // 4. SIP Investments (15th)
    if (dayOfMonth === 15) {
      const sipAmt = 25000;
      transactions.push({
        id: `seed_sip_${dateStr}`,
        amount: sipAmt,
        type: "expense",
        category: "Investment",
        account_id: "acc_bank_1",
        payee: "Groww / Mutual Fund",
        date: dateStr,
        notes: "Monthly SIP Portfolio",
        tags: ["investment"],
        mode: "netbanking",
        status: "cleared",
      });
      balances.acc_bank_1 -= sipAmt;
    }

    // 5. Daily lifestyle transactions
    if (rand() < 0.8) {
      const numTx = randInt(1, 4);
      for (let i = 0; i < numTx; i++) {
        const catKeys = (Object.keys(CATEGORIES) as Array<keyof typeof CATEGORIES>).filter(
          (k) => k !== "Salary" && k !== "Loans" && k !== "Housing"
        );
        const category = catKeys[randInt(0, catKeys.length - 1)];
        const payeeList = CATEGORIES[category];
        const payee = payeeList[randInt(0, payeeList.length - 1)];

        let amount = 0;
        switch (category) {
          case "Food":        amount = Math.round(randFloat(150, 1650)); break;
          case "Transport":   amount = Math.round(randFloat(50, 650)); break;
          case "Shopping":    amount = Math.round(randFloat(500, 10500)); break;
          case "Health":      amount = Math.round(randFloat(200, 5200)); break;
          case "Entertainment": amount = Math.round(randFloat(100, 2100)); break;
          case "Travel":      amount = Math.round(randFloat(2000, 27000)); break;
          default:            amount = Math.round(randFloat(100, 1100));
        }

        let accId = "acc_bank_3";
        let mode: Transaction["mode"] = "UPI";
        if (amount > 5000) { accId = "acc_card_1"; mode = "card"; }
        else if (amount < 200) { accId = "acc_cash"; mode = "cash"; }
        else if (payee === "Swiggy" || payee === "Zomato") { accId = "acc_wallet_1"; mode = "UPI"; }
        else if (payee === "Amazon") { accId = "acc_card_1"; mode = "card"; }
        else { accId = rand() > 0.5 ? "acc_bank_1" : "acc_bank_3"; }

        const tx: Transaction = {
          id: `seed_rand_${dateStr}_${i}`,
          amount,
          type: "expense",
          category,
          account_id: accId,
          payee,
          date: dateStr,
          notes: `${payee} ${category} payment`,
          tags: [],
          mode,
          status: "cleared",
        };

        if (category === "Shopping" || payee === "BigBasket" || payee === "Star Bazaar") {
          tx.items = [
            { name: "Grocery Mix", qty: "1", unit: "kg" },
            { name: "Personal Care", qty: "2", unit: "pcs" },
          ];
          tx.tags.push("inventory");
        }

        if (category === "Food" && amount > 1000 && rand() > 0.6) {
          tx.split = {
            with: ["Rahul", "Priya"],
            shareStrategy: "Equally",
            dueDate: format(addDays(currentDate, 7), "yyyy-MM-dd"),
          };
          tx.tags.push("split");
        }

        transactions.push(tx);
        balances[accId] = (balances[accId] || 0) - amount;
      }
    }

    // 6. Wallet topups (1st and 15th)
    if (dayOfMonth === 1 || dayOfMonth === 15) {
      const topup = 5000;
      transactions.push({
        id: `seed_topup_${dateStr}`,
        amount: topup,
        type: "transfer",
        category: "Transfer",
        account_id: "acc_bank_2",
        to_account_id: "acc_wallet_1",
        payee: "Wallet Topup",
        date: dateStr,
        notes: "Monthly wallet budget",
        tags: [],
        mode: "netbanking",
        status: "cleared",
      });
      balances.acc_bank_2 -= topup;
      balances.acc_wallet_1 += topup;
    }

    currentDate = addDays(currentDate, 1);
  }

  // Apply computed balances to account objects
  accounts.forEach((acc) => {
    acc.balance = Math.round(balances[acc.id] ?? 0);
  });

  const investments: Investment[] = [
    {
      id: "inv_mf_1",
      name: "HDFC Flexi Cap Fund",
      type: "Mutual Fund",
      category: "marketLinked",
      investedAmount: 600000,
      currentValue: 742000,
      isSIP: true,
      units: 1840,
      avgNav: 326,
      currentNav: 403,
      broker: "Groww",
    },
    {
      id: "inv_stock_1",
      name: "Infosys",
      type: "Stock",
      category: "marketLinked",
      investedAmount: 150000,
      currentValue: 178000,
      quantity: 100,
      broker: "Zerodha",
    },
    {
      id: "inv_fd_1",
      name: "SBI Fixed Deposit",
      type: "Fixed Income",
      category: "fixedIncome",
      investedAmount: 200000,
      currentValue: 218000,
      rate: 7.1,
      maturityDate: "2026-03-15",
    },
  ];

  return { transactions: transactions.reverse(), accounts, entities, investments };
};

export const applySeedData = () => {
  const data = seedAllData();
  try {
    localStorage.setItem("finance_txns", JSON.stringify(data.transactions));
    localStorage.setItem("finance_accounts", JSON.stringify(data.accounts));
    localStorage.setItem("finance_entities", JSON.stringify(data.entities));
    localStorage.setItem("finance_investments", JSON.stringify(data.investments));
  } catch (e) {
    console.error("Failed to seed data:", e);
  }
  window.location.reload();
};
