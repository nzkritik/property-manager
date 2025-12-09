'use client';

import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import { useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Property Investment Manager',
  description: 'Track and analyze your property investments',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Sync recurring expenses to transactions on app startup
    const syncExpenses = async () => {
      try {
        const response = await fetch('/api/sync-expenses', {
          method: 'POST',
        })
        const data = await response.json()
        if (data.success && data.added > 0) {
          console.log(`✅ ${data.message}`)
        }
      } catch (error) {
        console.error('Failed to sync expenses:', error)
      }
    }

    syncExpenses()
  }, [])

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
