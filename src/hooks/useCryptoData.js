import { useState, useEffect } from 'react';
import {
  fetchExchanges,
  fetchMarkets,
  fetchCurrentPrice,
  fetchTrades
} from '../services/cryptoService';

export function useCryptoData() {
  // State for lists, overview, trades, loading and errors
  const [exchanges, setExchanges] = useState([]);
  const [markets, setMarkets]     = useState([]);
  const [overview, setOverview]   = useState([]); // [{ exchange, market, price }]
  const [trades, setTrades]       = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  // 1. Load all exchanges once on mount
  useEffect(() => {
    fetchExchanges()
      .then(setExchanges)
      .catch(setError);
  }, []);

  // 2. Fetch markets + overview prices for a given exchange
  async function loadOverview(exchangeId) {
    setLoading(true);
    try {
      // 2a. Fetch markets list
      const mks = await fetchMarkets(exchangeId);
      setMarkets(mks);

      // 2b. For each market, fetch current price in parallel
      const data = await Promise.all(
        mks.map(m =>
          fetchCurrentPrice(exchangeId, m).then(d => ({
            exchange: exchangeId,
            market: d.market,
            price: d.price
          }))
        )
      );
      setOverview(data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  // 3. Fetch recent trades for a specific market
  async function loadTrades(exchangeId, market) {
    setLoading(true);
    try {
      const t = await fetchTrades(exchangeId, market);
      setTrades(t.trades);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  // Expose state + actions
  return {
    exchanges,
    markets,
    overview,
    trades,
    loading,
    error,
    loadOverview,
    loadTrades
  };
}
