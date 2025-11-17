import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';
import favicon from '@/global/LOGO_WARUNG-removebg-preview 1.png';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Toko Petani Langsung',
  description: 'Online store built with Next.js and MongoDB',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Favicon via static import ensures the asset is bundled and available */}
        <link rel="icon" href={(favicon as any).src || (favicon as unknown as string)} />
      </head>
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
