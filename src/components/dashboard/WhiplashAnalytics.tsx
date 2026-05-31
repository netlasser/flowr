import React from 'react';
import { useFlowrStore } from '../../store';
import { Eye, ShieldAlert, Award, TrendingUp, Flame, ShieldCheck, HeartPulse } from 'lucide-react';

// Possible badges list with descriptions and lock indicators
const ALL_POSSIBLE_BADGES = [
  {
    type: 'first-switch',
    name: 'Whiplash Witness',
    description: 'Tracked your first cognitive context switch. Awareness is step one.',
    icon: '👁️',
    criteria: 'Log your first zone switch'
  },
  {
    type: 'five-switches',
    name: 'Context Juggler',
    description: 'Logged 5 context switches today. Cognitive friction is rising!',
    icon: '🤹',
    criteria: 'Log 5 switches in one day'
  },
  {
    type: 'deep-dive',
    name: 'Guardian General',
    description: 'Protect focus for 60 consecutive minutes in Flow Guardian.',
    icon: '🛡️',
    criteria: 'Active Focus over 60 mins'
  },
  {
    type: 'buffer-master',
    name: 'Restoration Champion',
    description: 'Cleanly complete a full 5-minute recovery break without skipping.',
    icon: '🔋',
    criteria: 'Complete 1 transition buffer'
  }
];

