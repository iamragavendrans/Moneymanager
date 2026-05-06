export type NeedWantType = "need" | "want" | "investment" | "discretionary";

export interface CategoryDef {
  name: string;
  subcategories: string[];
  classification: NeedWantType;
}

export const EXPENSE_CATEGORIES: CategoryDef[] = [
  { name: "Food", classification: "need", subcategories: ["Groceries", "Dining Out", "Street Food", "Zomato/Swiggy", "Coffee", "Snacks", "Alcohol", "Bakery"] },
  { name: "Transportation", classification: "need", subcategories: ["Cab/Ride (Ola, Uber)", "Auto", "Bus/Metro", "Train/Railway", "Fuel", "Parking", "Toll"] },
  { name: "Vehicle", classification: "need", subcategories: ["Service/Repairs", "Insurance", "Accessories", "Cleaning", "Tyre/Parts"] },
  { name: "Utilities", classification: "need", subcategories: ["Electricity", "Water", "Gas (LPG/PNG)", "Internet", "Mobile Recharge", "DTH/Cable"] },
  { name: "Housing", classification: "need", subcategories: ["Rent", "Society Maintenance", "Furniture", "Domestic Help", "Home Essentials", "Repairs", "Security Deposit"] },
  { name: "Health", classification: "need", subcategories: ["Medicine", "Doctor/Consultation", "Hospital", "Gym", "Wellness/Spa", "Pharmacy", "Dental"] },
  { name: "Education", classification: "need", subcategories: ["School/College Fees", "Books", "Coaching", "Online Course", "Stationery", "Exam Fees"] },
  { name: "Insurance", classification: "need", subcategories: ["Health Insurance", "Life Insurance", "Vehicle Insurance", "Home Insurance", "Term Plan"] },
  { name: "Taxes", classification: "need", subcategories: ["Income Tax", "Property Tax", "GST", "TDS", "Professional Tax"] },
  { name: "Debt Repayment", classification: "need", subcategories: ["Home Loan EMI", "Vehicle EMI", "Personal Loan EMI", "Credit Card Bill", "Education Loan"] },
  { name: "Fashion", classification: "want", subcategories: ["Clothing", "Footwear", "Jewellery", "Bags", "Accessories", "Watch"] },
  { name: "Shopping", classification: "want", subcategories: ["Electronics", "Home Decor", "Personal Care", "Stationery", "Sports Equipment"] },
  { name: "Entertainment", classification: "want", subcategories: ["Movies/OTT", "Gaming", "Live Events/Concerts", "Sports", "Theme Parks"] },
  { name: "Day Out", classification: "want", subcategories: ["Restaurant", "Cafe", "Activities", "Pub/Bar"] },
  { name: "Self Development", classification: "want", subcategories: ["Workshop/Seminar", "Certification", "Books", "Mentorship", "Retreat"] },
  { name: "Financial Instruments", classification: "investment", subcategories: ["Stocks", "Mutual Funds", "Gold/Silver", "Crypto", "FD/RD", "PPF/EPF", "NPS", "Bonds"] },
  { name: "Holidays", classification: "discretionary", subcategories: ["Flights", "Hotels", "Sightseeing", "Road Trip", "Visa/Travel Docs", "Travel Insurance"] },
  { name: "Gifts", classification: "discretionary", subcategories: ["Birthday Gift", "Wedding Gift", "Festival Gift", "Baby Shower", "Donations/Charity"] },
  { name: "Pets & Plants", classification: "discretionary", subcategories: ["Pet Food", "Vet/Grooming", "Accessories", "Nursery/Plants"] },
  { name: "Circle", classification: "discretionary", subcategories: ["Parties/Celebrations", "Going Out", "Charity/NGO", "Religious/Pooja"] },
  { name: "Fees", classification: "need", subcategories: ["Bank Charges", "Platform Fees", "Processing Fee", "Annual Fee"] },
  { name: "Others", classification: "want", subcategories: ["Refund", "Reimbursement", "Miscellaneous"] },
];

export const INCOME_CATEGORIES: CategoryDef[] = [
  { name: "Salary", classification: "need", subcategories: ["Base Pay", "Bonus", "RSU/Stocks", "Arrears", "Variable Pay"] },
  { name: "Freelance", classification: "need", subcategories: ["Design", "Development", "Consulting", "Writing", "Teaching", "Photography"] },
  { name: "Investment Returns", classification: "investment", subcategories: ["Dividends", "Interest", "Capital Gains", "Mutual Fund Redemption", "Rental Income"] },
  { name: "Business", classification: "need", subcategories: ["Sales", "Services", "Commission", "Revenue"] },
  { name: "Gift Received", classification: "discretionary", subcategories: ["Birthday Gift", "Wedding Gift", "Festival Gift", "Cashback"] },
  { name: "Others", classification: "want", subcategories: ["Refund", "Reimbursement", "Inheritance", "Lottery"] },
];

export const CATEGORY_CLASSIFICATION: Record<string, NeedWantType> = Object.fromEntries([
  ...EXPENSE_CATEGORIES.map(c => [c.name, c.classification] as [string, NeedWantType]),
  ...INCOME_CATEGORIES.map(c => [c.name, c.classification] as [string, NeedWantType]),
]);

export const SUBCATEGORY_MAP: Record<string, string[]> = Object.fromEntries([
  ...EXPENSE_CATEGORIES.map(c => [c.name, c.subcategories]),
  ...INCOME_CATEGORIES.map(c => [c.name, c.subcategories]),
]);

export const EXPENSE_CATEGORY_NAMES = EXPENSE_CATEGORIES.map(c => c.name);
export const INCOME_CATEGORY_NAMES = INCOME_CATEGORIES.map(c => c.name);
