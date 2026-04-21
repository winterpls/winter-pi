"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Zap, AlertCircle, Layers, Filter, Search, Plus, ArrowUpRight, Circle, Gauge, GitBranch, BookOpen, BarChart3, Eye, Star, ExternalLink, Copy, CheckCircle2, X, RefreshCw, Info, ShoppingCart, DollarSign } from 'lucide-react';

// ============================================================================
// MOCK DATA LAYER
// ============================================================================

type Asset = {
  sym: string; name: string; cat: string; px: number;
  chg24: number; chg7: number; vol: number; mcap: number;
  rv: number; atr: number; mom: number; rsi: number; beta: number; liq: number;
  basePx: number;   // original price for drift anchoring
};

const INITIAL_ASSETS: Asset[] = [
  { sym: 'BTC',  name: 'Bitcoin',   cat: 'L1',     basePx: 94820.15, px: 94820.15, chg24: 1.82,  chg7: 4.11,  vol: 32.1e9, mcap: 1.87e12, rv: 0.42, atr: 2890, mom: 82, rsi: 61, beta: 1.00, liq: 98 },
  { sym: 'ETH',  name: 'Ethereum',  cat: 'L1',     basePx: 3284.90,  px: 3284.90,  chg24: 2.41,  chg7: 6.82,  vol: 18.3e9, mcap: 395e9,   rv: 0.55, atr: 142,  mom: 76, rsi: 64, beta: 1.18, liq: 96 },
  { sym: 'SOL',  name: 'Solana',    cat: 'L1',     basePx: 198.44,   px: 198.44,   chg24: 4.22,  chg7: 12.4,  vol: 4.2e9,  mcap: 91e9,    rv: 0.78, atr: 12.8, mom: 91, rsi: 72, beta: 1.65, liq: 88 },
  { sym: 'AVAX', name: 'Avalanche', cat: 'L1',     basePx: 38.21,    px: 38.21,    chg24: -1.15, chg7: 2.30,  vol: 620e6,  mcap: 15.2e9,  rv: 0.82, atr: 2.9,  mom: 54, rsi: 49, beta: 1.72, liq: 74 },
  { sym: 'ARB',  name: 'Arbitrum',  cat: 'L2',     basePx: 0.8245,   px: 0.8245,   chg24: 3.10,  chg7: -2.80, vol: 310e6,  mcap: 3.4e9,   rv: 0.88, atr: 0.07, mom: 42, rsi: 46, beta: 1.88, liq: 69 },
  { sym: 'OP',   name: 'Optimism',  cat: 'L2',     basePx: 1.942,    px: 1.942,    chg24: 2.55,  chg7: 1.40,  vol: 188e6,  mcap: 2.1e9,   rv: 0.91, atr: 0.18, mom: 48, rsi: 52, beta: 1.91, liq: 66 },
  { sym: 'LINK', name: 'Chainlink', cat: 'Oracle', basePx: 21.08,    px: 21.08,    chg24: 0.95,  chg7: 5.92,  vol: 420e6,  mcap: 12.8e9,  rv: 0.68, atr: 1.4,  mom: 71, rsi: 59, beta: 1.34, liq: 84 },
  { sym: 'UNI',  name: 'Uniswap',   cat: 'DeFi',   basePx: 11.62,    px: 11.62,    chg24: -0.44, chg7: 3.10,  vol: 210e6,  mcap: 7.0e9,   rv: 0.71, atr: 0.8,  mom: 63, rsi: 55, beta: 1.41, liq: 80 },
  { sym: 'AAVE', name: 'Aave',      cat: 'DeFi',   basePx: 312.45,   px: 312.45,   chg24: 1.74,  chg7: 7.22,  vol: 180e6,  mcap: 4.6e9,   rv: 0.76, atr: 22.1, mom: 78, rsi: 63, beta: 1.52, liq: 78 },
  { sym: 'RNDR', name: 'Render',    cat: 'AI',     basePx: 9.18,     px: 9.18,     chg24: 6.10,  chg7: 18.2,  vol: 410e6,  mcap: 4.2e9,   rv: 1.02, atr: 0.9,  mom: 94, rsi: 78, beta: 1.95, liq: 72 },
  { sym: 'FET',  name: 'Fetch.ai',  cat: 'AI',     basePx: 2.34,     px: 2.34,     chg24: 5.82,  chg7: 21.4,  vol: 340e6,  mcap: 2.8e9,   rv: 1.14, atr: 0.24, mom: 92, rsi: 76, beta: 2.05, liq: 68 },
  { sym: 'MATIC',name: 'Polygon',   cat: 'L2',     basePx: 0.5124,   px: 0.5124,   chg24: -2.30, chg7: -4.10, vol: 290e6,  mcap: 5.1e9,   rv: 0.79, atr: 0.04, mom: 28, rsi: 38, beta: 1.55, liq: 82 },
  { sym: 'ATOM', name: 'Cosmos',    cat: 'L1',     basePx: 6.92,     px: 6.92,     chg24: -0.85, chg7: -1.90, vol: 118e6,  mcap: 2.7e9,   rv: 0.84, atr: 0.5,  mom: 36, rsi: 42, beta: 1.48, liq: 70 },
  { sym: 'DOGE', name: 'Dogecoin',  cat: 'Meme',   basePx: 0.3812,   px: 0.3812,   chg24: 3.44,  chg7: 8.20,  vol: 1.8e9,  mcap: 55e9,    rv: 0.95, atr: 0.03, mom: 74, rsi: 66, beta: 1.82, liq: 90 },
  { sym: 'LDO',  name: 'Lido',      cat: 'DeFi',   basePx: 2.18,     px: 2.18,     chg24: 1.22,  chg7: 4.60,  vol: 96e6,   mcap: 1.9e9,   rv: 0.88, atr: 0.18, mom: 61, rsi: 57, beta: 1.61, liq: 71 },
  { sym: 'INJ',  name: 'Injective', cat: 'DeFi',   basePx: 32.11,    px: 32.11,    chg24: 4.90,  chg7: 14.3,  vol: 280e6,  mcap: 3.0e9,   rv: 0.94, atr: 2.4,  mom: 88, rsi: 73, beta: 1.88, liq: 74 },
];

const seed = (n: number) => { let x = Math.sin(n) * 10000; return x - Math.floor(x); };

// Drift prices realistically â€” each tick each asset takes a small random step
// whose size is proportional to its realized volatility.
const driftPrices = (assets: Asset[], tickCount: number): Asset[] => {
  return assets.map((a, i) => {
    // ~0.3% typical step for BTC, scaled up by asset's rv
    const stepSize = 0.002 * (a.rv / 0.5);
    const direction = seed(tickCount * 0.7 + i * 1.3) - 0.5;
    const delta = direction * stepSize * 2;
    const newPx = Math.max(a.px * (1 + delta), 0.0001);
    // 24h change drifts in sync with recent price vs basePx (approximate)
    const chg24 = ((newPx / a.basePx) - 1) * 100;
    return { ...a, px: newPx, chg24: chg24 * 0.5 + a.chg24 * 0.5 };
  });
};

// ============================================================================
// PORTFOLIO STATE â€” persisted to localStorage
// ============================================================================

type Position = {
  sym: string;
  qty: number;
  avg: number;
  opened: number;       // timestamp
  thesis?: string;
};

type JournalEntry = {
  id: number;
  date: string;
  sym: string;
  side: 'BUY' | 'SELL';
  qty: number;
  px: number;
  pnl: number | null;   // realized PnL on sells, null on buys
  reason: string;
};

type PortfolioState = {
  cash: number;
  positions: Position[];
  journal: JournalEntry[];
  equityHistory: { t: number; v: number }[];
  startedAt: number;
  initialCapital: number;
};

const INITIAL_STATE: PortfolioState = {
  cash: 100000,
  positions: [],
  journal: [],
  equityHistory: [{ t: Date.now(), v: 100000 }],
  startedAt: Date.now(),
  initialCapital: 100000,
};

