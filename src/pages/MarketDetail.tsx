import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { markets } from '../mock-data/markets';
import { recentTrades } from '../mock-data/trades';
import mascotWhale from '../assets/mascot-whale-frame.png';
import emptyOrdersIllustration from '../assets/empty-orders-illustration.png';

/* ─── helpers ─── */
const fmt = (n: number, dec = 2) =>
  n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtK = (n: number) => n >= 1_000_000 ? `${parseFloat((n / 1_000_000).toFixed(2))}M` : n >= 1000 ? `${parseFloat((n / 1000).toFixed(2))}K` : `${n}`;

/* ─── mock order book data ─── */
const CREATURES = [
  '/images/creature-whale.svg',
  '/images/creature-shrimp.svg',
  '/images/creature-shark.svg',
  '/images/creature-dolphin.svg',
  '/images/creature-fish.svg',
];
const SELL_ORDERS = [
  { id: 's1', price: 0.0058, amount: 12000,  collateral: 69.6,  creatureIcon: CREATURES[0] },
  { id: 's2', price: 0.0055, amount: 8500,   collateral: 46.75, creatureIcon: CREATURES[1] },
  { id: 's3', price: 0.0053, amount: 5200,   collateral: 27.56, creatureIcon: CREATURES[2] },
  { id: 's4', price: 0.0051, amount: 3600,   collateral: 18.36, creatureIcon: CREATURES[3] },
  { id: 's5', price: 0.0050, amount: 9800,   collateral: 49.0,  creatureIcon: CREATURES[4] },
];
const BUY_ORDERS = [
  { id: 'b1', price: 0.0048, amount: 7500,   collateral: 36.0,  creatureIcon: CREATURES[0] },
  { id: 'b2', price: 0.0046, amount: 11200,  collateral: 51.52, creatureIcon: CREATURES[1] },
  { id: 'b3', price: 0.0044, amount: 6300,   collateral: 27.72, creatureIcon: CREATURES[2] },
  { id: 'b4', price: 0.0042, amount: 4800,   collateral: 20.16, creatureIcon: CREATURES[3] },
  { id: 'b5', price: 0.0040, amount: 15600,  collateral: 62.4,  creatureIcon: CREATURES[4] },
];

type MyOrder = { id: string; side: string; hasPosition: boolean; price: number; amount: number; collateral: number; collateralSymbol: string; time: string };
const MY_FILLED_ORDERS: MyOrder[] = [];
const MY_OPEN_ORDERS: MyOrder[] = [];


/* ─── chart data ─── */
type ChartPoint = { price: number; volume: number; fullDate: string; shortDate: string };

