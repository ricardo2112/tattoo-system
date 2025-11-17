/**
 * Skeleton Component
 *
 * A placeholder component for loading states.
 * Supports different shapes and custom dimensions.
 *
 * @example
 * ```tsx
 * <Skeleton variant="text" width="100%" height="20px" />
 * <Skeleton variant="circular" width="40px" height="40px" />
 * <Skeleton variant="rectangular" width="100%" height="200px" />
 * ```
 */

import { forwardRef } from 'react';
import { type SkeletonProps } from './Skeleton.types';

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = 'rectangular',
      width,
      height,
      animate = true,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles = 'bg-gray-200 dark:bg-gray-700';

    // Animation styles
    const animationStyles = animate ? 'animate-pulse' : '';

    // Variant styles
    const variantStyles: Record<typeof variant, string> = {
      text: 'rounded h-4',
      circular: 'rounded-full',
      rectangular: 'rounded-lg',
    };

    // Combine all styles
    const combinedStyles = `${baseStyles} ${animationStyles} ${variantStyles[variant]} ${className}`;

    // Combine inline styles
    const combinedInlineStyles = {
      width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
      height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
      ...style,
    };

    return (
      <div
        ref={ref}
        className={combinedStyles}
        style={combinedInlineStyles}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export default Skeleton;
