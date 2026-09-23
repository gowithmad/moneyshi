/* MoneyShi · pages/account.js — profile, password, recovery code, sign out, delete account */
function renderAccountPage(){
  $('#ac-h').textContent=CUR.display;
  $('#ac-u').textContent=(CLOUD()?CUR.email:'@'+CUR.username)+' · '+(CUR.role==='admin'?'administrator':'member');
  $('#ac-disp').value=CUR.display;
  $('#recovery-sec').hidden=CLOUD();
}
const msg=(id,text,ok)=>{const e=$('#'+id);e.className='err'+(ok?' info':'');e.textContent=text;};
function initAccount(){
  $('#ac-save').addEventListener('click',async()=>{
    const v=$('#ac-disp').value.trim().replace(/\s+/g,' ');
    if(!v)return msg('ac-err','Enter a display name.');
    try{await Auth.setDisplay(v);CUR.display=v;renderAccountPage();msg('ac-err','Saved.',true);}catch(e){msg('ac-err',e.message);}
  });
  $('#ac-pw').addEventListener('click',async()=>{
    const cur=$('#ac-cur').value,n1=$('#ac-new').value,n2=$('#ac-new2').value;
    if(!cur||!n1)return msg('ac-perr','Fill in your current and new password.');
    if(n1!==n2)return msg('ac-perr','The two new passwords do not match.');
    const b=$('#ac-pw');b.disabled=true;
    try{await Auth.changePassword(cur,n1);['ac-cur','ac-new','ac-new2'].forEach(id=>{$('#'+id).value='';});msg('ac-perr','Password changed.',true);}
    catch(e){msg('ac-perr',e.message);}
    b.disabled=false;
  });
  $('#rc-new').addEventListener('click',async()=>{
    const pw=$('#rc-pw').value;if(!pw)return msg('rc-err','Enter your password to make a new code.');
    try{const c=await LocalAuth.newRecoveryCode(pw);$('#rc-code').textContent=c;$('#rc-box').hidden=false;$('#rc-pw').value='';msg('rc-err','Your old code no longer works. Keep this one somewhere safe.',true);}
    catch(e){msg('rc-err',e.message);}
  });
  $('#ac-out').addEventListener('click',async()=>{flushAuto();await Auth.logout();location.href='login.html';});
  $('#ac-del').addEventListener('click',async e=>{
    const b=e.currentTarget;
    if(b.dataset.arm!=='1'){b.dataset.arm='1';b.textContent='Tap again to delete this account and all its data';setTimeout(()=>{b.dataset.arm='';b.textContent='Delete this account';},4500);return;}
    try{clearTimeout(autoT);await Auth.deleteAccount();location.href='login.html';}catch(x){msg('ac-derr',x.message);}
  });
}
bootApp({page:'account',month:false,add:false,init:initAccount,render:[renderAccountPage]});
