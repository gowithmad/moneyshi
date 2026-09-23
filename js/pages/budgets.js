/* MoneyShi · pages/budgets.js — Budgets page */
function openBud(){
  const ms=months();const ref=S.month==='all'?(ms.length?ms[ms.length-1]:todayISO().slice(0,7)):S.month;
  const sp=monthSpend(ref),av=avgMonthly();
  const cats=['__living',...Object.keys(catMap('out'))];
  $('#b-list').innerHTML=cats.map(k=>`<label class="brow"><span>${esc(BL(k))}<small>${inr(sp[k]||0)} in ${MN[+ref.slice(5)-1]}${av[k]>=1?' · usually '+inr(av[k])+' a month':''}</small></span><input type="number" min="0" step="100" inputmode="numeric" data-bk="${esc(k)}" placeholder="No limit" value="${BUDGETS[k]||''}"></label>`).join('');
  openD($('#dlg-bud'));
}
function suggestBud(){
  const av=avgMonthly();
  document.querySelectorAll('#b-list input').forEach(i=>{
    const k=i.dataset.bk;const living=k==='__living'||catMap('out')[k]==='Living';const a=av[k]||0;
    if(living&&a>=50){const c=a*1.1,step=c>=5000?1000:c>=1000?500:100;i.value=Math.ceil(c/step)*step;}
  });
}
async function saveBud(){
  const nb={};
  document.querySelectorAll('#b-list input').forEach(i=>{const v=parseFloat(i.value);if(v>0)nb[i.dataset.bk]=Math.round(v);});
  BUDGETS=nb;await DB.setMeta('budgets',BUDGETS);closeD($('#dlg-bud'));renderAll();
  toast(Object.keys(nb).length?'Budgets saved':'Budgets cleared');
}


function renderBudgets(){
  const body=$('#budbody');
  const rows=budgetRows(),keys=Object.keys(BUDGETS).filter(k=>BUDGETS[k]>0);
  if(S.month==='all'){$('#budsub').textContent='Pick a single month to compare it with your limits.';body.innerHTML=keys.length?'<div class="empty">Choose a month at the top.</div>':'<div class="empty">No budgets yet. <button class="linkb" data-openbud="1">Set budgets</button></div>';return;}
  const today=todayISO();let sub=mname(S.month)+'. Limits start again each month.';
  if(S.month===today.slice(0,7)){const left=dim(+S.month.slice(0,4),+S.month.slice(5))-parseInt(today.slice(8),10);sub=mname(S.month)+' · '+left+' day'+(left===1?'':'s')+' left';}
  $('#budsub').textContent=sub;
  if(!rows){body.innerHTML='<div class="empty">No budgets yet. Set a limit for a category and this shows how much of it you have used. <button class="linkb" data-openbud="1">Set budgets</button></div>';return;}
  body.innerHTML=rows.map(r=>`<button class="bud-row" data-dd="bud" data-arg="${esc(r.k)}"><span class="bn">${esc(BL(r.k))}</span><span class="bbar" role="img" aria-label="${Math.round(r.pct*100)} percent of the budget used"><i class="${r.st}" style="width:${Math.min(100,r.pct*100)}%"></i></span><span class="bv"><b>${inr(r.spent)}</b> of ${inr(r.limit)}<small class="${r.spent>r.limit?'over':''}">${r.spent>r.limit?inr(r.spent-r.limit)+' over':inr(r.limit-r.spent)+' left'}</small></span></button>`).join('');
}
function initBudgets(){
  $('#b-open').addEventListener('click',openBud);
  $('#b-suggest').addEventListener('click',suggestBud);
  $('#b-cancel').addEventListener('click',()=>closeD($('#dlg-bud')));
  $('#b-save').addEventListener('click',saveBud);
  document.addEventListener('click',e=>{if(e.target.closest('[data-openbud]'))openBud();});
}
bootApp({page:'budgets',init:initBudgets,render:[renderBudgets]});
