import React, { useState } from 'react';
import { useAppStore } from '../store';
import { CreditCard, Calendar, MapPin, CheckCircle2, ArrowRight, Plane, Hotel, Car, FileText, Mail, X, RefreshCw, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDestinations } from '../utils';

declare global {
  interface Window {
    html2pdf: any;
  }
}

export default function Checkout() {
  const { preferences, itinerary } = useAppStore();
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const totalDays = preferences.duration;
  const totalAttractions = itinerary.reduce((acc, day) => acc + day.items.filter(i => i.type === 'attraction').length, 0);

  const destination = formatDestinations(preferences.destinations) || 'Your Destination';

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    
    setIsEmailSending(true);
    // Simulate API call
    console.log(`[Lead Capture] Sending itinerary to: ${emailInput}`);
    
    // PDF Generation
    setIsGeneratingPdf(true);
    
    // Wait for DOM to update with PDF-specific content
    await new Promise(resolve => setTimeout(resolve, 500));

    const element = document.getElementById('itinerary-content');
    
    if (element && window.html2pdf) {
      const opt = {
        margin: 10,
        filename: `WanderAI_Trip_to_${destination}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          useCORS: true, 
          scale: 2,
          letterRendering: true,
          scrollY: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      try {
        await window.html2pdf().from(element).set(opt).save();
      } catch (err) {
        console.error('PDF Generation Error:', err);
      }
    }

    setIsGeneratingPdf(false);
    setIsEmailSending(false);
    setIsSuccess(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 pb-32 relative">
      {/* PDF Generation Loading Overlay */}
      {isGeneratingPdf && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
            <div className="relative">
              <RefreshCw className="w-12 h-12 text-emerald-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div className="text-center">
              <h4 className="text-lg font-bold text-slate-900">Generating high-resolution document...</h4>
              <p className="text-sm text-slate-500">Please wait while we prepare your bespoke itinerary.</p>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">
                {isSuccess ? 'Itinerary Secured.' : 'Where should we send your backup copy?'}
              </h3>
              <button onClick={() => { setIsEmailModalOpen(false); setIsSuccess(false); setEmailInput(''); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            {isSuccess ? (
              <div className="p-8 space-y-6 text-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in-50 duration-500">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-bold text-slate-900">Itinerary Secured.</h4>
                  <p className="text-slate-600">
                    Email sync is in beta. Your PDF is ready for immediate download below.
                  </p>
                </div>
                <button 
                  onClick={() => { setIsEmailModalOpen(false); setIsSuccess(false); setEmailInput(''); }}
                  className="w-full bg-emerald-900 text-white py-4 rounded-xl font-bold hover:bg-emerald-800 transition-all flex items-center justify-center gap-2"
                >
                  Join the Waitlist
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendEmail} className="p-8 space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-lime-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-lime-600" />
                  </div>
                  <p className="text-slate-600">Enter your email address to receive a deep-dive itinerary with maps, booking links, and expert tips.</p>
                </div>
                <input 
                  type="email" 
                  required
                  placeholder="your@email.com"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none transition-all"
                />
                <button 
                  type="submit"
                  disabled={isEmailSending}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isEmailSending ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Processing your premium itinerary...
                    </>
                  ) : 'Send Now'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
      <div id="itinerary-content" className="bg-white pb-20 px-4" style={{ colorScheme: 'light' }}>
        {/* PDF Header - Only visible during generation */}
        {isGeneratingPdf && (
          <div className="mb-12 border-b-2 border-slate-100 pb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-600 p-2 rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <span className="text-2xl font-black text-slate-900 tracking-tighter">WanderAI</span>
              </div>
              <div className="text-right">
                <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Your Bespoke Itinerary</h1>
                <p className="text-xs text-slate-400">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* PDF Summary Section - Only visible during generation */}
        {isGeneratingPdf && (
          <div className="mb-12 bg-slate-50 rounded-3xl p-8 border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              Trip Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Destination</p>
                <p className="font-bold text-slate-900">{destination}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Duration</p>
                <p className="font-bold text-slate-900">{totalDays} Days</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Budget</p>
                <p className="font-bold text-slate-900">{preferences.budget}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Attractions</p>
                <p className="font-bold text-slate-900">{totalAttractions}</p>
              </div>
            </div>
          </div>
        )}

        {/* Screen Header - Hidden during generation */}
        {!isGeneratingPdf && (
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
        )}

        <div className={isGeneratingPdf ? "w-full" : "grid grid-cols-1 md:grid-cols-3 gap-8"}>
          
          {/* Main Content: Booking Links & Itinerary Summary */}
          <div className={isGeneratingPdf ? "w-full space-y-8" : "md:col-span-2 space-y-8"}>
            {!isGeneratingPdf && (
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
            )}

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
          {!isGeneratingPdf && (
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
                    className="w-full bg-emerald-900 text-white py-4 rounded-xl font-bold hover:bg-emerald-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
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
          )}

        </div>
      </div>
    </div>
  );
}
