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
                onClick={() => window.open(`https://solscan.io/tx/${t.txId}`, '_blank')}
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
          {[{ label: 'Docs', href: '#' }, { label: 'Dune', href: '#' }, { label: 'Link3', href: '#' }].map(({ label, href }) => (
            <a key={label} href={href} style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 12, color: '#B4B4BA', textDecoration: 'none' }}>
              {label}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17 17 7M7 7h10v10" />
              </svg>
            </a>
          ))}
        </div>
        <img src="/images/bottom-social.svg" alt="social" width={64} height={28} style={{ flexShrink: 0 }} />
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
