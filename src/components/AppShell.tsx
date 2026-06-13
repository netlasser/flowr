import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldWarning, Compass, TrendUp, Cpu, Trophy, SignOut } from '@phosphor-icons/react';
import { useFlowrStore } from '../store';
import { ZoneBoard } from './zone/ZoneBoard';
import { FlowGuardian } from './zone/FlowGuardian';
import { TransitionBuffer } from './zone/TransitionBuffer';
import { WhiplashAnalytics } from './dashboard/WhiplashAnalytics';
import { api, setApiToken } from '../services/api';

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname.startsWith('/app/analytics') ? 'analytics' : 'board';

  const isGuardianActive = useFlowrStore((state) => state.isGuardianActive);
  const isBufferActive = useFlowrStore((state) => state.isBufferActive);
  const switches = useFlowrStore((state) => state.switches);
  const toasts = useFlowrStore((state) => state.toasts);
  const logout = useFlowrStore((state) => state.logout);
  const hydrateFromBackend = useFlowrStore((state) => state.hydrateFromBackend);
  const hasHydratedFromBackend = useFlowrStore((state) => state.hasHydratedFromBackend);
  const pushToast = useFlowrStore((state) => state.pushToast);

  const totalSwitches = switches.length;
  const timeLostMinutes = totalSwitches * 15;
  const isWarning = totalSwitches >= 3;

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        const guest = await api.guestSession();
        if (cancelled) return;

        setApiToken(guest.token);
        const [zones, tasks, switchesToday, badges] = await Promise.all([
          api.getZones(),
          api.getTasks(),
          api.getSwitchesToday(),
          api.getBadgesUser(),
        ]);

        if (cancelled) return;
        hydrateFromBackend({
          user: guest.user,
          token: guest.token,
          zones,
          tasks,
          switches: switchesToday,
          badges,
        });
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : 'Failed to initialize FLOWR';
          pushToast(message, 'error');

          const state = useFlowrStore.getState();
          hydrateFromBackend({
            user: state.currentUser ?? {
              id: 'guest-user',
              email: 'flowr-focus@deepmind.com',
              name: 'Focus Builder',
              createdAt: new Date().toISOString(),
            },
            token: state.token ?? 'guest-token',
            zones: state.zones,
            tasks: state.tasks,
            switches: state.switches,
            badges: state.badges,
          });
        }
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [hydrateFromBackend, pushToast]);

  if (!hasHydratedFromBackend) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark-950 text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-2xl border border-brand-500/20 bg-brand-500/10 p-4 text-brand-500">
            <Cpu size={28} />
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">FLOWR</p>
            <h1 className="m-0 text-xl font-black tracking-tight">Loading backend session</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-body text-foreground">
      <div className="noise-overlay" aria-hidden="true" />

      {isGuardianActive && <FlowGuardian />}
      {isBufferActive && <TransitionBuffer />}

      <header className="sticky top-0 z-[40] flex items-center justify-between border-b border-border bg-background/90 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-border bg-muted/70 p-2 text-foreground shadow-[0_0_15px_-3px_rgba(255,255,255,0.08)]">
            <Cpu size={20} />
          </div>
          <div>
            <h2 className="font-display m-0 flex items-center gap-1.5 text-3xl font-normal tracking-tight text-foreground leading-none">
              <span>FLOWR</span>
            </h2>
            <p className="mt-1 text-[10px] font-medium tracking-wide text-muted-foreground">
              Cognitive context shield
            </p>
          </div>
        </div>

        <nav aria-label="Main navigation" className="flex items-center rounded-xl border border-border bg-muted/40 p-1">
            <Link
              id="tab-board"
              to="/app"
              className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                activeTab === 'board'
                  ? 'text-foreground border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Compass size={14} />
              <span>My Board</span>
            </Link>

            <Link
              id="tab-analytics"
              to="/app/analytics"
              className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                activeTab === 'analytics'
                  ? 'text-foreground border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
            <TrendUp size={14} />
            <span>Whiplash Analytics</span>

            {isWarning && (
              <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5" aria-label="Warning: high switch count">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-whiplash-500 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-whiplash-500" />
              </span>
            )}
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <div
            className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 transition-colors duration-300 ${
              isWarning
                ? 'border-whiplash-500/20 bg-whiplash-500/10 text-whiplash-500'
                : 'border-border bg-muted/40 text-muted-foreground'
            }`}
          >
            <ShieldWarning size={14} className={isWarning ? 'text-whiplash-500' : ''} />
            <span className="text-[11px] font-semibold tabular-nums">
              {isWarning ? `${timeLostMinutes}m lost to context switches` : 'Cognitive shield active'}
            </span>
          </div>

          <button
            onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
            title="End session"
          >
            <SignOut size={13} />
            <span>Exit</span>
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col p-6">
        {activeTab === 'board' ? <ZoneBoard /> : <WhiplashAnalytics />}
      </main>

      <footer className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 border-t border-border bg-background/60 px-6 py-4 md:flex-row">
        <p className="text-[10px] text-muted-foreground">FLOWR © 2026 — Context-first productivity.</p>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Trophy size={12} className="text-foreground/50" />
          <span>Knowledge workers lose focus for up to 15 min after every context switch.</span>
        </div>
      </footer>

      <div className="fixed right-4 top-4 z-[70] flex w-[min(92vw,360px)] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-md ${
              toast.kind === 'error'
                ? 'border-rose-500/20 bg-rose-950/80 text-rose-100'
                : toast.kind === 'success'
                  ? 'border-emerald-500/20 bg-emerald-950/80 text-emerald-100'
                  : 'border-border bg-background/80 text-foreground'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="m-0 text-xs leading-relaxed">{toast.message}</p>
              <button
                type="button"
                onClick={() => useFlowrStore.getState().dismissToast(toast.id)}
                className="text-[10px] uppercase tracking-wider text-white/60 transition-colors hover:text-white"
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
