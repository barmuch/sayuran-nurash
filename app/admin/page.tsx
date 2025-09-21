'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Eye, Search, Filter, Package, HelpCircle } from 'lucide-react';
import ImageHelpModal from '@/components/ImageHelpModal';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
}

interface Order {
  _id: string;
  userId?: {
    username: string;
    email: string;
    phone?: string;
    address?: string;
  };
  items: Array<{
    productId: {
      _id: string;
      name: string;
      price: number;
      imageUrl: string;
    };
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'unpaid' | 'pending' | 'paid' | 'refunded';
  paymentMethod?: 'bank_transfer' | 'e_wallet' | 'cod' | 'credit_card';
  shippingAddress?: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    phone: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// Utility functions for status colors
const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'confirmed': return 'bg-blue-100 text-blue-800';
    case 'processing': return 'bg-purple-100 text-purple-800';
    case 'shipped': return 'bg-indigo-100 text-indigo-800';
    case 'delivered': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPaymentStatusColor = (status: Order['paymentStatus']) => {
  switch (status) {
    case 'unpaid': return 'bg-red-100 text-red-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'paid': return 'bg-green-100 text-green-800';
    case 'refunded': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showImageHelp, setShowImageHelp] = useState(false);
  
  // Order filters
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    console.log('Admin page - Session status:', status);
    console.log('Admin page - Session data:', session);
    console.log('Admin page - User role:', session?.user?.role);
    
    if (status === 'loading') return;
    
    if (!session) {
      console.log('No session found, redirecting to home');
      router.push('/');
      return;
    }

    if (session.user.role !== 'admin') {
      console.log('User is not admin, redirecting to home');
      router.push('/');
      return;
    }

    console.log('Admin access granted, fetching data');
    fetchProducts();
    fetchOrders();
  }, [session, status, router]);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Re-fetch products when search or filter changes
  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchProducts();
    }
  }, [searchQuery, session]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      
      // Jika tidak ada data atau data kosong, gunakan dummy data
      if (!data || data.length === 0) {
        const dummyOrders: Order[] = [
          {
            _id: '65b8f1234567890abcdef001',
            userId: {
              username: 'Sarah Wijaya',
              email: 'sarah.wijaya@gmail.com',
              phone: '081234567890',
              address: 'Jl. Merdeka No. 123, Jakarta Pusat'
            },
            items: [
              {
                productId: {
                  _id: '65b8f1234567890abcdef101',
                  name: 'Tomat Merah Segar',
                  price: 8500,
                  imageUrl: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
                },
                quantity: 2,
                price: 8500
              },
              {
                productId: {
                  _id: '65b8f1234567890abcdef102',
                  name: 'Bayam Hijau',
                  price: 4500,
                  imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
                },
                quantity: 3,
                price: 4500
              }
            ],
            totalPrice: 30500,
            status: 'pending',
            paymentStatus: 'unpaid',
            paymentMethod: 'bank_transfer',
            shippingAddress: {
              street: 'Jl. Merdeka No. 123',
              city: 'Jakarta Pusat',
              province: 'DKI Jakarta',
              postalCode: '10110',
              phone: '081234567890'
            },
            notes: 'Tolong sayurannya dipilih yang segar ya, terima kasih',
            createdAt: '2024-09-20T14:30:00.000Z',
            updatedAt: '2024-09-20T14:30:00.000Z'
          },
          {
            _id: '65b8f1234567890abcdef002',
            userId: {
              username: 'Budi Santoso',
              email: 'budi.santoso@yahoo.com',
              phone: '087654321098'
            },
            items: [
              {
                productId: {
                  _id: '65b8f1234567890abcdef103',
                  name: 'Wortel Baby',
                  price: 12000,
                  imageUrl: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
                },
                quantity: 1,
                price: 12000
              },
              {
                productId: {
                  _id: '65b8f1234567890abcdef104',
                  name: 'Brokoli Hijau',
                  price: 15000,
                  imageUrl: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
                },
                quantity: 2,
                price: 15000
              }
            ],
            totalPrice: 42000,
            status: 'confirmed',
            paymentStatus: 'paid',
            paymentMethod: 'e_wallet',
            shippingAddress: {
              street: 'Jl. Sudirman No. 456',
              city: 'Bandung',
              province: 'Jawa Barat',
              postalCode: '40115',
              phone: '087654321098'
            },
            createdAt: '2024-09-19T10:15:00.000Z',
            updatedAt: '2024-09-19T11:20:00.000Z'
          },
          {
            _id: '65b8f1234567890abcdef003',
            userId: {
              username: 'Rina Pratiwi',
              email: 'rina.pratiwi@gmail.com',
              phone: '089876543210'
            },
            items: [
              {
                productId: {
                  _id: '65b8f1234567890abcdef105',
                  name: 'Kangkung Organik',
                  price: 5000,
                  imageUrl: 'https://images.unsplash.com/photo-1622034788147-b0267596443b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
                },
                quantity: 4,
                price: 5000
              },
              {
                productId: {
                  _id: '65b8f1234567890abcdef106',
                  name: 'Cabai Merah Keriting',
                  price: 25000,
                  imageUrl: 'https://images.unsplash.com/photo-1583328475180-d8dbbe0e3934?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
                },
                quantity: 1,
                price: 25000
              },
              {
                productId: {
                  _id: '65b8f1234567890abcdef107',
                  name: 'Bawang Merah',
                  price: 18000,
                  imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
                },
                quantity: 1,
                price: 18000
              }
            ],
            totalPrice: 63000,
            status: 'processing',
            paymentStatus: 'paid',
            paymentMethod: 'credit_card',
            createdAt: '2024-09-18T16:45:00.000Z',
            updatedAt: '2024-09-19T09:30:00.000Z'
          },
          {
            _id: '65b8f1234567890abcdef004',
            userId: {
              username: 'Ahmad Fauzi',
              email: 'ahmad.fauzi@hotmail.com',
              phone: '081987654321'
            },
            items: [
              {
                productId: {
                  _id: '65b8f1234567890abcdef108',
                  name: 'Jagung Manis',
                  price: 15000,
                  imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
                },
                quantity: 3,
                price: 15000
              }
            ],
            totalPrice: 45000,
            status: 'shipped',
            paymentStatus: 'paid',
            paymentMethod: 'cod',
            shippingAddress: {
              street: 'Jl. Gatot Subroto No. 789',
              city: 'Surabaya',
              province: 'Jawa Timur',
              postalCode: '60286',
              phone: '081987654321'
            },
            notes: 'Mohon dikirim secepatnya, untuk acara keluarga',
            createdAt: '2024-09-17T12:20:00.000Z',
            updatedAt: '2024-09-20T08:15:00.000Z'
          },
          {
            _id: '65b8f1234567890abcdef005',
            userId: {
              username: 'Siti Nurhaliza',
              email: 'siti.nurhaliza@gmail.com',
              phone: '085432109876'
            },
            items: [
              {
                productId: {
                  _id: '65b8f1234567890abcdef109',
                  name: 'Mentimun Segar',
                  price: 6000,
                  imageUrl: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
                },
                quantity: 2,
                price: 6000
              },
              {
                productId: {
                  _id: '65b8f1234567890abcdef110',
                  name: 'Kentang Granola',
                  price: 12000,
                  imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
                },
                quantity: 2,
                price: 12000
              }
            ],
            totalPrice: 36000,
            status: 'delivered',
            paymentStatus: 'paid',
            paymentMethod: 'bank_transfer',
            createdAt: '2024-09-15T09:30:00.000Z',
            updatedAt: '2024-09-16T14:45:00.000Z'
          },
          {
            _id: '65b8f1234567890abcdef006',
            userId: {
              username: 'Guest Customer',
              email: 'guest@example.com'
            },
            items: [
              {
                productId: {
                  _id: '65b8f1234567890abcdef111',
                  name: 'Terong Ungu',
                  price: 10000,
                  imageUrl: 'https://images.unsplash.com/photo-1565852635736-08ac9e754279?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
                },
                quantity: 1,
                price: 10000
              }
            ],
            totalPrice: 10000,
            status: 'cancelled',
            paymentStatus: 'refunded',
            paymentMethod: 'e_wallet',
            notes: 'Dibatalkan karena stok habis',
            createdAt: '2024-09-21T07:15:00.000Z',
            updatedAt: '2024-09-21T08:30:00.000Z'
          }
        ];
        
        setOrders(dummyOrders);
      } else {
        setOrders(data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Jika terjadi error, tetap tampilkan dummy data
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Product deleted successfully!');
        fetchProducts();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const duplicateProduct = async (product: Product) => {
    const duplicatedProduct = {
      name: `${product.name} (Copy)`,
      description: product.description,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      _id: '' // Will be ignored when creating new product
    };
    setEditingProduct(duplicatedProduct);
    setShowProductForm(true);
  };

  const getFilteredProducts = () => {
    return products.filter(product => {
      const matchesSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  };

  const getFilteredOrders = () => {
    return orders.filter(order => {
      const matchesSearch = !orderSearchQuery || 
        order._id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        order.userId?.username?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        order.userId?.email?.toLowerCase().includes(orderSearchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesPaymentStatus = paymentStatusFilter === 'all' || order.paymentStatus === paymentStatusFilter;
      
      return matchesSearch && matchesStatus && matchesPaymentStatus;
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-2">🌱 Dashboard Admin Toko Sayuran</h1>
          <p className="text-green-600">Kelola produk sayuran segar dan pantau pesanan pelanggan</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Products ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Orders ({orders.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'products' && (
              <div>
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                  <h2 className="text-xl font-semibold">Products Management</h2>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setShowProductForm(true);
                    }}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Add New Product
                  </button>
                </div>

                {/* Search and Filter */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Search Products
                      </label>
                      <input
                        type="text"
                        placeholder="Search by name or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    Showing {getFilteredProducts().length} of {products.length} products
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Harga (Rupiah)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getFilteredProducts().map((product) => (
                        <tr key={product._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                className="h-12 w-12 rounded-lg object-cover border"
                                src={product.imageUrl}
                                alt={product.name}
                              />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {product.name}
                                </div>
                                <div className="text-sm text-gray-500 max-w-xs truncate">
                                  {product.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-green-600">
                            Rp {product.price.toLocaleString('id-ID')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              product.stock > 10 ? 'bg-green-100 text-green-800' : 
                              product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {product.stock} units
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => {
                                  setEditingProduct(product);
                                  setShowProductForm(true);
                                }}
                                className="text-primary-600 hover:text-primary-900 p-1"
                                title="Edit Product"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => duplicateProduct(product)}
                                className="text-blue-600 hover:text-blue-900 p-1"
                                title="Duplicate Product"
                              >
                                <Plus size={16} />
                              </button>
                              <button
                                onClick={() => deleteProduct(product._id)}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Delete Product"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {getFilteredProducts().length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-500">
                      {products.length === 0 ? (
                        <>
                          <Package size={48} className="mx-auto mb-4 text-gray-300" />
                          <h3 className="text-lg font-medium mb-2">No products yet</h3>
                          <p className="text-sm">Get started by adding your first product.</p>
                        </>
                      ) : (
                        <>
                          <h3 className="text-lg font-medium mb-2">No products found</h3>
                          <p className="text-sm">Try adjusting your search or filter criteria.</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                  <h2 className="text-xl font-semibold">📦 Order Management</h2>
                  <div className="text-sm text-gray-600">
                    Total Orders: {orders.length} | Filtered: {getFilteredOrders().length}
                  </div>
                </div>

                {/* Order Filters */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        🔍 Search Orders
                      </label>
                      <input
                        type="text"
                        placeholder="Order ID, customer name, email..."
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        className="input-field"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        📋 Order Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input-field"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        💳 Payment Status
                      </label>
                      <select
                        value={paymentStatusFilter}
                        onChange={(e) => setPaymentStatusFilter(e.target.value)}
                        className="input-field"
                      >
                        <option value="all">All Payment Status</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="pending">Payment Pending</option>
                        <option value="paid">Paid</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          setOrderSearchQuery('');
                          setStatusFilter('all');
                          setPaymentStatusFilter('all');
                        }}
                        className="btn-secondary w-full"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order & Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Items & Total
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Payment
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getFilteredOrders().map((order) => (
                          <tr key={order._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  Order #{order._id.slice(-8)}
                                </div>
                                <div className="text-sm text-gray-600">
                                  👤 {order.userId?.username || 'Guest Customer'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  📧 {order.userId?.email || 'No email'}
                                </div>
                                {order.userId?.phone && (
                                  <div className="text-sm text-gray-500">
                                    📱 {order.userId.phone}
                                  </div>
                                )}
                              </div>
                            </td>
                            
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm text-gray-900">
                                  {order.items.length} item(s)
                                </div>
                                <div className="text-sm text-gray-500">
                                  {order.items.slice(0, 2).map((item, idx) => (
                                    <div key={idx}>
                                      {item.productId.name} x{item.quantity}
                                    </div>
                                  ))}
                                  {order.items.length > 2 && (
                                    <div className="text-xs text-gray-400">
                                      +{order.items.length - 2} more items
                                    </div>
                                  )}
                                </div>
                                <div className="text-lg font-semibold text-green-600 mt-1">
                                  Rp {order.totalPrice.toLocaleString('id-ID')}
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus || 'unpaid')}`}>
                                  {order.paymentStatus || 'unpaid'}
                                </span>
                                {order.paymentMethod && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    via {order.paymentMethod.replace('_', ' ')}
                                  </div>
                                )}
                              </div>
                            </td>

                            <td className="px-6 py-4 text-sm text-gray-500">
                              <div>
                                📅 {new Date(order.createdAt).toLocaleDateString('id-ID')}
                              </div>
                              <div>
                                🕐 {new Date(order.createdAt).toLocaleTimeString('id-ID', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            </td>

                            <td className="px-6 py-4 text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setShowOrderDetail(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 p-1"
                                  title="View Details"
                                >
                                  <Eye size={16} />
                                </button>
                                
                                <select
                                  value={order.status}
                                  onChange={(e) => {
                                    // TODO: Implement status update API
                                    console.log('Update status to:', e.target.value);
                                  }}
                                  className="text-xs border border-gray-300 rounded px-2 py-1"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="processing">Processing</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {getFilteredOrders().length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-gray-500">
                        {orders.length === 0 ? (
                          <>
                            <Package size={48} className="mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                            <p className="text-sm">Orders will appear here when customers place them.</p>
                          </>
                        ) : (
                          <>
                            <h3 className="text-lg font-medium mb-2">No orders found</h3>
                            <p className="text-sm">Try adjusting your search or filter criteria.</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="text-yellow-800 text-sm font-medium">Pending Orders</div>
                    <div className="text-2xl font-bold text-yellow-900">
                      {orders.filter(o => o.status === 'pending').length}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-blue-800 text-sm font-medium">Processing</div>
                    <div className="text-2xl font-bold text-blue-900">
                      {orders.filter(o => ['confirmed', 'processing'].includes(o.status)).length}
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-green-800 text-sm font-medium">Completed</div>
                    <div className="text-2xl font-bold text-green-900">
                      {orders.filter(o => o.status === 'delivered').length}
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-red-800 text-sm font-medium">Unpaid Orders</div>
                    <div className="text-2xl font-bold text-red-900">
                      {orders.filter(o => (o.paymentStatus || 'unpaid') === 'unpaid').length}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
          onSuccess={() => {
            setShowProductForm(false);
            setEditingProduct(null);
            fetchProducts();
          }}
          onShowImageHelp={() => setShowImageHelp(true)}
        />
      )}

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderDetail(false);
            setSelectedOrder(null);
          }}
          onStatusUpdate={(orderId, newStatus) => {
            // TODO: Implement API call
            console.log('Update order status:', orderId, newStatus);
            setOrders(orders.map(order => 
              order._id === orderId 
                ? { ...order, status: newStatus as Order['status'] }
                : order
            ));
          }}
          onPaymentStatusUpdate={(orderId, newPaymentStatus) => {
            // TODO: Implement API call
            console.log('Update payment status:', orderId, newPaymentStatus);
            setOrders(orders.map(order => 
              order._id === orderId 
                ? { ...order, paymentStatus: newPaymentStatus as Order['paymentStatus'] }
                : order
            ));
          }}
        />
      )}

      {/* Image Help Modal */}
      {showImageHelp && (
        <ImageHelpModal
          isOpen={showImageHelp}
          onClose={() => setShowImageHelp(false)}
        />
      )}
    </div>
  );
}

// Product Form Modal Component
interface ProductFormModalProps {
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
  onShowImageHelp: () => void;
}

function ProductFormModal({ product, onClose, onSuccess, onShowImageHelp }: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    stock: product?.stock || 0,
    imageUrl: product?.imageUrl || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = product ? `/api/products/${product._id}` : '/api/products';
      const method = product ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {product ? 'Edit Product' : 'Add New Product'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                min="0"
                className="input-field"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-1">
              <label className="block text-sm font-medium text-gray-700">
                🖼️ Image URL
              </label>
              <button
                type="button"
                onClick={() => onShowImageHelp()}
                className="text-green-600 hover:text-green-700 transition-colors group relative"
                title="Bantuan mendapatkan link gambar"
              >
                <HelpCircle size={16} />
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Klik untuk panduan gambar
                </span>
              </button>
            </div>
            <div className="relative">
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                required
                placeholder="https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                className="input-field pr-10"
              />
              {formData.imageUrl && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-6 h-6 rounded border border-gray-300 overflow-hidden">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              💡 Klik ikon <HelpCircle size={12} className="inline" /> untuk panduan mendapatkan link gambar
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Saving...' : product ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Order Detail Modal Component
interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
  onPaymentStatusUpdate: (orderId: string, newPaymentStatus: string) => void;
}

function OrderDetailModal({ order, onClose, onStatusUpdate, onPaymentStatusUpdate }: OrderDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-green-50">
          <div>
            <h3 className="text-xl font-semibold text-green-800">
              📦 Order Details #{order._id.slice(-8)}
            </h3>
            <p className="text-green-600 text-sm">
              Placed on {new Date(order.createdAt).toLocaleDateString('id-ID')} at {new Date(order.createdAt).toLocaleTimeString('id-ID')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
              <h4 className="text-lg font-semibold text-blue-800 mb-4">👤 Customer Information</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Name:</span>
                  <p className="text-gray-900">{order.userId?.username || 'Guest Customer'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Email:</span>
                  <p className="text-gray-900">{order.userId?.email || 'No email provided'}</p>
                </div>
                {order.userId?.phone && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Phone:</span>
                    <p className="text-gray-900">{order.userId.phone}</p>
                  </div>
                )}
                {order.shippingAddress && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Shipping Address:</span>
                    <p className="text-gray-900">
                      {order.shippingAddress.street}<br />
                      {order.shippingAddress.city}, {order.shippingAddress.province}<br />
                      {order.shippingAddress.postalCode}
                    </p>
                    {order.shippingAddress.phone && (
                      <p className="text-gray-700 text-sm mt-1">
                        Phone: {order.shippingAddress.phone}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Order Status */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">📋 Order Status</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order Status:</label>
                  <select
                    value={order.status}
                    onChange={(e) => onStatusUpdate(order._id, e.target.value)}
                    className={`w-full p-2 border border-gray-300 rounded-lg text-sm font-medium ${getStatusColor(order.status)}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status:</label>
                  <select
                    value={order.paymentStatus || 'unpaid'}
                    onChange={(e) => onPaymentStatusUpdate(order._id, e.target.value)}
                    className={`w-full p-2 border border-gray-300 rounded-lg text-sm font-medium ${getPaymentStatusColor(order.paymentStatus || 'unpaid')}`}
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="pending">Payment Pending</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                {order.paymentMethod && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Payment Method:</span>
                    <p className="text-gray-900 capitalize">
                      {order.paymentMethod.replace('_', ' ')}
                    </p>
                  </div>
                )}

                <div className="bg-green-100 rounded-lg p-3 border border-green-200">
                  <span className="text-sm font-medium text-green-800">Total Amount:</span>
                  <p className="text-2xl font-bold text-green-900">
                    Rp {order.totalPrice.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">🛒 Ordered Items</h4>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          {item.productId.imageUrl && (
                            <img
                              src={item.productId.imageUrl}
                              alt={item.productId.name}
                              className="w-12 h-12 rounded-lg object-cover border mr-3"
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {item.productId.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              ID: {item.productId._id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        Rp {item.price.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-green-600">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      Total Order:
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600">
                      Rp {order.totalPrice.toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">📝 Order Notes</h4>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-gray-700">{order.notes}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button className="btn-primary flex-1">
              📄 Generate Invoice
            </button>
            <button className="btn-secondary flex-1">
              📧 Send Email Update
            </button>
            <button className="btn-secondary flex-1">
              📱 Send WhatsApp Update
            </button>
            <button 
              onClick={onClose}
              className="btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
