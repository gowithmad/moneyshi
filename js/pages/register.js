/* MoneyShi · pages/register.js */
(function(){
  brandFill();
  $('#r-label').textContent=Auth.label();
  const idIn=$('#r-id');if(CLOUD()){idIn.type='email';idIn.autocomplete='email';}
  $('#reg-form').addEventListener('submit',async e=>{
    e.preventDefault();setErr('r-err','');
    const id=idIn.value.trim(),pw=$('#r-pw').value,pw2=$('#r-pw2').value;
    if(!id)return setErr('r-err','Enter your '+Auth.label().toLowerCase()+'.');
    if(pw!==pw2)return setErr('r-err','The two passwords do not match.');
    const btn=$('#reg-form button[type=submit]');busy(btn,true,'Creating…');
    try{
      const res=await Auth.register({email:id,username:id,display:$('#r-name').value,password:pw});
      $('#reg-form').hidden=true;$('#reg-links').hidden=true;
      if(res.recoveryCode){
        $('#rc-code').textContent=res.recoveryCode;$('#recovery').hidden=false;
        $('#rc-copy').onclick=()=>{try{navigator.clipboard.writeText(res.recoveryCode);toast('Copied');}catch(x){toast('Select the code and copy it');}};
        $('#rc-dl').onclick=()=>download('moneyshi-recovery-code-'+id+'.txt','text/plain','MoneyShi recovery code for '+id+'\n\n'+res.recoveryCode+'\n\nKeep this somewhere safe. It resets your password on the device where you created the account.\n');
        $('#rc-ok').onchange=e=>{$('#rc-go').disabled=!e.target.checked;};
        $('#rc-go').onclick=()=>{location.href='dashboard.html';};
      }else if(res.confirm){
        const c=$('#confirm');c.hidden=false;c.textContent='Almost done. We sent a confirmation link to '+id+'. Open it, then come back and sign in.';$('#reg-links').hidden=false;
      }else location.href='dashboard.html';
    }catch(x){setErr('r-err',x.message);busy(btn,false);}
  });
})();
