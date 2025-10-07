import React, { useEffect, useState, useRef } from 'react';
import { SearchIcon, ChevronDownIcon, XIcon } from 'lucide-react';
import { Badge } from './Badge';

export function MultiSelectDropdown({
  options,
  value = [],
  onChange,
  placeholder = 'Select options',
  searchPlaceholder = 'Search...',
  className = '',
  disabled = false,
  error,
  helpText,
  id,
  label
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOptions = options.filter(option => value.includes(option.value));

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (option) => {
    const newValue = value.includes(option.value) 
      ? value.filter(v => v !== option.value)
      : [...value, option.value];
    onChange(newValue);
    setSearchTerm('');
  };

  const handleRemove = (valueToRemove) => {
    const newValue = value.filter(v => v !== valueToRemove);
    onChange(newValue);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange([]);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div 
        className={`
          flex items-start justify-between w-full px-3 py-2 border rounded-md cursor-pointer
          transition-colors duration-200 shadow-sm min-h-[40px]
          ${disabled ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-card hover:border-primary'}
          ${error ? 'border-destructive' : 'border-input'}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex-1 min-w-0">
          {selectedOptions.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedOptions.map((option) => (
                <Badge 
                  key={option.value} 
                  variant="primary" 
                  size="sm"
                  className="max-w-[200px]"
                >
                  <span className="truncate">{option.label}</span>
                  {!disabled && (
                    <button
                      type="button"
                      className="ml-1.5 inline-flex text-blue-600 hover:text-blue-800 focus:outline-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(option.value);
                      }}
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground py-1">
              {placeholder}
            </div>
          )}
        </div>
        <div className="flex items-center ml-2 flex-shrink-0">
          {selectedOptions.length > 0 && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="mr-1 text-muted-foreground hover:text-foreground focus:outline-none"
              aria-label="Clear all selections"
            >
              <XIcon className="w-4 h-4" />
            </button>
          )}
          <ChevronDownIcon 
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`} 
          />
        </div>
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-destructive" id={`${id}-error`}>
          {error}
        </p>
      )}

      {helpText && !error && (
        <p className="mt-1.5 text-sm text-muted-foreground" id={`${id}-description`}>
          {helpText}
        </p>
      )}

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-md overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <SearchIcon className="w-4 h-4 text-muted-foreground" />
              </div>
              <input
                ref={inputRef}
                type="text"
                className="block w-full pl-10 pr-3 py-2 text-sm border rounded-md
                  transition-colors duration-200 shadow-sm
                  border-input focus:border-primary focus:ring-primary/30
                  focus:ring-2 focus:outline-none
                  text-foreground placeholder:text-muted-foreground"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <ul className="max-h-60 py-1 overflow-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option.value}
                  className={`px-3 py-2 text-sm cursor-pointer transition-colors flex items-center justify-between
                    ${value.includes(option.value) 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-foreground hover:bg-secondary'
                    }`}
                  onClick={() => handleSelect(option)}
                >
                  <span>{option.label}</span>
                  {value.includes(option.value) && (
                    <div className="w-4 h-4 bg-primary rounded-sm flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-sm"></div>
                    </div>
                  )}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-sm text-muted-foreground text-center">
                No results found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}