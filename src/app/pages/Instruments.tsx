import React, { useEffect, useMemo, useState } from "react";
import { Store, Users, Repeat, CreditCard, Gift, ShieldCheck, Box, Calendar, MapPin } from "lucide-react";
import { formatINR } from "../utils";
import { cn } from "../utils";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { useFinance } from "../context/FinanceContext";

const tabs = [
  { id: "shops", label: "Shops", icon: Store },
  { id: "people", label: "People", icon: Users },
  { id: "recurring", label: "Bills", icon: Repeat },
  { id: "subscriptions", label: "Subscriptions", icon: CreditCard },
  { id: "giftcards", label: "Gift Cards", icon: Gift },
  { id: "warranties", label: "Warranties", icon: ShieldCheck },
  { id: "items", label: "Items", icon: Box },
] as const;

type Shop = {
  id: string;
  name: string;
  mode: "offline" | "online";
  mapLocation: string;
};

const mockData = {
  people: [
    { id: 1, name: "Rahul", type: "Lent", amount: 5000, due: "Next week" },
    { id: 2, name: "Priya", type: "Owe", amount: 1200, due: "Tomorrow" },
  ],
  recurring: [
    { id: 1, name: "Electricity Bill", amount: 1500, cycle: "Monthly", nextDate: "2026-05-15" },
    { id: 2, name: "Internet", amount: 999, cycle: "Monthly", nextDate: "2026-05-02" },
  ],
  subscriptions: [
    { id: 1, name: "Netflix", amount: 649, cycle: "Monthly", nextDate: "2026-05-05", status: "Active" },
    { id: 2, name: "Gym Membership", amount: 15000, cycle: "Yearly", nextDate: "2027-01-10", status: "Active" },
  ],
  giftcards: [
    { id: 1, name: "Shoppers Stop", balance: 2500, expiry: "2026-12-31" },
    { id: 2, name: "Myntra", balance: 500, expiry: "2026-06-30" },
  ],
  warranties: [
    { id: 1, name: "Sony TV", purchased: "2024-10-15", expiry: "2027-10-15", daysLeft: 533 },
    { id: 2, name: "MacBook Pro", purchased: "2025-01-20", expiry: "2026-01-20", daysLeft: 265 },
  ],
  items: [
    { id: 1, name: "iPhone 15 Pro", value: 129000, category: "Electronics" },
    { id: 2, name: "Gold Coin (10g)", value: 75000, category: "Asset" },
  ]
};

const defaultShops: Shop[] = [
  { id: "shop_1", name: "Amazon", mode: "online", mapLocation: "" },
  { id: "shop_2", name: "Swiggy", mode: "online", mapLocation: "" },
];

