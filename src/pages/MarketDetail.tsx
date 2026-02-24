import { useParams, useNavigate } from 'react-router-dom';
import { markets } from '../mock-data/markets';

const fmt = (n: number, dec = 2) =>
  n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });

export default function MarketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const market = markets.find((m) => m.id === id);

  if (!market) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0B' }}>
        <div className="text-center flex flex-col gap-4">
          <p style={{ color: '#7A7A83' }}>Market not found</p>
          <button onClick={() => navigate('/')} className="text-sm underline" style={{ color: '#16C284' }}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0B' }}>
      <div className="max-w-5xl mx-auto px-8 py-8 flex flex-col gap-6">
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm w-fit transition-colors"
          style={{ color: '#7A7A83' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#F9F9FA')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#7A7A83')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to Markets
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 p-6 rounded-xl" style={{ background: '#1B1B1C', border: '1px solid #252527' }}>
          <div className="relative">
            <img src={market.logo} alt={market.ticker} className="w-16 h-16 rounded-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${market.ticker}&background=252527&color=F9F9FA&size=64`; }} />
            <img src={market.chainLogo} alt="chain"
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 object-cover"
              style={{ borderColor: '#1B1B1C' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <span className="text-2xl font-bold" style={{ color: '#F9F9FA' }}>{market.ticker}</span>
            <span className="text-sm" style={{ color: '#7A7A83' }}>{market.name}</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-3xl font-bold" style={{ color: '#F9F9FA' }}>
              ${fmt(market.price, market.price < 1 ? 4 : 2)}
            </span>
            <span className="text-sm" style={{ color: market.priceChange24h >= 0 ? '#5BD197' : '#FD5E67' }}>
              {market.priceChange24h >= 0 ? '+' : ''}{market.priceChange24h.toFixed(2)}% (24h)
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Volume 24h', value: `$${fmt(market.volume24h)}`, change: market.volumeChange24h },
            { label: 'Open Interest', value: `$${fmt(market.openInterest)}`, change: market.openInterestChange24h },
            { label: 'Status', value: market.status.replace(/-/g, ' '), change: null },
          ].map((s) => (
            <div key={s.label} className="flex flex-col gap-2 p-5 rounded-xl" style={{ background: '#1B1B1C', border: '1px solid #252527' }}>
              <span className="text-sm" style={{ color: '#7A7A83' }}>{s.label}</span>
              <span className="text-xl font-semibold capitalize" style={{ color: '#F9F9FA' }}>{s.value}</span>
              {s.change !== null && (
                <span className="text-sm" style={{ color: s.change >= 0 ? '#5BD197' : '#FD5E67' }}>
                  {s.change >= 0 ? '+' : ''}{s.change.toFixed(2)}%
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Trade panel */}
        <div className="p-6 rounded-xl flex flex-col gap-4" style={{ background: '#1B1B1C', border: '1px solid #252527' }}>
          <h2 className="text-lg font-semibold" style={{ color: '#F9F9FA' }}>Place Order</h2>
          <div className="flex gap-2">
            {['Buy', 'Sell'].map((t) => (
              <button key={t} className="flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors"
                style={{ background: t === 'Buy' ? '#16C284' : '#252527', color: '#F9F9FA' }}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm" style={{ color: '#7A7A83' }}>Amount</label>
            <input
              type="number"
              placeholder="0.00"
              className="px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: '#252527', color: '#F9F9FA', border: '1px solid #2E2E34' }}
            />
          </div>
          <button
            className="py-3 rounded-lg font-medium transition-opacity"
            style={{ background: '#16C284', color: '#0A0A0B' }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Buy {market.ticker}
          </button>
        </div>
      </div>
    </div>
  );
}
