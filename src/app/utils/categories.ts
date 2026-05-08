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
  subcategories: string[]; 
  children?: SubCategory[]; 
  disabled?: boolean;
  sortOrder?: number;
  favorite?: boolean;
  aiKeywords?: string[];
  budgetLimit?: number;
  monthlyLimit?: number;
  aiRules?: string[];
  auto_generated?: boolean;
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function sc(names: string[]): SubCategory[] {
  return names.map((n, i) => ({ id: slugify(n), name: n, sortOrder: i }));
}

// ---------------------------------------------------------------------------
// CATEGORY DEFINITIONS
// ---------------------------------------------------------------------------
export const DEFAULT_EXPENSE_CATEGORIES: CategoryDef[] = [
  {
    id: "food",
    name: "Food",
    icon: "fluent-emoji:fork-and-knife-with-plate",
    color: "#f97316",
    classification: "need",
    type: "expense",
    sortOrder: 0,
    subcategories: ["Breakfast", "Brunch", "Lunch", "Dinner", "Supper", "Side Dish", "Takeaway", "Office Meals"],
    children: sc(["Breakfast", "Brunch", "Lunch", "Dinner", "Supper", "Side Dish", "Takeaway", "Office Meals"]),
  },
  {
    id: "snacks_beverages",
    name: "Snacks & Beverages",
    icon: "fluent-emoji:popcorn",
    color: "#f59e0b",
    classification: "want",
    type: "expense",
    sortOrder: 1,
    subcategories: ["Tea", "Coffee", "Fruit Juice", "Cold Drinks", "Milkshakes", "Water", "Chocolates", "Ice Creams", "Savories", "Cakes", "Sweets", "Biscuits", "Chips", "Others"],
    children: sc(["Tea", "Coffee", "Fruit Juice", "Cold Drinks", "Milkshakes", "Water", "Chocolates", "Ice Creams", "Savories", "Cakes", "Sweets", "Biscuits", "Chips", "Others"]),
  },
  {
    id: "day_out",
    name: "Day Out",
    icon: "fluent-emoji:sparkles",
    color: "#7c3aed",
    classification: "discretionary",
    type: "expense",
    sortOrder: 2,
    subcategories: ["Movies", "Amusement Parks", "Concerts", "Festivals", "Restaurants", "Cafes", "Resto Bar", "Pubs/Clubs", "Theatre", "Gaming/Bowling"],
    children: sc(["Movies", "Amusement Parks", "Concerts", "Festivals", "Restaurants", "Cafes", "Resto Bar", "Pubs/Clubs", "Theatre", "Gaming/Bowling"]),
  },
  {
    id: "groceries",
    name: "Groceries",
    icon: "fluent-emoji:shopping-cart",
    color: "#22c55e",
    classification: "need",
    type: "expense",
    sortOrder: 3,
    subcategories: ["Vegetables", "Fruits", "Dairy Products", "Grains & Cereals", "Millets", "Nuts & Seeds", "Spices", "Ground Spices", "Herbs", "Non-Veg", "Oils & Fats", "Honey", "Baking Supplies"],
    children: sc(["Vegetables", "Fruits", "Dairy Products", "Grains & Cereals", "Millets", "Nuts & Seeds", "Spices", "Ground Spices", "Herbs", "Non-Veg", "Oils & Fats", "Honey", "Baking Supplies"]),
  },
  {
    id: "personal_vehicle",
    name: "Personal Vehicle",
    icon: "fluent-emoji:automobile",
    color: "#6366f1",
    classification: "need",
    type: "expense",
    sortOrder: 4,
    subcategories: ["Two-Wheeler", "Four-Wheeler"],
    children: sc(["Two-Wheeler", "Four-Wheeler"]),
  },
  {
    id: "transportation",
    name: "Transportation",
    icon: "fluent-emoji:bus",
    color: "#3b82f6",
    classification: "need",
    type: "expense",
    sortOrder: 5,
    subcategories: ["Bike Taxi", "Cab / Taxi", "Auto / Rickshaw", "Bus", "Metro & Train", "Air / Flights"],
    children: sc(["Bike Taxi", "Cab / Taxi", "Auto / Rickshaw", "Bus", "Metro & Train", "Air / Flights"]),
  },
  {
    id: "housing",
    name: "Housing",
    icon: "fluent-emoji:house",
    color: "#0ea5e9",
    classification: "need",
    type: "expense",
    sortOrder: 6,
    subcategories: ["Rent", "Society Maintenance", "Property Tax", "Security"],
    children: sc(["Rent", "Society Maintenance", "Property Tax", "Security"]),
  },
  {
    id: "domestic_help",
    name: "Domestic Help",
    icon: "fluent-emoji:person-tipping-hand",
    color: "#14b8a6",
    classification: "need",
    type: "expense",
    sortOrder: 7,
    subcategories: ["Maid", "Cook", "Nanny", "Gardener", "Security Guard"],
    children: sc(["Maid", "Cook", "Nanny", "Gardener", "Security Guard"]),
  },
  {
    id: "household_essentials",
    name: "Household Essentials",
    icon: "fluent-emoji:house-with-garden",
    color: "#10b981",
    classification: "need",
    type: "expense",
    sortOrder: 8,
    subcategories: ["Cleaning Supplies", "Laundry/Detergents", "Kitchenware/Cookware", "Kitchen Utilities", "Home Decor", "Appliances", "Furniture", "Air Fresheners", "Bedding/Linens", "Toiletries", "Storage/Organization", "Tools/Hardware"],
    children: sc(["Cleaning Supplies", "Laundry/Detergents", "Kitchenware/Cookware", "Kitchen Utilities", "Home Decor", "Appliances", "Furniture", "Air Fresheners", "Bedding/Linens", "Toiletries", "Storage/Organization", "Tools/Hardware"]),
  },
  {
    id: "household_maintenance",
    name: "Household Maintenance",
    icon: "fluent-emoji:hammer-and-wrench",
    color: "#64748b",
    classification: "need",
    type: "expense",
    sortOrder: 9,
    subcategories: ["Electrical", "Plumbing", "Painting", "Pest Control", "Carpentry", "AC Service"],
    children: sc(["Electrical", "Plumbing", "Painting", "Pest Control", "Carpentry", "AC Service"]),
  },
  {
    id: "utilities",
    name: "Utilities",
    icon: "fluent-emoji:high-voltage",
    color: "#eab308",
    classification: "need",
    type: "expense",
    sortOrder: 10,
    subcategories: ["Electricity", "Water", "Gas", "Trash/Waste"],
    children: sc(["Electricity", "Water", "Gas", "Trash/Waste"]),
  },
  {
    id: "bills",
    name: "Bills",
    icon: "fluent-emoji:calculator",
    color: "#8b5cf6",
    classification: "need",
    type: "expense",
    sortOrder: 11,
    subcategories: ["Mobile Recharge", "Credit Card Bill", "Television", "Broadband", "Data Top-up"],
    children: sc(["Mobile Recharge", "Credit Card Bill", "Television", "Broadband", "Data Top-up"]),
  },
  {
    id: "fashion_style",
    name: "Fashion & Style",
    icon: "fluent-emoji:shopping-bags",
    color: "#ec4899",
    classification: "want",
    type: "expense",
    sortOrder: 12,
    subcategories: ["Outerwears", "Tops", "Bottoms", "Inner Wear", "Footwear", "Accessories", "Bags", "Jewellery", "Watches", "Tailoring/Alterations"],
    children: sc(["Outerwears", "Tops", "Bottoms", "Inner Wear", "Footwear", "Accessories", "Bags", "Jewellery", "Watches", "Tailoring/Alterations"]),
  },
  {
    id: "personal_care",
    name: "Personal Care",
    icon: "fluent-emoji:toothbrush",
    color: "#f43f5e",
    classification: "need",
    type: "expense",
    sortOrder: 13,
    subcategories: ["Skincare", "Haircare", "Oral Care", "Hygiene/Sanitary", "Cosmetics/Makeup", "Salon/Haircut", "Spa/Massage"],
    children: sc(["Skincare", "Haircare", "Oral Care", "Hygiene/Sanitary", "Cosmetics/Makeup", "Salon/Haircut", "Spa/Massage"]),
  },
  {
    id: "electronics",
    name: "Electronics & Gadgets",
    icon: "fluent-emoji:laptop",
    color: "#475569",
    classification: "want",
    type: "expense",
    sortOrder: 14,
    subcategories: ["Laptop", "Phone", "Tablet", "Smartwatch", "Headphones", "Adaptors/Cables", "Software/Apps"],
    children: sc(["Laptop", "Phone", "Tablet", "Smartwatch", "Headphones", "Adaptors/Cables", "Software/Apps"]),
  },
  {
    id: "stationery",
    name: "Stationery & Work",
    icon: "fluent-emoji:pencil",
    color: "#65a30d",
    classification: "want",
    type: "expense",
    sortOrder: 15,
    subcategories: ["Pens/Pencils", "Notebooks", "Art Supplies", "Photocopy/Print"],
    children: sc(["Pens/Pencils", "Notebooks", "Art Supplies", "Photocopy/Print"]),
  },
  {
    id: "pets_plants",
    name: "Pets & Plants",
    icon: "fluent-emoji:herb",
    color: "#16a34a",
    classification: "discretionary",
    type: "expense",
    sortOrder: 16,
    subcategories: ["Pet Food", "Vet", "Pet Toys", "Saplings/Seeds", "Fertilizers", "Gardening Tools"],
    children: sc(["Pet Food", "Vet", "Pet Toys", "Saplings/Seeds", "Fertilizers", "Gardening Tools"]),
  },
  {
    id: "health",
    name: "Health & Wellness",
    icon: "fluent-emoji:hospital",
    color: "#ef4444",
    classification: "need",
    type: "expense",
    sortOrder: 17,
    subcategories: ["Medicine", "Doctor Consultation", "Hospitalization", "Lab Tests", "Dental", "Eye Care", "Gym/Fitness", "Yoga", "Pharmacy"],
    children: sc(["Medicine", "Doctor Consultation", "Hospitalization", "Lab Tests", "Dental", "Eye Care", "Gym/Fitness", "Yoga", "Pharmacy"]),
  },
  {
    id: "education",
    name: "Education & Learning",
    icon: "fluent-emoji:graduation-cap",
    color: "#6d28d9",
    classification: "need",
    type: "expense",
    sortOrder: 18,
    subcategories: ["School Fees", "College Fees", "Coaching/Tuition", "Online Courses", "Workshops", "Books", "Exam Fees"],
    children: sc(["School Fees", "College Fees", "Coaching/Tuition", "Online Courses", "Workshops", "Books", "Exam Fees"]),
  },
  {
    id: "circle",
    name: "Circle",
    icon: "fluent-emoji:heart-suit",
    color: "#e11d48",
    classification: "discretionary",
    type: "expense",
    sortOrder: 19,
    subcategories: ["Family", "Parents", "Friends", "Relatives"],
    children: sc(["Family", "Parents", "Friends", "Relatives"]),
  },
  {
    id: "kids",
    name: "Kids",
    icon: "fluent-emoji:baby",
    color: "#06b6d4",
    classification: "need",
    type: "expense",
    sortOrder: 20,
    subcategories: ["Toys", "Diapers", "School Supplies", "Pocket Money", "Activities"],
    children: sc(["Toys", "Diapers", "School Supplies", "Pocket Money", "Activities"]),
  },
  {
    id: "gifts",
    name: "Gifts & Social",
    icon: "fluent-emoji:wrapped-gift",
    color: "#db2777",
    classification: "discretionary",
    type: "expense",
    sortOrder: 21,
    subcategories: ["Birthday Gifts", "Anniversary Gifts", "Wedding Gifts", "Charity", "Alms", "Religious/Pooja"],
    children: sc(["Birthday Gifts", "Anniversary Gifts", "Wedding Gifts", "Charity", "Alms", "Religious/Pooja"]),
  },
  {
    id: "holidays",
    name: "Holidays & Travel",
    icon: "fluent-emoji:airplane",
    color: "#0284c7",
    classification: "discretionary",
    type: "expense",
    sortOrder: 22,
    subcategories: ["Vacations", "Stay/Hotel", "Sightseeing", "Souvenirs"],
    children: sc(["Vacations", "Stay/Hotel", "Sightseeing", "Souvenirs"]),
  },
  {
    id: "investments",
    name: "Investments",
    icon: "fluent-emoji:chart-increasing",
    color: "#10b981",
    classification: "investment",
    type: "expense",
    sortOrder: 23,
    subcategories: ["Stocks", "Mutual Funds", "ETFs", "FD/RD", "Gold", "Real Estate", "Crypto"],
    children: sc(["Stocks", "Mutual Funds", "ETFs", "FD/RD", "Gold", "Real Estate", "Crypto"]),
  },
  {
    id: "insurance_taxes",
    name: "Insurance & Taxes",
    icon: "fluent-emoji:shield",
    color: "#0891b2",
    classification: "need",
    type: "expense",
    sortOrder: 24,
    subcategories: ["Health Insurance", "Life Insurance", "Vehicle Insurance", "Income Tax", "Property Tax"],
    children: sc(["Health Insurance", "Life Insurance", "Vehicle Insurance", "Income Tax", "Property Tax"]),
  },
  {
    id: "debt_finance",
    name: "Debt & Finance",
    icon: "fluent-emoji:credit-card",
    color: "#dc2626",
    classification: "need",
    type: "expense",
    sortOrder: 25,
    subcategories: ["Loan EMI", "Credit Card Payment", "Chit Funds", "Bank Charges"],
    children: sc(["Loan EMI", "Credit Card Payment", "Chit Funds", "Bank Charges"]),
  },
  {
    id: "misc_adjustments",
    name: "Misc & Adjustments",
    icon: "fluent-emoji:package",
    color: "#94a3b8",
    classification: "want",
    type: "expense",
    sortOrder: 99,
    subcategories: ["Refund", "Reimbursement", "Miscellaneous", "Cash Withdrawal"],
    children: sc(["Refund", "Reimbursement", "Miscellaneous", "Cash Withdrawal"]),
  },
];

