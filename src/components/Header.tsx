import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';

// ─── Icons ──────────────────────────────────────────────────────────────────────
const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M3.53 5.47a.75.75 0 0 0-1.06 1.06l5 5a.75.75 0 0 0 1.06 0l5-5a.75.75 0 0 0-1.06-1.06L8 9.94 3.53 5.47Z" />
  </svg>
);

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 6V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3v3c0 .552-.45 1-1.007 1H4.007A1.001 1.001 0 0 1 3 21l.003-14c0-.552.45-1 1.006-1H7zm2 0h8v10h2V4H9v2zm-2 5v2h6v-2H7zm0 4v2h6v-2H7z" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 6v2H5v11h11v-5h2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6zm11-3v8h-2V6.413l-7.793 7.794-1.414-1.414L17.585 5H13V3h8z" />
  </svg>
);


const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 22a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3h-2V4H6v16h12v-2h2v3a1 1 0 0 1-1 1H5zm13-6v-3h-7v-2h7V8l5 4-5 4z" />
  </svg>
);

// ─── Constants ───────────────────────────────────────────────────────────────────
const EARN_ITEMS = [
  { key: 'staking',    label: 'Staking',    description: 'Secure. Stake. Earn.',       icon: '/images/icon-earn-staking.svg',    hasBorder: true  },
  { key: 'incentives', label: 'Incentives', description: 'Do more. Get more.',          icon: '/images/icon-earn-incentives.svg', hasBorder: true  },
  { key: 'referral',   label: 'Referral',   description: 'Bring users. Share gains.',   icon: '/images/icon-earn-referral.svg',   hasBorder: false },
];

const NETWORK_TABS = [
  { id: 'evm',      label: 'EVM'      },
  { id: 'solana',   label: 'Solana'   },
  { id: 'starknet', label: 'Starknet' },
  { id: 'ton',      label: 'Ton'      },
  { id: 'sui',      label: 'Sui'      },
  { id: 'aptos',    label: 'Aptos'    },
];

const WALLET_OPTIONS = [
  { id: 'phantom',  name: 'Phantom',  initials: 'P', bg: '#4C1D95', color: '#C4B5FD', hasInstall: true  },
  { id: 'rabby',    name: 'Rabby',    initials: 'R', bg: '#1E3A8A', color: '#93C5FD', hasInstall: true  },
  { id: 'trust',    name: 'Trust',    initials: 'T', bg: '#1D4ED8', color: '#FFFFFF', hasInstall: false },
  { id: 'coinbase', name: 'Coinbase', initials: 'C', bg: '#0052FF', color: '#FFFFFF', hasInstall: false },
  { id: 'okx',      name: 'OKX',      initials: 'O', bg: '#111111', color: '#FFFFFF', hasInstall: false },
];

const USER_MENU_ITEMS: Array<{ key: string; label: string; icon?: string }> = [
  { key: 'staking',    label: 'Staking',    icon: '/images/icon-earn-staking.svg'    },
  { key: 'incentives', label: 'Incentives', icon: '/images/icon-earn-incentives.svg' },
  { key: 'referral',   label: 'Referral',   icon: '/images/icon-earn-referral.svg'   },
];

const NETWORKS = [
  { id: 'solana',      label: 'Solana',      icon: '/images/chain-solana.png'      },
  { id: 'ethereum',    label: 'Ethereum',    icon: '/images/chain-ethereum.png'    },
  { id: 'hyperliquid', label: 'Hyperliquid', icon: '/images/chain-hyperliquid.png' },
  { id: 'bnb',         label: 'BNB Chain',   icon: '/images/chain-bnb.png'         },
  { id: 'base',        label: 'Base',        icon: '/images/chain-base.svg'        },
];

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
  </svg>
);

const MOCK_WALLET = 'GQ98...iA5Y';