const STORAGE_KEY = 'winterpi_portfolio_v2';
const WELCOME_KEY = 'winterpi_welcome_seen';

const loadState = (): PortfolioState => {
  if (typeof window === 'undefined') return INITIAL_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw);
    if (!parsed.cash && parsed.cash !== 0) return INITIAL_STATE;
    return parsed;
  } catch { return INITIAL_STATE; }
};

const saveState = (state: PortfolioState) => {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
};

// ============================================================================
// UTILITIES
// ============================================================================

const fmtUsd = (n: number) => {
  if (!isFinite(n)) return '$0';
  if (Math.abs(n) >= 1e9) return `$${(n/1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n/1e6).toFixed(2)}M`;
  if (Math.abs(n) >= 1e3) return `$${(n/1e3).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
};
const fmtPct = (n: number, digits = 2) => `${n >= 0 ? '+' : ''}${n.toFixed(digits)}%`;
const fmtNum = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });

const computeNAV = (state: PortfolioState, assets: Asset[]) => {
  let nav = state.cash;
  for (const p of state.positions) {
    const a = assets.find(x => x.sym === p.sym);
    if (a) nav += p.qty * a.px;
  }
  return nav;
};

// ============================================================================
// UI PRIMITIVES
// ============================================================================

const Panel = ({ title, subtitle, children, action, className = '', dense = false }: any) => (
  <div className={`bg-[#0f1d33] border border-[#1e2f4a] rounded-sm ${className}`}>
    {title && (
      <div className={`flex items-center justify-between border-b border-[#1e2f4a] ${dense ? 'px-3 py-2' : 'px-4 py-3'}`}>
        <div>
          <div className="text-[10px] tracking-[0.18em] text-[#6b7280] uppercase font-mono">{title}</div>
          {subtitle && <div className="text-xs text-[#9ca3af] mt-0.5">{subtitle}</div>}
        </div>
        {action}
      </div>
    )}
    <div>{children}</div>
  </div>
);

const Stat = ({ label, value, delta, deltaType, small = false }: any) => {
  const color = deltaType === 'pos' ? 'text-[#60a5fa]' : deltaType === 'neg' ? 'text-[#ff5472]' : 'text-[#9ca3af]';
  return (
    <div>
      <div className="text-[10px] tracking-[0.18em] text-[#6b7280] uppercase font-mono mb-1">{label}</div>
      <div className={`${small ? 'text-lg' : 'text-2xl'} font-mono text-white tabular-nums tracking-tight`}>{value}</div>
      {delta !== undefined && <div className={`text-xs font-mono mt-0.5 ${color} tabular-nums`}>{delta}</div>}
    </div>
  );
};

const Pill = ({ children, tone = 'neutral', size = 'sm' }: any) => {
  const tones: any = {
    pos:  'bg-[#0f2a44] text-[#60a5fa] border-[#1e3a5f]',
    neg:  'bg-[#2a0f17] text-[#ff5472] border-[#4a1d29]',
    warn: 'bg-[#2a1f0a] text-[#ffb627] border-[#4a3a15]',
    info: 'bg-[#0f2a44] text-[#60a5fa] border-[#1e3a5f]',
    neutral: 'bg-[#152544] text-[#9ca3af] border-[#1e2f4a]',
    accent: 'bg-[#1a0f2a] text-[#c084fc] border-[#2e1d4a]',
  };
  const sizes: any = { sm: 'text-[10px] px-1.5 py-0.5', md: 'text-xs px-2 py-1' };
  return <span className={`inline-flex items-center gap-1 border rounded-sm font-mono tracking-wider uppercase ${tones[tone]} ${sizes[size]}`}>{children}</span>;
};

// ============================================================================
// TRADE MODAL â€” the heart of the interactive simulator
// ============================================================================

const TradeModal = ({ open, onClose, mode, asset, position, state, onConfirm }: any) => {
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) { setQty(''); setReason(''); }
  }, [open, asset, position]);

  if (!open || !asset) return null;

  const isBuy = mode === 'buy';
  const numQty = parseFloat(qty) || 0;
  const cost = numQty * asset.px;
  const availableCash = state.cash;
  const availableQty = position?.qty || 0;

  const canExecute = isBuy
    ? (numQty > 0 && cost <= availableCash)
    : (numQty > 0 && numQty <= availableQty);

  const pnlOnSell = !isBuy && position
    ? (asset.px - position.avg) * numQty
    : 0;

  const setMax = () => {
    if (isBuy) {
      const max = (availableCash / asset.px) * 0.999; // leave tiny buffer
      setQty(max.toFixed(6));
    } else {
      setQty(availableQty.toString());
    }
  };

  const setPct = (p: number) => {
    if (isBuy) {
      setQty(((availableCash * p / 100) / asset.px).toFixed(6));
    } else {
      setQty((availableQty * p / 100).toFixed(6));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0f1d33] border border-[#1e2f4a] max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="border-b border-[#1e2f4a] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`text-xs font-mono tracking-wider uppercase ${isBuy ? 'text-[#60a5fa]' : 'text-[#ff5472]'}`}>
              {isBuy ? 'â–² BUY' : 'â–¼ SELL'}
            </div>
            <div className="text-sm font-mono">{asset.sym}</div>
            <div className="text-xs text-[#9ca3af]">{asset.name}</div>
          </div>
          <button onClick={onClose} className="text-[#6b7280] hover:text-white"><X size={16} /></button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] font-mono tracking-wider text-[#6b7280] uppercase">Live Price</div>
              <div className="text-lg font-mono tabular-nums">${asset.px < 1 ? asset.px.toFixed(4) : fmtNum(asset.px)}</div>
              <div className={`text-xs font-mono ${asset.chg24 >= 0 ? 'text-[#60a5fa]' : 'text-[#ff5472]'}`}>
                {fmtPct(asset.chg24)} (24h)
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-wider text-[#6b7280] uppercase">
                {isBuy ? 'Available Cash' : 'You Own'}
              </div>
              <div className="text-lg font-mono tabular-nums">
                {isBuy ? `$${fmtNum(availableCash)}` : `${availableQty.toFixed(6)} ${asset.sym}`}
              </div>
              {!isBuy && position && (
                <div className="text-xs font-mono text-[#9ca3af]">Avg cost ${fmtNum(position.avg)}</div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] font-mono tracking-wider text-[#6b7280] uppercase">Quantity ({asset.sym})</div>
              <div className="flex gap-1">
                {[25, 50, 75].map(p => (
                  <button key={p} onClick={() => setPct(p)} className="text-[10px] font-mono text-[#60a5fa] hover:text-white border border-[#1e2f4a] px-1.5 py-0.5">{p}%</button>
                ))}
                <button onClick={setMax} className="text-[10px] font-mono text-[#60a5fa] hover:text-white border border-[#1e2f4a] px-1.5 py-0.5">MAX</button>
              </div>
            </div>
            <input type="number" step="any" value={qty} onChange={e => setQty(e.target.value)}
                   placeholder="0.00"
                   className="w-full bg-[#0a1628] border border-[#1e2f4a] px-3 py-2 text-lg font-mono tabular-nums focus:border-[#60a5fa] outline-none"/>
          </div>

          <div className="bg-[#0a1628] border border-[#1e2f4a] p-3 space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#9ca3af]">{isBuy ? 'Total Cost' : 'Proceeds'}</span>
              <span className="tabular-nums">${fmtNum(cost)}</span>
            </div>
            {isBuy ? (
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#9ca3af]">Cash After</span>
                <span className={`tabular-nums ${cost > availableCash ? 'text-[#ff5472]' : ''}`}>
                  ${fmtNum(availableCash - cost)}
                </span>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#9ca3af]">Realized PnL</span>
                  <span className={`tabular-nums ${pnlOnSell >= 0 ? 'text-[#60a5fa]' : 'text-[#ff5472]'}`}>
                    {pnlOnSell >= 0 ? '+' : ''}${fmtNum(pnlOnSell)}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#9ca3af]">Remaining</span>
                  <span className="tabular-nums">{(availableQty - numQty).toFixed(6)} {asset.sym}</span>
                </div>
              </>
            )}
          </div>

          <div>
            <div className="text-[10px] font-mono tracking-wider text-[#6b7280] uppercase mb-1">Reason / Thesis (optional)</div>
            <textarea value={reason} onChange={e => setReason(e.target.value)}
                      placeholder={isBuy ? 'Why are you buying? e.g. momentum breakout, trend continuation...' : 'Why are you selling? e.g. hit target, stop triggered, thesis changed...'}
                      rows={2}
                      className="w-full bg-[#0a1628] border border-[#1e2f4a] px-3 py-2 text-xs font-sans focus:border-[#60a5fa] outline-none resize-none"/>
          </div>

          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 border border-[#1e2f4a] px-4 py-2 text-xs font-mono tracking-wider uppercase hover:border-[#2d4468]">Cancel</button>
            <button
              disabled={!canExecute}
              onClick={() => onConfirm(numQty, reason, pnlOnSell)}
              className={`flex-1 px-4 py-2 text-xs font-mono tracking-wider uppercase text-black font-medium transition-colors ${
                canExecute
                  ? (isBuy ? 'bg-[#60a5fa] hover:bg-[#3b82f6]' : 'bg-[#ff5472] hover:bg-[#e04060]')
                  : 'bg-[#1e2f4a] text-[#6b7280] cursor-not-allowed'
              }`}>
              {isBuy ? `Buy ${asset.sym}` : `Sell ${asset.sym}`}
            </button>
          </div>
          {!canExecute && numQty > 0 && (
            <div className="text-[11px] text-[#ff5472] font-mono">
              {isBuy ? 'Insufficient cash for this trade' : 'You don\'t own that much'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// WELCOME MODAL â€” first-time visitors
// ============================================================================

const WelcomeModal = ({ onClose }: any) => (
  <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
    <div className="bg-[#0f1d33] border border-[#1e2f4a] max-w-lg w-full">
      <div className="border-b border-[#1e2f4a] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 relative">
            <div className="absolute inset-0 bg-[#60a5fa]/30 rotate-45" />
            <div className="absolute inset-1 border border-[#60a5fa]" />
          </div>
          <div className="font-mono tracking-[0.2em] text-sm">WELCOME TO WINTER PI</div>
        </div>
      </div>
      <div className="p-6 space-y-4 text-sm text-[#9ca3af] leading-relaxed">
        <p className="text-white text-base">Hey â€” thanks for checking this out.</p>
        <p>Winter Pi is a <span className="text-[#60a5fa]">simulation</span>. Everything here is fake: the prices, the signals, the news, the market regime. Nothing is connected to real crypto markets.</p>
        <p>You start with <span className="text-white font-mono">$100,000</span> of fake money. Buy and sell coins, track your performance, test strategies, and learn how professional quant metrics work â€” all with zero real risk.</p>
        <div className="bg-[#0a1628] border border-[#1e2f4a] p-3 text-xs font-mono">
          <div className="text-[#ffb627] mb-2">âš  SIMULATION ONLY</div>
          <div className="space-y-1 text-[#9ca3af]">
            <div>â€¢ Prices drift every few seconds, but they're fake</div>
            <div>â€¢ "Signals" are pre-scripted examples, not real market data</div>
            <div>â€¢ Your portfolio saves to this browser only â€” no account needed</div>
            <div>â€¢ Nothing here is investment advice</div>
          </div>
        </div>
        <p>Built by <span className="text-white">James Lee</span> in Stroudsburg, PA as a learning project.</p>
      </div>
      <div className="px-5 pb-5">
        <button onClick={onClose} className="w-full bg-[#60a5fa] text-black px-4 py-3 text-xs font-mono tracking-[0.18em] uppercase hover:bg-[#3b82f6]">
          Got it â€” let me in
        </button>
      </div>
    </div>
  </div>
);

// ============================================================================
// RESET CONFIRMATION MODAL
// ============================================================================

const ResetModal = ({ onClose, onConfirm }: any) => (
  <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-[#0f1d33] border border-[#1e2f4a] max-w-sm w-full" onClick={e => e.stopPropagation()}>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <AlertCircle size={18} className="text-[#ffb627]" />
          <div className="font-mono tracking-wider text-sm">RESET PORTFOLIO?</div>
        </div>
        <p className="text-sm text-[#9ca3af] leading-relaxed">
          This will wipe all your positions, journal entries, and trade history. You'll start over with $100,000 fresh cash. Can't be undone.
        </p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 border border-[#1e2f4a] px-4 py-2 text-xs font-mono tracking-wider uppercase hover:border-[#2d4468]">Cancel</button>
          <button onClick={onConfirm} className="flex-1 bg-[#ff5472] text-black px-4 py-2 text-xs font-mono tracking-wider uppercase hover:bg-[#e04060]">Reset</button>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================================
// LANDING
// ============================================================================

const Landing = ({ onEnter }: any) => (
  <div className="min-h-screen bg-[#0a1628] text-white">
    <div className="fixed inset-0 opacity-[0.025] pointer-events-none"
         style={{backgroundImage:'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize:'48px 48px'}}/>

    <nav className="relative border-b border-[#1e2f4a] px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 relative">
          <div className="absolute inset-0 bg-[#60a5fa]/20 rotate-45" />
          <div className="absolute inset-1 border border-[#60a5fa]" />
        </div>
        <div className="font-mono tracking-[0.24em] text-sm">WINTER PI</div>
        <Pill tone="info" size="sm">SIM</Pill>
      </div>
      <button onClick={onEnter} className="text-xs font-mono tracking-wider uppercase bg-[#60a5fa] text-black px-4 py-2 hover:bg-[#3b82f6] transition-colors">
        Open Terminal â†’
      </button>
    </nav>

    <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20">
      <div className="grid md:grid-cols-12 gap-10 items-end">
        <div className="md:col-span-7">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-[#60a5fa]" />
            <span className="text-[10px] font-mono tracking-[0.24em] text-[#60a5fa] uppercase">Crypto Paper Trading Â· by James Lee</span>
          </div>
          <h1 className="text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-tight font-light text-white">
            Practice crypto<br/>
            <span className="italic font-serif text-[#60a5fa]">investing</span> without<br/>
            risking real money.
          </h1>
          <p className="text-[#9ca3af] text-base md:text-lg mt-8 max-w-xl leading-relaxed">
            Winter Pi is a free crypto paper-trading simulator. Buy and sell coins with $100K of fake money, watch prices drift live, and learn how professional quant metrics like Sharpe ratio and drawdown actually work.
          </p>
          <div className="flex items-center gap-4 mt-10">
            <button onClick={onEnter} className="group bg-[#60a5fa] text-black px-6 py-3 font-mono text-xs tracking-[0.18em] uppercase hover:bg-[#3b82f6] transition-colors flex items-center gap-2">
              Start Trading
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
          <div className="mt-6 inline-flex items-center gap-2 text-[10px] font-mono tracking-wider uppercase text-[#ffb627] border border-[#4a3a15] bg-[#2a1f0a] px-2 py-1">
            <AlertCircle size={11}/> Simulated data Â· not real markets
          </div>
        </div>

        <div className="md:col-span-5">
          <div className="bg-[#0f1d33] border border-[#1e2f4a] rounded-sm p-4">
            <div className="flex items-center justify-between border-b border-[#1e2f4a] pb-2 mb-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#ff5472]"/>
                <div className="w-2 h-2 rounded-full bg-[#ffb627]"/>
                <div className="w-2 h-2 rounded-full bg-[#60a5fa]"/>
              </div>
              <div className="text-[10px] font-mono tracking-wider text-[#6b7280]">WINTERPI://PORTFOLIO</div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div><div className="text-[9px] text-[#6b7280] font-mono uppercase">NAV</div><div className="text-lg font-mono">$104,213</div></div>
              <div><div className="text-[9px] text-[#6b7280] font-mono uppercase">Return</div><div className="text-lg font-mono text-[#60a5fa]">+4.2%</div></div>
              <div><div className="text-[9px] text-[#6b7280] font-mono uppercase">Positions</div><div className="text-lg font-mono">3</div></div>
            </div>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={Array.from({length: 60}, (_, i) => ({v: 100000 + seed(i) * 5000 + i * 80}))}>
                  <defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#60a5fa" stopOpacity={0.35}/><stop offset="100%" stopColor="#60a5fa" stopOpacity={0}/></linearGradient></defs>
                  <Area type="monotone" dataKey="v" stroke="#60a5fa" strokeWidth={1.5} fill="url(#ga)"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-px bg-[#1e2f4a] border border-[#1e2f4a]">
        {[
          { k: 'Starting cash', v: '$100K', sub: 'fake money, real learning' },
          { k: 'Coins tracked', v: '16',    sub: 'L1 Â· L2 Â· DeFi Â· AI Â· Meme' },
          { k: 'Price updates', v: 'Live',  sub: 'simulated drift every 3s' },
          { k: 'Cost',          v: 'Free',  sub: 'forever, no signup' },
        ].map((s, i) => (
          <div key={i} className="bg-[#0a1628] p-5">
            <div className="text-3xl font-mono tabular-nums text-white tracking-tight">{s.v}</div>
            <div className="text-[10px] font-mono tracking-[0.18em] text-[#9ca3af] uppercase mt-1">{s.k}</div>
            <div className="text-xs text-[#6b7280] mt-2">{s.sub}</div>
          </div>
        ))}
      </div>
    </section>

    <section className="relative max-w-7xl mx-auto px-6 py-20 border-t border-[#1e2f4a]">
      <div className="grid md:grid-cols-12 gap-10">
        <div className="md:col-span-4">
          <div className="text-[10px] font-mono tracking-[0.24em] text-[#60a5fa] uppercase mb-4">What's inside</div>
          <h2 className="text-3xl font-light tracking-tight leading-tight">Learn the tools pros use â€” without losing money figuring them out.</h2>
        </div>
        <div className="md:col-span-8 grid md:grid-cols-2 gap-px bg-[#1e2f4a]">
          {[
            { icon: ShoppingCart, t: 'Live Paper Trading', d: 'Buy and sell 16 crypto assets with fake money. Prices drift in real time. Your portfolio saves in your browser.' },
            { icon: Gauge,        t: 'Portfolio Health',   d: 'Hover any metric to learn what it means. Sharpe, drawdown, beta, volatility â€” explained in plain English.' },
            { icon: BarChart3,    t: 'Strategy Lab',        d: 'Test trading strategies against historical patterns. Compare results side by side.' },
            { icon: BookOpen,     t: 'Trade Journal',       d: 'Every trade auto-logs with your reasoning. Review your process, spot your patterns, improve over time.' },
          ].map((p, i) => (
            <div key={i} className="bg-[#0a1628] p-6">
              <p.icon size={18} className="text-[#60a5fa] mb-4" />
              <div className="text-sm font-mono tracking-wider uppercase mb-2">{p.t}</div>
              <div className="text-sm text-[#9ca3af] leading-relaxed">{p.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="relative border-t border-[#1e2f4a]">
      <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div>
          <div className="text-[10px] font-mono tracking-[0.24em] text-[#6b7280] uppercase mb-3">Simulation only Â· no real capital at risk</div>
          <h3 className="text-4xl font-light tracking-tight max-w-xl leading-tight">Start paper trading. See if you'd make it as a quant.</h3>
        </div>
        <button onClick={onEnter} className="bg-[#60a5fa] text-black px-6 py-3 font-mono text-xs tracking-[0.18em] uppercase hover:bg-[#3b82f6] transition-colors flex items-center gap-2">
          Open Terminal <ArrowUpRight size={14} />
        </button>
      </div>
      <div className="border-t border-[#1e2f4a] px-6 py-4 flex flex-col md:flex-row justify-between gap-2 text-[10px] font-mono tracking-wider text-[#6b7280] uppercase">
        <div>WINTER PI Â· BUILT BY JAMES LEE Â· STROUDSBURG, PA Â· SIMULATION ONLY</div>
        <div className="flex gap-4">
          <a href="https://github.com/winterpls/winter-pi" target="_blank" rel="noopener" className="hover:text-white transition-colors">SOURCE â†’</a>
          <a href="https://linkedin.com/in/james-lee-032a04401" target="_blank" rel="noopener" className="hover:text-white transition-colors">LINKEDIN â†’</a>
        </div>
      </div>
    </section>
  </div>
);

// ============================================================================
// DEMO BANNER â€” always visible
// ============================================================================

const DemoBanner = () => (
  <div className="bg-[#2a1f0a] border-b border-[#4a3a15] px-4 h-7 flex items-center justify-center gap-2 text-[10px] font-mono tracking-wider uppercase text-[#ffb627] shrink-0">
    <AlertCircle size={11}/>
    <span>DEMO MODE Â· All prices, signals, and data are simulated Â· Not tracking real markets</span>
  </div>
);

// ============================================================================
// SHELL
// ============================================================================

const NAV = [
  { id: 'dashboard',  label: 'Dashboard',  icon: Activity },
  { id: 'portfolio',  label: 'Portfolio',  icon: Layers },
  { id: 'trade',      label: 'Trade',      icon: ShoppingCart },
  { id: 'strategies', label: 'Strategy Lab', icon: GitBranch },
  { id: 'journal',    label: 'Journal',    icon: BookOpen },
];

const Shell = ({ page, setPage, children, onExit, state, assets, onReset }: any) => {
  const [clock, setClock] = useState(new Date());
  const [showReset, setShowReset] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const nav = computeNAV(state, assets);
  const ret = ((nav - state.initialCapital) / state.initialCapital) * 100;

  return (
    <div className="min-h-screen bg-[#0a1628] text-white flex flex-col">
      <DemoBanner />
      <div className="border-b border-[#1e2f4a] flex items-center justify-between px-4 h-12 shrink-0">
        <div className="flex items-center gap-6">
          <button onClick={onExit} className="flex items-center gap-2 group">
            <div className="w-5 h-5 relative">
              <div className="absolute inset-0 bg-[#60a5fa]/20 rotate-45 group-hover:bg-[#60a5fa]/30" />
              <div className="absolute inset-1 border border-[#60a5fa]" />
            </div>
            <div className="font-mono tracking-[0.20em] text-xs">WINTER PI</div>
          </button>
          <div className="hidden md:flex items-center gap-1">
            {NAV.map(n => (
              <button key={n.id} onClick={() => setPage(n.id)}
                className={`flex items-center gap-1.5 px-3 h-8 text-[11px] font-mono tracking-wider uppercase transition-colors ${
                  page === n.id ? 'bg-[#0f1d33] text-white border-t border-[#60a5fa]' : 'text-[#6b7280] hover:text-white'
                }`}>
                <n.icon size={12} />
                {n.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono tracking-wider text-[#6b7280]">
          <div className="hidden md:flex items-center gap-2 text-white">
            <span>NAV</span>
            <span className="tabular-nums">${fmtNum(nav)}</span>
            <span className={ret >= 0 ? 'text-[#60a5fa]' : 'text-[#ff5472]'}>{fmtPct(ret, 2)}</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Circle size={6} className="fill-[#60a5fa] text-[#60a5fa] animate-pulse" />
            <span>SIM LIVE</span>
          </div>
          <button onClick={() => setShowReset(true)} className="text-[#6b7280] hover:text-[#ff5472] border border-[#1e2f4a] px-2 py-1 flex items-center gap-1" title="Reset portfolio">
            <RefreshCw size={10}/>
            <span className="hidden md:inline">RESET</span>
          </button>
        </div>
      </div>

      <div className="md:hidden border-b border-[#1e2f4a] flex overflow-x-auto">
        {NAV.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)}
            className={`shrink-0 flex items-center gap-1.5 px-3 h-9 text-[10px] font-mono tracking-wider uppercase ${
              page === n.id ? 'text-white border-t border-[#60a5fa] bg-[#0f1d33]' : 'text-[#6b7280]'
            }`}>
            <n.icon size={11} />
            {n.label}
          </button>
        ))}
      </div>

      <div className="border-b border-[#1e2f4a] bg-[#0f1d33] h-8 flex items-center overflow-hidden shrink-0">
        <div className="flex gap-6 whitespace-nowrap animate-[scroll_60s_linear_infinite] pl-4">
          {[...assets, ...assets].map((a: Asset, i: number) => (
            <div key={i} className="flex items-center gap-2 text-[11px] font-mono">
              <span className="text-[#9ca3af]">{a.sym}</span>
              <span className="tabular-nums">{a.px < 1 ? a.px.toFixed(4) : fmtNum(a.px)}</span>
              <span className={`tabular-nums ${a.chg24 >= 0 ? 'text-[#60a5fa]' : 'text-[#ff5472]'}`}>
                {a.chg24 >= 0 ? 'â–²' : 'â–¼'} {Math.abs(a.chg24).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
        <style>{`@keyframes scroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }`}</style>
      </div>

      <div className="flex-1 overflow-auto">{children}</div>

      <div className="border-t border-[#1e2f4a] h-7 flex items-center justify-between px-4 text-[10px] font-mono tracking-wider text-[#6b7280] shrink-0 bg-[#091324]">
        <div className="flex items-center gap-4">
          <span>DATA: SIM_ENGINE_V2</span>
          <span className="hidden md:inline">CASH: ${fmtNum(state.cash)}</span>
          <span className="hidden md:inline">POSITIONS: {state.positions.length}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>JAMES LEE Â· STROUDSBURG PA</span>
        </div>
      </div>

      {showReset && <ResetModal onClose={() => setShowReset(false)} onConfirm={() => { onReset(); setShowReset(false); }} />}
    </div>
  );
};

// ============================================================================
// DASHBOARD
// ============================================================================

const Dashboard = ({ state, assets, onOpenBuy }: any) => {
  const nav = computeNAV(state, assets);
  const ret = ((nav - state.initialCapital) / state.initialCapital) * 100;
  const equityHistory = state.equityHistory.slice(-200);
  const invested = nav - state.cash;
  const cashPct = (state.cash / nav) * 100;

  // derive a live top signals list by sorting assets by momentum
  const topSignals = [...assets].sort((a, b) => b.mom - a.mom).slice(0, 6);

  return (
    <div className="p-4 space-y-4 max-w-[1600px] mx-auto">
      {state.positions.length === 0 && (
        <div className="bg-[#0f2a44] border border-[#1e3a5f] p-4 flex items-center gap-3">
          <Info size={16} className="text-[#60a5fa] shrink-0" />
          <div className="flex-1 text-sm">
            <span className="text-[#60a5fa] font-medium">Welcome.</span>{' '}
            <span className="text-[#9ca3af]">You have $100,000 in simulated cash. Head to the Trade tab to start buying.</span>
          </div>
          <button onClick={onOpenBuy} className="text-xs font-mono tracking-wider uppercase bg-[#60a5fa] text-black px-3 py-1.5 hover:bg-[#3b82f6]">Trade â†’</button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#1e2f4a] border border-[#1e2f4a]">
        <div className="bg-[#0f1d33] p-4"><Stat label="Portfolio NAV" value={`$${fmtNum(nav)}`} delta={fmtPct(ret)} deltaType={ret >= 0 ? 'pos' : 'neg'} /></div>
        <div className="bg-[#0f1d33] p-4"><Stat label="Cash" value={`$${fmtNum(state.cash)}`} delta={`${cashPct.toFixed(1)}%`} deltaType="neutral"/></div>
        <div className="bg-[#0f1d33] p-4"><Stat label="Invested" value={`$${fmtNum(invested)}`} delta={`${state.positions.length} positions`} deltaType="neutral"/></div>
        <div className="bg-[#0f1d33] p-4"><Stat label="Total Trades" value={state.journal.length} delta={`${state.journal.filter(j => j.side === 'SELL').length} closed`} deltaType="neutral"/></div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <Panel title="EQUITY CURVE Â· LIVE" subtitle={`Since ${new Date(state.startedAt).toLocaleDateString()}`} className="col-span-12 lg:col-span-8">
          <div className="p-4 pt-2">
            <div className="h-56">
              {equityHistory.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={equityHistory}>
                    <defs><linearGradient id="eq" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#60a5fa" stopOpacity={0.3}/><stop offset="100%" stopColor="#60a5fa" stopOpacity={0}/></linearGradient></defs>
                    <XAxis dataKey="t" stroke="#6b7280" tick={{fontSize: 10, fontFamily: 'ui-monospace'}} tickLine={false} axisLine={{stroke:'#1e2f4a'}} tickFormatter={(t) => new Date(t).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}/>
                    <YAxis stroke="#6b7280" tick={{fontSize: 10, fontFamily: 'ui-monospace'}} tickLine={false} axisLine={{stroke:'#1e2f4a'}} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{background:'#0f1d33', border:'1px solid #1e2f4a', fontSize: 11, fontFamily: 'ui-monospace'}} labelFormatter={(t) => new Date(t).toLocaleString()}/>
                    <ReferenceLine y={state.initialCapital} stroke="#6b7280" strokeDasharray="3 3" />
                    <Area type="monotone" dataKey="v" stroke="#60a5fa" strokeWidth={1.8} fill="url(#eq)" name="Portfolio"/>
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-[#6b7280]">Equity curve builds as you tradeâ€¦</div>
              )}
            </div>
          </div>
        </Panel>

        <Panel title="TOP MOMENTUM Â· LIVE" subtitle="Highest scoring assets Â· click to trade" className="col-span-12 lg:col-span-4">
          <div className="divide-y divide-[#1e2f4a]">
            {topSignals.map(s => (
              <button key={s.sym} onClick={() => onOpenBuy(s)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#102544] transition-colors text-left">
                <div className="w-10 text-sm font-mono">{s.sym}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Pill tone={s.mom >= 80 ? 'pos' : 'warn'}>{s.mom >= 80 ? 'Momentum' : 'Watch'}</Pill>
                    <span className={`text-[11px] font-mono tabular-nums ${s.chg24 >= 0 ? 'text-[#60a5fa]' : 'text-[#ff5472]'}`}>{fmtPct(s.chg24)}</span>
                  </div>
                  <div className="text-[11px] text-[#9ca3af] mt-0.5">${s.px < 1 ? s.px.toFixed(4) : fmtNum(s.px)}</div>
                </div>
                <div className="font-mono tabular-nums text-sm text-[#60a5fa]">{s.mom}</div>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="RECENT TRADES" className="col-span-12 lg:col-span-6">
          {state.journal.length === 0 ? (
            <div className="p-6 text-sm text-[#6b7280] text-center">No trades yet. Head to the Trade tab to make your first.</div>
          ) : (
            <table className="w-full text-xs font-mono">
              <thead><tr className="text-[10px] tracking-wider uppercase text-[#6b7280] border-b border-[#1e2f4a]">
                <th className="text-left px-4 py-2 font-normal">Time</th>
                <th className="text-left py-2 font-normal">Asset</th>
                <th className="text-left py-2 font-normal">Side</th>
                <th className="text-right py-2 font-normal">Qty</th>
                <th className="text-right px-4 py-2 font-normal">Total</th>
              </tr></thead>
              <tbody>{state.journal.slice(-6).reverse().map(j => (
                <tr key={j.id} className="border-b border-[#1e2f4a] hover:bg-[#102544]">
                  <td className="px-4 py-2 text-[#6b7280]">{new Date(j.date).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</td>
                  <td className="py-2">{j.sym}</td>
                  <td className="py-2"><span className={j.side === 'BUY' ? 'text-[#60a5fa]' : 'text-[#ff5472]'}>{j.side}</span></td>
                  <td className="py-2 text-right tabular-nums">{j.qty.toFixed(4)}</td>
                  <td className="px-4 py-2 text-right tabular-nums">${fmtNum(j.qty * j.px)}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </Panel>

        <Panel title="MARKET REGIME" className="col-span-12 lg:col-span-6">
          <div className="p-4 flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="44" stroke="#1e2f4a" strokeWidth="6" fill="none" />
                <circle cx="50" cy="50" r="44" stroke="#60a5fa" strokeWidth="6" fill="none"
                        strokeDasharray={`${2*Math.PI*44*0.72} ${2*Math.PI*44}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-lg font-mono tabular-nums">72</div>
                <div className="text-[9px] font-mono tracking-wider text-[#6b7280] uppercase">SCORE</div>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-lg font-light text-[#60a5fa]">Risk-On</div>
              <div className="text-xs text-[#9ca3af] mt-1 leading-relaxed">Simulated market shows breadth expanding and trends aligned. A good environment for momentum trades.</div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
};

// ============================================================================
// PORTFOLIO
// ============================================================================

const Portfolio = ({ state, assets, onOpenSell }: any) => {
  const nav = computeNAV(state, assets);
  const invested = nav - state.cash;
  const closedTrades = state.journal.filter(j => j.side === 'SELL');
  const realizedPnl = closedTrades.reduce((s, j) => s + (j.pnl || 0), 0);

  // unrealized
  let unrealized = 0;
  for (const p of state.positions) {
    const a = assets.find((x: Asset) => x.sym === p.sym);
    if (a) unrealized += (a.px - p.avg) * p.qty;
  }

  const wins = closedTrades.filter(t => (t.pnl || 0) > 0).length;
  const losses = closedTrades.filter(t => (t.pnl || 0) < 0).length;
  const winRate = closedTrades.length > 0 ? (wins / closedTrades.length) * 100 : 0;

  return (
    <div className="p-4 space-y-4 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-[#1e2f4a] border border-[#1e2f4a]">
        <div className="bg-[#0f1d33] p-4"><Stat label="Invested" value={`$${fmtNum(invested)}`} /></div>
        <div className="bg-[#0f1d33] p-4"><Stat label="Unrealized PnL" value={`${unrealized >= 0 ? '+' : ''}$${fmtNum(Math.abs(unrealized))}`} deltaType={unrealized >= 0 ? 'pos' : 'neg'}/></div>
        <div className="bg-[#0f1d33] p-4"><Stat label="Realized PnL" value={`${realizedPnl >= 0 ? '+' : ''}$${fmtNum(Math.abs(realizedPnl))}`} deltaType={realizedPnl >= 0 ? 'pos' : 'neg'}/></div>
        <div className="bg-[#0f1d33] p-4"><Stat label="Positions" value={state.positions.length} delta={`Cash $${fmtNum(state.cash)}`} deltaType="neutral"/></div>
        <div className="bg-[#0f1d33] p-4"><Stat label="Win Rate" value={closedTrades.length > 0 ? `${winRate.toFixed(0)}%` : 'â€”'} delta={`${wins}W / ${losses}L`} deltaType={winRate >= 50 ? 'pos' : 'neg'}/></div>
      </div>

      <Panel title="OPEN POSITIONS" subtitle={state.positions.length === 0 ? 'No positions yet' : 'Click any row to sell Â· live prices update every few seconds'}>
        {state.positions.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#6b7280]">
            You haven't bought any coins yet. Go to the <span className="text-[#60a5fa]">Trade</span> tab to start.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead className="bg-[#091324]">
                <tr className="text-[10px] tracking-wider uppercase text-[#6b7280] border-b border-[#1e2f4a]">
                  <th className="text-left px-4 py-2.5 font-normal">Asset</th>
                  <th className="text-right py-2.5 font-normal">Qty</th>
                  <th className="text-right py-2.5 font-normal">Avg Cost</th>
                  <th className="text-right py-2.5 font-normal">Live Price</th>
                  <th className="text-right py-2.5 font-normal">Value</th>
                  <th className="text-right py-2.5 font-normal">Unreal PnL</th>
                  <th className="text-right py-2.5 font-normal">%</th>
                  <th className="text-right px-4 py-2.5 font-normal"></th>
                </tr>
              </thead>
              <tbody>
                {state.positions.map((p: Position) => {
                  const a = assets.find((x: Asset) => x.sym === p.sym);
                  if (!a) return null;
                  const value = p.qty * a.px;
                  const pnl = (a.px - p.avg) * p.qty;
                  const pnlPct = ((a.px - p.avg) / p.avg) * 100;
                  return (
                    <tr key={p.sym} className="border-b border-[#1e2f4a] hover:bg-[#102544] group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#152544] border border-[#1e2f4a] flex items-center justify-center text-[9px]">{p.sym.slice(0, 2)}</div>
                          <div>
                            <div className="font-medium">{p.sym}</div>
                            <div className="text-[10px] text-[#6b7280]">{a.cat}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-right tabular-nums">{p.qty.toFixed(6)}</td>
                      <td className="text-right tabular-nums text-[#9ca3af]">${fmtNum(p.avg)}</td>
                      <td className="text-right tabular-nums">${fmtNum(a.px)}</td>
                      <td className="text-right tabular-nums">${fmtNum(value)}</td>
                      <td className={`text-right tabular-nums ${pnl >= 0 ? 'text-[#60a5fa]' : 'text-[#ff5472]'}`}>
                        {pnl >= 0 ? '+' : ''}${fmtNum(Math.abs(pnl))}
                      </td>
                      <td className={`text-right tabular-nums ${pnlPct >= 0 ? 'text-[#60a5fa]' : 'text-[#ff5472]'}`}>
                        {fmtPct(pnlPct)}
                      </td>
                      <td className="text-right pr-4">
                        <button onClick={() => onOpenSell(a, p)} className="text-[10px] font-mono tracking-wider uppercase border border-[#1e2f4a] text-[#ff5472] px-2 py-1 hover:border-[#ff5472]">
                          Sell
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
};

// ============================================================================
// TRADE â€” screener + buy interface combined
// ============================================================================

const Trade = ({ state, assets, onOpenBuy, onOpenSell }: any) => {
  const [sortKey, setSortKey] = useState('mom');
  const [sortDir, setSortDir] = useState('desc');
  const [cat, setCat] = useState('ALL');
  const [query, setQuery] = useState('');

  const categories = ['ALL', ...Array.from(new Set(assets.map((a: Asset) => a.cat)))];

  const filtered = useMemo(() => {
    return assets
      .filter((a: Asset) => cat === 'ALL' || a.cat === cat)
      .filter((a: Asset) => !query || a.sym.toLowerCase().includes(query.toLowerCase()) || a.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a: any, b: any) => {
        const dir = sortDir === 'asc' ? 1 : -1;
        return (a[sortKey] - b[sortKey]) * dir;
      });
  }, [assets, sortKey, sortDir, cat, query]);

  const ownedMap = new Map(state.positions.map((p: Position) => [p.sym, p]));

  const Th = ({ label, k, right = false }: any) => (
    <th className={`${right ? 'text-right' : 'text-left'} py-2.5 font-normal cursor-pointer hover:text-white transition-colors px-2`}
        onClick={() => { if (sortKey === k) setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); else { setSortKey(k); setSortDir('desc'); } }}>
      <span className="inline-flex items-center gap-1">
        {label}
        {sortKey === k && <span className="text-[#60a5fa]">{sortDir === 'asc' ? 'â†‘' : 'â†“'}</span>}
      </span>
    </th>
  );

  return (
    <div className="p-4 space-y-4 max-w-[1600px] mx-auto">
      <div className="bg-[#0f2a44] border border-[#1e3a5f] p-3 text-xs text-[#9ca3af]">
        <span className="text-[#60a5fa] font-medium">Cash available: ${fmtNum(state.cash)}.</span>{' '}
        Click any coin to buy. Prices update every few seconds to simulate a live market.
      </div>

      <Panel title="BUY COINS" subtitle={`${filtered.length} of ${assets.length} available`}>
        <div className="p-4 flex flex-wrap gap-3 items-center border-b border-[#1e2f4a]">
          <div className="flex items-center gap-2 bg-[#0a1628] border border-[#1e2f4a] px-3 py-1.5 flex-1 min-w-[200px]">
            <Search size={12} className="text-[#6b7280]" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name or symbolâ€¦"
                   className="bg-transparent outline-none text-xs font-mono flex-1 placeholder-[#6b7280]"/>
          </div>
          <div className="flex flex-wrap gap-1">
            {categories.map(c => (
              <button key={c as string} onClick={() => setCat(c as string)}
                      className={`text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 border transition-colors ${
                        cat === c ? 'bg-[#60a5fa] text-black border-[#60a5fa]' : 'border-[#1e2f4a] text-[#9ca3af] hover:border-[#2d4468] hover:text-white'
                      }`}>{c as string}</button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead className="bg-[#091324]">
              <tr className="text-[10px] tracking-wider uppercase text-[#6b7280] border-b border-[#1e2f4a]">
                <Th label="Asset" k="sym" />
                <Th label="Price" k="px" right />
                <Th label="24h" k="chg24" right />
                <Th label="Momentum" k="mom" right />
                <Th label="Volatility" k="rv" right />
                <th className="text-right py-2.5 font-normal px-2">Owned</th>
                <th className="text-right py-2.5 font-normal px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a: Asset) => {
                const owned = ownedMap.get(a.sym);
                return (
                  <tr key={a.sym} className="border-b border-[#1e2f4a] hover:bg-[#102544]">
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#152544] border border-[#1e2f4a] flex items-center justify-center text-[9px]">{a.sym.slice(0,2)}</div>
                        <div>
                          <div className="font-medium">{a.sym}</div>
                          <div className="text-[10px] text-[#6b7280]">{a.name}</div>
                        </div>
                        <Pill tone="neutral">{a.cat}</Pill>
                      </div>
                    </td>
                    <td className="px-2 text-right tabular-nums">{a.px < 1 ? `$${a.px.toFixed(4)}` : `$${fmtNum(a.px)}`}</td>
                    <td className={`px-2 text-right tabular-nums ${a.chg24 >= 0 ? 'text-[#60a5fa]' : 'text-[#ff5472]'}`}>{fmtPct(a.chg24, 2)}</td>
                    <td className="px-2 text-right tabular-nums">
                      <span className={a.mom >= 80 ? 'text-[#60a5fa]' : a.mom <= 40 ? 'text-[#ff5472]' : 'text-[#ffb627]'}>{a.mom}</span>
                    </td>
                    <td className="px-2 text-right tabular-nums text-[#9ca3af]">{a.rv.toFixed(2)}</td>
                    <td className="px-2 text-right tabular-nums text-[#9ca3af]">
                      {owned ? (owned as Position).qty.toFixed(4) : 'â€”'}
                    </td>
                    <td className="px-4 text-right">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => onOpenBuy(a)} className="text-[10px] font-mono tracking-wider uppercase bg-[#60a5fa] text-black px-2.5 py-1 hover:bg-[#3b82f6]">Buy</button>
                        {owned && (
                          <button onClick={() => onOpenSell(a, owned)} className="text-[10px] font-mono tracking-wider uppercase border border-[#ff5472] text-[#ff5472] px-2.5 py-1 hover:bg-[#ff5472] hover:text-black">Sell</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};

// ============================================================================
// STRATEGY LAB (same as v1, simplified signals view)
// ============================================================================

const StrategyLab = ({ assets }: any) => {
  const strategies = [
    { name: 'Momentum Top 5',    desc: 'Buy the 5 highest-momentum coins, rebalance weekly', cagr: 58, sharpe: 1.84, maxDD: -22 },
    { name: 'Breakout Scanner',  desc: 'Enter on 20-day breakouts with volume confirmation', cagr: 42, sharpe: 1.42, maxDD: -18 },
    { name: 'Mean Reversion',    desc: 'Buy oversold coins in uptrends, short holding period', cagr: 27, sharpe: 1.11, maxDD: -15 },
    { name: 'Trend + Regime',    desc: 'Only long when market regime is risk-on', cagr: 50, sharpe: 2.08, maxDD: -13 },
  ];

  const [selected, setSelected] = useState(strategies[0].name);
  const active = strategies.find(s => s.name === selected)!;

  const btData = useMemo(() => {
    let v = 100;
    return Array.from({length: 180}, (_, i) => {
      v *= (1 + (seed(i + active.cagr) - 0.42) * 0.035);
      const bench = 100 * Math.pow(1.0018, i);
      return { d: i, strategy: v, benchmark: bench };
    });
  }, [selected]);

  return (
    <div className="p-4 space-y-4 max-w-[1600px] mx-auto">
      <div className="bg-[#0f2a44] border border-[#1e3a5f] p-3 text-xs text-[#9ca3af]">
        <span className="text-[#60a5fa] font-medium">Strategy Lab:</span>{' '}
        These are pre-made strategies you can learn from. Results shown are from historical patterns in the simulated data.
      </div>

      <div className="grid grid-cols-12 gap-4">
        <Panel title="STRATEGIES" className="col-span-12 lg:col-span-3">
          <div className="divide-y divide-[#1e2f4a]">
            {strategies.map(s => (
              <button key={s.name} onClick={() => setSelected(s.name)}
                      className={`w-full text-left px-4 py-3 hover:bg-[#102544] transition-colors ${selected === s.name ? 'bg-[#102544] border-l-2 border-[#60a5fa]' : 'border-l-2 border-transparent'}`}>
                <div className="text-sm">{s.name}</div>
                <div className="text-[11px] text-[#9ca3af] mt-1 leading-snug">{s.desc}</div>
                <div className="flex items-center gap-3 text-[10px] font-mono tabular-nums mt-2">
                  <span className="text-[#60a5fa]">CAGR {s.cagr}%</span>
                  <span className="text-[#9ca3af]">SR {s.sharpe}</span>
                  <span className="text-[#ff5472]">{s.maxDD}%</span>
                </div>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title={`BACKTEST Â· ${active.name}`} subtitle={active.desc} className="col-span-12 lg:col-span-9">
          <div className="p-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={btData}>
                  <XAxis dataKey="d" stroke="#6b7280" tick={{fontSize: 10, fontFamily: 'ui-monospace'}} tickLine={false} axisLine={{stroke: '#1e2f4a'}} />
                  <YAxis stroke="#6b7280" tick={{fontSize: 10, fontFamily: 'ui-monospace'}} tickLine={false} axisLine={{stroke: '#1e2f4a'}} />
                  <Tooltip contentStyle={{background:'#0f1d33', border:'1px solid #1e2f4a', fontSize: 11, fontFamily: 'ui-monospace'}}/>
                  <Line type="monotone" dataKey="strategy" stroke="#60a5fa" strokeWidth={1.8} dot={false} name="Strategy"/>
                  <Line type="monotone" dataKey="benchmark" stroke="#6b7280" strokeWidth={1} dot={false} strokeDasharray="3 3" name="Benchmark"/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
};

// ============================================================================
// JOURNAL
// ============================================================================

const Journal = ({ state }: any) => {
  const stats = {
    total: state.journal.length,
    buys: state.journal.filter((j: JournalEntry) => j.side === 'BUY').length,
    sells: state.journal.filter((j: JournalEntry) => j.side === 'SELL').length,
    netPnl: state.journal.reduce((s: number, j: JournalEntry) => s + (j.pnl || 0), 0),
  };

  return (
    <div className="p-4 space-y-4 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#1e2f4a] border border-[#1e2f4a]">
        <div className="bg-[#0f1d33] p-4"><Stat label="Total Trades" value={stats.total}/></div>
        <div className="bg-[#0f1d33] p-4"><Stat label="Buys" value={stats.buys} deltaType="pos"/></div>
        <div className="bg-[#0f1d33] p-4"><Stat label="Sells" value={stats.sells}/></div>
        <div className="bg-[#0f1d33] p-4"><Stat label="Realized PnL" value={`${stats.netPnl >= 0 ? '+' : ''}$${fmtNum(Math.abs(stats.netPnl))}`} deltaType={stats.netPnl >= 0 ? 'pos' : 'neg'}/></div>
      </div>

      <Panel title="TRADE JOURNAL" subtitle="Every trade you've made, with your reasoning">
        {state.journal.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#6b7280]">
            No trades logged yet. Every buy and sell automatically shows up here.
          </div>
        ) : (
          <div className="divide-y divide-[#1e2f4a]">
            {[...state.journal].reverse().map((j: JournalEntry) => (
              <div key={j.id} className="px-4 py-4 hover:bg-[#102544]">
                <div className="flex items-start gap-4">
                  <div className="text-[11px] font-mono text-[#6b7280] tabular-nums w-24 shrink-0">
                    {new Date(j.date).toLocaleDateString()}<br/>
                    <span className="text-[9px]">{new Date(j.date).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
                  </div>
                  <div className={`w-1 self-stretch ${j.side === 'BUY' ? 'bg-[#60a5fa]' : (j.pnl && j.pnl >= 0 ? 'bg-[#60a5fa]' : 'bg-[#ff5472]')}`}/>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`font-mono text-sm ${j.side === 'BUY' ? 'text-[#60a5fa]' : 'text-[#ff5472]'}`}>{j.side}</span>
                      <span className="font-mono text-sm">{j.sym}</span>
                      <span className="text-xs font-mono text-[#9ca3af]">{j.qty.toFixed(6)} @ ${fmtNum(j.px)}</span>
                      <span className="text-xs font-mono text-[#9ca3af]">= ${fmtNum(j.qty * j.px)}</span>
                      {j.pnl !== null && (
                        <span className={`ml-auto font-mono text-sm tabular-nums ${j.pnl >= 0 ? 'text-[#60a5fa]' : 'text-[#ff5472]'}`}>
                          {j.pnl >= 0 ? '+' : ''}${fmtNum(j.pnl)}
                        </span>
                      )}
                    </div>
                    {j.reason && <div className="text-xs text-[#9ca3af] leading-relaxed mt-1">{j.reason}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
};

// ============================================================================
// APP ROOT
// ============================================================================

export default function App() {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [page, setPage] = useState('dashboard');
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [state, setState] = useState<PortfolioState>(INITIAL_STATE);
  const [showWelcome, setShowWelcome] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [modal, setModal] = useState<{ mode: 'buy' | 'sell'; asset: Asset; position?: Position } | null>(null);
  const tickRef = useRef(0);

  // Load state on mount (client-only to avoid hydration issues)
  useEffect(() => {
    setMounted(true);
    setState(loadState());
    if (!localStorage.getItem(WELCOME_KEY)) {
      setShowWelcome(true);
    }
  }, []);

  // Price drift loop
  useEffect(() => {
    if (view !== 'app') return;
    const id = setInterval(() => {
      tickRef.current += 1;
      setAssets(prev => driftPrices(prev, tickRef.current));
    }, 3000);
    return () => clearInterval(id);
  }, [view]);

  // Equity history â€” snapshot every 15s when in app
  useEffect(() => {
    if (view !== 'app' || !mounted) return;
    const id = setInterval(() => {
      setState(s => {
        const nav = computeNAV(s, assets);
        const lastSnapshot = s.equityHistory[s.equityHistory.length - 1];
        if (lastSnapshot && Math.abs(nav - lastSnapshot.v) < 0.5 && Date.now() - lastSnapshot.t < 60000) return s;
        const newHistory = [...s.equityHistory, { t: Date.now(), v: nav }].slice(-500);
        const next = { ...s, equityHistory: newHistory };
        saveState(next);
        return next;
      });
    }, 15000);
    return () => clearInterval(id);
  }, [view, assets, mounted]);

  // Persist on state change
  useEffect(() => { if (mounted) saveState(state); }, [state, mounted]);

  const dismissWelcome = () => {
    localStorage.setItem(WELCOME_KEY, '1');
    setShowWelcome(false);
  };

  const onOpenBuy = (asset?: Asset) => {
    setModal({ mode: 'buy', asset: asset || assets[0] });
  };

  const onOpenSell = (asset: Asset, position: Position) => {
    setModal({ mode: 'sell', asset, position });
  };

  const executeTrade = (qty: number, reason: string, realizedPnl: number) => {
    if (!modal) return;
    const { mode, asset } = modal;

    setState(s => {
      const cost = qty * asset.px;
      let newCash = s.cash;
      let newPositions = [...s.positions];

      if (mode === 'buy') {
        newCash -= cost;
        const existing = newPositions.find(p => p.sym === asset.sym);
        if (existing) {
          const newQty = existing.qty + qty;
          const newAvg = (existing.avg * existing.qty + asset.px * qty) / newQty;
          newPositions = newPositions.map(p => p.sym === asset.sym ? { ...p, qty: newQty, avg: newAvg } : p);
        } else {
          newPositions.push({ sym: asset.sym, qty, avg: asset.px, opened: Date.now() });
        }
      } else {
        newCash += cost;
        const existing = newPositions.find(p => p.sym === asset.sym);
        if (existing) {
          if (qty >= existing.qty - 1e-9) {
            newPositions = newPositions.filter(p => p.sym !== asset.sym);
          } else {
            newPositions = newPositions.map(p => p.sym === asset.sym ? { ...p, qty: p.qty - qty } : p);
          }
        }
      }

      const newJournal = [...s.journal, {
        id: Date.now(),
        date: new Date().toISOString(),
        sym: asset.sym,
        side: mode === 'buy' ? 'BUY' as const : 'SELL' as const,
        qty,
        px: asset.px,
        pnl: mode === 'sell' ? realizedPnl : null,
        reason: reason || (mode === 'buy' ? 'No thesis provided' : 'No reason provided'),
      }];

      const next = { ...s, cash: newCash, positions: newPositions, journal: newJournal };
      return next;
    });

    setModal(null);
  };

  const onReset = () => {
    const fresh = { ...INITIAL_STATE, startedAt: Date.now(), equityHistory: [{ t: Date.now(), v: 100000 }] };
    setState(fresh);
    saveState(fresh);
    setAssets(INITIAL_ASSETS);
  };

  if (view === 'landing') return <Landing onEnter={() => setView('app')} />;

  const pages: any = {
    dashboard: <Dashboard state={state} assets={assets} onOpenBuy={(a?: Asset) => { if (a) onOpenBuy(a); else setPage('trade'); }} />,
    portfolio: <Portfolio state={state} assets={assets} onOpenSell={onOpenSell} />,
    trade:     <Trade state={state} assets={assets} onOpenBuy={onOpenBuy} onOpenSell={onOpenSell} />,
    strategies:<StrategyLab assets={assets} />,
    journal:   <Journal state={state} />,
  };

  return (
    <>
      <Shell page={page} setPage={setPage} state={state} assets={assets} onReset={onReset} onExit={() => setView('landing')}>
        {pages[page]}
      </Shell>
      {showWelcome && mounted && <WelcomeModal onClose={dismissWelcome} />}
      {modal && (
        <TradeModal
          open={!!modal}
          mode={modal.mode}
          asset={modal.asset}
          position={modal.position}
          state={state}
          onClose={() => setModal(null)}
          onConfirm={executeTrade}
        />
      )}
    </>
  );
}
