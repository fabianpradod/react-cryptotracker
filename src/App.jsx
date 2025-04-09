import React from 'react';
import { useCryptos } from './hooks/useCryptos';

function App() {
  const { cryptos, loading, error } = useCryptos();

  if (loading) return <p>Loading top 10 cryptos…</p>;
  if (error)   return <p>Error loading data: {error.message}</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Top 10 Cryptocurrencies (USD)</h1>
      <ul>
        {cryptos.map(c => (
          <li key={c.symbol}>
            <strong>{c.symbol}:</strong> ${c.price.toFixed(2)}{' '}
            <em>({new Date(c.lastRefreshed).toLocaleTimeString()})</em>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
