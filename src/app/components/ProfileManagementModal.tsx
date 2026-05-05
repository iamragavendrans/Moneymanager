import React, { useState } from "react";
import { X, Briefcase, User, Mail, Shield, Globe, Landmark } from "lucide-react";
import { useFinance } from "../context/FinanceContext";
import { cn } from "../utils";
import { toast } from "sonner";

export const ProfileManagementModal = ({ onClose }: { onClose: () => void }) => {
  const { profile, updateProfile } = useFinance();
  const [formData, setFormData] = useState({
    userName: profile.userName || "",
    userEmail: profile.userEmail || "",
    employer: profile.employer || "",
    salaryBand: profile.salaryBand || "",
    taxRegime: profile.taxRegime || "new",
    baseCurrency: profile.baseCurrency || "INR",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    toast.success("Profile updated successfully");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800 font-display">Financial Identity</h2>
            <p className="text-xs text-slate-500 font-medium">Personalize your wealth experience</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Contact Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Full Name</label>
                <input 
                  type="text" value={formData.userName} onChange={e => setFormData({...formData, userName: e.target.value})}
                  className="w-full bg-slate-50 border-0 px-4 py-3 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600 outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</label>
                <input 
                  type="email" value={formData.userEmail} onChange={e => setFormData({...formData, userEmail: e.target.value})}
                  className="w-full bg-slate-50 border-0 px-4 py-3 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600 outline-none"
                  placeholder="john@example.com"
                />
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div className="space-y-4 pt-4 border-t border-slate-50">
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Employment & Tax</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> Current Employer</label>
                <input 
                  type="text" value={formData.employer} onChange={e => setFormData({...formData, employer: e.target.value})}
                  className="w-full bg-slate-50 border-0 px-4 py-3 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600 outline-none"
                  placeholder="Acme Inc."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Landmark className="w-3.5 h-3.5" /> Tax Regime</label>
                <select 
                  value={formData.taxRegime} onChange={e => setFormData({...formData, taxRegime: e.target.value as any})}
                  className="w-full bg-slate-50 border-0 px-4 py-3 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600 outline-none appearance-none cursor-pointer"
                >
                  <option value="new">New Tax Regime (Lower Rates)</option>
                  <option value="old">Old Tax Regime (Exemptions)</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">Salary Band (Annual)</label>
              <select 
                value={formData.salaryBand} onChange={e => setFormData({...formData, salaryBand: e.target.value})}
                className="w-full bg-slate-50 border-0 px-4 py-3 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600 outline-none appearance-none cursor-pointer"
              >
                <option value="">Select range...</option>
                <option value="0-5">₹0 - ₹5 Lakhs</option>
                <option value="5-10">₹5 - ₹10 Lakhs</option>
                <option value="10-20">₹10 - ₹20 Lakhs</option>
                <option value="20-50">₹20 - ₹50 Lakhs</option>
                <option value="50+">₹50 Lakhs+</option>
              </select>
            </div>
          </div>

          {/* Regional Settings */}
          <div className="space-y-4 pt-4 border-t border-slate-50">
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Localization</h3>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Primary Currency</label>
              <select 
                value={formData.baseCurrency} onChange={e => setFormData({...formData, baseCurrency: e.target.value})}
                className="w-full bg-slate-50 border-0 px-4 py-3 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600 outline-none appearance-none cursor-pointer"
              >
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
              </select>
            </div>
          </div>
        </form>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <button onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-white rounded-xl transition-all">Cancel</button>
          <button onClick={handleSubmit} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95">Save Changes</button>
        </div>
      </div>
    </div>
  );
};
