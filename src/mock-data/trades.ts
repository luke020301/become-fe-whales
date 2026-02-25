const USDC = '/images/logo-usdc.png';
const USDT = '/images/logo-usdt.png';
const SOL  = '/images/logo-sol.png';

export interface Trade {
  id: string;
  pair: string;
  pairLogo: string;
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  collateral: number;
  collateralLogo: string;
  time: string;
  txId: string;
  badge?: { initials: string; color: string };
}

export const recentTrades: Trade[] = [
  {
    id: '1',
    pair: 'SKATE/USDC',
    pairLogo: '/images/logo-skate.png',
    side: 'sell',
    price: 0.055,
    amount: 3640,
    collateral: 200.0,
    collateralLogo: USDC,
    time: '1m ago',
    txId: '0x1a2b3c',
  },
  {
    id: '2',
    pair: 'SKATE/USDC',
    pairLogo: '/images/logo-skate.png',
    side: 'sell',
    price: 0.055,
    amount: 18180,
    collateral: 1000.0,
    collateralLogo: USDC,
    time: '1m ago',
    txId: '0x4d5e6f',
  },
  {
    id: '3',
    pair: 'IKA/USDT',
    pairLogo: '/images/logo-ika.png',
    side: 'buy',
    price: 0.119,
    amount: 4200,
    collateral: 500.0,
    collateralLogo: USDT,
    time: '1m ago',
    txId: '0x7a8b9c',
    badge: { initials: 'RS', color: '#EAB308' },
  },
  {
    id: '4',
    pair: 'PENGU/SOL',
    pairLogo: '/images/logo-pengu.png',
    side: 'buy',
    price: 0.005,
    amount: 85350,
    collateral: 3.0,
    collateralLogo: SOL,
    time: '1m ago',
    txId: '0xd0e1f2',
    badge: { initials: 'RS', color: '#EAB308' },
  },
  {
    id: '5',
    pair: 'GRASS/USDC',
    pairLogo: '/images/logo-grass.png',
    side: 'buy',
    price: 0.069,
    amount: 3620,
    collateral: 250.0,
    collateralLogo: USDC,
    time: '1m ago',
    txId: '0x3a4b5c',
  },
  {
    id: '6',
    pair: 'SKATE/USDC',
    pairLogo: '/images/logo-skate.png',
    side: 'buy',
    price: 0.005,
    amount: 100000,
    collateral: 500.0,
    collateralLogo: USDC,
    time: '1m ago',
    txId: '0x6d7e8f',
  },
  {
    id: '7',
    pair: 'SKATE/USDC',
    pairLogo: '/images/logo-skate.png',
    side: 'buy',
    price: 0.005,
    amount: 40000,
    collateral: 200.0,
    collateralLogo: USDC,
    time: '1m ago',
    txId: '0x9a0b1c',
  },
  {
    id: '8',
    pair: 'SKATE/USDC',
    pairLogo: '/images/logo-skate.png',
    side: 'buy',
    price: 0.005,
    amount: 100000,
    collateral: 500.0,
    collateralLogo: USDC,
    time: '1m ago',
    txId: '0x2d3e4f',
  },
  {
    id: '9',
    pair: 'SKATE/USDC',
    pairLogo: '/images/logo-skate.png',
    side: 'buy',
    price: 0.0613,
    amount: 3620,
    collateral: 0.08,
    collateralLogo: USDC,
    time: '1m ago',
    txId: '0x5a6b7c',
  },
  {
    id: '10',
    pair: 'SKATE/USDC',
    pairLogo: '/images/logo-skate.png',
    side: 'buy',
    price: 0.0055,
    amount: 1820,
    collateral: 100.0,
    collateralLogo: USDC,
    time: '1m ago',
    txId: '0x8d9e0f',
  },
];
