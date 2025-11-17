import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDB } from '@/lib/database';
import Order from '@/models/Order';
import Product from '@/models/Product';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

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

// Create (guest or authenticated) order
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
  const { items, customerInfo, totalPrice, isGuest, paymentMethod } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: 'Items tidak boleh kosong' }, { status: 400 });
    }

    // Basic validation customer info (for guest)
    if (!session) {
      if (!customerInfo?.customerName || !customerInfo?.phoneNumber || !customerInfo?.address) {
        return NextResponse.json({ message: 'Data pelanggan wajib diisi' }, { status: 400 });
      }
    }

    await connectToDB();

    // Recalculate total & map items
    let calcTotal = 0;
    const orderItems = [] as any[];
    for (const item of items) {
      if (!item.productId?._id || !item.quantity) {
        return NextResponse.json({ message: 'Format item tidak valid' }, { status: 400 });
      }
      const product = await Product.findById(item.productId._id);
      if (!product) {
        return NextResponse.json({ message: `Produk dengan id ${item.productId._id} tidak ditemukan` }, { status: 404 });
      }
      const lineTotal = product.price * item.quantity;
      calcTotal += lineTotal;
      orderItems.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price,
        deliveryType: item.deliveryType || 'diambil',
      });
    }

    // Optional: compare with client totalPrice
    if (totalPrice && Math.abs(totalPrice - calcTotal) > 1) {
      // If mismatch more than 1 (rounding tolerance) override internal
      console.warn('Client total mismatch, using server calculated total');
    }

    const order = await Order.create({
      userId: session ? session.user.id : undefined,
      items: orderItems,
      totalPrice: calcTotal,
      customerName: customerInfo?.customerName,
      phoneNumber: customerInfo?.phoneNumber,
      address: customerInfo?.address,
      notes: customerInfo?.notes,
      isGuest: !session || isGuest,
      paymentStatus: 'pending',
      paymentMethod: paymentMethod || 'bank_transfer'
    });

  return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat membuat order' },
      { status: 500 }
    );
  }
}
