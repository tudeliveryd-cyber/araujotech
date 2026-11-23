// somente leitura: quais arquivos respondem com erro (404 etc.) ao abrir cada endereço, no celular
const { chromium } = require('playwright');
(async () => {
  const urls = (process.argv[2] || 'https://lojastatus.araujotechsistemas.com/').split(/\s+/).filter(Boolean);
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  for (const u of urls) {
    const p = await ctx.newPage(); const bad = [], errs = []; let n = 0, kb = 0;
    p.on('response', async r => { n++; const s = r.status(); if (s >= 400) bad.push(s + ' ' + r.request().resourceType() + ' ' + r.url().slice(0, 160)); try { const h = r.headers()['content-length']; if (h) kb += (+h) / 1024; } catch (e) { } });
    p.on('requestfailed', r => { if (!/google-analytics|googletagmanager/.test(r.url())) bad.push('FALHOU ' + r.resourceType() + ' ' + r.url().slice(0, 160) + ' ' + ((r.failure() || {}).errorText || '')); });
    p.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
    const t0 = Date.now(); let st = 0;
    try { const r = await p.goto(u, { waitUntil: 'load', timeout: 60000 }); st = r ? r.status() : 0; await p.waitForTimeout(5000); } catch (e) { errs.push('NAV ' + String(e.message).slice(0, 100)); }
    const meta = await p.evaluate(() => ({ robots: (document.querySelector('meta[name=robots]') || {}).content || '', canon: (document.querySelector('link[rel=canonical]') || {}).href || '', title: document.title.slice(0, 70), man: (document.querySelector('link[rel=manifest]') || {}).href || '', imgs: [...document.images].filter(i => i.complete && !i.naturalWidth && i.getAttribute('src')).map(i => (i.getAttribute('src') || '').slice(0, 100)) })).catch(() => ({}));
    console.log('PAG ' + u + ' · HTTP ' + st + ' · ' + n + ' respostas · ' + Math.round((Date.now() - t0) / 100) / 10 + ' s · ' + JSON.stringify(meta));
    for (const x of bad) console.log('  RUIM ' + x);
    for (const x of errs) console.log('  ERRO ' + x);
    await p.close();
  }
  await b.close();
})().catch(e => { console.log('FALHA ' + (e && e.stack || e)); process.exit(1); });
