// Fotos da Guía de verdade (guiadesantarita.com) para o site da Araújo Tech: img/sistemas/guia-{pc,cel}.jpg
// Só lê a página pública. Roda no workflow "Capturar telas" (toda segunda e quando alguém roda à mão).
const { chromium } = require('playwright'); const path = require('path');
const OUT = path.join(__dirname, '..', 'araujo-tech-site', 'img', 'sistemas');
(async () => { const b = await chromium.launch(); const U = 'https://guiadesantarita.com/';
  const prep = async p => { await p.goto(U, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(5000);
    await p.evaluate(async () => { document.querySelectorAll('img[loading]').forEach(i => (i.loading = 'eager')); await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 8000); }))); window.scrollTo(0, 0); });
    await p.addStyleTag({ content: '#gsr-rev,.toast{display:none!important}' }); await p.waitForTimeout(1500); };
  let p = await (await b.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, locale: 'es-PY', timezoneId: 'America/Asuncion' })).newPage();
  await prep(p); await p.screenshot({ path: path.join(OUT, 'guia-pc.jpg'), type: 'jpeg', quality: 84 });
  p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 600 / 390, isMobile: true, hasTouch: true, locale: 'es-PY', timezoneId: 'America/Asuncion' })).newPage();
  await prep(p); await p.screenshot({ path: path.join(OUT, 'guia-cel.jpg'), type: 'jpeg', quality: 86 });
  await b.close(); console.log('guia ok'); })().catch(e => { console.error(e); process.exit(1); });
