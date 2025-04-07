"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value?: number;
  onChange?: (value: number) => void;
  max?: number;
  disabled?: boolean;
  allowHalf?: boolean;
}

export function Rating({
  value = 0,
  onChange,
  max = 5,
  disabled = false,
  allowHalf = true,
}: RatingProps) {
  const [hover, setHover] = useState<number | null>(null);

  const handleClick = (index: number, isHalf: boolean) => {
    if (disabled || !onChange) return;
    const newValue = allowHalf ? index - (isHalf ? 0.5 : 0) : index;
    onChange(newValue);
  };

  const currentValue = hover ?? value;

  return (
    <div className="flex gap-2">
      {Array.from({ length: max }, (_, i) => {
        const index = i + 1;
        const filled = currentValue >= index;
        const halfFilled = !filled && currentValue + 0.5 >= index;

        return (
          <div
            key={index}
            className="relative h-10 w-10 cursor-pointer"
            onMouseLeave={() => setHover(null)}
          >
            {/* Empty star in background */}
            <Star className="h-10 w-10 text-muted-foreground" />

            {/* Filled star in front, clipped */}
            <div
              className="absolute top-0 left-0 h-full overflow-hidden"
              style={{
                width: filled ? "100%" : halfFilled ? "50%" : "0%",
              }}
            >
              <Star className="h-10 w-10 fill-yellow-400 text-yellow-400" />
            </div>

            {/* Overlay buttons for full/half clicks */}
            <div className="absolute inset-0 flex">
              <button
                type="button"
                className="w-1/2 h-full"
                disabled={disabled}
                onClick={() => handleClick(index, true)}
                onMouseEnter={() => setHover(index - 0.5)}
              />
              <button
                type="button"
                className="w-1/2 h-full"
                disabled={disabled}
                onClick={() => handleClick(index, false)}
                onMouseEnter={() => setHover(index)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
