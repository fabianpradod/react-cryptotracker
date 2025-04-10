/**
 * Fetches cryptocurrency data from Alpha Vantage API with rate limiting
 */
export async function fetchCryptos(symbols = ['BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'DOT']) {
  const results = [];

  for (const symbol of symbols) {
    try {
      const url = `${BASE_URL}?function=CURRENCY_EXCHANGE_RATE&from_currency=${symbol}&to_currency=USD&apikey=${API_KEY}`;
      console.log(`Fetching data for ${symbol}`);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Response for ${symbol}:`, data);

      if (data.Note) {
        console.error('API limit reached:', data.Note);
        results.push({
          symbol,
          price: 0,
          lastRefreshed: new Date().toISOString(),
          error: true,
        });
        continue;
      }

      // Validate response format
      const exchangeRate = data['Realtime Currency Exchange Rate'];
      if (!exchangeRate || !exchangeRate['5. Exchange Rate']) {
        console.error(`Invalid response format for ${symbol}:`, data);
        results.push({
          symbol,
          price: 0,
          lastRefreshed: new Date().toISOString(),
          error: true,
        });
        continue;
      }

      // Extract relevant data
      results.push({
        symbol,
        price: parseFloat(exchangeRate['5. Exchange Rate']),
        lastRefreshed: exchangeRate['6. Last Refreshed'],
        error: false,
      });
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error.message);
      results.push({
        symbol,
        price: 0,
        lastRefreshed: new Date().toISOString(),
        error: true,
      });
    }
  }

  return results;
}