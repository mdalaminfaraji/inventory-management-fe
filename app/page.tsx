'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Package } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center font-sans overflow-hidden relative">
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-primary/20 blur-[200px] rounded-full animate-pulse" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="text-center space-y-10 relative z-10"
      >
        <div className="flex flex-col items-center gap-6">
           <div className="w-24 h-24 rounded-[2.5rem] bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 rotate-[15deg] animate-bounce">
              <Package className="text-white" size={40} />
           </div>
           <div className="space-y-2">
              <h1 className="text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                StockBondhu
              </h1>
              <div className="flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.5em] text-gray-500">
                <span className="w-4 h-[1px] bg-gray-500" />
                Next Generation ERP
                <span className="w-4 h-[1px] bg-gray-500" />
              </div>
           </div>
        </div>

        <div className="flex flex-col items-center gap-3">
           <Loader2 className="w-10 h-10 text-primary animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-widest text-gray-700 animate-pulse">Syncing Engine</p>
        </div>
      </motion.div>
    </div>
  );
}
