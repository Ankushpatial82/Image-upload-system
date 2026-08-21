import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'CloudSnap - Secure Full-Stack Image Management System',
  description: 'A modern full-stack SaaS image management platform to upload, organize, search, and manage cloud assets.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0f172a] text-slate-100 min-h-screen">
        <AuthProvider>
          {children}
          <Toaster position="top-right" theme="dark" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
