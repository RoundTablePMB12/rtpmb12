import type { Metadata } from 'next'
import './globals.css'
import { FirebaseProvider } from '@/lib/firebase'

export const metadata: Metadata = {
  title: 'Volunteer Roster',
  description: 'A volunteer roster management application',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <FirebaseProvider>
          {children}
        </FirebaseProvider>
      </body>
    </html>
  )
}
