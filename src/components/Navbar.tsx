'use client';

import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        Find Technicians
      </Link>
      <div className="navbar-links">
        <Link href="/">Technician List</Link>
        <Link href="/add">Add Technician</Link>
        <Link href="/test-mcp">Build Analysis</Link>
        <Link href="/compare">Compare Builds</Link>
      </div>
    </nav>
  );
}
