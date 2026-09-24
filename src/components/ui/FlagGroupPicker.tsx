import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Info, Search, Sparkles, Users2, X } from 'lucide-react';
import { getAllFlagGroups } from '../../features/feature-flags/flagGroups';
import { FEATURE_REGISTRY } from '../../features/feature-flags/registry';
import { useClickOutside } from '../../hooks/useClickOutside';

interface FlagGroupPickerProps {
  availableKeys: string[];
  value?: string[];
  onApply: (flagKeys: string[]) => void;
  className?: string;
  label?: string;
  description?: string;
}

export default function FlagGroupPicker({
  availableKeys,
  value = [],
  onApply,
  className = '',
  label = 'Feature Access',
  description = 'Apply a complete group or select individual features.',
}: FlagGroupPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [placement, setPlacement] = useState<'down' | 'up' | 'left' | 'right'>('down');
  const [infoGroup, setInfoGroup] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const available = useMemo(() => new Set(availableKeys), [availableKeys]);
  const selected = useMemo(() => new Set(value), [value]);

  const groups = useMemo(
    () =>
      getAllFlagGroups()
        .map(g => ({ ...g, applicable: g.flagKeys.filter(k => available.has(k)) }))
        .filter(g => g.applicable.length > 0),
    [available],
  );

  const features = useMemo(
    () =>
      FEATURE_REGISTRY.filter(f => available.has(f.key)).filter(f => {
        const q = search.trim().toLowerCase();
        return !q || f.label.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
      }),
    [available, search],
  );

  const closeAll = useCallback(() => {
    setOpen(false);
    setInfoGroup(null);
  }, []);

  useClickOutside(rootRef, closeAll, open || Boolean(infoGroup));

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

  const clearAll = () => {
    onApply([]);
    setInfoGroup(null);
  };

  const updatePlacement = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const margin = 12;
    const minHeight = 220;
    const preferredHeight = Math.min(480, Math.max(220, window.innerHeight * 0.6));
    const requiredHeight = Math.min(preferredHeight, 320);
    const requiredSideWidth = Math.min(rect.width, 320);

    const below = window.innerHeight - rect.bottom - margin;
    const above = rect.top - margin;
    const right = window.innerWidth - rect.right - margin;
    const left = rect.left - margin;

    if (below >= requiredHeight) setPlacement('down');
    else if (above >= requiredHeight) setPlacement('up');
    else if (right >= requiredSideWidth) setPlacement('right');
    else if (left >= requiredSideWidth) setPlacement('left');
    else setPlacement(below >= above ? 'down' : 'up');

    void minHeight;
  }, []);

  const openPicker = () => {
    setOpen(prev => !prev);
    setInfoGroup(null);
  };

  const selectGroup = (keys: string[]) => {
    toggleGroup(keys);
    setInfoGroup(null);
  };

  React.useEffect(() => {
    if (!open) return;
    updatePlacement();
    window.addEventListener('resize', updatePlacement);
    window.addEventListener('scroll', updatePlacement, true);
    return () => {
      window.removeEventListener('resize', updatePlacement);
      window.removeEventListener('scroll', updatePlacement, true);
    };
  }, [open, updatePlacement]);

  return (
    <div ref={rootRef} className={`relative w-full min-w-0 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs font-bold text-slate-700">{label}</p>
          <p className="text-[10px] text-slate-400">{description}</p>
        </div>
        {value.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-[10px] font-semibold text-slate-400 hover:text-rose-500"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {groups.map(group => {
          const allSelected = group.applicable.every(k => selected.has(k));
          const someSelected = group.applicable.some(k => selected.has(k));
          const isInfoOpen = infoGroup === group.key;

          return (
            <div key={group.key} className="relative inline-flex">
              <button
                type="button"
                onClick={() => selectGroup(group.applicable)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-semibold transition-colors ${
                  allSelected
                    ? 'border-amber-300 bg-amber-100 text-amber-800'
                    : someSelected
                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50'
                }`}
              >
                <Users2 className="h-3 w-3" />
                <span>{group.label}</span>
                {someSelected && (
                  <span className="rounded-full bg-white/80 px-1.5 py-0.5 text-[9px]">
                    {group.applicable.filter(k => selected.has(k)).length}/{group.applicable.length}
                  </span>
                )}
              </button>

              {someSelected && (
                <button
                  type="button"
                  aria-label={`Show features in ${group.label}`}
                  title={`Show features in ${group.label}`}
                  onClick={() => {
                    setInfoGroup(prev => (prev === group.key ? null : group.key));
                    setOpen(false);
                  }}
                  className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:border-amber-300 hover:text-amber-600"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              )}

              {isInfoOpen && (
                <div className="absolute left-0 top-full z-40 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-slate-700">{group.label}</p>
                      <p className="text-[10px] text-slate-400">{group.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInfoGroup(null)}
                      className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {group.applicable.map(key => {
                      const feature = FEATURE_REGISTRY.find(f => f.key === key);
                      if (!feature) return null;
                      return (
                        <div key={key} className="flex items-start gap-2 rounded-lg bg-slate-50 px-2.5 py-2">
                          <Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${selected.has(key) ? 'text-amber-500' : 'text-slate-300'}`} />
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold text-slate-700">{feature.label}</p>
                            <p className="text-[9px] leading-4 text-slate-400">{feature.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div ref={triggerRef} className="relative">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setOpen(true);
            setInfoGroup(null);
          }}
          onFocus={() => {
            setOpen(true);
            setInfoGroup(null);
          }}
          placeholder="Search individual features…"
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-10 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
        />
        <button
          type="button"
          onClick={openPicker}
          className="absolute right-2 top-1.5 p-1.5 text-slate-400 hover:text-slate-700"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div
            className={`absolute z-50 w-full min-w-full max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl ${
              placement === 'down'
                ? 'left-0 top-full mt-2'
                : placement === 'up'
                  ? 'bottom-full left-0 mb-2'
                  : placement === 'right'
                    ? 'left-full top-0 ml-2'
                    : 'right-full top-0 mr-2'
            }`}
          >
            <div className="max-h-[min(30rem,60vh)] overflow-y-auto overscroll-contain p-2">
              <div className="px-2 py-2">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Individual Features
                  </span>
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
                        className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left hover:bg-slate-50"
                      >
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                            selected.has(f.key)
                              ? 'border-amber-500 bg-amber-500 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {selected.has(f.key) && <Check className="h-3 w-3" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-medium text-slate-700">{f.label}</span>
                          <span className="block truncate text-[9px] text-slate-400">{f.description}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-3 py-2">
              <span className="text-[10px] text-slate-500">
                {value.length} feature{value.length === 1 ? '' : 's'} selected
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-[10px] font-semibold text-white"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {value.length > 0 && (
        <div className="mt-2 flex max-w-full flex-wrap gap-1.5">
          {value.map(key => {
            const f = FEATURE_REGISTRY.find(item => item.key === key);
            if (!f) return null;
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleFeature(key)}
                title={f.description}
                className="inline-flex max-w-full items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700 hover:bg-amber-100"
              >
                <span className="truncate">{f.label}</span>
                <X className="h-3 w-3" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
