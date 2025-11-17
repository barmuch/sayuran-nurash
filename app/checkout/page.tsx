"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CreditCard, User } from 'lucide-react';
import Loading from '@/components/Loading';

// ---- Types ----
interface CartItem { productId: { _id: string; name: string; price: number; imageUrl: string; stock: number; }; quantity: number; deliveryType?: 'diambil' | 'disedekahkan'; }
interface Cart { _id: string; items: CartItem[]; }
interface OrderData { customerName: string; phoneNumber: string; address: string; notes: string; }

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderData, setOrderData] = useState<OrderData>({ customerName: '', phoneNumber: '', address: '', notes: '' });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [hasSavedProfile, setHasSavedProfile] = useState(false);
  const [useSavedProfile, setUseSavedProfile] = useState(true);

  // Fetch cart (auth or guest)
  useEffect(() => { if (status !== 'loading') { fetchCart(); loadSavedProfile(); } }, [status]);

  const fetchCart = async () => {
    try {
      if (session) {
        const res = await fetch('/api/cart');
        const data = await res.json();
        setCart(data);
      } else {
        const guest = localStorage.getItem('guestCart');
        setCart(guest ? JSON.parse(guest) : { _id: 'guest', items: [] });
      }
    } catch (e) {
      console.error('Fetch cart error', e);
      const guest = typeof window !== 'undefined' ? localStorage.getItem('guestCart') : null;
      setCart(guest ? JSON.parse(guest) : { _id: 'guest', items: [] });
    } finally { setLoading(false); }
  };

  const loadSavedProfile = () => {
    try {
      if (!session?.user?.id) return;
      const key = `checkoutProfile:${session.user.id}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        const saved = JSON.parse(raw) as OrderData;
        setOrderData(saved);
        setHasSavedProfile(true);
        setUseSavedProfile(true);
      }
    } catch (e) {
      // ignore
    }
  };

  // Derived totals
  const totalPrice = cart?.items.reduce((t,i)=> t + i.productId.price * i.quantity, 0) || 0;
  const totalItems = cart?.items.reduce((t,i)=> t + i.quantity, 0) || 0;

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    const { name, value } = e.target; setOrderData(p => ({...p, [name]: value }));
  };

  const validate = () => {
    if (!cart?.items.length) { setErrorMsg('Keranjang kosong.'); return false; }
    if (!orderData.customerName || !orderData.phoneNumber || !orderData.address) { setErrorMsg('Mohon lengkapi semua field bertanda *.'); return false; }
    if (!/^0\d{8,13}$/.test(orderData.phoneNumber)) { setErrorMsg('Nomor telepon tidak valid.'); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null); setSuccessMsg(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = { items: cart!.items, customerInfo: orderData, totalPrice, isGuest: !session };
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        const order = await res.json();
        if (session) {
          await fetch('/api/cart', { method: 'DELETE' });
          // Simpan profil checkout untuk user login
          try {
            if (session.user?.id) {
              const key = `checkoutProfile:${session.user.id}`;
              localStorage.setItem(key, JSON.stringify(orderData));
            }
          } catch (e) { /* ignore */ }
        } else {
          // Remove guest cart then persist guest order reference for later access
            localStorage.removeItem('guestCart');
            // Tidak lagi menyimpan daftar pesanan guest
        }
        
        // Trigger event untuk update badge cart dan orders
        window.dispatchEvent(new Event('cartUpdated'));
        window.dispatchEvent(new Event('ordersUpdated'));
        
        router.push(`/payment-confirmation?orderId=${order._id}`);
      } else { const err = await res.json(); setErrorMsg(err.message || 'Gagal membuat pesanan.'); }
    } catch (e) { console.error(e); setErrorMsg('Terjadi kesalahan internal.'); }
    finally { setSubmitting(false); }
  };

  // UI states
  if (loading) return <Loading />;
  if (!cart?.items.length) return (
    <div className="min-h-screen bg-gray-50 py-8"><div className="max-w-4xl mx-auto px-4"><div className="text-center py-16"><h1 className="text-3xl font-bold mb-4">Keranjang Kosong</h1><p className="text-gray-600 mb-8">Tambahkan produk ke keranjang sebelum checkout</p><Link href="/" className="text-white bg-green-600 hover:bg-green-700 px-6 py-3 rounded-md font-semibold">Mulai Belanja</Link></div></div></div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6 sm:mb-8">
          <Link href="/cart" className="inline-flex items-center text-green-600 hover:text-green-800 mb-3 sm:mb-4 text-sm sm:text-base">
            <ArrowLeft size={18} className="mr-2"/>Kembali ke Keranjang
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-green-800">Checkout</h1>
          <p className="text-sm sm:text-base text-green-600">Lengkapi informasi di bawah untuk menyelesaikan pesanan Anda</p>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
                <User className="mr-2 text-green-600" size={20}/>Informasi Pelanggan
              </h2>
              {session && hasSavedProfile && (
                <div className="mb-4 text-xs sm:text-sm flex items-start sm:items-center gap-3 p-3 rounded border border-green-200 bg-green-50">
                  <input id="useSaved" type="checkbox" className="h-4 w-4 mt-0.5 sm:mt-0 flex-shrink-0" checked={useSavedProfile} onChange={(e)=> setUseSavedProfile(e.target.checked)} />
                  <label htmlFor="useSaved">Gunakan data tersimpan untuk checkout berikutnya</label>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nama Lengkap *</label>
                  <input 
                    name="customerName" 
                    value={orderData.customerName} 
                    onChange={handleInputChange} 
                    required 
                    disabled={Boolean(session) && hasSavedProfile && useSavedProfile} 
                    className="w-full px-3 py-2 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100" 
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nomor Telepon *</label>
                  <input 
                    name="phoneNumber" 
                    type="tel"
                    value={orderData.phoneNumber} 
                    onChange={handleInputChange} 
                    required 
                    disabled={Boolean(session) && hasSavedProfile && useSavedProfile} 
                    className="w-full px-3 py-2 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100" 
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Alamat Lengkap *</label>
                  <textarea 
                    name="address" 
                    value={orderData.address} 
                    onChange={handleInputChange} 
                    required 
                    disabled={Boolean(session) && hasSavedProfile && useSavedProfile} 
                    rows={3} 
                    className="w-full px-3 py-2 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100" 
                    placeholder="Jalan, Kelurahan, Kecamatan, Kota, Kode Pos"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Catatan Tambahan</label>
                  <textarea 
                    name="notes" 
                    value={orderData.notes} 
                    onChange={handleInputChange} 
                    rows={2} 
                    disabled={Boolean(session) && hasSavedProfile && useSavedProfile} 
                    className="w-full px-3 py-2 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100" 
                    placeholder="pesan, instruksi khusus, dll (opsional)"
                  />
                </div>
              </div>
            </div>
            
          </div>
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:sticky lg:top-4">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Ringkasan Pesanan</h2>
              <div className="space-y-3 mb-6 max-h-[300px] sm:max-h-[380px] overflow-auto pr-1">
                {cart!.items.map(item => (
                  <div key={item.productId._id} className="flex items-start sm:items-center gap-3 p-3 border border-gray-200 rounded-lg">
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0">
                      <Image src={item.productId.imageUrl} alt={item.productId.name} fill className="object-cover rounded" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-xs sm:text-sm truncate">{item.productId.name}</h3>
                      <p className="text-xs text-gray-600">{item.quantity} kg × Rp {item.productId.price.toLocaleString('id-ID')}</p>
                      <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${item.deliveryType === 'disedekahkan' ? 'bg-yellow-100 text-yellow-800':'bg-green-100 text-green-800'}`}>
                        {item.deliveryType === 'disedekahkan' ? '🎁 Disedekahkan' : '🚗 Diambil'}
                      </span>
                    </div>
                    <p className="font-semibold text-xs sm:text-sm whitespace-nowrap">Rp {(item.productId.price * item.quantity).toLocaleString('id-ID')}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3 border-t pt-4 text-xs sm:text-sm">
                <div className="flex justify-between"><span>Subtotal ({totalItems} item)</span><span>Rp {totalPrice.toLocaleString('id-ID')}</span></div>
                <div className="border-t pt-3 text-sm sm:text-base font-semibold flex justify-between"><span>Total</span><span className="text-green-600">Rp {totalPrice.toLocaleString('id-ID')}</span></div>
              </div>
              {errorMsg && <p className="mt-4 text-xs sm:text-sm text-red-600">{errorMsg}</p>}
              {successMsg && <p className="mt-4 text-xs sm:text-sm text-green-600">{successMsg}</p>}
              <button type="submit" disabled={submitting} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 text-sm sm:text-base rounded-md mt-6 disabled:opacity-50 disabled:cursor-not-allowed transition">
                {submitting ? 'Memproses...' : 'Buat Pesanan'}
              </button>
              <p className="text-xs text-gray-500 mt-3 text-center">Dengan menekan "Buat Pesanan", Anda menyetujui untuk melakukan pembayaran sesuai total di atas.</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}