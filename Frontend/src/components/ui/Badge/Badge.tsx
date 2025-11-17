/**
 * Badge Component
 *
 * A small label component for displaying status, counts, or tags.
 * Supports multiple variants, sizes, and a dot indicator mode.
 *
 * @example
 * ```tsx
 * <Badge variant="success" size="md">Active</Badge>
 * <Badge variant="danger" dot>3</Badge>
 * ```
 */

import { forwardRef } from 'react';
import type { BadgeProps } from './Badge.types';

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = 'default',
      size = 'md',
      dot = false,
      className = '',
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-full whitespace-nowrap';

    // Variant styles
    const variantStyles: Record<typeof variant, string> = {
      default:
        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      primary:
        'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300',
      success:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      warning:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      danger:
        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    };

    // Size styles
    const sizeStyles: Record<typeof size, string> = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    };

    // Dot indicator styles
    const dotColors: Record<typeof variant, string> = {
      default: 'bg-gray-500',
      primary: 'bg-primary-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      danger: 'bg-red-500',
      info: 'bg-blue-500',
    };

    // Combine all styles
    const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

    return (
      <span ref={ref} className={combinedStyles} {...props}>
        {dot && (
          <span
            className={`mr-1.5 h-1.5 w-1.5 rounded-full ${dotColors[variant]}`}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
