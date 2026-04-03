'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  ShoppingCart, 
  AlertTriangle, 
  DollarSign, 
  Clock, 
  Activity, 
  Package, 
  CheckCircle2, 
  RefreshCcw,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Stats {
  totalOrdersToday: number;
  pendingOrders: number;
  completedOrders: number;
  lowStockProductsCount: number;
  revenueToday: number;
}

interface ActivityLog {
  _id: string;
  message: string;
  type: string;
  createdAt: string;
}

interface ProductSummary {
  _id: string;
  name: string;
  stock: number;
  threshold: number;
  status: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, logsRes, productsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/activity-logs'),
          api.get('/products?limit=5')
        ]);
        setStats(statsRes.data);
        setLogs(logsRes.data);
        setProducts(productsRes.data.products || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-white/5 rounded-3xl animate-pulse" />
        ))}
        <div className="col-span-1 lg:col-span-3 h-96 bg-white/5 rounded-3xl animate-pulse" />
        <div className="col-span-1 h-96 bg-white/5 rounded-3xl animate-pulse" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Orders', value: stats.totalOrdersToday, icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-400/10', bar: 'bg-blue-400' },
    { label: 'Revenue Today', value: `$${stats.revenueToday.toLocaleString()}`, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-400/10', bar: 'bg-green-400' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10', bar: 'bg-amber-400' },
    { label: 'Low Stock Items', value: stats.lowStockProductsCount, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10', bar: 'bg-red-400' },
  ];

  const chartData = [
    { name: 'Pending', value: stats.pendingOrders, color: '#fbbf24' },
    { name: 'Completed', value: stats.completedOrders, color: '#34d399' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden group hover:border-primary/50 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
               <div className={cn("p-3 rounded-2xl", stat.bg)}>
                 <stat.icon className={stat.color} size={24} />
               </div>
               <div className="flex flex-col items-end">
                 <span className="text-gray-400 text-xs font-semibold tracking-wider uppercase">{stat.label}</span>
                 <h3 className="text-2xl font-bold mt-1 tracking-tight">{stat.value}</h3>
               </div>
            </div>
            
            <div className="mt-6 flex items-center gap-2">
               <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '70%' }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 1.5 }}
                    className={cn("h-full", stat.bar)}
                 />
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Analytics Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8 rounded-[2.5rem] bg-white/5 border border-white/5 p-8 flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
               <TrendingUp className="text-primary" size={24} />
               <h3 className="text-xl font-bold">Performance Overview</h3>
             </div>
             <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
               Real-time Data <RefreshCcw size={14} />
             </div>
          </div>

          <div className="flex-1 min-h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#ffffff50', fontSize: 12, fontWeight: 700 }} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fill: '#ffffff50', fontSize: 12, fontWeight: 700 }} />
                 <Tooltip 
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff10', borderRadius: '16px', color: '#fff' }}
                 />
                 <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={60}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                    ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4">
             {products.slice(0, 4).map((p) => (
                <div key={p._id} className="p-4 rounded-2xl bg-white/3 border border-white/5">
                   <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest truncate">{p.name}</p>
                   <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-black text-white">{p.stock}</span>
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", p.stock <= p.threshold ? "bg-red-400/10 text-red-400" : "bg-green-400/10 text-green-400")}>
                        {p.stock <= p.threshold ? 'Low' : 'OK'}
                      </span>
                   </div>
                </div>
             ))}
          </div>
        </motion.div>

        {/* Status & Activity Card */}
        <div className="lg:col-span-4 flex flex-col gap-8">
           <motion.div
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="rounded-[2.5rem] bg-white/5 border border-white/5 p-8 flex-1"
           >
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                   <Activity className="text-primary" size={24} />
                   <h3 className="text-xl font-bold">Live Stream</h3>
                 </div>
                 <Link href="/dashboard/logs" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <ChevronRight size={18} />
                 </Link>
              </div>

              <div className="space-y-4">
                {logs.slice(0, 5).map((log) => (
                  <div key={log._id} className="flex items-start gap-4 p-4 rounded-2xl bg-white/3 border border-white/5 hover:border-white/10 transition-all group">
                     <div className="shrink-0 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                        {log.type === 'Order' ? <ShoppingCart className="text-blue-400" size={16} /> : 
                         log.type === 'Stock' ? <AlertTriangle className="text-red-400" size={16} /> :
                         log.type === 'User' ? <CheckCircle2 className="text-purple-400" size={16} /> : <Package className="text-primary" size={16} />}
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-300 leading-tight group-hover:text-white transition-colors capitalize line-clamp-2">{log.message}</p>
                        <span className="text-[10px] font-black text-gray-600 mt-1 block uppercase tracking-tighter">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                     </div>
                  </div>
                ))}
              </div>
           </motion.div>

           <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="rounded-[2.5rem] bg-linear-to-br from-primary to-blue-600 p-8 text-white relative overflow-hidden group shadow-2xl shadow-primary/30"
           >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700" />
              <h3 className="text-xl font-black mb-2 tracking-tight">System Engine V.1</h3>
              <p className="text-white/70 text-xs font-bold uppercase tracking-[0.2em] mb-6">Autonomous Processing</p>
              
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-3">
                       <CheckCircle2 size={18} />
                       <span className="text-xs font-bold uppercase tracking-widest">Connectivity</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                 </div>
                 <Link href="/dashboard/restock" className="flex items-center justify-between p-4 rounded-2xl bg-white text-primary font-black uppercase tracking-widest text-[10px] hover:bg-opacity-90 transition-all group">
                    View Restock Queue <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                 </Link>
              </div>
           </motion.div>
        </div>
      </div>
    </div>
  );
}
