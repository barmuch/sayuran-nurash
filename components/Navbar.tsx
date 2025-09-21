'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingCart, User, LogOut, Settings } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <nav className="bg-white shadow-md border-b-2 border-green-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <img 
              src="https://pbs.twimg.com/profile_images/1586970994802970625/6PEwDEg4_400x400.jpg"
              alt="Logo Sayuran Segar Kita"
              className="w-10 h-10 rounded-full object-cover border-2 border-green-200"
            />
            <div className="text-2xl font-bold text-green-700 flex items-center">
            Toko Sayur
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-green-700 hover:text-green-600 transition-colors font-medium flex items-center space-x-1"
            >
              <span></span>
              <span></span>
            </Link>
            <Link
              href="/products"
              className="text-green-700 hover:text-green-600 transition-colors font-medium flex items-center space-x-1"
            >
              <span></span>
              <span></span>
            </Link>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link
              href="/cart"
              className="p-2 text-green-700 hover:text-green-600 transition-colors relative bg-green-50 rounded-lg"
            >
              <ShoppingCart size={24} />
            </Link>

            {/* User Menu */}
            {status === 'loading' ? (
              <div className="w-8 h-8 bg-green-200 rounded-full animate-pulse"></div>
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-green-700 hover:text-green-600 transition-colors bg-green-50 px-3 py-2 rounded-lg"
                >
                  <User size={24} />
                  <span className="hidden md:block">{session.user.username}</span>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-green-200 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-green-700 border-b border-green-100 bg-green-50">
                        👨‍🌾 {session.user.username}
                      </div>
                      
                      {session.user.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="flex items-center px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Settings size={16} className="mr-2" />
                          Admin Dashboard
                        </Link>
                      )}
                      
                      <Link
                        href="/orders"
                        className="flex items-center px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <ShoppingCart size={16} className="mr-2" />
                        Pesanan Saya
                      </Link>
                      
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                      >
                        <LogOut size={16} className="mr-2" />
                        Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/signin"
                  className="text-green-700 hover:text-green-600 transition-colors bg-green-50 px-4 py-2 rounded-lg font-medium"
                >
                  🔑 Masuk
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  📝 Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
