import React, { useEffect, useState } from 'react';
import { useFlowrStore } from '../../store';
import { Play, Pause, SignOut, Warning, Shield, CheckCircle, Clock } from '@phosphor-icons/react';

export const FlowGuardian: React.FC = () => {
  const activeZoneId = useFlowrStore((state) => state.activeZoneId);
  const isGuardianActive = useFlowrStore((state) => state.isGuardianActive);
  const zones = useFlowrStore((state) => state.zones);
  const tasks = useFlowrStore((state) => state.tasks);
  const toggleTask = useFlowrStore((state) => state.toggleTask);
  const endFocus = useFlowrStore((state) => state.endFocus);
  
  // Timer Store States
  const timerMode = useFlowrStore((state) => state.timerMode);
  const pomodoroSecondsLeft = useFlowrStore((state) => state.pomodoroSecondsLeft);
  const isTimerRunning = useFlowrStore((state) => state.isTimerRunning);
  const tickTimer = useFlowrStore((state) => state.tickTimer);
  const toggleTimerRunning = useFlowrStore((state) => state.toggleTimerRunning);
  const startFocus = useFlowrStore((state) => state.startFocus);
  const focusStartTime = useFlowrStore((state) => state.focusStartTime);

  const [showExitWarning, setShowExitWarning] = useState(false);
  const [countUpSeconds, setCountUpSeconds] = useState(0);

  const activeZone = zones.find((z) => z.id === activeZoneId);
  const zoneTasks = tasks.filter((t) => t.zoneId === activeZoneId && !t.completed);
  const completedZoneTasks = tasks.filter((t) => t.zoneId === activeZoneId && t.completed);

  // Sync Timer Intervals
  useEffect(() => {
    if (!isGuardianActive) return;

    const interval = setInterval(() => {
      if (isTimerRunning && timerMode === 'pomodoro') {
        tickTimer();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isGuardianActive, isTimerRunning, timerMode, tickTimer]);

  useEffect(() => {
    if (!isGuardianActive || timerMode !== 'count-up' || !focusStartTime) {
      return;
    }

    const updateCountUpSeconds = () => {
      const elapsed = Math.floor((Date.now() - new Date(focusStartTime).getTime()) / 1000);
      setCountUpSeconds(Math.max(0, elapsed));
    };

    updateCountUpSeconds();
    const interval = setInterval(updateCountUpSeconds, 1000);
    return () => clearInterval(interval);
  }, [isGuardianActive, timerMode, focusStartTime]);

  if (!isGuardianActive || !activeZone) return null;

  // Format Helper
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

  // Toggle between Pomodoro and Count-Up modes
  const handleModeSwitch = (mode: 'count-up' | 'pomodoro') => {
    startFocus(activeZone.id, mode);
  };

  const handleConfirmExit = () => {
    setShowExitWarning(false);
    endFocus(false); // Exits focus and triggers 5-min Transition Buffer break screen!
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col font-sans select-none animate-fade-in text-foreground">
      
      {/* Top Banner Status */}
      <div className="relative border-b border-border bg-background/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-2 w-2 rounded-full ${
            isTimerRunning ? 'bg-primary animate-pulse' : 'bg-muted-foreground/50'
          }`} />
          <div className="flex items-center gap-1.5 text-xs text-primary font-bold uppercase tracking-wider">
            <Shield size={13} />
            <span>Flow Guardian Active</span>
          </div>
        </div>

        {/* Timer Mode Toggle tabs */}
        <div className="flex bg-muted/90 p-0.5 rounded-lg border border-border">
          <button
            onClick={() => handleModeSwitch('count-up')}
            className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${
              timerMode === 'count-up'
                ? 'bg-muted/80 text-primary border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Count-up
          </button>
          <button
            onClick={() => handleModeSwitch('pomodoro')}
            className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${
              timerMode === 'pomodoro'
                ? 'bg-muted/80 text-primary border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Pomodoro (25m)
          </button>
        </div>
      </div>

      {/* Immersive Focus Grid */}
      <div className="relative flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 max-w-7xl mx-auto w-full items-center overflow-y-auto">
        
        {/* Left Column: Visual Timer System */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center text-center">
          <div className="bg-muted/40 backdrop-blur-sm border border-border rounded-2xl p-8 text-center">
            <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border mb-6 inline-block ${
              activeZone.color === 'emerald'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : activeZone.color === 'blue'
                ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
            }`}>
              {activeZone.name.split(' ')[0]} {activeZone.name.split(' ').slice(1).join(' ')}
            </span>

            {/* Large Ticking Clock */}
            <h2 className="text-7xl font-display tabular-nums text-foreground">
              {timerMode === 'count-up' ? formatTime(countUpSeconds) : formatTime(pomodoroSecondsLeft)}
            </h2>

            <p className="text-[11px] text-muted-foreground mt-2 font-medium tracking-wide">
              {isTimerRunning ? 'PULSING STEADY STATE' : 'PAUSED'}
            </p>

            {/* Pause/Play Controls */}
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
              All other zones, notification triggers, and lateral boards are completely hidden. Protect your focus.
            </p>
          </div>
        </div>

        {/* Right Column: Protected Focus Task List */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Active objectives panel */}
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
                      <h4 className="text-xs font-semibold leading-relaxed truncate">
                        {task.title}
                      </h4>
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
                    You have successfully completed every batched objective in this zone. Take a well-earned buffer break!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Completed panel */}
          {completedZoneTasks.length > 0 && (
            <div className="bg-muted/30 backdrop-blur-sm border border-border rounded-2xl p-5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-3 block">
                Completed in this session
              </span>
              <div className="flex flex-col gap-2">
                {completedZoneTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 bg-muted/20 border border-border rounded-xl p-3 opacity-50"
                  >
                    <CheckCircle size={14} className="text-primary" />
                    <span className="text-xs line-through text-muted-foreground truncate">
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Exit Button - Bottom Right Escape Hatch */}
      <button
        onClick={() => setShowExitWarning(true)}
        className="border border-border bg-muted/70 text-foreground rounded-full px-6 py-3 text-sm fixed bottom-6 right-6 flex items-center gap-2 hover:bg-muted hover:text-primary hover:scale-105 active:scale-95 transition-all"
      >
        <SignOut className="w-4 h-4" />
        <span>Exit Focus Zone</span>
      </button>

      {/* Whiplash Warning Modal Overlay */}
      {showExitWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-muted/80 border border-whiplash-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-slide-up">
            <div className="flex items-center gap-3 text-whiplash-500 mb-3">
              <Warning size={24} />
              <h3 className="text-base font-extrabold">Whiplash Penalty Warning</h3>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              Exiting your active focus zone now triggers a **cognitive context switch**. 
            </p>
            
            <div className="bg-whiplash-500/10 border border-whiplash-500/20 p-3 rounded-xl my-4 text-center">
              <p className="text-xs font-bold text-whiplash-500">
                Cognitive Whiplash cost: ~15 minutes lost
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Your brain takes an average of 15 minutes to fully refocus after switching.
              </p>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              We recommend completing your current focus block or logging out fully rather than switching zones immediately.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6 text-xs font-bold">
              <button
                onClick={() => setShowExitWarning(false)}
                className="px-4 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                Protect Focus (Stay)
              </button>
              <button
                onClick={handleConfirmExit}
                className="px-4 py-2 rounded-xl bg-whiplash-500 hover:bg-whiplash-600 text-foreground transition-colors flex items-center gap-1"
              >
                <span>Switch Anyway</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
