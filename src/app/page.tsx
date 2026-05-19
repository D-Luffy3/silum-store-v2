'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, ShoppingBag, Eye, Heart, MoveRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Product, Review, HomepageConfig } from '@/types';
import { useCart } from '@/context/CartContext';

// Mock/Fallback Data if database is empty
const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Legacy Trucker Cap',
    price: '59.95',
    price_currency: '৳',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop',
    is_new: true,
    sizes: ['OS'],
    colors: ['Vintage White', 'Black'],
    description: 'A classic trucker-style cap with high-quality mesh breathability and adjustable fit.',
    details: ['60% Cotton, 40% Polyester', 'Adjustable snapback', 'Curved brim'],
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
    is_new: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Black'],
    description: 'Premium raglan sleeve tee designed for absolute comfort and effortless luxury.',
    details: ['100% Organic Cotton', 'Oversized fit', 'Ribbed neck'],
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
    is_new: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blue Stripe'],
    description: 'A versatile overshirt featuring a modern boxy silhouette and classic stripes.',
    details: ['Lightweight poplin', 'Chest pocket', 'Button-down front'],
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
    is_new: true,
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Sand'],
    description: 'Heavyweight canvas work pants with reinforced stitching for durability.',
    details: ['12oz Canvas', 'Straight leg', 'Multi-pocket utility'],
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
    description: 'The quintessential summer staple in premium breathable linen.',
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
    description: 'Classic fit chino shorts perfect for a balanced modern look.',
    collection_name: 'Signature Series',
    category: 'Signature',
    views: 145
  }
];

const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    author: 'James R.',
    rating: 5,
    comment: 'The quality of the Legacy Work Pant is incredible. Best fit I have found in years.',
    date: '2026-04-10',
    approved: true,
    product_id: 'p4'
  },
  {
    id: 'r2',
    author: 'Sarah M.',
    rating: 5,
    comment: 'Love the Raglan Tee. The material is so soft and comfortable. Quick delivery!',
    date: '2026-04-12',
    approved: true,
    product_id: 'p2'
  },
  {
    id: 'r3',
    author: 'Daniel L.',
    rating: 5,
    comment: 'SILUM never misses. The Trucker Cap is a daily essential now.',
    date: '2026-04-15',
    approved: true,
    product_id: 'p1'
  }
];

