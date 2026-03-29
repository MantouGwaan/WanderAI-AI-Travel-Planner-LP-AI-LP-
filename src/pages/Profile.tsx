import { useAppStore } from '../store';
import { User, Settings, Heart, MapPin, Clock, LogOut } from 'lucide-react';

export default function Profile() {
  const { preferences } = useAppStore();

  return (
    <div className="max-w-4xl mx-auto p-8 pb-24">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Your Profile</h1>
        <p className="text-lg text-slate-600">Manage your travel preferences and history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: User Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
            <div className="w-24 h-24 bg-lime-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-md">
              <User className="w-10 h-10 text-lime-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Traveler</h2>
            <p className="text-slate-500 text-sm mb-6">traveler@example.com</p>
            
            <button className="w-full bg-slate-50 text-slate-700 py-2.5 rounded-xl font-medium hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 border border-slate-200">
              <Settings className="w-4 h-4" />
              Edit Profile
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-lime-500" />
              Travel Stats
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Trips Planned</span>
                <span className="font-bold text-slate-900">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Countries Visited</span>
                <span className="font-bold text-slate-900">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Days Traveled</span>
                <span className="font-bold text-slate-900">45</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Preferences */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Heart className="w-6 h-6 text-pink-500" />
              Saved Preferences
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Last Destinations</h3>
                <div className="flex flex-wrap gap-2">
                  {preferences.destinations.length > 0 ? preferences.destinations.map(d => (
                    <span key={d} className="px-3 py-1 bg-lime-50 text-lime-700 rounded-lg text-sm font-medium border border-lime-100 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {d}
                    </span>
                  )) : <span className="text-slate-500 italic">No destinations set</span>}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Dining Style</h3>
                <div className="flex flex-wrap gap-2">
                  {preferences.dining.length > 0 ? preferences.dining.map(d => (
                    <span key={d} className="px-3 py-1 bg-lime-50 text-lime-700 rounded-lg text-sm font-medium border border-lime-100">
                      {d}
                    </span>
                  )) : <span className="text-slate-500 italic">No preferences saved</span>}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Transportation</h3>
                <div className="flex flex-wrap gap-2">
                  {preferences.transport.length > 0 ? preferences.transport.map(t => (
                    <span key={t} className="px-3 py-1 bg-lime-50 text-lime-700 rounded-lg text-sm font-medium border border-lime-100">
                      {t}
                    </span>
                  )) : <span className="text-slate-500 italic">No preferences saved</span>}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {preferences.interests.length > 0 ? preferences.interests.map(i => (
                    <span key={i} className="px-3 py-1 bg-lime-50 text-lime-700 rounded-lg text-sm font-medium border border-lime-100">
                      {i}
                    </span>
                  )) : <span className="text-slate-500 italic">No preferences saved</span>}
                </div>
              </div>
            </div>
          </div>

          <button className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2 border border-red-100">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
