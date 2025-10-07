import React from 'react';
export function Card({
  children,
  className = '',
  title,
  titleClassName = '',
  footer,
  footerClassName = '',
  bordered = true,
  shadowed = true
}) {
  return <div className={`
        bg-card text-card-foreground rounded-lg overflow-hidden
        ${bordered ? 'border border-border' : ''}
        ${shadowed ? 'shadow-sm' : ''}
        ${className}
      `}>
      {title && <div className={`px-6 py-4 border-b border-border ${titleClassName}`}>
          <h3 className="text-lg font-medium">{title}</h3>
        </div>}
      <div className="p-6">{children}</div>
      {footer && <div className={`px-6 py-4 border-t border-border ${footerClassName}`}>
          {footer}
        </div>}
    </div>;
}