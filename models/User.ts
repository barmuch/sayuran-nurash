import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string; // Optional for OAuth users
  role: 'admin' | 'user';
  provider?: 'credentials' | 'google'; // OAuth provider
  googleId?: string; // Google user ID
  image?: string; // Profile image URL
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: false, // Not required for OAuth users
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  provider: {
    type: String,
    enum: ['credentials', 'google'],
    default: 'credentials',
  },
  googleId: {
    type: String,
    sparse: true, // Allow null but unique if set
  },
  image: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
