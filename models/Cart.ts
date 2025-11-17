import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  deliveryType?: 'diambil' | 'disedekahkan';
}

export interface ICart extends Document {
  userId?: mongoose.Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
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
  deliveryType: {
    type: String,
    enum: ['diambil', 'disedekahkan'],
    default: 'diambil'
  }
});

const CartSchema = new Schema<ICart>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  items: [CartItemSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

CartSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Cart = mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);

export default Cart;
