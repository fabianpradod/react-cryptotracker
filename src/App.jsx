import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import './index.css';

export default function App() {
  // Dark mode
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  // Page state: 'landing' | 'select' | 'overview' | 'trades'
  const [page, setPage] = useState('landing');
  const [selectedExchange, setSelectedExchange] = useState(null);
  const [selectedMarket, setSelectedMarket]     = useState(null);

  // MOCK DATA
  const exchanges = [
    { id: 'ace',       name: 'ACE' },
    { id: 'alpaca',    name: 'Alpaca' },
    { id: 'ascendex',  name: 'AscendEX' },
    { id: 'bequant',   name: 'Bequant' },
    { id: 'bigone',    name: 'BigONE' },
    { id: 'binance',   name: 'Binance' },
    { id: 'binancem',  name: 'Binance COIN‑M' },
  ];
  const coins = [
    { id: 'BTC', symbol: 'BTC', name: 'Bitcoin',  price: 79684 },
    { id: 'ETH', symbol: 'ETH', name: 'Ethereum', price: 4500 },
    { id: 'LTC', symbol: 'LTC', name: 'Litecoin', price: 200  },
  ];
  const trades = [
    { timestamp: '1744316977765', price: 79553, size: 0.0005, cost: 39.7765, side: 'sell' },
    { timestamp: '1744317014769', price: 79896, size: 0.0002, cost: 15.9792, side: 'buy'  },
    // …add more mock trades here
  ];

  // Renders the back button on non‑landing pages
  const renderBack = () => (
    <button
      className="btn-secondary back-button"
      onClick={() => {
        if (page === 'select')   setPage('landing');
        if (page === 'overview') setPage('select');
        if (page === 'trades')   setPage('overview');
      }}
    >
      ← Back
    </button>
  );

  return (
    <div id="root">
      {/* Dark/Light Toggle */}
      <div
        className="dark-mode-toggle"
        onClick={() => setDarkMode(d => !d)}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
      </div>

      {/* Back button on all but landing */}
      {page !== 'landing' && renderBack()}

      {/* 1) Landing Page */}
      {page === 'landing' && (
        <div className="card" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Crypto Tracker</h1>
          <p style={{ marginBottom: '1.5rem' }}>Made by: Fabian Prado Dluzniewski</p>
          <button className="button" onClick={() => setPage('select')}>
            Start Tracking
          </button>
        </div>
      )}

      {/* 2) Select Exchange */}
      {page === 'select' && (
        <div className="card">
          <h2 className="select-title">Select an Exchange</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {exchanges.map(ex => (
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
        </div>
      )}

      {/* 3) Overview (coins list) */}
      {page === 'overview' && (
        <div className="card table-card">
          <h2>{selectedExchange} – Markets</h2>
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
              {coins.map(c => (
                <tr key={c.id}>
                  <td>{selectedExchange}</td>
                  <td>{c.symbol}</td>
                  <td>{c.name}</td>
                  <td style={{ textAlign: 'right' }}>${c.price.toLocaleString()}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="button"
                      onClick={() => {
                        setSelectedMarket(c.symbol);
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
        </div>
      )}

      {/* 4) Trades Page */}
      {page === 'trades' && (
        <div className="card table-card">
          <h2>{selectedExchange} – {selectedMarket} Trades</h2>
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
                  <td style={{ textAlign: 'right' }}>${t.price}</td>
                  <td style={{ textAlign: 'right' }}>{t.size}</td>
                  <td style={{ textAlign: 'right' }}>${t.cost}</td>
                  <td>{t.side}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
