import React from 'react';
export function FormInput({
  id,
  label,
  type = 'text',
  required = false,
  className = '',
  labelClassName = '',
  inputClassName = '',
  prefix,
  suffix,
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
        {prefix && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {typeof prefix === 'string' ? <span className="text-muted-foreground sm:text-sm">{prefix}</span> : prefix}
          </div>}
        <input id={id} name={id} type={type} disabled={disabled} readOnly={readOnly} className={`
            block w-full rounded-md border shadow-sm 
            ${prefix ? 'pl-10' : 'pl-3'} 
            ${suffix ? 'pr-10' : 'pr-3'} 
            py-2 text-foreground placeholder:text-muted-foreground sm:text-sm
            transition-colors duration-200
            ${disabled ? 'bg-muted text-muted-foreground cursor-not-allowed' : ''}
            ${readOnly ? 'bg-muted' : ''}
            ${error ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : 'border-input focus:border-primary focus:ring-primary/30'}
            focus:ring-2 focus:outline-none
            ${inputClassName}
          `} aria-invalid={error ? 'true' : 'false'} aria-describedby={error ? `${id}-error` : helpText ? `${id}-description` : undefined} {...props} />
        {suffix && <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {typeof suffix === 'string' ? <span className="text-muted-foreground sm:text-sm">{suffix}</span> : suffix}
          </div>}
      </div>
      {error && <p className="mt-1.5 text-sm text-destructive" id={`${id}-error`}>
          {error}
        </p>}
      {helpText && !error && <p className="mt-1.5 text-sm text-muted-foreground" id={`${id}-description`}>
          {helpText}
        </p>}
    </div>;
}