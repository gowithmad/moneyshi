/* MoneyShi · admin/files.js — browse, edit, create and delete the files of this site on GitHub */
const BINARY=/\.(png|jpe?g|gif|webp|ico|apk|jar|zip|pdf|woff2?|ttf|idsig)$/i;
let FILES=[],CURF=null;
const fmsg=(t,ok)=>{const e=$('#f-msg');e.className='err'+(ok?' info':'');e.textContent=t;};
function renderTree(){
  const q=($('#f-filter').value||'').toLowerCase();
  const list=FILES.filter(f=>f.path.toLowerCase().includes(q)).sort((a,b)=>a.path.localeCompare(b.path));
  let dir=null,h='';
  list.forEach(f=>{
    const d=f.path.includes('/')?f.path.slice(0,f.path.lastIndexOf('/')):'(top folder)';
    if(d!==dir){dir=d;h+='<div class="dir">'+esc(d)+'</div>';}
    h+='<button data-path="'+esc(f.path)+'"'+(CURF&&CURF.path===f.path?' class="on"':'')+'>'+esc(f.path.split('/').pop())+'</button>';
  });
  $('#tree').innerHTML=h||'<p class="note">No files match.</p>';
  $('#f-count').textContent=list.length+' of '+FILES.length+' files';
}
async function loadTree(){fmsg('Loading files…',true);try{FILES=await GH.tree();renderTree();fmsg('',true);$('#files-ui').hidden=false;}catch(e){fmsg(e.message);}}
async function openFile(path){
  fmsg('',true);
  CURF={path,sha:null,text:'',binary:BINARY.test(path)};renderTree();
  $('#ed-path').textContent=path;
  const r=GH.repo();
  $('#ed-open').hidden=!/\.html$/.test(path);$('#ed-open').href=SITE_ROOT+path;
  if(CURF.binary){$('#ed-box').hidden=true;$('#ed-bin').hidden=false;$('#ed-bin').innerHTML='This is a binary file, so it cannot be edited here. <a href="https://raw.githubusercontent.com/'+encodeURIComponent(r.o)+'/'+encodeURIComponent(r.r)+'/'+encodeURIComponent(r.b)+'/'+GH.enc(path)+'" target="_blank" rel="noopener">Open the raw file</a>. To replace it, upload the new file on github.com.';$('#ed-save').disabled=true;return;}
  $('#ed-bin').hidden=true;$('#ed-box').hidden=false;$('#ed-save').disabled=false;
  try{const f=await GH.file(path);CURF.sha=f.sha;CURF.text=f.text;$('#ed-text').value=f.text;$('#ed-panel').hidden=false;}catch(e){fmsg(e.message);}
}
adminBoot('files.html',async()=>{
  $('#gh-slot').innerHTML=ghPanelHTML();ghPanelInit(loadTree);
  if(GH.token()&&GH.repo().o&&GH.repo().r)loadTree();
  $('#f-filter').addEventListener('input',renderTree);
  $('#tree').addEventListener('click',e=>{const b=e.target.closest('[data-path]');if(b)openFile(b.dataset.path);});
  $('#ed-save').addEventListener('click',async()=>{
    if(!CURF||CURF.binary)return;const b=$('#ed-save');b.disabled=true;fmsg('Saving to GitHub…',true);
    try{const r=await GH.put(CURF.path,$('#ed-text').value,$('#ed-msg').value.trim()||('Update '+CURF.path+' from the admin page'),CURF.sha);CURF.sha=r.content.sha;CURF.text=$('#ed-text').value;fmsg('Saved to GitHub. The live site updates in a minute or two.',true);}
    catch(e){fmsg(e.message);}
    b.disabled=false;
  });
  confirmTwice($('#ed-del'),'Tap again to delete this file',async()=>{
    if(!CURF||!CURF.sha){fmsg('Open a file first.');return;}
    try{await GH.del(CURF.path,CURF.sha,'Delete '+CURF.path+' from the admin page');FILES=FILES.filter(f=>f.path!==CURF.path);CURF=null;$('#ed-panel').hidden=true;renderTree();fmsg('Deleted.',true);}catch(e){fmsg(e.message);}
  });
  $('#new-btn').addEventListener('click',async()=>{
    const p=$('#new-path').value.trim().replace(/^\/+/,'');
    if(!p||/\.\./.test(p))return fmsg('Type a file path such as pages/help.html');
    if(FILES.some(f=>f.path===p))return fmsg('That file already exists.');
    try{const r=await GH.put(p,'','Add '+p+' from the admin page');FILES.push({path:p,sha:r.content.sha,type:'blob'});$('#new-path').value='';renderTree();openFile(p);}catch(e){fmsg(e.message);}
  });
});
