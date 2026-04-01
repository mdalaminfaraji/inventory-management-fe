'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Package, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  AlertTriangle, 
  X,
  Loader2,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Product {
  _id: string;
  name: string;
  category: { _id: string; name: string };
  price: number;
  stock: number;
  threshold: number;
  status: string;
}

interface Category {
  _id: string;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: 0,
    stock: 0,
    threshold: 5,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, formData);
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', formData);
        toast.success('Product created successfully');
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({ name: '', category: '', price: 0, stock: 0, threshold: 5 });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category._id,
      price: product.price,
      stock: product.stock,
      threshold: product.threshold,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        toast.success('Product removed');
        fetchData();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 min-h-[calc(100vh-200px)] flex flex-col font-sans">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search products by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-[1.5rem] bg-white/5 border border-white/5 focus:bg-white/10 focus:border-primary/50 text-gray-200 outline-none transition-all placeholder-gray-500 shadow-2xl"
          />
        </div>

        <div className="flex items-center gap-4">
           <button className="flex items-center gap-2 px-6 py-4 rounded-[1.5rem] bg-white/5 border border-white/5 text-gray-400 font-semibold hover:border-white/20 transition-all">
             <Filter size={18} /> Filters
           </button>
           <button 
             onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
             className="flex items-center gap-2 px-8 py-4 rounded-[1.5rem] bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all group"
           >
             <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" /> 
             Add Product
           </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 rounded-[2.5rem] bg-white/5 border border-white/5 overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-8 py-6 text-xs uppercase tracking-widest text-gray-500 font-bold">Product Info</th>
                <th className="px-8 py-6 text-xs uppercase tracking-widest text-gray-500 font-bold">Category</th>
                <th className="px-8 py-6 text-xs uppercase tracking-widest text-gray-500 font-bold text-center">Stock Level</th>
                <th className="px-8 py-6 text-xs uppercase tracking-widest text-gray-500 font-bold">Unit Price</th>
                <th className="px-8 py-6 text-xs uppercase tracking-widest text-gray-500 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-10 h-16 bg-white/5 rounded-2xl m-2 border-transparent" />
                  </tr>
                ))
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="group hover:bg-white/5 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                          <Package className="text-primary" size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate">{product.name}</p>
                          <span className={cn(
                            "text-[10px] uppercase font-black tracking-widest mt-1 inline-block",
                            product.status === 'Active' ? 'text-green-500' : 'text-red-500'
                          )}>
                            ● {product.status}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs font-bold text-gray-300">
                         {product.category.name}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col items-center gap-1.5">
                         <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${Math.min((product.stock / product.threshold) * 50, 100)}%` }}
                             className={cn(
                               "h-full",
                               product.stock <= product.threshold ? "bg-red-500" : "bg-primary"
                             )}
                           />
                         </div>
                         <div className="flex items-center gap-1.5">
                           <span className={cn("text-sm font-black", product.stock <= product.threshold ? "text-red-400" : "text-white")}>
                             {product.stock} units
                           </span>
                           {product.stock <= product.threshold && (
                             <AlertTriangle className="text-red-400" size={14} />
                           )}
                         </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-lg font-bold text-white">${product.price.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                        <button
                          onClick={() => handleEdit(product)}
                          className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/20"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product._id)}
                          className="w-10 h-10 rounded-xl bg-red-400/10 border border-red-400/20 flex items-center justify-center text-red-400 hover:bg-red-400 hover:text-white transition-all shadow-lg shadow-red-400/10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-gray-500">
                       <Package size={48} className="opacity-20" />
                       <p className="font-medium">No products found matching your search</p>
                       <button 
                        onClick={() => setSearch('')}
                        className="text-primary text-sm font-bold uppercase tracking-widest hover:underline"
                       >
                        Clear Filters
                       </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-[#050505]/95 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white/5 border border-white/10 rounded-[3rem] p-10 shadow-2xl overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[100px] rounded-full" />
              
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div>
                  <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </h3>
                  <p className="text-gray-400 mt-2">Enter the details of your inventory item.</p>
                </div>
                <button 
                  onClick={() => { setIsModalOpen(false); setEditingProduct(null); }}
                  className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all shadow-xl"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Product Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g., iPhone 15 Pro"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Category</label>
                    <div className="relative group">
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      >
                        <option value="" disabled className="bg-[#1a1a1a]">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id} className="bg-[#1a1a1a]">{cat.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-focus-within:rotate-180 transition-transform duration-300" size={18} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Stock Level</label>
                    <input
                      required
                      type="number"
                      placeholder="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                      className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Threshold Value</label>
                    <input
                      required
                      type="number"
                      placeholder="5"
                      value={formData.threshold}
                      onChange={(e) => setFormData({ ...formData, threshold: parseInt(e.target.value) })}
                      className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Unit Price ($)</label>
                    <div className="relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black">$</div>
                      <input
                        required
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        className="w-full pl-12 pr-6 py-5 rounded-2xl bg-white/5 border border-white/5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-2xl font-black"
                      />
                    </div>
                </div>

                <div className="flex items-center gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); setEditingProduct(null); }}
                    className="flex-1 px-8 py-5 rounded-2xl bg-white/5 border border-white/5 text-gray-400 font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] px-8 py-5 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-2xl shadow-primary/40 hover:bg-primary/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : (editingProduct ? 'Sync Product' : 'Create Asset')}
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
