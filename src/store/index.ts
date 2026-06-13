import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BackendBootstrap, AnalyticsSummary } from '../services/api';
import { api, setApiToken } from '../services/api';
import type { ContextZone, SwitchEvent, Task, ToastNotice, User, UserBadge } from '../types';

interface FlowrState {
  currentUser: User | null;
  token: string | null;
  setAuth: (user: User | null, token: string | null) => void;
  logout: () => void;

  zones: ContextZone[];
  setZones: (zones: ContextZone[]) => void;
  addZone: (name: string, description: string, color: string, icon?: string) => ContextZone;
  updateZone: (id: string, name: string, description: string, color: string, icon?: string) => void;
  deleteZone: (id: string) => void;

  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (title: string, description: string | undefined, zoneId: string) => Task;
  completeTask: (id: string) => void;
  toggleTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, targetZoneId: string) => void;
  reorderTasks: (zoneId: string, startIndex: number, endIndex: number) => void;

  activeZoneId: string | null;
  isGuardianActive: boolean;
  focusStartTime: string | null;
  timerMode: 'count-up' | 'pomodoro';
  pomodoroDurationMinutes: number;
  pomodoroSecondsLeft: number;
  isTimerRunning: boolean;
  startFocus: (zoneId: string, mode?: 'count-up' | 'pomodoro', durationMinutes?: number) => void;
  endFocus: (bypassedBuffer?: boolean) => void;
  tickTimer: () => void;
  toggleTimerRunning: () => void;

  isBufferActive: boolean;
  bufferSecondsLeft: number;
  bufferFromZoneId: string | null;
  bufferToZoneId: string | null;
  bufferBypassed: boolean;
  startBuffer: (fromZoneId: string, toZoneId: string | null) => void;
  tickBuffer: () => void;
  skipBuffer: () => void;
  resetBuffer: () => void;

  switches: SwitchEvent[];
  badges: UserBadge[];
  addSwitch: (fromZoneId: string | null, toZoneId: string) => SwitchEvent;
  recordSwitch: (fromZoneId: string | null, toZoneId: string) => SwitchEvent;
  earnBadge: (badgeType: string, name: string, description: string, icon: string) => UserBadge;
  unlockBadge: (badgeType: string, name: string, description: string, icon: string) => UserBadge;

  toasts: ToastNotice[];
  pushToast: (message: string, kind?: ToastNotice['kind']) => string;
  dismissToast: (id: string) => void;

  hasHydratedFromBackend: boolean;
  hydrateFromBackend: (payload: BackendBootstrap) => void;

  analytics: AnalyticsSummary | null;
  analyticsLoading: boolean;
  fetchAnalytics: () => Promise<void>;
}

const nowIso = () => new Date().toISOString();
const nextId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const defaultZones = (userId: string): ContextZone[] => [
  {
    id: 'z-deep-code',
    name: 'Deep Code',
    description: 'Coding, refactoring, building architecture. Focus block.',
    color: 'emerald',
    icon: 'Code',
    createdAt: nowIso(),
    userId,
  },
  {
    id: 'z-comms',
    name: 'Comms & Sync',
    description: 'Slack, emails, pull request reviews, team chats.',
    color: 'blue',
    icon: 'MessageSquare',
    createdAt: nowIso(),
    userId,
  },
  {
    id: 'z-admin',
    name: 'Admin & Planning',
    description: 'Jira tickets, scheduling, timesheets, documentation.',
    color: 'purple',
    icon: 'Settings',
    createdAt: nowIso(),
    userId,
  },
];

