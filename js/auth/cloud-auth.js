/* MoneyShi · auth/cloud-auth.js — accounts in the online database. Passwords are hashed by the server (bcrypt);
   "forgot password" e-mails a reset link. */
const CloudAuth={
  label:'Email',
  async toUser(s){
    const u=s.user;let p=null;
    try{p=(await SB.select('profiles','select=*&id=eq.'+u.id))[0]||null;}catch(e){}
    const meta=u.user_metadata||{};
    return{id:u.id,email:u.email,username:(p&&p.username)||meta.username||(u.email||'').split('@')[0],display:(p&&p.display)||meta.display||(u.email||'').split('@')[0],role:(p&&p.role)||'user'};
  },
  async restore(){
    let s=SB.load();if(!s)return null;
    if(s.expires_at<Date.now()/1000+30&&!await SB.refresh())return null;
    try{const u=await SB.req('/auth/v1/user');s=SB.load();s.user=u;SB.save(s);return await this.toUser(s);}
    catch(e){if(e.status===0)throw e;SB.clear();return null;}
  },
  async register(f){
    if(!/^\S+@\S+\.\S+$/.test(f.email||''))throw new Error('Enter a valid email address.');
    if((f.password||'').length<6)throw new Error('The password needs at least 6 characters.');
    const r=await SB.signUp(f.email.trim(),f.password,{display:(f.display||'').trim(),username:(f.email.split('@')[0])},SITE_ROOT+'login.html');
    if(r&&r.access_token){SB.save(SB.fromResponse(r),false);return{user:await this.toUser(SB.load())};}
    return{confirm:true};
  },
  async login(f){const s=await SB.signIn((f.email||'').trim(),f.password||'');SB.save(s,!!f.remember);return this.toUser(s);},
  async logout(){await SB.signOut();},
  async changePassword(cur,nw){
    if(nw.length<6)throw new Error('The new password needs at least 6 characters.');
    const s=SB.load();
    try{SB.save(await SB.signIn(s.user.email,cur));}catch(e){throw new Error('Your current password is not right.');}
    await SB.updateUser({password:nw});
  },
  async setDisplay(name){const s=SB.load();await SB.update('profiles','id=eq.'+s.user.id,{display:name});},
  async forgot(email){await SB.recover((email||'').trim(),SITE_ROOT+'reset-password.html');},
  async resetWithToken(token,pw){
    if(pw.length<6)throw new Error('The new password needs at least 6 characters.');
    await SB.updateUser({password:pw},token);
  },
  async deleteAccount(){await SB.rpc('delete_my_account');SB.clear();},
  async listUsers(){
    const rows=await SB.select('profiles','select=id,email,username,display,role,created_at&order=created_at.asc');
    const stats={};try{(await SB.rpc('admin_user_stats')).forEach(x=>{stats[x.id]=x;});}catch(e){}
    return rows.map(r=>Object.assign(r,{entries:(stats[r.id]||{}).entries||0}));
  },
  async setRole(id,role){await SB.update('profiles','id=eq.'+id,{role});}
};
