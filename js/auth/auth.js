/* MoneyShi · auth/auth.js — one "Auth" object for every page. It uses cloud-auth.js or local-auth.js depending on config/app.config.js. */
const Auth={
  impl(){return CLOUD()?CloudAuth:LocalAuth;},
  label(){return CLOUD()?'Email':'Username';},
  restore(){return this.impl().restore();},
  register(f){return this.impl().register(f);},
  login(f){return this.impl().login(f);},
  logout(){return this.impl().logout();},
  changePassword(a,b){return this.impl().changePassword(a,b);},
  setDisplay(n){return this.impl().setDisplay(n);},
  deleteAccount(){return this.impl().deleteAccount();},
  listUsers(){return this.impl().listUsers();},
  setRole(id,r){return this.impl().setRole(id,r);}
};
function showFatal(e){
  document.body.innerHTML='<div class="fatal"><h2>Something went wrong</h2><p>'+esc(e&&e.message?e.message:String(e))+'</p><button class="primary" onclick="location.reload()">Try again</button> <a class="btn" href="login.html">Back to sign in</a></div>';
}
/* every private page starts with this: returns the signed-in user, or sends the visitor to the login page */
async function requireUser(o){
  o=o||{};DB.use();
  let u=null;
  try{u=await Auth.restore();}catch(e){showFatal(e);return null;}
  if(!u){location.replace((o.base||'')+'login.html?next='+encodeURIComponent(pageFile()));return null;}
  CUR=u;return u;
}
