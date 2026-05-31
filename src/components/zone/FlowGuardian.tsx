import React, { useEffect, useState } from 'react';
import { useFlowrStore } from '../../store';
import { Play, Pause, X, AlertTriangle, Shield, CheckCircle, Clock } from 'lucide-react';

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
      if (isTimerRunning) {
        if (timerMode === 'count-up') {
          setCountUpSeconds((prev) => prev + 1);
        } else {
          tickTimer();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isGuardianActive, isTimerRunning, timerMode, tickTimer]);

  // Handle count-up calculation from focusStartTime
  useEffect(() => {
    if (isGuardianActive && focusStartTime) {
      const elapsed = Math.floor((Date.now() - new Date(focusStartTime).getTime()) / 1000);
      setCountUpSeconds(elapsed >= 0 ? elapsed : 0);
    }
  }, [isGuardianActive, focusStartTime]);

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
    <div className="fixed inset-0 z-50 bg-dark-950 flex flex-col font-sans select-none animate-fade-in text-slate-100">
      
      {/* Subtle Background Glow corresponding to color themes */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-20">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full filter blur-[120px] transition-colors duration-500 ${
          activeZone.color === 'emerald'
            ? 'bg-emerald-500/20'
            : activeZone.color === 'blue'
            ? 'bg-blue-500/20'
            : 'bg-purple-500/20'
        }`} />
      </div>

      {/* Top Banner Status */}
      <div className="relative border-b border-slate-900/60 bg-dark-950/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-2 w-2 rounded-full ${
            isTimerRunning ? 'bg-brand-500 animate-pulse' : 'bg-slate-600'
          }`} />
          <div className="flex items-center gap-1.5 text-xs text-brand-400 font-bold uppercase tracking-wider">
            <Shield size={13} />
            <span>Flow Guardian Active</span>
          </div>
        </div>

        {/* Timer Mode Toggle tabs */}
        <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => handleModeSwitch('count-up')}
            className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${
              timerMode === 'count-up'
                ? 'bg-slate-800 text-brand-400 border border-slate-700/50'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Count-up
          </button>
          <button
            onClick={() => handleModeSwitch('pomodoro')}
            className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${
              timerMode === 'pomodoro'
                ? 'bg-slate-800 text-brand-400 border border-slate-700/50'
                : 'text-slate-500 hover:text-slate-300'
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
          <div className="relative flex items-center justify-center w-72 h-72 md:w-80 md:h-80 rounded-full bg-slate-950/40 border border-slate-900/60 shadow-2xl animate-guardian-pulse">
            
            {/* Inner Circular Breathing Indicator */}
            <div className={`absolute inset-6 rounded-full border border-dashed border-slate-800/40 ${
              isTimerRunning ? 'animate-breath' : ''
            }`} />

            <div className="relative flex flex-col items-center">
              {/* Active Zone Card Accent */}
              <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border mb-3 ${
                activeZone.color === 'emerald'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : activeZone.color === 'blue'
                  ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                  : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
              }`}>
                {activeZone.name.split(' ')[0]} {activeZone.name.split(' ').slice(1).join(' ')}
              </span>

              {/* Large Ticking Clock */}
              <h2 className="text-5xl md:text-6xl font-extrabold font-mono tracking-tight text-slate-100">
                {timerMode === 'count-up' ? formatTime(countUpSeconds) : formatTime(pomodoroSecondsLeft)}
              </h2>

              <p className="text-[11px] text-slate-500 mt-2 font-medium tracking-wide">
                {isTimerRunning ? 'PULSING STEADY STATE' : 'PAUSED'}
              </p>

              {/* Pause/Play Controls */}
              <button
                onClick={toggleTimerRunning}
                className="mt-6 p-3.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 transition-all hover:scale-105 active:scale-95 shadow-md"
              >
                {isTimerRunning ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
              </button>
            </div>
          </div>

          <div className="mt-8 max-w-sm">
            <h3 className="text-base font-bold text-slate-200">Guardianship Shield Enabled</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              All other zones, notification triggers, and lateral boards are completely hidden. Protect your focus.
            </p>
          </div>
        </div>

        {/* Right Column: Protected Focus Task List */}
        <div className="lg:col-span-6 flex flex-col h-full max-h-[500px] bg-slate-950/60 border border-slate-900/60 rounded-2xl p-6 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-4 mb-4">
            <CheckCircle size={16} className="text-brand-500" />
            <h3 className="text-sm font-bold text-slate-200">Batched Focus Objectives</h3>
            <span className="ml-auto bg-slate-900/80 border border-slate-800 text-[10px] px-2 py-0.5 rounded text-slate-400">
              {zoneTasks.length} left
            </span>
          </div>

          {/* Focused Tasks Scrollable Area */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
            {zoneTasks.length > 0 ? (
              zoneTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="flex items-start gap-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 rounded-xl p-3.5 cursor-pointer transition-colors duration-150 text-slate-300 hover:text-slate-100 select-none"
                >
                  <div className="mt-0.5 flex-shrink-0 text-slate-500">
                    <Clock size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold leading-relaxed truncate">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-1 leading-normal">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center py-12">
                <CheckCircle size={32} className="text-brand-500 animate-pulse mb-3" />
                <h4 className="text-xs font-bold text-slate-300">All Focus Objectives Cleared!</h4>
                <p className="text-[10px] text-slate-500 mt-1 max-w-[220px]">
                  You have successfully completed every batched objective in this zone. Take a well-earned buffer break!
                </p>
              </div>
            )}

            {/* Completed Tasks Sub-list in Focus Mode */}
            {completedZoneTasks.length > 0 && (
              <div className="mt-4 border-t border-slate-900/60 pt-4 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                  Completed in this session
                </span>
                {completedZoneTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 bg-slate-900/20 border border-slate-900/40 rounded-xl p-3 opacity-50"
                  >
                    <CheckCircle size={14} className="text-brand-500" />
                    <span className="text-xs line-through text-slate-500 truncate">
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exit Button - Bottom Right Escape Hatch */}
      <div className="relative p-6 border-t border-slate-900/60 bg-dark-950 flex items-center justify-end">
        <button
          onClick={() => setShowExitWarning(true)}
          className="flex items-center gap-1.5 bg-whiplash-500/10 border border-whiplash-500/20 text-whiplash-500 hover:bg-whiplash-500/20 text-xs font-extrabold px-5 py-2.5 rounded-xl transition-all duration-300 transform active:scale-95 shadow-md"
        >
          <X size={14} />
          <span>Exit Focus Zone</span>
        </button>
      </div>

      {/* Whiplash Warning Modal Overlay */}
      {showExitWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md">
          <div className="bg-slate-950 border border-whiplash-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-slide-up">
            <div className="flex items-center gap-3 text-whiplash-500 mb-3">
              <AlertTriangle size={24} />
              <h3 className="text-base font-extrabold">Whiplash Penalty Warning</h3>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Exiting your active focus zone now triggers a **cognitive context switch**. 
            </p>
            
            <div className="bg-whiplash-500/10 border border-whiplash-500/20 p-3 rounded-xl my-4 text-center">
              <p className="text-xs font-bold text-whiplash-500">
                Cognitive Whiplash cost: ~15 minutes lost
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Your brain takes an average of 15 minutes to fully refocus after switching.
              </p>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              We recommend completing your current focus block or logging out fully rather than switching zones immediately.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6 text-xs font-bold">
              <button
                onClick={() => setShowExitWarning(false)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              >
                Protect Focus (Stay)
              </button>
              <button
                onClick={handleConfirmExit}
                className="px-4 py-2 rounded-xl bg-whiplash-500 hover:bg-whiplash-600 text-slate-100 transition-colors flex items-center gap-1"
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
