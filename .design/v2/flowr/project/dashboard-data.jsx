// Data layer: CoinGecko live fetch with graceful fallback to mock data.
// The CoinGecko free endpoint /coins/markets supports browser CORS.

const FALLBACK_COINS = [
  {id:'bitcoin', symbol:'btc', name:'Bitcoin', image:null, current_price:71240.50, price_change_percentage_24h: 2.41, market_cap: 1410000000000, total_volume: 38200000000, sparkline_in_7d:{price: genSpark(68000, 72000)}},
  {id:'ethereum', symbol:'eth', name:'Ethereum', image:null, current_price:3845.22, price_change_percentage_24h: 3.82, market_cap: 462000000000, total_volume: 18900000000, sparkline_in_7d:{price: genSpark(3500, 3900)}},
  {id:'solana', symbol:'sol', name:'Solana', image:null, current_price:184.06, price_change_percentage_24h: 8.14, market_cap: 87000000000, total_volume: 4100000000, sparkline_in_7d:{price: genSpark(160, 190)}},
  {id:'binancecoin', symbol:'bnb', name:'BNB', image:null, current_price:612.45, price_change_percentage_24h: -1.22, market_cap: 91000000000, total_volume: 1800000000, sparkline_in_7d:{price: genSpark(600, 640)}},
  {id:'ripple', symbol:'xrp', name:'XRP', image:null, current_price:0.625, price_change_percentage_24h: -2.92, market_cap: 34500000000, total_volume: 2100000000, sparkline_in_7d:{price: genSpark(0.60, 0.66)}},
  {id:'dogecoin', symbol:'doge', name:'Dogecoin', image:null, current_price:0.158, price_change_percentage_24h: 5.61, market_cap: 22800000000, total_volume: 1300000000, sparkline_in_7d:{price: genSpark(0.14, 0.17)}},
  {id:'cardano', symbol:'ada', name:'Cardano', image:null, current_price:0.4720, price_change_percentage_24h: -0.42, market_cap: 16800000000, total_volume: 480000000, sparkline_in_7d:{price: genSpark(0.45, 0.49)}},
  {id:'avalanche-2', symbol:'avax', name:'Avalanche', image:null, current_price:38.20, price_change_percentage_24h: 4.10, market_cap: 14600000000, total_volume: 540000000, sparkline_in_7d:{price: genSpark(34, 40)}},
  {id:'tron', symbol:'trx', name:'TRON', image:null, current_price:0.118, price_change_percentage_24h: 0.78, market_cap: 10500000000, total_volume: 410000000, sparkline_in_7d:{price: genSpark(0.115, 0.122)}},
  {id:'chainlink', symbol:'link', name:'Chainlink', image:null, current_price:17.65, price_change_percentage_24h: 6.92, market_cap: 10300000000, total_volume: 620000000, sparkline_in_7d:{price: genSpark(15, 18)}},
  {id:'polkadot', symbol:'dot', name:'Polkadot', image:null, current_price:7.42, price_change_percentage_24h: -3.31, market_cap: 9800000000, total_volume: 280000000, sparkline_in_7d:{price: genSpark(7.0, 7.8)}},
  {id:'matic-network', symbol:'matic', name:'Polygon', image:null, current_price:0.748, price_change_percentage_24h: -4.85, market_cap: 7400000000, total_volume: 410000000, sparkline_in_7d:{price: genSpark(0.72, 0.82)}},
  {id:'litecoin', symbol:'ltc', name:'Litecoin', image:null, current_price:85.30, price_change_percentage_24h: 1.10, market_cap: 6400000000, total_volume: 320000000, sparkline_in_7d:{price: genSpark(82, 88)}},
  {id:'uniswap', symbol:'uni', name:'Uniswap', image:null, current_price:9.85, price_change_percentage_24h: 7.42, market_cap: 5900000000, total_volume: 180000000, sparkline_in_7d:{price: genSpark(8.8, 10.1)}},
  {id:'aptos', symbol:'apt', name:'Aptos', image:null, current_price:12.40, price_change_percentage_24h: -5.68, market_cap: 5600000000, total_volume: 220000000, sparkline_in_7d:{price: genSpark(12, 13.5)}},
];

function genSpark(lo, hi){
  const out = [];
  let v = (lo+hi)/2;
  for(let i=0;i<168;i++){
    v += (Math.random()-0.5) * (hi-lo) * 0.08;
    v = Math.max(lo*0.92, Math.min(hi*1.05, v));
    out.push(v);
  }
  return out;
}

async function fetchCoins() {
  const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=true&price_change_percentage=24h';
  try {
    const r = await fetch(url, { headers: { 'accept': 'application/json' } });
    if(!r.ok) throw new Error('http '+r.status);
    const data = await r.json();
    if(!Array.isArray(data) || data.length === 0) throw new Error('empty');
    return { coins: data, source: 'live' };
  } catch(e){
    console.warn('[flowr] CoinGecko unavailable, using fallback data:', e.message);
    return { coins: FALLBACK_COINS, source: 'fallback' };
  }
}

// Number formatters
function fmtPrice(n){
  if(n == null || isNaN(n)) return '—';
  if(n >= 1000) return n.toLocaleString('en-US', {maximumFractionDigits: 0});
  if(n >= 1) return n.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  return n.toLocaleString('en-US', {maximumFractionDigits: 4});
}
function fmtBig(n){
  if(n == null || isNaN(n)) return '—';
  if(n >= 1e12) return (n/1e12).toFixed(2)+'T';
  if(n >= 1e9)  return (n/1e9).toFixed(2)+'B';
  if(n >= 1e6)  return (n/1e6).toFixed(2)+'M';
  if(n >= 1e3)  return (n/1e3).toFixed(2)+'K';
  return n.toFixed(0);
}
function fmtPct(n){
  if(n == null || isNaN(n)) return '—';
  return (n>=0?'+':'') + n.toFixed(2) + '%';
}

Object.assign(window, { fetchCoins, fmtPrice, fmtBig, fmtPct, FALLBACK_COINS });
