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
  focusPhase: 'intention' | 'active' | 'celebration' | null;
  switchesAvoided: number;
  focusDurationMinutes: number;
  activeSessionId: string | null;
  setFocusIntention: (zoneId: string) => void;
  confirmFocus: (mode: 'count-up' | 'pomodoro', durationMinutes: number) => void;
  incrementSwitchesAvoided: () => void;
  extendFocus: (extraMinutes: number) => void;
  dismissCelebration: () => void;
  startFocus: (zoneId: string, mode?: 'count-up' | 'pomodoro', durationMinutes?: number) => void;
  endFocus: (bypassedBuffer?: boolean) => void;
  tickTimer: () => void;
  toggleTimerRunning: () => void;

  avgFocusDuration: number;
  recommendedPreset: number;
  consecutiveEarlyEnds: number;
  consecutiveFullCompletions: number;
  lastFocusDurationMinutes: number;
  setLastFocusDuration: (minutes: number) => void;
  fetchAvgFocusDuration: () => Promise<void>;
  adjustPreset: (completionRate: number, readiness: number) => void;

  isBufferActive: boolean;
  bufferSecondsLeft: number;
  bufferFromZoneId: string | null;
  bufferToZoneId: string | null;
  bufferBypassed: boolean;
  startBuffer: (fromZoneId: string, toZoneId: string | null, breakMinutes?: number) => void;
  tickBuffer: () => void;
  extendBuffer: (extraSeconds: number) => void;
  skipBuffer: () => void;
  resetBuffer: () => void;
  bufferIsQuickBreak: boolean;

  switches: SwitchEvent[];
  badges: UserBadge[];
  addSwitch: (fromZoneId: string | null, toZoneId: string) => SwitchEvent;
  recordSwitch: (fromZoneId: string | null, toZoneId: string) => SwitchEvent;
  earnBadge: (badgeType: string, name: string, description: string, icon: string) => UserBadge;
  unlockBadge: (badgeType: string, name: string, description: string, icon: string) => UserBadge;

  zoneSwitchHistory: { zoneId: string; timestamp: number }[];
  addZoneSwitch: (zoneId: string) => void;
  clearZoneSwitchHistory: () => void;
  whiplashAlertShown: boolean;
  setWhiplashAlertShown: (shown: boolean) => void;

  toasts: ToastNotice[];
  pushToast: (message: string, kind?: ToastNotice['kind'], action?: { label: string; onClick: () => void }, timeoutMs?: number) => string;
  dismissToast: (id: string) => void;

  zoneSuggestionFeedback: Record<string, { suggestedZoneId: string; userCorrectedZoneId: string | null; count: number }>;
  learnedKeywordMap: Record<string, string>;
  addSuggestionFeedback: (hash: string, suggestedZoneId: string) => void;
  correctSuggestionFeedback: (hash: string, correctedZoneId: string) => void;
  learnFromFeedback: () => void;
  getSuggestionForText: (text: string) => string | null;

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
        const task = snapshot.find((t) => t.id === taskId);
        const fromZoneId = task?.zoneId;
        const nextTasks = snapshot.map((t) =>
          t.id === taskId ? { ...t, zoneId: targetZoneId } : t
        );
        set({ tasks: nextTasks });

        if (fromZoneId && fromZoneId !== targetZoneId) {
          get().addZoneSwitch(targetZoneId);
        }

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
      focusPhase: null,
      switchesAvoided: 0,
      focusDurationMinutes: 0,
      activeSessionId: null,
  avgFocusDuration: 25,
  recommendedPreset: 25,
  consecutiveEarlyEnds: 0,
  consecutiveFullCompletions: 0,
  sessionCompleted: false,
  lastFocusDurationMinutes: 0,
      setFocusIntention: (zoneId) => {
        const previousZoneId = get().activeZoneId;
        if (previousZoneId && previousZoneId !== zoneId) {
          get().recordSwitch(previousZoneId, zoneId);
        }

        set({
          activeZoneId: zoneId,
          isGuardianActive: true,
          focusPhase: 'intention',
          switchesAvoided: 0,
          focusDurationMinutes: 0,
          isBufferActive: false,
        });
      },
      confirmFocus: (mode, durationMinutes) => {
        const zoneId = get().activeZoneId;
        if (!zoneId) return;

        set({
          focusPhase: 'active',
          focusStartTime: nowIso(),
          timerMode: mode,
          pomodoroDurationMinutes: durationMinutes || 25,
          pomodoroSecondsLeft: (durationMinutes || 25) * 60,
          isTimerRunning: true,
          focusDurationMinutes: durationMinutes,
        });

        void api.createSession(zoneId).then((session) => {
          set({ activeSessionId: session.id });
        }).catch(() => {});
      },
      incrementSwitchesAvoided: () => {
        set((state) => ({ switchesAvoided: state.switchesAvoided + 1 }));
      },
      setLastFocusDuration: (minutes) => {
        set({ lastFocusDurationMinutes: minutes });
      },
      extendFocus: (extraMinutes) => {
        set((state) => ({
          pomodoroSecondsLeft: state.pomodoroSecondsLeft + extraMinutes * 60,
        }));
      },
      dismissCelebration: () => {
        const state = get();
        const activeZoneId = state.activeZoneId;
        if (!activeZoneId) return;

        const sessionId = state.activeSessionId;
        let elapsedMinutes = 0;
        if (sessionId) {
          const totalSeconds = Math.floor(
            (Date.now() - new Date(state.focusStartTime || nowIso()).getTime()) / 1000
          );
          elapsedMinutes = Math.floor(totalSeconds / 60);
          const tasksCompletedCount = state.tasks.filter(
            (t) => t.zoneId === activeZoneId && t.completed
          ).length;
          void api.endSession(sessionId, totalSeconds, tasksCompletedCount, state.sessionCompleted).catch(() => {});
        }

        const breakMinutes = Math.min(12, Math.max(3, Math.floor(elapsedMinutes * 0.15)));

        set({
          focusPhase: null,
          isGuardianActive: false,
          isTimerRunning: false,
          activeZoneId: null,
          focusStartTime: null,
          switchesAvoided: 0,
          focusDurationMinutes: 0,
          activeSessionId: null,
          sessionCompleted: false,
          lastFocusDurationMinutes: elapsedMinutes,
        });

        get().startBuffer(activeZoneId, null, breakMinutes);
      },
      fetchAvgFocusDuration: async () => {
        try {
          const data = await api.getAvgFocusDuration();
          const avgMin = Math.min(60, Math.max(10, data.avgDurationMinutes || 25));
          set({ avgFocusDuration: avgMin, recommendedPreset: avgMin });
        } catch {
          // keep defaults
        }
      },
      adjustPreset: (completionRate, readiness) => {
        const current = get().recommendedPreset;
        let newPreset = current;

        if (completionRate < 0.8) {
          set((s) => ({ consecutiveEarlyEnds: s.consecutiveEarlyEnds + 1, consecutiveFullCompletions: 0 }));
          const earlyEnds = get().consecutiveEarlyEnds;
          if (earlyEnds >= 2) {
            newPreset = Math.max(15, current - 5);
            set({ consecutiveEarlyEnds: 0 });
          }
        } else if (readiness > 4) {
          set((s) => ({ consecutiveFullCompletions: s.consecutiveFullCompletions + 1, consecutiveEarlyEnds: 0 }));
          const fullCompletions = get().consecutiveFullCompletions;
          if (fullCompletions >= 2) {
            newPreset = Math.min(60, current + 5);
            set({ consecutiveFullCompletions: 0 });
          }
        } else {
          set({ consecutiveEarlyEnds: 0, consecutiveFullCompletions: 0 });
        }

        set({ recommendedPreset: newPreset });
      },
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

        const focusStartTime = get().focusStartTime;
        const elapsedMinutes = focusStartTime
          ? Math.floor((Date.now() - new Date(focusStartTime).getTime()) / 60000)
          : 0;
        const breakMinutes = Math.min(12, Math.max(3, Math.floor(elapsedMinutes * 0.15)));

        set({
          isGuardianActive: false,
          isTimerRunning: false,
          activeZoneId: null,
          focusStartTime: null,
          sessionCompleted: false,
          lastFocusDurationMinutes: elapsedMinutes,
        });

        if (!bypassedBuffer) {
          get().startBuffer(activeZoneId, null, breakMinutes);
        }
      },
      tickTimer: () => {
        if (!get().isTimerRunning) return;

        if (get().timerMode === 'pomodoro') {
          const timeLeft = get().pomodoroSecondsLeft;
          if (timeLeft <= 1) {
            set({ pomodoroSecondsLeft: 0, isTimerRunning: false, focusPhase: 'celebration', sessionCompleted: true });
            get().pushToast('Focus block complete! Take a moment to celebrate.', 'success');
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
      startBuffer: (fromZoneId, toZoneId, breakMinutes) => {
        set({
          isBufferActive: true,
          bufferSecondsLeft: (breakMinutes ?? 5) * 60,
          bufferFromZoneId: fromZoneId,
          bufferToZoneId: toZoneId,
          bufferBypassed: false,
        });
      },
      tickBuffer: () => {
        if (!get().isBufferActive) return;
        const timeLeft = get().bufferSecondsLeft;
        if (timeLeft >= 1) {
          set({ bufferSecondsLeft: timeLeft - 1 });
        }
      },
      extendBuffer: (extraSeconds) => {
        set((state) => ({ bufferSecondsLeft: state.bufferSecondsLeft + extraSeconds }));
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

      zoneSuggestionFeedback: {},
      learnedKeywordMap: {},
      addSuggestionFeedback: (hash, suggestedZoneId) => {
        set((state) => {
          const existing = state.zoneSuggestionFeedback[hash];
          return {
            zoneSuggestionFeedback: {
              ...state.zoneSuggestionFeedback,
              [hash]: {
                suggestedZoneId,
                userCorrectedZoneId: existing?.userCorrectedZoneId ?? null,
                count: (existing?.count ?? 0) + 1,
              },
            },
          };
        });
      },
      correctSuggestionFeedback: (hash, correctedZoneId) => {
        set((state) => {
          const existing = state.zoneSuggestionFeedback[hash];
          if (!existing) return state;
          return {
            zoneSuggestionFeedback: {
              ...state.zoneSuggestionFeedback,
              [hash]: { ...existing, userCorrectedZoneId: correctedZoneId },
            },
          };
        });
        get().learnFromFeedback();
      },
      learnFromFeedback: () => {
        const feedback = get().zoneSuggestionFeedback;
        const corrections: Record<string, { correctedZoneId: string; count: number }> = {};

        for (const entry of Object.values(feedback)) {
          if (!entry.userCorrectedZoneId) continue;
          const key = entry.suggestedZoneId + '->' + entry.userCorrectedZoneId;
          corrections[key] = corrections[key] || { correctedZoneId: entry.userCorrectedZoneId, count: 0 };
          corrections[key].count += entry.count;
        }

        const newMap: Record<string, string> = { ...get().learnedKeywordMap };
        for (const [key, val] of Object.entries(corrections)) {
          if (val.count >= 3) {
            const fromZone = key.split('->')[0];
            newMap[fromZone] = val.correctedZoneId;
          }
        }
        set({ learnedKeywordMap: newMap });
      },
      getSuggestionForText: (text) => {
        const lower = text.toLowerCase();
        const zones = get().zones;
        const learned = get().learnedKeywordMap;

        // Check learned corrections first (strongest signal)
        for (const [keyword, zoneId] of Object.entries(learned)) {
          if (lower.includes(keyword)) {
            const zone = zones.find((z) => z.id === zoneId || z.name.toLowerCase().includes(zoneId.toLowerCase()));
            if (zone) return zone.id;
          }
        }

        // Fallback to static keyword map
        const DEFAULT_ZONE_KEYWORDS: Record<string, string[]> = {
          'z-comms': ['email', 'slack', 'chat', 'call', 'sync', 'zoom', 'review', 'message', 'dm', 'ping', 'notify', 'meet', 'standup'],
          'z-deep-code': ['code', 'bug', 'feature', 'refactor', 'compile', 'database', 'sql', 'api', 'build', 'deploy', 'fix', 'implement', 'debug', 'test', 'spec', 'lint'],
          'z-admin': ['jira', 'ticket', 'sheet', 'log', 'time', 'plan', 'doc', 'schedule', 'report', 'invoice', 'budget', 'meeting', 'agenda', 'note', 'track'],
        };

        let bestScore = 0;
        let bestZoneId: string | null = null;

        zones.forEach((zone) => {
          const kws = DEFAULT_ZONE_KEYWORDS[zone.id] ?? [];
          let score = 0;
          kws.forEach((kw) => {
            if (lower.includes(kw)) score += 2;
          });
          const nameWords = zone.name.split(/\s+/).concat(zone.description.split(/\s+/));
          nameWords.forEach((w) => {
            const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (clean.length > 2 && lower.includes(clean)) score += 1;
          });
          if (score > bestScore) {
            bestScore = score;
            bestZoneId = zone.id;
          }
        });

        return bestScore > 0 ? bestZoneId : null;
      },

      switches: [],
      badges: [],
      zoneSwitchHistory: [],
      whiplashAlertShown: false,
      bufferIsQuickBreak: false,
      addZoneSwitch: (zoneId) => {
        const entry = { zoneId, timestamp: Date.now() };
        set((state) => ({
          zoneSwitchHistory: [...state.zoneSwitchHistory, entry].slice(-20),
        }));
      },
      clearZoneSwitchHistory: () => set({ zoneSwitchHistory: [] }),
      setWhiplashAlertShown: (shown) => set({ whiplashAlertShown: shown }),
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
      pushToast: (message, kind = 'error', action?, timeoutMs = 4000) => {
        const id = nextId('toast');
        const toast: ToastNotice = {
          id,
          kind,
          message,
          createdAt: nowIso(),
          action,
        };
        set((state) => ({ toasts: [...state.toasts, toast] }));

        if (typeof window !== 'undefined') {
          window.setTimeout(() => {
            set((state) => ({ toasts: state.toasts.filter((entry) => entry.id !== id) }));
          }, timeoutMs);
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
        void get().fetchAvgFocusDuration();
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
        zoneSuggestionFeedback: state.zoneSuggestionFeedback,
        learnedKeywordMap: state.learnedKeywordMap,
        recommendedPreset: state.recommendedPreset,
        avgFocusDuration: state.avgFocusDuration,
        consecutiveEarlyEnds: state.consecutiveEarlyEnds,
        consecutiveFullCompletions: state.consecutiveFullCompletions,
        sessionCompleted: state.sessionCompleted,
        lastFocusDurationMinutes: state.lastFocusDurationMinutes,
      }),
    },
  ),
);
