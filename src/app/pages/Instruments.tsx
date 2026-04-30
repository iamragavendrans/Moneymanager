import React, { useState } from "react";
import { Store, Users, Repeat, CreditCard, Gift, ShieldCheck, Box, Calendar } from "lucide-react";
import { formatINR } from "../utils";
import { cn } from "../utils";

const tabs = [
  { id: "shops", label: "Shops", icon: Store },
  { id: "people", label: "People", icon: Users },
  { id: "recurring", label: "Bills", icon: Repeat },
  { id: "subscriptions", label: "Subscriptions", icon: CreditCard },
  { id: "giftcards", label: "Gift Cards", icon: Gift },
  { id: "warranties", label: "Warranties", icon: ShieldCheck },
  { id: "items", label: "Items", icon: Box },
];

const mockData = {
  shops: [
    { id: 1, name: "Amazon", type: "Online", avgSpend: 4500, transactions: 12 },
    { id: 2, name: "Swiggy", type: "Food Delivery", avgSpend: 850, transactions: 24 },
  ],
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

export const Instruments = () => {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Instruments</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your non-account financial assets and obligations.</p>
        </div>
      </div>

      {/* Scrollable Tabs */}
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

      {/* Tab Content */}
      <div className="flex-1 min-h-[400px] bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        
        {/* Shops */}
        {activeTab === "shops" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockData.shops.map(shop => (
              <div key={shop.id} className="p-5 border border-slate-100 rounded-2xl hover:shadow-md transition-shadow group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Store className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{shop.type}</span>
                </div>
                <h4 className="font-bold text-lg text-slate-800 mb-1">{shop.name}</h4>
                <p className="text-sm text-slate-500">Avg Spend: <span className="font-semibold text-slate-700">{formatINR(shop.avgSpend)}</span></p>
                <p className="text-xs text-slate-400 mt-2">{shop.transactions} transactions recorded</p>
              </div>
            ))}
          </div>
        )}

        {/* People */}
        {activeTab === "people" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockData.people.map(person => (
              <div key={person.id} className="p-5 border border-slate-100 rounded-2xl hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                        {person.name.charAt(0)}
                      </div>
                      <h4 className="font-bold text-lg text-slate-800">{person.name}</h4>
                    </div>
                    <span className={cn(
                      "text-xs font-bold px-2 py-1 rounded-md",
                      person.type === "Lent" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    )}>
                      {person.type === "Lent" ? "You're owed" : "You owe"}
                    </span>
                  </div>
                  <h3 className={cn(
                    "text-2xl font-bold tracking-tight mb-1",
                    person.type === "Lent" ? "text-emerald-600" : "text-red-600"
                  )}>
                    {formatINR(person.amount)}
                  </h3>
                </div>
                <p className="text-sm font-medium text-slate-500 mt-4 flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg">
                  <Calendar className="w-4 h-4" /> Due: {person.due}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Similar maps for other tabs can be fleshed out, using basic list for remaining */}
        {(activeTab === "recurring" || activeTab === "subscriptions") && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
               <div>
                 <p className="text-sm font-semibold text-slate-500">Upcoming {activeTab === "recurring" ? "Bills" : "Subscriptions"}</p>
                 <h3 className="text-xl font-bold text-slate-800">{formatINR(
                   (activeTab === "recurring" ? mockData.recurring : mockData.subscriptions).reduce((acc, curr) => acc + curr.amount, 0)
                 )} <span className="text-sm font-medium text-slate-500">/ Total</span></h3>
               </div>
               <button className="text-indigo-600 text-sm font-bold bg-indigo-50 px-3 py-1.5 rounded-lg">Add New</button>
            </div>
            
            {(activeTab === "recurring" ? mockData.recurring : mockData.subscriptions).map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    {activeTab === "recurring" ? <Repeat className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{item.name}</h4>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" /> Next: {item.nextDate} • {item.cycle}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800 text-lg">{formatINR(item.amount)}</p>
                  {('status' in item) && <span className="text-xs font-bold text-emerald-600">Active</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "giftcards" && (
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {mockData.giftcards.map(card => (
               <div key={card.id} className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-sm relative overflow-hidden">
                 <div className="absolute right-0 bottom-0 opacity-10">
                   <Gift className="w-32 h-32 -mb-8 -mr-8" />
                 </div>
                 <div className="relative z-10">
                   <p className="text-indigo-100 font-medium text-sm mb-1">{card.name}</p>
                   <h3 className="text-3xl font-bold tracking-tight mb-6">{formatINR(card.balance)}</h3>
                   <div className="flex justify-between items-center text-sm font-medium">
                     <span className="bg-white/20 px-2 py-1 rounded">Exp: {card.expiry}</span>
                     <button className="text-white hover:text-indigo-100 underline decoration-indigo-300 underline-offset-2">Use Now</button>
                   </div>
                 </div>
               </div>
             ))}
           </div>
        )}

        {activeTab === "warranties" && (
          <div className="space-y-3">
             {mockData.warranties.map(item => (
               <div key={item.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{item.name}</h4>
                      <p className="text-sm text-slate-500">Purchased: {item.purchased} • Expires: {item.expiry}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-1 rounded-md">{item.daysLeft} days left</span>
                  </div>
               </div>
             ))}
          </div>
        )}

        {activeTab === "items" && (
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {mockData.items.map(item => (
               <div key={item.id} className="flex items-center justify-between p-5 border border-slate-100 rounded-2xl hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
                      <Box className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{item.name}</h4>
                      <p className="text-sm text-slate-500">{item.category}</p>
                    </div>
                  </div>
                  <div className="text-right font-bold text-slate-800 text-lg">
                    {formatINR(item.value)}
                  </div>
               </div>
             ))}
           </div>
        )}
      </div>
    </div>
  );
};
