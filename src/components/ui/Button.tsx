import React from 'react';
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all duration-200';
  const variantStyles = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover border border-border shadow-sm',
    ghost: 'bg-transparent text-foreground hover:bg-secondary',
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive-hover shadow-sm',
    success: 'bg-success text-success-foreground hover:opacity-90 shadow-sm',
    warning: 'bg-warning text-warning-foreground hover:opacity-90 shadow-sm',
    outline: 'bg-transparent border border-border text-foreground hover:bg-secondary',
    link: 'bg-transparent text-primary hover:underline p-0 h-auto shadow-none'
  };
  const sizeStyles = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2.5 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
    xl: 'px-6 py-3 text-lg'
  };
  const iconSizeStyles = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    xl: 'h-5 w-5'
  };
  const disabledStyles = props.disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'cursor-pointer';
  return <button className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`} {...props}>
      {icon && <span className={`${children ? 'mr-2' : ''} ${iconSizeStyles[size]}`}>
          {icon}
        </span>}
      {children}
    </button>;
}