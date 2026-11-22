import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  X, Download, Heart, Copy, Check, Briefcase, 
  Trash2, Sparkles, MapPin, ArrowLeft, PlusCircle, CheckCircle2
} from 'lucide-react';

export default function ImageModal({ 
  image, 
  isOpen, 
  onClose, 
  onImageDeleted, 
  onImageUpdated, 
  campaigns: initialCampaigns = [],
  onCreateNewCampaign 
}) {
  const { addToast } = useAuth();
  const [copied, setCopied] = useState(false);
  const [copiedEnhanced, setCopiedEnhanced] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [campaignsList, setCampaignsList] = useState(initialCampaigns);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [attaching, setAttaching] = useState(false);
  const [attachedSuccess, setAttachedSuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Auto-fetch campaigns whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setAttachedSuccess(false);
      setSelectedCampaignId('');
      const loadCampaigns = async () => {
        setLoadingCampaigns(true);
        try {
          const res = await api.campaigns.list();
          if (res.success && res.campaigns) {
            setCampaignsList(res.campaigns);
            if (res.campaigns.length > 0) {
              setSelectedCampaignId(String(res.campaigns[0].id));
            }
          }
        } catch (e) {
          console.warn("Failed to load campaigns:", e);
        } finally {
          setLoadingCampaigns(false);
        }
      };
      loadCampaigns();
    }
  }, [isOpen]);

  // Support ESC key to go back/close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !image) return null;

  const handleCopyPrompt = (text, isEnhanced = false) => {
    navigator.clipboard.writeText(text);
    if (isEnhanced) {
      setCopiedEnhanced(true);
      setTimeout(() => setCopiedEnhanced(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    addToast("Prompt copied to clipboard!", "info");
  };

  const handleToggleSave = async () => {
    try {
      const res = await api.images.toggleSave(image.id);
      if (res.success) {
        addToast(res.message, "success");
        if (onImageUpdated) {
          onImageUpdated({ ...image, is_saved: res.is_saved });
        }
      }
    } catch (err) {
      addToast(err.message || "Failed to update save status", "error");
    }
  };

  const handleAttachToCampaign = async () => {
    if (!selectedCampaignId) {
      addToast("Please select a campaign from the dropdown first", "info");
      return;
    }
    setAttaching(true);
    try {
      const res = await api.campaigns.attachImage(selectedCampaignId, image.id);
      if (res.success) {
        setAttachedSuccess(true);
        const camp = campaignsList.find(c => String(c.id) === String(selectedCampaignId));
        addToast(`Visual attached to '${camp?.title || 'campaign'}'!`, "success");
        setTimeout(() => setAttachedSuccess(false), 3000);
      }
    } catch (err) {
      addToast(err.message || "Failed to attach image to campaign", "error");
    } finally {
      setAttaching(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this marketing visual?")) return;
    setDeleting(true);
    try {
      const res = await api.images.delete(image.id);
      if (res.success) {
        addToast("Visual deleted successfully", "success");
        if (onImageDeleted) {
          onImageDeleted(image.id);
        }
        onClose();
      }
    } catch (err) {
      addToast(err.message || "Failed to delete visual", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-slate-200 cursor-default relative"
      >
        
        {/* Floating Top-Left Back / Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md border border-slate-200 text-xs font-bold transition hover:scale-105"
          title="Back (Esc)"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        {/* Left: Full-size Visual Container */}
        <div className="md:w-3/5 bg-slate-50 relative flex items-center justify-center overflow-hidden min-h-[300px] md:min-h-full border-b md:border-b-0 md:border-r border-slate-200 p-2 sm:p-4">
          <img
            src={image.image_url}
            alt={image.title || 'Generated visual'}
            className="w-full h-full max-h-[65vh] md:max-h-[82vh] object-contain rounded-2xl shadow-sm"
          />
          
          {/* Top Engine & Resolution Badge */}
          <div className="absolute top-4 right-4 flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-[11px] font-bold text-slate-800 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3 h-3 text-sky-brand" />
              {image.engine_used || 'Diffusion Engine'}
            </span>
            <button
              onClick={handleToggleSave}
              className={`p-1.5 rounded-full backdrop-blur-md transition shadow-sm ${
                image.is_saved
                  ? 'bg-rose-50 text-rose-500 border border-rose-200'
                  : 'bg-white/90 text-slate-400 hover:text-slate-700 border border-slate-200'
              }`}
              title={image.is_saved ? "Saved in gallery" : "Save to gallery"}
            >
              <Heart className={`w-4 h-4 ${image.is_saved ? 'fill-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Right: Metadata, Prompts & Campaign Attach */}
        <div className="md:w-2/5 p-6 flex flex-col justify-between overflow-y-auto max-h-[85vh] space-y-5 bg-white">
          
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pt-6 md:pt-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-md bg-sky-soft text-sky-brand border border-sky-brand/20 text-[10px] font-bold uppercase tracking-wider">
                    {image.campaign_type || 'Travel Campaign'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                    {image.visual_style || 'Photorealistic'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 leading-snug">
                  {image.title || `${image.destination} Visual`}
                </h2>
                <div className="text-xs text-sky-brand flex items-center gap-1 mt-0.5 font-semibold">
                  <MapPin className="w-3.5 h-3.5" />
                  {image.destination || 'Global Travel'}
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Prompt details */}
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <span>User Concept Idea</span>
                  <button
                    onClick={() => handleCopyPrompt(image.prompt)}
                    className="text-sky-brand hover:underline flex items-center gap-1 capitalize normal-case text-[11px] font-semibold"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-mono">
                  "{image.prompt}"
                </div>
              </div>

              {/* Synthesized Diffusion Prompt */}
              {image.enhanced_prompt && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-sky-brand uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Synthesized Diffusion Prompt
                    </span>
                    <button
                      onClick={() => handleCopyPrompt(image.enhanced_prompt, true)}
                      className="text-sky-brand hover:underline flex items-center gap-1 capitalize normal-case text-[11px] font-semibold"
                    >
                      {copiedEnhanced ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {copiedEnhanced ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-mono max-h-32 overflow-y-auto">
                    {image.enhanced_prompt}
                  </div>
                </div>
              )}
            </div>

            {/* Technical Attributes Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Aspect Ratio</span>
                <span className="font-bold text-slate-800">{image.aspect_ratio || '16:9'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Visual Lighting</span>
                <span className="font-bold text-slate-800">{image.metadata?.lighting || 'Golden Hour'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Composition</span>
                <span className="font-bold text-slate-800">{image.metadata?.composition || 'Wide-angle'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Post-Processed</span>
                <span className="font-bold text-emerald-600">Pillow Pro Fit</span>
              </div>
            </div>

            {/* ADD TO MARKETING CAMPAIGN SECTION (FIXED & UPGRADED) */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-sky-brand" /> Add to Marketing Campaign
                </label>
                
                {onCreateNewCampaign && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onCreateNewCampaign(image.id);
                    }}
                    className="text-[11px] font-bold text-sky-brand hover:underline flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> + New Campaign
                  </button>
                )}
              </div>

              {loadingCampaigns ? (
                <div className="text-xs text-slate-400 py-2">Loading campaigns...</div>
              ) : campaignsList.length > 0 ? (
                <div className="flex gap-2">
                  <select
                    value={selectedCampaignId}
                    onChange={(e) => setSelectedCampaignId(e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 font-medium focus:outline-none focus:border-sky-brand"
                  >
                    {campaignsList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.destination})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAttachToCampaign}
                    disabled={attaching || !selectedCampaignId}
                    className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 ${
                      attachedSuccess 
                        ? 'bg-emerald-600' 
                        : 'bg-sky-brand hover:brightness-105 disabled:opacity-50'
                    }`}
                  >
                    {attachedSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Attached!</span>
                      </>
                    ) : attaching ? (
                      'Attaching...'
                    ) : (
                      'Attach'
                    )}
                  </button>
                </div>
              ) : (
                /* No campaigns yet helper */
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
                  <span>No campaigns created yet.</span>
                  {onCreateNewCampaign && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onCreateNewCampaign(image.id);
                      }}
                      className="font-bold underline text-amber-900 ml-2"
                    >
                      Create Campaign Now
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Footer Actions with prominent Back Button */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-2">
            
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition text-xs"
                title="Delete Visual"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={api.images.downloadUrl(image.id, 'jpeg')}
                download
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JPG</span>
              </a>
              <a
                href={api.images.downloadUrl(image.id, 'png')}
                download
                className="px-4 py-2 rounded-xl bg-sky-brand text-white text-xs font-bold shadow-md hover:brightness-105 transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PNG High-Res</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
