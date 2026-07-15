'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { FiChevronRight, FiBookOpen, FiTag, FiCpu, FiTrendingUp, FiCheck } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import HeroGeometric from '@/components/ui/shape-landing-hero';

export default function LandingPage() {
  const { token } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring', stiffness: 120, damping: 18 } 
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-[#f3f4f6] relative flex flex-col selection:bg-blue-500/30 overflow-x-hidden font-sans">
      {/* Background dot grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.012)_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none z-0" />

      {/* Header - Morphing on scroll */}
      <header className={`fixed top-0 left-0 right-0 z-40 px-6 py-4 transition-all duration-300 ${
        scrolled 
          ? 'border-b border-white/[0.06] bg-[#070b13]/80 backdrop-blur-lg shadow-lg' 
          : 'border-b border-transparent bg-transparent backdrop-blur-none'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5 z-10"
          >
            <div className="w-7 h-7 rounded bg-blue-500 flex items-center justify-center text-white font-medium text-base shadow-sm select-none">
              N
            </div>
            <span className="font-semibold text-base tracking-tight text-white select-none">NotionNotes</span>
          </motion.div>

          <motion.nav 
            initial={{ opacity: 0, x: 10 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 z-10"
          >
            {mounted && token ? (
              <Link href="/dashboard" className="btn-primary bg-blue-500 hover:bg-blue-600 text-white border-none py-1.5 px-4 text-xs rounded shadow-xs flex items-center gap-1.5 font-medium">
                Workspace <FiChevronRight />
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-xs font-medium text-gray-400 hover:text-white transition-colors py-1.5 px-2">
                  Log in
                </Link>
                <Link href="/register" className="btn-primary bg-blue-500 hover:bg-blue-600 text-white border-none py-1.5 px-4 text-xs rounded shadow-xs font-medium">
                  Sign Up Free
                </Link>
              </>
            )}
          </motion.nav>
        </div>
      </header>

      {/* Hero Geometric Section */}
      <HeroGeometric 
        badge="Introducing NotionNotes 1.0"
        title1="The canvas for"
        title2="your thoughts."
      />

      {/* Feature Cards Grid Section */}
      <section className="border-t border-white/[0.06] bg-white/[0.01] backdrop-blur-lg py-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-white">Everything you need. Simplified.</h2>
            <p className="text-gray-400 mt-3 text-small">
              Ditch the visual noise and focus on what matters most.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Interactive Cards with spring scale & border glow */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -6, borderColor: "rgba(59, 130, 246, 0.25)", boxShadow: "0 15px 30px -10px rgba(59, 130, 246, 0.12)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="border border-white/[0.06] bg-[#0c121e]/40 p-6 rounded-lg transition-colors cursor-default"
            >
              <div className="w-9 h-9 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center text-lg mb-4">
                <FiBookOpen />
              </div>
              <h3 className="text-base font-medium text-white mb-2">Notebook Folders</h3>
              <p className="text-gray-400 text-small leading-relaxed">
                Organize thoughts into clean, separate notebook categories. Perfect for Work, Personal, or Ideas.
              </p>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -6, borderColor: "rgba(59, 130, 246, 0.25)", boxShadow: "0 15px 30px -10px rgba(59, 130, 246, 0.12)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="border border-white/[0.06] bg-[#0c121e]/40 p-6 rounded-lg transition-colors cursor-default"
            >
              <div className="w-9 h-9 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center text-lg mb-4">
                <FiTag />
              </div>
              <h3 className="text-base font-medium text-white mb-2">Flexible Tags</h3>
              <p className="text-gray-400 text-small leading-relaxed">
                Add multiple tags to compile search listings. Filter instantly to view specific items across categories.
              </p>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -6, borderColor: "rgba(59, 130, 246, 0.25)", boxShadow: "0 15px 30px -10px rgba(59, 130, 246, 0.12)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="border border-white/[0.06] bg-[#0c121e]/40 p-6 rounded-lg transition-colors cursor-default"
            >
              <div className="w-9 h-9 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center text-lg mb-4">
                <FiCpu />
              </div>
              <h3 className="text-base font-medium text-white mb-2">Fast Search</h3>
              <p className="text-gray-400 text-small leading-relaxed">
                Locate keywords instantly across note body, categories, and tags. Fast interface responses under 1ms.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Visual Design System Section */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex-1 w-full text-left"
          >
            <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-white leading-tight">Designed for total clarity</h2>
            <p className="text-gray-400 mt-4 text-small leading-relaxed">
              We focus on visual harmony and elevation. White space dominates to prevent cognitive fatigue, while fine 0.5px hairline borders separate regions.
            </p>
            <ul className="mt-8 space-y-4">
              <li className="flex items-center gap-3 text-small text-gray-300">
                <span className="text-blue-400"><FiCheck /></span> Structured design built with strict 8px layout grids
              </li>
              <li className="flex items-center gap-3 text-small text-gray-300">
                <span className="text-blue-400"><FiCheck /></span> Full responsiveness across mobile, tablet, and desktop viewports
              </li>
              <li className="flex items-center gap-3 text-small text-gray-300">
                <span className="text-blue-400"><FiCheck /></span> Smooth theme flips for night mode comfort
              </li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="flex-grow flex-1 flex justify-center w-full"
          >
            <motion.div 
              whileHover={{ y: -6, borderColor: "rgba(59, 130, 246, 0.25)", boxShadow: "0 15px 30px -10px rgba(59, 130, 246, 0.12)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="border border-white/[0.08] bg-[#0c121e]/50 p-6 max-w-sm w-full rounded-xl shadow-xl backdrop-blur-md relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] text-gray-500">July 2026</span>
                <span className="px-2 py-0.5 text-[9px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">Feature</span>
              </div>
              <h4 className="font-medium text-white text-base">✨ Launch NotionNotes</h4>
              <p className="text-gray-400 text-small mt-2 leading-relaxed">
                This is a mock card showing how clean workspace items display with visual hierarchy.
              </p>
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex gap-1.5">
                <span className="px-1.5 py-0.5 text-[10px] bg-white/[0.03] border border-white/[0.06] rounded text-gray-400">#launch</span>
                <span className="px-1.5 py-0.5 text-[10px] bg-white/[0.03] border border-white/[0.06] rounded text-gray-400">#design</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#05080e] border-t border-white/[0.06] py-12 px-6 text-center text-gray-500 text-xs mt-auto relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center text-white font-semibold text-[11px]">
              N
            </div>
            <span className="font-semibold text-white tracking-tight">NotionNotes</span>
          </div>
          <p>© 2026 NotionNotes. All rights reserved.</p>
          <p className="text-[10px] text-gray-600">Built with React, Next.js, MySQL, and Tailwind CSS v4.</p>
        </div>
      </footer>
    </div>
  );
}
