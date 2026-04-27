export interface PriceData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  sma20: number;
  sma50: number;
  rsi: number;
  macd: {
    value: number;
    signal: number;
    histogram: number;
  };
}

export interface MarketForecast {
  trend: 'bullish' | 'bearish' | 'neutral';
  prediction: string;
  confidence: number;
  supportLevels: (number | string)[];
  resistanceLevels: (number | string)[];
  buySellSignal: 'buy' | 'sell' | 'hold';
  riskLevel: 'low' | 'medium' | 'high';
  reasoning: string;
}

export interface ChartAnalysis {
  dailyTrend: 'up' | 'down' | 'neutral';
  confidence: number;
  explanation: string;
  supportLevels: string[];
  resistanceLevels: string[];
  patternsDetected: string[];
  volatility: 'low' | 'medium' | 'high';
}

export interface CoinInfo {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}
