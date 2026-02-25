import { useState } from 'react';
import { bannerMarkets } from '../mock-data/markets';
import { recentTrades } from '../mock-data/trades';
import {
  preMarketCards,
  pointsMarketCards,
} from '../mock-data/pointsMarkets';
import type { PointsMarketCard, MarketCardItem } from '../mock-data/pointsMarkets';

/* ─────────── helpers ─────────── */
const fmt = (n: number, dec = 2) =>
  n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });

const fmtK = (n: number) => {
  if (n >= 1000) return (n / 1000).toFixed(2) + 'K';
  return n.toFixed(2);
};

/* ─────────── Market Card ─────────── */
function MarketCard({ card }: { card: PointsMarketCard }) {
  const [hovered, setHovered] = useState(false);
  const isPositive = card.priceChange24h !== undefined && card.priceChange24h > 0;
  const isNegative = card.priceChange24h !== undefined && card.priceChange24h < 0;

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        background: hovered ? '#252527' : '#1B1B1C',
        borderRadius: 12,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* token-info: row, gap:12, paddingBottom:16, borderBottom */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottom: '1px solid #252527' }}>
        {/* image-slot: 4px padding wrapper, 44×44 token + 16×16 chain badge */}
        <div style={{ position: 'relative', padding: 4, flexShrink: 0 }}>
          <img
            src={card.logo}
            alt={card.ticker}
            style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                `https://ui-avatars.com/api/?name=${card.ticker}&background=252527&color=F9F9FA&size=44`;
            }}
          />
          <img
            src={card.chainLogo}
            alt="chain"
            style={{
              position: 'absolute',
              left: 0,
              top: 36,
              width: 16,
              height: 16,
              borderRadius: '50%',
              border: '2px solid #1B1B1C',
              objectFit: 'cover',
            }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
        {/* name: column, gap:4 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#F9F9FA', lineHeight: '1.43em' }}>{card.ticker}</span>
          <span style={{ fontSize: 14, fontWeight: 400, color: '#7A7A83', lineHeight: '1.43em' }}>{card.name}</span>
        </div>
      </div>

      {/* price+change: row, alignItems:baseline, gap:4 */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 24, fontWeight: 500, color: '#F9F9FA', lineHeight: '1.333em' }}>
          ${fmt(card.price, card.price < 0.01 ? 4 : card.price < 1 ? 4 : 2)}
        </span>
        {card.priceChange24h !== undefined && (
          <span style={{
            fontSize: 14,
            fontWeight: 400,
            color: isPositive ? '#5BD197' : isNegative ? '#FD5E67' : '#7A7A83',
            lineHeight: '1.43em',
          }}>
            {isPositive ? '+' : ''}{card.priceChange24h.toFixed(2)}%
          </span>
        )}
      </div>

      {/* vol: row, gap:4 */}
      <div style={{ display: 'flex', gap: 4 }}>
        {/* 24h Vol */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          <span style={{ fontSize: 12, color: '#7A7A83' }}>24h Vol.</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#F9F9FA' }}>${fmt(card.vol24h)}</span>
        </div>
        {/* Total Vol */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          <span style={{ fontSize: 12, color: '#7A7A83' }}>Total Vol.</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#F9F9FA' }}>${fmt(card.totalVol)}</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Coming Soon Card ─────────── */
function ComingSoonCard({ text }: { text: string }) {
  return (
    <div style={{
      flex: 1,
      minWidth: 0,
      background: '#1B1B1C',
      borderRadius: 12,
      padding: 32,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      minHeight: 160,
    }}>
      <img src="/images/coming-soon-icon.svg" alt="" width={64} height={64} />
      <span style={{
        fontSize: 14,
        fontWeight: 400,
        color: '#B4B4BA',
        opacity: 0.5,
        textAlign: 'center',
        lineHeight: '1.43em',
        whiteSpace: 'pre-line',
      }}>
        {text}
      </span>
    </div>
  );
}

/* ─────────── Market Section (Pre-market / Points) ─────────── */
function MarketSection({ title, cards }: { title: string; cards: MarketCardItem[] }) {
  return (
    <section style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      padding: 16,
      background: '#0A0A0B',
    }}>
      {/* block-title: row, space-between */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 24, fontWeight: 500, color: '#F9F9FA', lineHeight: '1.333em' }}>{title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Show All button: outlined, pill, 14px 500, padding: 8px 16px */}
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            border: '1px solid #252527',
            borderRadius: 9999,
            background: 'transparent',
            color: '#F9F9FA',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
          }}>
            Show All
          </button>
          {/* slide-nav: prev/next arrow buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, border: '1px solid rgba(122,122,131,0.2)',
              borderRadius: 9999, background: 'transparent', color: '#7A7A83', cursor: 'pointer',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>
            <button style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, border: '1px solid rgba(122,122,131,0.2)',
              borderRadius: 9999, background: 'transparent', color: '#7A7A83', cursor: 'pointer',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* market-items: row, gap:16, fill */}
      <div style={{ display: 'flex', gap: 16 }}>
        {cards.map((card) => {
          if ('type' in card && card.type === 'coming-soon') {
            return <ComingSoonCard key={card.id} text={card.text} />;
          }
          return <MarketCard key={card.id} card={card as PointsMarketCard} />;
        })}
      </div>
    </section>
  );
}