const CHART_DATA: ChartPoint[] = (() => {
  const prices = [
    0.0046,0.0046,0.0046,0.0044,0.0044,0.0044,0.0044,0.0042,0.0042,0.0042,
    0.0042,0.0042,0.0030,0.0030,0.0031,0.0031,0.0031,0.0031,0.0029,0.0029,
    0.0029,0.0029,0.0049,0.0038,0.0038,0.0038,0.0036,0.0036,0.0036,0.0034,
    0.0034,0.0034,0.0034,0.0032,0.0032,0.0032,0.0030,0.0030,0.0030,0.0030,
    0.0028,0.0028,0.0028,0.0028,0.0026,0.0026,0.0026,0.0024,0.0024,0.0024,
    0.0024,0.0016,0.0016,0.0018,0.0017,0.0017,0.0017,0.0015,0.0015,0.0015,
  ];
  const volumes = [
    85000,42000,310000,58000,195000,38000,260000,72000,180000,95000,
    140000,390000,55000,220000,78000,310000,65000,175000,420000,48000,
    295000,88000,510000,165000,72000,240000,55000,195000,330000,68000,
    155000,42000,280000,110000,62000,200000,345000,52000,175000,260000,
    82000,190000,310000,48000,225000,95000,170000,350000,65000,130000,
    240000,430000,58000,295000,82000,165000,410000,52000,200000,145000,
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

/* Straight line path */
function makeSmoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    d += ` L${pts[i].x.toFixed(1)},${pts[i].y.toFixed(1)}`;
  }
  return d;
}

/* ─── interactive price chart (Figma: chart ver=02-hover) ─── */
function PriceChart({
  ticker,
  timeRange,
  setTimeRange,
  chartType,
  setChartType,
}: {
  ticker: string;
  timeRange: string;
  setTimeRange: (v: string) => void;
  chartType: string;
  setChartType: (v: string) => void;
}) {
  const [hover, setHover] = useState<{ dataIdx: number } | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [isDragging, setIsDragging] = useState(false);
  const graphRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startOffset: number } | null>(null);

  /* window size per time range */
  const WINDOW_MAP: Record<string, number> = { '1d': 10, '7d': 20, '30d': 40 };
  const windowSize = WINDOW_MAP[timeRange] ?? CHART_DATA.length;
  const maxOffset = Math.max(0, CHART_DATA.length - windowSize);

  const [viewOffset, setViewOffset] = useState(() => maxOffset);

  useEffect(() => {
    setViewOffset(Math.max(0, CHART_DATA.length - windowSize));
  }, [timeRange, windowSize]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function onGlobalMouseUp() {
      if (dragRef.current) { dragRef.current = null; setIsDragging(false); }
    }
    window.addEventListener('mouseup', onGlobalMouseUp);
    return () => window.removeEventListener('mouseup', onGlobalMouseUp);
  }, []);

  const clampedOffset = Math.min(Math.max(0, viewOffset), maxOffset);
  const data = CHART_DATA.slice(clampedOffset, clampedOffset + windowSize);

  /* SVG viewport */
  const W = 820; const PH = 300; const VH = 100;

  /* Fixed Y scale — Figma right axis: 0.0050, 0.0040, 0.0030, 0.0020, 0.0010
     YPAD=38 aligns gridlines with space-between label centers (32px padding + 6px half-item-height) */
  const minP = 0.0010;
  const maxP = 0.0050;
  const YPAD = 38;
  const toX = (i: number) => (i / (data.length - 1)) * W;
  const toY = (v: number) => (PH - YPAD) - ((v - minP) / (maxP - minP)) * (PH - YPAD * 2);

  const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.price) }));
  const linePath = makeSmoothPath(pts);
  const areaPath = `${linePath} L${W},${PH} L0,${PH} Z`;

  const lastIdx  = data.length - 1;
  const lastPrice = data[lastIdx].price;
  const lastY     = toY(lastPrice);
  const lastChange = (lastPrice - data[0].price) / data[0].price * 100;

  /* Fixed Y-axis ticks (Figma: layout_0F2LFP — 0.0050 → 0.0010 in 0.001 steps) */
  const yTicks = [0.0050, 0.0040, 0.0030, 0.0020, 0.0010].map(v => ({
    label: v.toFixed(4), ySvg: toY(v),
  }));

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

  /* last-price + hover pill top% — use same toY() as SVG so pills align with chart line */
  const lastPillTop = `${(toY(lastPrice) / PH) * 100}%`;
  const hoverPillTop = hoverPt ? `${(toY(hoverPt.price) / PH) * 100}%` : null;

  const TOOLTIP_W = 192;

  function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    dragRef.current = { startX: e.clientX, startOffset: clampedOffset };
    setIsDragging(true);
    setHover(null);
  }
  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (dragRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pxPerPoint = rect.width / windowSize;
      const deltaIdx = Math.round(-(e.clientX - dragRef.current.startX) / pxPerPoint);
      setViewOffset(Math.min(Math.max(0, dragRef.current.startOffset + deltaIdx), maxOffset));
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const idx = Math.min(Math.max(Math.round((relX / rect.width) * (data.length - 1)), 0), data.length - 1);
    setHover({ dataIdx: idx });
  }
  function onMouseLeave() { setHover(null); }

  return (
    <div onMouseLeave={onMouseLeave} style={{ userSelect: 'none' }}>

      {/* ── Time bar (1d/7d/30d, Price/FDV, Time) ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '8px 16px 8px 8px', borderBottom: '1px solid #1B1B1C',
      }}>
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
        <div style={{ width: 1, alignSelf: 'stretch', background: '#1B1B1C', flexShrink: 0 }} />
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: '#7A7A83' }}>Time</span>
          <span style={{ fontSize: 12, color: '#F9F9FA' }}>{hoverPt ? hoverPt.fullDate : (() => {
            const dd = String(now.getDate()).padStart(2, '0');
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const yyyy = now.getFullYear();
            const h = now.getHours();
            const min = String(now.getMinutes()).padStart(2, '0');
            const sec = String(now.getSeconds()).padStart(2, '0');
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            return `${dd}/${mm}/${yyyy}, ${h12}:${min}:${sec} ${ampm}`;
          })()}</span>
        </div>
      </div>

      {/* ── Price chart-info row ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1B1B1C' }}>

        {/* Left Y-axis: "Price" label only (Figma: layout_914BGF — narrow, centered label) */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 40, flexShrink: 0, borderRight: '1px solid #1B1B1C', height: PH,
        }}>
          <span style={{ fontSize: 10, color: '#7A7A83', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Price</span>
        </div>

        {/* Chart graph — fills remaining width */}
        <div ref={graphRef} onMouseDown={onMouseDown} onMouseMove={onMouseMove}
          style={{ flex: 1, position: 'relative', height: PH, cursor: isDragging ? 'grabbing' : (maxOffset > 0 ? 'grab' : 'default') }}>
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

          {/* Last Price overlay — top-left */}
          <div style={{
            position: 'absolute', top: 8, left: 8,
            display: 'flex', flexDirection: 'column', gap: 4, pointerEvents: 'none',
          }}>
            <div style={{ display: 'flex', gap: 4 }}>
              <span style={{ fontSize: 12, color: '#7A7A83' }}>Last Price</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 12, color: '#F9F9FA' }}>${lastPrice.toFixed(4)}</span>
                <span style={{ fontSize: 12, color: lastChange >= 0 ? '#5BD197' : '#FD5E67' }}>
                  {lastChange >= 0 ? '+' : ''}{lastChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Tooltip (Figma: layout_X32J1Z + layout_5CIOC5 — column, center, bg #252527, br:8, w:192) */}
          {hover && hoverPt && hoverXPct !== null && hoverSvgY !== null && (
            (() => {
              const TOOLTIP_H = 100;
              const showBelow = hoverSvgY < TOOLTIP_H + 16;
              const tooltipTop = showBelow ? hoverSvgY + 12 : hoverSvgY - TOOLTIP_H - 8;
              return (
                <div style={{
                  position: 'absolute',
                  left: `clamp(0px, calc(${hoverXPct}% - ${TOOLTIP_W / 2}px), calc(100% - ${TOOLTIP_W}px))`,
                  top: tooltipTop,
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
                </div>
              );
            })()
          )}

          {/* WhalesMarket logo — top-right corner */}
          <img src="/images/logo-whalesmarket.svg" alt="WhalesMarket"
            style={{ position: 'absolute', top: 8, right: 8, height: 20, pointerEvents: 'none' }} />
        </div>

        {/* Right Y-axis — Figma: layout_0F2LFP, padding:32px 16px, space-between, w:68 */}
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: '32px 16px', width: 68, flexShrink: 0, position: 'relative', height: PH,
          borderLeft: '1px solid #1B1B1C',
        }}>
          {yTicks.map((t, i) => (
            <span key={i} style={{ fontSize: 10, color: '#7A7A83' }}>{t.label}</span>
          ))}
          {/* Last-price pill — height:16, centered */}
          <div style={{
            position: 'absolute', left: '50%', top: lastPillTop,
            transform: 'translate(-50%, -50%)',
            background: '#16C284', borderRadius: 4,
            height: 16, display: 'flex', alignItems: 'center',
            padding: '0 4px', whiteSpace: 'nowrap',
          }}>
            <span style={{ fontSize: 10, color: '#F9F9FA', fontWeight: 500, lineHeight: 1 }}>{lastPrice.toFixed(4)}</span>
          </div>
          {/* Hover price pill — height:16, centered */}
          {hoverPt && hoverPillTop && (
            <div style={{
              position: 'absolute', left: '50%', top: hoverPillTop,
              transform: 'translate(-50%, -50%)',
              background: '#2E2E34', borderRadius: 4,
              height: 16, display: 'flex', alignItems: 'center',
              padding: '0 4px', whiteSpace: 'nowrap', pointerEvents: 'none',
            }}>
              <span style={{ fontSize: 10, color: '#F9F9FA', lineHeight: 1 }}>{hoverPt.price.toFixed(4)}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Volume chart-info row (Figma: second chart-info) ── */}
      <div style={{ display: 'flex' }}>
        {/* Left axis: "Volume" label only (Figma: layout_914BGF — narrow, centered label) */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 40, flexShrink: 0, borderRight: '1px solid #1B1B1C', height: VH,
        }}>
          <span style={{ fontSize: 10, color: '#7A7A83', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Volume</span>
        </div>
        {/* Volume bars */}
        <div style={{ flex: 1, height: VH, position: 'relative' }}>
          {/* Total Vol. label — top-left of volume area */}
          <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 4, pointerEvents: 'none', zIndex: 1 }}>
            <span style={{ fontSize: 12, color: '#7A7A83' }}>Total Vol.</span>
            <span style={{ fontSize: 12, color: '#F9F9FA' }}>${fmt(CHART_DATA.reduce((s, d) => s + d.volume * d.price, 0), 1)}</span>
          </div>
          <svg viewBox={`0 0 ${W} ${VH}`} preserveAspectRatio="none"
            style={{ width: '100%', height: '100%', display: 'block' }}>
            {(() => {
              const barStep = W / data.length;
              const barW = Math.max(1, barStep - 1.5);
              return data.map((d, i) => {
                const barH = Math.max(2, (d.volume / maxVol) * (VH - 8));
                const isDown = i > 0 && d.price < data[i - 1].price;
                return (
                  <rect key={i}
                    x={i * barStep + 0.75}
                    y={VH - barH} width={barW} height={barH}
                    fill={isDown ? 'rgba(255,59,70,0.2)' : 'rgba(22,194,132,0.2)'}
                  />
                );
              });
            })()}
            {/* crosshair vertical in volume */}
            {hoverSvgX !== null && (
              <line x1={hoverSvgX} y1="0" x2={hoverSvgX} y2={VH} stroke="#44444B" strokeWidth="1" strokeDasharray="4 4" />
            )}
          </svg>
        </div>
        {/* Right volume axis: scale labels (Figma: layout_0F2LFP — space-between, padding:32px 16px) */}
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: '32px 16px', width: 68, flexShrink: 0, height: VH,
          borderLeft: '1px solid #1B1B1C',
        }}>
          <span style={{ fontSize: 10, color: '#7A7A83' }}>{fmtK(maxVol)}</span>
          <span style={{ fontSize: 10, color: '#7A7A83' }}>{fmtK(Math.round(maxVol / 2))}</span>
        </div>
      </div>

      {/* ── Date labels + hover pill (Figma: layout_SD5MUJ — abs pill #252527 at cursor x) ── */}
      <div style={{ display: 'flex', borderTop: '1px solid #1B1B1C', padding: '6px 0' }}>
        <div style={{ width: 40, flexShrink: 0, borderRight: '1px solid #1B1B1C' }} />
        <div style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'space-between', padding: '0 8px' }}>
          {dateLabels.map((d, i) => (
            <span key={i} style={{ fontSize: 10, color: '#7A7A83' }}>{d.label}</span>
          ))}
          {/* Hover date pill — height:16, centered */}
          {hover && hoverPt && hoverXPct !== null && (
            <div style={{
              position: 'absolute', top: '50%', left: `${hoverXPct}%`,
              transform: 'translate(-50%, -50%)',
              background: '#252527', borderRadius: 4,
              height: 16, display: 'flex', alignItems: 'center',
              padding: '0 4px', pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 10,
            }}>
              <span style={{ fontSize: 10, color: '#F9F9FA', lineHeight: 1 }}>{hoverPt.fullDate}</span>
            </div>
          )}
        </div>
        <div style={{ width: 68, flexShrink: 0 }} />
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
  <svg width="16" height="16" viewBox="11 12 14 12" fill="currentColor">
    <path d="M12.6666 12.3333C12.9152 12.3334 13.1549 12.426 13.3389 12.5931C13.5229 12.7602 13.6381 12.9899 13.662 13.2373L13.6666 13.3333V21.6667H23.3333C23.5901 21.6668 23.837 21.7657 24.0229 21.9429C24.2087 22.1202 24.3193 22.3621 24.3316 22.6186C24.344 22.8751 24.2572 23.1266 24.0892 23.3208C23.9212 23.5151 23.6849 23.6372 23.4293 23.662L23.3333 23.6667H12.6666C12.418 23.6667 12.1784 23.5741 11.9943 23.4069C11.8103 23.2398 11.6952 23.0101 11.6713 22.7627L11.6666 22.6667V13.3333C11.6666 13.0681 11.772 12.8138 11.9595 12.6262C12.1471 12.4387 12.4014 12.3333 12.6666 12.3333ZM23.462 14.212C24.3593 14.212 24.8086 15.2967 24.174 15.9307L20.4613 19.6433C20.3622 19.7424 20.2446 19.821 20.1152 19.8746C19.9858 19.9283 19.8471 19.9558 19.707 19.9558C19.5669 19.9558 19.4281 19.9283 19.2987 19.8746C19.1693 19.821 19.0517 19.7424 18.9526 19.6433L17.35 18.0407L15.7 19.6907C15.6071 19.7835 15.4968 19.8572 15.3755 19.9074C15.2541 19.9576 15.1241 19.9835 14.9927 19.9834C14.8614 19.9834 14.7313 19.9575 14.61 19.9072C14.4887 19.8569 14.3785 19.7832 14.2856 19.6903C14.1928 19.5975 14.1191 19.4872 14.0689 19.3658C14.0187 19.2445 13.9928 19.1144 13.9929 18.9831C13.9929 18.8518 14.0188 18.7217 14.0691 18.6004C14.1194 18.4791 14.1931 18.3689 14.286 18.276L16.596 15.9667C16.796 15.7668 17.0672 15.6545 17.35 15.6545C17.6327 15.6545 17.9039 15.7668 18.104 15.9667L19.7073 17.57L21.1613 16.1153C20.9564 16.0177 20.7909 15.8532 20.6918 15.649C20.5928 15.4448 20.5662 15.2129 20.6164 14.9916C20.6666 14.7702 20.7905 14.5725 20.968 14.431C21.1454 14.2894 21.3657 14.2125 21.5926 14.2127L23.462 14.212Z" />
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
/* Coin/token icon for order book collateral cell */
const COIN_COLORS: Record<string, string> = { USDC: '#2775CA', USDT: '#26A17B', ETH: '#627EEA', BTC: '#F7931A', SOL: '#9945FF' };
const CoinIcon = ({ symbol, size = 16 }: { symbol: string; size?: number }) => {
  const bg = COIN_COLORS[symbol] ?? '#7A7A83';
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: size * 0.45, color: '#fff', fontWeight: 700, lineHeight: 1, userSelect: 'none' }}>{symbol[0]}</span>
    </div>
  );
};
/* Figma: table-heading-sort — 16×16, up/down arrows */
const SortIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 3L5.5 6H10.5L8 3Z" fill="#7A7A83" />
    <path d="M8 13L10.5 10H5.5L8 13Z" fill="#7A7A83" />
  </svg>
);

