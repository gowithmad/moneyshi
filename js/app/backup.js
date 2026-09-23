/* MoneyShi · app/backup.js — export, import and the automatic backup on Android */
const bname=k=>{const u=CUR?CUR.username:'user';return k==='auto'?'moneyshi-auto-backup-'+u+'.json':'moneyshi-backup-'+u+'-'+todayISO()+'.json';};
async function markExported(){LASTX=todayISO();await DB.setMeta('lastExport',LASTX);renderSaveNote();}
function backupText(){
  const rows=TX.map(t=>({d:t.d,t:t.t||'',a:t.a,dir:t.dir,amt:t.amt,n:t.n,c:t.c,i:t.i?1:0,note:t.note||'',u:t.u||''}));
  return JSON.stringify({app:'moneyshi',version:1,exported:new Date().toISOString(),tx:rows,cats:CUSTOM,rules:RULES,accounts:ACCS,budgets:BUDGETS},null,1);
}
function exportJSON(){
  const name=bname('backup');
  if(download(name,'application/json',backupText())){markExported();if(APP())toast('Backup saved to your Downloads folder');}
}
function shareBackup(){
  if(!APP())return;
  const name=bname('backup');
  try{const u=window.AndroidBridge.saveFile(name,'application/json',backupText(),false);if(u){window.AndroidBridge.share(u,'application/json');markExported();}else toast('Could not create the backup file');}
  catch(e){toast('Could not share the backup');}
}
let AUTO=true,AUTOAT='',autoT=null;
const autoNoteText=()=>AUTO?('Kept as Downloads/'+bname('auto')+(AUTOAT?', last saved at '+AUTOAT:'')+'.'):'Automatic backup is off.';
function scheduleAuto(delay){
  if(!APP()||!CUR)return;
  if(!AUTO){clearTimeout(autoT);return;}
  clearTimeout(autoT);
  autoT=setTimeout(function(){
    if(!AUTO||!CUR)return;
    try{
      const u=window.AndroidBridge.saveFile(bname('auto'),'application/json',backupText(),true);
      if(u){const d=new Date();AUTOAT=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');const n=document.getElementById('auto-note');if(n)n.textContent=autoNoteText();}
    }catch(e){}
  },delay==null?4000:delay);
}
DB.onWrite=function(){scheduleAuto();};
const csvq=v=>{v=String(v==null?'':v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;};
function exportCSV(){
  const head='date,time,account,type,amount,name,category,note,between_accounts,ref';
  const rows=TX.slice().sort((a,b)=>(a.d+(a.t||'')).localeCompare(b.d+(b.t||''))).map(t=>[t.d,t.t||'',accLabel(t.a),t.dir,t.amt,t.n,t.c,t.note||'',t.i?'yes':'',t.u||''].map(csvq).join(','));
  if(download('moneyshi-'+(CUR?CUR.username:'user')+'-'+todayISO()+'.csv','text/csv',[head,...rows].join('\n'))){markExported();if(APP())toast('CSV saved to your Downloads folder');}
}
function parseCSV(text){
  const rows=[];let row=[],f='',q=false;text=text.replace(/^\uFEFF/,'');
  for(let i=0;i<text.length;i++){const c=text[i];
    if(q){if(c==='"'){if(text[i+1]==='"'){f+='"';i++;}else q=false;}else f+=c;}
    else if(c==='"')q=true;else if(c===','){row.push(f);f='';}else if(c==='\n'){row.push(f);rows.push(row);row=[];f='';}else if(c!=='\r')f+=c;}
  if(f!==''||row.length){row.push(f);rows.push(row);}
  return rows.filter(r=>r.some(x=>x.trim()!==''));
}
function parseDate(s){
  s=String(s||'').trim();let m;
  if(m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))return `${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`;
  if(m=s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/)){let y=m[3];if(y.length===2)y='20'+y;return `${y}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;}
  return '';
}
const num=v=>{const x=parseFloat(String(v==null?'':v).replace(/[₹,\s]/g,'').replace(/^\((.*)\)$/,'-$1'));return isNaN(x)?NaN:x;};
const nk=s=>String(s).toLowerCase().replace(/[^a-z0-9]/g,'');
function csvToRecords(rows){
  const h=rows[0].map(nk);const ix=names=>h.findIndex(x=>names.includes(x));
  const I={d:ix(['date','txndate','transactiondate','valuedate']),n:ix(['name','payee','description','narration','particulars','details']),amt:ix(['amount','amt']),
    dr:ix(['debit','withdrawal','withdrawalamt','dr']),cr:ix(['credit','deposit','depositamt','cr']),dir:ix(['type','direction','drcr','inout']),c:ix(['category']),
    a:ix(['account','acct','bank']),note:ix(['note','notes','remarks']),t:ix(['time']),i:ix(['betweenaccounts','internal']),u:ix(['ref','utr','reference'])};
  if(I.d<0||I.n<0||(I.amt<0&&I.dr<0&&I.cr<0))throw new Error('The CSV needs at least date, name and amount columns.');
  const out=[];let bad=0;
  for(const r of rows.slice(1)){
    const d=parseDate(r[I.d]);const n=String(r[I.n]||'').trim();let amt=NaN,dir='';
    if(I.dr>=0||I.cr>=0){const dv=I.dr>=0?num(r[I.dr]):NaN,cv=I.cr>=0?num(r[I.cr]):NaN;if(dv>0){amt=dv;dir='out';}else if(cv>0){amt=cv;dir='in';}}
    if(!dir&&I.amt>=0){amt=num(r[I.amt]);
      const dv=I.dir>=0?nk(r[I.dir]):'';
      if(/^(in|credit|cr|receipt|received|income|deposit)$/.test(dv)){dir='in';amt=Math.abs(amt);}
      else if(/^(out|debit|dr|expense|paid|payment|withdrawal)$/.test(dv)){dir='out';amt=Math.abs(amt);}
      else if(amt<0){dir='out';amt=-amt;}else dir='in';}
    if(!d||!n||!(amt>0)||!dir){bad++;continue;}
    const acc=I.a>=0?String(r[I.a]||'').trim():'';
    out.push({d,t:I.t>=0?String(r[I.t]||'').trim():'',a:acc||'',dir,amt:Math.round(amt*100)/100,n,c:I.c>=0?String(r[I.c]||'').trim():'',i:I.i>=0&&/^(1|y|yes|true)$/i.test(String(r[I.i]||'').trim())?1:0,note:I.note>=0?String(r[I.note]||'').trim():'',u:I.u>=0?String(r[I.u]||'').trim():''});
  }
  return {recs:out,bad};
}
const keyOf=t=>t.u?'u|'+t.u+'|'+t.dir+'|'+t.a:['k',t.d,Number(t.amt).toFixed(2),String(t.n).toLowerCase(),t.a,t.dir].join('|');
async function importRecords(recs,extra){
  let metaChanged=false;
  if(extra){
    if(extra.cats)for(const dir of ['out','in'])for(const [k,g] of Object.entries(extra.cats[dir]||{}))if(!catMap(dir)[k]){CUSTOM[dir][k]=g;metaChanged=true;}
    if(extra.rules)for(const [k,v] of Object.entries(extra.rules))if(!RULES[k]){RULES[k]=v;metaChanged=true;}
    if(extra.budgets)for(const [k,v] of Object.entries(extra.budgets))if(!(k in BUDGETS)&&v>0){BUDGETS[k]=v;metaChanged=true;}
    if(extra.accounts)for(const a of extra.accounts)if(a&&a.k&&!ACCS.find(x=>x.k===a.k)){ACCS.push({k:a.k,l:a.l||a.k});metaChanged=true;}
  }
  const seen=new Set(TX.map(keyOf));const add=[];let skipped=0;
  for(const r of recs){
    let acc=r.a;
    if(acc){const f=ACCS.find(x=>x.k.toLowerCase()===acc.toLowerCase()||x.l.toLowerCase()===acc.toLowerCase());
      if(f)acc=f.k;else{ACCS.push({k:acc,l:acc});metaChanged=true;}}
    else acc=ACCS[0].k;
    const rec={d:r.d,t:r.t||'',a:acc,dir:r.dir,amt:r.amt,n:r.n,c:r.c,i:r.i?1:0,note:r.note||'',u:r.u||''};
    if(rec.i)rec.c=INTERNAL;
    else{const cm=catMap(rec.dir);
      if(!rec.c)rec.c=suggest(rec.n,rec.dir,rec.amt);
      else if(!cm[rec.c]){CUSTOM[rec.dir][rec.c]=rec.dir==='out'?'Living':'Income';metaChanged=true;}}
    const k=keyOf(rec);if(seen.has(k)){skipped++;continue;}seen.add(k);add.push(rec);
  }
  await DB.bulkAdd(add);TX.push(...add);
  if(metaChanged){await DB.setMeta('cats',CUSTOM);await DB.setMeta('rules',RULES);await DB.setMeta('accounts',ACCS);await DB.setMeta('budgets',BUDGETS);}
  return {added:add.length,skipped};
}
async function handleFile(file){
  const msg=$('#import-msg');msg.textContent='Reading…';
  try{
    const text=await file.text();let res,bad=0;
    if(/\.json$/i.test(file.name)||text.trim().startsWith('{')||text.trim().startsWith('[')){
      const j=JSON.parse(text);const arr=Array.isArray(j)?j:j.tx;if(!Array.isArray(arr))throw new Error('This JSON has no entries in it.');
      res=await importRecords(arr.filter(r=>r&&r.d&&r.n&&r.amt>0&&(r.dir==='in'||r.dir==='out')),Array.isArray(j)?null:j);
    }else{
      const rows=parseCSV(text);if(rows.length<2)throw new Error('The CSV has no rows.');
      const r=csvToRecords(rows);bad=r.bad;res=await importRecords(r.recs,null);
    }
    msg.textContent=`Added ${res.added} entr${res.added===1?'y':'ies'}, skipped ${res.skipped} already here`+(bad?`, ${bad} row${bad>1?'s':''} couldn't be read`:'')+'.';
    if(res.added){const mx=maxDate();if(S.month!=='all')setMonth(mx.slice(0,7));}
    renderAll();renderSettings();
  }catch(e){msg.textContent='Import failed: '+e.message;}
}

/* file names carry the account name, so several accounts never overwrite each other's backups */

function flushAuto(){
  if(!APP()||!AUTO||!CUR||!TX.length)return;
  clearTimeout(autoT);
  try{window.AndroidBridge.saveFile(bname('auto'),'application/json',backupText(),true);}catch(e){}
}