export const Instruments = () => {
  const { transactions } = useFinance();
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [shops, setShops] = useState<Shop[]>(() => {
    const saved = localStorage.getItem("finance_shops");
    return saved ? JSON.parse(saved) : defaultShops;
  });
  const [shopForm, setShopForm] = useState({ name: "", mode: "offline" as Shop["mode"], mapLocation: "" });
  const [shopError, setShopError] = useState("");

  useEffect(() => {
    localStorage.setItem("finance_shops", JSON.stringify(shops));
  }, [shops]);

  const shopMetrics = useMemo(() => {
    return shops.map((shop) => {
      const matches = transactions.filter((tx) => tx.payee.toLowerCase().trim() === shop.name.toLowerCase().trim() && tx.type === "expense");
      const totalSpend = matches.reduce((sum, tx) => sum + tx.amount, 0);
      const txCount = matches.length;
      return {
        ...shop,
        transactions: txCount,
        avgSpend: txCount > 0 ? Math.round(totalSpend / txCount) : 0,
      };
    });
  }, [shops, transactions]);

  const handleAddShop = () => {
    if (!shopForm.name.trim()) {
      setShopError("Shop name is required");
      return;
    }
    if (shopForm.mode === "offline" && !shopForm.mapLocation.trim()) {
      setShopError("Location is mandatory for offline shops");
      return;
    }
    setShops((prev) => [
      {
        id: `shop_${Date.now()}`,
        name: shopForm.name.trim(),
        mode: shopForm.mode,
        mapLocation: shopForm.mapLocation.trim(),
      },
      ...prev,
    ]);
    setShopError("");
    setShopForm({ name: "", mode: "offline", mapLocation: "" });
  };

  const getDueLabel = (isoDate: string) => {
    const days = differenceInCalendarDays(parseISO(isoDate), new Date());
    if (days < 0) return "Overdue";
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    return `Due in ${days} days`;
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Instruments</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your non-account financial assets and obligations.</p>
          <p className="text-slate-400 text-xs mt-1">Track dues, people and subscriptions in one place so nothing slips.</p>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 space-x-2 scrollbar-hide shrink-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 border",
                isActive
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50"
              )}
            >
              <tab.icon className={cn("w-4 h-4", isActive ? "text-indigo-100" : "text-slate-400")} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 min-h-[400px] bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        {activeTab === "shops" && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
              <h3 className="font-bold text-slate-800 mb-3">Add Shop</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  value={shopForm.name}
                  onChange={(e) => setShopForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Shop name"
                  className="px-3 py-2 rounded-lg border border-slate-200 bg-white"
                />
                <div className="flex gap-2 rounded-lg border border-slate-200 bg-white p-1">
                  {(["offline", "online"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setShopForm((prev) => ({ ...prev, mode }))}
                      className={cn("flex-1 py-2 text-sm rounded-md font-semibold capitalize", shopForm.mode === mode ? "bg-indigo-600 text-white" : "text-slate-600")}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
                <div className="md:col-span-2">
                  <input
                    value={shopForm.mapLocation}
                    onChange={(e) => setShopForm((prev) => ({ ...prev, mapLocation: e.target.value }))}
                    placeholder={shopForm.mode === "offline" ? "Map location (mandatory for offline)" : "Map location (optional for online)"}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>
              {shopError && <p className="text-sm text-red-600 mt-2">{shopError}</p>}
              <button onClick={handleAddShop} className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Save Shop</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shopMetrics.map((shop) => (
                <div key={shop.id} className="p-5 border border-slate-100 rounded-2xl hover:shadow-md transition-shadow group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Store className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md capitalize">{shop.mode}</span>
                  </div>
                  <h4 className="font-bold text-lg text-slate-800 mb-1">{shop.name}</h4>
                  {shop.mapLocation && <p className="text-xs text-slate-500 mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" /> {shop.mapLocation}</p>}
                  <p className="text-sm text-slate-500">Avg Spend: <span className="font-semibold text-slate-700">{formatINR(shop.avgSpend)}</span></p>
                  <p className="text-xs text-slate-400 mt-2">{shop.transactions} transactions recorded</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "people" && <div className="text-slate-600">People workflow next.</div>}
        {(activeTab === "recurring" || activeTab === "subscriptions") && (
          <div className="space-y-3">
            {(activeTab === "recurring" ? mockData.recurring : mockData.subscriptions).map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                <div>
                  <h4 className="font-bold text-slate-800">{item.name}</h4>
                  <p className="text-sm text-slate-500">Next: {format(parseISO(item.nextDate), "dd MMM yyyy")} • {item.cycle}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800 text-lg">{formatINR(item.amount)}</p>
                  <p className={cn("text-xs font-semibold", getDueLabel(item.nextDate) === "Overdue" ? "text-red-600" : "text-slate-500")}>{getDueLabel(item.nextDate)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === "giftcards" && <div className="text-slate-600">Gift Cards workflow next.</div>}
        {activeTab === "warranties" && <div className="text-slate-600">Warranties workflow next.</div>}
        {activeTab === "items" && <div className="text-slate-600">Items workflow next.</div>}
      </div>
    </div>
  );
};
