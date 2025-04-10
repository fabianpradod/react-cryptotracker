import React from 'react';
import { useCryptos } from './hooks/useCryptos';
import './App.css';

function App() {
  const { cryptos, loading, error, refresh, lastUpdated } = useCryptos();

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '800px', 
      margin: '0 auto',
      color: '#000' 
    }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        color: '#000' 
      }}>
        <h1>Top Cryptocurrencies (USD)</h1>
        <button 
          onClick={refresh} 
          disabled={loading}
          style={{ 
            padding: '8px 16px',
            backgroundColor: '#f0f0f0',
            color: '#000'
          }}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </header>
      
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      
      {loading && <p style={{ color: '#000' }}>Loading cryptocurrencies…</p>}
      
      {!loading && cryptos.length === 0 && (
        <p style={{ color: '#000' }}>No cryptocurrency data available.</p>
      )}

      {!loading && cryptos.length > 0 && (
        <>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {cryptos.map(c => (
              <li key={c.symbol} style={{ 
                margin: '10px 0', 
                padding: '15px', 
                border: '1px solid #ddd', 
                borderRadius: '5px',
                backgroundColor: c.error ? '#fff5f5' : '#f5fffa',
                color: '#000' 
              }}>
                {c.error ? (
                  <>
                    <strong>{c.symbol}:</strong> Unable to load price data
                    {c.errorMsg && <div style={{ color: 'red', fontSize: '0.9em', marginTop: '5px' }}>{c.errorMsg}</div>}
                  </>
                ) : (
                  <>
                    <strong>{c.symbol}:</strong> ${c.price.toFixed(2)}{' '}
                    <em style={{ color: '#444' }}>({new Date(c.lastRefreshed).toLocaleTimeString()})</em>
                  </>
                )}
              </li>
            ))}
          </ul>
          
          {lastUpdated && (
            <div style={{ textAlign: 'right', fontSize: '0.8em', color: '#444', marginTop: '10px' }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </>
      )}
      
      <div style={{ 
        marginTop: '30px', 
        fontSize: '0.85em', 
        color: '#444', 
        padding: '15px', 
        backgroundColor: '#f9f9f9', 
        borderRadius: '5px' 
      }}>
        <p><strong>Note:</strong> Alpha Vantage API has the following limitations:</p>
        <ul>
          <li>Free tier: 5 requests/minute, 500 requests/day</li>
          <li>Some cryptocurrency symbols may not be supported</li>
        </ul>
        <p>To reduce rate limit issues, this app processes requests sequentially with delays between them.</p>
      </div>
    </div>
  );
}

export default App;