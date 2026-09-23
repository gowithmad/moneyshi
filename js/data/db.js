/* MoneyShi · data/db.js — the one "DB" object the app talks to. It forwards to the local or the online database. */
const DB={
  impl:null,onWrite:null,
  use(){this.impl=CLOUD()?CloudDB:LocalDB;return this;},
  get mode(){return this.impl?this.impl.mode:'idb';},
  open(x){return this.impl.open(x);},
  close(){if(this.impl)this.impl.close();}
};
['all','add','put','del','putMany','bulkAdd','clear','getMeta','setMeta'].forEach(m=>{
  DB[m]=async function(){
    const r=await DB.impl[m].apply(DB.impl,arguments);
    if(/^(add|put|del|putMany|bulkAdd|clear|setMeta)$/.test(m)&&DB.onWrite)DB.onWrite();
    return r;
  };
});
