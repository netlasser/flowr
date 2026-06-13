import React, { useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import type { ContextZone, Task } from '../../types';
import { TaskItem } from '../task/TaskItem';
import { CreateZoneModal } from './CreateZoneModal';
import { useFlowrStore } from '../../store';
import {
  Plus, Crosshair, CaretDown, CaretRight,
  Code, Envelope, Calendar, PencilSimple, Gear, Briefcase,
  BookOpen, Lightbulb, Headphones, Palette, Users, ChartBar,
  Coffee, Globe, Lightning, Target, Stack, Tray, Trash,
} from '@phosphor-icons/react';

/* ── Icon resolver ─────────────────────────────────────────────────── */
const ICON_MAP: Record<string, React.ElementType> = {
  Code,
  Mail: Envelope,
  Calendar,
  PenLine: PencilSimple,
  Settings: Gear,
  Briefcase,
  BookOpen,
  Lightbulb,
  Headphones,
  Palette,
  Users,
  BarChart2: ChartBar,
  Coffee,
  Globe,
  Zap: Lightning,
  Target,
  Layers: Stack,
  MessageSquare: Envelope, // legacy alias
};

function ZoneIcon({ name, size = 16 }: { name?: string; size?: number }) {
  const Ic = name ? (ICON_MAP[name] ?? Stack) : Tray;
  return <Ic size={size} />;
}

/* ── Color tokens ──────────────────────────────────────────────────── */
type ColorSet = {
  headerIcon: string;
  accentBorder: string;
  focusGlow: string;
  btn: string;
  badge: string;
};

const COLOR_MAP: Record<string, ColorSet> = {
  emerald: {
    headerIcon:   'text-emerald-400',
    accentBorder: 'border-t-emerald-500',
    focusGlow:    'hover:shadow-[0_0_20px_-3px_rgba(16,185,129,0.3)]',
    btn:          'bg-emerald-500 hover:bg-emerald-600 shadow-[0_4px_12px_rgba(16,185,129,0.25)]',
    badge:        'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  blue: {
    headerIcon:   'text-blue-400',
    accentBorder: 'border-t-blue-500',
    focusGlow:    'hover:shadow-[0_0_20px_-3px_rgba(59,130,246,0.3)]',
    btn:          'bg-blue-500 hover:bg-blue-600 shadow-[0_4px_12px_rgba(59,130,246,0.25)]',
    badge:        'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  purple: {
    headerIcon:   'text-purple-400',
    accentBorder: 'border-t-purple-500',
    focusGlow:    'hover:shadow-[0_0_20px_-3px_rgba(168,85,247,0.3)]',
    btn:          'bg-purple-500 hover:bg-purple-600 shadow-[0_4px_12px_rgba(168,85,247,0.25)]',
    badge:        'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
  rose: {
    headerIcon:   'text-rose-400',
    accentBorder: 'border-t-rose-500',
    focusGlow:    'hover:shadow-[0_0_20px_-3px_rgba(244,63,94,0.3)]',
    btn:          'bg-rose-500 hover:bg-rose-600 shadow-[0_4px_12px_rgba(244,63,94,0.25)]',
    badge:        'bg-rose-500/20 text-rose-300 border-rose-500/30',
  },
  amber: {
    headerIcon:   'text-amber-400',
    accentBorder: 'border-t-amber-500',
    focusGlow:    'hover:shadow-[0_0_20px_-3px_rgba(245,158,11,0.3)]',
    btn:          'bg-amber-500 hover:bg-amber-600 shadow-[0_4px_12px_rgba(245,158,11,0.25)]',
    badge:        'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  cyan: {
    headerIcon:   'text-cyan-400',
    accentBorder: 'border-t-cyan-500',
    focusGlow:    'hover:shadow-[0_0_20px_-3px_rgba(6,182,212,0.3)]',
    btn:          'bg-cyan-500 hover:bg-cyan-600 shadow-[0_4px_12px_rgba(6,182,212,0.25)]',
    badge:        'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  },
};

function getColors(color: string): ColorSet {
  return COLOR_MAP[color] ?? COLOR_MAP.purple;
}

/* ── Component ─────────────────────────────────────────────────────── */
interface ZoneColumnProps {
  zone: ContextZone;
  tasks: Task[];
}

export const ZoneColumn: React.FC<ZoneColumnProps> = ({ zone, tasks }) => {
  const addTask    = useFlowrStore((s) => s.addTask);
  const startFocus = useFlowrStore((s) => s.startFocus);

  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [newTaskTitle,    setNewTaskTitle]    = useState('');
  const [newTaskDesc,     setNewTaskDesc]     = useState('');
  const [showCompleted,   setShowCompleted]   = useState(false);
  const [showEditModal,   setShowEditModal]   = useState(false);

  const deleteZone = useFlowrStore((s) => s.deleteZone);

  const { setNodeRef, isOver } = useDroppable({ id: zone.id });

  const activeTasks    = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const c              = getColors(zone.color);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(newTaskTitle.trim(), newTaskDesc.trim() || undefined, zone.id);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setShowAddTaskForm(false);
  };

  return (
<div
        ref={setNodeRef}
        className={`bg-muted/40 backdrop-blur-sm border border-border rounded-xl p-4 shadow-lg flex flex-col gap-3 flex-shrink-0 w-80 lg:w-96 ${
          isOver ? 'bg-muted scale-[1.01] border-foreground/20' : ''
        }`}
      >
      {/* ── Column Header ─────────────────────────────────────── */}
      <div className="flex justify-between items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`${c.headerIcon} flex-shrink-0`}>
              <ZoneIcon name={zone.icon} size={17} />
            </span>
            <h3 className="text-xl font-display text-foreground truncate">{zone.name}</h3>
            <span className={`text-sm text-muted-foreground tabular-nums ${c.badge}`}>
              {activeTasks.length}
            </span>
          </div>
          {zone.description && (
            <p className="text-xs text-muted-foreground leading-relaxed mt-1 line-clamp-2">
              {zone.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center justify-center p-1.5 rounded-lg text-muted-foreground/50 hover:text-primary hover:bg-muted/60 transition-colors"
            title={`Edit ${zone.name}`}
          >
            <PencilSimple size={13} />
          </button>
          <button
            onClick={() => { if (window.confirm(`Delete zone "${zone.name}" and all its tasks?`)) deleteZone(zone.id); }}
            className="flex items-center justify-center p-1.5 rounded-lg text-muted-foreground/50 hover:text-primary hover:bg-muted/60 transition-colors"
            title={`Delete ${zone.name}`}
          >
            <Trash size={13} />
          </button>

          <button
            onClick={() => startFocus(zone.id, 'count-up')}
            className="border border-border bg-muted/70 text-foreground rounded-full px-4 py-1 text-xs flex items-center gap-1 hover:bg-muted hover:text-primary hover:scale-105 active:scale-95 transition-all"
            title={`Enter Focus Guardian for ${zone.name}`}
          >
            <Crosshair weight="bold" className="w-4 h-4" />
            <span>Focus</span>
          </button>
        </div>
      </div>

      {/* ── Task list ─────────────────────────────────────────── */}
      <div className="flex-1 space-y-2 min-h-[280px] py-1 overflow-y-auto max-h-[520px]">
        <SortableContext items={activeTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {activeTasks.length > 0 ? (
            activeTasks.map((task) => <TaskItem key={task.id} task={task} />)
          ) : (
            !showAddTaskForm && (
              <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-border rounded-xl p-4 text-center gap-2 bg-muted/20">
                <ZoneIcon name={zone.icon} size={22} />
                <p className="text-xs text-muted-foreground font-medium">No tasks batched here yet.</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed max-w-[180px]">
                  Add work that requires the same type of focus as this zone.
                </p>
              </div>
            )
          )}
        </SortableContext>

        {/* Collapsible completed section */}
        {completedTasks.length > 0 && (
          <div className="mt-3 bg-muted/20 border border-border rounded-xl p-3">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center justify-between w-full text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              <div className="flex items-center gap-1.5">
                {showCompleted ? <CaretDown size={14} /> : <CaretRight size={14} />}
                <span>Completed</span>
              </div>
              <span className="bg-background/60 px-1.5 py-0.5 rounded text-[10px] tabular-nums border border-border">
                {completedTasks.length}
              </span>
            </button>

            {showCompleted && (
              <div className="flex flex-col gap-2 animate-fade-in mt-3 pt-3 border-t border-border">
                {completedTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Add Task ──────────────────────────────────────────── */}
      <div className="mt-4 border-t border-border pt-3">
        {showAddTaskForm ? (
          <form
            onSubmit={handleAddTask}
            className="flex flex-col gap-3 p-3 bg-muted/40 border border-border rounded-xl animate-slide-up"
          >
            <input
              type="text"
              required
              autoFocus
              placeholder="Task title…"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="bg-muted/50 border border-border focus:border-primary/50 rounded-lg px-3 py-2 text-xs text-foreground placeholder-muted-foreground/70 focus:outline-none transition-colors"
            />
            <textarea
              placeholder="Description (optional)"
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
              rows={2}
              className="bg-muted/50 border border-border focus:border-primary/50 rounded-lg px-3 py-2 text-xs text-foreground placeholder-muted-foreground/70 focus:outline-none resize-none transition-colors"
            />
            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowAddTaskForm(false)}
                className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors bg-muted/50 border border-border"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary text-primary-foreground font-medium px-3 py-1.5 rounded-full transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 flex items-center gap-1 shadow-lg"
              >
                <Plus size={13} />
                <span>Add task</span>
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddTaskForm(true)}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-dashed border-border hover:border-foreground/30 bg-muted/20 text-xs text-muted-foreground hover:text-foreground transition-all active:scale-[0.99]"
          >
            <Plus size={14} />
            <span>Batch task to this zone</span>
          </button>
        )}
      </div>

      {showEditModal && <CreateZoneModal zone={zone} onClose={() => setShowEditModal(false)} />}
    </div>
  );
};
