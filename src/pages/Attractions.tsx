import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, Attraction } from '../store';
import { ATTRACTIONS_SYSTEM_INSTRUCTION, getAttractionsPrompt } from '../constants/prompts';
import { Star, Clock, DollarSign, CheckCircle2, PlusCircle, ArrowRight, MessageSquareText, X, RefreshCw } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { useJsApiLoader } from '@react-google-maps/api';
import { formatDestinations } from '../utils';

const libraries: ("places")[] = ["places"];

// Fallback Mock Data in case API fails
const MOCK_ATTRACTIONS: Attraction[] = [
  {
    id: '1',
    name: 'Senso-ji Temple',
    image: 'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?q=80&w=800&auto=format&fit=crop',
    rating: 4.8,
    summary: "Tokyo's oldest Buddhist temple, vibrant and historic.",
    tags: ['History', 'Culture', 'Photography'],
    category: 'History & Culture',
    openHours: '06:00 - 17:00',
    price: 'Free',
    duration: 2,
    location: { lat: 35.7147, lng: 139.7966 },
    reviews: [
      { source: 'Google Maps', rating: 4.8, text: 'Absolutely stunning, especially early morning.' },
      { source: 'TripAdvisor', rating: 4.5, text: 'Crowded but a must-see in Tokyo.' }
    ]
  },
  {
    id: '2',
    name: 'Shibuya Crossing',
    image: 'https://images.unsplash.com/photo-1542051812871-7575058c1529?q=80&w=800&auto=format&fit=crop',
    rating: 4.7,
    summary: 'The busiest pedestrian crossing in the world.',
    tags: ['City Life', 'Photography', 'Shopping'],
    category: 'City Life',
    openHours: '24/7',
    price: 'Free',
    duration: 1,
    location: { lat: 35.6595, lng: 139.7005 },
    reviews: [
      { source: 'Google Maps', rating: 4.7, text: 'Crazy energy, great for photos from Starbucks.' }
    ]
  },
  {
    id: '3',
    name: 'Meiji Jingu',
    image: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?q=80&w=800&auto=format&fit=crop',
    rating: 4.9,
    summary: 'A serene Shinto shrine surrounded by a massive forest.',
    tags: ['Nature', 'History', 'Peaceful'],
    category: 'Nature & Parks',
    openHours: 'Sunrise - Sunset',
    price: 'Free',
    duration: 2.5,
    location: { lat: 35.6764, lng: 139.6993 },
    reviews: [
      { source: 'Google Maps', rating: 4.9, text: 'A peaceful escape from the busy city.' }
    ]
  },
  {
    id: '4',
    name: 'Tokyo Skytree',
    image: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?q=80&w=800&auto=format&fit=crop',
    rating: 4.6,
    summary: 'Iconic broadcasting tower offering panoramic city views.',
    tags: ['Views', 'Modern', 'Family'],
    category: 'Sightseeing',
    openHours: '10:00 - 21:00',
    price: '$15',
    duration: 2,
    location: { lat: 35.7100, lng: 139.8107 },
    reviews: [
      { source: 'Google Maps', rating: 4.6, text: 'Best views of Tokyo, go at sunset!' }
    ]
  },
  {
    id: '5',
    name: 'Tsukiji Outer Market',
    image: 'https://images.unsplash.com/photo-1583339824000-60b6910d539e?q=80&w=800&auto=format&fit=crop',
    rating: 4.7,
    summary: 'Bustling market with incredible street food and fresh seafood.',
    tags: ['Food', 'Culture', 'Market'],
    category: 'Food & Dining',
    openHours: '05:00 - 14:00',
    price: 'Varies',
    duration: 3,
    location: { lat: 35.6654, lng: 139.7706 },
    reviews: [
      { source: 'Google Maps', rating: 4.7, text: 'Amazing sushi and street food. Go hungry.' }
    ]
  }
];

