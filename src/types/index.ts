export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ContextZone {
  id: string;
  name: string;
  description: string;
  color: string;
  icon?: string;
  order?: number;
  createdAt: string;
  updatedAt?: string;
  userId: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  zoneId: string;
  userId: string;
  dueDate?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export type FocusTimerMode = 'count-up' | 'pomodoro';

export interface FocusSession {
  id: string;
  userId: string;
  zoneId: string;
  startTime: string;
  endTime?: string | null;
  durationSeconds: number;
  completed?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface SwitchEvent {
  id: string;
  userId: string;
  fromZoneId: string | null;
  toZoneId: string;
  timestamp: string;
  createdAt?: string;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirementType?: string;
  requirementValue?: number;
  earnedAt?: string;
  userBadgeId?: string;
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
  action?: { label: string; onClick: () => void };
}
