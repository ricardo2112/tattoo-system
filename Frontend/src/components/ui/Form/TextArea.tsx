/**
 * TextArea Component
 *
 * A flexible textarea component with label and error handling.
 * Fully compatible with react-hook-form.
 *
 * @example
 * ```tsx
 * <TextArea
 *   label="Description"
 *   placeholder="Enter description"
 *   rows={5}
 *   error={errors.description?.message}
 *   {...register('description')}
 * />
 * ```
 */

import { forwardRef } from 'react';
import type { TextAreaProps } from './TextArea.types';

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      rows = 4,
      className = '',
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    // Wrapper classes
    const wrapperClasses = fullWidth ? 'w-full' : '';

    // TextArea classes
    const textAreaClasses = `
      w-full px-3 py-2 text-sm
      bg-background border rounded-lg
      resize-vertical
      transition-colors duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:opacity-50 disabled:cursor-not-allowed
      ${hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
        : 'border-input focus:border-primary-500 focus:ring-primary-500'
      }
      ${className}
    `;

    return (
      <div className={wrapperClasses}>
        {/* Label */}
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        {/* TextArea */}
        <textarea
          ref={ref}
          rows={rows}
          className={textAreaClasses}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
          }
          {...props}
        />

        {/* Helper text or error message */}
        {(helperText || error) && (
          <p
            id={error ? `${props.id}-error` : `${props.id}-helper`}
            className={`mt-1.5 text-sm ${
              hasError ? 'text-red-600' : 'text-muted-foreground'
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;
