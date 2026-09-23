import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'

import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Global Enterprises',
    template: '%s | Global Enterprises',
  },
  description:
    'Global Enterprises real estate management platform.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={manrope.variable}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  )
}