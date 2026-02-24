export type MarketStatus = 'in-progress' | 'settling' | 'upcoming-settle';

export interface Market {
  id: string;
  ticker: string;
  name: string;
  logo: string;
  chainLogo: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  volumeChange24h: number;
  openInterest: number;
  openInterestChange24h: number;
  settlementDate: string | null;
  settlementTime: string | null;
  listingDate: string | null;
  listingTime: string | null;
  status: MarketStatus;
}

export const markets: Market[] = [
  {
    id: 'skate',
    ticker: 'SKATE',
    name: 'SKATEON',
    logo: '/images/logo-skate.png',
    chainLogo: '/images/chain-solana.png',
    price: 0.31,
    priceChange24h: 9.15,
    volume24h: 5624.18,
    volumeChange24h: -16.18,
    openInterest: 89240.19,
    openInterestChange24h: 6.38,
    settlementDate: null,
    settlementTime: null,
    listingDate: null,
    listingTime: null,
    status: 'in-progress',
  },
  {
    id: 'monad',
    ticker: 'MONAD',
    name: 'Monad',
    logo: 'https://assets.coingecko.com/coins/images/36881/small/monad.jpg',
    chainLogo: '/images/chain-solana.png',
    price: 0.85,
    priceChange24h: 3.24,
    volume24h: 12480.5,
    volumeChange24h: 8.72,
    openInterest: 145320.44,
    openInterestChange24h: -2.11,
    settlementDate: null,
    settlementTime: null,
    listingDate: null,
    listingTime: null,
    status: 'in-progress',
  },
  {
    id: 'hyperliquid',
    ticker: 'HYPE',
    name: 'Hyperliquid',
    logo: 'https://assets.coingecko.com/coins/images/36368/small/hype.png',
    chainLogo: '/images/chain-solana.png',
    price: 12.47,
    priceChange24h: -4.89,
    volume24h: 98432.0,
    volumeChange24h: 22.5,
    openInterest: 623840.0,
    openInterestChange24h: 11.44,
    settlementDate: null,
    settlementTime: null,
    listingDate: null,
    listingTime: null,
    status: 'in-progress',
  },
  {
    id: 'story',
    ticker: 'IP',
    name: 'Story Protocol',
    logo: 'https://assets.coingecko.com/coins/images/39481/small/story.jpg',
    chainLogo: '/images/chain-solana.png',
    price: 0.092,
    priceChange24h: -1.33,
    volume24h: 3241.9,
    volumeChange24h: -5.0,
    openInterest: 41200.0,
    openInterestChange24h: -3.8,
    settlementDate: '28/01/2026',
    settlementTime: '01:00 PM',
    listingDate: '30/01/2026',
    listingTime: '01:00 PM',
    status: 'upcoming-settle',
  },
  {
    id: 'abstract',
    ticker: 'ABS',
    name: 'Abstract',
    logo: 'https://assets.coingecko.com/coins/images/39512/small/abstract.png',
    chainLogo: '/images/chain-solana.png',
    price: 0.044,
    priceChange24h: 0.0,
    volume24h: 1820.33,
    volumeChange24h: 0.0,
    openInterest: 28000.0,
    openInterestChange24h: 0.0,
    settlementDate: '25/01/2026',
    settlementTime: '01:00 PM',
    listingDate: '27/01/2026',
    listingTime: '01:00 PM',
    status: 'settling',
  },
  {
    id: 'initia',
    ticker: 'INIT',
    name: 'Initia',
    logo: 'https://assets.coingecko.com/coins/images/37930/small/initia.jpg',
    chainLogo: '/images/chain-solana.png',
    price: 1.24,
    priceChange24h: 14.2,
    volume24h: 23491.6,
    volumeChange24h: 31.5,
    openInterest: 187600.0,
    openInterestChange24h: 18.9,
    settlementDate: null,
    settlementTime: null,
    listingDate: null,
    listingTime: null,
    status: 'in-progress',
  },
];

export const bannerMarkets = [
  {
    ticker: 'SKATE',
    title: 'SKATE Live in \nPre-market',
    description: 'Connecting all VMs - Interact with applications from any VM while staying on your favorite chain.',
    bgGradient: 'linear-gradient(270deg, rgba(23,37,4,0) 0%, rgba(23,37,4,1) 80%)',
    bgImage: '/images/banner-bg-skate.png',
    logo: '/images/logo-skate-banner.png',
    chainLogo: '/images/chain-banner.png',
    // Composite icon from Figma (token logo + chain badge, 50×50)
    iconSlot: '/images/icon-skate-full.png',
  },
  {
    ticker: 'MONAD',
    title: 'MONAD Live in \nPre-market',
    description: 'High-performance EVM-compatible L1 blockchain with parallel execution.',
    bgGradient: 'linear-gradient(270deg, rgba(4,13,37,0) 0%, rgba(4,13,37,1) 80%)',
    bgImage: 'https://images.unsplash.com/photo-1614854262318-831574f15f1f?w=928&h=398&fit=crop',
    logo: 'https://assets.coingecko.com/coins/images/36881/small/monad.jpg',
    chainLogo: '/images/chain-banner.png',
  },
];
