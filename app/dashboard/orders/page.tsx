'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  ShoppingCart, 
  Search, 
  Trash2, 
  X,
  Loader2,
  CheckCircle,
  Clock,
  Truck,
  Package,
  ArrowRight,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  status: string;
}

interface OrderItem {
  product: Product;
  quantity: number;
  priceAtOrder: number;
}

interface Order {
  _id: string;
  customerName: string;
  items: OrderItem[];
  totalPrice: number;
  status: string;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [selectedItems, setSelectedItems] = useState<{ productId: string; quantity: number }[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get(`/orders?page=${page}&limit=5&search=${search}`),
        api.get('/products?limit=100') // Fetch more products for dropdown
      ]);
      setOrders(ordersRes.data.orders);
      setTotalPages(ordersRes.data.pages);
      setTotalItems(ordersRes.data.total);
      setProducts(productsRes.data.products);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddItem = () => {
    setSelectedItems([...selectedItems, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...selectedItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setSelectedItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      toast.error('Add at least one product');
      return;
    }

    const productIds = selectedItems.map(i => i.productId);
    if (new Set(productIds).size !== productIds.length) {
      toast.error('Duplicate products in the same order.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/orders', {
        customerName,
        items: selectedItems.map(i => ({ product: i.productId, quantity: i.quantity }))
      });
      toast.success('Order created successfully!');
      setIsModalOpen(false);
      setCustomerName('');
      setSelectedItems([]);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      toast.success(`Order marked as ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-400/10 text-amber-400 border border-amber-400/20';
      case 'Confirmed': return 'bg-blue-400/10 text-blue-400 border border-blue-400/20';
      case 'Shipped': return 'bg-purple-400/10 text-purple-400 border border-purple-400/20';
      case 'Delivered': return 'bg-green-400/10 text-green-400 border border-green-400/20';
      case 'Cancelled': return 'bg-red-400/10 text-red-400 border border-red-400/20';
      default: return 'bg-white/5 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock size={12} />;
      case 'Confirmed': return <CheckCircle size={12} />;
      case 'Shipped': return <Truck size={12} />;
      case 'Delivered': return <Package size={12} />;
      case 'Cancelled': return <AlertCircle size={12} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 font-sans mb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search orders by customer or ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-12 pr-4 py-4 rounded-[1.5rem] bg-white/5 border border-white/5 focus:bg-white/10 focus:border-blue-500/50 text-gray-200 outline-none transition-all placeholder-gray-600 shadow-2xl"
          />
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-8 py-4 rounded-[1.5rem] bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" /> 
          New Order
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
         {loading ? (
           [...Array(3)].map((_, i) => (
             <div key={i} className="h-48 bg-white/5 rounded-3xl animate-pulse" />
           ))
         ) : orders.length > 0 ? (
           orders.map((order, i) => (
             <motion.div
               key={order._id}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.05 }}
               className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 group hover:border-blue-500/30 transition-all flex flex-col md:flex-row md:items-center gap-8 relative overflow-hidden"
             >
                <div className="flex-1 space-y-4">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                         <ShoppingCart className="text-blue-500" size={24} />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-gray-500 uppercase tracking-widest px-1">Order #{order._id.slice(-6)}</p>
                         <h3 className="text-2xl font-black text-white">{order.customerName}</h3>
                      </div>
                   </div>

                   <div className="flex flex-wrap gap-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                           <span className="text-[10px] font-black uppercase text-gray-500">{item.quantity}x</span>
                           <span className="text-xs font-bold text-gray-300">{item.product?.name || 'Unknown Product'}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="flex flex-col items-end gap-6 md:min-w-[200px]">
                   <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-1">Total Revenue</span>
                      <p className="text-3xl font-black text-white">${order.totalPrice.toLocaleString()}</p>
                   </div>
                   
                   <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest", getStatusStyle(order.status))}>
                      {getStatusIcon(order.status)}
                      {order.status}
                   </div>
                </div>

                <div className="flex md:flex-col items-center justify-end gap-2 border-l border-white/5 pl-8 ml-4">
                   {order.status === 'Pending' && (
                     <>
                        <button onClick={() => updateStatus(order._id, 'Confirmed')} className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 hover:bg-green-500 hover:text-white transition-all shadow-lg shadow-green-500/20" title="Confirm">
                           <CheckCircle size={18} />
                        </button>
                        <button onClick={() => updateStatus(order._id, 'Cancelled')} className="w-10 h-10 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 hover:bg-red-400 hover:text-white transition-all shadow-lg shadow-red-400/10" title="Cancel">
                           <X size={18} />
                        </button>
                     </>
                   )}
                   {order.status === 'Confirmed' && (
                     <button onClick={() => updateStatus(order._id, 'Shipped')} className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-lg shadow-blue-500/20" title="Ship">
                        <Truck size={18} />
                     </button>
                   )}
                   {order.status === 'Shipped' && (
                     <button onClick={() => updateStatus(order._id, 'Delivered')} className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 hover:bg-green-500 hover:text-white transition-all shadow-lg shadow-green-500/20" title="Deliver">
                        <Package size={18} />
                     </button>
                   )}
                </div>
             </motion.div>
           ))
         ) : (
           <div className="py-40 text-center bg-white/2 rounded-[3rem] border-2 border-dashed border-white/5 flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center animate-bounce">
                <ShoppingCart className="text-gray-700" size={40} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-500 capitalize">Empty fulfillment records</p>
              </div>
           </div>
         )}
      </div>

      {/* Pagination Fix */}
      <div className="flex items-center justify-between px-8 py-4 bg-white/5 border border-white/5 rounded-[2rem] backdrop-blur-md shadow-2xl">
         <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-gray-500">
            Page {page} of {totalPages}
            <span className="w-1 h-1 rounded-full bg-white/10" />
            {totalItems} Requests Processed
         </div>
         <div className="flex items-center gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:bg-blue-500 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:text-gray-400"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:bg-blue-500 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:text-gray-400"
            >
              <ChevronRight size={20} />
            </button>
         </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050505]/95 backdrop-blur-xl overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 100 }}
              className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-[3.5rem] p-12 shadow-2xl"
            >
              <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
              
              <div className="flex items-center justify-between mb-12 relative z-10">
                <div>
                   <h3 className="text-4xl font-black text-white">Draft Fulfillment</h3>
                   <div className="flex items-center gap-2 mt-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">New Transaction Request</p>
                   </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-14 h-14 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                  <X size={28} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Stakeholder Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Enter Customer/Company Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-8 py-6 rounded-3xl bg-white/3 border border-white/5 focus:bg-white/5 focus:border-blue-500/50 text-white outline-none transition-all placeholder-gray-700 font-bold text-xl shadow-inner shadow-black/50"
                  />
                </div>

                <div className="space-y-6">
                   <div className="flex items-center justify-between px-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">Inventory Items</label>
                      <button 
                        type="button" 
                        onClick={handleAddItem}
                        className="text-xs font-black uppercase tracking-widest text-blue-500 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <Plus size={14} /> Add Line Item
                      </button>
                   </div>

                   <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar pr-4">
                      {selectedItems.map((item, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-4 p-5 rounded-3xl bg-white/2 border border-white/5"
                        >
                           <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="md:col-span-3">
                                 <select
                                   required
                                   value={item.productId}
                                   onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                   className="w-full bg-transparent text-white outline-none font-bold appearance-none cursor-pointer"
                                 >
                                   <option value="" disabled className="bg-[#1a1a1a]">Choose Product...</option>
                                   {products.map((p) => (
                                     <option 
                                      key={p._id} 
                                      value={p._id} 
                                      disabled={p.status === 'Out of Stock'}
                                      className="bg-[#1a1a1a]"
                                     >
                                       {p.name} ({p.stock} available) - ${p.price}
                                     </option>
                                   ))}
                                 </select>
                              </div>
                              <input
                                required
                                type="number"
                                placeholder="Qty"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                                className="bg-white/5 px-4 py-2 rounded-xl text-center font-bold text-blue-400 outline-none w-full"
                              />
                           </div>
                           <button 
                             type="button" 
                             onClick={() => handleRemoveItem(index)}
                             className="w-10 h-10 rounded-xl bg-red-400/5 text-red-400 hover:bg-red-400 hover:text-white transition-all flex items-center justify-center shrink-0"
                           >
                             <Trash2 size={16} />
                           </button>
                        </motion.div>
                      ))}
                   </div>
                </div>

                <div className="pt-8 flex flex-col md:flex-row items-center justify-between border-t border-white/5 gap-8">
                   <div className="flex flex-col">
                      <span className="text-xs font-black uppercase tracking-widest text-gray-600 mb-1">Estimated Total</span>
                      <p className="text-4xl font-black text-white">
                        ${selectedItems.reduce((acc, curr) => {
                          const prod = products.find(p => p._id === curr.productId);
                          return acc + (prod ? prod.price * (curr.quantity || 0) : 0);
                        }, 0).toLocaleString()}
                      </p>
                   </div>

                   <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto px-12 py-6 rounded-3xl bg-blue-600 text-white font-black uppercase tracking-widest shadow-2xl shadow-blue-600/40 hover:bg-blue-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : (
                      <>
                        Process Fulfillment <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
