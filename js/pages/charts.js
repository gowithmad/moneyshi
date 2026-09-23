/* MoneyShi · pages/charts.js — Charts page: pies, bars, top payees */
function renderPie(dir,svgId,legId){
  const rows=pieData(dir),tot=sum(rows,r=>r.v);
  const svg=$('#'+svgId),leg=$('#'+legId);
  if(!tot){svg.innerHTML='<circle cx="100" cy="100" r="70" fill="none" stroke="var(--soft)" stroke-width="34"/><text x="100" y="105" text-anchor="middle" class="pc-s">No data</text>';leg.innerHTML='';return;}
  const R=70,C=2*Math.PI*R;let cum=0,h='';
  rows.forEach((r,i)=>{
    const f=r.v/tot,len=Math.max(0.5,f*C-(rows.length>1?1.6:0));
    r.col=r.other?'var(--c9)':'var(--c'+(i+1)+')';
    r.dd=r.other?'oth':'cat';r.arg=r.other?dir:r.k;
    h+=`<circle class="slice" r="${R}" cx="100" cy="100" fill="none" stroke="${r.col}" stroke-width="34" stroke-dasharray="${len} ${C-len}" stroke-dashoffset="${-cum*C}" transform="rotate(-90 100 100)" data-dd="${r.dd}" data-arg="${esc(r.arg)}" data-arg2="${dir}" tabindex="0" role="button" aria-label="${esc(r.k)}, ${inr(r.v)}"><title>${esc(r.k)} · ${inr(r.v)} · ${Math.round(f*100)}%</title></circle>`;
    cum+=f;
  });
  h+=`<text x="100" y="98" text-anchor="middle" class="pc-v">₹${cmp(tot)}</text><text x="100" y="118" text-anchor="middle" class="pc-s">${dir==='out'?'money out':'money in'}</text>`;
  svg.innerHTML=h;
  leg.innerHTML=rows.map(r=>`<li><button data-dd="${r.dd}" data-arg="${esc(r.arg)}" data-arg2="${dir}"><i style="background:${r.col}"></i><span class="ln">${esc(r.k)}<small>${Math.round(r.v/tot*100)}%</small></span><b>${inr(r.v)}</b></button></li>`).join('');
}
function renderPies(){renderPie('out','pie-out','leg-out');renderPie('in','pie-in','leg-in');}

