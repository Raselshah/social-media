import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
}

const sizeMap = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

export const Avatar: React.FC<AvatarProps> = ({
  src = '/assets/images/Avatar.png',
  alt,
  size = 'md',
  fallback,
}) => {
  return (
    <div className={`${sizeMap[size]} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center shrink-0`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={64}
          height={64}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-xs font-medium text-gray-600">
          {fallback || alt.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
};

Avatar.displayName = 'Avatar';

