import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { MapPin, Calendar, DollarSign, Utensils, Car, Heart, ArrowRight, Plus, X } from 'lucide-react';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';

const DINING_OPTIONS = ['Local Gems', 'Michelin Star', 'Street Food', 'Trendy & Modern', 'Vegetarian', 'Halal', 'Other'];
const TRANSPORT_OPTIONS = ['Public Transit', 'Car Rental', 'Taxi / Uber', 'Walking', 'Bicycle', 'Self-drive'];
const INTEREST_OPTIONS = ['Nature & Parks', 'History & Culture', 'Hiking', 'Family Friendly', 'Photography', 'Shopping', 'Nightlife', 'Art Museums'];
const CURRENCY_OPTIONS = [
  { code: 'USD', label: 'USD ($)', symbol: '$' },
  { code: 'CNY', label: 'CNY (¥)', symbol: '¥' },
  { code: 'EUR', label: 'EUR (€)', symbol: '€' },
  { code: 'JPY', label: 'JPY (¥)', symbol: '¥' },
  { code: 'GBP', label: 'GBP (£)', symbol: '£' },
  { code: 'HKD', label: 'HKD ($)', symbol: '$' },
  { code: 'TWD', label: 'TWD ($)', symbol: '$' },
  { code: 'AUD', label: 'AUD ($)', symbol: '$' },
  { code: 'CAD', label: 'CAD ($)', symbol: '$' },
  { code: 'SGD', label: 'SGD ($)', symbol: '$' },
];

const libraries: ("places")[] = ["places"];

