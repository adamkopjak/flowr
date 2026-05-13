// Visual primitives: logo, sparkline, coin icon, header, cards, list

const { useState, useEffect, useRef, useMemo } = React;

// ---------- Logo ----------
function FlowrLogo({ size = 28 }){
  // wordmark "flowr." in lowercase, custom-drawn-feeling via Space Grotesk + dot accent
  return (
    <div style={{display:'flex', alignItems:'center', gap: 10}}>
      <div style={{
        width: size, height: size, borderRadius: size*0.32,
        background: 'var(--accent)',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 8px 20px -6px var(--accent-glow)',
        display:'grid', placeItems:'center',
        position:'relative', overflow:'hidden'
      }}>
        <svg viewBox="0 0 24 24" width={size*0.62} height={size*0.62} fill="none">
          {/* abstract flow mark — three offset rounded streams */}
          <path d="M4 8 C 8 8, 8 16, 12 16" stroke="#04140A" strokeWidth="2.4" strokeLinecap="round"/>
          <path d="M9 8 C 13 8, 13 16, 17 16" stroke="#04140A" strokeWidth="2.4" strokeLinecap="round" opacity="0.55"/>
          <path d="M14 8 C 18 8, 18 16, 22 16" stroke="#04140A" strokeWidth="2.4" strokeLinecap="round" opacity="0.25"/>
        </svg>
      </div>
      <div style={{display:'flex', alignItems:'baseline', gap:1}}>
        <span style={{
          fontSize: size*0.78, fontWeight: 600, letterSpacing: '-0.04em',
          color: 'var(--text)', lineHeight: 1
        }}>flowr</span>
        <span style={{
          fontSize: size*0.78, fontWeight: 600,
          color: 'var(--accent)', lineHeight: 1
        }}>.</span>
      </div>
    </div>
  );
}

// ---------- Coin glyph (generated; falls back to image when available) ----------
function CoinGlyph({ coin, size = 36 }){
  const sym = (coin?.symbol || '?').toUpperCase().slice(0,3);
  const hash = [...sym].reduce((a,c)=>a + c.charCodeAt(0), 0);
  const hue = (hash * 47) % 360;
  if(coin?.image){
    return <img src={coin.image} alt={sym} width={size} height={size}
              style={{borderRadius: size*0.5, background:'var(--surface-2)'}} onError={(e)=>{ e.target.style.display='none'; }}/>;
  }
  return (
    <div style={{
      width:size, height:size, borderRadius: size*0.5,
      background: `linear-gradient(135deg, oklch(0.72 0.15 ${hue}), oklch(0.45 0.12 ${(hue+40)%360}))`,
      display:'grid', placeItems:'center',
      color:'#fff', fontWeight:600, fontSize: size*0.32,
      fontFamily: 'Space Grotesk, sans-serif',
      boxShadow: '0 1px 0 rgba(255,255,255,0.18) inset'
    }}>{sym.slice(0,3)}</div>
  );
}

// ---------- Sparkline ----------
function Sparkline({ data, width=120, height=36, positive=true, animate=true, fill=true, gradientId }){
  if(!data || data.length < 2) return <div style={{width, height}} className="skeleton"/>;
  const pts = data;
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const range = (max - min) || 1;
  const padY = 2;
  const stepX = width / (pts.length - 1);
  const toY = (v) => padY + (height - padY*2) * (1 - (v - min)/range);
  const d = pts.map((v,i)=> (i===0?'M':'L') + (i*stepX).toFixed(2) + ',' + toY(v).toFixed(2)).join(' ');
  const areaD = d + ` L ${width},${height} L 0,${height} Z`;
  const color = positive ? 'var(--pos)' : 'var(--neg)';
  const gid = gradientId || ('g'+Math.random().toString(36).slice(2,8));
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {fill && <path d={areaD} fill={`url(#${gid})`} />}
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            className={animate ? 'spark-path' : ''}/>
    </svg>
  );
}

// ---------- Animated number ----------
function AnimNum({ value, format }){
  const prev = useRef(value);
  const [display, setDisplay] = useState(value);
  useEffect(()=>{
    const from = prev.current;
    const to = value;
    if(from === to) return;
    const start = performance.now();
    const dur = 700;
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t-start)/dur);
      const eased = 1 - Math.pow(1-p, 3);
      setDisplay(from + (to-from)*eased);
      if(p < 1) raf = requestAnimationFrame(tick);
      else prev.current = to;
    };
    raf = requestAnimationFrame(tick);
    return ()=> cancelAnimationFrame(raf);
  }, [value]);
  return <span>{format(display)}</span>;
}

