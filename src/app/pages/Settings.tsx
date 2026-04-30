import React from "react";
import { Lock, Fingerprint, Palette, Cloud, Database, Download, Shield, IndianRupee, Globe, LayoutTemplate } from "lucide-react";

export const Settings = () => {
  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6 pb-24">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Preferences</h2>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
          <img 
            src="/src/imports/Untitled-2026-04-30-1618.png" 
            alt="Profile" 
            className="w-16 h-16 rounded-full border-2 border-white shadow-sm object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
          <div>
            <h3 className="font-bold text-slate-800 text-lg">My Profile</h3>
            <p className="text-sm text-slate-500">Free Local-First Account</p>
          </div>
        </div>
        
        <div className="divide-y divide-slate-100">
          <div className="p-5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Primary Currency</p>
                <p className="text-sm text-slate-500">Indian Rupee (INR)</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-indigo-600">Change</span>
          </div>

          <div className="p-5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Number Format</p>
                <p className="text-sm text-slate-500">Lakhs & Crores (1,00,000)</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-indigo-600">Change</span>
          </div>

          <div className="p-5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <LayoutTemplate className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Default Tab</p>
                <p className="text-sm text-slate-500">Dashboard</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-indigo-600">Change</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-500" />
            Privacy & Security
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">Biometric Lock</p>
              <p className="text-sm text-slate-500">Require Face ID / Fingerprint to open app</p>
            </div>
            <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">Hide Balances</p>
              <p className="text-sm text-slate-500">Blur numbers until tapped</p>
            </div>
            <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-500" />
            Data & Sync
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">Local Storage Only</p>
              <p className="text-sm text-slate-500">Your data never leaves your device</p>
            </div>
            <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
            <div>
              <p className="font-semibold text-slate-800">Export to CSV</p>
              <p className="text-sm text-slate-500">Download your raw transaction data</p>
            </div>
            <Download className="w-5 h-5 text-slate-400" />
          </div>
          <div className="p-5 flex items-center justify-between opacity-50">
            <div>
              <p className="font-semibold text-slate-800 flex items-center gap-2">
                Encrypted Cloud Sync
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md uppercase font-bold tracking-wider">Coming Soon</span>
              </p>
              <p className="text-sm text-slate-500">Optional end-to-end encrypted backup</p>
            </div>
            <Cloud className="w-5 h-5 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-500" />
            Appearance
          </h3>
        </div>
        <div className="p-5">
           <div className="flex gap-4">
              <div className="flex-1 border-2 border-indigo-600 rounded-xl p-4 text-center cursor-pointer bg-indigo-50">
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 mx-auto mb-2"></div>
                <p className="font-semibold text-slate-800">Light</p>
              </div>
              <div className="flex-1 border-2 border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-slate-300">
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 mx-auto mb-2"></div>
                <p className="font-semibold text-slate-800">Dark</p>
              </div>
           </div>
        </div>
      </div>

      <div className="text-center mt-8 text-sm text-slate-400 font-medium">
        FinLocal v1.0.0 • Made in India
      </div>
    </div>
  );
};
