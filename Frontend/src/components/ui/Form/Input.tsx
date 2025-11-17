/**
 * Input Component
 *
 * A flexible input component with label, error handling, and icons.
 * Fully compatible with react-hook-form.
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   error={errors.email?.message}
 *   {...register('email')}
 * />
 * ```
 */

import { forwardRef } from 'react';
import type { InputProps } from './Input.types';

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      startIcon,
      endIcon,
      className = '',
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    // Input wrapper classes
    const wrapperClasses = fullWidth ? 'w-full' : '';

    // Input classes
    const inputClasses = `
      w-full px-3 py-2 text-sm
      bg-background border rounded-lg
      transition-colors duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:opacity-50 disabled:cursor-not-allowed
      ${hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
        : 'border-input focus:border-primary-500 focus:ring-primary-500'
      }
      ${startIcon ? 'pl-10' : ''}
      ${endIcon ? 'pr-10' : ''}
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

        {/* Input wrapper with icons */}
        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {startIcon}
            </div>
          )}

          <input
            ref={ref}
            className={inputClasses}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
            }
            {...props}
          />

          {endIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {endIcon}
            </div>
          )}
        </div>

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

Input.displayName = 'Input';

export default Input;
