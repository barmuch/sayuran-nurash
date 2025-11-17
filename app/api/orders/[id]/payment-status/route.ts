import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { connectToDB } from '@/lib/database'
import Order from '@/models/Order'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const body = await req.json().catch(()=>({}))
    const { paymentStatus } = body as { paymentStatus?: 'pending' | 'paid' | 'refunded' }
    if (!paymentStatus || !['pending','paid','refunded'].includes(paymentStatus)) {
      return NextResponse.json({ message: 'Status pembayaran tidak valid' }, { status: 400 })
    }
    await connectToDB()
    const order = await Order.findById(params.id)
    if (!order) return NextResponse.json({ message: 'Order tidak ditemukan' }, { status: 404 })
    // Do not allow change if already cancelled
    if (order.status === 'cancelled') {
      return NextResponse.json({ message: 'Pesanan dibatalkan, tidak dapat ubah pembayaran.' }, { status: 400 })
    }
    order.paymentStatus = paymentStatus
    await order.save()
    return NextResponse.json(order)
  } catch (e) {
    console.error('Update payment status error', e)
    return NextResponse.json({ message: 'Gagal memperbarui status pembayaran' }, { status: 500 })
  }
}
