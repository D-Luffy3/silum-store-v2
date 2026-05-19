'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Mail, CheckCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('newsletter_emails')
        .insert([{ email, source: 'homepage_form' }]);

      if (error && error.code !== '23505') {
        throw error;
      }
      setSubmitted(true);
      setEmail('');
    } catch (err) {
      console.error('Subscription error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-zinc-950 border-t border-white/5 text-zinc-400 py-12 md:py-20 font-light">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        {/* Brand */}
        <div className="md:col-span-4 space-y-4">
          <Link href="/">
            <span className="text-lg font-bold tracking-[0.3em] uppercase text-white">
              Silum
            </span>
          </Link>
          <p className="text-xs leading-relaxed text-zinc-500 max-w-sm">
            High-contrast visual luxury and architectural garments. Tailored for those who seek minimal aesthetics and modern silhouettes.
          </p>
          <div className="pt-2 flex gap-4 text-xs font-mono tracking-wider">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors uppercase">Instagram</a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors uppercase">Facebook</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors uppercase">Twitter</a>
          </div>
        </div>

        {/* Links Column 1 */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-xs font-mono font-semibold uppercase tracking-widest text-white">Collections</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/" className="hover:text-white transition-colors uppercase">Capsule Vol. 1</Link></li>
            <li><Link href="/" className="hover:text-white transition-colors uppercase">Signature Series</Link></li>
            <li><Link href="/" className="hover:text-white transition-colors uppercase">New Arrivals</Link></li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-xs font-mono font-semibold uppercase tracking-widest text-white">Client Care</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/" className="hover:text-white transition-colors uppercase">Shipping Rates</Link></li>
            <li><Link href="/" className="hover:text-white transition-colors uppercase">Returns & Exchanges</Link></li>
            <li><Link href="/" className="hover:text-white transition-colors uppercase">Size Guidelines</Link></li>
            <li><Link href="/portal-secure" className="hover:text-white transition-colors uppercase font-medium text-zinc-500 hover:text-amber-500">Secure Access</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="md:col-span-4 space-y-4">
          <h4 className="text-xs font-mono font-semibold uppercase tracking-widest text-white">Newsletter</h4>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Subscribe to receive priority updates on capsules, archive sales, and private exhibitions.
          </p>

          {!submitted ? (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="EMAIL ADDRESS"
                className="w-full bg-zinc-900/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white/20 transition-all font-mono"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-white text-black font-semibold rounded-lg px-4 py-2 text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center gap-1 font-mono"
              >
                {loading ? '...' : 'Send'}
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
              <CheckCircle size={14} />
              <span>SUBSCRIPTION COMPLETED</span>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 md:mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-[10px] font-mono tracking-widest text-zinc-600">
        <p>COPYRIGHT © {new Date().getFullYear()} SILUM LTD. ALL RIGHTS RESERVED.</p>
        <p className="mt-2 md:mt-0">DESIGNED FOR VOL. 2 CODES</p>
      </div>
    </footer>
  );
};
