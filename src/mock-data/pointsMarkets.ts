export interface PointsMarketCard {
  id: string;
  ticker: string;
  name: string;
  logo: string;
  chainLogo: string;
  price: number;
  priceChange24h?: number; // undefined = no badge shown
  vol24h: number;
  totalVol: number;
}

export interface ComingSoonCard {
  id: string;
  type: 'coming-soon';
  text: string;
}

export type MarketCardItem = PointsMarketCard | ComingSoonCard;

export const preMarketCards: PointsMarketCard[] = [
  {
    id: 'skate',
    ticker: 'SKATE',
    name: 'SKATEON',
    logo: '/images/logo-skate.png',
    chainLogo: '/images/chain-solana.png',
    price: 0.055,
    priceChange24h: 162.18,
    vol24h: 7375.62,
    totalVol: 25197.18,
  },
  {
    id: 'stake',
    ticker: 'STAKE',
    name: 'Skate Chain',
    logo: '/images/logo-skate.png',
    chainLogo: '/images/chain-solana.png',
    price: 0.119,
    priceChange24h: 63.82,
    vol24h: 445.86,
    totalVol: 21904.26,
  },
  {
    id: 'era',
    ticker: 'ERA',
    name: 'Caldera',
    logo: 'https://assets.coingecko.com/coins/images/34416/small/caldera.png',
    chainLogo: '/images/chain-solana.png',
    price: 0.0464,
    priceChange24h: 98.31,
    vol24h: 418326.12,
    totalVol: 7483875.48,
  },
  {
    id: 'grass',
    ticker: 'GRASS',
    name: 'Grass',
    logo: 'https://assets.coingecko.com/coins/images/35315/small/grass.png',
    chainLogo: '/images/chain-solana.png',
    price: 0.69,
    priceChange24h: 22.69,
    vol24h: 23168.39,
    totalVol: 4822752.19,
  },
  {
    id: 'block',
    ticker: 'BLOCK',
    name: 'BlockGames',
    logo: 'https://assets.coingecko.com/coins/images/35578/small/block.png',
    chainLogo: '/images/chain-solana.png',
    price: 0.9638,
    priceChange24h: 22.60,
    vol24h: 18312.61,
    totalVol: 628875.43,
  },
];

export const pointsMarketCards: MarketCardItem[] = [
  {
    id: 'drift',
    ticker: 'DRIFT',
    name: 'Drift Protocol',
    logo: 'https://assets.coingecko.com/coins/images/35475/small/drift.png',
    chainLogo: '/images/chain-solana.png',
    price: 0.0185,
    priceChange24h: 22.83,
    vol24h: 12450.00,
    totalVol: 98320.50,
  },
  {
    id: 'pyth',
    ticker: 'PYTH',
    name: 'Pyth Network',
    logo: 'https://assets.coingecko.com/coins/images/31924/small/pyth.png',
    chainLogo: '/images/chain-solana.png',
    price: 10.36,
    priceChange24h: 2.61,
    vol24h: 284100.00,
    totalVol: 1923400.00,
  },
  {
    id: 'jup',
    ticker: 'JUP',
    name: 'Jupiter',
    logo: 'https://assets.coingecko.com/coins/images/34188/small/jup.png',
    chainLogo: '/images/chain-solana.png',
    price: 9.48,
    vol24h: 175200.00,
    totalVol: 892100.00,
  },
  {
    id: 'bonk',
    ticker: 'BONK',
    name: 'Bonk',
    logo: 'https://assets.coingecko.com/coins/images/28600/small/bonk.jpg',
    chainLogo: '/images/chain-solana.png',
    price: 0.000966,
    vol24h: 543000.00,
    totalVol: 3210000.00,
  },
  {
    id: 'coming-soon',
    type: 'coming-soon',
    text: 'More point-based tokens \ncoming soon!',
  },
];
