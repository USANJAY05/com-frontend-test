import React, { useEffect, useState } from 'react';
import { Loader2, ToggleLeft, ToggleRight, ListChecks, Users2, Plus, Trash2, Save } from 'lucide-react';
import { apiFetch } from '../lib/api';
import Widget from '../components/ui/Widget';
import KpiCard from '../components/ui/KpiCard';

type FeatureFlag = {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  scope?: 'app' | 'capability';
  globallyEnabled?: boolean;
};

type FeatureGroup = {
  key: string;
  label: string;
  description: string;
  featureKeys: string[];
  system?: boolean;
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [groups, setGroups] = useState<FeatureGroup[]>([]);
  const [savingGroup, setSavingGroup] = useState(false);
  const [groupDraft, setGroupDraft] = useState<FeatureGroup | null>(null);
  const [retention, setRetention] = useState<Record<string, number | null>>({});
  const [retentionSaving, setRetentionSaving] = useState(false);
  const retentionTypes = [
    ['call_recordings', 'Call recordings'], ['transcripts', 'Transcripts'], ['ai_summaries', 'AI summaries'],
    ['call_logs', 'Call logs'], ['campaign_history', 'Campaign history'], ['audit_logs', 'Audit logs'],
    ['documents', 'Uploaded documents'], ['contacts', 'Contacts'],
  ];

  const load = () => {
    setLoading(true);
    Promise.all([
      apiFetch('/api/platform/features').then((r) => r.json()),
      apiFetch('/api/platform/feature-groups').then((r) => r.json()),
      apiFetch('/api/platform/data-retention/defaults').then((r) => r.json()),
    ])
.then(([features, featureGroups, defaults]) => {
        setFlags(Array.isArray(features) ? features : []);
        setGroups(Array.isArray(featureGroups) ? featureGroups : []);
        setRetention(defaults && typeof defaults === 'object' ? defaults : {});
      })
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
  const appFeatures = flags.filter((f) => f.scope === 'app');

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

      <Widget
        colSpan={12}
        title="Data Retention Defaults"
        subtitle="Super Admin defaults used by organizations that choose to inherit the platform policy."
        padding="md"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {retentionTypes.map(([key, label]) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-slate-600 dark:text-[var(--text-secondary)] mb-1">{label}</label>
              <select
                value={retention[key] == null ? '' : String(retention[key])}
                onChange={(e) => setRetention(prev => ({ ...prev, [key]: e.target.value === '' ? null : Number(e.target.value) }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:bg-[var(--bg-subtle)] dark:border-[var(--border)]"
              >
                <option value="">Never</option>
                <option value="30">30 days</option><option value="90">90 days</option><option value="180">180 days</option>
                <option value="365">1 year</option><option value="730">2 years</option><option value="1095">3 years</option><option value="1825">5 years</option>
              </select>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 dark:bg-[var(--bg-subtle)] p-3">
          <div>
            <div className="text-xs font-semibold text-slate-700 dark:text-[var(--text-primary)]">Platform policy</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Organizations can override these defaults individually.</div>
          </div>
          <button
            type="button"
            disabled={retentionSaving}
            onClick={async () => {
              setRetentionSaving(true);
              try {
                const res = await apiFetch('/api/platform/data-retention/defaults', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ policy: retention }),
                });
                if (!res.ok) throw new Error('Failed to save retention defaults');
              } finally { setRetentionSaving(false); }
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" /> {retentionSaving ? 'Saving…' : 'Save defaults'}
          </button>
        </div>
      </Widget>

      <Widget
        colSpan={12}
        title="Feature Groups"
        subtitle="Create reusable permission bundles. Global-disabled features are automatically excluded from organization and team access."
        padding="md"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)]">
            <Users2 className="h-4 w-4" /> Groups
          </div>
          <button
            type="button"
            onClick={() => setGroupDraft({ key: '', label: '', description: '', featureKeys: [] })}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
          >
            <Plus className="h-3.5 w-3.5" /> New group
          </button>
        </div>

        <div className="space-y-2">
          {groups.map((group) => (
            <div key={group.key} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-[var(--border)] px-3 py-3">
              <div>
                <div className="text-sm font-medium text-slate-700 dark:text-[var(--text-primary)]">{group.label}</div>
                <div className="text-xs text-slate-400">{group.description || 'No description'} · {group.featureKeys.length} features</div>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setGroupDraft({ ...group })} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs">Edit</button>
                {!group.system && (
                  <button
                    type="button"
                    onClick={async () => {
                      await apiFetch('/api/platform/feature-groups/' + encodeURIComponent(group.key), { method: 'DELETE' });
                      load();
                    }}
                    className="rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {groupDraft && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 dark:bg-[var(--bg-subtle)] p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={groupDraft.key}
                disabled={!!groupDraft.system}
                onChange={(e) => setGroupDraft({ ...groupDraft, key: e.target.value })}
                placeholder="Group key"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
              />
              <input
                value={groupDraft.label}
                onChange={(e) => setGroupDraft({ ...groupDraft, label: e.target.value })}
                placeholder="Group name"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
              />
            </div>
            <input
              value={groupDraft.description}
              onChange={(e) => setGroupDraft({ ...groupDraft, description: e.target.value })}
              placeholder="Description"
              className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
            />
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {appFeatures.map((feature) => {
                const selected = groupDraft.featureKeys.includes(feature.key);
                return (
                  <button
                    type="button"
                    key={feature.key}
                    onClick={() => setGroupDraft({
                      ...groupDraft,
                      featureKeys: selected
                        ? groupDraft.featureKeys.filter((k) => k !== feature.key)
                        : [...groupDraft.featureKeys, feature.key],
                    })}
                    disabled={!feature.enabled}
                    className={`rounded-lg border px-3 py-2 text-left text-xs ${selected ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600'} ${!feature.enabled ? 'opacity-40' : ''}`}
                  >
                    <div className="font-semibold">{feature.label}</div>
                    <div className="mt-0.5 text-[10px] text-slate-400">{feature.enabled ? 'Available' : 'Globally disabled'}</div>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setGroupDraft(null)} className="rounded-lg px-3 py-2 text-xs text-slate-500">Cancel</button>
              <button
                type="button"
                disabled={savingGroup || !groupDraft.key || !groupDraft.label}
                onClick={async () => {
                  setSavingGroup(true);
                  try {
                    await apiFetch('/api/platform/feature-groups', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(groupDraft),
                    });
                    setGroupDraft(null);
                    load();
                  } finally {
                    setSavingGroup(false);
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" /> Save group
              </button>
            </div>
          </div>
        )}
      </Widget>
    </div>
  );
}
