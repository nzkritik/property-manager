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
      <body className="bg-gray-50">
        {/* Banner */}
        <header className="bg-blue-900 shadow-lg print:hidden">
          <div className="container mx-auto px-6 py-4">
            <h1 className="text-3xl font-bold text-white" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>
              Property Investment Management
            </h1>
          </div>
        </header>
        
        {/* Main Content */}
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
