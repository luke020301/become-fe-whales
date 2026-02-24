import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { markets } from '../mock-data/markets';

/* ─── helpers ─── */
const fmt = (n: number, dec = 2) =>
  n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });

/* ─── mock order book data ─── */
const SELL_ORDERS = [
  { id: 's1', price: 0.0058, amount: 12000,  collateral: 69.6  },
  { id: 's2', price: 0.0055, amount: 8500,   collateral: 46.75 },
  { id: 's3', price: 0.0053, amount: 5200,   collateral: 27.56 },
  { id: 's4', price: 0.0051, amount: 3600,   collateral: 18.36 },
  { id: 's5', price: 0.0050, amount: 9800,   collateral: 49.0  },
];
const BUY_ORDERS = [
  { id: 'b1', price: 0.0048, amount: 7500,   collateral: 36.0  },
  { id: 'b2', price: 0.0046, amount: 11200,  collateral: 51.52 },
  { id: 'b3', price: 0.0044, amount: 6300,   collateral: 27.72 },
  { id: 'b4', price: 0.0042, amount: 4800,   collateral: 20.16 },
  { id: 'b5', price: 0.0040, amount: 15600,  collateral: 62.4  },
];

const MY_FILLED_ORDERS = [
  { id: '1', side: 'buy',  price: 0.0045, amount: 10000, collateral: 0.5,  collateralSymbol: 'ETH',  time: '2h ago'  },
  { id: '2', side: 'buy',  price: 0.0040, amount: 25000, collateral: 1.0,  collateralSymbol: 'ETH',  time: '1d ago'  },
  { id: '3', side: 'sell', price: 0.0060, amount: 5000,  collateral: 0.3,  collateralSymbol: 'ETH',  time: '2d ago'  },
];
const MY_OPEN_ORDERS = [
  { id: '4', side: 'buy',  price: 0.0035, amount: 20000, collateral: 0.7,  collateralSymbol: 'ETH',  time: '5m ago'  },
  { id: '5', side: 'sell', price: 0.0070, amount: 8000,  collateral: 0.56, collateralSymbol: 'ETH',  time: '30m ago' },
  { id: '6', side: 'buy',  price: 0.0030, amount: 50000, collateral: 1.5,  collateralSymbol: 'ETH',  time: '1h ago'  },
];

