export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface ContextZone {
  id: string;
  name: string;
  description: string;
  color: string; // Tailwind color class or hex (e.g., 'emerald', 'blue', 'purple')
  icon?: string;  // Lucide icon name (e.g., 'Code', 'Mail', 'Calendar', etc.)
  createdAt: string;
  userId: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  zoneId: string; // The zone column it belongs to
  userId: string;
  createdAt: string;
  completedAt?: string | null;
}

export type FocusTimerMode = 'count-up' | 'pomodoro';

export interface FocusSession {
  id: string;
  userId: string;
  zoneId: string;
  startTime: string;
  endTime?: string | null;
  durationSeconds: number;
  tasksCompletedCount: number;
}

export interface SwitchEvent {
  id: string;
  userId: string;
  fromZoneId: string | null;
  toZoneId: string;
  timestamp: string;
  estimatedTimeLostSeconds: number; // 900 seconds (15 minutes) by default
}

export interface UserBadge {
  id: string;
  badgeType: string; // 'deep-diver' | 'switch-master' | 'streak-champion' etc.
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface WhiplashStats {
  totalSwitches: number;
  estimatedTimeLostSeconds: number;
  longestStreakMinutes: number;
  focusTimePerZone: Record<string, number>; // zoneId -> seconds
  recentSwitches: SwitchEvent[];
  badges: UserBadge[];
}

export interface ToastNotice {
  id: string;
  kind: 'success' | 'error' | 'info';
  message: string;
  createdAt: string;
}
