'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ShoppingBag, ArrowLeft, Plus, Check, ChevronDown, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Product, Review } from '@/types';
import { useCart } from '@/context/CartContext';

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Legacy Trucker Cap',
    price: '59.95',
    price_currency: '৳',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop',
    additional_images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?q=80&w=800&auto=format&fit=crop'
    ],
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
    additional_images: [
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop'
    ],
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
    additional_images: [
      'https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=800&auto=format&fit=crop'
    ],
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
    additional_images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop'
    ],
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

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Selector choices
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImage, setActiveImage] = useState('');

  // UI state
  const [addedConfirm, setAddedConfirm] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<'desc' | 'shipping' | 'sizing'>('desc');

  // Review form state
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        // Fetch product
        const { data: dbProduct } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (dbProduct) {
          setProduct(dbProduct as Product);
          setSelectedSize(dbProduct.sizes?.[0] || 'OS');
          setSelectedColor(dbProduct.colors?.[0] || 'Default');
          setActiveImage(dbProduct.image);
        } else {
          // Fallback to mock product
          const fallback = FALLBACK_PRODUCTS.find(p => p.id === id);
          if (fallback) {
            setProduct(fallback);
            setSelectedSize(fallback.sizes?.[0] || 'OS');
            setSelectedColor(fallback.colors?.[0] || 'Default');
            setActiveImage(fallback.image);
          }
        }

        // Fetch reviews
        const { data: dbReviews } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', id)
          .eq('approved', true);

        if (dbReviews && dbReviews.length > 0) {
          setReviews(dbReviews as Review[]);
        } else {
          // Provide generic mock reviews for this product
          setReviews([
            {
              id: 'mr1',
              author: 'Alex K.',
              rating: 5,
              comment: 'Great craftsmanship and attention to detail. Definitely buying again.',
              date: '2026-05-01',
              approved: true,
              product_id: id
            }
          ]);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const handleAddCart = () => {
    if (!product) return;
    
    addToCart({
      id: `${product.id}-${selectedSize}-${selectedColor}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      currency: product.price_currency || '৳',
      image: product.image,
      size: selectedSize,
      color: selectedColor !== 'Default' ? selectedColor : undefined,
    }, 1);

    setAddedConfirm(true);
    setTimeout(() => {
      setAddedConfirm(false);
    }, 2000);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor || !reviewComment || !product) return;

    setSubmittingReview(true);
    const newReview: Review = {
      id: `r-${Date.now()}`,
      author: reviewAuthor,
      rating: reviewRating,
      comment: reviewComment,
      date: new Date().toISOString().split('T')[0],
      approved: true, // Auto-approve for demo convenience
      product_id: product.id
    };

    try {
      const { error } = await supabase
        .from('reviews')
        .insert([newReview]);

      if (error) throw error;

      setReviews(prev => [newReview, ...prev]);
      setReviewAuthor('');
      setReviewComment('');
      setReviewRating(5);
      alert('Review submitted successfully!');
    } catch (err) {
      console.error('Review submit error:', err);
      // Fallback update on local UI for demo
      setReviews(prev => [newReview, ...prev]);
      setReviewAuthor('');
      setReviewComment('');
      alert('Review posted! (Simulated local fallback)');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-xl uppercase tracking-widest mb-4">Product Not Found</h2>
        <button
          onClick={() => router.push('/')}
          className="text-xs font-mono uppercase underline text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        >
          Return to Store
        </button>
      </div>
    );
  }

  const allImages = [product.image, ...(product.additional_images || [])];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white py-12 md:py-20 font-light transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase mb-8 md:mb-12"
        >
          <ArrowLeft size={14} />
          Back to collections
        </button>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Column 1: Image Carousel (Left) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            
            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto no-scrollbar">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`flex-shrink-0 w-20 h-24 rounded-lg overflow-hidden border transition-all ${
                      activeImage === img 
                        ? 'border-zinc-900 dark:border-white' 
                        : 'border-zinc-200 dark:border-white/10 hover:border-zinc-400 dark:hover:border-white/30'
                    }`}
                  >
                    <img src={img} alt={`${product.name} thumbnail ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Specs & Add to bag (Right) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Category & Tags */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">{product.collection_name}</span>
                {product.is_new && (
                  <span className="text-[9px] font-mono tracking-widest bg-zinc-900 dark:bg-white text-white dark:text-black px-2 py-0.5 rounded font-bold uppercase">New Release</span>
                )}
              </div>

              {/* Title & Price */}
              <div>
                <h1 className="text-2xl md:text-3xl font-medium tracking-wide uppercase font-display">{product.name}</h1>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-xl font-mono font-semibold">
                    {product.price_currency}{product.price}
                  </span>
                  {product.discount_price && (
                    <span className="text-sm font-mono text-zinc-500 line-through">
                      {product.price_currency}{product.discount_price}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-light">
                {product.description || 'No description available for this experimental archive piece.'}
              </p>

              {/* Colors selector (if colors array is set) */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500">Color: <span className="text-zinc-900 dark:text-white font-semibold">{selectedColor}</span></h3>
                  <div className="flex gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-all ${
                          selectedColor === color
                            ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white bg-zinc-100 dark:bg-white/5'
                            : 'border-zinc-200 dark:border-white/15 text-zinc-500 hover:border-zinc-400 dark:hover:border-white/30 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500">Size: <span className="text-zinc-900 dark:text-white font-semibold">{selectedSize}</span></h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 flex items-center justify-center text-xs font-mono rounded-xl border transition-all ${
                          selectedSize === size
                            ? 'bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white font-bold'
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-white/10 hover:border-zinc-400 dark:hover:border-white/20 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Action */}
              <div className="pt-4">
                <button
                  onClick={handleAddCart}
                  disabled={addedConfirm}
                  className={`w-full py-4 rounded-xl text-sm font-semibold tracking-widest uppercase flex items-center justify-center gap-2 transition-all ${
                    addedConfirm
                      ? 'bg-emerald-500 text-white shadow-lg'
                      : 'bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200'
                  }`}
                >
                  {addedConfirm ? (
                    <>
                      <Check size={16} />
                      Added to Bag
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={16} />
                      Acquire Piece
                    </>
                  )}
                </button>
              </div>

              {/* Accordion Specs */}
              <div className="border-t border-zinc-200 dark:border-white/10 pt-4 space-y-2">
                
                {/* Details/Description Tab */}
                <div className="border-b border-zinc-200 dark:border-white/5 pb-2">
                  <button
                    onClick={() => setOpenAccordion(openAccordion === 'desc' ? 'desc' : 'desc')}
                    className="w-full flex items-center justify-between text-xs font-mono uppercase tracking-wider py-2 text-left text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  >
                    <span>Composition & Specs</span>
                    <ChevronDown size={14} className={`transform transition-transform ${openAccordion === 'desc' ? 'rotate-180' : ''}`} />
                  </button>
                  {openAccordion === 'desc' && (
                    <div className="py-2 text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed space-y-1">
                      {product.details && product.details.length > 0 ? (
                        product.details.map((detail, idx) => (
                          <p key={idx} className="flex gap-2">
                            <span className="text-zinc-400 dark:text-zinc-600">•</span>
                            {detail}
                          </p>
                        ))
                      ) : (
                        <p>Architectural garment construction. Dry clean recommended.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Sizing Tab */}
                <div className="border-b border-zinc-200 dark:border-white/5 pb-2">
                  <button
                    onClick={() => setOpenAccordion(openAccordion === 'sizing' ? 'desc' : 'sizing')}
                    className="w-full flex items-center justify-between text-xs font-mono uppercase tracking-wider py-2 text-left text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  >
                    <span>Size Guide</span>
                    <ChevronDown size={14} className={`transform transition-transform ${openAccordion === 'sizing' ? 'rotate-180' : ''}`} />
                  </button>
                  {openAccordion === 'sizing' && (
                    <div className="py-2 text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed">
                      <p>Designed for a slightly boxy, architectural fit. We recommend picking your standard size. OS cap designs fit all heads via back adjusters.</p>
                    </div>
                  )}
                </div>

                {/* Shipping Tab */}
                <div className="border-b border-zinc-200 dark:border-white/5 pb-2">
                  <button
                    onClick={() => setOpenAccordion(openAccordion === 'shipping' ? 'desc' : 'shipping')}
                    className="w-full flex items-center justify-between text-xs font-mono uppercase tracking-wider py-2 text-left text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  >
                    <span>Delivery & Returns</span>
                    <ChevronDown size={14} className={`transform transition-transform ${openAccordion === 'shipping' ? 'rotate-180' : ''}`} />
                  </button>
                  {openAccordion === 'shipping' && (
                    <div className="py-2 text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed">
                      <p>Standard secure courier. Inside Dhaka: 3-5 business days. Outside Dhaka: 5-7 business days. Returns accepted within 7 days of package reception.</p>
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* Product Reviews Section */}
        <div className="mt-20 md:mt-28 border-t border-zinc-200 dark:border-white/10 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Reviews list (Left) */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-xl uppercase tracking-widest mb-6 flex items-center gap-2 font-display">
                <MessageSquare size={18} />
                Client Reviews ({reviews.length})
              </h2>

              {reviews.length === 0 ? (
                <p className="text-sm text-zinc-500 font-mono italic">No review records found for this product catalog.</p>
              ) : (
                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 no-scrollbar">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-zinc-100 dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 p-6 rounded-xl flex gap-4 items-start">
                      {/* Product Thumbnail next to feedback */}
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-14 object-cover bg-zinc-200 dark:bg-zinc-950 rounded-lg flex-shrink-0 border border-zinc-300 dark:border-white/10"
                      />
                      <div className="space-y-2 flex-grow">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-semibold text-zinc-900 dark:text-white uppercase">{review.author}</span>
                          <div className="flex gap-0.5 text-amber-500">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} size={10} className="fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 italic">&ldquo;{review.comment}&rdquo;</p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-600 font-mono text-right mt-1">{review.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Write a Review (Right) */}
            <div className="lg:col-span-5 bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-white/5 p-6 md:p-8 rounded-2xl h-fit">
              <h3 className="text-sm font-mono tracking-widest uppercase mb-4">Write a Review</h3>
              
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    placeholder="Enter username"
                    className="w-full bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/10 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-400 dark:focus:border-white/20"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">Rating</label>
                  <div className="flex gap-1.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        key={stars}
                        type="button"
                        onClick={() => setReviewRating(stars)}
                        className="focus:outline-none p-0.5"
                      >
                        <Star size={18} className={reviewRating >= stars ? 'fill-current' : 'text-zinc-300 dark:text-zinc-600'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">Comment</label>
                  <textarea
                    required
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your thoughts on size, feel, and detailing..."
                    className="w-full bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/10 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-400 dark:focus:border-white/20 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-semibold rounded-lg uppercase tracking-wider hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center"
                >
                  {submittingReview ? (
                    <span className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </form>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
