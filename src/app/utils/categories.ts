export type NeedWantType = "need" | "want" | "investment" | "discretionary";
export type CategoryType = "expense" | "income" | "both";

export interface SubCategory {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  disabled?: boolean;
  sortOrder?: number;
  favorite?: boolean;
  children?: SubCategory[];
  budgetLimit?: number;
  monthlyLimit?: number;
}

export interface CategoryDef {
  id: string;
  name: string;
  icon: string;
  color: string;
  classification: NeedWantType;
  type: CategoryType;
  subcategories: string[]; // flat list for backward compat
  children?: SubCategory[]; // full hierarchy
  disabled?: boolean;
  sortOrder?: number;
  favorite?: boolean;
  aiKeywords?: string[];
  budgetLimit?: number;
  monthlyLimit?: number;
  aiRules?: string[]; // Regex or keyword patterns for auto-matching
  auto_generated?: boolean;
}

// Icon map: category icon key → emoji
export const CATEGORY_ICON_MAP: Record<string, string> = {
  food: "🍽️",
  snacks: "🍿",
  groceries: "🛒",
  transport: "🚌",
  vehicle: "🚗",
  bills: "📱",
  utilities: "⚡",
  housing: "🏠",
  household: "🏡",
  fashion: "👗",
  personal_care: "🪥",
  electronics: "💻",
  finance: "💹",
  insurance: "🛡️",
  taxes: "🧾",
  debt: "💳",
  income: "💰",
  lifestyle: "🌟",
  holidays: "✈️",
  gifts: "🎁",
  self_development: "📚",
  stationery: "✏️",
  pets_plants: "🌿",
  relationships: "❤️",
  fees: "🏷️",
  health: "🏥",
  education: "🎓",
  shopping: "🛍️",
  entertainment: "🎭",
  others: "📦",
};

