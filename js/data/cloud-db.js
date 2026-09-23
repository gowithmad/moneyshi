/* MoneyShi · data/cloud-db.js — online database (Supabase). Same methods as local-db.js, so pages never care which one is active. */
const toRow=r=>({d:r.d,t:r.t||'',a:r.a,dir:r.dir,amt:r.amt,n:r.n,c:r.c,i:!!r.i,note:r.note||'',u:r.u||''});
const fromRow=r=>({id:r.id,d:r.d,t:r.t||'',a:r.a,dir:r.dir,amt:Number(r.amt),n:r.n,c:r.c,i:r.i?1:0,note:r.note||'',u:r.u||''});
const CloudDB={
  mode:'idb',uid:null,meta:{},
  async open(user){
    this.uid=user.id;this.meta={};
    const rows=await SB.select('user_meta','select=k,v');
    rows.forEach(r=>{this.meta[r.k]=r.v;});
  },
  close(){this.uid=null;this.meta={};},
  async all(){
    const out=[];
    for(let off=0;;off+=1000){
      const rows=await SB.select('entries','select=id,d,t,a,dir,amt,n,c,i,note,u&order=id.asc&limit=1000&offset='+off);
      out.push(...rows.map(fromRow));
      if(rows.length<1000)break;
    }
    return out;
  },
  async add(r){const rows=await SB.insert('entries',toRow(r),true);r.id=rows[0].id;return r.id;},
  async put(r){await SB.update('entries','id=eq.'+r.id,toRow(r));},
  async del(id){await SB.remove('entries','id=eq.'+id);},
  async putMany(list){
    for(let i=0;i<list.length;i+=8)await Promise.all(list.slice(i,i+8).map(r=>this.put(r)));
  },
  async bulkAdd(list){
    for(let i=0;i<list.length;i+=500){
      const chunk=list.slice(i,i+500);
      const rows=await SB.insert('entries',chunk.map(toRow),true);
      rows.forEach((row,j)=>{chunk[j].id=row.id;});
    }
  },
  async clear(){await SB.remove('entries','user_id=eq.'+this.uid);},
  async getMeta(k,def){return k in this.meta?this.meta[k]:def;},
  async setMeta(k,v){this.meta[k]=v;await SB.upsert('user_meta',{k,v},'user_id,k');}
};
