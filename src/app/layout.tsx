import type { Metadata } from 'next';
import './globals.css';
import StoreProvider from './StoreProvider';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Find Technicians',
  description: 'Next.js + Redux Toolkit application to find technicians',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <Navbar />
          <div className="page-content">{children}</div>
        </StoreProvider>
      </body>
    </html>
  );
}
