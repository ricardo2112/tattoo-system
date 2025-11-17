/**
 * Checkbox Component
 *
 * A flexible checkbox component with label and error handling.
 * Fully compatible with react-hook-form.
 *
 * @example
 * ```tsx
 * <Checkbox
 *   label="I agree to the terms and conditions"
 *   error={errors.terms?.message}
 *   {...register('terms')}
 * />
 * ```
 */

import { forwardRef } from 'react';
import { Check } from 'lucide-react';
import type { CheckboxProps } from './Checkbox.types';

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className="flex flex-col">
        <div className="flex items-start">
          {/* Custom checkbox */}
          <div className="relative flex h-5 items-center">
            <input
              ref={ref}
              type="checkbox"
              className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-input bg-background transition-all checked:border-primary-600 checked:bg-primary-600 hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              aria-invalid={hasError}
              aria-describedby={
                error
                  ? `${props.id}-error`
                  : helperText
                  ? `${props.id}-helper`
                  : undefined
              }
              {...props}
            />
            {/* Check icon */}
            <Check className="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
          </div>

          {/* Label */}
          {label && (
            <label
              htmlFor={props.id}
              className="ml-2 cursor-pointer select-none text-sm text-foreground"
            >
              {label}
              {props.required && <span className="ml-1 text-red-500">*</span>}
            </label>
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

Checkbox.displayName = 'Checkbox';

export default Checkbox;
