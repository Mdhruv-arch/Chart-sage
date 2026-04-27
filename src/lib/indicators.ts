import { PriceData } from '../types';

export function calculateSMA(data: number[], window: number): number[] {
  const sma: number[] = [];
  for (let i = 0; i <= data.length - window; i++) {
    const sum = data.slice(i, i + window).reduce((a, b) => a + b, 0);
    sma.push(sum / window);
  }
  // Pad with nulls at the start
  return [...new Array(window - 1).fill(NaN), ...sma];
}

export function calculateRSI(data: number[], window: number = 14): number[] {
  const rsi: number[] = [];
  let gains: number[] = [];
  let losses: number[] = [];

  for (let i = 1; i < data.length; i++) {
    const diff = data[i] - data[i - 1];
    gains.push(Math.max(0, diff));
    losses.push(Math.max(0, -diff));
  }

  let avgGain = gains.slice(0, window).reduce((a, b) => a + b, 0) / window;
  let avgLoss = losses.slice(0, window).reduce((a, b) => a + b, 0) / window;

  rsi.push(100 - 100 / (1 + avgGain / avgLoss));

  for (let i = window; i < gains.length; i++) {
    avgGain = (avgGain * (window - 1) + gains[i]) / window;
    avgLoss = (avgLoss * (window - 1) + losses[i]) / window;
    rsi.push(100 - 100 / (1 + avgGain / avgLoss));
  }

  // Pad with nulls
  return [...new Array(window).fill(NaN), ...rsi];
}

export function calculateMACD(data: number[]): { value: number[]; signal: number[]; histogram: number[] } {
  function ema(vals: number[], period: number) {
    const k = 2 / (period + 1);
    const result = [vals[0]];
    for (let i = 1; i < vals.length; i++) {
      result.push(vals[i] * k + result[i - 1] * (1 - k));
    }
    return result;
  }

  const ema12 = ema(data, 12);
  const ema26 = ema(data, 26);
  const macdLine = ema12.map((v, i) => v - ema26[i]);
  const signalLine = ema(macdLine, 9);
  const histogram = macdLine.map((v, i) => v - signalLine[i]);

  return { value: macdLine, signal: signalLine, histogram };
}
