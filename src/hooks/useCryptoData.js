import { useState, useEffect } from 'react';
import {
  fetchExchanges,
  fetchMarkets,
  fetchCurrentPrice,
  fetchTrades
} from '../services/cryptoService';

export function useCryptoData() {
  const [exchanges, setExchanges] = useState([]);
  const [markets, setMarkets]     = useState([]);
  const [overview, setOverview]   = useState([]); // [{ exchange, market, price }]
  const [trades, setTrades]       = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  // 1. Load exchanges on mount
  useEffect(() => {
    fetchExchanges().then(setExchanges).catch(setError);
  }, []);

  // 2. When an exchange is selected, load its markets + overview
  async function loadOverview(exchangeId) {
    setLoading(true);
    try {
      const mks = await fetchMarkets(exchangeId);
      setMarkets(mks);
      // parallel price fetch for each market
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

  // 3. When a market is clicked, load its trades
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
