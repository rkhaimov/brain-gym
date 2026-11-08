import type { ComponentProps } from 'react';

import { cn } from '../../lib/cn.js';

export function Button({ className, type = 'button', ...props }: ComponentProps<'button'>) {
  return (
    <button
      className={cn(
        'inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--focus)] disabled:pointer-events-none disabled:opacity-55',
        className,
      )}
      type={type}
      {...props}
    />
  );
}
