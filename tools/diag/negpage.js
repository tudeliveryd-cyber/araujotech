// somente leitura: dados de uma ficha publicada e o texto da página individual do negócio (guiadesantarita.com/negocio/...), com foto do celular.
//   node tools/diag/negpage.js "mara"
const { chromium, devices } = require('playwright');
(async () => { const q = (process.argv[2] || '').toLowerCase();
  const j = await (await fetch('https://araujotechsistemas.com/sitio/guia.php?g=1&v=' + Date.now())).json(); const hits = [];
  for (const x of (j.dir || [])) if (x && JSON.stringify(x).toLowerCase().includes(q)) { hits.push(x); console.log('DADO', JSON.stringify(Object.assign({}, x, { lg: x.lg ? 'sim' : '', ph: x.ph ? 'sim' : '' }))); }
  const b = await chromium.launch(); const p = await (await b.newContext(devices['iPhone 13'])).newPage();
  for (const x of hits.slice(0, 3)) { if (!x.sl) continue; const u = 'https://guiadesantarita.com/negocio/' + x.sl + '?v=' + Date.now(); await p.goto(u, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
    console.log('URL', u); console.log('TXT', JSON.stringify(await p.evaluate(() => document.body.innerText)));
    console.log('LINKS', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('a')].map(a => a.textContent.trim().slice(0, 30) + ' -> ' + a.href.slice(0, 90)))));
    console.log('IFRAME', await p.evaluate(() => document.querySelectorAll('iframe').length));
    console.log('IMG-' + x.sl + '<<' + (await p.screenshot({ fullPage: true })).toString('base64') + '>>'); }
  await b.close(); })().catch(e => { console.log('ERRO', e.message); process.exit(1); });
