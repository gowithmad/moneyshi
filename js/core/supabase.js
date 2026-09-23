/* MoneyShi · core/supabase.js — tiny Supabase client (sign-in + database) using fetch. No library needed. */
class SBError extends Error{constructor(m,status,data){super(m);this.status=status;this.data=data;}}
const SB={
  KEY:'moneyshi.sb',
  session:null,
  url(){return CFG.supabase.url.replace(/\/+$/,'');},
  load(){
    if(this.session)return this.session;
    try{const s=sessionStorage.getItem(this.KEY)||localStorage.getItem(this.KEY);this.session=s?JSON.parse(s):null;}catch(e){this.session=null;}
    return this.session;
  },
  save(s,remember){
    this.session=s;
    try{
      const j=JSON.stringify(s);
      if(remember===undefined)remember=!!localStorage.getItem(this.KEY);
      if(remember){localStorage.setItem(this.KEY,j);sessionStorage.removeItem(this.KEY);}
      else{sessionStorage.setItem(this.KEY,j);localStorage.removeItem(this.KEY);}
    }catch(e){}
  },
  clear(){this.session=null;try{sessionStorage.removeItem(this.KEY);localStorage.removeItem(this.KEY);}catch(e){}},
  fromResponse(r){return{access_token:r.access_token,refresh_token:r.refresh_token,expires_at:r.expires_at||Math.floor(Date.now()/1000)+(r.expires_in||3600),user:r.user};},
  async req(path,o){
    o=o||{};const s=this.load();
    const headers=Object.assign({apikey:CFG.supabase.anonKey,'Content-Type':'application/json',Authorization:'Bearer '+((o.auth!==false&&s)?s.access_token:CFG.supabase.anonKey)},o.headers||{});
    let res;
    try{res=await fetch(this.url()+path,{method:o.method||'GET',headers,body:o.body===undefined?undefined:JSON.stringify(o.body)});}
    catch(e){throw new SBError('Cannot reach the online database. Check your internet connection.',0);}
    if(res.status===401&&o.auth!==false&&s&&!o.retried&&!(o.headers&&o.headers.Authorization)&&await this.refresh())return this.req(path,Object.assign({},o,{retried:true}));
    const text=await res.text();let data=null;
    try{data=text?JSON.parse(text):null;}catch(e){data=text;}
    if(!res.ok)throw new SBError((data&&(data.error_description||data.msg||data.message||data.error))||('Request failed ('+res.status+')'),res.status,data);
    return data;
  },
  async refresh(){
    const s=this.load();if(!s||!s.refresh_token)return false;
    try{const r=await this.req('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:s.refresh_token},auth:false});this.save(this.fromResponse(r));return true;}
    catch(e){this.clear();return false;}
  },
  /* sign-in service */
  signUp(email,password,data,redirectTo){return this.req('/auth/v1/signup'+(redirectTo?'?redirect_to='+encodeURIComponent(redirectTo):''),{method:'POST',auth:false,body:{email,password,data}});},
  async signIn(email,password){return this.fromResponse(await this.req('/auth/v1/token?grant_type=password',{method:'POST',auth:false,body:{email,password}}));},
  async signOut(){try{await this.req('/auth/v1/logout',{method:'POST'});}catch(e){}this.clear();},
  recover(email,redirectTo){return this.req('/auth/v1/recover'+(redirectTo?'?redirect_to='+encodeURIComponent(redirectTo):''),{method:'POST',auth:false,body:{email}});},
  updateUser(patch,token){return this.req('/auth/v1/user',{method:'PUT',body:patch,headers:token?{Authorization:'Bearer '+token}:{}});},
  /* database (PostgREST) */
  select(table,qs){return this.req('/rest/v1/'+table+(qs?'?'+qs:''));},
  insert(table,rows,ret){return this.req('/rest/v1/'+table,{method:'POST',body:rows,headers:{Prefer:ret?'return=representation':'return=minimal'}});},
  update(table,qs,patch){return this.req('/rest/v1/'+table+'?'+qs,{method:'PATCH',body:patch,headers:{Prefer:'return=minimal'}});},
  remove(table,qs){return this.req('/rest/v1/'+table+'?'+qs,{method:'DELETE',headers:{Prefer:'return=minimal'}});},
  upsert(table,row,conflict){return this.req('/rest/v1/'+table+'?on_conflict='+conflict,{method:'POST',body:row,headers:{Prefer:'resolution=merge-duplicates,return=minimal'}});},
  rpc(fn,args){return this.req('/rest/v1/rpc/'+fn,{method:'POST',body:args||{}});}
};
