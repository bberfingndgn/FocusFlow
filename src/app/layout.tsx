import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/Header';
import { Toaster } from '@/components/ui/toaster';
import { SupabaseProvider } from '@/supabase';

export const metadata: Metadata = {
  title: 'Focus Flow',
  description: 'Gamify your study sessions and grow your own virtual garden.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased bg-background min-h-screen flex flex-col')} suppressHydrationWarning>
        <SupabaseProvider>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
          <Toaster />
        </SupabaseProvider>
      </body>
    </html>
  );
}
