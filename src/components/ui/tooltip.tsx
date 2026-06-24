import * as TooltipPrimitive from '@radix-ui/react-tooltip';

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({
  children,
  className = '',
  ...props
}: TooltipPrimitive.TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        className={`z-50 max-w-56 rounded-lg border border-white/10 bg-[#0E0C0C] px-3 py-2 text-[10px] text-muted-foreground leading-relaxed shadow-xl data-[state=delayed-open]:animate-fade-in ${className}`}
        sideOffset={6}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="fill-[#0E0C0C]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}
