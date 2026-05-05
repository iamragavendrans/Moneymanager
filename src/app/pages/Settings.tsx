import React, { useState } from "react";
import { Lock, Fingerprint, Palette, Cloud, Database, Download, Upload, Shield, IndianRupee, Globe, LayoutTemplate, Store, Users, Repeat, CreditCard as CreditCardIcon, Gift, ShieldCheck, Bell, AlertTriangle, Briefcase, ChevronRight, X, Calendar, Tags, Package } from "lucide-react";
import { cn } from "../utils";
import { EntityManagementModal } from "../components/EntityManagementModal";

const SettingRow = ({ icon: Icon, title, subtitle, action, destructive = false, onClick }: any) => (
  <div 
    onClick={onClick}
    className={cn(
      "p-5 flex items-center justify-between gap-4 transition-colors", 
      destructive ? "hover:bg-red-50" : "hover:bg-slate-50",
      onClick ? "cursor-pointer active:bg-slate-100" : ""
    )}
  >
    <div className="flex items-center gap-4 min-w-0">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", destructive ? "bg-red-50 text-red-600" : "bg-indigo-50 text-indigo-600")}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className={cn("font-semibold truncate", destructive ? "text-red-600" : "text-slate-800")}>{title}</p>
        <p className="text-sm text-slate-500 mt-0.5 truncate sm:whitespace-normal">{subtitle}</p>
      </div>
    </div>
    <div className="shrink-0">
      {action}
    </div>
  </div>
);

const Toggle = ({ active, onToggle }: { active: boolean, onToggle: () => void }) => (
  <button onClick={onToggle} className={cn("w-12 h-6 rounded-full relative transition-colors duration-200", active ? "bg-indigo-600" : "bg-slate-200")}>
    <span className={cn("absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200", active ? "left-7" : "left-1")} />
  </button>
);

