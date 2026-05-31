import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, ContextZone, Task, SwitchEvent, UserBadge } from '../types';

interface FlowrState {
  // Auth State
  currentUser: User | null;
  token: string | null;
  setAuth: (user: User | null, token: string | null) => void;
  logout: () => void;

  // Zones State
  zones: ContextZone[];
  setZones: (zones: ContextZone[]) => void;
  addZone: (name: string, description: string, color: string) => ContextZone;
  updateZone: (id: string, name: string, description: string, color: string) => void;
  deleteZone: (id: string) => void;

  // Tasks State
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (title: string, description: string | undefined, zoneId: string) => Task;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, targetZoneId: string) => void;
  reorderTasks: (zoneId: string, startIndex: number, endIndex: number) => void;

  // Flow Guardian Focus State
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

  // Transition Buffer State
  isBufferActive: boolean;
  bufferSecondsLeft: number;
  bufferFromZoneId: string | null;
  bufferToZoneId: string | null;
  bufferBypassed: boolean;
  
  startBuffer: (fromZoneId: string, toZoneId: string | null) => void;
  tickBuffer: () => void;
  skipBuffer: () => void;
  resetBuffer: () => void;

  // Whiplash Analytics State
  switches: SwitchEvent[];
  badges: UserBadge[];
  recordSwitch: (fromZoneId: string | null, toZoneId: string) => void;
  unlockBadge: (badgeType: string, name: string, description: string, icon: string) => void;
}

// Initial mockup data to populate Flowr instantly and beautifully
const defaultZones = (userId: string): ContextZone[] => [
  {
    id: 'z-deep-code',
    name: '💻 Deep Code',
    description: 'Coding, refactoring, building architecture. Focus block.',
    color: 'emerald',
    createdAt: new Date().toISOString(),
    userId,
  },
  {
    id: 'z-comms',
    name: '💬 Comms & Sync',
    description: 'Slack, emails, pull request reviews, team chats.',
    color: 'blue',
    createdAt: new Date().toISOString(),
    userId,
  },
  {
    id: 'z-admin',
    name: '⚙️ Admin & Planning',
    description: 'Jira tickets, scheduling, timesheets, documentation.',
    color: 'purple',
    createdAt: new Date().toISOString(),
    userId,
  }
];