/* ─── price chart (SVG line) ─── */
function PriceChart({ ticker }: { ticker: string }) {
  const raw = [
    0.0020, 0.0025, 0.0022, 0.0030, 0.0028, 0.0035, 0.0032, 0.0038, 0.0036,
    0.0040, 0.0038, 0.0042, 0.0039, 0.0045, 0.0043, 0.0048, 0.0046, 0.0050,
    0.0048, 0.0045,
  ];
  const W = 400; const H = 100;
  const min = Math.min(...raw) * 0.97;
  const max = Math.max(...raw) * 1.03;
  const toX = (i: number) => (i / (raw.length - 1)) * W;
  const toY = (v: number) => H - ((v - min) / (max - min)) * H;
  const linePath = raw.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${W},${H} L0,${H} Z`;

  // axis labels
  const ticks = [max, (max + min) / 2, min].map(v => ({ v, y: toY(v) }));
  const dates = ['15/03', '16/03', '17/03', '18/03', '19/03', '20/03', '21/03'];

  return (
    <div style={{ position: 'relative', userSelect: 'none' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height: 100, display: 'block' }}
      >
        <defs>
          <linearGradient id={`ag-${ticker}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16C284" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#16C284" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#ag-${ticker})`} />
        <path d={linePath}  fill="none" stroke="#16C284" strokeWidth="1.5" />
        {/* last-price dot */}
        <circle cx={toX(raw.length - 1).toFixed(1)} cy={toY(raw[raw.length - 1]).toFixed(1)} r="3" fill="#16C284" />
      </svg>
      {/* axis ticks */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        {dates.map(d => (
          <span key={d} style={{ fontSize: 10, color: '#7A7A83' }}>{d}</span>
        ))}
      </div>
      {/* y-axis ticks (right) */}
      <div style={{ position: 'absolute', right: 0, top: 0, height: 100, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
        {ticks.map(t => (
          <span key={t.y} style={{ fontSize: 10, color: '#7A7A83', lineHeight: '1' }}>
            {t.v.toFixed(4)}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── StatItem ─── */
function StatItem({ label, value, change }: { label: string; value: string; change?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 12, color: '#7A7A83', whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: '#F9F9FA' }}>{value}</span>
      {change !== undefined && (
        <span style={{ fontSize: 12, color: change >= 0 ? '#5BD197' : '#FD5E67' }}>
          {change >= 0 ? '+' : ''}{change.toFixed(2)}%
        </span>
      )}
    </div>
  );
}

/* ─── icons ─── */
const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 10l5 5 5-5H7z" />
  </svg>
);
const ExternalLink = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 6v2H5v11h11v-5h2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6zm11-3v8h-2V6.413l-7.793 7.794-1.414-1.414L17.585 5H13V3h8z" />
  </svg>
);
const SettingsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7zm7.43-1.5c.04-.32.07-.64.07-.96s-.03-.66-.07-1l2.2-1.72a.5.5 0 0 0 .12-.65l-2.07-3.58a.5.5 0 0 0-.63-.22l-2.59 1.04a7.5 7.5 0 0 0-1.7-.98l-.38-2.76A.488.488 0 0 0 15.91 6h-4.14c-.24 0-.43.17-.47.42l-.38 2.76a7.494 7.494 0 0 0-1.7.98L6.63 9.12a.5.5 0 0 0-.63.22L3.93 12.92a.489.489 0 0 0 .12.65l2.2 1.72c-.04.34-.07.67-.07 1s.03.66.07 1l-2.2 1.72a.5.5 0 0 0-.12.65l2.07 3.58c.13.22.38.3.63.22l2.59-1.04c.52.38 1.08.7 1.7.98l.38 2.76c.04.24.24.42.47.42h4.14c.24 0 .43-.17.47-.42l.38-2.76a7.494 7.494 0 0 0 1.7-.98l2.59 1.04c.24.1.5 0 .63-.22l2.07-3.58a.5.5 0 0 0-.12-.65l-2.2-1.72z" />
  </svg>
);
const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 5v5.25l4.5 2.67-.75 1.23L11 13V7h1.5z" />
  </svg>
);
const StarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.259 5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 11H13V5h-2v6H5v2h6v6h2v-6h6v-2z" />
  </svg>
);
const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9.29 6.71a1 1 0 0 0 0 1.41L13.17 12l-3.88 3.88a1 1 0 1 0 1.41 1.41l4.59-4.59a1 1 0 0 0 0-1.41L10.7 6.7a1 1 0 0 0-1.41.01z" />
  </svg>
);
const EmptyMascot = () => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
    <circle cx="28" cy="28" r="24" fill="#252527" />
    <path d="M16 32c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="#7A7A83" strokeWidth="2" strokeLinecap="round" />
    <circle cx="20" cy="26" r="2.5" fill="#7A7A83" />
    <circle cx="36" cy="26" r="2.5" fill="#7A7A83" />
  </svg>
);

/* ─── Order book row ─── */
interface OrderRow { id: string; price: number; amount: number; collateral: number }
function OrderRow({
  order, side, maxCol, isSelected, onSelect,
}: {
  order: OrderRow;
  side: 'buy' | 'sell';
  maxCol: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const pct = (order.collateral / maxCol) * 100;
  const color     = side === 'sell' ? '#FD5E67' : '#5BD197';
  const barColor  = side === 'sell' ? 'rgba(253,94,103,0.07)' : 'rgba(22,194,132,0.07)';
  const selBg     = side === 'sell' ? 'rgba(253,94,103,0.08)' : 'rgba(22,194,132,0.08)';

  return (
    <div
      onClick={onSelect}
      style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        padding: '5px 20px', cursor: 'pointer',
        position: 'relative', overflow: 'hidden',
        background: isSelected ? selBg : 'transparent',
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = barColor; }}
      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: `${pct}%`, background: barColor, pointerEvents: 'none' }} />
      <span style={{ fontSize: 12, color, fontWeight: 500, position: 'relative' }}>${order.price.toFixed(4)}</span>
      <span style={{ fontSize: 12, color: '#F9F9FA', textAlign: 'right', position: 'relative' }}>{order.amount.toLocaleString()}</span>
      <span style={{ fontSize: 12, color: '#F9F9FA', textAlign: 'right', position: 'relative' }}>{order.collateral.toFixed(2)}</span>
    </div>
  );
}

