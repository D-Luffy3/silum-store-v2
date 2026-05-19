'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, Sun, Moon, Search, ShieldAlert } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { CartDrawer } from './CartDrawer';
import { SearchOverlay } from './SearchOverlay';
import { useTheme } from 'next-themes';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { user, profile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Set mounted flag to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { label: 'Shop', href: '/' },
    { label: 'Portal', href: '/portal-secure', badge: profile?.role && profile.role !== 'customer' ? profile.role : undefined },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/50 dark:border-white/5 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold tracking-[0.3em] uppercase text-zinc-900 dark:text-white hover:opacity-85 transition-opacity font-display">
                  Silum
                </span>
              </Link>
            </div>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex space-x-8 items-center">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative text-xs tracking-[0.2em] uppercase font-mono text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors py-2"
                  >
                    {item.label}
                    {item.badge && (
                      <span className="absolute -top-1 -right-3 text-[8px] px-1 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-500 dark:text-amber-400 uppercase tracking-normal">
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavLine"
                        className="absolute bottom-0 left-0 right-0 h-px bg-zinc-900 dark:bg-white"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Icons */}
            <div className="flex items-center gap-3">
              {/* Search Toggle */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                aria-label="Search items"
              >
                <Search size={18} />
              </button>

              {/* Theme Toggle (Client Safe) */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              )}

              {/* Shopping Cart Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                aria-label="Open Cart"
              >
                <ShoppingBag size={18} />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 dark:bg-white text-[9px] font-bold font-mono text-white dark:text-black"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors md:hidden"
                aria-label="Toggle Menu"
              >
                {isOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b border-zinc-200/50 dark:border-white/5 bg-white dark:bg-zinc-950 md:hidden"
            >
              <div className="space-y-1 px-4 pb-4 pt-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-xs font-mono tracking-widest text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white transition-all uppercase"
                  >
                    {item.label}
                    {item.badge && (
                      <span className="ml-2 text-[9px] px-1 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-500 dark:text-amber-400 uppercase tracking-normal">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Cart Side Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Product Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
