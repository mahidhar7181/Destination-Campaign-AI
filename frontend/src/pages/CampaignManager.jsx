import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import CampaignModal from '../components/CampaignModal';
import { 
  Briefcase, Plus, MapPin, Tag, Users, Calendar, 
  Trash2, Edit3, Image as ImageIcon, Download, 
  ArrowRight, ArrowLeft, X, Sparkles, FolderPlus, 
  CheckCircle2, Check, PlusCircle 
} from 'lucide-react';

export default function CampaignManager({ onOpenImagePreview, setActivePage }) {
  const { addToast } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [campaignToEdit, setCampaignToEdit] = useState(null);
  const [activeCampaignDetail, setActiveCampaignDetail] = useState(null);

  // Photo Picker State to attach existing gallery photos to campaign
  const [pickerOpen, setPickerOpen] = useState(false);
  const [availableImages, setAvailableImages] = useState([]);
  const [selectedImageIds, setSelectedImageIds] = useState([]);
  const [attachingBatch, setAttachingBatch] = useState(false);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.campaigns.list();
      if (res.success) {
        setCampaigns(res.campaigns || []);
      }
    } catch (err) {
      addToast('Failed to load marketing campaigns', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleOpenDetail = async (campId) => {
    try {
      const res = await api.campaigns.get(campId);
      if (res.success) {
        setActiveCampaignDetail(res.campaign);
      }
    } catch (err) {
      addToast('Failed to load campaign details', 'error');
    }
  };

  const handleDeleteCampaign = async (campId, e) => {
    e?.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this marketing campaign kit?")) return;
    try {
      const res = await api.campaigns.delete(campId);
      if (res.success) {
        addToast("Campaign deleted successfully", "success");
        setCampaigns(prev => prev.filter(c => c.id !== campId));
        if (activeCampaignDetail?.id === campId) {
          setActiveCampaignDetail(null);
        }
      }
    } catch (err) {
      addToast("Failed to delete campaign", "error");
    }
  };

  const handleDetachImage = async (campaignId, imageId) => {
    try {
      const res = await api.campaigns.detachImage(campaignId, imageId);
      if (res.success) {
        addToast("Image removed from campaign", "info");
        handleOpenDetail(campaignId);
        fetchCampaigns();
      }
    } catch (err) {
      addToast("Failed to detach image", "error");
    }
  };

  // Open the photo picker modal to add existing photos
  const handleOpenPhotoPicker = async () => {
    try {
      const res = await api.images.list({ limit: 100 });
      if (res.success) {
        // Exclude images already in the campaign
        const existingIds = new Set((activeCampaignDetail?.images || []).map(img => img.id));
        setAvailableImages(res.images.filter(img => !existingIds.has(img.id)));
        setSelectedImageIds([]);
        setPickerOpen(true);
      }
    } catch (err) {
      addToast("Failed to load your gallery photos", "error");
    }
  };

  const toggleSelectImage = (imgId) => {
    setSelectedImageIds(prev => 
      prev.includes(imgId) ? prev.filter(id => id !== imgId) : [...prev, imgId]
    );
  };

  const handleAttachSelectedImages = async () => {
    if (!selectedImageIds.length || !activeCampaignDetail) return;
    setAttachingBatch(true);
    try {
      let attachedCount = 0;
      for (const imgId of selectedImageIds) {
        const res = await api.campaigns.attachImage(activeCampaignDetail.id, imgId);
        if (res.success) attachedCount++;
      }
      addToast(`Added ${attachedCount} visual${attachedCount > 1 ? 's' : ''} to campaign!`, 'success');
      setPickerOpen(false);
      handleOpenDetail(activeCampaignDetail.id);
      fetchCampaigns();
    } catch (err) {
      addToast(err.message || "Failed to attach photos", "error");
    } finally {
      setAttachingBatch(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-soft text-sky-brand border border-sky-brand/20 text-xs font-bold uppercase tracking-wider">
              Marketing Kits
            </span>
            <span className="text-xs text-slate-500 font-medium">Campaign Organization</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Travel Campaign Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Package and organize generated visual assets into multi-channel client campaign kits.
          </p>
        </div>

        <button
          onClick={() => {
            setCampaignToEdit(null);
            setModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-sky-brand text-white font-bold text-xs shadow-md hover:brightness-105 transition flex items-center gap-2 self-start md:self-auto"
        >
          <FolderPlus className="w-4 h-4" />
          <span>New Campaign Kit</span>
        </button>
      </div>

      {/* Main Campaign Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-sky-brand border-t-transparent animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500">Loading campaign kits...</p>
        </div>
      ) : campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              onClick={() => handleOpenDetail(camp.id)}
              className="group rounded-3xl overflow-hidden bg-white border border-slate-200 glass-card-hover cursor-pointer p-6 space-y-5 flex flex-col justify-between shadow-sm transition-all duration-300"
            >
              <div className="space-y-4">
                {/* Header tags */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-sky-soft text-sky-brand border border-sky-brand/20 text-[10px] font-bold uppercase tracking-wider">
                    {camp.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-sky-brand" />
                    {camp.season || 'Season not set'}
                  </span>
                </div>

                {/* Campaign Title & Destination */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-brand transition line-clamp-1">
                    {camp.title}
                  </h3>
                  <div className="text-xs text-sky-brand font-semibold flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {camp.destination}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {camp.description || 'Custom destination travel marketing visual kit.'}
                </p>

                {/* Visual Thumbnails Moodboard */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-bold text-slate-700">
                      <ImageIcon className="w-3.5 h-3.5 text-sky-brand" />
                      Visual Moodboard
                    </span>
                    <span className="text-sky-brand font-bold">{camp.image_count || 0} Assets</span>
                  </div>

                  {camp.preview_thumbnails && camp.preview_thumbnails.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {camp.preview_thumbnails.map((thumb, idx) => (
                        <div key={idx} className="aspect-video rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                          <img src={thumb} alt="Campaign preview" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-[11px] text-slate-400">
                      No visuals attached yet
                    </div>
                  )}
                </div>

                {/* Target Audience & Budget Tier */}
                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-semibold">Audience:</span>
                    <span className="text-slate-700 font-medium truncate block">{camp.target_audience || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Budget Tier:</span>
                    <span className="text-emerald-700 font-bold block">{camp.budget_tier || 'Not specified'}</span>
                  </div>
                </div>

              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-sky-brand font-bold group-hover:underline flex items-center gap-1">
                  View Kit Details <ArrowRight className="w-3.5 h-3.5" />
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCampaignToEdit(camp);
                      setModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                    title="Edit Campaign"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteCampaign(camp.id, e)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition"
                    title="Delete Campaign"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-16 rounded-3xl bg-white border border-dashed border-slate-200 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-sky-soft text-sky-brand flex items-center justify-center">
            <Briefcase className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-lg font-bold text-slate-900">No Campaigns Created Yet</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Organize your AI-generated destination imagery into branded campaign kits for clients, hotels, or agencies.
            </p>
          </div>
          <button
            onClick={() => {
              setCampaignToEdit(null);
              setModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-sky-brand text-white font-bold text-xs shadow-md hover:brightness-105 transition"
          >
            Create Your First Campaign
          </button>
        </div>
      )}

      {/* Campaign Detail Modal View */}
      {activeCampaignDetail && (
        <div 
          onClick={() => setActiveCampaignDetail(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200 cursor-default"
          >
            
            {/* Modal Header with Prominent Back Button */}
            <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/70">
              <div className="space-y-1.5">
                <button
                  onClick={() => setActiveCampaignDetail(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition mb-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Campaigns</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-sky-soft text-sky-brand border border-sky-brand/20 text-[10px] font-bold uppercase tracking-wider">
                    {activeCampaignDetail.category}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    {activeCampaignDetail.season} • {activeCampaignDetail.budget_tier}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">{activeCampaignDetail.title}</h2>
                <div className="text-xs text-sky-brand font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {activeCampaignDetail.destination} • Target: {activeCampaignDetail.target_audience}
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setActiveCampaignDetail(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Campaign Description */}
              {activeCampaignDetail.description && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 block mb-1">Campaign Strategy:</strong>
                  {activeCampaignDetail.description}
                </div>
              )}

              {/* Attached Images Grid Header */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-sky-brand" />
                    Attached Campaign Visuals ({activeCampaignDetail.images?.length || 0})
                  </h4>

                  {/* Add Photos Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleOpenPhotoPicker}
                      className="px-3 py-1.5 rounded-xl bg-sky-brand text-white font-bold text-xs shadow-sm hover:brightness-105 transition flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>+ Add Photos from Gallery</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveCampaignDetail(null);
                        setActivePage('studio');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-sky-brand" />
                      <span>Generate New</span>
                    </button>
                  </div>
                </div>

                {/* Attached Visuals Grid */}
                {activeCampaignDetail.images && activeCampaignDetail.images.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {activeCampaignDetail.images.map((img) => (
                      <div
                        key={img.id}
                        className="group relative rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm"
                      >
                        <div className="aspect-video relative overflow-hidden bg-slate-100">
                          <img src={img.image_url} alt={img.title} className="w-full h-full object-cover" />
                          
                          {/* Detach button */}
                          <button
                            onClick={() => handleDetachImage(activeCampaignDetail.id, img.id)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 hover:bg-rose-500 hover:text-white text-slate-700 shadow-sm transition"
                            title="Remove photo from campaign"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="p-3 text-xs space-y-1">
                          <div className="font-bold text-slate-900 line-clamp-1">{img.title}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{img.aspect_ratio} • {img.visual_style}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-3">
                    <p className="text-xs text-slate-500 font-medium">No visuals attached to this campaign yet.</p>
                    <button
                      onClick={handleOpenPhotoPicker}
                      className="px-4 py-2 rounded-xl bg-sky-brand text-white font-bold text-xs shadow-sm hover:brightness-105 transition inline-flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Choose Photos from Gallery</span>
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer with prominent Back button */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <button
                onClick={() => setActiveCampaignDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                onClick={() => setActiveCampaignDetail(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PHOTO PICKER MODAL (Allows selecting multiple gallery photos to attach) */}
      {pickerOpen && (
        <div 
          onClick={() => setPickerOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200 cursor-default"
          >
            
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Select Photos to Add</h3>
                <p className="text-xs text-slate-500">
                  Adding to <strong className="text-slate-800">{activeCampaignDetail?.title}</strong>
                </p>
              </div>
              <button
                onClick={() => setPickerOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photos Grid */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {availableImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableImages.map((img) => {
                    const isSelected = selectedImageIds.includes(img.id);
                    return (
                      <div
                        key={img.id}
                        onClick={() => toggleSelectImage(img.id)}
                        className={`group relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                          isSelected
                            ? 'border-sky-brand ring-2 ring-sky-brand/30 shadow-md scale-[1.02]'
                            : 'border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <div className="aspect-video bg-slate-100 relative">
                          <img src={img.image_url} alt={img.title} className="w-full h-full object-cover" />
                          <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition ${
                            isSelected ? 'bg-sky-brand text-white' : 'bg-white/80 text-slate-400 group-hover:bg-white'
                          }`}>
                            {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : <div className="w-2.5 h-2.5 rounded-full border border-slate-400"></div>}
                          </div>
                        </div>
                        <div className="p-2 text-[11px] bg-white">
                          <div className="font-bold text-slate-900 truncate">{img.title}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{img.destination}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-10 text-center text-xs text-slate-500">
                  All your existing visuals are already added to this campaign. Generate more visuals in the studio!
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                {selectedImageIds.length} photo{selectedImageIds.length !== 1 ? 's' : ''} selected
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPickerOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAttachSelectedImages}
                  disabled={!selectedImageIds.length || attachingBatch}
                  className="px-5 py-2.5 rounded-xl bg-sky-brand text-white text-xs font-bold shadow-md hover:brightness-105 transition disabled:opacity-50"
                >
                  {attachingBatch ? 'Attaching...' : `Attach (${selectedImageIds.length}) Photos`}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Campaign Create/Edit Modal */}
      <CampaignModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        campaignToEdit={campaignToEdit}
        onCampaignSaved={() => {
          fetchCampaigns();
        }}
      />

    </div>
  );
}
