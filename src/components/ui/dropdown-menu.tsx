import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export function DropdownMenuContent({
  children,
  className = '',
  ...props
}: DropdownMenuPrimitive.DropdownMenuContentProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        className={`z-50 min-w-[160px] overflow-hidden rounded-xl bg-[#0E0C0C] border border-white/10 p-1.5 shadow-2xl data-[state=open]:animate-fade-in ${className}`}
        {...props}
      >
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuItem({
  children,
  className = '',
  ...props
}: DropdownMenuPrimitive.DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      className={`flex cursor-default items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors outline-none data-[disabled]:opacity-40 data-[disabled]:pointer-events-none ${className}`}
      {...props}
    >
      {children}
    </DropdownMenuPrimitive.Item>
  );
}

export const DropdownMenuSeparator = DropdownMenuPrimitive.Separator;
