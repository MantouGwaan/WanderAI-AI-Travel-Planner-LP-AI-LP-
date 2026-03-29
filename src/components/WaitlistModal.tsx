import React, { useState } from 'react';
import { X, Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  onSuccess?: () => void;
  formLocation?: string;
}

export default function WaitlistModal({ 
  isOpen, 
  onClose, 
  title = "Project Not Yet Launched", 
  description = "Coming soon! Leave your email, and we'll notify you as soon as we launch.",
  onSuccess,
  formLocation = 'lp_top_form'
}: WaitlistModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

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
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setIsSuccess(true);
        
        // GA Tracking
        if (window.trackLeadGeneration) {
          window.trackLeadGeneration(formLocation);
        }

        if (onSuccess) onSuccess();
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
              <h4 className="text-2xl font-bold text-slate-900">Thank you for your interest!</h4>
              <p className="text-slate-600">
                You've successfully joined the waitlist. We'll notify you as soon as we're live.
              </p>
            </div>
            <button 
              onClick={handleClose}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
              <p className="text-slate-600">{description}</p>
            </div>
            <input 
              type="email" 
              required
              placeholder="Your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
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
              ) : 'Join Waitlist'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
