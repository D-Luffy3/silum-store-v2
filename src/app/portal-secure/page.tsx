'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Key, FileText, ShoppingBag, Plus, Trash2, Edit2, LogOut, Mail, Users, ClipboardList } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Product, HomepageConfig, Order, NewsletterEmail } from '@/types';

export default function PortalPage() {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Dashboard Active Tab
  const [activeTab, setActiveTab] = useState<'homepage' | 'products' | 'orders' | 'subscribers'>('homepage');

  // Real-time Database state
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterEmail[]>([]);

  // Homepage Settings Form
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [featuredTitle, setFeaturedTitle] = useState('');
  const [featuredSubtitle, setFeaturedSubtitle] = useState('');
  const [signupTitle, setSignupTitle] = useState('');
  const [signupSubtitle, setSignupSubtitle] = useState('');
  const [signupImage, setSignupImage] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(15);
  const [savingSettings, setSavingSettings] = useState(false);

  // Product Editor Form
  const [prodId, setProdId] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodImg, setProdImg] = useState('');
  const [prodCat, setProdCat] = useState('Capsule');
  const [prodColl, setProdColl] = useState('the Silum products');
  const [prodSizes, setProdSizes] = useState('S, M, L, XL');
  const [prodColors, setProdColors] = useState('Black, White');
  const [prodDesc, setProdDesc] = useState('');
  const [prodDetails, setProdDetails] = useState('');
  const [prodIsNew, setProdIsNew] = useState(true);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);

  // Fetch Portal Data
  const fetchPortalData = async () => {
    try {
      // Products
      const { data: dbProducts } = await supabase.from('products').select('*');
      if (dbProducts) setProducts(dbProducts as Product[]);

      // Orders (Only accessible if Admin)
      if (profile?.role === 'admin') {
        const { data: dbOrders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (dbOrders) setOrders(dbOrders as Order[]);

        const { data: dbSubscribers } = await supabase.from('newsletter_emails').select('*');
        if (dbSubscribers) setSubscribers(dbSubscribers as NewsletterEmail[]);
      }
    } catch (err) {
      console.error('Error fetching portal details:', err);
    }
  };

  useEffect(() => {
    if (user && profile) {
      fetchPortalData();
      
      // Load current homepage configurations
      const loadHomepageSettings = async () => {
        const { data } = await supabase.from('app_settings').select('*').eq('id', 'homepage').single();
        if (data && data.value) {
          const cfg = data.value as HomepageConfig;
          setHeroTitle(cfg.heroTitle || '');
          setHeroSubtitle(cfg.heroSubtitle || '');
          setFeaturedTitle(cfg.featuredTitle || '');
          setFeaturedSubtitle(cfg.featuredSubtitle || '');
          setSignupTitle(cfg.signupTitle || '');
          setSignupSubtitle(cfg.signupSubtitle || '');
          setSignupImage(cfg.signupImage || '');
          setDiscountPercentage(cfg.discountPercentage !== undefined ? Number(cfg.discountPercentage) : 15);
        }
      };

      loadHomepageSettings();
    }
  }, [user, profile]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setAuthLoading(true);
    setAuthError('');

    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              name: email.split('@')[0],
            }
          }
        });
        if (error) throw error;
        alert('Registration complete! Check your email inbox or log in if confirmation is bypassed.');
      }
      refreshProfile();
    } catch (err: any) {
      console.error('Authentication Error:', err.message);
      setAuthError(err.message || 'Verification failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile?.role !== 'admin' && profile?.role !== 'manager' && profile?.role !== 'editor') {
      alert('Access Denied');
      return;
    }

    setSavingSettings(true);
    try {
      const payload = {
        heroTitle,
        heroSubtitle,
        featuredTitle,
        featuredSubtitle,
        signupTitle,
        signupSubtitle,
        signupImage,
        discountPercentage: Number(discountPercentage)
      };

      const { error } = await supabase.from('app_settings').upsert({
        id: 'homepage',
        value: payload,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;
      alert('Homepage updated successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to update app settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile?.role !== 'admin' && profile?.role !== 'manager') {
      alert('Access Denied');
      return;
    }

    setSavingProduct(true);
    try {
      const prodData = {
        id: editingProduct || prodId,
        name: prodName,
        price: prodPrice,
        price_currency: '৳',
        image: prodImg,
        category: prodCat,
        collection_name: prodColl,
        sizes: prodSizes.split(',').map(s => s.trim()),
        colors: prodColors.split(',').map(c => c.trim()),
        description: prodDesc,
        details: prodDetails.split('\n').map(d => d.trim()).filter(Boolean),
        is_new: prodIsNew,
        views: 0
      };

      const { error } = await supabase.from('products').upsert(prodData);
      if (error) throw error;

      alert(editingProduct ? 'Product edited successfully!' : 'Product added successfully!');
      
      // Reset product form
      setProdId('');
      setProdName('');
      setProdPrice('');
      setProdImg('');
      setProdDesc('');
      setProdDetails('');
      setEditingProduct(null);
      fetchPortalData();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Failed to save product database row.');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleEditProductClick = (p: Product) => {
    setEditingProduct(p.id);
    setProdName(p.name);
    setProdPrice(p.price);
    setProdImg(p.image);
    setProdCat(p.category);
    setProdColl(p.collection_name || '');
    setProdSizes(p.sizes.join(', '));
    setProdColors((p.colors || []).join(', '));
    setProdDesc(p.description || '');
    setProdDetails((p.details || []).join('\n'));
    setProdIsNew(p.is_new || false);
    setActiveTab('products');
  };

  const handleDeleteProduct = async (id: string) => {
    if (profile?.role !== 'admin' && profile?.role !== 'manager') return;
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== id));
      alert('Product deleted.');
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not Authenticated View (Glassmorphism Signin)
  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        {/* Decorative ambient spots */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-white/3 blur-[90px]" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-zinc-900/60 border border-white/10 p-8 rounded-2xl backdrop-blur-xl shadow-2xl space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-zinc-400">
              <Shield size={24} />
            </div>
            <h2 className="text-xl font-bold tracking-widest text-white uppercase font-display">SILUM SECURE</h2>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono">Administration portal access</p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@silum.com"
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-white/20"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Access Key (Password)</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-white/20"
              />
            </div>

            {authError && (
              <p className="text-red-500 text-xs font-mono tracking-wider">{authError}</p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-white text-black font-semibold rounded-xl text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
            >
              {authLoading ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Key size={14} />
                  {authMode === 'login' ? 'Authenticate' : 'Request Access'}
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-[10px] tracking-widest font-mono text-zinc-400 hover:text-white uppercase transition-colors"
            >
              {authMode === 'login' ? 'Switch to Registration request' : 'Back to Authentication'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Access Denied (Customer trying to view panel)
  if (profile.role === 'customer') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-center p-4">
        <div className="mx-auto w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center text-red-500 mb-4 animate-pulse">
          <Shield size={24} />
        </div>
        <h2 className="text-xl uppercase tracking-widest text-white mb-2">Access Restrained</h2>
        <p className="text-sm text-zinc-400 max-w-sm font-light leading-relaxed mb-6">
          Your profile email <strong className="text-white">{profile.email}</strong> is not configured as staff. Update the role column in your Supabase <code className="text-xs bg-zinc-900 px-1 py-0.5 rounded text-white font-mono">profiles</code> table to admin, manager, or editor to gain entrance.
        </p>
        <button
          onClick={signOut}
          className="px-6 py-2.5 border border-white/10 rounded-xl text-xs font-mono tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 transition-all uppercase"
        >
          Sign Out & Return
        </button>
      </div>
    );
  }

  const userRole = profile.role; // admin, manager, or editor
  const allowedTabs = [
    { id: 'homepage', label: 'Homepage Editor', icon: FileText, allowed: ['admin', 'manager', 'editor'] },
    { id: 'products', label: 'Product Manager', icon: ShoppingBag, allowed: ['admin', 'manager'] },
    { id: 'orders', label: 'Orders Log', icon: ClipboardList, allowed: ['admin'] },
    { id: 'subscribers', label: 'Newsletter Subscriptions', icon: Mail, allowed: ['admin'] }
  ].filter(t => t.allowed.includes(userRole));

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-light py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Portal Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-6 mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
              <Shield size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-widest uppercase text-white font-display">SILUM portal</h1>
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider mt-1">
                Access Level: <span className="text-amber-500 font-semibold">{userRole}</span> ({profile.name})
              </p>
            </div>
          </div>
          
          <button
            onClick={signOut}
            className="flex items-center gap-2 border border-white/10 bg-zinc-900/60 hover:bg-white/5 hover:text-white px-4 py-2 text-xs font-mono tracking-widest uppercase rounded-xl transition-all text-zinc-400 self-start md:self-auto"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4 mb-8">
          {allowedTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono tracking-wider rounded-lg border transition-all uppercase ${
                  isActive
                    ? 'bg-white text-black border-white font-semibold'
                    : 'bg-zinc-900 text-zinc-400 border-white/5 hover:border-white/10 hover:text-white'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Views */}
        <div className="space-y-8">
          
          {/* 1. HOMEPAGE SETTINGS */}
          {activeTab === 'homepage' && allowedTabs.some(t => t.id === 'homepage') && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/30 border border-white/5 p-6 md:p-8 rounded-2xl max-w-3xl"
            >
              <h2 className="text-lg uppercase tracking-wider mb-6 text-white font-medium border-b border-white/5 pb-2">Edit Homepage Layout</h2>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Hero Title</label>
                    <input
                      type="text"
                      required
                      value={heroTitle}
                      onChange={(e) => setHeroTitle(e.target.value)}
                      placeholder="THE SILUM LEGACY"
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Hero Subtitle</label>
                    <input
                      type="text"
                      required
                      value={heroSubtitle}
                      onChange={(e) => setHeroSubtitle(e.target.value)}
                      placeholder="LIMITED EDITION SERIES"
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-white/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Featured Title</label>
                    <input
                      type="text"
                      required
                      value={featuredTitle}
                      onChange={(e) => setFeaturedTitle(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Featured Subtitle</label>
                    <input
                      type="text"
                      required
                      value={featuredSubtitle}
                      onChange={(e) => setFeaturedSubtitle(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-white/20"
                    />
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-amber-500">Newsletter Modal Promo Block</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Signup Box Title</label>
                      <input
                        type="text"
                        required
                        value={signupTitle}
                        onChange={(e) => setSignupTitle(e.target.value)}
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-white/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Signup Box Subtitle</label>
                      <input
                        type="text"
                        required
                        value={signupSubtitle}
                        onChange={(e) => setSignupSubtitle(e.target.value)}
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-white/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Promo Modal Image URL</label>
                    <input
                      type="text"
                      required
                      value={signupImage}
                      onChange={(e) => setSignupImage(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Newsletter Discount Rate (%)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={100}
                      value={discountPercentage}
                      onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-white/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="bg-white text-black font-semibold rounded-lg px-6 py-2.5 text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors flex items-center justify-center font-mono mt-4"
                >
                  {savingSettings ? 'Saving...' : 'Update Settings'}
                </button>
              </form>
            </motion.div>
          )}

          {/* 2. PRODUCT MANAGER */}
          {activeTab === 'products' && allowedTabs.some(t => t.id === 'products') && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Product Form (Left / Col-span-5) */}
              <div className="lg:col-span-5 bg-zinc-900/30 border border-white/5 p-6 rounded-2xl h-fit">
                <h2 className="text-md uppercase tracking-wider mb-6 text-white border-b border-white/5 pb-2">
                  {editingProduct ? `Edit Product: ${editingProduct}` : 'Add New Product'}
                </h2>
                
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  {!editingProduct && (
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Product ID (Unique Key)</label>
                      <input
                        type="text"
                        required
                        value={prodId}
                        onChange={(e) => setProdId(e.target.value)}
                        placeholder="p7"
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-white/20 font-mono"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Product Name</label>
                    <input
                      type="text"
                      required
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      placeholder="Signature Linen Overshirt"
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-white/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Price (৳ BDT)</label>
                      <input
                        type="text"
                        required
                        value={prodPrice}
                        onChange={(e) => setProdPrice(e.target.value)}
                        placeholder="119.95"
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-white/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Category</label>
                      <select
                        value={prodCat}
                        onChange={(e) => setProdCat(e.target.value)}
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-white/20"
                      >
                        <option value="Capsule">Capsule</option>
                        <option value="Signature">Signature</option>
                        <option value="Essentials">Essentials</option>
                        <option value="Accessories">Accessories</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Main Image URL</label>
                    <input
                      type="text"
                      required
                      value={prodImg}
                      onChange={(e) => setProdImg(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-white/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Sizes (comma sep)</label>
                      <input
                        type="text"
                        required
                        value={prodSizes}
                        onChange={(e) => setProdSizes(e.target.value)}
                        placeholder="S, M, L, XL"
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-white/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Colors (comma sep)</label>
                      <input
                        type="text"
                        value={prodColors}
                        onChange={(e) => setProdColors(e.target.value)}
                        placeholder="Black, White"
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-white/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={prodDesc}
                      onChange={(e) => setProdDesc(e.target.value)}
                      placeholder="Product short summary description..."
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-white/20 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Details (Line separated bullet points)</label>
                    <textarea
                      rows={3}
                      value={prodDetails}
                      onChange={(e) => setProdDetails(e.target.value)}
                      placeholder="100% Cotton&#10;Boxy fit&#10;Made in Bangladesh"
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-white/20 resize-none font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isNew"
                      checked={prodIsNew}
                      onChange={(e) => setProdIsNew(e.target.checked)}
                      className="rounded bg-zinc-900 border-white/10 text-white focus:ring-0"
                    />
                    <label htmlFor="isNew" className="text-xs font-mono uppercase text-zinc-400 select-none">Mark as New Arrival</label>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="submit"
                      disabled={savingProduct}
                      className="flex-grow bg-white text-black font-semibold rounded-lg py-2.5 text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors flex items-center justify-center font-mono"
                    >
                      {savingProduct ? 'Saving...' : editingProduct ? 'Save Product' : 'Add Product'}
                    </button>
                    {editingProduct && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct(null);
                          setProdId('');
                          setProdName('');
                          setProdPrice('');
                          setProdImg('');
                          setProdDesc('');
                          setProdDetails('');
                        }}
                        className="px-4 py-2.5 bg-zinc-800 text-white text-xs font-mono rounded-lg hover:bg-zinc-700"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Product List (Right / Col-span-7) */}
              <div className="lg:col-span-7 bg-zinc-900/10 border border-white/5 p-6 rounded-2xl">
                <h2 className="text-md uppercase tracking-wider mb-6 text-white border-b border-white/5 pb-2">Products Database ({products.length})</h2>
                
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {products.map((p) => (
                    <div key={p.id} className="flex gap-4 items-center bg-zinc-900/40 p-3 rounded-xl border border-white/5 justify-between">
                      <div className="flex gap-3 items-center">
                        <img src={p.image} alt={p.name} className="w-12 h-14 object-cover bg-zinc-950 rounded-lg border border-white/5" />
                        <div>
                          <h4 className="text-xs font-medium text-white tracking-wide uppercase">{p.name}</h4>
                          <p className="text-[10px] font-mono text-zinc-500 uppercase mt-0.5">{p.id} | {p.category} | ৳{p.price}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditProductClick(p)}
                          className="p-2 text-zinc-400 hover:text-white bg-zinc-800/40 border border-white/5 rounded-lg transition-colors"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-2 text-zinc-400 hover:text-red-400 bg-zinc-800/40 border border-white/5 rounded-lg transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {/* 3. ORDERS LOG (Only Admin) */}
          {activeTab === 'orders' && allowedTabs.some(t => t.id === 'orders') && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/30 border border-white/5 p-6 rounded-2xl"
            >
              <h2 className="text-lg uppercase tracking-wider mb-6 text-white font-medium border-b border-white/5 pb-2">Customer Orders Log ({orders.length})</h2>
              
              {orders.length === 0 ? (
                <p className="text-xs text-zinc-500 font-mono italic">No customer orders recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-zinc-400 uppercase font-mono tracking-wider">
                        <th className="py-3 px-4 font-semibold">Order ID</th>
                        <th className="py-3 px-4 font-semibold">Customer</th>
                        <th className="py-3 px-4 font-semibold">Phone & City</th>
                        <th className="py-3 px-4 font-semibold">Method</th>
                        <th className="py-3 px-4 font-semibold">Amount</th>
                        <th className="py-3 px-4 font-semibold">Status</th>
                        <th className="py-3 px-4 font-semibold text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-white/2 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-medium text-white">{o.id}</td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold">{o.customer_name}</div>
                            <div className="text-[10px] text-zinc-500 truncate max-w-[200px]" title={o.items.join(', ')}>
                              {o.items.join(', ')}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono">
                            <div>{o.phone}</div>
                            <div className="text-[10px] text-zinc-500">{o.city}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono uppercase">{o.payment_method}</td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-white">৳{o.total}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider font-semibold ${
                              o.status === 'Pending' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-500' :
                              o.status === 'Shipped' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-500' :
                              o.status === 'Delivered' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500' :
                              'bg-red-500/10 border border-red-500/20 text-red-500'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-zinc-500">{o.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* 4. NEWSLETTER SUBSCRIBERS (Only Admin) */}
          {activeTab === 'subscribers' && allowedTabs.some(t => t.id === 'subscribers') && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/30 border border-white/5 p-6 rounded-2xl max-w-xl"
            >
              <h2 className="text-lg uppercase tracking-wider mb-6 text-white font-medium border-b border-white/5 pb-2">Newsletter Subscriptions ({subscribers.length})</h2>
              
              {subscribers.length === 0 ? (
                <p className="text-xs text-zinc-500 font-mono italic">No mailing list subscriptions.</p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {subscribers.map((s) => (
                    <div key={s.id} className="flex justify-between items-center bg-zinc-900/40 border border-white/5 p-3 rounded-lg font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <Mail size={12} className="text-zinc-500" />
                        <span className="text-white">{s.email}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 uppercase">via {s.source || 'Unknown'}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </div>

      </div>
    </div>
  );
}
