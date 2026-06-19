import { useState, useEffect } from 'react';
import turfService from '../services/turfService';

/**
 * Custom hook to manage fetching and filtering of turfs
 * @param {Object} [initialFilters] - Default filter arguments
 */
const useTurfs = (initialFilters = {}) => {
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchTurfs = async () => {
    setLoading(true);
    try {
      const data = await turfService.getTurfs(filters);
      setTurfs(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to retrieve turfs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTurfs();
  }, [filters]);

  return {
    turfs,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchTurfs
  };
};

export default useTurfs;