/* ─── Order book row (Figma: layout_SWFIZ8 — h:44, row, padding:0 8px, br:8, relative) ─── */
interface OrderData { id: string; price: number; amount: number; collateral: number; creatureIcon?: string }
function OrderBookRow({
  order, side, maxCol, isSelected, onSelect, collateralSymbol, chainLogo,
}: {
  order: OrderData;
  side: 'buy' | 'sell';
  maxCol: number;
  isSelected: boolean;
  onSelect: () => void;
  collateralSymbol: string;
  chainLogo?: string;
}) {
  /* sell orders panel → Buy button (green); buy orders panel → Sell button (red) */
  const isSellPanel = side === 'sell';
  /* Figma: fill bar side:sell=red, side:buy=green */
  /* fill bar matches action button color: sell panel=Buy(green), buy panel=Sell(red) */
  const barColor   = isSellPanel ? 'rgba(22,194,132,0.05)' : 'rgba(255,59,70,0.05)';
  const btnBg      = isSellPanel ? 'rgba(22,194,132,0.2)'  : 'rgba(255,59,70,0.2)';
  const btnColor   = isSellPanel ? '#5BD197' : '#FD5E67';
  const btnLabel   = isSellPanel ? 'Buy' : 'Sell';
  const fillPct    = (order.collateral / maxCol) * 100;

  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex', alignItems: 'center', height: 44,
        padding: '0 8px', cursor: 'pointer', borderRadius: 8,
        position: 'relative', overflow: 'hidden',
        background: isSelected ? '#1B1B1C' : 'rgba(255,255,255,0.03)',
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#1B1B1C'; }}
      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
    >
      {/* depth fill — from left (Figma: absolute, left:0) */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${fillPct}%`, background: barColor, pointerEvents: 'none' }} />
      {/* Price — flex:1, fontSize:14, #F9F9FA (Figma: all same color, no side-based coloring) */}
      <span style={{ flex: 1, fontSize: 14, color: '#F9F9FA', position: 'relative', zIndex: 1 }}>
        {order.price.toFixed(4)}
      </span>
      {/* Amount — 96px fixed, K-formatted (e.g. 8.5K) */}
      <span style={{ width: 96, textAlign: 'right', fontSize: 14, color: '#F9F9FA', position: 'relative', zIndex: 1 }}>
        {fmtK(order.amount)}
      </span>
      {/* Collateral — 120px fixed, gap:4, coin icon (Figma: image-slot 16px) */}
      <div style={{ width: 120, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4, position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: 14, color: '#F9F9FA' }}>{order.collateral.toFixed(2)}</span>
        {chainLogo
          ? <img src={chainLogo} alt={collateralSymbol} style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }} />
          : <CoinIcon symbol={collateralSymbol} size={16} />
        }
        {order.creatureIcon && (
          <img src={order.creatureIcon} alt="creature" style={{ width: 16, height: 16, objectFit: 'contain', flexShrink: 0 }} />
        )}
      </div>
      {/* Action — 120px fixed, flex-end (Figma: layout_TR59K6) */}
      <div style={{ width: 120, display: 'flex', justifyContent: 'flex-end', position: 'relative', zIndex: 1 }}>
        <button
          onClick={e => { e.stopPropagation(); onSelect(); }}
          style={{
            width: 52, padding: isSelected ? 6 : '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
            background: isSelected ? (isSellPanel ? '#16C284' : '#FD5E67') : btnBg,
            fontSize: 12, fontWeight: 500,
            color: isSelected ? '#FFFFFF' : btnColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.8'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
        >
          {isSelected ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M4.5 2.5L8.5 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : btnLabel}
        </button>
      </div>
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

  const [selectedOrder, setSelectedOrder]         = useState<OrderData | null>(null);
  const [selectedSide, setSelectedSide]           = useState<'buy' | 'sell' | null>(null);
  const [buyingAmount, setBuyingAmount]           = useState('');
  const [activeTab, setActiveTab]                 = useState<'filled' | 'open'>('filled');
  const [timeRange, setTimeRange]                 = useState('1d');
  const [chartType, setChartType]                 = useState('Price');
  const [showTbaTooltip, setShowTbaTooltip]       = useState(false);
  const [collateral, setCollateral]               = useState('USDC');
  const [fillType, setFillType]                   = useState('All');
  const [orderType, setOrderType]                 = useState('All');
  const [showChart, setShowChart]                 = useState(true);

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

  function selectOrder(order: OrderData, side: 'buy' | 'sell') {
    if (selectedOrder?.id === order.id) { setSelectedOrder(null); setSelectedSide(null); setBuyingAmount(''); }
    else {
      setSelectedOrder(order); setSelectedSide(side);
      setBuyingAmount(order.amount.toLocaleString());
    }
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
        {/* layout_QYPFU4 — row, gap:16, fill */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginTop: 24 }}>

          {/* ═══════════════════════════════════════
              LEFT: market frame (Figma: 37315-160537)
              column, gap:16, padding:16px 0px
              ═══════════════════════════════════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, minWidth: 0, paddingTop: 16 }}>

            {/* ── block-title (Figma: layout_R255GA — row, space-between, center, gap:8) ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              {/* title: column, gap:4 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 18, fontWeight: 500, color: '#F9F9FA' }}>Trading Market</span>
                <a
                  href="https://docs.whales.market/" target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 2, alignSelf: 'flex-start',
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
                {/* icon-only chart button (Figma: layout_U09NN2 — padding:8, active=green #5BD197) */}
                <button
                  onClick={() => setShowChart(v => !v)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 8, borderRadius: 8, cursor: 'pointer',
                    background: '#1B1B1C', border: 'none',
                    color: showChart ? '#5BD197' : '#7A7A83',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#252527'; if (!showChart) e.currentTarget.style.color = '#F9F9FA'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#1B1B1C'; if (!showChart) e.currentTarget.style.color = '#7A7A83'; }}
                >
                  <ChartLineIcon />
                </button>
              </div>
            </div>

            {/* ── chart card (Figma: layout_8CQU2J — column, border:1px #1B1B1C, br:8) ── */}
            {showChart && <div style={{ border: '1px solid #1B1B1C', borderRadius: 8, overflow: 'hidden' }}>
              {/* interactive chart (time bar is inside PriceChart) */}
              <PriceChart
                ticker={market.ticker}
                timeRange={timeRange} setTimeRange={setTimeRange}
                chartType={chartType} setChartType={setChartType}
              />
            </div>}

            {/* ── market-detail: order book (Figma: 37315-161694 — row, gap:16) ── */}
            <div>

              {/* 2-panel row */}
              <div style={{ display: 'flex', gap: 16 }}>

                {/* LEFT PANEL: Sell orders → Buy button (Figma: layout_L7PM55) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
                  {/* Column headers (Figma: table-heading — row, padding:0 8px, cell padding:2px 0) */}
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, padding: '8px 0' }}>
                      <span style={{ fontSize: 12, color: '#7A7A83' }}>Price ($)</span>
                      <SortIcon />
                    </div>
                    <div style={{ width: 96, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, padding: '8px 0' }}>
                      <span style={{ fontSize: 12, color: '#7A7A83' }}>Amount</span>
                      <SortIcon />
                    </div>
                    <div style={{ width: 120, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, padding: '8px 0' }}>
                      <span style={{ fontSize: 12, color: '#7A7A83' }}>Collateral</span>
                      <SortIcon />
                    </div>
                    {/* "All" header hidden per Figma (opacity:0) */}
                    <div style={{ width: 120, opacity: 0 }} />
                  </div>
                  {SELL_ORDERS.map(order => (
                    <OrderBookRow key={order.id} order={order} side="sell" maxCol={maxSell}
                      isSelected={selectedOrder?.id === order.id}
                      onSelect={() => selectOrder(order, 'buy')}
                      collateralSymbol={collateral} chainLogo={market.chainLogo} />
                  ))}
                </div>

                {/* Vertical divider (Figma: 1px #1B1B1C) */}
                <div style={{ width: 1, background: '#1B1B1C', alignSelf: 'stretch', flexShrink: 0 }} />

                {/* RIGHT PANEL: Buy orders → Sell button */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
                  {/* Column headers */}
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, padding: '8px 0' }}>
                      <span style={{ fontSize: 12, color: '#7A7A83' }}>Price ($)</span>
                      <SortIcon />
                    </div>
                    <div style={{ width: 96, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, padding: '8px 0' }}>
                      <span style={{ fontSize: 12, color: '#7A7A83' }}>Amount</span>
                      <SortIcon />
                    </div>
                    <div style={{ width: 120, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, padding: '8px 0' }}>
                      <span style={{ fontSize: 12, color: '#7A7A83' }}>Collateral</span>
                      <SortIcon />
                    </div>
                    {/* "All" header hidden per Figma (opacity:0) */}
                    <div style={{ width: 120, opacity: 0 }} />
                  </div>
                  {BUY_ORDERS.map(order => (
                    <OrderBookRow key={order.id} order={order} side="buy" maxCol={maxBuy}
                      isSelected={selectedOrder?.id === order.id}
                      onSelect={() => selectOrder(order, 'sell')}
                      collateralSymbol={collateral} chainLogo={market.chainLogo} />
                  ))}
                </div>

              </div>
            </div>

            {/* ── recent trades (Figma: 37315-189288 — column, gap:8, padding:16px 0, border-top 4px #1B1B1C) ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 0', borderTop: '4px solid #1B1B1C' }}>

              {/* block-title */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 500, color: '#F9F9FA' }}>Recent Trades</span>
              </div>

              {/* table */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>

                {/* table header (row, padding:0 8px, border-bottom 1px #1B1B1C) */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', borderBottom: '1px solid #1B1B1C' }}>
                  {/* Time — w:120 */}
                  <div style={{ width: 120, padding: '8px 0' }}>
                    <span style={{ fontSize: 12, color: '#7A7A83' }}>Time</span>
                  </div>
                  {/* Side — w:96 */}
                  <div style={{ width: 96, padding: '8px 0' }}>
                    <span style={{ fontSize: 12, color: '#7A7A83' }}>Side</span>
                  </div>
                  {/* Pair — fill */}
                  <div style={{ flex: 1, padding: '8px 0' }}>
                    <span style={{ fontSize: 12, color: '#7A7A83' }}>Pair</span>
                  </div>
                  {/* Price ($) — w:144, right */}
                  <div style={{ width: 144, display: 'flex', justifyContent: 'flex-end', padding: '8px 0' }}>
                    <span style={{ fontSize: 12, color: '#7A7A83' }}>Price ($)</span>
                  </div>
                  {/* Amount — w:144, right */}
                  <div style={{ width: 144, display: 'flex', justifyContent: 'flex-end', padding: '8px 0' }}>
                    <span style={{ fontSize: 12, color: '#7A7A83' }}>Amount</span>
                  </div>
                  {/* Collateral — w:160, right */}
                  <div style={{ width: 160, display: 'flex', justifyContent: 'flex-end', padding: '8px 0' }}>
                    <span style={{ fontSize: 12, color: '#7A7A83' }}>Collateral</span>
                  </div>
                  {/* Tx.ID — w:96, right */}
                  <div style={{ width: 96, display: 'flex', justifyContent: 'flex-end', padding: '8px 0' }}>
                    <span style={{ fontSize: 12, color: '#7A7A83' }}>Tx.ID</span>
                  </div>
                </div>

                {/* rows */}
                {recentTrades.map(t => (
                  <div
                    key={t.id}
                    style={{ display: 'flex', alignItems: 'center', padding: '0 8px', borderBottom: '1px solid #1B1B1C', cursor: 'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#1B1B1C')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >

                    {/* Time — w:120, padding:16px 0, 14px 400 gray */}
                    <div style={{ width: 120, padding: '16px 0', flexShrink: 0 }}>
                      <span style={{ fontSize: 14, color: '#7A7A83' }}>{t.time}</span>
                    </div>

                    {/* Side — w:96, padding:16px 0, 14px 500 + badge */}
                    <div style={{ width: 96, padding: '16px 0', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: t.side === 'buy' ? '#5BD197' : '#FD5E67' }}>
                        {t.side === 'buy' ? 'Buy' : 'Sell'}
                      </span>
                      {t.side === 'buy' && t.badge && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          padding: '4px 8px', borderRadius: 9999,
                          background: t.badge.color, color: '#0A0A0B',
                          fontSize: 10, fontWeight: 500, lineHeight: '1.2em', textTransform: 'uppercase' as const,
                          letterSpacing: '0.02em',
                        }}>{t.badge.initials}</span>
                      )}
                    </div>

                    {/* Pair — fill, coin icon + pair text */}
                    <div style={{ flex: 1, padding: '16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ padding: 2, flexShrink: 0 }}>
                        <img
                          src={t.pairLogo}
                          alt={t.pair}
                          style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }}
                          onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${t.pair.split('/')[0]}&background=252527&color=F9F9FA&size=20`; }}
                        />
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#F9F9FA' }}>{t.pair}</span>
                    </div>

                    {/* Price — w:144, right, 14px 500 white */}
                    <div style={{ width: 144, padding: '16px 0', flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#F9F9FA' }}>{t.price.toFixed(4)}</span>
                    </div>

                    {/* Amount — w:144, right, 14px 500 white */}
                    <div style={{ width: 144, padding: '16px 0', flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#F9F9FA' }}>{fmtK(t.amount)}</span>
                    </div>

                    {/* Collateral — w:160, right, value + collateral logo + whale icon */}
                    <div style={{ width: 160, padding: '16px 0', flexShrink: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#F9F9FA' }}>{fmtK(t.collateral)}</span>
                      <div style={{ padding: 2, flexShrink: 0 }}>
                        <img
                          src={t.collateralLogo}
                          alt="collateral"
                          style={{ width: 16, height: 16, borderRadius: '50%', objectFit: 'cover' }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                      <div style={{ padding: 2, flexShrink: 0 }}>
                        <img
                          src={t.creatureIcon}
                          alt="creature"
                          style={{ width: 16, height: 16, objectFit: 'contain' }}
                        />
                      </div>
                    </div>

                    {/* Tx.ID — w:96, right, small bordered button */}
                    <div style={{ width: 96, padding: '16px 0', flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        style={{
                          padding: 6, border: '1px solid #252527', borderRadius: 6,
                          background: 'transparent', color: '#F9F9FA', flexShrink: 0, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#44444B')}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#252527')}
                        onClick={() => window.open(`https://etherscan.io/tx/${t.txId}`, '_blank')}
                      >
                        <span style={{ padding: 2, display: 'flex' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 6h12v12h-2V9.41L5.41 20 4 18.59 14.59 8H6V6Z" />
                          </svg>
                        </span>
                      </button>
                    </div>

                  </div>
                ))}

              </div>
            </div>

          </div>

          {/* LINE divider (Figma: id:37222:132672 — layout_2I2YPO, stroke_C1E8N2: 1px #1B1B1C, fill height) */}
          <div style={{ width: 1, alignSelf: 'stretch', background: '#1B1B1C', flexShrink: 0 }} />

          {/* ═══════════════════════════════════════
              RIGHT: trade+chart (Figma: 37222-132673)
              column, gap:16, padding:16px 0px
              ═══════════════════════════════════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 384, flexShrink: 0 }}>

            {/* ── trade-panel (Figma: layout_ZRXC7P — column, center, gap:16, pb:24)
                fills: #0A0A0B | strokes: border-bottom 4px #1B1B1C ── */}
            <div style={{
              background: '#0A0A0B',
              borderBottom: '4px solid #1B1B1C',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
              paddingBottom: 24, paddingTop: 16,
            }}>

              {/* block-title (Figma: layout_F5ZHNQ — row, space-between, stretch) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignSelf: 'stretch' }}>
                {/* title (layout_768HL9 — column, center, gap:4, fill) */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, flex: 1 }}>
                  {/* token row: "Buy SKATE" / "Sell SKATE" — label/text-label-lg 18px 500 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: 18, fontWeight: 500,
                      color: selectedSide === 'buy' ? '#5BD197' : selectedSide === 'sell' ? '#FD5E67' : '#F9F9FA',
                    }}>
                      {selectedSide === 'buy' ? 'Buy' : selectedSide === 'sell' ? 'Sell' : 'Trade'} {market.ticker}
                    </span>
                  </div>
                  {/* price row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 12, color: '#7A7A83' }}>Price</span>
                    <span style={{ fontSize: 12, color: '#F9F9FA' }}>{'$' + market.price.toFixed(4)}</span>
                    <span style={{ fontSize: 12, color: market.priceChange24h >= 0 ? '#5BD197' : '#FD5E67' }}>
                      {market.priceChange24h >= 0 ? '+' : ''}{market.priceChange24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* trade-form */}
              {selectedOrder && selectedSide ? (
                /* ── Order selected: Buying/Selling form (Figma: layout_5WLQOA) ── */
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  alignSelf: 'stretch', borderRadius: 10, border: '1px solid #1B1B1C',
                  position: 'relative',
                }}>
                  {/* top form item — Buying section */}
                  <div style={{
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    alignSelf: 'stretch', gap: 8, padding: 16, background: '#1B1B1C',
                    borderRadius: '10px 10px 0 0',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#7A7A83', flex: 1 }}>
                        {selectedSide === 'buy' ? 'Buying' : 'Selling'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        <input
                          type="text"
                          value={buyingAmount}
                          onChange={e => setBuyingAmount(e.target.value)}
                          style={{
                            fontSize: 24, fontWeight: 500, color: '#F9F9FA',
                            background: 'transparent', border: 'none', outline: 'none',
                            padding: 0, margin: 0, width: '100%',
                            caretColor: '#5BD197', fontFamily: 'inherit',
                          }}
                        />
                      </div>
                      {/* currency badge */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '4px 16px 4px 4px', borderRadius: 9999,
                        border: '1px solid #252527',
                      }}>
                        <img
                          src={market.logo}
                          alt="" style={{ width: 20, height: 20, borderRadius: '50%' }}
                          onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${market.ticker}&size=20&background=252527&color=F9F9FA`; }}
                        />
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#F9F9FA' }}>
                          {market.ticker}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* swap icon (Figma: absolute, centered between sections) */}
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 28, height: 28, borderRadius: 9999,
                    background: '#1B1B1C', border: '1px solid #0A0A0B',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 2,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3V13M8 13L4.5 9.5M8 13L11.5 9.5" stroke="#F9F9FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  {/* bottom form item — Selling section (non-interactive, no bg) */}
                  <div style={{
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    alignSelf: 'stretch', gap: 8, padding: 16,
                    borderRadius: '0 0 10px 10px',
                    cursor: 'not-allowed', userSelect: 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#7A7A83', flex: 1 }}>
                        {selectedSide === 'buy' ? 'Selling' : 'Buying'}
                      </span>
                      <span style={{ fontSize: 12, color: '#7A7A83' }}>
                        Balance: 18.32 SOL
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        <span style={{ fontSize: 24, fontWeight: 500, color: '#F9F9FA' }}>
                          {selectedOrder.collateral.toFixed(2)}
                        </span>
                      </div>
                      {/* currency badge */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '4px 16px 4px 4px', borderRadius: 9999,
                        border: '1px solid #252527',
                      }}>
                        <img
                          src="/images/logo-sol.png"
                          alt="" style={{ width: 20, height: 20, borderRadius: '50%' }}
                          onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=SOL&size=20&background=252527&color=F9F9FA`; }}
                        />
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#F9F9FA' }}>
                          SOL
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Empty state: mascot ── */
                <div style={{
                  display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                  alignSelf: 'stretch', padding: 32, height: 216,
                  border: '1px solid #1B1B1C', borderRadius: 10, gap: 12,
                }}>
                  <img src={mascotWhale} alt="Whales mascot" style={{ width: 96, height: 96, objectFit: 'contain' }} />
                  <p style={{ fontSize: 12, color: '#7A7A83', textAlign: 'center', margin: 0, lineHeight: '1.6' }}>
                    No order selected yet.<br />Pick one from the list to start trading.
                  </p>
                </div>
              )}

              {/* progress slider (Figma: input-progress-drag, layout_F072NQ) */}
              {selectedOrder && selectedSide && (
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', alignSelf: 'stretch', height: 24 }}>
                  <div style={{ position: 'relative', flex: 1, height: 24 }}>
                    {/* track line — centered vertically */}
                    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, transform: 'translateY(-50%)', background: '#EFEFF1', borderRadius: 1 }} />
                    {/* dot markers — outline with solid bg to mask track */}
                    {[0, 25, 50, 75, 100].map(pct => (
                      <div key={pct} style={{
                        position: 'absolute', top: '50%', left: `${pct}%`,
                        transform: 'translate(-50%, -50%)',
                        width: 12, height: 12,
                        borderRadius: '50%',
                        background: '#0A0A0B',
                        border: '2px solid #EFEFF1',
                        boxSizing: 'border-box',
                        cursor: 'pointer',
                      }} />
                    ))}
                  </div>
                </div>
              )}

              {/* action button (Figma: layout_MOR1WN — row, stretch, gap:8) */}
              <div style={{ display: 'flex', alignSelf: 'stretch', gap: 8 }}>
                <button
                  disabled={!selectedOrder}
                  style={{
                    flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center',
                    gap: 8, padding: '10px 20px', borderRadius: 10, border: 'none',
                    cursor: selectedOrder ? 'pointer' : 'not-allowed',
                    background: selectedOrder
                      ? (selectedSide === 'buy' ? '#16C284' : '#FF3B46')
                      : '#F9F9FA',
                    fontSize: 16, fontWeight: 500,
                    color: selectedOrder ? '#F9F9FA' : '#0A0A0B',
                    opacity: selectedOrder ? 1 : 0.4,
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => { if (selectedOrder) e.currentTarget.style.opacity = '0.88'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = selectedOrder ? '1' : '0.4'; }}
                >
                  {selectedSide === 'buy' ? 'Buy' : selectedSide === 'sell' ? 'Sell' : ('Trade ' + market.ticker)}
                </button>
              </div>

              {/* oder-info-group (Figma: layout_KCNEQI — column, gap:8, fill) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignSelf: 'stretch', gap: 8 }}>
                {[
                  { label: 'Price',          value: selectedOrder ? ('$' + selectedOrder.price.toFixed(4)) : '-' },
                  { label: 'Amount Deliver', value: selectedOrder
                    ? (selectedSide === 'buy'
                      ? selectedOrder.collateral.toFixed(2) + ' SOL'
                      : selectedOrder.amount.toLocaleString() + ' ' + market.ticker)
                    : '-' },
                  { label: 'To be Received', value: selectedOrder
                    ? (selectedSide === 'buy'
                      ? fmtK(selectedOrder.amount) + ' ' + market.ticker
                      : selectedOrder.collateral.toFixed(2) + ' SOL')
                    : '-' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                    <span style={{
                      fontSize: 14, color: '#7A7A83',
                      borderBottom: '1px dashed #2E2E34', paddingBottom: 2,
                    }}>
                      {row.label}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#F9F9FA' }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── my-orders (Figma: 37225-131293 — column, fill, gap:16) ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* tab (Figma: layout_BU1A10 — row, gap:24, h:52, stroke bottom 1px #1B1B1C) */}
              <div style={{ display: 'flex', gap: 24, height: 52, borderBottom: '1px solid #1B1B1C' }}>
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
                        display: 'flex', flexDirection: 'column',
                        justifyContent: 'space-between', alignItems: 'center',
                        padding: 0, background: 'transparent', border: 'none', cursor: 'pointer',
                      }}
                    >
                      {/* top spacer (16×2 transparent) */}
                      <div style={{ width: 16, height: 2 }} />
                      {/* tab-label: row, center, gap:8 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 500, color: active ? '#F9F9FA' : '#7A7A83', whiteSpace: 'nowrap' }}>
                          {tab.label}
                        </span>
                        {/* whales-badge — active: rgba(22,194,132,0.1) + #5BD197 | inactive: #1B1B1C + #B4B4BA */}
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          padding: '4px 8px', borderRadius: 9999,
                          background: active ? 'rgba(22,194,132,0.1)' : '#1B1B1C',
                          color: active ? '#5BD197' : '#B4B4BA',
                          fontSize: 10, fontWeight: 700, lineHeight: 1,
                        }}>
                          {tab.count}
                        </span>
                      </div>
                      {/* bottom active indicator — fill width×2, green when active */}
                      <div style={{ height: 2, alignSelf: 'stretch', background: active ? '#5BD197' : 'transparent' }} />
                    </button>
                  );
                })}
              </div>

              {/* order-list (layout_NQ4FQW — column, fill) */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {currentOrders.length === 0 ? (
                  /* Empty state — layout_ODVNFV: column, center, h:240, padding:24 64, br:10, border:1px #1B1B1C */
                  <div style={{
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    gap: 16, padding: '24px 64px', height: 240,
                    border: '1px solid #1B1B1C', borderRadius: 10,
                  }}>
                    <img src={emptyOrdersIllustration} alt="" style={{ width: 64, height: 64, objectFit: 'contain' }} />
                    <p style={{ fontSize: 12, color: '#7A7A83', textAlign: 'center', margin: 0, lineHeight: '1.33' }}>
                      No order yet. Start trading to see your history here.
                    </p>
                  </div>
                ) : currentOrders.map(order => (
                  /* myorder-item — column, gap:12, padding-bottom:16, border-bottom 1px #1B1B1C */
                  <div key={order.id} style={{
                    display: 'flex', flexDirection: 'column', gap: 12,
                    padding: '16px 0 16px', borderBottom: '1px solid #1B1B1C',
                  }}>

                    {/* Column (layout_WNG2V9 — row, space-between, center, fill) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {/* Row left: side + name + optional position badge */}
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        {/* side — label/text-label-sm 14px 500 */}
                        <span style={{ fontSize: 14, fontWeight: 500, color: order.side === 'buy' ? '#5BD197' : '#FD5E67' }}>
                          {order.side === 'buy' ? 'Buy' : 'Sell'}
                        </span>
                        {/* Name: ticker/collateral — label/text-label-sm 14px 500 gray */}
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#7A7A83' }}>
                          {market.ticker}/{order.collateralSymbol}
                        </span>
                        {/* position badge (whales-badge badge=position) — bg #EAB308, text white, 9999br */}
                        {order.hasPosition && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            padding: '4px 8px', borderRadius: 9999,
                            background: '#EAB308', color: '#fff',
                            fontSize: 10, fontWeight: 700, lineHeight: 1,
                          }}>
                            RS
                          </span>
                        )}
                      </div>
                      {/* timestamp — body/text-body-xs 12px gray */}
                      <span style={{ fontSize: 12, color: '#7A7A83', whiteSpace: 'nowrap' }}>{order.time}</span>
                    </div>

                    {/* Row (layout_KQEAFV — row, align-end, fill, gap:10) */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>

                      {/* Column left (layout_A5RRIW — column, gap:4, fill) */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
                        {/* price row (layout_BB855C — row, center, fill, gap:4) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 12, color: '#7A7A83', whiteSpace: 'nowrap' }}>
                            {order.hasPosition ? 'Your Entry / Original Price' : 'Price'}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 500, color: order.hasPosition ? '#5BD197' : '#F9F9FA' }}>
                            ${order.price.toFixed(4)}
                          </span>
                        </div>
                        {/* amount / collateral row (layout_BB855C — row, center, fill, gap:4) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 12, color: '#7A7A83', whiteSpace: 'nowrap' }}>Amount / Collateral</span>
                          <span style={{ fontSize: 12, fontWeight: 500, color: '#F9F9FA' }}>
                            {fmtK(order.amount)}
                          </span>
                          <span style={{ fontSize: 12, color: '#7A7A83' }}>/</span>
                          <span style={{ fontSize: 12, fontWeight: 500, color: '#F9F9FA' }}>
                            {order.collateral}
                          </span>
                          <span style={{ fontSize: 12, color: '#7A7A83' }}>{order.collateralSymbol}</span>
                        </div>
                      </div>

                      {/* Resell button — only for Buy (Figma: Sell rows have no button)
                          secondary/tonal/sm: padding 6px 12px, br:8, bg rgba(234,179,8,0.1), text #FACC15 12px 500
                          Open orders: Cancel button (red) for both sides */}
                      {activeTab === 'filled' ? (
                        order.side === 'buy' && (
                          <button
                            style={{
                              flexShrink: 0, padding: '6px 12px', borderRadius: 8, border: 'none',
                              cursor: 'pointer', background: 'rgba(234,179,8,0.1)',
                              fontSize: 12, fontWeight: 500, color: '#FACC15', whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(234,179,8,0.18)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(234,179,8,0.1)'; }}
                          >
                            Resell
                          </button>
                        )
                      ) : (
                        <button
                          style={{
                            flexShrink: 0, padding: '6px 12px', borderRadius: 8, border: 'none',
                            cursor: 'pointer', background: 'rgba(253,94,103,0.1)',
                            fontSize: 12, fontWeight: 500, color: '#FD5E67', whiteSpace: 'nowrap',
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
            </div>

          </div>{/* end right col */}

        </div>{/* end grid */}
      </div>
    </div>
  );
}
