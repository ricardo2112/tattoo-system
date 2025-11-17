/**
 * Spinner Component
 *
 * A loading spinner with customizable size and color.
 * Uses Lucide React's Loader2 icon with rotation animation.
 *
 * @example
 * ```tsx
 * <Spinner size="md" color="primary-600" label="Loading..." />
 * ```
 */

import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import type { SpinnerProps } from './Spinner.types';

const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      size = 'md',
      color = 'primary-600',
      label = 'Loading',
      className = '',
      ...props
    },
    ref
  ) => {
    // Size styles (dimensions for the icon)
    const sizeStyles: Record<typeof size, string> = {
      sm: 'h-4 w-4',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
    };

    return (
      <div
        ref={ref}
        role="status"
        aria-label={label}
        className={`inline-flex items-center justify-center ${className}`}
        {...props}
      >
        <Loader2
          className={`${sizeStyles[size]} text-${color} animate-spin`}
        />
        <span className="sr-only">{label}</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

export default Spinner;
