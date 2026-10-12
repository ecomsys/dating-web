// app/layout.tsx
export const instant = false;

import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Или твой font-sans
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { AppProvider } from '@/components/providers/app-provider';
import { Toaster } from 'sonner'; // Твой <x-ui.sonner />

import { LoginModal } from '@/components/modals/auth/login-modal';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dating App',
  description: 'Знакомства онлайн',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.className} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col`}>
        
        <ThemeProvider>
          <AppProvider>
            {children}

             {/* Глобальные модалки */}
            <LoginModal />
            
            {/* Глобальный тостер (уведомления) */}
            <Toaster expand={true} richColors position="top-right" />
          </AppProvider>
        </ThemeProvider>

      </body>
    </html>
  );
}