// somente leitura: confere no ar se a Guía mostra as notícias e tira uma foto do bloco.
const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const c = await b.newContext({ ...devices['Pixel 5'], locale: 'es-PY' }); const p = await c.newPage();
  const r = await (await fetch('https://guiadesantarita.com/sitio/guia.php?news=1')).json(); console.log('NEWS api auto=' + (r.auto || 0) + ' itens=' + (r.items || []).length);
  await p.goto('https://guiadesantarita.com/', { waitUntil: 'load' }); await p.waitForTimeout(6000);
  const n = await p.evaluate(() => { const s = document.getElementById('noticias'); if (!s) return null; s.scrollIntoView(); return { n: s.querySelectorAll('a.nw').length, t: [...s.querySelectorAll('a.nw')].slice(0, 3).map(a => a.innerText.replace(/\s+/g, ' ')) }; });
  console.log('NEWS na página: ' + JSON.stringify(n)); await p.waitForTimeout(800);
  if (n) { const buf = await p.locator('#noticias').screenshot({ type: 'jpeg', quality: 80 }); console.log('IMG64 nws.jpg ' + buf.toString('base64')); }
  await b.close(); })().catch(e => { console.log('FALHA ' + e.message); process.exit(1); });
