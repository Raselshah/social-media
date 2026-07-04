import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      disabled,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses = 'font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-poppins';

    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100',
      outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 disabled:border-gray-400 disabled:text-gray-400',
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-6 py-2.5 text-base',
      lg: 'px-8 py-3 text-lg',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="inline-block animate-spin">⟳</span>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