export const WhiplashAnalytics: React.FC = () => {
  const switches = useFlowrStore((state) => state.switches);
  const badges = useFlowrStore((state) => state.badges);
  const tasks = useFlowrStore((state) => state.tasks);

  const totalSwitches = switches.length;
  
  // Calculate total estimated time lost
  const totalSecondsLost = switches.reduce((acc, curr) => acc + curr.estimatedTimeLostSeconds, 0);
  
  const formatSecondsToText = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    
    if (hours === 0 && minutes === 0) return '0 minutes';
    if (hours === 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
  };

  // Mocking focus streak based on completion metrics
  const completedCount = tasks.filter((t) => t.completed).length;
  const mockFocusStreak = completedCount > 0 ? Math.min(completedCount * 12, 180) : 0; // minutes consecutive focus

  // Determine unlocked status
  const isBadgeUnlocked = (type: string) => {
    return badges.some((b) => b.badgeType === type);
  };

  // Simple analytics helper: count switches per hour of the day (mocked/recent distribution)
  const getRecentHourStats = () => {
    // Generate a distribution for display
    return [
      { label: 'Deep Code', count: tasks.filter(t => t.zoneId === 'z-deep-code').length, color: 'bg-emerald-500' },
      { label: 'Comms', count: tasks.filter(t => t.zoneId === 'z-comms').length, color: 'bg-blue-500' },
      { label: 'Admin', count: tasks.filter(t => t.zoneId === 'z-admin').length, color: 'bg-purple-500' },
    ];
  };

  const zoneDistribution = getRecentHourStats();
  const maxCount = Math.max(...zoneDistribution.map(z => z.count), 1);

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
      {/* Header Info */}
      <div className="border-b border-slate-900 pb-5">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <TrendingUp size={13} className="text-brand-500" />
          <span>Whiplash Statistics</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-100 tracking-tight m-0">
          Cognitive Loss Dashboard
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Switching focus costs ~15 minutes of recovery time. Track your cognitive friction, protective streaks, and unlock focus badges.
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric Card 1: Context Switches */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 flex items-start gap-4 hover:border-slate-700/80 transition-colors">
          <div className="bg-whiplash-500/10 p-3 rounded-xl border border-whiplash-500/20 text-whiplash-500">
            <ShieldAlert size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Context Switches Today</span>
            <h3 className="text-3xl font-black text-slate-100 mt-1.5">{totalSwitches}</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Target: <span className="text-brand-400 font-bold">&lt; 3 switches</span> per day.
            </p>
          </div>
        </div>

        {/* Metric Card 2: Estimated Time Lost */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 flex items-start gap-4 hover:border-slate-700/80 transition-colors">
          <div className="bg-buffer-500/10 p-3 rounded-xl border border-buffer-500/20 text-buffer-500">
            <Eye size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Estimated Time Lost</span>
            <h3 className="text-3xl font-black text-slate-100 mt-1.5">{formatSecondsToText(totalSecondsLost)}</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Lost in "refocus latency tax".
            </p>
          </div>
        </div>

        {/* Metric Card 3: Longest Streak */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 flex items-start gap-4 hover:border-slate-700/80 transition-colors">
          <div className="bg-brand-500/10 p-3 rounded-xl border border-brand-500/20 text-brand-500">
            <Flame size={20} className={mockFocusStreak > 0 ? 'animate-pulse' : ''} />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Focus Streak Duration</span>
            <h3 className="text-3xl font-black text-slate-100 mt-1.5">{mockFocusStreak} mins</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Consecutive minutes in deep focus.
            </p>
          </div>
        </div>
      </div>

      {/* Main Analytics Content: Switch Distribution & Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Context Density distribution */}
        <div className="lg:col-span-5 bg-slate-950/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col h-full justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
              <TrendingUp size={15} className="text-brand-500" />
              <span>Context Batch Density</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Distribution of active/completed tasks by cognitive zone. High density = better batching.
            </p>

            {/* Custom SVG/CSS Bar Chart */}
            <div className="flex flex-col gap-5">
              {zoneDistribution.map((zone) => {
                const percent = (zone.count / maxCount) * 100;
                return (
                  <div key={zone.label} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-300">{zone.label}</span>
                      <span className="font-mono text-slate-500">{zone.count} items</span>
                    </div>
                    <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className={`h-full rounded-full transition-all duration-1000 ${zone.color}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 bg-slate-900/60 border border-slate-900 p-4 rounded-xl flex items-start gap-3">
            <HeartPulse size={16} className="text-brand-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-[11px] font-bold text-slate-200">Focus Health Recommendation</h4>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                {totalSwitches > 4
                  ? 'Your switching rate is high today. Batch similar emails and administrative tasks together in a dedicated Comms or Admin zone block to guard your energy.'
                  : 'Exceptional focus batching! Your low switching is preventing cognitive whiplash. Keep protecting your deep workspace.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Gamified Badges */}
        <div className="lg:col-span-7 bg-slate-950/40 border border-slate-800/80 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
            <Award size={15} className="text-brand-500" />
            <span>Gamified Focus Badges</span>
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            Gamify low switches and transition buffers. Earn accolades by building strong focus habits.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ALL_POSSIBLE_BADGES.map((badgeOpt) => {
              const unlocked = isBadgeUnlocked(badgeOpt.type);
              const storeBadge = badges.find(b => b.badgeType === badgeOpt.type);
              
              return (
                <div
                  key={badgeOpt.type}
                  className={`flex items-start gap-3.5 rounded-xl border p-4 transition-all duration-300 ${
                    unlocked
                      ? 'bg-slate-900/80 border-brand-500/20 shadow-[0_0_15px_-4px_rgba(16,185,129,0.15)] text-slate-100'
                      : 'bg-slate-950/20 border-slate-900 text-slate-600 select-none opacity-60'
                  }`}
                >
                  {/* Badge Icon */}
                  <div className={`text-2xl p-2.5 rounded-xl flex items-center justify-center ${
                    unlocked ? 'bg-brand-500/10 border border-brand-500/20' : 'bg-slate-900 border border-slate-900/50 grayscale'
                  }`}>
                    {badgeOpt.icon}
                  </div>

                  {/* Badge Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className={`text-xs font-bold ${unlocked ? 'text-slate-100' : 'text-slate-500'}`}>
                        {badgeOpt.name}
                      </h4>
                      {unlocked ? (
                        <ShieldCheck size={11} className="text-brand-400" />
                      ) : null}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal line-clamp-2">
                      {badgeOpt.description}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[9px] text-slate-500 font-medium">
                        Goal: {badgeOpt.criteria}
                      </span>
                      {unlocked && storeBadge && (
                        <span className="text-[9px] text-brand-400 font-bold bg-brand-500/5 px-1.5 py-0.5 rounded border border-brand-500/10">
                          Unlocked
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
