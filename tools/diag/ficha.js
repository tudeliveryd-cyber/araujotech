// somente leitura: procura um nome na Guía publicada e tira foto da busca (imagem em base64 no log, entre marcas).
//   node tools/diag/ficha.js "jonathan"
const { chromium, devices } = require('playwright');
(async () => {
  const q = (process.argv[2] || '').toLowerCase();
  const j = await (await fetch('https://araujotechsistemas.com/sitio/guia.php?g=1&v=' + Date.now())).json();
  for (const k of Object.keys(j)) if (Array.isArray(j[k])) j[k].forEach(x => { if (x && JSON.stringify(x).toLowerCase().includes(q)) console.log('DADO', k, JSON.stringify(Object.assign({}, x, { lg: x.lg ? 'sim' : '', ph: x.ph ? 'sim' : '' }))); });
  const b = await chromium.launch(); const p = await (await b.newContext(devices['iPhone 13'])).newPage();
  await p.goto('https://guiadesantarita.com/?v=' + Date.now(), { waitUntil: 'networkidle' }); await p.waitForTimeout(2500);
  await p.fill('#q', process.argv[2] || ''); await p.waitForTimeout(2500);
  const buf = await p.screenshot({ type: 'jpeg', quality: 70 }); console.log('IMG1<<' + buf.toString('base64') + '>>');
  const lk = p.locator('main a, .res a, [data-id]').filter({ hasText: new RegExp(process.argv[2] || 'x', 'i') }).first();
  if (await lk.count()) { await lk.click().catch(() => {}); await p.waitForTimeout(3000); const b2 = await p.screenshot({ type: 'jpeg', quality: 70, fullPage: false }); console.log('URL', p.url()); console.log('IMG2<<' + b2.toString('base64') + '>>'); }
  await b.close();
})().catch(e => { console.log('ERRO', e.message); process.exit(1); });
