import React, { useState } from "react";
import { X, Briefcase, User, Landmark, Plus, Trash2, MapPin, Banknote } from "lucide-react";
import { useFinance, EmployerRecord } from "../context/FinanceContext";
import { toast } from "sonner";

export const ProfileManagementModal = ({ onClose }: { onClose: () => void }) => {
  const { profile, updateProfile } = useFinance();
  const [formData, setFormData] = useState({
    firstName: profile.firstName || "",
    lastName: profile.lastName || "",
    companyName: profile.companyName || "",
    currentEmployerFrom: profile.currentEmployerFrom || "",
    currentEmployerTo: profile.currentEmployerTo || "",
    currentLocation: profile.currentLocation || "",
    salaryBand: profile.salaryBand || "",
    taxRegime: profile.taxRegime || "new",
    salaryCurrency: profile.salaryCurrency || "INR",
    pastEmployers: profile.pastEmployers || [],
    baseCurrency: profile.baseCurrency || "INR",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    toast.success("Profile updated successfully");
    onClose();
  };

  const addPastEmployer = () => {
    setFormData({
      ...formData,
      pastEmployers: [...formData.pastEmployers, { name: '', periodFrom: '', periodTo: '' }]
    });
  };

  const removePastEmployer = (index: number) => {
    setFormData({
      ...formData,
      pastEmployers: formData.pastEmployers.filter((_, i) => i !== index)
    });
  };

  const updatePastEmployer = (index: number, field: string, value: string) => {
    const newEmployers = [...formData.pastEmployers];
    newEmployers[index] = { ...newEmployers[index], [field]: value };
    setFormData({ ...formData, pastEmployers: newEmployers });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
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
          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Contact Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> First Name</label>
                <input 
                  type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})}
                  className="w-full bg-slate-50 border-0 px-4 py-3 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600 outline-none"
                  placeholder="John"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Last Name</label>
                <input 
                  type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})}
                  className="w-full bg-slate-50 border-0 px-4 py-3 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600 outline-none"
                  placeholder="Doe"
                />
              </div>
            </div>
          </div>

          {/* Employment & Tax */}
          <div className="space-y-4 pt-4 border-t border-slate-50">
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Employment & Tax</h3>
            
            {/* Current Employer */}
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> Current Employer</label>
                <input 
                  type="text" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})}
                  className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600 outline-none"
                  placeholder="Acme Inc."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Period From</label>
                  <input 
                    type="month" value={formData.currentEmployerFrom} onChange={e => setFormData({...formData, currentEmployerFrom: e.target.value})}
                    className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Period To</label>
                  <input 
                    type="month" value={formData.currentEmployerTo} onChange={e => setFormData({...formData, currentEmployerTo: e.target.value})}
                    className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Current Location</label>
                  <select 
                    value={formData.currentLocation} onChange={e => setFormData({...formData, currentLocation: e.target.value})}
                    className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600 outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Select Location Type</option>
                    <option value="metro">Metro City (Tier 1)</option>
                    <option value="non-metro">Non-Metro (Tier 2/3)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Banknote className="w-3.5 h-3.5" /> Salary Currency</label>
                  <select 
                    value={formData.salaryCurrency} onChange={e => setFormData({...formData, salaryCurrency: e.target.value})}
                    className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600 outline-none appearance-none cursor-pointer"
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">Current Salary Range (Annual)</label>
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
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Landmark className="w-3.5 h-3.5" /> Suggested Tax Regime</label>
                <select 
                  value={formData.taxRegime} onChange={e => setFormData({...formData, taxRegime: e.target.value as any})}
                  className="w-full bg-slate-50 border-0 px-4 py-3 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600 outline-none appearance-none cursor-pointer"
                >
                  <option value="new">New Tax Regime (Lower Rates)</option>
                  <option value="old">Old Tax Regime (Exemptions)</option>
                </select>
              </div>
            </div>

            {/* Past Employers List */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">Past Employers</label>
                <button 
                  type="button" 
                  onClick={addPastEmployer}
                  className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg hover:bg-indigo-100 flex items-center gap-1 uppercase tracking-wider transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add Past Employer
                </button>
              </div>
              <div className="space-y-3">
                {formData.pastEmployers.map((emp, index) => (
                  <div key={index} className="flex flex-wrap md:flex-nowrap gap-3 items-end p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex-1 min-w-[120px] space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Employer Name</label>
                      <input 
                        type="text" value={emp.name} onChange={e => updatePastEmployer(index, 'name', e.target.value)}
                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-600 outline-none"
                        placeholder="Previous Co."
                      />
                    </div>
                    <div className="w-28 space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">From</label>
                      <input 
                        type="month" value={emp.periodFrom} onChange={e => updatePastEmployer(index, 'periodFrom', e.target.value)}
                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-600 outline-none"
                      />
                    </div>
                    <div className="w-28 space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">To</label>
                      <input 
                        type="month" value={emp.periodTo} onChange={e => updatePastEmployer(index, 'periodTo', e.target.value)}
                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-600 outline-none"
                      />
                    </div>
                    <button 
                      type="button" onClick={() => removePastEmployer(index)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mb-0.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {formData.pastEmployers.length === 0 && (
                  <div className="p-4 border-2 border-dashed border-slate-100 rounded-xl text-center">
                    <p className="text-xs text-slate-400 font-semibold">No past employers added yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </form>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3 shrink-0">
          <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-white rounded-xl transition-all shadow-sm border border-slate-200/50">Cancel</button>
          <button type="button" onClick={handleSubmit} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95">Save Changes</button>
        </div>
      </div>
    </div>
  );
};
