'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingCart, User, LogOut, Settings, Receipt } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import logo from '@/global/LOGO_WARUNG-removebg-preview.png';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unpaidCount, setUnpaidCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  // Hitung pesanan yang belum diberi aksi (pending dan belum ada bukti/cancel)
  useEffect(() => { 
    setUnpaidCount(0);
    setCartCount(0); 
  }, []);

  useEffect(() => {
    const fetchUserUnpaid = async () => {
      if (!session) return;
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          // Hitung order dengan status pending yang belum upload bukti dan belum di-cancel
          const count = data.filter((o: any) => 
            o.status === 'pending' && 
            !o.paymentProofUrl && 
            o.status !== 'cancelled'
          ).length;
          setUnpaidCount(count);
        }
      } catch (e) {
        /* ignore */
      }
    };
    
    fetchUserUnpaid();
    
    // Listen untuk event custom 'ordersUpdated'
    const handleOrdersUpdate = () => {
      fetchUserUnpaid();
    };
    window.addEventListener('ordersUpdated', handleOrdersUpdate);
    
    return () => {
      window.removeEventListener('ordersUpdated', handleOrdersUpdate);
    };
  }, [session]);

  // Hitung item di keranjang
  useEffect(() => {
    const fetchCartCount = async () => {
      if (!session) {
        // Guest cart dari localStorage
        const guestCart = localStorage.getItem('guestCart');
        if (guestCart) {
          const cart = JSON.parse(guestCart);
          // Hitung jumlah jenis item (bukan total kg)
          const count = cart.items?.length || 0;
          setCartCount(count);
        }
        return;
      }

      // User login: ambil dari API
      try {
        const res = await fetch('/api/cart');
        if (res.ok) {
          const cart = await res.json();
          // Hitung jumlah jenis item (bukan total kg)
          const count = cart.items?.length || 0;
          setCartCount(count);
        }
      } catch (e) {
        /* ignore */
      }
    };

    fetchCartCount();
    
    // Listen untuk event custom 'cartUpdated'
    const handleCartUpdate = () => {
      fetchCartCount();
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [session]);

  return (
    <nav className="bg-white shadow-md border-b-2 border-green-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src={logo}
              alt="Logo Toko Petani Langsung"
              width={48}
              height={48}
              className="rounded-full object-cover border-2 border-green-200"
              priority
            />
            <div className="text-2xl font-bold text-green-700 flex items-center">
              Toko Petani Langsung
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
            {/* Orders (Pesanan Saya) */}
            <Link
              href="/orders"
              className="p-2 text-green-700 hover:text-green-600 transition-colors relative bg-green-50 rounded-lg"
              title="Pesanan Saya"
            >
              <Receipt size={24} />
              {unpaidCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 font-bold">
                  {unpaidCount}
                </span>
              )}
            </Link>
            {/* Cart */}
            <Link
              href="/cart"
              className="p-2 text-green-700 hover:text-green-600 transition-colors relative bg-green-50 rounded-lg"
              title="Keranjang Belanja"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 font-bold">
                  {cartCount}
                </span>
              )}
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

                      {/* Pesanan Saya dipindahkan ke topbar */}

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
