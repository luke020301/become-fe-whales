import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { markets, bannerMarkets } from '../mock-data/markets';
import { recentTrades } from '../mock-data/trades';
import type { Market } from '../mock-data/markets';

/* ─────────── helpers ─────────── */
const fmt = (n: number, dec = 2) =>
  n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });

const PctBadge = ({ v }: { v: number }) =>
  v === 0 ? (
    <span className="text-sm" style={{ color: '#7A7A83' }}>—</span>
  ) : (
    <span className="text-sm" style={{ color: v > 0 ? '#5BD197' : '#FD5E67' }}>
      {v > 0 ? '+' : ''}{v.toFixed(2)}%
    </span>
  );

type SortKey = 'price' | 'volume24h' | 'openInterest';
type SortDir = 'asc' | 'desc';
type SortStates = Partial<Record<SortKey, SortDir>>;

/* ─────────── Status badge ─────────── */
function StatusChip({ status }: { status: Market['status'] }) {
  const map = {
    'in-progress':      { label: 'In Progress',      bg: 'rgba(59,130,246,0.1)',  color: '#60A5FA' },
    'settling':         { label: 'Settling',          bg: 'rgba(22,194,132,0.1)', color: '#5BD197' },
    'upcoming-settle':  { label: 'Upcoming Settle',   bg: 'rgba(234,179,8,0.1)',  color: '#FACC15' },
  };
  const s = map[status];
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

/* ─────────── Market Table ─────────── */
function MarketTable({
  title,
  data,
  showSearch = false,
}: {
  title: string;
  data: Market[];
  showSearch?: boolean;
}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  // Multi-column sort: each column can independently be asc/desc/off
  const [sortStates, setSortStates] = useState<SortStates>({ volume24h: 'desc' });
  const [activeTab, setActiveTab] = useState<'live' | 'ended'>('live');

  const filtered = useMemo(() => {
    let d = data.filter(
      (m) =>
        m.ticker.toLowerCase().includes(search.toLowerCase()) ||
        m.name.toLowerCase().includes(search.toLowerCase()),
    );
    // Sort by all active columns in fixed priority order: price → volume24h → openInterest
    const priority: SortKey[] = ['price', 'volume24h', 'openInterest'];
    d = [...d].sort((a, b) => {
      for (const key of priority) {
        const dir = sortStates[key];
        if (!dir) continue;
        const diff = a[key] - b[key];
        if (diff !== 0) return dir === 'desc' ? -diff : diff;
      }
      return 0;
    });
    return d;
  }, [data, search, sortStates]);

  // Cycle: off → desc → asc → off
  const handleSort = (key: SortKey) => {
    setSortStates((prev) => {
      const cur = prev[key];
      if (!cur) return { ...prev, [key]: 'desc' };
      if (cur === 'desc') return { ...prev, [key]: 'asc' };
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    const dir = sortStates[k];
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M6 2 L9 6 L3 6 Z" fill={dir === 'asc' ? '#F9F9FA' : '#44444B'} />
        <path d="M6 10 L3 6 L9 6 Z" fill={dir === 'desc' ? '#F9F9FA' : '#44444B'} />
      </svg>
    );
  };

  const colHead = 'text-xs font-medium py-2 select-none cursor-pointer transition-colors';

  return (
    <section className="flex flex-col gap-4 p-4" style={{ background: '#0A0A0B' }}>
      {/* Block title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('live')}
            className="text-2xl font-medium transition-colors"
            style={{ color: activeTab === 'live' ? '#F9F9FA' : '#7A7A83' }}
          >
            {title}
          </button>
          <button
            onClick={() => setActiveTab('ended')}
            className="text-2xl font-medium transition-colors"
            style={{ color: activeTab === 'ended' ? '#F9F9FA' : '#7A7A83' }}
          >
            Ended
          </button>
        </div>

        {showSearch && (
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex items-center gap-2 px-2 py-2 rounded-lg" style={{ background: '#1B1B1C', width: 288 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A7A83" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="bg-transparent outline-none flex-1 text-sm"
                style={{ color: '#F9F9FA' }}
              />
            </div>
            {/* Network filter */}
            <button
              className="flex items-center gap-1.5 px-2 py-2 rounded-lg border text-sm font-medium transition-colors"
              style={{ borderColor: '#252527', color: '#F9F9FA' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#44444B')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#252527')}
            >
              {/* filter_2_fill — 24×24 Figma component; inner group is 19×15 at offset(2.5,4.5).
                  Rendered at 13×10 to match how it looks inside the 16×16 icon slot in Figma. */}
              <img
                src="/images/icon-filter2-fill.svg"
                alt=""
                style={{ width: 13, height: 10, flexShrink: 0, filter: 'brightness(0) invert(1)' }}
              />
              Network
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3.53 5.47a.75.75 0 0 0-1.06 1.06l5 5a.75.75 0 0 0 1.06 0l5-5a.75.75 0 0 0-1.06-1.06L8 9.94 3.53 5.47Z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="w-full">
        {/* Thead */}
        <div className="flex items-center px-2" style={{ borderBottom: '1px solid #1B1B1C' }}>
          <div className={`${colHead} flex-1`} style={{ color: '#7A7A83' }}>Token</div>
          {(
            [
              { key: 'price',        label: 'Last Price ($)' },
              { key: 'volume24h',    label: '24h Vol. ($)' },
              { key: 'openInterest', label: 'Total Vol. ($)' },
            ] as { key: SortKey; label: string }[]
          ).map(({ key, label }) => (
            <div
              key={key}
              className={`${colHead} flex items-center justify-end gap-1`}
              style={{ width: 192, color: sortStates[key] ? '#F9F9FA' : '#7A7A83' }}
              onClick={() => handleSort(key)}
            >
              {label} <SortIcon k={key} />
            </div>
          ))}
          <div className={`${colHead} text-right`} style={{ width: 192, color: '#7A7A83', borderBottom: '1px dashed #2E2E34' }}>
            Settle Starts (UTC)
          </div>
          <div className={`${colHead} text-right`} style={{ width: 192, color: '#7A7A83', borderBottom: '1px dashed #2E2E34' }}>
            Settle Ends (UTC)
          </div>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm" style={{ color: '#44444B' }}>
            No markets found
          </div>
        ) : (
          filtered.map((m) => (
            <div
              key={m.id}
              className="flex items-center px-2 cursor-pointer transition-colors"
              style={{ borderBottom: '1px solid #1B1B1C' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#1B1B1C')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              onClick={() => navigate(`/market/${m.id}`)}
            >
              {/* Token */}
              <div className="flex-1 flex items-center gap-3 py-4">
                {/* image-slot: padding:4px container, token 36×36 circle, chain badge at (0,28) */}
                <div style={{ position: 'relative', display: 'inline-flex', padding: 4, flexShrink: 0 }}>
                  <img src={m.logo} alt={m.ticker}
                    style={{ width: 36, height: 36, borderRadius: '9999px', objectFit: 'cover' }}
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${m.ticker}&background=252527&color=F9F9FA&size=36`; }}
                  />
                  <img src={m.chainLogo} alt="chain"
                    style={{ position: 'absolute', left: 0, top: 28, width: 16, height: 16, borderRadius: '50%', border: '1.5px solid #0A0A0B', objectFit: 'cover' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium" style={{ color: '#F9F9FA' }}>{m.ticker}</span>
                  <span className="text-sm" style={{ color: '#7A7A83' }}>{m.name}</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex flex-col items-end gap-1 py-3" style={{ width: 192 }}>
                <span className="text-sm font-medium" style={{ color: '#F9F9FA' }}>${fmt(m.price, m.price < 1 ? 4 : 2)}</span>
                <PctBadge v={m.priceChange24h} />
              </div>

              {/* Volume */}
              <div className="flex flex-col items-end gap-1 py-3" style={{ width: 192 }}>
                <span className="text-sm font-medium" style={{ color: '#F9F9FA' }}>${fmt(m.volume24h)}</span>
                <PctBadge v={m.volumeChange24h} />
              </div>

              {/* OI */}
              <div className="flex flex-col items-end gap-1 py-3" style={{ width: 192 }}>
                <span className="text-sm font-medium" style={{ color: '#F9F9FA' }}>${fmt(m.openInterest)}</span>
                <PctBadge v={m.openInterestChange24h} />
              </div>

              {/* Settle Starts */}
              <div className="flex flex-col items-end gap-0.5 py-3" style={{ width: 192 }}>
                {m.settlementDate ? (
                  <>
                    <span className="text-sm font-medium" style={{ color: '#F9F9FA' }}>{m.settlementDate}</span>
                    <span className="text-sm" style={{ color: '#7A7A83' }}>{m.settlementTime}</span>
                  </>
                ) : (
                  <span className="text-sm" style={{ color: '#7A7A83' }}>TBA</span>
                )}
              </div>

              {/* Settle Ends */}
              <div className="flex flex-col items-end gap-0.5 py-3" style={{ width: 192 }}>
                {m.listingDate ? (
                  <>
                    <span className="text-sm font-medium" style={{ color: '#F9F9FA' }}>{m.listingDate}</span>
                    <span className="text-sm" style={{ color: '#7A7A83' }}>{m.listingTime}</span>
                  </>
                ) : (
                  <span className="text-sm" style={{ color: '#7A7A83' }}>TBA</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

/* ─────────── Recent Trades Table ─────────── */
function RecentTradesTable() {
  return (
    <section className="flex flex-col gap-4 p-4" style={{ background: '#0A0A0B' }}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium" style={{ color: '#F9F9FA' }}>Recent Trades</h2>
      </div>

      <div className="w-full">
        <div className="flex items-center px-2" style={{ borderBottom: '1px solid #1B1B1C' }}>
          <div className="flex-1 text-xs font-medium py-2" style={{ color: '#7A7A83' }}>Market</div>
          <div className="text-xs font-medium py-2 text-right" style={{ width: 128, color: '#7A7A83' }}>Type</div>
          <div className="text-xs font-medium py-2 text-right" style={{ width: 192, color: '#7A7A83' }}>Price</div>
          <div className="text-xs font-medium py-2 text-right" style={{ width: 192, color: '#7A7A83' }}>Amount</div>
          <div className="text-xs font-medium py-2 text-right" style={{ width: 192, color: '#7A7A83' }}>Total</div>
          <div className="text-xs font-medium py-2 text-right" style={{ width: 192, color: '#7A7A83' }}>Time</div>
        </div>

        {recentTrades.map((t) => (
          <div
            key={t.id}
            className="flex items-center px-2 cursor-pointer transition-colors"
            style={{ borderBottom: '1px solid #1B1B1C' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1B1B1C')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div className="flex-1 flex items-center gap-3 py-4">
              <div className="relative">
                <img src={t.logo} alt={t.ticker}
                  className="w-9 h-9 rounded-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${t.ticker}&background=252527&color=F9F9FA&size=36`; }}
                />
                <img src={t.chainLogo} alt="chain"
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 object-cover"
                  style={{ borderColor: '#0A0A0B' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium" style={{ color: '#F9F9FA' }}>{t.ticker}</span>
                <span className="text-sm" style={{ color: '#7A7A83' }}>{t.name}</span>
              </div>
            </div>
            <div className="text-right py-3" style={{ width: 128 }}>
              <span
                className="text-sm font-medium px-2 py-0.5 rounded"
                style={{
                  color: t.type === 'buy' ? '#5BD197' : '#FD5E67',
                  background: t.type === 'buy' ? 'rgba(22,194,132,0.1)' : 'rgba(253,94,103,0.1)',
                }}
              >
                {t.type === 'buy' ? 'Buy' : 'Sell'}
              </span>
            </div>
            <div className="text-right py-3" style={{ width: 192 }}>
              <span className="text-sm font-medium" style={{ color: '#F9F9FA' }}>${fmt(t.price, 4)}</span>
            </div>
            <div className="text-right py-3" style={{ width: 192 }}>
              <span className="text-sm font-medium" style={{ color: '#F9F9FA' }}>{fmt(t.amount, 0)}</span>
            </div>
            <div className="text-right py-3" style={{ width: 192 }}>
              <span className="text-sm font-medium" style={{ color: '#F9F9FA' }}>${fmt(t.total)}</span>
            </div>
            <div className="text-right py-3" style={{ width: 192 }}>
              <span className="text-sm" style={{ color: '#7A7A83' }}>{t.time}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────── Main Banner ─────────── */
function MainBanner() {
  const [idx, setIdx] = useState(0);
  const item = bannerMarkets[idx];

  return (
    <div className="flex-1 min-w-0" style={{ borderRadius: 10 }}>
      {/* banner frame: 928x398 (fills available width), bg #0A0A0B, radius 12 */}
      <div
        className="relative overflow-hidden"
        style={{ borderRadius: 12, height: 398, background: '#0A0A0B' }}
      >
        {/* BG image — fills frame, object-cover, centered */}
        <img
          src={item.bgImage}
          alt={item.ticker}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center center' }}
        />

        {/* Gradient mask overlay — darkens left side */}
        <div className="absolute inset-0" style={{ background: item.bgGradient }} />

        {/* banner-content: absolute, x:0 y:0, w:384 h:398, flex-col, justify-end, gap:24, padding:32 */}
        <div
          className="absolute flex flex-col justify-end"
          style={{ left: 0, top: 0, width: 384, height: 398, padding: 32, gap: 24 }}
        >
          {/* market-info: flex-col, gap:16 */}
          <div className="flex flex-col" style={{ gap: 16 }}>
            {/* image-slot: composite from Figma (token logo + chain badge) */}
            {'iconSlot' in item && item.iconSlot ? (
              <img
                src={(item as typeof item & { iconSlot: string }).iconSlot}
                alt={item.ticker}
                style={{ width: 50, height: 50, maxWidth: 'none', flexShrink: 0 }}
              />
            ) : (
              <div className="relative" style={{ padding: 2, display: 'inline-flex' }}>
                <img
                  src={item.logo}
                  alt={item.ticker}
                  style={{
                    width: 44, height: 44,
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.1)',
                    maxWidth: 'none', flexShrink: 0,
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      `https://ui-avatars.com/api/?name=${item.ticker}&background=252527&color=F9F9FA&size=44`;
                  }}
                />
                <img
                  src={item.chainLogo}
                  alt="chain"
                  style={{
                    position: 'absolute',
                    left: 0, top: 32,
                    width: 16, height: 16,
                    borderRadius: '50%',
                    border: '2px solid #0A0A0B',
                    maxWidth: 'none', flexShrink: 0,
                  }}
                />
              </div>
            )}

            {/* content: flex-col, gap:8 */}
            <div className="flex flex-col" style={{ gap: 8 }}>
              {/* Title: display/text-display-md — Inter 500, 36px, lh 1.222, #F9F9FA */}
              <p
                style={{
                  fontFamily: 'Inter Variable, sans-serif',
                  fontWeight: 500,
                  fontSize: 36,
                  lineHeight: '1.2222em',
                  color: '#F9F9FA',
                  whiteSpace: 'pre-line',
                  margin: 0,
                }}
              >
                {item.title}
              </p>

              {/* Description: body/text-body-md — Inter 400, 16px, lh 1.5, rgba(255,255,255,0.6) */}
              <p
                style={{
                  fontFamily: 'Inter Variable, sans-serif',
                  fontWeight: 400,
                  fontSize: 16,
                  lineHeight: '1.5em',
                  color: 'rgba(255,255,255,0.6)',
                  margin: 0,
                }}
              >
                {item.description}
              </p>
            </div>
          </div>

          {/* Button: "Trade $TICKER" — bg #16C284, padding 10px 10px 10px 20px, gap 8, radius 10 */}
          <button
            className="flex items-center w-fit rounded-[10px] transition-opacity"
            style={{ background: '#16C284', color: '#F9F9FA', padding: '10px 10px 10px 20px', gap: 8 }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <span style={{ fontFamily: 'Inter Variable, sans-serif', fontWeight: 500, fontSize: 16, lineHeight: '24px' }}>
              Trade ${item.ticker}
            </span>
            {/* icon-trailing: arrow_right_line 20x20, padding 2 */}
            <span className="flex items-center" style={{ padding: 2 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17 17 7M7 7h10v10" />
              </svg>
            </span>
          </button>
        </div>

        {/* Prev/Next buttons: absolute at bottom-right (x:810 y:326) */}
        <div
          className="absolute flex items-center"
          style={{ left: 810, top: 326, gap: 8 }}
        >
          <button
            onClick={() => setIdx((idx - 1 + bannerMarkets.length) % bannerMarkets.length)}
            className="flex items-center justify-center rounded-full transition-colors"
            style={{ width: 40, height: 40, background: 'rgba(0,0,0,0.6)', color: '#fff' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.8)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.6)')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={() => setIdx((idx + 1) % bannerMarkets.length)}
            className="flex items-center justify-center rounded-full transition-colors"
            style={{ width: 40, height: 40, background: 'rgba(0,0,0,0.6)', color: '#fff' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.8)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.6)')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}

/* ─────────── Sub Banner ─────────── */
function SubBanner() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: 400,
        height: 400,
        background: '#010D1D',
        borderRadius: 12,
        flexShrink: 0,
      }}
    >
      {/* Background image */}
      <img
        src="/images/banner-bg-sub.png"
        alt=""
        style={{ position: 'absolute', width: 528, height: 400, left: -64, top: 0, maxWidth: 'none', flexShrink: 0 }}
      />
      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, rgba(3,32,81,0) 0%, rgba(3,32,81,1) 80%)' }}
      />
      {/* Content — bottom aligned */}
      <div
        className="absolute flex flex-col items-center gap-6"
        style={{ left: 8, top: 244, width: 384, padding: '0 32px' }}
      >
        <h3
          className="text-center font-medium"
          style={{ color: '#F9F9FA', fontSize: 20, lineHeight: '1.4em' }}
        >
          Stake $WHALES for Rewards and Lower Trading Fees
        </h3>
        <button
          className="flex items-center gap-2 font-medium rounded-[10px] transition-opacity"
          style={{ background: '#F97316', color: '#F9F9FA', padding: '10px 10px 10px 20px' }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Stake Now
          <span className="flex items-center justify-center" style={{ padding: 2 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M7 17 17 7M7 7h10v10" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}

/* ─────────── Bottom Stats ─────────── */
function BottomStats() {
  const stats = [
    { label: 'Total Volume', value: '$2.4B+' },
    { label: 'Markets', value: '120+' },
    { label: 'Total Trades', value: '1.8M+' },
    { label: 'Active Users', value: '48K+' },
    { label: 'Networks', value: '8' },
  ];

  return (
    <div className="flex items-center justify-between px-4" style={{ height: 80, borderTop: '1px solid #1B1B1C' }}>
      <div className="flex items-center gap-8 flex-1">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-0.5">
            <span className="text-xs" style={{ color: '#7A7A83' }}>{s.label}</span>
            <span className="text-base font-semibold" style={{ color: '#F9F9FA' }}>{s.value}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4">
        {['Twitter', 'Discord', 'Telegram', 'Github'].map((s) => (
          <button
            key={s}
            className="text-xs transition-colors"
            style={{ color: '#7A7A83' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#F9F9FA')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#7A7A83')}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────── Page ─────────── */
export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: '#0A0A0B' }}>
      <main className="flex flex-col gap-4 px-8 py-4">
        {/* Banners */}
        <div className="flex gap-4 px-4">
          <MainBanner />
          <SubBanner />
        </div>

        {/* Live Market */}
        <div className="rounded-lg overflow-hidden">
          <MarketTable title="Live Market" data={markets} showSearch />
        </div>

        {/* Recent Trades */}
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #1B1B1C' }}>
          <RecentTradesTable />
        </div>

        {/* Bottom Stats */}
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #1B1B1C' }}>
          <BottomStats />
        </div>
      </main>
    </div>
  );
}
