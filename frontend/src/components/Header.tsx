'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-100 py-4">
      <div className="max-w-5xl mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl">🌱</span>
          <span className="text-xl font-bold text-gray-900">
            FreshLife <span className="text-green-500">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link href="/" className="text-gray-600 hover:text-green-500 transition-colors">Home</Link>
          <Link href="/scan" className="text-gray-600 hover:text-green-500 transition-colors">Scan</Link>
          <Link href="/history" className="text-gray-600 hover:text-green-500 transition-colors">History</Link>
          <Link href="/about" className="text-gray-600 hover:text-green-500 transition-colors">About</Link>
        </nav>

        {/* Mobile Hamburger */}
        <button className="md:hidden p-2 text-gray-600" onClick={() => setIsOpen(!isOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <nav className="md:hidden bg-white border-t border-gray-100 mt-4 px-4 py-2 flex flex-col space-y-4 shadow-sm">
          <Link href="/" className="text-gray-600 font-medium" onClick={() => setIsOpen(false)}>Home</Link>
          <Link href="/scan" className="text-gray-600 font-medium" onClick={() => setIsOpen(false)}>Scan</Link>
          <Link href="/history" className="text-gray-600 font-medium" onClick={() => setIsOpen(false)}>History</Link>
          <Link href="/about" className="text-gray-600 font-medium" onClick={() => setIsOpen(false)}>About</Link>
        </nav>
      )}
    </header>
  );
}
