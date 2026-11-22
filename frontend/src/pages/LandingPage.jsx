import React from 'react';
import {
  ArrowDown, ArrowRight, ArrowUpRight, Camera, Compass, Layers,
  MapPin, Sparkles, WandSparkles
} from 'lucide-react';

const destinations = [
  {
    name: 'The Maldives',
    region: 'Indian Ocean',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=85',
    shape: 'portrait'
  },
  {
    name: 'Amalfi Coast',
    region: 'Southern Italy',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=85',
    shape: 'landscape'
  },
  {
    name: 'Kyoto, Japan',
    region: 'East Asia',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=85',
    shape: 'landscape'
  }
];

const categories = [
  { title: 'Beach Holiday', note: 'Island days, beautifully told', image: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=1000&q=80' },
  { title: 'Adventure Tourism', note: 'A little further off the map', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80' },
  { title: 'Cultural Tourism', note: 'Stories rooted in place', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80' },
  { title: 'Luxury Travel', note: 'The art of travelling well', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80' }
];

export default function LandingPage({ setActivePage }) {
  const openStudio = () => setActivePage('studio');

  return (
    <div className="editorial-home">
      <section className="home-hero">
        <img
          className="home-hero-image"
          src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=90"
          alt="A quiet coastal landscape at golden hour"
        />
        <div className="home-hero-shade" />
        <div className="home-hero-copy">
          <div className="eyebrow eyebrow-light"><span /> THE ART OF GOING FURTHER</div>
          <h1>Create Extraordinary<br /><em>Travel Campaigns.</em></h1>
          <p>Bring the feeling of a place to life. Create considered, destination-led marketing visuals with an AI studio made for the travel industry.</p>
          <div className="home-hero-actions">
            <button onClick={openStudio} className="button-primary">
              <Sparkles size={16} /> Create a campaign <ArrowRight size={16} />
            </button>
            <button
              onClick={() => document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' })}
              className="button-quiet-light"
            >
              Explore destinations <ArrowDown size={15} />
            </button>
          </div>
          <div className="hero-caption"><MapPin size={14} /> A visual journey, wherever it begins</div>
        </div>
        <div className="hero-index">VISUAL STORYTELLING FOR THE TRAVEL INDUSTRY</div>
      </section>

      <section className="editorial-intro section-wrap">
        <div className="eyebrow">A STUDIO FOR THE JOURNEY</div>
        <div className="intro-grid">
          <h2>Make every destination<br /><em>impossible to forget.</em></h2>
          <div className="intro-copy">
            <p>From the first spark of inspiration to the final campaign asset, create imagery that captures not just where you’re going—but how it feels to be there.</p>
            <button className="text-link" onClick={openStudio}>Discover the studio <ArrowUpRight size={16} /></button>
          </div>
        </div>
      </section>

      <section id="destinations" className="destination-section section-wrap">
        <div className="section-heading">
          <div>
            <div className="eyebrow">THE WORLD, IN FRAME</div>
            <h2>Places with a <em>point of view.</em></h2>
          </div>
          <p>Start with a place. Find a perspective that feels entirely your own.</p>
        </div>
        <div className="destination-grid">
          {destinations.map((destination, index) => (
            <button
              key={destination.name}
              onClick={openStudio}
              className={`destination-card destination-${destination.shape}`}
            >
              <img src={destination.image} alt={`${destination.name} travel inspiration`} loading="lazy" />
              <span className="destination-count">0{index + 1}</span>
              <span className="destination-caption">
                <span className="destination-region">{destination.region}</span>
                <span className="destination-name">{destination.name}</span>
              </span>
              <span className="destination-arrow"><ArrowUpRight size={18} /></span>
            </button>
          ))}
        </div>
      </section>

      <section className="categories-section">
        <div className="section-wrap">
          <div className="section-heading">
            <div>
              <div className="eyebrow">CAMPAIGNS, WITH CHARACTER</div>
              <h2>Every journey tells<br /><em>a different story.</em></h2>
            </div>
            <p>Shape a distinct visual language for every itinerary, property, and audience.</p>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <button key={category.title} className="category-card" onClick={openStudio}>
                <img src={category.image} alt="" loading="lazy" />
                <span className="category-card-shade" />
                <span className="category-copy">
                  <span>{category.note}</span>
                  <strong>{category.title}</strong>
                </span>
                <span className="category-arrow"><ArrowUpRight size={17} /></span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="craft-section section-wrap">
        <div className="craft-image">
          <img src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1500&q=85" alt="Soft waves along a remote coastline" loading="lazy" />
          <span className="craft-image-label">A sense of place, made visual</span>
        </div>
        <div className="craft-copy">
          <div className="eyebrow">INTENTION, MEETS IMAGINATION</div>
          <h2>Thoughtful tools.<br /><em>Remarkable places.</em></h2>
          <p>A considered creative workspace for destination selection, campaign direction, image composition, and the details that make a visual feel like yours.</p>
          <div className="craft-features">
            <div><span className="craft-icon"><WandSparkles size={18} /></span><span><strong>From brief to visual</strong><small>Shape a prompt around your destination and campaign.</small></span></div>
            <div><span className="craft-icon"><Camera size={18} /></span><span><strong>Made for every canvas</strong><small>Choose the composition and aspect ratio you need.</small></span></div>
            <div><span className="craft-icon"><Layers size={18} /></span><span><strong>A workspace that remembers</strong><small>Save, revisit, and organize visuals into campaigns.</small></span></div>
          </div>
          <button onClick={openStudio} className="button-primary">Enter the studio <ArrowRight size={16} /></button>
        </div>
      </section>

      <section className="closing-section">
        <img src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=2200&q=85" alt="Alpine lake and mountains in the early morning" loading="lazy" />
        <div className="closing-overlay" />
        <div className="closing-copy">
          <div className="eyebrow eyebrow-light">YOUR NEXT STORY STARTS HERE</div>
          <h2>The world is waiting<br /><em>to be imagined.</em></h2>
          <button onClick={openStudio} className="button-primary">Create your first visual <ArrowRight size={16} /></button>
        </div>
      </section>

      <footer className="editorial-footer">
        <div className="footer-brand"><Compass size={21} /><span>DestinationCampaign <i>AI</i></span></div>
        <p>Made for the people who make the world feel closer.</p>
        <button onClick={openStudio}>Open the studio <ArrowUpRight size={15} /></button>
      </footer>
    </div>
  );
}
