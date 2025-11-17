/**
 * Datepicker Component
 *
 * A datepicker component with label and error handling.
 * Uses native HTML5 date input with custom styling.
 *
 * @example
 * ```tsx
 * <Datepicker
 *   label="Fecha de Nacimiento"
 *   value={fecha}
 *   onChange={(e) => setFecha(e.target.value)}
 *   error={errors.fecha?.message}
 * />
 * ```
 */

import { forwardRef } from 'react';
import { Calendar } from 'lucide-react';

interface DatepickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * Datepicker label
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
   * Make datepicker full width
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Show calendar icon
   * @default true
   */
  showIcon?: boolean;
}

const Datepicker = forwardRef<HTMLInputElement, DatepickerProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      showIcon = true,
      className = '',
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    // Wrapper classes
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
      ${showIcon ? 'pl-10' : ''}
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

        {/* Input wrapper with icon */}
        <div className="relative">
          {showIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <Calendar className="h-4 w-4" />
            </div>
          )}

          <input
            ref={ref}
            type="date"
            className={inputClasses}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
            }
            {...props}
          />
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

Datepicker.displayName = 'Datepicker';

export default Datepicker;
