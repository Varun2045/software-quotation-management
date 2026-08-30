import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Triple S - Software Quotation Management System',
  description: 'A comprehensive, modern quotation generation and management system for finance and software enterprises.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
