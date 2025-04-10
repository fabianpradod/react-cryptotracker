import { useState, useEffect } from 'react';
import { Sun, Moon, Search } from 'lucide-react';
import './index.css';

export default function CryptoTracker() {
  const [darkMode, setDarkMode] = useState(false);
  const [page, setPage] = useState('landing');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const coins = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 54321.98, change24h: 2.45 },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 2543.76, change24h: -1.20 },
    { id: 'binancecoin', symbol: 'BNB', name: 'Binance Coin', price: 345.87, change24h: 0.35 },
    { id: 'ripple', symbol: 'XRP', name: 'Ripple', price: 0.52, change24h: -0.15 },
    { id: 'cardano', symbol: 'ADA', name: 'Cardano', price: 0.43, change24h: 1.23 },
  ];

  // Apply dark-mode class to root element
  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  // Filtered list
  const filtered = coins.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="root">
      {/* Dark/Light Toggle */}
      <div
        className="dark-mode-toggle"
        onClick={() => setDarkMode(prev => !prev)}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </div>

      {/* Landing Page */}
      {page === 'landing' && (
        <div className="card" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Crypto Tracker</h1>
          <p style={{ marginBottom: '1.5rem' }}>Made by: Fabian Prado Dluzniewski</p>
          <button className="button" onClick={() => setPage('tracker')}>Start Tracking</button>
        </div>
      )}

      {/* Tracker Page */}
      {page === 'tracker' && (
        <div className="tracker">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Cryptocurrency Tracker</h2>
            <button className="button" onClick={() => setPage('landing')}>Back to Home</button>
          </div>

          <div className="card table-card">
            <div className="search-wrapper">
              <Search size={20} className="icon" />
              <input
                type="text"
                placeholder="Search by name or symbol..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <table className="table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Name</th>
                  <th style={{ textAlign: 'right' }}>Price (USD)</th>
                  <th style={{ textAlign: 'right' }}>24h Change</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(coin => (
                  <tr key={coin.id}>
                    <td>{coin.symbol}</td>
                    <td>{coin.name}</td>
                    <td style={{ textAlign: 'right' }}>${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td
                      style={{ textAlign: 'right' }}
                      className={coin.change24h >= 0 ? 'positive' : 'negative'}
                    >
                      {coin.change24h > 0 ? '+' : ''}{coin.change24h}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="card" style={{ textAlign: 'center' }}>
                No cryptocurrencies found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}