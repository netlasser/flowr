import React, { useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import type { ContextZone, Task } from '../../types';
import { TaskItem } from '../task/TaskItem';
import { useFlowrStore } from '../../store';
import { Plus, Play, ChevronDown, ChevronRight, HelpCircle } from 'lucide-react';

interface ZoneColumnProps {
  zone: ContextZone;
  tasks: Task[];
}

export const ZoneColumn: React.FC<ZoneColumnProps> = ({ zone, tasks }) => {
  const addTask = useFlowrStore((state) => state.addTask);
  const startFocus = useFlowrStore((state) => state.startFocus);
  
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  // Droppable area hook for dnd-kit
  const { setNodeRef, isOver } = useDroppable({
    id: zone.id,
  });

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(newTaskTitle.trim(), newTaskDesc.trim() || undefined, zone.id);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setShowAddTaskForm(false);
  };

  // Sleek Tailwind border classes corresponding to custom color selection
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'emerald':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          hoverBg: 'hover:bg-emerald-500/20',
          accentBorder: 'border-t-emerald-500',
          focusGlow: 'hover:shadow-[0_0_20px_-3px_rgba(16,185,129,0.3)]',
          btn: 'bg-emerald-500 hover:bg-emerald-600 shadow-[0_4px_12px_rgba(16,185,129,0.25)]',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        };
      case 'blue':
        return {
          bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
          hoverBg: 'hover:bg-blue-500/20',
          accentBorder: 'border-t-blue-500',
          focusGlow: 'hover:shadow-[0_0_20px_-3px_rgba(59,130,246,0.3)]',
          btn: 'bg-blue-500 hover:bg-blue-600 shadow-[0_4px_12px_rgba(59,130,246,0.25)]',
          badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
        };
      case 'purple':
        default:
        return {
          bg: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
          hoverBg: 'hover:bg-purple-500/20',
          accentBorder: 'border-t-purple-500',
          focusGlow: 'hover:shadow-[0_0_20px_-3px_rgba(168,85,247,0.3)]',
          btn: 'bg-purple-500 hover:bg-purple-600 shadow-[0_4px_12px_rgba(168,85,247,0.25)]',
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
        };
    }
  };

  const styleSet = getColorClasses(zone.color);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col flex-shrink-0 w-80 lg:w-96 rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 transition-all duration-300 border-t-4 ${styleSet.accentBorder} ${styleSet.focusGlow} ${
        isOver ? 'bg-slate-900/60 scale-[1.01] border-slate-700' : ''
      }`}
    >
      {/* Column Header */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-100">{zone.name}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${styleSet.badge}`}>
              {activeTasks.length} active
            </span>
          </div>
          
          {/* Start Focus Guardian Action */}
          <button
            onClick={() => startFocus(zone.id, 'count-up')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-slate-950 transition-all duration-300 transform active:scale-95 ${styleSet.btn}`}
            title={`Enter immersive Flow Guardian for ${zone.name}`}
          >
            <Play size={12} fill="currentColor" />
            <span>Focus</span>
          </button>
        </div>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed bg-slate-900/40 p-2 rounded-lg border border-slate-900">
          {zone.description}
        </p>
      </div>

      {/* Task List (Sortable Droppable Target) */}
      <div className="flex-1 flex flex-col gap-3 min-h-[300px] py-1 overflow-y-auto max-h-[500px]">
        <SortableContext items={activeTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {activeTasks.length > 0 ? (
            activeTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))
          ) : (
            !showAddTaskForm && (
              <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-900 rounded-xl p-4 text-center">
                <HelpCircle className="text-slate-600 mb-2" size={24} />
                <p className="text-xs text-slate-500">No active tasks in this zone.</p>
                <p className="text-[10px] text-slate-600 mt-1">Batch new work below to shield focus.</p>
              </div>
            )
          )}
        </SortableContext>

        {/* Collapsible Completed Section */}
        {completedTasks.length > 0 && (
          <div className="mt-3 border-t border-slate-900 pt-3">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center justify-between w-full text-xs text-slate-500 hover:text-slate-300 transition-colors font-medium mb-2 px-1"
            >
              <div className="flex items-center gap-1.5">
                {showCompleted ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span>Completed Tasks</span>
              </div>
              <span className="bg-slate-900/60 px-1.5 py-0.5 rounded text-[10px]">
                {completedTasks.length}
              </span>
            </button>

            {showCompleted && (
              <div className="flex flex-col gap-2 animate-fade-in pl-1">
                {completedTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Task Control */}
      <div className="mt-4 border-t border-slate-900/60 pt-3">
        {showAddTaskForm ? (
          <form onSubmit={handleAddTask} className="flex flex-col gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl animate-slide-up">
            <input
              type="text"
              required
              placeholder="What task needs to be batched?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="bg-dark-900 border border-slate-800 focus:border-brand-500 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-colors"
            />
            <textarea
              placeholder="Description (optional)"
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
              rows={2}
              className="bg-dark-900 border border-slate-800 focus:border-brand-500 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none resize-none transition-colors"
            />
            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowAddTaskForm(false)}
                className="px-3 py-1.5 text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus size={13} />
                <span>Batch Task</span>
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddTaskForm(true)}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950 text-xs text-slate-400 hover:text-slate-200 transition-all active:scale-[0.99]"
          >
            <Plus size={14} />
            <span>Batch task to this zone</span>
          </button>
        )}
      </div>
    </div>
  );
};