const defaultTasks = (userId: string): Task[] => [
  {
    id: 't1',
    title: 'Implement Flow Guardian Fullscreen Interface',
    description: 'Build a distraction-free immersive layout for active zones.',
    completed: false,
    zoneId: 'z-deep-code',
    userId,
    createdAt: nowIso(),
  },
  {
    id: 't2',
    title: 'Establish SQLite database schema',
    description: 'Design robust SQLite database tables for users, tasks, and switches.',
    completed: false,
    zoneId: 'z-deep-code',
    userId,
    createdAt: nowIso(),
  },
  {
    id: 't3',
    title: 'Write core custom transition animations',
    description: 'Add circular breath animations and sliding effects.',
    completed: true,
    zoneId: 'z-deep-code',
    userId,
    createdAt: nowIso(),
    completedAt: nowIso(),
  },
  {
    id: 't4',
    title: 'Review PR for frontend analytics charts',
    description: 'Check team submissions for whiplash streak stats.',
    completed: false,
    zoneId: 'z-comms',
    userId,
    createdAt: nowIso(),
  },
  {
    id: 't5',
    title: 'Respond to Design Review email thread',
    description: 'Provide feedback on typography and layout decisions.',
    completed: false,
    zoneId: 'z-comms',
    userId,
    createdAt: nowIso(),
  },
  {
    id: 't6',
    title: 'Log sprint planning notes',
    description: 'Update the backlog in Asana/Jira with next week tasks.',
    completed: false,
    zoneId: 'z-admin',
    userId,
    createdAt: nowIso(),
  },
];

const defaultUser: User = {
  id: 'guest-user',
  email: 'flowr-focus@deepmind.com',
  name: 'Focus Builder',
  createdAt: nowIso(),
};

function revertWithToast(
  setToast: (message: string, kind?: ToastNotice['kind']) => string,
  message: string,
  error: unknown,
) {
  const detail = error instanceof Error ? error.message : 'Unknown error';
  setToast(`${message}: ${detail}`, 'error');
}

