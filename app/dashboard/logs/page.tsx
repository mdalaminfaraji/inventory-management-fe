'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  History, 
  Search, 
  Filter, 
  ShoppingCart, 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw,
  Loader2
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ActivityLog {
  _id: string;
  message: string;
  type: string;
  createdAt: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/activity-logs');
      setLogs(res.data);
    } catch (error) {
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(l => 
    l.message.toLowerCase().includes(search.toLowerCase()) ||
    l.type.toLowerCase().includes(search.toLowerCase())
  );

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'Order': return <ShoppingCart className="text-blue-400" size={20} />;
      case 'Stock': return <AlertTriangle className="text-red-400" size={20} />;
      case 'User': return <CheckCircle2 className="text-purple-400" size={20} />;
      default: return <Package className="text-primary" size={20} />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <History className="text-primary" size={28} />
           </div>
           <div>
              <h1 className="text-4xl font-black text-white">Audit Trail</h1>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">Full system activity history</p>
           </div>
        </div>
        <button 
          onClick={fetchLogs}
          className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
        >
          <RotateCcw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search events by keyword or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-[1.5rem] bg-white/5 border border-white/5 focus:bg-white/10 focus:border-primary/50 text-gray-200 outline-none transition-all placeholder-gray-600 shadow-2xl"
          />
        </div>
        <div className="flex items-center gap-2">
           <span className="px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-500 tracking-widest">
             {filteredLogs.length} Events Logged
           </span>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-white/5 rounded-3xl animate-pulse" />
          ))
        ) : filteredLogs.length > 0 ? (
          filteredLogs.map((log, i) => (
            <motion.div
              key={log._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-6 rounded-3xl bg-white/3 border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all group flex items-start gap-6 relative overflow-hidden"
            >
               <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner shadow-black/50">
                  {getLogIcon(log.type)}
               </div>
               <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">{log.type} Event</span>
                     <span className="text-[10px] font-bold text-gray-700 tracking-tighter">
                       {new Date(log.createdAt).toLocaleDateString()} at {new Date(log.createdAt).toLocaleTimeString()}
                     </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-200 leading-tight pr-10">{log.message}</h3>
               </div>
               
               {/* Decorative Gradient Line */}
               <div className={cn(
                 "absolute left-0 top-0 bottom-0 w-1 opacity-50",
                 log.type === 'Order' ? 'bg-blue-400' : 
                 log.type === 'Stock' ? 'bg-red-400' : 
                 log.type === 'User' ? 'bg-purple-400' : 'bg-primary'
               )} />
            </motion.div>
          ))
        ) : (
          <div className="py-40 text-center bg-white/2 rounded-[3.5rem] border border-white/5 flex flex-col items-center gap-6">
             <div className="w-20 h-20 rounded-full bg-white/3 flex items-center justify-center">
                <History className="text-gray-800" size={40} />
             </div>
             <p className="text-xl font-bold text-gray-600">No matching events found in trail history.</p>
          </div>
        )}
      </div>
    </div>
  );
}
