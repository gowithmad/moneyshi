/* MoneyShi · app/state.js — the data every page works from */
let TX=[],CUSTOM={out:{},in:{}},RULES={},ACCS=[],LASTX=null,BUDGETS={},CUR=null;
const S={month:'',q:'',cat:'',dir:'',limit:50};
let editing=null;

const catMap=dir=>Object.assign({},dir==='out'?B_OUT:B_IN,CUSTOM[dir]||{});
const gOf=t=>t.i?'Internal':(catMap(t.dir)[t.c]||(t.dir==='out'?'Living':'Income'));
const accLabel=k=>{const a=ACCS.find(x=>x.k===k);return a?a.l:k;};
const inP=t=>S.month==='all'||t.d.startsWith(S.month);
const months=()=>[...new Set(TX.map(t=>t.d.slice(0,7)))].sort();
const minDate=()=>TX.reduce((a,t)=>t.d<a?t.d:a,'9999-12-31');
const maxDate=()=>TX.reduce((a,t)=>t.d>a?t.d:a,'0000-01-01');
const fd=d=>{const y=d.slice(0,4);const s=parseInt(d.slice(8),10)+' '+MN[parseInt(d.slice(5,7),10)-1];return TX.length&&y!==maxDate().slice(0,4)?s+' '+y.slice(2):s;};
const mname=k=>MFULL[parseInt(k.slice(5),10)-1]+' '+k.slice(0,4);
function span(k){ // first and last day covered by the entries, within month k
  if(!TX.length)return [1,1];
  const mn=minDate(),mx=maxDate();
  if(k==='all')return [Math.round((utc(mx)-utc(mn))/864e5)+1,0];
  const y=+k.slice(0,4),m=+k.slice(5),last=dim(y,m);
  const first=k===mn.slice(0,7)?+mn.slice(8):1;
  const end=k===mx.slice(0,7)?+mx.slice(8):last;
  return [first,end];
}
function daysIn(k){const s=span(k);return k==='all'?s[0]:Math.max(1,s[1]-s[0]+1);}
function setMonth(m){S.month=m;try{sessionStorage.setItem('moneyshi.month',m);}catch(e){}}
function restoreMonth(){
  let m=null;try{m=sessionStorage.getItem('moneyshi.month');}catch(e){}
  if(m==='all'||(m&&months().includes(m)))return m;
  return TX.length?maxDate().slice(0,7):todayISO().slice(0,7);
}
