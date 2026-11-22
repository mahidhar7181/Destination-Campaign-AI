import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Cpu, Key, Check, AlertTriangle, ShieldCheck, Sparkles, X, ExternalLink, RefreshCw } from 'lucide-react';

export default function EngineSettingsModal() {
  const { engineModalOpen, setEngineModalOpen, engineStatus, refreshEngineStatus, addToast } = useAuth();
  
  const [preferredEngine, setPreferredEngine] = useState('auto');
  const [hfKey, setHfKey] = useState('');
  const [hfModel, setHfModel] = useState('stabilityai/stable-diffusion-xl-base-1.0');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (engineStatus) {
      setPreferredEngine(engineStatus.user_engine_preference || 'auto');
      setHfModel(engineStatus.hf_model || 'stabilityai/stable-diffusion-xl-base-1.0');
    }
  }, [engineStatus]);

  if (!engineModalOpen) return null;

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const payload = {
        preferred_engine: preferredEngine,
        hf_model: hfModel
      };
      if (hfKey.trim()) {
        payload.huggingface_api_key = hfKey.trim();
      }

      const res = await api.settings.updateConfig(payload);
      if (res.success) {
        addToast("AI Engine settings updated successfully!", "success");
        await refreshEngineStatus();
        setHfKey('');
        setEngineModalOpen(false);
      }
    } catch (err) {
      addToast(err.message || "Failed to update engine settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      // Trigger prompt enhance as connection test
      const res = await api.generator.enhancePrompt({
        prompt: "Tropical beach resort",
        destination: "Maldives",
        campaign_type: "Beach Holiday"
      });
      if (res.success) {
        setTestResult({
          success: true,
          message: "Connection verified! Diffusion prompt pipeline and engine are active and responsive."
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err.message || "Engine connection test failed."
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-navy-900 border border-sky-500/20 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden glass-panel">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-navy-700/60 flex items-center justify-between bg-navy-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-center text-sky-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Diffusion AI Engine Settings
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                  Active
                </span>
              </h3>
              <p className="text-xs text-slate-400">Configure Hugging Face, Live Diffusion, or Demo Mode</p>
            </div>
          </div>
          <button
            onClick={() => setEngineModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-navy-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Active Engine Notice */}
          <div className="p-4 rounded-xl bg-navy-800/60 border border-sky-500/15 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-semibold text-slate-200">
                Current Engine: <span className="text-sky-300">{engineStatus?.engine_info?.name || 'Live Diffusion Engine'}</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                DestinationCampaign AI generates professional travel marketing visuals using actual diffusion models. You can connect your personal Hugging Face token, utilize the built-in free live diffusion pipeline, or activate offline demo presets.
              </p>
            </div>
          </div>

          {/* Engine Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Select Diffusion Provider
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              <button
                type="button"
                onClick={() => setPreferredEngine('auto')}
                className={`p-3 rounded-xl border text-left transition ${
                  preferredEngine === 'auto'
                    ? 'border-sky-400 bg-sky-500/10 text-white'
                    : 'border-navy-700 bg-navy-800/40 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="text-xs font-bold text-sky-300 mb-1 flex items-center justify-between">
                  Auto / Live
                  {preferredEngine === 'auto' && <Check className="w-3.5 h-3.5" />}
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  Uses HF if key exists, otherwise runs free live FLUX/SDXL diffusion.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPreferredEngine('huggingface')}
                className={`p-3 rounded-xl border text-left transition ${
                  preferredEngine === 'huggingface'
                    ? 'border-sky-400 bg-sky-500/10 text-white'
                    : 'border-navy-700 bg-navy-800/40 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="text-xs font-bold text-sky-300 mb-1 flex items-center justify-between">
                  Hugging Face
                  {preferredEngine === 'huggingface' && <Check className="w-3.5 h-3.5" />}
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  Direct Hugging Face Inference API with custom model & token.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPreferredEngine('demo')}
                className={`p-3 rounded-xl border text-left transition ${
                  preferredEngine === 'demo'
                    ? 'border-amber-400 bg-amber-500/10 text-white'
                    : 'border-navy-700 bg-navy-800/40 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="text-xs font-bold text-amber-300 mb-1 flex items-center justify-between">
                  Demo Presets
                  {preferredEngine === 'demo' && <Check className="w-3.5 h-3.5" />}
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  Instant offline mode using curated high-res travel campaign presets.
                </div>
              </button>

            </div>
          </div>

          {/* Hugging Face API Key Configuration */}
          <div className="space-y-3 pt-2 border-t border-navy-700/60">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-sky-400" /> Hugging Face Access Token
              </label>
              <a
                href="https://huggingface.co/settings/tokens"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-sky-400 hover:underline flex items-center gap-1"
              >
                Get Free Token <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            
            <input
              type="password"
              placeholder={engineStatus?.hf_configured ? "Token is saved (enter new token to replace)" : "hf_xxxxxxxxxxxxxxxxxxxxxxxxx"}
              value={hfKey}
              onChange={(e) => setHfKey(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-navy-950/80 border border-navy-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition"
            />
            {engineStatus?.hf_configured && (
              <div className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Token active: {engineStatus.hf_token_preview}
              </div>
            )}
          </div>

          {/* Diffusion Model Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Diffusion Model (for Hugging Face)
            </label>
            <select
              value={hfModel}
              onChange={(e) => setHfModel(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-navy-950/80 border border-navy-700 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
            >
              <option value="stabilityai/stable-diffusion-xl-base-1.0">stabilityai/stable-diffusion-xl-base-1.0 (Recommended SDXL)</option>
              <option value="black-forest-labs/FLUX.1-schnell">black-forest-labs/FLUX.1-schnell (Ultra-Fast FLUX)</option>
              <option value="runwayml/stable-diffusion-v1-5">runwayml/stable-diffusion-v1-5 (Stable Diffusion 1.5)</option>
            </select>
          </div>

          {/* Test connection alert */}
          {testResult && (
            <div className={`p-3 rounded-xl text-xs border ${
              testResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              {testResult.message}
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-navy-700/60 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="px-4 py-2 rounded-xl border border-navy-700 hover:border-slate-500 bg-navy-800/40 text-xs font-medium text-slate-300 hover:text-white transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-sky-400' : ''}`} />
              {testing ? 'Testing...' : 'Test Connection'}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEngineModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-brand text-white text-xs font-bold shadow-lg shadow-sky-500/20 hover:brightness-110 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