/* bar charts */
function renderMonthBars(){
  const svg=$('#bars-months');const ms=months().slice(-12);
  if(!ms.length){svg.innerHTML='';return;}
  const st=ms.map(k=>{const l=TX.filter(t=>t.d.startsWith(k)&&!t.i);return{i:sum(l.filter(t=>t.dir==='in')),o:sum(l.filter(t=>t.dir==='out'))};});
  const top=niceTop(Math.max(1,...st.flatMap(s=>[s.i,s.o])));
  const n=ms.length,L=40,B=48,T=18,H=260,gwm=150;
  const W=Math.max(640,L+n*gwm+4),ph=H-B-T,bw=32,gap=6,first=minDate(),last=maxDate();
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.style.minWidth=n>4?(n*120)+'px':'0';
  let g='';
  [0,.5,1].forEach(f=>{const y=T+ph-f*ph;g+=`<line class="grid" x1="${L}" x2="${W}" y1="${y}" y2="${y}"/><text class="lbl" x="${L-6}" y="${y+3}" text-anchor="end">${cmp(top*f)}</text>`;});
  ms.forEach((k,i)=>{
    const gw=(W-L-4)/n,x0=L+i*gw+(gw-(2*bw+gap))/2;
    const dimm=S.month!=='all'&&S.month!==k?' opacity=".35"':'';
    g+=`<g${dimm}>`;
    [['i','b-in','in'],['o','b-out','out']].forEach((s,j)=>{
      const v=st[i][s[0]],h=v/top*ph,x=x0+j*(bw+gap);
      g+=`<rect class="${s[1]} bar-h" x="${x}" y="${T+ph-h}" width="${bw}" height="${Math.max(h,v>0?1:0)}" rx="4" data-dd="mon" data-arg="${k}" data-arg2="${s[2]}" tabindex="0" role="button" aria-label="${mname(k)} ${s[2]==='in'?'money in':'money out'} ${inr(v)}"><title>${mname(k)} · ${s[2]==='in'?'money in':'money out'} · ${inr(v)}</title></rect>`;
      if(v>0)g+=`<text class="lbl" x="${x+bw/2}" y="${T+ph-h-4}" text-anchor="middle">${cmp(v)}</text>`;
    });
    const y=+k.slice(0,4),m=+k.slice(5),a=k===first.slice(0,7)?+first.slice(8):1,b=k===last.slice(0,7)?+last.slice(8):dim(y,m);
    const lab=(a===1&&b===dim(y,m))?MN[m-1]:MN[m-1]+' '+a+'–'+b;
    const net=st[i].i-st[i].o;
    g+=`<text class="mname" x="${L+i*gw+gw/2}" y="${H-24}" text-anchor="middle">${lab}</text><text class="net ${net>=0?'p':'n'}" x="${L+i*gw+gw/2}" y="${H-8}" text-anchor="middle">net ${net<0?'−':'+'}${cmp(Math.abs(net))}</text></g>`;
  });
  svg.innerHTML=g;
}
function renderDayBars(){
  const svg=$('#bars-days');
  if(!TX.length){svg.innerHTML='';$('#daysub').textContent='';return;}
  const days=[];
  if(S.month==='all'){const e=utc(maxDate());for(let i=29;i>=0;i--)days.push(isoOf(addDays(e,-i)));$('#daysub').textContent='The last 30 days';}
  else{const y=+S.month.slice(0,4),m=+S.month.slice(5);for(let d=1;d<=dim(y,m);d++)days.push(S.month+'-'+String(d).padStart(2,'0'));$('#daysub').textContent=mname(S.month)+'. Tap a day for its entries.';}
  const by=new Map();
  TX.forEach(t=>{if(t.i)return;const o=by.get(t.d)||{i:0,o:0};o[t.dir==='in'?'i':'o']+=t.amt;by.set(t.d,o);});
  const top=niceTop(Math.max(1,...days.map(d=>{const o=by.get(d);return o?Math.max(o.i,o.o):0;})));
  const n=days.length,L=40,B=26,T=14,H=230,W=Math.max(640,L+n*20+4),ph=H-B-T,gw=(W-L-4)/n,bw=Math.max(3,Math.min(9,gw/2-1.5));
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.style.minWidth=n>20?'560px':'0';
  let g='';
  [0,.5,1].forEach(f=>{const y=T+ph-f*ph;g+=`<line class="grid" x1="${L}" x2="${W}" y1="${y}" y2="${y}"/><text class="lbl" x="${L-6}" y="${y+3}" text-anchor="end">${cmp(top*f)}</text>`;});
  days.forEach((d,i)=>{
    const o=by.get(d)||{i:0,o:0},cx=L+i*gw+gw/2;
    const ho=o.o/top*ph,hi=o.i/top*ph;
    g+=`<rect class="hit" data-dd="day" data-arg="${d}" x="${L+i*gw}" y="${T}" width="${gw}" height="${ph}" tabindex="0" role="button" aria-label="${fd(d)}: ${inr(o.o)} out, ${inr(o.i)} in"><title>${fd(d)} · out ${inr(o.o)} · in ${inr(o.i)}</title></rect>`;
    if(o.o>0)g+=`<rect class="b-out" x="${cx-bw-.5}" y="${T+ph-ho}" width="${bw}" height="${Math.max(ho,1)}" rx="2" pointer-events="none"/>`;
    if(o.i>0)g+=`<rect class="b-in" x="${cx+.5}" y="${T+ph-hi}" width="${bw}" height="${Math.max(hi,1)}" rx="2" pointer-events="none"/>`;
    const dn=+d.slice(8);
    if(dn===1||dn%5===0||i===0)g+=`<text class="lbl" x="${cx}" y="${H-8}" text-anchor="middle">${S.month==='all'&&(dn===1||i===0)?dn+' '+MN[+d.slice(5,7)-1]:dn}</text>`;
  });
  svg.innerHTML=g;
}
function renderPayees(){
  const m=new Map();
  TX.filter(t=>inP(t)&&!t.i&&t.dir==='out').forEach(t=>{const o=m.get(t.n)||{n:t.n,g:gOf(t),v:0,c:0};o.v+=t.amt;o.c++;m.set(t.n,o);});
  const rows=[...m.values()].sort((a,b)=>b.v-a.v).slice(0,9),mx=rows.length?rows[0].v:1;
  $('#payees').innerHTML=rows.map(r=>`<button class="rank" data-dd="payee" data-arg="${esc(r.n)}"><span class="n">${esc(r.n)}</span><span class="a">${inr(r.v)}</span><small>${r.c} payment${r.c>1?'s':''}</small><span></span><span class="b"><i class="bar g-${r.g}" style="width:${r.v/mx*100}%"></i></span></button>`).join('')||'<div class="empty">Nothing yet.</div>';
}

bootApp({page:'charts',render:[renderPies,renderMonthBars,renderDayBars,renderPayees]});
