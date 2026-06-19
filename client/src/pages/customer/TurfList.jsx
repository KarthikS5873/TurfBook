import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import useTurfs from '../../hooks/useTurfs';
import TurfCard from '../../components/TurfCard';
import Spinner from '../../components/Spinner';

/**
 * Filter list of Turfs page
 */
const TurfList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Extract parameters from URL
  const urlDistrict = searchParams.get('district') || '';
  const urlSearch = searchParams.get('search') || '';

  const {
    turfs,
    loading,
    filters,
    setFilters
  } = useTurfs({
    district: urlDistrict,
    search: urlSearch,
    minPrice: '',
    maxPrice: ''
  });

  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);

  // Fetch districts list for dropdown
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await api.get('/districts');
        setDistricts(response.data.data || []);
      } catch (err) {
        console.error('Failed to load districts list:', err);
      }
    };
    fetchDistricts();
  }, []);

  // Update cities list when selected district changes
  useEffect(() => {
    if (filters.district) {
      const selected = districts.find(
        d => d.name.toLowerCase() === filters.district.toLowerCase()
      );
      setCities(selected ? selected.cities : []);
    } else {
      setCities([]);
    }
  }, [filters.district, districts]);

  // Synchronize filters state if search query URL changes directly
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      district: searchParams.get('district') || '',
      search: searchParams.get('search') || ''
    }));
  }, [searchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Sync back to searchParams
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setFilters({
      district: '',
      city: '',
      search: '',
      minPrice: '',
      maxPrice: ''
    });
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-slatebg-dark font-sans text-white pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-72 flex-shrink-0">
          <div className="glass-panel p-6 rounded-2xl border-slate-700/40 sticky top-24 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold font-sans">Filters</h3>
              <button 
                onClick={clearAllFilters}
                className="text-xs text-slate-400 hover:text-white hover:underline transition"
              >
                Clear All
              </button>
            </div>

            {/* District filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">District</label>
              <select
                value={filters.district}
                onChange={(e) => handleFilterChange('district', e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-turf transition cursor-pointer"
              >
                <option value="">All Districts</option>
                {districts.map(d => (
                  <option key={d._id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* City filter */}
            {cities.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">City/Town</label>
                <select
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-turf transition cursor-pointer"
                >
                  <option value="">All Cities</option>
                  {cities.map((c, idx) => (
                    <option key={idx} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Text Search */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Search Name</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Enter turf name..."
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-turf transition"
              />
            </div>

            {/* Price filters */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Hourly Price Bounds</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min (₹)"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-turf transition"
                />
                <input
                  type="number"
                  placeholder="Max (₹)"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-turf transition"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Listings Content */}
        <main className="flex-1">
          <div className="flex justify-between items-baseline mb-6">
            <h2 className="text-xl font-bold font-sans">
              {filters.district ? `${filters.district} Playgrounds` : 'All Available Playgrounds'}
            </h2>
            <span className="text-xs text-slate-400 font-medium">{turfs.length} matches found</span>
          </div>

          {loading ? (
            <div className="py-32">
              <Spinner size="lg" />
            </div>
          ) : turfs.length === 0 ? (
            <div className="text-center py-24 glass-panel rounded-2xl p-8 max-w-md mx-auto">
              <div className="w-12 h-12 bg-slate-800/80 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">No Playgrounds Found</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                We couldn't find any turfs matching those filter parameters. Try clearing some bounds to expand your options.
              </p>
              <button 
                onClick={clearAllFilters}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {turfs.map(turf => (
                <TurfCard key={turf._id} turf={turf} />
              ))}
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

export default TurfList;
