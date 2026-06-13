import { useEffect, useState, createElement } from 'react';
import { useFlowrStore } from '../../store';
import { Wind, SkipForward, Warning, BatteryCharging, PersonSimpleWalk, Drop, Smiley, Eye, Tree } from '@phosphor-icons/react';

const microPrompts: { icon: import('react').ElementType; text: string }[] = [
  { icon: PersonSimpleWalk, text: 'Stand up, stretch, and walk around for a moment.' },
  { icon: Drop,             text: 'Drink a refreshing glass of water to hydrate.' },
  { icon: Smiley,           text: 'Relax your shoulders and gently stretch your neck.' },
  { icon: Eye,              text: 'Close your eyes and let your visual cortex rest.' },
  { icon: Tree,             text: 'Look out a window at something far away.' },
  { icon: Wind,             text: 'Take three deep, slow belly breaths.' },
];

export const TransitionBuffer: React.FC = () => {
  const isBufferActive = useFlowrStore((state) => state.isBufferActive);
  const bufferSecondsLeft = useFlowrStore((state) => state.bufferSecondsLeft);
  const tickBuffer = useFlowrStore((state) => state.tickBuffer);
  const skipBuffer = useFlowrStore((state) => state.skipBuffer);

  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [showSkipWarning, setShowSkipWarning] = useState(false);

  // Buffer Ticker Interval
  useEffect(() => {
    if (!isBufferActive) return;

    const interval = setInterval(() => {
      tickBuffer();
    }, 1000);

    return () => clearInterval(interval);
  }, [isBufferActive, tickBuffer]);

  // Rotate micro-prompts every 15 seconds
  useEffect(() => {
    if (!isBufferActive) return;

    const rotation = setInterval(() => {
      setActivePromptIndex((prev) => (prev + 1) % microPrompts.length);
    }, 15000);

    return () => clearInterval(rotation);
  }, [isBufferActive]);

  if (!isBufferActive) return null;

  // Calculate circular progress dash offset
  // Total buffer duration is 300 seconds (5 mins)
  const totalSeconds = 300;
  const progressPercent = (bufferSecondsLeft / totalSeconds) * 100;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const formatBufferTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${String(remainingSecs).padStart(2, '0')}`;
  };

  const handleConfirmSkip = () => {
    setShowSkipWarning(false);
    skipBuffer(); // Skips buffer and logs switch penalty
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center select-none animate-fade-in text-foreground p-6 text-center">

      {/* restorative content panel */}
      <div className="relative max-w-lg w-full flex flex-col items-center">
        
        {/* restorative Banner */}
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

        {/* Circular Countdown Progress Ring */}
        <div className="relative w-56 h-56 flex items-center justify-center mb-10">
          
          {/* Gentle expansion breathing circle inside */}
          <div className="absolute w-40 h-40 rounded-full bg-buffer-500/5 border border-buffer-500/10 animate-breath" />

          {/* SVG Progress Ring */}
          <svg className="absolute w-full h-full -rotate-90">
            <circle
              cx="112"
              cy="112"
              r={radius}
              className="stroke-border fill-none"
              strokeWidth="6"
            />
            <circle
              cx="112"
              cy="112"
              r={radius}
              className="stroke-buffer-500 fill-none transition-all duration-1000 ease-linear"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          {/* Digital Timer */}
          <div className="relative flex flex-col items-center">
            <span className="text-7xl font-display tabular-nums text-foreground mb-6">
              {formatBufferTime(bufferSecondsLeft)}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1.5 flex items-center gap-1">
              <BatteryCharging size={11} />
              <span>Recharging</span>
            </span>
          </div>
        </div>

        {/* Rotating Restoration Micro-Prompt */}
        <div className="h-16 flex items-center justify-center max-w-md w-full px-4 mb-10">
          <div className="flex items-center gap-3 transition-all duration-500 ease-in-out">
            {createElement(microPrompts[activePromptIndex].icon, { size: 20, className: 'text-buffer-500/80 flex-shrink-0' })}
            <p className="text-sm font-semibold text-buffer-500/90 leading-relaxed text-center">
              {microPrompts[activePromptIndex].text}
            </p>
          </div>
        </div>

        {/* Escape Button */}
        <button
          onClick={() => setShowSkipWarning(true)}
          className="flex items-center gap-1.5 bg-muted/80 border border-border hover:border-foreground text-muted-foreground hover:text-foreground text-xs font-bold px-5 py-2.5 rounded-xl transition-all duration-200"
        >
          <SkipForward size={13} />
          <span>Bypass Buffer Break</span>
        </button>
      </div>

      {/* Skip Warning Modal Overlay */}
      {showSkipWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md">
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
              Bypassing adds a **6-minute whiplash cost penalty** to your daily stats as cognitive overload rises.
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
                className="px-4 py-2 rounded-xl bg-buffer-500 hover:bg-buffer-600 text-dark-950 transition-colors"
              >
                Skip Buffer Break
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
