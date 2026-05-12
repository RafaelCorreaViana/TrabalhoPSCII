// API Client using fetch

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Erro na requisição');
  }
  return res.json();
};

export const eventsApi = {
  getAll: () => fetch('/api/events').then(handleResponse),
  getById: (id: string) => fetch(`/api/events/${id}`).then(handleResponse),
  create: (data: any) => fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse),
  update: (id: string, data: any) => fetch(`/api/events/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse),
  delete: (id: string) => fetch(`/api/events/${id}`, { method: 'DELETE' }).then(handleResponse),
};

export const matchesApi = {
  create: (eventId: string, data: any) => fetch(`/api/events/${eventId}/matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse),
  update: (id: string, data: any) => fetch(`/api/matches/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse),
  delete: (id: string) => fetch(`/api/matches/${id}`, { method: 'DELETE' }).then(handleResponse),
};

export const teamsApi = {
  create: (data: any) => fetch('/api/teams', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse),
  addMember: (teamId: string, playerId: string) => fetch(`/api/teams/${teamId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId }),
  }).then(handleResponse),
};

export const registrationsApi = {
  getAllByEvent: (eventId: string) => fetch(`/api/events/${eventId}/registrations`).then(handleResponse),
  updateStatus: (id: string, status: string) => fetch(`/api/registrations/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  }).then(handleResponse),
};

export const playerApi = {
  getEvents: (params?: { sport?: string; search?: string }) => {
    const qs = new URLSearchParams(params as any).toString();
    return fetch(`/api/player/events${qs ? `?${qs}` : ''}`).then(handleResponse);
  },
  getEventById: (id: string) => fetch(`/api/player/events/${id}`).then(handleResponse),
  getDashboard: () => fetch('/api/player/dashboard').then(handleResponse),
  register: (eventId: string) => fetch(`/api/player/events/${eventId}/register`, { method: 'POST' }).then(handleResponse),
  cancelRegistration: (eventId: string) => fetch(`/api/player/events/${eventId}/register`, { method: 'DELETE' }).then(handleResponse),
};

export const notificationsApi = {
  getAll: () => fetch('/api/notifications').then(handleResponse),
  markAllAsRead: () => fetch('/api/notifications/read-all', { method: 'PATCH' }).then(handleResponse),
  markAsRead: (id: string) => fetch(`/api/notifications/${id}/read`, { method: 'PATCH' }).then(handleResponse),
};
