import { useState, useEffect, useCallback } from 'react';
import { fetchCryptos } from '../services/cryptoService';

export function useCryptos() {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadCryptos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCryptos();
      setCryptos(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadCryptos();
  }, [loadCryptos]);

  return { 
    cryptos, 
    loading, 
    error, 
    refresh: loadCryptos,
    lastUpdated 
  };
}