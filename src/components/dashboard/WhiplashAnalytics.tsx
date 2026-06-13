import React from 'react';
import { useFlowrStore } from '../../store';
import { ArrowsLeftRight, Clock, Medal, ChartLineUp, ShieldCheck, Eye, WarningCircle, Shield, BatteryCharging } from '@phosphor-icons/react';

// Possible badges list with descriptions and lock indicators
const ALL_POSSIBLE_BADGES = [
  {
    type: 'first-switch',
    name: 'Whiplash Witness',
    description: 'Tracked your first cognitive context switch. Awareness is step one.',
    icon: Eye,
    criteria: 'Log your first zone switch'
  },
  {
    type: 'five-switches',
    name: 'Context Juggler',
    description: 'Logged 5 context switches today. Cognitive friction is rising!',
    icon: WarningCircle,
    criteria: 'Log 5 switches in one day'
  },
  {
    type: 'deep-dive',
    name: 'Guardian General',
    description: 'Protect focus for 60 consecutive minutes in Flow Guardian.',
    icon: Shield,
    criteria: 'Active Focus over 60 mins'
  },
  {
    type: 'buffer-master',
    name: 'Restoration Champion',
    description: 'Cleanly complete a full 5-minute recovery break without skipping.',
    icon: BatteryCharging,
    criteria: 'Complete 1 transition buffer'
  }
];

export const WhiplashAnalytics: React.FC = () => {
  const switches = useFlowrStore((state) => state.switches);
  const badges = useFlowrStore((state) => state.badges);
  const tasks = useFlowrStore((state) => state.tasks);
  const zones = useFlowrStore((state) => state.zones);
  const analytics = useFlowrStore((state) => state.analytics);

  const totalSwitches = analytics?.todaySwitches ?? switches.length;
  const totalSecondsLost = analytics?.totalSecondsLost ?? switches.reduce((acc, curr) => acc + curr.estimatedTimeLostSeconds, 0);
  const focusStreak = analytics?.longestStreakMinutes ?? 0;

  const formatSecondsToText = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    
    if (hours === 0 && minutes === 0) return '0 minutes';
    if (hours === 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
  };

  // Determine unlocked status
  const isBadgeUnlocked = (type: string) => {
    return badges.some((b) => b.badgeType === type);
  };

  // Zone distribution
  const zoneDistribution = analytics?.zoneDistribution?.length
    ? analytics.zoneDistribution
    : zones.map((zone) => ({
        label: zone.name,
        count: tasks.filter((t) => t.zoneId === zone.id).length,
        color: `bg-${zone.color}-500`,
      }));
  const maxCount = Math.max(...zoneDistribution.map(z => z.count), 1);

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
      {/* Header Info */}
      <div className="border-b border-border pb-5">
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">
          <TrendUp size={13} className="text-brand-500" />
          <span>Whiplash Statistics</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-foreground tracking-tight m-0">
          Cognitive Loss Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
          Switching focus costs ~15 minutes of recovery time. Track your cognitive friction, protective streaks, and unlock focus badges.
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric Card 1: Context Switches */}
        <div className="bg-muted/40 backdrop-blur-sm border border-border rounded-xl p-4 text-center">
          <ArrowsLeftRight className="w-6 h-6 mx-auto mb-2 text-primary" />
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Context Switches Today</p>
          <h3 className="text-4xl font-display text-foreground">{totalSwitches}</h3>
          <p className="text-xs text-muted-foreground mt-2">
            Target: <span className="text-brand-400 font-bold">&lt; 3 switches</span> per day.
          </p>
        </div>

        {/* Metric Card 2: Estimated Time Lost */}
        <div className="bg-muted/40 backdrop-blur-sm border border-border rounded-xl p-4 text-center">
          <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Estimated Time Lost</p>
          <h3 className="text-4xl font-display text-foreground">{formatSecondsToText(totalSecondsLost)}</h3>
          <p className="text-xs text-muted-foreground mt-2">
            Lost in "refocus latency tax".
          </p>
        </div>

        {/* Metric Card 3: Longest Streak */}
        <div className="bg-muted/40 backdrop-blur-sm border border-border rounded-xl p-4 text-center">
          <Medal className="w-6 h-6 mx-auto mb-2 text-primary" />
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Focus Streak Duration</p>
          <h3 className="text-4xl font-display text-foreground">{focusStreak} mins</h3>
          <p className="text-xs text-muted-foreground mt-2">
            Consecutive minutes in deep focus.
          </p>
        </div>
      </div>

      {/* Main Analytics Content: Switch Distribution & Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Context Density distribution */}
        <div className="lg:col-span-5 bg-muted/40 backdrop-blur-sm border border-border rounded-2xl p-6 flex flex-col h-full justify-between">
          <div>
            <h3 className="text-sm font-display font-bold text-foreground mb-2 flex items-center gap-2">
              <TrendUp size={15} className="text-brand-500" />
              <span>Context Batch Density</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
              Distribution of active/completed tasks by cognitive zone. High density = better batching.
            </p>

            {/* Custom SVG/CSS Bar Chart */}
            <div className="bg-muted/40 backdrop-blur-sm border border-border rounded-xl p-4">
              {zoneDistribution.map((zone) => {
                const percent = (zone.count / maxCount) * 100;
                return (
                  <div key={zone.label} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="font-body text-foreground">{zone.label}</span>
                    <span className="text-muted-foreground">{zone.count} items</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 bg-muted/40 backdrop-blur-sm border border-border p-4 rounded-xl flex items-start gap-3">
            <Heartbeat size={16} className="text-brand-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-[11px] font-bold text-foreground">Focus Health Recommendation</h4>
              <p className="text-[10px] text-muted-foreground mt-1 leading-normal">
                {totalSwitches > 4
                  ? 'Your switching rate is high today. Batch similar emails and administrative tasks together in a dedicated Comms or Admin zone block to guard your energy.'
                  : 'Exceptional focus batching! Your low switching is preventing cognitive whiplash. Keep protecting your deep workspace.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Gamified Badges */}
        <div className="lg:col-span-7 bg-muted/40 backdrop-blur-sm border border-border rounded-2xl p-6">
          <h3 className="text-sm font-display font-bold text-foreground mb-2 flex items-center gap-2">
            <Trophy size={15} className="text-brand-500" />
            <span>Gamified Focus Badges</span>
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-6">
            Gamify low switches and transition buffers. Earn accolades by building strong focus habits.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {ALL_POSSIBLE_BADGES.map((badgeOpt) => {
              const unlocked = isBadgeUnlocked(badgeOpt.type);
              const storeBadge = badges.find(b => b.badgeType === badgeOpt.type);
              
              return (
                <div
                  key={badgeOpt.type}
                  className={`bg-muted/40 backdrop-blur-sm border border-border rounded-xl p-4 transition-all duration-300 ${
                    unlocked
                      ? 'text-foreground'
                      : 'text-muted-foreground select-none opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <badgeOpt.icon className="w-6 h-6 text-primary" />
                    <h4 className={`font-display text-foreground text-lg ${unlocked ? '' : 'opacity-60'}`}>
                      {badgeOpt.name}
                    </h4>
                    {unlocked && <ShieldCheck size={14} className="text-brand-400 ml-auto" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {badgeOpt.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Goal: {badgeOpt.criteria}
                    {unlocked && storeBadge && (
                      <span className="ml-2 text-brand-400 font-bold">Unlocked</span>
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
