/* MoneyShi · pages/forgot-password.js — e-mail link (online) or recovery code (this device) */
(function(){
  brandFill();
  const cloud=CLOUD();
  $('#cloud-form').hidden=!cloud;$('#local-form').hidden=cloud;
  $('#cloud-form').addEventListener('submit',async e=>{
    e.preventDefault();setErr('f-err','');
    const email=$('#f-email').value.trim();if(!/^\S+@\S+\.\S+$/.test(email))return setErr('f-err','Enter a valid email address.');
    const btn=$('#cloud-form button[type=submit]');busy(btn,true,'Sending…');
    try{await CloudAuth.forgot(email);}catch(x){if(x.status===0){setErr('f-err',x.message);busy(btn,false);return;}}
    $('#cloud-form').hidden=true;const d=$('#done');d.hidden=false;d.textContent='If an account exists for '+email+', a reset link is on its way. It can take a few minutes. Check your spam folder too.';
  });
  $('#local-form').addEventListener('submit',async e=>{
    e.preventDefault();setErr('p-err','');
    const pw=$('#p-pw').value;if(pw!==$('#p-pw2').value)return setErr('p-err','The two passwords do not match.');
    const btn=$('#local-form button[type=submit]');busy(btn,true,'Checking…');
    try{
      const fresh=await LocalAuth.resetWithRecovery($('#p-user').value,$('#p-code').value,pw);
      $('#local-form').hidden=true;const d=$('#done');d.hidden=false;
      d.innerHTML='Your password has been changed. Your old recovery code no longer works. Here is your new one. Save it now:<div class="code-box">'+esc(fresh)+'</div>';
    }catch(x){setErr('p-err',x.message);busy(btn,false);}
  });
})();
