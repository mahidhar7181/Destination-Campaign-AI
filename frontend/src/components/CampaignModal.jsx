import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Briefcase, X, Sparkles, MapPin, Tag, Users, Calendar, DollarSign } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CampaignModal({ isOpen, onClose, onCampaignSaved, campaignToEdit = null, preselectedImageId = null }) {
  const { addToast } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [destination, setDestination] = useState('');
  const [category, setCategory] = useState('Luxury Travel');
  const [targetAudience, setTargetAudience] = useState('Luxury Couples & Honeymooners');
  const [season, setSeason] = useState('Summer 2026');
  const [budgetTier, setBudgetTier] = useState('Premium');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (campaignToEdit) {
      setTitle(campaignToEdit.title || '');
      setDescription(campaignToEdit.description || '');
      setDestination(campaignToEdit.destination || '');
      setCategory(campaignToEdit.category || 'Luxury Travel');
      setTargetAudience(campaignToEdit.target_audience || 'Luxury Couples & Honeymooners');
      setSeason(campaignToEdit.season || 'Summer 2026');
      setBudgetTier(campaignToEdit.budget_tier || 'Premium');
    } else {
      setTitle('');
      setDescription('');
      setDestination('');
      setCategory('Luxury Travel');
      setTargetAudience('Luxury Couples & Honeymooners');
      setSeason('Summer 2026');
      setBudgetTier('Premium');
    }
  }, [campaignToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !destination.trim()) {
      addToast('Please provide both campaign title and destination.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        destination: destination.trim(),
        category,
        target_audience: targetAudience,
        season,
        budget_tier: budgetTier,
        ...(preselectedImageId ? { image_ids: [preselectedImageId] } : {})
      };

      let res;
      if (campaignToEdit) {
        res = await api.campaigns.update(campaignToEdit.id, payload);
        addToast("Campaign updated successfully!", "success");
      } else {
        res = await api.campaigns.create(payload);
        addToast(`Campaign '${title}' created successfully!`, "success");
        try {
          confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
        } catch (_) {}
      }

      if (onCampaignSaved) {
        onCampaignSaved(res.campaign);
      }
      onClose();
    } catch (err) {
      addToast(err.message || 'Failed to save campaign', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-navy-900 border border-sky-500/20 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden glass-panel">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-navy-700/60 flex items-center justify-between bg-navy-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-center text-sky-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {campaignToEdit ? 'Edit Marketing Campaign' : 'Create New Campaign Kit'}
              </h3>
              <p className="text-xs text-slate-400">Organize and package destination visuals into client campaigns</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-navy-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Campaign Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Maldives Ultra-Luxury Summer Escape 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-navy-950/80 border border-navy-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition"
            />
          </div>

          {/* Destination & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-400" /> Target Destination *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Maldives, Swiss Alps, Santorini"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-navy-950/80 border border-navy-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-sky-400" /> Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-navy-950/80 border border-navy-700 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
              >
                <option value="Hotel Promotion">Hotel Promotion</option>
                <option value="Adventure Tourism">Adventure Tourism</option>
                <option value="Beach Holiday">Beach Holiday</option>
                <option value="Luxury Travel">Luxury Travel</option>
                <option value="Cultural Tourism">Cultural Tourism</option>
                <option value="Honeymoon">Honeymoon</option>
                <option value="Family Vacation">Family Vacation</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Campaign Description / Objective
            </label>
            <textarea
              rows={3}
              placeholder="Describe the marketing goals, target clientele, tone, and channels (Instagram, Website Hero, Print Brochure)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-navy-950/80 border border-navy-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition resize-none"
            />
          </div>

          {/* Target Audience & Season & Budget */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-sky-400" /> Target Audience
              </label>
              <input
                type="text"
                placeholder="e.g. Luxury Couples"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-navy-950/80 border border-navy-700 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-sky-400" /> Season / Timing
              </label>
              <input
                type="text"
                placeholder="e.g. Summer 2026"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-navy-950/80 border border-navy-700 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-sky-400" /> Budget Tier
              </label>
              <select
                value={budgetTier}
                onChange={(e) => setBudgetTier(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-navy-950/80 border border-navy-700 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              >
                <option value="Ultra-Luxury">Ultra-Luxury</option>
                <option value="Premium">Premium</option>
                <option value="Boutique">Boutique</option>
                <option value="Accessible Luxury">Accessible Luxury</option>
              </select>
            </div>
          </div>

          {/* Preselected image notice */}
          {preselectedImageId && (
            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400 flex-shrink-0" />
              Selected visual will automatically be attached to this campaign upon creation.
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-navy-700/60 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-brand text-white text-xs font-bold shadow-lg shadow-sky-500/20 hover:brightness-110 transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : (campaignToEdit ? 'Save Changes' : 'Create Campaign Kit')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
