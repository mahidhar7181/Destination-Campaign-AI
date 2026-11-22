import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Compass, Lock, Mail, Sparkles } from 'lucide-react';

export default function LoginPage({ setActivePage }) {
  const { login, addToast } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password', 'error');
      return;
    }

    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);
    if (res.success) setActivePage('studio');
  };

  const handleDemoLogin = async () => {
    setEmail('demo@destinationcampaign.ai');
    setPassword('demo123');
    setSubmitting(true);
    const res = await login('demo@destinationcampaign.ai', 'demo123');
    setSubmitting(false);
    if (res.success) setActivePage('studio');
  };

  return (
    <div className="auth-page">
      <div className="auth-photo">
        <img src="https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1800&q=85" alt="Sunlit ocean at the edge of a tropical shore" />
        <div className="auth-photo-shade" />
        <button className="auth-photo-brand" onClick={() => setActivePage('landing')}><Compass size={21} /> DestinationCampaign <i>AI</i></button>
        <div className="auth-photo-caption">
          <span className="eyebrow eyebrow-light">THE WORLD IS YOUR CANVAS</span>
          <p>Every great journey<br />begins with a <em>vision.</em></p>
          <span className="auth-photo-location">01 — Somewhere, by the sea</span>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand"><Compass size={20} /> DestinationCampaign <i>AI</i></div>
          <span className="eyebrow">WELCOME BACK</span>
          <h1>Good to see<br /><em>you again.</em></h1>
          <p className="auth-intro">Sign in to pick up where your next great campaign begins.</p>

          <button type="button" onClick={handleDemoLogin} disabled={submitting} className="auth-demo-button">
            <Sparkles size={16} /> Continue with demo account
          </button>
          <div className="auth-divider"><span>or sign in with email</span></div>

          <form onSubmit={handleSubmit} className="auth-form">
            <label htmlFor="login-email">Work email</label>
            <div className="auth-input-wrap"><Mail size={17} /><input id="login-email" type="email" autoComplete="email" required placeholder="you@youragency.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <label htmlFor="login-password">Password</label>
            <div className="auth-input-wrap"><Lock size={17} /><input id="login-password" type="password" autoComplete="current-password" required placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <button type="submit" disabled={submitting} className="button-primary auth-submit">{submitting ? 'Signing in…' : 'Sign in'} <ArrowRight size={16} /></button>
          </form>

          <p className="auth-switch">New to the studio? <button onClick={() => setActivePage('register')}>Create an account <ArrowRight size={14} /></button></p>
          <p className="auth-privacy">Your workspace, your imagery. Securely yours.</p>
        </div>
      </div>
    </div>
  );
}
