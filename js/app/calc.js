/* MoneyShi · app/calc.js — totals, chart data and budget maths shared by pages */
function stats(list){
  const s={inc:0,ref:0,pin:0,liv:0,com:0,pout:0};
  for(const t of list){
    if(t.i)continue;const g=gOf(t);
    if(t.dir==='in'){if(g==='Income')s.inc+=t.amt;else if(g==='Refunds')s.ref+=t.amt;else s.pin+=t.amt;}
    else{if(g==='Living')s.liv+=t.amt;else if(g==='Commitments')s.com+=t.amt;else s.pout+=t.amt;}
  }
  s.left=s.inc+s.ref+s.pin-s.liv-s.com-s.pout;return s;
}
const G_COL={Living:'var(--living)',Commitments:'var(--commit)',People:'var(--people)',Income:'var(--in)',Refunds:'var(--refund)',Internal:'var(--muted)'};
const byDate=(a,b)=>(b.d+(b.t||'00:00')).localeCompare(a.d+(a.t||'00:00'))||b.id-a.id;
const sum=(l,f)=>l.reduce((a,t)=>a+(f?f(t):t.amt),0);
const fdFull=d=>utc(d).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
const periodLabel=()=>S.month==='all'?(TX.length?fd(minDate())+' – '+fd(maxDate()):'All time'):mname(S.month);
const niceTop=mx=>[1000,2000,5000,10000,20000,50000,100000,150000,200000,300000,500000,1000000,2000000,5000000].find(x=>x>=mx)||Math.ceil(mx/1000000)*1000000;
const plural=(n,a,b)=>n===1?a:b;
function pieData(dir){
  const m=new Map();
  TX.filter(t=>inP(t)&&!t.i&&t.dir===dir).forEach(t=>{const o=m.get(t.c)||{k:t.c,v:0,n:0};o.v+=t.amt;o.n++;m.set(t.c,o);});
  let rows=[...m.values()].sort((a,b)=>b.v-a.v);
  if(rows.length>7){const rest=rows.slice(6);rows=rows.slice(0,6);rows.push({k:'Other categories',v:sum(rest,r=>r.v),n:sum(rest,r=>r.n),other:rest.map(r=>r.k)});}
  return rows;
}
const BL=k=>k==='__living'?'All living costs':k;
function monthSpend(month){
  const by={};let liv=0;
  TX.forEach(t=>{if(t.i||t.dir!=='out'||!t.d.startsWith(month))return;by[t.c]=(by[t.c]||0)+t.amt;if(gOf(t)==='Living')liv+=t.amt;});
  by.__living=liv;return by;
}
const bstat=(spent,limit)=>{const p=spent/limit;return p>=1?'over':p>=.8?'near':'ok';};
function avgMonthly(){
  const ms=months();
  let full=ms.filter(k=>{const s=span(k);return s[0]===1&&s[1]===dim(+k.slice(0,4),+k.slice(5));});
  if(!full.length)full=ms;
  const out={__living:0};
  full.forEach(k=>{const sp=monthSpend(k);Object.keys(sp).forEach(c=>{out[c]=(out[c]||0)+sp[c];});});
  Object.keys(out).forEach(c=>{out[c]=out[c]/(full.length||1);});
  return out;
}
function budgetRows(){
  const keys=Object.keys(BUDGETS).filter(k=>BUDGETS[k]>0);
  if(S.month==='all'||!keys.length)return null;
  const sp=monthSpend(S.month);
  return keys.map(k=>{const spent=sp[k]||0,limit=BUDGETS[k];return{k,spent,limit,pct:spent/limit,st:bstat(spent,limit)};}).sort((a,b)=>b.pct-a.pct);
}
