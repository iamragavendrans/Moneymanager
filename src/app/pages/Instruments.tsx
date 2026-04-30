import React, { useEffect, useMemo, useState } from "react";
import { Store, Users, Repeat, CreditCard, Gift, ShieldCheck, Box, Calendar, MapPin, ArrowLeft, Plus } from "lucide-react";
import { formatINR } from "../utils";
import { cn } from "../utils";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { useFinance } from "../context/FinanceContext";

const tabs = [
  { id: "shops", label: "Shops", icon: Store, description: "Track merchants and average spend" },
  { id: "people", label: "People", icon: Users, description: "Track lent and borrowed money" },
  { id: "recurring", label: "Bills", icon: Repeat, description: "Manage recurring payments" },
  { id: "subscriptions", label: "Subscriptions", icon: CreditCard, description: "Control app/service renewals" },
  { id: "giftcards", label: "Gift Cards", icon: Gift, description: "Never miss gift card value" },
  { id: "warranties", label: "Warranties", icon: ShieldCheck, description: "Keep expiry dates in sight" },
  { id: "items", label: "Items", icon: Box, description: "Track valuable owned items" },
] as const;

type TabId = (typeof tabs)[number]["id"];

type Shop = { id: string; name: string; mode: "offline" | "online"; mapLocation: string };
type Person = {
  id: string;
  name: string;
  relationship: string;
  toReceive: number;
  toPay: number;
  mode: "upi" | "bank" | "cheque" | "cash";
  followUpRule: string;
};

const defaultShops: Shop[] = [
  { id: "shop_1", name: "DMart", mode: "offline", mapLocation: "Andheri West, Mumbai" },
  { id: "shop_2", name: "Amazon", mode: "online", mapLocation: "" },
  { id: "shop_3", name: "Swiggy", mode: "online", mapLocation: "" },
];

const defaultPeople: Person[] = [
  { id: "person_1", name: "Rahul", relationship: "Friend", toReceive: 5000, toPay: 1200, mode: "upi", followUpRule: "Every Sunday 8 PM" },
  { id: "person_2", name: "Priya", relationship: "Colleague", toReceive: 0, toPay: 2300, mode: "bank", followUpRule: "3 days before month-end" },
  { id: "person_3", name: "Amit", relationship: "Brother", toReceive: 2500, toPay: 0, mode: "cash", followUpRule: "Weekly reminder" },
];

