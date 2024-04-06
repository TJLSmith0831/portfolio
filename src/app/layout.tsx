import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ParticleCanvas from './standardUtils/ParticleCanvas';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tristan Smith',
  description: 'Tristan Smith: Lead the League with Full-Stack Solutions',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ParticleCanvas />
        {children}
      </body>
    </html>
  );
}
