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
  ExternalLink
} from 'lucide-react';
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

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/activity-logs')
        ]);
        setStats(statsRes.data);
        setLogs(logsRes.data);
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
    { label: 'Total Orders', value: stats.totalOrdersToday, icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Revenue Today', value: `$${stats.revenueToday.toLocaleString()}`, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Low Stock Items', value: stats.lowStockProductsCount, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10' },
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
            
            {/* Minimal Trend Indicator */}
            <div className="mt-6 flex items-center gap-2">
               <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '70%' }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 1.5 }}
                    className={cn("h-full", stat.color.replace('text', 'bg'))}
                 />
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Activity Logs Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8 rounded-[2.5rem] bg-white/5 border border-white/5 p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Activity className="text-primary" size={24} />
              <h3 className="text-xl font-bold">Activity Log</h3>
            </div>
            <Link href="/dashboard/logs" className="text-xs uppercase font-bold tracking-widest text-gray-500 hover:text-white flex items-center gap-1 transition-colors group">
              View History <ExternalLink size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="space-y-4">
            {logs.length > 0 ? (
              logs.map((log, i) => (
                <div 
                  key={log._id} 
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group",
                    log.type === 'Order' ? 'border-l-4 border-l-blue-400' : 
                    log.type === 'Stock' ? 'border-l-4 border-l-red-400' :
                    log.type === 'User' ? 'border-l-4 border-l-purple-400' : 'border-l-4 border-l-primary'
                  )}
                >
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {log.type === 'Order' ? <ShoppingCart className="text-blue-400" size={18} /> : 
                     log.type === 'Stock' ? <AlertTriangle className="text-red-400" size={18} /> :
                     log.type === 'User' ? <CheckCircle2 className="text-purple-400" size={18} /> : <Package className="text-primary" size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{log.message}</p>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mt-1 block">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">No activity recorded yet.</div>
            )}
          </div>
        </motion.div>

        {/* Quick Insights / Status Card */}
        <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           className="lg:col-span-4 rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-transparent to-transparent border border-white/5 p-8 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="text-primary" size={24} />
              <h3 className="text-xl font-bold">Health Status</h3>
            </div>
            
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="text-green-500" size={24} />
                 </div>
                 <div>
                    <h4 className="font-bold">{stats.completedOrders} Delivered</h4>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Total fulfilled orders</p>
                 </div>
               </div>

               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                    <RefreshCcw className="text-amber-500" size={24} />
                 </div>
                 <div>
                    <h4 className="font-bold">{stats.pendingOrders} Pending</h4>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Requires attention</p>
                 </div>
               </div>

               <div className="p-6 rounded-3xl bg-white/5 border border-white/5 mt-8">
                 <div className="flex items-center justify-between mb-4">
                   <span className="text-sm font-semibold uppercase tracking-widest text-gray-400">Inventory Health</span>
                   <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", stats.lowStockProductsCount > 5 ? "bg-red-400/10 text-red-400" : "bg-green-400/10 text-green-400")}>
                     {stats.lowStockProductsCount > 5 ? 'Warning' : 'Good'}
                   </span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{stats.lowStockProductsCount}</span>
                    <span className="text-sm text-gray-500 font-medium">items need restocking</span>
                 </div>
                 <Link href="/dashboard/restock" className="mt-4 w-full py-3 rounded-xl bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest hover:bg-primary/30 transition-all flex items-center justify-center">
                   Open Restock Queue
                 </Link>
               </div>
            </div>
          </div>
          
          <div className="mt-12 p-1 rounded-2xl bg-gradient-to-r from-primary/50 to-blue-500/50">
             <div className="bg-[#050505] p-5 rounded-[0.9rem] flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                   <Package className="text-primary" size={20} />
                </div>
                <div className="flex-1">
                   <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-widest">System Engine</p>
                   <p className="text-sm font-bold">V-1.0.2 Stable</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
