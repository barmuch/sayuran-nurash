import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDB } from '@/lib/database';
import Cart from '@/models/Cart';
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

    const cart = await Cart.findOne({ userId: session.user.id })
      .populate('items.productId');

    if (!cart) {
      return NextResponse.json({ items: [] });
    }

    return NextResponse.json(cart);
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, quantity, deliveryType } = await request.json();
    if (!productId || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDB();
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    if (product.stock < quantity) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
    }

    let cart = await Cart.findOne({ userId: session.user.id });
    if (!cart) cart = new Cart({ userId: session.user.id, items: [] });

    const existingItemIndex = cart.items.findIndex((item: any) => item.productId.toString() === productId);
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
      if (deliveryType && ['diambil','disedekahkan'].includes(deliveryType)) {
        cart.items[existingItemIndex].deliveryType = deliveryType;
      }
    } else {
      cart.items.push({ productId, quantity, deliveryType: ['diambil','disedekahkan'].includes(deliveryType) ? deliveryType : 'diambil' });
    }

    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate('items.productId');
    return NextResponse.json(populatedCart);
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Clear entire cart (used after successful order for authenticated user)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectToDB();
    await Cart.findOneAndUpdate({ userId: session.user.id }, { $set: { items: [] } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clear cart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
