/* MoneyShi · app/layout.js — builds the header, the tab bar and the popups on every app page. */
const NAV=[
  {id:'dashboard',label:'Overview',href:'dashboard.html',icon:'<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>'},
  {id:'charts',label:'Charts',href:'charts.html',feature:'charts',icon:'<path d="M12 3a9 9 0 1 0 9 9h-9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>'},
  {id:'budgets',label:'Budgets',href:'budgets.html',feature:'budgets',icon:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8"/>'},
  {id:'entries',label:'Entries',href:'entries.html',icon:'<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>'}
];
const initialOf=u=>((u.display||u.username||'?').trim()[0]||'?').toUpperCase();
function layoutInit(o){
  o=o||{};applyTheme();
  const nav=NAV.filter(n=>!n.feature||CFG.features[n.feature]!==false);
  const tabs=nav.map(n=>`<a href="${n.href}"${o.page===n.id?' aria-current="page"':''}><svg viewBox="0 0 24 24">${n.icon}</svg><span>${n.label}</span></a>`).join('');
  const month=o.month===false?'':'<div class="monthnav"><button class="iconb" id="prev" aria-label="Previous month">‹</button><select class="month" id="month" aria-label="Month"></select><button class="iconb" id="next" aria-label="Next month">›</button></div>';
  const add=o.add===false?'':'<button class="primary" id="add">+ Add</button>';
  const admin=CUR&&CUR.role==='admin'?'<a class="btn" href="admin/index.html" title="Admin">Admin</a>':'';
  document.body.insertAdjacentHTML('afterbegin',`<header class="app"><div class="app-in">
    <a class="brand" href="dashboard.html">${BRAND_MARK}<div class="brand-t"><b>${esc(CFG.name)}</b><span>${esc(CFG.tagline)}</span></div></a>
    <nav class="tabs" aria-label="Sections">${tabs}</nav>
    <div class="ctl">${month}${add}<a class="btn" href="settings.html" title="Data and backup">Data</a>${admin}<a class="avatar" href="account.html" title="${esc(CUR.display)} (${esc(CUR.username)})" aria-label="Account">${esc(initialOf(CUR))}</a></div>
  </div></header>`);
  if(o.add!==false){
    document.body.insertAdjacentHTML('beforeend',TPL_ENTRY+TPL_DETAIL+'<button class="fab" id="fab" aria-label="Add entry">+</button>');
    initEntryForm();initDetail();
    $('#add').addEventListener('click',()=>openForm(null));$('#fab').addEventListener('click',()=>openForm(null));
  }
  if(o.month!==false){
    $('#month').addEventListener('change',e=>{setMonth(e.target.value);S.limit=50;renderAll();});
    $('#prev').addEventListener('click',()=>{const ms=months().reverse();const i=ms.indexOf(S.month);if(i>=0&&i<ms.length-1){setMonth(ms[i+1]);renderAll();}});
    $('#next').addEventListener('click',()=>{const ms=months().reverse();const i=ms.indexOf(S.month);if(i>0){setMonth(ms[i-1]);renderAll();}});
  }
}
function renderMonthSelect(){
  const ms=months().reverse();
  if(!ms.length)ms.push(todayISO().slice(0,7));
  $('#month').innerHTML=ms.map(m=>`<option value="${m}" ${S.month===m?'selected':''}>${mname(m)}</option>`).join('')+`<option value="all" ${S.month==='all'?'selected':''}>All time</option>`;
  const i=ms.indexOf(S.month);
  $('#prev').disabled=S.month==='all'||i>=ms.length-1;
  $('#next').disabled=S.month==='all'||i<=0;
}

function renderSaveNote(){
  const cloud=CLOUD();
  const st=cloud?'Saved online in your account.':(DB.mode==='idb'?(APP()?'Saved on this phone.':'Saved in this browser on this device.'):'Storage is blocked here, so entries are lost when you close the page.');
  const lx=LASTX?'Last backup '+fd(LASTX)+'.':'No backup yet.';
  const n=$('#savenote');if(n)n.innerHTML=esc(st+' '+lx+' ')+'<a href="settings.html">Back up now</a>';
  const b=$('#banner');
  if(b){if(!cloud&&DB.mode!=='idb'){b.hidden=false;b.textContent='Storage is blocked here (private mode or a restricted viewer), so entries are lost when you close the page. Export a backup often.';}else b.hidden=true;}
}
