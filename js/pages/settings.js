/* MoneyShi · pages/settings.js — Data, backup, categories and accounts */
function renderSettings(){
  $('#storage-note').textContent=(DB.mode==='idb'?(APP()?'Your entries live inside this app on this phone.':'Your entries live in this browser on this device.'):'Storage is blocked here, so nothing is saved between visits.')+' Export a backup now and then, especially before clearing browser data.';
  const rows=[];
  for(const dir of ['out','in'])for(const [k,g] of Object.entries(CUSTOM[dir]||{}))rows.push({dir,k,g});
  $('#custom-cats').innerHTML=rows.map(r=>{
    const used=TX.some(t=>t.dir===r.dir&&t.c===r.k);
    return `<div class="crow"><span>${esc(r.k)} <small>${r.dir==='out'?'money out':'money in'}</small></span><select data-cg="${esc(r.dir+'|'+r.k)}" aria-label="Group for ${esc(r.k)}">${GROUPS[r.dir].map(x=>`<option value="${x}" ${x===r.g?'selected':''}>${GLABEL[x]}</option>`).join('')}</select>${used?'<small>in use</small>':`<button class="linkb" data-cdel="${esc(r.dir+'|'+r.k)}">Remove</button>`}</div>`;
  }).join('')||'<p class="note" style="margin:0 0 8px">None yet.</p>';
  $('#nc-grp').innerHTML=GROUPS[$('#nc-dir').value].map(x=>`<option value="${x}">${GLABEL[x]}</option>`).join('');
  if(APP()){$('#android-sec').hidden=false;$('#auto-cb').checked=AUTO;$('#auto-note').textContent=autoNoteText();}
  $('#acc-list').innerHTML=ACCS.map(a=>`<div class="crow" style="grid-template-columns:1fr auto"><span>${esc(a.l)}</span><small>${TX.filter(t=>t.a===a.k).length} entries</small></div>`).join('');
}

function renderBackend(){
  const el=$('#backend-note');if(!el)return;
  el.textContent=CLOUD()?'Your entries are stored in your online MoneyShi database, so they follow you to any device you sign in on.':'Your entries are stored on this device only. To use them on other devices, ask the site owner to connect the online database (Admin → Site settings).';
}
function initSettings(){
  $('#x-json').addEventListener('click',exportJSON);
  $('#x-csv').addEventListener('click',exportCSV);
  $('#x-import').addEventListener('click',()=>$('#x-file').click());
  $('#x-share').addEventListener('click',shareBackup);
  $('#x-file').addEventListener('change',e=>{if(e.target.files[0]){handleFile(e.target.files[0]);e.target.value='';}});
  $('#nc-dir').addEventListener('change',renderSettings);
  $('#nc-add').addEventListener('click',async()=>{
    const nm=$('#nc-name').value.trim();const dir=$('#nc-dir').value;if(!nm)return;
    if(catMap(dir)[nm]){toast('That category already exists');return;}
    CUSTOM[dir][nm]=$('#nc-grp').value;await DB.setMeta('cats',CUSTOM);$('#nc-name').value='';renderAll();toast('Category added');
  });
  $('#na-add').addEventListener('click',async()=>{
    const nm=$('#na-name').value.trim();if(!nm)return;
    if(ACCS.find(a=>a.l.toLowerCase()===nm.toLowerCase())){toast('That account already exists');return;}
    let k=nm.replace(/[^A-Za-z0-9]/g,'').slice(0,12)||'Acct';while(ACCS.find(a=>a.k===k))k+='2';
    ACCS.push({k,l:nm});await DB.setMeta('accounts',ACCS);$('#na-name').value='';renderAll();toast('Account added');
  });
  $('#x-clear').addEventListener('click',async e=>{
    const b=e.currentTarget;
    if(b.dataset.arm!=='1'){b.dataset.arm='1';b.textContent='Tap again to delete everything';setTimeout(()=>{b.dataset.arm='';b.textContent='Delete all entries';},4000);return;}
    await DB.clear();TX=[];b.dataset.arm='';b.textContent='Delete all entries';renderAll();toast('All entries deleted');
  });
  $('#auto-cb').addEventListener('change',async e=>{AUTO=e.target.checked;await DB.setMeta('autoBackup',AUTO);if(AUTO)scheduleAuto(300);$('#auto-note').textContent=autoNoteText();});
  document.addEventListener('click',async e=>{
    const b=e.target.closest('[data-cdel]');if(!b)return;
    const [dir,k]=b.dataset.cdel.split('|');delete CUSTOM[dir][k];await DB.setMeta('cats',CUSTOM);renderAll();
  });
  document.addEventListener('change',async e=>{
    const t=e.target;if(!t.matches('select[data-cg]'))return;
    const [dir,...rest]=t.dataset.cg.split('|');CUSTOM[dir][rest.join('|')]=t.value;await DB.setMeta('cats',CUSTOM);renderAll();
  });
}
bootApp({page:'settings',month:false,add:false,init:initSettings,render:[renderBackend,renderSettings]});
