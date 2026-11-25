// somente leitura: página inicial inteira no celular e no computador (para revisar o layout). node tools/diag/homefull.js
const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch();
  for (const [n, o] of [['m', Object.assign({}, devices['iPhone 13'])], ['d', { viewport: { width: 1366, height: 900 } }]]) {
    const ctx = await b.newContext(Object.assign(o, { timezoneId: 'America/Asuncion', locale: 'es-PY' })); const p = await ctx.newPage();
    await p.goto((process.argv[2] || 'https://guiadesantarita.com/') + '?v=' + Date.now(), { waitUntil: 'networkidle' }); await p.waitForTimeout(3500);
    for (let y = 0; y < 30000; y += 700) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(120); }
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(800);
    const secs = await p.evaluate(() => [...document.querySelectorAll('section[id], #atl > *, header, footer')].filter(e => e.offsetHeight > 0).map(e => (e.id || e.className || e.tagName) + ':' + Math.round(e.getBoundingClientRect().top + scrollY) + '+' + e.offsetHeight).join(' | '));
    console.log('SECS-' + n, secs);
    const buf = await p.screenshot({ fullPage: true, type: 'jpeg', quality: 55 });
    console.log('IMG-' + n + '<<' + buf.toString('base64') + '>>'); await ctx.close(); }
  await b.close();
})().catch(e => { console.log('ERRO', e.message); process.exit(1); });
