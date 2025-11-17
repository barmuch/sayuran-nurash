import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDB } from '@/lib/database';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDB();
    const session = await getServerSession(authOptions);
    const order = await Order.findById(params.id).populate('items.productId', 'name imageUrl price');
    if(!order) return NextResponse.json({ message: 'Order tidak ditemukan' }, { status:404 });

    if(order.userId){
      // Authenticated order: must be owner or admin
      if(!session) return NextResponse.json({ message:'Unauthorized' }, { status:401 });
      if(session.user.role !== 'admin' && session.user.id !== order.userId.toString()) {
        return NextResponse.json({ message:'Forbidden' }, { status:403 });
      }
    }
    return NextResponse.json(order);
  } catch (e) {
    console.error('Get order error', e);
    return NextResponse.json({ message: 'Gagal mengambil order' }, { status:500 });
  }
}
