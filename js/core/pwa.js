/* MoneyShi · core/pwa.js — lets the site be installed like an app and keep working offline (needs https, which GitHub Pages provides). */
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){
  window.addEventListener('load',()=>{navigator.serviceWorker.register(SITE_ROOT+'sw.js').catch(()=>{});});
}
