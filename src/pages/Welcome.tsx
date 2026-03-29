import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import WaitlistModal from '../components/WaitlistModal';
import TrialLimitModal from '../components/TrialLimitModal';
import LandingHTML from '../components/LandingHTML'; // 确保这里引用了你刚建好的组件
import './Landing.css';

export default function Welcome() {
  const navigate = useNavigate();
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  
  const recentTrips = useAppStore(state => state.recentTrips);
  const loadTrip = useAppStore(state => state.loadTrip);
  const deleteTrip = useAppStore(state => state.deleteTrip);

  const handleOpenLimitModal = () => {
    const tripsCount = useAppStore.getState().recentTrips.length;
    if (tripsCount >= 1) {
      setIsLimitModalOpen(true);
      return;
    }
    useAppStore.getState().resetJourney();
    navigate('/preferences');
  };

  const handleOpenWaitlistModal = () => {
    setIsWaitlistModalOpen(true);
  };

  const handleLoadTrip = (tripId: string) => {
    loadTrip(tripId);
    const trip = recentTrips.find(t => t.id === tripId);
    if (trip) {
      if (trip.unlockedSections?.bookings) navigate('/checkout');
      else if (trip.unlockedSections?.itinerary) navigate('/workbench');
      else if (trip.unlockedSections?.explore) navigate('/attractions');
      else navigate('/preferences');
    } else {
      navigate('/preferences');
    }
  };

  const handleDeleteTrip = (tripId: string) => {
    deleteTrip(tripId);
  };

  return (
    <>
      <LandingHTML 
        recentTrips={recentTrips}
        onOpenLimitModal={handleOpenLimitModal}
        onOpenWaitlistModal={handleOpenWaitlistModal}
        onLoadTrip={handleLoadTrip}
        onDeleteTrip={handleDeleteTrip}
      />

      {/* 这里的 onClose 已经完全剥离了所有的 scrollIntoView */}
      <WaitlistModal 
        isOpen={isWaitlistModalOpen} 
        onClose={() => setIsWaitlistModalOpen(false)} 
        title="Project Not Yet Launched"
        description="Coming soon! Leave your email, and we'll notify you as soon as we launch."
      />

      <TrialLimitModal 
        isOpen={isLimitModalOpen} 
        onClose={() => setIsLimitModalOpen(false)} 
        onViewPricing={() => {
          setIsLimitModalOpen(false);
          document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    </>
  );
}