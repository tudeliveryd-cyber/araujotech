// somente leitura: fotografa a página /l/<nome> (link para o Instagram) num celular.  node tools/diag/bio.js dr-jonathan-salinas
const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext(Object.assign({}, devices['iPhone 13'], { timezoneId: 'America/Asuncion' }))).newPage();
  const r = await p.goto('https://guiadesantarita.com/l/' + (process.argv[2] || '') + '?v=' + Date.now(), { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  console.log('BIOST', r.status(), (await p.title()));
  const buf = await p.screenshot({ type: 'jpeg', quality: 75, fullPage: true }); console.log('IMG1<<' + buf.toString('base64') + '>>'); await b.close();
})().catch(e => { console.log('ERRO', e.message); process.exit(1); });
