import type { SelectHTMLAttributes } from 'react';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /**
   * Select label
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
   * Make select full width
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Options for the select
   */
  options: SelectOption[];

  /**
   * Placeholder option
   */
  placeholder?: string;
}
