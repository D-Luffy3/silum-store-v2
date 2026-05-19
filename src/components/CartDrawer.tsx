'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, Plus, Minus, CheckCircle, CreditCard } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'success'>('cart');
  
  // Checkout Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [deliveryLoc, setDeliveryLoc] = useState('Inside Dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'bKash' | 'Nagad'>('COD');
  const [trxId, setTrxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');

  const shippingCost = deliveryLoc === 'Inside Dhaka' ? 60 : 120;
  const grandTotal = cartTotal + shippingCost;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) return;

    setLoading(true);
    const generatedOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const { error } = await supabase.from('orders').insert([
        {
          id: generatedOrderId,
          customer_name: name,
          phone,
          address,
          city,
          delivery_location: deliveryLoc,
          payment_method: paymentMethod,
          transaction_id: paymentMethod !== 'COD' ? trxId : null,
          total: grandTotal.toFixed(2),
          status: 'Pending',
          items: cartItems.map((item) => `${item.name} (${item.size}${item.color ? `, ${item.color}` : ''}) x${item.quantity}`),
          date: new Date().toISOString().split('T')[0]
        }
      ]);

      if (error) throw error;

      setOrderId(generatedOrderId);
      setCheckoutStep('success');
      clearCart();
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset checkout step on close unless successful
    if (checkoutStep === 'success') {
      setCheckoutStep('cart');
      setName('');
      setPhone('');
      setAddress('');
      setTrxId('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black backdrop-blur-xs"
          />

          {/* Drawer Container */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-zinc-950 border-l border-white/10 text-white flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={20} className="text-zinc-400" />
                  <h2 className="text-lg font-medium tracking-wider uppercase">Shopping Bag</h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 rounded-full text-zinc-400 hover:text-white transition-colors hover:bg-white/5"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {checkoutStep === 'cart' && (
                  <>
                    {cartItems.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                        <ShoppingBag size={48} className="mb-4 stroke-[1]" />
                        <p className="text-sm font-light uppercase tracking-wider">Your bag is empty</p>
                        <button
                          onClick={handleClose}
                          className="mt-4 text-xs font-mono tracking-widest text-white border border-white/15 px-4 py-2 hover:bg-white/5 transition-colors uppercase"
                        >
                          Continue Shopping
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex gap-4 border-b border-white/5 pb-4">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-20 h-24 object-cover bg-zinc-900 border border-white/5 rounded-lg"
                            />
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <h3 className="text-sm font-medium tracking-wide leading-tight">{item.name}</h3>
                                <p className="text-xs text-zinc-400 mt-1 uppercase font-mono">
                                  Size: {item.size} {item.color ? `| Color: ${item.color}` : ''}
                                </p>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center border border-white/10 rounded-md bg-zinc-900">
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <span className="px-2 text-xs font-mono font-medium">{item.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-mono font-semibold">
                                    {item.currency}{(parseFloat(item.price) * item.quantity).toFixed(2)}
                                  </span>
                                  <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {checkoutStep === 'details' && (
                  <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                    <h3 className="text-sm font-mono tracking-widest text-zinc-400 uppercase mb-4">Shipping & Payment</h3>
                    
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-white/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-white/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Shipping Address</label>
                      <textarea
                        required
                        rows={2}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House, Street, Area..."
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-white/30 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">City</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-white/30"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Location</label>
                        <select
                          value={deliveryLoc}
                          onChange={(e) => setDeliveryLoc(e.target.value)}
                          className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-white/30"
                        >
                          <option value="Inside Dhaka">Inside Dhaka (৳60)</option>
                          <option value="Outside Dhaka">Outside Dhaka (৳120)</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5">
                      <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2">Payment Method</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['COD', 'bKash', 'Nagad'] as const).map((method) => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setPaymentMethod(method)}
                            className={`py-2 px-1 text-xs font-mono font-medium rounded-lg border text-center transition-all ${
                              paymentMethod === method
                                ? 'bg-white text-black border-white'
                                : 'bg-zinc-900 text-zinc-400 border-white/10 hover:border-white/20'
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>

                    {paymentMethod !== 'COD' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2 pt-2"
                      >
                        <p className="text-[11px] text-amber-500/90 leading-tight font-mono bg-amber-500/5 p-3 rounded-lg border border-amber-500/10">
                          Send money to <span className="font-semibold text-white">01XXXXXXXXX</span> (Merchant/Personal) and enter Transaction ID below.
                        </p>
                        <div>
                          <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Transaction ID</label>
                          <input
                            type="text"
                            required
                            value={trxId}
                            onChange={(e) => setTrxId(e.target.value)}
                            placeholder="TRX-109283"
                            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-white/30"
                          />
                        </div>
                      </motion.div>
                    )}

                    <div className="pt-4 space-y-2 border-t border-white/10 text-sm font-light">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Subtotal</span>
                        <span className="font-mono">৳{cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Shipping</span>
                        <span className="font-mono">৳{shippingCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-base font-medium pt-2 border-t border-white/5">
                        <span>Grand Total</span>
                        <span className="font-mono text-white text-lg">৳{grandTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 mt-4 bg-white text-black font-semibold rounded-xl text-sm tracking-widest uppercase hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <CreditCard size={16} />
                          Place Order (৳{grandTotal.toFixed(2)})
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setCheckoutStep('cart')}
                      className="w-full text-center text-xs tracking-wider font-mono text-zinc-400 hover:text-white uppercase transition-colors pt-2"
                    >
                      Back to Cart
                    </button>
                  </form>
                )}

                {checkoutStep === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center p-4"
                  >
                    <CheckCircle size={56} className="text-emerald-400 mb-4 stroke-[1.5]" />
                    <h3 className="text-xl font-medium tracking-wide uppercase mb-2">Order Confirmed</h3>
                    <p className="text-zinc-400 text-sm font-light leading-relaxed mb-6">
                      Your order has been recorded in our system. We will contact you soon.
                    </p>
                    <div className="bg-zinc-900 border border-white/5 p-4 rounded-xl font-mono text-xs text-zinc-400 mb-8 w-full">
                      <div className="flex justify-between mb-1">
                        <span>Order ID:</span>
                        <span className="text-white font-medium">{orderId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="text-amber-500 font-medium">Pending Review</span>
                      </div>
                    </div>
                    <button
                      onClick={handleClose}
                      className="px-6 py-3 bg-white text-black text-xs font-semibold uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Footer (only visible in Cart view) */}
              {checkoutStep === 'cart' && cartItems.length > 0 && (
                <div className="p-6 border-t border-white/10 bg-zinc-900/30">
                  <div className="space-y-4 mb-6 text-sm font-light">
                    <div className="flex justify-between text-zinc-400">
                      <span>Subtotal</span>
                      <span className="font-mono text-white text-base font-medium">৳{cartTotal.toFixed(2)}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-normal">
                      SHIPPING COST AND APPLICABLE PROMOS WILL BE CALCULATED AT THE NEXT STEP.
                    </p>
                  </div>
                  <button
                    onClick={() => setCheckoutStep('details')}
                    className="w-full py-3.5 bg-white text-black font-semibold rounded-xl text-sm tracking-widest uppercase hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
