import './globals.css';
import { Inter } from 'next/font/google';
import { Provider } from '@/components/ui/provider';
import EmotionRegistry from '@/components/ui/emotion-registry';
import { ToastContainer } from '@/lib/toast';
import React from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'CoBALT App',
  description: 'Hiring Assignment',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <EmotionRegistry>
          <Provider>
            {children}
            <ToastContainer />
          </Provider>
        </EmotionRegistry>
      </body>
    </html>
  );
}