/* MoneyShi · data/local-db.js — browser database (IndexedDB), one database per account */
const LocalDB={mode:'idb',db:null,mem:{tx:[],meta:{}},seq:1,
 open(name){this.mode='idb';this.mem={tx:[],meta:{}};this.seq=1;return new Promise(res=>{
   if(!window.indexedDB){this.mode='mem';return res();}
   let r;try{r=indexedDB.open(name||'money-tracker',1);}catch(e){this.mode='mem';return res();}
   r.onupgradeneeded=()=>{const d=r.result;d.createObjectStore('tx',{keyPath:'id',autoIncrement:true});d.createObjectStore('meta',{keyPath:'k'});};
   r.onsuccess=()=>{this.db=r.result;res();};
   r.onerror=r.onblocked=()=>{this.mode='mem';res();};
 });},
 run(store,mode,fn){return new Promise((res,rej)=>{
   const t=this.db.transaction(store,mode);const rq=fn(t.objectStore(store));
   t.oncomplete=()=>res(rq&&rq.result);t.onerror=t.onabort=()=>rej(t.error);
 });},
 all(){return this.mode==='mem'?Promise.resolve(this.mem.tx.slice()):this.run('tx','readonly',o=>o.getAll());},
 async add(r){if(this.mode==='mem'){r.id=this.seq++;this.mem.tx.push(r);return r.id;}r.id=await this.run('tx','readwrite',o=>o.add(r));return r.id;},
 async put(r){if(this.mode==='mem'){const i=this.mem.tx.findIndex(x=>x.id===r.id);if(i>=0)this.mem.tx[i]=r;return;}await this.run('tx','readwrite',o=>o.put(r));},
 async del(id){if(this.mode==='mem'){this.mem.tx=this.mem.tx.filter(x=>x.id!==id);return;}await this.run('tx','readwrite',o=>o.delete(id));},
 putMany(list){if(!list.length)return Promise.resolve();if(this.mode==='mem'){list.forEach(r=>this.put(r));return Promise.resolve();}
   return new Promise((res,rej)=>{const t=this.db.transaction('tx','readwrite');const o=t.objectStore('tx');list.forEach(r=>o.put(r));t.oncomplete=()=>res();t.onerror=t.onabort=()=>rej(t.error);});},
 bulkAdd(list){if(!list.length)return Promise.resolve();if(this.mode==='mem'){list.forEach(r=>{r.id=this.seq++;this.mem.tx.push(r);});return Promise.resolve();}
   return new Promise((res,rej)=>{const t=this.db.transaction('tx','readwrite');const o=t.objectStore('tx');
     list.forEach(r=>{const rq=o.add(r);rq.onsuccess=()=>{r.id=rq.result;};});t.oncomplete=()=>res();t.onerror=t.onabort=()=>rej(t.error);});},
 async clear(){if(this.mode==='mem'){this.mem.tx=[];return;}await this.run('tx','readwrite',o=>o.clear());},
 async getMeta(k,def){if(this.mode==='mem'){return k in this.mem.meta?this.mem.meta[k]:def;}const v=await this.run('meta','readonly',o=>o.get(k));return v?v.v:def;},
 async setMeta(k,v){if(this.mode==='mem'){this.mem.meta[k]=v;return;}await this.run('meta','readwrite',o=>o.put({k,v}));}
};

LocalDB.close=function(){if(this.db){try{this.db.close();}catch(e){}this.db=null;}};
