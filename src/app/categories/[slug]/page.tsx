'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Legacy Trucker Cap',
    price: '59.95',
    price_currency: '৳',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop',
    sizes: ['OS'],
    colors: ['Black'],
    collection_name: 'the Silum products',
    category: 'Capsule',
    views: 120
  },
  {
    id: 'p2',
    name: 'Legacy Raglan Lounge Tee',
    price: '79.95',
    price_currency: '৳',
    image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=800&auto=format&fit=crop',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Black'],
    collection_name: 'the Silum products',
    category: 'Capsule',
    views: 432
  },
  {
    id: 'p3',
    name: 'Legacy Boxy SS Overshirt',
    price: '99.95',
    price_currency: '৳',
    image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=800&auto=format&fit=crop',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blue Stripe'],
    collection_name: 'the Silum products',
    category: 'Capsule',
    views: 98
  },
  {
    id: 'p4',
    name: 'Legacy Work Pant Sand',
    price: '149.95',
    price_currency: '৳',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop',
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Sand'],
    collection_name: 'the Silum products',
    category: 'Capsule',
    views: 512
  },
  {
    id: 'p5',
    name: 'Signature Linen Shirt White',
    price: '119.95',
    price_currency: '৳',
    image: 'https://images.unsplash.com/photo-1621072156002-e2fcc103e81e?q=80&w=800&auto=format&fit=crop',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White'],
    collection_name: 'Signature Series',
    category: 'Signature',
    views: 87
  },
  {
    id: 'p6',
    name: 'Signature Chino Shorts Khaki',
    price: '89.95',
    price_currency: '৳',
    image: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?q=80&w=800&auto=format&fit=crop',
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Khaki'],
    collection_name: 'Signature Series',
    category: 'Signature',
    views: 145
  }
];

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const slug = params.slug as string;

  // Capitalize Category Slug for queries (e.g. capsule -> Capsule)
  const categoryName = typeof slug === 'string' 
    ? slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase() 
    : '';

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('category', categoryName);

        if (data && data.length > 0) {
          setProducts(data as Product[]);
        } else {
          // fallback filter
          const fallbackMatches = FALLBACK_PRODUCTS.filter(
            p => p.category.toLowerCase() === categoryName.toLowerCase()
          );
          setProducts(fallbackMatches);
        }
      } catch (err) {
        console.error('Error fetching category products:', err);
        const fallbackMatches = FALLBACK_PRODUCTS.filter(
          p => p.category.toLowerCase() === categoryName.toLowerCase()
        );
        setProducts(fallbackMatches);
      } finally {
        setLoading(false);
      }
    };

    if (categoryName) {
      fetchCategoryProducts();
    }
  }, [categoryName]);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: `${product.id}-${product.sizes[0] || 'OS'}-Default`,
      productId: product.id,
      name: product.name,
      price: product.price,
      currency: product.price_currency || '৳',
      image: product.image,
      size: product.sizes[0] || 'OS',
    }, 1);
    alert(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white py-12 md:py-20 font-light transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase mb-8 md:mb-12"
        >
          <ArrowLeft size={14} />
          Back to collections
        </button>

        {/* Header */}
        <div className="mb-16 border-b border-zinc-200 dark:border-white/5 pb-8">
          <span className="text-[10px] tracking-[0.3em] font-mono text-zinc-500 uppercase">CATEGORY SPECTRUM</span>
          <h1 className="text-3xl md:text-5xl font-medium tracking-widest uppercase mt-2 font-display">{categoryName} Collection</h1>
          <p className="text-sm text-zinc-500 mt-2 font-light font-mono uppercase tracking-[0.1em]">A focused alignment of experimental geometry and structural tailoring.</p>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 font-mono text-xs uppercase tracking-widest">
            No items in this collection currently.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group relative flex flex-col"
              >
                <Link href={`/products/${product.id}`}>
                  <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl group-hover:border-zinc-400 dark:group-hover:border-white/20 transition-all">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-all duration-700"
                    />
                    
                    {/* Interaction Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <div className="flex justify-between items-center text-left">
                        <button
                          onClick={(e) => handleQuickAdd(e, product)}
                          className="bg-white text-black p-3 rounded-xl hover:bg-zinc-200 transition-all shadow-lg flex items-center gap-2 font-mono text-xs uppercase font-semibold"
                        >
                          <ShoppingBag size={14} />
                          Quick Add
                        </button>
                        <div className="flex gap-2">
                          <span className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md text-white border border-white/10 hover:bg-white/20 transition-colors">
                            <Eye size={14} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-start text-left">
                    <div>
                      <h3 className="text-sm font-medium text-zinc-900 dark:text-white tracking-wide uppercase">{product.name}</h3>
                      <p className="text-xs text-zinc-500 font-mono tracking-wider mt-1">{product.collection_name || 'Silum Capsule'}</p>
                    </div>
                    <span className="text-sm font-mono text-zinc-700 dark:text-zinc-300 font-semibold">{product.price_currency}{product.price}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
