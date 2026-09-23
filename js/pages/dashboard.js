/* MoneyShi · pages/dashboard.js — Overview page */
function renderTop(){
  const list=TX.filter(inP);const s=stats(list);const days=daysIn(S.month);
  const inn=s.inc+s.ref+s.pin,out=s.liv+s.com+s.pout;
  if(!list.length){
    $('#headline').textContent='Nothing recorded for '+(S.month==='all'?'this tracker':mname(S.month))+' yet.';
    $('#plabel').textContent='Add an entry, or import a file from Data & backup.';
  }else{
    $('#headline').textContent=inr(inn)+' came in, '+inr(out)+' went out'+(s.left<0?'. That is '+inr(-s.left)+' more out than in.':'. That leaves '+inr(s.left)+'.');
    let lab;
    if(S.month==='all')lab=fd(minDate())+' – '+fd(maxDate());
    else{const [a,b]=span(S.month);const last=dim(+S.month.slice(0,4),+S.month.slice(5));lab=a===1&&b===last?mname(S.month):mname(S.month)+' · days '+a+'–'+b;}
    $('#plabel').textContent=lab+' · '+days+' day'+(days>1?'s':'')+' · '+list.length+' entries';
  }
  const c=[['inc','+ Income',s.inc,'salary and other income','pos'],['ref','+ Refunds',s.ref,'refunds and reimbursements','pos'],['pin','+ From people',s.pin,'family and friends','pos'],
   ['liv','− Living',s.liv,inr(s.liv/days)+' a day',''],['com','− Commitments',s.com,'card bills, SIP/EMI, tax',''],['pout','− To people',s.pout,'family and friends','']];
  $('#eq').innerHTML=c.map(x=>`<button class="eqc ${x[4]}" data-dd="eq" data-arg="${x[0]}"><span class="k">${x[1]}</span><span class="v">${inr(x[2])}</span><span class="s">${x[3]}</span></button>`).join('')
   +`<button class="eqc res" data-dd="eq" data-arg="left"><span class="k">= Left</span><span class="v ${s.left<0?'neg':''}">${s.left<0?'−':''}${inr(Math.abs(s.left))}</span><span class="s">${s.left<0?'more out than in':'in minus out'}</span></button>`;
}
function renderCats(){
  const m=new Map();
  TX.filter(t=>inP(t)&&!t.i&&t.dir==='out').forEach(t=>{const o=m.get(t.c)||{c:t.c,g:gOf(t),v:0,n:0};o.v+=t.amt;o.n++;m.set(t.c,o);});
  const rows=[...m.values()].sort((a,b)=>b.v-a.v);
  const tot=rows.reduce((a,r)=>a+r.v,0),mx=rows.length?rows[0].v:1;
  let h=rows.slice(0,8).map(r=>`<li><button class="cat" data-dd="cat" data-arg="${esc(r.c)}" data-arg2="out"><span class="cat-n">${esc(r.c)}<small>${r.n} payment${r.n>1?'s':''}</small></span><span class="cat-b"><i class="bar g-${r.g}" style="width:${Math.max(2,r.v/mx*100)}%"></i></span><span class="cat-v">${inr(r.v)}<small>${Math.round(r.v/tot*100)}%</small></span></button></li>`).join('');
  if(rows.length>8)h+=`<li><button class="cat" data-dd="allout" style="grid-template-columns:1fr auto"><span class="cat-n">${rows.length-8} more categories</span><span class="cat-v">${inr(rows.slice(8).reduce((a,r)=>a+r.v,0))}</span></button></li>`;
  $('#cats').innerHTML=h||'<li class="empty">No spending in this period.</li>';
}
function renderBig(){
  const l=TX.filter(t=>inP(t)&&!t.i&&t.dir==='out').sort((a,b)=>b.amt-a.amt).slice(0,6);
  $('#big').innerHTML=l.map(t=>`<button class="rank" data-dd="ent" data-arg="${t.id}"><span class="n">${esc(t.n)}</span><span class="a">${inr2(t.amt)}</span><small>${fd(t.d)} · ${esc(t.c)}</small><span></span></button>`).join('')||'<div class="empty">Nothing yet.</div>';
}
function renderAcc(){
  $('#acc').innerHTML=ACCS.map(a=>{
    const l=TX.filter(t=>inP(t)&&!t.i&&t.a===a.k);
    const o=sum(l.filter(t=>t.dir==='out')),i=sum(l.filter(t=>t.dir==='in'));
    return `<button class="acc" data-dd="acc" data-arg="${esc(a.k)}"><span><b>${esc(a.l)}</b><br><small>${l.length} entr${l.length===1?'y':'ies'}</small></span><span class="r">${inr(o)} out<br><span class="in-c">${inr(i)} in</span></span></button>`;
  }).join('');
}

function renderBudgetWarn(){
  const warn=$('#budwarn');if(!warn)return;warn.hidden=true;
  const rows=budgetRows();if(!rows)return;
  const over=rows.filter(r=>r.st==='over'),near=rows.filter(r=>r.st==='near');
  if(!over.length&&!near.length)return;
  const part=(l,label)=>l.length?`<b>${label}:</b> `+l.slice(0,3).map(r=>`${esc(BL(r.k))} (${inr(r.spent)} of ${inr(r.limit)})`).join(', ')+(l.length>3?` and ${l.length-3} more`:''):'';
  warn.hidden=false;warn.className='bwarn '+(over.length?'over':'near');
  warn.innerHTML=[part(over,'Over budget'),part(near,'Close to the limit')].filter(Boolean).join(' · ')+' <a href="budgets.html">See budgets</a>';
}
bootApp({page:'dashboard',render:[renderTop,renderBudgetWarn,renderCats,renderBig,renderAcc]});