// Color map: classification → tailwind color classes
export const CLASSIFICATION_COLORS: Record<NeedWantType, { bg: string; text: string; border: string }> = {
  need: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  want: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  investment: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  discretionary: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function sc(names: string[]): SubCategory[] {
  return names.map((n, i) => ({ id: slugify(n), name: n, sortOrder: i }));
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function node(name: string, children?: SubCategory[], extra?: Partial<SubCategory>): SubCategory {
  return { id: slugify(name), name, children, sortOrder: 0, ...extra };
}

// ---------------------------------------------------------------------------
// EXPENSE CATEGORIES — True 3-Tier Hierarchy
// ---------------------------------------------------------------------------
export const DEFAULT_EXPENSE_CATEGORIES: CategoryDef[] = [
  {
    id: "food",
    name: "Food",
    icon: "food",
    color: "#f97316",
    classification: "need",
    type: "expense",
    sortOrder: 0,
    aiKeywords: ["restaurant", "zomato", "swiggy", "meal", "lunch", "dinner", "breakfast"],
    subcategories: ["Breakfast", "Brunch", "Lunch", "Dinner", "Supper", "Side Dish"],
    children: sc(["Breakfast", "Brunch", "Lunch", "Dinner", "Supper", "Side Dish"]),
  },
  {
    id: "snacks",
    name: "Snacks",
    icon: "snacks",
    color: "#f59e0b",
    classification: "want",
    type: "expense",
    sortOrder: 1,
    aiKeywords: ["snack", "juice", "beverage", "candy", "chips", "biscuit", "cake"],
    subcategories: ["Beverage", "Fruits", "Bakery", "Fast Foods"],
    children: [
      node("Beverage", sc(["Alcohol", "Fruit Juice", "Drinking Water", "Cold Drinks", "Hot Drinks"])),
      node("Fruits", sc(["Citrus Fruits", "Tropical Fruits", "Berries", "Stone Fruits", "Pome Fruits", "Melons"])),
      node("Bakery", sc(["Savories", "Ice Creams", "Chocolates", "Cakes", "Biscuits", "Sweets"])),
      node("Fast Foods", sc(["Ready To Cook", "Ready To Eat"])),
    ],
  },
  {
    id: "groceries",
    name: "Groceries",
    icon: "groceries",
    color: "#22c55e",
    classification: "need",
    type: "expense",
    sortOrder: 2,
    aiKeywords: ["supermarket", "kirana", "bigbasket", "blinkit", "grocery", "vegetable", "dairy"],
    subcategories: ["Vegetables", "Dairy Products", "Grains & Cereals", "Nuts & Seeds", "Spices & Condiments", "Non-Veg", "Oils & Fats", "Honey", "Day-to-Day Cooking Essentials"],
    children: [
      node("Vegetables", sc(["Leafs", "Tubers", "Roots", "Bulbs", "Stems", "Flowers", "Fruits", "Legumes"])),
      node("Dairy Products", sc(["Cheese", "Butter", "Buttermilk", "Paneer", "Milk"])),
      node("Grains & Cereals", sc(["Rice", "Wheat", "Millets"])),
      node("Nuts & Seeds", sc(["Nuts", "Seeds", "Dried Fruits"])),
      node("Spices & Condiments", sc(["Whole Spices", "Ground Spices", "Herbs", "Condiments"])),
      node("Non-Veg", sc(["Meat", "Fish", "Eggs", "Chicken"])),
      node("Oils & Fats", sc(["Cooking Oils", "Cold Pressed", "Animal Fats"])),
      node("Honey"),
      node("Day-to-Day Cooking Essentials"),
    ],
  },
  {
    id: "transportation",
    name: "Transportation",
    icon: "transport",
    color: "#3b82f6",
    classification: "need",
    type: "expense",
    sortOrder: 3,
    aiKeywords: ["ola", "uber", "rapido", "auto", "metro", "bus", "train", "cab", "rickshaw"],
    subcategories: ["Air", "Auto", "Bike", "Cab", "Bus", "Metro", "Train"],
    children: sc(["Air", "Auto", "Bike", "Cab", "Bus", "Metro", "Train"]),
  },
  {
    id: "vehicle",
    name: "Vehicle",
    icon: "vehicle",
    color: "#6366f1",
    classification: "need",
    type: "expense",
    sortOrder: 4,
    aiKeywords: ["petrol", "fuel", "parking", "service", "repair", "fine", "challan"],
    subcategories: ["Two-Wheeler", "Four-Wheeler"],
    children: [
      node("Two-Wheeler", sc(["Petrol", "Rentals", "Parking", "Repairs & Maintenance", "Fines"])),
      node("Four-Wheeler", sc(["Petrol", "Rentals", "Parking", "Repairs & Maintenance", "Fines"])),
    ],
  },
  {
    id: "bills",
    name: "Bills",
    icon: "bills",
    color: "#8b5cf6",
    classification: "need",
    type: "expense",
    sortOrder: 5,
    aiKeywords: ["recharge", "mobile", "broadband", "dth", "tv", "credit card", "airtel", "jio"],
    subcategories: ["Mobile Recharge", "Credit Card", "Television", "Broadband"],
    children: [
      node("Mobile Recharge", sc(["Data Top Up"])),
      node("Credit Card"),
      node("Television"),
      node("Broadband"),
    ],
  },
  {
    id: "utilities",
    name: "Utilities",
    icon: "utilities",
    color: "#eab308",
    classification: "need",
    type: "expense",
    sortOrder: 6,
    aiKeywords: ["electricity", "water", "gas", "lpg", "bescom", "bwssb"],
    subcategories: ["Electricity", "Gas", "Trash", "Water"],
    children: sc(["Electricity", "Gas", "Trash", "Water"]),
  },
  {
    id: "housing",
    name: "Housing",
    icon: "housing",
    color: "#0ea5e9",
    classification: "need",
    type: "expense",
    sortOrder: 7,
    aiKeywords: ["rent", "maintenance", "society", "maid", "plumber", "carpenter"],
    subcategories: ["Rent", "Maintenance", "Domestic Help"],
    children: [
      node("Rent"),
      node("Maintenance", sc(["Repairs", "Services"])),
      node("Domestic Help"),
    ],
  },
  {
    id: "household",
    name: "Household Essentials",
    icon: "household",
    color: "#14b8a6",
    classification: "need",
    type: "expense",
    sortOrder: 8,
    aiKeywords: ["cleaning", "kitchen", "decor", "appliance", "furniture"],
    subcategories: ["Cleaning Supplies", "Kitchen Utilities", "Home Decor", "Appliances", "Furniture", "Air Fresheners"],
    children: sc(["Cleaning Supplies", "Kitchen Utilities", "Home Decor", "Appliances", "Furniture", "Air Fresheners"]),
  },
  {
    id: "fashion",
    name: "Fashion",
    icon: "fashion",
    color: "#ec4899",
    classification: "want",
    type: "expense",
    sortOrder: 9,
    aiKeywords: ["clothing", "shoes", "shirt", "dress", "bag", "wallet", "myntra", "ajio"],
    subcategories: ["Outerwears", "Tops", "Bottoms", "Inner Wear", "Footwear", "Accessories", "Bags"],
    children: [
      node("Outerwears", sc(["Jacket", "Sweaters"])),
      node("Tops", sc(["Shirt", "T-Shirt"])),
      node("Bottoms", sc(["Pants / Trousers", "Shorts"])),
      node("Inner Wear", sc(["Vests", "Boxers", "Underwear"])),
      node("Footwear", sc(["Shoes", "Sneakers", "Socks", "Sandals", "Flip-flops"])),
      node("Accessories", sc(["Belt", "Hand Kerchief", "Wallet", "Others"])),
      node("Bags", sc(["Suitcase", "Backpacks", "Travel Bag", "Duffle Bag", "Trolley"])),
    ],
  },
  {
    id: "personal_care",
    name: "Personal Care",
    icon: "personal_care",
    color: "#f43f5e",
    classification: "need",
    type: "expense",
    sortOrder: 10,
    aiKeywords: ["shampoo", "soap", "skincare", "grooming", "salon", "haircut", "cosmetic"],
    subcategories: ["Skin", "Grooming", "Oral", "Hair", "Hygiene", "Cosmetic"],
    children: sc(["Skin", "Grooming", "Oral", "Hair", "Hygiene", "Cosmetic"]),
  },
  {
    id: "electronics",
    name: "Electronics",
    icon: "electronics",
    color: "#64748b",
    classification: "want",
    type: "expense",
    sortOrder: 11,
    aiKeywords: ["charger", "laptop", "phone", "gadget", "adaptor", "amazon", "flipkart"],
    subcategories: ["Accessories"],
    children: [
      node("Accessories", sc(["Chargers", "Adaptors"])),
    ],
  },
  {
    id: "financial_instruments",
    name: "Financial Instruments",
    icon: "finance",
    color: "#10b981",
    classification: "investment",
    type: "expense",
    sortOrder: 12,
    aiKeywords: ["stocks", "mutual fund", "gold", "fd", "real estate", "etf", "sip", "nps"],
    subcategories: ["Assets", "Deposits", "Investment", "Land"],
    children: [
      node("Assets", sc(["Real Estate", "Gold"])),
      node("Deposits", sc(["Emergency Fund", "Fixed Deposit"])),
      node("Investment", sc(["Stocks", "Foreign Stocks", "Mutual Funds", "ETFs"])),
      node("Land"),
    ],
  },
  {
    id: "insurance",
    name: "Insurance",
    icon: "insurance",
    color: "#0891b2",
    classification: "need",
    type: "expense",
    sortOrder: 13,
    aiKeywords: ["insurance", "premium", "policy", "lIC", "mediclaim"],
    subcategories: ["Health Insurance", "Life Insurance", "Home Insurance", "Vehicle Insurance", "Add Ons"],
    children: sc(["Health Insurance", "Life Insurance", "Home Insurance", "Vehicle Insurance", "Add Ons"]),
  },
  {
    id: "taxes",
    name: "Taxes",
    icon: "taxes",
    color: "#b45309",
    classification: "need",
    type: "expense",
    sortOrder: 14,
    aiKeywords: ["income tax", "property tax", "vehicle tax", "gst", "tds"],
    subcategories: ["Income Tax", "Property Tax", "Vehicle Tax"],
    children: sc(["Income Tax", "Property Tax", "Vehicle Tax"]),
  },
  {
    id: "debt_repayment",
    name: "Debt Repayment",
    icon: "debt",
    color: "#dc2626",
    classification: "need",
    type: "expense",
    sortOrder: 15,
    auto_generated: true,
    aiKeywords: ["emi", "loan", "credit card bill", "chit fund", "repayment"],
    subcategories: ["ICICI Amazon Pay", "Chit Funds", "Transfer", "Lend"],
    children: sc(["ICICI Amazon Pay", "Chit Funds", "Transfer", "Lend"]),
  },
  {
    id: "day_out",
    name: "Day Out",
    icon: "lifestyle",
    color: "#7c3aed",
    classification: "discretionary",
    type: "expense",
    sortOrder: 16,
    aiKeywords: ["movie", "cinema", "cafe", "restaurant", "bar", "concert", "park"],
    subcategories: ["Entertainment", "Eating Out"],
    children: [
      node("Entertainment", sc(["Movies", "Amusement Parks", "Concerts"])),
      node("Eating Out", sc(["Cafe", "Restaurants", "Resto Bar"])),
    ],
  },
  {
    id: "holidays",
    name: "Holidays",
    icon: "holidays",
    color: "#0284c7",
    classification: "discretionary",
    type: "expense",
    sortOrder: 17,
    aiKeywords: ["vacation", "holiday", "travel", "hotel", "flight", "festival"],
    subcategories: ["Vacations", "Festivals"],
    children: [
      node("Vacations", sc(["Stay", "Food", "Transportation", "Fees", "Souvenirs"])),
      node("Festivals", sc(["Fees", "Donation", "Transportation", "Food", "Gifts"])),
    ],
  },
  {
    id: "gifts",
    name: "Gifts",
    icon: "gifts",
    color: "#db2777",
    classification: "discretionary",
    type: "expense",
    sortOrder: 18,
    aiKeywords: ["gift", "birthday", "anniversary", "charity", "donation"],
    subcategories: ["Donation", "Special Occasions"],
    children: [
      node("Donation", sc(["Alms", "Charity"])),
      node("Special Occasions", sc(["Birthday", "Anniversary", "Marriage", "Engagement", "Promotions", "Others"])),
    ],
  },
  {
    id: "self_development",
    name: "Self Development",
    icon: "self_development",
    color: "#4f46e5",
    classification: "want",
    type: "expense",
    sortOrder: 19,
    aiKeywords: ["course", "certification", "udemy", "coursera", "workshop", "book"],
    subcategories: ["Courses", "Certifications", "Others"],
    children: [
      node("Courses", sc(["Online", "Micro Degrees"])),
      node("Certifications", sc(["Professional"])),
      node("Others", sc(["Registration"])),
    ],
  },
  {
    id: "stationery",
    name: "Stationery",
    icon: "stationery",
    color: "#65a30d",
    classification: "want",
    type: "expense",
    sortOrder: 20,
    aiKeywords: ["pen", "notebook", "canvas", "art", "photocopy"],
    subcategories: ["Writing", "Drawing", "Others"],
    children: [
      node("Writing", sc(["Notes", "Pens & Pencils"])),
      node("Drawing", sc(["Canvas", "Art Supplies"])),
      node("Others", sc(["Photocopy"])),
    ],
  },
  {
    id: "pets_plants",
    name: "Pets & Plants",
    icon: "pets_plants",
    color: "#16a34a",
    classification: "discretionary",
    type: "expense",
    sortOrder: 21,
    aiKeywords: ["pet", "dog", "cat", "plant", "nursery", "vet"],
    subcategories: ["Pets", "Plants"],
    children: [
      node("Pets", sc(["Buy", "Food", "Medicines", "Tools", "Toys", "Veterinary Visits"])),
      node("Plants", sc(["Saplings / Seeds", "Fertilizers", "Tools", "Pots"])),
    ],
  },
  {
    id: "circle",
    name: "Circle",
    icon: "relationships",
    color: "#e11d48",
    classification: "discretionary",
    type: "expense",
    sortOrder: 22,
    aiKeywords: ["family", "kids", "friends", "parents", "elders"],
    subcategories: ["Family", "Elders", "Kids", "Friends"],
    children: [
      node("Family", sc(["Food", "Clothes", "Snacks", "Health", "Outing"])),
      node("Elders", sc(["Food", "Snacks", "Bills", "Pocket Money", "Clothes", "Health", "Diapers", "Outing"])),
      node("Kids", sc(["Food", "Snacks", "Toys", "Pocket Money", "Clothes", "Outing", "Health", "Tuition", "Diapers"])),
      node("Friends", sc(["Food", "Clothes", "Snacks", "Outing", "Medicine"])),
    ],
  },
  {
    id: "fees",
    name: "Fees",
    icon: "fees",
    color: "#78716c",
    classification: "need",
    type: "expense",
    sortOrder: 23,
    aiKeywords: ["registration", "fee", "pooja", "platform fee", "bank charge"],
    subcategories: ["Registration", "Fees", "Pooja"],
    children: sc(["Registration", "Fees", "Pooja"]),
  },
  {
    id: "health",
    name: "Health",
    icon: "health",
    color: "#ef4444",
    classification: "need",
    type: "expense",
    sortOrder: 24,
    aiKeywords: ["doctor", "medicine", "hospital", "pharmacy", "gym", "clinic"],
    subcategories: ["Medicine", "Doctor/Consultation", "Hospital", "Gym", "Wellness/Spa", "Pharmacy", "Dental"],
    children: sc(["Medicine", "Doctor/Consultation", "Hospital", "Gym", "Wellness/Spa", "Pharmacy", "Dental"]),
  },
  {
    id: "education",
    name: "Education",
    icon: "education",
    color: "#7c3aed",
    classification: "need",
    type: "expense",
    sortOrder: 25,
    aiKeywords: ["school", "college", "tuition", "coaching", "exam", "book"],
    subcategories: ["School/College Fees", "Books", "Coaching", "Online Course", "Stationery", "Exam Fees"],
    children: sc(["School/College Fees", "Books", "Coaching", "Online Course", "Stationery", "Exam Fees"]),
  },
  {
    id: "others_expense",
    name: "Others",
    icon: "others",
    color: "#94a3b8",
    classification: "want",
    type: "expense",
    sortOrder: 99,
    subcategories: ["Refund", "Reimbursement", "Miscellaneous"],
    children: sc(["Refund", "Reimbursement", "Miscellaneous"]),
  },
];

// ---------------------------------------------------------------------------
// INCOME CATEGORIES
// ---------------------------------------------------------------------------
export const DEFAULT_INCOME_CATEGORIES: CategoryDef[] = [
  {
    id: "income_salary",
    name: "Salary",
    icon: "income",
    color: "#22c55e",
    classification: "need",
    type: "income",
    sortOrder: 0,
    aiKeywords: ["salary", "payroll", "bonus", "stipend", "rsu"],
    subcategories: ["Base Pay", "Bonus", "RSU/Stocks", "Arrears", "Variable Pay"],
    children: sc(["Base Pay", "Bonus", "RSU/Stocks", "Arrears", "Variable Pay"]),
  },
  {
    id: "income_gift",
    name: "Gift",
    icon: "gifts",
    color: "#f59e0b",
    classification: "discretionary",
    type: "income",
    sortOrder: 1,
    aiKeywords: ["gift", "cashback", "refund", "discount", "reward"],
    subcategories: ["Cashback", "Discount"],
    children: sc(["Cashback", "Discount"]),
  },
  {
    id: "income_investment",
    name: "Investment",
    icon: "finance",
    color: "#10b981",
    classification: "investment",
    type: "income",
    sortOrder: 2,
    aiKeywords: ["dividend", "interest", "stock", "mutual fund", "capital gains"],
    subcategories: ["Interest", "Dividends", "Capital Gains", "Mutual Fund Redemption", "Rental Income"],
    children: sc(["Interest", "Dividends", "Capital Gains", "Mutual Fund Redemption", "Rental Income"]),
  },
  {
    id: "income_freelance",
    name: "Freelance",
    icon: "income",
    color: "#0ea5e9",
    classification: "need",
    type: "income",
    sortOrder: 3,
    subcategories: ["Design", "Development", "Consulting", "Writing", "Teaching"],
    children: sc(["Design", "Development", "Consulting", "Writing", "Teaching"]),
  },
  {
    id: "income_others",
    name: "Others",
    icon: "others",
    color: "#94a3b8",
    classification: "want",
    type: "income",
    sortOrder: 99,
    subcategories: ["Refund", "Reimbursement", "Inheritance"],
    children: sc(["Refund", "Reimbursement", "Inheritance"]),
  },
];

export const DEFAULT_ALL_CATEGORIES: CategoryDef[] = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
];

// ---------------------------------------------------------------------------
// Legacy flat exports (backward compatibility)
// ---------------------------------------------------------------------------
export const EXPENSE_CATEGORIES: { name: string; subcategories: string[]; classification: NeedWantType }[] =
  DEFAULT_EXPENSE_CATEGORIES.map(c => ({ name: c.name, subcategories: c.subcategories, classification: c.classification }));

export const INCOME_CATEGORIES: { name: string; subcategories: string[]; classification: NeedWantType }[] =
  DEFAULT_INCOME_CATEGORIES.map(c => ({ name: c.name, subcategories: c.subcategories, classification: c.classification }));

export const CATEGORY_CLASSIFICATION: Record<string, NeedWantType> = Object.fromEntries([
  ...DEFAULT_EXPENSE_CATEGORIES.map(c => [c.name, c.classification] as [string, NeedWantType]),
  ...DEFAULT_INCOME_CATEGORIES.map(c => [c.name, c.classification] as [string, NeedWantType]),
]);

export const SUBCATEGORY_MAP: Record<string, string[]> = Object.fromEntries([
  ...DEFAULT_EXPENSE_CATEGORIES.map(c => [c.name, c.subcategories]),
  ...DEFAULT_INCOME_CATEGORIES.map(c => [c.name, c.subcategories]),
]);

export const EXPENSE_CATEGORY_NAMES = DEFAULT_EXPENSE_CATEGORIES.map(c => c.name);
export const INCOME_CATEGORY_NAMES = DEFAULT_INCOME_CATEGORIES.map(c => c.name);
