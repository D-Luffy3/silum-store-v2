'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  // Use a fallback WhatsApp number (e.g., +8801700000000) or load from env/settings
  const whatsappNumber = '8801700000000'; 
  const message = encodeURIComponent("Hello SILUM, I would like to inquire about your products.");
  const url = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-emerald-500 text-white rounded-full shadow-2xl hover:bg-emerald-600 transition-colors"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.5, type: 'spring' }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      {/* Outer Pulse ring */}
      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping -z-10" />
      
      <MessageCircle size={28} className="fill-current" />
    </motion.a>
  );
};
