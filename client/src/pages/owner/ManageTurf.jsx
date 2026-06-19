import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import turfService from '../../services/turfService';
import Spinner from '../../components/Spinner';

/**
 * Manage Turf Details Page
 */
const ManageTurf = () => {
  const [turf, setTurf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Dropdown options lists
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [amenitiesText, setAmenitiesText] = useState('');

  // Image files parameters
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await api.get('/districts');
        setDistricts(response.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    const loadOwnerTurf = async () => {
      setLoading(true);
      try {
        // Retrieve owner's turfs
        const response = await api.get('/turfs/my');
        const list = response.data.data || [];
        
        if (list.length > 0) {
          const t = list[0]; // Manage their first turf
          setTurf(t);
          setName(t.name || '');
          setDescription(t.description || '');
          setDistrict(t.district || '');
          setCity(t.city || '');
          setAddress(t.address || '');
          setPricePerHour(t.pricePerHour || '');
          setAmenitiesText(t.amenities ? t.amenities.join(', ') : '');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load turf profile details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDistricts();
    loadOwnerTurf();
  }, []);

  // Update cities select dropdown options when district updates
  useEffect(() => {
    if (district) {
      const selected = districts.find(d => d.name.toLowerCase() === district.toLowerCase());
      setCities(selected ? selected.cities : []);
    } else {
      setCities([]);
    }
  }, [district, districts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    const turfPayload = {
      name,
      description,
      district,
      city,
      address,
      pricePerHour: Number(pricePerHour),
      amenities: amenitiesText ? amenitiesText.split(',').map(s => s.trim()) : []
    };

    try {
      let savedTurf;
      if (turf) {
        // Edit existing
        savedTurf = await turfService.updateTurf(turf._id, turfPayload);
        setTurf(savedTurf);
        setMessage('Turf details updated successfully! Awaiting re-approval.');
      } else {
        // Create new
        savedTurf = await turfService.createTurf(turfPayload);
        setTurf(savedTurf);
        setMessage('Turf registered successfully! Awaiting administrator approval.');
      }

      // Handle photos upload if files selected
      if (selectedFiles.length > 0 && savedTurf) {
        const updated = await turfService.uploadPhotos(savedTurf._id, selectedFiles);
        setTurf(updated);
        setSelectedFiles([]);
        setMessage(prev => `${prev} Photos uploaded successfully.`);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save turf profile settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slatebg-dark">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slatebg-dark font-sans text-white pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-extrabold font-sans mb-8">
        {turf ? 'Modify Turf Settings' : 'Register Playground'}
      </h1>

      <div className="glass-panel p-8 rounded-2xl border-slate-700/40 space-y-6">
        {error && (
          <div className="p-4 bg-accent-coral/10 border border-accent-coral/20 text-accent-coral text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {message && (
          <div className="p-4 bg-turf/10 border border-turf/20 text-turf-light text-xs rounded-xl font-medium">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Turf Name</label>
              <input 
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Champions Arena"
                className="w-full bg-slate-900/50 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-turf focus:ring-1 focus:ring-turf transition"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Price Per Hour (₹)</label>
              <input 
                type="number"
                required
                value={pricePerHour}
                onChange={(e) => setPricePerHour(e.target.value)}
                placeholder="1200"
                className="w-full bg-slate-900/50 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-turf focus:ring-1 focus:ring-turf transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Description</label>
            <textarea 
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe amenities, dimensions, types of grass/floor..."
              className="w-full bg-slate-900/50 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-turf focus:ring-1 focus:ring-turf transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">District</label>
              <select
                required
                value={district}
                onChange={(e) => { setDistrict(e.target.value); setCity(''); }}
                className="w-full bg-slate-900/50 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-turf transition cursor-pointer"
              >
                <option value="">Select District</option>
                {districts.map(d => (
                  <option key={d._id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">City/Town Area</label>
              <select
                required
                disabled={!district}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700/60 disabled:border-slate-800 disabled:text-slate-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-turf transition cursor-pointer"
              >
                <option value="">Select City/Town</option>
                {cities.map((c, idx) => (
                  <option key={idx} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Full Address</label>
            <input 
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Plot No. 12, GST Road, Chromepet"
              className="w-full bg-slate-900/50 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-turf focus:ring-1 focus:ring-turf transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Amenities (Comma separated)</label>
            <input 
              type="text"
              value={amenitiesText}
              onChange={(e) => setAmenitiesText(e.target.value)}
              placeholder="Floodlights, Washroom, Parking, Cafeteria"
              className="w-full bg-slate-900/50 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-turf focus:ring-1 focus:ring-turf transition"
            />
          </div>

          {/* Photo uploads section */}
          <div className="border-t border-slate-800 pt-6">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Upload Photos</label>
            <input 
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-slate-400 text-xs file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700 file:cursor-pointer"
            />
            {selectedFiles.length > 0 && (
              <p className="text-xs text-turf-light mt-2">{selectedFiles.length} files selected ready to upload.</p>
            )}

            {/* Display current photos */}
            {turf?.images && turf.images.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Active Images</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {turf.images.map((img, idx) => (
                    <img key={idx} src={img} alt="" className="w-16 h-16 object-cover rounded-lg border border-slate-800" />
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-turf hover:bg-turf-dark disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-turf/20 hover:shadow-none transition duration-200 mt-4 flex items-center justify-center"
          >
            {saving ? <Spinner size="sm" /> : turf ? 'Save Profile Changes' : 'Register Playground'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManageTurf;
