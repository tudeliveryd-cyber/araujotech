// SÓ LEITURA: telas reais das demonstrações para apresentações (impressas em base64 no registro).
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'es-PY' }); const p = await ctx.newPage();
  const shot = async (name) => { const buf = await p.screenshot({ type: 'jpeg', quality: 82 }); console.log('SHOT ' + name + ' ' + buf.toString('base64')); };
  await p.goto('https://araujotechsistemas.com/demo-autos/', { waitUntil: 'load', timeout: 90000 }); await p.waitForTimeout(6000);
  await p.evaluate(() => { const el = document.querySelector('.pcard'); if (el) el.scrollIntoView({ block: 'start' }); window.scrollBy(0, -120); }); await p.waitForTimeout(2500); await shot('autos-lista');
  await p.evaluate(() => productSheet('c2')); await p.waitForTimeout(4000); await shot('autos-suv-negro');
  await p.locator('.sheet .csw').nth(1).click(); await p.waitForTimeout(3500); await shot('autos-suv-blanco');
  await p.evaluate(() => { closeSheet(); productSheet('f1'); }); await p.waitForTimeout(3500);
  await p.evaluate(() => { const t = document.querySelector('.sheet [data-gal]'); if (t) t.scrollLeft = t.clientWidth; }); await p.waitForTimeout(2500); await shot('autos-furgon-fotos');
  await b.close(); })();
