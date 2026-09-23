/* MoneyShi · admin/users.js — see the accounts and choose who is an administrator */
async function loadUsers(){
  const rows=await Auth.listUsers();
  $('#u-body').innerHTML=rows.map(u=>'<tr><td><b>'+esc(u.display||u.username)+'</b><br><small>'+esc(u.email||u.username)+'</small></td><td>'+esc((u.created_at||'').slice(0,10))+'</td><td>'+esc(u.entries)+'</td><td><select data-uid="'+esc(u.id)+'"'+(u.id===CUR.id?' disabled title="You cannot change your own role"':'')+'><option value="user"'+(u.role==='user'?' selected':'')+'>Member</option><option value="admin"'+(u.role==='admin'?' selected':'')+'>Administrator</option></select></td></tr>').join('')||'<tr><td colspan="4">No accounts yet.</td></tr>';
  $('#u-count').textContent=rows.length+' account'+(rows.length===1?'':'s');
}
adminBoot('users.html',async()=>{
  $('#u-note').textContent=CLOUD()?'These are the accounts in your online database. Only administrators can see this list.':'These are the accounts on this device. Each person’s entries are stored separately and are not visible here.';
  try{await loadUsers();}catch(e){$('#u-body').innerHTML='<tr><td colspan="4">'+esc(e.message)+'</td></tr>';}
  $('#u-body').addEventListener('change',async e=>{
    const s=e.target.closest('select[data-uid]');if(!s)return;
    try{await Auth.setRole(s.dataset.uid,s.value);toast('Role updated');}catch(x){toast(x.message);await loadUsers();}
  });
});
