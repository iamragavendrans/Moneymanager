import React, { useState, useEffect } from "react";
import {
  Lock, Fingerprint, Palette, Cloud, Database, Download, Upload, Shield,
  IndianRupee, Globe, LayoutTemplate, Store, Users, Repeat,
  CreditCard as CreditCardIcon, Gift, ShieldCheck, Bell, AlertTriangle,
  Briefcase, X, Calendar, Tags, Package, FileJson, Target,
  Clock, PieChart, Layers, LogOut, Building
} from "lucide-react";
import { cn, getGridCols } from "../utils";
import { EntityManagementModal } from "../components/EntityManagementModal";

const ENTITIES_MGMT = [
  { id: 'shop', icon: Store, title: "Shops", sub: "Merchants", color: "text-blue-600", bg: "bg-blue-50" },
  { id: 'person', icon: Users, title: "People", sub: "Khata / Split", color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: 'recurring', icon: Repeat, title: "Recurring", sub: "Utility Bills", color: "text-amber-600", bg: "bg-amber-50" },
  { id: 'subscription', icon: CreditCardIcon, title: "Subs", sub: "Digital Services", color: "text-pink-600", bg: "bg-pink-50" },
  { id: 'giftcard', icon: Gift, title: "Gift Cards", sub: "Balances", color: "text-orange-600", bg: "bg-orange-50" },
  { id: 'protection', icon: ShieldCheck, title: "Protection", sub: "Insure & Warranty", color: "text-cyan-600", bg: "bg-cyan-50" },
  { id: 'asset', icon: Building, title: "Assets", sub: "Vehicles & Home", color: "text-indigo-600", bg: "bg-indigo-50" },
  { id: 'inventory', icon: Package, title: "Inventory", sub: "Consumables", color: "text-orange-600", bg: "bg-orange-50" },
  { id: 'employment', icon: Briefcase, title: "Employment", sub: "Tax & Salary", color: "text-slate-600", bg: "bg-slate-50", isSpecial: true },
];
import { ProfileManagementModal } from "../components/ProfileManagementModal";
import { CategoryManagementModal } from "../components/CategoryManagementModal";
import { useFinance } from "../context/FinanceContext";
import { toast } from "sonner";

