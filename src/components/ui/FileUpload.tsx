import React, { useState } from 'react';
import { UploadIcon, FileIcon, XIcon, CheckIcon } from 'lucide-react';

interface FileUploadProps {
  id?: string;
  label?: string;
  accept?: string;
  multiple?: boolean;
  files?: File[];
  onFilesChange: (files: File[]) => void;
  placeholder?: string;
  helpText?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  showPreview?: boolean;
  maxFileSize?: number; // in MB
  clickToShow?: boolean;
}

export function FileUpload({
  id,
  label,
  accept,
  multiple = false,
  files = [],
  onFilesChange,
  placeholder = 'Upload files or drag and drop',
  helpText,
  error,
  disabled = false,
  className = '',
  showPreview = true,
  maxFileSize = 10,
  clickToShow = false
}: FileUploadProps) {
  const [isVisible, setIsVisible] = useState(!clickToShow);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const fileArray = Array.from(selectedFiles);
    const validFiles = fileArray.filter(file => {
      if (maxFileSize && file.size > maxFileSize * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is ${maxFileSize}MB.`);
        return false;
      }
      return true;
    });

    if (multiple) {
      onFilesChange([...files, ...validFiles]);
    } else {
      onFilesChange(validFiles);
    }
  };

  const handleFileRemove = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!disabled) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (clickToShow && !isVisible) {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div 
          className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => setIsVisible(true)}
        >
          <UploadIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">Click to show file upload</p>
        </div>
        {helpText && (
          <p className="mt-1.5 text-sm text-muted-foreground">
            {helpText}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div
        className={`
          border-2 border-dashed rounded-md p-6 text-center transition-colors
          ${isDragOver ? 'border-primary bg-primary/5' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary'}
          ${error ? 'border-destructive' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && document.getElementById(id || 'file-input')?.click()}
      >
        <div className="space-y-2">
          <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="text-sm text-gray-600">
            <span className="font-medium text-blue-600 hover:text-blue-500">
              {placeholder}
            </span>
          </div>
          {helpText && (
            <p className="text-xs text-gray-500">
              {helpText}
            </p>
          )}
        </div>
      </div>

      <input
        id={id || 'file-input'}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {error && (
        <p className="mt-1.5 text-sm text-destructive">
          {error}
        </p>
      )}

      {showPreview && files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Uploaded Files:
          </h4>
          <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
            {files.map((file, index) => (
              <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <FileIcon className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                  <span className="truncate">{file.name}</span>
                  <span className="ml-2 text-gray-500">
                    ({formatFileSize(file.size)})
                  </span>
                </div>
                <div className="ml-4 flex-shrink-0">
                  {!disabled && (
                    <button
                      type="button"
                      className="font-medium text-red-600 hover:text-red-500 transition-colors"
                      onClick={() => handleFileRemove(index)}
                    >
                      <XIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {clickToShow && isVisible && (
        <div className="mt-2">
          <button
            type="button"
            className="text-sm text-gray-500 hover:text-gray-700"
            onClick={() => setIsVisible(false)}
          >
            Hide upload area
          </button>
        </div>
      )}
    </div>
  );
}