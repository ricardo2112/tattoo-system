import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual variant of the button
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Size of the button
   * @default 'md'
   */
  size?: ButtonSize;

  /**
   * Button content
   */
  children: ReactNode;

  /**
   * Optional icon to display before the text
   */
  icon?: ReactNode;

  /**
   * Make button full width
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Disable button
   * @default false
   */
  disabled?: boolean;

  /**
   * Loading state
   * @default false
   */
  loading?: boolean;
}