/* ─────────── Recent Trades Table ─────────── */
function RecentTradesTable() {
  const colHead = 'text-xs font-medium py-2';

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, background: '#0A0A0B' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 24, fontWeight: 500, color: '#F9F9FA', margin: 0 }}>Recent Trades</h2>
      </div>

      <div className="w-full">
        {/* Thead: Time(128) | Side(128) | Pair(fill) | Price($)(192) | Amount(192) | Collateral(192) | Tx.ID(192) */}
        <div className={`flex items-center px-2`} style={{ borderBottom: '1px solid #1B1B1C' }}>
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
            <div style={{ width: 128, padding: '16px 0', flexShrink: 0 }}>
              <span style={{ fontSize: 14, color: '#7A7A83' }}>{t.time}</span>
            </div>
            <div style={{ width: 128, padding: '16px 0', flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: t.side === 'buy' ? '#5BD197' : '#FD5E67' }}>
                {t.side === 'buy' ? 'Buy' : 'Sell'}
              </span>
            </div>
            <div className="flex-1 flex items-center gap-2 py-4">
              <div style={{ padding: 2, flexShrink: 0 }}>
                <img
                  src={t.pairLogo} alt={t.pair}
                  style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      `https://ui-avatars.com/api/?name=${t.pair.split('/')[0]}&background=252527&color=F9F9FA&size=20`;
                  }}
                />
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#F9F9FA' }}>{t.pair}</span>
            </div>
            <div className="flex justify-end py-4" style={{ width: 192, flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#F9F9FA' }}>{t.price.toFixed(4)}</span>
            </div>
            <div className="flex justify-end py-4" style={{ width: 192, flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#F9F9FA' }}>{fmtK(t.amount)}</span>
            </div>
            <div className="flex items-center justify-end gap-2 py-4" style={{ width: 192, flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#F9F9FA' }}>{fmtK(t.collateral)}</span>
              <img src={t.collateralLogo} alt="collateral"
                style={{ width: 16, height: 16, borderRadius: '50%', objectFit: 'cover' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <img src="/images/collateral-icon-slot.png" alt="whales"
                style={{ width: 16, height: 16, objectFit: 'contain' }}
              />
            </div>
            <div className="flex items-center justify-end py-4" style={{ width: 192, flexShrink: 0 }}>
              <button
                style={{
                  padding: 6, border: '1px solid #252527', borderRadius: 6,
                  background: 'transparent', color: '#F9F9FA', cursor: 'pointer', display: 'flex',
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
    </section>
  );
}

/* ─────────── Main Banner ─────────── */
function MainBanner() {
  const [idx] = useState(0);
  const item = bannerMarkets[idx];

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 12, height: 398, background: '#0A0A0B' }}>
        <img src={item.bgImage} alt={item.ticker}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: item.bgGradient }} />
        <div style={{ position: 'absolute', left: 0, top: 0, width: 384, height: 398, padding: 32, gap: 24, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {'iconSlot' in item && item.iconSlot ? (
              <img src={(item as typeof item & { iconSlot: string }).iconSlot} alt={item.ticker} style={{ width: 50, height: 50, maxWidth: 'none' }} />
            ) : (
              <div style={{ position: 'relative', padding: 2, display: 'inline-flex' }}>
                <img src={item.logo} alt={item.ticker}
                  style={{ width: 44, height: 44, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', maxWidth: 'none' }}
                />
                <img src={item.chainLogo} alt="chain"
                  style={{ position: 'absolute', left: 0, top: 32, width: 16, height: 16, borderRadius: '50%', border: '2px solid #0A0A0B' }}
                />
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontWeight: 500, fontSize: 36, lineHeight: '1.222em', color: '#F9F9FA', whiteSpace: 'pre-line', margin: 0 }}>
                {item.title}
              </p>
              <p style={{ fontWeight: 400, fontSize: 16, lineHeight: '1.5em', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                {item.description}
              </p>
            </div>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', width: 'fit-content', borderRadius: 10, background: '#16C284', color: '#F9F9FA', padding: '10px 10px 10px 20px', gap: 8, border: 'none', cursor: 'pointer' }}>
            <span style={{ fontWeight: 500, fontSize: 16, lineHeight: '24px' }}>Trade ${item.ticker}</span>
            <span style={{ display: 'flex', alignItems: 'center', padding: 2 }}>
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
    <div style={{ position: 'relative', overflow: 'hidden', width: 400, height: 400, background: '#010D1D', borderRadius: 12, flexShrink: 0 }}>
      <img src="/images/banner-bg-sub.png" alt=""
        style={{ position: 'absolute', width: 528, height: 400, left: -64, top: 0, maxWidth: 'none' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(3,32,81,0) 0%, rgba(3,32,81,1) 80%)' }} />
      <div style={{ position: 'absolute', left: 8, top: 244, width: 384, padding: '0 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <h3 style={{ color: '#F9F9FA', fontSize: 20, lineHeight: '1.4em', fontWeight: 500, textAlign: 'center', margin: 0 }}>
          Stake $WHALES for Rewards and Lower Trading Fees
        </h3>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, borderRadius: 10, background: '#F97316', color: '#F9F9FA', padding: '10px 10px 10px 20px', border: 'none', cursor: 'pointer' }}>
          Stake Now
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 2 }}>
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
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, height: 44,
      background: '#0A0A0B', borderTop: '1px solid #1B1B1C',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 16px', gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#5BD197">
            <circle cx="12" cy="12" r="3.5" />
            <path fillRule="evenodd" clipRule="evenodd"
              d="M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7zm-7 5a7 7 0 1 1 14 0A7 7 0 0 1 5 12z"
              opacity="0.4"
            />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#5BD197', lineHeight: '16px', letterSpacing: '0.04em' }}>LIVE DATA</span>
        </div>
        <div style={{ width: 1, height: 16, background: '#252527', flexShrink: 0 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: '#B4B4BA' }}>Total Vol</span>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#F9F9FA' }}>$5,375,932.81</span>
        </div>
        <div style={{ width: 1, height: 16, background: '#252527', flexShrink: 0 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: '#B4B4BA' }}>Vol 24h</span>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#F9F9FA' }}>$832,750.55</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {[{ label: 'Docs', href: 'https://docs.whales.market/' }, { label: 'Dune', href: 'https://dune.com/whalesmarket/whales-market-solana' }, { label: 'Link3', href: 'https://link3.to/whalesmarket' }].map(({ label, href }) => (
            <a key={label} href={href} style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 12, color: '#B4B4BA', textDecoration: 'none' }}>
              {label}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17 17 7M7 7h10v10" />
              </svg>
            </a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <a href="https://x.com/WhalesMarket" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M0 14C0 6.26801 6.26801 0 14 0C21.732 0 28 6.26801 28 14C28 21.732 21.732 28 14 28C6.26801 28 0 21.732 0 14Z" fill="#1B1B1C"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M17.8765 10.3295C17.9197 10.2801 17.9528 10.2226 17.9738 10.1604C17.9949 10.0981 18.0034 10.0324 17.999 9.96684C17.9947 9.9013 17.9774 9.83728 17.9483 9.77841C17.9191 9.71954 17.8787 9.66699 17.8293 9.62375C17.7798 9.58051 17.7223 9.54744 17.6601 9.52641C17.5979 9.50539 17.5321 9.49682 17.4666 9.50121C17.4011 9.5056 17.337 9.52285 17.2782 9.55198C17.2193 9.58112 17.1667 9.62156 17.1235 9.671L14.5685 12.591L12.4 9.7C12.3534 9.6379 12.293 9.5875 12.2236 9.55279C12.1542 9.51807 12.0776 9.5 12 9.5H10C9.90714 9.5 9.81612 9.52586 9.73713 9.57467C9.65815 9.62349 9.59431 9.69334 9.55279 9.77639C9.51126 9.85945 9.49368 9.95242 9.50202 10.0449C9.51036 10.1374 9.54429 10.2257 9.6 10.3L12.8185 14.591L10.1235 17.671C10.0803 17.7204 10.0472 17.7779 10.0262 17.8401C10.0051 17.9024 9.99657 17.9681 10.001 18.0337C10.0053 18.0992 10.0226 18.1632 10.0517 18.2221C10.0809 18.281 10.1213 18.3335 10.1708 18.3767C10.2202 18.42 10.2777 18.4531 10.3399 18.4741C10.4021 18.4951 10.4679 18.5037 10.5334 18.4993C10.5989 18.4949 10.663 18.4777 10.7218 18.4485C10.7807 18.4194 10.8333 18.3789 10.8765 18.3295L13.4315 15.409L15.6 18.3C15.6466 18.3621 15.707 18.4125 15.7764 18.4472C15.8458 18.4819 15.9224 18.5 16 18.5H18C18.0929 18.5 18.1839 18.4741 18.2629 18.4253C18.3419 18.3765 18.4057 18.3067 18.4472 18.2236C18.4887 18.1406 18.5063 18.0476 18.498 17.9551C18.4896 17.8626 18.4557 17.7743 18.4 17.7L15.1815 13.409L17.8765 10.3295ZM16.25 17.5L11 10.5H11.75L17 17.5H16.25Z" fill="#F9F9FA"/>
            </svg>
          </a>
          <a href="https://discord.com/invite/whalesmarket" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
            <svg width="28" height="28" viewBox="36 0 28 28" fill="none">
              <path d="M36 14C36 6.26801 42.268 0 50 0C57.732 0 64 6.26801 64 14C64 21.732 57.732 28 50 28C42.268 28 36 21.732 36 14Z" fill="#1B1B1C"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M51.5015 10C51.8735 10 52.2665 10.13 52.6265 10.2735L52.89 10.3815C53.52 10.6455 53.874 11.1995 54.1485 11.808C54.594 12.7955 54.9035 14.112 55.0105 15.113C55.0615 15.588 55.074 16.066 54.9825 16.3875C54.884 16.731 54.549 16.974 54.2235 17.165L54.0625 17.2565L53.8955 17.3495C53.8095 17.3975 53.721 17.445 53.633 17.4915L53.372 17.6265L53.0135 17.805L52.725 17.947C52.6661 17.9788 52.6013 17.9984 52.5347 18.0047C52.468 18.011 52.4008 18.0038 52.3369 17.9836C52.2731 17.9634 52.2139 17.9306 52.163 17.8872C52.1121 17.8437 52.0704 17.7904 52.0405 17.7305C52.0105 17.6706 51.9929 17.6053 51.9887 17.5385C51.9845 17.4717 51.9937 17.4047 52.0158 17.3415C52.038 17.2783 52.0726 17.2202 52.1177 17.1706C52.1627 17.1211 52.2172 17.0811 52.278 17.053L52.673 16.858L52.383 16.5535C51.688 16.8385 50.8695 17 50 17C49.1305 17 48.312 16.839 47.617 16.5535L47.327 16.8575L47.7235 17.0525C47.7823 17.0819 47.8347 17.1225 47.8777 17.1721C47.9208 17.2217 47.9537 17.2793 47.9745 17.3416C47.9953 17.4039 48.0036 17.4697 47.999 17.5352C47.9943 17.6008 47.9769 17.6647 47.9475 17.7235C47.9182 17.7823 47.8775 17.8347 47.8279 17.8777C47.7783 17.9208 47.7207 17.9537 47.6584 17.9745C47.5326 18.0165 47.3952 18.0068 47.2765 17.9475L47.0045 17.8125C46.8035 17.7125 46.602 17.6135 46.403 17.509L45.939 17.2565L45.7785 17.165C45.453 16.974 45.1175 16.731 45.0195 16.3875C44.9275 16.066 44.9405 15.5885 44.991 15.1125C45.098 14.112 45.4075 12.7955 45.853 11.808C46.1275 11.1995 46.4815 10.6455 47.1115 10.3815C47.5295 10.2065 48.036 10 48.5 10C48.8015 10 49.0385 10.2775 48.995 10.5735C49.3277 10.5243 49.6637 10.4997 50 10.5C50.3455 10.5 50.683 10.525 51.007 10.574C50.9974 10.503 51.0029 10.4308 51.0233 10.3621C51.0437 10.2934 51.0784 10.2298 51.1252 10.1755C51.172 10.1212 51.2298 10.0775 51.2948 10.0473C51.3597 10.017 51.4299 10.0009 51.5015 10ZM48.375 13.25C48.1429 13.25 47.9204 13.3422 47.7563 13.5063C47.5922 13.6704 47.5 13.8929 47.5 14.125C47.5 14.3571 47.5922 14.5796 47.7563 14.7437C47.9204 14.9078 48.1429 15 48.375 15C48.6071 15 48.8296 14.9078 48.9937 14.7437C49.1578 14.5796 49.25 14.3571 49.25 14.125C49.25 13.8929 49.1578 13.6704 48.9937 13.5063C48.8296 13.3422 48.6071 13.25 48.375 13.25ZM51.625 13.25C51.3929 13.25 51.1704 13.3422 51.0063 13.5063C50.8422 13.6704 50.75 13.8929 50.75 14.125C50.75 14.3571 50.8422 14.5796 51.0063 14.7437C51.1704 14.9078 51.3929 15 51.625 15C51.8571 15 52.0796 14.9078 52.2437 14.7437C52.4078 14.5796 52.5 14.3571 52.5 14.125C52.5 13.8929 52.4078 13.6704 52.2437 13.5063C52.0796 13.3422 51.8571 13.25 51.625 13.25Z" fill="#F9F9FA"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Page ─────────── */
export default function PointsMarket() {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0B' }}>
      <main style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px 32px', paddingBottom: 60 }}>
        {/* Banners */}
        <div style={{ display: 'flex', gap: 16, padding: '0 16px' }}>
          <MainBanner />
          <SubBanner />
        </div>

        {/* Pre-market section */}
        <div style={{ borderRadius: 8, overflow: 'hidden' }}>
          <MarketSection title="Pre-market" cards={preMarketCards} />
        </div>

        {/* Points section */}
        <div style={{ borderRadius: 8, overflow: 'hidden' }}>
          <MarketSection title="Point-market" cards={pointsMarketCards} />
        </div>

        {/* Recent Trades */}
        <div style={{ borderRadius: 8, overflow: 'hidden' }}>
          <RecentTradesTable />
        </div>
      </main>

      <BottomStats />
    </div>
  );
}
