import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Melting Point Predictor | ML Dashboard',
  description: 'Kaggle Competition - Predicting molecular melting points using ChemProp ML model',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  )
}
