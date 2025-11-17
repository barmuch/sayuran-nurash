'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { useSession } from 'next-auth/react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: string;
}

interface ProductGridProps {
  searchQuery?: string;
  categoryFilter?: string;
}

export default function ProductGrid({ searchQuery = '', categoryFilter = '' }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { data: session } = useSession();

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, categoryFilter, currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
      });

      if (searchQuery) params.append('search', searchQuery);
      if (categoryFilter) params.append('category', categoryFilter);

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();

      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string) => {
    try {
      if (!session) {
        // Guest cart in localStorage with minimal shape used by cart page
        const key = 'guestCart';
        const raw = localStorage.getItem(key);
        const cart = raw ? JSON.parse(raw) : { _id: 'guest', items: [] as any[] };
        const idx = cart.items.findIndex((it: any) => it.productId?._id === productId);
        if (idx >= 0) {
          cart.items[idx].quantity = Math.max(5, (cart.items[idx].quantity || 0) + 5);
        } else {
          const prod = products.find(p => p._id === productId);
          if (!prod) return;
          cart.items.push({ productId: { _id: prod._id, name: prod.name, price: prod.price, imageUrl: prod.imageUrl, stock: prod.stock }, quantity: 5, deliveryType: 'diambil' });
        }
        localStorage.setItem(key, JSON.stringify(cart));
        showToast('✅ Ditambahkan ke keranjang!', 'success');
        // Trigger event untuk update badge
        window.dispatchEvent(new Event('cartUpdated'));
        return;
      }

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 5 }),
      });
      if (response.ok) {
        showToast('✅ Berhasil ditambahkan ke keranjang!', 'success');
        // Trigger event untuk update badge
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        const error = await response.json().catch(()=>({}));
        showToast(error.error || 'Gagal menambahkan ke keranjang.', 'error');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Terjadi kesalahan saat menambahkan ke keranjang.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
            <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 w-full">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
            <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 hover:text-primary-600 transition-colors">
                  {product.name}
                </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {product.description}
              </p>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold text-green-600">
                  Rp {product.price.toLocaleString('id-ID')}
                </span>
                <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  📦 {product.stock}
                </span>
              </div>
              
              <button
                onClick={() => addToCart(product._id)}
                disabled={product.stock === 0}
                className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors ${
                  product.stock === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                }`}
              >
                <ShoppingCart size={18} />
                {product.stock === 0 ? '❌ Habis' : '🛒 Tambah ke Keranjang'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
