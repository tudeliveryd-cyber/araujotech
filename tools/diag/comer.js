// somente leitura: fotografa a seção "¿Qué comer ahora?" da Guía (aba do horário atual) e lista os negócios.
//   node tools/diag/comer.js
const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext(Object.assign({}, devices['iPhone 13'], { timezoneId: 'America/Asuncion' }));
  const p = await ctx.newPage(); await p.goto('https://guiadesantarita.com/?v=' + Date.now(), { waitUntil: 'networkidle' }); await p.waitForTimeout(3000);
  const s = p.locator('#comer'); if (!(await s.count())) { console.log('SEM SECAO'); await b.close(); return; }
  await s.scrollIntoViewIfNeeded(); await p.waitForTimeout(1500);
  console.log('TXT', (await s.innerText()).replace(/\s+/g, ' ').slice(0, 1200));
  const buf = await s.screenshot({ type: 'jpeg', quality: 80 }); console.log('IMG1<<' + buf.toString('base64') + '>>');
  const buf2 = await p.screenshot({ type: 'jpeg', quality: 80 }); console.log('IMG2<<' + buf2.toString('base64') + '>>');
  await b.close();
})().catch(e => { console.log('ERRO', e.message); process.exit(1); });