/* ═══════════════════════════════════════
   PAGE
   ═══════════════════════════════════════ */
export default function MarketDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const market     = markets.find(m => m.id === id);

  const [selectedOrder, setSelectedOrder]         = useState<OrderRow | null>(null);
  const [selectedSide, setSelectedSide]           = useState<'buy' | 'sell' | null>(null);
  const [activeTab, setActiveTab]                 = useState<'filled' | 'open'>('filled');
  const [timeRange, setTimeRange]                 = useState('1d');
  const [chartType, setChartType]                 = useState('Price');
  const [showTbaTooltip, setShowTbaTooltip]       = useState(false);
  const [collateral, setCollateral]               = useState('USDC');
  const [fillType, setFillType]                   = useState('All');
  const [orderType, setOrderType]                 = useState('All');

  /* not found */
  if (!market) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ color: '#7A7A83' }}>Market not found</p>
          <button onClick={() => navigate('/')} style={{ fontSize: 14, color: '#16C284', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const isTBA        = market.settlementDate === null;
  const maxSell      = Math.max(...SELL_ORDERS.map(o => o.collateral));
  const maxBuy       = Math.max(...BUY_ORDERS.map(o => o.collateral));
  const currentOrders = activeTab === 'filled' ? MY_FILLED_ORDERS : MY_OPEN_ORDERS;

  function selectOrder(order: OrderRow, side: 'buy' | 'sell') {
    if (selectedOrder?.id === order.id) { setSelectedOrder(null); setSelectedSide(null); }
    else { setSelectedOrder(order); setSelectedSide(side); }
  }

  /* ── gradient-border button helper ── */
  const gradBtn = (gradient: string) => ({
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
    backgroundImage: `linear-gradient(#1B1B1C,#1B1B1C), ${gradient}`,
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
    border: '1px solid transparent',
    fontSize: 13, fontWeight: 500,
  } as React.CSSProperties);

  const filterBtn = (label: string, value: string, cycle: () => void) => (
    <button
      onClick={cycle}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '4px 10px', borderRadius: 8, cursor: 'pointer',
        background: '#1B1B1C', border: '1px solid #252527',
        fontSize: 12, fontWeight: 500, color: '#F9F9FA', whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#44444B'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#252527'; }}
    >
      {label}: {value}
      <span style={{ color: '#7A7A83' }}><ChevronDown /></span>
    </button>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0B' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 32px 40px' }}>

        {/* ── Breadcrumb ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '16px 0 0', color: '#B4B4BA', fontSize: 12 }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B4B4BA', fontSize: 12, padding: 0 }}
            onMouseEnter={e => { e.currentTarget.style.color = '#F9F9FA'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#B4B4BA'; }}
          >
            Whales.Market
          </button>
          <span style={{ color: '#7A7A83', display: 'flex' }}><ChevronRight /></span>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B4B4BA', fontSize: 12, padding: 0 }}
            onMouseEnter={e => { e.currentTarget.style.color = '#F9F9FA'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#B4B4BA'; }}
          >
            Pre-market
          </button>
          <span style={{ color: '#7A7A83', display: 'flex' }}><ChevronRight /></span>
          <span style={{ color: '#F9F9FA', fontWeight: 500 }}>{market.ticker}</span>
        </div>

        {/* ══════════════════════════════════════
            MARKET HEADER
            ══════════════════════════════════════ */}
        <div style={{
          marginTop: 12, padding: '20px 24px',
          background: '#1B1B1C', borderRadius: 16, border: '1px solid #252527',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>

            {/* Token identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={market.logo} alt={market.ticker}
                  style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
                  onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${market.ticker}&background=252527&color=F9F9FA&size=48`; }}
                />
                <img
                  src={market.chainLogo} alt="chain"
                  style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: '50%', border: '2px solid #1B1B1C', objectFit: 'cover' }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#F9F9FA' }}>{market.ticker}</div>
                <div style={{ fontSize: 12, color: '#7A7A83', marginTop: 2 }}>{market.name}</div>
              </div>
            </div>

            {/* Price */}
            <div style={{ flexShrink: 0 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#F9F9FA' }}>
                ${fmt(market.price, market.price < 1 ? 4 : 2)}
              </div>
              <div style={{ fontSize: 12, marginTop: 2, color: market.priceChange24h >= 0 ? '#5BD197' : '#FD5E67' }}>
                {market.priceChange24h >= 0 ? '+' : ''}{market.priceChange24h.toFixed(2)}%
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 28, flex: 1, flexWrap: 'wrap' }}>
              <StatItem label="24h Vol." value={`$${fmt(market.volume24h)}`} change={market.volumeChange24h} />
              <StatItem label="Total Vol." value={`$${fmt(market.openInterest)}`} />

              {/* Countdown / TBA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 12, color: '#7A7A83' }}>Countdown</span>
                  <span style={{ color: '#7A7A83', display: 'flex' }}><ClockIcon /></span>
                </div>
                {isTBA ? (
                  <div style={{ position: 'relative', display: 'inline-flex' }}>
                    <span
                      onMouseEnter={() => setShowTbaTooltip(true)}
                      onMouseLeave={() => setShowTbaTooltip(false)}
                      style={{
                        display: 'inline-flex', alignItems: 'center',
                        padding: '2px 10px', borderRadius: 9999,
                        background: '#252527', color: '#7A7A83',
                        fontSize: 11, fontWeight: 600, cursor: 'default', userSelect: 'none',
                        letterSpacing: '0.04em',
                      }}
                    >
                      TBA
                    </span>
                    {showTbaTooltip && (
                      <div style={{
                        position: 'absolute', bottom: 'calc(100% + 10px)', left: 0,
                        zIndex: 200, background: '#252527', borderRadius: 8,
                        padding: '10px 14px', minWidth: 170,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                        pointerEvents: 'none',
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {[
                            { label: 'Start Date', val: 'TBA' },
                            { label: 'Time (UTC)', val: 'TBA' },
                          ].map(row => (
                            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'center' }}>
                              <span style={{ fontSize: 12, color: '#7A7A83' }}>{row.label}</span>
                              <span style={{ fontSize: 12, color: '#F9F9FA', fontWeight: 500 }}>{row.val}</span>
                            </div>
                          ))}
                        </div>
                        {/* tooltip arrow */}
                        <svg width="16" height="8" viewBox="0 0 16 8" fill="none"
                          style={{ position: 'absolute', bottom: -8, left: 12 }}>
                          <path d="M0 0 L8 8 L16 0 Z" fill="#252527" />
                        </svg>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 12, color: '#F9F9FA', fontWeight: 500 }}>{market.settlementDate}</span>
                    <span style={{ fontSize: 11, color: '#7A7A83' }}>{market.settlementTime} UTC</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
              {/* About */}
              <button
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
                  background: 'transparent', border: '1px solid #252527',
                  fontSize: 13, fontWeight: 500, color: '#F9F9FA',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#44444B'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#252527'; }}
              >
                About {market.ticker}
                <span style={{ color: '#7A7A83', display: 'flex' }}><ExternalLink /></span>
              </button>

              {/* Twitter/X icon button */}
              <button
                style={{
                  width: 32, height: 32, borderRadius: 8, cursor: 'pointer',
                  background: 'transparent', border: '1px solid #252527',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7A7A83',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#44444B'; e.currentTarget.style.color = '#F9F9FA'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#252527'; e.currentTarget.style.color = '#7A7A83'; }}
              >
                <XIcon />
              </button>

              {/* Airdrop Checker – purple→green gradient border */}
              <button
                style={{
                  ...gradBtn('linear-gradient(135deg,#9945FF,#19FB9B)'),
                  color: '#F9F9FA',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#B4B4BA' }}>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                Airdrop Checker
              </button>

              {/* Earn 50% Fee – orange gradient border */}
              <button
                style={{
                  ...gradBtn('linear-gradient(135deg,#FB923C,#F59E0B)'),
                  color: '#FB923C',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                <StarIcon />
                Earn 50% Fee
              </button>

              {/* divider */}
              <div style={{ width: 1, height: 24, background: '#252527', flexShrink: 0 }} />

              {/* Create Order – primary CTA */}
              <button
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                  background: '#19FB9B', border: 'none',
                  fontSize: 13, fontWeight: 600, color: '#0A0A0B',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#10d882'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#19FB9B'; }}
              >
                <PlusIcon />
                Create Order
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════
            MAIN 2-COL LAYOUT
            ══════════════════════════════════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, marginTop: 16 }}>

          {/* ───────────────────────────────────
              LEFT: Order book + Chart
              ─────────────────────────────────── */}
          <div style={{ background: '#1B1B1C', borderRadius: 16, border: '1px solid #252527', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

            {/* Header: Trading Market + filters */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #252527', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#F9F9FA' }}>Trading Market</span>
                <a
                  href="#" onClick={e => e.preventDefault()}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#7A7A83', textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#F9F9FA'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#7A7A83'; }}
                >
                  How it work? <ExternalLink />
                </a>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {filterBtn('Collateral', collateral, () => setCollateral(c => c === 'USDC' ? 'USDT' : 'USDC'))}
                {filterBtn('Fill', fillType,     () => setFillType(v => v === 'All' ? 'Partial' : 'All'))}
                {filterBtn('Order', orderType,   () => setOrderType(v => v === 'All' ? 'Limit' : 'All'))}
                <button
                  style={{
                    width: 30, height: 30, borderRadius: 8, cursor: 'pointer',
                    background: 'transparent', border: '1px solid #252527',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7A7A83',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#44444B'; e.currentTarget.style.color = '#F9F9FA'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#252527'; e.currentTarget.style.color = '#7A7A83'; }}
                >
                  <SettingsIcon />
                </button>
              </div>
            </div>

            {/* Order book column headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '8px 20px', borderBottom: '1px solid #1B1B1C' }}>
              <span style={{ fontSize: 11, color: '#7A7A83' }}>Price ({collateral})</span>
              <span style={{ fontSize: 11, color: '#7A7A83', textAlign: 'right' }}>Amount ({market.ticker})</span>
              <span style={{ fontSize: 11, color: '#7A7A83', textAlign: 'right' }}>Collateral ({collateral})</span>
            </div>

            {/* Sell orders */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {SELL_ORDERS.map(order => (
                <OrderRow
                  key={order.id}
                  order={order}
                  side="sell"
                  maxCol={maxSell}
                  isSelected={selectedOrder?.id === order.id}
                  onSelect={() => selectOrder(order, 'sell')}
                />
              ))}
            </div>

            {/* Spread row */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 20px', borderTop: '1px solid #252527', borderBottom: '1px solid #252527',
            }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#F9F9FA' }}>
                ${fmt(market.price, 4)}
              </span>
              <span style={{ fontSize: 12, color: market.priceChange24h >= 0 ? '#5BD197' : '#FD5E67' }}>
                {market.priceChange24h >= 0 ? '+' : ''}{market.priceChange24h.toFixed(2)}%
              </span>
            </div>

            {/* Buy orders */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {BUY_ORDERS.map(order => (
                <OrderRow
                  key={order.id}
                  order={order}
                  side="buy"
                  maxCol={maxBuy}
                  isSelected={selectedOrder?.id === order.id}
                  onSelect={() => selectOrder(order, 'buy')}
                />
              ))}
            </div>

            {/* Price Chart */}
            <div style={{ borderTop: '1px solid #252527', flex: 1 }}>
              {/* Chart controls */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 16px', borderBottom: '1px solid #252527',
              }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {['1d', '7d', '30d'].map(r => (
                    <button
                      key={r} onClick={() => setTimeRange(r)}
                      style={{
                        padding: '3px 8px', borderRadius: 4, border: 'none', cursor: 'pointer',
                        background: timeRange === r ? '#252527' : 'transparent',
                        color: timeRange === r ? '#F9F9FA' : '#7A7A83',
                        fontSize: 12, fontWeight: 500,
                      }}
                    >{r}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {['Price', 'FDV'].map(t => (
                    <button
                      key={t} onClick={() => setChartType(t)}
                      style={{
                        padding: '3px 8px', borderRadius: 4, border: 'none', cursor: 'pointer',
                        background: chartType === t ? '#252527' : 'transparent',
                        color: chartType === t ? '#F9F9FA' : '#7A7A83',
                        fontSize: 12, fontWeight: 500,
                      }}
                    >{t}</button>
                  ))}
                </div>
              </div>
              <div style={{ padding: '12px 20px 16px 12px' }}>
                <PriceChart ticker={market.ticker} />
              </div>
            </div>
          </div>

          {/* ───────────────────────────────────
              RIGHT: Trade Panel + My Orders
              ─────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ── Trade Panel ── */}
            <div style={{ background: '#1B1B1C', borderRadius: 16, border: '1px solid #252527', overflow: 'hidden' }}>

              {/* Trade header */}
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #252527' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#F9F9FA' }}>Trade {market.ticker}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: '#7A7A83' }}>Price</span>
                    <span style={{ fontSize: 12, color: '#F9F9FA', fontWeight: 500 }}>
                      ${fmt(market.price, 4)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedOrder && selectedSide ? (
                /* order selected */
                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* buy/sell indicator */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['buy', 'sell'] as const).map(s => {
                      const active = selectedSide === s;
                      const col = s === 'buy' ? '#5BD197' : '#FD5E67';
                      const bg  = s === 'buy' ? 'rgba(22,194,132,0.1)' : 'rgba(253,94,103,0.1)';
                      const br  = s === 'buy' ? 'rgba(22,194,132,0.3)' : 'rgba(253,94,103,0.3)';
                      return (
                        <div key={s} style={{
                          flex: 1, padding: '8px', borderRadius: 8, textAlign: 'center',
                          background: active ? bg : 'transparent',
                          border: `1px solid ${active ? br : '#252527'}`,
                          color: active ? col : '#7A7A83',
                          fontSize: 13, fontWeight: 500, textTransform: 'capitalize',
                        }}>
                          {s}
                        </div>
                      );
                    })}
                  </div>

                  {/* order details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { label: 'Price',           value: `$${selectedOrder.price.toFixed(4)} ${collateral}` },
                      { label: 'Amount Deliver',   value: `${selectedOrder.amount.toLocaleString()} ${market.ticker}` },
                      { label: 'To be Received',   value: `$${selectedOrder.collateral.toFixed(2)} ${collateral}` },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, color: '#7A7A83' }}>{row.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#F9F9FA' }}>{row.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* trade button */}
                  <button
                    style={{
                      width: '100%', padding: '12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                      background: selectedSide === 'buy' ? '#16C284' : '#FD5E67',
                      fontSize: 14, fontWeight: 600,
                      color: selectedSide === 'buy' ? '#0A0A0B' : '#F9F9FA',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                  >
                    Trade {market.ticker}
                  </button>
                </div>
              ) : (
                /* empty state */
                <div style={{ padding: '36px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <EmptyMascot />
                  <p style={{ fontSize: 12, color: '#7A7A83', textAlign: 'center', margin: 0, lineHeight: '1.6' }}>
                    No order selected yet.<br />Pick one from the list to start trading.
                  </p>
                  <button disabled style={{
                    width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                    background: 'rgba(249,249,250,0.08)',
                    fontSize: 14, fontWeight: 600, color: '#F9F9FA', opacity: 0.4, cursor: 'not-allowed',
                  }}>
                    Trade {market.ticker}
                  </button>
                </div>
              )}

              {/* order summary (always visible when no order selected) */}
              {!selectedOrder && (
                <div style={{ padding: '12px 18px', borderTop: '1px solid #252527', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Price', 'Amount Deliver', 'To be Received'].map(label => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#7A7A83' }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#F9F9FA' }}>-</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── My Orders ── */}
            <div style={{ background: '#1B1B1C', borderRadius: 16, border: '1px solid #252527', overflow: 'hidden' }}>
              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid #252527' }}>
                {[
                  { key: 'filled' as const, label: 'My Filled Orders', count: MY_FILLED_ORDERS.length },
                  { key: 'open'   as const, label: 'My Open Orders',   count: MY_OPEN_ORDERS.length   },
                ].map(tab => {
                  const active = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      style={{
                        flex: 1, padding: '11px 8px', border: 'none', cursor: 'pointer',
                        background: 'transparent',
                        borderBottom: active ? '2px solid #5BD197' : '2px solid transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        color: active ? '#F9F9FA' : '#7A7A83',
                        fontSize: 12, fontWeight: 500, transition: 'all 0.15s',
                      }}
                    >
                      {tab.label}
                      <span style={{
                        padding: '1px 6px', borderRadius: 9999,
                        background: active ? 'rgba(91,209,151,0.15)' : '#252527',
                        color: active ? '#5BD197' : '#7A7A83',
                        fontSize: 10, fontWeight: 700,
                      }}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Order rows */}
              <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 280, overflowY: 'auto' }}>
                {currentOrders.length === 0 ? (
                  <div style={{ padding: '28px 16px', textAlign: 'center' }}>
                    <p style={{ fontSize: 12, color: '#7A7A83', margin: 0 }}>No orders yet</p>
                  </div>
                ) : currentOrders.map(order => (
                  <div
                    key={order.id}
                    style={{
                      padding: '12px 16px', borderBottom: '1px solid #252527',
                      display: 'flex', flexDirection: 'column', gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          padding: '2px 7px', borderRadius: 4,
                          background: order.side === 'buy' ? 'rgba(22,194,132,0.1)' : 'rgba(253,94,103,0.1)',
                          color: order.side === 'buy' ? '#5BD197' : '#FD5E67',
                          fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                        }}>
                          {order.side}
                        </span>
                        <span style={{ fontSize: 11, color: '#7A7A83' }}>{order.time}</span>
                      </div>
                      {activeTab === 'filled' && (
                        <button
                          style={{
                            padding: '3px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                            background: '#252527', fontSize: 11, fontWeight: 500, color: '#5BD197',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#2E2E34'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#252527'; }}
                        >
                          Resell
                        </button>
                      )}
                      {activeTab === 'open' && (
                        <button
                          style={{
                            padding: '3px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                            background: 'rgba(253,94,103,0.1)', fontSize: 11, fontWeight: 500, color: '#FD5E67',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(253,94,103,0.18)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(253,94,103,0.1)'; }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 14 }}>
                      <div>
                        <div style={{ fontSize: 10, color: '#7A7A83', marginBottom: 2 }}>Price</div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: '#F9F9FA' }}>
                          ${order.price.toFixed(4)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#7A7A83', marginBottom: 2 }}>Amount / Collateral</div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: '#F9F9FA' }}>
                          {order.amount >= 1000 ? `${(order.amount / 1000).toFixed(1)}K` : order.amount} / {order.collateral} {order.collateralSymbol}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>{/* end right col */}

        </div>{/* end grid */}
      </div>
    </div>
  );
}
