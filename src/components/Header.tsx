import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M3.53 5.47a.75.75 0 0 0-1.06 1.06l5 5a.75.75 0 0 0 1.06 0l5-5a.75.75 0 0 0-1.06-1.06L8 9.94 3.53 5.47Z" />
  </svg>
);

export default function Header() {
  const location = useLocation();
  const [earnOpen, setEarnOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50"
      style={{ borderBottom: '1px solid #1B1B1C', backgroundColor: '#0A0A0B' }}
    >
      {/* container: padding 0 32px */}
      <div style={{ padding: '0 32px' }}>
        {/* header-items: row, gap 16, padding 0 16, py 12 */}
        <div className="flex items-center gap-4" style={{ padding: '12px 16px' }}>

          {/* ── logo + menu ── */}
          <div className="flex items-center gap-2 flex-1">
            {/* Logo: IMAGE-SVG, padding 6px */}
            <Link to="/" style={{ padding: 6, display: 'flex', alignItems: 'center' }}>
              <img
                src="/images/logo-whalesmarket.svg"
                alt="WhalesMarket"
                style={{ height: 24, width: 'auto' }}
              />
            </Link>

            {/* top-menu: row, alignItems center */}
            <nav className="flex items-center">
              {/* Pre-market — primary green ghost */}
              <Link
                to="/"
                className="flex items-center rounded-lg"
                style={{
                  gap: 6,
                  padding: '8px 16px',
                  color: '#5BD197',
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: '20px',
                }}
              >
                Pre-market
              </Link>

              {/* Points Market */}
              <Link
                to="/points"
                className="flex items-center rounded-lg transition-colors"
                style={{
                  gap: 6,
                  padding: '8px 16px',
                  color: location.pathname === '/points' ? '#F9F9FA' : '#7A7A83',
                  fontSize: 14,
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#F9F9FA')}
                onMouseLeave={(e) => {
                  if (location.pathname !== '/points') e.currentTarget.style.color = '#7A7A83';
                }}
              >
                Points Market
              </Link>

              {/* Dashboard */}
              <Link
                to="/dashboard"
                className="flex items-center rounded-lg transition-colors"
                style={{
                  gap: 6,
                  padding: '8px 16px',
                  color: location.pathname === '/dashboard' ? '#F9F9FA' : '#7A7A83',
                  fontSize: 14,
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#F9F9FA')}
                onMouseLeave={(e) => {
                  if (location.pathname !== '/dashboard') e.currentTarget.style.color = '#7A7A83';
                }}
              >
                Dashboard
              </Link>

              {/* Earn dropdown — icon-trailing (down_fill), padding 8px 8px 8px 16px */}
              <div className="relative">
                <button
                  onClick={() => { setEarnOpen(!earnOpen); setAboutOpen(false); }}
                  className="flex items-center rounded-lg transition-colors"
                  style={{
                    gap: 6,
                    padding: '8px 8px 8px 16px',
                    color: '#7A7A83',
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#F9F9FA')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#7A7A83')}
                >
                  Earn
                  <span style={{ padding: 2, display: 'flex', alignItems: 'center' }}>
                    <ChevronDown />
                  </span>
                </button>
                {earnOpen && (
                  <div
                    className="absolute top-full left-0 mt-1 w-40 rounded-lg border py-1 z-50"
                    style={{ background: '#1B1B1C', borderColor: '#252527' }}
                  >
                    {['Staking', 'Liquidity', 'Referral'].map((item) => (
                      <button
                        key={item}
                        className="w-full text-left px-4 py-2 text-sm transition-colors"
                        style={{ color: '#97979E' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#F9F9FA')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#97979E')}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* About dropdown */}
              <div className="relative">
                <button
                  onClick={() => { setAboutOpen(!aboutOpen); setEarnOpen(false); }}
                  className="flex items-center rounded-lg transition-colors"
                  style={{
                    gap: 6,
                    padding: '8px 8px 8px 16px',
                    color: '#7A7A83',
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#F9F9FA')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#7A7A83')}
                >
                  About
                  <span style={{ padding: 2, display: 'flex', alignItems: 'center' }}>
                    <ChevronDown />
                  </span>
                </button>
                {aboutOpen && (
                  <div
                    className="absolute top-full left-0 mt-1 w-40 rounded-lg border py-1 z-50"
                    style={{ background: '#1B1B1C', borderColor: '#252527' }}
                  >
                    {['Docs', 'Blog', 'Community'].map((item) => (
                      <button
                        key={item}
                        className="w-full text-left px-4 py-2 text-sm transition-colors"
                        style={{ color: '#97979E' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#F9F9FA')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#97979E')}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* ── header-functions: row, justify-end, gap 8 ── */}
          <div className="flex items-center shrink-0" style={{ gap: 8 }}>

            {/* Chain selector: padding 8, gap 6, border #252527, radius 8 */}
            <button
              className="flex items-center justify-center rounded-lg transition-colors"
              style={{ gap: 6, padding: 8, border: '1px solid #252527' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#44444B')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#252527')}
            >
              {/* image-slot: Solana icon 20x20 */}
              <img
                src="/images/chain-solana.png"
                alt="Solana"
                style={{ width: 20, height: 20, borderRadius: '50%', padding: 2 }}
              />
              {/* down_fill icon 16x16 */}
              <span style={{ padding: 2, display: 'flex', color: '#fff' }}>
                <ChevronDown />
              </span>
            </button>

            {/* Fee: padding 8, gap 6, border #252527, radius 8, height 36 */}
            <button
              className="flex items-center justify-center rounded-lg transition-colors"
              style={{ gap: 6, padding: 8, border: '1px solid #252527', height: 36 }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#44444B')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#252527')}
            >
              {/* image-slot: fee icon */}
              <img
                src="/images/icon-fee.png"
                alt="fee"
                style={{ width: 20, height: 20, padding: 2 }}
              />
              <span style={{ fontSize: 14, fontWeight: 500, color: '#F9F9FA', lineHeight: '20px' }}>
                0.00
              </span>
              {/* whales-badge: "-0% Fee", bg rgba(22,194,132,0.1), color #5BD197, px 8 py 4, radius 9999 */}
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  padding: '4px 8px',
                  borderRadius: 9999,
                  background: 'rgba(22,194,132,0.1)',
                  color: '#5BD197',
                  lineHeight: '12px',
                  letterSpacing: '0.02em',
                }}
              >
                -0% Fee
              </span>
            </button>

            {/* Balance: padding 8px 12px 8px 8px, gap 6, border #252527, radius 8 */}
            <button
              className="flex items-center justify-center rounded-lg transition-colors"
              style={{ gap: 6, padding: '8px 12px 8px 8px', border: '1px solid #252527' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#44444B')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#252527')}
            >
              {/* image-slot: wallet icon */}
              <img
                src="/images/icon-wallet.png"
                alt="wallet"
                style={{ width: 20, height: 20, padding: 2, objectFit: 'cover' }}
              />
              <span style={{ fontSize: 14, fontWeight: 500, color: '#F9F9FA', lineHeight: '20px' }}>
                18.32
              </span>
            </button>

            {/* Avatar: 32x32, bg #252527, border 2px #0A0A0B, radius full */}
            <button
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#252527',
                border: '2px solid #0A0A0B',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" fill="#7A7A83" />
                <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" fill="#7A7A83" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Close dropdowns on outside click */}
      {(earnOpen || aboutOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setEarnOpen(false); setAboutOpen(false); }}
        />
      )}
    </header>
  );
}
