import type { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * Input label
   */
  label?: string;

  /**
   * Error message
   */
  error?: string;

  /**
   * Helper text
   */
  helperText?: string;

  /**
   * Make input full width
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Icon to display before the input
   */
  startIcon?: React.ReactNode;

  /**
   * Icon to display after the input
   */
  endIcon?: React.ReactNode;
}
