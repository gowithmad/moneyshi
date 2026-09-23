/* MoneyShi · pages/login.js */
(async function(){
  brandFill();
  $('#l-label').textContent=Auth.label();
  const inp=$('#l-id');
  if(CLOUD()){inp.type='email';inp.autocomplete='email';}
  $('#mode-note').textContent=CLOUD()?'':'Accounts on this device only. Your data is not synced online.';
  try{const u=await Auth.restore();if(u){location.replace(safeNext());return;}}catch(e){}
  $('#login-form').addEventListener('submit',async e=>{
    e.preventDefault();setErr('l-err','');
    const id=inp.value.trim(),pw=$('#l-pw').value;
    if(!id||!pw)return setErr('l-err','Enter your '+Auth.label().toLowerCase()+' and password.');
    const btn=$('#login-form button[type=submit]');busy(btn,true,'Signing in…');
    try{await Auth.login({email:id,username:id,password:pw,remember:$('#l-remember').checked});location.replace(safeNext());}
    catch(x){setErr('l-err',x.message);busy(btn,false);}
  });
})();
