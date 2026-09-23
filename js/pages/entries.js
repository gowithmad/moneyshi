/* MoneyShi · pages/entries.js — Entries page: search, filters and list */
function filtered(){
  const q=S.q.trim().toLowerCase();
  return TX.filter(t=>{
    if(!inP(t))return false;if(S.dir&&t.dir!==S.dir)return false;if(S.cat&&t.c!==S.cat)return false;
    if(q&&!((t.n+' '+(t.note||'')+' '+t.c).toLowerCase().includes(q)))return false;return true;
  }).sort(byDate);
}
function renderList(){
  const l=filtered();
  const o=sum(l.filter(t=>!t.i&&t.dir==='out')),i=sum(l.filter(t=>!t.i&&t.dir==='in'));
  $('#count').textContent=l.length+' entr'+plural(l.length,'y','ies')+' · '+inr(o)+' out · '+inr(i)+' in';
  $('#list').innerHTML=l.slice(0,S.limit).map(rowHTML).join('')||`<div class="empty">No entries match. <button class="linkb" data-newentry="1">Add one</button></div>`;
  $('#more').hidden=l.length<=S.limit;$('#more').textContent='Show '+Math.min(50,l.length-S.limit)+' more';
}
function renderFilters(){
  const cats=[...new Set([...Object.keys(catMap('out')),...Object.keys(catMap('in')),INTERNAL])];
  $('#fcat').innerHTML='<option value="">All categories</option>'+cats.map(c=>`<option ${c===S.cat?'selected':''}>${esc(c)}</option>`).join('');
  $('#fdir').value=S.dir;
  $('#af').innerHTML=S.cat?`<button data-clear="cat">${esc(S.cat)} ✕</button>`:'';
  $('#names').innerHTML=[...new Set(TX.map(t=>t.n))].sort().slice(0,600).map(n=>`<option value="${esc(n)}">`).join('');
}

function initEntries(){
  try{const c=sessionStorage.getItem('moneyshi.cat');if(c){S.cat=c;sessionStorage.removeItem('moneyshi.cat');}}catch(e){}
  $('#q').addEventListener('input',e=>{S.q=e.target.value;S.limit=50;renderList();});
  $('#fdir').addEventListener('change',e=>{S.dir=e.target.value;S.limit=50;renderAll();});
  $('#fcat').addEventListener('change',e=>{S.cat=e.target.value;S.limit=50;renderAll();});
  $('#more').addEventListener('click',()=>{S.limit+=50;renderList();});
  document.addEventListener('click',e=>{const b=e.target.closest('[data-clear]');if(b){S[b.dataset.clear]='';S.limit=50;renderAll();}});
}
bootApp({page:'entries',init:initEntries,render:[renderFilters,renderList]});
