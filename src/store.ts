import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Preferences {
  destinations: string[];
  duration: number;
  budget: 'Low' | 'Mid' | 'High';
  dining: string[];
  transport: string[];
  interests: string[];
  currency: string;
}

export interface Attraction {
  id: string;
  name: string;
  image: string;
  rating: number;
  summary: string;
  tags: string[];
  category: string;
  openHours: string;
  price: string;
  duration: number; // hours
  reviews: { source: string; text: string; rating: number }[];
  location?: { lat: number; lng: number };
}

export interface ItineraryItem {
  id: string;
  type: 'attraction' | 'restaurant' | 'hotel' | 'transport';
  title: string;
  startTime: string;
  endTime: string;
  details: string;
  conflict?: boolean;
  conflictReason?: string;
  alternatives?: { title: string; action: string }[];
  location?: { lat: number; lng: number };
  image?: string;
  price?: string;
  transportMode?: 'WALKING' | 'TRANSIT' | 'DRIVING' | 'BICYCLING';
}

export interface DayPlan {
  day: number;
  items: ItineraryItem[];
}

export interface RecentTrip {
  id: string;
  name: string;
  preferences: Preferences;
  itinerary: DayPlan[];
  selectedAttractions: Attraction[];
  unlockedSections: UnlockedSections;
  timestamp: number;
  thumbnail?: string;
}

export interface UnlockedSections {
  explore: boolean;
  itinerary: boolean;
  bookings: boolean;
}

