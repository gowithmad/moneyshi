/* MoneyShi · core/util.js — settings, helpers, dialogs, toast, downloads */

function deepMerge(a,b){for(const k in b){if(b[k]&&typeof b[k]==='object'&&!Array.isArray(b[k])){a[k]=deepMerge(a[k]&&typeof a[k]==='object'?a[k]:{},b[k]);}else a[k]=b[k];}return a;}
/* CFG = defaults + whatever config/app.config.js (or the admin page) sets */
const CFG=deepMerge({name:'MoneyShi',tagline:'Your money, simply managed',backend:'local',supabase:{url:'',anonKey:''},github:{owner:'',repo:'',branch:'main',api:''},theme:{accent:''},features:{charts:true,budgets:true,importExport:true},defaults:{accounts:[{k:'Cash',l:'Cash'},{k:'Bank',l:'Bank account'}]}},window.MONEYSHI_CONFIG||{});
const CLOUD=()=>CFG.backend==='supabase'&&!!(CFG.supabase&&CFG.supabase.url&&CFG.supabase.anonKey);
const SITE_ROOT=(()=>{const p=location.pathname.replace(/\/admin\/[^\/]*$/,'/').replace(/[^\/]*$/,'');return location.origin+p;})();
const BRAND_MARK="<svg class=\"tagmark\" viewBox=\"0 0 48 44\" aria-hidden=\"true\"><rect class=\"m-bg\" x=\"3\" y=\"3\" width=\"42\" height=\"34\" rx=\"8\"/><rect class=\"m-line\" x=\"8\" y=\"8\" width=\"32\" height=\"24\" rx=\"5\"/><circle class=\"m-dial\" cx=\"24\" cy=\"20\" r=\"8.5\"/><text class=\"m-rs\" x=\"24\" y=\"24.5\" text-anchor=\"middle\" font-size=\"12\">₹</text><rect class=\"m-bg\" x=\"10\" y=\"37\" width=\"7\" height=\"5\" rx=\"2\"/><rect class=\"m-bg\" x=\"31\" y=\"37\" width=\"7\" height=\"5\" rx=\"2\"/></svg>";
const pageFile=()=>location.pathname.split('/').pop()||'index.html';
const qsParam=k=>new URLSearchParams(location.search).get(k);
const MN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MFULL=['January','February','March','April','May','June','July','August','September','October','November','December'];
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inr=n=>'₹'+Math.round(n).toLocaleString('en-IN');
const inr2=n=>'₹'+n.toLocaleString('en-IN',{minimumFractionDigits:Number.isInteger(n)?0:2,maximumFractionDigits:2});
const cmp=n=>n>=100000?(n/100000).toFixed(1).replace(/\.0$/,'')+'L':n>=1000?Math.round(n/1000)+'k':String(Math.round(n));
const utc=s=>new Date(s+'T00:00:00Z');
const isoOf=d=>d.toISOString().slice(0,10);
const addDays=(d,n)=>new Date(d.getTime()+n*864e5);
const dim=(y,m)=>new Date(Date.UTC(y,m,0)).getUTCDate();
const todayISO=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
let toastT;function toast(m){let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';t.className='toast';t.setAttribute('role','status');document.body.appendChild(t);}t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>{t.hidden=true;},3800);}

const openD=d=>{if(d.showModal)d.showModal();else d.setAttribute('open','');};
const closeD=d=>{if(d.close)d.close();else d.removeAttribute('open');};
const APP=()=>typeof window.AndroidBridge!=='undefined';
function download(name,mime,text,overwrite){
  if(APP()){
    try{const u=window.AndroidBridge.saveFile(name,mime,text,!!overwrite);if(u)return u;}catch(e){}
    toast('Could not save the file. Check that storage is available.');return '';
  }
  const b=new Blob([text],{type:mime});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;
  document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},600);
  return 'ok';
}

function applyTheme(){
  document.title=(document.title.split('·')[0].trim()||'')+' · '+CFG.name;
  const a=CFG.theme&&CFG.theme.accent;if(a&&/^#[0-9a-fA-F]{6}$/.test(a))document.documentElement.style.setProperty('--brand',a);
}
