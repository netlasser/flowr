import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

export function AlertDialogContent({
  children,
  className = '',
  ...props
}: AlertDialogPrimitive.AlertDialogContentProps) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm data-[state=open]:animate-fade-in z-50" />
      <AlertDialogPrimitive.Content
        className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 glass-card p-6 w-[90vw] max-w-sm data-[state=open]:animate-slide-up ${className}`}
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Portal>
  );
}

export const AlertDialogTitle = AlertDialogPrimitive.Title;
export const AlertDialogDescription = AlertDialogPrimitive.Description;

export function AlertDialogAction({
  children,
  className = '',
  ...props
}: AlertDialogPrimitive.AlertDialogActionProps) {
  return (
    <AlertDialogPrimitive.Action
      className={`inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-xs font-bold bg-accent text-accent-foreground hover:bg-accent/90 transition-all active:scale-95 ${className}`}
      {...props}
    >
      {children}
    </AlertDialogPrimitive.Action>
  );
}

export function AlertDialogCancel({
  children,
  className = '',
  ...props
}: AlertDialogPrimitive.AlertDialogCancelProps) {
  return (
    <AlertDialogPrimitive.Cancel
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors ${className}`}
      {...props}
    >
      {children}
    </AlertDialogPrimitive.Cancel>
  );
}
