import React from 'react';
import { X, AlertCircle, ArrowRight } from 'lucide-react';

interface TrialLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewPricing: () => void;
}

export default function TrialLimitModal({ 
  isOpen, 
  onClose,
  onViewPricing
}: TrialLimitModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 relative">
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Free Trial Limit Reached</h3>
            <p className="text-slate-600">
              You have reached the limit of 1 itinerary for the Free Trial. Upgrade to Pro to create unlimited itineraries and unlock more features.
            </p>
          </div>

          <div className="space-y-3">
            <button 
              onClick={onViewPricing}
              className="w-full bg-pine text-white py-4 rounded-xl font-bold hover:bg-emerald transition-all flex items-center justify-center gap-2 shadow-lg shadow-pine/20"
            >
              View Pricing
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose}
              className="w-full bg-slate-100 text-slate-600 py-4 rounded-xl font-bold hover:bg-slate-200 transition-all"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
