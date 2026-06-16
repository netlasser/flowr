import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useFlowrStore } from '../../store';
import { ZoneColumn } from './ZoneColumn';
import { TaskItem } from '../task/TaskItem';
import { CreateZoneModal } from './CreateZoneModal';
import { BatchingAssistant } from '../assistant/BatchingAssistant';
import { useWhiplashAlert } from '../../hooks/useWhiplashAlert';
import { PlusCircle, Plus, SquaresFour, Stack, WarningCircle, ArrowRight, X, Info } from '@phosphor-icons/react';
import type { Task } from '../../types';

/* ─── Keyword map for default zones ─────────────────── */
const DEFAULT_ZONE_KEYWORDS: Record<string, string[]> = {
  'z-comms': [
    'email', 'slack', 'chat', 'call', 'sync', 'zoom', 'review',
    'message', 'dm', 'ping', 'notify', 'meet', 'standup',
  ],
  'z-deep-code': [
    'code', 'bug', 'feature', 'refactor', 'compile', 'database',
    'sqlite', 'sql', 'api', 'build', 'deploy', 'fix', 'implement',
    'debug', 'test', 'spec', 'lint',
  ],
  'z-admin': [
    'jira', 'ticket', 'sheet', 'log', 'time', 'plan', 'doc',
    'schedule', 'report', 'invoice', 'budget', 'meeting', 'agenda',
    'note', 'track',
  ],
};

/* ─── Derive keywords from zone name & description ─── */
function deriveKeywords(name: string, description: string): string[] {
  return [...name.split(/\s+/), ...description.split(/\s+/)]
    .map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, ''))
    .filter((w) => w.length > 2);
}

