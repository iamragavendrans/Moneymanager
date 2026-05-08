import React, { useState } from "react";
import { X, Briefcase, User, MapPin, Phone, Mail, Calendar, Home, Building } from "lucide-react";
import { useFinance } from "../context/FinanceContext";
import { toast } from "sonner";
import { LocationInput } from "./LocationInput";

export const ProfileManagementModal = ({ onClose }: { onClose: () => void }) => {
  const { profile, updateProfile } = useFinance();
  const [formData, setFormData] = useState({
    firstName: profile.firstName || "",
    lastName: profile.lastName || "",
    mobileNumber: profile.mobileNumber || "",
    emailId: profile.emailId || "",
    dob: profile.dob || "",
    employerName: profile.employerName || "",
    employerLocation: profile.employerLocation || "",
    homeLocation: profile.homeLocation || "",
    currentStayName: profile.currentStayName || "",
    currentStayLocation: profile.currentStayLocation || "",
    logoDevToken: profile.logoDevToken || "",
    brandfetchClientId: profile.brandfetchClientId || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    toast.success("Identity updated successfully");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800 font-display">Personal Information</h2>
            <p className="text-xs text-slate-500 font-medium">Manage your identity and residence details</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
          {/* Personal Identity */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Personal Identity</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-indigo-500" /> First Name</label>
                <input 
                  type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})}
                  className="w-full bg-slate-50 border-0 px-4 py-3 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600 outline-none"
                  placeholder="John"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-indigo-500" /> Last Name</label>
                <input 
                  type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})}
                  className="w-full bg-slate-50 border-0 px-4 py-3 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600 outline-none"
                  placeholder="Doe"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-indigo-500" /> Mobile Number</label>
                <input 
                  type="tel" value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})}
                  className="w-full bg-slate-50 border-0 px-4 py-3 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600 outline-none"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-indigo-500" /> Email ID</label>
                <input 
                  type="email" value={formData.emailId} onChange={e => setFormData({...formData, emailId: e.target.value})}
                  className="w-full bg-slate-50 border-0 px-4 py-3 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600 outline-none"
                  placeholder="john.doe@example.com"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-indigo-500" /> Date of Birth</label>
                <input 
                  type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})}
                  className="w-full bg-slate-50 border-0 px-4 py-3 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600 outline-none"
                />
                <p className="text-[10px] text-slate-400 font-medium ml-1 mt-1">* Used to compare financial scores with your age group literacy</p>
              </div>
            </div>
          </div>

          {/* Employer & Work */}
          <div className="space-y-4 pt-4 border-t border-slate-50">
            <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Employer & Work</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-emerald-500" /> Employer Name</label>
                <input 
                  type="text" value={formData.employerName} onChange={e => setFormData({...formData, employerName: e.target.value})}
                  className="w-full bg-slate-50 border-0 px-4 py-3 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-600 outline-none"
                  placeholder="Acme Inc."
                />
              </div>
              <LocationInput 
                label="Work Location"
                value={formData.employerLocation}
                onChange={val => setFormData({...formData, employerLocation: val})}
                accentColor="emerald"
                icon={<MapPin className="w-3.5 h-3.5 text-emerald-500" />}
                placeholder="e.g. Whitefield, Bangalore"
              />
            </div>
          </div>

          {/* Residential Mapping */}
          <div className="space-y-4 pt-4 border-t border-slate-50">
            <h3 className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em]">Residential Mapping</h3>
            
            <div className="space-y-4">
              <LocationInput 
                label="Home Location (Permanent)"
                value={formData.homeLocation}
                onChange={val => setFormData({...formData, homeLocation: val})}
                accentColor="rose"
                icon={<Home className="w-3.5 h-3.5 text-rose-500" />}
                placeholder="Street, City, State"
              />

              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold text-slate-700">Current Stay (If different)</h4>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white px-2 py-0.5 rounded-full border border-slate-100">Optional</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-rose-400" /> Stay Name (PG/Apartment)</label>
                    <input 
                      type="text" value={formData.currentStayName} onChange={e => setFormData({...formData, currentStayName: e.target.value})}
                      className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-rose-600 outline-none"
                      placeholder="e.g. Zolo Stay"
                    />
                  </div>
                  <LocationInput 
                    label="Stay Location"
                    value={formData.currentStayLocation}
                    onChange={val => setFormData({...formData, currentStayLocation: val})}
                    accentColor="rose"
                    icon={<MapPin className="w-3.5 h-3.5 text-rose-400" />}
                    placeholder="e.g. HSR Layout"
                  />
                </div>
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
