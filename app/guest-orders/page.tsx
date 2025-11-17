"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface GuestOrderRef { orderId:string; token:string; createdAt:number; totalPrice:number; paymentStatus:string; }

export default function GuestOrdersPage(){
  const [orders,setOrders] = useState<GuestOrderRef[]>([]);
  const router = useRouter();

  useEffect(()=>{
    try {
      const raw = localStorage.getItem('guestOrders');
      if(raw){
        const arr = JSON.parse(raw) as GuestOrderRef[];
        setOrders(arr);
      }
    } catch(e){ /* ignore */ }
  },[]);

  const clear = () => { if(confirm('Hapus riwayat pesanan guest ini?')) { localStorage.removeItem('guestOrders'); setOrders([]); } };

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Pesanan Guest Saya</h1>
      <p className="text-sm text-gray-600 mb-6">Daftar pesanan yang dibuat tanpa login di perangkat ini. Simpan halaman ini atau lanjutkan konfirmasi pembayaran.</p>
      {orders.length === 0 && <p className="text-gray-500">Belum ada pesanan guest tersimpan.</p>}
      {orders.length > 0 && (
        <>
          <button onClick={clear} className="text-xs text-red-600 underline mb-4">Hapus Riwayat</button>
          <div className="space-y-3">
            {orders.map(o => (
              <div key={o.orderId} className="border rounded p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm font-mono">ID: {o.orderId}</p>
                  <p className="text-xs text-gray-500">Tanggal: {new Date(o.createdAt).toLocaleString('id-ID')}</p>
                  <p className="text-xs">Status: <span className="font-medium">{o.paymentStatus}</span></p>
                </div>
                <div className="text-sm font-semibold">Rp {o.totalPrice.toLocaleString('id-ID')}</div>
                <div>
                  <button onClick={()=> router.push(`/payment-confirmation?orderId=${o.orderId}&token=${o.token}`)} className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded">Lanjutkan</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}