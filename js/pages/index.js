/* MoneyShi · pages/index.js — start page: sends you to the app if you are signed in, otherwise to the login page */
(async function(){
  brandFill();DB_USE();
  function DB_USE(){}
  try{const u=await Auth.restore();location.replace(u?'dashboard.html':'login.html');}
  catch(e){$('#idx-msg').textContent=e.message;setTimeout(()=>location.replace('login.html'),1500);}
})();
