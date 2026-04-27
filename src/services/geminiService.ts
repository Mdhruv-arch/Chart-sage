import { GoogleGenAI, Type } from "@google/genai";
import { ChartAnalysis, MarketForecast, PriceData, TechnicalIndicators } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeChartImage(base64Image: string, mimeType: string): Promise<ChartAnalysis> {
  const imagePart = {
    inlineData: {
      mimeType,
      data: base64Image,
    },
  };

  const textPart = {
    text: `You are an expert financial chart analyst. Analyze the provided stock/trend chart image and extract key visual patterns (peaks, trends, volatility). 
    
    Provide a prediction for the next daily trend movement. 
    Output the data strictly in the following JSON format:
    {
      "dailyTrend": "up" | "down" | "neutral",
      "confidence": number (0-100),
      "explanation": "Brief rationale for the prediction for a non-expert trader",
      "supportLevels": ["level 1", "level 2"],
      "resistanceLevels": ["level 1", "level 2"],
      "patternsDetected": ["pattern 1", "pattern 2"],
      "volatility": "low" | "medium" | "high"
    }`,
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [imagePart, textPart] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        required: ["dailyTrend", "confidence", "explanation", "supportLevels", "resistanceLevels", "patternsDetected", "volatility"],
        properties: {
          dailyTrend: { type: Type.STRING, enum: ["up", "down", "neutral"] },
          confidence: { type: Type.NUMBER },
          explanation: { type: Type.STRING },
          supportLevels: { type: Type.ARRAY, items: { type: Type.STRING } },
          resistanceLevels: { type: Type.ARRAY, items: { type: Type.STRING } },
          patternsDetected: { type: Type.ARRAY, items: { type: Type.STRING } },
          volatility: { type: Type.STRING, enum: ["low", "medium", "high"] }
        }
      }
    }
  });

  return JSON.parse(response.text || '{}') as ChartAnalysis;
}

export async function getMarketForecast(
  coinName: string,
  history: PriceData[],
  indicators: TechnicalIndicators
): Promise<MarketForecast> {
  const prompt = `Analyze the historical trading data and technical indicators for ${coinName}.
  
  Recent Price Action (last 7 days):
  ${history.slice(-7).map(d => `${new Date(d.timestamp).toDateString()}: ${d.close}`).join('\n')}
  
  Current Technical Indicators:
  - SMA 20: ${indicators.sma20}
  - SMA 50: ${indicators.sma50}
  - RSI: ${indicators.rsi.toFixed(2)}
  - MACD: ${indicators.macd.value.toFixed(4)} (Signal: ${indicators.macd.signal.toFixed(4)})

  Based on this, provide a daily forecast with predicted price movements, confidence scores, support/resistance levels, and buy/sell signals.
  Explain your reasoning clearly for a non-expert trader.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        required: ["trend", "prediction", "confidence", "supportLevels", "resistanceLevels", "buySellSignal", "riskLevel", "reasoning"],
        properties: {
          trend: { type: Type.STRING, enum: ["bullish", "bearish", "neutral"] },
          prediction: { type: Type.STRING, description: "Short predicted movement description" },
          confidence: { type: Type.NUMBER, description: "0-100 score" },
          supportLevels: { type: Type.ARRAY, items: { type: Type.NUMBER } },
          resistanceLevels: { type: Type.ARRAY, items: { type: Type.NUMBER } },
          buySellSignal: { type: Type.STRING, enum: ["buy", "sell", "hold"] },
          riskLevel: { type: Type.STRING, enum: ["low", "medium", "high"] },
          reasoning: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text || '{}') as MarketForecast;
}
