import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/database';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDB();
    const session = await getServerSession(authOptions);
    const order = await Order.findById(params.id);
    if(!order) return NextResponse.json({ message: 'Order tidak ditemukan' }, { status:404 });

    if(order.userId){
      if(!session) return NextResponse.json({ message:'Unauthorized' }, { status:401 });
      if(session.user.role !== 'admin' && session.user.id !== order.userId.toString()) return NextResponse.json({ message:'Forbidden' }, { status:403 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    if(!file || !(file instanceof File)) return NextResponse.json({ message: 'File tidak valid' }, { status:400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'payment-proofs');
    await fs.mkdir(uploadsDir, { recursive: true });
    const ext = path.extname(file.name) || '.dat';
    const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    const fullPath = path.join(uploadsDir, filename);
    await fs.writeFile(fullPath, buffer);

    order.paymentProofUrl = `/uploads/payment-proofs/${filename}`;
    order.paymentStatus = 'paid';
    order.paymentProofUploadedAt = new Date();
    await order.save();

    return NextResponse.json({ message: 'Upload berhasil', url: order.paymentProofUrl });
  } catch (e) {
    console.error('Upload proof error', e);
    return NextResponse.json({ message: 'Gagal upload bukti' }, { status:500 });
  }
}
