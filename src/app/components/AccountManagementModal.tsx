import React, { useState, useEffect } from "react";
import { X, Building2, CreditCard, Wallet, Smartphone, Banknote, TrendingUp, Utensils, PiggyBank, HandCoins, Check, Trash2 } from "lucide-react";
import { useFinance, Account } from "../context/FinanceContext";
import { cn } from "../utils";
import { toast } from "sonner";

const ACCOUNT_TYPES = [
  { id: "bank", label: "Bank", icon: Building2 },
  { id: "credit_card", label: "Card", icon: CreditCard },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "UPI", label: "UPI", icon: Smartphone },
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "loan", label: "Loan", icon: HandCoins },
  { id: "investment", label: "Invest", icon: TrendingUp },
  { id: "pf", label: "PF", icon: PiggyBank },
  { id: "meal_card", label: "Meal", icon: Utensils },
];

const BRAND_MAP: Record<string, string> = {
  hdfc: "hdfcbank.com",
  icici: "icicibank.com",
  sbi: "sbi.co.in",
  axis: "axisbank.com",
  kotak: "kotak.com",
  amazon: "amazon.in",
  flipkart: "flipkart.com",
  paytm: "paytm.com",
  phonepe: "phonepe.com",
  google: "google.com",
  amex: "americanexpress.com",
  hsbc: "hsbc.co.in",
  sc: "sc.com",
  citi: "citibank.com",
  yes: "yesbank.in",
  indusind: "indusind.com",
  idfc: "idfcfirstbank.com",
  canara: "canarabank.com",
  bob: "bankofbaroda.in",
  pnb: "pnbindia.in",
  "indian bank": "indianbank.in",
  "union bank": "unionbankofindia.co.in",
  "central bank": "centralbankofindia.co.in",
  idbi: "idbibank.in",
  kvb: "kvb.co.in",
  "karur vysya": "kvb.co.in",
  "south indian": "southindianbank.com",
  federal: "federalbank.co.in",
  dbs: "dbs.com",
  equitas: "equitasbank.com",
  au: "aubank.in",
  rbl: "rblbank.com",
  slice: "sliceit.com",
  onecard: "getonecard.com",
  jupiter: "jupiter.money",
  fi: "fi.money",
  apple: "apple.com",
  netflix: "netflix.com",
  swiggy: "swiggy.com",
  zomato: "zomato.com",
  uber: "uber.com",
  ola: "olacabs.com",
};

