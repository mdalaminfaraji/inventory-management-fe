'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Tags, 
  Edit2, 
  Trash2, 
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Category {
  _id: string;
  name: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, { name });
        toast.success('Category updated');
      } else {
        await api.post('/categories', { name });
        toast.success('Category created');
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      setName('');
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error saving category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this category? This might affect products.')) {
      try {
        await api.delete(`/categories/${id}`);
        toast.success('Category deleted');
        fetchCategories();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Tags className="text-primary" size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-black">Categories</h1>
            <p className="text-gray-500 font-medium tracking-wide uppercase text-xs mt-1">Classify your inventory items</p>
          </div>
        </div>
        <button
          onClick={() => { setEditingCategory(null); setName(''); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-8 py-4 rounded-[1.5rem] bg-primary text-white font-black shadow-lg shadow-primary/20 group transition-all hover:scale-105"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white/5 rounded-3xl animate-pulse" />
          ))
        ) : categories.length > 0 ? (
          categories.map((cat, i) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-6 rounded-[2rem] bg-white/5 border border-white/5 flex items-center justify-between group hover:border-primary/50 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                   <Tags className="text-primary" size={20} />
                </div>
                <div>
                   <h3 className="text-xl font-bold tracking-tight text-white/90">{cat.name}</h3>
                </div>
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={() => handleEdit(cat)}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white hover:text-black transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white/2 rounded-[2rem] border border-dashed border-white/10 flex flex-col items-center gap-4">
            <AlertCircle className="text-gray-600" size={48} />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No categories defined yet</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/90 backdrop-blur-md p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/20 blur-[100px] rounded-full" />
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="text-2xl font-bold">{editingCategory ? 'Edit Category' : 'New Category'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="space-y-2">
                   <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Category Name</label>
                   <input
                     required
                     autoFocus
                     type="text"
                     placeholder="e.g., Electronics, Grocery..."
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     className="w-full px-6 py-5 rounded-2xl bg-white/5 border border-white/5 focus:bg-white/10 focus:border-primary/50 text-white outline-none transition-all placeholder-gray-700 font-bold text-lg"
                   />
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-8 py-5 rounded-2xl bg-white/5 border border-white/5 text-gray-400 font-bold uppercase tracking-widest hover:bg-white/10 transition-all text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] px-8 py-5 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:bg-primary/90 transition-all flex items-center justify-center text-xs disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (editingCategory ? 'Update Class' : 'Create Class')}
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
