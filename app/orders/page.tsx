'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Package, Calendar, CreditCard, ShoppingBag, Check, Upload, XCircle } from 'lucide-react';
import { showToast } from '@/lib/toast';
import Loading from '@/components/Loading';

interface OrderItem {
  productId: { _id: string; name: string; imageUrl: string };
  quantity: number; price: number; deliveryType?: 'diambil' | 'disedekahkan';
}
interface Order { _id: string; items: OrderItem[]; totalPrice: number; status: string; createdAt: string; paymentStatus?: string; paymentProofUrl?: string; }

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ordersPerPage = 5;

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchOrders();
  }, [session, status, router, currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        // Sort by createdAt descending (newest first)
        const sortedOrders = data.sort((a: Order, b: Order) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        // Calculate pagination
        const total = sortedOrders.length;
        setTotalPages(Math.ceil(total / ordersPerPage));
        
        // Get current page orders
        const startIndex = (currentPage - 1) * ordersPerPage;
        const endIndex = startIndex + ordersPerPage;
        setOrders(sortedOrders.slice(startIndex, endIndex));
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!orderId) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' });
      if (res.ok) {
        showToast('Pesanan berhasil dibatalkan.', 'success');
        setConfirmId(null);
        fetchOrders();
        // Trigger event untuk update badge orders
        window.dispatchEvent(new Event('ordersUpdated'));
      } else {
        const err = await res.json().catch(()=>({}));
        showToast(err.message || 'Gagal membatalkan pesanan.', 'error');
      }
    } catch (e) {
      showToast('Terjadi kesalahan saat membatalkan pesanan.', 'error');
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu Konfirmasi Admin';
      case 'confirmed':
        return 'Dikonfirmasi';
      case 'delivered':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      case 'completed':
        return 'Selesai';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (status === 'loading' || loading) {
    return <Loading />;
  }

  if (!session) {
    return null;
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pesanan Saya</h1>
          <p className="text-sm sm:text-base text-gray-600">Riwayat & status pembayaran</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <ShoppingBag size={48} className="sm:w-16 sm:h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-600 mb-4">Belum ada pesanan</h2>
            <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">Mulai belanja untuk membuat pesanan</p>
            <Link
              href="/"
              className="btn-primary inline-block"
            >
              Belanja Sekarang
            </Link>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-b">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                        <Package className="text-primary-600 flex-shrink-0 mt-1" size={18} />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">Order #{order._id.slice(-8)}</h3>
                          <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1">
                            <Calendar size={14} className="mr-1 flex-shrink-0" />
                            <span className="truncate">{formatDate(order.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0 ml-2 ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <CreditCard size={14} className="flex-shrink-0" />
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.paymentStatus==='paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {order.paymentStatus==='paid' ? 'Sudah Bayar' : 'Belum Bayar'}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm sm:text-base text-gray-900">Rp {order.totalPrice.toLocaleString('id-ID')}</div>
                        {order.paymentProofUrl && <a href={order.paymentProofUrl} target="_blank" className="text-xs text-blue-600 underline">Lihat Bukti</a>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4 sm:p-6">
                  <h4 className="font-medium text-sm sm:text-base text-gray-900 mb-3 sm:mb-4">Item ({order.items.length})</h4>
                  <div className="space-y-3 sm:space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 sm:space-x-4">
                        <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 bg-gray-100 rounded">
                          {item.productId?.imageUrl ? (
                            <Image
                              src={item.productId.imageUrl}
                              alt={item.productId?.name || 'Product'}
                              fill
                              className="object-cover rounded"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package size={20} />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${item.productId?._id || '#'}`}
                            className="text-sm sm:text-base md:text-lg font-medium text-gray-900 hover:text-primary-600 transition-colors block truncate"
                          >
                            {item.productId?.name || 'Produk tidak tersedia'}
                          </Link>
                          <p className="text-xs sm:text-sm text-gray-600">{item.quantity} × Rp {item.price.toLocaleString('id-ID')}</p>
                          {item.deliveryType && (
                            <span className={`inline-block mt-1 text-xs px-2 py-0.5 sm:py-1 rounded-full ${item.deliveryType==='disedekahkan' ? 'bg-yellow-100 text-yellow-800':'bg-green-100 text-green-800'}`}>
                              {item.deliveryType==='disedekahkan' ? '🎁 Disedekahkan' : '🚗 Diambil'}
                            </span>
                          )}
                        </div>
                        
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="font-medium text-sm sm:text-base text-gray-900">Total: <span className="text-primary-600 font-bold">Rp {order.totalPrice.toLocaleString('id-ID')}</span></div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {order.status === 'pending' && order.paymentStatus !== 'paid' && (
                      <button onClick={()=> setConfirmId(order._id)}
                        className="inline-flex items-center px-3 sm:px-4 py-2 rounded-md bg-red-600 text-white text-xs sm:text-sm hover:bg-red-700">
                        <XCircle size={14} className="sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Batalkan
                      </button>
                    )}
                    {order.paymentStatus !== 'paid' && (
                      <button onClick={()=> window.location.href = `/payment-confirmation?orderId=${order._id}`}
                        className="inline-flex items-center px-3 sm:px-4 py-2 rounded-md bg-green-600 text-white text-xs sm:text-sm hover:bg-green-700 whitespace-nowrap">
                        <Upload size={14} className="sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Unggah Bukti
                      </button>
                    )}
                    {order.paymentStatus === 'paid' && (
                      <div className="flex items-center text-green-700 text-xs sm:text-sm"><Check size={14} className="sm:w-4 sm:h-4 mr-1"/> Pembayaran selesai</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && orders.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2 flex-wrap">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm sm:text-base transition-colors"
            >
              ← Previous
            </button>
            
            <div className="flex items-center gap-1 sm:gap-2">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Show first, last, current, and adjacent pages
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base transition-colors ${
                        currentPage === pageNum
                          ? 'bg-green-600 text-white font-semibold'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === currentPage - 2 ||
                  pageNum === currentPage + 2
                ) {
                  return <span key={pageNum} className="px-2">...</span>;
                }
                return null;
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm sm:text-base transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Confirm Cancel Modal */}
    {confirmId && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={()=> setConfirmId(null)}>
        <div className="bg-white rounded-lg p-4 sm:p-6 max-w-sm w-full" onClick={e=> e.stopPropagation()}>
          <h3 className="text-base sm:text-lg font-semibold mb-2">Batalkan Pesanan?</h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-4">Tindakan ini tidak dapat dibatalkan. Pesanan akan ditandai sebagai dibatalkan.</p>
          <div className="flex justify-end gap-2">
            <button onClick={()=> setConfirmId(null)} className="px-3 sm:px-4 py-2 rounded-md border text-xs sm:text-sm">Tutup</button>
            <button onClick={()=> cancelOrder(confirmId!)} className="px-3 sm:px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 text-xs sm:text-sm">Batalkan</button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}
