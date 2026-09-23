/* MoneyShi · app/boot.js — what every private page does when it opens: check sign-in, open the database, load the data, draw the page. */
let PAGE_RENDER=[];
async function loadUserData(){
  TX=await DB.all();
  CUSTOM=await DB.getMeta('cats',{out:{},in:{}});CUSTOM.out=CUSTOM.out||{};CUSTOM.in=CUSTOM.in||{};
  RULES=await DB.getMeta('rules',{});ACCS=await DB.getMeta('accounts',DEFAULT_ACCS());
  LASTX=await DB.getMeta('lastExport',null);BUDGETS=await DB.getMeta('budgets',{});AUTO=await DB.getMeta('autoBackup',true);
}
function renderAll(){
  if(document.getElementById('month'))renderMonthSelect();
  renderSaveNote();
  PAGE_RENDER.forEach(f=>f());
  refreshDetail();
}
async function bootApp(o){
  o=o||{};
  try{
    const user=await requireUser();if(!user)return;
    await DB.open(CLOUD()?user:user.db);
    layoutInit(o);
    await loadUserData();
    setMonth(restoreMonth());
    PAGE_RENDER=o.render||[];
    if(o.init)await o.init();
    renderAll();
    if(APP()&&TX.length)scheduleAuto(1500);
    document.body.classList.add('ready');
  }catch(e){showFatal(e);}
}
