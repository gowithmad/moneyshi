/* MoneyShi service worker: lets the site be installed like an app and keep working offline.
   It always tries the network first (so changes you publish show up straight away) and falls back to the saved copy.
   Change VERSION whenever you want every phone to throw away its old saved copy. */
const VERSION='moneyshi-v1';
const CORE=[
 "404.html",
 "account.html",
 "budgets.html",
 "charts.html",
 "config/app.config.js",
 "css/app.css",
 "css/auth.css",
 "css/theme.css",
 "dashboard.html",
 "entries.html",
 "forgot-password.html",
 "icons/icon-192.png",
 "icons/icon-512.png",
 "icons/icon-maskable-512.png",
 "index.html",
 "js/app/backup.js",
 "js/app/boot.js",
 "js/app/calc.js",
 "js/app/categories.js",
 "js/app/detail.js",
 "js/app/entry-form.js",
 "js/app/layout.js",
 "js/app/state.js",
 "js/app/templates.js",
 "js/auth/auth.js",
 "js/auth/cloud-auth.js",
 "js/auth/local-auth.js",
 "js/core/crypto.js",
 "js/core/pwa.js",
 "js/core/supabase.js",
 "js/core/util.js",
 "js/data/cloud-db.js",
 "js/data/db.js",
 "js/data/local-db.js",
 "js/pages/account.js",
 "js/pages/auth-common.js",
 "js/pages/budgets.js",
 "js/pages/charts.js",
 "js/pages/dashboard.js",
 "js/pages/entries.js",
 "js/pages/forgot-password.js",
 "js/pages/index.js",
 "js/pages/login.js",
 "js/pages/register.js",
 "js/pages/reset-password.js",
 "js/pages/settings.js",
 "login.html",
 "manifest.webmanifest",
 "offline.html",
 "register.html",
 "reset-password.html",
 "settings.html"
];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(VERSION).then(c=>Promise.allSettled(CORE.map(u=>c.add(new Request(u,{cache:'reload'}))))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==location.origin)return;            // never touch calls to the online database or GitHub
  e.respondWith(
    fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(VERSION).then(c=>c.put(req,copy));}return res;})
    .catch(()=>caches.match(req).then(r=>r||(req.mode==='navigate'?caches.match('offline.html'):Response.error())))
  );
});
