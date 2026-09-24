import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, Search, Sparkles, Users2, X } from 'lucide-react';
import { getAllFlagGroups } from '../../features/feature-flags/flagGroups';
import { FEATURE_REGISTRY } from '../../features/feature-flags/registry';

interface FlagGroupPickerProps {
  availableKeys: string[];
  value?: string[];
  onApply: (flagKeys: string[]) => void;
  className?: string;
}

export default function FlagGroupPicker({ availableKeys, value = [], onApply, className = '' }: FlagGroupPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const available = useMemo(() => new Set(availableKeys), [availableKeys]);
  const selected = useMemo(() => new Set(value), [value]);

  const groups = useMemo(() => getAllFlagGroups()
    .map(g => ({ ...g, applicable: g.flagKeys.filter(k => available.has(k)) }))
    .filter(g => g.applicable.length > 0), [available]);

  const features = useMemo(() => FEATURE_REGISTRY
    .filter(f => available.has(f.key))
    .filter(f => {
      const q = search.trim().toLowerCase();
      return !q || f.label.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
    }), [available, search]);

  const toggleFeature = (key: string) => {
    const next = new Set(selected);
    next.has(key) ? next.delete(key) : next.add(key);
    onApply([...next]);
  };

  const toggleGroup = (keys: string[]) => {
    const allSelected = keys.every(k => selected.has(k));
    const next = new Set(selected);
    if (allSelected) keys.forEach(k => next.delete(k));
    else keys.forEach(k => next.add(k));
    onApply([...next]);
  };

  const clearAll = () => onApply([]);

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs font-bold text-slate-700">Feature Access</p>
          <p className="text-[10px] text-slate-400">Search features, select individually, or apply a complete group.</p>
        </div>
        {value.length > 0 && (
          <button type="button" onClick={clearAll} className="text-[10px] font-semibold text-slate-400 hover:text-rose-500">
            Clear all
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search features…"
          className="w-full border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400"
        />
        <button type="button" onClick={() => setOpen(!open)} className="absolute right-2 top-1.5 p-1.5 text-slate-400 hover:text-slate-700">
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute z-50 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
            <div className="max-h-80 overflow-y-auto p-2">
              {groups.map(group => {
                const visible = group.applicable.filter(k => !search || FEATURE_REGISTRY.find(f => f.key === k)?.label.toLowerCase().includes(search.toLowerCase()));
                if (search && visible.length === 0) return null;
                const allSelected = group.applicable.every(k => selected.has(k));
                const someSelected = group.applicable.some(k => selected.has(k));
                return (
                  <div key={group.key} className="mb-2 last:mb-0">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.applicable)}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-amber-50 text-left"
                    >
                      <span className={`h-7 w-7 rounded-lg flex items-center justify-center ${allSelected ? 'bg-amber-500 text-white' : 'bg-white text-amber-500 border border-amber-100'}`}>
                        {allSelected ? <Check className="h-4 w-4" /> : <Users2 className="h-4 w-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-bold text-slate-700">{group.label}</span>
                        <span className="block text-[10px] text-slate-400 truncate">{group.description}</span>
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${someSelected ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-500'}`}>
                        {group.applicable.filter(k => selected.has(k)).length}/{group.applicable.length}
                      </span>
                    </button>
                  </div>
                );
              })}

              <div className="px-2 py-2 mt-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Individual Features</span>
                </div>
                {features.length === 0 ? (
                  <p className="px-2 py-4 text-center text-xs text-slate-400">No matching features</p>
                ) : (
                  <div className="space-y-1">
                    {features.map(f => (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => toggleFeature(f.key)}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-slate-50 text-left"
                      >
                        <span className={`h-5 w-5 rounded-md border flex items-center justify-center ${selected.has(f.key) ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300'}`}>
                          {selected.has(f.key) && <Check className="h-3 w-3" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-medium text-slate-700">{f.label}</span>
                          <span className="block text-[9px] text-slate-400 truncate">{f.description}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-slate-100 px-3 py-2 flex justify-between items-center bg-slate-50">
              <span className="text-[10px] text-slate-500">{value.length} feature{value.length === 1 ? '' : 's'} selected</span>
              <button type="button" onClick={() => setOpen(false)} className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-semibold">Done</button>
            </div>
          </div>
        )}
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {value.map(key => {
            const f = FEATURE_REGISTRY.find(item => item.key === key);
            if (!f) return null;
            return (
              <button key={key} type="button" onClick={() => toggleFeature(key)} title={f.description} className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[10px] font-semibold text-amber-700 hover:bg-amber-100">
                {f.label}
                <X className="h-3 w-3" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
