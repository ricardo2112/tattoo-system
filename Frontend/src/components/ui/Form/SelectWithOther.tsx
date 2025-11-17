/**
 * SelectWithOther Component
 *
 * A select component that shows an input field when "Otro" is selected.
 * Useful for catalog selections where users can add custom values.
 *
 * @example
 * ```tsx
 * <SelectWithOther
 *   label="Condición Médica"
 *   options={condiciones}
 *   value={condicion}
 *   onValueChange={(value) => setCondicion(value)}
 *   placeholder="Seleccione una condición"
 * />
 * ```
 */

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import type { SelectOption } from './Select.types';

interface SelectWithOtherProps {
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
   * Options for the select (should NOT include "Otro" - it's added automatically)
   */
  options: SelectOption[];

  /**
   * Placeholder option
   */
  placeholder?: string;

  /**
   * Current value (can be from options or a custom value)
   */
  value: string;

  /**
   * Callback when value changes
   */
  onValueChange: (value: string) => void;

  /**
   * Whether the field is required
   */
  required?: boolean;

  /**
   * Whether the field is disabled
   */
  disabled?: boolean;

  /**
   * Label for the "Other" option
   * @default "Otro"
   */
  otherLabel?: string;

  /**
   * Placeholder for the custom input when "Otro" is selected
   * @default "Ingrese un valor personalizado"
   */
  otherPlaceholder?: string;
}

const SelectWithOther: React.FC<SelectWithOtherProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  options,
  placeholder,
  value,
  onValueChange,
  required = false,
  disabled = false,
  otherLabel = 'Otro',
  otherPlaceholder = 'Ingrese un valor personalizado',
}) => {
  const hasError = !!error;
  const [selectValue, setSelectValue] = useState<string>('');
  const [customValue, setCustomValue] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Initialize state based on current value
  useEffect(() => {
    if (!value) {
      setSelectValue('');
      setCustomValue('');
      setShowCustomInput(false);
      return;
    }

    // Check if value exists in options
    const existsInOptions = options.some(opt => opt.value.toString() === value);

    if (existsInOptions) {
      setSelectValue(value);
      setShowCustomInput(false);
      setCustomValue('');
    } else {
      // Value is custom
      setSelectValue('__other__');
      setCustomValue(value);
      setShowCustomInput(true);
    }
  }, [value, options]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setSelectValue(newValue);

    if (newValue === '__other__') {
      setShowCustomInput(true);
      // Don't change the parent value yet, wait for custom input
      if (customValue) {
        onValueChange(customValue);
      }
    } else {
      setShowCustomInput(false);
      setCustomValue('');
      onValueChange(newValue);
    }
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCustomValue(newValue);
    onValueChange(newValue);
  };

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
  `;

  // Input classes for custom value
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
  `;

  return (
    <div className={wrapperClasses}>
      {/* Label */}
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      {/* Select wrapper with icon */}
      <div className="relative">
        <select
          className={selectClasses}
          aria-invalid={hasError}
          value={selectValue}
          onChange={handleSelectChange}
          disabled={disabled}
          required={required && !showCustomInput}
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
          <option value="__other__">{otherLabel}</option>
        </select>

        {/* Chevron icon */}
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>

      {/* Custom input when "Otro" is selected */}
      {showCustomInput && (
        <div className="mt-2">
          <input
            type="text"
            className={inputClasses}
            placeholder={otherPlaceholder}
            value={customValue}
            onChange={handleCustomInputChange}
            disabled={disabled}
            required={required}
          />
        </div>
      )}

      {/* Helper text or error message */}
      {(helperText || error) && (
        <p
          className={`mt-1.5 text-sm ${
            hasError ? 'text-red-600' : 'text-muted-foreground'
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
};

SelectWithOther.displayName = 'SelectWithOther';

export default SelectWithOther;
