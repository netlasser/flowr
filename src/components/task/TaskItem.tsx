import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DotsSixVertical, CheckCircle, PencilSimple, Trash, Check, X } from '@phosphor-icons/react';
import { useFlowrStore } from '../../store/index';
import type { Task } from '../../types';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '../ui/alert-dialog';

export function TaskItem({ task }: { task: Task }) {
  const [showDetails, setShowDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const editInputRef = useRef<HTMLInputElement>(null);
  const toggleComplete = useFlowrStore((state) => state.toggleComplete);
  const updateTask = useFlowrStore((state) => state.updateTask);
  const deleteTask = useFlowrStore((state) => state.deleteTask);

  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [isEditing]);

  const handleSaveEdit = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== task.title) {
      updateTask(task.id, { title: trimmed });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setIsEditing(false);
  };

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-background/50 border border-border rounded-lg p-3 hover:bg-muted/60 transition-all cursor-pointer ${isDragging ? 'opacity-50 shadow-lg ring-2 ring-primary/30' : ''}`}
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
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input
                ref={editInputRef}
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                className="flex-1 bg-muted/80 border border-border rounded-md px-2 py-1 text-sm text-foreground focus:outline-none focus:border-primary/50"
                onClick={(e) => e.stopPropagation()}
              />
              <button onClick={(e) => { e.stopPropagation(); handleSaveEdit(); }} className="p-1 rounded text-primary hover:bg-primary/10 transition-colors" aria-label="Save">
                <Check size={14} weight="bold" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleCancelEdit(); }} className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors" aria-label="Cancel">
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="cursor-pointer" onClick={() => setShowDetails(!showDetails)}>
              <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground/70' : 'text-foreground'}`}>{task.title}</p>
              {showDetails && task.description && (
                <div className="mt-2 text-xs text-muted-foreground border-t border-border pt-2">{task.description}</div>
              )}
            </div>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setEditTitle(task.title); setIsEditing(true); }}
          className="flex-shrink-0 p-1 rounded-md text-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:text-foreground transition-all"
          aria-label="Edit task"
        >
          <PencilSimple className="w-4 h-4" />
        </button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="flex-shrink-0 p-1 rounded-md text-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:text-whiplash-500 hover:bg-whiplash-500/10 transition-all"
              aria-label="Delete task"
            >
              <Trash className="w-4 h-4" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{task.title}"? This action cannot be undone.
            </AlertDialogDescription>
            <div className="flex items-center justify-end gap-2 mt-6">
              <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}>Delete</AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
