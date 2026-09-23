/* MoneyShi · app/detail.js — the popup that shows what is behind any figure */
function rowHTML(t){
  const g=gOf(t);
  return `<button class="row${t.i?' int':''}" data-dd="ent" data-arg="${t.id}"><span class="r-d"><b>${fd(t.d)}</b><small>${esc(t.a)}</small></span><span class="r-m"><span class="r-n">${esc(t.n)}</span><small><i class="dot" style="background:${G_COL[g]||'var(--muted)'}"></i>${esc(t.c)}${t.note?' · '+esc(t.note):''}</small></span><span class="r-a ${t.dir}">${t.dir==='in'?'+':'−'}${inr2(t.amt)}</span></button>`;
}
let ddlg=null;
let STACK=[];
function specFor(type,a,a2){
  const base=t=>inP(t)&&!t.i,lab=periodLabel();
  if(type==='eq'){
    const M={inc:['Income','in','Income'],ref:['Refunds','in','Refunds'],pin:['From people','in','People'],liv:['Living costs','out','Living'],com:['Commitments','out','Commitments'],pout:['To people','out','People']};
    if(a==='left')return{title:'All money in and out',sub:lab,fn:t=>base(t)};
    const m=M[a];return{title:m[0],sub:lab,fn:t=>base(t)&&t.dir===m[1]&&gOf(t)===m[2],prefill:{dir:m[1]}};
  }
  if(type==='allout')return{title:'All money out',sub:lab,fn:t=>base(t)&&t.dir==='out'};
  if(type==='cat'){const dir=a2||'out';return{title:a,sub:lab+' · '+(dir==='in'?'money in':'money out'),fn:t=>base(t)&&t.dir===dir&&t.c===a,prefill:{dir,c:a},goto:{cat:a}};}
  if(type==='oth'){const r=pieData(a).find(x=>x.other),set=new Set(r?r.other:[]);return{title:'Other categories',sub:lab+' · '+(a==='in'?'money in':'money out'),fn:t=>base(t)&&t.dir===a&&set.has(t.c)};}
  if(type==='payee')return{title:a,sub:lab,fn:t=>base(t)&&t.n===a,prefill:{n:a,dir:'out'}};
  if(type==='acc')return{title:accLabel(a),sub:lab,fn:t=>inP(t)&&t.a===a};
  if(type==='day')return{title:fdFull(a),sub:'Everything on this day',fn:t=>t.d===a,scope:t=>t.d===a};
  if(type==='mon')return{title:mname(a)+(a2==='in'?' · money in':a2==='out'?' · money out':''),sub:'',fn:t=>t.d.startsWith(a)&&!t.i&&(a2==='all'||t.dir===a2),scope:t=>t.d.startsWith(a)};
  if(type==='bud'){const m=S.month;return{title:BL(a),sub:mname(m)+' · budget '+inr(BUDGETS[a]||0),fn:t=>t.d.startsWith(m)&&!t.i&&t.dir==='out'&&(a==='__living'?gOf(t)==='Living':t.c===a),prefill:a==='__living'?{dir:'out'}:{dir:'out',c:a}};}
  return null;
}
function openDetail(spec,push){
  if(!ddlg.open||!push)STACK=[];
  STACK.push({kind:'list',spec,limit:60});
  if(!ddlg.open)openD(ddlg);
  renderDetail();ddlg.scrollTop=0;
}
function pushEntry(id){
  if(!ddlg.open)STACK=[];
  STACK.push({kind:'entry',id});
  if(!ddlg.open)openD(ddlg);
  renderDetail();ddlg.scrollTop=0;
}
function renderDetail(){
  if(!ddlg.open)return;
  const top=STACK[STACK.length-1];
  if(!top){closeD(ddlg);return;}
  $('#dd-back').hidden=STACK.length<2;
  const body=$('#dd-body');
  if(top.kind==='entry'){
    const t=TX.find(x=>x.id===top.id);
    if(!t){STACK.pop();renderDetail();return;}
    $('#dd-title').textContent=t.n;$('#dd-sub').textContent=fdFull(t.d)+(t.t?' · '+t.t:'');
    const g=gOf(t);
    body.innerHTML=`<div class="big-amt ${t.dir}">${t.dir==='in'?'+':'−'}${inr2(t.amt)}</div>
<dl class="kv">
<dt>Type</dt><dd>${t.i?'Between your own accounts':t.dir==='in'?'Money in':'Money out'}</dd>
<dt>Category</dt><dd><i class="dot" style="background:${G_COL[g]||'var(--muted)'}"></i>${esc(t.c)}</dd>
<dt>Counts as</dt><dd>${t.i?'Not counted':esc(GLABEL[g]||g)}</dd>
<dt>Account</dt><dd>${esc(accLabel(t.a))}</dd>
<dt>Date</dt><dd>${esc(fdFull(t.d))}${t.t?' at '+esc(t.t):''}</dd>
<dt>Note</dt><dd>${t.note?esc(t.note):'None'}</dd>
<dt>Reference</dt><dd>${t.u?esc(t.u):'None'}</dd>
</dl>
<div class="sheet-act"><button class="primary" data-edit="${t.id}">Edit</button><button class="btn" data-dd="payee" data-arg="${esc(t.n)}">All with ${esc(t.n.length>22?t.n.slice(0,22)+'…':t.n)}</button></div>`;
    return;
  }
  const spec=top.spec;
  $('#dd-title').textContent=spec.title;$('#dd-sub').textContent=spec.sub||'';
  const list=TX.filter(spec.fn).sort(byDate),real=list.filter(t=>!t.i);
  const outL=real.filter(t=>t.dir==='out'),inL=real.filter(t=>t.dir==='in'),out=sum(outL),inn=sum(inL);
  let k;
  if(out&&inn)k=[['Money in',inr(inn),'pos'],['Money out',inr(out),''],['Net',(inn>=out?'+':'−')+inr(Math.abs(inn-out)),inn>=out?'pos':'neg'],['Entries',real.length,'']];
  else if(out){const sc=spec.scope||inP,po=sum(TX.filter(t=>sc(t)&&!t.i&&t.dir==='out'));k=[['Total out',inr(out),''],['Entries',outL.length,''],['Average',inr(out/outL.length),''],['Share of spending',po?Math.round(out/po*100)+'%':'–','']];}
  else if(inn){const sc=spec.scope||inP,pi=sum(TX.filter(t=>sc(t)&&!t.i&&t.dir==='in'));k=[['Total in',inr(inn),'pos'],['Entries',inL.length,''],['Average',inr(inn/inL.length),''],['Share of money in',pi?Math.round(inn/pi*100)+'%':'–','']];}
  else k=[['Entries',list.length,'']];
  let h='<div class="kpis">'+k.map(x=>`<div class="kpi"><small>${x[0]}</small><b class="${x[2]}">${x[1]}</b></div>`).join('')+'</div>';
  if((out&&!inn)||(inn&&!out)){
    const dir=out?'out':'in',src=out?outL:inL,cats=new Set(src.map(t=>t.c)),byC=cats.size>1,m=new Map();
    src.forEach(t=>{const key=byC?t.c:t.n,o=m.get(key)||{k:key,v:0,n:0};o.v+=t.amt;o.n++;m.set(key,o);});
    const rows=[...m.values()].sort((a,b)=>b.v-a.v).slice(0,6);
    if(rows.length>1){
      const mx=rows[0].v;
      h+=`<h3>${byC?'By category':'By payee'}</h3>`+rows.map(r=>`<button class="bd-row" data-dd="${byC?'cat':'payee'}" data-arg="${esc(r.k)}" data-arg2="${dir}"><span class="n">${esc(r.k)}</span><span class="a">${inr(r.v)}</span><small>${r.n} entr${plural(r.n,'y','ies')}</small><span></span><span class="b"><i class="bar" style="width:${r.v/mx*100}%;background:${dir==='in'?'var(--in)':'var(--living)'}"></i></span></button>`).join('');
    }
  }
  h+=`<h3>${list.length} entr${plural(list.length,'y','ies')}</h3>`+list.slice(0,top.limit).map(rowHTML).join('');
  if(list.length>top.limit)h+=`<button class="btn more" id="dd-more">Show all ${list.length}</button>`;
  h+=`<div class="sheet-act"><button class="primary" id="dd-add">+ Add entry</button>${spec.goto?'<button class="btn" id="dd-goto">Open in Entries</button>':''}</div>`;
  body.innerHTML=h;
}
function refreshDetail(){if(ddlg&&ddlg.open)renderDetail();}

