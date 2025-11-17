import type { TextareaHTMLAttributes } from 'react';

export interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * TextArea label
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
   * Make textarea full width
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Number of rows
   * @default 4
   */
  rows?: number;
}
