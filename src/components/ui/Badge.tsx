import React from 'react';
export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false
}) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full transition-colors';
  const variantStyles = {
    default: 'bg-secondary text-secondary-foreground',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-destructive/10 text-destructive',
    outline: 'bg-transparent border border-border text-foreground'
  };
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-sm'
  };
  return <span className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {dot && <span className={`mr-1.5 h-2 w-2 rounded-full ${variant === 'outline' ? 'bg-foreground' : `bg-${variant === 'default' ? 'secondary-foreground' : variant}`}`} />}
      {children}
    </span>;
}