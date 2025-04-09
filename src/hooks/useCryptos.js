import { useState, useEffect } from 'react';
import { fetchTopCryptos } from '../services/cryptoService';

export function useCryptos() {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchCryptos();
        setCryptos(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { cryptos, loading, error };
}