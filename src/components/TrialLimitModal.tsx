import React, { useState } from 'react';
import { X, AlertCircle, ArrowRight, Mail, CheckCircle2, Loader2 } from 'lucide-react';

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
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setIsSuccess(false);
      setEmail('');
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('https://formspree.io/f/mbdpgowy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, source: 'trial_limit_reached' })
      });

      if (response.ok) {
        setIsSuccess(true);
        
        // GA Tracking
        if (window.trackLeadGeneration) {
          window.trackLeadGeneration('limit_form');
        }
      } else {
        console.error('Formspree submission failed');
      }
    } catch (error) {
      console.error('Error submitting to Formspree:', error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 relative">
        <button 
          onClick={handleClose} 
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="p-8 space-y-6 text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in-50 duration-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <div className="space-y-2">
              <h4 className="text-2xl font-bold text-slate-900">Thank you!</h4>
              <p className="text-slate-600">
                We've received your request. We'll notify you about our Pro features soon.
              </p>
            </div>
            <button 
              onClick={handleClose}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
            >
              Close
            </button>
          </div>
        ) : (
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  required
                  placeholder="Your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : 'Notify me about Pro'}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400">Or</span>
              </div>
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
                onClick={handleClose}
                className="w-full bg-slate-100 text-slate-600 py-4 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                Maybe Later
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
