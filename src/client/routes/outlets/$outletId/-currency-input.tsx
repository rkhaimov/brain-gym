import type { ComponentProps } from 'react';

import { Input } from '@/client/components/ui/input.js';
import { formatRussianCurrencyInput, parseRussianRubles } from '@/client/lib/localization.js';

interface CurrencyInputProps extends Omit<
  ComponentProps<typeof Input>,
  'inputMode' | 'onChange' | 'type' | 'value'
> {
  readonly onValueChange: (value: string) => void;
  readonly value: string;
}

export function CurrencyInput({
  className,
  onBlur,
  onValueChange,
  value,
  ...props
}: CurrencyInputProps) {
  return (
    <div className="relative">
      <Input
        {...props}
        className={`pr-9 ${className ?? ''}`}
        inputMode="decimal"
        onBlur={(event) => {
          const kopecks = parseRussianRubles(event.currentTarget.value);
          if (kopecks !== undefined) onValueChange(formatRussianCurrencyInput(kopecks));
          onBlur?.(event);
        }}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder="0,00"
        type="text"
        value={value}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground"
      >
        ₽
      </span>
    </div>
  );
}
