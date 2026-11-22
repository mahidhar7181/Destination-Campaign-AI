const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://destination-campaign-ai-backend.onrender.com"
).replace(/\/$/, "");

const API_BASE = `${API_BASE_URL}/api`;

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('dc_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json().catch(() => ({}));
    
    if (!res.ok) {
      const errorMsg = data.message || `Request failed with status ${res.status}`;
      const error = new Error(errorMsg);
      error.status = res.status;
      error.data = data;
      throw error;
    }
    
    return data;
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Authentication
  auth: {
    login: (email, password) => request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
    register: (email, password, full_name, agency_name) => request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name, agency_name })
    }),
    me: () => request('/auth/me'),
    updateProfile: (full_name, agency_name) => request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ full_name, agency_name })
    })
  },

  // AI Generator & Metadata
  generator: {
    getDestinations: () => request('/destinations'),
    enhancePrompt: (payload) => request('/enhance-prompt', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    generate: (payload) => request('/generate', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  // Image Management
  images: {
    list: (params = {}) => {
      const qs = new URLSearchParams();
      if (params.destination && params.destination !== 'All') qs.set('destination', params.destination);
      if (params.campaign_type && params.campaign_type !== 'All') qs.set('campaign_type', params.campaign_type);
      if (params.search) qs.set('search', params.search);
      if (params.saved_only) qs.set('saved_only', 'true');
      if (params.limit) qs.set('limit', params.limit);
      const query = qs.toString() ? `?${qs.toString()}` : '';
      return request(`/images${query}`);
    },
    get: (id) => request(`/images/${id}`),
    toggleSave: (id) => request(`/images/${id}/save`, { method: 'POST' }),
    delete: (id) => request(`/images/${id}`, { method: 'DELETE' }),
    downloadUrl: (id, format = 'jpeg') => `/api/images/${id}/download?format=${format}`
  },

  // Campaign Management
  campaigns: {
    list: () => request('/campaigns'),
    create: (payload) => request('/campaigns', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    get: (id) => request(`/campaigns/${id}`),
    update: (id, payload) => request(`/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
    delete: (id) => request(`/campaigns/${id}`, { method: 'DELETE' }),
    attachImage: (campaignId, imageId) => request(`/campaigns/${campaignId}/images`, {
      method: 'POST',
      body: JSON.stringify({ image_id: imageId })
    }),
    detachImage: (campaignId, imageId) => request(`/campaigns/${campaignId}/images/${imageId}`, {
      method: 'DELETE'
    })
  },

  // Dashboard & History
  dashboard: {
    stats: () => request('/dashboard/stats'),
    history: () => request('/generation-history')
  },

  // Settings & Engine
  settings: {
    getStatus: () => request('/settings/status'),
    updateConfig: (payload) => request('/settings/config', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }
};