// ---------- Mover card (top row, big) ----------
function MoverCard({ coin, rank, onSelect }){
  const pos = (coin.price_change_percentage_24h ?? 0) >= 0;
  return (
    <button onClick={()=>onSelect && onSelect(coin)} className="card fade-up focus-ring" style={{
      padding: 22, textAlign:'left', cursor:'pointer',
      display:'flex', flexDirection:'column', gap: 16,
      background: 'var(--bg-card)',
      color: 'var(--text)',
      font: 'inherit',
      transition: 'transform 0.25s ease, border-color 0.25s ease',
      animationDelay: `${rank*60}ms`,
      border: '1px solid var(--border)',
    }}
    onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.borderColor='var(--border-strong)'; }}
    onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='var(--border)'; }}
    >
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:12}}>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <CoinGlyph coin={coin} size={40}/>
          <div>
            <div style={{fontSize:15, fontWeight:600, letterSpacing:'-0.01em'}}>{coin.name}</div>
            <div style={{fontSize:12, color:'var(--text-dim)', textTransform:'uppercase', letterSpacing:'0.08em'}}>{coin.symbol}</div>
          </div>
        </div>
        <span className={pos?'chip chip-pos':'chip chip-neg'}>
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d={pos?'M2 7 L5 3 L8 7':'M2 3 L5 7 L8 3'} stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {fmtPct(coin.price_change_percentage_24h)}
        </span>
      </div>

      <div>
        <div style={{display:'flex', alignItems:'baseline', gap:6}}>
          <span style={{fontSize:11, color:'var(--text-faint)'}}>$</span>
          <span className="mono" style={{fontSize:30, fontWeight:500, letterSpacing:'-0.02em'}}>
            <AnimNum value={coin.current_price} format={fmtPrice}/>
          </span>
        </div>
        <div style={{fontSize:12, color:'var(--text-dim)', marginTop: 4}}>
          24h vol · <span className="mono">${fmtBig(coin.total_volume)}</span>
        </div>
      </div>

      <div style={{marginTop:'auto', marginLeft:-4, marginRight:-4}}>
        <Sparkline data={coin.sparkline_in_7d?.price} width={300} height={56} positive={pos}/>
      </div>
    </button>
  );
}

