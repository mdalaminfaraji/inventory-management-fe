'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { Toaster, toast } from 'sonner';
import { UserPlus, LogIn, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Admin', 'Manager']),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'Manager',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const response = await api.post('/users/register', data);
      console.log(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      toast.success('Registration successful! Welcome aboard.');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden font-sans">
      <Toaster position="top-right" richColors />
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse delay-700" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl relative z-10 mx-4"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex p-3 rounded-2xl bg-blue-500/10 mb-4 border border-blue-500/20"
          >
            <UserPlus className="w-8 h-8 text-blue-400" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400">
            Create Account
          </h1>
          <p className="text-gray-400 mt-2">Start managing your orders today.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
              <input
                {...register('name')}
                type="text"
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1 ml-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
              <input
                {...register('email')}
                type="email"
                placeholder="name@company.com"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1 ml-1">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              {errors.password && <p className="text-red-400 text-xs mt-1 ml-1">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Role</label>
              <select
                {...register('role')}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              >
                <option value="Manager" className="bg-[#1a1a1a]">Manager</option>
                <option value="Admin" className="bg-[#1a1a1a]">Admin</option>
              </select>
              {errors.role && <p className="text-red-400 text-xs mt-1 ml-1">{errors.role.message}</p>}
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10 mb-6">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-gray-400 leading-relaxed">
              By creating an account, you agree to our Terms of Service and Privacy Policy. Roles can be adjusted later by an administrator.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 group"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Create Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-gray-500">Already have an account?</span>
            <Link href="/login" className="text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-all">
              Sign in <LogIn className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
