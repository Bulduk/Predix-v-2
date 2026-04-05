export type Category = 'CRYPTO' | 'SPORTS' | 'MACRO' | 'POLITICS' | 'TECH';

export interface OHLCData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PredictionMarket {
  id: string;
  category: Category;
  question: string;
  yesProb: number;
  noProb: number;
  aiPrediction: string;
  aiConfidence: number; // 0-100
  crowdSentiment: string;
  whaleActivity?: string;
  momentum?: string;
  timeLeft: string;
  isLive: boolean;
  image?: string;
  chartData: OHLCData[];
  volume: string;
  creator?: {
    name: string;
    avatar: string;
    isFollowing?: boolean;
  };
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

export const MOCK_MARKETS: PredictionMarket[] = [
  {
    id: 'm1',
    category: 'CRYPTO',
    question: 'Bitcoin will break $100k before EOY',
    yesProb: 68,
    noProb: 32,
    aiPrediction: '72% YES',
    aiConfidence: 85,
    crowdSentiment: 'Bullish',
    whaleActivity: 'High Accumulation',
    momentum: 'Strong Uptrend',
    timeLeft: '45d 12h',
    isLive: true,
    chartData: generateOHLCData(50, 10, 1),
    volume: '$12.4M',
    creator: {
      name: 'Satoshi_N',
      avatar: 'https://i.pravatar.cc/150?u=satoshi',
      isFollowing: false,
    }
  },
  {
    id: 'm2',
    category: 'SPORTS',
    question: 'Lakers to win the NBA Championship 2026',
    yesProb: 15,
    noProb: 85,
    aiPrediction: '12% YES',
    aiConfidence: 60,
    crowdSentiment: 'Skeptical',
    momentum: 'Fading',
    timeLeft: '3mo 4d',
    isLive: false,
    chartData: generateOHLCData(20, 5, -0.5),
    volume: '$2.1M',
    creator: {
      name: 'HoopsAnalyst',
      avatar: 'https://i.pravatar.cc/150?u=hoops',
      isFollowing: true,
    }
  },
  {
    id: 'm3',
    category: 'MACRO',
    question: 'Fed cuts interest rates by 50bps in May',
    yesProb: 42,
    noProb: 58,
    aiPrediction: '45% YES',
    aiConfidence: 75,
    crowdSentiment: 'Divided',
    whaleActivity: 'Smart Money Selling',
    momentum: 'Volatile',
    timeLeft: '12d 8h',
    isLive: true,
    chartData: generateOHLCData(30, 15, 0.8),
    volume: '$45.8M',
    creator: {
      name: 'MacroSniper',
      avatar: 'https://i.pravatar.cc/150?u=macro',
      isFollowing: false,
    }
  },
  {
    id: 'm4',
    category: 'TECH',
    question: 'OpenAI releases GPT-5 before July',
    yesProb: 82,
    noProb: 18,
    aiPrediction: '85% YES',
    aiConfidence: 92,
    crowdSentiment: 'Very Bullish',
    whaleActivity: 'Heavy Buying',
    momentum: 'Surging',
    timeLeft: '2mo 15d',
    isLive: true,
    chartData: generateOHLCData(60, 8, 1.5),
    volume: '$18.2M',
    creator: {
      name: 'AI_Insider',
      avatar: 'https://i.pravatar.cc/150?u=ai',
      isFollowing: false,
    }
  },
  {
    id: 'm5',
    category: 'POLITICS',
    question: 'Incumbent wins the next general election',
    yesProb: 52,
    noProb: 48,
    aiPrediction: '50% YES',
    aiConfidence: 40,
    crowdSentiment: 'Neutral',
    timeLeft: '6mo 12d',
    isLive: false,
    chartData: generateOHLCData(50, 8, 0.2),
    volume: '$8.9M',
    creator: {
      name: 'PolitiStat',
      avatar: 'https://i.pravatar.cc/150?u=politi',
      isFollowing: true,
    }
  }
];

