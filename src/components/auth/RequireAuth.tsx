import { useFlowrStore } from '../../store';
import { Navigate } from 'react-router-dom';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useFlowrStore((s) => s.currentUser);
  const hasHydrated = useFlowrStore((s) => s.hasHydratedFromBackend);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-primary">
            <svg className="h-7 w-7 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">FLOWR</p>
            <h1 className="m-0 text-xl font-black tracking-tight">Loading workspace...</h1>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