const SettingCell = ({ icon: Icon, title, sub, color, bg, onClick, active = null, onToggle = null }: any) => (
  <button
    onClick={onClick || onToggle}
    className="group p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-slate-50 transition-all flex flex-col items-center text-center gap-3 active:scale-95 bg-white shadow-sm relative overflow-hidden"
  >
    {active !== null && (
      <div className="absolute top-2 right-2">
        <div className={cn("w-2 h-2 rounded-full", active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-200")} />
      </div>
    )}
    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", bg, color)}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="font-bold text-slate-800 text-xs leading-tight">{title}</p>
      <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-tighter opacity-70">{sub}</p>
    </div>
  </button>
);

const WipeConfirmInput = ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) => {
  const [val, setVal] = React.useState('');
  return (
    <div className="space-y-3">
      <input value={val} onChange={e => setVal(e.target.value)} placeholder="Type WIPE" className="w-full border border-red-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-400 text-red-600 bg-red-50 placeholder:text-red-300" />
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-600">Cancel</button>
        <button onClick={onConfirm} disabled={val !== 'WIPE'} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold disabled:opacity-40 hover:bg-red-700 transition-colors">Delete Everything</button>
      </div>
    </div>
  );
};

export const Settings = () => {
  const { resetData, wipeData, restoreData, transactions, accounts, investments, entities, profile, updateProfile } = useFinance();

  const getStoredBool = (key: string, def: boolean) => {
    const v = localStorage.getItem(key); return v === null ? def : v === 'true';
  };
  const [locks, setLocks] = useState({ biometric: getStoredBool('s_biometric', false), hideBalances: getStoredBool('s_hideBalances', false) });
  const [sync, setSync] = useState({ drive: getStoredBool('s_drive', false) });
  const [reminders, setReminders] = useState({ bills: getStoredBool('s_bills', false), dailyLog: getStoredBool('s_dailyLog', false), overdue: getStoredBool('s_overdue', false) });
  const [subCatsEnabled, setSubCatsEnabled] = useState(() => getStoredBool('s_subcats', true));

  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [wipePhase, setWipePhase] = useState(1);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinStep, setPinStep] = useState<'view' | 'set' | 'confirm'>('view');
  const [pinInput, setPinInput] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [hasPin] = useState(() => !!localStorage.getItem('s_pin'));
  const [twoFactor, setTwoFactor] = useState(() => getStoredBool('s_2fa', false));

  useEffect(() => { localStorage.setItem('s_biometric', String(locks.biometric)); }, [locks.biometric]);
  useEffect(() => { localStorage.setItem('s_hideBalances', String(locks.hideBalances)); }, [locks.hideBalances]);
  useEffect(() => { localStorage.setItem('s_drive', String(sync.drive)); }, [sync.drive]);
  useEffect(() => { localStorage.setItem('s_bills', String(reminders.bills)); }, [reminders.bills]);
  useEffect(() => { localStorage.setItem('s_dailyLog', String(reminders.dailyLog)); }, [reminders.dailyLog]);
  useEffect(() => { localStorage.setItem('s_overdue', String(reminders.overdue)); }, [reminders.overdue]);
  useEffect(() => { localStorage.setItem('s_2fa', String(twoFactor)); }, [twoFactor]);
  useEffect(() => { localStorage.setItem('s_subcats', String(subCatsEnabled)); }, [subCatsEnabled]);

  const handleExport = () => {
    const data = { transactions, accounts, investments, entities, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `moneymanager-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('Backup exported!');
  };

  const handleRestore = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!data.transactions && !data.accounts) {
          toast.error('Invalid backup file format');
          return;
        }
        restoreData(data);
        toast.success('Data restored successfully!');
      } catch {
        toast.error('Failed to read backup file');
      }
    };
    input.click();
  };



  const handleReminderToggle = async (key: 'bills' | 'dailyLog' | 'overdue') => {
    const turningOn = !reminders[key];
    if (turningOn && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'denied') {
        toast.error('Notifications blocked. Enable them in browser settings.');
        return;
      }
      if (permission === 'granted') {
        const label = key === 'bills' ? 'bill due date' : key === 'overdue' ? 'overdue alerts' : 'daily log';
        toast.success(`You'll be reminded about ${label}`);
        if (key === 'dailyLog') {
          new Notification('MoneyManager', { body: 'Reminders are now active! You\'ll be notified at 9 PM daily.' });
        }
      }
    } else if (!turningOn) {
      toast.success('Reminder disabled');
    }
    setReminders(r => ({ ...r, [key]: !r[key] }));
  };

  const handleTheme = () => {
    const themes = ['indigo', 'emerald', 'rose', 'amber'];
    const current = localStorage.getItem('s_theme') || 'indigo';
    const next = themes[(themes.indexOf(current) + 1) % themes.length];
    localStorage.setItem('s_theme', next);
    document.documentElement.setAttribute('data-theme', next);
    toast.success(`Theme switched to ${next.charAt(0).toUpperCase() + next.slice(1)}`);
  };

  const handleDriveSync = () => {
    toast.info('Google Drive sync requires account integration — coming soon');
    setSync(s => ({ ...s, drive: !s.drive }));
  };

  const handlePinSave = () => {
    if (pinInput.length !== 4) { toast.error('PIN must be 4 digits'); return; }
    if (pinStep === 'set') { setPinStep('confirm'); return; }
    if (pinInput !== pinConfirm) { toast.error('PINs do not match'); setPinInput(''); setPinConfirm(''); setPinStep('set'); return; }
    localStorage.setItem('s_pin', pinInput);
    setTwoFactor(true);
    toast.success('PIN set! App will lock on next visit.');
    setShowPinModal(false);
    setPinInput(''); setPinConfirm(''); setPinStep('view');
  };

  const handlePinClear = () => {
    localStorage.removeItem('s_pin');
    setTwoFactor(false);
    toast.success('PIN removed');
    setShowPinModal(false);
  };

  const [activeEntity, setActiveEntity] = useState<string | null>(null);
  const openEntity = (entity: string) => setActiveEntity(entity);
  const closeEntity = () => setActiveEntity(null);

  const SectionHeader = ({ icon: Icon, title, desc }: any) => (
    <div className="flex items-center gap-3 mb-4 px-1">
      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
        <Icon className="w-4 h-4 text-indigo-600" />
      </div>
      <div>
        <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider leading-none">{title}</h3>
        {desc && <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tight">{desc}</p>}
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-12 pb-24">


      {/* 1. Categories */}
      <div>
        <SectionHeader icon={Tags} title="Categories" desc="Structure & Tagging Insights" />
        <div className="grid grid-cols-3 gap-3">
          <SettingCell icon={Tags} title="Categories" sub="Master List" color="text-emerald-600" bg="bg-emerald-50" onClick={() => setShowCategoriesModal(true)} />
          <SettingCell
            icon={Layers} title="Sub Categories" sub={subCatsEnabled ? "Enabled" : "Disabled"}
            color="text-emerald-600" bg="bg-emerald-50"
            active={subCatsEnabled}
            onToggle={() => { setSubCatsEnabled(v => !v); toast.success(subCatsEnabled ? 'Sub categories hidden in forms' : 'Sub categories enabled in forms'); }}
          />
          <SettingCell icon={PieChart} title="Classification" sub="Needs / Wants" color="text-emerald-600" bg="bg-emerald-50" onClick={() => toast.info('Need / Want / Invest / Discretionary — auto-set when you pick a category in the transaction form')} />
        </div>
      </div>

      {/* 2. Entities Management */}
      <div>
        <SectionHeader icon={Database} title="Entities Management" desc="Core financial ledgers & relations" />
        <div className={cn("grid gap-3", getGridCols(ENTITIES_MGMT.length))}>
          {ENTITIES_MGMT.map((item) => (
            <SettingCell
              key={item.id}
              icon={item.icon} title={item.title} sub={item.sub} color={item.color} bg={item.bg}
              onClick={() => item.isSpecial ? setShowProfileModal(true) : openEntity(item.id)}
            />
          ))}
        </div>
      </div>

      {/* 3. Localization */}
      <div>
        <SectionHeader icon={Globe} title="Localization" desc="Currency & Regional Standards" />
        <div className={cn("grid gap-3", getGridCols(3))}>
          <SettingCell icon={IndianRupee} title="Currency" sub="INR (₹) Lakhs" color="text-indigo-600" bg="bg-indigo-50" onClick={() => toast.info('Multi-currency support coming soon')} />
          <SettingCell icon={Clock} title="Timezone" sub="GMT +5:30 (IST)" color="text-indigo-600" bg="bg-indigo-50" onClick={() => toast.info('Timezone selection coming soon')} />
          <SettingCell icon={Calendar} title="Fiscal Year" sub="April Start" color="text-indigo-600" bg="bg-indigo-50" onClick={() => toast.info('Fiscal year config coming soon')} />
        </div>
      </div>

      {/* 4. Reminders */}
      <div>
        <SectionHeader icon={Bell} title="Reminders" desc="Automated Financial Alerts" />
        <div className={cn("grid gap-3", getGridCols(3))}>
          <SettingCell
            icon={Bell} title="Bills" sub="Due Notifications" color="text-amber-600" bg="bg-amber-50"
            active={reminders.bills} onToggle={() => handleReminderToggle('bills')}
          />
          <SettingCell
            icon={Clock} title="Daily Log" sub="9:00 PM Prompt" color="text-amber-600" bg="bg-amber-50"
            active={reminders.dailyLog} onToggle={() => handleReminderToggle('dailyLog')}
          />
          <SettingCell icon={AlertTriangle} title="Overdue" sub="Critical Alerts" color="text-amber-600" bg="bg-amber-50" active={reminders.overdue} onToggle={() => handleReminderToggle('overdue')} />
        </div>
      </div>

      {/* 5. Profile */}
      <div>
        <SectionHeader icon={Users} title="Profile" desc="Data Sync & Portability" />
        <div className="grid grid-cols-3 gap-3">
          <SettingCell
            icon={Cloud} title="Drive Sync" sub="Auto Backup" color="text-blue-600" bg="bg-blue-50"
            active={sync.drive} onToggle={handleDriveSync}
          />
          <SettingCell icon={Upload} title="Restore" sub="From JSON" color="text-blue-600" bg="bg-blue-50" onClick={handleRestore} />
          <SettingCell icon={Download} title="Backup" sub="To JSON" color="text-blue-600" bg="bg-blue-50" onClick={handleExport} />
        </div>
      </div>

      {/* 6. Privacy & Security */}
      <div>
        <SectionHeader icon={Shield} title="Vault Security" desc="Access Control & Biometrics" />
        <div className="grid grid-cols-2 gap-3">
          <SettingCell
            icon={Fingerprint} title="Biometric Lock" sub={locks.biometric ? "Active" : "Disabled"} color="text-indigo-600" bg="bg-indigo-50"
            active={locks.biometric} 
            onToggle={() => { 
              const newState = !locks.biometric;
              setLocks(s => ({ ...s, biometric: newState })); 
              if (newState && !localStorage.getItem('s_pin')) {
                setShowPinModal(true);
              }
              toast.success(newState ? 'Biometric authentication enabled' : 'Biometric lock disabled');
            }}
          />
          <SettingCell
            icon={ShieldCheck} title="Security PIN" sub={hasPin ? "Set" : "Not Set"} color="text-indigo-600" bg="bg-indigo-50"
            active={hasPin} 
            onClick={() => setShowPinModal(true)}
          />
        </div>
      </div>



      {/* 8. Danger Zone */}
      <div>
        <SectionHeader icon={AlertTriangle} title="Danger Zone" desc="Destructive System Actions" />
        <div className="grid grid-cols-2 gap-3">
          <SettingCell icon={Database} title="Reset" sub="Keep Accounts" color="text-red-600" bg="bg-red-50" onClick={() => setConfirmReset(true)} />
          <SettingCell icon={LogOut} title="Wipe" sub="Nuclear Reset" color="text-red-600" bg="bg-red-50" onClick={() => { setWipePhase(1); setConfirmWipe(true); }} />
        </div>
      </div>

      <div className="text-center mt-12 pb-12">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">MoneyManager v1.2.0 • Pro Edition</p>
      </div>



      {showCategoriesModal && (
        <CategoryManagementModal onClose={() => setShowCategoriesModal(false)} />
      )}

      {/* PIN / Two Factor Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl text-slate-800">
                {pinStep === 'view' ? 'App PIN' : pinStep === 'set' ? 'Set New PIN' : 'Confirm PIN'}
              </h3>
              <button onClick={() => { setShowPinModal(false); setPinInput(''); setPinConfirm(''); setPinStep('view'); }} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"><X className="w-5 h-5" /></button>
            </div>

            {pinStep === 'view' ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-500 mb-4">
                  {hasPin || twoFactor ? 'A PIN is currently set. The app will prompt for it on startup.' : 'Set a 4-digit PIN to lock the app on startup.'}
                </p>
                <button onClick={() => { setPinInput(''); setPinStep('set'); }} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">
                  {hasPin || twoFactor ? 'Change PIN' : 'Set PIN'}
                </button>
                {(hasPin || twoFactor) && (
                  <button onClick={handlePinClear} className="w-full py-3 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50">Remove PIN</button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-500">{pinStep === 'set' ? 'Enter a 4-digit PIN' : 'Enter PIN again to confirm'}</p>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pinStep === 'set' ? pinInput : pinConfirm}
                  onChange={e => pinStep === 'set' ? setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4)) : setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  className="w-full text-center text-3xl font-black tracking-[1rem] bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-indigo-600 outline-none"
                  autoFocus
                />
                <button
                  onClick={handlePinSave}
                  disabled={(pinStep === 'set' ? pinInput : pinConfirm).length !== 4}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-40"
                >
                  {pinStep === 'set' ? 'Next' : 'Confirm & Save'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm Reset Modal */}
      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-xl text-slate-800 mb-2">Reset Data?</h3>
            <p className="text-sm text-slate-500 mb-6">This will restore the default seed transactions. Your accounts and settings will be kept.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmReset(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={() => { resetData(); setConfirmReset(false); toast.success('Data reset to seed!'); }} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700">Reset</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Wipe Modal */}
      {confirmWipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            {wipePhase === 1 ? (
              <>
                <h3 className="font-bold text-xl text-red-600 mb-2">Wipe All Data?</h3>
                <p className="text-sm text-slate-500 mb-6">This will permanently delete EVERYTHING. This cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setConfirmWipe(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-600">Cancel</button>
                  <button onClick={() => setWipePhase(2)} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold">Continue</button>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-bold text-xl text-red-600 mb-2">Are you absolutely sure?</h3>
                <p className="text-sm text-slate-500 mb-6">Type <strong>WIPE</strong> to confirm.</p>
                <WipeConfirmInput onConfirm={() => { wipeData(); setConfirmWipe(false); }} onCancel={() => setConfirmWipe(false)} />
              </>
            )}
          </div>
        </div>
      )}

      {activeEntity && (
        <EntityManagementModal type={activeEntity as any} onClose={closeEntity} />
      )}
      {showProfileModal && (
        <ProfileManagementModal onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  );
};