export default function Attractions() {
  const navigate = useNavigate();
  const { preferences, selectedAttractions, toggleAttraction, fetchedAttractions, lastFetchedDestination, setFetchedAttractions, unlockSection, saveCurrentTrip } = useAppStore();
  const [evidenceModal, setEvidenceModal] = useState<Attraction | null>(null);
  const [expandedSummary, setExpandedSummary] = useState<Attraction | null>(null);
  const [attractions, setAttractions] = useState<Attraction[]>(fetchedAttractions);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const googleMapsApiKey = (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || '';
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey,
    libraries,
  });

  useEffect(() => {
    // If maps is still loading and hasn't errored, wait.
    if (!isLoaded && !loadError) return;

    async function fetchAttractions() {
      const destinations = preferences.destinations.length > 0 ? preferences.destinations : ['Tokyo'];
      const destinationKey = destinations.join('|');
      
      // Use cache if destinations haven't changed
      if (destinationKey === lastFetchedDestination && fetchedAttractions.length > 0) {
        setAttractions(fetchedAttractions);
        return;
      }

      setIsLoading(true);
      try {
        const targetCountPerCity = 5;
        const targetCount = destinations.length * targetCountPerCity;
        const interestsStr = preferences.interests.length > 0 ? preferences.interests.join(', ') : 'general tourist attractions';
        
        const prompt = getAttractionsPrompt(destinations, targetCountPerCity, interestsStr, preferences.currency);

        const ai = new GoogleGenAI({ apiKey: (import.meta as any).env.VITE_GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: prompt,
          config: {
            systemInstruction: ATTRACTIONS_SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  image: { type: Type.STRING, description: "Leave empty string" },
                  rating: { type: Type.NUMBER },
                  summary: { type: Type.STRING },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  category: { type: Type.STRING, description: "The category or interest this attraction belongs to" },
                  openHours: { type: Type.STRING },
                  price: { type: Type.STRING },
                  duration: { type: Type.NUMBER, description: "Duration in hours" },
                  cityName: { type: Type.STRING, description: "The name of the city this attraction is in" },
                  location: {
                    type: Type.OBJECT,
                    properties: {
                      lat: { type: Type.NUMBER },
                      lng: { type: Type.NUMBER }
                    },
                    required: ["lat", "lng"]
                  },
                  reviews: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        source: { type: Type.STRING },
                        text: { type: Type.STRING },
                        rating: { type: Type.NUMBER }
                      },
                      required: ["source", "text", "rating"]
                    }
                  }
                },
                required: ["id", "name", "image", "rating", "summary", "tags", "category", "openHours", "price", "duration", "location", "reviews", "cityName"]
              }
            }
          }
        });

        const data = JSON.parse(response.text || '[]');
        if (data && data.length > 0) {
          if (isLoaded && window.google && window.google.maps && window.google.maps.places) {
            const placesService = new window.google.maps.places.PlacesService(document.createElement('div'));
            
            const updatedData = await Promise.all(data.map(async (attraction: any) => {
              return new Promise<Attraction>((resolve) => {
                const request = {
                  query: `${attraction.name} ${attraction.cityName}`,
                  fields: ['photos'],
                };
                placesService.findPlaceFromQuery(request, (results, status) => {
                  if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results[0] && results[0].photos && results[0].photos.length > 0) {
                    const photoUrl = results[0].photos[0].getUrl({ maxWidth: 800, maxHeight: 600 });
                    resolve({ ...attraction, image: photoUrl });
                  } else {
                    // Fallback generic image
                    resolve({ ...attraction, image: `https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=800&auto=format&fit=crop` });
                  }
                });
              });
            }));
            setAttractions(updatedData);
            setFetchedAttractions(updatedData, destinationKey);
          } else {
            // If Google Maps failed to load, just use fallback images
            const updatedData = data.map((attraction: any) => ({
              ...attraction,
              image: `https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=800&auto=format&fit=crop`
            }));
            setAttractions(updatedData);
            setFetchedAttractions(updatedData, destinationKey);
          }
        } else {
          setAttractions(MOCK_ATTRACTIONS);
          setFetchedAttractions(MOCK_ATTRACTIONS, destinationKey);
        }
      } catch (error) {
        console.error("Failed to fetch attractions:", error);
        setAttractions(MOCK_ATTRACTIONS);
        setFetchedAttractions(MOCK_ATTRACTIONS, destinationKey);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAttractions();
  }, [preferences.destinations, lastFetchedDestination, fetchedAttractions, setFetchedAttractions, isLoaded, loadError]);

  const handleNext = () => {
    useAppStore.getState().setItinerary([]);
    unlockSection('itinerary');
    saveCurrentTrip();
    navigate('/workbench');
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-8 h-full flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-12 h-12 text-emerald-900 animate-spin mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Discovering {formatDestinations(preferences.destinations) || 'amazing places'}...</h2>
        <p className="text-slate-500 mt-2">Our AI is curating the best attractions for your multi-city trip.</p>
      </div>
    );
  }

  // Extract unique categories and sort them
  const categories = ['All', ...Array.from(new Set(attractions.map(a => a.category || 'Other'))).sort((a, b) => {
    const aStr = a as string;
    const bStr = b as string;
    const aIsInterest = preferences.interests.includes(aStr);
    const bIsInterest = preferences.interests.includes(bStr);
    if (aIsInterest && !bIsInterest) return -1;
    if (!aIsInterest && bIsInterest) return 1;
    return aStr.localeCompare(bStr);
  })];

  const filteredAttractions = activeCategory === 'All' 
    ? attractions 
    : attractions.filter(a => (a.category || 'Other') === activeCategory);

  return (
    <div className="max-w-7xl mx-auto p-8 pb-24">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
          Curated for {formatDestinations(preferences.destinations) || 'You'}
        </h1>
        <p className="text-lg text-slate-600">
          Based on your {preferences.duration}-day trip across {preferences.destinations.length} cities, here are our top recommendations.
        </p>
      </div>

      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-30 bg-slate-50/90 backdrop-blur-md py-4 mb-8 -mx-8 px-8 border-b border-slate-200 flex gap-2 overflow-x-auto hide-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-emerald-900 text-white shadow-md shadow-emerald-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredAttractions.map((attraction) => {
          const isSelected = selectedAttractions.some((a) => a.id === attraction.id);
          const summaryText = attraction.summary || '';
          const isLong = summaryText.length > 75;

          return (
            <div
              key={attraction.id}
              className={`group bg-white rounded-3xl overflow-hidden border-2 transition-all duration-300 flex flex-col ${
                isSelected
                  ? 'border-emerald-600 shadow-lg shadow-emerald-100 ring-4 ring-emerald-50'
                  : 'border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200'
              }`}
            >
              <div className="relative h-48 overflow-hidden shrink-0">
                <img
                  src={attraction.image}
                  alt={attraction.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-emerald-900/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-sm">
                  {attraction.category || 'Other'}
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg flex items-center gap-1 text-xs font-bold text-slate-800 shadow-sm">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  {attraction.rating}
                </div>
                {isSelected && (
                  <div className="absolute inset-0 bg-emerald-900/20 flex items-center justify-center">
                    <div className="bg-emerald-900 text-white p-3 rounded-full shadow-lg transform scale-110 transition-transform">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">{attraction.name}</h3>
                </div>
                <p className="text-slate-600 text-sm mb-4">
                  {isLong ? summaryText.slice(0, 75) : summaryText}
                  {isLong && (
                    <span 
                      onClick={(e) => { e.preventDefault(); setExpandedSummary(attraction); }}
                      className="text-emerald-600 cursor-pointer hover:text-emerald-800 font-bold ml-1"
                    >
                      ...
                    </span>
                  )}
                </p>

                <div className="mt-auto">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {attraction.openHours}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      {attraction.price}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleAttraction(attraction)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Added
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-4 h-4" /> Add
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setEvidenceModal(attraction)}
                      className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                      title="View Evidence Chain"
                    >
                      <MessageSquareText className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 px-8 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
        <div className="text-slate-500 font-medium">
          <span className="text-emerald-600 font-bold">{selectedAttractions.length}</span> attractions selected
        </div>
        <button
          onClick={handleNext}
          disabled={selectedAttractions.length === 0}
          className="flex items-center gap-2 bg-emerald-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/10"
        >
          Generate Itinerary
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Summary Modal */}
      {expandedSummary && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">Description</h3>
              <button onClick={() => setExpandedSummary(null)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-slate-700 leading-relaxed">{expandedSummary.summary}</p>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Modal */}
      {evidenceModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <MessageSquareText className="text-emerald-600" />
                Why we recommend this
              </h3>
              <button onClick={() => setEvidenceModal(null)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center gap-4 mb-6">
                <img src={evidenceModal.image} alt={evidenceModal.name} className="w-16 h-16 rounded-xl object-cover" />
                <div>
                  <h4 className="font-bold text-slate-900">{evidenceModal.name}</h4>
                  <div className="flex items-center gap-1 text-sm text-yellow-500 font-medium">
                    <Star className="w-4 h-4 fill-yellow-500" />
                    {evidenceModal.rating} Average Rating
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {evidenceModal.reviews.map((review, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">{review.source}</span>
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        {review.rating}
                      </div>
                    </div>
                    <p className="text-slate-700 text-sm italic">"{review.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
