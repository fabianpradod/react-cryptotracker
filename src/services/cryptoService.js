const BASE_URL = 'https://www.alphavantage.co/query';
const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY;

/**
 * Fetches the global crypto market data.
 */
export async function fetchCryptos(symbols = ['BTC','ETH','BNB','XRP','ADA','DOGE','SOL','DOT','MATIC','LTC']) {
  // Map over the top symbols and fire off price requests in parallel
  const promises = symbols.map(symbol =>
    fetch(`${BASE_URL}?function=CURRENCY_EXCHANGE_RATE&from_currency=${symbol}&to_currency=USD&apikey=${API_KEY}`)
      .then(res => res.json())
      .then(data => {
        const info = data['Realtime Currency Exchange Rate'];
        return {
          symbol,
          price: parseFloat(info['5. Exchange Rate']),
          lastRefreshed: info['6. Last Refreshed']
        };
      })
  );
  return Promise.all(promises);
}
