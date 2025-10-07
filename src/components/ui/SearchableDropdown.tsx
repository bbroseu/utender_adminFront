import React, { useEffect, useState, useRef } from 'react';
import { SearchIcon, ChevronDownIcon, XIcon } from 'lucide-react';
export function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
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
  const filteredOptions = options.filter(option => option.label.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectedOption = options.find(option => option.value === value);
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
  const handleSelect = option => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
  };
  const handleClear = e => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };
  return <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className={`
          flex items-center justify-between w-full px-3 py-2 border rounded-md cursor-pointer
          transition-colors duration-200 shadow-sm
          ${disabled ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-card hover:border-primary'}
          ${error ? 'border-destructive' : 'border-input'}
        `} onClick={() => !disabled && setIsOpen(!isOpen)}>
        <div className="flex-1 truncate text-sm">
          {selectedOption ? selectedOption.label : placeholder}
        </div>
        <div className="flex items-center">
          {selectedOption && !disabled && <button type="button" onClick={handleClear} className="mr-1 text-muted-foreground hover:text-foreground focus:outline-none" aria-label="Clear selection">
              <XIcon className="w-4 h-4" />
            </button>}
          <ChevronDownIcon className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
        </div>
      </div>
      {error && <p className="mt-1.5 text-sm text-destructive" id={`${id}-error`}>
          {error}
        </p>}
      {helpText && !error && <p className="mt-1.5 text-sm text-muted-foreground" id={`${id}-description`}>
          {helpText}
        </p>}
      {isOpen && !disabled && <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-md overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <SearchIcon className="w-4 h-4 text-muted-foreground" />
              </div>
              <input ref={inputRef} type="text" className="block w-full pl-10 pr-3 py-2 text-sm border rounded-md
                  transition-colors duration-200 shadow-sm
                  border-input focus:border-primary focus:ring-primary/30
                  focus:ring-2 focus:outline-none
                  text-foreground placeholder:text-muted-foreground" placeholder={searchPlaceholder} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} autoFocus />
            </div>
          </div>
          <ul className="max-h-60 py-1 overflow-auto">
            {filteredOptions.length > 0 ? filteredOptions.map(option => <li key={option.value} className={`px-3 py-2 text-sm cursor-pointer transition-colors
                    ${option.value === value ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-secondary'}`} onClick={() => handleSelect(option)}>
                  {option.label}
                </li>) : <li className="px-3 py-2 text-sm text-muted-foreground text-center">
                No results found
              </li>}
          </ul>
        </div>}
    </div>;
}