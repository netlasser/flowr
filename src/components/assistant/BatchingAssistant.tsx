import { useState, useMemo } from 'react';
import { useFlowrStore } from '../../store';
import { Check, PencilSimple, X } from '@phosphor-icons/react';

interface BatchingAssistantProps {
  text: string;
  onAccept: (zoneId: string) => void;
  onDismiss: () => void;
}

export function BatchingAssistant({ text, onAccept, onDismiss }: BatchingAssistantProps) {
  const zones = useFlowrStore((s) => s.zones);
  const getSuggestionForText = useFlowrStore((s) => s.getSuggestionForText);
  const addSuggestionFeedback = useFlowrStore((s) => s.addSuggestionFeedback);
  const correctSuggestionFeedback = useFlowrStore((s) => s.correctSuggestionFeedback);

  const [showZonePicker, setShowZonePicker] = useState(false);
  const textHash = text.toLowerCase().replace(/\s+/g, '').slice(0, 50);

  const suggestedZoneId = useMemo(() => {
    if (!text.trim()) return null;
    return getSuggestionForText(text);
  }, [text, getSuggestionForText]);

  if (!text.trim() || !suggestedZoneId) return null;

  const suggestedZone = zones.find((z) => z.id === suggestedZoneId);
  if (!suggestedZone) return null;

  const handleAccept = () => {
    addSuggestionFeedback(textHash, suggestedZoneId);
    onAccept(suggestedZoneId);
  };

  const handleEditCorrect = (correctedZoneId: string) => {
    correctSuggestionFeedback(textHash, correctedZoneId);
    onAccept(correctedZoneId);
    setShowZonePicker(false);
  };

  if (showZonePicker) {
    return (
      <div className="mt-2 bg-muted/40 border border-border rounded-xl p-3 animate-fade-in">
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2">Choose the correct zone</p>
        <div className="flex flex-wrap gap-1.5">
          {zones.map((z) => (
            <button
              key={z.id}
              onClick={() => handleEditCorrect(z.id)}
              className="text-[11px] px-2.5 py-1 rounded-lg border border-border bg-background/50 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              {z.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 flex items-center gap-2 animate-fade-in">
      <span className="text-[11px] text-muted-foreground">
        Suggest: <span className="text-foreground font-semibold">{suggestedZone.name}</span>
      </span>
      <button
        onClick={handleAccept}
        className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
      >
        <Check size={10} weight="bold" />
        <span>Accept</span>
      </button>
      <button
        onClick={() => setShowZonePicker(true)}
        className="flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
      >
        <PencilSimple size={10} />
        <span>Edit</span>
      </button>
      <button
        onClick={onDismiss}
        className="p-1 rounded-full text-muted-foreground/50 hover:text-muted-foreground transition-colors"
      >
        <X size={12} />
      </button>
    </div>
  );
}
