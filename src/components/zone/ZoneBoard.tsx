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
import { Plus, LayoutGrid, AlertCircle, ArrowRight } from 'lucide-react';
import type { Task } from '../../types';

export const ZoneBoard: React.FC = () => {
  const zones = useFlowrStore((state) => state.zones);
  const tasks = useFlowrStore((state) => state.tasks);
  const moveTask = useFlowrStore((state) => state.moveTask);
  const addZone = useFlowrStore((state) => state.addZone);
  const addTask = useFlowrStore((state) => state.addTask);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  // Custom Zone Form State
  const [showAddZoneForm, setShowAddZoneForm] = useState(false);
  const [zoneName, setZoneName] = useState('');
  const [zoneDesc, setZoneDesc] = useState('');
  const [zoneColor, setZoneColor] = useState('purple');

  // Smart Batching State
  const [smartInput, setSmartInput] = useState('');
  const [suggestedZoneId, setSuggestedZoneId] = useState<string | null>(null);
  const [smartTaskTitle, setSmartTaskTitle] = useState('');

  // Configure sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Avoid triggering drag on simple clicks
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const targetZoneId = over.id as string;

    // Call move task action in store
    moveTask(taskId, targetZoneId);
  };

  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneName.trim()) return;
    addZone(zoneName.trim(), zoneDesc.trim(), zoneColor);
    setZoneName('');
    setZoneDesc('');
    setZoneColor('purple');
    setShowAddZoneForm(false);
  };

  // Smart Batching: Simple Keyword Analyzer
  const handleSmartInputChange = (val: string) => {
    setSmartInput(val);
    if (!val.trim()) {
      setSuggestedZoneId(null);
      setSmartTaskTitle('');
      return;
    }

    const lower = val.toLowerCase();
    setSmartTaskTitle(val);

    // Analyze keywords to find matching zones
    // "z-deep-code", "z-comms", "z-admin" are defaults
    if (
      lower.includes('email') ||
      lower.includes('slack') ||
      lower.includes('chat') ||
      lower.includes('call') ||
      lower.includes('sync') ||
      lower.includes('zoom') ||
      lower.includes('review')
    ) {
      setSuggestedZoneId('z-comms');
    } else if (
      lower.includes('code') ||
      lower.includes('bug') ||
      lower.includes('feature') ||
      lower.includes('refactor') ||
      lower.includes('compile') ||
      lower.includes('database') ||
      lower.includes('sqlite') ||
      lower.includes('sql')
    ) {
      setSuggestedZoneId('z-deep-code');
    } else if (
      lower.includes('jira') ||
      lower.includes('ticket') ||
      lower.includes('sheet') ||
      lower.includes('log') ||
      lower.includes('time') ||
      lower.includes('plan') ||
      lower.includes('doc')
    ) {
      setSuggestedZoneId('z-admin');
    } else {
      // Default fallback or no suggestion if none matched
      setSuggestedZoneId(null);
    }
  };

  const handleApplySmartBatch = () => {
    if (!smartTaskTitle.trim() || !suggestedZoneId) return;
    
    // Batch task
    addTask(smartTaskTitle.trim(), 'Auto-batched via Smart Suggestion', suggestedZoneId);
    
    // Clear
    setSmartInput('');
    setSuggestedZoneId(null);
    setSmartTaskTitle('');
  };

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
      {/* Header Info */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <LayoutGrid size={13} className="text-brand-500" />
            <span>Productivity Board</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-100 tracking-tight m-0">
            Cognitive Context Zones
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Drag-and-drop tasks directly into batches. Entering a zone will lock down other distractions and trigger the Flow Guardian timer.
          </p>
        </div>

        {/* Board Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddZoneForm(true)}
            className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-sm font-semibold px-4 py-2 rounded-xl transition-all active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>Create Zone</span>
          </button>
        </div>
      </div>

      {/* Smart Batching Alert Tray */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center gap-2.5 flex-1 w-full">
          <div className="bg-brand-500/10 p-2 rounded-lg border border-brand-500/20 text-brand-400">
            <AlertCircle size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-200">Anti-Whiplash Batching Assistant</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Type tasks below. We will analyze keywords to direct it to the correct cognitive zone.
            </p>
          </div>
        </div>

        {/* Input and Quick Suggestion */}
        <div className="flex items-center gap-2.5 w-full md:w-auto md:min-w-[400px]">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="e.g. Respond to slack messages, refactor sqlite db..."
              value={smartInput}
              onChange={(e) => handleSmartInputChange(e.target.value)}
              className="w-full bg-dark-900 border border-slate-800 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-colors"
            />
            {suggestedZoneId && (
              <span className="absolute right-3 top-2.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
            )}
          </div>
          {suggestedZoneId ? (
            <button
              onClick={handleApplySmartBatch}
              className="bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all duration-300 transform flex items-center gap-1 active:scale-95 whitespace-nowrap"
            >
              <span>Batch into {zones.find(z => z.id === suggestedZoneId)?.name.split(' ')[1] || 'Zone'}</span>
              <ArrowRight size={13} />
            </button>
          ) : (
            <div className="bg-slate-950/60 px-3.5 py-2.5 rounded-xl border border-slate-900 text-[11px] text-slate-600 font-medium select-none whitespace-nowrap">
              Waiting for entry
            </div>
          )}
        </div>
      </div>

      {/* Columns Board Container */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto flex gap-6 pb-6 select-none items-start">
          {zones.map((zone) => {
            const zoneTasks = tasks.filter((t) => t.zoneId === zone.id);
            return <ZoneColumn key={zone.id} zone={zone} tasks={zoneTasks} />;
          })}

          {/* Inline Quick Add Zone Card */}
          {showAddZoneForm ? (
            <form
              onSubmit={handleCreateZone}
              className="flex flex-col flex-shrink-0 w-80 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 gap-4 animate-slide-up"
            >
              <h3 className="text-sm font-bold text-slate-200">New Context Zone</h3>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Zone Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 🛠️ Code Reviews"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  className="bg-dark-900 border border-slate-800 focus:border-brand-500 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Focus Description</label>
                <textarea
                  required
                  placeholder="What is the mental focus of this zone?"
                  value={zoneDesc}
                  onChange={(e) => setZoneDesc(e.target.value)}
                  rows={3}
                  className="bg-dark-900 border border-slate-800 focus:border-brand-500 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none resize-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Accent Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'emerald', label: 'Emerald' },
                    { value: 'blue', label: 'Blue' },
                    { value: 'purple', label: 'Purple' }
                  ].map((colorOpt) => (
                    <button
                      key={colorOpt.value}
                      type="button"
                      onClick={() => setZoneColor(colorOpt.value)}
                      className={`py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        zoneColor === colorOpt.value
                          ? colorOpt.value === 'emerald'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : colorOpt.value === 'blue'
                            ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                            : 'bg-purple-500/20 border-purple-500 text-purple-300'
                          : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {colorOpt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 text-xs mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddZoneForm(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold px-4 py-1.5 rounded-lg transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddZoneForm(true)}
              className="flex flex-col items-center justify-center flex-shrink-0 w-80 h-[350px] border-2 border-dashed border-slate-900 hover:border-slate-800 rounded-2xl bg-slate-950/20 text-slate-500 hover:text-slate-300 transition-all p-4 text-center cursor-pointer active:scale-[0.99]"
            >
              <div className="bg-slate-900 p-3 rounded-full border border-slate-800 mb-3">
                <Plus size={20} />
              </div>
              <h4 className="text-xs font-bold">Add Cognitive Zone</h4>
              <p className="text-[10px] text-slate-600 mt-1.5 max-w-[200px] leading-relaxed">
                Define another cognitive workspace context for smart batching.
              </p>
            </button>
          )}
        </div>

        {/* Drag Overlay for smooth, responsive feedback */}
        <DragOverlay>
          {activeTask ? (
            <div className="shadow-2xl rotate-2">
              <TaskItem task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
