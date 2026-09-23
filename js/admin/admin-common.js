/* MoneyShi · admin/admin-common.js — every admin page starts here: only administrators get in. */
const ADMIN_NAV=[['index.html','Overview'],['site.html','Site settings'],['files.html','Pages & files'],['users.html','Users']];
async function adminBoot(page,init){
  try{
    const user=await requireUser({base:'../'});if(!user)return;
    applyTheme();
    if(user.role!=='admin'){
      document.body.innerHTML='<div class="fatal"><h2>Administrators only</h2><p>Your account ('+esc(user.display)+') is not an administrator. In local mode the first account created on a device is the administrator. In online mode, an administrator sets the role in the database (see docs/SETUP.md).</p><a class="btn" href="../dashboard.html">Back to the app</a></div>';
      return;
    }
    const nav=ADMIN_NAV.map(n=>'<a href="'+n[0]+'"'+(n[0]===page?' aria-current="page"':'')+'>'+n[1]+'</a>').join('');
    document.body.insertAdjacentHTML('afterbegin','<header class="app adm-head"><div class="app-in"><b>'+esc(CFG.name)+' admin</b><nav>'+nav+'</nav><a class="back" href="../dashboard.html">← Back to the app</a></div></header>');
    if(init)await init(user);
    document.body.classList.add('ready');
  }catch(e){showFatal(e);}
}
const confirmTwice=(btn,label,fn)=>btn.addEventListener('click',async()=>{
  if(btn.dataset.arm!=='1'){btn.dataset.arm='1';const o=btn.textContent;btn.textContent=label;setTimeout(()=>{btn.dataset.arm='';btn.textContent=o;},4000);return;}
  btn.dataset.arm='';await fn();
});
