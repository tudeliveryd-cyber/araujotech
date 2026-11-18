/* "Ahora en la Guía" (solo lo ve el admin en el panel): mientras la Guía está abierta y visible, avisa cada 45 s con un código al azar de esta pestaña.
   No manda nombre, teléfono, ubicación ni datos del aparelho; el código se borra al cerrar la pestaña. */
(function(){try{if(navigator.webdriver||window.GSR_REV)return;var s='';try{s=sessionStorage.getItem('gsr_on')||''}catch(e){}
if(!/^[a-z0-9]{12}$/.test(s)){var a='abcdefghijklmnopqrstuvwxyz0123456789',r=crypto.getRandomValues(new Uint8Array(12));s='';for(var i=0;i<12;i++)s+=a[r[i]%36];try{sessionStorage.setItem('gsr_on',s)}catch(e){}}
var u=(location.hostname.endsWith('guiadesantarita.com')?'https://araujotechsistemas.com':'')+'/sitio/guia_on.php?s='+s;
function ping(){if(document.visibilityState!=='visible')return;try{if(navigator.sendBeacon)navigator.sendBeacon(u);else fetch(u,{method:'POST',keepalive:true})}catch(e){}}
ping();setInterval(ping,45000);document.addEventListener('visibilitychange',ping)}catch(e){}})();
