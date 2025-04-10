const API_KEY = "vu)tC2(JL(yzKW5)OH4JMdjn@(S(J*pku*j";
const BASE = 'https://api.abyiss.com/v2/cex';

/** Fetch all exchanges */
export async function fetchExchanges() {
  try {
    const res = await fetch(`${BASE}/exchanges?apiKey=${API_KEY}`);
    if (!res.ok) throw new Error('Failed to fetch exchanges');
    return await res.json(); // [{ name, id }, …]
  } catch (error) {
    console.error('Error fetching exchanges:', error);
    return []; // Return empty array on error
  }
}

/** Fetch all markets (pairs) for an exchange */
export async function fetchMarkets(exchangeId) {
  try {
    const res = await fetch(
      `${BASE}/${exchangeId}/markets?apiKey=${API_KEY}`
    );
    if (!res.ok) throw new Error(`Failed to fetch markets for ${exchangeId}`);
    return await res.json(); // ["BTC/USD","ETH/USD",…]
  } catch (error) {
    console.error(`Error fetching markets for ${exchangeId}:`, error);
    return []; // Return empty array on error
  }
}

/** Fetch current price for a given pair */
export async function fetchCurrentPrice(exchangeId, market) {
  try {
    const formattedMarket = market.replace('/', '-');
    const res = await fetch(
      `${BASE}/${exchangeId}/${formattedMarket}/currentprice?apiKey=${API_KEY}`
    );
    if (!res.ok) throw new Error(`Failed to fetch price for ${exchangeId}/${market}`);
    return await res.json();
    /* {
         exchange,  // e.g. "AscendEX"
         market,    // e.g. "BTC/USD"
         timestamp,
         price
       }
    */
  } catch (error) {
    console.error(`Error fetching price for ${exchangeId}/${market}:`, error);
    return { exchange: exchangeId, market, timestamp: Date.now(), price: 0 };
  }
}

/** Fetch recent trades for a given pair */
export async function fetchTrades(exchangeId, market) {
  try {
    const formattedMarket = market.replace('/', '-');
    const res = await fetch(
      `${BASE}/${exchangeId}/${formattedMarket}/trades?apiKey=${API_KEY}`
    );
    if (!res.ok) throw new Error(`Failed to fetch trades for ${exchangeId}/${market}`);
    return await res.json();
    /* {
         exchange, market,
         trades: [{ timestamp, price, size, cost, side }, …]
       }
    */
  } catch (error) {
    console.error(`Error fetching trades for ${exchangeId}/${market}:`, error);
    return { exchange: exchangeId, market, trades: [] };
  }
}