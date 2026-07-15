'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const router = useRouter();
  const { register, token, error, loading, clearError } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (token) {
      router.push('/dashboard');
    }
    clearError();
  }, [token, router, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    const errors: Record<string, string> = {};
    if (!name) {
      errors.name = 'Name is required';
    }
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Invalid email address';
    }
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const success = await register({ name, email, password });
    if (success) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-[#f3f4f6] relative flex flex-col items-center justify-center p-6 selection:bg-blue-500/30 overflow-x-hidden font-sans">
      {/* Background Dot Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.012)_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none z-0" />

      {/* Glowing Mesh Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/5 dark:bg-blue-950/15 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/5 dark:bg-indigo-950/15 blur-[120px] pointer-events-none z-0" />

      <Link 
        href="/" 
        className="mb-8 flex items-center gap-2 py-2 text-xs text-gray-400 hover:text-white transition-colors self-center sm:absolute sm:top-8 sm:left-8 z-10 font-medium"
      >
        <FiArrowLeft className="w-3.5 h-3.5" /> Back to Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 16 }}
        className="border border-white/[0.08] bg-[#0c121e]/30 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-semibold text-lg mx-auto shadow-sm select-none">
            N
          </div>
          <h2 className="text-xl font-semibold mt-4 tracking-tight text-white">Create your account</h2>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">Get started today with your digital workspace</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-xs text-red-400 animate-fade-in">
            <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`form-input bg-white/[0.02] border-white/[0.08] focus:bg-white/[0.05] focus:border-blue-500/40 text-white rounded-lg outline-none transition-all py-2 px-3 w-full text-xs placeholder:text-gray-500 ${
                validationErrors.name ? 'border-red-500/50 focus:border-red-500/50' : ''
              }`}
            />
            {validationErrors.name && (
              <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1.5">
                <FiAlertCircle className="w-3 h-3" /> {validationErrors.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`form-input bg-white/[0.02] border-white/[0.08] focus:bg-white/[0.05] focus:border-blue-500/40 text-white rounded-lg outline-none transition-all py-2 px-3 w-full text-xs placeholder:text-gray-500 ${
                validationErrors.email ? 'border-red-500/50 focus:border-red-500/50' : ''
              }`}
            />
            {validationErrors.email && (
              <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1.5">
                <FiAlertCircle className="w-3 h-3" /> {validationErrors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`form-input bg-white/[0.02] border-white/[0.08] focus:bg-white/[0.05] focus:border-blue-500/40 text-white rounded-lg outline-none transition-all py-2 px-3 w-full text-xs placeholder:text-gray-500 ${
                validationErrors.password ? 'border-red-500/50 focus:border-red-500/50' : ''
              }`}
            />
            {validationErrors.password && (
              <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1.5">
                <FiAlertCircle className="w-3 h-3" /> {validationErrors.password}
              </p>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="btn-primary bg-blue-500 hover:bg-blue-600 text-white border-none py-2 px-4 rounded w-full font-medium transition-all shadow-sm hover:shadow text-xs"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-6 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:underline font-semibold transition-colors">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
