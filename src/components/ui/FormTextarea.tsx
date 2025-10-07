import React from 'react';
export function FormTextarea({
  id,
  label,
  rows = 3,
  required = false,
  className = '',
  labelClassName = '',
  textareaClassName = '',
  error,
  disabled = false,
  readOnly = false,
  helpText,
  ...props
}) {
  return <div className={className}>
      {label && <label htmlFor={id} className={`block text-sm font-medium text-foreground mb-1.5 ${labelClassName}`}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>}
      <div className={`relative rounded-md ${error ? 'shadow-sm' : ''}`}>
        <textarea id={id} name={id} rows={rows} disabled={disabled} readOnly={readOnly} className={`
            block w-full rounded-md border shadow-sm px-3 py-2
            text-foreground placeholder:text-muted-foreground sm:text-sm
            transition-colors duration-200
            ${disabled ? 'bg-muted text-muted-foreground cursor-not-allowed' : ''}
            ${readOnly ? 'bg-muted' : ''}
            ${error ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : 'border-input focus:border-primary focus:ring-primary/30'}
            focus:ring-2 focus:outline-none
            ${textareaClassName}
          `} aria-invalid={error ? 'true' : 'false'} aria-describedby={error ? `${id}-error` : helpText ? `${id}-description` : undefined} {...props} />
      </div>
      {error && <p className="mt-1.5 text-sm text-destructive" id={`${id}-error`}>
          {error}
        </p>}
      {helpText && !error && <p className="mt-1.5 text-sm text-muted-foreground" id={`${id}-description`}>
          {helpText}
        </p>}
    </div>;
}