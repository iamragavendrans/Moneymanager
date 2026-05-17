import React, { useState, useEffect } from "react";
import { X, Building2, CreditCard, Wallet, Smartphone, Banknote, TrendingUp, Utensils, PiggyBank, HandCoins, Check, Trash2, ArrowLeft, Gem, CalendarDays, CheckCircle2 } from "lucide-react";
import { format, addMonths } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useFinance, Account } from "../context/FinanceContext";
import { cn, getGridCols, formatINR } from "../utils";
import { searchBrandfetchIcon } from "../utils/logoFetcher";
import { toast } from "sonner";

const ACCOUNT_TYPES = [
  { id: "bank", label: "Bank", icon: Building2 },
  { id: "credit_card", label: "Card", icon: CreditCard },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "debit", label: "Debit", icon: CreditCard },
  { id: "loan", label: "Loan", icon: HandCoins },
  { id: "chit", label: "Chit", icon: PiggyBank },
  { id: "pf", label: "PF", icon: PiggyBank },
  { id: "asset", label: "Assets", icon: Gem },
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
  const [maturityAmount, setMaturityAmount] = useState("");
  const [maturityDate, setMaturityDate] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [paidMonths, setPaidMonths] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [paymentSchedule, setPaymentSchedule] = useState<{ amount: number; paid: boolean; month?: string }[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isManualLogo, setIsManualLogo] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSearchingLogo, setIsSearchingLogo] = useState(false);
  
  // Type-specific fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardNetwork, setCardNetwork] = useState("");
  const [cardVariant, setCardVariant] = useState("");
  const [issuerBank, setIssuerBank] = useState("");
  const [upiId, setUpiId] = useState("");
  const [walletMobile, setWalletMobile] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [subType, setSubType] = useState("Savings");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [branch, setBranch] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [employerLocation, setEmployerLocation] = useState("");
  const [step, setStep] = useState<"type" | "fields">(isEdit ? "fields" : "type");
  const [showAdvanced, setShowAdvanced] = useState(isEdit);

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
      setCardNetwork(existingAcc.cardNetwork || "");
      setCardVariant(existingAcc.cardVariant || "");
      setIssuerBank(existingAcc.issuerBank || "");
      setUpiId(existingAcc.upiId || "");
      setWalletMobile(existingAcc.walletMobile || "");
      setExpiryDate(existingAcc.expiryDate || "");
      setSubType(existingAcc.subType || "Savings");
      setAccountHolderName(existingAcc.accountHolderName || "");
      setBranch(existingAcc.branch || "");
      setEmployerName(existingAcc.employerName || "");
      setEmployerLocation(existingAcc.employerLocation || "");
      setMaturityAmount(existingAcc.maturityAmount?.toString() || "");
      setMaturityAmount(existingAcc.maturityAmount?.toString() || "");
      setMaturityDate(existingAcc.maturityDate || "");
      setPaidMonths(existingAcc.paidMonths?.toString() || "");
      setStartDate(existingAcc.startDate || format(new Date(), 'yyyy-MM-dd'));
      setPaymentSchedule(existingAcc.paymentSchedule || []);
    }
  }, [existingAcc]);

  // Autofill employer from profile if Salary account
  useEffect(() => {
    if (subType === 'Salary' && !employerName && !isEdit) {
      setEmployerName(profile.employerName || "");
    }
  }, [subType, employerName, isEdit, profile]);

  // Auto-fetch Card details from BIN
  useEffect(() => {
    const fetchBIN = async () => {
      if (type !== 'credit_card' && type !== 'debit') return;
      const bin = fullAccountNumber.replace(/\D/g, '');
      if (bin.length < 6) return;
      
      // Prevent hitting the API if the card number hasn't been modified from its existing state
      if (isEdit && existingAcc?.fullAccountNumber && existingAcc.fullAccountNumber === fullAccountNumber) return;

      const getScheme = (num: string) => {
        if (num.startsWith('4')) return 'Visa';
        if (/^5[1-5]/.test(num)) return 'Mastercard';
        if (/^3[47]/.test(num)) return 'Amex';
        if (/^6/.test(num)) return 'RuPay/Discover';
        return '';
      };

      // Optimistically set scheme
      const scheme = getScheme(bin);
      if (scheme && !cardNetwork) setCardNetwork(scheme);

      try {
        const res = await fetch(`https://data.handyapi.com/bin/${bin.slice(0, 8)}`, {
          headers: {
            'Authorization': 'Bearer PUB-0YS3537SymVcQGtk9uUv8LZ2bq'
          }
        });
        if (res.ok) {
          const data = await res.json();
          const foundScheme = data.Scheme || data.scheme;
          const foundType = data.Type || data.type;
          const foundIssuer = data.Issuer || data.bank?.name;
          const foundTier = data.CardTier || data.brand || data.tier;

          if (foundScheme) {
            const s = foundScheme.toUpperCase();
            setCardNetwork(s);
          }
          if (foundType) {
            const isDebit = foundType.toUpperCase() === 'DEBIT';
            setType(isDebit ? 'debit' : 'credit_card');
            setSubType(isDebit ? 'Debit' : 'Credit');
          }
          if (foundIssuer) {
             setIssuerBank(foundIssuer);
             const token = profile.logoDevToken ? `&token=${profile.logoDevToken.trim()}` : '';
             const sanitizedIssuer = foundIssuer.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
             setLogoUrl(`https://img.logo.dev/${sanitizedIssuer}.com?size=128${token}`);
             setIsManualLogo(true);
          }
          if (foundTier) {
             setCardVariant(foundTier);
          } else if (foundScheme) {
             setCardVariant(foundScheme);
          }
          toast.success(`Identified: ${foundIssuer || ''} ${foundScheme || scheme} ${foundTier || ''}`.trim());
        }
      } catch (err) {
        // Fallback already handled
      }
    };
    
    const timer = setTimeout(fetchBIN, 800);
    return () => clearTimeout(timer);
  }, [fullAccountNumber, type, name]);

  // Auto-fetch Bank details from IFSC
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!name || isManualLogo) return;

      const searchName = name.toLowerCase().trim();
      const keywords = type === 'credit_card' ? ' card' : type === 'wallet' ? ' wallet' : '';
      
      // Try to find in BRAND_MAP
      const brandKey = Object.keys(BRAND_MAP).find(key => searchName.includes(key));
      if (brandKey) {
        const domain = BRAND_MAP[brandKey];
        const token = profile.logoDevToken ? `&token=${profile.logoDevToken.trim()}` : '';
        setLogoUrl(`https://img.logo.dev/${domain}?size=128${token}`);
        setLogoError(false);
      } else if (searchName.length > 2) {
        // Simple heuristic: try bankname.com or bankname.in
        const token = profile.logoDevToken ? `&token=${profile.logoDevToken.trim()}` : '';
        setLogoUrl(`https://img.logo.dev/${searchName.replace(/\s+/g, '')}.com?size=128${token}`);
        setLogoError(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [name, isEdit]);

  // Auto-fetch Bank details from IFSC
  useEffect(() => {
    const fetchIFSC = async () => {
      const code = ifsc.trim().toUpperCase();
      
      // Prevent hitting the API if the IFSC hasn't been modified from its existing state
      if (isEdit && existingAcc?.ifsc && existingAcc.ifsc === code) return;

      if (code.length === 11) {
        try {
          const res = await fetch(`https://ifsc.razorpay.com/${code}`);
          if (res.ok) {
            const data = await res.json();
            if (data.BRANCH) setBranch(data.BRANCH);
            if (data.BANK) setName(data.BANK);
            toast.success(`Found: ${data.BANK}, ${data.BRANCH}`);
          }
        } catch (err) {
          console.error("IFSC Fetch error:", err);
        }
      }
    };
    fetchIFSC();
  }, [ifsc]);

  // Auto-calc for Chit
  useEffect(() => {
    if (type === 'chit') {
      const mat = Number(maturityAmount);
      const tenure = Number(tenureMonths);
      if (mat && tenure && !emiAmount) {
        setEmiAmount((mat / tenure).toFixed(0));
      }
    }
  }, [maturityAmount, tenureMonths, type]);

  const calculateEMI = () => {
    const p = Math.abs(Number(balance));
    const r = Number(interestRate) / (12 * 100);
    const n = Number(tenureMonths);
    if (p && r && n) {
      const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      setEmiAmount(emi.toFixed(0));
      toast.success(`Calculated EMI: ₹${emi.toFixed(0)}`);
    } else {
      toast.error("Please enter Balance (Principal), Interest Rate, and Tenure");
    }
  };

  const calculateChitAverage = () => {
    const total = Number(maturityAmount);
    const n = Number(tenureMonths);
    if (total && n) {
      const avg = total / n;
      setEmiAmount(avg.toFixed(0));
      toast.success(`Average Contribution: ₹${avg.toFixed(0)}`);
    } else {
      toast.error("Please enter Maturity Amount and Tenure");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error(type === 'credit_card' || type === 'debit' ? "Card Name is mandatory" : "Account Name is mandatory");
      return;
    }

    const finalBalance = balance === "" ? 0 : Number(balance);

    const finalPaidMonths = paymentSchedule.length > 0 
      ? paymentSchedule.filter(s => s.paid).length 
      : Number(paidMonths) || 0;

    const data: any = {
      name,
      type,
      subType,
      balance: finalBalance,
      currency: "INR",
      lastFour: (type === 'credit_card' || type === 'debit' || type === 'bank') ? lastFour : '',
      fullAccountNumber,
      accountHolderName,
      ifsc,
      branch,
      employerName: subType === 'Salary' ? employerName : undefined,
      employerLocation: subType === 'Salary' ? employerLocation : undefined,
      cardNetwork,
      cardVariant,
      issuerBank,
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
      maturityAmount: maturityAmount ? Number(maturityAmount) : undefined,
      maturityDate: maturityDate || undefined,
      paidMonths: finalPaidMonths,
      startDate: startDate || undefined,
      paymentSchedule: paymentSchedule.length > 0 ? paymentSchedule : Array.from({ length: Number(tenureMonths) || 0 }).map((_, i) => ({
        amount: Number(emiAmount) || 0,
        paid: i < finalPaidMonths
      })),
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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-4">
            {step === "fields" && !isEdit && (
              <button 
                onClick={() => setStep("type")}
                className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm text-slate-400 hover:text-indigo-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {isEdit 
                  ? (() => {
                      if (type === 'credit_card' || type === 'debit') return "Edit Card Settings";
                      if (type === 'wallet') return "Edit Wallet";
                      if (type === 'investment') return "Edit Investment";
                      if (type === 'chit') return "Edit Chit Fund";
                      return "Edit Account Settings";
                    })()
                  : (step === "type" ? "Add New Account" : (type === 'credit_card' || type === 'debit' ? "Add New Card" : `Add New ${type.replace('_', ' ')}`))}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {step === "type" ? "Select account category" : (type === 'credit_card' || type === 'debit' ? "Configure your card details" : "Configure your financial instrument")}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm"><X className="w-5 h-5 text-slate-400" /></button>
        </div>

        <div className="p-6 overflow-y-auto overflow-x-hidden flex-1 relative">
          <AnimatePresence mode="wait">
            {step === "type" ? (
              <motion.div
                key="type-selection"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className={cn("grid gap-3", getGridCols(ACCOUNT_TYPES.length))}>
                  {ACCOUNT_TYPES.map(at => {
                    const Icon = at.icon;
                    const isActive = type === at.id;
                    return (
                      <button
                        key={at.id} type="button"
                        onClick={() => {
                          setType(at.id as any);
                          if (at.id === 'credit_card') setSubType('Credit');
                          else if (at.id === 'debit') setSubType('Debit');
                          else if (at.id === 'bank') setSubType('Savings');
                          setStep("fields");
                        }}
                        className={cn(
                          "flex flex-col items-center justify-center p-5 rounded-3xl border-2 transition-all gap-3 h-32 group",
                          isActive 
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100" 
                            : "bg-white border-slate-100 text-slate-400 hover:border-indigo-200 hover:bg-slate-50/50"
                        )}
                      >
                        <div className={cn(
                          "p-3 rounded-2xl transition-colors",
                          isActive ? "bg-white/20" : "bg-slate-50 group-hover:bg-indigo-50"
                        )}>
                          <Icon className={cn("w-6 h-6", isActive ? "text-white" : "text-slate-500 group-hover:text-indigo-600")} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">{at.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="fields-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Type Breadcrumb */}
                <div className="flex items-center gap-3 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    {(() => {
                      const Icon = ACCOUNT_TYPES.find(a => a.id === type)?.icon || Building2;
                      return <Icon className="w-5 h-5 text-indigo-600" />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{type === 'credit_card' || type === 'debit' ? 'Card Type' : 'Account Type'}</p>
                    <p className="text-sm font-bold text-slate-800 capitalize">{type.replace('_', ' ')}</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setStep("type")}
                    className="px-3 py-1.5 text-[10px] font-bold text-indigo-600 bg-white rounded-lg shadow-sm hover:bg-indigo-50 transition-colors uppercase tracking-wider"
                  >
                    Change
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-5">
                    {/* ROW 1: Name & Logo */}
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
                            {type === 'credit_card' || type === 'debit' ? 'Card Name' : 'Account Name'} <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text" value={name} onChange={e => setName(e.target.value)}
                            placeholder={type === 'credit_card' || type === 'debit' ? "e.g. ICICI Amazon Pay CC" : "e.g. HDFC Salary"}
                            className="w-full text-sm font-semibold bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                          />
                        </div>
                        <button 
                          type="button"
                          onClick={() => setShowUrlInput(!showUrlInput)}
                          className={cn(
                            "w-12 h-12 mb-0.5 rounded-2xl border-2 flex items-center justify-center overflow-hidden shrink-0 transition-all shadow-sm",
                            showUrlInput ? "border-indigo-600 ring-4 ring-indigo-50" : "bg-slate-50 border-slate-100 hover:border-indigo-400"
                          )}
                          title="Search / Change Logo"
                        >
                          {logoUrl && !logoError ? (
                            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" onError={() => setLogoError(true)} />
                          ) : (
                            <Building2 className={cn("w-5 h-5", showUrlInput ? "text-indigo-600" : "text-slate-300")} />
                          )}
                        </button>
                      </div>

                      {showUrlInput && (
                        <div className="animate-in slide-in-from-top-2 duration-200 space-y-3 p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/50">
                          <div>
                            <label className="block text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1.5 px-1">Bank Branding / Logo URL</label>
                            <input
                              type="text" value={logoUrl}
                              onChange={e => { setLogoUrl(e.target.value); setIsManualLogo(true); setLogoError(false); }}
                              placeholder="e.g. hdfcbank.com"
                              className="w-full text-sm font-semibold bg-white px-4 py-3 rounded-2xl border border-indigo-100 focus:ring-2 focus:ring-indigo-600 outline-none"
                            />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {['hdfcbank.com', 'icicibank.com', 'sbi.co.in', 'axisbank.com', 'kotak.com'].map(domain => (
                              <button
                                key={domain} type="button"
                                onClick={() => { setLogoUrl(`https://img.logo.dev/${domain}?size=128${profile.logoDevToken ? '&token='+profile.logoDevToken : ''}`); setIsManualLogo(true); setLogoError(false); }}
                                className="text-[9px] font-bold px-2 py-1 bg-white border border-indigo-100 rounded-lg text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all"
                              >
                                {domain.split('.')[0]}
                              </button>
                            ))}
                            <button
                              type="button"
                              disabled={isSearchingLogo || !name}
                              onClick={async () => {
                                if (!profile.brandfetchClientId || !name) return;
                                setIsSearchingLogo(true);
                                const url = await searchBrandfetchIcon(name, profile.brandfetchClientId);
                                if (url) {
                                  setLogoUrl(url);
                                  setIsManualLogo(true);
                                  setLogoError(false);
                                }
                                setIsSearchingLogo(false);
                              }}
                              className="text-[9px] font-black px-2 py-1 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 hover:bg-amber-600 hover:text-white transition-all ml-auto flex items-center gap-1"
                            >
                              {isSearchingLogo ? "Searching..." : "✨ Search Brandfetch"}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ROW 2: Balance & Type */}
                      {type !== 'chit' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
                            {type === 'credit_card' ? 'Outstanding' : type === 'loan' ? 'Debt Amount' : 'Balance'}
                          </label>
                          <div className="relative flex items-center">
                            <span className="absolute left-4 text-slate-400 font-bold text-sm">₹</span>
                            <input
                              type="number" step="any" value={balance} onChange={e => setBalance(e.target.value)}
                              placeholder="0.00"
                              className="w-full text-sm font-bold bg-slate-50 pl-8 pr-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Type</label>
                          {type === 'bank' ? (
                            <select 
                              value={subType} onChange={e => setSubType(e.target.value)}
                              className="w-full text-sm font-semibold bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner appearance-none cursor-pointer"
                            >
                              <option>Savings</option><option>Salary</option><option>Checking</option><option>Current</option><option>Overdraft</option>
                            </select>
                          ) : (
                            <div className="w-full text-sm font-bold text-slate-400 bg-slate-100 px-4 py-3.5 rounded-2xl border-2 border-transparent capitalize">
                              {type.replace('_', ' ')}
                            </div>
                          )}
                        </div>
                      </div>
                      )}

                      {/* TOGGLE TO EXPAND: Advanced Details */}
                      {type === 'bank' && (
                        <div className="space-y-4">
                          <button
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-y border-slate-50 hover:text-indigo-600 transition-colors"
                          >
                            <span className="w-8 h-[1px] bg-slate-100" />
                            {showAdvanced ? "Hide" : "Show"} Advanced Details
                            <span className="w-8 h-[1px] bg-slate-100" />
                          </button>

                          <AnimatePresence>
                            {showAdvanced && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden space-y-5 pt-2"
                              >
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Account Holder Name</label>
                                    <input
                                      type="text" value={accountHolderName} onChange={e => setAccountHolderName(e.target.value)}
                                      placeholder="Full name in bank"
                                      className="w-full text-sm font-semibold bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Account Number</label>
                                    <input
                                      type="text" value={fullAccountNumber} 
                                      onChange={e => {
                                        const val = e.target.value;
                                        setFullAccountNumber(val);
                                        if (val.length >= 4) setLastFour(val.slice(-4));
                                      }}
                                      placeholder="Full account number"
                                      className="w-full text-sm font-semibold bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                                    />
                                    {fullAccountNumber && (
                                      <p className="text-[9px] text-emerald-500 font-bold mt-1.5 px-1 flex items-center gap-1">
                                        <Check className="w-3 h-3" /> Auto-extracting last 4 digits: {lastFour}
                                      </p>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">IFSC Code</label>
                                      <input
                                        type="text" value={ifsc} 
                                        onChange={e => setIfsc(e.target.value.toUpperCase())}
                                        placeholder="HDFC0001234"
                                        maxLength={11}
                                        className="w-full text-sm font-semibold bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Branch</label>
                                      <input
                                        type="text" value={branch} onChange={e => setBranch(e.target.value)}
                                        placeholder="Branch Name"
                                        className="w-full text-sm font-semibold bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">UPI ID</label>
                                    <input
                                      type="text" value={upiId} onChange={e => setUpiId(e.target.value)}
                                      placeholder="name@okbank"
                                      className="w-full text-sm font-semibold bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}


                    {/* Section: Employer Details for Salary Account */}
                    {type === 'bank' && subType === 'Salary' && (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="w-4 h-4 text-indigo-500" />
                          <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Employer Details</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Employer Name</label>
                            <input
                              type="text" value={employerName} onChange={e => setEmployerName(e.target.value)}
                              placeholder="e.g. Google India"
                              className="w-full text-sm font-semibold bg-white px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Location / Office</label>
                            <input
                              type="text" value={employerLocation} onChange={e => setEmployerLocation(e.target.value)}
                              placeholder="e.g. Bangalore"
                              className="w-full text-sm font-semibold bg-white px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Section: Card Details (Credit & Debit) */}
                    {(type === 'credit_card' || type === 'debit') && (
                      <div className="space-y-4 pt-2 border-t border-slate-50 animate-in slide-in-from-top-2">
                        {/* Always visible core fields */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Card Number (Full or Last 4)</label>
                            <input
                              type="text" value={fullAccountNumber} 
                              onChange={e => {
                                const val = e.target.value.replace(/\D/g, '');
                                setFullAccountNumber(val);
                                if (val.length >= 4) setLastFour(val.slice(-4));
                              }}
                              placeholder="XXXX XXXX XXXX 1234"
                              maxLength={19}
                              className="w-full text-sm font-semibold bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner font-mono tracking-widest"
                            />
                            {cardNetwork && (
                              <p className="text-[9px] font-bold mt-1.5 px-1 flex items-center gap-1 text-indigo-500 uppercase tracking-wider">
                                <Check className="w-3 h-3" /> Detected: {cardNetwork} {cardVariant}
                              </p>
                            )}
                          </div>
                          {type === 'credit_card' && (
                            <div className="col-span-2">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Credit Limit</label>
                              <div className="relative flex items-center">
                                <span className="absolute left-4 text-slate-400 font-bold text-sm">₹</span>
                                <input
                                  type="number" step="any" value={creditLimit} onChange={e => setCreditLimit(e.target.value)}
                                  placeholder="e.g. 100000"
                                  className="w-full text-sm font-semibold bg-slate-50 pl-8 pr-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                                />
                              </div>
                            </div>
                          )}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Expiry Date</label>
                            <input
                              type="text" value={expiryDate} onChange={e => setExpiryDate(e.target.value)}
                              placeholder="MM/YY"
                              className="w-full text-sm font-semibold bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Issuer Bank</label>
                            <input
                              type="text" value={issuerBank} onChange={e => setIssuerBank(e.target.value)}
                              placeholder="e.g. HDFC Bank"
                              className="w-full text-sm font-semibold bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                            />
                          </div>
                          {type === 'credit_card' && (
                            <div className="col-span-2">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Bill Due Date (1-31)</label>
                              <input
                                type="number" min="1" max="31" value={dueDate} onChange={e => setDueDate(e.target.value)}
                                placeholder="e.g. 15"
                                className="w-full text-sm font-semibold bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                              />
                            </div>
                          )}
                        </div>

                        {/* TOGGLE TO EXPAND: Advanced Details */}
                        <div className="space-y-4">
                          <button
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-y border-slate-50 hover:text-indigo-600 transition-colors"
                          >
                            <span className="w-8 h-[1px] bg-slate-100" />
                            {showAdvanced ? "Hide" : "Show"} Advanced Card Details
                            <span className="w-8 h-[1px] bg-slate-100" />
                          </button>

                          <AnimatePresence>
                            {showAdvanced && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden space-y-5 pt-2"
                              >
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Name on Card</label>
                                    <input
                                      type="text" value={accountHolderName} onChange={e => setAccountHolderName(e.target.value)}
                                      placeholder="Full name as printed"
                                      className="w-full text-sm font-semibold bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Network</label>
                                      <input
                                        type="text" value={cardNetwork} onChange={e => setCardNetwork(e.target.value)}
                                        placeholder="e.g. Visa"
                                        className="w-full text-sm font-semibold bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Variant</label>
                                      <input
                                        type="text" value={cardVariant} onChange={e => setCardVariant(e.target.value)}
                                        placeholder="e.g. Signature"
                                        className="w-full text-sm font-semibold bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}

                    {/* Section: Loan Details */}
                    {type === 'loan' && (
                      <div className="space-y-4 pt-2 border-t border-slate-50 animate-in slide-in-from-top-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Interest Rate (%)</label>
                            <input
                              type="number" step="0.1" value={interestRate} onChange={e => setInterestRate(e.target.value)}
                              placeholder="e.g. 8.5"
                              className="w-full text-sm font-bold bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Tenure (Months)</label>
                            <input
                              type="number" value={tenureMonths} onChange={e => setTenureMonths(e.target.value)}
                              placeholder="e.g. 60"
                              className="w-full text-sm font-bold bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="relative">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1 flex justify-between">
                              <span>EMI Amount</span>
                              <button type="button" onClick={calculateEMI} className="text-indigo-600 hover:underline">Auto-calc</button>
                            </label>
                            <input
                              type="number" value={emiAmount} onChange={e => setEmiAmount(e.target.value)}
                              placeholder="e.g. 15000"
                              className="w-full text-sm font-bold bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">EMI Day (1-31)</label>
                            <input
                              type="number" min="1" max="31" value={emiDate} onChange={e => setEmiDate(e.target.value)}
                              placeholder="e.g. 5"
                              className="w-full text-sm font-bold bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Start Date</label>
                              <input
                                type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                                className="w-full text-sm font-bold bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                              />
                           </div>
                           <div className="flex items-end">
                              <button
                                type="button"
                                onClick={() => {
                                  if (paymentSchedule.length === 0 || paymentSchedule.length !== Number(tenureMonths)) {
                                    const newSchedule = Array.from({ length: Number(tenureMonths) || 0 }).map((_, i) => ({
                                      amount: i < Number(paidMonths) ? (Math.abs(Number(balance)) / (Number(paidMonths) || 1)) : (Number(emiAmount) || 0),
                                      paid: i < Number(paidMonths)
                                    }));
                                    setPaymentSchedule(newSchedule);
                                  }
                                  setShowScheduleModal(true);
                                }}
                                className="w-full py-4 bg-indigo-50 text-indigo-600 font-black text-[10px] uppercase tracking-widest rounded-2xl border border-indigo-100 hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
                              >
                                <CalendarDays className="w-4 h-4" />
                                {paymentSchedule.filter(s => s.paid).length} / {tenureMonths || 0} Paid
                              </button>
                           </div>
                        </div>
                      </div>
                    )}

                    {/* Section: PF Details */}
                    {type === 'pf' && (
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50 animate-in slide-in-from-top-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Monthly Contribution</label>
                          <input
                            type="number" value={monthlyContribution} onChange={e => setMonthlyContribution(e.target.value)}
                            placeholder="e.g. 1800"
                            className="w-full text-sm font-bold bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">UAN / Emp ID</label>
                          <input
                            type="text" value={employeeId} onChange={e => setEmployeeId(e.target.value)}
                            placeholder="Optional"
                            className="w-full text-sm font-semibold bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                          />
                        </div>
                      </div>
                    )}

                    {/* Section: Chit Details */}
                    {type === 'chit' && (
                      <div className="space-y-4 pt-2 border-t border-slate-50 animate-in slide-in-from-top-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Maturity Amount</label>
                            <input
                              type="number" value={maturityAmount} onChange={e => setMaturityAmount(e.target.value)}
                              placeholder="e.g. 100000"
                              className="w-full text-sm font-bold bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Tenure (Months)</label>
                            <input
                              type="number" value={tenureMonths} 
                              onChange={e => {
                                const val = e.target.value;
                                setTenureMonths(val);
                                const tNum = Number(val) || 0;
                                const pNum = Number(paidMonths) || 0;
                                // Always rebuild schedule for reactivity in modal UI
                                const newSchedule = Array.from({ length: tNum }).map((_, i) => ({
                                  amount: Number(emiAmount) || 0,
                                  paid: i < pNum
                                }));
                                setPaymentSchedule(newSchedule);
                              }}
                              placeholder="e.g. 20"
                              className="w-full text-sm font-bold bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Current Balance (Total Paid)</label>
                            <input
                              type="number" value={balance} onChange={e => setBalance(e.target.value)}
                              placeholder="e.g. 24000"
                              className="w-full text-sm font-bold bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Paid Months</label>
                            <input
                              type="number" value={paidMonths} 
                              onChange={e => {
                                const val = e.target.value;
                                setPaidMonths(val);
                                const num = Number(val) || 0;
                                if (type === 'chit' && emiAmount) {
                                  setBalance((num * Number(emiAmount)).toString());
                                }
                                // Always sync schedule for reactivity in modal UI
                                const tNum = Number(tenureMonths) || 0;
                                if (tNum > 0) {
                                  const newSchedule = Array.from({ length: tNum }).map((_, i) => ({
                                    amount: Number(emiAmount) || 0,
                                    paid: i < num
                                  }));
                                  setPaymentSchedule(newSchedule);
                                }
                              }}
                              placeholder="e.g. 3"
                              className="w-full text-sm font-bold bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="relative">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1 flex justify-between">
                              <span>Monthly Payment</span>
                              <button type="button" onClick={calculateChitAverage} className="text-indigo-600 hover:underline">Recalc</button>
                            </label>
                            <div className="relative flex items-center">
                              <span className="absolute left-4 text-slate-400 font-bold text-sm">₹</span>
                              <input
                                type="number" value={emiAmount} 
                                onChange={e => {
                                  const val = e.target.value;
                                  setEmiAmount(val);
                                  const emi = Number(val) || 0;
                                  const pNum = Number(paidMonths) || 0;
                                  
                                  // Sync balance
                                  if (type === 'chit' && pNum > 0) {
                                    setBalance((pNum * emi).toString());
                                  }
                                  
                                  // Always sync schedule amounts for reactivity
                                  const tNum = Number(tenureMonths) || 0;
                                  if (tNum > 0) {
                                    const newSchedule = Array.from({ length: tNum }).map((_, i) => ({
                                      amount: emi,
                                      paid: i < pNum
                                    }));
                                    setPaymentSchedule(newSchedule);
                                  }
                                }}
                                placeholder="e.g. 5000"
                                className="w-full text-sm font-bold bg-slate-50 pl-8 pr-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Payment Day (1-31)</label>
                            <input
                              type="number" min="1" max="31" value={emiDate} onChange={e => setEmiDate(e.target.value)}
                              placeholder="e.g. 5"
                              className="w-full text-sm font-bold bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Start Date</label>
                            <input
                              type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                              className="w-full text-sm font-bold bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Maturity Date</label>
                            <input
                              type="date" value={maturityDate} onChange={e => setMaturityDate(e.target.value)}
                              className="w-full text-sm font-bold bg-slate-50 px-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all shadow-inner"
                            />
                          </div>
                        </div>

                        {/* Payment Schedule Trigger: Progress Bar Style */}
                        <div className="pt-4">
                          <button
                            type="button"
                            onClick={() => {
                              if (paymentSchedule.length === 0 || paymentSchedule.length !== Number(tenureMonths)) {
                                const newSchedule = Array.from({ length: Number(tenureMonths) || 0 }).map((_, i) => ({
                                  amount: i < Number(paidMonths) ? (Number(balance) / (Number(paidMonths) || 1)) : (Number(emiAmount) || 0),
                                  paid: i < Number(paidMonths)
                                }));
                                setPaymentSchedule(newSchedule);
                              }
                              setShowScheduleModal(true);
                            }}
                            className="w-full p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 hover:border-indigo-200 transition-all flex flex-col gap-4 group text-left"
                          >
                            <div className="flex justify-between items-center">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                                     <CalendarDays className="w-5 h-5" />
                                  </div>
                                  <div>
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Progress</p>
                                     <p className="text-sm font-black text-slate-900">{paymentSchedule.filter(s => s.paid).length} / {tenureMonths || 0} Months Paid</p>
                                  </div>
                               </div>
                               <div className="text-right">
                                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">Manage Schedule →</p>
                               </div>
                            </div>
                            
                            <div className="h-3 w-full bg-white rounded-full overflow-hidden p-0.5 border border-slate-100">
                               <div 
                                 className="h-full bg-indigo-600 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                                 style={{ width: `${Math.min(Math.round((paymentSchedule.filter(s => s.paid).length / (Number(tenureMonths) || 1)) * 100), 100)}%` }}
                               />
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-6 mt-6 border-t border-slate-100 sticky bottom-0 bg-white pb-2 z-10">
                    {isEdit && (
                      <button
                        type="button"
                        onClick={() => { 
                          const msg = (type === 'credit_card' || type === 'debit') ? "Delete card and all its transactions?" : "Delete account and all its transactions?";
                          if (confirm(msg)) { deleteAccount(accId!); onClose(); } 
                        }}
                        className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors shadow-sm"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 bg-slate-900 text-white font-bold py-4.5 rounded-3xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl active:scale-95"
                    >
                      <Check className="w-5 h-5" /> 
                      {isEdit 
                        ? ((type === 'credit_card' || type === 'debit') ? "Update Card" : "Update Account") 
                        : ((type === 'credit_card' || type === 'debit') ? "Create Card" : "Create Account")}
                    </button>
                  </div>
                </form>

                {/* NESTED MODAL: Payment Schedule */}
                <AnimatePresence>
                  {showScheduleModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                      <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowScheduleModal(false)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                      />
                      <motion.div 
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                      >
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-indigo-50/30">
                          <div>
                            <h3 className="text-xl font-black text-slate-900">Payment Schedule</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Mark installments as paid</p>
                          </div>
                          <button onClick={() => setShowScheduleModal(false)} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                          </button>
                        </div>

                        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar space-y-4">
                          <div className="grid grid-cols-1 gap-2">
                            {paymentSchedule.map((item, idx) => {
                               const monthName = format(addMonths(new Date(startDate), idx), 'MMMM yyyy');
                               return (
                                <div 
                                  key={idx} 
                                  onClick={() => {
                                    const newSchedule = [...paymentSchedule];
                                    newSchedule[idx].paid = !newSchedule[idx].paid;
                                    setPaymentSchedule(newSchedule);
                                    // Keep paidMonths in sync
                                    const count = newSchedule.filter(s => s.paid).length;
                                    setPaidMonths(count.toString());
                                  }}
                                  className={cn(
                                    "group flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer",
                                    item.paid 
                                      ? "bg-emerald-50 border-emerald-100" 
                                      : "bg-slate-50 border-transparent hover:border-slate-200"
                                  )}
                                >
                                  <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                    item.paid ? "bg-emerald-500 text-white" : "bg-white border border-slate-200 text-slate-300"
                                  )}>
                                    {item.paid ? <Check className="w-6 h-6 stroke-[3]" /> : <div className="w-3 h-3 rounded-full border-2 border-current opacity-30" />}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-black text-slate-900 leading-none">{monthName}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Month {idx + 1}</p>
                                  </div>
                                  <div className="text-right">
                                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px]">₹</span>
                                      <input 
                                        type="number"
                                        value={item.amount}
                                        onChange={(e) => {
                                          const newSchedule = [...paymentSchedule];
                                          newSchedule[idx].amount = Number(e.target.value);
                                          setPaymentSchedule(newSchedule);
                                        }}
                                        className="w-24 bg-white border border-slate-200 rounded-lg py-1 pl-5 pr-2 text-xs font-black text-slate-900 focus:outline-none focus:border-indigo-600 transition-all"
                                      />
                                    </div>
                                  </div>
                                </div>
                               );
                            })}
                          </div>
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
                           <button 
                            onClick={() => {
                              const total = paymentSchedule.filter(s => s.paid).reduce((a, b) => a + b.amount, 0);
                              setBalance(total.toString());
                              toast.success(`Balance updated to ₹${total}`);
                            }}
                            className="flex-1 bg-white border border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest py-4 rounded-2xl hover:bg-slate-100 transition-all"
                           >
                             Sync Paid Balance
                           </button>
                           <button 
                            onClick={() => setShowScheduleModal(false)}
                            className="flex-1 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
                           >
                             Done Editing
                           </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
