const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const payload = await response.json();
  if (!response.ok || !payload.success) throw new Error(payload.message || 'Request failed');
  return payload.data;
}

export const api = {
  list: (query = '') => request(`/applications${query}`),
  create: (body) => request('/applications', { method: 'POST', body: JSON.stringify(body) }),
  get: (id) => request(`/applications/${id}`),
  update: (id, body) => request(`/applications/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  changeStatus: (id, status) => request(`/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  remove: (id) => request(`/applications/${id}`, { method: 'DELETE' })
};
