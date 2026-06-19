import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Spinner from '../../components/Spinner';

/**
 * Customer Landing Homepage
 */
const Home = () => {
  const navigate = useNavigate();
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search state parameters
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await api.get('/districts');
        setDistricts(response.data.data || []);
      } catch (err) {
        console.error('Failed to load districts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDistricts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedDistrict) params.append('district', selectedDistrict);
    if (searchQuery) params.append('search', searchQuery);
    navigate(`/turfs?${params.toString()}`);
  };

  const selectDistrictCard = (districtName) => {
    navigate(`/turfs?district=${districtName}`);
  };

  // Curated premium images for popular districts to make UI look amazing!
  const districtImages = {
    'Chennai': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=400&auto=format&fit=crop', // Chennai central
    'Coimbatore': 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=400&auto=format&fit=crop',
    'Madurai': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=400&auto=format&fit=crop',
    'Trichy': 'https://images.unsplash.com/photo-1626128665265-400cd021464f?q=80&w=400&auto=format&fit=crop',
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=400&auto=format&fit=crop';

  return (
    <div className="min-h-screen bg-slatebg-dark font-sans text-white">
      {/* Hero Header Section */}
      <div className="relative pt-32 pb-24 px-6 md:px-12 text-center overflow-hidden">
        {/* Glowing visual backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-turf/10 blur-[120px] rounded-full z-0" />
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Book the Perfect Playground <br />
            <span className="bg-gradient-to-r from-turf-light to-accent-gold bg-clip-text text-transparent">
              Anytime, Anywhere in TN
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Locate premier football turfs, cricket pitches, and badminton courts across all 38 districts of Tamil Nadu. Instant slot checks, advance bookings, and secure checkouts.
          </p>

          {/* Quick search container */}
          <form 
            onSubmit={handleSearch}
            className="glass-panel p-3 rounded-2xl border-slate-700/50 shadow-xl max-w-3xl mx-auto flex flex-col md:flex-row gap-3 mt-10"
          >
            <div className="flex-1">
              <select 
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-turf focus:ring-1 focus:ring-turf transition appearance-none cursor-pointer"
              >
                <option value="">All Districts</option>
                {districts.map((d) => (
                  <option key={d._id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex-[2] relative">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search turfs by name..."
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-turf focus:ring-1 focus:ring-turf transition"
              />
              <svg className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <button 
              type="submit"
              className="px-6 py-3 bg-turf hover:bg-turf-dark text-white text-sm font-semibold rounded-xl transition duration-150 flex items-center justify-center gap-2"
            >
              <span>Search</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* TN districts list section */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-baseline gap-2 mb-8 border-b border-slate-800/80 pb-4">
          <h2 className="text-2xl font-bold font-sans">Browse by District</h2>
          <p className="text-xs text-slate-400">Locating spaces in all 38 districts of Tamil Nadu</p>
        </div>

        {loading ? (
          <div className="py-24">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {districts.slice(0, 12).map((district) => (
              <div
                key={district._id}
                onClick={() => selectDistrictCard(district.name)}
                className="glass-panel glass-panel-hover rounded-2xl overflow-hidden cursor-pointer group flex flex-col h-40 relative"
              >
                {/* Background image shadow */}
                <img 
                  src={districtImages[district.name] || fallbackImage} 
                  alt={district.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-slatebg-dark/85 group-hover:bg-slatebg-dark/75 transition-colors" />

                {/* Details layout */}
                <div className="relative z-10 p-5 mt-auto">
                  <h3 className="text-lg font-bold font-sans text-white group-hover:text-turf-light transition duration-150">
                    {district.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">
                    {district.cities.length} cities/towns
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
