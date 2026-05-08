import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  X, Plus, Search, GripVertical, ChevronRight, ChevronDown,
  Edit2, Trash2, Star, StarOff, EyeOff, Eye, RotateCcw,
  Tag, Palette, Check, AlertTriangle, Move, Sparkles, Layers, Zap
} from "lucide-react";
import { cn } from "../utils";
import { useFinance } from "../context/FinanceContext";
import {
  CategoryDef, NeedWantType, CATEGORY_ICON_MAP,
  CLASSIFICATION_COLORS, DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES,
  SubCategory
} from "../utils/categories";
import { toast } from "sonner";
import { IconPickerModal } from "./IconPickerModal";
import { CategoryIcon } from "./CategoryIcon";

// ─── helpers ────────────────────────────────────────────────────────────────
const PALETTE = [
  "#ef4444","#f97316","#f59e0b","#10b981","#06b6d4","#3b82f6",
  "#6366f1","#8b5cf6","#d946ef","#ec4899","#64748b","#334155"
];
const CLASSIFICATIONS: NeedWantType[] = ["need","want","investment","discretionary"];
const CLSF_LABEL: Record<NeedWantType, string> = { need:"Need", want:"Want", investment:"Invest", discretionary:"Disc" };

function ClassBadge({ cls, size = "sm" }: { cls: NeedWantType; size?: "xs"|"sm" }) {
  const { bg, text, border } = CLASSIFICATION_COLORS[cls];
  return (
    <span className={cn("font-black uppercase rounded-full tracking-wider leading-none",
      size === "xs" ? "text-[6px] px-1.5 py-0.5" : "text-[8px] px-2 py-0.5",
      bg, text, border, "border"
    )}>{CLSF_LABEL[cls]}</span>
  );
}

// ─── Inline edit form ───────────────────────────────────────────────────────
interface EditFormProps {
  cat: Partial<CategoryDef>;
  onSave: (patch: Partial<CategoryDef>) => void;
  onCancel: () => void;
  isNew?: boolean;
}

