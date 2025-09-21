import dotenv from 'dotenv';
import { connectToDB } from '../lib/database';
import Product from '../models/Product';
import User from '../models/User';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config({ path: '.env.local' });

const seedProducts = [
  {
    name: 'Tomat Merah Segar',
    description: 'Tomat merah segar langsung dari kebun, kaya vitamin C dan antioksidan.',
    price: 8500,
    stock: 150,
    imageUrl: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Kangkung Organik',
    description: 'Kangkung organik segar tanpa pestisida, dipetik pagi hari.',
    price: 5000,
    stock: 200,
    imageUrl: 'https://images.unsplash.com/photo-1622034788147-b0267596443b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Wortel Baby',
    description: 'Wortel baby manis dan renyah, sempurna untuk salad atau camilan sehat.',
    price: 12000,
    stock: 80,
    imageUrl: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Bayam Hijau',
    description: 'Bayam hijau segar kaya zat besi, baik untuk kesehatan darah.',
    price: 4500,
    stock: 120,
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Cabai Merah Keriting',
    description: 'Cabai merah keriting pedas segar untuk bumbu masakan.',
    price: 25000,
    stock: 60,
    imageUrl: 'https://images.unsplash.com/photo-1583328475180-d8dbbe0e3934?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Bawang Merah',
    description: 'Bawang merah berkualitas tinggi untuk bumbu dasar masakan Indonesia.',
    price: 18000,
    stock: 90,
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Mentimun Segar',
    description: 'Mentimun segar dan renyah, cocok untuk lalapan atau salad.',
    price: 6000,
    stock: 100,
    imageUrl: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Jagung Manis',
    description: 'Jagung manis segar yang bisa direbus atau dibakar.',
    price: 15000,
    stock: 70,
    imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Terong Ungu',
    description: 'Terong ungu segar untuk sayur dan berbagai olahan masakan.',
    price: 10000,
    stock: 85,
    imageUrl: 'https://images.unsplash.com/photo-1565852635736-08ac9e754279?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Sawi Putih',
    description: 'Sawi putih segar dan renyah, cocok untuk tumisan dan sup.',
    price: 7500,
    stock: 110,
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Brokoli Hijau',
    description: 'Brokoli hijau segar kaya nutrisi, cocok untuk sayur maupun salad.',
    price: 15000,
    stock: 75,
    imageUrl: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Kentang Granola',
    description: 'Kentang granola berkualitas tinggi untuk berbagai olahan masakan.',
    price: 12000,
    stock: 100,
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  },
];

const seedUsers = [
  {
    username: 'admin',
    email: 'admin@sayurankita.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    username: 'petani_joko',
    email: 'joko@petani.com',
    password: 'password123',
    role: 'user',
  },
  {
    username: 'ibu_sari',
    email: 'sari@pembeli.com',
    password: 'password123',
    role: 'user',
  },
];

async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    await connectToDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await Product.deleteMany({});
    await User.deleteMany({});

    // Seed users
    console.log('Seeding users...');
    for (const userData of seedUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      await User.create({
        ...userData,
        password: hashedPassword,
      });
    }

    // Seed products
    console.log('Seeding products...');
    await Product.insertMany(seedProducts);

    console.log('✅ Database seeded successfully!');
    console.log(`✅ Created ${seedUsers.length} users`);
    console.log(`✅ Created ${seedProducts.length} products`);
    console.log('\n🥬 Admin Toko Sayuran credentials:');
    console.log('Email: admin@sayurankita.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
