'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, ShoppingBag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchSearchProducts = async () => {
      try {
        const { data } = await supabase.from('products').select('*');
        if (data && data.length > 0) {
          setProducts(data as Product[]);
        } else {
          // fallback mock products if db is empty
          setProducts([
            { id: 'p1', name: 'Legacy Trucker Cap', price: '59.95', price_currency: '৳', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop', category: 'Capsule', sizes: ['OS'], colors: ['Black'], views: 120 },
            { id: 'p2', name: 'Legacy Raglan Lounge Tee', price: '79.95', price_currency: '৳', image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=800&auto=format&fit=crop', category: 'Capsule', sizes: ['M'], colors: ['Black'], views: 432 },
            { id: 'p3', name: 'Legacy Boxy SS Overshirt', price: '99.95', price_currency: '৳', image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=800&auto=format&fit=crop', category: 'Capsule', sizes: ['M'], colors: ['Blue'], views: 98 },
            { id: 'p4', name: 'Legacy Work Pant Sand', price: '149.95', price_currency: '৳', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop', category: 'Capsule', sizes: ['30'], colors: ['Sand'], views: 512 },
            { id: 'p5', name: 'Signature Linen Shirt White', price: '119.95', price_currency: '৳', image: 'https://images.unsplash.com/photo-1621072156002-e2fcc103e81e?q=80&w=800&auto=format&fit=crop', category: 'Signature', sizes: ['M'], colors: ['White'], views: 87 },
            { id: 'p6', name: 'Signature Chino Shorts Khaki', price: '89.95', price_currency: '৳', image: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?q=80&w=800&auto=format&fit=crop', category: 'Signature', sizes: ['30'], colors: ['Khaki'], views: 145 }
          ]);
        }
      } catch (err) {
        console.error('Search products fetch error:', err);
      }
    };

    fetchSearchProducts();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      setQuery('');
      setFiltered([]);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setFiltered([]);
      return;
    }

    const matches = products.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) || 
      p.category.toLowerCase().includes(query.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
    );
    setFiltered(matches);
  }, [query, products]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleProductSelect = (id: string) => {
    onClose();
    router.push(`/products/${id}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-zinc-950/95 dark:bg-zinc-950/98 backdrop-blur-md flex flex-col pt-24 px-4 md:px-12"
        >
          {/* Header section */}
          <div className="max-w-4xl mx-auto w-full flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4">
            <div className="flex items-center gap-3 flex-grow">
              <Search className="text-zinc-400 dark:text-zinc-500" size={20} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SEARCH FOR GARMENTS, CAPSULES, ARCHIVES..."
                className="w-full bg-transparent border-none text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-0 text-sm md:text-base tracking-widest font-mono uppercase"
              />
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Results section */}
          <div className="max-w-4xl mx-auto w-full flex-grow overflow-y-auto py-8 no-scrollbar">
            {query && filtered.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 font-mono text-xs uppercase tracking-widest">
                No matching pieces found for &ldquo;{query}&rdquo;
              </div>
            ) : query ? (
              <div className="space-y-4">
                <h3 className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase pb-2">Matching Pieces ({filtered.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filtered.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductSelect(product.id)}
                      className="flex gap-4 p-3 bg-zinc-100 dark:bg-zinc-900/40 hover:bg-zinc-200 dark:hover:bg-zinc-900/80 border border-zinc-200 dark:border-white/5 rounded-xl cursor-pointer transition-all items-center"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-14 h-16 object-cover bg-zinc-200 dark:bg-zinc-950 rounded-lg"
                      />
                      <div className="flex-grow">
                        <span className="text-[9px] font-mono tracking-widest text-zinc-500 dark:text-zinc-400 uppercase">{product.category}</span>
                        <h4 className="text-xs font-semibold text-zinc-900 dark:text-white uppercase tracking-wider mt-0.5">{product.name}</h4>
                        <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400 font-semibold block mt-1">{product.price_currency}{product.price}</span>
                      </div>
                      <ArrowRight size={14} className="text-zinc-400" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Suggested Collections</h3>
                <div className="flex flex-wrap gap-2">
                  {['Capsule', 'Signature', 'Essentials'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setQuery(cat)}
                      className="px-4 py-2 border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900/60 rounded-lg text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-white/20 hover:text-zinc-900 dark:hover:text-white transition-all uppercase"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
