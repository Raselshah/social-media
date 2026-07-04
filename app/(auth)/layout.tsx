import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication - Buddy Script',
  description: 'Login or register to Buddy Script',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