export const AccountManagementModal = ({ accId, onClose }: { accId?: string | null; onClose: () => void }) => {
  const { accounts, addAccount, updateAccount, deleteAccount, profile } = useFinance();
  const isEdit = !!accId;
  const existingAcc = accounts.find(a => a.id === accId);

  const [name, setName] = useState("");
  const [type, setType] = useState<Account["type"]>("bank");
  const [balance, setBalance] = useState("");
  const [lastFour, setLastFour] = useState("");

  // Type-specific fields
  const [fullAccountNumber, setFullAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [tenureMonths, setTenureMonths] = useState("");
  const [emiAmount, setEmiAmount] = useState("");
  const [emiDate, setEmiDate] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [isManualLogo, setIsManualLogo] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  
  // Type-specific fields
  const [cardNumber, setCardNumber] = useState("");
  const [upiId, setUpiId] = useState("");
  const [walletMobile, setWalletMobile] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  useEffect(() => {
    if (existingAcc) {
      setName(existingAcc.name);
      setType(existingAcc.type);
      setBalance(existingAcc.balance.toString());
      setLastFour(existingAcc.lastFour || "");
      setFullAccountNumber(existingAcc.fullAccountNumber || "");
      setIfsc(existingAcc.ifsc || "");
      setCreditLimit(existingAcc.creditLimit?.toString() || "");
      setDueDate(existingAcc.dueDate || "");
      setInterestRate(existingAcc.interestRate?.toString() || "");
      setTenureMonths(existingAcc.tenureMonths?.toString() || "");
      setEmiAmount(existingAcc.emiAmount?.toString() || "");
      setEmiDate(existingAcc.emiDate?.toString() || "");
      setMonthlyContribution(existingAcc.monthlyContribution?.toString() || "");
      setEmployeeId(existingAcc.employeeId || "");
      setLogoUrl(existingAcc.logoUrl || "");
      setCardNumber(existingAcc.lastFour || "");
      setUpiId(existingAcc.upiId || "");
      setWalletMobile(existingAcc.walletMobile || "");
      setExpiryDate(existingAcc.expiryDate || "");
    }
  }, [existingAcc]);

  // Auto-fetch logo based on name
  useEffect(() => {
    if (isManualLogo) return; // Don't overwrite if user manually typed a URL

    const timer = setTimeout(() => {
      const searchName = name.toLowerCase();
      if (!searchName) return;

      const brandKey = Object.keys(BRAND_MAP).find(key => searchName.includes(key));
      if (brandKey) {
        const domain = BRAND_MAP[brandKey];
        const token = profile.logoDevToken ? `&token=${profile.logoDevToken.trim()}` : '';
        setLogoUrl(`https://img.logo.dev/${domain}?size=128${token}`);
        setLogoError(false);
      } else if (searchName.length > 3 && !searchName.includes(' ')) {
        // Try guessing the domain if it's a single word
        const token = profile.logoDevToken ? `&token=${profile.logoDevToken.trim()}` : '';
        setLogoUrl(`https://img.logo.dev/${searchName}.com?size=128${token}`);
        setLogoError(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [name, isEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || balance === "") {
      toast.error("Please fill required fields");
      return;
    }

    const data: any = {
      name,
      type,
      balance: Number(balance),
      currency: "INR",
      lastFour: type === 'credit_card' ? cardNumber.slice(-4) : (type === 'bank' ? lastFour : ''),
      fullAccountNumber,
      ifsc,
      creditLimit: creditLimit ? parseFloat(creditLimit) : undefined,
      dueDate,
      expiryDate,
      upiId,
      walletMobile,
      interestRate: interestRate ? parseFloat(interestRate) : undefined,
      tenureMonths: tenureMonths ? Number(tenureMonths) : undefined,
      emiAmount: emiAmount ? Number(emiAmount) : undefined,
      emiDate: emiDate ? Number(emiDate) : undefined,
      monthlyContribution: monthlyContribution ? Number(monthlyContribution) : undefined,
      employeeId: employeeId || undefined,
      logoUrl: logoUrl || undefined,
    };

    if (isEdit && accId) {
      updateAccount(accId, data);
      toast.success("Account updated");
    } else {
      addAccount(data);
      toast.success("Account added");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{isEdit ? "Edit Account" : "Add New Account"}</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Configure your financial instrument</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm"><X className="w-5 h-5 text-slate-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 3x3 Grid for Type Selection */}
          <div className="grid grid-cols-3 gap-3">
            {ACCOUNT_TYPES.map(at => {
              const Icon = at.icon;
              const isActive = type === at.id;
              return (
                <button
                  key={at.id} type="button"
                  onClick={() => setType(at.id as any)}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2",
                    isActive ? "bg-indigo-600 border-indigo-600 text-white shadow-lg scale-[1.02]" : "bg-white border-slate-50 text-slate-400 hover:border-indigo-100"
                  )}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{at.label}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Account / Display Name <span className="text-red-400">*</span></label>
            <div className="flex gap-3">
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. HDFC Salary, ICICI Card"
                className="flex-1 text-sm font-semibold bg-slate-50 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none shadow-inner"
              />
              <button 
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="w-11 h-11 rounded-xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center overflow-hidden shrink-0 hover:border-indigo-400 transition-colors shadow-sm"
                title="Click to edit logo URL"
              >
                {logoUrl && !logoError ? (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="w-full h-full object-contain"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <Building2 className="w-5 h-5 text-slate-300" />
                )}
              </button>
            </div>

            {showUrlInput && (
              <div className="animate-in slide-in-from-top-2 duration-200">
                <label className="block text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1.5">Branding / Logo URL</label>
                <input
                  type="text" value={logoUrl}
                  onChange={e => {
                    setLogoUrl(e.target.value);
                    setIsManualLogo(true);
                    setLogoError(false);
                  }}
                  placeholder="e.g. img.logo.dev/brand.com"
                  className="w-full text-sm font-semibold bg-indigo-50/50 px-4 py-3 rounded-xl border border-indigo-100 focus:ring-2 focus:ring-indigo-600 outline-none"
                />
                <p className="text-[9px] text-indigo-400 mt-1 font-medium italic">* Click the bank icon again to hide this field.</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {type === 'credit_card' ? 'Outstanding' : type === 'loan' ? 'Debt Amount' : 'Current Balance'}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number" value={balance} onChange={e => setBalance(e.target.value)}
                    placeholder="0.00"
                    className="w-full text-sm font-bold bg-slate-50 pl-8 pr-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none shadow-inner"
                  />
                </div>
              </div>
              
              {/* Type-Specific Identifier Field */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {type === 'credit_card' ? 'Card Number' : 
                   type === 'bank' ? 'Last 4 Digits' :
                   type === 'wallet' ? 'Mobile Number' :
                   type === 'UPI' ? 'UPI ID' : 'Identifier'}
                </label>
                <input
                  type="text" 
                  value={type === 'credit_card' ? cardNumber : 
                         type === 'wallet' ? walletMobile :
                         type === 'UPI' ? upiId : lastFour} 
                  onChange={e => {
                    const val = e.target.value;
                    if (type === 'credit_card') setCardNumber(val);
                    else if (type === 'wallet') setWalletMobile(val);
                    else if (type === 'UPI') setUpiId(val);
                    else setLastFour(val);
                  }}
                  placeholder={type === 'credit_card' ? '4xxx xxxx xxxx xxxx' : 'Optional'}
                  maxLength={type === 'credit_card' ? 19 : 20}
                  className="w-full text-sm font-semibold bg-slate-50 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none shadow-inner"
                />
              </div>
            </div>

            {/* Section: Shareable Bank Details */}
            {type === 'bank' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-50 animate-in slide-in-from-top-2">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1.5">Full Account Number</label>
                  <input
                    type="text" value={fullAccountNumber} onChange={e => setFullAccountNumber(e.target.value)}
                    placeholder="For easy copying/sharing"
                    className="w-full text-sm font-semibold bg-indigo-50/30 px-4 py-3 rounded-xl border border-indigo-100/50 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1.5">IFSC Code</label>
                  <input
                    type="text" value={ifsc} onChange={e => setIfsc(e.target.value)}
                    placeholder="HDFC0001234"
                    className="w-full text-sm font-semibold bg-indigo-50/30 px-4 py-3 rounded-xl border border-indigo-100/50 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Section: Credit Card Details */}
            {type === 'credit_card' && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50 animate-in slide-in-from-top-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Credit Limit</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-slate-400 font-bold text-sm">₹</span>
                    <input
                      type="number" value={creditLimit} onChange={e => setCreditLimit(e.target.value)}
                      placeholder="e.g. 100000"
                      className="w-full text-sm font-semibold bg-slate-50 pl-8 pr-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none shadow-inner"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Expiry Date</label>
                  <input
                    type="text" value={expiryDate} onChange={e => setExpiryDate(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full text-sm font-semibold bg-slate-50 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none shadow-inner"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Bill Due Date</label>
                  <input
                    type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                    className="w-full text-sm font-semibold bg-slate-50 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none shadow-inner"
                  />
                </div>
              </div>
            )}

            {/* Section: Loan Details */}
            {type === 'loan' && (
              <div className="space-y-4 pt-2 border-t border-slate-50 animate-in slide-in-from-top-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Interest Rate (%)</label>
                    <input
                      type="number" step="0.1" value={interestRate} onChange={e => setInterestRate(e.target.value)}
                      placeholder="e.g. 8.5"
                      className="w-full text-sm font-bold bg-slate-50 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tenure (Months)</label>
                    <input
                      type="number" value={tenureMonths} onChange={e => setTenureMonths(e.target.value)}
                      placeholder="e.g. 60"
                      className="w-full text-sm font-bold bg-slate-50 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none shadow-inner"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">EMI Amount</label>
                    <input
                      type="number" value={emiAmount} onChange={e => setEmiAmount(e.target.value)}
                      placeholder="e.g. 15000"
                      className="w-full text-sm font-bold bg-slate-50 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">EMI Day (1-31)</label>
                    <input
                      type="number" min="1" max="31" value={emiDate} onChange={e => setEmiDate(e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full text-sm font-bold bg-slate-50 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none shadow-inner"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section: PF Details */}
            {type === 'pf' && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50 animate-in slide-in-from-top-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Monthly Contribution</label>
                  <input
                    type="number" value={monthlyContribution} onChange={e => setMonthlyContribution(e.target.value)}
                    placeholder="e.g. 1800"
                    className="w-full text-sm font-bold bg-slate-50 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">UAN / Emp ID</label>
                  <input
                    type="text" value={employeeId} onChange={e => setEmployeeId(e.target.value)}
                    placeholder="Optional"
                    className="w-full text-sm font-semibold bg-slate-50 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-indigo-600 outline-none shadow-inner"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-50 sticky bottom-0 bg-white pb-2">
            {isEdit && (
              <button
                type="button"
                onClick={() => { if (confirm("Delete account and all its transactions?")) { deleteAccount(accId!); onClose(); } }}
                className="p-3.5 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors shadow-sm"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              type="submit"
              className="flex-1 bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
            >
              <Check className="w-5 h-5" /> {isEdit ? "Update Account" : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
