import { useState, useRef } from 'react';
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

/* ─── chart data ─── */
type ChartPoint = { price: number; volume: number; fullDate: string; shortDate: string };

const CHART_DATA: ChartPoint[] = (() => {
  const prices = [
    0.0012,0.0015,0.0013,0.0018,0.0016,0.0020,0.0017,0.0022,0.0019,0.0025,
    0.0022,0.0028,0.0024,0.0030,0.0027,0.0033,0.0029,0.0036,0.0032,0.0038,
    0.0035,0.0042,0.0038,0.0045,0.0041,0.0048,0.0044,0.0051,0.0046,0.0053,
    0.0048,0.0050,0.0046,0.0042,0.0039,0.0043,0.0040,0.0044,0.0041,0.0047,
    0.0043,0.0049,0.0045,0.0048,0.0044,0.0046,0.0042,0.0040,0.0043,0.0047,
    0.0044,0.0050,0.0046,0.0048,0.0043,0.0045,0.0041,0.0044,0.0042,0.0045,
  ];
  const volumes = [
    12000,8500,15000,9800,22000,6300,18000,11200,7500,14000,
    9200,19000,8800,23000,7200,16000,10500,21000,8000,17000,
    11000,20000,9500,24000,7800,15500,12000,18500,9000,22500,
    6500,17500,10000,23500,7500,16500,11500,21500,8500,19500,
    6000,14500,9800,25000,7000,18000,10800,22000,8200,16000,
    11200,20000,9200,24000,7200,15000,10000,21000,8000,19000,
  ];
  const start = new Date('2025-03-01T00:00:00Z');
  return prices.map((price, i) => {
    const d = new Date(start.getTime() + i * 12 * 3600 * 1000);
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = d.getUTCFullYear();
    const h = d.getUTCHours();
    const min = String(d.getUTCMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return {
      price,
      volume: volumes[i],
      fullDate: `${dd}/${mm}/${yyyy}, ${h12}:${min} ${ampm}`,
      shortDate: `${mm}/${dd}`,
    };
  });
})();

/* ─── interactive price chart (Figma: chart ver=02-hover) ─── */
function PriceChart({
  ticker,
  onHoverTime,
}: {
  ticker: string;
  onHoverTime?: (t: string | null) => void;
}) {
  const [hover, setHover] = useState<{ dataIdx: number } | null>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const data = CHART_DATA;

  /* SVG viewport */
  const W = 820; const PH = 240; const VH = 100;

  /* price scale */
  const prices = data.map(d => d.price);
  const minP = Math.min(...prices) * 0.95;
  const maxP = Math.max(...prices) * 1.05;
  const toX = (i: number) => (i / (data.length - 1)) * W;
  const toY = (v: number) => PH - ((v - minP) / (maxP - minP)) * PH;

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(d.price).toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${W},${PH} L0,${PH} Z`;

  const lastIdx  = data.length - 1;
  const lastPrice = data[lastIdx].price;
  const lastY     = toY(lastPrice);
  const lastChange = (lastPrice - data[0].price) / data[0].price * 100;

  /* 5 evenly-spaced Y-axis ticks */
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const v = maxP - (maxP - minP) * (i / 4);
    return { label: v.toFixed(4), ySvg: toY(v), yPct: (toY(v) / PH) * 100 };
  });

  /* volume scale */
  const maxVol = Math.max(...data.map(d => d.volume));

  /* date labels (7 evenly spaced) */
  const dateLabels = Array.from({ length: 7 }, (_, i) => {
    const idx = Math.round(i * (data.length - 1) / 6);
    return { label: data[idx].shortDate };
  });

  /* crosshair */
  const hoverPt    = hover ? data[hover.dataIdx] : null;
  const hoverSvgX  = hover ? toX(hover.dataIdx) : null;
  const hoverSvgY  = hoverPt ? toY(hoverPt.price) : null;
  const hoverXPct  = hover ? (hover.dataIdx / (data.length - 1)) * 100 : null;
  const hoverYPct  = hoverSvgY !== null ? (hoverSvgY / PH) * 100 : null;

  /* last-price pill top% on right axis (accounting for 32px padding) */
  const lastPillTop = `${((maxP - lastPrice) / (maxP - minP) * (PH - 64) + 32) / PH * 100}%`;

  const TOOLTIP_W = 192;

  function onMouseMove(e: React.MouseEvent) {
    const g = graphRef.current;
    if (!g) return;
    const rect = g.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    if (relX < 0 || relX > rect.width) { onMouseLeave(); return; }
    const idx = Math.min(Math.max(Math.round((relX / rect.width) * (data.length - 1)), 0), data.length - 1);
    setHover({ dataIdx: idx });
    onHoverTime?.(data[idx].fullDate);
  }
  function onMouseLeave() { setHover(null); onHoverTime?.(null); }

  return (
    <div onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} style={{ userSelect: 'none' }}>

      {/* ── Price chart-info row ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1B1B1C' }}>

        {/* Left Y-axis: "Price" + 5 ticks */}
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          alignItems: 'center', padding: 16, width: 60, flexShrink: 0,
          borderRight: '1px solid #1B1B1C', height: PH,
        }}>
          <span style={{ fontSize: 10, color: '#7A7A83' }}>Price</span>
          {yTicks.map((t, i) => (
            <span key={i} style={{ fontSize: 10, color: '#7A7A83' }}>{t.label}</span>
          ))}
        </div>

        {/* Chart graph — fills remaining width */}
        <div ref={graphRef} style={{ flex: 1, position: 'relative', height: PH }}>
          <svg viewBox={`0 0 ${W} ${PH}`} preserveAspectRatio="none"
            style={{ width: '100%', height: '100%', display: 'block' }}>
            <defs>
              <linearGradient id={`ag-${ticker}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16C284" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#16C284" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* faint grid lines */}
            {yTicks.map((t, i) => (
              <line key={i} x1="0" y1={t.ySvg} x2={W} y2={t.ySvg} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            ))}
            {/* area + line */}
            <path d={areaPath} fill={`url(#ag-${ticker})`} />
            <path d={linePath} fill="none" stroke="#16C284" strokeWidth="1.5" />
            {/* last-price dashed horizontal */}
            <line x1="0" y1={lastY} x2={W} y2={lastY} stroke="#5BD197" strokeWidth="1" strokeDasharray="2 2" />
            {/* last-price dot */}
            <circle cx={toX(lastIdx)} cy={lastY} r="8" fill="rgba(22,194,132,0.2)" />
            <circle cx={toX(lastIdx)} cy={lastY} r="4" fill="#16C284" />
            {/* crosshair vertical */}
            {hoverSvgX !== null && (
              <line x1={hoverSvgX} y1="0" x2={hoverSvgX} y2={PH} stroke="#44444B" strokeWidth="1" strokeDasharray="4 4" />
            )}
            {/* crosshair horizontal */}
            {hoverSvgY !== null && (
              <line x1="0" y1={hoverSvgY} x2={W} y2={hoverSvgY} stroke="#44444B" strokeWidth="1" strokeDasharray="4 4" />
            )}
            {/* crosshair intersection dot */}
            {hoverSvgX !== null && hoverSvgY !== null && (
              <circle cx={hoverSvgX} cy={hoverSvgY} r="4" fill="#F9F9FA" stroke="#44444B" strokeWidth="1" />
            )}
          </svg>

          {/* Last Price overlay — top-left (Figma: layout_4OI7A6 x:8 y:8) */}
          <div style={{
            position: 'absolute', top: 8, left: 8,
            display: 'flex', gap: 4, pointerEvents: 'none',
          }}>
            <span style={{ fontSize: 12, color: '#7A7A83' }}>Last Price</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 12, color: '#F9F9FA' }}>${lastPrice.toFixed(4)}</span>
              <span style={{ fontSize: 12, color: lastChange >= 0 ? '#5BD197' : '#FD5E67' }}>
                {lastChange >= 0 ? '+' : ''}{lastChange.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* WhalesMarket watermark — bottom-right */}
          <div style={{
            position: 'absolute', bottom: 8, right: 8,
            opacity: 0.35, pointerEvents: 'none',
            display: 'flex', alignItems: 'center', gap: 3,
          }}>
            <span style={{ fontSize: 9, fontWeight: 600, color: '#F9F9FA', letterSpacing: '0.05em' }}>
              WHALES MARKET
            </span>
          </div>

          {/* Tooltip (Figma: layout_X32J1Z + layout_5CIOC5 — column, center, bg #252527, br:8, w:192) */}
          {hover && hoverPt && hoverXPct !== null && hoverYPct !== null && (
            <div style={{
              position: 'absolute',
              left: `clamp(0px, calc(${hoverXPct}% - ${TOOLTIP_W / 2}px), calc(100% - ${TOOLTIP_W}px))`,
              top: `clamp(8px, calc(${hoverYPct}% - 110px), calc(${hoverYPct}% - 8px))`,
              width: TOOLTIP_W,
              background: '#252527', borderRadius: 8,
              padding: '8px 12px', pointerEvents: 'none',
              boxShadow: '0 0 8px rgba(0,0,0,0.1)', zIndex: 50,
            }}>
              {/* datetime — layout_JLOA65: row, border-bottom */}
              <div style={{ paddingBottom: 8, borderBottom: '1px solid #2E2E34' }}>
                <span style={{ fontSize: 12, color: '#7A7A83' }}>{hoverPt.fullDate}</span>
              </div>
              {/* Price row — layout_6NKOA6: row, fill */}
              <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                <span style={{ fontSize: 12, color: '#7A7A83', flex: 1 }}>Price:</span>
                <span style={{ fontSize: 12, color: '#F9F9FA' }}>${hoverPt.price.toFixed(4)}</span>
              </div>
              {/* Vol row */}
              <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                <span style={{ fontSize: 12, color: '#7A7A83', flex: 1 }}>Vol:</span>
                <span style={{ fontSize: 12, color: '#F9F9FA' }}>${fmt(hoverPt.volume)}</span>
              </div>
              {/* Arrow */}
              <svg width="16" height="8" viewBox="0 0 16 8" fill="none"
                style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)' }}>
                <path d="M0 0 L8 8 L16 0 Z" fill="#252527" />
              </svg>
            </div>
          )}
        </div>

        {/* Right Y-axis: ticks + last-price pill (Figma: layout_LROX9Z — padding 32px 16px) */}
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: '32px 8px', width: 56, flexShrink: 0, position: 'relative', height: PH,
        }}>
          {yTicks.map((t, i) => (
            <span key={i} style={{ fontSize: 10, color: '#7A7A83' }}>{t.label}</span>
          ))}
          {/* Last-price pill — absolutely positioned at lastPrice level */}
          <div style={{
            position: 'absolute', left: 4, right: 4, top: lastPillTop,
            transform: 'translateY(-50%)',
            background: '#16C284', borderRadius: 4,
            padding: '2px 4px', textAlign: 'center',
          }}>
            <span style={{ fontSize: 10, color: '#F9F9FA', fontWeight: 500 }}>{lastPrice.toFixed(4)}</span>
          </div>
        </div>
      </div>

      {/* ── Volume chart-info row (Figma: second chart-info) ── */}
      <div style={{ display: 'flex' }}>
        {/* Left axis: "Volume" label */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', padding: 16,
          width: 60, flexShrink: 0, borderRight: '1px solid #1B1B1C',
          height: VH,
        }}>
          <span style={{ fontSize: 10, color: '#7A7A83' }}>Volume</span>
        </div>
        {/* Volume bars */}
        <div style={{ flex: 1, height: VH, position: 'relative' }}>
          <svg viewBox={`0 0 ${W} ${VH}`} preserveAspectRatio="none"
            style={{ width: '100%', height: '100%', display: 'block' }}>
            {data.map((d, i) => {
              const barH = Math.max(2, (d.volume / maxVol) * (VH - 8));
              const barW = Math.max(1, W / data.length - 1.5);
              const isDown = i > 0 && d.price < data[i - 1].price;
              return (
                <rect key={i}
                  x={Math.max(0, toX(i) - barW / 2)}
                  y={VH - barH} width={barW} height={barH}
                  fill={isDown ? 'rgba(255,59,70,0.2)' : 'rgba(22,194,132,0.2)'}
                />
              );
            })}
            {/* crosshair vertical in volume */}
            {hoverSvgX !== null && (
              <line x1={hoverSvgX} y1="0" x2={hoverSvgX} y2={VH} stroke="#44444B" strokeWidth="1" strokeDasharray="4 4" />
            )}
          </svg>
        </div>
        {/* Right spacer to align with price chart */}
        <div style={{ width: 56, flexShrink: 0 }} />
      </div>

      {/* ── Date labels ── */}
      <div style={{ display: 'flex', padding: '6px 0' }}>
        <div style={{ width: 60, flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', padding: '0 8px' }}>
          {dateLabels.map((d, i) => (
            <span key={i} style={{ fontSize: 10, color: '#7A7A83' }}>{d.label}</span>
          ))}
        </div>
        <div style={{ width: 56, flexShrink: 0 }} />
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
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 10l5 5 5-5H7z" />
  </svg>
);
const ExternalLink = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 6v2H5v11h11v-5h2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6zm11-3v8h-2V6.413l-7.793 7.794-1.414-1.414L17.585 5H13V3h8z" />
  </svg>
);
const ArrowRightUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const UmbrellaIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1C6.48 1 2 5.48 2 11c0 .55.45 1 1 1h8v8c0 1.1.9 2 2 2s2-.9 2-2v-8h8c.55 0 1-.45 1-1C24 5.48 19.52 1 12 1z" />
  </svg>
);
const PigIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 9h-1.17C17.4 6.63 15.29 5 13 5h-2C8.24 5 6 7.24 6 10v4c0 1.86 1.28 3.41 3 3.86V20h2v-2h2v2h2v-2.14C17.72 17.41 19 15.86 19 14v-.17C19.88 13.58 20.5 12.86 20.5 12v-1.5C20.5 9.67 19.83 9 19 9zM9.5 12a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
  </svg>
);
const AddFillIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 11H13V5h-2v6H5v2h6v6h2v-6h6v-2z" />
  </svg>
);
const ChartLineIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3.5 18.5L9.5 12.5L13.5 16.5L22 7M22 7H16M22 7V13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
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
const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9.29 6.71a1 1 0 0 0 0 1.41L13.17 12l-3.88 3.88a1 1 0 1 0 1.41 1.41l4.59-4.59a1 1 0 0 0 0-1.41L10.7 6.7a1 1 0 0 0-1.41.01z" />
  </svg>
);
const EmptyMascot = ({ size = 56 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
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
  const [hoverTime, setHoverTime]                 = useState<string | null>(null);

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

  /* Figma: layout_Z225N1 — secondary/tonal/md button: padding 8px 8px 8px 16px, gap 6, bg #1B1B1C, br:8 */
  const filterBtn = (label: string, value: string, cycle: () => void) => (
    <button
      onClick={cycle}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 8px 8px 16px', borderRadius: 8, cursor: 'pointer',
        background: '#1B1B1C', border: 'none',
        fontSize: 14, fontWeight: 500, color: '#F9F9FA', whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#252527'; }}
      onMouseLeave={e => { e.currentTarget.style.background = '#1B1B1C'; }}
    >
      {label}: {value}
      <span style={{ color: '#7A7A83', display: 'flex' }}><ChevronDown /></span>
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
            MARKET HEADER  (Figma: market-header-update)
            ══════════════════════════════════════ */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '24px 0', borderBottom: '4px solid #1B1B1C',
        }}>

          {/* ── token-info (fills width) ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32, flex: 1, minWidth: 0 }}>

            {/* token: logo + ticker + project name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {/* image-slot 44×44 — same structure as Home TokenCell */}
              <div style={{ position: 'relative', display: 'inline-flex', padding: 4, flexShrink: 0 }}>
                <img
                  src={market.logo} alt={market.ticker}
                  style={{ width: 44, height: 44, borderRadius: '9999px', objectFit: 'cover' }}
                  onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${market.ticker}&background=252527&color=F9F9FA&size=44`; }}
                />
                <img
                  src={market.chainLogo} alt="chain"
                  style={{ position: 'absolute', left: 0, top: 36, width: 16, height: 16, borderRadius: 4, border: '1.5px solid #0A0A0B', objectFit: 'cover' }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
              {/* token-name: Figma layout_GQXW0K — column, justifyContent center */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {/* ticker frame: Figma layout_WLLSHI — row, alignItems center, gap 8 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'Inter Variable, Inter, sans-serif', fontSize: 18, fontWeight: 500, lineHeight: '28px', color: '#F9F9FA' }}>
                    {market.ticker}
                  </span>
                </div>
                {/* stat-data (project name): Figma layout_189359 — row, center, padding 2px 0 */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2px 0' }}>
                  <span style={{ fontFamily: 'Inter Variable, Inter, sans-serif', fontSize: 12, fontWeight: 400, lineHeight: '16px', color: '#7A7A83' }}>
                    {market.name}
                  </span>
                </div>
              </div>
            </div>

            {/* price — Figma layout_9SUBJT: column, hug */}
            <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
              {/* price text: text-label-lg — 18px 500 */}
              <span style={{ fontSize: 18, fontWeight: 500, lineHeight: '28px', color: '#F9F9FA' }}>
                ${fmt(market.price, market.price < 1 ? 4 : 2)}
              </span>
              {/* stat-data: row, padding 2px 0 */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '2px 0' }}>
                <span style={{ fontSize: 12, fontWeight: 400, lineHeight: '16px', color: market.priceChange24h >= 0 ? '#5BD197' : '#FD5E67' }}>
                  {market.priceChange24h >= 0 ? '+' : ''}{market.priceChange24h.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* stats — Figma: row, alignItems center, gap 32px */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>

              {/* stat-item: 24h Vol. */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {/* label */}
                <div style={{ display: 'flex', flexDirection: 'column', padding: '6px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 400, color: '#7A7A83', whiteSpace: 'nowrap' }}>24h Vol.</span>
                  </div>
                </div>
                {/* stat-data */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 0' }}>
                  <span style={{ fontSize: 12, fontWeight: 400, color: '#F9F9FA' }}>${fmt(market.volume24h)}</span>
                  <span style={{ fontSize: 12, fontWeight: 400, color: '#5BD197' }}>+{market.volumeChange24h?.toFixed(2) ?? '0.00'}%</span>
                </div>
              </div>

              {/* stat-item: Total Vol. */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {/* label */}
                <div style={{ display: 'flex', flexDirection: 'column', padding: '6px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 400, color: '#7A7A83', whiteSpace: 'nowrap' }}>Total Vol.</span>
                  </div>
                </div>
                {/* stat-data */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 0' }}>
                  <span style={{ fontSize: 12, fontWeight: 400, color: '#F9F9FA' }}>${fmt(market.openInterest)}</span>
                </div>
              </div>

              {/* stat-item: Countdown */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {/* label: column, center, padding 6px 0 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 0' }}>
                  {/* label-content: hover "Countdown" text → show tooltip */}
                  <div
                    style={{
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                      borderBottom: '1px dashed #2E2E34', cursor: 'default', position: 'relative',
                    }}
                    onMouseEnter={() => setShowTbaTooltip(true)}
                    onMouseLeave={() => setShowTbaTooltip(false)}
                  >
                    <span style={{ fontSize: 12, fontWeight: 400, color: '#7A7A83', whiteSpace: 'nowrap' }}>Countdown</span>
                    {showTbaTooltip && (
                      <div style={{
                        position: 'absolute', bottom: 'calc(100% + 10px)', left: 0,
                        zIndex: 200, background: '#252527', borderRadius: 8,
                        padding: '8px 12px', width: 240,
                        boxShadow: '0 0 8px 0 rgba(0,0,0,0.1)',
                        pointerEvents: 'none',
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {[
                            { label: 'Start Date', val: 'TBA' },
                            { label: 'Time (UTC)', val: 'TBA' },
                          ].map(row => (
                            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 6, alignItems: 'center' }}>
                              <span style={{ fontSize: 12, color: '#7A7A83' }}>{row.label}</span>
                              <span style={{ fontSize: 12, color: '#F9F9FA' }}>{row.val}</span>
                            </div>
                          ))}
                        </div>
                        <svg width="16" height="8" viewBox="0 0 16 8" fill="none"
                          style={{ position: 'absolute', bottom: -8, left: 12 }}>
                          <path d="M0 0 L8 8 L16 0 Z" fill="#252527" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                {/* stat-data: row, center, gap 4, NO padding */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
                  {isTBA ? (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '4px 8px', borderRadius: 9999,
                      background: '#1B1B1C', color: '#7A7A83',
                      fontSize: 10, fontWeight: 500, userSelect: 'none',
                      letterSpacing: '0.04em', textTransform: 'uppercase',
                    }}>
                      TBA
                    </span>
                  ) : (
                    <span style={{ fontSize: 12, fontWeight: 400, color: '#F9F9FA' }}>
                      {market.settlementDate}{market.settlementTime && (' · ' + market.settlementTime + ' UTC')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── buttons (right-aligned, Figma: alignSelf stretch) ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>

            {/* social group */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

              {/* "About SKATE" grouped button (text + chevron) */}
              <div style={{ display: 'flex', border: '1px solid #252527', borderRadius: 8, overflow: 'hidden' }}>
                {/* About text + arrow-right-up icon */}
                <button
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 8px 8px 16px', cursor: 'pointer',
                    background: 'transparent', border: 'none', borderRight: '1px solid #252527',
                    fontSize: 14, fontWeight: 500, lineHeight: '20px',
                    color: '#F9F9FA', whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249,249,250,0.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  About {market.ticker}
                  <span style={{ color: '#F9F9FA', display: 'flex' }}><ArrowRightUpIcon /></span>
                </button>
                {/* Dropdown chevron (icon-only) */}
                <button
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '8px', cursor: 'pointer',
                    background: 'transparent', border: 'none',
                    color: '#7A7A83',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249,249,250,0.04)'; e.currentTarget.style.color = '#F9F9FA'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7A7A83'; }}
                >
                  <ChevronDown />
                </button>
              </div>

            </div>

            {/* divider — vertical 16px */}
            <div style={{ width: 2, height: 16, background: '#252527', flexShrink: 0 }} />

            {/* Create Order — filled white button */}
            <button
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                height: 36, padding: '8px 16px 8px 8px', borderRadius: 8, cursor: 'pointer',
                background: '#F9F9FA', border: 'none',
                fontSize: 14, fontWeight: 500, lineHeight: '20px',
                color: '#0A0A0B', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#E5E5E6'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#F9F9FA'; }}
            >
              <AddFillIcon />
              Create Order
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════
            MAIN 2-COL LAYOUT
            ══════════════════════════════════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 384px', gap: 16, marginTop: 16 }}>

          {/* ═══════════════════════════════════════
              LEFT: market frame (Figma: 37315-160537)
              column, gap:16, padding:16px 0px
              ═══════════════════════════════════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ── block-title (Figma: layout_R255GA — row, space-between, center, gap:8) ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              {/* title: column, gap:4 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 18, fontWeight: 500, color: '#F9F9FA' }}>Trading Market</span>
                <a
                  href="#" onClick={e => e.preventDefault()}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 2,
                    fontSize: 12, color: '#7A7A83', textDecoration: 'none',
                    borderBottom: '1px solid #252527', paddingBottom: 1,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#F9F9FA'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#7A7A83'; }}
                >
                  How it work? <ExternalLink />
                </a>
              </div>
              {/* buttons: row, gap:8 (Figma: layout_17I9IR) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {filterBtn('Collateral', collateral, () => setCollateral(c => c === 'USDC' ? 'USDT' : 'USDC'))}
                {filterBtn('Fill', fillType, () => setFillType(v => v === 'All' ? 'Partial' : 'All'))}
                {filterBtn('Order', orderType, () => setOrderType(v => v === 'All' ? 'Limit' : 'All'))}
                {/* icon-only chart button (Figma: layout_U09NN2 — padding:8) */}
                <button
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 8, borderRadius: 8, cursor: 'pointer',
                    background: '#1B1B1C', border: 'none', color: '#7A7A83',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#252527'; e.currentTarget.style.color = '#F9F9FA'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#1B1B1C'; e.currentTarget.style.color = '#7A7A83'; }}
                >
                  <ChartLineIcon />
                </button>
              </div>
            </div>

            {/* ── chart card (Figma: layout_8CQU2J — column, border:1px #1B1B1C, br:8) ── */}
            <div style={{ border: '1px solid #1B1B1C', borderRadius: 8, overflow: 'hidden' }}>

              {/* time bar (Figma: layout_O4P10O — row, center, gap:12, padding:8px 16px 8px 8px) */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '8px 16px 8px 8px', borderBottom: '1px solid #1B1B1C',
              }}>
                {/* time-range: 1d / 7d / 30d (Figma: layout_604108 — row, gap:4) */}
                <div style={{ display: 'flex', gap: 4 }}>
                  {['1d', '7d', '30d'].map(r => (
                    <button key={r} onClick={() => setTimeRange(r)} style={{
                      padding: '2px 8px', borderRadius: 4, border: 'none', cursor: 'pointer',
                      background: timeRange === r ? '#1B1B1C' : 'transparent',
                      color: timeRange === r ? '#F9F9FA' : '#7A7A83',
                      fontSize: 12, fontWeight: 500,
                    }}>{r}</button>
                  ))}
                </div>
                {/* divider (Figma: layout_Y7UOKT — line, fill height) */}
                <div style={{ width: 1, alignSelf: 'stretch', background: '#1B1B1C', flexShrink: 0 }} />
                {/* type: Price / FDV (Figma: layout_0IYV8T — row, gap:4, fill) */}
                <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                  {['Price', 'FDV'].map(t => (
                    <button key={t} onClick={() => setChartType(t)} style={{
                      padding: '2px 8px', borderRadius: 4, border: 'none', cursor: 'pointer',
                      background: chartType === t ? '#1B1B1C' : 'transparent',
                      color: chartType === t ? '#F9F9FA' : '#7A7A83',
                      fontSize: 12, fontWeight: 500,
                    }}>{t}</button>
                  ))}
                </div>
                {/* hovered time display (Figma: layout_NVIIB0 — row, gap:4) */}
                {hoverTime && (
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: 12, color: '#7A7A83' }}>Time</span>
                    <span style={{ fontSize: 12, color: '#F9F9FA' }}>{hoverTime}</span>
                  </div>
                )}
              </div>

              {/* interactive chart */}
              <PriceChart ticker={market.ticker} onHoverTime={setHoverTime} />
            </div>

            {/* ── market-detail: order book (Figma: layout_SBRYFB — column, gap:2) ── */}
            <div style={{ border: '1px solid #252527', borderRadius: 8, overflow: 'hidden' }}>
              {/* Order book column headers (Figma: layout_XEET2H — row, padding:0px 8px) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '8px 20px', borderBottom: '1px solid #1B1B1C' }}>
                <span style={{ fontSize: 11, color: '#7A7A83' }}>Price ({collateral})</span>
                <span style={{ fontSize: 11, color: '#7A7A83', textAlign: 'right' }}>Amount ({market.ticker})</span>
                <span style={{ fontSize: 11, color: '#7A7A83', textAlign: 'right' }}>Collateral ({collateral})</span>
              </div>
              {/* Sell orders */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {SELL_ORDERS.map(order => (
                  <OrderRow key={order.id} order={order} side="sell" maxCol={maxSell}
                    isSelected={selectedOrder?.id === order.id}
                    onSelect={() => selectOrder(order, 'sell')} />
                ))}
              </div>
              {/* Spread row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px', borderTop: '1px solid #252527', borderBottom: '1px solid #252527' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#F9F9FA' }}>${fmt(market.price, 4)}</span>
                <span style={{ fontSize: 12, color: market.priceChange24h >= 0 ? '#5BD197' : '#FD5E67' }}>
                  {market.priceChange24h >= 0 ? '+' : ''}{market.priceChange24h.toFixed(2)}%
                </span>
              </div>
              {/* Buy orders */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {BUY_ORDERS.map(order => (
                  <OrderRow key={order.id} order={order} side="buy" maxCol={maxBuy}
                    isSelected={selectedOrder?.id === order.id}
                    onSelect={() => selectOrder(order, 'buy')} />
                ))}
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════
              RIGHT: trade+chart (Figma: 37222-132673)
              column, gap:16, padding:16px 0px
              ═══════════════════════════════════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ── trade-panel (Figma: layout_Y4KCU5 — column, center, gap:16, pb:24, w:384)
                fills: #0A0A0B | strokes: border-bottom 4px #1B1B1C ── */}
            <div style={{
              background: '#0A0A0B',
              borderBottom: '4px solid #1B1B1C',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
              paddingBottom: 24,
            }}>

              {/* block-title (Figma: layout_051I26 — row, stretch) */}
              <div style={{ display: 'flex', alignSelf: 'stretch', padding: '16px 16px 0' }}>
                {/* title (layout_KCYZYH — column, center, gap:4, fill) */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, flex: 1 }}>
                  {/* token (layout_YWO9IS — row, center, gap:8, hug) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18, fontWeight: 500, color: '#F9F9FA' }}>
                      Trade {market.ticker}
                    </span>
                  </div>
                  {/* price (layout_YIU0YL — row, center, gap:2, hug) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 12, color: '#7A7A83' }}>Price</span>
                    <span style={{ fontSize: 12, color: selectedOrder ? '#F9F9FA' : '#7A7A83' }}>
                      {selectedOrder ? ('$' + selectedOrder.price.toFixed(4)) : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* trade-form (Figma: layout_TCBDAZ — column, center, padding:32, h:216, stroke:1px #1B1B1C) */}
              {selectedOrder && selectedSide ? (
                /* ── Order selected state ── */
                <div style={{
                  display: 'flex', flexDirection: 'column', justifyContent: 'center',
                  alignSelf: 'stretch', padding: 32, minHeight: 216,
                  border: '1px solid #1B1B1C', gap: 16,
                }}>
                  {/* buy / sell toggle */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['buy', 'sell'] as const).map(s => {
                      const active = selectedSide === s;
                      const col = s === 'buy' ? '#5BD197' : '#FD5E67';
                      const bg  = s === 'buy' ? 'rgba(22,194,132,0.1)' : 'rgba(253,94,103,0.1)';
                      const bdr = s === 'buy' ? 'rgba(22,194,132,0.3)' : 'rgba(253,94,103,0.3)';
                      return (
                        <div key={s} style={{
                          flex: 1, padding: '8px', borderRadius: 8, textAlign: 'center',
                          background: active ? bg : 'transparent',
                          border: '1px solid ' + (active ? bdr : '#252527'),
                          color: active ? col : '#7A7A83',
                          fontSize: 14, fontWeight: 500, textTransform: 'capitalize',
                        }}>
                          {s === 'buy' ? 'Buy' : 'Sell'}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* ── Empty state: mascot 96×96 (Figma: layout_NP1Q25 — 96×96) ── */
                <div style={{
                  display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                  alignSelf: 'stretch', padding: 32, height: 216,
                  border: '1px solid #1B1B1C', gap: 12,
                }}>
                  <EmptyMascot size={96} />
                  <p style={{ fontSize: 12, color: '#7A7A83', textAlign: 'center', margin: 0, lineHeight: '1.6' }}>
                    No order selected yet.<br />Pick one from the list to start trading.
                  </p>
                </div>
              )}

              {/* buttons (Figma: layout_U0BBSN — row, stretch, gap:8, fill)
                  button: secondary/filled/lg — padding:10px 20px, br:8
                  disabled: opacity 0.4, bg #F9F9FA, text #0A0A0B */}
              <div style={{ display: 'flex', alignSelf: 'stretch', gap: 8, padding: '0 16px' }}>
                <button
                  disabled={!selectedOrder}
                  style={{
                    flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center',
                    gap: 8, padding: '10px 20px', borderRadius: 8, border: 'none',
                    cursor: selectedOrder ? 'pointer' : 'not-allowed',
                    background: selectedOrder
                      ? (selectedSide === 'buy' ? '#16C284' : '#FD5E67')
                      : '#F9F9FA',
                    fontSize: 14, fontWeight: 500,
                    color: '#0A0A0B',
                    opacity: selectedOrder ? 1 : 0.4,
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => { if (selectedOrder) e.currentTarget.style.opacity = '0.88'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = selectedOrder ? '1' : '0.4'; }}
                >
                  Trade {market.ticker}
                </button>
              </div>

              {/* oder-info-group (Figma: layout_KNCXKG — column, gap:8, fill)
                  offer-info-item label: bottom-dashed border #2E2E34 (stroke_U615P2) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignSelf: 'stretch', gap: 8, padding: '0 16px' }}>
                {[
                  { label: 'Price',          value: selectedOrder ? ('$' + selectedOrder.price.toFixed(4) + ' ' + collateral) : '-' },
                  { label: 'Amount Deliver', value: selectedOrder ? (selectedOrder.amount.toLocaleString() + ' ' + market.ticker) : '-' },
                  { label: 'To be Received', value: selectedOrder ? ('$' + selectedOrder.collateral.toFixed(2) + ' ' + collateral) : '-' },
                ].map(row => (
                  /* oder-info (layout_Y7TI48 — row, space-between, center, gap:16) */
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                    {/* offer-info-item left (layout_ZT3SBO) + stroke_U615P2 = dashed bottom border */}
                    <span style={{
                      fontSize: 12, color: '#7A7A83',
                      borderBottom: '1px dashed #2E2E34', paddingBottom: 2,
                    }}>
                      {row.label}
                    </span>
                    {/* offer-info-item right (layout_ZT3SBO, no stroke) */}
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#F9F9FA' }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── my-orders (Figma: layout_CO3905 — column, gap:16, fill) ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

              {/* tab (Figma: layout_8EFV42 — row, gap:24, 384×52)
                  active: fill_B0EITJ #5BD197 indicator, fill_1P3MUN #F9F9FA text
                  inactive: fill_B6YLG1 #7A7A83 text, fill_XY3AGF #1B1B1C badge */}
              <div style={{ display: 'flex', height: 52, borderBottom: '1px solid #1B1B1C' }}>
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
                        flex: 1, display: 'flex', flexDirection: 'column',
                        justifyContent: 'space-between', alignItems: 'center',
                        padding: '8px 0', background: 'transparent', border: 'none', cursor: 'pointer',
                      }}
                    >
                      {/* top indicator (inactive = transparent, 16×2 px) */}
                      <div style={{ width: 16, height: 2 }} />
                      {/* tab-label (layout_YWO9IS — row, center, gap:8) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 500, color: active ? '#F9F9FA' : '#7A7A83', whiteSpace: 'nowrap' }}>
                          {tab.label}
                        </span>
                        {/* whales-badge (layout_DFI7E4 — padding:4px 8px, br:9999) */}
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          padding: '4px 8px', borderRadius: 9999,
                          background: active ? 'rgba(22,194,132,0.1)' : '#1B1B1C',
                          color: active ? '#5BD197' : '#B4B4BA',
                          fontSize: 10, fontWeight: 700,
                        }}>
                          {tab.count}
                        </span>
                      </div>
                      {/* bottom active-indicator (fill) */}
                      <div style={{ height: 2, alignSelf: 'stretch', background: active ? '#5BD197' : 'transparent' }} />
                    </button>
                  );
                })}
              </div>

              {/* order-list (layout_CO3905 — column, fill) */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {currentOrders.length === 0 ? (
                  <div style={{ padding: '28px 16px', textAlign: 'center' }}>
                    <p style={{ fontSize: 12, color: '#7A7A83', margin: 0 }}>No orders yet</p>
                  </div>
                ) : currentOrders.map(order => (
                  /* myorder-item (layout_UY2DN8 — column, gap:12, pb:16, stroke_OLHN3B = bottom 1px #1B1B1C) */
                  <div
                    key={order.id}
                    style={{
                      display: 'flex', flexDirection: 'column', gap: 12,
                      padding: '16px 0', borderBottom: '1px solid #1B1B1C',
                    }}
                  >
                    {/* Column (layout_J4B4M5 — row, space-between, center, fill) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {/* Row (layout_FIYZ01 — row, gap:4) */}
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        {/* side color text */}
                        <span style={{
                          fontSize: 12, fontWeight: 500,
                          color: order.side === 'buy' ? '#5BD197' : '#FD5E67',
                        }}>
                          {order.side === 'buy' ? 'Buy' : 'Sell'}
                        </span>
                        {/* Name (layout_L3PYAI — row, gap:4) */}
                        <span style={{ fontSize: 12, fontWeight: 500, color: '#F9F9FA' }}>
                          {market.ticker}
                        </span>
                      </div>
                      {/* time ago text */}
                      <span style={{ fontSize: 12, color: '#7A7A83' }}>{order.time}</span>
                    </div>

                    {/* Row (layout_U856NW — row, align:flex-end, gap:10, fill) */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                      {/* Column (layout_GA7ZV3 — column, gap:4, fill) */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                        {/* price row (layout_E5CWWL — row, center, gap:4, fill) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {/* label (layout_O8ROFQ — row, center, gap:2) */}
                          <span style={{ fontSize: 12, color: '#7A7A83' }}>Price</span>
                          {/* amount+collateral (layout_YIU0YL — row, center, gap:2) */}
                          <span style={{ fontSize: 12, fontWeight: 500, color: '#F9F9FA' }}>
                            ${order.price.toFixed(4)}
                          </span>
                        </div>
                        {/* amount+collateral row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 12, color: '#7A7A83' }}>Amount</span>
                          <span style={{ fontSize: 12, fontWeight: 500, color: '#F9F9FA' }}>
                            {order.amount >= 1000 ? (order.amount / 1000).toFixed(1) + 'K' : order.amount}
                          </span>
                          <span style={{ fontSize: 12, color: '#7A7A83' }}>/</span>
                          <span style={{ fontSize: 12, fontWeight: 500, color: '#F9F9FA' }}>
                            {order.collateral} {order.collateralSymbol}
                          </span>
                        </div>
                      </div>

                      {/* button (layout_IM74H7 — row, center, gap:4, padding:6px 12px)
                          Resell: fill_Y9Y7MQ rgba(234,179,8,0.1), text fill_UWKHQI #FACC15
                          Cancel: red tint */}
                      {activeTab === 'filled' ? (
                        <button
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: 4, padding: '6px 12px', borderRadius: 8, border: 'none',
                            cursor: 'pointer',
                            background: 'rgba(234,179,8,0.1)',
                            fontSize: 14, fontWeight: 500, color: '#FACC15', whiteSpace: 'nowrap',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(234,179,8,0.18)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(234,179,8,0.1)'; }}
                        >
                          Resell
                        </button>
                      ) : (
                        <button
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: 4, padding: '6px 12px', borderRadius: 8, border: 'none',
                            cursor: 'pointer',
                            background: 'rgba(253,94,103,0.1)',
                            fontSize: 14, fontWeight: 500, color: '#FD5E67', whiteSpace: 'nowrap',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(253,94,103,0.18)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(253,94,103,0.1)'; }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* link (Figma: layout_WJ1E26 — row, space-between, padding:12px 16px, fill #1B1B1C)
                  text: fill_B0EITJ #5BD197 | icon: fill_77R2ZH #FFFFFF */}
              <button
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px', background: '#1B1B1C', borderRadius: 8,
                  border: 'none', cursor: 'pointer', width: '100%', marginTop: 16,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#252527'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#1B1B1C'; }}
              >
                {/* text (layout_NIYQ5I — row, center, gap:8) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#FFFFFF', display: 'flex' }}><ExternalLink /></span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#5BD197' }}>View All Orders</span>
                </div>
                <span style={{ color: '#FFFFFF', display: 'flex' }}><ChevronRight /></span>
              </button>
            </div>

          </div>{/* end right col */}

        </div>{/* end grid */}
      </div>
    </div>
  );
}
