import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { formatCurrency } from '../utils/formatCurrency';

/**
 * Turf Card listing component
 * @param {Object} turf - Turf model fields
 * @param {Boolean} [showStatus=false] - True to render administrative status tags
 */
const TurfCard = ({ turf, showStatus = false }) => {
  const { _id, name, images, city, district, pricePerHour, status, rating = 4.5 } = turf;

  const primaryImage = images && images.length > 0 
    ? images[0] 
    : 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop'; // fallback beautiful stadium image

  const statusColors = {
    pending: 'bg-accent-gold/10 text-accent-gold border-accent-gold/30',
    approved: 'bg-turf/10 text-turf border-turf/30',
    rejected: 'bg-accent-coral/10 text-accent-coral border-accent-coral/30'
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col h-full group">
      {/* Turf Photo banner */}
      <div className="relative h-48 w-full overflow-hidden">
        <img 
          src={primaryImage} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slatebg-dark/80 via-transparent to-transparent" />
        
        {/* Cost tag badge overlay */}
        <div className="absolute bottom-3 left-4 bg-slatebg-dark/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700/50">
          <span className="text-sm font-semibold text-turf-light">{formatCurrency(pricePerHour)}</span>
          <span className="text-[10px] text-slate-400">/hr</span>
        </div>

        {/* Status indicator badge */}
        {showStatus && (
          <div className={`absolute top-3 right-3 border px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[status] || 'bg-slate-700 text-white'}`}>
            {status.toUpperCase()}
          </div>
        )}
      </div>

      {/* Turf Details */}
      <div className="p-5 flex flex-col flex-grow">
        <h4 className="text-lg font-bold font-sans text-white group-hover:text-turf-light transition duration-150 line-clamp-1 mb-1">
          {name}
        </h4>
        
        {/* Regional labels */}
        <p className="text-xs text-slate-400 flex items-center mb-3">
          <svg className="w-3.5 h-3.5 mr-1 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {city}, {district}
        </p>

        {/* Visual score display */}
        <div className="flex items-center space-x-2 mb-5">
          <StarRating rating={rating} />
          <span className="text-xs font-bold text-slate-300">({rating})</span>
        </div>

        {/* Call to action action button */}
        <div className="mt-auto">
          <Link 
            to={`/turfs/${_id}`}
            className="w-full inline-flex items-center justify-center py-2.5 bg-slate-800 hover:bg-turf text-white text-sm font-semibold rounded-xl transition duration-200"
          >
            View Details
            <svg className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TurfCard;
