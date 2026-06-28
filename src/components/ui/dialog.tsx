import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from '@phosphor-icons/react';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export function DialogContent({
  children,
  className = '',
  ...props
}: DialogPrimitive.DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm data-[state=open]:animate-fade-in z-50" />
      <DialogPrimitive.Content
        className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 glass-card p-6 w-[90vw] max-w-md data-[state=open]:animate-slide-up ${className}`}
        {...props}
      >
        {children}
        <DialogPrimitive.Close aria-label="Close" className="absolute right-4 top-4 p-1.5 rounded-lg text-muted-foreground hover:text-accent hover:bg-muted/50 transition-colors">
          <X size={16} />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
export const DialogClose = DialogPrimitive.Close;