export default function Preferences() {
  const navigate = useNavigate();
  const { preferences, setPreferences, unlockSection, saveCurrentTrip, tripCount } = useAppStore();
  
  const [localPrefs, setLocalPrefs] = useState(preferences);
  const [otherDiningInput, setOtherDiningInput] = useState('');
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [destinationInput, setDestinationInput] = useState('');

  const googleMapsApiKey = (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || '';
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey,
    libraries,
  });

  const handleToggle = (category: 'dining' | 'transport' | 'interests', value: string) => {
    setLocalPrefs((prev) => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const onLoad = (autoC: google.maps.places.Autocomplete) => {
    setAutocomplete(autoC);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      const name = place.formatted_address || place.name;
      if (name && !localPrefs.destinations.includes(name)) {
        setLocalPrefs(prev => ({
          ...prev,
          destinations: [...prev.destinations, name]
        }));
        setDestinationInput('');
      }
    }
  };

  const removeDestination = (dest: string) => {
    setLocalPrefs(prev => ({
      ...prev,
      destinations: prev.destinations.filter(d => d !== dest)
    }));
  };

  const handleNext = () => {
    const finalDining = localPrefs.dining.map(d => d === 'Other' ? `Other: ${otherDiningInput}` : d);
    setPreferences({ ...localPrefs, dining: finalDining });
    unlockSection('explore');
    saveCurrentTrip();
    navigate('/attractions');
  };

  const isOtherDiningSelected = localPrefs.dining.includes('Other');
  const isOtherDiningValid = !isOtherDiningSelected || otherDiningInput.trim().length > 0;
  const isNextDisabled = localPrefs.destinations.length === 0 || !isOtherDiningValid;

  return (
    <div className="max-w-4xl mx-auto p-8 pb-24">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Plan Your Trip</h1>
        <p className="text-lg text-slate-600">Tell us what you like, and we'll craft the perfect itinerary.</p>
      </div>

      <div className="space-y-12">
        {/* Basic Info */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-slate-800">
            <MapPin className="text-emerald-600" />
            The Basics
          </h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Destinations</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {localPrefs.destinations.map((dest) => (
                  <div key={dest} className="flex items-center gap-2 bg-lime-50 text-lime-700 px-3 py-1.5 rounded-full text-sm font-medium border border-lime-100 animate-in zoom-in-95 duration-200">
                    {dest}
                    <button 
                      onClick={() => removeDestination(dest)}
                      className="hover:text-lime-900 transition-colors"
                    >
                      <ArrowRight className="w-3 h-3 rotate-45" />
                    </button>
                  </div>
                ))}
                {localPrefs.destinations.length === 0 && (
                  <span className="text-slate-400 text-sm italic">No destinations added yet.</span>
                )}
              </div>
              {isLoaded ? (
                <Autocomplete
                  onLoad={onLoad}
                  onPlaceChanged={onPlaceChanged}
                  options={{ types: ['(cities)'] }}
                  fields={['formatted_address', 'name']}
                >
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Add a city (e.g., Tokyo, Paris, New York)"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-all"
                      value={destinationInput}
                      onChange={(e) => setDestinationInput(e.target.value)}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Plus className="w-5 h-5" />
                    </div>
                  </div>
                </Autocomplete>
              ) : (
                <input
                  type="text"
                  placeholder="Loading..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-all"
                  disabled
                />
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Duration (Total Days)</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="number"
                    min="1"
                    max="60"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    value={localPrefs.duration}
                    onChange={(e) => setLocalPrefs({ ...localPrefs, duration: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Budget</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <select
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none bg-white"
                    value={localPrefs.budget}
                    onChange={(e) => setLocalPrefs({ ...localPrefs, budget: e.target.value as any })}
                  >
                    <option value="Low">Budget-Friendly</option>
                    <option value="Mid">Moderate</option>
                    <option value="High">Luxury</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Currency</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold w-5 h-5 flex items-center justify-center">
                    {CURRENCY_OPTIONS.find(c => c.code === localPrefs.currency)?.symbol || '$'}
                  </div>
                  <select
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none bg-white"
                    value={localPrefs.currency}
                    onChange={(e) => setLocalPrefs({ ...localPrefs, currency: e.target.value })}
                  >
                    {CURRENCY_OPTIONS.map(curr => (
                      <option key={curr.code} value={curr.code}>{curr.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dining */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-slate-800">
            <Utensils className="text-emerald-600" />
            Dining Style
          </h2>
          <div className="flex flex-wrap gap-3">
            {DINING_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => handleToggle('dining', option)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  localPrefs.dining.includes(option)
                    ? 'bg-emerald-900 text-white shadow-md'
                    : 'bg-white text-slate-600 border-2 border-slate-100 hover:border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          
          {isOtherDiningSelected && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-medium text-slate-700 mb-2">Please specify other dining preferences</label>
              <input
                type="text"
                placeholder="e.g., Gluten-free, Kosher, specific allergies..."
                className="w-full max-w-md px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                value={otherDiningInput}
                onChange={(e) => setOtherDiningInput(e.target.value)}
                required
              />
              {!isOtherDiningValid && (
                <p className="text-xs text-red-500 mt-1">This field is required when 'Other' is selected.</p>
              )}
            </div>
          )}
        </section>

        {/* Transport */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-slate-800">
            <Car className="text-emerald-600" />
            Transportation
          </h2>
          <div className="flex flex-wrap gap-3">
            {TRANSPORT_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => handleToggle('transport', option)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  localPrefs.transport.includes(option)
                    ? 'bg-emerald-900 text-white shadow-md'
                    : 'bg-white text-slate-600 border-2 border-slate-100 hover:border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </section>

        {/* Interests */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-slate-800">
            <Heart className="text-emerald-600" />
            Interests
          </h2>
          <div className="flex flex-wrap gap-3">
            {INTEREST_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => handleToggle('interests', option)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  localPrefs.interests.includes(option)
                    ? 'bg-emerald-900 text-white shadow-md'
                    : 'bg-white text-slate-600 border-2 border-slate-100 hover:border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 px-8 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
        <div className="text-slate-500 font-medium text-sm uppercase tracking-wider">
          Step 1 of 4
        </div>
        <button
          onClick={handleNext}
          disabled={isNextDisabled}
          className="flex items-center gap-2 bg-emerald-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/10"
        >
          Explore Attractions
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
