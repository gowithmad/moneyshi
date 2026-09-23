/* MoneyShi · admin/overview.js — status and set-up checklist */
adminBoot('index.html',async()=>{
  const cloud=CLOUD(),g=GH.repo(),haveGh=!!(g.o&&g.r);
  const items=[
    [true,'The site is running','You are signed in as an administrator.'],
    [haveGh,'GitHub repository known','Owner/repository: '+(haveGh?g.o+'/'+g.r:'not set yet. Enter it on Site settings or Pages & files.')],
    [!!GH.token(),'GitHub token for this tab','Needed only when you save changes from the admin pages.'],
    [cloud,'Online database connected',cloud?'The site stores every user’s data in your Supabase project.':'Right now each person’s data stays on their own device. To sync across devices, follow docs/SETUP.md and set the backend on Site settings.']
  ];
  $('#status').innerHTML=
    '<div class="grid3">'
    +'<div class="card"><small>Storage</small><h3 style="margin:4px 0 0">'+(cloud?'Online database':'This device only')+'</h3><span class="pill '+(cloud?'ok':'warn')+'">'+(cloud?'Supabase':'Local mode')+'</span></div>'
    +'<div class="card"><small>Repository</small><h3 style="margin:4px 0 0">'+esc(haveGh?g.o+'/'+g.r:'Not set')+'</h3><span class="pill">'+esc(g.b)+' branch</span></div>'
    +'<div class="card"><small>Signed in</small><h3 style="margin:4px 0 0">'+esc(CUR.display)+'</h3><span class="pill ok">administrator</span></div></div>';
  $('#checklist').innerHTML=items.map(i=>'<div class="check"><span>'+(i[0]?'✅':'⬜')+'</span><div><b>'+i[1]+'</b><br><small>'+esc(i[2])+'</small></div></div>').join('');
  $('#gh-slot').innerHTML=ghPanelHTML();ghPanelInit(()=>{$('#status').dataset.ok='1';});
  const t=$('#db-test');
  if(cloud)t.addEventListener('click',async()=>{
    const o=$('#db-out');o.textContent='Testing…';
    try{const rows=await SB.select('profiles','select=id&limit=1');o.textContent='Connected. The database answered ('+rows.length+' row visible to you).';}catch(e){o.textContent='Failed: '+e.message;}
  });else{t.disabled=true;$('#db-out').textContent='Online database is off (local mode).';}
});
