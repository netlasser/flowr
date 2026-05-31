import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types';
import { useFlowrStore } from '../../store';
import { CheckSquare, Square, Trash2, Calendar, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const toggleTask = useFlowrStore((state) => state.toggleTask);
  const deleteTask = useFlowrStore((state) => state.deleteTask);
  const [showDetails, setShowDetails] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex flex-col rounded-xl border p-4 transition-all duration-200 ${
        task.completed
          ? 'bg-slate-900/40 border-slate-800 text-slate-500'
          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-100 shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Grab Handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab text-slate-600 hover:text-slate-400 group-hover:opacity-100 opacity-40 transition-opacity"
          title="Drag to reorder or switch zones"
        >
          <GripVertical size={16} />
        </button>

        {/* Complete Checkbox */}
        <button
          onClick={() => toggleTask(task.id)}
          className={`mt-0.5 text-slate-400 hover:text-brand-500 transition-colors flex-shrink-0`}
        >
          {task.completed ? (
            <CheckSquare size={19} className="text-brand-500" />
          ) : (
            <Square size={19} />
          )}
        </button>

        {/* Title and Detail Toggle */}
        <div className="flex-1 min-w-0" onClick={() => task.description && setShowDetails(!showDetails)}>
          <h4
            className={`text-sm font-medium leading-relaxed truncate cursor-pointer select-none ${
              task.completed ? 'line-through text-slate-500' : 'text-slate-200 hover:text-brand-500'
            }`}
          >
            {task.title}
          </h4>
          
          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
            <Calendar size={11} />
            <span>{formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
            {task.description && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(!showDetails);
                }}
                className="ml-1 flex items-center gap-0.5 text-slate-400 hover:text-brand-500 font-medium"
              >
                {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                <span>details</span>
              </button>
            )}
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={() => deleteTask(task.id)}
          className="text-slate-600 hover:text-whiplash-500 opacity-0 group-hover:opacity-100 transition-all duration-200"
          title="Delete task"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Description Expandable Panel */}
      {showDetails && task.description && (
        <div className="mt-3 pl-8 text-xs text-slate-400 border-t border-slate-800/80 pt-2 animate-fade-in leading-relaxed">
          {task.description}
        </div>
      )}
    </div>
  );
};
