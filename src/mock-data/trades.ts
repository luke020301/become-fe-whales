export interface Trade {
  id: string;
  ticker: string;
  name: string;
  logo: string;
  chainLogo: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  total: number;
  time: string;
  wallet: string;
}

export const recentTrades: Trade[] = [
  {
    id: '1',
    ticker: 'HYPE',
    name: 'Hyperliquid',
    logo: 'https://assets.coingecko.com/coins/images/36368/small/hype.png',
    chainLogo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
    type: 'buy',
    price: 12.47,
    amount: 200,
    total: 2494.0,
    time: '2 min ago',
    wallet: '0x1a2b...3c4d',
  },
  {
    id: '2',
    ticker: 'MONAD',
    name: 'Monad',
    logo: 'https://assets.coingecko.com/coins/images/36881/small/monad.jpg',
    chainLogo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
    type: 'sell',
    price: 0.85,
    amount: 5000,
    total: 4250.0,
    time: '5 min ago',
    wallet: '0x5e6f...7a8b',
  },
  {
    id: '3',
    ticker: 'INIT',
    name: 'Initia',
    logo: 'https://assets.coingecko.com/coins/images/37930/small/initia.jpg',
    chainLogo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
    type: 'buy',
    price: 1.24,
    amount: 1200,
    total: 1488.0,
    time: '8 min ago',
    wallet: '0x9c0d...1e2f',
  },
  {
    id: '4',
    ticker: 'SKATE',
    name: 'SKATEON',
    logo: 'https://assets.coingecko.com/coins/images/36366/small/skate.png',
    chainLogo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
    type: 'sell',
    price: 0.31,
    amount: 10000,
    total: 3100.0,
    time: '12 min ago',
    wallet: '0x3a4b...5c6d',
  },
  {
    id: '5',
    ticker: 'IP',
    name: 'Story Protocol',
    logo: 'https://assets.coingecko.com/coins/images/39481/small/story.jpg',
    chainLogo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
    type: 'buy',
    price: 0.092,
    amount: 50000,
    total: 4600.0,
    time: '18 min ago',
    wallet: '0x7e8f...9a0b',
  },
  {
    id: '6',
    ticker: 'ABS',
    name: 'Abstract',
    logo: 'https://assets.coingecko.com/coins/images/39512/small/abstract.png',
    chainLogo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
    type: 'buy',
    price: 0.044,
    amount: 25000,
    total: 1100.0,
    time: '25 min ago',
    wallet: '0x1c2d...3e4f',
  },
];
