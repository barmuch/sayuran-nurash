import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { connectToDB } from '@/lib/database'
import Order from '@/models/Order'

export const dynamic = 'force-dynamic'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    await connectToDB()
    const order = await Order.findById(params.id)
    if (!order) return NextResponse.json({ message: 'Order tidak ditemukan' }, { status: 404 })
    // Only owner or admin
    const isOwner = order.userId && order.userId.toString() === session.user.id
    const isAdmin = session.user.role === 'admin'
    if (!isOwner && !isAdmin) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    if (order.paymentStatus === 'paid') {
      return NextResponse.json({ message: 'Pesanan sudah dibayar dan tidak dapat dibatalkan.' }, { status: 400 })
    }
    if (order.status !== 'pending') {
      return NextResponse.json({ message: 'Pesanan tidak dalam status yang dapat dibatalkan.' }, { status: 400 })
    }

    order.status = 'cancelled'
    await order.save()
    return NextResponse.json(order)
  } catch (e) {
    console.error('Cancel order error', e)
    return NextResponse.json({ message: 'Gagal membatalkan pesanan' }, { status: 500 })
  }
}
