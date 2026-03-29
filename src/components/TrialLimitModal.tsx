import React from 'react';
import { X, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface TrialLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrialLimitModal({ isOpen, onClose }: TrialLimitModalProps) {
  const navigate = useNavigate();

  const handleGoToArchive = () => {
    onClose();
    navigate('/');
    setTimeout(() => {
      const element = document.getElementById('archive');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl"
          >
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#064E3B] mx-auto mb-6">
                <Lock className="w-8 h-8" />
              </div>
              
              <h2 className="text-2xl font-extrabold text-slate-900 mb-4 tracking-tight">
                Trial Limit Reached
              </h2>
              
              <p className="text-slate-600 leading-relaxed mb-8">
                You've experienced the power of WanderAI's bespoke planning. To maintain our premium service quality, free trials are limited to 1 itinerary. Please view your recent itinerary in{' '}
                <button onClick={handleGoToArchive} className="text-emerald-600 font-bold hover:underline">
                  Your Archive
                </button>
                .
              </p>
              
              <div className="space-y-3">
                <a
                  href="/index.html#waitlist"
                  className="block w-full bg-[#064E3B] text-white py-4 rounded-2xl font-bold hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
                >
                  Join Waitlist for Unlimited Access
                </a>
                <button
                  onClick={onClose}
                  className="block w-full text-slate-400 text-sm font-semibold hover:text-slate-600 transition-colors py-2"
                >
                  Maybe Later
                </button>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
