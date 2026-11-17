// SÓ LEITURA: fotografa páginas públicas (celular e computador) e imprime as imagens no log (IMG64).
const { chromium } = require('playwright');
const URLS = (process.env.URLS || 'https://guiadesantarita.com/').split(/\s+/).filter(Boolean), FULL = process.env.FULL === '1';
(async () => { const b = await chromium.launch();
  for (const [nm, W, H, mob] of [['mob', 390, 844, true], ['desk', 1366, 860, false]]) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, isMobile: mob, hasTouch: mob, locale: 'es-PY', timezoneId: 'America/Asuncion', deviceScaleFactor: 1 });
    for (const [i, u] of URLS.entries()) { const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
      try { await p.goto(u, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(6000); } catch (e) { console.log('ERR', u, e.message); }
      const buf = await p.screenshot({ type: 'jpeg', quality: 70, fullPage: FULL }); const s = buf.toString('base64');
      console.log('PAGE', nm, i, u, 'altura', await p.evaluate(() => document.body.scrollHeight).catch(() => 0), errs.length ? 'ERROS ' + errs.join(' | ').slice(0, 300) : '');
      for (let k = 0; k < s.length; k += 60000) console.log('IMG64 ' + nm + '-' + i + '.jpg ' + s.slice(k, k + 60000));
      await p.close(); }
    await ctx.close(); }
  await b.close(); })();
