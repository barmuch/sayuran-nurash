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
    const { status } = body as { status?: string }
    const allowed = ['pending','confirmed','cancelled']
    if (!status || !allowed.includes(status)) {
      return NextResponse.json({ message: 'Status tidak valid' }, { status: 400 })
    }
    await connectToDB()
    const order = await Order.findById(params.id)
    if (!order) return NextResponse.json({ message: 'Order tidak ditemukan' }, { status: 404 })
    order.status = status as any
    await order.save()
    return NextResponse.json(order)
  } catch (e) {
    console.error('Update order status error', e)
    return NextResponse.json({ message: 'Gagal memperbarui status order' }, { status: 500 })
  }
}
