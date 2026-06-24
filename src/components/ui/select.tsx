import * as SelectPrimitive from '@radix-ui/react-select';
import { CaretDown, Check } from '@phosphor-icons/react';

export const Select = SelectPrimitive.Root;

export function SelectTrigger({
  children,
  className = '',
  ...props
}: SelectPrimitive.SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      className={`inline-flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-foreground hover:border-accent/50 transition-colors outline-none data-[placeholder]:text-muted-foreground ${className}`}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <CaretDown size={14} className="text-muted-foreground" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({
  children,
  className = '',
  ...props
}: SelectPrimitive.SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={`z-50 overflow-hidden rounded-xl bg-[#0E0C0C] border border-white/10 shadow-2xl data-[state=open]:animate-fade-in ${className}`}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1.5">
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({
  children,
  className = '',
  ...props
}: SelectPrimitive.SelectItemProps) {
  return (
    <SelectPrimitive.Item
      className={`relative flex cursor-default items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors outline-none data-[disabled]:opacity-40 data-[state=checked]:text-accent ${className}`}
      {...props}
    >
      <SelectPrimitive.ItemIndicator>
        <Check size={12} weight="bold" />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export const SelectValue = SelectPrimitive.Value;
export const SelectGroup = SelectPrimitive.Group;
export const SelectLabel = SelectPrimitive.Label;
