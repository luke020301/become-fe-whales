import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { markets, bannerMarkets } from '../mock-data/markets';
import { recentTrades } from '../mock-data/trades';
import type { Market } from '../mock-data/markets';

/* ─────────── helpers ─────────── */
const fmt = (n: number, dec = 2) =>
  n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });

const PctBadge = ({ v }: { v: number }) => (
  <span className="text-sm" style={{ color: v > 0 ? '#5BD197' : v < 0 ? '#FD5E67' : '#7A7A83' }}>
    {v > 0 ? '+' : ''}{v.toFixed(2)}%
  </span>
);

/* ─────────── Column Tooltip ─────────── */
const SETTLE_STARTS_TOOLTIP = [
  { label: 'Buyer:', text: ' From this time, the seller can start settling your order.' },
  { label: 'Seller:', text: ' Earliest time you can settle to deliver tokens.' },
];

const SETTLE_ENDS_TOOLTIP = [
  { label: 'Buyer:', text: " After this time, you can cancel the order to claim seller's collateral as compensation." },
  { label: 'Seller:', text: ' Deadline to settle before your collateral is forfeited to the buyer.' },
];

function ColTooltip({ label, items }: { label: string; items: { label: string; text: string }[] }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible && ref.current) {
      const r = ref.current.getBoundingClientRect();
      // Use viewport-relative coords for fixed positioning
      // Clamp so tooltip never overflows viewport edges
      const tooltipHalfW = 130; // ~260/2 maxWidth
      const cx = Math.min(Math.max(r.left + r.width / 2, tooltipHalfW + 8), window.innerWidth - tooltipHalfW - 8);
      setPos({ top: r.top, left: cx });
    }
  }, [visible]);

  const tooltip = visible ? createPortal(
    <div
      style={{
        position: 'fixed',
        top: pos.top - 10,
        left: pos.left,
        transform: 'translate(-50%, -100%)',
        zIndex: 9999,
        width: 'max-content',
        maxWidth: 260,
        background: '#252527',
        borderRadius: 8,
        padding: '8px 12px',
        boxShadow: '0px 0px 8px 0px rgba(0, 0, 0, 0.1)',
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {items.map(({ label: lbl, text }) => (
        <p key={lbl} style={{ margin: 0, fontSize: 12, lineHeight: '1.333em', color: '#F9F9FA' }}>
          <span style={{ fontWeight: 500 }}>{lbl}</span>
          <span style={{ fontWeight: 400 }}>{text}</span>
        </p>
      ))}
      {/* Arrow — 16×8px pointing downward */}
      <svg
        width="16"
        height="8"
        viewBox="0 0 16 8"
        fill="none"
        style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)' }}
      >
        <path d="M0 0 L8 8 L16 0 Z" fill="#252527" />
      </svg>
    </div>,
    document.body
  ) : null;

  return (
    <div
      ref={ref}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span style={{ borderBottom: '1px dashed #2E2E34', paddingBottom: 1, cursor: 'default' }}>
        {label}
      </span>
      {tooltip}
    </div>
  );
}

/* ─────────── Network Dropdown ─────────── */
const NETWORKS = [
  { id: 'all',          label: 'All',          logo: null },
  { id: 'solana',       label: 'Solana',       logo: '/images/chain-badge-solana.png' },
  { id: 'ethereum',     label: 'Ethereum',     logo: '/images/chain-badge-2.png' },
  { id: 'hyperliquid',  label: 'Hyperliquid',  logo: '/images/chain-hyperliquid.png' },
  { id: 'bnb',          label: 'BNB Chain',    logo: '/images/chain-bnb.png' },
];

