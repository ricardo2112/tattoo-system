import type { HTMLAttributes } from 'react';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Shape variant of the skeleton
   * @default 'rectangular'
   */
  variant?: SkeletonVariant;

  /**
   * Width of the skeleton (CSS value)
   */
  width?: string | number;

  /**
   * Height of the skeleton (CSS value)
   */
  height?: string | number;

  /**
   * Enable animation
   * @default true
   */
  animate?: boolean;
}
