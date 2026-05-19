'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Compass, ShieldAlert } from 'lucide-react';

interface CategoryCard {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  accent: string;
}

const CATEGORIES: CategoryCard[] = [
  {
    slug: 'capsule',
    title: 'Capsule',
    subtitle: 'ARCHITECTURAL FIT',
    description: 'Experimental tailoring, custom silhouettes, and structural geometry engineered for modern expression.',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
    accent: 'from-amber-500/20 to-orange-500/20'
  },
  {
    slug: 'signature',
    title: 'Signature',
    subtitle: 'LEGACY LABELS',
    description: 'Premium linen overshirts, custom branded labels, and tailored garments curated for distinct presence.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop',
    accent: 'from-blue-500/20 to-indigo-500/20'
  },
  {
    slug: 'essentials',
    title: 'Essentials',
    subtitle: 'WARDROBE STAPLES',
    description: 'Minimalist basics, heavy loungewear, and premium cotton garments designed for comfortable everyday luxury.',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1000&auto=format&fit=crop',
    accent: 'from-emerald-500/20 to-teal-500/20'
  },
  {
    slug: 'accessories',
    title: 'Accessories',
    subtitle: 'FINISHING ARCHIVES',
    description: 'Tailored trucker caps, customized leather details, and legacy accessories to balance your tailoring.',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop',
    accent: 'from-purple-500/20 to-pink-500/20'
  }
];

export default function CollectionPage() {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 25, stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white py-16 md:py-24 transition-colors duration-300 font-light overflow-hidden relative">
      {/* Decorative background spots */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-zinc-100 dark:bg-white/3 blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-zinc-100 dark:bg-white/2 blur-[120px] -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="max-w-3xl mb-16 md:mb-24 text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 font-mono text-[9px] uppercase tracking-[0.2em] font-semibold">
            <Compass size={10} className="animate-spin-slow text-amber-500" />
            Curated Categories
          </div>
          <h1 className="text-4xl md:text-6xl font-medium tracking-[0.15em] uppercase font-display">
            The Collection
          </h1>
          <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 font-light leading-relaxed max-w-2xl">
            Explore our curated range of tailored capsule drops, heritage labels, and minimal wardrobe structures. Each piece represents a synthesis of architectural form and comfortable functionality.
          </p>
        </div>

        {/* Categories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10"
        >
          {CATEGORIES.map((cat) => (
            <motion.div
              key={cat.slug}
              variants={itemVariants}
              onClick={() => router.push(`/categories/${cat.slug}`)}
              className="group relative aspect-[4/3] rounded-3xl overflow-hidden border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/20 cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col justify-end p-8"
            >
              {/* Accent backdrop glows on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10`} />
              
              {/* Overlay shading */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />

              {/* Background category image */}
              <img
                src={cat.image}
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
              />

              {/* Content */}
              <div className="relative z-20 space-y-3 text-left">
                <span className="text-[9px] font-mono tracking-[0.3em] text-amber-500 font-bold uppercase">
                  {cat.subtitle}
                </span>
                
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl md:text-3xl font-medium tracking-widest text-white uppercase font-display">
                    {cat.title}
                  </h3>
                  <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    <ArrowRight size={14} />
                  </div>
                </div>

                <p className="text-xs text-zinc-300 font-light leading-relaxed max-w-md opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-20 transition-all duration-500 overflow-hidden">
                  {cat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer info/banner */}
        <div className="mt-20 border-t border-zinc-200 dark:border-white/5 pt-12 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h4 className="text-sm font-medium uppercase tracking-widest">REAL-TIME STOCK INTEGRITY</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Our products are released in micro-capsules. Sign up to stay alerted on re-stocks.</p>
          </div>
          <button
            onClick={() => {
              // Trigger scroll popup or modal if desired
              window.scrollTo({ top: 600, behavior: 'smooth' });
            }}
            className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold rounded-xl text-xs uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Stay Alerted
          </button>
        </div>

      </div>
    </div>
  );
}
