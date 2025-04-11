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
  // --- Dark mode state & side effect ---
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  // --- Page navigation state ---
  const [page, setPage] = useState('landing'); // 'landing' | 'select' | 'overview' | 'trades'
  const [selectedExchange, setSelectedExchange] = useState(null);
  const [selectedMarket, setSelectedMarket] = useState(null);

  // --- Data + UI state ---
  const [exchanges, setExchanges] = useState([]);
  const [validExchanges, setValidExchanges] = useState([]); // Only exchanges with markets
  const [priceData, setPriceData] = useState([]); // overview rows
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exchangesLoading, setExchangesLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Search filters ---
  const [exchangeQuery, setExchangeQuery] = useState('');
  const [marketQuery, setMarketQuery] = useState('');

  // 1) Load exchanges and check for markets when going to select page
  useEffect(() => {
    if (page === 'select' && validExchanges.length === 0) {
      (async () => {
        setExchangesLoading(true);
        try {
          const data = await fetchExchanges();
          setExchanges(data);
          
          // Process exchanges in batches to avoid overwhelming the API
          const batchSize = 5;
          const validExchangesList = [];
          
          // Process exchanges in batches of 5
          for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            
            // Check each exchange in the batch in parallel
            const batchResults = await Promise.all(
              batch.map(async (ex) => {
                try {
                  const markets = await fetchMarkets(ex.id);
                  if (markets && markets.length > 0) {
                    return ex; // Return the exchange if it has markets
                  }
                  return null; // Skip exchanges without markets
                } catch (e) {
                  console.error(`Error checking markets for ${ex.name}:`, e);
                  return null;
                }
              })
            );
            
            // Add valid exchanges from this batch to our list
            validExchangesList.push(...batchResults.filter(ex => ex !== null));
            
            // Update state incrementally to show progress
            setValidExchanges([...validExchangesList]);
          }
        } catch (e) {
          setError('Failed to load exchanges');
        } finally {
          setExchangesLoading(false);
        }
      })();
    }
  }, [page, validExchanges.length]);

  // 2) When an exchange is selected → load markets + price overview
  useEffect(() => {
    if (!selectedExchange) return;
    (async () => {
      setLoading(true);
      try {
        const ex = exchanges.find(e => e.name === selectedExchange);
        const markets = await fetchMarkets(ex.id);
        
        // If no markets, clear overview
        if (markets.length === 0) {
          setPriceData([]);
          setLoading(false);
          return;
        }
        
        // Fetch first 20 prices in parallel
        const pricePromises = markets.slice(0, 20).map(async m => {
          try {
            const d = await fetchCurrentPrice(ex.id, m);
            if (d.price !== 0) { // Only include if price is non-zero
              return {
                id: m,
                exchange: ex.name,
                symbol: m.split('/')[0],
                name: m.split('/')[0],
                price: d.price
              };
            }
            return null; // Skip this market if price is 0
          } catch (e) {
            console.error(`Failed to load price for ${m}`, e);
            return null;
          }
        });
        
        const prices = await Promise.all(pricePromises);
        // Filter out null values (markets without valid price data)
        setPriceData(prices.filter(p => p !== null));
      } catch (e) {
        setError('Failed to load markets');
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedExchange, exchanges]);

  // 3) When a market is selected → load its trades
  useEffect(() => {
    if (!selectedExchange || !selectedMarket) return;
    (async () => {
      setLoading(true);
      try {
        const ex = exchanges.find(e => e.name === selectedExchange);
        const data = await fetchTrades(ex.id, selectedMarket);
        setTrades(data.trades || []);
      } catch (e) {
        setError('Failed to load trades');
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedExchange, selectedMarket, exchanges]);

  // Back button handler
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

  // Filtered exchanges based on search query
  const filteredExchanges = validExchanges.filter(e =>
    e.name.toLowerCase().includes(exchangeQuery.toLowerCase())
  );

  const filteredMarkets = priceData.filter(p =>
    p.symbol.toLowerCase().includes(marketQuery.toLowerCase()) ||
    p.name.toLowerCase().includes(marketQuery.toLowerCase())
  );

  // --- Loading and error screens ---
  if (loading && page !== 'landing' && page !== 'select') {
    return (
      <div className="card loading-screen">
        <div className="spinner" />
        <h2>Loading…</h2>
      </div>
    );
  }
  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <h2>Error</h2><p>{error}</p>
        <button className="button" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // --- Main render ---
  return (
    <div id="root">
      {/* Dark mode toggle */}
      <div
        className="dark-mode-toggle"
        onClick={() => setDarkMode(d => !d)}
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
      </div>

      {page !== 'landing' && renderBack()}

      {/* 1) Landing page */}
      {page === 'landing' && (
        <div className="card" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Crypto Tracker</h1>
          <p style={{ marginBottom: '1.5rem' }}>By Fabian Prado Dluzniewski</p>
          <button 
            className="button" 
            onClick={() => setPage('select')}
          >
            Start Tracking
          </button>
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
          
          {/* Loading state message */}
          {exchangesLoading && validExchanges.length === 0 && (
            <p>Loading exchanges...</p>
          )}
          
          {/* Exchanges list */}
          {validExchanges.length > 0 && (
            <>
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
              
              {/* Show loading message if still loading more exchanges */}
              {exchangesLoading && (
                <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>
                  Loading more exchanges...
                </p>
              )}
              
              {/* No results message */}
              {!exchangesLoading && filteredExchanges.length === 0 && (
                <p>No exchanges found for "{exchangeQuery}"</p>
              )}
            </>
          )}
          
          {/* No exchanges at all */}
          {!exchangesLoading && validExchanges.length === 0 && (
            <p>No exchanges with markets found. Please try again later.</p>
          )}
        </div>
      )}

      {/* 3) Markets Overview */}
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
          {filteredMarkets.length === 0 ? (
            <p>No markets found {marketQuery ? `for "${marketQuery}"` : 'with available price data'}</p>
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

      {/* 4) Trades List */}
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