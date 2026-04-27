import { CoinInfo, PriceData } from '../types';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

export async function fetchTopCoins(): Promise<CoinInfo[]> {
  try {
    const res = await fetch(`${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false`);
    if (!res.ok) throw new Error('Fetch failed');
    return await res.json();
  } catch (error) {
    console.error('Error fetching coins:', error);
    return [];
  }
}

export async function fetchHistoricalData(coinId: string, days: number = 30): Promise<PriceData[]> {
  try {
    const res = await fetch(`${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`);
    if (!res.ok) throw new Error('Fetch failed');
    const data = await res.json();
    
    // CoinGecko returns [timestamp, price]
    return data.prices.map((p: [number, number], i: number) => {
      const close = p[1];
      // Generate some dummy OHLC for richer charts since CoinGecko free API is limited on OHLC
      return {
        timestamp: p[0],
        close: close,
        open: i > 0 ? data.prices[i-1][1] : close,
        high: close * (1 + Math.random() * 0.02),
        low: close * (1 - Math.random() * 0.02),
        volume: data.total_volumes[i][1]
      };
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    return [];
  }
}
