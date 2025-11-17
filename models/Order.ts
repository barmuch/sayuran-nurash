import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  price: number; // Price at the time of purchase
  deliveryType?: 'diambil' | 'disedekahkan';
}

export interface IOrder extends Document {
  userId?: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  createdAt: Date;
  customerName?: string; // For guest or override
  phoneNumber?: string;
  address?: string;
  notes?: string;
  isGuest?: boolean;
  paymentStatus: 'unpaid' | 'pending' | 'paid' | 'refunded';
  paymentMethod?: 'bank_transfer' | 'e_wallet' | 'cod' | 'credit_card';
  paymentProofUrl?: string; // relative URL in public/
  paymentProofUploadedAt?: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  deliveryType: {
    type: String,
    enum: ['diambil', 'disedekahkan'],
    required: false,
  }
});

const OrderSchema = new Schema<IOrder>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  items: [OrderItemSchema],
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
    default: 'pending',
  },
  customerName: { type: String },
  phoneNumber: { type: String },
  address: { type: String },
  notes: { type: String },
  isGuest: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  paymentStatus: { type: String, enum: ['unpaid', 'pending', 'paid', 'refunded'], default: 'unpaid' },
  paymentMethod: { type: String, enum: ['bank_transfer', 'e_wallet', 'cod', 'credit_card'], required: false },
  paymentProofUrl: { type: String },
  paymentProofUploadedAt: { type: Date },
});

const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