export const ZoneBoard: React.FC = () => {
  const zones   = useFlowrStore((state) => state.zones);
  const tasks   = useFlowrStore((state) => state.tasks);
  const moveTask = useFlowrStore((state) => state.moveTask);
  const addTask  = useFlowrStore((state) => state.addTask);

  useWhiplashAlert();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [bannerDismissed, setBannerDismissed] = useState(
    () => localStorage.getItem('flowr-zone-banner-dismissed') === 'true'
  );

  const dismissBanner = () => {
    setBannerDismissed(true);
    localStorage.setItem('flowr-zone-banner-dismissed', 'true');
  };

  // Smart Batching State
  const [smartInput, setSmartInput]         = useState('');
  const [suggestedZoneId, setSuggestedZoneId] = useState<string | null>(null);
  const [smartTaskTitle, setSmartTaskTitle]  = useState('');

  /* Configure sensors */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (zones.some((z) => z.id === overId)) {
      moveTask(activeId, overId);
      return;
    }

    const overTask = tasks.find((t) => t.id === overId);
    if (overTask && overTask.zoneId !== tasks.find((t) => t.id === activeId)?.zoneId) {
      moveTask(activeId, overTask.zoneId);
    }
  };

  /* ── Smart Batching: dynamic keyword scoring ────────── */
  const handleSmartInputChange = (val: string) => {
    setSmartInput(val);
    setSmartTaskTitle(val);

    if (!val.trim()) {
      setSuggestedZoneId(null);
      return;
    }

    const lower = val.toLowerCase();

    /* Score each zone */
    let bestScore = 0;
    let bestZoneId: string | null = null;

    zones.forEach((zone) => {
      let score = 0;

      // Check static keyword map for default zones
      const staticKws = DEFAULT_ZONE_KEYWORDS[zone.id] ?? [];
      staticKws.forEach((kw) => {
        if (lower.includes(kw)) score += 2;
      });

      // Check keywords derived from user-created zone name + description
      const dynamicKws = deriveKeywords(zone.name, zone.description);
      dynamicKws.forEach((kw) => {
        if (lower.includes(kw)) score += 1;
      });

      if (score > bestScore) {
        bestScore = score;
        bestZoneId = zone.id;
      }
    });

    setSuggestedZoneId(bestScore > 0 ? bestZoneId : null);
  };

  const handleApplySmartBatch = () => {
    if (!smartTaskTitle.trim() || !suggestedZoneId) return;
    addTask(smartTaskTitle.trim(), 'Auto-batched via Smart Suggestion', suggestedZoneId);
    setSmartInput('');
    setSuggestedZoneId(null);
    setSmartTaskTitle('');
  };

  const suggestedZone = zones.find((z) => z.id === suggestedZoneId);

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">
            <SquaresFour size={13} className="text-foreground" />
            <span>Productivity Board</span>
          </div>
          <h1 className="font-display text-2xl lg:text-3xl font-normal text-foreground tracking-tight m-0">
            Cognitive Context Zones
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Drag-and-drop tasks into cognitive batches. Entering a zone triggers the Flow Guardian timer
            and locks down context clutter.
          </p>
        </div>

        {/* Board Actions */}
        <div className="flex items-center gap-3">
          <button
            id="create-zone-btn"
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-primary-foreground flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium hover:bg-primary/90 hover:scale-105 transition-all shadow-lg active:scale-[0.98]"
          >
            <PlusCircle weight="bold" className="w-5 h-5" />
            <span>Create Zone</span>
          </button>
        </div>
      </div>

      {/* Smart Batching Bar */}
      <div className="bg-muted/50 border border-border rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center gap-2.5 flex-1 w-full">
          <div className="bg-background/50 p-2 rounded-lg border border-border text-foreground">
            <WarningCircle size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-foreground">Anti-Whiplash Batching Assistant</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
              Describe a task — we'll route it to the best cognitive zone automatically.
            </p>
          </div>
        </div>

        {/* Input + CTA */}
        <div className="flex items-center gap-2.5 w-full md:w-auto md:min-w-[420px]">
          <div className="relative flex-1">
            <input
              type="text"
              id="smart-batch-input"
              placeholder="e.g. Respond to slack, refactor auth module…"
              value={smartInput}
              onChange={(e) => handleSmartInputChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleApplySmartBatch(); }}
              className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
            <p className="text-xs text-muted-foreground mt-2">e.g. "Respond to slack", "Refactor auth module", "Draft Q3 report"</p>
            {suggestedZoneId && (
              <span className="absolute right-3 top-2.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
            )}
          </div>

          {suggestedZoneId ? (
            <button
              id="smart-batch-apply-btn"
              onClick={handleApplySmartBatch}
              className="bg-primary text-primary-foreground text-xs font-medium px-4 py-2.5 rounded-full transition-all duration-300 flex items-center gap-1 hover:bg-primary/90 hover:scale-105 active:scale-95 whitespace-nowrap shadow-lg"
            >
              <span>Batch → {suggestedZone?.name ?? 'Zone'}</span>
              <ArrowRight size={13} />
            </button>
          ) : (
            <button
              onClick={() => { if (smartInput.trim()) handleSmartInputChange(smartInput); }}
              className="border border-border bg-muted/70 text-foreground text-xs font-medium px-4 py-2.5 rounded-full transition-all duration-300 flex items-center gap-1 hover:bg-muted hover:text-primary hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <Stack className="w-4 h-4" />
              <span>Suggest Tasks</span>
            </button>
          )}
        </div>
      </div>

      {/* AI Suggestion Chip */}
      {smartInput.trim() && (
        <BatchingAssistant
          text={smartInput}
          onAccept={(zoneId) => {
            if (!smartInput.trim()) return;
            addTask(smartInput.trim(), 'AI-suggested task', zoneId);
            setSmartInput('');
            setSuggestedZoneId(null);
            setSmartTaskTitle('');
          }}
          onDismiss={() => {}}
        />
      )}

      {/* Explanatory Banner (dismissible) */}
      {!bannerDismissed && (
        <div className="flex items-start gap-3 bg-primary/10 border border-primary/20 rounded-2xl px-5 py-4">
          <div className="mt-0.5 text-primary flex-shrink-0">
            <Info size={18} />
          </div>
          <p className="text-xs text-foreground/80 leading-relaxed flex-1">
            Group similar tasks into zones. Work inside one zone at a time to protect your focus.
          </p>
          <button
            onClick={dismissBanner}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex-shrink-0"
            aria-label="Dismiss banner"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Zone Columns Board */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto flex gap-6 pb-6 select-none items-start">
          {zones.map((zone) => {
            const zoneTasks = tasks.filter((t) => t.zoneId === zone.id);
            return <ZoneColumn key={zone.id} zone={zone} tasks={zoneTasks} />;
          })}

          {/* + New Zone Card (always last) */}
          <button
            id="add-zone-card-btn"
            onClick={() => setIsModalOpen(true)}
            className="flex flex-col items-center justify-center flex-shrink-0 w-72 h-[320px] border-2 border-dashed border-border rounded-2xl bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-all p-4 text-center cursor-pointer group active:scale-[0.99]"
          >
            <div className="bg-background/50 group-hover:bg-background/70 p-3 rounded-full border border-border mb-3 transition-colors">
              <Plus size={20} />
            </div>
            <h4 className="text-xs font-bold">Add Cognitive Zone</h4>
            <p className="text-[10px] text-muted-foreground mt-1.5 max-w-[190px] leading-relaxed">
              Define another cognitive workspace for smart batching and focus isolation.
            </p>
          </button>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <div className="shadow-2xl rotate-2">
              <TaskItem task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Create Zone Modal */}
      {isModalOpen && <CreateZoneModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};
