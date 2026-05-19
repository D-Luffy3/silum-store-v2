'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Sparkles, Check, Percent } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export const NewsletterModal: React.FC = () => {
  const [isBadgeVisible, setIsBadgeVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [discountRate, setDiscountRate] = useState(15);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Fetch discount percentage from Supabase and subscribe to updates
  useEffect(() => {
    const fetchDiscount = async () => {
      try {
        const { data } = await supabase
          .from('app_settings')
          .select('*')
          .eq('id', 'homepage')
          .single();

        if (data?.value && typeof data.value === 'object') {
          const val = data.value as any;
          if (val.discountPercentage !== undefined) {
            setDiscountRate(Number(val.discountPercentage));
          }
        }
      } catch (err) {
        console.error('Error fetching discount rate setting:', err);
      }
    };

    fetchDiscount();

    const channel = supabase
      .channel('discount_realtime_modal')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings', filter: 'id=eq.homepage' }, (payload: any) => {
        if (payload.new?.value?.discountPercentage !== undefined) {
          setDiscountRate(Number(payload.new.value.discountPercentage));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 2. Track scroll position to show badge past Hero Section (> 500px)
  useEffect(() => {
    const handleScroll = () => {
      const isSubscribedOrDismissed = localStorage.getItem('silum_newsletter_dismissed') === 'true';
      if (!isSubscribedOrDismissed && window.scrollY > 500) {
        setIsBadgeVisible(true);
      } else {
        setIsBadgeVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleDismissForever = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBadgeVisible(false);
    localStorage.setItem('silum_newsletter_dismissed', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase
        .from('newsletter_emails')
        .insert([{ email, source: `scroll_popup_${discountRate}pct` }]);

      if (error) {
        if (error.code === '23505') {
          setSubmitted(true); // already subscribed case
        } else {
          throw error;
        }
      } else {
        setSubmitted(true);
      }
    } catch (err: any) {
      console.error('Subscription error:', err);
      setErrorMsg('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Scroll-Delayed Badge */}
      <AnimatePresence>
        {isBadgeVisible && !isModalOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => setIsModalOpen(true)}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-3 p-4 bg-zinc-900/90 dark:bg-white/95 text-white dark:text-zinc-950 backdrop-blur-md rounded-2xl border border-white/10 dark:border-zinc-200/50 shadow-2xl cursor-pointer select-none group transition-all font-mono"
          >
            <div className="p-2 rounded-xl bg-white/10 dark:bg-zinc-900/10 text-white dark:text-zinc-950 flex items-center justify-center">
              <Percent size={16} className="animate-bounce" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 tracking-wider uppercase font-semibold">Limited Offer</span>
              <span className="text-xs font-bold tracking-widest uppercase">Get {discountRate}% Off</span>
            </div>
            <button
              onClick={handleDismissForever}
              className="p-1 text-zinc-500 hover:text-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-900 rounded-lg hover:bg-white/5 dark:hover:bg-zinc-900/5 transition-colors ml-1"
              aria-label="Dismiss discount"
            >
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glassmorphism modal popup */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-md transition-colors duration-300">
            {/* Backdrop click close */}
            <div className="absolute inset-0" onClick={handleClose} />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-zinc-200/50 dark:border-white/10 bg-white/95 dark:bg-zinc-950/80 backdrop-blur-xl shadow-2xl z-10 grid md:grid-cols-12 text-zinc-900 dark:text-white"
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-zinc-100 dark:bg-black/45 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-white/5 transition-colors"
              >
                <X size={18} />
              </button>

              {/* Left Column: Image */}
              <div className="hidden md:block md:col-span-5 relative bg-zinc-200 dark:bg-zinc-900 overflow-hidden min-h-[400px]">
                <img
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop"
                  alt="Silum Editorial"
                  className="absolute inset-0 w-full h-full object-cover grayscale brightness-90 hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-zinc-950 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-[10px] tracking-[0.2em] text-zinc-500 dark:text-white/50 uppercase font-mono mb-1 font-semibold">
                    Editorial / Vol. 2
                  </p>
                  <h4 className="text-sm font-medium tracking-widest text-zinc-900 dark:text-white uppercase font-display">
                    THE ART OF MINIMALISM
                  </h4>
                </div>
              </div>

              {/* Right Column: Content */}
              <div className="col-span-12 md:col-span-7 p-8 md:p-12 flex flex-col justify-center">
                {!submitted ? (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="h-px w-6 bg-amber-500/50" />
                      <span className="text-[10px] tracking-[0.3em] font-mono text-amber-600 dark:text-amber-500 uppercase font-semibold">
                        Exclusive Access
                      </span>
                    </div>

                    <h3 className="text-2xl font-medium tracking-wide mb-2 uppercase font-display">
                      Join the Silum Club
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm font-light leading-relaxed mb-6">
                      Unlock elite access to capsules, private releases, and receive an instant <strong className="text-zinc-900 dark:text-white font-medium">{discountRate}% discount code</strong> on your first order.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={18} />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email address"
                          className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-500 text-sm focus:border-zinc-400 dark:focus:border-white/30 focus:outline-none transition-colors"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold rounded-xl text-sm tracking-widest uppercase hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <span className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Sparkles size={16} />
                            Receive {discountRate}% Off
                          </>
                        )}
                      </button>

                      {errorMsg && (
                        <p className="text-red-500 text-xs font-mono tracking-wider">{errorMsg}</p>
                      )}

                      <p className="text-[10px] text-zinc-500 text-center font-mono tracking-wider">
                        BY SUBSCRIBING, YOU AGREE TO OUR PRIVACY POLICY. DISMISS AT ANY TIME.
                      </p>
                    </form>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6"
                  >
                    <div className="mx-auto w-12 h-12 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/15 rounded-full flex items-center justify-center mb-4 text-emerald-500">
                      <Check size={24} />
                    </div>
                    <h3 className="text-xl font-medium tracking-wide uppercase mb-2 font-display">
                      Welcome to the Legacy
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm font-light leading-relaxed mb-6 max-w-sm mx-auto">
                      Your email is registered. Use the following code at checkout for your discount:
                    </p>
                    <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-4 rounded-xl font-mono text-lg tracking-[0.2em] font-semibold text-zinc-900 dark:text-white select-all">
                      SILUM-WELCOME-{discountRate}
                    </div>
                    <button
                      onClick={() => {
                        handleClose();
                        // Disable the badge forever
                        localStorage.setItem('silum_newsletter_dismissed', 'true');
                        setIsBadgeVisible(false);
                      }}
                      className="mt-8 text-xs tracking-widest font-mono text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white uppercase underline underline-offset-4"
                    >
                      Enter the Store
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