function initDetail(){
  ddlg=$('#dlg-detail');
  ddlg.addEventListener('close',()=>{STACK=[];});
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-dd],#dd-close,#dd-back,#dd-more,#dd-add,#dd-goto');if(!b)return;
    if(b.dataset.dd!==undefined){
      const push=!!b.closest('#dlg-detail'),type=b.dataset.dd,a=b.dataset.arg,a2=b.dataset.arg2;
      if(type==='ent')pushEntry(+a);else{const sp=specFor(type,a,a2);if(sp)openDetail(sp,push);}
      return;
    }
    if(b.id==='dd-close'){closeD(ddlg);return;}
    if(b.id==='dd-back'){STACK.pop();renderDetail();ddlg.scrollTop=0;return;}
    if(b.id==='dd-more'){STACK[STACK.length-1].limit=1e9;renderDetail();return;}
    if(b.id==='dd-add'){const top=STACK[STACK.length-1];openForm(null,top&&top.spec?top.spec.prefill:null);return;}
    if(b.id==='dd-goto'){const top=STACK[STACK.length-1];if(top&&top.spec&&top.spec.goto){try{sessionStorage.setItem('moneyshi.cat',top.spec.goto.cat||'');}catch(x){}location.href='entries.html';}}
  });
  document.addEventListener('keydown',e=>{
    if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('[data-dd]:not(button)')){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}
  });
}
