"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

type SliderProps = React.ComponentProps<typeof SliderPrimitive.Root> & {
  /** Props de cada controle, na mesma ordem de `value` ou `defaultValue`. */
  thumbProps?: React.ComponentProps<typeof SliderPrimitive.Thumb>[];
};

export function Slider({
  className,
  value,
  defaultValue,
  thumbProps,
  ...props
}: SliderProps) {
  const values = value ?? defaultValue ?? [0];
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn(
        "relative flex w-full touch-none select-none items-center data-[disabled]:opacity-50",
        className
      )}
      value={value}
      defaultValue={defaultValue}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute h-full bg-primary"
        />
      </SliderPrimitive.Track>
      {values.map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          data-slot="slider-thumb"
          className="block size-5 shrink-0 rounded-full border-2 border-primary bg-background shadow-sm transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 disabled:pointer-events-none"
          {...thumbProps?.[index]}
        />
      ))}
    </SliderPrimitive.Root>
  );
}
