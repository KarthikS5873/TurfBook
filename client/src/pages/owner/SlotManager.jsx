import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Spinner from '../../components/Spinner';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatTime } from '../../utils/slotHelpers';

/**
 * Slot Manager Page for Owners
 */
const SlotManager = () => {
  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [date, setDate] = useState(getTodayDateString());
  const [turf, setTurf] = useState(null);
  const [existingSlots, setExistingSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Bulk Slot configurations
  const [slotPrice, setSlotPrice] = useState('1000');
  const [selectedHours, setSelectedHours] = useState([]); // Array of hours (numbers, 0-23)

  // Typical hourly slot blocks
  const standardHours = [
    { start: '06:00', end: '07:00', label: '06:00 AM - 07:00 AM', val: 6 },
    { start: '07:00', end: '08:00', label: '07:00 AM - 08:00 AM', val: 7 },
    { start: '08:00', end: '09:00', label: '08:00 AM - 09:00 AM', val: 8 },
    { start: '09:00', end: '10:00', label: '09:00 AM - 10:00 AM', val: 9 },
    { start: '10:00', end: '11:00', label: '10:00 AM - 11:00 AM', val: 10 },
    { start: '15:00', end: '16:00', label: '03:00 PM - 04:00 PM', val: 15 },
    { start: '16:00', end: '17:00', label: '04:00 PM - 05:00 PM', val: 16 },
    { start: '17:00', end: '18:00', label: '05:00 PM - 06:00 PM', val: 17 },
    { start: '18:00', end: '19:00', label: '06:00 PM - 07:00 PM', val: 18 },
    { start: '19:00', end: '20:00', label: '07:00 PM - 08:00 PM', val: 19 },
    { start: '20:00', end: '21:00', label: '08:00 PM - 09:00 PM', val: 20 },
    { start: '21:00', end: '22:00', label: '09:00 PM - 10:00 PM', val: 21 },
    { start: '22:00', end: '23:00', label: '10:00 PM - 11:00 PM', val: 22 }
  ];

  const loadOwnerTurfAndSlots = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      // Fetch Owner Turf
      const response = await api.get('/turfs/my');
      const turfs = response.data.data || [];
      
      if (turfs.length === 0) {
        setError('Please register your turf details in the "Manage Turf" tab first before creating slots.');
        setLoading(false);
        return;
      }
      
      const currentTurf = turfs[0];
      setTurf(currentTurf);

      // Fetch existing slots for selected date
      const slotsResponse = await api.get('/slots', {
        params: { turfId: currentTurf._id, date }
      });
      setExistingSlots(slotsResponse.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load turf slots configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOwnerTurfAndSlots();
  }, [date]);

  const toggleHourSelect = (val) => {
    setSelectedHours(prev => {
      if (prev.includes(val)) {
        return prev.filter(h => h !== val);
      } else {
        return [...prev, val];
      }
    });
  };

  const handleBulkGenerate = async (e) => {
    e.preventDefault();
    if (!turf) return;
    if (selectedHours.length === 0) {
      return alert('Please select at least one hour block to generate.');
    }

    setError('');
    setMessage('');
    setSubmitting(true);

    const compiledSlots = standardHours
      .filter(item => selectedHours.includes(item.val))
      .map(item => ({
        startTime: item.start,
        endTime: item.end,
        price: Number(slotPrice)
      }));

    try {
      await api.post('/slots', {
        turfId: turf._id,
        date,
        slots: compiledSlots
      });

      setMessage('Slots generated successfully!');
      setSelectedHours([]); // reset selected checkmarks
      
      // Reload slots list
      const slotsResponse = await api.get('/slots', {
        params: { turfId: turf._id, date }
      });
      setExistingSlots(slotsResponse.data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to bulk generate slots.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this slot?')) return;
    setError('');
    try {
      await api.delete(`/slots/${slotId}`);
      setMessage('Slot deleted successfully.');
      setExistingSlots(prev => prev.filter(s => s._id !== slotId));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete slot.');
    }
  };

  return (
    <div className="min-h-screen bg-slatebg-dark font-sans text-white pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold font-sans mb-8">Slot Administrator</h1>

      {error && !turf && (
        <div className="p-6 bg-accent-coral/15 border border-accent-coral/30 text-accent-coral text-sm rounded-xl font-medium max-w-md mx-auto text-center glass-panel">
          {error}
        </div>
      )}

      {turf && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Generate Form panel */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel p-6 rounded-2xl border-slate-700/40">
              <h3 className="text-lg font-bold font-sans mb-4 border-b border-slate-800 pb-2">Bulk Slot Generator</h3>
              
              {message && (
                <div className="mb-4 p-3.5 bg-turf/10 border border-turf/20 text-turf-light text-xs rounded-xl font-medium">
                  {message}
                </div>
              )}
              
              {error && (
                <div className="mb-4 p-3.5 bg-accent-coral/10 border border-accent-coral/20 text-accent-coral text-xs rounded-xl font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleBulkGenerate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Date</label>
                    <input 
                      type="date"
                      min={getTodayDateString()}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-850 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-turf transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Price per Slot (₹)</label>
                    <input 
                      type="number"
                      value={slotPrice}
                      onChange={(e) => setSlotPrice(e.target.value)}
                      placeholder="1000"
                      className="w-full bg-slate-900/60 border border-slate-850 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-turf transition"
                    />
                  </div>
                </div>

                {/* Checkbox grid selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Select Hour Intervals</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-2 bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                    {standardHours.map((h) => {
                      const isChecked = selectedHours.includes(h.val);
                      return (
                        <button
                          key={h.val}
                          type="button"
                          onClick={() => toggleHourSelect(h.val)}
                          className={`flex items-center space-x-3 p-2.5 rounded-lg border text-left text-xs transition duration-150 ${
                            isChecked
                              ? 'bg-turf/10 border-turf/30 text-turf-light'
                              : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 border rounded flex items-center justify-center ${isChecked ? 'bg-turf border-turf' : 'border-slate-600'}`}>
                            {isChecked && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                          <span className="font-semibold">{h.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-turf hover:bg-turf-dark disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-turf/25 transition duration-200 flex items-center justify-center"
                >
                  {submitting ? <Spinner size="sm" /> : 'Generate Select Slots'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Existing Slots list */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel p-6 rounded-2xl border-slate-700/40 h-full flex flex-col">
              <h3 className="text-lg font-bold font-sans mb-4 border-b border-slate-800 pb-2">Active Slots ({existingSlots.length})</h3>
              
              {loading ? (
                <div className="py-24">
                  <Spinner />
                </div>
              ) : existingSlots.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-20">No slots configured for this date yet.</p>
              ) : (
                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {existingSlots.map((s) => (
                    <div key={s._id} className="flex justify-between items-center bg-slate-900/40 border border-slate-850 p-3 rounded-xl">
                      <div>
                        <p className="text-xs font-semibold text-white">
                          {formatTime(s.startTime)} - {formatTime(s.endTime)}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Price: {formatCurrency(s.price)} | {s.isBooked ? 'Booked' : 'Available'}
                        </p>
                      </div>

                      {!s.isBooked && (
                        <button
                          onClick={() => handleDeleteSlot(s._id)}
                          className="p-1.5 hover:bg-accent-coral/10 text-slate-400 hover:text-accent-coral rounded-lg transition"
                          title="Delete slot"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default SlotManager;
