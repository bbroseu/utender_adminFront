import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarIcon } from 'lucide-react';

interface DatePickerProps {
  id?: string;
  label?: string;
  value?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  showTimeSelect?: boolean;
  dateFormat?: string;
}

export function DatePicker({
  id,
  label,
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  readOnly = false,
  error,
  helpText,
  className = '',
  minDate,
  maxDate,
  showTimeSelect = false,
  dateFormat = 'dd/MM/yyyy'
}: DatePickerProps) {
  const CustomInput = React.forwardRef<HTMLInputElement, any>(({ value, onClick, ...props }, ref) => (
    <div
      className={`
        flex items-center w-full px-3 py-2 border rounded-md cursor-pointer
        transition-colors duration-200 shadow-sm
        ${disabled || readOnly ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-card hover:border-primary'}
        ${error ? 'border-destructive' : 'border-input'}
      `}
      onClick={onClick}
    >
      <input
        {...props}
        ref={ref}
        value={value}
        placeholder={placeholder}
        readOnly
        className="flex-1 bg-transparent text-sm outline-none cursor-pointer placeholder:text-muted-foreground"
      />
      <CalendarIcon className="w-4 h-4 text-muted-foreground ml-2" />
    </div>
  ));

  CustomInput.displayName = 'CustomInput';

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <ReactDatePicker
        id={id}
        selected={value}
        onChange={onChange}
        customInput={<CustomInput />}
        disabled={disabled || readOnly}
        placeholderText={placeholder}
        minDate={minDate}
        maxDate={maxDate}
        showTimeSelect={showTimeSelect}
        dateFormat={dateFormat}
        className="w-full"
        popperClassName="z-50"
        calendarClassName="shadow-lg border border-border rounded-md"
        dayClassName={(date) => 
          "hover:bg-primary hover:text-primary-foreground rounded-md transition-colors"
        }
        weekDayClassName={(date) => 
          "text-muted-foreground text-sm font-medium"
        }
        monthClassName={() => 
          "text-foreground hover:bg-secondary rounded-md transition-colors"
        }
      />

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
    </div>
  );
}