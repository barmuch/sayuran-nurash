import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectToDB } from '@/lib/database';
import Order from '@/models/Order';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDB();

    let orders;

    if (session.user.role === 'admin') {
      // Admin can see all orders
      orders = await Order.find({})
        .populate('userId', 'username email')
        .populate('items.productId', 'name price')
        .sort({ createdAt: -1 });
    } else {
      // Users can only see their own orders
      orders = await Order.find({ userId: session.user.id })
        .populate('items.productId', 'name price')
        .sort({ createdAt: -1 });
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
