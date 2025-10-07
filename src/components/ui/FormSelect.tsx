import React from 'react';
import { ChevronDownIcon } from 'lucide-react';
export function FormSelect({
  id,
  label,
  options = [],
  required = false,
  className = '',
  labelClassName = '',
  selectClassName = '',
  error,
  disabled = false,
  ...props
}) {
  return <div className={className}>
      {label && <label htmlFor={id} className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>}
      <div className="relative">
        <select id={id} name={id} disabled={disabled} className={`
            block w-full rounded-md border-gray-300 shadow-sm pl-3 pr-10 py-2 
            text-gray-900 placeholder:text-gray-400 sm:text-sm
            transition-colors duration-150 appearance-none
            ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}
            ${error ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}
            ${selectClassName}
          `} aria-invalid={error ? 'true' : 'false'} aria-describedby={error ? `${id}-error` : undefined} {...props}>
          {options.map((option, index) => <option key={index} value={option.value}>
              {option.label}
            </option>)}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
          <ChevronDownIcon className="h-4 w-4" />
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-600" id={`${id}-error`}>
          {error}
        </p>}
    </div>;
}