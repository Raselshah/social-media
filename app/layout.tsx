import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/providers";

export const metadata: Metadata = {
  title: "Buddy Script",
  description: "A full-stack social media experience built with Next.js and Prisma",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