// ---------- Chart card (mid row) ----------
function ChartCard({ coin, range='7d', onSelect }){
  const pos = (coin.price_change_percentage_24h ?? 0) >= 0;
  const points = coin.sparkline_in_7d?.price || [];
  const low = points.length ? Math.min(...points) : 0;
  const high = points.length ? Math.max(...points) : 0;
  return (
    <div className="card fade-up" style={{padding:20, display:'flex', flexDirection:'column', gap:14}}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <CoinGlyph coin={coin} size={28}/>
          <div>
            <div style={{fontSize:14, fontWeight:600, letterSpacing:'-0.01em'}}>{coin.name}</div>
            <div style={{fontSize:11, color:'var(--text-dim)', textTransform:'uppercase', letterSpacing:'0.08em'}}>{coin.symbol} / USD</div>
          </div>
        </div>
        <div style={{display:'flex', gap:4}}>
          {['24h','7d','30d'].map(r=>(
            <span key={r} style={{
              padding:'4px 8px', fontSize:11, borderRadius:999,
              background: r==='7d'?'var(--surface-2)':'transparent',
              color: r==='7d'?'var(--text)':'var(--text-faint)',
              border: '1px solid '+(r==='7d'?'var(--border)':'transparent')
            }}>{r}</span>
          ))}
        </div>
      </div>

      <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between'}}>
        <div className="mono" style={{fontSize:22, fontWeight:500, letterSpacing:'-0.02em'}}>
          ${fmtPrice(coin.current_price)}
        </div>
        <span className={pos?'chip chip-pos':'chip chip-neg'}>{fmtPct(coin.price_change_percentage_24h)}</span>
      </div>

      <div style={{margin:'0 -8px'}}>
        <Sparkline data={points} width={320} height={86} positive={pos}/>
      </div>

      <div style={{display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text-faint)'}}>
        <span>low <span className="mono" style={{color:'var(--text-dim)'}}>${fmtPrice(low)}</span></span>
        <span>high <span className="mono" style={{color:'var(--text-dim)'}}>${fmtPrice(high)}</span></span>
      </div>
    </div>
  );
}

// ---------- Search + filter chips bar ----------
function SearchBar({ q, setQ, filter, setFilter }){
  return (
    <div style={{display:'flex', alignItems:'center', gap:12, flexWrap:'wrap'}}>
      <div style={{
        flex: '1 1 320px', minWidth: 260,
        display:'flex', alignItems:'center', gap:10,
        padding:'12px 16px',
        background:'var(--surface)',
        border:'1px solid var(--border)',
        borderRadius: 999
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
          <path d="M11 11 L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        </svg>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search Bitcoin, Solana, …"
          style={{
            flex:1, background:'transparent', border:'none', outline:'none',
            color:'var(--text)', fontSize:14, fontFamily:'inherit'
          }}/>
        {q && <button onClick={()=>setQ('')} style={{
          background:'var(--surface-2)', border:'none', color:'var(--text-dim)',
          borderRadius:999, padding:'2px 8px', fontSize:11, cursor:'pointer'
        }}>clear</button>}
      </div>
      <div style={{display:'flex', gap:6}}>
        {[
          {k:'all', label:'All'},
          {k:'gainers', label:'Gainers'},
          {k:'losers', label:'Losers'},
          {k:'watch', label:'★ Watchlist'},
        ].map(f=>(
          <button key={f.k} onClick={()=>setFilter(f.k)} style={{
            padding:'9px 14px', borderRadius: 999, fontSize: 13,
            background: filter===f.k ? 'var(--text)' : 'var(--surface)',
            color: filter===f.k ? 'var(--bg)' : 'var(--text-dim)',
            border: '1px solid '+(filter===f.k ? 'var(--text)' : 'var(--border)'),
            cursor:'pointer', fontWeight: filter===f.k ? 600 : 500,
            transition: 'all 0.2s ease'
          }}>{f.label}</button>
        ))}
      </div>
    </div>
  );
}

// ---------- Price list row ----------
function PriceRow({ coin, idx, isWatched, onWatch, onSelect }){
  const pos = (coin.price_change_percentage_24h ?? 0) >= 0;
  return (
    <div className="row" style={{
      display:'grid',
      gridTemplateColumns: '36px 36px 1.6fr 1fr 1fr 1fr 120px 80px',
      alignItems:'center', gap: 16,
      padding:'14px 18px',
      borderRadius: 18,
      cursor:'pointer'
    }} onClick={()=>onSelect && onSelect(coin)}>
      <button onClick={(e)=>{ e.stopPropagation(); onWatch(coin.id); }} style={{
        background:'transparent', border:'none', cursor:'pointer',
        color: isWatched ? 'var(--accent)' : 'var(--text-faint)',
        fontSize: 16, padding: 0, lineHeight: 1
      }} aria-label="toggle watchlist">{isWatched?'★':'☆'}</button>
      <div className="mono" style={{color:'var(--text-faint)', fontSize:12}}>{String(idx+1).padStart(2,'0')}</div>
      <div style={{display:'flex', alignItems:'center', gap:12, minWidth:0}}>
        <CoinGlyph coin={coin} size={32}/>
        <div style={{minWidth:0}}>
          <div style={{fontSize:14, fontWeight:600, letterSpacing:'-0.01em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{coin.name}</div>
          <div style={{fontSize:11, color:'var(--text-dim)', textTransform:'uppercase', letterSpacing:'0.08em'}}>{coin.symbol}</div>
        </div>
      </div>
      <div className="mono" style={{fontSize:14, fontWeight:500, textAlign:'right'}}>${fmtPrice(coin.current_price)}</div>
      <div style={{textAlign:'right'}}>
        <span className={pos?'chip chip-pos':'chip chip-neg'}>{fmtPct(coin.price_change_percentage_24h)}</span>
      </div>
      <div className="mono" style={{fontSize:13, color:'var(--text-dim)', textAlign:'right'}}>${fmtBig(coin.market_cap)}</div>
      <div style={{textAlign:'right'}}>
        <Sparkline data={coin.sparkline_in_7d?.price} width={110} height={28} positive={pos} animate={false}/>
      </div>
      <div style={{textAlign:'right'}}>
        <button style={{
          background:'var(--surface-2)', border:'1px solid var(--border)',
          color:'var(--text)', padding:'6px 12px', borderRadius:999,
          fontSize:12, cursor:'pointer', fontFamily:'inherit'
        }}>Trade</button>
      </div>
    </div>
  );
}

// ---------- Market ticker (bottom strip) ----------
function MarketTicker({ coins }){
  const items = [...coins, ...coins]; // doubled for seamless loop
  return (
    <div style={{
      overflow:'hidden', borderRadius: 999,
      border:'1px solid var(--border)', background:'var(--bg-card)',
      backdropFilter:'blur(20px)',
      WebkitBackdropFilter:'blur(20px)',
      padding:'10px 0'
    }}>
      <div className="ticker-track" style={{display:'flex', gap:32, whiteSpace:'nowrap', width:'max-content'}}>
        {items.map((c,i)=>{
          const pos = (c.price_change_percentage_24h ?? 0) >= 0;
          return (
            <div key={i} style={{display:'inline-flex', alignItems:'center', gap:8, fontSize:13}}>
              <span style={{textTransform:'uppercase', color:'var(--text-dim)', letterSpacing:'0.08em', fontSize:11}}>{c.symbol}</span>
              <span className="mono">${fmtPrice(c.current_price)}</span>
              <span style={{color: pos?'var(--pos)':'var(--neg)', fontSize:12}} className="mono">
                {fmtPct(c.price_change_percentage_24h)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Stat summary card ----------
function StatCard({ label, value, sub, accent }){
  return (
    <div className="card" style={{padding: '16px 20px', display:'flex', flexDirection:'column', gap:6}}>
      <div style={{fontSize:11, color:'var(--text-faint)', textTransform:'uppercase', letterSpacing:'0.08em'}}>{label}</div>
      <div className="mono" style={{fontSize:22, fontWeight:500, letterSpacing:'-0.02em', color: accent || 'var(--text)'}}>{value}</div>
      {sub && <div style={{fontSize:12, color:'var(--text-dim)'}}>{sub}</div>}
    </div>
  );
}

Object.assign(window, {
  FlowrLogo, CoinGlyph, Sparkline, AnimNum,
  MoverCard, ChartCard, SearchBar, PriceRow, MarketTicker, StatCard
});
