import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Check, ChevronDown, Cpu, Loader2, RotateCcw, Save, Sparkles, Volume2 } from 'lucide-react';
import { apiFetch } from '../lib/api';
import Widget from '../components/ui/Widget';

type VoicePrompt = {
  callType: 'INBOUND' | 'OUTBOUND';
  prompt: string;
  defaultPrompt: string;
  isCustomized: boolean;
};

type SystemPrompt = {
  id: string;
  name: string;
  description: string;
  model: string;
  systemPrompt: string;
  defaultSystemPrompt: string;
  isCustomized: boolean;
  tools: string[];
  runsOn: string;
};

type PromptPayload = {
  voice: VoicePrompt[];
  system: SystemPrompt[];
};

export default function PromptsPage() {
  const [data, setData] = useState<PromptPayload>({ voice: [], system: [] });
  const [loading, setLoading] = useState(true);
  const [activeVoice, setActiveVoice] = useState<'INBOUND' | 'OUTBOUND'>('INBOUND');
  const [activeSystem, setActiveSystem] = useState<string | null>(null);
  const [voiceDraft, setVoiceDraft] = useState('');
  const [systemDraft, setSystemDraft] = useState('');
  const [saving, setSaving] = useState<'voice' | 'system' | null>(null);
  const [saved, setSaved] = useState<'voice' | 'system' | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/api/platform/prompts');
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Failed to load prompts');
      const next: PromptPayload = {
        voice: Array.isArray(body.voice) ? body.voice : [],
        system: Array.isArray(body.system) ? body.system : [],
      };
      setData(next);
      const voice = next.voice.find(p => p.callType === activeVoice);
      setVoiceDraft(voice?.prompt || '');
      const firstSystem = activeSystem && next.system.some(p => p.id === activeSystem)
        ? activeSystem
        : next.system[0]?.id || null;
      setActiveSystem(firstSystem);
      setSystemDraft(next.system.find(p => p.id === firstSystem)?.systemPrompt || '');
    } catch (e: any) {
      setError(e.message || 'Failed to load prompts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const currentVoice = useMemo(
    () => data.voice.find(p => p.callType === activeVoice) || null,
    [data.voice, activeVoice]
  );
  const currentSystem = useMemo(
    () => data.system.find(p => p.id === activeSystem) || null,
    [data.system, activeSystem]
  );

  const selectVoice = (type: 'INBOUND' | 'OUTBOUND') => {
    setActiveVoice(type);
    setVoiceDraft(data.voice.find(p => p.callType === type)?.prompt || '');
    setSaved(null);
  };

  const selectSystem = (id: string) => {
    setActiveSystem(id);
    setSystemDraft(data.system.find(p => p.id === id)?.systemPrompt || '');
    setSaved(null);
  };

  const saveVoice = async () => {
    if (!currentVoice) return;
    setSaving('voice'); setSaved(null); setError('');
    try {
      const res = await apiFetch(`/api/platform/prompts/voice/${activeVoice}`, {
        method: 'PUT',
        body: JSON.stringify({ prompt: voiceDraft }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Failed to save voice prompt');
      setData(d => ({ ...d, voice: d.voice.map(p => p.callType === activeVoice ? body : p) }));
      setVoiceDraft(body.prompt);
      setSaved('voice');
    } catch (e: any) {
      setError(e.message || 'Failed to save voice prompt');
    } finally { setSaving(null); }
  };

  const resetVoice = async () => {
    if (!currentVoice || !confirm(`Reset the ${activeVoice.toLowerCase()} voice prompt to the platform default?`)) return;
    setSaving('voice'); setSaved(null); setError('');
    try {
      const res = await apiFetch(`/api/platform/prompts/voice/${activeVoice}`, {
        method: 'PUT',
        body: JSON.stringify({ prompt: '' }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Failed to reset voice prompt');
      setData(d => ({ ...d, voice: d.voice.map(p => p.callType === activeVoice ? body : p) }));
      setVoiceDraft(body.prompt);
      setSaved('voice');
    } catch (e: any) {
      setError(e.message || 'Failed to reset voice prompt');
    } finally { setSaving(null); }
  };

  const saveSystem = async () => {
    if (!currentSystem) return;
    setSaving('system'); setSaved(null); setError('');
    try {
      const res = await apiFetch(`/api/platform/prompts/system/${currentSystem.id}`, {
        method: 'PUT',
        body: JSON.stringify({ systemPrompt: systemDraft }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Failed to save system prompt');
      setData(d => ({ ...d, system: d.system.map(p => p.id === currentSystem.id ? body : p) }));
      setSystemDraft(body.systemPrompt);
      setSaved('system');
    } catch (e: any) {
      setError(e.message || 'Failed to save system prompt');
    } finally { setSaving(null); }
  };

  const resetSystem = async () => {
    if (!currentSystem || !confirm(`Reset "${currentSystem.name}" to the platform default?`)) return;
    setSaving('system'); setSaved(null); setError('');
    try {
      const res = await apiFetch(`/api/platform/prompts/system/${currentSystem.id}`, {
        method: 'PUT',
        body: JSON.stringify({ systemPrompt: '' }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Failed to reset system prompt');
      setData(d => ({ ...d, system: d.system.map(p => p.id === currentSystem.id ? body : p) }));
      setSystemDraft(body.systemPrompt);
      setSaved('system');
    } catch (e: any) {
      setError(e.message || 'Failed to reset system prompt');
    } finally { setSaving(null); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-slate-400"><Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading prompts…</div>;
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <Widget title="Voice agent master prompts" subtitle="These are the two platform-level templates used when generating voice-agent prompts. Existing agents keep their saved prompt until updated.">
        <div className="flex flex-col lg:flex-row min-h-[540px]">
          <div className="lg:w-52 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-[var(--border)] p-2">
            {data.voice.map(p => (
              <button key={p.callType} onClick={() => selectVoice(p.callType)}
                className={`w-full text-left px-3 py-3 rounded-xl text-sm font-medium mb-1 ${activeVoice === p.callType ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                <div className="flex items-center gap-2"><Volume2 className="h-4 w-4" /> {p.callType}</div>
                <div className={`text-[10px] mt-1 ${activeVoice === p.callType ? 'text-slate-300' : 'text-slate-400'}`}>
                  {p.isCustomized ? 'Customized' : 'Default template'}
                </div>
              </button>
            ))}
          </div>
          <div className="flex-1 p-5">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <div className="text-sm font-semibold text-slate-800">Voice prompt · {activeVoice}</div>
                <div className="text-[11px] text-slate-400">Keep the required <code>{'{{...}}'}</code> placeholders intact.</div>
              </div>
              <button onClick={resetVoice} disabled={saving === 'voice'} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 disabled:opacity-50">
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>
            <textarea value={voiceDraft} onChange={e => setVoiceDraft(e.target.value)} className="w-full h-[390px] resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-mono leading-5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400" />
            <div className="flex items-center justify-end gap-3 mt-3">
              {saved === 'voice' && <span className="flex items-center gap-1 text-xs text-emerald-600"><Check className="h-3.5 w-3.5" /> Saved</span>}
              <button onClick={saveVoice} disabled={saving === 'voice'} className="flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl disabled:opacity-50">
                {saving === 'voice' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save prompt
              </button>
            </div>
          </div>
        </div>
      </Widget>

      <Widget title="System / post-call agent prompts" subtitle="Global defaults for the built-in agents that analyze completed calls. Organization-level overrides still take precedence.">
        <div className="flex flex-col lg:flex-row min-h-[540px]">
          <div className="lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-[var(--border)] p-2 max-h-[540px] overflow-y-auto">
            {data.system.map(p => (
              <button key={p.id} onClick={() => selectSystem(p.id)}
                className={`w-full text-left px-3 py-3 rounded-xl mb-1 ${activeSystem === p.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                <div className="flex items-center gap-2 text-sm font-medium"><Cpu className="h-4 w-4" /> {p.name}</div>
                <div className={`text-[10px] mt-1 ${activeSystem === p.id ? 'text-slate-300' : 'text-slate-400'}`}>{p.model}</div>
                {p.isCustomized && <span className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${activeSystem === p.id ? 'bg-slate-700 text-white' : 'bg-amber-100 text-amber-700'}`}>CUSTOMIZED</span>}
              </button>
            ))}
          </div>
          <div className="flex-1 p-5">
            {currentSystem && <>
              <div className="flex items-center justify-between gap-3 mb-2">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{currentSystem.name}</div>
                  <div className="text-[11px] text-slate-400">{currentSystem.description}</div>
                </div>
                <button onClick={resetSystem} disabled={saving === 'system'} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 disabled:opacity-50">
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </button>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-3"><Sparkles className="h-3.5 w-3.5" /> Runs: {currentSystem.runsOn}</div>
              <textarea value={systemDraft} onChange={e => setSystemDraft(e.target.value)} className="w-full h-[390px] resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-mono leading-5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              <div className="flex items-center justify-end gap-3 mt-3">
                {saved === 'system' && <span className="flex items-center gap-1 text-xs text-emerald-600"><Check className="h-3.5 w-3.5" /> Saved</span>}
                <button onClick={saveSystem} disabled={saving === 'system'} className="flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl disabled:opacity-50">
                  {saving === 'system' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save prompt
                </button>
              </div>
            </>}
          </div>
        </div>
      </Widget>

      <div className="text-[10px] text-slate-400">
        <ChevronDown className="inline h-3 w-3 mr-1" /> Platform prompt changes are audited server-side. Validate placeholders before saving.
      </div>
    </div>
  );
}
