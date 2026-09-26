import React, { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { formatInr } from '../lib/pricing';

type BillingConsole = {
  services: { mode: string; aiEnabled: boolean; phoneEnabled: boolean; chargeScope: string };
  overview: Record<string, unknown>;
  billingPeriod?: { label: string; timeZone: string };
  aiBilling?: {
    pricingMode: string;
    source: string;
    effective: { voice: { timeRateAmount?: number }; postCall: { timeRateAmount?: number } };
  } | null;
  phoneBilling?: { providers: Array<{ provider: string; calls: number; durationSeconds: number; providerCostInr: number }>; currentMonthPhoneSpendInr: number } | null;
  minimumCallBalance?: {
    industryDefault: { minimumBalanceInr: number; reservationMinutes: number };
    effective: { effectiveMinimumBalanceInr: number; effectiveReservationMinutes: number; source: string };
  };
  usageAndCost?: Array<{
    callId: string;
    createdAt: string;
    durationSeconds: number;
    telephonyProvider?: string;
    aiCostInr?: number;
    providerCostInr?: number;
    totalCostInr?: number;
    pricingMode?: string;
  }>;
  ledger?: Array<{
    createdAt: string;
    type: string;
    amountInr: number;
    balanceAfterInr?: number;
    description?: string;
    referenceId?: string;
  }>;
};

export default function OrgBillingConsole({ orgId, onRecharge }: { orgId: string; onRecharge?: () => void }) {
  const [data, setData] = useState<BillingConsole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'overview' | 'usage' | 'ledger' | 'config'>('overview');

  const load = useCallback(() => {
    setLoading(true);
    apiFetch(`/api/platform/organizations/${orgId}/billing-console`)
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(body?.error || 'Failed to load billing console');
        setData(body);
        setError(null);
      })
      .catch((e) => setError(e?.message || 'Failed to load billing'))
      .finally(() => setLoading(false));
  }, [orgId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <div className="flex items-center gap-2 text-sm text-slate-400 py-8 justify-center"><Loader2 className="h-4 w-4 animate-spin" /> Loading billing…</div>;
  }
  if (error || !data) {
    return <div className="text-sm text-rose-600 py-4">{error || 'Billing data unavailable'}</div>;
  }

  const overview = data.overview as Record<string, number | string>;
  const isRecharge = overview.billingMethod === 'recharge_based';
  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    ...(data.services.aiEnabled ? [{ id: 'overview' as const, label: 'AI Billing' }] : []),
    ...(data.services.phoneEnabled ? [{ id: 'overview' as const, label: 'Phone Billing' }] : []),
    { id: 'usage' as const, label: 'Usage & Cost' },
    { id: 'ledger' as const, label: 'Ledger' },
    { id: 'config' as const, label: 'Configuration' },
  ];

  const uniqueTabs = ['overview', 'usage', 'ledger', 'config'] as const;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 border-b border-slate-200 pb-2">
        {uniqueTabs.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg ${tab === id ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            {id === 'overview' ? 'Billing Overview' : id === 'usage' ? 'Usage & Cost' : id === 'ledger' ? 'Billing Ledger' : 'Configuration'}
          </button>
        ))}
        <button type="button" onClick={load} className="ml-auto text-[10px] text-slate-400 hover:text-slate-600">Refresh</button>
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          <p className="text-[11px] text-slate-500">
            Service profile: <span className="font-semibold text-slate-700">{data.services.mode.replace(/_/g, ' ')}</span>
            {data.billingPeriod ? ` · Period: ${data.billingPeriod.label} (${data.billingPeriod.timeZone})` : ''}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {isRecharge ? (
              <>
                <Kpi label="Balance" value={formatInr(Number(overview.currentBalanceInr) || 0)} />
                <Kpi label="Reserved" value={formatInr(Number(overview.reservedInr) || 0)} />
                <Kpi label="Available" value={formatInr(Number(overview.availableInr) || 0)} />
                <Kpi label="This month spend" value={formatInr(Number(overview.currentMonthSpendInr) || 0)} />
              </>
            ) : (
              <>
                <Kpi label="This month spend" value={formatInr(Number(overview.currentMonthSpendInr) || 0)} />
                <Kpi label="AI spend" value={formatInr(Number(overview.aiSpendInr) || 0)} />
                {data.services.phoneEnabled && <Kpi label="Phone spend" value={formatInr(Number(overview.phoneSpendInr) || 0)} />}
                <Kpi label="Calls" value={String(overview.totalCalls ?? 0)} />
              </>
            )}
          </div>

          {data.services.aiEnabled && data.aiBilling && (
            <Section title="AI Billing">
              <Row label="Pricing mode" value={data.aiBilling.pricingMode} />
              <Row label="Source" value={data.aiBilling.source.replace(/_/g, ' ')} />
              {data.aiBilling.pricingMode === 'TIME_BASED' && (
                <>
                  <Row label="Voice / audio rate" value={`₹${data.aiBilling.effective.voice.timeRateAmount ?? '—'} / minute`} />
                  <Row label="Post-call rate" value={`₹${data.aiBilling.effective.postCall.timeRateAmount ?? '—'} / minute`} />
                </>
              )}
            </Section>
          )}

          {data.services.phoneEnabled && data.phoneBilling && (
            <Section title="Phone Billing">
              <Row label="This month telephony spend" value={formatInr(data.phoneBilling.currentMonthPhoneSpendInr)} />
              {data.phoneBilling.providers.map((p) => (
                <div key={p.provider} className="text-xs text-slate-600 border-t border-slate-100 pt-2 mt-2">
                  <span className="font-semibold capitalize">{p.provider}</span> — {p.calls} calls, {Math.round(p.durationSeconds / 60)} min, {formatInr(p.providerCostInr)}
                </div>
              ))}
            </Section>
          )}

          {data.minimumCallBalance && (
            <Section title="Minimum call balance">
              <Row label="Industry default" value={`₹${data.minimumCallBalance.industryDefault.minimumBalanceInr} / ${data.minimumCallBalance.industryDefault.reservationMinutes} min reserve`} />
              <Row label="Effective" value={`₹${data.minimumCallBalance.effective.effectiveMinimumBalanceInr} / ${data.minimumCallBalance.effective.effectiveReservationMinutes} min`} />
              <Row label="Source" value={data.minimumCallBalance.effective.source.replace(/_/g, ' ')} />
            </Section>
          )}
        </div>
      )}

      {tab === 'usage' && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-400 border-b">
                <th className="py-2 pr-2">Date</th>
                <th className="py-2 pr-2">Call</th>
                <th className="py-2 pr-2">Duration</th>
                {data.services.phoneEnabled && <th className="py-2 pr-2">Provider</th>}
                {data.services.aiEnabled && <th className="py-2 pr-2">AI</th>}
                {data.services.phoneEnabled && <th className="py-2 pr-2">Phone</th>}
                <th className="py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {(data.usageAndCost || []).map((row) => (
                <tr key={row.callId} className="border-b border-slate-50">
                  <td className="py-2 pr-2 whitespace-nowrap">{new Date(row.createdAt).toLocaleString()}</td>
                  <td className="py-2 pr-2 font-mono text-[10px]">{row.callId}</td>
                  <td className="py-2 pr-2">{row.durationSeconds}s</td>
                  {data.services.phoneEnabled && <td className="py-2 pr-2">{row.telephonyProvider || '—'}</td>}
                  {data.services.aiEnabled && <td className="py-2 pr-2">{formatInr(row.aiCostInr || 0)}</td>}
                  {data.services.phoneEnabled && <td className="py-2 pr-2">{formatInr(row.providerCostInr || 0)}</td>}
                  <td className="py-2 font-semibold">{formatInr(row.totalCostInr || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data.usageAndCost?.length && <p className="text-xs text-slate-400 py-6 text-center">No call billing records yet.</p>}
        </div>
      )}

      {tab === 'ledger' && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-400 border-b">
                <th className="py-2 pr-2">Date</th>
                <th className="py-2 pr-2">Type</th>
                <th className="py-2 pr-2">Amount</th>
                <th className="py-2 pr-2">Balance after</th>
                <th className="py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {(data.ledger || []).map((row, i) => (
                <tr key={`${row.createdAt}-${i}`} className="border-b border-slate-50">
                  <td className="py-2 pr-2 whitespace-nowrap">{new Date(row.createdAt).toLocaleString()}</td>
                  <td className="py-2 pr-2">{row.type}</td>
                  <td className="py-2 pr-2">{formatInr(row.amountInr)}</td>
                  <td className="py-2 pr-2">{row.balanceAfterInr != null ? formatInr(row.balanceAfterInr) : '—'}</td>
                  <td className="py-2">{row.description || row.referenceId || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data.ledger?.length && <p className="text-xs text-slate-400 py-6 text-center">No ledger entries yet.</p>}
        </div>
      )}

      {tab === 'config' && (
        <div className="text-xs text-slate-600 space-y-2">
          <p>Charge scope: <strong>{data.services.chargeScope === 'ai_and_call_provider' ? 'AI + Phone' : 'AI only'}</strong></p>
          <p>Billing method: <strong>{isRecharge ? 'Recharge / prepaid' : 'Pay as you go'}</strong></p>
          <p className="text-slate-400">Pricing overrides and global defaults are managed via platform billing APIs. Historical call costs use snapshots stored at finalize time.</p>
          {onRecharge && isRecharge && (
            <p className="text-slate-500">Use the recharge form above the billing console to top up the wallet.</p>
          )}
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
      <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
      <div className="text-lg font-bold text-slate-900 mt-1">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <h5 className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2">{title}</h5>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800 text-right">{value}</span>
    </div>
  );
}
