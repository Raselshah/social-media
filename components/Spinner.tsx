import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  return (
    <div className={`${sizeMap[size]} ${className}`}>
      <div className="animate-spin rounded-full h-full w-full border-4 border-gray-300 border-t-blue-600"></div>
    </div>
  );
};

Spinner.displayName = 'Spinner';
