'use client';

import { useEffect } from 'react';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Sync recurring expenses to transactions on app startup
    const syncExpenses = async () => {
      try {
        const response = await fetch('/api/sync-expenses', {
          method: 'POST',
        });
        const data = await response.json();
        if (data.success && data.added > 0) {
          console.log(`✅ ${data.message}`);
        }
      } catch (error) {
        console.error('Failed to sync expenses:', error);
      }
    };

    syncExpenses();
  }, []);

  return (
    <html lang="en">
      <head>
        <title>Property Investment Manager</title>
        <meta name="description" content="Track and analyze your property investments" />
      </head>
      <body>{children}</body>
    </html>
  );
}
