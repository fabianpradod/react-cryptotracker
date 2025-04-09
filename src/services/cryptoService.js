const BASE_URL = 'https://www.alphavantage.co/query';
const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY;

// Helper function to delay execution (to avoid rate limits)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetches cryptocurrency data from Alpha Vantage API with rate limiting
 */
export async function fetchCryptos(symbols = ['BTC','ETH','BNB','XRP','ADA','DOT']) {
  const results = [];
  
  // Process symbols one at a time with delay between requests
  for (const symbol of symbols) {
    try {
      const url = `${BASE_URL}?function=CURRENCY_EXCHANGE_RATE&from_currency=${symbol}&to_currency=USD&apikey=${API_KEY}`;
      console.log(`Fetching data for ${symbol}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      // Handle rate limit messages
      if (data.Note) {
        console.error('API limit reached:', data.Note);
        results.push({
          symbol,
          price: 0,
          lastRefreshed: new Date().toISOString(),
          error: true,
          errorMsg: 'API rate limit exceeded'
        });
      }
      // Handle error messages
      else if (data['Error Message']) {
        console.error('API error:', data['Error Message']);
        results.push({
          symbol,
          price: 0,
          lastRefreshed: new Date().toISOString(),
          error: true,
          errorMsg: data['Error Message']
        });
      }
      // Process successful response
      else {
        const info = data['Realtime Currency Exchange Rate'];
        if (!info) {
          results.push({
            symbol,
            price: 0,
            lastRefreshed: new Date().toISOString(),
            error: true,
            errorMsg: 'Invalid response format'
          });
        } else {
          results.push({
            symbol,
            price: parseFloat(info['5. Exchange Rate']),
            lastRefreshed: info['6. Last Refreshed'],
            error: false
          });
        }
      }
      
      // Add delay between requests to avoid hitting rate limits
      await delay(1500); 
      
    } catch (err) {
      console.error(`Error fetching ${symbol}:`, err);
      results.push({
        symbol,
        price: 0,
        lastRefreshed: new Date().toISOString(),
        error: true,
        errorMsg: err.message
      });
    }
  }
  
  return results;
}