const defaultTasks = (userId: string): Task[] => [
  {
    id: 't1',
    title: 'Implement Flow Guardian Fullscreen Interface',
    description: 'Build a distraction-free immersive layout for active zones.',
    completed: false,
    zoneId: 'z-deep-code',
    userId,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't2',
    title: 'Establish SQLite database schema',
    description: 'Design robust SQLite database tables for users, tasks, and switches.',
    completed: false,
    zoneId: 'z-deep-code',
    userId,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't3',
    title: 'Write core custom transition animations',
    description: 'Add circular breath animations and sliding effects.',
    completed: true,
    zoneId: 'z-deep-code',
    userId,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
  {
    id: 't4',
    title: 'Review PR for frontend analytics charts',
    description: 'Check team submissions for whiplash streak stats.',
    completed: false,
    zoneId: 'z-comms',
    userId,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't5',
    title: 'Respond to Design Review email thread',
    description: 'Provide feedback on typography and layout decisions.',
    completed: false,
    zoneId: 'z-comms',
    userId,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't6',
    title: 'Log sprint planning notes',
    description: 'Update the backlog in Asana/Jira with next week tasks.',
    completed: false,
    zoneId: 'z-admin',
    userId,
    createdAt: new Date().toISOString(),
  }
];

const defaultUser: User = {
  id: 'guest-user',
  email: 'flowr-focus@deepmind.com',
  name: 'Focus Builder',
  createdAt: new Date().toISOString(),
};

export const useFlowrStore = create<FlowrState>()(
  persist(
    (set, get) => ({
      // Auth State Initializer
      currentUser: defaultUser,
      token: 'guest-token',
      setAuth: (user, token) => set({ currentUser: user, token }),
      logout: () => set({ currentUser: null, token: null, activeZoneId: null, isGuardianActive: false }),

      // Zones
      zones: defaultZones('guest-user'),
      setZones: (zones) => set({ zones }),
      addZone: (name, description, color) => {
        const userId = get().currentUser?.id || 'guest-user';
        const newZone: ContextZone = {
          id: `z-${Date.now()}`,
          name,
          description,
          color,
          createdAt: new Date().toISOString(),
          userId,
        };
        set((state) => ({ zones: [...state.zones, newZone] }));
        return newZone;
      },
      updateZone: (id, name, description, color) => set((state) => ({
        zones: state.zones.map((z) => z.id === id ? { ...z, name, description, color } : z)
      })),
      deleteZone: (id) => set((state) => ({
        zones: state.zones.filter((z) => z.id !== id),
        tasks: state.tasks.filter((t) => t.zoneId !== id),
        activeZoneId: state.activeZoneId === id ? null : state.activeZoneId,
        isGuardianActive: state.activeZoneId === id ? false : state.isGuardianActive
      })),

      // Tasks
      tasks: defaultTasks('guest-user'),
      setTasks: (tasks) => set({ tasks }),
      addTask: (title, description, zoneId) => {
        const userId = get().currentUser?.id || 'guest-user';
        const newTask: Task = {
          id: `t-${Date.now()}`,
          title,
          description,
          completed: false,
          zoneId,
          userId,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
        
        // Smart Batching v1 simple: Check if this new task matches keywords of another zone
        // This is handled at dashboard or quick add, we return task here.
        return newTask;
      },
      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id
            ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null }
            : t
        )
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      })),
      moveTask: (taskId, targetZoneId) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task) return;
        const oldZoneId = task.zoneId;
        if (oldZoneId === targetZoneId) return;

        // Save switch or re-link
        set((state) => ({
          tasks: state.tasks.map((t) => t.id === taskId ? { ...t, zoneId: targetZoneId } : t)
        }));
      },
      reorderTasks: (zoneId, startIndex, endIndex) => {
        const zoneTasks = get().tasks.filter((t) => t.zoneId === zoneId);
        const otherTasks = get().tasks.filter((t) => t.zoneId !== zoneId);
        
        const reordered = Array.from(zoneTasks);
        const [removed] = reordered.splice(startIndex, 1);
        reordered.splice(endIndex, 0, removed);
        
        set({ tasks: [...otherTasks, ...reordered] });
      },

      // Flow Guardian Focus State
      activeZoneId: null,
      isGuardianActive: false,
      focusStartTime: null,
      timerMode: 'count-up',
      pomodoroDurationMinutes: 25,
      pomodoroSecondsLeft: 25 * 60,
      isTimerRunning: false,

      startFocus: (zoneId, mode = 'count-up', durationMinutes = 25) => {
        const oldZoneId = get().activeZoneId;

        // Record a switch if switching from another zone
        if (oldZoneId && oldZoneId !== zoneId) {
          get().recordSwitch(oldZoneId, zoneId);
        }

        set({
          activeZoneId: zoneId,
          isGuardianActive: true,
          focusStartTime: new Date().toISOString(),
          timerMode: mode,
          pomodoroDurationMinutes: durationMinutes,
          pomodoroSecondsLeft: durationMinutes * 60,
          isTimerRunning: true,
          // Cancel any buffer
          isBufferActive: false,
        });

        // Trigger request for Fullscreen API on window if in browser
        try {
          if (typeof document.documentElement.requestFullscreen === 'function') {
            // Let the component trigger it since requestFullscreen requires user interaction event
          }
        } catch (e) {}
      },

      endFocus: (bypassedBuffer = false) => {
        const activeZoneId = get().activeZoneId;
        if (!activeZoneId) return;

        // Exit focus guardian
        set({
          isGuardianActive: false,
          isTimerRunning: false,
          activeZoneId: null,
          focusStartTime: null,
        });

        // Start Transition Buffer unless explicitly bypassed
        if (!bypassedBuffer) {
          get().startBuffer(activeZoneId, null);
        }
      },

      tickTimer: () => {
        if (!get().isTimerRunning) return;
        
        if (get().timerMode === 'pomodoro') {
          const timeLeft = get().pomodoroSecondsLeft;
          if (timeLeft <= 1) {
            // Pomodoro finished! Play alert, complete focus session
            set({ pomodoroSecondsLeft: 0, isTimerRunning: false });
            get().endFocus(false); // start buffer
          } else {
            set({ pomodoroSecondsLeft: timeLeft - 1 });
          }
        }
      },

      toggleTimerRunning: () => set((state) => ({ isTimerRunning: !state.isTimerRunning })),

      // Transition Buffer State
      isBufferActive: false,
      bufferSecondsLeft: 300, // 5 minutes standard
      bufferFromZoneId: null,
      bufferToZoneId: null,
      bufferBypassed: false,

      startBuffer: (fromZoneId, toZoneId) => {
        set({
          isBufferActive: true,
          bufferSecondsLeft: 300, // 300 seconds = 5 minutes
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
        
        // Log a skipped-buffer alert or adjust statistics (e.g. increase whiplash estimation!)
        const activeSwitches = get().switches;
        if (activeSwitches.length > 0) {
          // Increase whiplash penalty for skipping breaks!
          const lastSwitch = activeSwitches[activeSwitches.length - 1];
          const updatedSwitches = activeSwitches.map(s => 
            s.id === lastSwitch.id 
              ? { ...s, estimatedTimeLostSeconds: s.estimatedTimeLostSeconds + 360 } // penalty of 6 mins (360s)
              : s
          );
          set({ switches: updatedSwitches });
        }
      },

      resetBuffer: () => set({ isBufferActive: false, bufferSecondsLeft: 300 }),

      // Whiplash Analytics State
      switches: [],
      badges: [],
      recordSwitch: (fromZoneId, toZoneId) => {
        const userId = get().currentUser?.id || 'guest-user';
        const newSwitch: SwitchEvent = {
          id: `sw-${Date.now()}`,
          userId,
          fromZoneId,
          toZoneId,
          timestamp: new Date().toISOString(),
          estimatedTimeLostSeconds: 900, // standard 15 minute context cost
        };
        
        set((state) => ({ switches: [...state.switches, newSwitch] }));

        // Check and trigger badges if they qualify!
        const totalSwitches = get().switches.length;
        if (totalSwitches === 1) {
          get().unlockBadge(
            'first-switch',
            'Whiplash Witness',
            'Tracked your first cognitive context switch. Awareness is step one.',
            '👁️'
          );
        } else if (totalSwitches === 5) {
          get().unlockBadge(
            'five-switches',
            'Context Juggler',
            'Logged 5 context switches today. Cognitive friction is rising!',
            '🤹'
          );
        }
      },

      unlockBadge: (badgeType, name, description, icon) => {
        const alreadyUnlocked = get().badges.some((b) => b.badgeType === badgeType);
        if (alreadyUnlocked) return;

        const newBadge: UserBadge = {
          id: `bdg-${Date.now()}`,
          badgeType,
          name,
          description,
          icon,
          unlockedAt: new Date().toISOString(),
        };

        set((state) => ({ badges: [...state.badges, newBadge] }));
      }
    }),
    {
      name: 'flowr-app-state', // localStorage key
      partialize: (state) => ({
        currentUser: state.currentUser,
        token: state.token,
        zones: state.zones,
        tasks: state.tasks,
        switches: state.switches,
        badges: state.badges,
      }),
    }
  )
);