export default function HomePage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [homepageText, setHomepageText] = useState<HomepageConfig>({
    heroTitle: 'THE SILUM LEGACY',
    heroSubtitle: 'ARCHITECTURAL SILHOUETTES & MINIMALIST DETAIL',
    featuredTitle: 'COLLECTIONS',
    featuredSubtitle: 'A study in form, alignment, and premium luxury.',
    signupTitle: 'SUBSCRIBE',
    signupSubtitle: 'Unlock priority product access and private collection news.',
    signupImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2000&auto=format&fit=crop'
  });
  const [loading, setLoading] = useState(true);

  // Parallax ref
  const categoryGridRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: categoryGridRef,
    offset: ["start end", "end start"]
  });

  const parallaxY = useTransform(scrollYProgress, [0, 1], [-50, 50]);
  const parallaxYReverse = useTransform(scrollYProgress, [0, 1], [50, -50]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch products
        const { data: dbProducts, error: pErr } = await supabase
          .from('products')
          .select('*');
        
        if (dbProducts && dbProducts.length > 0) {
          setProducts(dbProducts as Product[]);
        } else {
          setProducts(MOCK_PRODUCTS);
        }

        // Fetch reviews
        const { data: dbReviews } = await supabase
          .from('reviews')
          .select('*')
          .eq('approved', true);

        if (dbReviews && dbReviews.length > 0) {
          setReviews(dbReviews as Review[]);
        } else {
          setReviews(MOCK_REVIEWS);
        }

        // Fetch settings
        const { data: settings } = await supabase
          .from('app_settings')
          .select('*')
          .eq('id', 'homepage')
          .single();

        if (settings && settings.value) {
          setHomepageText(settings.value as HomepageConfig);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setProducts(MOCK_PRODUCTS);
        setReviews(MOCK_REVIEWS);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to realtime product and settings updates
    const productsSub = supabase
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        fetchData();
      })
      .subscribe();

    const settingsSub = supabase
      .channel('public:app_settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings', filter: 'id=eq.homepage' }, (payload: any) => {
        if (payload.new && payload.new.value) {
          setHomepageText(payload.new.value as HomepageConfig);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(productsSub);
      supabase.removeChannel(settingsSub);
    };
  }, []);

  const newArrivals = products.filter(p => p.is_new);
  const categoriesList = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const handleReviewClick = (productId: string | null | undefined) => {
    if (productId) {
      router.push(`/products/${productId}`);
    }
  };

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
  };

  return (
    <div className="relative overflow-hidden min-h-screen bg-zinc-950">
      {/* Background radial highlight */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-white/3 blur-[120px] -translate-y-1/2 -z-10 animate-pulse-slow" />

      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2000&auto=format&fit=crop"
            alt="Silum Hero Banner"
            className="w-full h-full object-cover brightness-40 contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-90" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl space-y-6">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-xs font-mono tracking-[0.4em] text-zinc-400 uppercase"
          >
            {homepageText.heroSubtitle}
          </motion.p>
          
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-7xl font-bold tracking-[0.15em] text-white uppercase font-display"
          >
            {homepageText.heroTitle}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pt-8"
          >
            <a
              href="#new-arrivals"
              className="inline-flex items-center gap-3 text-xs tracking-[0.2em] font-mono text-black bg-white px-8 py-4 rounded-xl hover:bg-zinc-200 transition-colors uppercase font-semibold"
            >
              Enter Exhibition
              <MoveRight size={14} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* SECTION 1: New Arrivals (Smooth Horizontal Scroll) */}
      <section id="new-arrivals" className="py-20 md:py-28 border-b border-white/5 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] tracking-[0.3em] font-mono text-zinc-500 uppercase">VOL. 2 EDITIONS</span>
            <h2 className="text-2xl md:text-3xl font-medium tracking-widest text-white uppercase mt-1">New Arrivals</h2>
          </div>
          <div className="flex gap-2 text-zinc-500 text-xs font-mono">
            <span>DRAG OR SCROLL TO EXPLORE</span>
          </div>
        </div>

        {/* Scrollable Container with drag indicator */}
        <div className="relative overflow-x-auto no-scrollbar scroll-smooth flex gap-6 px-4 md:px-[8%] pb-8 cursor-grab active:cursor-grabbing">
          {newArrivals.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex-shrink-0 w-[280px] md:w-[350px] relative group"
            >
              <Link href={`/products/${product.id}`}>
                <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900 border border-white/5 rounded-2xl transition-all group-hover:border-white/20">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-700"
                  />
                  {/* Quick add and hover interactions */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <div className="flex justify-between items-center">
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
                  <span className="absolute top-4 left-4 text-[9px] font-mono tracking-widest bg-white text-black px-2.5 py-1 rounded-md font-bold uppercase">
                    NEW
                  </span>
                </div>

                <div className="mt-4 flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-white tracking-wide uppercase">{product.name}</h3>
                    <p className="text-xs text-zinc-500 font-mono tracking-wider mt-1">{product.collection_name}</p>
                  </div>
                  <span className="text-sm font-mono text-zinc-300 font-semibold">{product.price_currency}{product.price}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 2: All Products (Staggered Grid Fade-In) */}
      <section className="py-20 md:py-28 border-b border-white/5 bg-zinc-950/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col items-center text-center mb-16 space-y-4">
            <span className="text-[10px] tracking-[0.3em] font-mono text-zinc-500 uppercase">ARCHIVE AND EXHIBITS</span>
            <h2 className="text-3xl md:text-4xl font-medium tracking-widest text-white uppercase">Products</h2>
            <div className="h-[2px] w-12 bg-white/20 rounded" />
          </div>

          {/* Staggered Grid Container */}
          <motion.div 
            layout 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-10"
          >
            <AnimatePresence mode="popLayout">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="group relative flex flex-col"
                >
                  <Link href={`/products/${product.id}`}>
                    <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900 border border-white/5 rounded-2xl group-hover:border-white/20 transition-all">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-all duration-700"
                      />
                      
                      {/* Interaction Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                        <div className="flex justify-between items-center">
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

                    <div className="mt-4 flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-white tracking-wide uppercase">{product.name}</h3>
                        <p className="text-xs text-zinc-500 font-mono tracking-wider mt-1">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-mono text-zinc-300 font-semibold">{product.price_currency}{product.price}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: Categories (Parallax Grid Layout) */}
      <section ref={categoryGridRef} className="py-20 md:py-28 border-b border-white/5 relative overflow-hidden bg-zinc-950/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-16 text-center space-y-4">
          <span className="text-[10px] tracking-[0.3em] font-mono text-zinc-500 uppercase">PRODUCT SPECTRUMS</span>
          <h2 className="text-3xl font-medium tracking-widest text-white uppercase">Categories Spectrum</h2>
          <p className="text-sm text-zinc-500 font-light max-w-md mx-auto">Different expressions of tailoring and shape designed for active integration.</p>
        </div>

        {/* Parallax Category Blocks */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Capsule */}
          <motion.div 
            style={{ y: parallaxY }}
            className="relative aspect-[16/10] md:aspect-[4/3] rounded-2xl overflow-hidden group border border-white/5"
          >
            <div className="absolute inset-0 bg-black/40 z-10 transition-colors group-hover:bg-black/20" />
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop"
              alt="Capsule Category"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80 z-10" />
            
            <div className="absolute bottom-8 left-8 right-8 z-20 flex justify-between items-end">
              <div>
                <span className="text-[9px] font-mono tracking-widest text-amber-500 font-bold uppercase">ARCHITECTURAL FIT</span>
                <h3 className="text-xl font-medium text-white tracking-widest uppercase mt-1">Capsule</h3>
              </div>
              <button 
                onClick={() => router.push('/categories/capsule')}
                className="p-2.5 rounded-full bg-white text-black hover:bg-zinc-200 transition-colors"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>

          {/* Card 2: Signature */}
          <motion.div 
            style={{ y: parallaxYReverse }}
            className="relative aspect-[16/10] md:aspect-[4/3] rounded-2xl overflow-hidden group border border-white/5"
          >
            <div className="absolute inset-0 bg-black/40 z-10 transition-colors group-hover:bg-black/20" />
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop"
              alt="Signature Category"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80 z-10" />
            
            <div className="absolute bottom-8 left-8 right-8 z-20 flex justify-between items-end">
              <div>
                <span className="text-[9px] font-mono tracking-widest text-amber-500 font-bold uppercase">SIGNATURE LABELS</span>
                <h3 className="text-xl font-medium text-white tracking-widest uppercase mt-1">Signature</h3>
              </div>
              <button 
                onClick={() => router.push('/categories/signature')}
                className="p-2.5 rounded-full bg-white text-black hover:bg-zinc-200 transition-colors"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 md:py-28 bg-zinc-950/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-16 space-y-4">
            <span className="text-[10px] tracking-[0.3em] font-mono text-zinc-500 uppercase">TESTIMONIAL ARCHIVE</span>
            <h2 className="text-2xl md:text-3xl font-medium tracking-widest text-white uppercase">Client Reviews</h2>
            <p className="text-xs text-zinc-400 max-w-xs font-light font-mono leading-relaxed">
              CLICK A REVIEW CARD TO VIEW THE CORRESPONDING PRODUCT AND COMPLETE ACQUISITION.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review) => {
              const reviewProduct = products.find(p => p.id === review.product_id);
              return (
                <motion.div
                  key={review.id}
                  whileHover={{ y: -5, borderColor: 'rgba(255, 255, 255, 0.2)' }}
                  onClick={() => handleReviewClick(review.product_id)}
                  className="bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-2xl p-6 md:p-8 cursor-pointer transition-all hover:bg-zinc-200 dark:hover:bg-zinc-900/60 flex flex-col justify-between"
                >
                  <div className="flex gap-4 items-start">
                    {reviewProduct && (
                      <img
                        src={reviewProduct.image}
                        alt={reviewProduct.name}
                        className="w-14 h-16 object-cover bg-zinc-200 dark:bg-zinc-950 rounded-lg flex-shrink-0 border border-zinc-300 dark:border-white/10"
                      />
                    )}
                    <div className="space-y-2 flex-grow">
                      <div className="flex text-amber-500 gap-0.5">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} size={12} className="fill-current" />
                        ))}
                      </div>
                      <p className="text-zinc-700 dark:text-zinc-300 text-sm font-light leading-relaxed italic">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">{review.author}</h4>
                      <span className="text-[10px] font-mono text-zinc-500">{review.date}</span>
                    </div>
                    {review.product_id && (
                      <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-200 dark:bg-white/5 border border-zinc-300 dark:border-white/10 rounded px-2 py-1 uppercase tracking-widest hover:text-zinc-900 dark:hover:text-white font-semibold">
                        VIEW PRODUCT
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
