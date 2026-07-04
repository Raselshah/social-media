import React from 'react';
import NextLink from 'next/link';

interface LinkProps {
  href: string;
  children: React.ReactNode;
  underline?: boolean;
  className?: string;
}

export const Link: React.FC<LinkProps> = ({
  href,
  children,
  underline = true,
  className = '',
}) => {
  return (
    <NextLink
      href={href}
      className={`text-blue-600 hover:text-blue-700 transition-colors ${
        underline ? 'underline' : ''
      } ${className}`}
    >
      {children}
    </NextLink>
  );
};

Link.displayName = 'Link';
