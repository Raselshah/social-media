import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className={`flex flex-col gap-1 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        {/* common input */}
        <input
          ref={ref}
          className={`px-4 py-2.5 border-2 rounded-lg font-poppins text-base transition-all duration-200 focus:outline-none ${
            error
              ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-200'
              : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200'
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-sm text-red-600 font-medium">{error}</span>
        )}
        {helperText && !error && (
          <span className="text-sm text-gray-500">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
