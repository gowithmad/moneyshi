/* MoneyShi · admin/site.js — edit config/app.config.js with a form and save it to GitHub */
const CONFIG_HEAD='/* MoneyShi settings. The admin page (admin/site.html) rewrites this file for you.\n   backend: "local"    = every person\'s data stays inside their own browser or phone.\n            "supabase" = data lives in your online database (see docs/SETUP.md), so it follows each user to any device. */\n';
const configJS=cfg=>CONFIG_HEAD+'window.MONEYSHI_CONFIG = '+JSON.stringify(cfg,null,2)+';\n';
function collect(){
  const accs=$('#s-accs').value.split('\n').map(l=>l.trim()).filter(Boolean).map(l=>{const p=l.split('|');const k=(p[0]||'').trim().replace(/[^A-Za-z0-9]/g,'').slice(0,12);return{k,l:(p[1]||p[0]).trim()};}).filter(a=>a.k);
  return{
    name:$('#s-name').value.trim()||'MoneyShi',tagline:$('#s-tag').value.trim(),
    backend:$('#s-backend').value,
    supabase:{url:$('#s-sburl').value.trim(),anonKey:$('#s-sbkey').value.trim()},
    github:{owner:$('#s-o').value.trim(),repo:$('#s-r').value.trim(),branch:$('#s-b').value.trim()||'main'},
    theme:{accent:$('#s-accent').value},
    features:{charts:$('#f-charts').checked,budgets:$('#f-budgets').checked,importExport:$('#f-io').checked},
    defaults:{accounts:accs.length?accs:[{k:'Cash',l:'Cash'}]}
  };
}
function fill(c){
  $('#s-name').value=c.name;$('#s-tag').value=c.tagline;$('#s-backend').value=c.backend;
  $('#s-sburl').value=c.supabase.url;$('#s-sbkey').value=c.supabase.anonKey;
  $('#s-o').value=c.github.owner;$('#s-r').value=c.github.repo;$('#s-b').value=c.github.branch;
  $('#s-accent').value=/^#[0-9a-fA-F]{6}$/.test(c.theme.accent)?c.theme.accent:'#1D7852';
  $('#f-charts').checked=c.features.charts!==false;$('#f-budgets').checked=c.features.budgets!==false;$('#f-io').checked=c.features.importExport!==false;
  $('#s-accs').value=(c.defaults.accounts||[]).map(a=>a.k+'|'+a.l).join('\n');
}
function preview(){$('#preview').textContent=configJS(collect());}
adminBoot('site.html',async()=>{
  fill(CFG);preview();
  $('#gh-slot').innerHTML=ghPanelHTML();ghPanelInit();
  document.querySelector('.wrap').addEventListener('input',e=>{if(!e.target.closest('#gh-panel'))preview();});
  const msg=(t,ok)=>{const e=$('#save-msg');e.className='err'+(ok?' info':'');e.textContent=t;};
  $('#save-gh').addEventListener('click',async()=>{
    const cfg=collect();
    if(cfg.backend==='supabase'&&(!cfg.supabase.url||!cfg.supabase.anonKey))return msg('Online mode needs the Supabase project URL and the anon (public) key.');
    if(/service_role/i.test(cfg.supabase.anonKey))return msg('That looks like a service_role key. Never put it in the site. Use the anon (public) key.');
    const b=$('#save-gh');b.disabled=true;msg('Saving to GitHub…',true);
    try{
      CFG.github=Object.assign({},CFG.github,{owner:$('#gh-o').value.trim()||cfg.github.owner,repo:$('#gh-r').value.trim()||cfg.github.repo,branch:$('#gh-b').value.trim()||cfg.github.branch});
      GH.setToken($('#gh-t').value.trim()||GH.token());
      let sha;try{sha=(await GH.file('config/app.config.js')).sha;}catch(e){}
      await GH.put('config/app.config.js',configJS(cfg),$('#s-msg').value.trim()||'Update site settings from the admin page',sha);
      msg('Saved. GitHub Pages usually publishes the change within a minute or two.',true);
    }catch(e){msg(e.message);}
    b.disabled=false;
  });
  $('#dl').addEventListener('click',()=>download('app.config.js','text/javascript',configJS(collect())));
  $('#cp').addEventListener('click',()=>{try{navigator.clipboard.writeText(configJS(collect()));toast('Copied');}catch(e){toast('Select the text and copy it');}});
});
