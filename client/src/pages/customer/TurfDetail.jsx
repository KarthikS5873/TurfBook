import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import turfService from '../../services/turfService';
import reviewService from '../../services/reviewService';
import SlotPicker from '../../components/SlotPicker';
import StarRating from '../../components/StarRating';
import Spinner from '../../components/Spinner';
import useAuth from '../../hooks/useAuth';
import useBooking from '../../hooks/useBooking';
import { formatCurrency } from '../../utils/formatCurrency';

/**
 * Detailed Turf page with slot selector
 */
const TurfDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { configureBooking } = useBooking();

  const [turf, setTurf] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected slots parameters
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');

  // Detail view images states
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    const fetchTurfDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const [turfData, reviewsData] = await Promise.all([
          turfService.getTurf(id),
          reviewService.getTurfReviews(id)
        ]);
        setTurf(turfData);
        setReviews(reviewsData || []);
        if (turfData.images && turfData.images.length > 0) {
          setActiveImage(turfData.images[0]);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load turf details.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTurfDetails();
  }, [id]);

  const handleSelectSlots = (slots, date) => {
    setSelectedSlots(slots);
    setSelectedDate(date);
  };

  const handleProceedToBooking = () => {
    if (!isAuthenticated) {
      // Force login first, storing current URL for return redirect
      navigate('/login', { state: { from: { pathname: `/turfs/${id}` } } });
      return;
    }

    // Configure the Booking Context state
    configureBooking(turf, selectedSlots, selectedDate);
    navigate('/booking/confirm');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slatebg-dark">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !turf) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slatebg-dark text-center">
        <div className="glass-panel p-8 max-w-md rounded-2xl">
          <p className="text-sm text-accent-coral mb-4">{error || 'Turf details not found.'}</p>
          <button 
            onClick={() => navigate('/turfs')}
            className="px-6 py-2.5 bg-slate-800 text-white rounded-xl"
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  // Map coordinates placeholder helpers
  const mapCenter = turf.coordinates?.lat && turf.coordinates?.lng 
    ? `${turf.coordinates.lat},${turf.coordinates.lng}`
    : `${turf.city}, ${turf.district}`;

  return (
    <div className="min-h-screen bg-slatebg-dark font-sans text-white pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel h-[400px] w-full rounded-2xl overflow-hidden relative border-slate-700/40">
            <img 
              src={activeImage || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop'} 
              alt={turf.name} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Thumbnails grid */}
          {turf.images && turf.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {turf.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition ${
                    activeImage === img ? 'border-turf' : 'border-transparent hover:border-slate-500'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Key Details */}
        <div className="lg:col-span-5 flex flex-col justify-between glass-panel p-8 rounded-2xl border-slate-700/40">
          <div>
            <h1 className="text-3xl font-extrabold font-sans text-white">{turf.name}</h1>
            
            <p className="text-sm text-slate-400 mt-2 flex items-center">
              <svg className="w-4 h-4 mr-1.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {turf.address}, {turf.city}, {turf.district}
            </p>

            {/* Ratings summary */}
            <div className="flex items-center space-x-2 mt-4 pb-4 border-b border-slate-800/80">
              <StarRating rating={4.5} />
              <span className="text-xs font-bold text-slate-300">(4.5 - {reviews.length} reviews)</span>
            </div>

            <div className="mt-5 space-y-4">
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">About Playground</h5>
              <p className="text-sm text-slate-300 leading-relaxed font-light">{turf.description}</p>
            </div>

            {/* Amenities Tags */}
            {turf.amenities && turf.amenities.length > 0 && (
              <div className="mt-6 space-y-3">
                <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Amenities</h5>
                <div className="flex flex-wrap gap-2">
                  {turf.amenities.map((item, idx) => (
                    <span key={idx} className="bg-slate-900/60 border border-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-xl font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-baseline justify-between">
            <span className="text-sm text-slate-400 font-medium">Hourly Rate</span>
            <div className="text-right">
              <span className="text-2xl font-black text-turf-light">{formatCurrency(turf.pricePerHour)}</span>
              <span className="text-xs text-slate-400 font-medium ml-1">/ hour</span>
            </div>
          </div>
        </div>

      </div>

      {/* Booking picker and maps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Slot selection */}
        <div className="lg:col-span-8 glass-panel p-8 rounded-2xl border-slate-700/40">
          <SlotPicker turfId={id} onSelectSlots={handleSelectSlots} />

          {/* Trigger button */}
          {selectedSlots.length > 0 && (
            <button
              onClick={handleProceedToBooking}
              className="w-full mt-8 py-3.5 bg-turf hover:bg-turf-dark text-white font-bold text-sm rounded-xl shadow-lg shadow-turf/20 hover:shadow-none transition duration-200 flex items-center justify-center gap-2"
            >
              <span>Confirm Slots & Book Now</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Right Column: Map embed & Reviews */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Map box */}
          <div className="glass-panel p-6 rounded-2xl border-slate-700/40">
            <h4 className="text-sm font-semibold text-slate-300 mb-4">Location Map</h4>
            <div className="bg-slate-950/65 rounded-xl border border-slate-800/80 h-48 overflow-hidden relative flex items-center justify-center p-4 text-center">
              <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-xs z-0" />
              <div className="relative z-10 max-w-xs">
                <svg className="w-8 h-8 text-slate-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p className="text-[11px] font-bold text-slate-300">Google Maps Navigation</p>
                <p className="text-[10px] text-slate-400 mt-1">{mapCenter}</p>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapCenter)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3.5 inline-block text-[10px] text-white bg-slate-800 hover:bg-slate-700 px-3.5 py-1.5 rounded-lg border border-slate-700/40"
                >
                  Open Directions
                </a>
              </div>
            </div>
          </div>

          {/* Reviews box */}
          <div className="glass-panel p-6 rounded-2xl border-slate-700/40">
            <h4 className="text-sm font-semibold text-slate-300 mb-4">Customer Reviews</h4>
            {reviews.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No reviews posted yet.</p>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {reviews.map((rev) => (
                  <div key={rev._id} className="border-b border-slate-800/80 pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-white">{rev.user?.name}</span>
                      <StarRating rating={rev.rating} />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal font-light">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default TurfDetail;
