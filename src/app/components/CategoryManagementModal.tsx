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

// ─── helpers ────────────────────────────────────────────────────────────────
const ICONS = Object.keys(CATEGORY_ICON_MAP);
const PALETTE = [
  "#ef4444","#f97316","#f59e0b","#eab308","#84cc16","#22c55e",
  "#10b981","#14b8a6","#06b6d4","#0ea5e9","#3b82f6","#6366f1",
  "#8b5cf6","#a855f7","#d946ef","#ec4899","#f43f5e","#64748b",
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
    <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 space-y-3 animate-in zoom-in-95 duration-150">
      <div className="flex gap-2 items-center">
        {/* Icon button */}
        <div className="relative">
          <button type="button" onClick={() => { setShowIconPicker(v => !v); setShowColorPicker(false); }}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm border border-indigo-200 bg-white hover:border-indigo-400 transition-all"
            style={{ borderColor: color }}>
            {CATEGORY_ICON_MAP[icon] || "📦"}
          </button>
          {showIconPicker && (
            <div className="absolute top-12 left-0 z-[200] bg-white border border-slate-200 rounded-2xl p-3 shadow-2xl grid grid-cols-6 gap-1.5 w-52">
              {ICONS.map(k => (
                <button key={k} type="button" onClick={() => { setIcon(k); setShowIconPicker(false); }}
                  className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-base hover:bg-slate-100 transition-all", icon === k && "bg-indigo-100 ring-2 ring-indigo-400")}>
                  {CATEGORY_ICON_MAP[k]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Color dot */}
        <div className="relative">
          <button type="button" onClick={() => { setShowColorPicker(v => !v); setShowIconPicker(false); }}
            className="w-10 h-10 rounded-xl border-2 border-white shadow-md hover:scale-110 transition-transform"
            style={{ background: color }} />
          {showColorPicker && (
            <div className="absolute top-12 left-0 z-[200] bg-white border border-slate-200 rounded-2xl p-3 shadow-2xl">
              <div className="grid grid-cols-6 gap-2">
                {PALETTE.map(c => (
                  <button key={c} type="button" onClick={() => { setColor(c); setShowColorPicker(false); }}
                    className="w-7 h-7 rounded-full hover:scale-125 transition-transform ring-offset-1"
                    style={{ background: c, outline: color === c ? `3px solid ${c}` : "none" }} />
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

      {/* Classification */}
      <div className="flex gap-1.5 flex-wrap">
        {CLASSIFICATIONS.map(c => (
          <button key={c} type="button" onClick={() => setCls(c)}
            className={cn("text-[9px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider border transition-all",
              cls === c
                ? cn(CLASSIFICATION_COLORS[c].bg, CLASSIFICATION_COLORS[c].text, CLASSIFICATION_COLORS[c].border)
                : "bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200"
            )}>
            {CLSF_LABEL[c]}
          </button>
        ))}
      </div>

      {/* Limits */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Budget Limit</label>
          <input type="number" value={budgetLimit || ""} onChange={e => setBudgetLimit(Number(e.target.value))}
            className="w-full text-xs font-bold bg-white border border-indigo-200 px-3 py-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly Max</label>
          <input type="number" value={monthlyLimit || ""} onChange={e => setMonthlyLimit(Number(e.target.value))}
            className="w-full text-xs font-bold bg-white border border-indigo-200 px-3 py-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
          Cancel
        </button>
        <button type="button"
          disabled={!name.trim()}
          onClick={() => onSave({ name: name.trim(), icon, color, classification: cls, budgetLimit, monthlyLimit })}
          className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-40">
          {isNew ? "Create" : "Save"}
        </button>
      </div>
    </div>
  );
}

// ─── Sub-category chip editor ───────────────────────────────────────────────
function SubCatEditor({ cat, onClose }: { cat: CategoryDef; onClose: () => void }) {
  const { categories, updateCategory } = useFinance();
  const [children, setChildren] = useState<SubCategory[]>(cat.children || []);
  const [input, setInput] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");
  const [expandingId, setExpandingId] = useState<string | null>(null);

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

  const add = () => {
    const v = input.trim();
    if (v && !children.some(c => c.name === v)) { 
      setChildren(prev => [...prev, { id: slugify(v), name: v, sortOrder: prev.length }]); 
      setInput(""); 
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

  const startEdit = (sc: SubCategory) => { setEditId(sc.id); setEditVal(sc.name); };
  const saveEdit = () => {
    if (editVal.trim() && editId !== null) {
      setChildren(prev => prev.map(x => x.id === editId ? { ...x, name: editVal.trim() } : x));
    }
    setEditId(null); setEditVal("");
  };

  const [editLeafId, setEditLeafId] = useState<string | null>(null);
  const [editLeafVal, setEditLeafVal] = useState("");
  const startEditLeaf = (ssc: SubCategory) => { setEditLeafId(ssc.id); setEditLeafVal(ssc.name); };
  const saveEditLeaf = (parentId: string) => {
    if (editLeafVal.trim() && editLeafId) {
      setChildren(prev => prev.map(p => p.id === parentId ? {
        ...p, children: p.children?.map(c => c.id === editLeafId ? { ...c, name: editLeafVal.trim() } : c)
      } : p));
    }
    setEditLeafId(null); setEditLeafVal("");
  };

  const moveLeaf = (parentId: string, leafId: string, dir: 'up' | 'down') => {
    setChildren(prev => prev.map(p => {
      if (p.id !== parentId || !p.children) return p;
      const idx = p.children.findIndex(c => c.id === leafId);
      const newIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= p.children.length) return p;
      const newC = [...p.children];
      [newC[idx], newC[newIdx]] = [newC[newIdx], newC[idx]];
      return { ...p, children: newC };
    }));
  };

  const [movingLeafId, setMovingLeafId] = useState<{ parentId: string, leafId: string } | null>(null);
  const groupLeaf = (newParentId: string) => {
    if (!movingLeafId) return;
    const { parentId, leafId } = movingLeafId;
    const sourceParent = children.find(c => c.id === parentId);
    const leaf = sourceParent?.children?.find(c => c.id === leafId);
    if (!leaf) return;

    setChildren(prev => prev.map(p => {
      if (p.id === parentId) return { ...p, children: p.children?.filter(c => c.id !== leafId) };
      if (p.id === newParentId) return { ...p, children: [...(p.children || []), leaf] };
      return p;
    }));
    setMovingLeafId(null);
    toast.success("Regrouped!");
  };

  const addNested = (parentId: string, name: string) => {
    const v = name.trim();
    if (!v) return;
    setChildren(prev => prev.map(p => {
      if (p.id === parentId) {
        const existing = p.children || [];
        if (existing.some(e => e.name === v)) return p;
        return { ...p, children: [...existing, { id: slugify(v), name: v, sortOrder: existing.length }] };
      }
      return p;
    }));
  };

  const removeNested = (parentId: string, childId: string) => {
    setChildren(prev => prev.map(p => {
      if (p.id === parentId) {
        return { ...p, children: p.children?.filter(c => c.id !== childId) };
      }
      return p;
    }));
  };

  const save = () => {
    const flat: string[] = [];
    children.forEach(c => {
      flat.push(c.name);
      if (c.children) c.children.forEach(cc => flat.push(cc.name));
    });

    updateCategory(cat.id, { 
      children,
      subcategories: Array.from(new Set(flat))
    });
    toast.success("Hierarchy Persisted");
    onClose();
  };

  // Immediate save on move/edit to avoid 'Deploy' friction
  useEffect(() => {
    const flat: string[] = [];
    children.forEach(c => {
      flat.push(c.name);
      if (c.children) c.children.forEach(cc => flat.push(cc.name));
    });

    updateCategory(cat.id, { 
      children,
      subcategories: Array.from(new Set(flat))
    });
  }, [children]);

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-5 space-y-5 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Layers className="w-3 h-3 text-indigo-500" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hierarchy Engine</p>
        </div>
        <button onClick={onClose} className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest px-3 py-1.5 bg-indigo-50 rounded-full transition-colors">
          Close Editor
        </button>
      </div>

      {/* Modern Input Group */}
      <div className="relative group">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="What's the main group? (e.g. Dairy)"
          className="w-full text-xs font-bold bg-white border border-slate-100 shadow-sm px-5 py-4 rounded-[1.5rem] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none placeholder:text-slate-300 transition-all group-hover:shadow-md"
        />
        <button 
          onClick={add} 
          className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 text-white rounded-[1rem] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase">Add Group</span>
        </button>
      </div>

      {/* Hierarchy List */}
      <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {children.length === 0 ? (
          <div className="py-12 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
             <Layers className="w-8 h-8 mx-auto mb-3 text-slate-200" />
             <p className="text-[10px] font-bold text-slate-400 uppercase">Tree is currently empty</p>
          </div>
        ) : children.map((sc: SubCategory) => (
          <div key={sc.id} className="space-y-2">
            <div className="flex items-center justify-between bg-white border border-slate-100 rounded-[1.5rem] px-5 py-4 group shadow-sm hover:shadow-md transition-all duration-300 hover:border-indigo-100">
              <div className="flex items-center gap-4 flex-1">
                <button 
                  onClick={() => setExpandingId(expandingId === sc.id ? null : sc.id)} 
                  className={cn("p-1.5 rounded-xl transition-all", expandingId === sc.id ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 text-slate-400")}
                >
                   <ChevronRight className={cn("w-4 h-4 transition-transform duration-300", expandingId === sc.id && "rotate-90")} />
                </button>
                {editId === sc.id ? (
                  <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditId(null); }}
                    onBlur={saveEdit}
                    className="text-xs font-black bg-indigo-50 border-0 p-0 outline-none text-indigo-600 w-full" />
                ) : (
                  <div>
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{sc.name}</span>
                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{sc.children?.length || 0} nested items</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 transition-all">
                <button onClick={() => move(sc.id, 'up')} className="p-1 bg-slate-50 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 border border-slate-100 transition-colors"><ChevronRight className="w-3.5 h-3.5 -rotate-90" /></button>
                <button onClick={() => move(sc.id, 'down')} className="p-1 bg-slate-50 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 border border-slate-100 transition-colors"><ChevronRight className="w-3.5 h-3.5 rotate-90" /></button>
                <button onClick={() => startEdit(sc)} className="p-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl border border-slate-100 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => remove(sc.id)} className="p-1.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl border border-slate-100 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            {expandingId === sc.id && (
              <div className="ml-7 space-y-2 pl-5 border-l-2 border-indigo-50 animate-in slide-in-from-left-6 duration-300">
                {sc.children?.map((ssc: SubCategory) => (
                  <div key={ssc.id} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between bg-white border border-slate-50 rounded-2xl px-4 py-3 group/leaf hover:border-indigo-100 transition-all shadow-sm">
                      {editLeafId === ssc.id ? (
                        <input autoFocus value={editLeafVal} onChange={e => setEditLeafVal(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") saveEditLeaf(sc.id); if (e.key === "Escape") setEditLeafId(null); }}
                          onBlur={() => saveEditLeaf(sc.id)}
                          className="text-[10px] font-black bg-indigo-50 border-0 p-0 outline-none text-indigo-600 w-full" />
                      ) : (
                        <span className="text-[10px] font-black text-slate-600">{ssc.name}</span>
                      )}
                      
                      <div className="flex items-center gap-1 transition-all">
                        <button onClick={() => moveLeaf(sc.id, ssc.id, 'up')} className="p-1 bg-slate-50 rounded-lg text-slate-400 hover:text-slate-700 border border-slate-100"><ChevronRight className="w-2.5 h-2.5 -rotate-90" /></button>
                        <button onClick={() => moveLeaf(sc.id, ssc.id, 'down')} className="p-1 bg-slate-50 rounded-lg text-slate-400 hover:text-slate-700 border border-slate-100"><ChevronRight className="w-2.5 h-2.5 rotate-90" /></button>
                        <button onClick={() => setMovingLeafId({ parentId: sc.id, leafId: ssc.id })} className="p-1 bg-slate-50 rounded-lg text-slate-400 hover:text-blue-500 border border-slate-100"><Move className="w-3 h-3" /></button>
                        <button onClick={() => startEditLeaf(ssc)} className="p-1 bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 border border-slate-100"><Edit2 className="w-3 h-3" /></button>
                        <button onClick={() => removeNested(sc.id, ssc.id)} className="p-1 bg-slate-50 rounded-lg text-slate-400 hover:text-red-500 border border-slate-100"><X className="w-3 h-3" /></button>
                      </div>
                    </div>
                    {movingLeafId?.leafId === ssc.id && (
                      <div className="bg-indigo-50 p-2 rounded-xl border border-indigo-100 space-y-2 animate-in zoom-in-95">
                         <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Regroup to:</p>
                         <div className="flex flex-wrap gap-1">
                            {children.filter(p => p.id !== sc.id).map(p => (
                              <button key={p.id} onClick={() => groupLeaf(p.id)} className="px-2 py-1 bg-white border border-indigo-200 rounded-lg text-[9px] font-bold text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all">
                                {p.name}
                              </button>
                            ))}
                         </div>
                         <button onClick={() => setMovingLeafId(null)} className="text-[8px] font-bold text-red-500 uppercase">Cancel</button>
                      </div>
                    )}
                  </div>
                ))}
                <div className="relative pt-1">
                  <input 
                    placeholder="Add specific detail..."
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Enter") {
                        addNested(sc.id, e.currentTarget.value);
                        e.currentTarget.value = "";
                      }
                    }}
                    className="w-full text-[10px] font-black bg-white border border-dashed border-slate-200 focus:border-indigo-500 px-4 py-3 rounded-2xl focus:ring-0 outline-none placeholder:text-slate-300 transition-colors"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[8px] font-black text-slate-300 uppercase pointer-events-none">
                     Enter to save
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-2">
        <button onClick={save} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 active:scale-[0.98] flex items-center justify-center gap-3">
          <Zap className="w-4 h-4 text-amber-400" />
          Deploy Taxonomy
        </button>
      </div>
    </div>
  );
}

// ─── Category Row ───────────────────────────────────────────────────────────
interface RowProps {
  cat: CategoryDef;
  index: number;
  total: number;
  dragProps: {
    dragging: string | null;
    dragOver: string | null;
    onDragStart: (id: string) => void;
    onDragOver: (e: React.DragEvent, id: string) => void;
    onDrop: (id: string) => void;
    onDragEnd: () => void;
  };
}

function CategoryTile({ cat, onClick, dragProps }: RowProps & { onClick: () => void }) {
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
      {/* Dynamic Background Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" 
        style={{ background: `radial-gradient(circle at center, ${cat.color}, transparent)` }} />

      {/* Icon Wrapper */}
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-2 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 relative z-10"
        style={{ background: cat.color + "15", color: cat.color, boxShadow: `0 8px 20px -6px ${cat.color}44` }}>
        {CATEGORY_ICON_MAP[cat.icon] || "📦"}
      </div>

      {/* Info */}
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

// ─── Main Detail View ────────────────────────────────────────────────────────
function CategoryDetailView({ cat, onBack }: { cat: CategoryDef; onBack: () => void }) {
  const { updateCategory, deleteCategory } = useFinance();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const toggle = (field: "disabled" | "favorite") =>
    updateCategory(cat.id, { [field]: !cat[field] });

  const totalSpecifics = (cat.children || []).reduce((acc, curr) => acc + (curr.children?.length || 0), 0);

  return (
    <div className="space-y-6 animate-in slide-in-from-right-8 duration-500 pb-2">
      {/* Immersive Header */}
      <div className="relative p-6 rounded-[2.5rem] overflow-hidden group/header border border-white shadow-xl shadow-slate-200/30">
        <div className="absolute inset-0 opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-1000" style={{ background: cat.color }} />
        <div className="relative z-10 flex items-center gap-5">
           <button onClick={onBack} className="p-2.5 bg-white shadow-sm hover:shadow-md border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-800 transition-all hover:-translate-x-1">
             <ChevronRight className="w-5 h-5 rotate-180" />
           </button>
           <div className="w-16 h-16 rounded-[1.5rem] bg-white flex items-center justify-center text-3xl shadow-lg border border-slate-50 transition-transform duration-500 group-hover/header:scale-105"
             style={{ color: cat.color }}>
             {CATEGORY_ICON_MAP[cat.icon] || "📦"}
           </div>
           <div className="flex-1">
             <h3 className="font-black text-2xl text-slate-800 tracking-tight leading-none mb-1.5">{cat.name}</h3>
             <div className="flex items-center gap-2">
                <ClassBadge cls={cat.classification} />
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">{cat.children?.length || 0} Main • {totalSpecifics} Specifics</span>
             </div>
           </div>
        </div>
      </div>

      {/* Elite Control Strip */}
      <div className="flex gap-2.5 px-1">
         {[
           { id: 'edit', label: 'Edit Info', icon: Edit2, color: 'text-indigo-600', bg: 'bg-indigo-50', active: editing, onClick: () => setEditing(!editing) },
           { id: 'fav', label: 'Favorite', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50', active: cat.favorite, onClick: () => toggle('favorite') },
           { id: 'hide', label: cat.disabled ? 'Show' : 'Hide', icon: cat.disabled ? Eye : EyeOff, color: 'text-slate-600', bg: 'bg-slate-100', active: cat.disabled, onClick: () => toggle('disabled') },
           { id: 'delete', label: 'Delete', icon: Trash2, color: 'text-red-500', bg: 'bg-red-50', active: false, onClick: () => setConfirmDelete(true) }
         ].map(btn => (
           <button 
             key={btn.id}
             onClick={btn.onClick}
             className={cn(
               "flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.25rem] border transition-all duration-300",
               btn.active 
                 ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200" 
                 : `bg-white border-slate-100 ${btn.color} hover:shadow-md hover:border-slate-200`
             )}
           >
              <btn.icon className={cn("w-4 h-4", btn.active ? "text-white" : btn.color)} />
              <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">{btn.label}</span>
           </button>
         ))}
      </div>

      {editing && (
        <div className="animate-in slide-in-from-top-4 duration-300">
           <CategoryEditForm cat={cat} onSave={(p) => { updateCategory(cat.id, p); setEditing(false); toast.success('Category Config Restructured'); }} onCancel={() => setEditing(false)} />
        </div>
      )}

      {confirmDelete && (
        <div className="p-6 bg-red-600 rounded-[2rem] text-center space-y-5 animate-in zoom-in-95 duration-300 shadow-2xl shadow-red-200">
           <div className="flex flex-col items-center gap-2 text-white">
              <AlertTriangle className="w-10 h-10 animate-bounce" />
              <h4 className="font-black text-xl uppercase tracking-widest">Delete {cat.name}?</h4>
              <p className="text-[11px] opacity-90 max-w-[200px] mx-auto leading-relaxed">This will permanently erase all taxonomy links for this category.</p>
           </div>
           <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 py-3 bg-white/20 hover:bg-white/30 text-white font-black text-xs rounded-2xl transition-colors">ABORT</button>
              <button onClick={() => { deleteCategory(cat.id); onBack(); toast.success('Taxonomy Purged'); }} className="flex-1 py-3 bg-white text-red-600 font-black text-xs rounded-2xl shadow-xl hover:bg-red-50 transition-colors">CONFIRM DELETE</button>
           </div>
        </div>
      )}

      {/* Re-designed Hierarchy Engine */}
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

  const selectedCat = categories.find(c => c.id === selectedCatId);

  const visibleCats = categories
    .filter(c => {
      const matchTab = tab === "expense" ? c.type !== "income" : c.type === "income";
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    })
    .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));

  // DnD
  const onDragStart = (id: string) => setDragging(id);
  const onDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault(); setDragOver(id);
  };
  const onDrop = (targetId: string) => {
    if (!dragging || dragging === targetId) return;
    const all = [...categories];
    const fromIdx = all.findIndex(c => c.id === dragging);
    const toIdx = all.findIndex(c => c.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const [moved] = all.splice(fromIdx, 1);
    all.splice(toIdx, 0, moved);
    reorderCategories(all.map((c, i) => ({ ...c, sortOrder: i })));
    setDragging(null); setDragOver(null);
  };
  const onDragEnd = () => { setDragging(null); setDragOver(null); };

  const dragProps = { dragging, dragOver, onDragStart, onDragOver, onDrop, onDragEnd };

  const handleCreate = (patch: Partial<CategoryDef>) => {
    const maxOrder = Math.max(0, ...categories.filter(c => c.type !== "income" && tab === "expense" || c.type === "income" && tab === "income").map(c => c.sortOrder ?? 0));
    addCategory({
      name: patch.name!,
      icon: patch.icon || "others",
      color: patch.color || "#6366f1",
      classification: patch.classification || "want",
      type: tab,
      subcategories: [],
      sortOrder: maxOrder + 1,
    } as Omit<CategoryDef, "id">);
    setShowNew(false);
    toast.success("Category created!");
  };

  const stats = {
    total: visibleCats.length,
    active: visibleCats.filter(c => !c.disabled).length,
    favorites: visibleCats.filter(c => c.favorite).length,
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-black text-slate-800">Categories</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                {stats.active} active • {stats.favorites} favorites • {stats.total} total
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setConfirmReset(true)}
                className="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all" title="Reset to defaults">
                <RotateCcw className="w-4 h-4" />
              </button>
              <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-3">
            {(["expense","income"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={cn("flex-1 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                  tab === t ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600")}>
                {t === "expense" ? "💸 Expense" : "💰 Income"}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search categories..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <button onClick={() => setShowNew(v => !v)}
              className={cn("px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all",
                showNew ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100")}>
              <Plus className="w-3.5 h-3.5" />
              New
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">

          {/* New category form */}
          {showNew && (
            <CategoryEditForm
              cat={{ type: tab, classification: "want" }}
              onSave={handleCreate}
              onCancel={() => setShowNew(false)}
              isNew
            />
          )}

          {/* Classification legend */}
          <div className="flex gap-1.5 flex-wrap mb-1">
            {CLASSIFICATIONS.map(c => <ClassBadge key={c} cls={c} />)}
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 ml-auto">
              <GripVertical className="w-3 h-3" /> Drag to reorder
            </span>
          </div>

          {/* Conditional View: Tiles Grid or Detail View */}
          {selectedCat ? (
            <CategoryDetailView cat={selectedCat} onBack={() => setSelectedCatId(null)} />
          ) : (
            <>
              {visibleCats.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Tag className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-semibold">No categories found</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 animate-in fade-in duration-200">
                  {visibleCats.map((cat, i) => (
                    <CategoryTile 
                      key={cat.id} 
                      cat={cat} 
                      index={i} 
                      total={visibleCats.length} 
                      dragProps={dragProps} 
                      onClick={() => setSelectedCatId(cat.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center">
          <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">
            <Sparkles className="w-3 h-3 inline mr-1" />AI auto-categorization uses these names
          </p>
          <button onClick={onClose}
            className="px-5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900">
            Done
          </button>
        </div>
      </div>

      {/* Reset confirm */}
      {confirmReset && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl">
            <h3 className="font-bold text-slate-800 mb-2">Reset to Defaults?</h3>
            <p className="text-sm text-slate-500 mb-4">All custom categories and changes will be lost.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmReset(false)} className="flex-1 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600">Cancel</button>
              <button onClick={() => { resetCategories(); setConfirmReset(false); toast.success("Categories reset!"); }}
                className="flex-1 py-2 bg-red-600 text-white rounded-xl text-sm font-bold">Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
