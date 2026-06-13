import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DotsSixVertical, CheckCircle, PencilSimple, Trash } from '@phosphor-icons/react';
import { useFlowrStore } from '../../store/index';
import type { Task } from '../../types';

export function TaskItem({ task }: { task: Task }) {
  const [showDetails, setShowDetails] = useState(false);
  const toggleComplete = useFlowrStore((state) => state.toggleComplete);
  const deleteTask = useFlowrStore((state) => state.deleteTask);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-background/50 border border-border rounded-lg p-3 hover:bg-muted/60 transition-all cursor-pointer ${isDragging ? 'opacity-50 shadow-lg ring-2 ring-brand-500/30' : ''}`}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 flex-shrink-0 cursor-grab text-muted-foreground/40 hover:text-primary transition-colors active:cursor-grabbing"
          aria-label="Drag to reorder"
          tabIndex={-1}
        >
          <DotsSixVertical size={14} />
        </button>
        <div className="mt-0.5 flex-shrink-0 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleComplete(task.id); }}>
          <CheckCircle
            weight={task.completed ? 'fill' : 'regular'}
            className={`w-4 h-4 ${task.completed ? 'text-primary' : 'text-muted-foreground'}`}
          />
        </div>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setShowDetails(!showDetails)}>
          <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground/70' : 'text-foreground'}`}>{task.title}</p>
          {showDetails && task.description && (
            <div className="mt-2 text-xs text-muted-foreground border-t border-border pt-2">{task.description}</div>
          )}
        </div>
        <button
          className="flex-shrink-0 p-1 rounded-md text-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:text-foreground transition-all"
          aria-label="Edit task"
        >
          <PencilSimple className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete this task?')) deleteTask(task.id); }}
          className="flex-shrink-0 p-1 rounded-md text-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:text-whiplash-500 hover:bg-whiplash-500/10 transition-all"
          aria-label="Delete task"
        >
          <Trash className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
