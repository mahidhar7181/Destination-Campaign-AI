import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Building2, Compass, Lock, Mail, UserRound } from 'lucide-react';

export default function RegisterPage({ setActivePage }) {
  const { register, addToast } = useAuth();
  const [fullName, setFullName] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      addToast('Please complete all required fields', 'error');
      return;
    }
    if (password.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }

    setSubmitting(true);
    const res = await register(email, password, fullName, agencyName);
    setSubmitting(false);
    if (res.success) setActivePage('studio');
  };

  return (
    <div className="auth-page">
      <div className="auth-photo">
        <img src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1800&q=85" alt="Mountains reflected in a quiet alpine lake" />
        <div className="auth-photo-shade" />
        <button className="auth-photo-brand" onClick={() => setActivePage('landing')}><Compass size={21} /> DestinationCampaign <i>AI</i></button>
        <div className="auth-photo-caption">
          <span className="eyebrow eyebrow-light">A NEW WAY TO TELL THE STORY</span>
          <p>Give the places<br />you love a <em>new point of view.</em></p>
          <span className="auth-photo-location">02 — The Dolomites, Italy</span>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand"><Compass size={20} /> DestinationCampaign <i>AI</i></div>
          <span className="eyebrow">YOUR CREATIVE WORKSPACE</span>
          <h1>Make room<br /><em>for wonder.</em></h1>
          <p className="auth-intro">Create your account and start building destination campaigns with a distinct point of view.</p>

          <form onSubmit={handleSubmit} className="auth-form auth-register-form">
            <label htmlFor="register-name">Your name <span>Required</span></label>
            <div className="auth-input-wrap"><UserRound size={17} /><input id="register-name" type="text" autoComplete="name" required placeholder="e.g. Maya Lin" value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
            <label htmlFor="register-agency">Agency or brand <span>Optional</span></label>
            <div className="auth-input-wrap"><Building2 size={17} /><input id="register-agency" type="text" autoComplete="organization" placeholder="Your travel brand" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} /></div>
            <label htmlFor="register-email">Work email <span>Required</span></label>
            <div className="auth-input-wrap"><Mail size={17} /><input id="register-email" type="email" autoComplete="email" required placeholder="you@youragency.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <label htmlFor="register-password">Password <span>6 characters minimum</span></label>
            <div className="auth-input-wrap"><Lock size={17} /><input id="register-password" type="password" autoComplete="new-password" minLength={6} required placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <button type="submit" disabled={submitting} className="button-primary auth-submit">{submitting ? 'Creating your account…' : 'Create your account'} <ArrowRight size={16} /></button>
          </form>

          <p className="auth-switch">Already have an account? <button onClick={() => setActivePage('login')}>Sign in <ArrowRight size={14} /></button></p>
          <p className="auth-privacy">Your workspace, your imagery. Securely yours.</p>
        </div>
      </div>
    </div>
  );
}
