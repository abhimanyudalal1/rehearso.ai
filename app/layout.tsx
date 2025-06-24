import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SpeakAi',
  description: 'Created with Next.js and Gemini Pro',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
