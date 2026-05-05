import React, { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router";
import { LayoutDashboard, ReceiptText, WalletCards, Repeat, Settings, Plus } from "lucide-react";
import { cn } from "../utils";
import { TransactionFormModal } from "./TransactionFormModal";
import { AccountManagementModal } from "./AccountManagementModal";
import { InvestmentManagementModal } from "./InvestmentManagementModal";

const navItems = [
  { icon: LayoutDashboard, label: "Home", path: "/" },
  { icon: ReceiptText, label: "Transactions", path: "/transactions" },
  { icon: WalletCards, label: "Accounts", path: "/accounts" },
  { icon: Repeat, label: "Investments", path: "/investments" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export const Layout = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showInvModal, setShowInvModal] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/": return "Dashboard";
      case "/transactions": return "Transactions";
      case "/accounts": return "Accounts";
      case "/investments": return "Investments";
      case "/settings": return "Preferences";
      default: return "Money Tracker";
    }
  };

  const getAddAction = () => {
    switch (location.pathname) {
      case "/accounts":
        return { label: "Add Account", action: () => setShowAccountModal(true) };
      case "/investments":
        return { label: "Add Investment", action: () => setShowInvModal(true) };
      default:
        return { label: "Add Transaction", action: () => setIsAddModalOpen(true) };
    }
  };

  const currentAction = getAddAction();

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-white shadow-sm z-10">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
            ₹
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">MoneyManager</h1>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={currentAction.action}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {currentAction.label}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 z-10 sticky top-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              ₹
            </div>
            <span className="font-bold text-lg">{getPageTitle()}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
            M
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-5 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{getPageTitle()}</h2>
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              M
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <Outlet />
        </div>

        {/* Mobile Floating Action Button */}
        <button
          onClick={currentAction.action}
          className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-indigo-700 active:scale-95 transition-all z-20 border-4 border-white group"
          aria-label={currentAction.label}
        >
          <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </main>

      {/* Mobile Bottom Nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-6 z-30"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
      >
        <div className="grid grid-cols-5 items-center h-16 px-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors px-0.5",
                  isActive ? "text-indigo-600" : "text-slate-500 hover:text-slate-900"
                )
              }
            >
              <item.icon
                className={cn(
                  "w-5 h-5",
                  location.pathname === item.path && "fill-indigo-50"
                )}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {isAddModalOpen && (
        <TransactionFormModal onClose={() => setIsAddModalOpen(false)} />
      )}
      {showAccountModal && (
        <AccountManagementModal onClose={() => setShowAccountModal(false)} />
      )}
      {showInvModal && (
        <InvestmentManagementModal onClose={() => setShowInvModal(false)} />
      )}
    </div>
  );
};