function NetworkDropdown({
  selected,
  onChange,
}: {
  selected: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const selectedNet = NETWORKS.find((n) => n.id === selected) ?? NETWORKS[0];

  const calcPos = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
    }
  };

  const openDropdown = () => { calcPos(); setOpen(true); };

  // Update position on scroll so dropdown follows button
  useEffect(() => {
    if (!open) return;
    const onScroll = () => calcPos();
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, [open]);

  const dropdown = open ? createPortal(
    <>
      {/* Backdrop */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={() => setOpen(false)} />
      {/* Panel */}
      <div style={{
        position: 'fixed',
        top: pos.top,
        right: pos.right,
        zIndex: 9999,
        width: 192,
        background: '#1B1B1C',
        borderRadius: 10,
        boxShadow: '0px 0px 32px 0px rgba(0, 0, 0, 0.2)',
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}>
        {/* Header */}
        <div style={{ padding: '4px 8px' }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#7A7A83', lineHeight: '1.333em' }}>
            Filter by Network
          </span>
        </div>
        {/* Items */}
        {NETWORKS.map((net) => {
          const isActive = net.id === selected;
          return (
            <button
              key={net.id}
              onClick={() => { onChange(net.id); setOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 8px',
                borderRadius: 8,
                background: isActive ? '#252527' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#252527'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              {/* Chain logo */}
              {net.logo ? (
                <img src={net.logo} alt={net.label} style={{ width: 20, height: 20, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                /* "All" — globe icon */
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="9" stroke="#7A7A83" strokeWidth="1.5" />
                  <path d="M12 3c-2.5 3-4 5.5-4 9s1.5 6 4 9M12 3c2.5 3 4 5.5 4 9s-1.5 6-4 9M3 12h18" stroke="#7A7A83" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
              {/* Label */}
              <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#F9F9FA', lineHeight: '1.429em' }}>
                {net.label}
              </span>
              {/* Checkmark */}
              {isActive && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#5BD197" style={{ flexShrink: 0 }}>
                  <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </>,
    document.body
  ) : null;

  return (
    <>
      <button
        ref={btnRef}
        onClick={openDropdown}
        className="flex items-center gap-1.5 px-2 py-2 rounded-lg border text-sm font-medium transition-colors"
        style={{
          borderColor: open ? '#44444B' : '#252527',
          color: '#F9F9FA',
          background: 'transparent',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#44444B')}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.borderColor = '#252527'; }}
      >
        {selectedNet.logo ? (
          <img src={selectedNet.logo} alt={selectedNet.label} style={{ width: 16, height: 16, borderRadius: 4, objectFit: 'cover' }} />
        ) : (
          <img src="/images/icon-filter2-fill.svg" alt="" style={{ width: 13, height: 10, filter: 'brightness(0) invert(1)' }} />
        )}
        {selectedNet.id === 'all' ? 'Network' : selectedNet.label}
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style={{ transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <path d="M3.53 5.47a.75.75 0 0 0-1.06 1.06l5 5a.75.75 0 0 0 1.06 0l5-5a.75.75 0 0 0-1.06-1.06L8 9.94 3.53 5.47Z" />
        </svg>
      </button>
      {dropdown}
    </>
  );
}

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
  const [networkFilter, setNetworkFilter] = useState('all');
  // Multi-column sort: each column can independently be asc/desc/off
  const [sortStates, setSortStates] = useState<SortStates>({ volume24h: 'desc' });
  const [activeTab, setActiveTab] = useState<'live' | 'ended'>('live');

  const handleTabChange = (tab: 'live' | 'ended') => {
    setActiveTab(tab);
    setSortStates(tab === 'live' ? { volume24h: 'desc' } : {});
    setSearch('');
  };

  // Split by tab first, then filter by search
  const tabData = useMemo(() => {
    if (activeTab === 'ended') return data.filter((m) => m.status === 'ended');
    return data.filter((m) => m.status !== 'ended');
  }, [data, activeTab]);

  const filtered = useMemo(() => {
    const selectedNet = NETWORKS.find((n) => n.id === networkFilter);
    let d = tabData.filter((m) => {
      const matchSearch =
        m.ticker.toLowerCase().includes(search.toLowerCase()) ||
        m.name.toLowerCase().includes(search.toLowerCase());
      const matchNetwork =
        networkFilter === 'all' || (selectedNet?.logo && m.chainLogo === selectedNet.logo);
      return matchSearch && matchNetwork;
    });
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
  }, [tabData, search, sortStates, networkFilter]);

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

  // Shared token cell
  const TokenCell = ({ m }: { m: Market }) => (
    <div className="flex-1 flex items-center gap-3 py-4">
      <div style={{ position: 'relative', display: 'inline-flex', padding: 4, flexShrink: 0 }}>
        <img src={m.logo} alt={m.ticker}
          style={{ width: 36, height: 36, borderRadius: '9999px', objectFit: 'cover' }}
          onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${m.ticker}&background=252527&color=F9F9FA&size=36`; }}
        />
        <img src={m.chainLogo} alt="chain"
          style={{ position: 'absolute', left: 0, top: 28, width: 16, height: 16, borderRadius: 4, border: '1.5px solid #0A0A0B', objectFit: 'cover' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium" style={{ color: '#F9F9FA' }}>{m.ticker}</span>
        <span className="text-sm" style={{ color: '#7A7A83' }}>{m.name}</span>
      </div>
    </div>
  );

  const emptyRow = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      height: 320,
    }}>
      <img src="/images/empty-state-icon.svg" alt="" style={{ width: 64, height: 64 }} />
      <span style={{ fontSize: 12, fontWeight: 400, color: '#7A7A83', lineHeight: '1.333em' }}>
        No market found
      </span>
    </div>
  );

  return (
    <section className="flex flex-col gap-4 p-4" style={{ background: '#0A0A0B' }}>
      {/* Block title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => handleTabChange('live')}
            className="text-2xl font-medium transition-colors"
            style={{ color: activeTab === 'live' ? '#F9F9FA' : '#7A7A83' }}
          >
            {title}
          </button>
          <button
            onClick={() => handleTabChange('ended')}
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
            <NetworkDropdown selected={networkFilter} onChange={setNetworkFilter} />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="w-full">
        {activeTab === 'live' ? (
          <>
            {/* ── Live tab: 6 columns ── */}
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
              <div className={`${colHead} flex items-center justify-end`} style={{ width: 192, color: '#7A7A83' }}>
                <ColTooltip label="Settle Starts (UTC)" items={SETTLE_STARTS_TOOLTIP} />
              </div>
              <div className={`${colHead} flex items-center justify-end`} style={{ width: 192, color: '#7A7A83' }}>
                <ColTooltip label="Settle Ends (UTC)" items={SETTLE_ENDS_TOOLTIP} />
              </div>
            </div>

            {filtered.length === 0 ? emptyRow : filtered.map((m) => (
              <div
                key={m.id}
                className="flex items-center px-2 cursor-pointer transition-colors"
                style={{ borderBottom: '1px solid #1B1B1C' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#1B1B1C')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                onClick={() => navigate(`/market/${m.id}`)}
              >
                <TokenCell m={m} />
                <div className="flex flex-col items-end gap-1 py-3" style={{ width: 192 }}>
                  <span className="text-sm font-medium" style={{ color: '#F9F9FA' }}>${fmt(m.price, m.price < 1 ? 4 : 2)}</span>
                  <PctBadge v={m.priceChange24h} />
                </div>
                <div className="flex flex-col items-end gap-1 py-3" style={{ width: 192 }}>
                  <span className="text-sm font-medium" style={{ color: '#F9F9FA' }}>${fmt(m.volume24h)}</span>
                  <PctBadge v={m.volumeChange24h} />
                </div>
                <div className="flex flex-col items-end gap-1 py-3" style={{ width: 192 }}>
                  <span className="text-sm font-medium" style={{ color: '#F9F9FA' }}>${fmt(m.openInterest)}</span>
                  <PctBadge v={m.openInterestChange24h} />
                </div>
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
            ))}
          </>
        ) : (
          <>
            {/* ── Ended tab: 5 columns — no 24h Vol, no PctBadge ── */}
            <div className="flex items-center px-2" style={{ borderBottom: '1px solid #1B1B1C' }}>
              <div className={`${colHead} flex-1`} style={{ color: '#7A7A83' }}>Token</div>
              {(
                [
                  { key: 'price',        label: 'Price ($)' },
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
              <div className={`${colHead} flex items-center justify-end`} style={{ width: 192, color: '#7A7A83' }}>
                <ColTooltip label="Settle Starts (UTC)" items={SETTLE_STARTS_TOOLTIP} />
              </div>
              <div className={`${colHead} flex items-center justify-end`} style={{ width: 192, color: '#7A7A83' }}>
                <ColTooltip label="Settle Ends (UTC)" items={SETTLE_ENDS_TOOLTIP} />
              </div>
            </div>

            {filtered.length === 0 ? emptyRow : filtered.map((m) => (
              <div
                key={m.id}
                className="flex items-center px-2 cursor-pointer transition-colors"
                style={{ borderBottom: '1px solid #1B1B1C' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#1B1B1C')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                onClick={() => navigate(`/market/${m.id}`)}
              >
                <TokenCell m={m} />
                {/* Price — plain value, no percentage */}
                <div className="flex flex-col items-end py-3" style={{ width: 192 }}>
                  <span className="text-sm font-medium" style={{ color: '#F9F9FA' }}>${fmt(m.price, m.price < 1 ? 4 : 2)}</span>
                </div>
                {/* Total Vol — plain value, no percentage */}
                <div className="flex flex-col items-end py-3" style={{ width: 192 }}>
                  <span className="text-sm font-medium" style={{ color: '#F9F9FA' }}>${fmt(m.openInterest)}</span>
                </div>
                {/* Settle Starts — date only */}
                <div className="flex flex-col items-end py-3" style={{ width: 192 }}>
                  {m.settlementDate ? (
                    <span className="text-sm font-medium" style={{ color: '#F9F9FA' }}>{m.settlementDate}</span>
                  ) : (
                    <span className="text-sm" style={{ color: '#7A7A83' }}>TBA</span>
                  )}
                </div>
                {/* Settle Ends — date only */}
                <div className="flex flex-col items-end py-3" style={{ width: 192 }}>
                  {m.listingDate ? (
                    <span className="text-sm font-medium" style={{ color: '#F9F9FA' }}>{m.listingDate}</span>
                  ) : (
                    <span className="text-sm" style={{ color: '#7A7A83' }}>TBA</span>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  );
}

/* ─────────── Recent Trades Table ─────────── */
// Format number with K suffix (e.g. 3640 → "3.64K")
const fmtK = (n: number) => {
  if (n >= 1000) return (n / 1000).toFixed(2) + 'K';
  return n.toFixed(2);
};

function RecentTradesTable() {
  const colHead = 'text-xs font-medium py-2';

  return (
    <section className="flex flex-col gap-4 p-4" style={{ background: '#0A0A0B' }}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium" style={{ color: '#F9F9FA' }}>Recent Trades</h2>
      </div>

      <div className="w-full">
        {/* Thead: Time(128) | Side(128) | Pair(fill) | Price($)(192) | Amount(192) | Collateral(192) | Tx.ID(192) */}
        <div className="flex items-center px-2" style={{ borderBottom: '1px solid #1B1B1C' }}>
          <div className={colHead} style={{ width: 128, color: '#7A7A83' }}>Time</div>
          <div className={colHead} style={{ width: 128, color: '#7A7A83' }}>Side</div>
          <div className={`${colHead} flex-1`} style={{ color: '#7A7A83' }}>Pair</div>
          <div className={`${colHead} text-right`} style={{ width: 192, color: '#7A7A83' }}>Price ($)</div>
          <div className={`${colHead} text-right`} style={{ width: 192, color: '#7A7A83' }}>Amount</div>
          <div className={`${colHead} text-right`} style={{ width: 192, color: '#7A7A83' }}>Collateral</div>
          <div className={`${colHead} text-right`} style={{ width: 192, color: '#7A7A83' }}>Tx.ID</div>
        </div>

        {recentTrades.map((t) => (
          <div
            key={t.id}
            className="flex items-center px-2 cursor-pointer transition-colors"
            style={{ borderBottom: '1px solid #1B1B1C' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1B1B1C')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            {/* Time */}
            <div style={{ width: 128, padding: '16px 0', flexShrink: 0 }}>
              <span className="text-sm" style={{ color: '#7A7A83' }}>{t.time}</span>
            </div>

            {/* Side */}
            <div style={{ width: 128, padding: '16px 0', flexShrink: 0 }}>
              <span className="text-sm font-medium"
                style={{ color: t.side === 'buy' ? '#5BD197' : '#FD5E67' }}>
                {t.side === 'buy' ? 'Buy' : 'Sell'}
              </span>
            </div>

            {/* Pair — token icon + "SYMBOL/QUOTE" */}
            <div className="flex-1 flex items-center gap-2 py-4">
              <div style={{ padding: 2, flexShrink: 0 }}>
                <img
                  src={t.pairLogo}
                  alt={t.pair}
                  style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      `https://ui-avatars.com/api/?name=${t.pair.split('/')[0]}&background=252527&color=F9F9FA&size=20`;
                  }}
                />
              </div>
              <span className="text-sm font-medium" style={{ color: '#F9F9FA' }}>{t.pair}</span>
            </div>

            {/* Price ($) */}
            <div className="flex justify-end py-4" style={{ width: 192, flexShrink: 0 }}>
              <span className="text-sm font-medium" style={{ color: '#F9F9FA' }}>
                {t.price.toFixed(4)}
              </span>
            </div>

            {/* Amount */}
            <div className="flex justify-end py-4" style={{ width: 192, flexShrink: 0 }}>
              <span className="text-sm font-medium" style={{ color: '#F9F9FA' }}>{fmtK(t.amount)}</span>
            </div>

            {/* Collateral: amount + collateral token icon + WHALES whale icon */}
            <div className="flex items-center justify-end gap-2 py-4" style={{ width: 192, flexShrink: 0 }}>
              <span className="text-sm font-medium" style={{ color: '#F9F9FA' }}>{fmtK(t.collateral)}</span>
              <div style={{ padding: 2, flexShrink: 0 }}>
                <img
                  src={t.collateralLogo}
                  alt="collateral"
                  style={{ width: 16, height: 16, borderRadius: '50%', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
              {/* WHALES platform whale icon — from Figma icon-slot (#27C9D8) */}
              <div style={{ padding: 2, flexShrink: 0 }}>
                <img
                  src="/images/collateral-icon-slot.png"
                  alt="whales"
                  style={{ width: 16, height: 16, objectFit: 'contain' }}
                />
              </div>
            </div>

            {/* Tx.ID — icon-only sm button: padding 6px, borderRadius 6px (from Figma) */}
            <div className="flex items-center justify-end py-4" style={{ width: 192, flexShrink: 0 }}>
              <button
                className="flex items-center justify-center transition-colors"
                style={{
                  padding: 6,
                  border: '1px solid #252527',
                  borderRadius: 6,
                  background: 'transparent',
                  color: '#F9F9FA',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#44444B')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#252527')}
                onClick={() => window.open(`https://solscan.io/tx/${t.txId}`, '_blank')}
              >
                {/* arrow_right_up_fill — 12×12 icon slot with 2px padding */}
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
                    borderRadius: 4,
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
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: 44,
        background: '#0A0A0B',
        borderTop: '1px solid #1B1B1C',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        gap: 16,
      }}
    >
      {/* Left: live-data (fills remaining space) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
        {/* LIVE DATA badge: live_photo_fill icon + label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* live_photo_fill — concentric circles with center dot */}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#5BD197">
            <circle cx="12" cy="12" r="3.5" />
            <path fillRule="evenodd" clipRule="evenodd"
              d="M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7zm-7 5a7 7 0 1 1 14 0A7 7 0 0 1 5 12z"
              opacity="0.4"
            />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#5BD197', lineHeight: '16px', letterSpacing: '0.04em' }}>
            LIVE DATA
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 16, background: '#252527', flexShrink: 0 }} />

        {/* Total Vol */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: '#B4B4BA' }}>Total Vol</span>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#F9F9FA' }}>$5,375,932.81</span>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 16, background: '#252527', flexShrink: 0 }} />

        {/* Vol 24h */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: '#B4B4BA' }}>Vol 24h</span>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#F9F9FA' }}>$832,750.55</span>
        </div>
      </div>

      {/* Right: links + social (hug sizing) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        {/* External links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {[
            { label: 'Docs', href: '#' },
            { label: 'Dune', href: '#' },
            { label: 'Link3', href: '#' },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                fontSize: 12,
                color: '#B4B4BA',
                textDecoration: 'none',
              }}
            >
              {label}
              {/* arrow_right_up_line 10×10 */}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17 17 7M7 7h10v10" />
              </svg>
            </a>
          ))}
        </div>

        {/* Social buttons — exact Figma SVG (64×28, two circle buttons) */}
        <img src="/images/bottom-social.svg" alt="social" width={64} height={28} style={{ flexShrink: 0 }} />
      </div>
    </div>
  );
}

/* ─────────── Page ─────────── */
export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: '#0A0A0B' }}>
      <main className="flex flex-col gap-4 px-8 py-4" style={{ paddingBottom: 60 }}>
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
        <div className="rounded-lg overflow-hidden">
          <RecentTradesTable />
        </div>
      </main>

      {/* Bottom Stats — fixed to screen bottom */}
      <BottomStats />
    </div>
  );
}
