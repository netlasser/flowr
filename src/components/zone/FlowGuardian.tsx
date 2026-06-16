import React, { useEffect, useState, useMemo } from 'react';
import { useFlowrStore } from '../../store';
import { api } from '../../services/api';
import {
  Play, Pause, SignOut, Shield, CheckCircle, Clock,
  Star, Timer, Hourglass,
} from '@phosphor-icons/react';

/* ─── Helpers ─────────────────────────────────────── */
const formatTime = (secs: number) => {
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const seconds = secs % 60;
  return [
    hours > 0 ? String(hours).padStart(2, '0') : null,
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ]
    .filter(Boolean)
    .join(':');
};

function elapsedSecs(focusStartTime: string | null): number {
  if (!focusStartTime) return 0;
  return Math.floor((Date.now() - new Date(focusStartTime).getTime()) / 1000);
}

function computeCompletionRate(
  timerMode: 'count-up' | 'pomodoro',
  pomodoroSecondsLeft: number,
  pomodoroDurationMinutes: number,
): number {
  if (timerMode === 'count-up') return 1;
  if (pomodoroDurationMinutes <= 0) return 1;
  const total = pomodoroDurationMinutes * 60;
  const elapsed = total - pomodoroSecondsLeft;
  return Math.min(1, Math.max(0, elapsed / total));
}

