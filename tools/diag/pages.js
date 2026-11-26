// somente leitura: lista as páginas de negócio do sitemap e fotografa no celular as que contêm os termos pedidos,
// mais a lista de uma categoria. node tools/diag/pages.js "status,nautica"
const { chromium, devices } = require('playwright');
(async () => { const B = 'https://guiadesantarita.com'; const terms = (process.argv[2] || '').split(',').map(s => s.trim()).filter(Boolean);
  const b = await chromium.launch(); const ctx = await b.newContext(Object.assign({}, devices['iPhone 13'], { timezoneId: 'America/Asuncion', locale: 'es-PY' })); const p = await ctx.newPage();
  const sm = await (await ctx.request.get(B + '/sitemap.xml')).text(); const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  console.log('URLS', urls.filter(u => /\/(negocio|l)\//.test(u)).join(' '));
  const shot = async (n) => { const buf = await p.screenshot({ fullPage: true, type: 'jpeg', quality: 60 }); console.log('IMG-' + n + '<<' + buf.toString('base64') + '>>'); };
  for (const t of terms) { const u = urls.find(x => /\/negocio\//.test(x) && x.toLowerCase().includes(t)); if (!u) { console.log('SEM', t); continue; }
    await p.goto(u + '?v=' + Date.now(), { waitUntil: 'networkidle' }); await p.waitForTimeout(1500); console.log('PAGE-' + t, u); await shot(t); }
  await p.goto(B + '/?v=' + Date.now(), { waitUntil: 'networkidle' }); await p.waitForTimeout(3000);
  const tile = p.locator('#todas .tile').first(); if (await tile.count()) { await tile.click(); await p.waitForTimeout(2500); await p.evaluate(() => scrollTo(0, 0)); await shot('cat'); }
  await b.close(); })().catch(e => { console.log('ERRO', e.message); process.exit(1); });
