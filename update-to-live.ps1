$file = "app\page.tsx"
$c = Get-Content $file -Raw -Encoding UTF8

# ============================================================
# 1. Swap coins: ARB → XRP, OP → ETC, INJ → XLM
# ============================================================

$oldARB = "  { sym: 'ARB',  name: 'Arbitrum',  cat: 'L2',     basePx: 0.8245,   px: 0.8245,   chg24: 3.10,  chg7: -2.80, vol: 310e6,  mcap: 3.4e9,   rv: 0.88, atr: 0.07, mom: 42, rsi: 46, beta: 1.88, liq: 69 },"
$newXRP = "  { sym: 'XRP',  name: 'XRP',       cat: 'L1',     basePx: 2.35,     px: 2.35,     chg24: 2.10,  chg7: 5.40,  vol: 2.8e9,  mcap: 134e9,   rv: 0.62, atr: 0.18, mom: 72, rsi: 58, beta: 1.12, liq: 95 },"
$c = $c.Replace($oldARB, $newXRP)

$oldOP = "  { sym: 'OP',   name: 'Optimism',  cat: 'L2',     basePx: 1.942,    px: 1.942,    chg24: 2.55,  chg7: 1.40,  vol: 188e6,  mcap: 2.1e9,   rv: 0.91, atr: 0.18, mom: 48, rsi: 52, beta: 1.91, liq: 66 },"
$newETC = "  { sym: 'ETC',  name: 'Ethereum Classic', cat: 'L1', basePx: 26.80, px: 26.80,    chg24: 1.30,  chg7: 3.20,  vol: 480e6,  mcap: 4.1e9,   rv: 0.74, atr: 1.8,  mom: 58, rsi: 54, beta: 1.28, liq: 78 },"
$c = $c.Replace($oldOP, $newETC)

$oldINJ = "  { sym: 'INJ',  name: 'Injective', cat: 'DeFi',   basePx: 32.11,    px: 32.11,    chg24: 4.90,  chg7: 14.3,  vol: 280e6,  mcap: 3.0e9,   rv: 0.94, atr: 2.4,  mom: 88, rsi: 73, beta: 1.88, liq: 74 },"
$newXLM = "  { sym: 'XLM',  name: 'Stellar',   cat: 'L1',     basePx: 0.412,    px: 0.412,    chg24: 1.80,  chg7: 4.10,  vol: 320e6,  mcap: 12.5e9,  rv: 0.68, atr: 0.03, mom: 64, rsi: 56, beta: 1.22, liq: 86 },"
$c = $c.Replace($oldINJ, $newXLM)

# ============================================================
# 2. Add CoinGecko fetch function after driftPrices definition
# ============================================================

$coingeckoMarker = "// Drift prices realistically - each tick each asset takes a small random step"

$coingeckoBlock = @"
// Map our symbols to CoinGecko IDs for live price fetching.
// Reference: https://www.coingecko.com/api/documentation
const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', AVAX: 'avalanche-2',
  XRP: 'ripple', ETC: 'ethereum-classic', LINK: 'chainlink', UNI: 'uniswap',
  AAVE: 'aave', RNDR: 'render-token', FET: 'fetch-ai', MATIC: 'matic-network',
  ATOM: 'cosmos', DOGE: 'dogecoin', LDO: 'lido-dao', XLM: 'stellar',
};

// Fetches live prices for all tracked coins from CoinGecko.
// Returns an updated assets array, or null if the API call fails.
async function fetchLivePrices(currentAssets: Asset[]): Promise<Asset[] | null> {
  try {
    const ids = currentAssets.map(a => COINGECKO_IDS[a.sym]).filter(Boolean).join(',');
    const url = 'https://api.coingecko.com/api/v3/simple/price?ids=' + ids +
                '&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true';
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return currentAssets.map(a => {
      const cgId = COINGECKO_IDS[a.sym];
      const info = data[cgId];
      if (!info || !info.usd) return a;
      return {
        ...a,
        px: info.usd,
        chg24: info.usd_24h_change ?? a.chg24,
        vol: info.usd_24h_vol ?? a.vol,
      };
    });
  } catch (e) {
    console.warn('CoinGecko fetch failed, using drift simulation:', e);
    return null;
  }
}

