import React, { useEffect, useState } from 'react';
import { Loader2, ToggleLeft, ToggleRight, ListChecks } from 'lucide-react';
import { apiFetch } from '../lib/api';
import Widget from '../components/ui/Widget';
import KpiCard from '../components/ui/KpiCard';

type FeatureFlag = {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    apiFetch('/api/platform/features')
      .then((r) => r.json())
      .then((features) => setFlags(Array.isArray(features) ? features : []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleFlag = async (flag: FeatureFlag) => {
    setTogglingKey(flag.key);
    const nextEnabled = !flag.enabled;
    setFlags((prev) => prev.map((f) => (f.key === flag.key ? { ...f, enabled: nextEnabled } : f)));
    try {
      const res = await apiFetch(`/api/platform/features/${flag.key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nextEnabled })
      });
      if (!res.ok) {
        // Revert on failure — the toggle didn't actually take effect server-side.
        setFlags((prev) => prev.map((f) => (f.key === flag.key ? { ...f, enabled: flag.enabled } : f)));
      }
    } catch {
      setFlags((prev) => prev.map((f) => (f.key === flag.key ? { ...f, enabled: flag.enabled } : f)));
    } finally {
      setTogglingKey(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-16 text-slate-400"><Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…</div>;
  }

  const enabledCount = flags.filter((f) => f.enabled).length;

  return (
    <div className="grid grid-cols-12 gap-4">
      <KpiCard colSpan={3} label="Features enabled" value={`${enabledCount} / ${flags.length}`} icon={ListChecks} iconBg="#1baf7a1a" iconColor="#1baf7a" />

      <p className="col-span-12 text-xs text-[var(--text-muted)]">
        Voice call pricing and per-provider call/AI rates now live together on the <strong className="font-semibold text-[var(--text-secondary)]">Cost &amp; Pricing</strong> page.
      </p>

      <Widget
        colSpan={12}
        title="Feature flags"
        subtitle="Turning a feature off takes effect on the AI's next call — it stops offering that capability entirely instead of just hiding a button."
        padding="md"
      >
        <div className="divide-y divide-slate-100 dark:divide-[var(--border)]">
          {flags.map((flag) => (
            <div key={flag.key} className="flex items-center justify-between py-3">
              <div className="pr-4">
                <div className="text-sm font-medium text-slate-700 dark:text-[var(--text-primary)]">{flag.label}</div>
                <div className="text-xs text-slate-400 dark:text-[var(--text-muted)] mt-0.5">{flag.description}</div>
              </div>
              <button
                onClick={() => toggleFlag(flag)}
                disabled={togglingKey === flag.key}
                className="shrink-0 disabled:opacity-50"
                aria-label={`Toggle ${flag.label}`}
              >
                {flag.enabled ? (
                  <ToggleRight className="h-8 w-8 text-emerald-500" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-slate-300" />
                )}
              </button>
            </div>
          ))}
          {flags.length === 0 && <div className="py-8 text-center text-slate-400 dark:text-[var(--text-muted)] text-xs">No feature flags configured.</div>}
        </div>
      </Widget>
    </div>
  );
}
