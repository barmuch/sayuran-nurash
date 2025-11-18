'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingCart, User, LogOut, Settings, Receipt, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import logo from '@/global/LOGO_WARUNG-removebg-preview.png';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    <nav className="bg-white shadow-md border-b-2 border-green-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <div className="relative w-16 h-10 sm:w-20 sm:h-12">
              <Image
                src={logo}
                alt="Logo Toko Petani Langsung"
                fill
                className="object-contain rounded-lg border-2 border-green-200"
                priority
              />
            </div>
            <div className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-green-700 leading-tight">
              <span className="block sm:inline">Toko Petani</span>
              <span className="hidden xs:inline"> </span>
              <span className="block sm:inline">Langsung</span>
            </div>
          </Link>

        
          {/* Right side buttons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Orders */}
            <Link
              href="/orders"
              className="p-2 text-green-700 hover:text-green-600 transition-colors relative bg-green-50 rounded-lg"
              title="Pesanan Saya"
            >
              <Receipt size={20} className="sm:w-6 sm:h-6" />
              {unpaidCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] flex items-center justify-center rounded-full px-1 font-bold">
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
              <ShoppingCart size={20} className="sm:w-6 sm:h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] flex items-center justify-center rounded-full px-1 font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Menu Desktop */}
            {status === 'loading' ? (
              <div className="w-8 h-8 bg-green-200 rounded-full animate-pulse hidden sm:block"></div>
            ) : session ? (
              <>
                {/* Desktop User Menu */}
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 text-green-700 hover:text-green-600 transition-colors bg-green-50 px-3 py-2 rounded-lg"
                  >
                    <User size={20} className="sm:w-6 sm:h-6" />
                    <span className="hidden md:block text-sm">{session.user.username}</span>
                  </button>

                  {isMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsMenuOpen(false)}
                      ></div>
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

                          <button
                            onClick={handleSignOut}
                            className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                          >
                            <LogOut size={16} className="mr-2" />
                            Keluar
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="sm:hidden p-2 text-green-700 hover:text-green-600 transition-colors bg-green-50 rounded-lg"
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </>
            ) : (
              <>
                {/* Desktop Auth Buttons */}
                <div className="hidden sm:flex items-center space-x-2">
                  <Link
                    href="/auth/signin"
                    className="text-green-700 hover:text-green-600 transition-colors bg-green-50 px-4 py-2 rounded-lg font-medium text-sm"
                  >
                    🔑 Masuk
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
                  >
                    📝 Daftar
                  </Link>
                </div>

                {/* Mobile Menu Button for Guest */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="sm:hidden p-2 text-green-700 hover:text-green-600 transition-colors bg-green-50 rounded-lg"
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="sm:hidden bg-white border-t border-green-200 shadow-lg absolute w-full z-50">
            <div className="px-4 py-3 space-y-3">
              {/* Navigation Links */}
              <Link
                href="/"
                className="block text-green-700 hover:text-green-600 transition-colors font-medium py-2 border-b border-green-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🏠 Beranda
              </Link>

              {session ? (
                <>
                  <div className="pt-2 border-t-2 border-green-200">
                    <div className="text-sm text-green-700 font-semibold mb-2">
                      👨‍🌾 {session.user.username}
                    </div>
                  </div>

                  {session.user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="flex items-center text-green-700 hover:text-green-600 transition-colors py-2 border-b border-green-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Settings size={18} className="mr-2" />
                      Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center w-full text-green-700 hover:text-green-600 transition-colors py-2"
                  >
                    <LogOut size={18} className="mr-2" />
                    Keluar
                  </button>
                </>
              ) : (
                <div className="pt-2 space-y-2 border-t-2 border-green-200">
                  <Link
                    href="/auth/signin"
                    className="block text-center bg-green-50 text-green-700 py-2 rounded-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    🔑 Masuk
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block text-center bg-green-600 text-white py-2 rounded-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    📝 Daftar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
