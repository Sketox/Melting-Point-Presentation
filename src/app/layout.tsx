import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'MeltingPoint | ML Prediction Dashboard',
    template: '%s | MeltingPoint'
  },
  description: 'Kaggle Competition - Predicting molecular melting points using ChemProp ML model',
  keywords: ['machine learning', 'chemistry', 'melting point', 'kaggle', 'prediction', 'chemprop'],
  authors: [{ name: 'Sketox' }],
  openGraph: {
    title: 'MeltingPoint - ML Prediction Dashboard',
    description: 'Advanced machine learning model predicting melting points from SMILES molecular representations',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <div className="noise-overlay" />
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