export const useFlowrStore = create<FlowrState>()(
  persist(
    (set, get) => ({
      currentUser: defaultUser,
      token: 'guest-token',
      setAuth: (user, token) => {
        set({ currentUser: user, token });
        setApiToken(token);
      },
      logout: () => {
        set({ currentUser: null, token: null, activeZoneId: null, isGuardianActive: false });
        setApiToken('guest-token');
      },

      zones: defaultZones('guest-user'),
      setZones: (zones) => set({ zones }),
      addZone: (name, description, color, icon) => {
        const userId = get().currentUser?.id || 'guest-user';
        const zone: ContextZone = {
          id: nextId('z'),
          name,
          description,
          color,
          icon,
          createdAt: nowIso(),
          userId,
        };
        const snapshot = get().zones;
        set((state) => ({ zones: [...state.zones, zone] }));

        void api.createZone(zone).catch((error) => {
          set({ zones: snapshot });
          revertWithToast(get().pushToast, 'Failed to save zone', error);
        });

        return zone;
      },
      updateZone: (id, name, description, color, icon) => {
        const snapshot = get().zones;
        const nextZones = snapshot.map((zone) => (
          zone.id === id ? { ...zone, name, description, color, icon } : zone
        ));
        set({ zones: nextZones });

        const updated = nextZones.find((zone) => zone.id === id);
        if (!updated) return;

        void api.updateZone(id, updated).catch((error) => {
          set({ zones: snapshot });
          revertWithToast(get().pushToast, 'Failed to update zone', error);
        });
      },
      deleteZone: (id) => {
        const snapshot = {
          zones: get().zones,
          tasks: get().tasks,
          activeZoneId: get().activeZoneId,
          isGuardianActive: get().isGuardianActive,
        };

        set((state) => ({
          zones: state.zones.filter((zone) => zone.id !== id),
          tasks: state.tasks.filter((task) => task.zoneId !== id),
          activeZoneId: state.activeZoneId === id ? null : state.activeZoneId,
          isGuardianActive: state.activeZoneId === id ? false : state.isGuardianActive,
        }));

        void api.deleteZone(id).catch((error) => {
          set(snapshot);
          revertWithToast(get().pushToast, 'Failed to delete zone', error);
        });
      },

      tasks: defaultTasks('guest-user'),
      setTasks: (tasks) => set({ tasks }),
      addTask: (title, description, zoneId) => {
        const userId = get().currentUser?.id || 'guest-user';
        const task: Task = {
          id: nextId('t'),
          title,
          description,
          completed: false,
          zoneId,
          userId,
          createdAt: nowIso(),
        };
        const snapshot = get().tasks;
        set((state) => ({ tasks: [...state.tasks, task] }));

        void api.createTask(task).catch((error) => {
          set({ tasks: snapshot });
          revertWithToast(get().pushToast, 'Failed to save task', error);
        });

        return task;
      },
      completeTask: (id) => {
        const snapshot = get().tasks;
        const nextTasks = snapshot.map((task) => (
          task.id === id
            ? {
                ...task,
                completed: !task.completed,
                completedAt: !task.completed ? nowIso() : null,
              }
            : task
        ));
        set({ tasks: nextTasks });

        void api.toggleTask(id).catch((error) => {
          set({ tasks: snapshot });
          revertWithToast(get().pushToast, 'Failed to update task', error);
        });
      },
      toggleTask: (id) => get().completeTask(id),
      toggleComplete: (id) => get().completeTask(id),
      deleteTask: (id) => {
        const snapshot = get().tasks;
        set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) }));

        void api.deleteTask(id).catch((error) => {
          set({ tasks: snapshot });
          revertWithToast(get().pushToast, 'Failed to delete task', error);
        });
      },
      moveTask: (taskId, targetZoneId) => {
        const snapshot = get().tasks;
        const nextTasks = snapshot.map((task) => (
          task.id === taskId ? { ...task, zoneId: targetZoneId } : task
        ));
        set({ tasks: nextTasks });

        void api.moveTask(taskId, targetZoneId).catch((error) => {
          set({ tasks: snapshot });
          revertWithToast(get().pushToast, 'Failed to move task', error);
        });
      },
      reorderTasks: (zoneId, startIndex, endIndex) => {
        const zoneTasks = get().tasks.filter((task) => task.zoneId === zoneId);
        const otherTasks = get().tasks.filter((task) => task.zoneId !== zoneId);

        const reordered = Array.from(zoneTasks);
        const [removed] = reordered.splice(startIndex, 1);
        if (!removed) return;
        reordered.splice(endIndex, 0, removed);

        set({ tasks: [...otherTasks, ...reordered] });
      },

      activeZoneId: null,
      isGuardianActive: false,
      focusStartTime: null,
      timerMode: 'count-up',
      pomodoroDurationMinutes: 25,
      pomodoroSecondsLeft: 25 * 60,
      isTimerRunning: false,
      startFocus: (zoneId, mode = 'count-up', durationMinutes = 25) => {
        const previousZoneId = get().activeZoneId;
        if (previousZoneId && previousZoneId !== zoneId) {
          get().recordSwitch(previousZoneId, zoneId);
        }

        set({
          activeZoneId: zoneId,
          isGuardianActive: true,
          focusStartTime: nowIso(),
          timerMode: mode,
          pomodoroDurationMinutes: durationMinutes,
          pomodoroSecondsLeft: durationMinutes * 60,
          isTimerRunning: true,
          isBufferActive: false,
        });
      },
      endFocus: (bypassedBuffer = false) => {
        const activeZoneId = get().activeZoneId;
        if (!activeZoneId) return;

        set({
          isGuardianActive: false,
          isTimerRunning: false,
          activeZoneId: null,
          focusStartTime: null,
        });

        if (!bypassedBuffer) {
          get().startBuffer(activeZoneId, null);
        }
      },
      tickTimer: () => {
        if (!get().isTimerRunning) return;

        if (get().timerMode === 'pomodoro') {
          const timeLeft = get().pomodoroSecondsLeft;
          if (timeLeft <= 1) {
            set({ pomodoroSecondsLeft: 0, isTimerRunning: false });
            get().pushToast('Pomodoro complete! Time to recharge.', 'success');
            get().endFocus(false);
          } else {
            set({ pomodoroSecondsLeft: timeLeft - 1 });
          }
        }
      },
      toggleTimerRunning: () => set((state) => ({ isTimerRunning: !state.isTimerRunning })),

      isBufferActive: false,
      bufferSecondsLeft: 300,
      bufferFromZoneId: null,
      bufferToZoneId: null,
      bufferBypassed: false,
      startBuffer: (fromZoneId, toZoneId) => {
        set({
          isBufferActive: true,
          bufferSecondsLeft: 300,
          bufferFromZoneId: fromZoneId,
          bufferToZoneId: toZoneId,
          bufferBypassed: false,
        });
      },
      tickBuffer: () => {
        if (!get().isBufferActive) return;
        const timeLeft = get().bufferSecondsLeft;
        if (timeLeft <= 1) {
          set({
            bufferSecondsLeft: 0,
            isBufferActive: false,
            bufferFromZoneId: null,
            bufferToZoneId: null,
          });
        } else {
          set({ bufferSecondsLeft: timeLeft - 1 });
        }
      },
      skipBuffer: () => {
        set({
          isBufferActive: false,
          bufferBypassed: true,
          bufferFromZoneId: null,
          bufferToZoneId: null,
        });

        const activeSwitches = get().switches;
        if (activeSwitches.length > 0) {
          const lastSwitch = activeSwitches[activeSwitches.length - 1];
          const updatedSwitches = activeSwitches.map((switchEvent) => (
            switchEvent.id === lastSwitch.id
              ? { ...switchEvent, estimatedTimeLostSeconds: switchEvent.estimatedTimeLostSeconds + 360 }
              : switchEvent
          ));
          set({ switches: updatedSwitches });
        }
      },
      resetBuffer: () => set({ isBufferActive: false, bufferSecondsLeft: 300 }),

      switches: [],
      badges: [],
      addSwitch: (fromZoneId, toZoneId) => {
        const userId = get().currentUser?.id || 'guest-user';
        const switchEvent: SwitchEvent = {
          id: nextId('sw'),
          userId,
          fromZoneId,
          toZoneId,
          timestamp: nowIso(),
          estimatedTimeLostSeconds: 900,
        };
        const snapshot = get().switches;
        const badgeSnapshot = get().badges;
        set((state) => ({ switches: [...state.switches, switchEvent] }));

        void api.addSwitch(switchEvent).catch((error) => {
          set({ switches: snapshot, badges: badgeSnapshot });
          revertWithToast(get().pushToast, 'Failed to record switch', error);
        });

        const totalSwitches = snapshot.length + 1;
        if (totalSwitches === 1) {
          get().unlockBadge(
            'first-switch',
            'Whiplash Witness',
            'Tracked your first cognitive context switch. Awareness is step one.',
            '👁️',
          );
        } else if (totalSwitches === 5) {
          get().unlockBadge(
            'five-switches',
            'Context Juggler',
            'Logged 5 context switches today. Cognitive friction is rising!',
            '🤹',
          );
        }

        return switchEvent;
      },
      recordSwitch: (fromZoneId, toZoneId) => get().addSwitch(fromZoneId, toZoneId),
      earnBadge: (badgeType, name, description, icon) => {
        const existing = get().badges.find((badge) => badge.badgeType === badgeType);
        if (existing) return existing;

        const badge: UserBadge = {
          id: nextId('bdg'),
          badgeType,
          name,
          description,
          icon,
          unlockedAt: nowIso(),
        };
        const snapshot = get().badges;
        set((state) => ({ badges: [...state.badges, badge] }));

        void api.earnBadge(badge).catch((error) => {
          set({ badges: snapshot });
          revertWithToast(get().pushToast, 'Failed to unlock badge', error);
        });

        return badge;
      },
      unlockBadge: (badgeType, name, description, icon) => get().earnBadge(badgeType, name, description, icon),

      toasts: [],
      pushToast: (message, kind = 'error') => {
        const id = nextId('toast');
        const toast: ToastNotice = {
          id,
          kind,
          message,
          createdAt: nowIso(),
        };
        set((state) => ({ toasts: [...state.toasts, toast] }));

        if (typeof window !== 'undefined') {
          window.setTimeout(() => {
            set((state) => ({ toasts: state.toasts.filter((entry) => entry.id !== id) }));
          }, 4000);
        }

        return id;
      },
      dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),

      hasHydratedFromBackend: false,
      hydrateFromBackend: (payload) => {
        setApiToken(payload.token);
        set({
          currentUser: payload.user,
          token: payload.token,
          zones: payload.zones,
          tasks: payload.tasks,
          switches: payload.switches,
          badges: payload.badges,
          hasHydratedFromBackend: true,
        });
        void get().fetchAnalytics();
      },

      analytics: null,
      analyticsLoading: false,
      fetchAnalytics: async () => {
        set({ analyticsLoading: true });
        try {
          const summary = await api.getAnalyticsSummary();
          set({ analytics: summary, analyticsLoading: false });
        } catch {
          set({ analyticsLoading: false });
        }
      },
    }),
    {
      name: 'flowr-app-state',
      skipHydration: true,
      partialize: (state) => ({
        currentUser: state.currentUser,
        token: state.token,
        zones: state.zones,
        tasks: state.tasks,
        switches: state.switches,
        badges: state.badges,
      }),
    },
  ),
);
