import React, { useState, useEffect, useRef } from 'react';
import { useAppStore, DayPlan, ItineraryItem } from '../store';
import { getItinerarySystemInstruction, getItineraryPrompt, getChatSystemInstruction } from '../constants/prompts';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { MapPin, Clock, AlertTriangle, Send, RefreshCw, ChevronRight, CheckCircle2, GripVertical, Trash2, CalendarDays, Plus, Car, Footprints, Bus, Bike, FileText, Mail, X, Utensils, Hotel, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, Type } from "@google/genai";
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer, Autocomplete } from '@react-google-maps/api';
import { formatDestinations } from '../utils';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 35.6762,
  lng: 139.6503 // Tokyo
};

const libraries: ("places")[] = ["places"];

// Gemini API will be initialized dynamically inside the component
// to ensure environment variables are loaded correctly at runtime.

const LUXURY_LOADING_MESSAGES = [
  "Planning a high-quality journey for you...",
  "Curating premium experiences...",
  "Optimizing your personalized route...",
  "Securing luxury accommodations...",
  "Finalizing your bespoke itinerary..."
];

export default function Workbench() {
  const navigate = useNavigate();
  const { preferences, selectedAttractions, itinerary, setItinerary, removeItineraryItem, moveItineraryItem, updateItineraryItem, addItineraryItem, saveCurrentTrip, loadedTripName, resetLoadedTripName, unlockSection, tripCount, incrementTripCount } = useAppStore();
  const [activeDay, setActiveDay] = useState(1);
  const [chatInput, setChatInput] = useState('');
  
  const tripTitle = preferences.destinations.length > 0 
    ? formatDestinations(preferences.destinations)
    : (loadedTripName?.replace('Trip to ', '') || 'Your Trip');

  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string; alternatives?: any[]; selectedAltId?: string }[]>([
    { role: 'ai', text: `Welcome to your bespoke journey to **${tripTitle}**! 

I've meticulously crafted a **${preferences.duration}-day itinerary** that balances iconic landmarks with hidden gems, tailored to your unique preferences. 

### Expert Insights
*   **Timing is Everything:** To avoid the crowds at major attractions, I've scheduled them for early morning or late afternoon.
*   **Local Flavors:** I've included hand-picked dining spots that offer authentic local cuisine, including options for your specific dietary needs.

How would you like to refine your experience today? I can swap destinations, or add more specialized activities.` }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  
  const googleMapsApiKey = (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || '';
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey,
    libraries
  });

  const [dayToDelete, setDayToDelete] = useState<number | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [movingItemId, setMovingItemId] = useState<string | null>(null);
  const [moveToDay, setMoveToDay] = useState<number>(1);
  const [editingTimeId, setEditingTimeId] = useState<string | null>(null);
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [newActivity, setNewActivity] = useState<Partial<ItineraryItem>>({
    title: '',
    type: 'attraction',
    startTime: '09:00',
    endTime: '10:00',
    location: undefined,
    details: ''
  });
  const [openTransportMenuId, setOpenTransportMenuId] = useState<string | null>(null);
  const [directionsList, setDirectionsList] = useState<any[]>([]);
  const [isReplanningDay, setIsReplanningDay] = useState<number | null>(null);

  // Resizable columns state
  const [leftWidth, setLeftWidth] = useState(384); // 96 * 4 = 384px
  const [rightWidth, setRightWidth] = useState(384);
  const isDraggingLeft = useRef(false);
  const isDraggingRight = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingLeft.current) {
        const newWidth = Math.max(250, Math.min(e.clientX, window.innerWidth - rightWidth - 300));
        setLeftWidth(newWidth);
      } else if (isDraggingRight.current) {
        const newWidth = Math.max(250, Math.min(window.innerWidth - e.clientX, window.innerWidth - leftWidth - 300));
        setRightWidth(newWidth);
      }
    };
    const handleMouseUp = () => {
      if (isDraggingLeft.current || isDraggingRight.current) {
        isDraggingLeft.current = false;
        isDraggingRight.current = false;
        document.body.style.cursor = 'default';
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [leftWidth, rightWidth]);

  // Drag to scroll for day tabs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const dragged = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    isDragging.current = true;
    dragged.current = false;
    startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeft.current = scrollContainerRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX.current) * 2; // Scroll-fast multiplier
    if (Math.abs(walk) > 5) {
      dragged.current = true;
    }
    scrollContainerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleDragStart = (e: React.DragEvent, item: ItineraryItem) => {
    setDraggedItemId(item.id);
    e.dataTransfer.effectAllowed = 'move';
    if (e.dataTransfer.setData) {
      e.dataTransfer.setData('text/plain', item.id);
    }
    
    // Create a custom drag image for the "mirror" effect
    const target = e.currentTarget as HTMLElement;
    const clone = target.cloneNode(true) as HTMLElement;
    clone.style.width = `${target.offsetWidth}px`;
    clone.style.position = 'absolute';
    clone.style.top = '-1000px';
    clone.style.right = '-1000px';
    clone.style.transform = 'rotate(2deg) scale(1.02)';
    clone.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
    clone.style.opacity = '0.9';
    clone.style.zIndex = '1000';
    clone.style.background = 'white';
    clone.style.borderRadius = '1rem';
    document.body.appendChild(clone);
    
    e.dataTransfer.setDragImage(clone, 20, 20);
    
    // Clean up the clone after a short delay
    setTimeout(() => {
      if (document.body.contains(clone)) {
        document.body.removeChild(clone);
      }
    }, 100);
  };

  const handleDragOver = (e: React.DragEvent, hoverIdx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!draggedItemId) return;
    
    const dayIndex = itinerary.findIndex(d => d.day === activeDay);
    if (dayIndex === -1) return;
    
    const dayPlan = itinerary[dayIndex];
    const draggedIdx = dayPlan.items.findIndex(i => i.id === draggedItemId);
    
    if (draggedIdx === hoverIdx || draggedIdx === -1) return;
    
    const newItinerary = [...itinerary];
    const newDayPlan = { ...dayPlan };
    const newItems = [...newDayPlan.items];
    
    const [draggedItem] = newItems.splice(draggedIdx, 1);
    newItems.splice(hoverIdx, 0, draggedItem);
    
    newDayPlan.items = newItems;
    newItinerary[dayIndex] = newDayPlan;
    
    setItinerary(newItinerary);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedItemId(null);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
  };

  const handleDelete = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    removeItineraryItem(activeDay, itemId);
    setExpandedItemId(null);
  };

  const handleStartMove = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    setMovingItemId(itemId);
    setMoveToDay(activeDay);
  };

  const confirmMove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (movingItemId && moveToDay !== activeDay) {
      moveItineraryItem(activeDay, moveToDay, movingItemId);
    }
    setMovingItemId(null);
    setExpandedItemId(null);
  };

  const handleStartTimeEdit = (e: React.MouseEvent, item: ItineraryItem) => {
    e.stopPropagation();
    setEditingTimeId(item.id);
    setEditStartTime(item.startTime);
    setEditEndTime(item.endTime);
  };

  const confirmTimeEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingTimeId) {
      updateItineraryItem(activeDay, editingTimeId, { startTime: editStartTime, endTime: editEndTime });
    }
    setEditingTimeId(null);
  };

  const handleAddActivity = () => {
    if (!newActivity.title) return;
    const item: ItineraryItem = {
      id: `manual-${Date.now()}`,
      type: newActivity.type as any || 'attraction',
      title: newActivity.title || 'New Activity',
      startTime: newActivity.startTime || '10:00',
      endTime: newActivity.endTime || '11:00',
      details: newActivity.details || '',
      location: newActivity.location,
      image: newActivity.image,
    };
    
    // Add the item first
    addItineraryItem(activeDay, item);
    setIsAddingActivity(false);
    setNewActivity({ title: '', type: 'attraction', startTime: '10:00', endTime: '11:00', details: '' });
    
    // Simulate replanning the day
    setIsReplanningDay(activeDay);
    setTimeout(() => {
      // Simple mock replan: just sort by start time and adjust if overlapping
      const newItinerary = [...useAppStore.getState().itinerary];
      const dayIndex = newItinerary.findIndex(d => d.day === activeDay);
      if (dayIndex !== -1) {
        const dayPlan = { ...newItinerary[dayIndex] };
        dayPlan.items = [...dayPlan.items].sort((a, b) => a.startTime.localeCompare(b.startTime));
        
        // Simple overlap resolution and transport mode update
        for (let i = 0; i < dayPlan.items.length; i++) {
          const curr = dayPlan.items[i];
          
          if (i > 0) {
            const prev = dayPlan.items[i - 1];
            
            // Overlap resolution
            if (curr.startTime < prev.endTime) {
              curr.startTime = prev.endTime;
              const [h, m] = curr.startTime.split(':').map(Number);
              curr.endTime = `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            }

            // Smart transport mode
            if (prev.location && curr.location) {
              const dist = Math.sqrt(Math.pow(prev.location.lat - curr.location.lat, 2) + Math.pow(prev.location.lng - curr.location.lng, 2)) * 111;
              if (dist < 1) curr.transportMode = 'WALKING';
              else if (dist > 10) curr.transportMode = 'DRIVING';
              else if (dist < 3) curr.transportMode = 'BICYCLING';
              else curr.transportMode = 'TRANSIT';
            }
          }
        }
        newItinerary[dayIndex] = dayPlan;
        setItinerary(newItinerary);
      }
      setIsReplanningDay(null);
    }, 1000);
  };

  // Generate initial itinerary using AI based on selected attractions and preferences
  useEffect(() => {
    if (itinerary.length === 0 && selectedAttractions.length > 0 && !isGenerating) {
      const generateAITrip = async () => {
        setIsGenerating(true);
        resetLoadedTripName();
        try {
          const attractionsContext = selectedAttractions.map(a => 
            `- ${a.name} (Category: ${a.category}, Suggested Duration: ${a.duration}h, Location: ${JSON.stringify(a.location)})`
          ).join('\n');

          const systemInstruction = getItinerarySystemInstruction(preferences);
          const prompt = getItineraryPrompt(preferences, attractionsContext);

          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY });
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
            }
          });

          const data = JSON.parse(response.text || '[]');
          
          // Map AI response back to our store structure, preserving images from selectedAttractions
          const enrichedItinerary = await Promise.all(data.map(async (day: any) => {
            const itemsWithImages = await Promise.all(day.items.map(async (item: any, idx: number) => {
              const original = selectedAttractions.find(a => 
                a.name.toLowerCase().includes(item.title.toLowerCase()) || 
                item.title.toLowerCase().includes(a.name.toLowerCase())
              );
              
              // Smart transport mode calculation
              let transportMode: 'WALKING' | 'TRANSIT' | 'DRIVING' | 'BICYCLING' = 'TRANSIT';
              if (idx > 0 && day.items[idx-1].location && item.location) {
                const loc1 = day.items[idx-1].location;
                const loc2 = item.location;
                const dist = Math.sqrt(Math.pow(loc1.lat - loc2.lat, 2) + Math.pow(loc1.lng - loc2.lng, 2)) * 111; // Approx km
                if (dist < 1) transportMode = 'WALKING';
                else if (dist > 10) transportMode = 'DRIVING';
                else if (dist < 3) transportMode = 'BICYCLING';
                else transportMode = 'TRANSIT';
              }

              return {
                ...item,
                image: undefined, // No images in Step 3 itinerary list
                location: item.location || original?.location,
                transportMode: item.transportMode || transportMode
              };
            }));
            return { ...day, items: itemsWithImages };
          }));

          setItinerary(enrichedItinerary);
          incrementTripCount();
          saveCurrentTrip();
          
          // Notify user if AI found conflicts
          const hasConflict = enrichedItinerary.some((d: any) => d.items.some((item: any) => item.conflict));
          if (hasConflict) {
            setMessages(prev => [
              ...prev,
              { role: 'ai', text: "I've generated your itinerary, but I noticed some potential scheduling conflicts (marked in red). Would you like me to help resolve them?" }
            ]);
          }
        } catch (error) {
          console.error("AI Generation failed:", error);
          // Fallback to a very basic mock if AI fails completely
          setItinerary([{ day: 1, items: [] }]);
        } finally {
          setIsGenerating(false);
        }
      };

      generateAITrip();
    }
  }, [selectedAttractions, preferences.duration, itinerary.length, setItinerary, preferences.destinations, preferences.budget, preferences.dining, preferences.interests]);

  // Calculate directions for the active day
  useEffect(() => {
    if (!isLoaded || !googleMapsApiKey || !window.google || !mapInstance) return;
    
    const dayItems = itinerary.find(d => d.day === activeDay)?.items || [];
    const locations = dayItems.filter(item => item.location).map(item => item.location!);
    
    // Fit bounds to show all locations and paths
    const fitAll = (paths?: google.maps.DirectionsResult[]) => {
      if (!mapInstance || locations.length === 0) return;
      
      const bounds = new window.google.maps.LatLngBounds();
      locations.forEach(loc => bounds.extend(loc));
      
      if (paths) {
        paths.forEach(result => {
          const route = result.routes[0];
          if (route && route.bounds) {
            bounds.union(route.bounds);
          }
        });
      }
      
      if (!bounds.isEmpty()) {
        // Use a small timeout to ensure map is ready for bounds fitting
        // and ensure it's called after any state updates that might trigger a re-render
        setTimeout(() => {
          mapInstance.fitBounds(bounds, { top: 80, right: 80, bottom: 80, left: 80 });
          
          // Add zoom limit to prevent zooming in too much on a single point
          const listener = window.google.maps.event.addListener(mapInstance, 'idle', () => {
            if (mapInstance.getZoom()! > 16) mapInstance.setZoom(16);
            window.google.maps.event.removeListener(listener);
          });
        }, 200);
      }
    };

    if (locations.length >= 2) {
      const directionsService = new window.google.maps.DirectionsService();
      const itemsWithLocations = dayItems.filter(item => item.location);
      
      const calculateSegment = async (origin: google.maps.LatLngLiteral, dest: google.maps.LatLngLiteral, preferredMode: string): Promise<google.maps.DirectionsResult | null> => {
        const modes = [preferredMode, 'DRIVING', 'WALKING']; // Fallback order
        for (const mode of modes) {
          try {
            const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
              directionsService.route(
                {
                  origin,
                  destination: dest,
                  travelMode: window.google.maps.TravelMode[mode as keyof typeof google.maps.TravelMode],
                },
                (result, status) => {
                  if (status === window.google.maps.DirectionsStatus.OK && result) resolve(result);
                  else reject(status);
                }
              );
            });
            return result;
          } catch (e) {
            console.warn(`Mode ${mode} failed for segment: ${e}`);
            continue;
          }
        }
        return null;
      };

      const promises: Promise<google.maps.DirectionsResult | null>[] = [];
      for (let i = 0; i < itemsWithLocations.length - 1; i++) {
        const nextItem = itemsWithLocations[i+1];
        const mode = nextItem.transportMode || 'TRANSIT';
        promises.push(calculateSegment(itemsWithLocations[i].location!, nextItem.location!, mode));
      }

      Promise.all(promises).then((results) => {
        const validResults = results.filter((r): r is google.maps.DirectionsResult => r !== null);
        setDirectionsList(validResults);
        fitAll(validResults);
      });
    } else {
      setDirectionsList([]);
      fitAll();
    }
  }, [activeDay, itinerary, isLoaded, googleMapsApiKey, mapInstance]);

  // Auto-save itinerary changes to browser
  useEffect(() => {
    if (itinerary.length > 0) {
      saveCurrentTrip();
    }
  }, [itinerary]);

  const handleSendMessage = async (overrideText?: string, displayText?: string) => {
    const textToSend = overrideText || chatInput;
    const textToDisplay = displayText || textToSend;
    
    if (!textToSend.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text: textToDisplay }]);
    setChatInput('');
    setIsTyping(true);
    
    try {
        const systemInstruction = getChatSystemInstruction(preferences, preferences.currency);
        
        const chatHistory = [
          {
            role: "user",
            parts: [{ text: "Here is my current preliminary plan: " + JSON.stringify(itinerary) }],
          },
          {
            role: "model",
            parts: [{ text: "Received. I will make incremental modifications based on this plan." }],
          },
          ...messages.map(m => ({
            role: m.role === 'ai' ? 'model' : 'user',
            parts: [{ text: m.text }]
          }))
        ];

        const itinerarySchema = {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.NUMBER },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING },
                    title: { type: Type.STRING },
                    startTime: { type: Type.STRING },
                    endTime: { type: Type.STRING },
                    details: { type: Type.STRING },
                    price: { type: Type.STRING },
                    location: {
                      type: Type.OBJECT,
                      properties: {
                        lat: { type: Type.NUMBER },
                        lng: { type: Type.NUMBER }
                      }
                    },
                    transportMode: { type: Type.STRING }
                  },
                  required: ['id', 'type', 'title', 'startTime', 'endTime', 'location']
                }
              }
            },
            required: ['day', 'items']
          }
        };

        const responseSchema = {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            updatedItinerary: itinerarySchema,
            alternatives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  action: { type: Type.STRING },
                  data: { 
                    type: Type.OBJECT,
                    properties: {
                      updatedItinerary: itinerarySchema
                    }
                  }
                },
                required: ['id', 'title', 'description', 'action']
              }
            }
          },
          required: ['message', 'updatedItinerary']
        };

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY });
        const chat = ai.chats.create({
          model: "gemini-3-flash-preview",
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema
          },
          history: chatHistory,
        });

        const response = await chat.sendMessage({ message: textToSend });
        const parsedResult = JSON.parse(response.text || '{}');
      
      if (parsedResult.message) {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          text: parsedResult.message,
          alternatives: parsedResult.alternatives 
        }]);
      }
      
      if (parsedResult.updatedItinerary && Array.isArray(parsedResult.updatedItinerary)) {
        // Only update if it's actually different or if AI is sure
        // With "Propose don't apply", AI should mostly return the same itinerary
        setItinerary(parsedResult.updatedItinerary);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I am having trouble processing your request right now.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleApplyAlternative = (alt: any, messageIdx: number) => {
    // Mark as selected
    setMessages(prev => {
      const newMessages = [...prev];
      newMessages[messageIdx] = { ...newMessages[messageIdx], selectedAltId: alt.id };
      return newMessages;
    });

    if (alt.action === "ADD_DAY") {
      const newDay = itinerary.length + 1;
      setItinerary([...itinerary, { day: newDay, items: [] }]);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: `Added **Day ${newDay}** to your itinerary. What would you like to do on this day?` 
      }]);
      setActiveDay(newDay);
      return;
    }

    if (alt.data?.updatedItinerary) {
      setItinerary(alt.data.updatedItinerary);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: `Applied alternative: **${alt.title}**. ${alt.description || ''}` 
      }]);
    } else if (alt.action) {
      // Send technical string to AI, but show natural language to user
      handleSendMessage(`Apply the alternative: ${alt.title} (${alt.action})`, alt.title);
    }
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.name) {
        setNewActivity(prev => ({
          ...prev,
          title: place.name,
          location: place.geometry?.location ? {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          } : undefined,
          image: undefined // No images in Step 3
        }));
      }
    }
  };

  const confirmDeleteDay = () => {
    if (dayToDelete === null) return;
    
    const newItinerary = itinerary.filter(d => d.day !== dayToDelete).map(d => {
      if (d.day > dayToDelete) {
        return { ...d, day: d.day - 1 };
      }
      return d;
    });
    
    setItinerary(newItinerary);
    useAppStore.getState().setPreferences({ duration: newItinerary.length });
    
    // Jump to nearest day
    if (newItinerary.length === 0) {
      setActiveDay(1);
    } else {
      if (activeDay === dayToDelete) {
        setActiveDay(Math.max(1, dayToDelete - 1));
      } else if (activeDay > dayToDelete) {
        setActiveDay(activeDay - 1);
      }
    }
    
    setDayToDelete(null);
  };

  const handleCheckout = () => {
    unlockSection('bookings');
    saveCurrentTrip();
    navigate('/checkout');
  };

  if (isGenerating) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-slate-50">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <RefreshCw className="w-16 h-16 text-emerald-900 animate-spin mb-8 relative z-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {LUXURY_LOADING_MESSAGES[loadingMessageIndex]}
        </h2>
        <p className="text-slate-500 mt-4 font-medium tracking-wide uppercase text-xs">WanderAI Premium Concierge</p>
      </div>
    );
  }

  const activeDayItems = itinerary.find(d => d.day === activeDay)?.items || [];
  const mapCenter = activeDayItems.find(i => i.location)?.location || defaultCenter;

  return (
    <div className="flex h-full overflow-hidden bg-slate-50 font-sans">
      
      {/* Left Column: Chat */}
      <div style={{ width: leftWidth }} className="bg-white border-r border-slate-200 flex flex-col shadow-sm z-10 shrink-0 relative">
        {/* Left Drag Handle */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-lime-400 z-50 transition-colors translate-x-1/2"
          onMouseDown={(e) => { e.preventDefault(); isDraggingLeft.current = true; document.body.style.cursor = 'col-resize'; }}
        />
        
        <div className="p-4 border-b border-slate-100 bg-emerald-900">
          <div className="mb-1">
            <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">AI Assistant</span>
          </div>
          <h2 className="font-bold text-white flex items-center gap-2 truncate">
            <RefreshCw className={`w-4 h-4 text-emerald-400 shrink-0 ${isTyping ? 'animate-spin' : ''}`} />
            <span className="truncate">{tripTitle}</span>
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[90%] rounded-2xl p-4 text-sm shadow-sm break-words ${
                msg.role === 'user' 
                  ? 'bg-emerald-900 text-white rounded-tr-sm font-bold' 
                  : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm'
              }`}>
                <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : 'prose-slate'}`}>
                  {msg.role === 'user' ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkBreaks, remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-xl font-extrabold mb-3 text-emerald-900 border-b border-emerald-100 pb-1" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 text-emerald-800" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-[1.1rem] font-semibold my-[10px] text-[#064E3B]" {...props} />,
                        p: ({node, ...props}) => <p className="mb-1 last:mb-0 leading-relaxed text-white font-bold" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 my-[10px] space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1 mb-2 text-white font-bold" {...props} />,
                        li: ({node, ...props}) => (
                          <li className="text-white font-bold">
                            <span {...props} />
                          </li>
                        ),
                        strong: ({node, ...props}) => <strong className="font-black text-emerald-200" {...props} />,
                      }}
                    >
                      {msg.text.replace(/\*\*\s+(.*?)\s+\*\*/g, '**$1**')}
                    </ReactMarkdown>
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkBreaks, remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-xl font-black mb-3 text-emerald-900 border-b border-emerald-100 pb-1" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 text-emerald-800" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-[1.1rem] font-semibold my-[10px] text-[#064E3B]" {...props} />,
                        p: ({node, ...props}) => <p className="mb-1 last:mb-0 leading-relaxed text-slate-700" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 my-[10px] space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1 mb-2 text-slate-700" {...props} />,
                        li: ({node, ...props}) => (
                          <li className="text-slate-600">
                            <span {...props} />
                          </li>
                        ),
                        strong: ({node, ...props}) => <strong className="font-extrabold text-[#064E3B]" {...props} />,
                      }}
                    >
                      {msg.text.replace(/\*\*\s+(.*?)\s+\*\*/g, '**$1**')}
                    </ReactMarkdown>
                  )}
                </div>
              </div>

              {/* Alternatives Cards */}
              {msg.alternatives && msg.alternatives.length > 0 && (
                <div className="mt-3 flex flex-col gap-2 w-full max-w-[90%]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Alternative Options</p>
                  <div className="grid grid-cols-1 gap-2">
                    {msg.alternatives.map((alt, i) => {
                      const isSelected = msg.selectedAltId === alt.id;
                      const hasSelection = !!msg.selectedAltId;
                      
                      if (hasSelection && !isSelected) return null;

                      return (
                        <button
                          key={alt.id || i}
                          onClick={() => handleApplyAlternative(alt, idx)}
                          disabled={hasSelection}
                          className={`text-left p-3 border rounded-xl transition-all group ${
                            isSelected 
                              ? 'bg-emerald-50 border-emerald-500 shadow-sm opacity-100 cursor-default' 
                              : 'bg-white border-emerald-100 hover:border-emerald-500 hover:shadow-md active:scale-[0.98]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h5 className={`font-bold text-xs transition-colors ${isSelected ? 'text-emerald-700' : 'text-emerald-900 group-hover:text-emerald-600'}`}>{alt.title}</h5>
                              <p className="text-[11px] text-slate-500 mt-1 leading-tight">{alt.description}</p>
                            </div>
                            {!hasSelection && <ChevronRight className="w-4 h-4 text-emerald-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all shrink-0 mt-0.5" />}
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
          {isTyping && (
             <div className="flex justify-start">
               <div className="bg-white border border-slate-100 text-slate-400 rounded-2xl rounded-tl-sm p-4 text-sm flex gap-1.5 shadow-sm">
                 <div className="w-1.5 h-1.5 bg-emerald-900 rounded-full animate-bounce" />
                 <div className="w-1.5 h-1.5 bg-emerald-900 rounded-full animate-bounce [animation-delay:0.2s]" />
                 <div className="w-1.5 h-1.5 bg-emerald-900 rounded-full animate-bounce [animation-delay:0.4s]" />
               </div>
             </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="relative">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask to change something..."
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-900 focus:border-transparent transition-all"
              disabled={isTyping}
            />
            <button 
              onClick={() => handleSendMessage()}
              disabled={isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-900 text-white rounded-full hover:bg-emerald-800 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Middle Column: Map */}
      <div className="flex-1 relative bg-slate-200 overflow-hidden min-w-[300px]">
        {isLoaded && googleMapsApiKey ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={12}
            options={{ disableDefaultUI: true, zoomControl: true }}
            onLoad={map => setMapInstance(map)}
          >
            {directionsList.length > 0 ? (
              directionsList.map((directions, idx) => (
                <DirectionsRenderer 
                  key={idx} 
                  directions={directions} 
                  options={{ 
                    suppressMarkers: true,
                    polylineOptions: {
                      strokeColor: '#064e3b',
                      strokeWeight: 5,
                      strokeOpacity: 0.8
                    }
                  }} 
                />
              ))
            ) : null}
            {activeDayItems.map((item, idx) => (
              item.location && (
                <Marker 
                  key={item.id} 
                  position={item.location} 
                  label={{
                    text: (idx + 1).toString(),
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    fillColor: '#064e3b',
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: 'white',
                    scale: 12
                  }}
                />
              )
            ))}
          </GoogleMap>
        ) : (
          <>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity"></div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 flex flex-col items-center gap-2 pointer-events-auto max-w-sm text-center">
                <MapPin className="w-8 h-8 text-lime-600" />
                <span className="font-bold text-slate-800">Map Unavailable</span>
                <span className="text-sm text-slate-500">Please add your Google Maps API Key to the Secrets panel to view the interactive map and routes.</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right Column: Itinerary */}
      <div style={{ width: rightWidth }} className="bg-white border-l border-slate-200 flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-10 relative shrink-0">
        {/* Right Drag Handle */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-lime-400 z-50 transition-colors -translate-x-1/2"
          onMouseDown={(e) => { e.preventDefault(); isDraggingRight.current = true; document.body.style.cursor = 'col-resize'; }}
        />
        
        {/* Action Header */}
        <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-slate-900">Itinerary Workbench</h3>
        </div>

        {/* Day Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm sticky top-0 z-20 items-center">
          <div 
            ref={scrollContainerRef}
            className="flex-1 flex overflow-x-auto hide-scrollbar items-center cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            {itinerary.map((dayPlan) => (
              <button
                key={dayPlan.day}
                onClick={() => {
                  if (dragged.current) return;
                  setActiveDay(dayPlan.day);
                }}
                className={`flex-none px-6 py-4 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeDay === dayPlan.day
                    ? 'border-emerald-900 text-emerald-900 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                }`}
              >
                Day {dayPlan.day}
              </button>
            ))}
          </div>
          <div className="flex-none flex items-center px-2 border-l border-slate-200">
            <button
              onClick={() => {
                const newDay = itinerary.length + 1;
                setItinerary([...itinerary, { day: newDay, items: [] }]);
                useAppStore.getState().setPreferences({ duration: newDay });
                setActiveDay(newDay);
              }}
              className="p-2 text-slate-400 hover:text-lime-600 hover:bg-lime-50 rounded-full transition-colors"
              title="Add Day"
            >
              <Plus className="w-5 h-5" />
            </button>
            {itinerary.length > 1 && (
              <button
                onClick={() => setDayToDelete(activeDay)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Remove Current Day"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {dayToDelete !== null && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 text-center max-w-sm w-full">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Day {dayToDelete}?</h3>
              <p className="text-sm text-slate-500 mb-6">This action cannot be undone. All activities on this day will be removed.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setDayToDelete(null)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                <button onClick={confirmDeleteDay} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto p-4 relative">
          {isReplanningDay === activeDay && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
              <RefreshCw className="w-8 h-8 text-lime-600 animate-spin mb-2" />
              <span className="text-sm font-medium text-lime-900">Optimizing Day {activeDay}...</span>
            </div>
          )}
          <div className="flex flex-col gap-2">
            
            {activeDayItems.map((item, idx) => {
              const isExpanded = expandedItemId === item.id;
              
              // Transportation logic
              let transportTime = '';
              if (directionsList.length > 0 && directionsList[idx - 1]) {
                transportTime = directionsList[idx - 1].routes?.[0]?.legs?.[0]?.duration?.text || '';
              } else {
                transportTime = '15 mins'; // Mock fallback
              }

              const mode = item.transportMode || 'TRANSIT';
              const TransportIcon = {
                WALKING: Footprints,
                TRANSIT: Bus,
                DRIVING: Car,
                BICYCLING: Bike
              }[mode];

              return (
                <React.Fragment key={item.id}>
                  {/* Transport Segment */}
                  {idx > 0 && (
                    <div className="flex items-center justify-center relative py-2 group/transport">
                      <div className="absolute top-0 bottom-0 w-0.5 bg-slate-100 group-hover/transport:bg-lime-100 transition-colors -z-10" />
                      
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenTransportMenuId(openTransportMenuId === item.id ? null : item.id);
                          }}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition-all active:scale-95 group/pill ${
                            openTransportMenuId === item.id 
                              ? 'bg-lime-600 border-lime-600 text-white' 
                              : 'bg-white border-slate-200 text-slate-500 hover:border-lime-300 hover:shadow-md'
                          }`}
                        >
                          <TransportIcon className={`w-3.5 h-3.5 ${openTransportMenuId === item.id ? 'text-white' : 'text-slate-400 group-hover/pill:text-lime-600'}`} />
                          <span className={`text-[11px] font-bold ${openTransportMenuId === item.id ? 'text-white' : 'text-slate-500 group-hover/pill:text-lime-700'}`}>{transportTime}</span>
                        </button>

                        {openTransportMenuId === item.id && (
                          <div 
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-30 min-w-[120px] animate-in fade-in zoom-in duration-200"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {[
                              { id: 'WALKING', icon: Footprints, label: 'Walking' },
                              { id: 'TRANSIT', icon: Bus, label: 'Transit' },
                              { id: 'DRIVING', icon: Car, label: 'Driving' },
                              { id: 'BICYCLING', icon: Bike, label: 'Cycling' }
                            ].map((m) => (
                              <button
                                key={m.id}
                                onClick={() => {
                                  updateItineraryItem(activeDay, item.id, { transportMode: m.id as any });
                                  setOpenTransportMenuId(null);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium hover:bg-slate-50 transition-colors ${
                                  mode === m.id ? 'text-lime-600 bg-lime-50/50' : 'text-slate-600'
                                }`}
                              >
                                <m.icon className="w-3.5 h-3.5" />
                                {m.label}
                                {mode === m.id && <div className="ml-auto w-1 h-1 rounded-full bg-lime-600" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div 
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                    className={`w-full p-4 rounded-2xl border transition-all duration-300 cursor-pointer bg-white group/card ${
                      draggedItemId === item.id ? 'opacity-30 border-dashed border-slate-400' : 'opacity-100'
                    } ${
                      isExpanded ? 'border-lime-600 shadow-lg ring-1 ring-lime-600/10' : 'border-slate-100 hover:border-lime-200 shadow-sm hover:shadow-md'
                    } ${item.conflict ? 'border-red-200 bg-red-50/30' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon/Type Indicator */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isExpanded ? 'bg-lime-600 text-white' : 'bg-slate-50 text-slate-400 group-hover/card:bg-lime-50 group-hover/card:text-lime-600'
                      }`}>
                        {item.type === 'attraction' && <MapPin className="w-5 h-5" />}
                        {item.type === 'restaurant' && <Utensils className="w-5 h-5" />}
                        {item.type === 'hotel' && <Hotel className="w-5 h-5" />}
                        {item.type === 'transport' && <Car className="w-5 h-5" />}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-bold text-[15px] whitespace-normal break-words select-text leading-tight tracking-tight ${item.conflict ? 'text-red-900' : 'text-slate-900'}`}>
                          {item.title}
                        </h4>
                        <div className={`flex items-center gap-1.5 text-xs mt-1.5 font-medium ${item.conflict ? 'text-red-700' : 'text-slate-500'}`}>
                          <span className="whitespace-nowrap tabular-nums">{item.startTime} - {item.endTime}</span>
                          <span className="text-slate-300">•</span>
                          <span className="capitalize truncate">{item.type}</span>
                          {item.price && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="font-bold text-emerald-600">{item.price}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Drag Handle Area */}
                      <div 
                        className="shrink-0 p-1.5 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing" 
                        onClick={(e) => e.stopPropagation()}
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Conflict Resolution UI */}
                  {item.conflict && item.alternatives && isExpanded && (
                    <div className="mt-4 pt-4 border-t border-red-200 space-y-2" onClick={(e) => e.stopPropagation()}>
                      <p className="text-xs font-bold text-red-800 uppercase tracking-wider">Suggested Fixes:</p>
                      {item.alternatives.map((alt, i) => (
                        <button 
                          key={i} 
                          onClick={() => {
                            // Resolve conflict by updating the item
                            const newItinerary = [...itinerary];
                            const dayIdx = newItinerary.findIndex(d => d.day === activeDay);
                            if (dayIdx !== -1) {
                              const items = [...newItinerary[dayIdx].items];
                              items[idx] = { ...items[idx], title: alt.title, conflict: false };
                              newItinerary[dayIdx].items = items;
                              setItinerary(newItinerary);
                              setExpandedItemId(null);
                            }
                          }}
                          className="w-full text-left px-3 py-2 bg-white border border-red-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-red-50 hover:border-red-300 transition-colors flex items-center justify-between group/btn"
                        >
                          {alt.title}
                          <ChevronRight className="w-3 h-3 text-red-400 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Expanded Actions */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
                      
                      {/* Move to another day */}
                      {movingItemId === item.id ? (
                        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                          <span className="text-sm font-medium text-slate-700">Move to:</span>
                          <select 
                            value={moveToDay} 
                            onChange={(e) => setMoveToDay(Number(e.target.value))}
                            className="flex-1 text-sm border-slate-200 rounded-md"
                          >
                            {itinerary.map(d => (
                              <option key={d.day} value={d.day}>Day {d.day}</option>
                            ))}
                          </select>
                          <button onClick={confirmMove} className="px-3 py-1.5 bg-lime-600 text-white text-sm font-medium rounded-md hover:bg-lime-700">Confirm</button>
                          <button onClick={(e) => { e.stopPropagation(); setMovingItemId(null); }} className="px-3 py-1.5 bg-slate-200 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-300">Cancel</button>
                        </div>
                      ) : null}

                      {/* Adjust Time */}
                      {editingTimeId === item.id ? (
                        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                          <input type="time" value={editStartTime} onChange={e => setEditStartTime(e.target.value)} className="flex-1 text-sm border-slate-200 rounded-md" />
                          <span className="text-slate-500">-</span>
                          <input type="time" value={editEndTime} onChange={e => setEditEndTime(e.target.value)} className="flex-1 text-sm border-slate-200 rounded-md" />
                          <button onClick={confirmTimeEdit} className="px-3 py-1.5 bg-lime-600 text-white text-sm font-medium rounded-md hover:bg-lime-700">Save</button>
                          <button onClick={(e) => { e.stopPropagation(); setEditingTimeId(null); }} className="px-3 py-1.5 bg-slate-200 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-300">Cancel</button>
                        </div>
                      ) : null}

                      {/* Action Buttons */}
                      {movingItemId !== item.id && editingTimeId !== item.id && (
                        <div className="flex flex-wrap gap-2">
                          <button onClick={(e) => handleStartMove(e, item.id)} className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-lime-50 text-lime-700 rounded-lg text-xs font-medium hover:bg-lime-100 transition-colors">
                            <CalendarDays className="w-3.5 h-3.5" />
                            Move
                          </button>
                          <button onClick={(e) => handleStartTimeEdit(e, item)} className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-lime-50 text-lime-700 rounded-lg text-xs font-medium hover:bg-lime-100 transition-colors">
                            <Clock className="w-3.5 h-3.5" />
                            Time
                          </button>
                          <button onClick={(e) => handleDelete(e, item.id)} className="flex items-center justify-center gap-1.5 px-2 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                            Del
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </React.Fragment>
            );
          })}

          {/* Add Activity Button */}
            {isAddingActivity ? (
              <div className="w-full mt-4 p-4 border-2 border-lime-200 rounded-2xl bg-lime-50/50 space-y-4">
                <h4 className="font-bold text-lime-900">Add New Destination</h4>
                <div className="space-y-3">
                  {isLoaded ? (
                    <Autocomplete
                      onLoad={setAutocomplete}
                      onPlaceChanged={onPlaceChanged}
                      options={{
                        bounds: mapInstance?.getBounds() || undefined,
                      }}
                    >
                      <input 
                        type="text" 
                        placeholder="Destination Name" 
                        value={newActivity.title}
                        onChange={e => setNewActivity({...newActivity, title: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                    </Autocomplete>
                  ) : (
                    <input 
                      type="text" 
                      placeholder="Destination Name" 
                      value={newActivity.title}
                      onChange={e => setNewActivity({...newActivity, title: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    />
                  )}
                  <div className="flex gap-2">
                    <input 
                      type="time" 
                      value={newActivity.startTime}
                      onChange={e => setNewActivity({...newActivity, startTime: e.target.value})}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    />
                    <input 
                      type="time" 
                      value={newActivity.endTime}
                      onChange={e => setNewActivity({...newActivity, endTime: e.target.value})}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    />
                  </div>
                  <select 
                    value={newActivity.type}
                    onChange={e => setNewActivity({...newActivity, type: e.target.value as any})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
                  >
                    <option value="attraction">Attraction</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="hotel">Hotel</option>
                    <option value="transport">Transport</option>
                  </select>
                  <textarea 
                    placeholder="Notes (optional)" 
                    value={newActivity.details}
                    onChange={e => setNewActivity({...newActivity, details: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none h-20"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setIsAddingActivity(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                  <button onClick={handleAddActivity} disabled={!newActivity.title} className="px-4 py-2 text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 rounded-lg transition-colors disabled:opacity-50">Add Destination</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setIsAddingActivity(true)} className="w-full mt-4 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 font-medium flex items-center justify-center gap-2 hover:border-lime-300 hover:text-lime-600 hover:bg-lime-50 transition-colors">
                <Plus className="w-5 h-5" />
                Add Custom Destination
              </button>
            )}
          </div>
        </div>

        {/* Checkout Button */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <button 
            onClick={handleCheckout}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
          >
            <CheckCircle2 className="w-5 h-5" />
            Confirm & Book
          </button>
        </div>

      </div>
    </div>
  );
}
