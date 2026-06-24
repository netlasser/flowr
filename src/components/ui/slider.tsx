import * as SliderPrimitive from '@radix-ui/react-slider';

export function Slider({ className = '', ...props }: SliderPrimitive.SliderProps) {
  return (
    <SliderPrimitive.Root
      className={`relative flex h-5 w-full touch-none items-center ${className}`}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow rounded-full bg-white/10">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-accent" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full bg-accent shadow-lg focus:outline-none focus:ring-2 focus:ring-accent/50 hover:scale-110 transition-transform" />
    </SliderPrimitive.Root>
  );
}
