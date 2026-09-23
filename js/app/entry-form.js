/* MoneyShi · app/entry-form.js — the add / edit entry popup */
let dlg=null;
const curDir=()=>document.querySelector('input[name=dir]:checked').value;
function fillCats(sel){
  const dir=curDir();const cm=catMap(dir);
  $('#f-c').innerHTML=Object.keys(cm).map(c=>`<option ${c===sel?'selected':''}>${esc(c)}</option>`).join('')+'<option value="__new">＋ New category…</option>';
  $('#f-new').hidden=true;
}
function openForm(t,p){
  editing=t||null;
  $('#dlg-title').textContent=t?'Edit entry':'Add entry';
  document.querySelector(`input[name=dir][value=${t?t.dir:'out'}]`).checked=true;
  let d=todayISO();if(!t&&S.month!=='all'&&!d.startsWith(S.month))d=S.month+'-01';
  $('#f-d').value=t?t.d:d;$('#f-t').value=t?t.t||'':'';$('#f-amt').value=t?t.amt:'';$('#f-n').value=t?t.n:'';$('#f-note').value=t?t.note||'':'';
  $('#f-a').innerHTML=ACCS.map(a=>`<option value="${esc(a.k)}" ${t&&t.a===a.k?'selected':''}>${esc(a.l)}</option>`).join('');
  $('#f-i').checked=!!(t&&t.i);
  fillCats(t&&!t.i?t.c:'');
  $('#f-c').disabled=$('#f-i').checked;
  $('#f-apply').checked=true;$('#f-apply-w').hidden=$('#f-i').checked;
  $('#f-err').textContent='';$('#f-del').hidden=!t;$('#f-copy').hidden=!t;
  if(!t){$('#f-c').value='Other';}
  if(!t&&p){
    if(p.dir&&p.dir!=='out'){document.querySelector('input[name=dir][value='+p.dir+']').checked=true;fillCats('');}
    if(p.n)$('#f-n').value=p.n;
    if(p.c&&Object.keys(catMap(curDir())).includes(p.c))$('#f-c').value=p.c;
    else if(p.n)autoCat();
  }
  openD(dlg);setTimeout(()=>$('#f-amt').focus(),30);
}
function autoCat(){
  if($('#f-i').checked)return;
  const n=$('#f-n').value.trim();if(!n)return;
  const amt=parseFloat($('#f-amt').value)||0;
  const c=suggest(n,curDir(),amt);
  if(Object.keys(catMap(curDir())).includes(c))$('#f-c').value=c;
}
async function saveForm(){
  const dir=curDir(),d=$('#f-d').value,amt=Math.round((parseFloat($('#f-amt').value)||0)*100)/100,n=$('#f-n').value.trim().replace(/\s+/g,' ');
  const i=$('#f-i').checked;let c=$('#f-c').value;const err=$('#f-err');
  if(!d){err.textContent='Choose a date.';return;}
  if(!(amt>0)){err.textContent='Enter an amount above zero.';return;}
  if(!n){err.textContent='Enter who it was with, for example a shop or person.';return;}
  if(!i&&c==='__new'){
    const nm=$('#f-newname').value.trim();if(!nm){err.textContent='Name the new category.';return;}
    const grp=$('#f-newgrp').value;CUSTOM[dir][nm]=grp;await DB.setMeta('cats',CUSTOM);c=nm;
  }
  const rec={d,t:$('#f-t').value||'',a:$('#f-a').value,dir,amt,n,c:i?INTERNAL:c,i:i?1:0,note:$('#f-note').value.trim(),u:editing?editing.u||'':''};
  if(editing){rec.id=editing.id;await DB.put(rec);const k=TX.findIndex(x=>x.id===rec.id);TX[k]=rec;}
  else{await DB.add(rec);TX.push(rec);}
  if(!i&&$('#f-apply').checked)await applyCat(dir,n,c);
  closeD(dlg);
  if(S.month!=='all'&&!d.startsWith(S.month))setMonth(d.slice(0,7));
  S.limit=Math.max(S.limit,50);renderAll();toast(editing?'Entry updated':'Entry added');
}
async function applyCat(dir,name,cat){
  RULES[dir+'|'+name]=cat;const ch=[];
  TX.forEach(t=>{if(t.dir===dir&&t.n===name&&!t.i&&t.c!==cat){t.c=cat;ch.push(t);}});
  await DB.putMany(ch);await DB.setMeta('rules',RULES);
}
async function deleteEntry(){
  if(!editing)return;const b=$('#f-del');
  if(b.dataset.arm!=='1'){b.dataset.arm='1';b.textContent='Tap again to delete';setTimeout(()=>{b.dataset.arm='';b.textContent='Delete';},3500);return;}
  await DB.del(editing.id);TX=TX.filter(x=>x.id!==editing.id);b.dataset.arm='';b.textContent='Delete';
  closeD(dlg);renderAll();toast('Entry deleted');
}
async function copyNext(){
  if(!editing)return;const y=+editing.d.slice(0,4),m=+editing.d.slice(5,7),dd=+editing.d.slice(8);
  const ny=m===12?y+1:y,nm=m===12?1:m+1;const day=Math.min(dd,dim(ny,nm));
  const rec=Object.assign({},editing,{d:`${ny}-${String(nm).padStart(2,'0')}-${String(day).padStart(2,'0')}`,u:''});delete rec.id;
  await DB.add(rec);TX.push(rec);closeD(dlg);setMonth(rec.d.slice(0,7));renderAll();toast('Copied to '+mname(S.month));
}

function initEntryForm(){
  dlg=$('#dlg-tx');
  $('#f-n').addEventListener('change',autoCat);$('#f-n').addEventListener('blur',autoCat);
  $('#txform').addEventListener('submit',e=>{e.preventDefault();saveForm();});
  $('#f-cancel').addEventListener('click',()=>closeD(dlg));
  $('#f-del').addEventListener('click',deleteEntry);
  $('#f-copy').addEventListener('click',copyNext);
  dlg.addEventListener('change',e=>{
    const t=e.target;
    if(t.id==='f-c'){$('#f-new').hidden=t.value!=='__new';if(t.value==='__new'){$('#f-newgrp').innerHTML=GROUPS[curDir()].map(x=>`<option value="${x}">${GLABEL[x]}</option>`).join('');$('#f-newname').focus();}}
    else if(t.id==='f-i'){$('#f-c').disabled=t.checked;$('#f-apply-w').hidden=t.checked;}
    else if(t.name==='dir'){fillCats('');autoCat();}
  });
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-edit],[data-newentry]');if(!b)return;
    if(b.dataset.edit!==undefined){const t=TX.find(x=>x.id===+b.dataset.edit);if(t)openForm(t);}else openForm(null);
  });
}
