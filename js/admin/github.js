/* MoneyShi · admin/github.js — talks to the GitHub API so the admin page can edit the files of this site.
   The personal access token is kept only for this browser tab (sessionStorage) and is sent only to api.github.com. */
const b64e=s=>btoa(Array.from(new TextEncoder().encode(s),c=>String.fromCharCode(c)).join(''));
const b64d=s=>new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g,'')),c=>c.charCodeAt(0)));
const GH={
  token(){try{return sessionStorage.getItem('moneyshi.gh')||'';}catch(e){return '';}},
  setToken(t){try{if(t)sessionStorage.setItem('moneyshi.gh',t);else sessionStorage.removeItem('moneyshi.gh');}catch(e){}},
  repo(){
    const g=CFG.github||{};let o=g.owner,r=g.repo;const b=g.branch||'main';
    const m=location.hostname.match(/^(.+)\.github\.io$/);
    if(m&&!o)o=m[1];
    if(m&&!r){const seg=location.pathname.split('/')[1];if(seg&&seg!=='admin'&&!/\.html$/.test(seg))r=seg;}
    return{o:o||'',r:r||'',b};
  },
  api(){return(CFG.github&&CFG.github.api)||'https://api.github.com';},
  async req(path,opt){
    opt=opt||{};
    if(!this.token())throw new Error('Paste your GitHub token first.');
    let res;
    try{res=await fetch(this.api()+path,{method:opt.method||'GET',headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+this.token(),'Content-Type':'application/json'},body:opt.body?JSON.stringify(opt.body):undefined});}
    catch(e){throw new Error('Cannot reach GitHub. Check your internet connection.');}
    const text=await res.text();let data=null;try{data=text?JSON.parse(text):null;}catch(e){data=text;}
    if(!res.ok)throw new Error(res.status===401?'GitHub rejected the token (expired or wrong).':res.status===403?'GitHub refused: the token may lack write access to this repository.':res.status===404?'Not found on GitHub (check owner, repository, branch and file path).':res.status===409||res.status===422?'GitHub says the file changed since you opened it. Reload it and try again.':((data&&data.message)||('GitHub error '+res.status)));
    return data;
  },
  base(){const r=this.repo();if(!r.o||!r.r)throw new Error('Enter the GitHub owner and repository name.');return '/repos/'+encodeURIComponent(r.o)+'/'+encodeURIComponent(r.r);},
  enc(path){return path.split('/').map(encodeURIComponent).join('/');},
  info(){return this.req(this.base());},
  async tree(){const d=await this.req(this.base()+'/git/trees/'+encodeURIComponent(this.repo().b)+'?recursive=1');return(d.tree||[]).filter(x=>x.type==='blob');},
  async file(path){const d=await this.req(this.base()+'/contents/'+this.enc(path)+'?ref='+encodeURIComponent(this.repo().b));return{sha:d.sha,text:b64d(d.content||''),size:d.size};},
  put(path,text,message,sha){return this.req(this.base()+'/contents/'+this.enc(path),{method:'PUT',body:{message,content:b64e(text),branch:this.repo().b,sha:sha||undefined}});},
  del(path,sha,message){return this.req(this.base()+'/contents/'+this.enc(path),{method:'DELETE',body:{message,sha,branch:this.repo().b}});}
};
/* the small "GitHub connection" box shown on the admin pages that need it */
function ghPanelHTML(){
  return '<div class="card panel" id="gh-panel"><h3>GitHub connection</h3>'
   +'<div class="row2"><label>Owner<input id="gh-o" autocapitalize="none" spellcheck="false"></label><label>Repository<input id="gh-r" autocapitalize="none" spellcheck="false"></label></div>'
   +'<div class="row2"><label>Branch<input id="gh-b" autocapitalize="none" spellcheck="false"></label><label>Personal access token<input id="gh-t" type="password" autocomplete="off" placeholder="github_pat_…"></label></div>'
   +'<div class="btnrow"><button class="btn" id="gh-test" type="button">Save and test connection</button></div><p class="err" id="gh-msg" role="status"></p>'
   +'<p class="note" style="margin:0">Create a fine-grained token at GitHub → Settings → Developer settings, limited to this one repository with “Contents: Read and write”. It is kept only in this browser tab and is sent only to GitHub.</p></div>';
}
function ghPanelInit(onOk){
  const r=GH.repo();$('#gh-o').value=r.o;$('#gh-r').value=r.r;$('#gh-b').value=r.b;$('#gh-t').value=GH.token();
  const msg=(t,ok)=>{const e=$('#gh-msg');e.className='err'+(ok?' info':'');e.textContent=t;};
  $('#gh-test').addEventListener('click',async()=>{
    CFG.github=Object.assign({},CFG.github,{owner:$('#gh-o').value.trim(),repo:$('#gh-r').value.trim(),branch:$('#gh-b').value.trim()||'main'});
    GH.setToken($('#gh-t').value.trim());
    msg('Testing…',true);
    try{const d=await GH.info();msg('Connected to '+d.full_name+' (branch '+GH.repo().b+').',true);if(onOk)onOk(d);}catch(e){msg(e.message);}
  });
}
