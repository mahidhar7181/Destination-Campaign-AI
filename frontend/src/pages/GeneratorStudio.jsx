import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import ImageCard from '../components/ImageCard';
import { 
  Sparkles, Compass, MapPin, Tag, Camera, Sun, 
  Layers, Download, RefreshCw, Dices, ChevronRight, 
  Check, AlertCircle, Info, Heart, Briefcase, Maximize2 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GeneratorStudio({ 
  onOpenImagePreview, 
  onAttachCampaign,
  initialPrompt = '',
  initialDestination = ''
}) {
  const { user, addToast, engineStatus, setEngineModalOpen } = useAuth();

  // Generator State
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [destination, setDestination] = useState(initialDestination || '');
  const [campaignType, setCampaignType] = useState('Luxury Travel');
  const [visualStyle, setVisualStyle] = useState('Photorealistic');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [lighting, setLighting] = useState('Golden Hour');
  const [composition, setComposition] = useState('Wide-angle Landscape');
  const [count, setCount] = useState(1);
  const [addWatermark, setAddWatermark] = useState(false);
  const [agencyTag, setAgencyTag] = useState(user?.agency_name || 'DestinationCampaign AI');

  // Enhanced Prompt Live Preview
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showPromptDetails, setShowPromptDetails] = useState(false);

  // Generation status & progress
  const [generating, setGenerating] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [generatedResults, setGeneratedResults] = useState([]);
  const [campaignsList, setCampaignsList] = useState([]);

  // Popular destination quick chips
  const popularDestinations = [
    { name: "Maldives", tag: "Tropical Island" },
    { name: "Swiss Alps", tag: "Mountain Chalet" },
    { name: "Santorini", tag: "Aegean Romance" },
    { name: "Kyoto", tag: "Bamboo & Temples" },
    { name: "Amalfi Coast", tag: "Cliffside Glamour" },
    { name: "Bali", tag: "Jungle Sanctuary" },
    { name: "Paris", tag: "Haussmannian Rooftops" },
    { name: "Iceland", tag: "Glacial Aurora" },
  ];

  const campaignCategories = [
    "Hotel Promotion", "Adventure Tourism", "Beach Holiday", 
    "Luxury Travel", "Cultural Tourism", "Honeymoon", "Family Vacation"
  ];

  const visualStyles = [
    "Photorealistic", "Cinematic", "Luxury", 
    "Minimalist", "Vintage", "Fantasy", "3D Art"
  ];

  const aspectRatios = [
    { label: "16:9 Landscape", sub: "Banners & Hero", value: "16:9", icon: "▭" },
    { label: "1:1 Square", sub: "Instagram Post", value: "1:1", icon: "□" },
    { label: "9:16 Vertical", sub: "Reels & Stories", value: "9:16", icon: "▯" },
    { label: "4:5 Portrait", sub: "Social Feed", value: "4:5", icon: "▰" },
  ];

  const lightingOptions = [
    { label: "Golden Hour", desc: "Warm amber sun rays" },
    { label: "Dramatic Sunset", desc: "Vibrant crimson twilight" },
    { label: "Crisp Daylight", desc: "Crystal clear vivid azure" },
    { label: "Twilight Glow", desc: "Deep sapphire blue hour" },
    { label: "Moody Mist", desc: "Ethereal morning haze" },
    { label: "Starry Night", desc: "Milky way & dark sky" },
  ];

  const compositionOptions = [
    "Wide-angle Landscape", "Drone Aerial", "Eye-level Medium Shot", "Cinematic Macro"
  ];

  const loadingSteps = [
    "Analyzing destination topography & cultural context...",
    "Engineering Hasselblad camera lens & lighting...",
    "Synthesizing diffusion latents with FLUX / SDXL...",
    "Post-processing aspect ratio & color tone via Pillow..."
  ];

  // Fetch campaigns for quick attach
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await api.campaigns.list();
        if (res.success) {
          setCampaignsList(res.campaigns || []);
        }
      } catch (_) {}
    };
    fetchCampaigns();
  }, []);

  // Auto-enhance prompt debounce
  const handleEnhancePrompt = async () => {
    if (!prompt.trim() && !destination.trim()) {
      addToast("Enter a prompt or choose a destination first", "info");
      return;
    }
    setIsEnhancing(true);
    try {
      const res = await api.generator.enhancePrompt({
        prompt: prompt.trim(),
        destination: destination.trim(),
        campaign_type: campaignType,
        visual_style: visualStyle,
        lighting,
        composition
      });
      if (res.success) {
        setEnhancedPrompt(res.enhanced_prompt);
        setShowPromptDetails(true);
        addToast("Prompt optimized for travel marketing!", "success");
      }
    } catch (err) {
      addToast("Failed to enhance prompt", "error");
    } finally {
      setIsEnhancing(false);
    }
  };

  // Random travel inspiration
  const handleRandomPrompt = () => {
    const inspirations = [
      {
        dest: "Maldives",
        camp: "Beach Holiday",
        style: "Luxury",
        light: "Golden Hour",
        text: "Private overwater villa sundeck with sunken lounge seating in the crystalline turquoise lagoon, bottle of vintage champagne, peaceful horizon"
      },
      {
        dest: "Swiss Alps, Switzerland",
        camp: "Luxury Travel",
        style: "Photorealistic",
        light: "Dramatic Sunset",
        text: "Cozy timber chalet balcony wrapped in fairy lights, steaming mug on cedar table, snow-dusted summits glowing in crimson sunset"
      },
      {
        dest: "Santorini, Greece",
        camp: "Honeymoon",
        style: "Cinematic",
        light: "Twilight Glow",
        text: "Whitewashed infinity plunge pool terrace carved into Oia volcanic cliffside, glowing candle lanterns, Aegean caldera view at twilight"
      },
      {
        dest: "Kyoto, Japan",
        camp: "Cultural Tourism",
        style: "Photorealistic",
        light: "Moody Mist",
        text: "Traditional wooden ryokan garden veranda looking out into serene Arashiyama bamboo forest in morning mist with stone lanterns"
      },
      {
        dest: "Amalfi Coast, Italy",
        camp: "Hotel Promotion",
        style: "Luxury",
        light: "Crisp Daylight",
        text: "Terraced Mediterranean boutique hotel breakfast table overlooking pastel cliffside houses of Positano, fresh lemons, sparkling azure sea"
      },
      {
        dest: "Bali, Indonesia",
        camp: "Adventure Tourism",
        style: "Photorealistic",
        light: "Golden Hour",
        text: "Cantilevered infinity pool in Ubud jungle resort surrounded by lush palm fronds, tropical morning mist, golden sunlight ray beam"
      }
    ];

    const pick = inspirations[Math.floor(Math.random() * inspirations.length)];
    setDestination(pick.dest);
    setCampaignType(pick.camp);
    setVisualStyle(pick.style);
    setLighting(pick.light);
    setPrompt(pick.text);
    addToast(`Loaded inspiration for ${pick.dest}!`, 'info');
  };

  // Handle Generate
  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!prompt.trim() && !destination.trim()) {
      addToast("Please provide either a prompt idea or destination name.", "error");
      return;
    }

    setGenerating(true);
    setProgressStep(0);

    // Progress stepper animation
    const stepInterval = setInterval(() => {
      setProgressStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 2800);

    try {
      const payload = {
        prompt: prompt.trim(),
        destination: destination.trim(),
        campaign_type: campaignType,
        visual_style: visualStyle,
        aspect_ratio: aspectRatio,
        lighting,
        composition,
        count,
        add_watermark: addWatermark,
        agency_tag: agencyTag
      };

      const res = await api.generator.generate(payload);
      clearInterval(stepInterval);

      if (res.success && res.images?.length) {
        setGeneratedResults(res.images);
        addToast(res.message || "Images generated successfully!", "success");
        try {
          confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
        } catch (_) {}
      } else {
        throw new Error(res.message || "Failed to generate visual");
      }
    } catch (err) {
      clearInterval(stepInterval);
      addToast(err.message || "Visual generation failed. Check engine settings.", "error");
    } finally {
      setGenerating(false);
      setProgressStep(0);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-bold uppercase tracking-wider">
              Diffusion Visual Studio
            </span>
            <span className="text-xs text-slate-400 font-medium">Campaign creative workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Travel Marketing Visual Generator
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Synthesize campaign imagery tailored for destination advertising, luxury hospitality, and social media.
          </p>
        </div>

        {/* Engine switcher quick pill */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRandomPrompt}
            className="px-3.5 py-2 rounded-xl bg-navy-900 border border-sky-500/20 hover:border-sky-500/40 text-xs font-semibold text-sky-300 hover:text-white transition flex items-center gap-1.5"
          >
            <Dices className="w-3.5 h-3.5" />
            <span>Inspire Me</span>
          </button>

          <button
            onClick={() => setEngineModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-navy-900 border border-navy-700 hover:border-slate-500 text-xs font-medium text-slate-300 hover:text-white transition flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{engineStatus?.engine_info?.name || 'Diffusion Engine'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Layout: Controls Left / Results Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Controls Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleGenerate} className="p-6 rounded-3xl bg-navy-900/70 border border-sky-500/15 glass-panel space-y-5 shadow-2xl">
            
            {/* 1. Destination Input & Chips */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-sky-400" /> Destination
                </label>
                <span className="text-[11px] text-slate-400">Where is the campaign set?</span>
              </div>
              <input
                type="text"
                placeholder="e.g. Maldives, Swiss Alps, Santorini, Kyoto, Bali..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition shadow-inner"
              />

              {/* Quick Destination Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {popularDestinations.map((d) => (
                  <button
                    key={d.name}
                    type="button"
                    onClick={() => setDestination(d.name)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition border ${
                      destination.toLowerCase() === d.name.toLowerCase()
                        ? 'bg-sky-500 text-white border-sky-400 font-bold'
                        : 'bg-navy-950/80 hover:bg-navy-800 text-slate-300 border-navy-800'
                    }`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Prompt Text Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-400" /> Marketing Visual Prompt
                </label>
                <button
                  type="button"
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancing}
                  className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin' : ''}`} />
                  {isEnhancing ? 'Enhancing...' : '✨ Enhance Prompt'}
                </button>
              </div>

              <textarea
                rows={3}
                placeholder="Describe your scene: e.g. Private overwater bungalow with infinity plunge pool extending into calm turquoise ocean at sunset, champagne bucket on wooden deck..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-navy-950 border border-navy-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition resize-none shadow-inner"
              />
            </div>

            {/* Enhanced Prompt Preview Drawer */}
            {enhancedPrompt && (
              <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/25 space-y-1.5 animate-slide-up">
                <div className="flex items-center justify-between text-xs font-bold text-sky-300">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" /> Engineered Diffusion Prompt
                  </span>
                  <button
                    type="button"
                    onClick={() => setPrompt(enhancedPrompt)}
                    className="text-[10px] text-sky-400 hover:underline"
                  >
                    Apply to input
                  </button>
                </div>
                <p className="text-xs text-slate-300 font-mono leading-relaxed line-clamp-3">
                  {enhancedPrompt}
                </p>
              </div>
            )}

            {/* 3. Campaign Type & Visual Style Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-sky-400" /> Campaign Category
                </label>
                <select
                  value={campaignType}
                  onChange={(e) => setCampaignType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-xs font-medium text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  {campaignCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-sky-400" /> Visual Style
                </label>
                <select
                  value={visualStyle}
                  onChange={(e) => setVisualStyle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-xs font-medium text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  {visualStyles.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. Aspect Ratio Selector (Visual Cards) */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Aspect Ratio & Channel
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {aspectRatios.map((ar) => (
                  <button
                    key={ar.value}
                    type="button"
                    onClick={() => setAspectRatio(ar.value)}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                      aspectRatio === ar.value
                        ? 'border-sky-400 bg-sky-500/15 text-white shadow-md'
                        : 'border-navy-800 bg-navy-950 hover:border-slate-600 text-slate-400'
                    }`}
                  >
                    <span className="text-sm font-mono text-sky-400">{ar.icon}</span>
                    <span className="text-xs font-bold text-slate-200">{ar.value}</span>
                    <span className="text-[9px] text-slate-400 leading-none">{ar.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Lighting & Atmosphere */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-sky-400" /> Lighting & Mood
                </label>
                <select
                  value={lighting}
                  onChange={(e) => setLighting(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  {lightingOptions.map((l) => (
                    <option key={l.label} value={l.label}>{l.label} ({l.desc})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-sky-400" /> Composition
                </label>
                <select
                  value={composition}
                  onChange={(e) => setComposition(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  {compositionOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 6. Batch Count & Watermark */}
            <div className="pt-2 border-t border-navy-800 grid grid-cols-2 gap-4 items-center">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Batch Variations
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCount(num)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition border ${
                        count === num
                          ? 'bg-sky-500 text-white border-sky-400'
                          : 'bg-navy-950 text-slate-400 border-navy-800 hover:text-white'
                      }`}
                    >
                      {num} {num === 1 ? 'Visual' : 'Visuals'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1 text-right">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Pillow Branding Stamp
                </label>
                <button
                  type="button"
                  onClick={() => setAddWatermark(!addWatermark)}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold border transition ${
                    addWatermark
                      ? 'bg-sky-500/20 text-sky-300 border-sky-400'
                      : 'bg-navy-950 text-slate-400 border-navy-800'
                  }`}
                >
                  {addWatermark ? '✓ Agency Watermark ON' : 'Watermark OFF'}
                </button>
              </div>
            </div>

            {addWatermark && (
              <div className="space-y-1.5">
                <label htmlFor="agency-watermark" className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Watermark Brand
                </label>
                <input
                  id="agency-watermark"
                  type="text"
                  value={agencyTag}
                  onChange={(e) => setAgencyTag(e.target.value)}
                  placeholder="Your agency or brand name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition"
                />
              </div>
            )}

            {/* Generate Action Button */}
            <button
              type="submit"
              disabled={generating}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-sky-brand to-sky-600 hover:brightness-110 text-white font-extrabold text-sm shadow-xl shadow-sky-500/30 flex items-center justify-center gap-2.5 transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-white" />
                  <span>Synthesizing Diffusion Visual...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Campaign Visual{count > 1 ? 's' : ''}</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* RIGHT COLUMN: Results Gallery & Loading State (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Generation Loading Overlay */}
          {generating && (
            <div className="p-8 rounded-3xl bg-navy-900/80 border border-sky-500/30 glass-panel shadow-2xl flex flex-col items-center text-center space-y-6 animate-pulse-slow">
              <div className="relative w-20 h-20">
                <div className="w-20 h-20 rounded-full border-4 border-sky-500/20 border-t-sky-400 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Compass className="w-8 h-8 text-sky-400 animate-bounce-slow" />
                </div>
              </div>

              <div className="space-y-2 max-w-md">
                <h3 className="text-xl font-bold text-white">Generating Travel Marketing Visual</h3>
                <p className="text-sm text-sky-300 font-medium">
                  {loadingSteps[progressStep]}
                </p>
                <div className="text-xs text-slate-400">
                  Destination: <span className="text-slate-200">{destination || 'Global Travel'}</span> • {campaignType} • {aspectRatio}
                </div>
              </div>

              {/* Progress Stepper Indicator */}
              <div className="w-full max-w-sm bg-navy-950 rounded-full h-2 overflow-hidden border border-navy-800">
                <div 
                  className="bg-gradient-to-r from-sky-500 to-sky-glow h-full transition-all duration-1000 ease-out"
                  style={{ width: `${((progressStep + 1) / loadingSteps.length) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Generated Results Section */}
          {generatedResults.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Freshly Generated Visuals
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs">
                      {generatedResults.length} Result{generatedResults.length > 1 ? 's' : ''}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Saved to database and ready for campaign export</p>
                </div>

                <button
                  onClick={() => handleGenerate()}
                  disabled={generating}
                  className="px-3.5 py-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {generatedResults.map((img) => (
                  <ImageCard
                    key={img.id}
                    image={img}
                    onOpenPreview={onOpenImagePreview}
                    onAttachCampaign={onAttachCampaign}
                  />
                ))}
              </div>
            </div>
          ) : !generating ? (
            /* Empty State with Creative Guidance */
            <div className="p-10 rounded-3xl bg-navy-900/40 border border-dashed border-navy-700 text-center flex flex-col items-center justify-center space-y-4 min-h-[460px]">
              <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-center text-sky-400 shadow-lg">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-lg font-bold text-white">Visual Studio Ready</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter a destination prompt or click <strong className="text-sky-300">Inspire Me</strong> to synthesize professional travel marketing campaigns using diffusion models.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleRandomPrompt}
                  className="px-5 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 border border-sky-500/30 text-sky-300 text-xs font-semibold transition flex items-center gap-2"
                >
                  <Dices className="w-4 h-4 text-sky-400" />
                  <span>Load Sample Campaign Prompt</span>
                </button>
              </div>
            </div>
          ) : null}

        </div>

      </div>

    </div>
  );
}
