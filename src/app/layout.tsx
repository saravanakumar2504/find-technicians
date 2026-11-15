'use client';

import type { Metadata } from 'next';
import './globals.css';
import StoreProvider from './StoreProvider';
import { Navbar } from '@/components/Navbar';
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideNavbar = pathname === '/test-mcp';

  return (
    <html lang="en">
      <body>
        <StoreProvider>
          {!hideNavbar && <Navbar />}
          <div className="page-content" style={hideNavbar ? { padding: 0 } : undefined}>
            {children}
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
