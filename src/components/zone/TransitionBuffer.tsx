import { useEffect, useState, createElement } from 'react';
import { useFlowrStore } from '../../store';
import {
  Wind, SkipForward, Warning, BatteryCharging, PersonSimpleWalk,
  Drop, Smiley, Eye, Tree, Coffee, Clock, Plus,
} from '@phosphor-icons/react';
import { Slider } from '../ui/slider';

const microPrompts: { icon: import('react').ElementType; text: string }[] = [
  { icon: PersonSimpleWalk, text: 'Stand up, stretch, and walk around for a moment.' },
  { icon: Drop,             text: 'Drink a refreshing glass of water to hydrate.' },
  { icon: Smiley,           text: 'Relax your shoulders and gently stretch your neck.' },
  { icon: Eye,              text: 'Close your eyes and let your visual cortex rest.' },
  { icon: Tree,             text: 'Look out a window at something far away.' },
  { icon: Wind,             text: 'Take three deep, slow belly breaths.' },
];

export const TransitionBuffer: React.FC = () => {
  const isBufferActive = useFlowrStore((s) => s.isBufferActive);
  const bufferSecondsLeft = useFlowrStore((s) => s.bufferSecondsLeft);
  const lastFocusDurationMinutes = useFlowrStore((s) => s.lastFocusDurationMinutes);
  const tickBuffer = useFlowrStore((s) => s.tickBuffer);
  const extendBuffer = useFlowrStore((s) => s.extendBuffer);
  const skipBuffer = useFlowrStore((s) => s.skipBuffer);
  const bufferIsQuickBreak = useFlowrStore((s) => s.bufferIsQuickBreak);
  const setBufferReadiness = useFlowrStore((s) => s.setBufferReadiness);
  const storeSet = useFlowrStore.setState;

  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [showSkipWarning, setShowSkipWarning] = useState(false);
  const [phase, setPhase] = useState<'selecting' | 'counting' | 'rating'>(
    () => bufferIsQuickBreak ? 'counting' : 'selecting'
  );
  const [selectedBreakMinutes, setSelectedBreakMinutes] = useState(
    Math.min(12, Math.max(3, Math.floor(lastFocusDurationMinutes * 0.15))),
  );
  const [readinessRating, setReadinessRating] = useState(0);
  const [microBreakOffered, setMicroBreakOffered] = useState(false);
  const [initialSeconds, setInitialSeconds] = useState(
    () => bufferIsQuickBreak ? bufferSecondsLeft : selectedBreakMinutes * 60
  );

  /* ─── Timer tick + countdown detection ──────────── */
  useEffect(() => {
    if (!isBufferActive || phase !== 'counting') return;

    const interval = setInterval(() => {
      tickBuffer();
      const st = useFlowrStore.getState();
      if (st.bufferSecondsLeft <= 0) {
        if (st.bufferIsQuickBreak) {
          storeSet({ isBufferActive: false, bufferSecondsLeft: 0, bufferIsQuickBreak: false });
        } else {
          setPhase('rating');
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isBufferActive, phase, tickBuffer, storeSet]);

  /* ─── Rotate micro-prompts ─────────────────────── */
  useEffect(() => {
    if (!isBufferActive || phase !== 'counting') return;

    const rotation = setInterval(() => {
      setActivePromptIndex((prev) => (prev + 1) % microPrompts.length);
    }, 15000);

    return () => clearInterval(rotation);
  }, [isBufferActive, phase]);

  /* ─── Handlers ─────────────────────────────────── */
  const handleStartBreak = () => {
    const secs = selectedBreakMinutes * 60;
    setInitialSeconds(secs);
    storeSet({ bufferSecondsLeft: secs });
    setPhase('counting');
  };

  const handleConfirmSkip = () => {
    setShowSkipWarning(false);
    skipBuffer();
  };

  const handleDismiss = () => {
    if (phase === 'rating' && readinessRating > 0) {
      setBufferReadiness(readinessRating);
    }
    const wasBypassed = useFlowrStore.getState().bufferBypassed;
    if (!wasBypassed && phase === 'rating') {
      const st = useFlowrStore.getState();
      st.unlockBadge(
        'Restoration Champion',
        'Cleanly complete a full 5-minute recovery break without skipping.',
        '🧘',
      );
    }
    storeSet({
      isBufferActive: false,
      bufferSecondsLeft: 0,
      bufferFromZoneId: null,
      bufferToZoneId: null,
      bufferIsQuickBreak: false,
      bufferBypassed: false,
    });
  };

  const handleMicroBreak = () => {
    const currentRemaining = useFlowrStore.getState().bufferSecondsLeft;
    extendBuffer(120);
    setInitialSeconds(currentRemaining + 120);
    setMicroBreakOffered(true);
    setPhase('counting');
  };

  if (!isBufferActive) return null;

  const progressPercent =
    phase === 'counting' && initialSeconds > 0
      ? (bufferSecondsLeft / initialSeconds) * 100
      : 100;

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${String(remaining).padStart(2, '0')}`;
  };

  const displaySeconds = phase === 'selecting' ? selectedBreakMinutes * 60 : bufferSecondsLeft;

  /* ─── Phase 1: Selecting ───────────────────────── */
  if (phase === 'selecting') {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center select-none animate-fade-in text-foreground p-6 text-center">
        <div className="relative max-w-lg w-full flex flex-col items-center">
          <div className="flex items-center gap-2 text-buffer-500 text-xs font-bold uppercase tracking-widest mb-6">
            <Coffee size={14} />
            <span>Transition Buffer</span>
            <Wind size={14} className="animate-spin" style={{ animationDuration: '8s' }} />
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight leading-tight mb-2">
            Set Your Break Length
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
            Longer break = better reset. Shorter break = faster return.
          </p>

          <div className="relative w-56 h-56 flex items-center justify-center mb-8">
            <svg className="absolute w-full h-full -rotate-90">
              <circle cx="112" cy="112" r={radius} className="stroke-border fill-none" strokeWidth="6" />
              <circle
                cx="112" cy="112" r={radius}
                className="stroke-buffer-500 fill-none" strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={0}
                strokeLinecap="round"
              />
            </svg>
            <div className="relative flex flex-col items-center">
              <span className="text-7xl font-display tabular-nums text-foreground">
                {formatTime(selectedBreakMinutes * 60)}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1.5 flex items-center gap-1">
                <Clock size={11} />
                <span>Break duration</span>
              </span>
            </div>
          </div>

          <div className="w-full max-w-xs mb-8">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>3 min</span>
              <span className="font-semibold text-foreground">{selectedBreakMinutes} min</span>
              <span>12 min</span>
            </div>
            <Slider
              min={3}
              max={12}
              step={1}
              value={[selectedBreakMinutes]}
              onValueChange={([v]) => setSelectedBreakMinutes(v)}
              className="w-full"
            />
          </div>

          <button
            onClick={handleStartBreak}
            className="bg-primary text-primary-foreground rounded-full px-10 py-3 text-sm font-bold hover:bg-primary/90 hover:scale-105 transition-all shadow-lg active:scale-[0.98]"
          >
            Start Break
          </button>

          <button
            onClick={handleDismiss}
            className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            Skip break
          </button>
        </div>
      </div>
    );
  }

  /* ─── Phase 2: Counting ────────────────────────── */
  if (phase === 'counting') {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center select-none animate-fade-in text-foreground p-6 text-center">
        <div className="relative max-w-lg w-full flex flex-col items-center">
          <div className="flex items-center gap-2 text-buffer-500 text-xs font-bold uppercase tracking-widest mb-6">
            <Coffee size={14} />
            <span>Transition Buffer Active</span>
            <Wind size={14} className="animate-spin" style={{ animationDuration: '8s' }} />
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight leading-tight mb-2">
            Decompress Your Focus
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm mb-10 leading-relaxed">
            Allow your working memory to offload the previous context before starting a new zone.
          </p>

          <div className="relative w-56 h-56 flex items-center justify-center mb-10">
            <div className="absolute w-40 h-40 rounded-full bg-buffer-500/5 border border-buffer-500/10 animate-breath" />
            <svg className="absolute w-full h-full -rotate-90">
              <circle cx="112" cy="112" r={radius} className="stroke-border fill-none" strokeWidth="6" />
              <circle
                cx="112" cy="112" r={radius}
                className="stroke-buffer-500 fill-none transition-all duration-1000 ease-linear"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="relative flex flex-col items-center">
              <span className="text-7xl font-display tabular-nums text-foreground mb-6">
                {formatTime(displaySeconds)}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1.5 flex items-center gap-1">
                <BatteryCharging size={11} />
                <span>Recharging</span>
              </span>
            </div>
          </div>

          <div className="h-16 flex items-center justify-center max-w-md w-full px-4 mb-10">
            <div className="flex items-center gap-3 transition-all duration-500 ease-in-out">
              {createElement(microPrompts[activePromptIndex].icon, { size: 20, className: 'text-buffer-500/80 flex-shrink-0' })}
              <p className="text-sm font-semibold text-buffer-500/90 leading-relaxed text-center">
                {microPrompts[activePromptIndex].text}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSkipWarning(true)}
            className="flex items-center gap-1.5 bg-muted/80 border border-border hover:border-foreground text-muted-foreground hover:text-foreground text-xs font-bold px-5 py-2.5 rounded-xl transition-all duration-200"
          >
            <SkipForward size={13} />
            <span>Bypass Buffer Break</span>
          </button>
        </div>

        {showSkipWarning && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <div className="bg-muted/80 border border-buffer-500/30 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-slide-up text-left">
              <div className="flex items-center gap-3 text-buffer-500 mb-3">
                <Warning size={24} />
                <h3 className="text-base font-extrabold">Bypass Switch Penalty</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to skip your recovery break?
              </p>
              <div className="bg-buffer-500/10 border border-buffer-500/20 p-3.5 rounded-xl my-4 text-center">
                <p className="text-xs font-bold text-buffer-500">
                  Skipping breaks increases whiplash by ~40%
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Your brain lacks the buffer needed to cleanly flush active working memory buffers.
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Bypassing increases cognitive friction — your working memory flushes less effectively without a proper reset.
              </p>
              <div className="flex items-center justify-end gap-3 mt-6 text-xs font-bold">
                <button
                  onClick={() => setShowSkipWarning(false)}
                  className="px-4 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors"
                >
                  Continue Rest (No)
                </button>
                <button
                  onClick={handleConfirmSkip}
                  className="px-4 py-2 rounded-xl bg-buffer-500 hover:bg-buffer-600 text-primary-foreground transition-colors"
                >
                  Skip Buffer Break
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ─── Phase 3: Rating ──────────────────────────── */
  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center select-none animate-fade-in text-foreground p-6 text-center">
      <div className="relative max-w-lg w-full flex flex-col items-center">
        <div className="flex items-center gap-2 text-buffer-500 text-xs font-bold uppercase tracking-widest mb-6">
          <Coffee size={14} />
          <span>Break Complete</span>
          <Wind size={14} className="animate-spin" style={{ animationDuration: '8s' }} />
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight leading-tight mb-2">
          How's Your Readiness?
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm mb-8 leading-relaxed">
          Rate how ready you feel to return to focused work.
        </p>

        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => setReadinessRating(rating)}
              className={`w-12 h-12 rounded-xl text-lg font-bold transition-all duration-150 ${
                readinessRating === rating
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-110'
                  : 'bg-muted/40 border border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
              }`}
            >
              {rating}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mb-8">
          {readinessRating === 0 ? 'Select a rating to continue' : ''}
          {readinessRating <= 2 ? 'You might need more reset time.' : ''}
          {readinessRating === 3 ? 'Feeling balanced.' : ''}
          {readinessRating >= 4 ? 'Ready to dive back in!' : ''}
        </p>

        {readinessRating <= 2 && readinessRating > 0 && !microBreakOffered && (
          <div className="flex flex-col items-center gap-4 mb-4">
            <p className="text-xs text-muted-foreground">Want a quick reset?</p>
            <button
              onClick={handleMicroBreak}
              className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-full px-6 py-2.5 text-sm font-bold hover:bg-amber-500/20 transition-all"
            >
              <Plus size={16} />
              Add 2 min micro-break
            </button>
            <button
              onClick={() => setMicroBreakOffered(true)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              No thanks, I'm ready
            </button>
          </div>
        )}

        {(readinessRating > 2 || (readinessRating <= 2 && microBreakOffered)) && (
          <button
            onClick={handleDismiss}
            className="bg-primary text-primary-foreground rounded-full px-10 py-3 text-sm font-bold hover:bg-primary/90 hover:scale-105 transition-all shadow-lg active:scale-[0.98]"
          >
            {readinessRating > 2 ? 'Return to Board' : 'Done'}
          </button>
        )}

        {readinessRating === 0 && (
          <button
            onClick={handleDismiss}
            className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            Skip rating
          </button>
        )}
      </div>
    </div>
  );
};