function CategoryEditForm({ cat, onSave, onCancel, isNew }: EditFormProps) {
  const [name, setName] = useState(cat.name || "");
  const [icon, setIcon] = useState(cat.icon || "others");
  const [color, setColor] = useState(cat.color || "#6366f1");
  const [cls, setCls] = useState<NeedWantType>(cat.classification || "want");
  const [budgetLimit, setBudgetLimit] = useState(cat.budgetLimit || 0);
  const [monthlyLimit, setMonthlyLimit] = useState(cat.monthlyLimit || 0);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <div className="bg-white border border-slate-100 rounded-[2rem] p-6 space-y-6 animate-in zoom-in-95 duration-150 shadow-xl shadow-slate-200/50">
      <div className="space-y-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Basic Identity</p>
      <div className="flex gap-2 items-center">
        {/* Icon button */}
        <div className="relative">
          <button type="button" onClick={() => setShowIconPicker(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm border border-indigo-200 bg-white hover:border-indigo-400 transition-all overflow-hidden"
            style={{ borderColor: color }}>
            <CategoryIcon icon={icon} color={color} size={20} />
          </button>
          {showIconPicker && (
            <IconPickerModal 
              initialIcon={icon}
              onClose={() => setShowIconPicker(false)}
              onSelect={(newIcon) => { setIcon(newIcon); setShowIconPicker(false); }}
              title="Category Icon"
            />
          )}
        </div>

        {/* Color dot */}
        <div className="relative">
          <button type="button" onClick={() => { setShowColorPicker(v => !v); setShowIconPicker(false); }}
            className="w-10 h-10 rounded-xl border-2 border-white shadow-md hover:scale-110 transition-transform"
            style={{ background: color }} />
          {showColorPicker && (
            <div className="absolute top-12 left-0 z-[200] bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl w-64 animate-in zoom-in-95 duration-200">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Select Accent Color</p>
              <div className="grid grid-cols-4 gap-4">
                {PALETTE.map(c => (
                  <button key={c} type="button" onClick={() => { setColor(c); setShowColorPicker(false); }}
                    className="w-8 h-8 rounded-full hover:scale-110 transition-transform ring-offset-2 hover:ring-2 ring-slate-200"
                    style={{ background: c, outline: color === c ? `4px solid ${c}44` : "none" }} />
                ))}
              </div>
            </div>
          )}
        </div>

        <input
          value={name} onChange={e => setName(e.target.value)}
          placeholder="Category name..."
          className="flex-1 text-sm font-bold bg-white border border-indigo-200 px-3 py-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          autoFocus
        />
      </div>
    </div>

      {/* Classification */}
      <div className="space-y-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Classification</p>
        <div className="flex gap-2 flex-wrap">
          {CLASSIFICATIONS.map(c => (
            <button key={c} type="button" onClick={() => setCls(c)}
              className={cn("text-[9px] font-black uppercase px-4 py-2 rounded-full tracking-widest border transition-all duration-300",
                cls === c
                  ? cn(CLASSIFICATION_COLORS[c].bg, CLASSIFICATION_COLORS[c].text, CLASSIFICATION_COLORS[c].border, "shadow-md scale-105")
                  : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100"
              )}>
              {CLSF_LABEL[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Limits */}
      <div className="space-y-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Financial Limits</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative group">
            <input type="number" value={budgetLimit || ""} onChange={e => setBudgetLimit(Number(e.target.value))}
              placeholder="0"
              className="w-full text-xs font-black bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
            <label className="absolute -top-2 left-3 bg-white px-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">Budget</label>
          </div>
          <div className="relative group">
            <input type="number" value={monthlyLimit || ""} onChange={e => setMonthlyLimit(Number(e.target.value))}
              placeholder="0"
              className="w-full text-xs font-black bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
            <label className="absolute -top-2 left-3 bg-white px-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">Monthly</label>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-4 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-400 hover:bg-slate-50 uppercase tracking-[0.2em] transition-all">
          Cancel
        </button>
        <button type="button"
          disabled={!name.trim()}
          onClick={() => onSave({ name: name.trim(), icon, color, classification: cls, budgetLimit, monthlyLimit })}
          className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 disabled:opacity-30 shadow-lg shadow-slate-200 transition-all active:scale-[0.98]">
          {isNew ? "Create Category" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ─── Sub-category chip editor ───────────────────────────────────────────────
function SubCatEditor({ cat, onClose }: { cat: CategoryDef; onClose: () => void }) {
  const { updateCategory } = useFinance();
  const [children, setChildren] = useState<SubCategory[]>(cat.children || []);
  const [input, setInput] = useState("");
  const [inputIcon, setInputIcon] = useState("others");
  const [showInputIconPicker, setShowInputIconPicker] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [showEditIconPicker, setShowEditIconPicker] = useState(false);

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  
  const add = () => {
    const v = input.trim();
    if (v && !children.some(c => c.name === v)) { 
      setChildren(prev => [...prev, { id: slugify(v), name: v, icon: inputIcon, sortOrder: prev.length }]); 
      setInput(""); 
      setInputIcon("others");
    }
  };

  const remove = (id: string) => setChildren(prev => prev.filter(c => c.id !== id));
  
  const move = (id: string, dir: 'up' | 'down') => {
    const idx = children.findIndex(c => c.id === id);
    if (idx === -1) return;
    const newIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= children.length) return;
    const newChildren = [...children];
    [newChildren[idx], newChildren[newIdx]] = [newChildren[newIdx], newChildren[idx]];
    setChildren(newChildren);
  };

  const startEdit = (sc: SubCategory) => { 
    setEditId(sc.id); 
    setEditVal(sc.name); 
    setEditIcon(sc.icon || cat.icon || "others");
  };
  const saveEdit = () => {
    if (editVal.trim() && editId !== null) {
      setChildren(prev => prev.map(x => x.id === editId ? { ...x, name: editVal.trim(), icon: editIcon } : x));
    }
    setEditId(null); setEditVal(""); setEditIcon(""); setShowEditIconPicker(false);
  };

  const save = () => {
    updateCategory(cat.id, { 
      children,
      subcategories: children.map(c => c.name)
    });
    toast.success("Subcategories Updated");
    onClose();
  };

  useEffect(() => {
    updateCategory(cat.id, { 
      children,
      subcategories: children.map(c => c.name)
    });
  }, [children]);

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-5 space-y-5 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Layers className="w-3 h-3 text-indigo-500" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Category Structure</p>
        </div>
        <button onClick={onClose} className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest px-3 py-1.5 bg-indigo-50 rounded-full transition-colors">
          Close Editor
        </button>
      </div>

      {/* Modern Input Group with Icon Picker */}
      <div className="flex gap-3">
        <div className="relative">
          <button onClick={() => setShowInputIconPicker(true)}
            type="button"
            className="h-[52px] w-[52px] bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm hover:border-indigo-400 hover:shadow-md transition-all overflow-hidden shrink-0 group">
            <CategoryIcon icon={inputIcon} color={cat.color} size={26} />
          </button>
          {showInputIconPicker && (
            <IconPickerModal 
              initialIcon={inputIcon}
              onClose={() => setShowInputIconPicker(false)}
              onSelect={(newIcon) => { setInputIcon(newIcon); setShowInputIconPicker(false); }}
              title="Subcategory Icon"
            />
          )}
        </div>
        <div className="relative group flex-1">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
            placeholder="New subgroup name..."
            className="w-full text-xs font-bold bg-white border border-slate-100 shadow-sm px-5 h-[52px] rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none placeholder:text-slate-300 transition-all group-hover:shadow-md"
          />
          <button 
            onClick={add} 
            className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-[9px] font-black uppercase tracking-widest">Add</span>
          </button>
        </div>
      </div>

      {/* Hierarchy Grid (3x3 Style) */}
      <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar pb-2">
        {children.length === 0 ? (
          <div className="col-span-3 py-12 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
             <Layers className="w-8 h-8 mx-auto mb-3 text-slate-200" />
             <p className="text-[10px] font-bold text-slate-400 uppercase">No subcategories yet</p>
          </div>
        ) : children.map((sc: SubCategory) => (
          <div key={sc.id} 
            onClick={() => { if (editId !== sc.id) startEdit(sc); }}
            className={cn(
              "relative group flex flex-col items-center justify-center p-3 rounded-[2rem] border transition-all duration-300 h-32 cursor-pointer",
              editId === sc.id ? "bg-indigo-50 border-indigo-200 shadow-inner" : "bg-white border-slate-100 hover:border-transparent hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1"
            )}>
            {/* Icon Wrapper */}
            <div className="relative">
              <CategoryIcon 
                icon={editId === sc.id ? editIcon : (sc.icon || cat.icon || 'others')} 
                color={cat.color} 
                size={22} 
                withContainer
                className={cn(
                  "transition-all duration-500",
                  editId === sc.id ? "cursor-pointer hover:scale-110" : "group-hover:scale-110 group-hover:rotate-3"
                )}
                onClick={() => { if (editId === sc.id) setShowEditIconPicker(true); }}
              />
              
              {editId === sc.id && showEditIconPicker && (
                <IconPickerModal 
                  initialIcon={editIcon}
                  onClose={() => setShowEditIconPicker(false)}
                  onSelect={(newIcon) => { setEditIcon(newIcon); setShowEditIconPicker(false); }}
                  title="Edit Subgroup Icon"
                />
              )}
            </div>

            {/* Label / Input */}
            {editId === sc.id ? (
              <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditId(null); }}
                className="text-[10px] font-black text-center bg-transparent border-b border-indigo-300 outline-none text-indigo-600 w-full px-1" />
            ) : (
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight text-center leading-[1.1] w-full px-1 break-words line-clamp-2">{sc.name}</span>
            )}

            {/* Float Controls */}
            <div className={cn(
              "absolute top-2 right-2 flex flex-col gap-1 transition-all duration-300",
              editId === sc.id ? "opacity-100" : "opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
            )}>
               {editId === sc.id ? (
                 <button onClick={(e) => { e.stopPropagation(); saveEdit(); }} className="p-1.5 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600"><Check className="w-2.5 h-2.5" /></button>
               ) : (
                 <>
                   <button onClick={(e) => { e.stopPropagation(); startEdit(sc); }} className="p-1.5 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 rounded-lg shadow-sm hover:shadow-md transition-all"><Edit2 className="w-2.5 h-2.5" /></button>
                   <button onClick={(e) => { e.stopPropagation(); remove(sc.id); }} className="p-1.5 bg-white border border-slate-100 text-slate-400 hover:text-red-500 rounded-lg shadow-sm hover:shadow-md transition-all"><Trash2 className="w-2.5 h-2.5" /></button>
                 </>
               )}
            </div>

            {/* Reorder Buttons (Small) */}
            {!editId && (
              <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={(e) => { e.stopPropagation(); move(sc.id, 'up'); }} className="p-1 bg-slate-50 text-slate-400 hover:text-slate-800 rounded-md border border-slate-100"><ChevronRight className="w-2 h-2 -rotate-90" /></button>
                <button onClick={(e) => { e.stopPropagation(); move(sc.id, 'down'); }} className="p-1 bg-slate-50 text-slate-400 hover:text-slate-800 rounded-md border border-slate-100"><ChevronRight className="w-2 h-2 rotate-90" /></button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-2">
        <button onClick={save} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 active:scale-[0.98] flex items-center justify-center gap-3">
          <Zap className="w-4 h-4 text-amber-400" />
          Save Changes
        </button>
      </div>
    </div>
  );
}

// ─── Category Tile ──────────────────────────────────────────────────────────
function CategoryTile({ cat, onClick, dragProps }: any) {
  const { dragging, dragOver, onDragStart, onDragOver, onDrop, onDragEnd } = dragProps;
  const isDragging = dragging === cat.id;
  const isOver = dragOver === cat.id;

  return (
    <div
      draggable
      onDragStart={() => onDragStart(cat.id)}
      onDragOver={e => onDragOver(e, cat.id)}
      onDrop={() => onDrop(cat.id)}
      onDragEnd={onDragEnd}
      className={cn(
        "relative flex flex-col items-center justify-center p-3 rounded-[2rem] border transition-all duration-300 cursor-pointer group h-32 overflow-hidden",
        isDragging && "opacity-40 scale-90",
        isOver && "border-indigo-400 bg-indigo-50 shadow-xl shadow-indigo-100/50",
        !isDragging && !isOver && "border-slate-100 bg-white hover:border-transparent hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1",
        cat.disabled && "grayscale opacity-50"
      )}
      onClick={onClick}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" 
        style={{ background: `radial-gradient(circle at center, ${cat.color}, transparent)` }} />

      <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 relative z-10 overflow-hidden"
        style={{ background: cat.color + "15", color: cat.color, boxShadow: `0 8px 20px -6px ${cat.color}44` }}>
        <CategoryIcon icon={cat.icon} color={cat.color} size={28} />
      </div>

      <div className="text-center w-full relative z-10">
        <p className={cn("text-[11px] font-black uppercase tracking-tight truncate px-1 mb-1", cat.disabled ? "line-through text-slate-400" : "text-slate-800")}>
          {cat.name}
        </p>
        <div className="flex justify-center items-center gap-1.5">
          <ClassBadge cls={cat.classification} size="xs" />
          {cat.favorite && <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />}
        </div>
      </div>
    </div>
  );
}

// ─── Detail View ─────────────────────────────────────────────────────────────
function CategoryDetailView({ cat, onBack }: { cat: CategoryDef; onBack: () => void }) {
  const { updateCategory, deleteCategory } = useFinance();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const toggle = (field: "disabled" | "favorite") =>
    updateCategory(cat.id, { [field]: !cat[field] });

  return (
    <div className="space-y-6 animate-in slide-in-from-right-8 duration-500 pb-2">
      <div className="relative pt-2 pb-6 flex items-center gap-6 group/header">
         <button onClick={onBack} className="w-12 h-12 flex items-center justify-center bg-white shadow-sm hover:shadow-md border border-slate-100 rounded-full text-slate-400 hover:text-slate-800 transition-all hover:-translate-x-1 shrink-0">
           <ChevronRight className="w-5 h-5 rotate-180" />
         </button>
         
         <div className="flex items-center gap-5 flex-1">
           <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl shadow-slate-200/50 border border-slate-50 transition-transform duration-500 group-hover/header:scale-105 shrink-0 overflow-hidden"
             style={{ color: cat.color }}>
             <CategoryIcon icon={cat.icon} color={cat.color} size={40} />
           </div>
           <div>
             <h3 className="font-black text-2xl text-slate-800 tracking-tight leading-none mb-2">{cat.name}</h3>
             <div className="flex items-center gap-2">
                <ClassBadge cls={cat.classification} />
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">{cat.children?.length || 0} Subcategories</span>
             </div>
           </div>
         </div>
      </div>

      <div className="flex gap-4 px-2 justify-center mt-2 mb-6">
         {[
           { id: 'edit', label: 'Edit Info', icon: Edit2, color: 'text-indigo-600', bg: 'bg-indigo-50', active: editing, onClick: () => setEditing(!editing) },
           { id: 'fav', label: 'Favorite', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50', active: cat.favorite, onClick: () => toggle('favorite') },
           { id: 'hide', label: cat.disabled ? 'Show' : 'Hide', icon: cat.disabled ? Eye : EyeOff, color: 'text-slate-600', bg: 'bg-slate-100', active: cat.disabled, onClick: () => toggle('disabled') },
           { id: 'delete', label: 'Delete', icon: Trash2, color: 'text-red-500', bg: 'bg-red-50', active: false, onClick: () => setConfirmDelete(true) }
         ].map(btn => (
           <button key={btn.id} onClick={btn.onClick}
             className={cn("w-14 h-14 flex items-center justify-center rounded-full border transition-all duration-300",
               btn.active ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200" : `bg-white border-slate-100 ${btn.color} hover:shadow-md hover:border-slate-200`
             )} title={btn.label}>
              <btn.icon className={cn("w-5 h-5", btn.active ? "text-white" : btn.color)} />
           </button>
         ))}
      </div>

      {editing && (
        <div className="animate-in slide-in-from-top-4 duration-300">
           <CategoryEditForm cat={cat} onSave={(p) => { updateCategory(cat.id, p); setEditing(false); toast.success('Category updated'); }} onCancel={() => setEditing(false)} />
        </div>
      )}

      {confirmDelete && (
        <div className="p-6 bg-red-600 rounded-[2rem] text-center space-y-5 animate-in zoom-in-95 duration-300 shadow-2xl shadow-red-200">
           <div className="flex flex-col items-center gap-2 text-white">
              <AlertTriangle className="w-10 h-10 animate-bounce" />
              <h4 className="font-black text-xl uppercase tracking-widest">Delete {cat.name}?</h4>
              <p className="text-[11px] opacity-90 max-w-[200px] mx-auto leading-relaxed">This will permanently erase all settings and history for this category.</p>
           </div>
           <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 py-3 bg-white/20 hover:bg-white/30 text-white font-black text-xs rounded-2xl transition-colors">CANCEL</button>
              <button onClick={() => { deleteCategory(cat.id); onBack(); toast.success('Category Deleted'); }} className="flex-1 py-3 bg-white text-red-600 font-black text-xs rounded-2xl shadow-xl hover:bg-red-50 transition-colors">CONFIRM DELETE</button>
           </div>
        </div>
      )}

      {!editing && !confirmDelete && (
        <div className="bg-slate-50/50 rounded-[2rem] border border-slate-100 overflow-hidden shadow-inner p-1">
           <SubCatEditor cat={cat} onClose={() => {}} />
        </div>
      )}
    </div>
  );
}

// ─── Main Modal ─────────────────────────────────────────────────────────────
export function CategoryManagementModal({ onClose }: { onClose: () => void }) {
  const { categories, addCategory, reorderCategories, resetCategories, updateCategory, deleteCategory } = useFinance();
  const [tab, setTab] = useState<"expense" | "income">("expense");
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<NeedWantType | null>(null);

  const selectedCat = categories.find(c => c.id === selectedCatId);

  const visibleCats = categories
    .filter(c => {
      const matchTab = tab === "expense" ? c.type !== "income" : c.type === "income";
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
      const matchFilter = !activeFilter || c.classification === activeFilter;
      return matchTab && matchSearch && matchFilter;
    })
    .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));

  const dragProps = {
    dragging, dragOver, 
    onDragStart: (id: string) => setDragging(id),
    onDragOver: (e: any, id: string) => { e.preventDefault(); setDragOver(id); },
    onDrop: (targetId: string) => {
      if (!dragging || dragging === targetId) return;
      const all = [...categories];
      const fromIdx = all.findIndex(c => c.id === dragging);
      const toIdx = all.findIndex(c => c.id === targetId);
      const [moved] = all.splice(fromIdx, 1);
      all.splice(toIdx, 0, moved);
      reorderCategories(all.map((c, i) => ({ ...c, sortOrder: i })));
      setDragging(null); setDragOver(null);
    },
    onDragEnd: () => { setDragging(null); setDragOver(null); }
  };

  const handleCreate = (patch: Partial<CategoryDef>) => {
    const maxOrder = Math.max(0, ...categories.filter(c => (tab === 'expense' ? c.type !== 'income' : c.type === 'income')).map(c => c.sortOrder ?? 0));
    addCategory({ ...patch, type: tab, subcategories: [], sortOrder: maxOrder + 1 } as any);
    setShowNew(false);
    toast.success("Category created!");
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-black text-slate-800">Categories</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                {visibleCats.length} Categories • {tab} mode
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setConfirmReset(true)} className="p-2 text-slate-400 hover:text-amber-600 transition-all"><RotateCcw className="w-4 h-4" /></button>
              <button onClick={onClose} className="p-2 bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-3">
            {(["expense","income"] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setSelectedCatId(null); }}
                className={cn("flex-1 py-1.5 rounded-lg text-xs font-bold uppercase transition-all", tab === t ? "bg-white text-slate-800 shadow-sm" : "text-slate-400")}>
                {t === "expense" ? "💸 Expense" : "💰 Income"}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-100 outline-none" />
            </div>
            <button onClick={() => setShowNew(v => !v)} className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" />New</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {showNew && <CategoryEditForm cat={{ type: tab }} onSave={handleCreate} onCancel={() => setShowNew(false)} isNew />}
          <div className="flex gap-2 flex-wrap mb-4 px-1">
            {CLASSIFICATIONS.map(c => (
              <button key={c} onClick={() => setActiveFilter(prev => prev === c ? null : c)} className={cn("transition-all", activeFilter === c ? "ring-2 ring-indigo-400" : activeFilter ? "opacity-40 grayscale" : "")}>
                <ClassBadge cls={c} />
              </button>
            ))}
          </div>

          {selectedCat ? <CategoryDetailView cat={selectedCat} onBack={() => setSelectedCatId(null)} /> : (
            <div className="grid grid-cols-3 gap-3 animate-in fade-in duration-200">
              {visibleCats.map((cat, i) => <CategoryTile key={cat.id} cat={cat} dragProps={dragProps} onClick={() => setSelectedCatId(cat.id)} />)}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center">
          <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest"><Sparkles className="w-3 h-3 inline mr-1" />Premium Iconography Enabled</p>
          <button onClick={onClose} className="px-5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-all">Done</button>
        </div>
      </div>

      {confirmReset && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-80">
            <h3 className="font-bold text-slate-800 mb-2">Reset to Defaults?</h3>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setConfirmReset(false)} className="flex-1 py-2 border rounded-xl text-sm font-semibold">Cancel</button>
              <button onClick={() => { resetCategories(); setSelectedCatId(null); setConfirmReset(false); toast.success("Reset!"); }} className="flex-1 py-2 bg-red-600 text-white rounded-xl text-sm font-bold">Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
