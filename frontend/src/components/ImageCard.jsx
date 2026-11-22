import React, { useState } from 'react';
import { Heart, Maximize2, Download, Briefcase, Trash2, Sparkles, MapPin } from 'lucide-react';
import { api } from '../api/client';
const BACKEND_URL = 'https://destination-campaign-ai-backend.onrender.com';
import { useAuth } from '../context/AuthContext';

export default function ImageCard({ 
  image, 
  onOpenPreview, 
  onToggleSave, 
  onDelete, 
  onAttachCampaign,
  showActions = true 
}) {
  const { addToast } = useAuth();
  const [isSaved, setIsSaved] = useState(image.is_saved === 1);
  const [isHovered, setIsHovered] = useState(false);

  const handleSaveClick = async (e) => {
    e.stopPropagation();
    try {
      const res = await api.images.toggleSave(image.id);
      if (res.success) {
        setIsSaved(res.is_saved === 1);
        if (onToggleSave) onToggleSave(image.id, res.is_saved === 1);
        addToast(res.message, 'success');
      }
    } catch (err) {
      addToast('Failed to update saved visual', 'error');
    }
  };

  const handleDownload = (e, format = 'jpeg') => {
    e.stopPropagation();
    window.location.href = api.images.downloadUrl(image.id, format);
  };

  return (
    <div
      onClick={() => onOpenPreview && onOpenPreview(image)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative rounded-2xl overflow-hidden bg-navy-900/90 border border-sky-500/15 glass-card glass-card-hover cursor-pointer flex flex-col transition-all duration-300"
    >
      {/* Visual Container */}
      <div className="relative w-full aspect-video bg-navy-950 overflow-hidden">
        <img
          src={image.image_url?.startsWith('http')
  ? image.image_url
  : `${BACKEND_URL}${image.image_url}`}
          alt={image.title || image.destination}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-full bg-navy-950/80 backdrop-blur-md border border-white/10 text-[10px] font-bold text-sky-300 flex items-center gap-1 shadow-md">
            <MapPin className="w-3 h-3 text-sky-400" />
            {image.destination || 'Global'}
          </span>

          <span className="px-2 py-0.5 rounded-full bg-navy-900/80 backdrop-blur-md border border-white/10 text-[10px] text-slate-300 font-mono">
            {image.aspect_ratio || '16:9'}
          </span>
        </div>

        {/* Hover Overlay Actions */}
        {showActions && (
          <div
            className={`absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/40 to-transparent p-4 flex flex-col justify-end transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenPreview) onOpenPreview(image);
                  }}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition"
                  title="Expand Full View"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                <button
                  onClick={(e) => handleDownload(e, 'jpeg')}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition"
                  title="Quick Download JPG"
                >
                  <Download className="w-4 h-4" />
                </button>

                {onAttachCampaign && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAttachCampaign(image);
                    }}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-sky-300 backdrop-blur-md transition"
                    title="Add to Campaign"
                  >
                    <Briefcase className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleSaveClick}
                  className={`p-2 rounded-xl backdrop-blur-md transition ${
                    isSaved
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title={isSaved ? "Saved in Gallery" : "Save Visual"}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-400' : ''}`} />
                </button>

                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(image.id);
                    }}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 backdrop-blur-md transition"
                    title="Delete visual"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-3.5 flex flex-col justify-between flex-1 gap-2">
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-sky-400 font-medium">{image.campaign_type || 'Travel Campaign'}</span>
            <span className="text-slate-500">{image.visual_style || 'Photorealistic'}</span>
          </div>
          <p className="text-xs text-slate-200 font-medium line-clamp-2 leading-relaxed">
            {image.prompt}
          </p>
        </div>

        <div className="pt-2 border-t border-navy-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span className="truncate max-w-[140px] text-sky-300/80 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            {image.engine_used || 'Diffusion Engine'}
          </span>
          <span>{image.created_at ? new Date(image.created_at).toLocaleDateString() : 'Just now'}</span>
        </div>
      </div>
    </div>
  );
}
