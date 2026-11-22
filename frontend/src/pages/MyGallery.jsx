import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ImageCard from '../components/ImageCard';
import { 
  Image as ImageIcon, Search, Filter, RefreshCw, 
  Sparkles, Download, Trash2, Heart, ArrowUpDown 
} from 'lucide-react';

export default function MyGallery({ onOpenImagePreview, onAttachCampaign, setActivePage }) {
  const { addToast } = useAuth();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [destinationsList, setDestinationsList] = useState([]);

  const campaignCategories = [
    'All', 'Hotel Promotion', 'Adventure Tourism', 'Beach Holiday', 
    'Luxury Travel', 'Cultural Tourism', 'Honeymoon', 'Family Vacation'
  ];

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await api.images.list({
        search: search.trim() || undefined,
        destination: selectedDestination !== 'All' ? selectedDestination : undefined,
        campaign_type: selectedCategory !== 'All' ? selectedCategory : undefined,
        saved_only: false
      });

      if (res.success) {
        setImages(res.images || []);
        
        // Extract unique destinations
        const dests = Array.from(new Set(res.images.map(img => img.destination).filter(Boolean)));
        setDestinationsList(['All', ...dests]);
      }
    } catch (err) {
      addToast('Failed to load gallery images', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [selectedDestination, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchImages();
  };

  const handleImageDeleted = async (deletedId) => {
    if (!window.confirm('Are you sure you want to delete this visual?')) return;
    try {
      const res = await api.images.delete(deletedId);
      if (!res.success) throw new Error(res.message || 'Failed to delete visual');
      setImages(prev => prev.filter(img => img.id !== deletedId));
      addToast('Visual deleted successfully', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to delete visual', 'error');
    }
  };

  const handleToggleSave = (id, newSavedState) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, is_saved: newSavedState ? 1 : 0 } : img));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-bold uppercase tracking-wider">
              Asset Repository
            </span>
            <span className="text-xs text-slate-400 font-medium">SQLite Database</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            My Generated & Saved Gallery
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Browse, inspect, filter, and download your travel marketing visual library.
          </p>
        </div>

        <button
          onClick={() => setActivePage('studio')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-brand text-white font-bold text-xs shadow-lg shadow-sky-500/20 hover:brightness-110 transition flex items-center gap-2 self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Create New Visual</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-navy-900/60 border border-sky-500/15 glass-panel space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by destination, prompt, or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition"
            />
          </form>

          {/* Destination & Category Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            
            {/* Destination filter */}
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="All">All Destinations</option>
              {destinationsList.filter(d => d !== 'All').map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Category filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              {campaignCategories.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
              ))}
            </select>

            {/* Refresh */}
            <button
              onClick={fetchImages}
              className="p-2 rounded-xl bg-navy-950 border border-navy-700 hover:border-slate-500 text-slate-300 transition"
              title="Refresh Gallery"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
            </button>

          </div>

        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-sky-400 mx-auto" />
          <p className="text-xs text-slate-400">Loading your visual gallery...</p>
        </div>
      ) : images.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Showing <strong className="text-white">{images.length}</strong> campaign visuals</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {images.map((img) => (
              <ImageCard
                key={img.id}
                image={img}
                onOpenPreview={onOpenImagePreview}
                onDelete={handleImageDeleted}
                onToggleSave={handleToggleSave}
                onAttachCampaign={onAttachCampaign}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-16 rounded-3xl bg-navy-900/40 border border-dashed border-navy-700 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-center text-sky-400">
            <ImageIcon className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-lg font-bold text-white">No Visuals Found</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {search || selectedDestination !== 'All' || selectedCategory !== 'All'
                ? "No visuals match your search criteria. Try resetting the filters."
                : "You haven't generated any destination visuals yet. Head over to the studio to create your first visual!"}
            </p>
          </div>
          <button
            onClick={() => setActivePage('studio')}
            className="px-5 py-2.5 rounded-xl bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 hover:bg-sky-400 transition"
          >
            Launch Visual Studio
          </button>
        </div>
      )}

    </div>
  );
}
