import React from 'react';
import { useFlowrStore } from '../../store';
import { ArrowsLeftRight, Clock, Medal, ShieldCheck, Eye, WarningCircle, Shield, BatteryCharging, TrendUp, Heartbeat, Trophy, Play, Coffee, CaretRight } from '@phosphor-icons/react';
import * as Sentry from "@sentry/react";

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

const ZONE_COLORS: Record<string, string> = {
  emerald: '#10b981',
  blue: '#3b82f6',
  purple: '#a855f7',
  rose: '#f43f5e',
  amber: '#f59e0b',
  cyan: '#06b6d4',
  red: '#ef4444',
  green: '#22c55e',
  yellow: '#eab308',
  indigo: '#6366f1',
  pink: '#ec4899',
  slate: '#64748b',
};

const REC_ICONS: Record<string, React.ElementType> = {
  timing: Clock,
  switch: ArrowsLeftRight,
  focus: Trophy,
  general: TrendUp,
};

const REC_LABELS: Record<string, string> = {
  timing: 'Peak Hours',
  switch: 'Switch Pattern',
  focus: 'Top Zone',
  general: 'Tip',
};

export const WhiplashAnalytics: React.FC = () => {
  const switches = useFlowrStore((state) => state.switches);
  const badges = useFlowrStore((state) => state.badges);
  const tasks = useFlowrStore((state) => state.tasks);
  const zones = useFlowrStore((state) => state.zones);
  const analytics = useFlowrStore((state) => state.analytics);
  const analyticsLoading = useFlowrStore((state) => state.analyticsLoading);
  const recommendations = useFlowrStore((state) => state.recommendations);
  const recommendationsLoading = useFlowrStore((state) => state.recommendationsLoading);
  const startFocus = useFlowrStore((state) => state.startFocus);
  const storeSet = useFlowrStore.setState;

  const totalSwitches = analytics?.todaySwitches ?? switches.length;
  const totalSecondsLost = totalSwitches * 900;
  const focusStreak = analytics?.longestStreakMinutes ?? 0;

  const severity = totalSwitches <= 2 ? 'low' : totalSwitches <= 5 ? 'medium' : 'high';

  const severityBorder: Record<string, string> = {
    low: 'border-emerald-500/40',
    medium: 'border-amber-500/40',
    high: 'border-red-500/40',
  };

  const severityText: Record<string, string> = {
    low: 'On track — keep batching',
    medium: 'Rising — consider a block',
    high: 'High switching — take a break',
  };

  const severityBarColor: Record<string, string> = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
  };

  const formatSecondsToText = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    if (hours === 0 && minutes === 0) return '0m';
    if (hours === 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
  };

  const isBadgeUnlocked = (name: string) => {
    return badges.some((b) => b.name === name);
  };

  const zoneIdByName: Record<string, string> = {};
  for (const z of zones) {
    zoneIdByName[z.name] = z.id;
  }

  const zoneDistribution = analytics?.zoneDistribution?.length
    ? analytics.zoneDistribution
    : zones.map((zone) => ({
        label: zone.name,
        count: tasks.filter((t) => t.zoneId === zone.id).length,
        color: zone.color || 'purple',
      }));

  const maxCount = Math.max(...zoneDistribution.map((z) => z.count), 1);

  const recentSwitches = switches.slice(-20);
  const pairMap: Record<string, { count: number; fromName: string; toName: string }> = {};
  for (const s of recentSwitches) {
    if (!s.fromZoneId) continue;
    const fromName = zones.find((z) => z.id === s.fromZoneId)?.name ?? 'Unknown';
    const toName = zones.find((z) => z.id === s.toZoneId)?.name ?? 'Unknown';
    const key = `${s.fromZoneId}->${s.toZoneId}`;
    if (!pairMap[key]) pairMap[key] = { count: 0, fromName, toName };
    pairMap[key].count++;
  }
  const topPairs = Object.values(pairMap).sort((a, b) => b.count - a.count).slice(0, 3);

  const loading = analyticsLoading || recommendationsLoading;

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
      <div className="border-b border-border pb-5">
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">
          <TrendUp size={13} className="text-primary" />
          <span>Whiplash Statistics</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-foreground tracking-tight m-0">
          Cognitive Loss Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
          Switching focus costs ~15 minutes of recovery time. Track your cognitive friction, protective streaks, and unlock focus badges.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`bg-muted/40 backdrop-blur-sm border-2 rounded-xl p-4 text-center transition-colors ${severityBorder[severity]}`}>
          <ArrowsLeftRight className="w-6 h-6 mx-auto mb-2 text-primary" />
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Context Switches Today</p>
          <h3 className="text-4xl font-display text-foreground">{totalSwitches}</h3>
          <p className={`text-xs mt-2 ${severity === 'low' ? 'text-emerald-400' : severity === 'medium' ? 'text-amber-400' : 'text-red-400'}`}>
            {severityText[severity]}
          </p>
          <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (totalSwitches / 8) * 100)}%`, backgroundColor: severityBarColor[severity] }}
            />
          </div>
        </div>

        <div className="bg-muted/40 backdrop-blur-sm border-2 border-border rounded-xl p-4 text-center">
          <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Estimated Time Lost</p>
          <h3 className="text-4xl font-display text-foreground">{formatSecondsToText(totalSecondsLost)}</h3>
          <p className="text-xs text-muted-foreground mt-2">Lost in refocus latency tax</p>
        </div>

        <div className="bg-muted/40 backdrop-blur-sm border-2 border-border rounded-xl p-4 text-center">
          <Medal className="w-6 h-6 mx-auto mb-2 text-primary" />
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Focus Streak Duration</p>
          <h3 className="text-4xl font-display text-foreground">{focusStreak} mins</h3>
          <p className="text-xs text-muted-foreground mt-2">Consecutive minutes in deep focus</p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>Loading analytics from server...</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-muted/40 backdrop-blur-sm border border-border rounded-2xl p-6 flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-display font-bold text-foreground mb-2 flex items-center gap-2">
              <TrendUp size={15} className="text-primary" />
              <span>Context Batch Density</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Tasks and focus time per zone. Wider bars = better batching.
            </p>
            <div className="space-y-3">
              {zoneDistribution.map((zone) => {
                const zoneId = zoneIdByName[zone.label];
                const focusSecs = zoneId ? (analytics?.focusTimePerZone?.[zoneId] ?? 0) : 0;
                const pct = maxCount > 0 ? (zone.count / maxCount) * 100 : 0;
                const barColor = ZONE_COLORS[zone.color] || '#a855f7';
                return (
                  <div key={zone.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-foreground">{zone.label}</span>
                      <span className="text-muted-foreground">{zone.count} tasks · {formatSecondsToText(focusSecs)} focused</span>
                    </div>
                    <div className="h-3 bg-muted rounded-md overflow-hidden">
                      <div
                        className="h-full rounded-md transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: barColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {topPairs.length > 0 && (
            <div>
              <h3 className="text-sm font-display font-bold text-foreground mb-2 flex items-center gap-2">
                <ArrowsLeftRight size={15} className="text-primary" />
                <span>Recent Switch Patterns</span>
              </h3>
              <div className="space-y-2">
                {topPairs.map((pair, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-foreground bg-muted/40 rounded-lg px-3 py-2 border border-border/50">
                    <span className="font-medium">{pair.fromName}</span>
                    <CaretRight size={12} className="text-muted-foreground flex-shrink-0" />
                    <span className="font-medium">{pair.toName}</span>
                    <span className="text-muted-foreground ml-auto">×{pair.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-7 bg-muted/40 backdrop-blur-sm border border-border rounded-2xl p-6 flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-display font-bold text-foreground mb-2 flex items-center gap-2">
              <Heartbeat size={15} className="text-primary" />
              <span>Personalized Insights</span>
            </h3>
            {recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.map((rec) => {
                  const Icon = REC_ICONS[rec.type] ?? TrendUp;
                  const label = REC_LABELS[rec.type] ?? 'Insight';
                  return (
                    <div key={rec.id} className="bg-muted/40 border border-border rounded-xl p-3 flex items-start gap-3">
                      <Icon size={18} className="text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[11px] font-semibold text-foreground uppercase tracking-wider">{label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{rec.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-muted/40 border border-border rounded-xl p-4 text-center">
                <p className="text-xs text-muted-foreground">Complete a few focus sessions to get personalized insights.</p>
              </div>
            )}
          </div>

          <div className="bg-muted/40 border border-border rounded-xl p-4 flex items-start gap-3">
            <Heartbeat size={16} className="text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="text-[11px] font-bold text-foreground">Focus Health</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalSwitches > 4
                  ? 'Your switching rate is high today. Batch similar tasks in a dedicated zone block.'
                  : 'Great batching! Your low switching rate prevents cognitive whiplash.'}
              </p>
            </div>
            <button
              onClick={() => {
                if (totalSwitches >= 3) {
                  storeSet({ isBufferActive: true, bufferSecondsLeft: 120, bufferIsQuickBreak: true });
                } else if (zones.length > 0) {
                  startFocus(zones[0].id);
                }
              }}
              className="flex-shrink-0 text-xs bg-primary/20 border border-primary/40 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/30 transition-colors flex items-center gap-1.5"
            >
              {totalSwitches >= 3 ? <Coffee size={13} /> : <Play size={13} />}
              {totalSwitches >= 3 ? 'Take a Break' : 'Start Focus'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-muted/40 backdrop-blur-sm border border-border rounded-2xl p-6">
        <h3 className="text-sm font-display font-bold text-foreground mb-2 flex items-center gap-2">
          <Trophy size={15} className="text-primary" />
          <span>Gamified Focus Badges</span>
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-6">
          Gamify low switches and transition buffers. Earn accolades by building strong focus habits.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {ALL_POSSIBLE_BADGES.map((badgeOpt) => {
            const unlocked = isBadgeUnlocked(badgeOpt.name);
            const storeBadge = badges.find(b => b.name === badgeOpt.name);

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
                  {unlocked && <ShieldCheck size={14} className="text-primary ml-auto" />}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {badgeOpt.description}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Goal: {badgeOpt.criteria}
                  {unlocked && storeBadge && (
                    <span className="ml-2 text-primary font-bold">Unlocked</span>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {import.meta.env.DEV && (
        <div className="border border-dashed border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Sentry Diagnostics</p>
          <div className="flex gap-3">
            <button
              onClick={() => { throw new Error("Sentry React test error from FLOWR analytics"); }}
              className="text-xs bg-red-900/30 border border-red-800/40 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-900/50 transition-colors"
            >
              Throw Test Error
            </button>
            <button
              onClick={() => Sentry.captureMessage("Sentry test message from FLOWR analytics", "info")}
              className="text-xs bg-primary/20 border border-primary/40 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/30 transition-colors"
            >
              Capture Test Message
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
