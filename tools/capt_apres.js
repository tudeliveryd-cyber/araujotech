// SÓ LEITURA: telas reais da Guía de Santa Rita para a apresentação aos empresários (saem no log em base64, linhas "IMG64 <nome> ...").
const { chromium } = require('playwright'); const fs = require('fs');
const U = 'https://guiadesantarita.com';
const out = (n, f) => { const b64 = fs.readFileSync(f).toString('base64'); for (let i = 0; i < b64.length; i += 4000) console.log('IMG64 ' + n + ' ' + b64.slice(i, i + 4000)); };
(async () => {
  fs.mkdirSync('apres', { recursive: true });
  const b = await chromium.launch();
  const m = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'es-PY', timezoneId: 'America/Asuncion', serviceWorkers: 'block' })).newPage();
  const d = await (await b.newContext({ viewport: { width: 1440, height: 860 }, deviceScaleFactor: 1.5, locale: 'es-PY', timezoneId: 'America/Asuncion', serviceWorkers: 'block' })).newPage();
  const shot = async (p, n) => { const f = 'apres/' + n + '.jpg'; await p.addStyleTag({ content: '.ins,.inst,#inst,[class*=install]{display:none!important}' }).catch(() => {}); await p.screenshot({ path: f, type: 'jpeg', quality: 88 }); out(n, f); console.log('OK ' + n); };
  const go = async (p, u, w) => { await p.goto(U + u, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {}); await p.waitForTimeout(w || 4000); };
  const to = async (p, sel, off) => { await p.evaluate(([s, o]) => { const e = document.querySelector(s); if (e) window.scrollTo(0, e.getBoundingClientRect().top + scrollY - (o || 10)); }, [sel, off]); await p.waitForTimeout(900); };
  try {
    await go(d, '/'); await shot(d, 'd-home');
    await to(d, '.tiles', 20); await shot(d, 'd-tiles');
    await go(d, '/fogao-mineiro'); await shot(d, 'd-negocio');
    await go(m, '/'); await shot(m, 'm-home');
    await go(m, '/fogao-mineiro'); await shot(m, 'm-negocio');
    await m.evaluate(() => window.scrollTo(0, 520)); await m.waitForTimeout(800); await shot(m, 'm-negocio2');
    await go(m, '/'); const t = m.locator('[data-c]').filter({ hasText: /Gastronom|Comida/ }).first(); if (await t.count()) { await t.click(); await m.waitForTimeout(1800); await shot(m, 'm-cat'); }
    await go(m, '/'); const mp = m.locator('button,a').filter({ hasText: /^\s*Mapa\s*$/ }).first(); if (await mp.count()) { await mp.click(); await m.waitForTimeout(3500); await shot(m, 'm-mapa'); }
    await go(m, '/'); const u = m.locator('[data-c]').filter({ hasText: /Santa Rita útil/ }).first(); if (await u.count()) { await u.click(); await m.waitForTimeout(1800); await shot(m, 'm-util'); }
    await go(m, '/conoce/', 3000); await shot(m, 'm-conoce');
    await m.goto('https://araujotechsistemas.com/cuenta/?publicar=job', { waitUntil: 'networkidle' }).catch(() => {}); await m.waitForTimeout(3000); await shot(m, 'm-publicar');
  } catch (e) { console.log('ERRO ' + e); }
  await b.close();
})();
