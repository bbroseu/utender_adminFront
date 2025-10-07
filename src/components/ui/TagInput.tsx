import React, { useEffect, useState, useRef } from 'react';
export function TagInput({
  tags = [],
  onTagsChange,
  suggestions = [],
  placeholder = 'Add tags...',
  className = '',
  id,
  label,
  required = false,
  labelClassName = '',
  error,
  helpText
}) {
  const [inputValue, setInputValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  // Filter suggestions based on input value
  useEffect(() => {
    if (inputValue.trim() === '') {
      setFilteredSuggestions([]);
      return;
    }
    const filtered = suggestions.filter(suggestion => suggestion.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(suggestion));
    setFilteredSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setActiveSuggestionIndex(0);
  }, [inputValue, suggestions, tags]);
  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const handleInputChange = e => {
    setInputValue(e.target.value);
    if (e.target.value.trim() !== '') {
      setShowSuggestions(true);
    }
  };
  const handleInputKeyDown = e => {
    // Add tag on Enter if input is not empty
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      e.preventDefault();
      if (showSuggestions && filteredSuggestions.length > 0) {
        // Add the selected suggestion
        const newTag = filteredSuggestions[activeSuggestionIndex];
        if (!tags.includes(newTag)) {
          onTagsChange([...tags, newTag]);
        }
      } else {
        // Add the custom input as a tag
        if (!tags.includes(inputValue.trim())) {
          onTagsChange([...tags, inputValue.trim()]);
        }
      }
      setInputValue('');
      setShowSuggestions(false);
    }
    // Remove last tag on Backspace if input is empty
    else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      const newTags = [...tags];
      newTags.pop();
      onTagsChange(newTags);
    }
    // Navigate through suggestions with arrow keys
    else if (e.key === 'ArrowDown' && showSuggestions) {
      e.preventDefault();
      setActiveSuggestionIndex(prevIndex => prevIndex < filteredSuggestions.length - 1 ? prevIndex + 1 : 0);
    } else if (e.key === 'ArrowUp' && showSuggestions) {
      e.preventDefault();
      setActiveSuggestionIndex(prevIndex => prevIndex > 0 ? prevIndex - 1 : filteredSuggestions.length - 1);
    } else if (e.key === 'Escape' && showSuggestions) {
      setShowSuggestions(false);
    }
  };
  const handleRemoveTag = indexToRemove => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    onTagsChange(newTags);
  };
  const handleSuggestionClick = suggestion => {
    if (!tags.includes(suggestion)) {
      onTagsChange([...tags, suggestion]);
    }
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current.focus();
  };
  return <div className={`w-full ${className}`}>
      {label && <label htmlFor={id} className={`block text-sm font-medium text-foreground mb-1.5 ${labelClassName}`}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>}
      <div className={`
        flex flex-wrap items-center gap-2 p-2 border rounded-md shadow-sm
        transition-colors duration-200
        ${error ? 'border-destructive focus-within:border-destructive focus-within:ring-destructive/30' : 'border-input focus-within:border-primary focus-within:ring-primary/30'}
        focus-within:ring-2
      `}>
        {tags.map((tag, index) => <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-primary/10 text-primary">
            {tag}
            <button type="button" className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary" onClick={() => handleRemoveTag(index)}>
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>)}
        <div className="relative flex-grow">
          <input ref={inputRef} id={id} type="text" className="w-full border-0 p-0 focus:ring-0 text-sm text-foreground placeholder:text-muted-foreground" value={inputValue} onChange={handleInputChange} onKeyDown={handleInputKeyDown} onFocus={() => inputValue.trim() !== '' && setShowSuggestions(true)} placeholder={tags.length === 0 ? placeholder : ''} />
          {showSuggestions && <div ref={suggestionsRef} className="absolute z-10 w-full mt-1 bg-card rounded-md shadow-md max-h-60 overflow-auto border border-border">
              <ul className="py-1 text-sm text-foreground">
                {filteredSuggestions.map((suggestion, index) => <li key={index} className={`px-3 py-2 cursor-pointer hover:bg-secondary ${index === activeSuggestionIndex ? 'bg-primary/10 text-primary' : ''}`} onClick={() => handleSuggestionClick(suggestion)}>
                    {suggestion}
                  </li>)}
              </ul>
            </div>}
        </div>
      </div>
      {error && <p className="mt-1.5 text-sm text-destructive" id={`${id}-error`}>
          {error}
        </p>}
      {helpText && !error ? <p className="mt-1.5 text-sm text-muted-foreground" id={`${id}-description`}>
          {helpText}
        </p> : <p className="mt-1 text-xs text-muted-foreground">
          Press Enter to add a tag, Backspace to remove the last tag
        </p>}
    </div>;
}