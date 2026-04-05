import { useState, useEffect } from 'react';
import { OHLCData } from '@/lib/data';

export interface MarketData {
  id: string;
  title: string;
  image: string;
  probYes: number;
  probNo: number;
  volume: number;
  liquidity: number;
  participants: number;
  chartData: OHLCData[];
  endsAt: string;
  isLive: boolean;
  commentsCount: number;
  creator: {
    name: string;
    avatar: string;
  };
  change24h: number;
  aiSentiment: 'Bullish' | 'Bearish' | 'Neutral';
  volumeLevel: 'Low' | 'Medium' | 'High';
}

const pseudoRandom = (seed: number) => {
  let state = seed * 74283 + 12345;
  state = (state ^ (state >> 13)) * 12345;
  return ((state & 0x7fffffff) / 0x7fffffff);
};

const generateOHLCData = (start: number, volatility: number, trend: number): OHLCData[] => {
  let current = start;
  return Array.from({ length: 24 }).map((_, i) => {
    const open = current;
    const rand1 = pseudoRandom(start + i);
    const rand2 = pseudoRandom(start + i + 100);
    const rand3 = pseudoRandom(start + i + 200);
    const rand4 = pseudoRandom(start + i + 300);
    
    const close = current + (rand1 - 0.5) * volatility + trend;
    const high = Math.max(open, close) + rand2 * (volatility / 2);
    const low = Math.min(open, close) - rand3 * (volatility / 2);
    const volume = Math.floor(rand4 * 10000) + 1000;
    current = close;
    return { 
      time: `${i}h`, 
      open: Math.max(1, Math.min(99, open)),
      high: Math.max(1, Math.min(99, high)),
      low: Math.max(1, Math.min(99, low)),
      close: Math.max(1, Math.min(99, close)),
      volume
    };
  });
};

const MOCK_MARKETS: MarketData[] = [
  {
    id: '1',
    title: 'Will Bitcoin reach $100k before 2025?',
    image: 'https://picsum.photos/seed/btc/600/300',
    probYes: 68,
    probNo: 32,
    volume: 12400000,
    liquidity: 450000,
    participants: 1240,
    chartData: generateOHLCData(40, 5, 1.5),
    endsAt: '2024-12-31T23:59:59Z',
    isLive: true,
    commentsCount: 128,
    creator: {
      name: 'Jordan Lee',
      avatar: 'https://picsum.photos/seed/jordan/100/100',
    },
    change24h: 4.5,
    aiSentiment: 'Bullish',
    volumeLevel: 'High'
  },
  {
    id: '2',
    title: 'Fed cuts interest rates by 50bps in May',
    image: 'https://picsum.photos/seed/fed/600/300',
    probYes: 42,
    probNo: 58,
    volume: 8900000,
    liquidity: 210000,
    participants: 856,
    chartData: generateOHLCData(60, 8, -1),
    endsAt: '2024-05-01T14:00:00Z',
    isLive: true,
    commentsCount: 45,
    creator: {
      name: 'MacroSniper',
      avatar: 'https://picsum.photos/seed/macro/100/100',
    },
    change24h: -2.1,
    aiSentiment: 'Bearish',
    volumeLevel: 'Medium'
  },
  {
    id: '3',
    title: 'OpenAI releases GPT-5 before July',
    image: 'https://picsum.photos/seed/ai/600/300',
    probYes: 82,
    probNo: 18,
    volume: 18200000,
    liquidity: 890000,
    participants: 3420,
    chartData: generateOHLCData(50, 6, 1.8),
    endsAt: '2024-06-30T23:59:59Z',
    isLive: false,
    commentsCount: 342,
    creator: {
      name: 'AI_Insider',
      avatar: 'https://picsum.photos/seed/ai_insider/100/100',
    },
    change24h: 1.2,
    aiSentiment: 'Bullish',
    volumeLevel: 'High'
  }
];

export function useMarkets() {
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simulate API call
    const fetchMarkets = async () => {
      try {
        setLoading(true);
        // Fake delay
        await new Promise(resolve => setTimeout(resolve, 600));
        setMarkets(MOCK_MARKETS);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch markets'));
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, []);

  return { markets, loading, error };
}
