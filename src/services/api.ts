import type { ContextZone, SwitchEvent, Task, User, UserBadge, FocusSession } from '../types';

type JsonRecord = Record<string, unknown>;

const API_BASE = '/api';
let currentToken = 'guest-token';

export const setApiToken = (token: string | null | undefined) => {
  currentToken = token || 'guest-token';
};

export const getApiToken = () => currentToken;

async function requestJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Authorization', `Bearer ${currentToken || 'guest-token'}`);

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let payload: JsonRecord | unknown = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }

  if (!response.ok) {
    const errorMessage =
      typeof payload === 'object' && payload && 'error' in payload
        ? String((payload as JsonRecord).error)
        : response.statusText || 'Request failed';
    throw new Error(errorMessage);
  }

  return payload as T;
}

export interface BackendBootstrap {
  user: User;
  token: string;
  zones: ContextZone[];
  tasks: Task[];
  switches: SwitchEvent[];
  badges: UserBadge[];
}

export interface AnalyticsSummary {
  totalSwitches: number;
  todaySwitches: number;
  longestStreakMinutes: number;
  zoneDistribution: { label: string; color: string; count: number }[];
  focusTimePerZone: Record<string, number>;
}

export const api = {
  // ── Auth ──────────────────────────────────────────────
  async guestSession() {
    return requestJson<{ user: User; token: string }>('/auth/guest', {
      method: 'POST',
    });
  },

  async supabaseAuth(token: string) {
    return requestJson<{ user: User; token: string }>('/auth/supabase', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  // ── Zones ─────────────────────────────────────────────
  getZones() {
    return requestJson<ContextZone[]>('/zones');
  },

  createZone(zone: Partial<ContextZone> & { id: string; name: string; description: string; color: string; icon?: string }) {
    return requestJson<ContextZone>('/zones', {
      method: 'POST',
      body: JSON.stringify(zone),
    });
  },

  updateZone(id: string, zone: Partial<ContextZone> & { name: string; description: string; color: string; icon?: string }) {
    return requestJson<ContextZone>(`/zones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(zone),
    });
  },

  deleteZone(id: string) {
    return requestJson<{ success: boolean; id: string }>(`/zones/${id}`, {
      method: 'DELETE',
    });
  },

  // ── Tasks ─────────────────────────────────────────────
  getTasks() {
    return requestJson<Task[]>('/tasks');
  },

  createTask(task: Partial<Task> & { id: string; title: string; zoneId: string }) {
    return requestJson<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },

  toggleTask(id: string) {
    return requestJson<{ id: string; completed: boolean; updatedAt: string }>(`/tasks/${id}/toggle`, {
      method: 'PATCH',
    });
  },

  moveTask(id: string, zoneId: string) {
    return requestJson<{ id: string; zoneId: string }>(`/tasks/${id}/move`, {
      method: 'PATCH',
      body: JSON.stringify({ zoneId }),
    });
  },

  deleteTask(id: string) {
    return requestJson<{ success: boolean; id: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  // ── Switches ──────────────────────────────────────────
  getSwitchesToday() {
    return requestJson<SwitchEvent[]>('/switches/today');
  },

  addSwitch(switchEvent: Partial<SwitchEvent> & { id: string; toZoneId: string }) {
    return requestJson<SwitchEvent>('/switches', {
      method: 'POST',
      body: JSON.stringify({ fromZoneId: switchEvent.fromZoneId, toZoneId: switchEvent.toZoneId }),
    });
  },

  // ── Badges ────────────────────────────────────────────
  getBadges() {
    return requestJson<UserBadge[]>('/badges');
  },

  getBadgesUser() {
    return requestJson<UserBadge[]>('/badges/user');
  },

  checkBadges() {
    return requestJson<{ awards: UserBadge[] }>('/badges/check', {
      method: 'POST',
    });
  },

  // ── Focus Sessions ────────────────────────────────────
  getSessions() {
    return requestJson<FocusSession[]>('/sessions');
  },

  createSession(zoneId: string) {
    return requestJson<FocusSession>('/sessions', {
      method: 'POST',
      body: JSON.stringify({ zoneId }),
    });
  },

  endSession(id: string, durationSeconds: number, completed: boolean) {
    return requestJson<FocusSession>(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ durationSeconds, completed }),
    });
  },

  // ── Analytics ─────────────────────────────────────────
  getAnalyticsSummary() {
    return requestJson<AnalyticsSummary>('/analytics/summary');
  },

  getAvgFocusDuration() {
    return requestJson<{ avgDurationMinutes: number }>('/analytics/avg-focus-duration');
  },

  getRecommendations() {
    return requestJson<{ id: string; type: string; message: string; action?: string }[]>('/analytics/recommendations');
  },

  // ── AI ───────────────────────────────────────────────
  suggestZone(taskDescription: string) {
    return requestJson<{ zoneId: string; zoneName: string }>('/ai/suggest-zone', {
      method: 'POST',
      body: JSON.stringify({ description: taskDescription }),
    });
  },

  // ── Tasks (extended) ────────────────────────────────
  getUnbatchedTasks() {
    return requestJson<Task[]>('/tasks/unbatched');
  },
};