interface AppState {
  preferences: Preferences;
  setPreferences: (prefs: Partial<Preferences>) => void;
  selectedAttractions: Attraction[];
  toggleAttraction: (attraction: Attraction) => void;
  itinerary: DayPlan[];
  setItinerary: (itinerary: DayPlan[]) => void;
  updateItineraryItem: (day: number, itemId: string, updates: Partial<ItineraryItem>) => void;
  removeItineraryItem: (day: number, itemId: string) => void;
  moveItineraryItem: (fromDay: number, toDay: number, itemId: string) => void;
  addItineraryItem: (day: number, item: ItineraryItem) => void;
  fetchedAttractions: Attraction[];
  lastFetchedDestination: string;
  setFetchedAttractions: (attractions: Attraction[], destination: string) => void;
  recentTrips: RecentTrip[];
  loadedTripName: string | null;
  saveCurrentTrip: () => Promise<void>;
  loadTrip: (tripId: string) => void;
  resetLoadedTripName: () => void;
  deleteTrip: (tripId: string) => void;
  unlockedSections: UnlockedSections;
  unlockSection: (section: keyof UnlockedSections) => void;
  resetJourney: () => void;
  tripCount: number;
  incrementTripCount: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      preferences: {
        destinations: [],
        duration: 3,
        budget: 'Mid',
        dining: [],
        transport: [],
        interests: [],
        currency: 'USD',
      },
      setPreferences: (prefs) =>
        set((state) => ({ preferences: { ...state.preferences, ...prefs } })),
      selectedAttractions: [],
      toggleAttraction: (attraction) =>
        set((state) => {
          const exists = state.selectedAttractions.find((a) => a.id === attraction.id);
          if (exists) {
            return {
              selectedAttractions: state.selectedAttractions.filter((a) => a.id !== attraction.id),
            };
          }
          return { selectedAttractions: [...state.selectedAttractions, attraction] };
        }),
      itinerary: [],
      setItinerary: (itinerary) => set({ itinerary }),
      updateItineraryItem: (day, itemId, updates) =>
        set((state) => {
          const newItinerary = [...state.itinerary];
          const dayPlan = newItinerary.find((d) => d.day === day);
          if (dayPlan) {
            const itemIndex = dayPlan.items.findIndex((i) => i.id === itemId);
            if (itemIndex !== -1) {
              dayPlan.items[itemIndex] = { ...dayPlan.items[itemIndex], ...updates };
            }
          }
          return { itinerary: newItinerary };
        }),
      removeItineraryItem: (day, itemId) =>
        set((state) => {
          const newItinerary = [...state.itinerary];
          const dayPlanIndex = newItinerary.findIndex((d) => d.day === day);
          if (dayPlanIndex !== -1) {
            newItinerary[dayPlanIndex] = {
              ...newItinerary[dayPlanIndex],
              items: newItinerary[dayPlanIndex].items.filter((i) => i.id !== itemId),
            };
          }
          return { itinerary: newItinerary };
        }),
      moveItineraryItem: (fromDay, toDay, itemId) =>
        set((state) => {
          const newItinerary = [...state.itinerary];
          const fromDayPlanIndex = newItinerary.findIndex((d) => d.day === fromDay);
          const toDayPlanIndex = newItinerary.findIndex((d) => d.day === toDay);
          
          if (fromDayPlanIndex !== -1 && toDayPlanIndex !== -1) {
            const itemIndex = newItinerary[fromDayPlanIndex].items.findIndex((i) => i.id === itemId);
            if (itemIndex !== -1) {
              const [item] = newItinerary[fromDayPlanIndex].items.splice(itemIndex, 1);
              newItinerary[toDayPlanIndex].items.push(item);
            }
          }
          return { itinerary: newItinerary };
        }),
      addItineraryItem: (day, item) =>
        set((state) => {
          const newItinerary = [...state.itinerary];
          const dayPlanIndex = newItinerary.findIndex((d) => d.day === day);
          if (dayPlanIndex !== -1) {
            newItinerary[dayPlanIndex] = {
              ...newItinerary[dayPlanIndex],
              items: [...newItinerary[dayPlanIndex].items, item],
            };
          }
          return { itinerary: newItinerary };
        }),
      fetchedAttractions: [],
      lastFetchedDestination: '',
      setFetchedAttractions: (attractions, destination) => 
        set({ fetchedAttractions: attractions, lastFetchedDestination: destination }),
      recentTrips: [],
      loadedTripName: null,
      saveCurrentTrip: async () => {
        const state = get();
        // Allow saving even if itinerary is empty to persist progress
        
        const tripName = state.preferences.destinations.length > 0 
          ? `Trip to ${state.preferences.destinations.join(', ')}`
          : (state.loadedTripName || `Trip on ${new Date().toLocaleDateString()}`);
          
        const firstCity = state.preferences.destinations[0] || state.loadedTripName?.replace('Trip to ', '') || 'Travel';
        
        let thumbnail = '';
        const apiKey = (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || '';
        
        if (apiKey && firstCity !== 'Travel') {
          try {
            // 1. Search for the city to get a photo reference
            const searchUrl = `/api/places/search?query=${encodeURIComponent(firstCity + ' city')}`;
            const searchRes = await fetch(searchUrl);
            const searchData = await searchRes.json();
            
            if (searchData.results?.[0]?.photos?.[0]?.photo_reference) {
              const photoRef = searchData.results[0].photos[0].photo_reference;
              thumbnail = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${apiKey}`;
            }
          } catch (e) {
            console.error('Google Places API fetch failed, falling back to Unsplash', e);
          }
        }

        // Fallback to high-quality Unsplash if Google API failed or no key
        if (!thumbnail) {
          thumbnail = `https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop`; // Nature fallback
          if (firstCity !== 'Travel') {
            // Using a reliable source URL with the city name as a seed for the preview
            thumbnail = `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop`;
          }
        }

        const newTrip: RecentTrip = {
          id: Math.random().toString(36).substring(7),
          name: tripName,
          preferences: { ...state.preferences },
          itinerary: [...state.itinerary],
          selectedAttractions: [...state.selectedAttractions],
          unlockedSections: { ...state.unlockedSections },
          timestamp: Date.now(),
          thumbnail: thumbnail
        };
        
        set((state) => ({
          recentTrips: [newTrip, ...state.recentTrips.filter(t => t.name !== tripName)].slice(0, 10) // Keep last 10, unique names
        }));
      },
      loadTrip: (tripId) => {
        const state = get();
        const trip = state.recentTrips.find(t => t.id === tripId);
        if (trip) {
          set({
            itinerary: trip.itinerary,
            selectedAttractions: trip.selectedAttractions,
            loadedTripName: trip.name,
            unlockedSections: trip.unlockedSections || {
              explore: true,
              itinerary: true,
              bookings: true,
            },
            preferences: {
              ...trip.preferences,
            }
          });
        }
      },
      resetLoadedTripName: () => set({ loadedTripName: null }),
      deleteTrip: (tripId) => set((state) => ({
        recentTrips: state.recentTrips.filter(t => t.id !== tripId)
      })),
      unlockedSections: {
        explore: false,
        itinerary: false,
        bookings: false,
      },
      unlockSection: (section) =>
        set((state) => ({
          unlockedSections: { ...state.unlockedSections, [section]: true },
        })),
      resetJourney: () =>
        set(() => ({
          preferences: {
            destinations: [],
            duration: 3,
            budget: 'Mid',
            dining: [],
            transport: [],
            interests: [],
            currency: 'USD',
          },
          selectedAttractions: [],
          itinerary: [],
          fetchedAttractions: [],
          lastFetchedDestination: '',
          loadedTripName: null,
          unlockedSections: {
            explore: false,
            itinerary: false,
            bookings: false,
          },
        })),
      tripCount: 0,
      incrementTripCount: () => set((state) => ({ tripCount: state.tripCount + 1 })),
    }),
    {
      name: 'wander-ai-storage',
    }
  )
);
