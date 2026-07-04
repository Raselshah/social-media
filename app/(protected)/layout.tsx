import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Feed - Buddy Script',
  description: 'Your social media feed',
};

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
