import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Spinner from './Spinner';
import { formatTime } from '../utils/slotHelpers';
import { formatCurrency } from '../utils/formatCurrency';

/**
 * Slot Picker Grid UI
 * @param {String} turfId - Turf model identifier
 * @param {Function} onSelectSlots - Callback when slots and date selection update
 */
const SlotPicker = ({ turfId, onSelectSlots }) => {
  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [date, setDate] = useState(getTodayDateString());
  const [slots, setSlots] = useState([]);
  const [selectedSlotIds, setSelectedSlotIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch slots whenever date changes
  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/slots', {
          params: { turfId, date }
        });
        setSlots(response.data.data || []);
      } catch (err) {
        console.error('Error fetching slots:', err);
        setError('Failed to fetch available time slots.');
      } finally {
        setLoading(false);
      }
    };

    if (turfId && date) {
      fetchSlots();
      setSelectedSlotIds([]); // Reset selected slots when date changes
    }
  }, [turfId, date]);

  // Sync selected slots back to parent component
  useEffect(() => {
    const selectedObjects = slots.filter(s => selectedSlotIds.includes(s._id));
    onSelectSlots(selectedObjects, date);
  }, [selectedSlotIds, date]);

  const toggleSlotSelection = (slotId) => {
    setSelectedSlotIds(prev => {
      if (prev.includes(slotId)) {
        return prev.filter(id => id !== slotId);
      } else {
        return [...prev, slotId];
      }
    });
  };

  const totalSelectedPrice = slots
    .filter(s => selectedSlotIds.includes(s._id))
    .reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="flex flex-col space-y-6">
      {/* Date Picker Input */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">Select Date</label>
        <input 
          type="date"
          min={getTodayDateString()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-slate-900/50 border border-slate-700/60 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-turf focus:ring-1 focus:ring-turf transition"
        />
      </div>

      {/* Slots Section */}
      <div>
        <h5 className="text-sm font-semibold text-slate-300 mb-4">Available Time Slots</h5>
        
        {loading ? (
          <div className="py-12">
            <Spinner />
          </div>
        ) : error ? (
          <p className="text-sm text-accent-coral text-center py-6">{error}</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-12 glass-panel rounded-xl">
            No slots configured for this date. Check back later or select another date.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {slots.map((slot) => {
              const isSelected = selectedSlotIds.includes(slot._id);
              const isBooked = slot.isBooked;

              return (
                <button
                  key={slot._id}
                  type="button"
                  disabled={isBooked}
                  onClick={() => toggleSlotSelection(slot._id)}
                  className={`border py-3 px-4 rounded-xl text-center flex flex-col items-center justify-center transition-all duration-200 ${
                    isBooked 
                      ? 'bg-slate-800/40 border-slate-800 text-slate-500 cursor-not-allowed line-through'
                      : isSelected
                        ? 'bg-turf border-turf text-white shadow-lg shadow-turf/20 scale-95'
                        : 'bg-slate-900/40 border-slate-700/40 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <span className="text-sm font-semibold">
                    {formatTime(slot.startTime)}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    {formatTime(slot.endTime)}
                  </span>
                  <span className={`text-[11px] font-bold mt-2 ${isSelected ? 'text-white' : 'text-turf-light'}`}>
                    {formatCurrency(slot.price)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Items summary panel */}
      {selectedSlotIds.length > 0 && (
        <div className="glass-panel p-4 rounded-xl border-slate-700/40 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Selected Slots</p>
            <p className="text-sm font-bold text-white mt-0.5">
              {selectedSlotIds.length} slot{selectedSlotIds.length > 1 ? 's' : ''} selected
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Total Price</p>
            <p className="text-lg font-bold text-turf-light mt-0.5">
              {formatCurrency(totalSelectedPrice)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlotPicker;