export const Settings = () => {
  const [locks, setLocks] = useState({ biometric: true, hideBalances: false });
  const [sync, setSync] = useState({ drive: true });
  const [reminders, setReminders] = useState({ bills: true, dailyLog: true });

  // Entity Modal State
  const [activeEntity, setActiveEntity] = useState<string | null>(null);

  const openEntity = (entity: string) => setActiveEntity(entity);
  const closeEntity = () => setActiveEntity(null);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-24">
      <h2 className="text-2xl font-bold text-slate-800">Preferences</h2>

      {/* 1. Profile & Sync */}
      <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
          <img src="/src/imports/Untitled-2026-04-30-1618.png" alt="Profile" className="w-16 h-16 rounded-full border-2 border-white shadow-sm object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          <div>
            <h3 className="font-bold text-slate-800 text-lg">My Profile</h3>
            <p className="text-sm text-slate-500">Pro Local-First Account</p>
          </div>
        </div>
        
        <div className="divide-y divide-slate-100">
          <SettingRow icon={Cloud} title="Google Drive Backup" subtitle="Last synced: 2 mins ago" action={<Toggle active={sync.drive} onToggle={() => setSync(s => ({ ...s, drive: !s.drive }))} />} />
          <SettingRow icon={Download} title="Restore Data from Cloud" subtitle="Sync across devices seamlessly" action={<button className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">Restore</button>} />
          <SettingRow icon={Upload} title="Export Data (CSV/JSON)" subtitle="Take full control of your raw data" action={<button className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">Export</button>} />
        </div>
      </div>

      {/* 2. Employment & Tax Profiling (New) */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 border border-slate-800 rounded-[24px] shadow-xl overflow-hidden relative">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
         <div className="p-6 relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
           <div className="flex gap-4 items-start">
             <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
               <Briefcase className="w-6 h-6 text-indigo-300" />
             </div>
             <div>
               <h3 className="font-bold text-white text-lg">Employment & Tax Profile</h3>
               <p className="text-sm text-indigo-200 mt-1 max-w-sm">Configure your Salary Band and Employer to unlock Smart Tax Engine suggestions and automatic PF tracking.</p>
             </div>
           </div>
           <button className="w-full sm:w-auto shrink-0 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm mt-2 sm:mt-0">
             Configure Profile
           </button>
         </div>
      </div>

      {/* 3. Entity Management (Khata, Shops, Subs) */}
      <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-500" />
            Advanced Entities Management
          </h3>
          <p className="text-sm text-slate-500 mt-1 ml-7">Manage your dedicated ledgers to speed up transaction logging.</p>
        </div>
        <div className="divide-y divide-slate-100">
          <SettingRow onClick={() => openEntity('shop')} icon={Store} title="Shops / Merchants" subtitle="Save frequent stores & default categories" action={<ChevronRight className="w-5 h-5 text-slate-300" />} />
          <SettingRow onClick={() => openEntity('person')} icon={Users} title="People / Payees (Khata)" subtitle="Track lending, borrowing, and split expenses" action={<ChevronRight className="w-5 h-5 text-slate-300" />} />
          <SettingRow onClick={() => openEntity('recurring')} icon={Repeat} title="Recurring Bills" subtitle="Utilities, mobile recharge, gas, electricity" action={<ChevronRight className="w-5 h-5 text-slate-300" />} />
          <SettingRow onClick={() => openEntity('subscription')} icon={CreditCardIcon} title="Subscriptions" subtitle="Discretionary active digital services (Netflix, Gym)" action={<ChevronRight className="w-5 h-5 text-slate-300" />} />
          <SettingRow onClick={() => openEntity('giftcard')} icon={Gift} title="Gift Cards" subtitle="Track unused gift card balances & expiry" action={<ChevronRight className="w-5 h-5 text-slate-300" />} />
          <SettingRow onClick={() => openEntity('warranty')} icon={ShieldCheck} title="Warranties" subtitle="Upload warranty cards for major electronics" action={<ChevronRight className="w-5 h-5 text-slate-300" />} />
          <SettingRow onClick={() => openEntity('item')} icon={Package} title="Items / Inventory" subtitle="Manage purchased items & assets" action={<ChevronRight className="w-5 h-5 text-slate-300" />} />
        </div>
      </div>

      {/* 4. Localization & Format */}
      <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-500" />
            Localization & Categories
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          <SettingRow icon={IndianRupee} title="Currency & Number System" subtitle="Indian Rupee (INR) • Lakhs & Crores (1,00,000)" action={<button className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">Edit</button>} />
          <SettingRow icon={Calendar} title="Financial Year Start" subtitle="April 1 (India Tax Standard)" action={<button className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">Edit</button>} />
          <SettingRow icon={Tags} title="Categories & Insight Tagging" subtitle="Manage sub-categories & Needs/Wants/Savings tags" action={<button className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">Edit</button>} />
        </div>
      </div>

      {/* 5. Security & Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden h-fit">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-500" /> Privacy & Security
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            <SettingRow icon={Fingerprint} title="App Lock" subtitle="Require Biometrics to open" action={<Toggle active={locks.biometric} onToggle={() => setLocks(s => ({ ...s, biometric: !s.biometric }))} />} />
            <SettingRow icon={Lock} title="Hide Balances" subtitle="Mask numbers by default" action={<Toggle active={locks.hideBalances} onToggle={() => setLocks(s => ({ ...s, hideBalances: !s.hideBalances }))} />} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden h-fit">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-500" /> Reminders
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            <SettingRow icon={Bell} title="Bill Reminders" subtitle="Push notifications for due dates" action={<Toggle active={reminders.bills} onToggle={() => setReminders(s => ({ ...s, bills: !s.bills }))} />} />
            <SettingRow icon={Bell} title="Daily Log Prompt" subtitle="Ping at 9:00 PM to log expenses" action={<Toggle active={reminders.dailyLog} onToggle={() => setReminders(s => ({ ...s, dailyLog: !s.dailyLog }))} />} />
          </div>
        </div>
      </div>

      {/* 6. Danger Zone */}
      <div className="bg-white border border-red-100 rounded-[24px] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-red-50 bg-red-50/30">
          <h3 className="font-bold text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Danger Zone
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          <SettingRow icon={Database} title="Reset Data" subtitle="Clear all transactions. Keep configs & categories." destructive action={<button className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">Reset</button>} />
          <SettingRow icon={Database} title="Seed Data (2 Years)" subtitle="Generate 2 years of realistic testing data." destructive onClick={() => { if(confirm("This will overwrite your current data with 2 years of seed data. Continue?")) { import("../utils/seedData").then(m => m.applySeedData()); } }} action={<button className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">Seed</button>} />
          <SettingRow icon={AlertTriangle} title="Wipe Data" subtitle="Total nuclear reset. Erase absolutely everything." destructive action={<button className="text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors px-3 py-1.5 rounded-lg">Wipe</button>} />
        </div>
      </div>

      <div className="text-center mt-8 text-sm text-slate-400 font-medium">
        FinLocal v2.0.0 • Made in India
      </div>

      {activeEntity && (
        <EntityManagementModal type={activeEntity as any} onClose={closeEntity} />
      )}
    </div>
  );
};
