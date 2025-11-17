'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Minus, Trash2, ShoppingBag, AlertCircle } from 'lucide-react';
import { showToast } from '@/lib/toast';
import Loading from '@/components/Loading';

interface CartItem {
  productId: {
    _id: string;
    name: string;
    price: number;
    imageUrl: string;
    stock: number;
  };
  quantity: number;
  deliveryType?: 'diambil' | 'disedekahkan';
}

interface Cart {
  _id: string;
  items: CartItem[];
}

// Removed guest orders feature as requested

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [tempQuantities, setTempQuantities] = useState<Record<string, number>>({});
  const [showMinQtyModal, setShowMinQtyModal] = useState(false);
  const [invalidItems, setInvalidItems] = useState<CartItem[]>([]);

  const loadUserOrders = useCallback(async ()=>{
    if(!session) return;
    setOrdersLoading(true);
    try {
      const res = await fetch('/api/orders');
      if(res.ok){
        const data = await res.json();
        setUserOrders(data.filter((o:any)=> o.paymentStatus && o.paymentStatus !== 'paid').slice(0,5));
      }
    } catch(e){ /* ignore */ } finally { setOrdersLoading(false); }
  },[session]);

  useEffect(() => {
    if (status === 'loading') return;
    
    // Allow cart access without login - guest cart support
    fetchCart();
    loadUserOrders();
  }, [status]);

  const fetchCart = async () => {
    try {
      if (session) {
        // Authenticated user cart
        const response = await fetch('/api/cart');
        const data = await response.json();
        setCart(data);
        // Initialize temp quantities
        const tempQty: Record<string, number> = {};
        (data.items || []).forEach((item: CartItem) => {
          tempQty[item.productId._id] = item.quantity;
        });
        setTempQuantities(tempQty);
      } else {
        // Guest cart from localStorage
        const guestCart = localStorage.getItem('guestCart');
        if (guestCart) {
          const parsed = JSON.parse(guestCart);
          setCart(parsed);
          // Initialize temp quantities
          const tempQty: Record<string, number> = {};
          (parsed.items || []).forEach((item: CartItem) => {
            tempQty[item.productId._id] = item.quantity;
          });
          setTempQuantities(tempQty);
        } else {
          setCart({ _id: 'guest', items: [] });
        }
      }
    } catch (error) {
      console.error('Error mengambil keranjang:', error);
      // Fallback to guest cart
      const guestCart = localStorage.getItem('guestCart');
      if (guestCart) {
        const parsed = JSON.parse(guestCart);
        setCart(parsed);
        const tempQty: Record<string, number> = {};
        (parsed.items || []).forEach((item: CartItem) => {
          tempQty[item.productId._id] = item.quantity;
        });
        setTempQuantities(tempQty);
      } else {
        setCart({ _id: 'guest', items: [] });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    // Allow any positive number, validation happens at checkout
    if (isNaN(newQuantity) || newQuantity < 1) return;

    setUpdating(productId);
    try {
      if (session) {
        // Authenticated user - update in database
        const response = await fetch(`/api/cart/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity: newQuantity }),
        });

        if (response.ok) {
          const updatedCart = await response.json();
          setCart(updatedCart);
          setTempQuantities(prev => ({ ...prev, [productId]: newQuantity }));
          // Trigger event untuk update badge
          window.dispatchEvent(new Event('cartUpdated'));
        } else { showToast('Gagal mengubah jumlah item.', 'error'); }
      } else {
        // Guest user - update in localStorage
        const guestCart = localStorage.getItem('guestCart');
        if (guestCart) {
          const cartData = JSON.parse(guestCart);
          const itemIndex = cartData.items.findIndex((item: CartItem) => item.productId._id === productId);
          if (itemIndex !== -1) {
            cartData.items[itemIndex].quantity = newQuantity;
            localStorage.setItem('guestCart', JSON.stringify(cartData));
            setCart(cartData);
            setTempQuantities(prev => ({ ...prev, [productId]: newQuantity }));
            // Trigger event untuk update badge
            window.dispatchEvent(new Event('cartUpdated'));
          }
        }
      }
    } catch (error) {
      console.error('Error mengubah jumlah:', error);
      showToast('Terjadi kesalahan saat mengubah jumlah.', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (productId: string) => {
    setUpdating(productId);
    try {
      if (session) {
        // Authenticated user - remove from database
        const response = await fetch(`/api/cart/${productId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          const updatedCart = await response.json();
          setCart(updatedCart);
          // Trigger event untuk update badge
          window.dispatchEvent(new Event('cartUpdated'));
        } else { showToast('Gagal menghapus item.', 'error'); }
      } else {
        // Guest user - remove from localStorage
        const guestCart = localStorage.getItem('guestCart');
        if (guestCart) {
          const cartData = JSON.parse(guestCart);
          cartData.items = cartData.items.filter((item: CartItem) => item.productId._id !== productId);
          localStorage.setItem('guestCart', JSON.stringify(cartData));
          setCart(cartData);
          // Trigger event untuk update badge
          window.dispatchEvent(new Event('cartUpdated'));
        }
      }
    } catch (error) {
      console.error('Error menghapus item:', error);
      showToast('Terjadi kesalahan saat menghapus item.', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const updateDeliveryType = async (productId: string, deliveryType: 'diambil' | 'disedekahkan') => {
    setUpdating(productId);
    try {
      if (session) {
        // Authenticated user - update in database
        const response = await fetch(`/api/cart/${productId}/delivery`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ deliveryType }),
        });

        if (response.ok) {
          const updatedCart = await response.json();
          setCart(updatedCart);
        } else { showToast('Gagal mengubah tipe pengiriman.', 'error'); }
      } else {
        // Guest user - update in localStorage
        const guestCart = localStorage.getItem('guestCart');
        if (guestCart) {
          const cartData = JSON.parse(guestCart);
          const itemIndex = cartData.items.findIndex((item: CartItem) => item.productId._id === productId);
          if (itemIndex !== -1) {
            cartData.items[itemIndex].deliveryType = deliveryType;
            localStorage.setItem('guestCart', JSON.stringify(cartData));
            setCart(cartData);
          }
        }
      }
    } catch (error) {
      console.error('Error mengubah tipe pengiriman:', error);
      showToast('Terjadi kesalahan saat mengubah tipe pengiriman.', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const getTotalPrice = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => {
      return total + (item.productId.price * item.quantity);
    }, 0);
  };

  const getTotalItems = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const validateCart = () => {
    if (!cart?.items || cart.items.length === 0) {
      showToast('Keranjang Anda kosong', 'error');
      return false;
    }

    const itemsBelow5kg = cart.items.filter(item => item.quantity < 5);
    if (itemsBelow5kg.length > 0) {
      setInvalidItems(itemsBelow5kg);
      setShowMinQtyModal(true);
      return false;
    }

    return true;
  };

  const handleCheckout = () => {
    if (validateCart()) {
      router.push('/checkout');
    }
  };

  const fixMinimumQuantity = async (productId: string) => {
    await updateQuantity(productId, 5);
    // Refresh invalid items
    const remaining = invalidItems.filter(item => item.productId._id !== productId);
    setInvalidItems(remaining);
    if (remaining.length === 0) {
      setShowMinQtyModal(false);
    }
  };

  if (status === 'loading' || loading) {
    return <Loading />;
  }



  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  return (
    <>
      {/* Minimum Quantity Modal */}
      {showMinQtyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle size={24} className="text-yellow-600" />
                  <h2 className="text-xl font-bold text-gray-900">Minimal Pembelian 5kg</h2>
                </div>
                <button
                  onClick={() => setShowMinQtyModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Beberapa item di keranjang Anda belum mencapai minimal pembelian 5kg per item:
              </p>

              <div className="space-y-3 mb-6">
                {invalidItems.map((item) => (
                  <div key={item.productId._id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.productId.name}</h3>
                        <p className="text-sm text-yellow-700 mt-1">
                          Saat ini: {item.quantity}kg (kurang {5 - item.quantity}kg)
                        </p>
                      </div>
                      <button
                        onClick={() => fixMinimumQuantity(item.productId._id)}
                        disabled={updating === item.productId._id}
                        className="btn-primary text-sm px-3 py-1 whitespace-nowrap disabled:opacity-50"
                      >
                        {updating === item.productId._id ? 'Loading...' : 'Set 5kg'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowMinQtyModal(false)}
                  className="flex-1 btn-secondary py-2"
                >
                  Edit Manual
                </button>
                <button
                  onClick={() => {
                    invalidItems.forEach(item => fixMinimumQuantity(item.productId._id));
                  }}
                  disabled={updating !== null}
                  className="flex-1 btn-primary py-2 disabled:opacity-50"
                >
                  Perbaiki Semua
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-green-800">🛒 Keranjang Belanja</h1>
            
          </div>

          {!cart?.items || cart.items.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <ShoppingBag size={48} className="sm:w-16 sm:h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-600 mb-4">Keranjang Anda Kosong</h2>
            <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">Mulai berbelanja untuk menambahkan item ke keranjang</p>
            <Link
              href="/"
              className="btn-primary inline-block px-6 py-3"
            >
              Lanjut Berbelanja
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4">Item Keranjang</h2>
                  
                  <div className="space-y-4">
                    {cart.items.map((item) => {
                      const hasMinQtyWarning = (tempQuantities[item.productId._id] || item.quantity) < 5;
                      return (
                      <div key={item.productId._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          {/* Image */}
                          <div className="relative w-20 h-20 sm:w-16 sm:h-16 flex-shrink-0">
                            <Image
                              src={item.productId.imageUrl}
                              alt={item.productId.name}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                          
                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/products/${item.productId._id}`}
                              className="text-base sm:text-lg font-medium text-gray-900 hover:text-primary-600 transition-colors block"
                            >
                              {item.productId.name}
                            </Link>
                            <p className="text-sm sm:text-base text-gray-600">Rp {item.productId.price.toLocaleString('id-ID')}/kg</p>
                            <p className="text-xs sm:text-sm text-gray-500">Stok: {item.productId.stock} kg</p>
                          </div>
                          
                          {/* Delete Button - Desktop */}
                          <div className="hidden sm:block">
                            <button
                              onClick={() => removeItem(item.productId._id)}
                              disabled={updating === item.productId._id}
                              className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed p-2"
                              title="Hapus item"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>

                        {/* Controls Row */}
                        <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const newQty = item.quantity - 1;
                                if (newQty >= 1) {
                                  setTempQuantities(prev => ({ ...prev, [item.productId._id]: newQty }));
                                  updateQuantity(item.productId._id, newQty);
                                }
                              }}
                              disabled={updating === item.productId._id || item.quantity <= 1}
                              className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus size={18} />
                            </button>

                            <input
                              type="number"
                              min={1}
                              step={1}
                              className="w-16 sm:w-20 text-center font-medium border rounded px-2 py-2 text-base"
                              value={tempQuantities[item.productId._id] ?? item.quantity}
                              onChange={(e)=>{
                                const n = parseInt(e.target.value, 10);
                                if (!isNaN(n) && n >= 1) {
                                  setTempQuantities(prev => ({ ...prev, [item.productId._id]: n }));
                                }
                              }}
                              onBlur={(e)=>{
                                const n = parseInt(e.target.value, 10);
                                if (!isNaN(n) && n >= 1) {
                                  updateQuantity(item.productId._id, n);
                                } else {
                                  setTempQuantities(prev => ({ ...prev, [item.productId._id]: item.quantity }));
                                }
                              }}
                            />

                            <button
                              onClick={() => {
                                const newQty = item.quantity + 1;
                                if (newQty <= item.productId.stock) {
                                  setTempQuantities(prev => ({ ...prev, [item.productId._id]: newQty }));
                                  updateQuantity(item.productId._id, newQty);
                                }
                              }}
                              disabled={updating === item.productId._id || item.quantity >= item.productId.stock}
                              className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus size={18} />
                            </button>
                            <span className="text-sm text-gray-600 ml-1">kg</span>
                          </div>
                          
                          {/* Delivery Type Dropdown */}
                          <div className="flex-1 sm:max-w-[200px]">
                            <select
                              value={item.deliveryType || 'diambil'}
                              onChange={(e) => updateDeliveryType(item.productId._id, e.target.value as 'diambil' | 'disedekahkan')}
                              disabled={updating === item.productId._id}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
                            >
                              <option value="diambil">🚗 Diambil</option>
                              <option value="disedekahkan">🎁 Disedekahkan</option>
                            </select>
                          </div>

                          {/* Price & Delete Mobile */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 flex-1">
                            <p className="text-base sm:text-lg font-semibold text-green-700">
                              Rp {(item.productId.price * item.quantity).toLocaleString('id-ID')}
                            </p>
                            <button
                              onClick={() => removeItem(item.productId._id)}
                              disabled={updating === item.productId._id}
                              className="sm:hidden text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed p-2"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>

                        {/* Min Quantity Warning */}
                        {hasMinQtyWarning && (
                          <div className="mt-3 flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-md p-2">
                            <AlertCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-yellow-800">
                              Minimal pembelian 5kg per item
                            </p>
                          </div>
                        )}
                      </div>
                    )})}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sticky top-4 sm:top-8">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">Ringkasan Pesanan</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Subtotal ({totalItems} item)</span>
                    <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
                  </div>
                  
                
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold text-base sm:text-lg">
                      <span>Total</span>
                      <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleCheckout}
                  className="w-full btn-primary mt-6 block text-center text-sm sm:text-base py-3"
                >
                  Lanjut ke Pembayaran
                </button>
                
                <Link
                  href="/"
                  className="w-full btn-secondary mt-3 block text-center text-sm sm:text-base py-3"
                >
                  Lanjut Berbelanja
                </Link>
                
                {/* Pending Orders Section */}
                <div className="mt-6 sm:mt-8 border-t pt-4 sm:pt-6 space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold flex items-center justify-between">
                    Konfirmasi Pembayaran
                    <button onClick={()=>{loadUserOrders();}} className="text-xs px-2 py-1 border rounded hover:bg-green-50">
                      ↻ Refresh
                    </button>
                  </h3>
                  {/* Authenticated User Orders */}
                  {session && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2 flex justify-between">
                        Pesanan Belum Lunas {ordersLoading && <span className='animate-pulse'>...</span>}
                      </p>
                      {userOrders.length === 0 ? (
                        <p className="text-xs text-gray-400">Tidak ada</p>
                      ) : (
                        <ul className="space-y-2 max-h-60 overflow-auto pr-1">
                          {userOrders.map(o => (
                            <li key={o._id} className={`text-xs flex flex-wrap sm:flex-nowrap justify-between items-center gap-2 border rounded p-2 ${o.paymentStatus!=='paid' ? 'bg-yellow-50 border-yellow-300' : 'bg-green-50 border-green-200'}`}>
                              <span className="font-mono truncate max-w-[70px]">{o._id.slice(-8)}</span>
                              <span className={`capitalize ${o.paymentStatus==='paid' ? 'text-green-600':'text-yellow-700'}`}>
                                {o.paymentStatus}
                              </span>
                              <span className="whitespace-nowrap">Rp {o.totalPrice.toLocaleString('id-ID')}</span>
                              <button
                                onClick={()=> router.push(`/payment-confirmation?orderId=${o._id}`)}
                                className="text-green-600 underline whitespace-nowrap"
                              >
                                Bayar
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
}
