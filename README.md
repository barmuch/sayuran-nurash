# Nurul Ashri Store - Next.js E-commerce Application

A complete online store built with Next.js, MongoDB, NextAuth, and TailwindCSS.

## Features

### User Features
- 🔐 User authentication (sign up/sign in) with NextAuth
- 🛍️ Browse products with search and category filtering
- 🛒 Shopping cart functionality (saved in MongoDB for logged-in users)
- 🔍 Product detail pages
- 💳 Checkout process
- 📦 Order history
- 👤 User profile management

### Admin Features
- 📊 Admin dashboard
- 📝 Product CRUD operations (Create, Read, Update, Delete)
- 📋 Order management
- 👥 User management
- 📈 Sales overview

### Technical Features
- ⚡ Next.js 14 with App Router
- 🎨 TailwindCSS for styling
- 🗄️ MongoDB with Mongoose ODM
- 🔒 NextAuth for authentication
- 📱 Responsive design
- 🔍 Search and filtering
- 📄 Pagination
- 💾 Session management

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Icons**: Lucide React
- **Styling**: TailwindCSS

## Prerequisites

Before running this project, make sure you have:

- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB instance)
- Git

## Installation & Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd web-nurul-ashri
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

Update the `.env.local` file in the root directory with your configuration:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/web-nurul-ashri?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000

# Optional: OpenRouter API Keys (if using AI features)
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_API_KEY_VISION=your-openrouter-vision-api-key
```

### 4. Seed the Database

Populate your database with sample data:

```bash
npm run seed
```

This will create:
- Sample products (electronics, clothing, shoes)
- Admin user (username: `admin`, password: `admin123`)
- Test users

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Default Admin Credentials

After seeding the database, you can log in as admin:

- **Username**: `admin`
- **Password**: `admin123`

**Important for Production:**
Make sure you change these credentials after deployment by:
1. Creating a new admin user through the registration
2. Manually updating the database
3. Or using a database management tool

## Production Deployment Notes

### Vercel Environment Variables

When deploying to Vercel, make sure to set these environment variables:

```env
MONGODB_URI=your-production-mongodb-uri
NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters
NEXTAUTH_URL=https://your-app-name.vercel.app
```

**Critical:** 
- `NEXTAUTH_URL` must match your production domain exactly
- `NEXTAUTH_SECRET` must be at least 32 characters long
- Make sure MongoDB allows connections from Vercel's IP ranges

### Troubleshooting Authentication Issues

If you can login but get redirected when accessing admin pages:

1. **Check Environment Variables**: Ensure `NEXTAUTH_URL` matches your domain
2. **Check Browser Console**: Look for authentication errors
3. **Check Vercel Logs**: Look for server-side authentication errors
4. **Clear Browser Cookies**: Old cookies might conflict
5. **Verify Session**: Check if role is properly set in the session

## Project Structure

```
web-nurul-ashri/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── products/      # Product CRUD operations
│   │   ├── cart/          # Cart management
│   │   ├── checkout/      # Checkout process
│   │   └── orders/        # Order management
│   ├── auth/              # Authentication pages
│   ├── cart/              # Shopping cart page
│   ├── checkout/          # Checkout page
│   ├── products/          # Product pages
│   └── globals.css        # Global styles
├── components/            # Reusable React components
│   ├── Navbar.tsx         # Navigation component
│   ├── ProductGrid.tsx    # Product display grid
│   ├── SearchAndFilter.tsx # Search and filter component
│   └── Providers.tsx      # Context providers
├── lib/                   # Utility libraries
│   └── database.ts        # MongoDB connection
├── models/                # Mongoose models
│   ├── User.ts           # User model
│   ├── Product.ts        # Product model
│   ├── Cart.ts           # Cart model
│   └── Order.ts          # Order model
├── scripts/               # Utility scripts
│   └── seed.ts           # Database seeding script
└── types/                 # TypeScript type definitions
    └── next-auth.d.ts     # NextAuth type extensions
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Products
- `GET /api/products` - Get all products (with pagination, search, filtering)
- `POST /api/products` - Create product (admin only)
- `GET /api/products/[id]` - Get single product
- `PUT /api/products/[id]` - Update product (admin only)
- `DELETE /api/products/[id]` - Delete product (admin only)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/[id]` - Update cart item quantity
- `DELETE /api/cart/[id]` - Remove item from cart

### Orders
- `GET /api/orders` - Get orders (user's orders or all orders for admin)
- `POST /api/checkout` - Process checkout and create order

## Database Models

### User
```typescript
{
  username: string;
  email: string;
  password: string; // hashed
  role: 'admin' | 'user';
  createdAt: Date;
}
```

### Product
```typescript
{
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Cart
```typescript
{
  userId?: ObjectId; // Optional for guest carts
  items: [
    {
      productId: ObjectId;
      quantity: number;
    }
  ];
  createdAt: Date;
  updatedAt: Date;
}
```

### Order
```typescript
{
  userId?: ObjectId; // Optional for guest orders
  items: [
    {
      productId: ObjectId;
      quantity: number;
      price: number; // Price at time of purchase
    }
  ];
  totalPrice: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
}
```

## Features in Detail

### User Authentication
- Registration with username, email, and password
- Login with username/email and password
- Role-based access control (admin/user)
- Protected routes and API endpoints

### Product Management
- Admin can add, edit, and delete products
- Products have images, descriptions, prices, stock levels
- Category-based organization
- Search functionality

### Shopping Cart
- Add/remove items
- Update quantities
- Persistent cart for logged-in users
- Guest cart support (local storage)

### Checkout Process
- Shipping information form
- Payment information form (demo only)
- Order creation and cart clearing
- Stock management

### Admin Dashboard
- Product management interface
- Order viewing and management
- User management
- Sales analytics

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

This is a standard Next.js application and can be deployed to any platform that supports Node.js:

- Netlify
- Railway
- Heroku
- DigitalOcean App Platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the GitHub repository.

## Roadmap

Future features to implement:
- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Email notifications
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Inventory management
- [ ] Analytics dashboard
- [ ] Mobile app
- [ ] Multi-language support
- [ ] Product recommendations
- [ ] Coupon/discount system
