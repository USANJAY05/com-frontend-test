import React, { useEffect, useState } from 'react';
import { Building2, Users, PhoneCall, Clock, Loader2, IndianRupee, Archive, Activity, Gauge, ShieldCheck } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { Stats, TimeSeries, AuditRow } from './types';
import Widget from '../components/ui/Widget';
import LineChart from './charts/LineChart';
import BarChart from './charts/BarChart';
import DistributionBars from './charts/DistributionBars';

function StatWidget({ label, value, icon, accent }: { label: string; value: string | number; icon: React.ElementType; accent: string }) {
  return (
    <Widget colSpan={3} icon={icon} accent={accent} padding="md">
      <span className="text-xs font-medium text-slate-500 dark:text-[var(--text-secondary)]">{label}</span>
      <div className="text-2xl font-semibold text-slate-900 dark:text-[var(--text-primary)] mt-1">{value}</div>
    </Widget>
  );
}

function formatInr(n: number) {
  return `₹${(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

async function fetchJsonOrNull<T>(path: string): Promise<T | null> {
  const r = await apiFetch(path);
  if (!r.ok) return null;
  return r.json();
}

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [series, setSeries] = useState<TimeSeries | null>(null);
  const [activity, setActivity] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchJsonOrNull<Stats>('/api/platform/stats'),
      fetchJsonOrNull<TimeSeries>('/api/platform/timeseries'),
      fetchJsonOrNull<AuditRow[]>('/api/platform/audit-log')
    ]).then(([s, t, a]) => {
      setStats(s);
      setSeries(t);
      setActivity(Array.isArray(a) ? a.slice(0, 8) : []);
      if (!s || !t) setError(true);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-400"><Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading overview…</div>;
  }

  if (error || !stats || !series) {
    return <div className="flex items-center justify-center h-64 text-rose-400 text-sm">Could not load overview data. Check the backend logs for /api/platform/stats and /api/platform/timeseries.</div>;
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <StatWidget label="Organizations" value={stats.totalOrganizations} icon={Building2} accent="#2a78d6" />
      <StatWidget label="Registered users" value={stats.totalUsers} icon={Users} accent="#1baf7a" />
      <StatWidget label="Total calls" value={stats.totalCalls} icon={PhoneCall} accent="#eb6834" />
      <StatWidget label="Signups, last 30 days" value={series.signupsByDay.reduce((s, d) => s + d.count, 0)} icon={Clock} accent="#4a3aa7" />

      {/* Platform-wide cost — summed from each org's own accrued/locked-in
          figures (never today's rate applied retroactively). See the
          Cost page for per-provider rates. */}
      <Widget
        colSpan={6}
        title="Platform cost"
        subtitle="Summed across every organization's accrued call and AI token cost"
        icon={IndianRupee}
        accent="#0d9488"
        padding="md"
      >
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-50 dark:bg-[var(--bg-subtle)] p-4 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 dark:text-[var(--text-muted)] uppercase tracking-wider block">Call cost</span>
            <strong className="text-md text-slate-800 dark:text-[var(--text-primary)] font-mono">{formatInr(stats.totalPhoneChargesInr)}</strong>
          </div>
          <div className="bg-slate-50 dark:bg-[var(--bg-subtle)] p-4 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 dark:text-[var(--text-muted)] uppercase tracking-wider block">AI token cost</span>
            <strong className="text-md text-slate-800 dark:text-[var(--text-primary)] font-mono">{formatInr(stats.totalAiTokenCostInr)}</strong>
          </div>
          <div className="bg-slate-50 dark:bg-[var(--bg-subtle)] p-4 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 dark:text-[var(--text-muted)] uppercase tracking-wider block">Active providers</span>
            <strong className="text-md text-slate-800 dark:text-[var(--text-primary)] font-mono">{stats.activeCostProviderCount}</strong>
          </div>
        </div>
        {stats.selfManagedCallOrgCount > 0 && (
          <p className="text-[10px] text-slate-400 dark:text-[var(--text-muted)] mt-3">
            Excludes {stats.selfManagedCallOrgCount} org{stats.selfManagedCallOrgCount === 1 ? '' : 's'} using their own connected call-provider account — the platform doesn't pay for those calls.
          </p>
        )}
      </Widget>

      <Widget
        colSpan={6}
        title="Deleted organizations"
        subtitle="Cost history kept permanently, even after the org itself is gone"
        icon={Archive}
        accent="#b45309"
        padding="md"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-semibold text-slate-900 dark:text-[var(--text-primary)]">{stats.archivedOrgCount}</div>
            <p className="text-xs text-slate-400 dark:text-[var(--text-muted)] mt-1">
              {stats.archivedOrgCount === 0 ? 'No organizations deleted yet.' : 'See the Cost page for each org\'s final cost snapshot.'}
            </p>
          </div>
        </div>
      </Widget>

      <Widget colSpan={6} title="New organizations" subtitle="Daily signups, last 30 days" padding="md">
        <LineChart data={series.signupsByDay} color="#2a78d6" />
      </Widget>
      <Widget colSpan={6} title="Call volume" subtitle="Calls placed per day, last 30 days" padding="md">
        <BarChart data={series.callsByDay} color="#eb6834" />
      </Widget>

      <Widget colSpan={6} title="Platform pulse" subtitle="Derived from the last 30 days of platform activity" icon={Activity} accent="#7c3aed" padding="md">
        {(() => {
          const signups = series.signupsByDay.reduce((sum, d) => sum + d.count, 0);
          const calls = series.callsByDay.reduce((sum, d) => sum + d.count, 0);
          const avgCalls = Math.round(calls / Math.max(1, series.callsByDay.length));
          const avgSignups = (signups / Math.max(1, series.signupsByDay.length)).toFixed(1);
          const callsPerUser = stats.totalUsers ? (stats.totalCalls / stats.totalUsers).toFixed(1) : '0.0';
          return (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 dark:border-[var(--border)] bg-slate-50 dark:bg-[var(--bg-subtle)] p-4">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]"><Gauge className="h-3.5 w-3.5" /> Avg calls/day</div>
                <div className="mt-2 text-xl font-semibold text-[var(--text-primary)]">{avgCalls.toLocaleString()}</div>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-[var(--border)] bg-slate-50 dark:bg-[var(--bg-subtle)] p-4">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]"><Activity className="h-3.5 w-3.5" /> Avg signups/day</div>
                <div className="mt-2 text-xl font-semibold text-[var(--text-primary)]">{avgSignups}</div>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-[var(--border)] bg-slate-50 dark:bg-[var(--bg-subtle)] p-4">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]"><PhoneCall className="h-3.5 w-3.5" /> Calls/user</div>
                <div className="mt-2 text-xl font-semibold text-[var(--text-primary)]">{callsPerUser}</div>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-[var(--border)] bg-slate-50 dark:bg-[var(--bg-subtle)] p-4">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]"><ShieldCheck className="h-3.5 w-3.5" /> Self-managed</div>
                <div className="mt-2 text-xl font-semibold text-[var(--text-primary)]">{stats.selfManagedCallOrgCount}</div>
              </div>
            </div>
          );
        })()}
      </Widget>

      <Widget colSpan={6} title="Cost allocation" subtitle="Current accrued platform cost" icon={IndianRupee} accent="#0d9488" padding="md">
        {(() => {
          const call = Number(stats.totalPhoneChargesInr || 0);
          const ai = Number(stats.totalAiTokenCostInr || 0);
          const total = call + ai;
          const callPct = total ? Math.round((call / total) * 100) : 0;
          const aiPct = total ? 100 - callPct : 0;
          return (
            <div className="space-y-4">
              <div className="h-3 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-[var(--bg-subtle)] flex">
                <div className="h-full bg-teal-500" style={{ width: `${callPct}%` }} />
                <div className="h-full bg-violet-500" style={{ width: `${aiPct}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20 p-3">
                  <div className="text-teal-700 dark:text-teal-300 font-semibold">Phone</div>
                  <div className="mt-1 text-[var(--text-primary)] font-mono">{formatInr(call)} <span className="text-[var(--text-muted)]">({callPct}%)</span></div>
                </div>
                <div className="rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 p-3">
                  <div className="text-violet-700 dark:text-violet-300 font-semibold">AI tokens</div>
                  <div className="mt-1 text-[var(--text-primary)] font-mono">{formatInr(ai)} <span className="text-[var(--text-muted)]">({aiPct}%)</span></div>
                </div>
              </div>
              <div className="text-[10px] text-[var(--text-muted)]">Total accrued cost: <span className="font-semibold text-[var(--text-secondary)]">{formatInr(total)}</span></div>
            </div>
          );
        })()}
      </Widget>

      <Widget colSpan={6} title="Plan mix" padding="md">
        <DistributionBars rows={series.planDistribution.map((p) => ({ label: p.plan, count: p.count }))} />
      </Widget>
      <Widget colSpan={6} title="Industry mix" padding="md">
        <DistributionBars rows={series.industryDistribution.map((p) => ({ label: p.industry, count: p.count }))} />
      </Widget>

      <Widget colSpan={12} title="Recent activity across all organizations" padding="md">
        <div className="space-y-2">
          {activity.length === 0 && <p className="text-xs text-slate-400 dark:text-[var(--text-muted)]">No activity recorded yet.</p>}
          {activity.map((a) => (
            <div key={a.id} className="flex items-center justify-between text-xs py-2 border-b border-slate-50 dark:border-[var(--border)] last:border-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">{a.orgName}</span>
                <span className="text-slate-600 dark:text-[var(--text-secondary)]">{a.action}</span>
                <span className="text-slate-400 dark:text-[var(--text-muted)]">by {a.actorEmail}</span>
              </div>
              <span className="text-slate-400 dark:text-[var(--text-muted)]">{new Date(a.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </Widget>
    </div>
  );
}
