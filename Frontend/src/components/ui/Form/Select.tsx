/**
 * Select Component
 *
 * A flexible select component with label and error handling.
 * Fully compatible with react-hook-form.
 *
 * @example
 * ```tsx
 * <Select
 *   label="Country"
 *   options={countries}
 *   placeholder="Select a country"
 *   error={errors.country?.message}
 *   {...register('country')}
 * />
 * ```
 */

import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import type { SelectProps } from './Select.types';

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      options,
      placeholder,
      className = '',
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    // Wrapper classes
    const wrapperClasses = fullWidth ? 'w-full' : '';

    // Select classes
    const selectClasses = `
      w-full px-3 py-2 pr-10 text-sm
      bg-background border rounded-lg
      appearance-none cursor-pointer
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

        {/* Select wrapper with icon */}
        <div className="relative">
          <select
            ref={ref}
            className={selectClasses}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Chevron icon */}
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <ChevronDown className="h-4 w-4" />
          </div>
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

Select.displayName = 'Select';

export default Select;
