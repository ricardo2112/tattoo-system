import type { HTMLAttributes } from 'react';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Size of the spinner
   * @default 'md'
   */
  size?: SpinnerSize;

  /**
   * Color of the spinner (Tailwind color class)
   * @default 'primary-600'
   */
  color?: string;

  /**
   * Optional label for accessibility
   */
  label?: string;
}
