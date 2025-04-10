import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import './index.css';
import {
  fetchExchanges,
  fetchMarkets,
  fetchCurrentPrice,
  fetchTrades
} from './services/cryptoService';

export default function App() {
  // Dark mode
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  // Page state
  const [page, setPage] = useState('landing'); // 'landing' | 'select' | 'overview' | 'trades'
  const [selectedExchange, setSelectedExchange] = useState(null);
  const [selectedMarket, setSelectedMarket]     = useState(null);

  // Data & loading/error
  const [exchanges, setExchanges] = useState([]);
  const [priceData, setPriceData] = useState([]);
  const [trades, setTrades]       = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  // Search queries
  const [exchangeQuery, setExchangeQuery] = useState('');
  const [marketQuery, setMarketQuery]     = useState('');

  // 1) Load exchanges
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchExchanges();
        setExchanges(data);
      } catch (e) {
        setError('Failed to load exchanges');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2) When exchange selected → load overview
  useEffect(() => {
    if (!selectedExchange) return;
    (async () => {
      setLoading(true);
      try {
        const ex = exchanges.find(e => e.name === selectedExchange);
        const markets = await fetchMarkets(ex.id);
        // Precheck: no markets?
        if (markets.length === 0) {
          setPriceData([]);
          return;
        }
        const prices = await Promise.all(
          markets.slice(0, 20).map(async m => {
            const d = await fetchCurrentPrice(ex.id, m);
            return {
              id: m,
              exchange: ex.name,
              symbol: m.split('/')[0],
              name: m.split('/')[0],
              price: d.price
            };
          })
        );
        setPriceData(prices);
      } catch (e) {
        setError('Failed to load markets');
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedExchange, exchanges]);

  // 3) When market selected → load trades
  useEffect(() => {
    if (!selectedExchange || !selectedMarket) return;
    (async () => {
      setLoading(true);
      try {
        const ex = exchanges.find(e => e.name === selectedExchange);
        const data = await fetchTrades(ex.id, selectedMarket);
        // Precheck: no trades?
        setTrades(data.trades || []);
      } catch (e) {
        setError('Failed to load trades');
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedExchange, selectedMarket, exchanges]);

  // Back button
  const renderBack = () => (
    <button
      className="btn-secondary back-button"
      onClick={() => {
        if (page === 'select') setPage('landing');
        if (page === 'overview') {
          setPage('select');
          setSelectedExchange(null);
        }
        if (page === 'trades') {
          setPage('overview');
          setSelectedMarket(null);
        }
      }}
    >
      ← Back
    </button>
  );

  // Filtered lists
  const filteredExchanges = exchanges.filter(e =>
    e.name.toLowerCase().includes(exchangeQuery.toLowerCase())
  );
  const filteredMarkets = priceData.filter(p =>
    p.symbol.toLowerCase().includes(marketQuery.toLowerCase()) ||
    p.name.toLowerCase().includes(marketQuery.toLowerCase())
  );

  // Loading & error UI
  if (loading && page !== 'landing') {
    return <div className="card" style={{ textAlign: 'center' }}><h2>Loading…</h2></div>;
  }
  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <h2>Error</h2><p>{error}</p>
        <button className="button" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div id="root">
      {/* Dark toggle */}
      <div
        className="dark-mode-toggle"
        onClick={() => setDarkMode(d => !d)}
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
      </div>

      {page !== 'landing' && renderBack()}

      {/* 1) Landing */}
      {page === 'landing' && (
        <div className="card" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Crypto Tracker</h1>
          <p style={{ marginBottom: '1.5rem' }}>By Fabian Prado Dluzniewski</p>
          <button className="button" onClick={() => setPage('select')}>Start Tracking</button>
        </div>
      )}

      {/* 2) Select Exchange */}
      {page === 'select' && (
        <div className="card">
          <h2 className="select-title">Select an Exchange</h2>
          <div className="search-wrapper" style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Search exchanges..."
              value={exchangeQuery}
              onChange={e => setExchangeQuery(e.target.value)}
            />
          </div>
          {/* Precheck: no exchanges */}
          {filteredExchanges.length === 0 ? (
            <p>No exchanges found for "{exchangeQuery}"</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {filteredExchanges.map(ex => (
                <li key={ex.id}>
                  <button
                    className="btn-secondary exchange-button"
                    onClick={() => {
                      setSelectedExchange(ex.name);
                      setPage('overview');
                    }}
                  >
                    {ex.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* 3) Overview Markets */}
      {page === 'overview' && (
        <div className="card table-card">
          <h2>{selectedExchange} – Markets</h2>
          <div className="search-wrapper" style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Search markets..."
              value={marketQuery}
              onChange={e => setMarketQuery(e.target.value)}
            />
          </div>
          {/* Precheck: no markets */}
          {filteredMarkets.length === 0 ? (
            <p>No markets found for "{marketQuery}"</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Exchange</th>
                  <th>Symbol</th>
                  <th>Name</th>
                  <th style={{ textAlign: 'right' }}>Price (USD)</th>
                  <th>Trades</th>
                </tr>
              </thead>
              <tbody>
                {filteredMarkets.map(c => (
                  <tr key={c.id}>
                    <td>{c.exchange}</td>
                    <td>{c.symbol}</td>
                    <td>{c.name}</td>
                    <td style={{ textAlign: 'right' }}>
                      ${c.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="button"
                        onClick={() => {
                          setSelectedMarket(c.id);
                          setPage('trades');
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* 4) Trades */}
      {page === 'trades' && (
        <div className="card table-card">
          <h2>{selectedExchange} – {selectedMarket} Trades</h2>
          {trades.length === 0 ? (
            <p>No trades available.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'right' }}>Size</th>
                  <th style={{ textAlign: 'right' }}>Cost</th>
                  <th>Side</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t,i) => (
                  <tr key={i}>
                    <td>{new Date(+t.timestamp).toLocaleTimeString()}</td>
                    <td style={{ textAlign: 'right' }}>${t.price.toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>{t.size}</td>
                    <td style={{ textAlign: 'right' }}>${t.cost.toLocaleString()}</td>
                    <td>{t.side}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