"@

$c = $c.Replace($coingeckoMarker, $coingeckoBlock + $coingeckoMarker)

# ============================================================
# 3. Replace the drift-only useEffect with hybrid live + drift
# ============================================================

$oldLoop = @"
  // Price drift loop
  useEffect(() => {
    if (view !== 'app') return;
    const id = setInterval(() => {
      tickRef.current += 1;
      setAssets(prev => driftPrices(prev, tickRef.current));
    }, 3000);
    return () => clearInterval(id);
  }, [view]);
"@

$newLoop = @"
  // Price updates: try CoinGecko live data, fall back to drift simulation.
  // Live fetch every 60s (respects free tier rate limit); drift between fetches for smooth UI.
  const [liveDataActive, setLiveDataActive] = useState(false);
  useEffect(() => {
    if (view !== 'app') return;
    let cancelled = false;
    const tryLive = async () => {
      setAssets(prev => {
        fetchLivePrices(prev).then(result => {
          if (cancelled) return;
          if (result) {
            setAssets(result);
            setLiveDataActive(true);
          } else {
            setLiveDataActive(false);
          }
        });
        return prev;
      });
    };
    tryLive();
    const liveId = setInterval(tryLive, 60000);
    const driftId = setInterval(() => {
      tickRef.current += 1;
      setAssets(prev => driftPrices(prev, tickRef.current));
    }, 4000);
    return () => { cancelled = true; clearInterval(liveId); clearInterval(driftId); };
  }, [view]);
"@

$c = $c.Replace($oldLoop, $newLoop)

# ============================================================
# 4. Update the demo banner to show live data status
# ============================================================

$oldBanner = 'const DemoBanner = () => ('
$newBanner = 'const DemoBanner = ({ liveDataActive }: { liveDataActive?: boolean }) => ('
$c = $c.Replace($oldBanner, $newBanner)

$oldBannerContent = @"
  <div className="bg-[#2a1f0a] border-b border-[#4a3a15] px-4 h-7 flex items-center justify-center gap-2 text-[10px] font-mono tracking-wider uppercase text-[#ffb627] shrink-0">
    <AlertCircle size={11}/>
    <span>DEMO MODE . All prices, signals, and data are simulated . Not tracking real markets</span>
  </div>
"@

$newBannerContent = @"
  <div className={(liveDataActive ? 'bg-[#0f2a1e] border-b border-[#1d4a34] text-[#26d97f]' : 'bg-[#2a1f0a] border-b border-[#4a3a15] text-[#ffb627]') + ' px-4 h-7 flex items-center justify-center gap-2 text-[10px] font-mono tracking-wider uppercase shrink-0'}>
    <AlertCircle size={11}/>
    <span>{liveDataActive ? 'LIVE DATA . Prices from CoinGecko API . Fake money only . Not investment advice' : 'SIMULATED DATA . CoinGecko API unavailable . Using drift simulation'}</span>
  </div>
"@

$c = $c.Replace($oldBannerContent, $newBannerContent)

# Pass the prop through the Shell component
$oldShellCall = '<DemoBanner />'
$newShellCall = '<DemoBanner liveDataActive={liveDataActive} />'
$c = $c.Replace($oldShellCall, $newShellCall)

# Pass liveDataActive through to Shell
$oldShellProps = 'const Shell = ({ page, setPage, children, onExit, state, assets, onReset }: any) => {'
$newShellProps = 'const Shell = ({ page, setPage, children, onExit, state, assets, onReset, liveDataActive }: any) => {'
$c = $c.Replace($oldShellProps, $newShellProps)

$oldShellRender = '<Shell page={page} setPage={setPage} state={state} assets={assets} onReset={onReset} onExit={() => setView(''landing'')}>'
$newShellRender = '<Shell page={page} setPage={setPage} state={state} assets={assets} onReset={onReset} liveDataActive={liveDataActive} onExit={() => setView(''landing'')}>'
$c = $c.Replace($oldShellRender, $newShellRender)

[System.IO.File]::WriteAllText((Resolve-Path $file), $c, [System.Text.UTF8Encoding]::new($false))
Write-Host "Updates applied. Review changes, then git add/commit/push."