/* ─── Component ───────────────────────────────────── */
export const FlowGuardian: React.FC = () => {
  /* ─── Store ─── */
  const activeZoneId       = useFlowrStore((s) => s.activeZoneId);
  const isGuardianActive   = useFlowrStore((s) => s.isGuardianActive);
  const zones              = useFlowrStore((s) => s.zones);
  const tasks              = useFlowrStore((s) => s.tasks);
  const toggleTask         = useFlowrStore((s) => s.toggleTask);
  const focusPhase         = useFlowrStore((s) => s.focusPhase);
  const switchesAvoided    = useFlowrStore((s) => s.switchesAvoided);
  const focusDurationMinutes = useFlowrStore((s) => s.focusDurationMinutes);
  const timerMode          = useFlowrStore((s) => s.timerMode);
  const pomodoroSecondsLeft= useFlowrStore((s) => s.pomodoroSecondsLeft);
  const isTimerRunning     = useFlowrStore((s) => s.isTimerRunning);
  const tickTimer          = useFlowrStore((s) => s.tickTimer);
  const toggleTimerRunning = useFlowrStore((s) => s.toggleTimerRunning);
  const focusStartTime     = useFlowrStore((s) => s.focusStartTime);
  const confirmFocus       = useFlowrStore((s) => s.confirmFocus);
  const incrementSwitchesAvoided = useFlowrStore((s) => s.incrementSwitchesAvoided);
  const extendFocus        = useFlowrStore((s) => s.extendFocus);
  const dismissCelebration = useFlowrStore((s) => s.dismissCelebration);
  const recommendedPreset  = useFlowrStore((s) => s.recommendedPreset);
  const avgFocusDuration   = useFlowrStore((s) => s.avgFocusDuration);
  const fetchAvgFocusDuration = useFlowrStore((s) => s.fetchAvgFocusDuration);
  const adjustPreset       = useFlowrStore((s) => s.adjustPreset);
  const pomodoroDurationMinutes = useFlowrStore((s) => s.pomodoroDurationMinutes);

  /* ─── Local state ─── */
  const [showExitModal, setShowExitModal] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [countUpSeconds, setCountUpSeconds] = useState(0);
  const [readinessRating, setReadinessRating] = useState(0);

  const activeZone = zones.find((z) => z.id === activeZoneId);
  const zoneTasks = tasks.filter((t) => t.zoneId === activeZoneId && !t.completed);
  const completedZoneTasks = tasks.filter((t) => t.zoneId === activeZoneId && t.completed);

  /* ─── Duration options derived from recommendedPreset ─── */
  const durationOptions = useMemo(() => {
    const presets = [0, 15, 25, 45, 60];
    if (recommendedPreset > 0 && !presets.includes(recommendedPreset)) {
      presets.push(recommendedPreset);
      presets.sort((a, b) => a - b);
    }
    return presets.map((value) => ({
      value,
      label: value === 0 ? 'Open-ended' : `${value} min`,
      isRecommended: value > 0 && value === recommendedPreset,
    }));
  }, [recommendedPreset]);

  /* ─── Fetch avg focus duration on mount ─── */
  useEffect(() => {
    if (focusPhase === 'intention') {
      fetchAvgFocusDuration();
    }
  }, [focusPhase, fetchAvgFocusDuration]);

  /* ─── Pre-select recommendedPreset when intention phase opens ─── */
  useEffect(() => {
    if (focusPhase === 'intention' && selectedDuration === null) {
      setSelectedDuration(recommendedPreset);
    }
  }, [focusPhase, recommendedPreset, selectedDuration]);

  /* ─── Timer tick ─── */
  useEffect(() => {
    if (focusPhase !== 'active') return;
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      if (timerMode === 'pomodoro') {
        tickTimer();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [focusPhase, isTimerRunning, timerMode, tickTimer]);

  /* ─── Count-up tick ─── */
  useEffect(() => {
    if (focusPhase !== 'active' || timerMode !== 'count-up' || !focusStartTime) return;

    const update = () => setCountUpSeconds(elapsedSecs(focusStartTime));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [focusPhase, timerMode, focusStartTime]);

  /* ─── No render when inactive ─── */
  if (!isGuardianActive || !activeZone) return null;

  /* ─────────────────────────────────────────────────────────
     PHASE 1: INTENTION SETTING
     ───────────────────────────────────────────────────────── */
  if (focusPhase === 'intention') {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center select-none animate-fade-in text-foreground p-6">
        <div className="max-w-md w-full flex flex-col items-center text-center gap-8">
          {/* Zone badge */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-muted/60 border border-border flex items-center justify-center text-2xl">
              {/* Inline zone icon via stored icon name — resolves to phosphor */}
              <Timer size={28} className="text-primary" />
            </div>
            <h2 className="font-display text-2xl text-foreground">{activeZone.name}</h2>
            {activeZone.description && (
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                {activeZone.description}
              </p>
            )}
           </div>

          {/* Adaptive recommendation */}
          {avgFocusDuration > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5 text-xs text-muted-foreground">
              Your average focus session: <span className="text-foreground font-semibold">{Math.round(avgFocusDuration / 60)} min</span>
            </div>
          )}

          {/* Duration picker */}
          <div className="w-full">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">
              Set your focus intention
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {durationOptions.map((opt) => {
                const isSelected = selectedDuration === opt.value;
                return (
                  <button
                    key={opt.label}
                    onClick={() => setSelectedDuration(opt.value)}
                    className={`rounded-xl border px-4 py-4 text-sm font-semibold transition-all duration-150 text-left relative ${
                      isSelected
                        ? 'bg-primary/10 border-primary text-foreground shadow-lg'
                        : 'bg-muted/40 border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                    }`}
                  >
                    <span className="block text-base">{opt.label}</span>
                    <span className="block text-[10px] font-normal mt-1 text-muted-foreground">
                      {opt.value === 0
                        ? 'No time limit — you decide when to stop'
                        : `Pomodoro-style countdown`}
                    </span>
                    {opt.isRecommended && (
                      <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md">
                        Recommended
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start button */}
          <button
            disabled={selectedDuration === null}
            onClick={() => {
              if (selectedDuration === null) return;
              const mode = selectedDuration === 0 ? 'count-up' : 'pomodoro';
              confirmFocus(mode, selectedDuration);
            }}
            className="bg-primary text-primary-foreground rounded-full px-10 py-3 text-sm font-bold hover:bg-primary/90 hover:scale-105 transition-all shadow-lg active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Begin Focus Session
          </button>

          {/* Cancel */}
          <button
            onClick={() => {
              setSelectedDuration(null);
              useFlowrStore.setState({
                focusPhase: null,
                isGuardianActive: false,
                activeZoneId: null,
              });
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            Cancel — return to board
          </button>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────
     PHASE 2: ACTIVE FOCUS
     ───────────────────────────────────────────────────────── */
  if (focusPhase === 'active') {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col font-sans select-none animate-fade-in text-foreground">
        {/* ── Top Banner ── */}
        <div className="relative border-b border-border bg-background/80 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex h-2 w-2 rounded-full ${
              isTimerRunning ? 'bg-primary animate-pulse' : 'bg-muted-foreground/50'
            }`} />
            <div className="flex items-center gap-1.5 text-xs text-primary font-bold uppercase tracking-wider">
              <Shield size={13} />
              <span>Flow Guardian Active</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium border-l border-border pl-4 ml-2">
              <Hourglass size={12} />
              <span>Switches avoided: <span className="text-foreground tabular-nums">{switchesAvoided}</span></span>
            </div>
          </div>

          {/* Session info */}
          {focusDurationMinutes > 0 && (
            <span className="text-[10px] text-muted-foreground bg-muted/70 border border-border px-2.5 py-1 rounded-full">
              {focusDurationMinutes} min session
            </span>
          )}
          {focusDurationMinutes === 0 && (
            <span className="text-[10px] text-muted-foreground bg-muted/70 border border-border px-2.5 py-1 rounded-full">
              Open-ended
            </span>
          )}
        </div>

        {/* ── Immersive Grid ── */}
        <div className="relative flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 max-w-7xl mx-auto w-full items-center overflow-y-auto">
          {/* Left: Timer */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center text-center">
            <div className="bg-muted/40 backdrop-blur-sm border border-border rounded-2xl p-8 text-center">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border mb-6 inline-block text-muted-foreground border-border">
                {activeZone.name}
              </span>

              <h2 className="text-7xl font-display tabular-nums text-foreground">
                {timerMode === 'count-up'
                  ? formatTime(countUpSeconds)
                  : formatTime(pomodoroSecondsLeft)}
              </h2>

              <p className="text-[11px] text-muted-foreground mt-2 font-medium tracking-wide">
                {isTimerRunning ? 'FOCUS ACTIVE' : 'PAUSED'}
              </p>

              <button
                onClick={toggleTimerRunning}
                className="mt-6 p-3.5 rounded-full bg-muted/80 border border-border hover:border-foreground text-foreground transition-all hover:scale-105 active:scale-95 shadow-md"
              >
                {isTimerRunning ? <Pause size={18} weight="fill" /> : <Play size={18} weight="fill" />}
              </button>
            </div>

            <div className="mt-8 max-w-sm">
              <h3 className="text-base font-display font-bold text-foreground">Guardianship Shield Enabled</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                All other zones and navigation are hidden. Protect your focus.
              </p>
            </div>
          </div>

          {/* Right: Task list */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="bg-muted/40 backdrop-blur-sm border border-border rounded-xl p-4 mt-6 space-y-2">
              <div className="flex items-center gap-2 border-b border-border pb-4 mb-4">
                <CheckCircle size={16} className="text-primary" />
                <h3 className="text-sm font-display font-bold text-foreground">Batched Focus Objectives</h3>
                <span className="ml-auto bg-muted/60 border border-border text-[10px] px-2 py-0.5 rounded text-muted-foreground tabular-nums">
                  {zoneTasks.length} left
                </span>
              </div>

              <div className="overflow-y-auto flex flex-col gap-3 pr-1 max-h-[280px]">
                {zoneTasks.length > 0 ? (
                  zoneTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className="flex items-start gap-3 bg-muted/40 hover:bg-muted/80 border border-border rounded-xl p-3.5 cursor-pointer transition-all duration-150 text-muted-foreground hover:text-foreground select-none hover:scale-[1.01]"
                    >
                      <div className="mt-0.5 flex-shrink-0 text-muted-foreground">
                        <Clock size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold leading-relaxed truncate">{task.title}</h4>
                        {task.description && (
                          <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1 leading-normal">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle size={32} className="text-primary animate-pulse mb-3" />
                    <h4 className="text-xs font-bold text-muted-foreground">All Focus Objectives Cleared!</h4>
                    <p className="text-[10px] text-muted-foreground mt-1 max-w-[220px]">
                      Every task in this zone is done. Great focus!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {completedZoneTasks.length > 0 && (
              <div className="bg-muted/30 backdrop-blur-sm border border-border rounded-2xl p-5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-3 block">
                  Completed in this session
                </span>
                <div className="flex flex-col gap-2">
                  {completedZoneTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-2 bg-muted/20 border border-border rounded-xl p-3 opacity-50">
                      <CheckCircle size={14} className="text-primary" />
                      <span className="text-xs line-through text-muted-foreground truncate">{task.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Exit button ── */}
        <button
          onClick={() => setShowExitModal(true)}
          className="border border-border bg-muted/70 text-foreground rounded-full px-6 py-3 text-sm fixed bottom-6 right-6 flex items-center gap-2 hover:bg-muted hover:text-primary hover:scale-105 active:scale-95 transition-all"
        >
          <SignOut className="w-4 h-4" />
          <span>Exit Focus Zone</span>
        </button>

        {/* ── 3-Option Exit Modal ── */}
        {showExitModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <div className="bg-muted/90 border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl animate-slide-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                  <Hourglass size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-foreground">Leaving your focus zone?</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Exiting now costs ~15 minutes of refocus time.
                  </p>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 mb-5 text-center">
                <p className="text-xs font-bold text-amber-500">
                  Stay 5 more minutes to complete a full cycle?
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Every interruption fragments your cognitive momentum.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setShowExitModal(false);
                    incrementSwitchesAvoided();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors active:scale-[0.99]"
                >
                  Stay in focus
                </button>

                <button
                  onClick={() => {
                    setShowExitModal(false);
                    incrementSwitchesAvoided();
                    if (timerMode === 'pomodoro') {
                      extendFocus(5);
                    }
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-border text-foreground text-xs font-bold hover:bg-muted/80 transition-colors active:scale-[0.99]"
                >
                  Add 5 more minutes
                </button>

                <button
                  onClick={() => {
                    setShowExitModal(false);
                    useFlowrStore.setState({ focusPhase: 'celebration', isTimerRunning: false });
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-muted-foreground text-xs font-medium hover:text-foreground transition-colors active:scale-[0.99]"
                >
                  Leave anyway
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────
     PHASE 3: CELEBRATION
     ───────────────────────────────────────────────────────── */
  if (focusPhase === 'celebration') {
    const totalSeconds = elapsedSecs(focusStartTime);
    const totalMinutes = Math.round(totalSeconds / 60);
    const completionRate = computeCompletionRate(timerMode, pomodoroSecondsLeft, pomodoroDurationMinutes);

    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center select-none animate-fade-in text-foreground p-6">
        <div className="max-w-md w-full flex flex-col items-center text-center gap-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center animate-breath">
            <Star size={36} className="text-primary" weight="fill" />
          </div>

          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
            Focus Block Complete!
          </h1>

          <div className="bg-muted/40 border border-border rounded-2xl p-6 w-full space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">You protected your focus for</p>
              <p className="text-4xl font-display font-bold text-foreground tabular-nums mt-1">
                {totalMinutes} min
              </p>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">Switches avoided</p>
              <p className="text-3xl font-display font-bold text-foreground tabular-nums mt-1">
                {switchesAvoided}
              </p>
            </div>

            {switchesAvoided <= 1 && (
              <p className="text-[11px] text-muted-foreground leading-relaxed border-t border-border pt-4">
                Every uninterrupted focus block builds momentum. Keep going!
              </p>
            )}
            {switchesAvoided > 1 && (
              <p className="text-[11px] text-muted-foreground leading-relaxed border-t border-border pt-4">
                You resisted {switchesAvoided} interruptions — that's{' '}
                {switchesAvoided * 15} minutes of refocus time saved.
              </p>
            )}
          </div>

          {/* Readiness rating */}
          <div className="w-full">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
              How was your focus readiness?
            </h3>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setReadinessRating(rating)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all duration-150 ${
                    readinessRating === rating
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-110'
                      : 'bg-muted/40 border border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              {readinessRating === 0 ? 'Tap a rating to help FLOWR adapt' : ''}
              {readinessRating <= 2 ? 'Struggled to focus — noted' : ''}
              {readinessRating === 3 ? 'Solid session' : ''}
              {readinessRating >= 4 ? 'Great flow state!' : ''}
            </p>
          </div>

          <button
            onClick={() => {
              if (readinessRating > 0) {
                adjustPreset(completionRate, readinessRating);
              }
              dismissCelebration();
            }}
            className="bg-primary text-primary-foreground rounded-full px-10 py-3 text-sm font-bold hover:bg-primary/90 hover:scale-105 transition-all shadow-lg active:scale-[0.98]"
          >
            Done — Take a Break
          </button>
        </div>
      </div>
    );
  }

  return null;
};
