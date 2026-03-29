import React, { useState } from 'react';
import { useAppStore } from '../store';
import { CreditCard, Calendar, MapPin, CheckCircle2, ArrowRight, Plane, Hotel, Car, Mail, X, RefreshCw, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDestinations } from '../utils';

export default function Checkout() {
  const { preferences, itinerary } = useAppStore();
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isEmailSending, setIsEmailSending] = useState(false);
  const navigate = useNavigate();

  const totalDays = preferences.duration;
  const totalAttractions = itinerary.reduce((acc, day) => acc + day.items.filter(i => i.type === 'attraction').length, 0);

  const destination = formatDestinations(preferences.destinations) || 'Your Destination';

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    
    setIsEmailSending(true);
    try {
      const response = await fetch('https://formspree.io/f/mbdpgowy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          email: emailInput,
          message: `Itinerary for ${destination} (${totalDays} days)`,
          itinerary: itinerary
        })
      });

      if (response.ok) {
        setIsSuccess(true);
        
        // GA Tracking
        if (window.trackLeadGeneration) {
          window.trackLeadGeneration('demo_pdf_export');
        }
      } else {
        console.error('Formspree submission failed');
      }
    } catch (error) {
      console.error('Error submitting to Formspree:', error);
    }
    setIsEmailSending(false);
  };

  const handleCloseModal = () => {
    setIsEmailModalOpen(false);
    setIsSuccess(false);
    setEmailInput('');
  };

  const handleReturnHome = () => {
    handleCloseModal();
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto p-8 pb-32 relative">
      {/* Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">
                {isSuccess ? 'Successfully Joined Waitlist' : 'Project Not Yet Launched'}
              </h3>
              <button onClick={handleReturnHome} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
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
                  onClick={handleReturnHome}
                  className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  Back to Home
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendEmail} className="p-8 space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="text-slate-600">Coming soon! Leave your email, and we'll notify you as soon as we launch.</p>
                </div>
                <input 
                  type="email" 
                  required
                  placeholder="Your email address"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
                <button 
                  type="submit"
                  disabled={isEmailSending}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isEmailSending ? (
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
      )}
      <div id="itinerary-content" className="bg-white pb-20 px-4" style={{ colorScheme: 'light' }}>
        {/* Screen Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight flex items-center gap-3">
              <CheckCircle2 className="text-emerald-500 w-10 h-10" />
              Trip Confirmed!
            </h1>
            <p className="text-lg text-slate-600">
              Your {totalDays}-day adventure to {destination} is ready.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-500 bg-slate-100 px-4 py-2 rounded-full">
            <Calendar className="w-4 h-4" />
            {totalDays} Days
            <span className="mx-2 text-slate-300">|</span>
            <MapPin className="w-4 h-4" />
            {destination}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Content: Booking Links & Itinerary Summary */}
          <div className="md:col-span-2 space-y-8">
            <section className="print:hidden">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Next Steps: Bookings</h2>
                <div className="space-y-4">
                  {/* Flights */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-start gap-4">
                      <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Plane className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Flights</h3>
                        <p className="text-slate-600 text-sm mb-4">Find the best deals for your dates.</p>
                        <div className="flex gap-3">
                          <a href="https://www.skyscanner.com" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1">
                            Skyscanner <ArrowRight className="w-4 h-4" />
                          </a>
                          <a href="https://www.google.com/flights" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1">
                            Google Flights <ArrowRight className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Accommodation */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-start gap-4">
                      <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Hotel className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Accommodation</h3>
                        <p className="text-slate-600 text-sm mb-4">Book hotels near your planned activities.</p>
                        <div className="flex gap-3">
                          <a href="https://www.booking.com" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1">
                            Booking.com <ArrowRight className="w-4 h-4" />
                          </a>
                          <a href="https://www.airbnb.com" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1">
                            Airbnb <ArrowRight className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transport */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-start gap-4">
                      <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Car className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Local Transport</h3>
                        <p className="text-slate-600 text-sm mb-4">Get around easily based on your preferences.</p>
                        <div className="flex gap-3">
                          <a href="https://www.rentalcars.com" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1">
                            RentalCars <ArrowRight className="w-4 h-4" />
                          </a>
                          <a href="https://www.uber.com" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1">
                            Uber <ArrowRight className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

            {/* Itinerary Summary */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-emerald-600" />
                Itinerary Overview
              </h2>
              <div className="space-y-8">
                {itinerary.map((day) => (
                  <div key={day.day} className="relative pl-8 border-l-2 border-slate-100 pb-8">
                    <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-emerald-600 border-4 border-white shadow-sm" />
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Day {day.day}</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {day.items.map((item) => (
                        <div key={item.id} className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4 border border-slate-100">
                          <div className="text-xs font-bold text-slate-400 w-20 shrink-0">{item.startTime}</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-800 truncate">{item.title}</h4>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-slate-500 capitalize">{item.type}</p>
                              {item.price && (
                                <>
                                  <span className="text-slate-300 text-[10px]">•</span>
                                  <p className="text-xs font-bold text-emerald-600">{item.price}</p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar: Summary */}
          <div className="md:col-span-1 print:hidden">
              <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl sticky top-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  Trip Summary
                </h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <span className="text-slate-400">Destination</span>
                    <span className="font-semibold text-right">{destination}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <span className="text-slate-400">Duration</span>
                    <span className="font-semibold">{totalDays} Days</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <span className="text-slate-400">Budget Level</span>
                    <span className="font-semibold">{preferences.budget}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <span className="text-slate-400">Currency</span>
                    <span className="font-semibold">{preferences.currency}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <span className="text-slate-400">Attractions</span>
                    <span className="font-semibold">{totalAttractions}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => setIsEmailModalOpen(true)}
                    className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    <Mail className="w-5 h-5" />
                    Send to email
                  </button>
                </div>
                <Link to="/workbench" className="w-full mt-3 bg-slate-800 text-slate-300 py-3 rounded-xl font-semibold hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                  Back to Itinerary
                </Link>
              </div>
            </div>

        </div>
      </div>
    </div>
  );
}