const mockData = {
  recurring: [
    { id: 1, name: "Electricity Bill", amount: 1500, cycle: "Monthly", nextDate: "2026-05-15", status: "active" },
    { id: 2, name: "PG Rent", amount: 12000, cycle: "Monthly", nextDate: "2026-05-01", status: "active" },
    { id: 3, name: "Water Bill", amount: 450, cycle: "Monthly", nextDate: "2026-04-27", status: "on hold" },
  ],
  subscriptions: [
    { id: 1, name: "Netflix", amount: 649, cycle: "Monthly", nextDate: "2026-05-05", status: "active" },
    { id: 2, name: "Gym Membership", amount: 15000, cycle: "Yearly", nextDate: "2027-01-10", status: "active" },
    { id: 3, name: "Music Pro", amount: 99, cycle: "Monthly", nextDate: "2026-04-20", status: "stopped" },
  ],
  giftcards: [
    { id: 1, name: "Shoppers Stop", code: "SS-4F8A-32K", balance: 2500, total: 3000, giftedFrom: "Neha", expiry: "2026-12-31" },
    { id: 2, name: "Myntra", code: "MYN-91ZK-P2", balance: 500, total: 1000, giftedFrom: "Office Rewards", expiry: "2026-06-30" },
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

export const Instruments = () => {
  const { transactions } = useFinance();
  const [activeTab, setActiveTab] = useState<TabId | null>(null);
  const [shops, setShops] = useState<Shop[]>(() => JSON.parse(localStorage.getItem("finance_shops") || "null") || defaultShops);
  const [people, setPeople] = useState<Person[]>(() => JSON.parse(localStorage.getItem("finance_people") || "null") || defaultPeople);
  const [addingType, setAddingType] = useState<"shop" | "person" | null>(null);

  const [shopForm, setShopForm] = useState({ name: "", mode: "offline" as Shop["mode"], mapLocation: "" });
  const [personForm, setPersonForm] = useState({ name: "", relationship: "", toReceive: "", toPay: "", mode: "upi" as Person["mode"], followUpRule: "" });
  const [error, setError] = useState("");

  useEffect(() => localStorage.setItem("finance_shops", JSON.stringify(shops)), [shops]);
  useEffect(() => localStorage.setItem("finance_people", JSON.stringify(people)), [people]);

  const shopMetrics = useMemo(() => shops.map((shop) => {
    const matches = transactions.filter((tx) => tx.payee.toLowerCase().trim() === shop.name.toLowerCase().trim() && tx.type === "expense");
    const total = matches.reduce((sum, tx) => sum + tx.amount, 0);
    return { ...shop, transactions: matches.length, avgSpend: matches.length ? Math.round(total / matches.length) : 0 };
  }), [shops, transactions]);

  const getDueLabel = (isoDate: string) => {
    const days = differenceInCalendarDays(parseISO(isoDate), new Date());
    if (days < 0) return "Overdue";
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    return `Due in ${days} days`;
  };

  const addShop = () => {
    if (!shopForm.name.trim()) return setError("Shop name is required");
    if (shopForm.mode === "offline" && !shopForm.mapLocation.trim()) return setError("Offline shops require map location");
    setShops((prev) => [{ id: `shop_${Date.now()}`, ...shopForm, name: shopForm.name.trim(), mapLocation: shopForm.mapLocation.trim() }, ...prev]);
    setShopForm({ name: "", mode: "offline", mapLocation: "" });
    setError("");
    setAddingType(null);
  };

  const addPerson = () => {
    if (!personForm.name.trim() || !personForm.relationship.trim() || !personForm.followUpRule.trim()) return setError("Name, relationship, and follow-up rule are required");
    setPeople((prev) => [{
      id: `person_${Date.now()}`,
      name: personForm.name.trim(),
      relationship: personForm.relationship.trim(),
      toReceive: Number(personForm.toReceive) || 0,
      toPay: Number(personForm.toPay) || 0,
      mode: personForm.mode,
      followUpRule: personForm.followUpRule.trim(),
    }, ...prev]);
    setPersonForm({ name: "", relationship: "", toReceive: "", toPay: "", mode: "upi", followUpRule: "" });
    setError("");
    setAddingType(null);
  };

  const currentTab = tabs.find((t) => t.id === activeTab);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 flex flex-col h-full">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Instruments</h2>
        <p className="text-slate-500 text-sm mt-1">Pick a category first, then manage entries inside it.</p>
      </div>

      {!activeTab && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="text-left p-5 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <tab.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800">{tab.label}</h3>
              <p className="text-sm text-slate-500 mt-1">{tab.description}</p>
            </button>
          ))}
        </div>
      )}

      {activeTab && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button onClick={() => { setActiveTab(null); setAddingType(null); setError(""); }} className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4" /> Back to options
            </button>
            <button onClick={() => setAddingType(activeTab === "people" ? "person" : activeTab === "shops" ? "shop" : null)} className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-semibold">
              <Plus className="w-4 h-4" /> Add New
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-800 mb-1">{currentTab?.label}</h3>
            <p className="text-sm text-slate-500">{currentTab?.description}</p>
          </div>

          {addingType === "shop" && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
              <input value={shopForm.name} onChange={(e) => setShopForm((p) => ({ ...p, name: e.target.value }))} placeholder="Shop name" className="w-full px-3 py-2 rounded-lg border border-slate-200" />
              <div className="flex gap-2">
                {(["offline", "online"] as const).map((mode) => (
                  <button key={mode} onClick={() => setShopForm((p) => ({ ...p, mode }))} className={cn("px-3 py-2 rounded-lg text-sm capitalize", shopForm.mode === mode ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600")}>{mode}</button>
                ))}
              </div>
              <input value={shopForm.mapLocation} onChange={(e) => setShopForm((p) => ({ ...p, mapLocation: e.target.value }))} placeholder={shopForm.mode === "offline" ? "Map location (mandatory)" : "Map location (optional)"} className="w-full px-3 py-2 rounded-lg border border-slate-200" />
              <button onClick={addShop} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Save Shop</button>
            </div>
          )}

          {addingType === "person" && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
              <input value={personForm.name} onChange={(e) => setPersonForm((p) => ({ ...p, name: e.target.value }))} placeholder="Name" className="w-full px-3 py-2 rounded-lg border border-slate-200" />
              <input value={personForm.relationship} onChange={(e) => setPersonForm((p) => ({ ...p, relationship: e.target.value }))} placeholder="Relationship" className="w-full px-3 py-2 rounded-lg border border-slate-200" />
              <div className="grid grid-cols-2 gap-2">
                <input value={personForm.toReceive} onChange={(e) => setPersonForm((p) => ({ ...p, toReceive: e.target.value }))} placeholder="To receive" className="w-full px-3 py-2 rounded-lg border border-slate-200" />
                <input value={personForm.toPay} onChange={(e) => setPersonForm((p) => ({ ...p, toPay: e.target.value }))} placeholder="To pay" className="w-full px-3 py-2 rounded-lg border border-slate-200" />
              </div>
              <select value={personForm.mode} onChange={(e) => setPersonForm((p) => ({ ...p, mode: e.target.value as Person["mode"] }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white">
                <option value="upi">UPI</option><option value="bank">Bank</option><option value="cheque">Cheque</option><option value="cash">Cash</option>
              </select>
              <input value={personForm.followUpRule} onChange={(e) => setPersonForm((p) => ({ ...p, followUpRule: e.target.value }))} placeholder="Follow-up rule (e.g. Every Monday 10 AM)" className="w-full px-3 py-2 rounded-lg border border-slate-200" />
              <button onClick={addPerson} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Save Person</button>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          {activeTab === "shops" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shopMetrics.map((shop) => (
                <div key={shop.id} className="p-5 border border-slate-100 rounded-2xl">
                  <div className="flex justify-between mb-3"><h4 className="font-bold">{shop.name}</h4><span className="text-xs capitalize bg-slate-100 px-2 py-1 rounded">{shop.mode}</span></div>
                  {shop.mapLocation && <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{shop.mapLocation}</p>}
                  <p className="text-sm mt-2">Avg Spend: <b>{formatINR(shop.avgSpend)}</b></p>
                  <p className="text-xs text-slate-500">{shop.transactions} transactions</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "people" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {people.map((p) => {
                const finalAmount = p.toReceive - p.toPay;
                return (
                  <div key={p.id} className="p-5 border border-slate-100 rounded-2xl space-y-2">
                    <h4 className="font-bold text-lg">{p.name}</h4>
                    <p className="text-xs text-slate-500">{p.relationship} • {p.mode.toUpperCase()}</p>
                    <p className="text-sm">To receive: <b className="text-emerald-600">{formatINR(p.toReceive)}</b></p>
                    <p className="text-sm">To pay: <b className="text-red-600">{formatINR(p.toPay)}</b></p>
                    <p className={cn("text-sm font-semibold", finalAmount >= 0 ? "text-emerald-700" : "text-red-700")}>Final: {formatINR(finalAmount)}</p>
                    <p className="text-xs bg-slate-50 rounded p-2">Follow-up: {p.followUpRule}</p>
                  </div>
                );
              })}
            </div>
          )}

          {(activeTab === "recurring" || activeTab === "subscriptions") && (
            <div className="space-y-3">
              {(activeTab === "recurring" ? mockData.recurring : mockData.subscriptions).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
                  <div>
                    <h4 className="font-bold text-slate-800">{item.name}</h4>
                    <p className="text-sm text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3" />Next: {format(parseISO(item.nextDate), "dd MMM yyyy")} • {item.cycle}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatINR(item.amount)}</p>
                    <p className={cn("text-xs", getDueLabel(item.nextDate) === "Overdue" ? "text-red-600" : "text-slate-500")}>{getDueLabel(item.nextDate)}</p>
                    <p className="text-xs capitalize text-slate-500">{item.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "giftcards" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mockData.giftcards.map((card) => (
                <div key={card.id} className="p-5 rounded-2xl bg-white border border-slate-100">
                  <h4 className="font-bold">{card.name}</h4>
                  <p className="text-xs text-slate-500">Code: {card.code}</p>
                  <p className="text-sm mt-2">Balance: <b>{formatINR(card.balance)}</b> / {formatINR(card.total)}</p>
                  <p className="text-xs text-slate-500">Gifted from: {card.giftedFrom}</p>
                  <p className="text-xs text-slate-500">Expires: {card.expiry}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "warranties" && (
            <div className="space-y-3">
              {mockData.warranties.map((w) => (
                <div key={w.id} className="p-4 border border-slate-100 rounded-xl flex justify-between">
                  <div><h4 className="font-bold">{w.name}</h4><p className="text-xs text-slate-500">Purchased: {w.purchased} • Expiry: {w.expiry}</p></div>
                  <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded h-fit">{w.daysLeft} days left</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "items" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mockData.items.map((i) => (
                <div key={i.id} className="p-5 border border-slate-100 rounded-xl flex justify-between"><div><h4 className="font-bold">{i.name}</h4><p className="text-xs text-slate-500">{i.category}</p></div><b>{formatINR(i.value)}</b></div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
