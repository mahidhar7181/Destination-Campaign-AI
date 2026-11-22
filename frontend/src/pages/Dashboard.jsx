import React, { useEffect, useState } from 'react';
import {
  ArrowRight, Clock3, Cpu, Heart, Image as ImageIcon, MapPin,
  RefreshCw, Sparkles, TrendingUp
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ImageCard from '../components/ImageCard';

export default function Dashboard({ setActivePage, onOpenImagePreview, onRerunPrompt }) {
  const { user, engineStatus, setEngineModalOpen, addToast } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.dashboard.stats();
      if (res.success) setData(res);
    } catch (err) {
      addToast('Failed to load dashboard metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const stats = data?.stats || {};
  const recentHistory = data?.recent_history || [];
  const recentImages = data?.recent_images || [];
  const categories = stats.top_categories || [];
  const maxCategory = Math.max(1, ...categories.map((category) => Number(category.count) || 0));
  const metrics = [
    { label: 'Generated visuals', value: stats.total_images, icon: ImageIcon, note: 'Created in your workspace' },
    { label: 'Saved assets', value: stats.saved_images, icon: Heart, note: 'Kept for later' },
    { label: 'Active campaigns', value: stats.total_campaigns, icon: Sparkles, note: 'Organized campaign kits' },
    { label: 'Destinations explored', value: stats.distinct_destinations, icon: MapPin, note: 'Across your visual library' }
  ];

  return (
    <div className="workspace-page dashboard-page">
      <header className="workspace-heading dashboard-welcome">
        <div>
          <div className="eyebrow">YOUR CREATIVE OVERVIEW</div>
          <h1>Welcome back, <em>{user?.full_name || 'traveller'}.</em></h1>
          <p>{user?.agency_name ? `${user.agency_name} workspace` : 'A considered space for your travel campaigns.'}</p>
        </div>
        <div className="dashboard-actions">
          <button onClick={() => setEngineModalOpen(true)} className="button-secondary"><Cpu size={16} /> Engine settings</button>
          <button onClick={() => setActivePage('studio')} className="button-primary"><Sparkles size={16} /> Create a visual</button>
        </div>
      </header>

      <section className="metrics-grid" aria-label="Workspace metrics">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article key={metric.label} className="metric-card">
              <span className="metric-icon"><Icon size={18} /></span>
              <span className="metric-label">{metric.label}</span>
              <strong className="metric-value">{loading ? <span className="metric-skeleton" /> : (metric.value ?? '—')}</strong>
              <span className="metric-note">{metric.note}</span>
            </article>
          );
        })}
      </section>

      <section className="dashboard-content-grid">
        <div className="dashboard-main-column">
          <section className="workspace-card">
            <div className="card-heading">
              <div><div className="eyebrow">LATEST WORK</div><h2>Recent visuals</h2></div>
              <button onClick={() => setActivePage('gallery')} className="text-link">View gallery <ArrowRight size={15} /></button>
            </div>
            {loading ? (
              <div className="dashboard-image-skeletons"><span /><span /><span /></div>
            ) : recentImages.length ? (
              <div className="dashboard-image-grid">
                {recentImages.slice(0, 3).map((image) => <ImageCard key={image.id} image={image} onOpenPreview={onOpenImagePreview} />)}
              </div>
            ) : (
              <div className="workspace-empty"><ImageIcon size={22} /><p>Your first campaign visual will appear here.</p><button onClick={() => setActivePage('studio')} className="text-link">Open the studio <ArrowRight size={14} /></button></div>
            )}
          </section>

          <section className="workspace-card history-card">
            <div className="card-heading">
              <div><div className="eyebrow">PROMPT JOURNAL</div><h2>Generation history</h2></div>
              <Clock3 size={18} className="muted-icon" />
            </div>
            {loading ? <div className="history-skeletons"><span /><span /><span /></div> : recentHistory.length ? (
              <div className="history-list">
                {recentHistory.map((item) => (
                  <article key={item.id} className="history-row">
                    <div className="history-pin"><MapPin size={15} /></div>
                    <div className="history-copy">
                      <strong>{item.destination || 'Untitled destination'}</strong>
                      <p>{item.prompt}</p>
                      <time>{item.created_at ? new Date(item.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : ''}</time>
                    </div>
                    <button onClick={() => onRerunPrompt?.(item.prompt, item.destination)} className="button-secondary history-action"><RefreshCw size={14} /> Revisit</button>
                  </article>
                ))}
              </div>
            ) : <div className="workspace-empty"><Clock3 size={22} /><p>Your recent prompts will be collected here.</p></div>}
          </section>
        </div>

        <aside className="dashboard-side-column">
          <section className="workspace-card engine-card">
            <div className="card-heading">
              <div><div className="eyebrow">CREATIVE ENGINE</div><h2>Studio status</h2></div>
              <span className="status-dot" />
            </div>
            <div className="engine-name">{engineStatus?.engine_info?.name || 'Engine status unavailable'}</div>
            <p>Manage your image generation provider and model preferences.</p>
            <button onClick={() => setEngineModalOpen(true)} className="text-link">Configure engine <ArrowRight size={15} /></button>
          </section>

          <section className="workspace-card">
            <div className="card-heading">
              <div><div className="eyebrow">YOUR LIBRARY</div><h2>Category mix</h2></div>
              <TrendingUp size={18} className="muted-icon" />
            </div>
            {loading ? <div className="category-skeletons"><span /><span /><span /></div> : categories.length ? (
              <div className="category-breakdown">
                {categories.map((category) => {
                  const amount = Number(category.count) || 0;
                  return (
                    <div className="category-row" key={category.campaign_type}>
                      <div className="category-row-label"><span>{category.campaign_type}</span><strong>{amount}</strong></div>
                      <div className="category-bar"><span style={{ width: `${Math.max(3, (amount / maxCategory) * 100)}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            ) : <div className="workspace-empty compact-empty"><p>Category insights will appear as you create visuals.</p></div>}
          </section>

          <section className="workspace-card">
            <div className="card-heading">
              <div><div className="eyebrow">DESTINATION NOTES</div><h2>Most explored</h2></div>
              <MapPin size={18} className="muted-icon" />
            </div>
            {loading ? <div className="category-skeletons"><span /><span /><span /></div> : stats.top_destinations?.length ? (
              <div className="destination-breakdown">
                {stats.top_destinations.map((destination) => (
                  <div className="destination-row" key={destination.destination}><span>{destination.destination}</span><strong>{destination.count}</strong></div>
                ))}
              </div>
            ) : <div className="workspace-empty compact-empty"><p>Destination insights will appear here.</p></div>}
          </section>
        </aside>
      </section>
    </div>
  );
}
