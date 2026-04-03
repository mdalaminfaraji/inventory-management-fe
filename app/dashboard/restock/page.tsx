'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  ArrowUpCircle, 
  RotateCcw, 
  Loader2,
  CheckCircle2,
  X
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

interface Product {
  _id: string;
  name: string;
  category: { name: string };
  stock: number;
  threshold: number;
  status: string;
}

export default function RestockQueuePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [restockAmount, setRestockAmount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLowStock();
  }, []);

  const fetchLowStock = async () => {
    try {
      const res = await api.get('/products/low-stock');
      // Sort by stock/threshold ratio (lowest first)
      const sorted = res.data.sort((a: Product, b: Product) => (a.stock / a.threshold) - (b.stock / b.threshold));
      setProducts(sorted);
    } catch (error) {
       toast.error('Failed to load restock queue');
    } finally {
       setLoading(false);
    }
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsSubmitting(true);
    try {
      await api.put(`/products/${selectedProduct._id}`, { 
        stock: selectedProduct.stock + restockAmount 
      });
      toast.success(`Restocked ${selectedProduct.name} by ${restockAmount} units`);
      setIsModalOpen(false);
      setSelectedProduct(null);
      setRestockAmount(1);
      fetchLowStock();
    } catch (error) {
       toast.error('Restock update failed');
    } finally {
       setIsSubmitting(false);
    }
  };

  const getPriority = (p: Product) => {
    const ratio = p.stock / p.threshold;
    if (p.stock === 0) return { label: 'CRITICAL', color: 'bg-red-500/20 text-red-500', icon: <X size={14} /> };
    if (ratio <= 0.5) return { label: 'High', color: 'bg-orange-500/20 text-orange-500', icon: <ArrowUpCircle size={14} /> };
    if (ratio <= 0.8) return { label: 'Medium', color: 'bg-yellow-500/20 text-yellow-500', icon: <AlertCircle size={14} /> };
    return { label: 'Low', color: 'bg-blue-500/20 text-blue-500', icon: <AlertCircle size={14} /> };
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-lg shadow-red-500/10">
              <AlertCircle className="text-red-500" size={32} />
           </div>
           <div>
              <h1 className="text-4xl font-black text-white">Restock Queue</h1>
              <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Intelligence-based stock priority list</p>
           </div>
        </div>
        <button 
          onClick={fetchLowStock}
          className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
        >
          <RotateCcw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {loading ? (
          [...Array(6)].map((_, i) => (
             <div key={i} className="h-64 bg-white/5 rounded-[2.5rem] animate-pulse" />
          ))
        ) : products.length > 0 ? (
          products.map((product, i) => {
            const priority = getPriority(product);
            return (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="p-8 rounded-[3rem] bg-white/5 border border-white/5 group relative overflow-hidden backdrop-blur-xl flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                   <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{product.category?.name || 'Inventory'}</span>
                      <h3 className="text-2xl font-black text-white group-hover:text-primary transition-colors truncate w-full max-w-[200px]">{product.name}</h3>
                   </div>
                   <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5", priority.color)}>
                      {priority.icon} {priority.label}
                   </div>
                </div>

                <div className="my-8 space-y-4">
                   <div className="flex items-end justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 block mb-1">Current Balance</span>
                        <p className={cn("text-5xl font-black leading-none tracking-tighter", product.stock === 0 ? "text-red-500" : "text-white")}>
                          {product.stock}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 block mb-1">Target Min</span>
                        <p className="text-xl font-bold text-gray-400">{product.threshold}</p>
                      </div>
                   </div>
                   
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                         initial={{ width: 0 }}
                         animate={{ width: `${Math.min((product.stock / product.threshold) * 100, 100)}%` }}
                         className={cn("h-full", product.stock === 0 ? "bg-red-500" : "bg-primary")}
                      />
                   </div>
                </div>

                <button
                  onClick={() => { setSelectedProduct(product); setIsModalOpen(true); }}
                  className="w-full py-5 rounded-2xl bg-white/5 border border-white/5 font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-white"
                >
                  Initiate Replenishment <ArrowUpCircle size={14} />
                </button>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full py-40 border-2 border-dashed border-white/5 rounded-[4rem] flex flex-col items-center justify-center text-center">
             <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-8 shadow-2xl shadow-green-500/20">
                <CheckCircle2 className="text-green-500" size={48} />
             </div>
             <h2 className="text-2xl font-black text-white">Full Inventory Alignment</h2>
             <p className="text-gray-600 mt-2 font-medium">All products are currently above their safety thresholds.</p>
          </div>
        )}
      </div>

      {/* Restock Modal */}
      <AnimatePresence>
        {isModalOpen && selectedProduct && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#050505]/95 backdrop-blur-2xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 1, scale: 0.8 }}
                className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden"
              >
                 <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full" />
                 
                 <div className="flex items-center justify-between mb-10 relative z-10">
                    <div>
                       <h3 className="text-3xl font-black text-white">Restock Asset</h3>
                       <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">{selectedProduct.name}</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all">
                       <X size={24} />
                    </button>
                 </div>

                 <form onSubmit={handleRestock} className="space-y-10 relative z-10">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Units to Add</label>
                       <div className="flex items-center gap-4">
                          <button 
                            type="button" 
                            onClick={() => setRestockAmount(Math.max(1, restockAmount - 1))}
                            className="w-16 h-16 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center text-2xl font-black hover:bg-white/10 transition-all"
                          >
                            -
                          </button>
                          <Input 
                            required
                            type="number"
                            value={restockAmount}
                            onChange={(e) => setRestockAmount(parseInt(e.target.value))}
                            className="flex-1 bg-white/5 border border-white/5 h-16 rounded-3xl text-center text-3xl font-black text-primary outline-none focus-visible:bg-white/10 transition-all shadow-inner shadow-black/50 border-none px-0"
                          />
                          <button 
                            type="button" 
                            onClick={() => setRestockAmount(restockAmount + 1)}
                            className="w-16 h-16 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center text-2xl font-black hover:bg-white/10 transition-all"
                          >
                            +
                          </button>
                       </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10">
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Post-Action Balance</span>
                          <span className="text-white font-black text-lg">{selectedProduct.stock + restockAmount} Units</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Net Delta</span>
                          <span className="text-green-500 font-bold text-sm">+{restockAmount} Increase</span>
                       </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-6 rounded-3xl bg-primary text-white font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:bg-primary/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : 'Execute Supply Load'}
                    </button>
                 </form>
              </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
}
