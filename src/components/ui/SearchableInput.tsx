import React, { useEffect, useState, useRef } from 'react';
import { CheckIcon, SearchIcon } from 'lucide-react';
export function SearchableInput({
  id,
  label,
  options = [],
  value,
  onChange,
  required = false,
  className = '',
  labelClassName = '',
  inputClassName = '',
  error,
  disabled = false,
  placeholder = 'Search...',
  helpText,
  ...props
}) {
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  // Initialize input value based on selected option
  useEffect(() => {
    if (value) {
      const selectedOption = options.find(option => option.value === value);
      if (selectedOption) {
        setInputValue(selectedOption.label);
      }
    } else {
      setInputValue('');
    }
  }, [value, options]);
  // Filter options based on input value
  useEffect(() => {
    if (inputValue.trim() === '') {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option => option.label.toLowerCase().includes(inputValue.toLowerCase()));
      setFilteredOptions(filtered);
    }
  }, [inputValue, options]);
  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && inputRef.current && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  // Handle input change
  const handleInputChange = e => {
    setInputValue(e.target.value);
    setIsOpen(true);
    // If input is cleared, also clear the selected value
    if (e.target.value === '') {
      onChange('');
    }
  };
  // Handle option selection
  const handleSelectOption = option => {
    setInputValue(option.label);
    onChange(option.value);
    setIsOpen(false);
    inputRef.current.focus();
  };
  // Handle input focus
  const handleFocus = () => {
    setIsOpen(true);
  };
  // Handle key navigation
  const handleKeyDown = e => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown' && filteredOptions.length > 0) {
      e.preventDefault();
      const firstOption = document.querySelector('[data-option-index="0"]');
      if (firstOption) firstOption.focus();
    }
  };
  return <div className={className}>
      {label && <label htmlFor={id} className={`block text-sm font-medium text-foreground mb-1.5 ${labelClassName}`}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>}
      <div className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <input ref={inputRef} id={id} name={id} type="text" value={inputValue} onChange={handleInputChange} onFocus={handleFocus} onKeyDown={handleKeyDown} disabled={disabled} placeholder={placeholder} autoComplete="off" className={`
              block w-full rounded-md border shadow-sm pl-10 pr-3 py-2 
              text-foreground placeholder:text-muted-foreground sm:text-sm
              transition-colors duration-200
              ${disabled ? 'bg-muted text-muted-foreground cursor-not-allowed' : ''}
              ${error ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : 'border-input focus:border-primary focus:ring-primary/30'}
              focus:ring-2 focus:outline-none
              ${inputClassName}
            `} aria-invalid={error ? 'true' : 'false'} aria-describedby={error ? `${id}-error` : helpText ? `${id}-description` : undefined} {...props} />
        </div>
        {isOpen && filteredOptions.length > 0 && <div ref={dropdownRef} className="absolute z-10 mt-1 w-full bg-card shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {filteredOptions.map((option, index) => <div key={option.value} data-option-index={index} tabIndex={0} className={`
                  cursor-pointer select-none relative py-2 pl-3 pr-9 
                  ${option.value === value ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-secondary'}
                `} onClick={() => handleSelectOption(option)} onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelectOption(option);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextOption = document.querySelector(`[data-option-index="${index + 1}"]`);
            if (nextOption) nextOption.focus();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (index === 0) {
              inputRef.current.focus();
            } else {
              const prevOption = document.querySelector(`[data-option-index="${index - 1}"]`);
              if (prevOption) prevOption.focus();
            }
          } else if (e.key === 'Escape') {
            setIsOpen(false);
            inputRef.current.focus();
          }
        }}>
                <span className="block truncate">{option.label}</span>
                {option.value === value && <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary">
                    <CheckIcon className="h-4 w-4" />
                  </span>}
              </div>)}
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