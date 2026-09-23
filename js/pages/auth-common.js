/* MoneyShi · pages/auth-common.js — small helpers shared by the sign-in, register and password pages */
function brandFill(){
  const b=$('#brand');
  if(b)b.innerHTML='<div class="auth-brand">'+BRAND_MARK+'<div><b>'+esc(CFG.name)+'</b><span>'+esc(CFG.tagline)+'</span></div></div>';
  applyTheme();
}
function safeNext(){const n=qsParam('next');return n&&/^[A-Za-z0-9_-]+\.html$/.test(n)?n:'dashboard.html';}
function setErr(id,msg,info){const e=$('#'+id);e.className='err'+(info?' info':'');e.textContent=msg||'';}
function busy(btn,on,label){btn.disabled=on;if(label!==undefined)btn.dataset.label=btn.dataset.label||btn.textContent;btn.textContent=on?label:(btn.dataset.label||btn.textContent);}
document.addEventListener('click',e=>{
  const t=e.target.closest('.pw-t');if(!t)return;
  const inp=$('#'+t.dataset.pw);const show=inp.type==='password';inp.type=show?'text':'password';t.textContent=show?'Hide':'Show';
});
