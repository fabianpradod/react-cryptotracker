// src/services/cryptoService.js
const API_KEY = import.meta.env.VITE_ABYISS_API_KEY;
const BASE = 'https://api.abyiss.com/v2/cex';

/** Fetch all exchanges */
export async function fetchExchanges() {
  const res = await fetch(`${BASE}/exchanges?apiKey=${API_KEY}`);
  return res.json(); // [{ name, id }, …]
}

/** Fetch all markets (pairs) for an exchange */
export async function fetchMarkets(exchangeId) {
  const res = await fetch(
    `${BASE}/${exchangeId}/markets?apiKey=${API_KEY}`
  );
  return res.json(); // ["BTC/USD","ETH/USD",…]
}

/** Fetch current price for a given pair */
export async function fetchCurrentPrice(exchangeId, market) {
  const res = await fetch(
    `${BASE}/${exchangeId}/${market.replace('/','-')}/currentprice?apiKey=${API_KEY}`
  );
  return res.json(); 
  /* {
       exchange,  // e.g. "AscendEX"
       market,    // e.g. "BTC/USD"
       timestamp,
       price
     }
  */
}

/** Fetch recent trades for a given pair */
export async function fetchTrades(exchangeId, market) {
  const res = await fetch(
    `${BASE}/${exchangeId}/${market.replace('/','-')}/trades?apiKey=${API_KEY}`
  );
  return res.json(); 
  /* {
       exchange, market,
       trades: [{ timestamp, price, size, cost, side }, …]
     }
  */
}
