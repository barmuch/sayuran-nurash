'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import { Copy } from 'lucide-react';
import Loading from '@/components/Loading';

interface OrderItem { productId: { _id: string; name: string; imageUrl: string }; quantity: number; price: number; deliveryType?: string; }
interface Order { _id: string; items: OrderItem[]; totalPrice: number; paymentStatus: string; paymentMethod?: string; paymentProofUrl?: string; customerName?: string; phoneNumber?: string; }

function PaymentConfirmationContent(){
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get('orderId');
  const token = params.get('token');
  const [otherGuestOrders, setOtherGuestOrders] = useState<Array<{orderId:string; token:string; paymentStatus:string; totalPrice:number}>>([]);
  const [order, setOrder] = useState<Order|null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File|null>(null);
  const [message, setMessage] = useState<string>('');
  const [copied, setCopied] = useState<string>('');

  useEffect(()=>{ if(orderId) fetchOrder(); loadGuestOrders(); },[orderId]);

  const loadGuestOrders = () => {
    try {
      const raw = localStorage.getItem('guestOrders');
      if(!raw) return;
      const arr = JSON.parse(raw) as any[];
      const filtered = arr.filter(o=> o.orderId !== orderId);
      setOtherGuestOrders(filtered.slice(0,5));
    } catch(e){ /* ignore */ }
  };

  const fetchOrder = async () => {
    try {
  const query = token ? `?token=${token}` : '';
  const res = await fetch(`/api/orders/${orderId}${query}`);
      if(res.ok){ const data = await res.json(); setOrder(data); } else { setMessage('Order tidak ditemukan'); }
    } catch(e){ console.error(e); setMessage('Gagal mengambil data order'); }
    finally { setLoading(false); }
  };

  const handleUpload = async () => {
    if(!file || !orderId) return;
    setUploading(true); setMessage('');
    try {
      const formData = new FormData();
      formData.append('file', file);
  const query = token ? `?token=${token}` : '';
  const res = await fetch(`/api/orders/${orderId}/upload-proof${query}`, { method:'POST', body: formData });
      if(res.ok){ 
        setMessage('Bukti pembayaran berhasil diupload. Terima kasih!'); 
        fetchOrder();
        // Trigger event untuk update badge orders
        window.dispatchEvent(new Event('ordersUpdated'));
      }
      else { const err = await res.json(); setMessage(err.message || 'Upload gagal'); }
    } catch(e){ console.error(e); setMessage('Terjadi kesalahan saat upload'); }
    finally { setUploading(false); }
  };

  if(loading) return <Loading />;
  if(!order) return <div className='min-h-screen flex items-center justify-center'>{message || 'Order tidak ditemukan'}</div>;

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-3xl mx-auto px-4'>
        <h1 className='text-2xl font-bold mb-2'>Konfirmasi Pembayaran</h1>

        <div className='bg-white rounded-lg shadow p-6 mb-6'>
          <h2 className='font-semibold mb-3'>Info Order</h2>
          <p className='text-sm mb-1'>ID: <span className='font-mono'>{order._id}</span></p>
          <p className='text-sm mb-1'>Nama: {order.customerName}</p>
          <p className='text-sm mb-1'>Telepon: {order.phoneNumber}</p>
          <p className='text-sm mb-1'>Status Pembayaran: <span className='font-semibold'>{order.paymentStatus}</span></p>
          <p className='text-sm mb-3'>Total: <span className='font-semibold'>Rp {order.totalPrice.toLocaleString('id-ID')}</span></p>
          <div className='space-y-2 max-h-56 overflow-auto pr-2'>
            {order.items.map(it => (
              <div key={it.productId._id} className='flex items-center gap-3 border p-2 rounded'>
                <div className='relative w-12 h-12'>
                  <Image src={it.productId.imageUrl} alt={it.productId.name} fill className='object-cover rounded'/>
                </div>
                <div className='flex-1'>
                  <p className='text-sm font-medium'>{it.productId.name}</p>
                  <p className='text-xs text-gray-600'>{it.quantity} x Rp {it.price.toLocaleString('id-ID')}</p>
                </div>
                <p className='text-sm font-semibold'>Rp {(it.price * it.quantity).toLocaleString('id-ID')}</p>
              </div>
            ))}
          </div>
        </div>

        <div className='bg-white rounded-lg shadow p-6 mb-6'>
          <h2 className='font-semibold mb-3'>Informasi Pembayaran</h2>
          <div className='bg-green-50 border border-green-200 p-4 rounded text-sm'>
            <p className='font-medium text-green-900 mb-2'>a.n Yayasan Nurul Ashri Deresan Yogyakarta</p>
            <ul className='space-y-2'>
              {[
                { bank: 'BNI', number: '6650000653' },
                { bank: 'BSI', number: '3300999098' },
                { bank: 'BRI', number: '216401000231302' },
              ].map((acc) => (
                <li key={acc.bank} className='flex items-center justify-between bg-white border border-green-100 rounded px-3 py-2'>
                  <div>
                    <span className='font-semibold mr-2'>{acc.bank}:</span>
                    <span className='font-mono tracking-wide'>{acc.number}</span>
                  </div>
                  <button
                    type='button'
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(acc.number);
                        setCopied(`Nomor ${acc.bank} disalin`);
                        setTimeout(() => setCopied(''), 1800);
                      } catch (e) {
                        setCopied('Gagal menyalin');
                        setTimeout(() => setCopied(''), 1800);
                      }
                    }}
                    className='inline-flex items-center gap-1 text-green-700 hover:text-green-800 px-2 py-1 border border-green-200 rounded'
                    aria-label={`Salin nomor ${acc.bank}`}
                    title={`Salin nomor ${acc.bank}`}
                  >
                    <Copy size={16} />
                    <span className='text-xs'>Copy</span>
                  </button>
                </li>
              ))}
            </ul>
            {copied && <p className='text-xs text-green-700 mt-2'>{copied}</p>}
          </div>
          <p className='text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2 mt-3'>Setelah transfer, upload bukti pembayaran di bawah untuk mempercepat verifikasi.</p>
        </div>

        {/* Lokasi & Maps dipindahkan ke homepage */}

  <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='font-semibold mb-3'>Upload Bukti Pembayaran</h2>
          {order.paymentProofUrl && (
            <div className='mb-4'>
              <p className='text-sm text-green-700 mb-2'>Bukti sudah diupload:</p>
              <a className='text-blue-600 underline' target='_blank' href={order.paymentProofUrl}>Lihat Bukti</a>
            </div>
          )}
          <input type='file' accept='image/*,.pdf' onChange={e=> setFile(e.target.files?.[0] || null)} className='mb-3'/>
          <button onClick={handleUpload} disabled={!file || uploading} className='btn-primary disabled:opacity-50'>{uploading ? 'Mengupload...' : 'Upload Bukti'}</button>
          {message && <p className='text-sm mt-3'>{message}</p>}
        </div>

        {otherGuestOrders.length > 0 && (
          <div className='bg-white rounded-lg shadow p-6 mt-6'>
            <h2 className='font-semibold mb-3 text-sm'>Pesanan Lain (Guest) Yang Perlu Konfirmasi</h2>
            <ul className='space-y-2 text-xs'>
              {otherGuestOrders.map(o => (
                <li key={o.orderId} className='flex justify-between items-center border p-2 rounded'>
                  <span className='font-mono truncate max-w-[140px]'>{o.orderId.slice(-8)}</span>
                  <span className=''>{o.paymentStatus}</span>
                  <span>Rp {o.totalPrice.toLocaleString('id-ID')}</span>
                  <button className='text-green-600 underline'
                    onClick={()=> router.push(`/payment-confirmation?orderId=${o.orderId}&token=${o.token}`)}>Buka</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentConfirmationPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PaymentConfirmationContent />
    </Suspense>
  );
}
