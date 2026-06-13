import React, { useState, useRef, useEffect } from 'react';
import {
  Code, Envelope, Calendar, PencilSimple, Gear, Briefcase, BookOpen,
  Lightbulb, Headphones, Palette, Users, ChartBar, Coffee,
  Globe, Lightning, Target, Stack, X, Plus
} from '@phosphor-icons/react';
import { useFlowrStore } from '../../store';
import type { ContextZone } from '../../types';

/* ─── Types ─────────────────────────────────────────── */
interface Props {
  onClose: () => void;
  zone?: ContextZone;
}

/* ─── Available Icons ────────────────────────────────── */
const ICONS = [
  { name: 'Code',       Component: Code },
  { name: 'Mail',       Component: Envelope },
  { name: 'Calendar',   Component: Calendar },
  { name: 'PenLine',    Component: PencilSimple },
  { name: 'Settings',   Component: Gear },
  { name: 'Briefcase',  Component: Briefcase },
  { name: 'BookOpen',   Component: BookOpen },
  { name: 'Lightbulb',  Component: Lightbulb },
  { name: 'Headphones', Component: Headphones },
  { name: 'Palette',    Component: Palette },
  { name: 'Users',      Component: Users },
  { name: 'BarChart2',  Component: ChartBar },
  { name: 'Coffee',     Component: Coffee },
  { name: 'Globe',      Component: Globe },
  { name: 'Zap',        Component: Lightning },
  { name: 'Target',     Component: Target },
  { name: 'Layers',     Component: Stack },
] as const;

/* ─── Colour Options ─────────────────────────────────── */
const COLORS: { value: string; label: string; hex: string }[] = [
  { value: 'emerald', label: 'Emerald',  hex: '#10b981' },
  { value: 'blue',    label: 'Ocean',    hex: '#3b82f6' },
  { value: 'purple',  label: 'Violet',   hex: '#a855f7' },
  { value: 'rose',    label: 'Rose',     hex: '#f43f5e' },
  { value: 'amber',   label: 'Amber',    hex: '#f59e0b' },
  { value: 'cyan',    label: 'Cyan',     hex: '#06b6d4' },
];

/* ─── Component ──────────────────────────────────────── */
export const CreateZoneModal: React.FC<Props> = ({ onClose, zone }) => {
  const addZone = useFlowrStore((s) => s.addZone);
  const updateZone = useFlowrStore((s) => s.updateZone);

  const isEditing = !!zone;
  const [name, setName]         = useState(zone?.name ?? '');
  const [desc, setDesc]         = useState(zone?.description ?? '');
  const [color, setColor]       = useState(zone?.color ?? 'emerald');
  const [icon, setIcon]         = useState(zone?.icon ?? 'Code');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);

  /* ESC to close */
  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [onClose]);

  useEffect(() => {
    setTimeout(() => nameRef.current?.focus(), 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);

    if (isEditing && zone) {
      updateZone(zone.id, name.trim(), desc.trim(), color, icon);
    } else {
      addZone(name.trim(), desc.trim(), color, icon);
    }

    setIsSubmitting(false);
    onClose();
  };

  const selectedColor = COLORS.find((c) => c.value === color)!;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Panel */}
      <div
        className="bg-muted/90 backdrop-blur-md border border-border rounded-xl p-6 w-96 shadow-2xl"
        style={{ animation: 'slideUpModal 0.22s cubic-bezier(.22,1,.36,1)' }}
      >
        {/* Accent stripe */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
          style={{ background: selectedColor.hex, opacity: 0.85 }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl"
              style={{ background: `${selectedColor.hex}18`, border: `1px solid ${selectedColor.hex}30` }}
            >
              {(() => {
                const matched = ICONS.find((i) => i.name === icon);
                if (!matched) return <Stack size={18} style={{ color: selectedColor.hex }} />;
                const Ic = matched.Component;
                return <Ic size={18} style={{ color: selectedColor.hex }} />;
              })()}
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-foreground leading-tight">{isEditing ? 'Edit Context Zone' : 'New Context Zone'}</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">{isEditing ? 'Update this cognitive workspace' : 'Define a cognitive workspace'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 flex flex-col gap-5">

          {/* Zone Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Zone Name <span className="text-whiplash-500">*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              required
              maxLength={48}
              placeholder="e.g. Deep Research, Design Sprint…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-muted/60 border border-border focus:border-primary/50 rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground/70 focus:outline-none transition-colors"
            />
          </div>

          {/* Focus Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Focus Description
            </label>
            <textarea
              rows={2}
              maxLength={160}
              placeholder="What type of cognitive work belongs here?"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="bg-muted/60 border border-border focus:border-primary/50 rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground/70 focus:outline-none resize-none transition-colors leading-relaxed"
            />
          </div>

          {/* Colour Picker */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Accent Colour
            </label>
            <div className="grid grid-cols-6 gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  onClick={() => setColor(c.value)}
                  className="relative h-8 rounded-lg transition-all duration-150 active:scale-90"
                  style={{
                    background: c.hex,
                    boxShadow: color === c.value ? `0 0 0 2px #0a0a0a, 0 0 0 4px ${c.hex}` : 'none',
                    transform: color === c.value ? 'scale(1.12)' : 'scale(1)',
                  }}
                >
                  {color === c.value && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Picker */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Zone Icon
            </label>
            <div className="grid grid-cols-6 gap-2">
              {ICONS.map(({ name: iconName, Component }) => (
                <button
                  key={iconName}
                  type="button"
                  title={iconName}
                  onClick={() => setIcon(iconName)}
                  className="flex items-center justify-center h-9 rounded-xl border transition-all duration-150 active:scale-90"
                  style={
                    icon === iconName
                      ? {
                          background: `${selectedColor.hex}22`,
                          border: `1.5px solid ${selectedColor.hex}`,
                          color: selectedColor.hex,
                        }
                      : {
                          background: 'rgba(26, 26, 26, 0.6)',
                          border: '1px solid rgba(46, 46, 46, 0.6)',
                          color: '#a8a8ae',
                        }
                  }
                >
                  <Component size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-extrabold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 shadow-lg"
            >
              <Plus size={14} />
              <span>{isSubmitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Zone'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Modal slide-up keyframe */}
      <style>{`
        @keyframes slideUpModal {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};
