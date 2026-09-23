/* MoneyShi · auth/local-auth.js — accounts kept on this device only. Passwords are hashed (PBKDF2-SHA256 + random salt).
   Forgot password works with a one-time recovery code shown when the account is created. */
const REG={
  mode:'idb',db:null,mem:{users:[]},
  open(){
    if(this.db||this.mode==='mem')return Promise.resolve();
    return new Promise(res=>{
      if(!window.indexedDB){this.mode='mem';return res();}
      let r;try{r=indexedDB.open('moneyshi-users',1);}catch(e){this.mode='mem';return res();}
      r.onupgradeneeded=()=>{r.result.createObjectStore('users',{keyPath:'id'});};
      r.onsuccess=()=>{this.db=r.result;res();};
      r.onerror=r.onblocked=()=>{this.mode='mem';res();};
    });
  },
  run(mode,fn){return new Promise((res,rej)=>{const t=this.db.transaction('users',mode);const rq=fn(t.objectStore('users'));t.oncomplete=()=>res(rq&&rq.result);t.onerror=t.onabort=()=>rej(t.error);});},
  async users(){await this.open();return this.mode==='mem'?this.mem.users.slice():this.run('readonly',o=>o.getAll());},
  async get(id){await this.open();return this.mode==='mem'?(this.mem.users.find(u=>u.id===id)||null):(await this.run('readonly',o=>o.get(id)))||null;},
  async put(u){await this.open();if(this.mode==='mem'){const i=this.mem.users.findIndex(x=>x.id===u.id);if(i>=0)this.mem.users[i]=u;else this.mem.users.push(u);return;}await this.run('readwrite',o=>o.put(u));},
  async del(id){await this.open();if(this.mode==='mem'){this.mem.users=this.mem.users.filter(x=>x.id!==id);return;}await this.run('readwrite',o=>o.delete(id));}
};
const RC_ALPHABET='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const makeRecoveryCode=()=>{const b=rnd(12);let s='';for(let i=0;i<12;i++)s+=RC_ALPHABET[b[i]%RC_ALPHABET.length];return s.slice(0,4)+'-'+s.slice(4,8)+'-'+s.slice(8);};
const normCode=c=>String(c||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const lockState=()=>{try{return JSON.parse(localStorage.getItem('moneyshi.lock')||'{}');}catch(e){return{};}};
const setLock=o=>{try{localStorage.setItem('moneyshi.lock',JSON.stringify(o));}catch(e){}};
const ddl=name=>new Promise(res=>{try{const r=indexedDB.deleteDatabase(name);r.onsuccess=r.onerror=r.onblocked=()=>res();}catch(e){res();}});
function lockCheck(){const lk=lockState();if(lk.until&&lk.until>Date.now())throw new Error('Too many attempts. Try again in '+Math.ceil((lk.until-Date.now())/1000)+' seconds.');return lk;}
function lockFail(lk,msg){const fails=(lk.fails||0)+1;if(fails>=5){setLock({fails:0,until:Date.now()+30000});throw new Error('Too many attempts. Try again in 30 seconds.');}setLock({fails});throw new Error(msg);}
const LocalAuth={
  label:'Username',
  toUser(u){return{id:u.id,username:u.username,display:u.display,role:u.role||'user',db:u.db,hasRecovery:!!u.rhash};},
  sid(){try{return sessionStorage.getItem('moneyshi.uid')||localStorage.getItem('moneyshi.uid');}catch(e){return null;}},
  setSession(u,remember){try{sessionStorage.setItem('moneyshi.uid',u.id);if(remember)localStorage.setItem('moneyshi.uid',u.id);else localStorage.removeItem('moneyshi.uid');}catch(e){}},
  async restore(){const id=this.sid();if(!id)return null;const u=await REG.get(id);if(!u){await this.logout();return null;}return this.toUser(u);},
  async register(f){
    const username=(f.username||'').trim();
    if(!/^[A-Za-z0-9._-]{3,24}$/.test(username))throw new Error('Choose a username of 3 to 24 letters, numbers, dots, dashes or underscores.');
    if((f.password||'').length<6)throw new Error('The password needs at least 6 characters.');
    const users=await REG.users();
    if(users.some(u=>u.key===username.toLowerCase()))throw new Error('That username is already taken on this device.');
    const id='u'+Date.now().toString(36)+toHex(rnd(3)),salt=toHex(rnd(16)),rsalt=toHex(rnd(16)),code=makeRecoveryCode();
    const u={id,username,key:username.toLowerCase(),display:(f.display||'').trim().replace(/\s+/g,' ')||username,salt,hash:await makeHash(f.password,salt),iter:ITER,rsalt,rhash:await makeHash(normCode(code),rsalt),db:'moneyshi-u-'+id,role:users.length?'user':'admin',created:Date.now()};
    await REG.put(u);
    LocalDB.close();await LocalDB.open(u.db);await LocalDB.setMeta('seeded',true);await LocalDB.setMeta('accounts',DEFAULT_ACCS());LocalDB.close();
    this.setSession(u,false);
    return{user:this.toUser(u),recoveryCode:code};
  },
  async login(f){
    const lk=lockCheck();
    const key=(f.username||'').trim().toLowerCase();
    const u=(await REG.users()).find(x=>x.key===key);
    const h=await makeHash(f.password||'',u?u.salt:toHex(rnd(16)));
    if(u&&h===u.hash){setLock({});this.setSession(u,!!f.remember);return this.toUser(u);}
    lockFail(lk,'Wrong username or password.');
  },
  async logout(){try{sessionStorage.removeItem('moneyshi.uid');localStorage.removeItem('moneyshi.uid');}catch(e){}},
  async me(){return REG.get(this.sid());},
  async changePassword(cur,nw){
    if(nw.length<6)throw new Error('The new password needs at least 6 characters.');
    const u=await this.me();
    if(await makeHash(cur,u.salt)!==u.hash)throw new Error('Your current password is not right.');
    u.salt=toHex(rnd(16));u.hash=await makeHash(nw,u.salt);await REG.put(u);
  },
  async setDisplay(name){const u=await this.me();u.display=name;await REG.put(u);},
  async forgot(){throw new Error('Use your recovery code to reset the password on this device.');},
  async resetWithRecovery(username,code,nw){
    const lk=lockCheck();
    if(nw.length<6)throw new Error('The new password needs at least 6 characters.');
    const u=(await REG.users()).find(x=>x.key===(username||'').trim().toLowerCase());
    const ok=u&&u.rhash&&(await makeHash(normCode(code),u.rsalt))===u.rhash;
    if(!ok)lockFail(lk,'That username and recovery code do not match.');
    setLock({});
    u.salt=toHex(rnd(16));u.hash=await makeHash(nw,u.salt);
    const fresh=makeRecoveryCode();u.rsalt=toHex(rnd(16));u.rhash=await makeHash(normCode(fresh),u.rsalt);
    await REG.put(u);
    return fresh;
  },
  async newRecoveryCode(pw){
    const u=await this.me();
    if(await makeHash(pw,u.salt)!==u.hash)throw new Error('Your password is not right.');
    const code=makeRecoveryCode();u.rsalt=toHex(rnd(16));u.rhash=await makeHash(normCode(code),u.rsalt);await REG.put(u);
    return code;
  },
  async deleteAccount(){const u=await this.me();LocalDB.close();await ddl(u.db);await REG.del(u.id);await this.logout();},
  async listUsers(){return(await REG.users()).map(u=>({id:u.id,username:u.username,display:u.display,role:u.role||'user',created_at:new Date(u.created).toISOString(),entries:'–',email:'(this device)'}));},
  async setRole(id,role){const u=await REG.get(id);u.role=role;await REG.put(u);}
};
