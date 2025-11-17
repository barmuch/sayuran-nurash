import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDB } from '@/lib/database';
import Cart from '@/models/Cart';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deliveryType } = await request.json();
    if (!['diambil','disedekahkan'].includes(deliveryType)) {
      return NextResponse.json({ error: 'deliveryType invalid' }, { status: 400 });
    }

    await connectToDB();
    const cart = await Cart.findOne({ userId: session.user.id });
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }
    const itemIndex = cart.items.findIndex((it: any) => it.productId.toString() === params.id);
    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    cart.items[itemIndex].deliveryType = deliveryType;
    await cart.save();
    const populated = await Cart.findById(cart._id).populate('items.productId');
    return NextResponse.json(populated);
  } catch (e) {
    console.error('Update deliveryType error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}