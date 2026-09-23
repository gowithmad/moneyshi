/* MoneyShi · pages/reset-password.js — opened from the link in the reset e-mail (online mode) */
(function(){
  brandFill();
  const m=$('#reset-msg');
  if(!CLOUD()){m.hidden=false;m.textContent='Reset links are used with the online database. On this device, use “Forgot your password?” on the sign-in page and your recovery code.';return;}
  const h=new URLSearchParams(location.hash.replace(/^#/,''));
  const token=h.get('access_token');
  if(!token||h.get('type')!=='recovery'){m.hidden=false;m.textContent=h.get('error_description')?h.get('error_description').replace(/\+/g,' '):'This reset link is missing or has expired. Ask for a new one from the “Forgot your password?” page.';return;}
  $('#reset-form').hidden=false;
  $('#reset-form').addEventListener('submit',async e=>{
    e.preventDefault();setErr('n-err','');
    const pw=$('#n-pw').value;if(pw!==$('#n-pw2').value)return setErr('n-err','The two passwords do not match.');
    const btn=$('#reset-form button[type=submit]');busy(btn,true,'Saving…');
    try{await CloudAuth.resetWithToken(token,pw);history.replaceState(null,'',location.pathname);$('#reset-form').hidden=true;m.hidden=false;m.innerHTML='Your password has been changed. <a href="login.html">Sign in with the new password</a>.';}
    catch(x){setErr('n-err',x.message);busy(btn,false);}
  });
})();
