import { useState, useEffect } from 'react';
import { X, Send, Bug, Lightbulb, MessageCircle } from '@phosphor-icons/react';
import { useFlowrStore } from '../../store';
import { isFeatureEnabled } from '../../lib/featureFlags';
import { api } from '../../services/api';

type FeedbackType = 'bug' | 'feature' | 'general';

export function FeedbackForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>('general');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [context, setContext] = useState<Record<string, unknown>>({});
  const pushToast = useFlowrStore((state) => state.pushToast);

  useEffect(() => {
    // Collect context info
    setContext({
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      timestamp: new Date().toISOString()
    });
  }, []);

  if (!isFeatureEnabled('beta_feedback_form')) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);

    try {
      await api.submitBetaFeedback(type, message, context);

      // Also send to Sentry as a custom event for tracking
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        (window as any).Sentry.captureMessage('Beta Feedback', {
          level: 'info',
          tags: { feedback_type: type },
          extra: { message },
        });
      }

      pushToast('Thank you for your feedback! We appreciate it.', 'success');
      setMessage('');
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      pushToast('Failed to submit feedback. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating feedback button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
        title="Submit Beta Feedback"
      >
        <MessageCircle size={24} />
      </button>

      {/* Feedback modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground">Beta Feedback</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 hover:bg-muted transition-colors"
              >
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Feedback type selector */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType('bug')}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                    type === 'bug'
                      ? 'border-rose-500 bg-rose-500/10 text-rose-400'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Bug size={16} />
                  <span>Bug</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('feature')}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                    type === 'feature'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Lightbulb size={16} />
                  <span>Feature</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('general')}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                    type === 'general'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <MessageCircle size={16} />
                  <span>General</span>
                </button>
              </div>

              {/* Message textarea */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Your feedback
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you think..."
                  className="w-full min-h-[150px] rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                <Send size={18} />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Feedback'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
