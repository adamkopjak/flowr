// Main flowr dashboard app

const { useState: useS, useEffect: useE, useMemo: useM } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "accent": "#4EFE9A",
  "density": "comfortable",
  "showTicker": true,
  "orbPulse": true
}/*EDITMODE-END*/;

const ACCENT_OPTIONS = ['#4EFE9A', '#39FF7A', '#7CFFAB', '#00FFB2', '#B8FF4D'];

function applyTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
}
function applyAccent(hex){
  document.documentElement.style.setProperty('--accent', hex);
  // derive soft + glow from hex
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  document.documentElement.style.setProperty('--accent-soft', `rgba(${r},${g},${b},0.12)`);
  document.documentElement.style.setProperty('--accent-glow', `rgba(${r},${g},${b},0.45)`);
  document.documentElement.style.setProperty('--pos', hex);
}

function App(){
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [coins, setCoins] = useS([]);
  const [source, setSource] = useS('loading');
  const [loading, setLoading] = useS(true);
  const [q, setQ] = useS('');
  const [filter, setFilter] = useS('all');
  const [watch, setWatch] = useS(()=>{
    try { return new Set(JSON.parse(localStorage.getItem('flowr-watch')||'[]')); }
    catch { return new Set(); }
  });
  const [chatOpen, setChatOpen] = useS(false);
  const [selected, setSelected] = useS(null); // currently highlighted coin for chat context

  useE(()=>{ applyTheme(t.theme); }, [t.theme]);
  useE(()=>{ applyAccent(t.accent); }, [t.accent]);

  useE(()=>{
    let cancelled = false;
    setLoading(true);
    fetchCoins().then(({coins, source}) => {
      if(cancelled) return;
      setCoins(coins);
      setSource(source);
      setLoading(false);
    });
    // refresh every 60s
    const id = setInterval(()=>{
      fetchCoins().then(({coins, source}) => {
        if(cancelled) return;
        setCoins(coins);
        setSource(source);
      });
    }, 60000);
    return ()=>{ cancelled=true; clearInterval(id); };
  }, []);

  function toggleWatch(id){
    setWatch(prev => {
      const next = new Set(prev);
      if(next.has(id)) next.delete(id); else next.add(id);
      try { localStorage.setItem('flowr-watch', JSON.stringify([...next])); } catch {}
      return next;
    });
  }

  // Top 3 movers (by absolute 24h change) -- napkin says "most moved cryptos that day"
  const topMovers = useM(()=>{
    return [...coins]
      .filter(c => c.price_change_percentage_24h != null)
      .sort((a,b)=> Math.abs(b.price_change_percentage_24h) - Math.abs(a.price_change_percentage_24h))
      .slice(0, 3);
  }, [coins]);

  // Mid chart row: top 3 by market cap (BTC, ETH, SOL typically)
  const featured = useM(()=>{
    return [...coins]
      .sort((a,b)=> (b.market_cap||0) - (a.market_cap||0))
      .slice(0, 3);
  }, [coins]);

  // Filtered list
  const filtered = useM(()=>{
    let list = coins;
    if(q.trim()){
      const needle = q.toLowerCase().trim();
      list = list.filter(c => c.name.toLowerCase().includes(needle) || c.symbol.toLowerCase().includes(needle));
    }
    if(filter === 'gainers') list = list.filter(c => (c.price_change_percentage_24h ?? 0) > 0);
    if(filter === 'losers') list = list.filter(c => (c.price_change_percentage_24h ?? 0) < 0);
    if(filter === 'watch')   list = list.filter(c => watch.has(c.id));
    return list;
  }, [coins, q, filter, watch]);

  // Market summary
  const summary = useM(()=>{
    const totalMcap = coins.reduce((s,c)=> s + (c.market_cap||0), 0);
    const totalVol = coins.reduce((s,c)=> s + (c.total_volume||0), 0);
    const gainers = coins.filter(c => (c.price_change_percentage_24h??0) > 0).length;
    const losers = coins.filter(c => (c.price_change_percentage_24h??0) < 0).length;
    const avgChg = coins.length ? coins.reduce((s,c)=> s + (c.price_change_percentage_24h||0), 0) / coins.length : 0;
    return { totalMcap, totalVol, gainers, losers, avgChg };
  }, [coins]);

  return (
    <div style={{maxWidth: 1340, margin:'0 auto', padding: '32px 28px 96px'}}>

      {/* ======= HEADER ======= */}
      <header style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        gap: 16, marginBottom: 28
      }} data-screen-label="01 Dashboard Header">
        <div style={{display:'flex', alignItems:'center', gap: 28}}>
          <FlowrLogo size={30}/>
          <nav style={{display:'flex', gap:4}}>
            {['Markets', 'Portfolio', 'Watchlist', 'News'].map((n,i)=>(
              <a key={n} href="#" style={{
                padding:'8px 14px', fontSize:13, borderRadius:999,
                color: i===0?'var(--text)':'var(--text-dim)',
                background: i===0?'var(--surface-2)':'transparent',
                textDecoration:'none', fontWeight: i===0?500:400,
                border:'1px solid '+(i===0?'var(--border)':'transparent')
              }}>{n}</a>
            ))}
          </nav>
        </div>

        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <div className="chip" style={{padding:'6px 12px'}}>
            <span style={{
              width:6, height:6, borderRadius:'50%',
              background: source==='live' ? 'var(--accent)' : 'var(--text-faint)',
              boxShadow: source==='live' ? '0 0 6px var(--accent-glow)' : 'none'
            }}/>
            {source==='live' ? 'Live data' : source==='fallback' ? 'Demo data' : 'Connecting…'}
          </div>
          <button onClick={()=>setTweak('theme', t.theme==='dark'?'light':'dark')} aria-label="Toggle theme" style={{
            background:'var(--surface)', border:'1px solid var(--border)',
            width: 40, height: 40, borderRadius:'50%', cursor:'pointer',
            display:'grid', placeItems:'center', color:'var(--text)'
          }}>
            {t.theme==='dark' ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4"/>
                {[0,45,90,135,180,225,270,315].map(a=>{
                  const rad = a*Math.PI/180;
                  return <line key={a} x1={8+Math.cos(rad)*5.5} y1={8+Math.sin(rad)*5.5}
                                       x2={8+Math.cos(rad)*7} y2={8+Math.sin(rad)*7}
                                       stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>;
                })}
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12.5 9.5 A 5 5 0 1 1 6.5 3.5 A 4 4 0 0 0 12.5 9.5 Z" fill="currentColor"/>
              </svg>
            )}
          </button>
          <button style={{
            background:'var(--text)', color:'var(--bg)', border:'none',
            padding:'10px 18px', borderRadius: 999, fontSize: 13, fontWeight:600,
            cursor:'pointer', fontFamily:'inherit'
          }}>Sign in</button>
        </div>
      </header>

      {/* ======= MARKET SUMMARY STRIP ======= */}
      <section style={{
        display:'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 14,
        marginBottom: 24
      }}>
        <StatCard label="Total market cap" value={'$'+fmtBig(summary.totalMcap)}
                  sub={(summary.avgChg>=0?'▲ ':'▼ ') + Math.abs(summary.avgChg).toFixed(2)+'% avg 24h'}/>
        <StatCard label="24h volume" value={'$'+fmtBig(summary.totalVol)} sub="across tracked assets"/>
        <StatCard label="Gainers" value={summary.gainers || '—'} sub="up in last 24 hours" accent="var(--pos)"/>
        <StatCard label="Losers" value={summary.losers || '—'} sub="down in last 24 hours" accent="var(--neg)"/>
      </section>

      {/* ======= TOP MOVERS (3 cards, napkin row 1) ======= */}
      <section style={{marginBottom: 18}}>
        <SectionTitle eyebrow="Today" title="Biggest movers"
          subtitle={`The 3 most volatile assets in the last 24h${source==='fallback'?' — demo data':''}.`}/>
      </section>
      <section style={{
        display:'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 14,
        marginBottom: 28
      }}>
        {loading || coins.length===0
          ? [0,1,2].map(i => <SkeletonCard key={i} h={220}/>)
          : topMovers.map((c, i) => <MoverCard key={c.id} coin={c} rank={i} onSelect={setSelected}/>)
        }
      </section>

      {/* ======= FEATURED CHARTS (3 cards, napkin row 2 = small charts) ======= */}
      <section style={{marginBottom: 18}}>
        <SectionTitle eyebrow="Featured" title="Major markets"
          subtitle="7-day price action for the top three by market cap."/>
      </section>
      <section style={{
        display:'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 14,
        marginBottom: 28
      }}>
        {loading || coins.length===0
          ? [0,1,2].map(i => <SkeletonCard key={i} h={240}/>)
          : featured.map(c => <ChartCard key={c.id} coin={c} onSelect={setSelected}/>)
        }
      </section>

      {/* ======= TICKER ======= */}
      {t.showTicker && coins.length > 0 && (
        <section style={{marginBottom: 28}}>
          <MarketTicker coins={coins}/>
        </section>
      )}

      {/* ======= PRICE LIST (napkin: full crypto prices list) ======= */}
      <section style={{marginBottom: 18, display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:16, flexWrap:'wrap'}}>
        <SectionTitle eyebrow="All assets" title="Live prices"
          subtitle="Tap any row to focus, ★ to add to your watchlist."/>
      </section>
      <section style={{marginBottom: 24}}>
        <SearchBar q={q} setQ={setQ} filter={filter} setFilter={setFilter}/>
      </section>

      <section className="card" style={{padding: 8}}>
        {/* table header */}
        <div style={{
          display:'grid',
          gridTemplateColumns: '36px 36px 1.6fr 1fr 1fr 1fr 120px 80px',
          alignItems:'center', gap: 16,
          padding:'10px 18px',
          fontSize: 11, color:'var(--text-faint)',
          textTransform:'uppercase', letterSpacing:'0.08em',
          borderBottom:'1px solid var(--border)'
        }}>
          <span></span>
          <span>#</span>
          <span>Asset</span>
          <span style={{textAlign:'right'}}>Price</span>
          <span style={{textAlign:'right'}}>24h</span>
          <span style={{textAlign:'right'}}>Market cap</span>
          <span style={{textAlign:'right'}}>7d chart</span>
          <span></span>
        </div>

        {loading || coins.length===0 ? (
          [0,1,2,3,4].map(i => (
            <div key={i} style={{padding:'14px 18px'}}>
              <div className="skeleton" style={{height: 24, borderRadius: 12}}/>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div style={{padding:'40px 18px', textAlign:'center', color:'var(--text-dim)', fontSize:14}}>
            No assets match those filters.
          </div>
        ) : (
          filtered.map((c,i)=>(
            <PriceRow key={c.id} coin={c} idx={i}
              isWatched={watch.has(c.id)}
              onWatch={toggleWatch}
              onSelect={(coin)=>{ setSelected(coin); setChatOpen(true); }}
            />
          ))
        )}
      </section>

      <footer style={{marginTop: 40, fontSize: 12, color:'var(--text-faint)', display:'flex', justifyContent:'space-between', gap:16, flexWrap:'wrap'}}>
        <span>flowr. · prices from CoinGecko · refresh every 60s</span>
        <span>{coins.length} assets tracked</span>
      </footer>

      {/* ======= AI ORB + PANEL ======= */}
      <AIOrb open={chatOpen} setOpen={setChatOpen} pulse={t.orbPulse}/>
      <AIChatPanel open={chatOpen} setOpen={setChatOpen} coins={coins}/>

      {/* ======= TWEAKS ======= */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Appearance">
          <TweakRadio label="Theme" value={t.theme} onChange={v=>setTweak('theme', v)}
            options={[{value:'dark', label:'Dark'}, {value:'light', label:'Light'}]}/>
          <TweakColor label="Accent" value={t.accent} onChange={v=>setTweak('accent', v)}
            options={ACCENT_OPTIONS}/>
          <TweakToggle label="Show market ticker" value={t.showTicker} onChange={v=>setTweak('showTicker', v)}/>
          <TweakToggle label="Pulsing AI orb" value={t.orbPulse} onChange={v=>setTweak('orbPulse', v)}/>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

function SectionTitle({ eyebrow, title, subtitle }){
  return (
    <div>
      <div style={{fontSize:11, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.12em', fontWeight:600, marginBottom:6}}>{eyebrow}</div>
      <h2 style={{margin:0, fontSize: 24, fontWeight:600, letterSpacing:'-0.02em'}}>{title}</h2>
      {subtitle && <p style={{margin:'6px 0 0', fontSize:13, color:'var(--text-dim)'}}>{subtitle}</p>}
    </div>
  );
}

function SkeletonCard({ h = 200 }){
  return <div className="card" style={{height: h, padding: 20, display:'flex', flexDirection:'column', gap:12}}>
    <div className="skeleton" style={{height: 36, width:'50%'}}/>
    <div className="skeleton" style={{height: 24, width:'70%'}}/>
    <div className="skeleton" style={{flex:1, marginTop:'auto'}}/>
  </div>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