// ─── Avatar ──────────────────────────────────────────────────────────────────────
const WalletAvatar = ({ size = 32 }: { size?: number }) => (
  <img
    src="/images/avatar.jpg"
    alt="avatar"
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      objectFit: 'cover',
      flexShrink: 0,
      display: 'block',
    }}
  />
);

// ─── PointsMarketModal ───────────────────────────────────────────────────────────
function PointsMarketModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return createPortal(
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)',
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 101,
          width: 576,
          background: '#1B1B1C',
          borderRadius: 24,
          boxShadow: '0px 0px 32px 0px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', width: 576, height: 355, flexShrink: 0 }}>
          <img
            src="/images/modal-points-banner.png"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 14, right: 16,
              width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.5)', borderRadius: 9999,
              border: 'none', cursor: 'pointer', color: '#F9F9FA',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12 5.7 16.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z" />
            </svg>
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '32px 48px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '0 32px 16px' }}>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 500, lineHeight: '1.286em', color: '#F9F9FA', textAlign: 'center' }}>
              Points Market returns soon!
            </p>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 400, lineHeight: '1.5em', color: '#B4B4BA', textAlign: 'center' }}>
              Points Market is evolving with a new version —{' '}
              stay tuned, folks!
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '10px 32px', borderRadius: 10,
              background: '#F9F9FA', color: '#0A0A0B',
              border: 'none', cursor: 'pointer',
              fontSize: 16, fontWeight: 500, lineHeight: '1.5em',
            }}>
              Follow us on
              <span style={{ display: 'flex', alignItems: 'center', padding: 4 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.259 5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

// ─── ConnectWalletModal ──────────────────────────────────────────────────────────
function ConnectWalletModal({ onClose, onConnect }: { onClose: () => void; onConnect: () => void }) {
  const [activeNetwork, setActiveNetwork] = useState('evm');
  const [hoveredWallet, setHoveredWallet] = useState<string | null>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return createPortal(
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
      />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        zIndex: 101, width: 672, background: '#1B1B1C', borderRadius: 24,
        boxShadow: '0px 0px 32px 0px rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column', gap: 24, padding: 24,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ flex: 1 }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 500, color: '#F9F9FA' }}>
            Connect Wallet
          </span>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 9999, background: '#252527',
                border: 'none', cursor: 'pointer', color: '#7A7A83',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12 5.7 16.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Network tabs */}
        <div style={{ display: 'flex', padding: 4, border: '1px solid #252527', borderRadius: 10 }}>
          {NETWORK_TABS.map(tab => {
            const isActive = tab.id === activeNetwork;
            const isDisabled = tab.id !== 'evm';
            return (
              <button
                key={tab.id}
                onClick={() => !isDisabled && setActiveNetwork(tab.id)}
                style={{
                  flex: 1, padding: '10px 4px', borderRadius: 8,
                  background: isActive ? '#2E2E34' : 'transparent',
                  border: 'none', cursor: isDisabled ? 'default' : 'pointer',
                  opacity: isDisabled ? 0.4 : 1,
                  fontSize: 14, fontWeight: 500, color: '#F9F9FA',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Wallet selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#7A7A83' }}>Choose Wallet</span>
            <span style={{ fontSize: 12, color: '#5BD197' }}>Selected to Ethereum Mainnet</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {WALLET_OPTIONS.map(wallet => (
              <button
                key={wallet.id}
                onClick={() => { onConnect(); onClose(); }}
                onMouseEnter={() => setHoveredWallet(wallet.id)}
                onMouseLeave={() => setHoveredWallet(null)}
                style={{
                  width: 'calc(50% - 8px)', display: 'flex', alignItems: 'center', gap: 16,
                  padding: 16, borderRadius: 12, textAlign: 'left',
                  border: `1px solid ${hoveredWallet === wallet.id ? '#44444B' : '#252527'}`,
                  background: 'transparent', cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 12, background: wallet.bg, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: wallet.color }}>{wallet.initials}</span>
                </div>
                <span style={{ flex: 1, fontSize: 16, fontWeight: 500, color: '#F9F9FA' }}>{wallet.name}</span>
                {wallet.hasInstall && (
                  <span
                    onClick={e => e.stopPropagation()}
                    style={{ padding: '4px 10px', borderRadius: 6, background: '#252527', fontSize: 12, fontWeight: 500, color: '#7A7A83', flexShrink: 0 }}
                  >
                    Install
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

// ─── Header ─────────────────────────────────────────────────────────────────────
export default function Header() {
  const location = useLocation();
  const [earnOpen, setEarnOpen] = useState(false);
  const [hoveredEarnItem, setHoveredEarnItem] = useState<string | null>(null);
  const [pointsModalOpen, setPointsModalOpen] = useState(false);
  const [connected, setConnected] = useState(true);
  const [walletOpen, setWalletOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [hoveredUserItem, setHoveredUserItem] = useState<string | null>(null);
  const [toast, setToast] = useState<{ label: string; description: string } | null>(null);

  const showToast = (label: string, description: string) => {
    setToast({ label, description });
    setTimeout(() => setToast(null), 4000);
  };

  const [networkOpen, setNetworkOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('solana');

  const avatarRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<HTMLDivElement>(null);

  // Close user dropdown on outside click
  useEffect(() => {
    if (!userDropdownOpen) return;
    const onDown = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [userDropdownOpen]);

  // Close network dropdown on outside click
  useEffect(() => {
    if (!networkOpen) return;
    const onDown = (e: MouseEvent) => {
      if (networkRef.current && !networkRef.current.contains(e.target as Node)) {
        setNetworkOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [networkOpen]);

  return (
    <header
      className="sticky top-0 z-50"
      style={{ borderBottom: '1px solid #1B1B1C', backgroundColor: '#0A0A0B' }}
    >
      <div style={{ padding: '0 32px' }}>
        <div className="flex items-center gap-4" style={{ padding: '12px 16px' }}>

          {/* ── logo + nav ── */}
          <div className="flex items-center gap-2 flex-1">
            <Link to="/" style={{ padding: 6, display: 'flex', alignItems: 'center' }}>
              <img
                src="/images/logo-whalesmarket.svg"
                alt="WhalesMarket"
                style={{ height: 24, width: 'auto' }}
              />
            </Link>

            <nav className="flex items-center">
              {/* Pre-market */}
              <Link
                to="/"
                className="flex items-center rounded-lg"
                style={{ gap: 6, padding: '8px 16px', color: '#5BD197', fontSize: 14, fontWeight: 500, lineHeight: '20px' }}
              >
                Pre-market
              </Link>

              {/* Points Market */}
              <button
                onClick={() => { setPointsModalOpen(true); setEarnOpen(false); }}
                className="flex items-center rounded-lg transition-colors"
                style={{ gap: 6, padding: '8px 16px', color: '#7A7A83', fontSize: 14, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#F9F9FA')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#7A7A83')}
              >
                Points Market
              </button>

              {/* Dashboard */}
              <Link
                to="/dashboard"
                className="flex items-center rounded-lg transition-colors"
                style={{ gap: 6, padding: '8px 16px', color: location.pathname === '/dashboard' ? '#F9F9FA' : '#7A7A83', fontSize: 14, fontWeight: 500 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#F9F9FA')}
                onMouseLeave={(e) => { if (location.pathname !== '/dashboard') e.currentTarget.style.color = '#7A7A83'; }}
              >
                Dashboard
              </Link>

              {/* Earn dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setEarnOpen(true)}
                onMouseLeave={() => { setEarnOpen(false); setHoveredEarnItem(null); }}
              >
                <button
                  className="flex items-center rounded-lg"
                  style={{
                    gap: 6, padding: '8px 8px 8px 16px',
                    color: earnOpen ? '#F9F9FA' : '#7A7A83',
                    fontSize: 14, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer',
                  }}
                >
                  Earn
                  <span style={{ padding: 2, display: 'flex', alignItems: 'center' }}>
                    <ChevronDown />
                  </span>
                </button>

                {earnOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, zIndex: 50,
                    width: 256, background: '#1B1B1C', borderRadius: 12,
                    boxShadow: '0px 0px 32px 0px rgba(0,0,0,0.2)', padding: 16,
                    display: 'flex', flexDirection: 'column', gap: 16,
                  }}>
                    {EARN_ITEMS.map((item) => {
                      const hovered = hoveredEarnItem === item.key;
                      return (
                        <div
                          key={item.key}
                          onMouseEnter={() => setHoveredEarnItem(item.key)}
                          onMouseLeave={() => setHoveredEarnItem(null)}
                          style={{ display: 'flex', flexDirection: 'row', gap: 8, cursor: 'pointer' }}
                        >
                          <div style={{ padding: 2, display: 'flex', alignItems: 'flex-start', flexShrink: 0, marginTop: 1 }}>
                            <img
                              src={item.icon}
                              alt=""
                              style={{
                                width: 16, height: 16,
                                filter: hovered
                                  ? 'brightness(0) saturate(100%) invert(72%) sepia(43%) saturate(456%) hue-rotate(103deg) brightness(97%) contrast(90%)'
                                  : 'brightness(0) invert(1)',
                              }}
                            />
                          </div>
                          <div style={{
                            display: 'flex', flexDirection: 'column', gap: 4, flex: 1,
                            paddingBottom: item.hasBorder ? 16 : 0,
                            borderBottom: item.hasBorder ? '1px solid #252527' : 'none',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span style={{ fontSize: 14, fontWeight: 500, lineHeight: '1.43em', color: hovered ? '#5BD197' : '#F9F9FA' }}>
                                {item.label}
                              </span>
                              {hovered && (
                                <img
                                  src="/images/icon-arrow-right.svg"
                                  alt=""
                                  style={{ width: 16, height: 16, filter: 'brightness(0) saturate(100%) invert(72%) sepia(43%) saturate(456%) hue-rotate(103deg) brightness(97%) contrast(90%)' }}
                                />
                              )}
                            </div>
                            <span style={{ fontSize: 12, lineHeight: '1.33em', color: '#7A7A83' }}>
                              {item.description}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* About */}
              <button
                className="flex items-center rounded-lg transition-colors"
                style={{ gap: 6, padding: '8px 16px', color: '#7A7A83', fontSize: 14, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#F9F9FA')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#7A7A83')}
              >
                About
              </button>
            </nav>
          </div>

          {/* ── header functions ── */}
          <div className="flex items-center shrink-0" style={{ gap: 8 }}>
            {connected ? (
              <>
                {/* Chain selector */}
                <div ref={networkRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setNetworkOpen(v => !v)}
                    className="flex items-center justify-center rounded-lg transition-colors"
                    style={{
                      gap: 6, padding: '0 8px', height: 36, boxSizing: 'border-box',
                      border: `1px solid ${networkOpen ? '#44444B' : '#252527'}`,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#44444B')}
                    onMouseLeave={(e) => { if (!networkOpen) e.currentTarget.style.borderColor = '#252527'; }}
                  >
                    <img
                      src={NETWORKS.find(n => n.id === selectedNetwork)?.icon}
                      alt={selectedNetwork}
                      style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <span style={{ padding: 2, display: 'flex', color: '#fff' }}>
                      <ChevronDown />
                    </span>
                  </button>

                  {/* Network dropdown */}
                  {networkOpen && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 200,
                      width: 192, background: '#1B1B1C', borderRadius: 10,
                      boxShadow: '0px 0px 32px 0px rgba(0,0,0,0.2)',
                      overflow: 'hidden',
                    }}>
                      {/* Header */}
                      <div style={{ padding: '4px 8px 0' }}>
                        <span style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#7A7A83', lineHeight: '1.333em', padding: '4px 8px' }}>
                          Switch Network
                        </span>
                      </div>
                      {/* Items */}
                      <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {NETWORKS.map(network => {
                          const isActive = network.id === selectedNetwork;
                          return (
                            <div
                              key={network.id}
                              onClick={() => { setSelectedNetwork(network.id); setNetworkOpen(false); }}
                              onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = '#252527')}
                              onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = isActive ? '#252527' : 'transparent')}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '6px 8px', borderRadius: 8, cursor: 'pointer',
                                background: isActive ? '#252527' : 'transparent',
                              }}
                            >
                              <img
                                src={network.icon}
                                alt={network.label}
                                style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                              />
                              <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#F9F9FA', lineHeight: '1.4286em' }}>
                                {network.label}
                              </span>
                              {isActive && (
                                <span style={{ color: '#FFFFFF', display: 'flex', flexShrink: 0 }}>
                                  <CheckIcon />
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Fee */}
                <button
                  className="flex items-center justify-center rounded-lg transition-colors"
                  style={{ gap: 6, padding: '0 8px', border: '1px solid #252527', height: 36, boxSizing: 'border-box' }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#44444B')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#252527')}
                >
                  <img src="/images/icon-fee.png" alt="fee" style={{ width: 20, height: 20, padding: 2 }} />
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#F9F9FA', lineHeight: '20px' }}>0.00</span>
                  <span style={{
                    fontSize: 10, fontWeight: 500, textTransform: 'uppercase',
                    padding: '4px 8px', borderRadius: 9999,
                    background: 'rgba(22,194,132,0.1)', color: '#5BD197',
                    lineHeight: '12px', letterSpacing: '0.02em',
                  }}>
                    -0% Fee
                  </span>
                </button>

                {/* Balance */}
                <button
                  className="flex items-center justify-center rounded-lg transition-colors"
                  style={{ gap: 6, padding: '0 12px 0 8px', border: '1px solid #252527', height: 36, boxSizing: 'border-box' }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#44444B')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#252527')}
                >
                  <img src="/images/icon-wallet.png" alt="wallet" style={{ width: 20, height: 20, padding: 2, objectFit: 'cover' }} />
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#F9F9FA', lineHeight: '20px' }}>18.32</span>
                </button>

                {/* Avatar + user dropdown */}
                <div ref={avatarRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setUserDropdownOpen(v => !v)}
                    style={{
                      width: 32, height: 32, borderRadius: '50%',
                      border: '2px solid #0A0A0B',
                      overflow: 'hidden', padding: 0, cursor: 'pointer',
                      background: 'transparent', display: 'flex',
                    }}
                  >
                    <WalletAvatar size={32} />
                  </button>

                  {/* User dropdown */}
                  {userDropdownOpen && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 200,
                      width: 256, background: '#1B1B1C', borderRadius: 12,
                      boxShadow: '0px 0px 32px 0px rgba(0,0,0,0.2)',
                      overflow: 'hidden',
                    }}>
                      {/* Group 1: avatar + wallet info */}
                      <div style={{
                        display: 'flex', gap: 12, alignItems: 'center',
                        padding: 16, borderBottom: '1px solid #252527',
                      }}>
                        <WalletAvatar size={40} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontSize: 16, fontWeight: 500, color: '#F9F9FA', lineHeight: '1.5em' }}>
                              {MOCK_WALLET}
                            </span>
                            <button
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A7A83', display: 'flex', padding: 2, flexShrink: 0 }}
                              onClick={() => navigator.clipboard?.writeText('GQ98iA5Y')}
                            >
                              <CopyIcon />
                            </button>
                          </div>
                          <a
                            href="#"
                            onClick={e => e.preventDefault()}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 12, color: '#7A7A83', textDecoration: 'none' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#F9F9FA')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#7A7A83')}
                          >
                            Open in Explorer <ExternalLinkIcon />
                          </a>
                        </div>
                      </div>

                      {/* Group 2: menu items */}
                      <div style={{ padding: 8, borderBottom: '1px solid #252527', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {USER_MENU_ITEMS.map(item => {
                          const hovered = hoveredUserItem === item.key;
                          return (
                            <div
                              key={item.key}
                              onMouseEnter={() => setHoveredUserItem(item.key)}
                              onMouseLeave={() => setHoveredUserItem(null)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '6px 8px', borderRadius: 8, cursor: 'pointer',
                                background: hovered ? '#252527' : 'transparent',
                                transition: 'background 0.1s',
                              }}
                            >
                              <span style={{ color: '#7A7A83', display: 'flex', flexShrink: 0 }}>
                                <img
                                  src={item.icon}
                                  alt=""
                                  style={{ width: 20, height: 20, filter: 'brightness(0) invert(1)', opacity: 0.5 }}
                                />
                              </span>
                              <span style={{ fontSize: 14, fontWeight: 500, color: '#F9F9FA', lineHeight: '1.4286em' }}>
                                {item.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Group 3: disconnect */}
                      <div style={{ padding: 8 }}>
                        <div
                          onClick={() => { setConnected(false); setUserDropdownOpen(false); showToast('Wallet disconnected', "You've successfully disconnected your wallet"); }}
                          onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = 'rgba(253,94,103,0.08)')}
                          onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8, cursor: 'pointer', background: 'transparent' }}
                        >
                          <span style={{ color: '#FD5E67', display: 'flex', flexShrink: 0 }}>
                            <LogoutIcon />
                          </span>
                          <span style={{ fontSize: 14, fontWeight: 500, color: '#FD5E67', lineHeight: '1.4286em' }}>
                            Disconnect
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Not connected: show Connect Wallet button */
              <button
                onClick={() => setWalletOpen(true)}
                style={{
                  padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                  background: '#19FB9B', color: '#0A0A0B',
                  border: 'none', fontSize: 14, fontWeight: 500, lineHeight: '20px',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#10d882')}
                onMouseLeave={e => (e.currentTarget.style.background = '#19FB9B')}
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {pointsModalOpen && <PointsMarketModal onClose={() => setPointsModalOpen(false)} />}
      {walletOpen && (
        <ConnectWalletModal
          onClose={() => setWalletOpen(false)}
          onConnect={() => { setConnected(true); showToast('Wallet connected', "You've successfully connected your wallet"); }}
        />
      )}

      {/* Toast */}
      {toast && createPortal(
        <div style={{
          position: 'fixed', bottom: 24, left: 24, zIndex: 9999,
          background: '#1B1B1C', borderRadius: 10, padding: '12px 16px',
          display: 'flex', alignItems: 'flex-start', gap: 12,
          minWidth: 320, maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          animation: 'fadeInUp 0.2s ease',
        }}>
          {/* Success icon */}
          <div style={{ flexShrink: 0, marginTop: 2 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="10" fill="#16C284" fillOpacity="0.2" />
              <path d="M6 10.5l3 3 5-5" stroke="#16C284" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {/* Content */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#F9F9FA', lineHeight: '20px' }}>
              {toast.label}
            </div>
            <div style={{ fontSize: 12, color: '#7A7A83', lineHeight: '16px', marginTop: 2 }}>
              {toast.description}
            </div>
          </div>
          {/* Close */}
          <button
            onClick={() => setToast(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A7A83', padding: 0, flexShrink: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
            </svg>
          </button>
          {/* Timer bar */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, height: 3,
            background: '#16C284', borderRadius: '0 0 10px 10px',
            width: '100%', animation: 'shrinkWidth 4s linear forwards',
          }} />
        </div>,
        document.body
      )}
    </header>
  );
}