// ---------------------------------------------------------------------------
// INCOME CATEGORIES
// ---------------------------------------------------------------------------
export const DEFAULT_INCOME_CATEGORIES: CategoryDef[] = [
  {
    id: "income_salary",
    name: "Salary",
    icon: "fluent-emoji:money-bag",
    color: "#22c55e",
    classification: "need",
    type: "income",
    sortOrder: 0,
    subcategories: ["Base Pay", "Bonus", "RSU/Stocks", "Arrears", "Variable Pay"],
    children: sc(["Base Pay", "Bonus", "RSU/Stocks", "Arrears", "Variable Pay"]),
  },
  {
    id: "income_gift",
    name: "Gift",
    icon: "fluent-emoji:wrapped-gift",
    color: "#f59e0b",
    classification: "discretionary",
    type: "income",
    sortOrder: 1,
    subcategories: ["Cashback", "Discount"],
    children: sc(["Cashback", "Discount"]),
  },
  {
    id: "income_investment",
    name: "Investment",
    icon: "fluent-emoji:chart-increasing",
    color: "#10b981",
    classification: "investment",
    type: "income",
    sortOrder: 2,
    subcategories: ["Interest", "Dividends", "Capital Gains", "Mutual Fund Redemption", "Rental Income"],
    children: sc(["Interest", "Dividends", "Capital Gains", "Mutual Fund Redemption", "Rental Income"]),
  },
];

export const DEFAULT_ALL_CATEGORIES: CategoryDef[] = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
];

export const CATEGORY_ICON_MAP: Record<string, string> = Object.fromEntries(
  DEFAULT_ALL_CATEGORIES.map(c => [c.id, c.icon])
);

export const CATEGORY_CLASSIFICATION: Record<string, NeedWantType> = Object.fromEntries(
  DEFAULT_ALL_CATEGORIES.map(c => [c.name, c.classification])
);

export const CLASSIFICATION_COLORS: Record<NeedWantType, { bg: string; text: string; border: string }> = {
  need: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
  want: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
  investment: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
  discretionary: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" },
};

export const SUBCATEGORY_MAP: Record<string, string[]> = Object.fromEntries(
  DEFAULT_ALL_CATEGORIES.map(c => [c.id, c.subcategories])
);

export const getCategoryIcon = (catId: string) => CATEGORY_ICON_MAP[catId] || "📦";
