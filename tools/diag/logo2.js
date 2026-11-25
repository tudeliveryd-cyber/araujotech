// somente leitura: confere o logo do link /l/<nome> (endereço e tamanho em pixels). node tools/diag/logo2.js dr-jonathan-salinas
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('https://guiadesantarita.com/l/' + process.argv[2] + '?v=' + Date.now(), { waitUntil: 'networkidle' });
  const r = await p.evaluate(() => { const i = document.querySelector('.lg img'); return i ? { src: i.getAttribute('src'), w: i.naturalWidth, h: i.naturalHeight } : null; });
  console.log('LOGO', JSON.stringify(r));
  for (const id of ['hit']) {}
  const g = await p.evaluate(async () => { try { const j = await (await fetch('/sitio/guia.php?g=1&v=' + Date.now())).json(); const x = (j.dir || []).find(y => /jonathan/i.test(y.n)); return x ? { lg: x.lg, own: x.own } : null; } catch (e) { return String(e); } });
  console.log('DIR', JSON.stringify(g));
  await b.close();
})().catch(e => { console.log('ERRO', e.message); process.exit(1); });
